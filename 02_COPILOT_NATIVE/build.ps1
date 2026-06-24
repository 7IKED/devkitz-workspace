Write-Host "=================================================="
Write-Host " 🔨 Building DEVKiTZ Native Copilot "
Write-Host "=================================================="

# 1. Build Go Gateway
Write-Host "[1/3] Compiling Go Gateway..."
Set-Location -Path "gateway"
go build -o devkitz-gateway.exe main.go
Set-Location -Path ".."
if ($?) { Write-Host "✅ Go Gateway compiled." } else { Write-Host "❌ Go Gateway build failed." }

# 2. Build C Skeleton
Write-Host "[2/3] Compiling C Skeleton (Daemon)..."
if (Get-Command gcc -ErrorAction SilentlyContinue) {
    Set-Location -Path "skeleton"
    gcc main.c -o copilot-daemon.exe
    Set-Location -Path ".."
    if ($?) { Write-Host "✅ C Skeleton compiled." } else { Write-Host "❌ C Skeleton build failed." }
} else {
    Write-Host "⚠️ GCC not found. Skipping C compilation."
}

# 3. Check Interpreters
Write-Host "[3/3] Verifying Interpreters..."
if (Get-Command python -ErrorAction SilentlyContinue) { Write-Host "✅ Python found." } else { Write-Host "⚠️ Python not found." }
if (Get-Command mojo -ErrorAction SilentlyContinue) { Write-Host "✅ Mojo found." } else { Write-Host "⚠️ Mojo not found." }

Write-Host "=================================================="
Write-Host " Build Process Complete."
Write-Host "=================================================="
