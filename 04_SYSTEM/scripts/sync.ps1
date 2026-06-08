# ═══════════════════════════════════════
# DkZ™ Sync Script — Local → GitHub → VPS
# Usage: .\sync.ps1 ["commit message"]
# Synced: Workflows, Skills, Prompts, Agents, Module
# ═══════════════════════════════════════

param(
    [string]$Message = "sync: update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DkZ™ 3-Wege-Sync Pipeline" -ForegroundColor Cyan
Write-Host "  Local → GitHub → VPS (auto)" -ForegroundColor DarkCyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# --- Step 1: Git Add + Commit ---
Write-Host "`n[1/3] Git commit..." -ForegroundColor Yellow
Set-Location "C:\DEVKiTZ"
git add -A
$status = git status --porcelain
if ($status) {
    git commit -m $Message
    Write-Host "  ✅ Committed: $Message" -ForegroundColor Green
} else {
    Write-Host "  ⚪ Keine Aenderungen" -ForegroundColor DarkGray
}

# --- Step 2: Git Push ---
Write-Host "[2/3] Push zu GitHub..." -ForegroundColor Yellow
git push origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ GitHub aktualisiert" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Push fehlgeschlagen — retry mit groesserem Buffer" -ForegroundColor Red
    git config http.postBuffer 524288000
    git push origin main
}

# --- Step 3: Trigger VPS Sync ---
Write-Host "[3/3] VPS Sync triggern..." -ForegroundColor Yellow
ssh kvm8 "/opt/dkz/sync.sh"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ VPS synchronisiert" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ VPS Sync fehlgeschlagen" -ForegroundColor Red
}

# --- Summary ---
$hash = (git rev-parse --short HEAD)
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ 3-Wege-Sync komplett!" -ForegroundColor Green
Write-Host "  📝 Commit: $hash" -ForegroundColor Cyan
Write-Host "  🐙 GitHub: github.com/7IKED/devkitz-workspace" -ForegroundColor Cyan
Write-Host "  📡 VPS:    https://devkitz.eu" -ForegroundColor Cyan
Write-Host "  🏠 Lokal:  http://localhost:7777/landing-pages/" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
