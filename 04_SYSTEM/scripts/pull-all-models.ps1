# Bulk Model Pull Script for Ollama (DkZ Offline Mode)
$ErrorActionPreference = "Continue"

# Force Local Host
$env:OLLAMA_HOST = "127.0.0.1:11434"

# Ensure Ollama is running in background if not already
$ollamaProcess = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if (-not $ollamaProcess) {
    Write-Host "Starting Local Ollama daemon..."
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

$modelsToPull = @(
    "deepseek-llm",
    "deepseek-v2",
    "deepseek-coder",
    "qwen2.5-coder:14b",
    "qwen2.5:32b",
    "gemma2:27b",
    "gemma2:9b",
    "hf.co/unsloth/gpt-oss-20b-GGUF:Q4_K_M",
    "hf.co/bartowski/openai_gpt-oss-120b-GGUF:Q4_K_M"
)

Write-Host "Starting Bulk Download of $($modelsToPull.Length) Models..."

foreach ($model in $modelsToPull) {
    Write-Host "`n================================================="
    Write-Host ">> Downloading Model: $model"
    Write-Host "================================================="
    
    # Run pull command
    $start = Get-Date
    try {
        ollama pull $model
    } catch {
        Write-Host "[ERROR] Failed to pull $model. Proceeding to next..." -ForegroundColor Red
    }
    
    $duration = (Get-Date) - $start
    Write-Host ">> Completed/Failed $model (Time taken: $($duration.Minutes)m $($duration.Seconds)s)"
}

Write-Host "`nAll pulls completed. Final Model List:"
ollama list
