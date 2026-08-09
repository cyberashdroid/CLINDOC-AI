@echo off
echo 🏥 Starting ClinDoc AI MVP...
echo.

if not exist "backend\.env" (
  echo ⚠️  backend\.env not found. Copying from example...
  copy backend\.env.example backend\.env
  echo ✏️  Please edit backend\.env and add your ANTHROPIC_API_KEY, then re-run.
  pause
  exit /b
)

echo 🔧 Starting FastAPI backend on port 8000...
cd backend
if not exist "venv" python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt -q
start /B uvicorn main:app --reload --port 8000
cd ..

timeout /t 2 /nobreak >nul

echo ⚛️  Starting React frontend on port 5173...
cd frontend
npm install --silent
start /B npm run dev
cd ..

echo.
echo ✅ ClinDoc AI is running!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
pause
