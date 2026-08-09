import { useState, useEffect } from 'react'
import { getNotes, getPatients, getTranscripts, getNoteStats } from '../utils/api'

export default function Database() {
  const [active, setActive] = useState('notes')
  const [notes, setNotes] = useState([])
  const [patients, setPatients] = useState([])
  const [transcripts, setTranscripts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getNotes({ limit: 100 }).catch(() => ({ data: [] })),
      getPatients({ limit: 100 }).catch(() => ({ data: [] })),
      getTranscripts().catch(() => ({ data: [] })),
      getNoteStats().catch(() => ({ data: {} })),
    ]).then(([n, p, t, s]) => {
      setNotes(n.data); setPatients(p.data); setTranscripts(t.data); setStats(s.data)
      setLoading(false)
    })
  }, [])

  const collections = [
    { key: 'notes', label: 'clinical_notes', icon: '📄', count: notes.length, desc: 'SOAP clinical notes' },
    { key: 'patients', label: 'patients', icon: '👤', count: patients.length, desc: 'Patient registry' },
    { key: 'transcripts', label: 'transcripts', icon: '🎙', count: transcripts.length, desc: 'Audio transcriptions' },
  ]

  const activeData = active === 'notes' ? notes : active === 'patients' ? patients : transcripts

  function renderJson(doc) {
    const skip = ['_id', 'subjective', 'objective', 'assessment', 'plan', 'raw_text']
    const entries = Object.entries(doc).filter(([k]) => !skip.includes(k))
    const preview = Object.entries(doc).filter(([k]) => skip.includes(k) && k !== '_id')
    return { entries, preview }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="generating-bar"><div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>Loading database...</div>
    </div>
  )

  return (
    <div>
      {/* Stats row */}
      <div className="three-col" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-val">{(notes.length + patients.length + transcripts.length)}</div>
          <div className="stat-label">Total Documents</div>
          <div className="progress" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${Math.min((notes.length + patients.length + transcripts.length) * 5, 100)}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{stats.approval_rate || 0}%</div>
          <div className="stat-label">Approval Rate</div>
          <div className="progress" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${stats.approval_rate || 0}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val">MongoDB</div>
          <div className="stat-label">Database Engine</div>
          <div style={{ marginTop: 8 }}><span className="badge badge-green">Connected</span></div>
        </div>
      </div>

      {/* Collections */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Collections</div>
        <div className="three-col">
          {collections.map(c => (
            <div key={c.key} className="coll-card" style={{ borderColor: active === c.key ? 'var(--teal)' : 'var(--border)' }} onClick={() => setActive(c.key)}>
              <div className="coll-name">{c.icon} {c.label}</div>
              <div className="coll-count">{c.count}</div>
              <div className="coll-sub">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Document viewer */}
      <div className="card">
        <div className="section-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="section-title" style={{ margin: 0 }}>db.{active === 'notes' ? 'clinical_notes' : active === 'patients' ? 'patients' : 'transcripts'}.find()</div>
            <span className="badge badge-teal">{activeData.length} docs</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>clindoc_db</div>
        </div>

        {activeData.length === 0 ? (
          <div className="json-viewer" style={{ color: 'var(--dim)' }}>
            // No documents in this collection yet.{'\n'}// Create a note or patient to see data here.
          </div>
        ) : (
          <div className="json-viewer">
            {activeData.map((doc, i) => {
              const { entries, preview } = renderJson(doc)
              return (
                <div key={i} className="json-doc">
                  <span style={{ color: 'var(--dim)' }}>{'// Document ' + (i + 1)}</span><br />
                  <span style={{ color: '#7dd3fc' }}>{'{'}</span><br />
                  {entries.map(([k, v]) => (
                    <span key={k}>
                      &nbsp;&nbsp;<span className="json-key">"{k}"</span>:{' '}
                      <span className="json-val">"{typeof v === 'object' ? JSON.stringify(v) : v}"</span>,<br />
                    </span>
                  ))}
                  {preview.map(([k, v]) => (
                    <span key={k}>
                      &nbsp;&nbsp;<span className="json-key">"{k}"</span>:{' '}
                      <span style={{ color: '#94a3b8' }}>"{String(v).substring(0, 80)}{String(v).length > 80 ? '...' : ''}"</span>,<br />
                    </span>
                  ))}
                  <span style={{ color: '#7dd3fc' }}>{'}'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Schema info */}
      <div className="two-col" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>clinical_notes Schema</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 2, color: 'var(--muted)' }}>
            {[['note_id','String (PK)'],['patient_id','String (FK)'],['patient_name','String'],['visit_type','Enum'],['subjective','Text'],['objective','Text'],['assessment','Text'],['plan','Text'],['diagnosis','String'],['medications','Text'],['follow_up','Text'],['approved','Boolean'],['created_at','DateTime']].map(([k,v])=>(
              <div key={k}><span className="json-key">"{k}"</span>: <span style={{ color: 'var(--dim)' }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>patients Schema</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 2, color: 'var(--muted)' }}>
            {[['patient_id','String (PK)'],['name','String'],['age','Integer'],['gender','Enum'],['contact','String'],['blood_group','String'],['allergies','Text'],['medical_history','Text'],['total_visits','Integer'],['created_at','DateTime']].map(([k,v])=>(
              <div key={k}><span className="json-key">"{k}"</span>: <span style={{ color: 'var(--dim)' }}>{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
