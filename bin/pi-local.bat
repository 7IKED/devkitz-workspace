@echo off
:: DkZ Pi Agent mit lokalen VPS LLMs
:: Nutzt Gateway als OpenAI-kompatiblen Proxy
set OPENAI_BASE_URL=http://localhost:3040/v1
set OPENAI_API_KEY=dkz-local

if "%~1"=="" (
    echo.
    echo   DkZ Pi Agent — VPS LLM Mode
    echo   Gateway: http://localhost:3040/v1
    echo   Modelle: qwen3:4b, qwen2.5-coder:7b, qwen3:14b, qwen2.5:32b, gemma3:4b
    echo.
    echo   Nutzung:  pi-local "Deine Frage"
    echo   Oder:     pi-local  (interaktiv)
    echo.
    pi
) else (
    pi %*
)
