#!/usr/bin/env pwsh

Write-Host "Building and Pushing All Images..." -ForegroundColor Cyan
Write-Host ""

& "$PSScriptRoot/build-all.ps1"

Write-Host ""

& "$PSScriptRoot/push-to-registry.ps1"

Write-Host ""
Write-Host "All images built and pushed." -ForegroundColor Green
