#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

Write-Host "Removing dangling images..." -ForegroundColor Yellow
docker image prune -f
