# PowerShell Script to Start VIDYA System Services
# Run in PowerShell (Admin recommended)

Write-Host "🚀 DRONA-AI VIDYA System Startup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if Node is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting VIDYA Services..." -ForegroundColor Yellow
Write-Host ""

# Detect Windows and set command appropriately
$isWindows = [System.Environment]::OSVersion.Platform -eq "Win32NT"

if ($isWindows) {
    Write-Host "🪟 Windows detected - using PowerShell Process" -ForegroundColor Cyan
    Write-Host ""
    
    # Start Backend in new PowerShell window
    Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
    $backendScript = {
        Set-Location backend
        python main.py
    }
    
    $backendJob = Start-Job -ScriptBlock $backendScript -Name "VIDYA-Backend"
    Write-Host "✓ Backend process started (Job ID: $($backendJob.Id))" -ForegroundColor Green
    
    # Wait a bit for backend to start
    Start-Sleep -Seconds 3
    
    # Check backend health
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:8000/api/vidya/health" -UseBasicParsing
        Write-Host "✓ Backend health check passed" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Backend health check pending... (still starting)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Start Frontend in new PowerShell window
    Write-Host "⚛️ Starting Frontend Server..." -ForegroundColor Yellow
    $frontendScript = {
        Set-Location "frontend\drona-ui"
        npm start
    }
    
    $frontendJob = Start-Job -ScriptBlock $frontendScript -Name "VIDYA-Frontend"
    Write-Host "✓ Frontend process started (Job ID: $($frontendJob.Id))" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "✨ VIDYA System is Starting!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Services:" -ForegroundColor Cyan
    Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
    Write-Host "  API:      http://localhost:8000/api/vidya" -ForegroundColor White
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Running Jobs:" -ForegroundColor Cyan
    Write-Host "  Backend Job ID:  $($backendJob.Id)" -ForegroundColor White
    Write-Host "  Frontend Job ID: $($frontendJob.Id)" -ForegroundColor White
    Write-Host ""
    Write-Host "⏹️ To stop services, run:" -ForegroundColor Yellow
    Write-Host "  Get-Job | Stop-Job" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 To view logs, run:" -ForegroundColor Yellow
    Write-Host "  Receive-Job -Id <JobID>" -ForegroundColor White
    Write-Host ""
    
    # Keep script running
    Write-Host "Press Ctrl+C to exit..." -ForegroundColor Yellow
    while ($true) {
        Start-Sleep -Seconds 1
        $backendJob = Get-Job -Name "VIDYA-Backend" -ErrorAction SilentlyContinue
        $frontendJob = Get-Job -Name "VIDYA-Frontend" -ErrorAction SilentlyContinue
        
        if ($null -eq $backendJob -or $null -eq $frontendJob) {
            Write-Host "One or more services have stopped" -ForegroundColor Red
            break
        }
    }
}
else {
    Write-Host "🐧 Linux/macOS detected" -ForegroundColor Cyan
    Write-Host "Running startup script..." -ForegroundColor Yellow
    & bash start-vidya.sh
}
