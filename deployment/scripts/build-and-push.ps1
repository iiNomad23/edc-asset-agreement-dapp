#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

Write-Host "Building and Pushing All Images..." -ForegroundColor Cyan
Write-Host ""

& "$PSScriptRoot/build-all.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

& "$PSScriptRoot/push-to-registry.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push to registry failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All images built and pushed." -ForegroundColor Green
