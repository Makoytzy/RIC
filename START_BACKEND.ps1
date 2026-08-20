# ============================================================================
# START BACKEND SERVER
# ============================================================================
# Run this script to start the backend server cleanly
# ============================================================================

Write-Host "🔄 Stopping any existing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "⏳ Waiting 2 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
npm start
