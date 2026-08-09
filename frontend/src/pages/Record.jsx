import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeech'
import { useToast } from '../hooks/useToast'
import { createNote, saveTranscript } from '../utils/api'

const SIMULATION_LINES = [
  'Patient presents today with complaints of persistent headache for the past 3 days. ',
  'Pain is described as throbbing, rated 7 out of 10 on the pain scale. ',
  'Located primarily in the frontal and temporal regions bilaterally. ',
  'Associated with mild nausea, no vomiting. Photophobia present. ',
  'No fever, no neck stiffness. Last similar episode was 6 months ago. ',
  'Blood pressure 128 over 82. Heart rate 76 beats per minute. Temperature 98.4 Fahrenheit. ',
  'Neurological examination is within normal limits. No papilledema on fundoscopy. ',
  'Assessment: Tension-type headache, migraine without aura to be ruled out. ',
  'Plan: Tab Sumatriptan 50mg as needed for acute episodes. Tab Amitriptyline 10mg at bedtime as prophylaxis. ',
  'Advised rest, adequate hydration, screen time reduction. Follow up in 2 weeks or earlier if worsening. '
]

export default function Record() {
  const navigate = useNavigate()
  const toast = useToast()
  const { transcript, isRecording, isSupported, seconds, start, stop, clear, setManual, formatTime } = useSpeechRecognition()
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', complaint: '', type: 'OPD Visit', patientId: '' })
  const [generating, setGenerating] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualText, setManualText] = useState('')
  const simRef = useRef(null)
  const waveRef = useRef(null)

  // Animate waveform while recording
  useEffect(() => {
    if (isRecording) {
      waveRef.current = setInterval(() => {
        document.querySelectorAll('.wave-bar').forEach(b => {
          b.style.height = (Math.random() * 28 + 6) + 'px'
          b.style.opacity = (Math.random() * 0.5 + 0.5)
        })
      }, 120)
    } else {
      clearInterval(waveRef.current)
      document.querySelectorAll('.wave-bar').forEach((b, i) => {
        b.style.height = [8,16,10,22,12,18,8,16,10,22,12,16][i] + 'px'
        b.style.opacity = '0.4'
      })
    }
    return () => clearInterval(waveRef.current)
  }, [isRecording])

  function handleToggleRecording() {
    if (isRecording) {
      stop()
      clearInterval(simRef.current)
    } else {
      start()
      if (!isSupported) {
        // Simulate line by line
        let i = 0
        let accumulated = ''
        simRef.current = setInterval(() => {
          if (i < SIMULATION_LINES.length) {
            accumulated += SIMULATION_LINES[i++]
            setManual(accumulated)
          } else {
            clearInterval(simRef.current)
            stop()
          }
        }, 1400)
      }
    }
  }

  async function handleGenerate() {
    if (!form.name.trim()) return toast('Please enter patient name', 'error')
    if (!transcript.trim()) return toast('Please record or enter a transcription', 'error')

    setGenerating(true)
    try {
      // Save transcript first
      const ptId = form.patientId || `P${Date.now().toString(36).toUpperCase()}`
      await saveTranscript({ patient_id: ptId, patient_name: form.name, raw_text: transcript, duration_seconds: seconds })

      // Create note (backend calls AI)
      const res = await createNote({
        patient_id: ptId,
        patient_name: form.name,
        patient_age: parseInt(form.age) || 30,
        patient_gender: form.gender,
        chief_complaint: form.complaint,
        visit_type: form.type,
        transcript,
        doctor_name: JSON.parse(localStorage.getItem('clindoc_user') || '{}').name || 'Dr. Rohan Mehta'
      })

      toast('Clinical note generated successfully!', 'success')
      navigate(`/notes`)
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to generate note. Check API connection.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  function applyManual() {
    setManual(manualText)
    setManualOpen(false)
    setManualText('')
  }

  const waveBars = [8,16,10,22,12,18,8,16,10,22,12,16]

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Patient Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Patient Information</div>
          <span className="badge badge-teal">New Consultation</span>
        </div>

        <div className="form-row" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Patient Name *</label>
            <input className="form-input" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Patient ID</label>
            <input className="form-input" placeholder="Auto-generated if empty" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} />
          </div>
        </div>

        <div className="form-row-3" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Age</label>
            <input className="form-input" type="number" placeholder="Years" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Visit Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>OPD Visit</option><option>Follow-up</option><option>Emergency</option><option>Telemedicine</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Chief Complaint</label>
          <input className="form-input" placeholder="Primary reason for visit" value={form.complaint} onChange={e => setForm({ ...form, complaint: e.target.value })} />
        </div>
      </div>

      {/* Recording */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>🎙 Speech-to-Text Recording</div>
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse-dot 1s infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--mono)' }}>{formatTime(seconds)}</span>
            </div>
          )}
        </div>

        {!isSupported && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--amber)' }}>
            ⚠️ Speech recognition not supported in this browser — using demo simulation mode. Use Chrome for live mic input.
          </div>
        )}

        <div className="mic-container">
          <div className="waveform">
            {waveBars.map((h, i) => (
              <div key={i} className="wave-bar" style={{ height: h + 'px', opacity: 0.4 }} />
            ))}
          </div>

          <button className={`mic-btn${isRecording ? ' recording' : ''}`} onClick={handleToggleRecording}>
            {isRecording ? '⏹' : '🎙'}
          </button>

          <div style={{ fontSize: 13, color: isRecording ? 'var(--red)' : 'var(--muted)', textAlign: 'center' }}>
            {isRecording ? 'Recording in progress... Click to stop' : 'Click microphone to begin recording consultation'}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 10 }}>
          <label className="form-label">Transcription</label>
          <div style={{
            background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8,
            padding: '12px 14px', minHeight: 120, fontSize: 13, color: transcript ? 'var(--text)' : 'var(--dim)',
            lineHeight: 1.7, whiteSpace: 'pre-wrap'
          }}>
            {transcript || 'Transcription will appear here as you speak...'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={clear}>✕ Clear</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setManualOpen(true)}>✏️ Type Manually</button>
          {transcript && <span style={{ fontSize: 12, color: 'var(--dim)', alignSelf: 'center', marginLeft: 'auto' }}>{transcript.split(' ').filter(Boolean).length} words</span>}
        </div>
      </div>

      {/* AI Generate */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>✨ AI Note Generation</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Generates a complete SOAP note (Subjective, Objective, Assessment, Plan) plus diagnosis, medications, and follow-up instructions using Claude AI.
        </div>

        {generating ? (
          <div className="generating-bar">
            <div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
            Analyzing transcription and generating structured clinical note...
          </div>
        ) : (
          <button className="btn btn-primary btn-full btn-lg" onClick={handleGenerate}>
            ✨ Generate Clinical Note with AI
          </button>
        )}
      </div>

      {/* Manual Input Modal */}
      {manualOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setManualOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Manual Transcription Input</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setManualOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Type or paste the consultation notes here. The AI will structure them into a SOAP note.</p>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="e.g. Patient is a 45-year-old male presenting with chest pain since 2 days..."
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-primary" onClick={applyManual} disabled={!manualText.trim()}>Use This Text</button>
              <button className="btn btn-secondary" onClick={() => setManualOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
