#!/usr/bin/env pwsh

Set-Location "$PSScriptRoot\..\.."

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Building Consumer Images..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "Building consumer backend..." -ForegroundColor Yellow
docker build -t 10.0.40.171:5000/consumer-dapp-backend:latest ./backend

Write-Host "Building consumer frontend..." -ForegroundColor Yellow
Push-Location frontend
Remove-Item .env -ErrorAction SilentlyContinue
Copy-Item ..\deployment\consumer\frontend\.env .env
docker build -t 10.0.40.171:5000/consumer-dapp-frontend:latest .
Remove-Item .env
Pop-Location

Write-Host "Consumer images built!" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Building Provider Images..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "Building provider backend..." -ForegroundColor Yellow
docker build -t 10.0.40.172:5000/provider-dapp-backend:latest ./backend

Write-Host "Building provider frontend..." -ForegroundColor Yellow
Push-Location frontend
Remove-Item .env -ErrorAction SilentlyContinue
Copy-Item ..\deployment\provider\frontend\.env .env
docker build -t 10.0.40.172:5000/provider-dapp-frontend:latest .
Remove-Item .env
Pop-Location

Write-Host "Provider images built!" -ForegroundColor Green
