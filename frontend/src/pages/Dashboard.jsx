import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNoteStats, getNotes, getPatients } from '../utils/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total_notes: 0, approved_notes: 0, pending_notes: 0, total_patients: 0, approval_rate: 0 })
  const [recentNotes, setRecentNotes] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getNoteStats().catch(() => ({ data: stats })),
      getNotes({ limit: 5 }).catch(() => ({ data: [] })),
      getPatients({ limit: 6 }).catch(() => ({ data: [] })),
    ]).then(([s, n, p]) => {
      setStats(s.data)
      setRecentNotes(n.data)
      setPatients(p.data)
      setLoading(false)
    })
  }, [])

  const statCards = [
    { val: stats.total_notes, label: 'Notes Generated', sub: 'All time', color: 'var(--teal)' },
    { val: stats.total_patients, label: 'Total Patients', sub: 'Registered', color: 'var(--cyan)' },
    { val: stats.approved_notes, label: 'Approved Notes', sub: 'Doctor reviewed', color: 'var(--green)' },
    { val: `${stats.approval_rate}%`, label: 'Approval Rate', sub: 'Quality score', color: 'var(--amber)' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="generating-bar" style={{ fontSize: 14 }}>
        <div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
        Loading dashboard...
      </div>
    </div>
  )

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div className="card" style={{ marginBottom: 18, background: 'linear-gradient(135deg, rgba(0,201,167,0.08), rgba(0,0,0,0))', borderColor: 'rgba(0,201,167,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Start a New Consultation</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Record doctor-patient conversation and generate structured SOAP notes instantly.</div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/record')}>
            🎙 New Recording
          </button>
        </div>
      </div>

      <div className="two-col">
        {/* Patients */}
        <div className="card">
          <div className="section-row">
            <div className="section-title">Recent Patients</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')}>View All →</button>
          </div>
          {patients.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👤</div>
              <div className="empty-text">No patients yet</div>
              <div className="empty-sub">Patients are added when you create notes</div>
            </div>
          ) : patients.map(p => (
            <div key={p.patient_id} className="patient-item" onClick={() => navigate('/patients')}>
              <div className="patient-avatar">{p.name.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
              <div className="patient-info">
                <div className="patient-name">{p.name}</div>
                <div className="patient-detail">{p.age}y · {p.gender} · {p.total_visits || 0} visit{p.total_visits !== 1 ? 's' : ''}</div>
              </div>
              <span className="badge badge-teal">{p.blood_group || 'N/A'}</span>
            </div>
          ))}
        </div>

        {/* Recent Notes */}
        <div className="card">
          <div className="section-row">
            <div className="section-title">Recent Notes</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notes')}>View All →</button>
          </div>
          {recentNotes.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">No notes yet</div>
              <div className="empty-sub">Create your first recording to generate a note</div>
            </div>
          ) : recentNotes.map(n => (
            <div key={n.note_id} className="patient-item" onClick={() => navigate('/notes')}>
              <div className="patient-avatar" style={{ background: 'var(--bg5)', color: 'var(--teal)' }}>📄</div>
              <div className="patient-info">
                <div className="patient-name">{n.patient_name}</div>
                <div className="patient-detail">{n.visit_type} · {n.diagnosis || 'Pending'}</div>
              </div>
              <span className={`badge badge-${n.approved ? 'green' : 'amber'}`}>
                {n.approved ? 'Approved' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Activity Timeline</div>
        {recentNotes.length === 0 && patients.length === 0 ? (
          <div className="empty"><div className="empty-text">No activity yet. Start by recording a consultation.</div></div>
        ) : (
          <div className="timeline">
            {recentNotes.slice(0,4).map(n => (
              <div key={n.note_id} className="tl-item">
                <div className="tl-dot">📄</div>
                <div className="tl-body">
                  <div className="tl-title">Note generated for {n.patient_name}</div>
                  <div className="tl-time">{n.visit_type} · {new Date(n.created_at).toLocaleString('en-IN')}</div>
                </div>
                <span className={`badge badge-${n.approved ? 'green' : 'amber'}`}>{n.approved ? 'Approved' : 'Pending'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
