@echo off
echo ======================================================================
echo  PAPERTRAIL - THE CLARITY ENGINE
echo  "Understand the requirements. Know what to do. Never submit blindly."
echo ======================================================================
echo.

echo Starting backend on http://127.0.0.1:8000 ...
start "PAPERTRAIL Backend" cmd /k "set PYTHONPATH=backend && .\venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload"

timeout /t 2 /nobreak > nul

echo Starting frontend on http://localhost:5173 ...
start "PAPERTRAIL Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo  Both servers started!
echo  Open your browser to: http://localhost:5173
echo ======================================================================
