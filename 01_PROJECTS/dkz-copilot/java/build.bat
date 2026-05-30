@echo off
REM ============================================
REM  DkZ Java Batch Tools — Build Script
REM  Kompiliert ModuleScanner + BatchFixer
REM ============================================

setlocal

set SRC_DIR=%~dp0
set OUT_DIR=%SRC_DIR%out

echo [DkZ] Erstelle Output-Verzeichnis...
if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"

echo [DkZ] Kompiliere ModuleScanner.java...
javac -d "%OUT_DIR%" -encoding UTF-8 "%SRC_DIR%ModuleScanner.java"
if errorlevel 1 (
    echo [FEHLER] ModuleScanner.java Kompilierung fehlgeschlagen!
    exit /b 1
)

echo [DkZ] Kompiliere BatchFixer.java...
javac -d "%OUT_DIR%" -encoding UTF-8 "%SRC_DIR%BatchFixer.java"
if errorlevel 1 (
    echo [FEHLER] BatchFixer.java Kompilierung fehlgeschlagen!
    exit /b 1
)

echo.
echo [DkZ] Build erfolgreich!
echo.
echo Usage:
echo   java -cp "%OUT_DIR%" de.devkitz.copilot.ModuleScanner "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules"
echo   java -cp "%OUT_DIR%" de.devkitz.copilot.BatchFixer "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" --dry-run
echo.

endlocal
