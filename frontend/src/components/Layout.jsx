import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const pageTitles = {
  '/': 'Dashboard',
  '/record': 'New Recording',
  '/notes': 'Clinical Notes',
  '/patients': 'Patient Registry',
  '/database': 'Database',
}

export default function Layout() {
  const location = useLocation()
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">{pageTitles[location.pathname] || 'ClinDoc AI'}</div>
          </div>
          <div className="topbar-right">
            <div className="status-pill">
              <div className="status-dot" />
              <span className="status-text">AI Engine Online</span>
            </div>
            <div className="topbar-clock">{clock}</div>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
