# PowerShell script to open Windows Firewall ports for ERP System
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Opening Windows Firewall Ports" -ForegroundColor Cyan
Write-Host "  ERP System Network Access Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Opening port 2222 (Frontend)..." -ForegroundColor Yellow
try {
    # Remove existing rule if it exists
    Remove-NetFirewallRule -DisplayName "ERP Frontend" -ErrorAction SilentlyContinue
    
    # Create new rule
    New-NetFirewallRule -DisplayName "ERP Frontend" `
        -Direction Inbound `
        -LocalPort 2222 `
        -Protocol TCP `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Description "Allow access to ERP Frontend on port 2222"
    
    Write-Host "  ✓ Port 2222 opened successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to open port 2222: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Opening port 8000 (Backend API)..." -ForegroundColor Yellow
try {
    # Remove existing rule if it exists
    Remove-NetFirewallRule -DisplayName "ERP Backend" -ErrorAction SilentlyContinue
    
    # Create new rule
    New-NetFirewallRule -DisplayName "ERP Backend" `
        -Direction Inbound `
        -LocalPort 8000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Domain,Private,Public `
        -Description "Allow access to ERP Backend API on port 8000"
    
    Write-Host "  ✓ Port 8000 opened successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to open port 8000: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Firewall Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your ERP system should now be accessible from:" -ForegroundColor Yellow
Write-Host "  - Same network: http://192.168.0.199:2222" -ForegroundColor White
Write-Host "  - Backend API: http://192.168.0.199:8000" -ForegroundColor White
Write-Host ""
Write-Host "Note: If accessing from outside your local network," -ForegroundColor Yellow
Write-Host "      you may need to configure port forwarding on your router." -ForegroundColor Yellow
Write-Host ""
pause

