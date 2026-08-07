# ClinDoc AI — Clinical Documentation MVP

AI-powered assistant that converts doctor-patient conversations into structured SOAP clinical notes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Backend | FastAPI (Python) |
| AI Engine | Claude (Anthropic API) |
| Speech-to-Text | Browser Web Speech API (Whisper-ready) |
| Database | MongoDB (via Motor async driver) |
| Auth | JWT tokens |
| Cloud Ready | AWS / Azure compatible |

---

## Project Structure

```
clindoc-mvp/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── database.py          # MongoDB connection + indexes
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routers/
│   │   ├── auth.py          # Register / Login / JWT
│   │   ├── notes.py         # CRUD + AI generation
│   │   ├── patients.py      # Patient registry
│   │   └── transcripts.py   # Save transcripts
│   └── services/
│       └── ai_service.py    # Claude API integration
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx           # Router
    │   ├── index.css         # Full design system
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── Sidebar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Record.jsx    # Speech + AI generation
    │   │   ├── Notes.jsx     # SOAP note viewer
    │   │   ├── Patients.jsx
    │   │   ├── Database.jsx  # MongoDB viewer
    │   │   └── Login.jsx
    │   ├── hooks/
    │   │   ├── useSpeech.js  # Web Speech API hook
    │   │   └── useToast.jsx  # Notification system
    │   └── utils/
    │       └── api.js        # Axios API client
    ├── package.json
    └── vite.config.js
```

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key

---

### 1. Backend Setup

```bash
cd backend

# Copy and fill environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and MONGO_URL

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

### 3. Environment Variables (backend/.env)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=clindoc_db
ANTHROPIC_API_KEY=sk-ant-your-key-here
JWT_SECRET=your-super-secret-jwt-key
```

---

## Features

### Core
- **Speech-to-Text** — Live recording using Web Speech API (Chrome recommended). Falls back to demo simulation on unsupported browsers.
- **AI Note Generation** — Claude AI generates complete SOAP notes (Subjective, Objective, Assessment, Plan) + diagnosis + medications + follow-up.
- **Doctor Review Workflow** — All AI-generated notes require doctor approval before being finalized.

### Data Management
- **Patient Registry** — Full CRUD with search, blood group, allergies, medical history.
- **Clinical Notes** — Filter by status (pending/approved), search, edit, approve, delete.
- **Transcript Storage** — Every recording is saved to MongoDB for audit trail.
- **Database Viewer** — Visual MongoDB collection inspector.

### Auth
- JWT-based authentication
- Register/Login
- Quick demo login

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new doctor
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user

### Patients
- `GET /api/patients` — List all (with search)
- `POST /api/patients` — Create patient
- `GET /api/patients/{id}` — Get patient
- `PUT /api/patients/{id}` — Update patient
- `DELETE /api/patients/{id}` — Delete patient
- `GET /api/patients/{id}/notes` — Get patient's notes

### Notes
- `POST /api/notes` — Create note (triggers AI generation)
- `POST /api/notes/generate` — Generate SOAP note only (no save)
- `GET /api/notes` — List all notes (filterable)
- `GET /api/notes/{id}` — Get note
- `PUT /api/notes/{id}` — Update / approve note
- `DELETE /api/notes/{id}` — Delete note
- `GET /api/notes/stats/summary` — Dashboard stats

### Transcripts
- `POST /api/transcripts` — Save transcript
- `GET /api/transcripts` — List transcripts
- `GET /api/transcripts/{id}` — Get transcript

---

## Deployment (Production)

### Backend (AWS EC2 / Azure VM)
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Upload dist/ folder
```

### MongoDB
Use MongoDB Atlas free tier for cloud database.

---

## HIPAA Compliance Notes
- All data stored in MongoDB with encrypted connections
- JWT tokens expire in 7 days
- No PHI is logged to console in production
- CORS restricted to known origins
- HTTPS required in production

---

## Built for Hackathon
Submission: ClinDoc AI — Automate Your Clinical Documentation with Generative AI

MVP Timeline: 8–10 weeks (per business plan)  
This codebase implements Phase 1 (UI + pipeline) and Phase 2 (AI integration)
