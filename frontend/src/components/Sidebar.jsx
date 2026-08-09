import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/record', label: 'New Recording', icon: '🎙' },
  { to: '/notes', label: 'Clinical Notes', icon: '📋' },
  { to: '/patients', label: 'Patients', icon: '👤' },
  { to: '/database', label: 'Database', icon: '🗄' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('clindoc_user') || '{"name":"Dr. Rohan Mehta","specialization":"Internal Medicine"}')
  const initials = user.name?.split(' ').filter((_, i) => i < 2).map(w => w[0]).join('') || 'DR'

  function logout() {
    localStorage.removeItem('clindoc_token')
    localStorage.removeItem('clindoc_user')
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          <div className="logo-icon">🏥</div>
          <div>
            <div className="logo-title">ClinDoc AI</div>
            <div className="logo-sub">Documentation AI</div>
          </div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-section">Main</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <div className="nav-section" style={{ marginTop: 8 }}>System</div>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--red)' }}>
          <span className="nav-icon">⎋</span> Logout
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="doc-badge">
          <div className="doc-avatar">{initials}</div>
          <div>
            <div className="doc-name">{user.name}</div>
            <div className="doc-role">{user.specialization || 'Doctor'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
