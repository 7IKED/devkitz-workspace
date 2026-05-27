# Ecosystem Analyzer

> DkZ Module pruefen, debuggen, dokumentieren, strukturieren und bewerten.

## Features
- 22 James Regeln (6 Kategorien)
- Mistral OCR (Bilder/PDFs analysieren)
- LLM Deep Evaluation (via NEXUZ)
- Debug Loop (Scan → Fix → LLM → Re-Check)
- Ecosystem Score 0-100
- Kompatibilitaets-Check (Theme, NEXUZ, James, Chain, Exports, Version)
- Auto-Fix Vorschlaege (lokal + LLM)
- GitHub Operations (Repo erstellen, Push)
- JSON Report Export
- 68 Module im Dropdown

## Architecture
- **Actions**: scan, lint, links, docs, format, git-create, git-push
- **Skills**: compatibility-check, structure-evaluate, content-rate, auto-fix
- **Workflow**: 7-Step Pipeline mit Loop (Scan→Lint→LLM→Loop→Docs→Git→Score)
- **Agent**: James GPT v2 Brain + Mistral OCR + LLM Fallback

## Chain: Actions -> Skills -> Workflows -> Agents -> Teams