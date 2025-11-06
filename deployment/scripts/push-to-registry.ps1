#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

Write-Host "Pushing images to registries..." -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Pushing consumer images to 10.0.40.171:5000..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

docker push 10.0.40.171:5000/consumer-dapp-backend:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "Consumer backend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "Consumer backend pushed" -ForegroundColor Green

docker push 10.0.40.171:5000/consumer-dapp-frontend:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "Consumer frontend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "Consumer frontend pushed" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Pushing provider images to 10.0.40.172:5000..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

docker push 10.0.40.172:5000/provider-dapp-backend:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "Provider backend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "Provider backend pushed" -ForegroundColor Green

docker push 10.0.40.172:5000/provider-dapp-frontend:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "Provider frontend push failed" -ForegroundColor Red
    exit 1
}
Write-Host "Provider frontend pushed" -ForegroundColor Green
Write-Host ""

Write-Host "View in registry UI:" -ForegroundColor Cyan
Write-Host "  Consumer: http://10.0.40.171:7000" -ForegroundColor Yellow
Write-Host "  Provider: http://10.0.40.172:7000" -ForegroundColor Yellow
