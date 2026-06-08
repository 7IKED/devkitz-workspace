@echo off
:: DkZ OpenCode mit VPS LLMs
:: Startet OpenCode mit custom Qwen Provider
set OLLAMA_BASE_URL=http://72.61.93.129:8811
set OLLAMA_API_KEY=DKZ-OLLAMA-2026-SECURE

if "%~1"=="" (
    echo.
    echo   DkZ OpenCode — VPS LLM Mode
    echo   Modelle: custom/qwen3:4b, custom/qwen2.5-coder:7b, custom/qwen3:14b
    echo.
    "C:\DEVKiTZ\opencode-cli\opencode.exe" -m custom/qwen2.5-coder:7b
) else (
    "C:\DEVKiTZ\opencode-cli\opencode.exe" %*
)
