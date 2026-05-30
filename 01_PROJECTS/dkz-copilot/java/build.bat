@echo off
REM ============================================
REM  DkZ Java Batch Tools — Build Script
REM  Kompiliert ModuleScanner + BatchFixer
REM  Benötigt JDK 11+ (javac)
REM ============================================

setlocal

set SRC_DIR=%~dp0
set OUT_DIR=%SRC_DIR%out

echo [DkZ] Java Compiler pruefen...
where javac >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] javac nicht gefunden!
    echo.
    echo Loesung: JDK installieren
    echo   1. https://adoptium.net/de/ — Temurin JDK 21 LTS
    echo   2. Oder: scoop install temurin21-jdk
    echo   3. Oder: choco install temurin21
    echo.
    echo Aktuell nur JRE installiert (nur java, kein javac^).
    exit /b 1
)

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
echo   java -cp "%OUT_DIR%" ModuleScanner "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules"
echo   java -cp "%OUT_DIR%" BatchFixer "C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules" --dry-run
echo.

endlocal
