@echo off
REM DkZ CoPilot — Google Drive Setup mit rclone
REM Ausfuehren: 04_SYSTEM\bin\setup-drive.bat

echo.
echo ============================================
echo  DkZ Google Drive Sync Setup
echo ============================================
echo.
echo Schritt 1: rclone konfigurieren
echo   → Waehle: n) New remote
echo   → Name: gdrive
echo   → Storage: 18 (Google Drive)
echo   → Client ID: (Enter fuer Standard)
echo   → Client Secret: (Enter fuer Standard)
echo   → Scope: 1 (Full access)
echo   → Root folder ID: (Enter)
echo   → Service Account: (Enter)
echo   → Advanced config: n
echo   → Auto config: y (Browser oeffnet sich!)
echo   → Team Drive: n
echo.

C:\DEVKiTZ\04_SYSTEM\bin\rclone.exe config

echo.
echo ============================================
echo  Teste Verbindung...
echo ============================================
C:\DEVKiTZ\04_SYSTEM\bin\rclone.exe about gdrive:

echo.
echo ============================================
echo  Starte ersten Sync...
echo ============================================
C:\DEVKiTZ\04_SYSTEM\bin\rclone.exe sync C:\DEVKiTZ\01_PROJECTS\dkz-copilot gdrive:DEVKiTZ/dkz-copilot --progress --exclude "node_modules/**" --exclude ".git/**" --exclude "__pycache__/**" --exclude "dist/**"

echo.
echo Fertig! Drive Sync eingerichtet.
pause
