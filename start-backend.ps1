#!/usr/bin/env powershell
# 🚀 DRONA-AI BACKEND STARTUP SCRIPT
# Starts Ollama + Backend (useful for development)

Write-Host "🚀 Starting DRONA-AI Backend Stack..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

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
        Start-Sleep -Seconds 1
    }
}

if (-Not $ready) {
    Write-Host "   ❌ Ollama failed to start" -ForegroundColor Red
    Stop-Process -Id $ollamaProcess.Id
    Exit 1
}

# Step 2: Start Backend with Uvicorn
Write-Host "`n2️⃣  Starting Backend (FastAPI)..." -ForegroundColor Green
Set-Location "c:\Projects\drona-ai\backend"
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--reload" -PassThru
Write-Host "   ✅ Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "✅ DRONA-AI Backend is Running!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`n📋 Services Running:" -ForegroundColor Cyan
Write-Host "   🎵 Ollama API (localhost:11434)" -ForegroundColor Yellow
Write-Host "   🔧 Backend API (localhost:8000)" -ForegroundColor Yellow

Write-Host "`n⏸️  Press Ctrl+C to stop all services" -ForegroundColor Gray
Write-Host "`n💡 Frontend can be started separately with: npm start (in frontend/drona-ui folder)" -ForegroundColor Cyan

# Wait for processes
try {
    Wait-Process -Id $ollamaProcess.Id, $backendProcess.Id
} catch {
    # Handle cleanup
}
