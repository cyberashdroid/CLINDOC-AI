#!/bin/bash
# ClinDoc AI — Start both backend and frontend

echo "🏥 Starting ClinDoc AI MVP..."
echo ""

# Check .env
if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env not found. Copying from example..."
  cp backend/.env.example backend/.env
  echo "✏️  Please edit backend/.env and add your ANTHROPIC_API_KEY, then re-run."
  exit 1
fi

# Start MongoDB (if local)
# mongod --fork --logpath /var/log/mongodb.log

# Start backend
echo "🔧 Starting FastAPI backend on port 8000..."
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "⚛️  Starting React frontend on port 5173..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ ClinDoc AI is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

wait $BACKEND_PID $FRONTEND_PID
