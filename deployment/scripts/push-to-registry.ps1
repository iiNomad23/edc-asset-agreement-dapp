#!/usr/bin/env pwsh

Write-Host "Pushing images to registries..." -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Pushing consumer images to 10.0.40.171:5000..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
docker push 10.0.40.171:5000/consumer-dapp-backend:latest
docker push 10.0.40.171:5000/consumer-dapp-frontend:latest

Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Pushing provider images to 10.0.40.172:5000..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
docker push 10.0.40.172:5000/provider-dapp-backend:latest
docker push 10.0.40.172:5000/provider-dapp-frontend:latest

Write-Host ""
Write-Host "All images pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "View in registry UI:" -ForegroundColor Cyan
Write-Host "  Consumer: http://10.0.40.171:7000" -ForegroundColor Yellow
Write-Host "  Provider: http://10.0.40.172:7000" -ForegroundColor Yellow