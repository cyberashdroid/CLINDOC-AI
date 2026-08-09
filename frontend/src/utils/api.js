import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('clindoc_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auth
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const getMe = () => api.get('/auth/me')

// Patients
export const getPatients = (params) => api.get('/patients', { params })
export const getPatient = (id) => api.get(`/patients/${id}`)
export const createPatient = (data) => api.post('/patients', data)
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data)
export const deletePatient = (id) => api.delete(`/patients/${id}`)
export const getPatientNotes = (id) => api.get(`/patients/${id}/notes`)

// Notes
export const getNotes = (params) => api.get('/notes', { params })
export const getNote = (id) => api.get(`/notes/${id}`)
export const createNote = (data) => api.post('/notes', data)
export const updateNote = (id, data) => api.put(`/notes/${id}`, data)
export const deleteNote = (id) => api.delete(`/notes/${id}`)
export const generateNoteAI = (data) => api.post('/notes/generate', data)
export const getNoteStats = () => api.get('/notes/stats/summary')

// Transcripts
export const getTranscripts = () => api.get('/transcripts')
export const saveTranscript = (data) => api.post('/transcripts', data)

export default api
