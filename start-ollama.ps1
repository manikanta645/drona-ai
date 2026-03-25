#!/usr/bin/env powershell
# 🎵 Start Ollama Service Only
# Use this if you want to start Ollama separately from the backend

Write-Host "🎵 Starting Ollama Service..." -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Check if Ollama is installed
$ollamaPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe"
if (-Not (Test-Path $ollamaPath)) {
    Write-Host "❌ Ollama not found at: $ollamaPath" -ForegroundColor Red
    Write-Host "Please install Ollama from: https://ollama.ai" -ForegroundColor Yellow
    Exit 1
}

# Start Ollama
Write-Host "`nStarting Ollama..." -ForegroundColor Green
$ollamaProcess = Start-Process -FilePath "ollama" -ArgumentList "serve" -PassThru
Write-Host "✅ Ollama running! (PID: $($ollamaProcess.Id))" -ForegroundColor Green
Write-Host "   🌐 Access at: http://localhost:11434" -ForegroundColor Yellow
Write-Host "`n⏸️  Press Ctrl+C to stop" -ForegroundColor Gray

# Wait for process
try {
    Wait-Process -Id $ollamaProcess.Id
} catch {
    # Handle cleanup
}
