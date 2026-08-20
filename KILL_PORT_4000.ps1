# ============================================================================
# KILL PROCESS ON PORT 4000
# ============================================================================
# This script finds and kills whatever is using port 4000
# ============================================================================

Write-Host "🔍 Finding process using port 4000..." -ForegroundColor Yellow

# Find the process ID using port 4000
$processId = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processId) {
    Write-Host "⚠️  Found process $processId using port 4000" -ForegroundColor Red
    
    # Get process details
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "📋 Process Name: $($process.ProcessName)" -ForegroundColor Cyan
        Write-Host "📋 Process Path: $($process.Path)" -ForegroundColor Cyan
        
        # Kill the process
        Write-Host "🔪 Killing process..." -ForegroundColor Red
        Stop-Process -Id $processId -Force
        
        Write-Host "✅ Process killed successfully!" -ForegroundColor Green
        Write-Host "⏳ Waiting 2 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        # Verify port is free
        $stillRunning = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
        if ($stillRunning) {
            Write-Host "⚠️  Port 4000 is still in use!" -ForegroundColor Red
        } else {
            Write-Host "✅ Port 4000 is now free!" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Could not find process details" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Port 4000 is already free!" -ForegroundColor Green
}

Write-Host "`n🚀 You can now run: npm start" -ForegroundColor Cyan
