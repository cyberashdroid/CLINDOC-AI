import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Record from './pages/Record'
import Notes from './pages/Notes'
import Patients from './pages/Patients'
import Database from './pages/Database'
import Login from './pages/Login'

function RequireAuth({ children }) {
  const token = localStorage.getItem('clindoc_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="record" element={<Record />} />
            <Route path="notes" element={<Notes />} />
            <Route path="patients" element={<Patients />} />
            <Route path="database" element={<Database />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
