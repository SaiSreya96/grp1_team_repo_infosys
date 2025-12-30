# AirAware Project Startup Script
# This script starts both the Flask ML API backend and React frontend

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🌍 Starting AirAware Application" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get the project directory
$projectDir = Get-Location

# Start Flask API in background
Write-Host "📊 Starting ML API Server (Flask)..." -ForegroundColor Yellow
$flaskProcess = Start-Process -FilePath "C:/Users/lokes/anaconda3/python.exe" -ArgumentList "api.py" -WorkingDirectory $projectDir -PassThru -WindowStyle Normal
Start-Sleep -Seconds 3

if ($flaskProcess -and !$flaskProcess.HasExited) {
    Write-Host "✓ Flask API started successfully on http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start Flask API" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start React Dev Server
Write-Host "⚛️  Starting React Frontend (Vite)..." -ForegroundColor Yellow
Write-Host "Frontend will be available at http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Run npm dev (this will keep the terminal open)
npm run dev
