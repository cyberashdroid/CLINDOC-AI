import { useState, useEffect } from 'react'
import { getNotes, updateNote, deleteNote } from '../utils/api'
import { useToast } from '../hooks/useToast'
import { useNavigate } from 'react-router-dom'

function NoteModal({ note, onClose, onApprove, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    subjective: note.subjective || '',
    objective: note.objective || '',
    assessment: note.assessment || '',
    plan: note.plan || '',
    diagnosis: note.diagnosis || '',
    medications: note.medications || '',
    follow_up: note.follow_up || '',
  })

  async function handleSave() {
    await onUpdate(note.note_id, form)
    setEditing(false)
  }

  const soapFields = [
    { key: 'subjective', label: 'S — Subjective' },
    { key: 'objective', label: 'O — Objective' },
    { key: 'assessment', label: 'A — Assessment' },
    { key: 'plan', label: 'P — Plan' },
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{note.patient_name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {note.visit_type} · {note.patient_age}y, {note.patient_gender} · {new Date(note.created_at).toLocaleString('en-IN')}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span className="badge badge-teal">{note.visit_type}</span>
          <span className={`badge badge-${note.approved ? 'green' : 'amber'}`}>{note.approved ? '✓ Approved' : 'Pending Review'}</span>
          {note.diagnosis && <span className="badge badge-blue">Dx: {note.diagnosis}</span>}
        </div>

        <div className="soap-grid">
          {soapFields.map(f => (
            <div key={f.key} className="soap-section">
              <div className="soap-label">{f.label}</div>
              {editing ? (
                <textarea className="soap-textarea" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={4} />
              ) : (
                <div className="soap-content">{note[f.key] || '—'}</div>
              )}
            </div>
          ))}
        </div>

        {(note.medications || editing) && (
          <div className="soap-section" style={{ marginBottom: 10 }}>
            <div className="soap-label">💊 Medications</div>
            {editing
              ? <textarea className="soap-textarea" value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })} rows={2} />
              : <div className="soap-content">{note.medications || '—'}</div>
            }
          </div>
        )}

        {(note.follow_up || editing) && (
          <div className="soap-section" style={{ marginBottom: 14 }}>
            <div className="soap-label">📅 Follow-Up</div>
            {editing
              ? <textarea className="soap-textarea" value={form.follow_up} onChange={e => setForm({ ...form, follow_up: e.target.value })} rows={2} />
              : <div className="soap-content">{note.follow_up || '—'}</div>
            }
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {!note.approved && <button className="btn btn-primary" onClick={() => onApprove(note.note_id)}>✓ Approve Note</button>}
          {editing
            ? <><button className="btn btn-primary" onClick={handleSave}>Save Changes</button><button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button></>
            : <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>
          }
          <button className="btn btn-ghost" onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Notes() {
  const toast = useToast()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    try {
      const res = await getNotes({ limit: 100 })
      setNotes(res.data)
    } catch { toast('Failed to load notes', 'error') }
    finally { setLoading(false) }
  }

  async function handleApprove(id) {
    try {
      await updateNote(id, { approved: true })
      setNotes(notes.map(n => n.note_id === id ? { ...n, approved: true, status: 'approved' } : n))
      setSelected(null)
      toast('Note approved and saved!', 'success')
    } catch { toast('Failed to approve note', 'error') }
  }

  async function handleUpdate(id, data) {
    try {
      const res = await updateNote(id, data)
      setNotes(notes.map(n => n.note_id === id ? res.data : n))
      toast('Note updated', 'success')
    } catch { toast('Failed to update note', 'error') }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return
    try {
      await deleteNote(id)
      setNotes(notes.filter(n => n.note_id !== id))
      setSelected(null)
      toast('Note deleted', 'success')
    } catch { toast('Failed to delete', 'error') }
  }

  const filtered = notes.filter(n => {
    const matchFilter = filter === 'all' || (filter === 'pending' && !n.approved) || (filter === 'approved' && n.approved)
    const matchSearch = !search || n.patient_name.toLowerCase().includes(search.toLowerCase()) || (n.diagnosis || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="generating-bar"><div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>Loading notes...</div>
    </div>
  )

  return (
    <div>
      <div className="section-row">
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'approved'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${notes.length})` : `(${notes.filter(n => f === 'approved' ? n.approved : !n.approved).length})`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-wrap">
            <span className="search-icon" style={{ fontSize: 14 }}>🔍</span>
            <input className="search-input" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/record')}>+ New Note</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty" style={{ padding: '60px 20px' }}>
          <div className="empty-icon">📋</div>
          <div className="empty-text">No clinical notes found</div>
          <div className="empty-sub" style={{ marginBottom: 20 }}>Start a new recording to generate your first note</div>
          <button className="btn btn-primary" onClick={() => navigate('/record')}>🎙 New Recording</button>
        </div>
      ) : filtered.map(n => (
        <div key={n.note_id} className="note-card" onClick={() => setSelected(n)}>
          <div className="note-card-header">
            <div className="note-card-patient">{n.patient_name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge badge-${n.approved ? 'green' : 'amber'}`}>{n.approved ? '✓ Approved' : 'Pending Review'}</span>
              <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(n.note_id) }}>🗑</button>
            </div>
          </div>
          <div className="note-card-meta">
            <span>🏥 {n.visit_type}</span>
            <span>👤 {n.patient_age}y, {n.patient_gender}</span>
            {n.diagnosis && <span>💊 {n.diagnosis}</span>}
            <span>🕐 {new Date(n.created_at).toLocaleString('en-IN')}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--dim)' }}>#{n.note_id}</span>
          </div>
          {n.subjective && (
            <div className="note-card-preview">
              <strong style={{ color: 'var(--teal)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.7px' }}>S:</strong> {n.subjective.substring(0, 180)}...
            </div>
          )}
        </div>
      ))}

      {selected && (
        <NoteModal
          note={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
