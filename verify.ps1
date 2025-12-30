# AirAware System Verification Script
# Run this to verify all components are working correctly

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🔍 AirAware System Verification" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Check 1: Model file exists
Write-Host "1. Checking ML model file..." -ForegroundColor Yellow
if (Test-Path "best_aqi_model.pkl") {
    Write-Host "   [OK] best_aqi_model.pkl found" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] best_aqi_model.pkl missing - Run: python model.py" -ForegroundColor Red
    $allPassed = $false
}

# Check 2: Dataset exists
Write-Host "2. Checking dataset..." -ForegroundColor Yellow
if (Test-Path "delhi_aqi.csv") {
    $lines = (Get-Content "delhi_aqi.csv" | Measure-Object -Line).Lines
    Write-Host "   [OK] delhi_aqi.csv found ($lines lines)" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] delhi_aqi.csv missing" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: Environment file
Write-Host "3. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   [OK] .env file found" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] .env missing - Copy .env.example and configure" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Node modules
Write-Host "4. Checking Node dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   [OK] node_modules installed" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] node_modules missing - Run: npm install" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Flask API
Write-Host "5. Checking Flask ML API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] Flask API responding on port 5000" -ForegroundColor Green
        $health = $response.Content | ConvertFrom-Json
        Write-Host "   [OK] Model loaded: $($health.model_loaded)" -ForegroundColor Green
    }
} catch {
    Write-Host "   [FAIL] Flask API not responding - Run: python api.py" -ForegroundColor Red
    $allPassed = $false
}

# Check 6: React Frontend
Write-Host "6. Checking React frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] React app responding on port 5173" -ForegroundColor Green
    }
} catch {
    Write-Host "   [FAIL] React app not responding - Run: npm run dev" -ForegroundColor Red
    $allPassed = $false
}

# Check 7: Test ML Prediction
Write-Host "7. Testing ML prediction endpoint..." -ForegroundColor Yellow
try {
    $testData = @{
        pm2_5 = 50.0
        pm10 = 80.0
        no2 = 40.0
        so2 = 15.0
        co = 1.5
        o3 = 45.0
        nh3 = 200
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/predict" -Method Post -Body $testData -ContentType "application/json" -TimeoutSec 2 -ErrorAction Stop
    $prediction = $response.Content | ConvertFrom-Json
    
    Write-Host "   [OK] Prediction successful" -ForegroundColor Green
    Write-Host "     Predicted AQI: $($prediction.predicted_aqi)" -ForegroundColor Cyan
    Write-Host "     Category: $($prediction.category)" -ForegroundColor Cyan
} catch {
    Write-Host "   [FAIL] Prediction test failed" -ForegroundColor Red
    $allPassed = $false
}

# Summary
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "[SUCCESS] All checks passed! System is operational" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Yellow
    Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "  ML API:   http://localhost:5000" -ForegroundColor Cyan
} else {
    Write-Host "[WARNING] Some checks failed. Please fix the issues above." -ForegroundColor Yellow
}
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
