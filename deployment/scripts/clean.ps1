#!/usr/bin/env pwsh

Write-Host "Removing dangling images..." -ForegroundColor Yellow
docker image prune -f
