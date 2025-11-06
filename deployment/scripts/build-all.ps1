#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\..\.."

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Building Consumer Images..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "Building consumer backend..." -ForegroundColor Yellow
docker build -t 10.0.40.171:5000/consumer-dapp-backend:latest ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "Consumer backend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Building consumer frontend..." -ForegroundColor Yellow
Push-Location frontend
Remove-Item .env -ErrorAction SilentlyContinue
Copy-Item ..\deployment\consumer\frontend\.env .env
docker build -t 10.0.40.171:5000/consumer-dapp-frontend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Consumer frontend build failed" -ForegroundColor Red
    Remove-Item .env
    Pop-Location
    exit 1
}
Remove-Item .env
Pop-Location

Write-Host "Consumer images built!" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Building Provider Images..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "Building provider backend..." -ForegroundColor Yellow
docker build -t 10.0.40.172:5000/provider-dapp-backend:latest ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "Provider backend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Building provider frontend..." -ForegroundColor Yellow
Push-Location frontend
Remove-Item .env -ErrorAction SilentlyContinue
Copy-Item ..\deployment\provider\frontend\.env .env
docker build -t 10.0.40.172:5000/provider-dapp-frontend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Provider frontend build failed" -ForegroundColor Red
    Remove-Item .env
    Pop-Location
    exit 1
}
Remove-Item .env
Pop-Location

Write-Host "Provider images built!" -ForegroundColor Green
