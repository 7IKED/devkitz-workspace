# ═══════════════════════════════════════
# DkZ™ Deploy Script — Local → VPS → GitHub
# Usage: .\deploy.ps1 [message]
# ═══════════════════════════════════════

param(
    [string]$Message = "chore: deploy update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Continue"
$VPS = "kvm8"
$REMOTE_PATH = "/var/www/01_PROJECTS/01_dashboard"
$LOCAL_PATH = "C:\DEVKiTZ\01_PROJECTS\01_dashboard"
$ARCHIVE = "$env:TEMP\dkz-deploy.tar.gz"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DkZ™ Deploy Pipeline" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Git Commit + Push ---
Write-Host "[1/4] Git commit + push..." -ForegroundColor Yellow
Set-Location "C:\DEVKiTZ"
git add -A
git commit -m $Message 2>$null
git push origin main
Write-Host "  ✅ GitHub aktualisiert" -ForegroundColor Green

# --- Step 2: Tar packen ---
Write-Host "[2/4] Dashboard packen..." -ForegroundColor Yellow
tar --exclude="node_modules" --exclude=".git" --exclude="*.log" --exclude="__pycache__" --exclude="temp_*" -czf $ARCHIVE -C "C:\DEVKiTZ\01_PROJECTS" "01_dashboard"
$size = [math]::Round((Get-Item $ARCHIVE).Length / 1MB, 1)
Write-Host "  ✅ Archiv: ${size}MB" -ForegroundColor Green

# --- Step 3: Upload + Entpacken ---
Write-Host "[3/4] Upload zum VPS (KVM8)..." -ForegroundColor Yellow
scp $ARCHIVE "${VPS}:/tmp/dkz-deploy.tar.gz"
ssh $VPS "cd /var/www/01_PROJECTS && rm -rf 01_dashboard.bak && mv 01_dashboard 01_dashboard.bak 2>/dev/null; tar -xzf /tmp/dkz-deploy.tar.gz && rm /tmp/dkz-deploy.tar.gz && nginx -t && systemctl reload nginx"
Write-Host "  ✅ VPS aktualisiert + Nginx reloaded" -ForegroundColor Green

# --- Step 4: Verifizierung ---
Write-Host "[4/4] Verifizierung..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://devkitz.eu" -TimeoutSec 10 -UseBasicParsing
    Write-Host "  ✅ devkitz.eu erreichbar (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ devkitz.eu nicht erreichbar — SSL/DNS pruefen" -ForegroundColor Red
}

# --- Cleanup ---
Remove-Item $ARCHIVE -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ Deploy komplett!" -ForegroundColor Green
Write-Host "  📡 https://devkitz.eu" -ForegroundColor Cyan
Write-Host "  🏠 http://localhost:7777/landing-pages/" -ForegroundColor Cyan
Write-Host "  🐙 github.com/7IKED/devkitz-ecosystem" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
