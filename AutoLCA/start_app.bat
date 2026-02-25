@echo off
echo Starting Triya.io (Next.js + FastAPI)
set WEASYPRINT_DLL_DIRECTORIES=%cd%\backend\libs\gtk_runtime
start /b venv\Scripts\python backend\main.py
cd frontend
start /b npm run dev
echo App is loading at http://localhost:3000
pause
