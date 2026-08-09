import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../utils/api'
import { useToast } from '../hooks/useToast'

export default function Login() {
  const navigate = useNavigate()
  const toast = useToast()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', role: 'doctor' })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password })
        localStorage.setItem('clindoc_token', res.data.access_token)
        localStorage.setItem('clindoc_user', JSON.stringify(res.data.user))
        toast('Welcome back, ' + res.data.user.name, 'success')
        navigate('/')
      } else {
        const res = await register(form)
        toast('Account created! Please log in.', 'success')
        setMode('login')
      }
    } catch (err) {
      toast(err.response?.data?.detail || 'Authentication failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Demo login shortcut
  async function demoLogin() {
    setLoading(true)
    try {
      // Try to register demo user first (will fail silently if exists)
      await register({ name: 'Dr. Rohan Mehta', email: 'demo@clindoc.ai', password: 'demo1234', specialization: 'Internal Medicine', role: 'doctor' }).catch(() => {})
      const res = await login({ email: 'demo@clindoc.ai', password: 'demo1234' })
      localStorage.setItem('clindoc_token', res.data.access_token)
      localStorage.setItem('clindoc_user', JSON.stringify(res.data.user))
      navigate('/')
    } catch {
      toast('Demo login failed — make sure backend is running', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,201,167,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(56,189,248,0.04) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--teal), var(--teal3))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>🏥</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>ClinDoc AI</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>AI-Powered Clinical Documentation</div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setMode('login')}>Login</button>
            <button className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setMode('register')}>Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Smith" />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Internal Medicine" />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="doctor@hospital.com" />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button className="btn btn-secondary btn-full" onClick={demoLogin} disabled={loading}>
            🚀 Quick Demo Login
          </button>

          <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>Demo credentials:</strong><br />
            Email: demo@clindoc.ai<br />
            Password: demo1234
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--dim)' }}>
          HIPAA-Ready · Powered by Claude AI · Secured with JWT
        </div>
      </div>
    </div>
  )
}
