@echo off
chcp 65001 >nul
title SECOND BRAIN – Dashboard Updater
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   SECOND BRAIN / Mission Control         ║
echo  ║   Dashboard Updater v1.0                 ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ── Backup current version ──
set BACKUP_DIR=backup_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo  [1/4] Erstelle Backup in: %BACKUP_DIR%
mkdir "%~dp0%BACKUP_DIR%" 2>nul
copy "%~dp0index.html" "%~dp0%BACKUP_DIR%\index.html" >nul 2>&1
copy "%~dp0README.md"  "%~dp0%BACKUP_DIR%\README.md"  >nul 2>&1
echo        ✓ Backup erstellt.
echo.

:: ── Check for Node.js / serve ──
echo  [2/4] Prüfe Abhängigkeiten...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo        ✗ Node.js nicht gefunden.
    echo          Bitte installieren: https://nodejs.org
    pause
    exit /b 1
)
echo        ✓ Node.js gefunden.
echo.

:: ── Launch local server ──
echo  [3/4] Starte lokalen Server auf Port 4242...
echo        Dashboard läuft unter: http://localhost:4242
echo.
echo  [4/4] Öffne im Browser...
timeout /t 1 /nobreak >nul
start http://localhost:4242
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   Dashboard gestartet! Strg+C zum Stop   ║
echo  ╚══════════════════════════════════════════╝
echo.
cmd /c npx serve "%~dp0" -p 4242
pause
