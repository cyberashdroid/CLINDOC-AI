import { useState, useEffect } from 'react'
import { getPatients, createPatient, deletePatient, getPatientNotes } from '../utils/api'
import { useToast } from '../hooks/useToast'

function PatientModal({ patient, onClose }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPatientNotes(patient.patient_id)
      .then(r => setNotes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{patient.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>ID: {patient.patient_id}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {[
            ['Age', `${patient.age} years`],
            ['Gender', patient.gender],
            ['Blood Group', patient.blood_group || 'N/A'],
            ['Contact', patient.contact || 'N/A'],
            ['Allergies', patient.allergies || 'None'],
            ['Total Visits', patient.total_visits || 0],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>

        {patient.medical_history && (
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Medical History</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{patient.medical_history}</div>
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Clinical Notes ({notes.length})</div>
        {loading ? <div style={{ color: 'var(--dim)', fontSize: 13 }}>Loading...</div>
          : notes.length === 0 ? <div style={{ color: 'var(--dim)', fontSize: 13 }}>No notes yet for this patient.</div>
          : notes.map(n => (
            <div key={n.note_id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{n.visit_type}</span>
                <span className={`badge badge-${n.approved ? 'green' : 'amber'}`}>{n.approved ? 'Approved' : 'Pending'}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{n.diagnosis || 'Diagnosis pending'} · {new Date(n.created_at).toLocaleDateString('en-IN')}</div>
            </div>
          ))
        }
        <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function AddPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', contact: '', blood_group: '', allergies: '', medical_history: '' })
  const toast = useToast()

  async function handleSubmit() {
    if (!form.name.trim() || !form.age) return toast('Name and age are required', 'error')
    try {
      const res = await createPatient({ ...form, age: parseInt(form.age) })
      onAdd(res.data)
      onClose()
      toast('Patient added successfully', 'success')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to add patient', 'error')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add New Patient</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="form-row" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient full name" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Age *</label>
            <input className="form-input" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Years" />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contact</label>
            <input className="form-input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Phone number" />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Blood Group</label>
            <select className="form-select" value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
              <option value="">Unknown</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Allergies</label>
            <input className="form-input" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="Known allergies" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Medical History</label>
          <textarea className="form-textarea" rows={3} value={form.medical_history} onChange={e => setForm({ ...form, medical_history: e.target.value })} placeholder="Previous conditions, surgeries..." />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Patient</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function Patients() {
  const toast = useToast()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    try {
      const res = await getPatients({ limit: 100 })
      setPatients(res.data)
    } catch { toast('Failed to load patients', 'error') }
    finally { setLoading(false) }
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this patient? All associated notes will remain.')) return
    try {
      await deletePatient(id)
      setPatients(patients.filter(p => p.patient_id !== id))
      toast('Patient deleted', 'success')
    } catch { toast('Failed to delete patient', 'error') }
  }

  const filtered = patients.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="generating-bar"><div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>Loading patients...</div>
    </div>
  )

  return (
    <div>
      <div className="section-row">
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{patients.length} patient{patients.length !== 1 ? 's' : ''} registered</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-wrap">
            <span className="search-icon" style={{ fontSize: 14 }}>🔍</span>
            <input className="search-input" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add Patient</button>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age / Gender</th>
              <th>Blood Group</th>
              <th>Allergies</th>
              <th>Visits</th>
              <th>Registered</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--dim)' }}>No patients found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.patient_id} onClick={() => setSelected(p)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="patient-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                      {p.name.split(' ').slice(0,2).map(w=>w[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--dim)' }}>{p.patient_id}</div>
                    </div>
                  </div>
                </td>
                <td>{p.age}y / {p.gender}</td>
                <td><span className="tag">{p.blood_group || 'Unknown'}</span></td>
                <td style={{ color: 'var(--muted)', maxWidth: 140 }}>{p.allergies || 'None'}</td>
                <td style={{ color: 'var(--teal)', fontWeight: 500 }}>{p.total_visits || 0}</td>
                <td style={{ color: 'var(--dim)' }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="btn btn-danger btn-sm" onClick={e => handleDelete(p.patient_id, e)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <PatientModal patient={selected} onClose={() => setSelected(null)} />}
      {addOpen && <AddPatientModal onClose={() => setAddOpen(false)} onAdd={p => setPatients([p, ...patients])} />}
    </div>
  )
}
