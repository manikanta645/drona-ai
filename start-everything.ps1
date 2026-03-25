#!/usr/bin/env powershell
# 🚀 DRONA-AI COMPLETE STARTUP SCRIPT
# Starts Ollama + Backend + Frontend

Write-Host "🚀 Starting DRONA-AI Stack..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if Ollama is installed
$ollamaPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe"
if (-Not (Test-Path $ollamaPath)) {
    Write-Host "❌ Ollama not found at: $ollamaPath" -ForegroundColor Red
    Write-Host "Please install Ollama from: https://ollama.ai" -ForegroundColor Yellow
    Exit 1
}

# Step 1: Start Ollama in background
Write-Host "`n1️⃣  Starting Ollama service..." -ForegroundColor Green
$ollamaProcess = Start-Process -FilePath "ollama" -ArgumentList "serve" -NoNewWindow -PassThru
Write-Host "   ✅ Ollama started (PID: $($ollamaProcess.Id))" -ForegroundColor Green

# Wait for Ollama to be ready
Write-Host "`n   ⏳ Waiting for Ollama to be ready..." -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -SkipHttpErrorCheck
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Ollama is ready!" -ForegroundColor Green
            $ready = $true
            break
        }
    } catch {
        Write-Host "   ⏳ Attempt $i/30..." -ForegroundColor Gray -NoNewline; Write-Host "`r" -NoNewline
        Start-Sleep -Seconds 1
    }
}

if (-Not $ready) {
    Write-Host "   ❌ Ollama failed to start" -ForegroundColor Red
    Stop-Process -Id $ollamaProcess.Id
    Exit 1
}

# Step 2: Start Backend
Write-Host "`n2️⃣  Starting Backend (FastAPI)..." -ForegroundColor Green
Set-Location "c:\Projects\drona-ai\backend"
$backendProcess = Start-Process -FilePath "python" -ArgumentList "main.py" -NoNewWindow -PassThru
Write-Host "   ✅ Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

# Step 3: Start Frontend
Write-Host "`n3️⃣  Starting Frontend (React)..." -ForegroundColor Green
Set-Location "c:\Projects\drona-ai\frontend\drona-ui"
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow -PassThru
Write-Host "   ✅ Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ DRONA-AI Stack is Running!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`n📋 Services Running:" -ForegroundColor Cyan
Write-Host "   🎵 Ollama (localhost:11434)" -ForegroundColor Yellow
Write-Host "   🔧 Backend (localhost:8000)" -ForegroundColor Yellow
Write-Host "   🎨 Frontend (localhost:3000)" -ForegroundColor Yellow

Write-Host "`n⏸️  Press Ctrl+C to stop all services" -ForegroundColor Gray

# Wait for processes
try {
    Wait-Process -Id $ollamaProcess.Id, $backendProcess.Id, $frontendProcess.Id
} catch {
    # Handle cleanup if process dies
}
