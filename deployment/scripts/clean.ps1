#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

Write-Host "Removing unused Docker resources..." -ForegroundColor Yellow
docker system prune -f
