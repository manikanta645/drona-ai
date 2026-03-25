@echo off
REM 🚀 DRONA-AI COMPLETE STARTUP - Batch File Version
REM Starts Ollama + Backend + Frontend

echo.
echo 🚀 Starting DRONA-AI Stack...
echo =====================================
echo.

REM Check if Ollama is installed
if not exist "C:\Users\%USERNAME%\AppData\Local\Programs\Ollama\ollama.exe" (
    echo ❌ Ollama not found!
    echo Please install from: https://ollama.ai
    pause
    exit /b 1
)

REM Start Ollama in background
echo 1️⃣  Starting Ollama service...
start "Ollama" cmd /k ollama serve
timeout /t 3 /nobreak

REM Start Backend
echo.
echo 2️⃣  Starting Backend (FastAPI)...
cd /d c:\Projects\drona-ai\backend
start "Backend - DRONA API" cmd /k python main.py
timeout /t 2 /nobreak

REM Start Frontend
echo.
echo 3️⃣  Starting Frontend (React)...
cd /d c:\Projects\drona-ai\frontend\drona-ui
start "Frontend - DRONA UI" cmd /k npm start
timeout /t 2 /nobreak

cls
echo.
echo =====================================
echo ✅ DRONA-AI Stack is Running!
echo =====================================
echo.
echo 📋 Services Running:
echo    🎵 Ollama (localhost:11434)
echo    🔧 Backend (localhost:8000)
echo    🎨 Frontend (localhost:3000)
echo.
echo ⏸️  Close terminal windows to stop services
echo.
timeout /t 60 /nobreak
