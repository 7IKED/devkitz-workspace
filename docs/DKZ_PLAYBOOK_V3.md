# 🚀 DKZ PLAYBOOK V3 — Next Gen Full Stack

> **Version:** v3.0.0 · **Stand:** 2026-05-10 · **Autor:** DkZ devkitz
> **Zweck:** Maximale Edition — V2 + Agent Framework + A2A + LLM Integration + CI/CD
> **Geltungsbereich:** Gesamtes DEVKiTZ™ Ökosystem + externe Integrationen
> **Status:** 🟢 VERBINDLICH

---

## 📋 Inhalt

- [V2-Kern](#v2-kern) — Alle V1+V2 Regeln
- [Agent Framework](#agent-framework) — A2A + LangGraph + NanoBot
- [LLM Integration](#llm-integration) — 15+ Provider, llms.txt, Routing
- [Knowledge Pipeline](#knowledge-pipeline) — Obsidian + Cognee + AutoResearch
- [CI/CD Pipeline](#cicd-pipeline) — TestCafe + GitHub Actions + Release
- [Syntax Patterns](#syntax-patterns) — Prefixes, Shortcuts, Commands
- [NanoBot + NanoChat](#nanobot--nanochat) — Agent-Kommunikation
- [ComfyUI + Multimodal](#comfyui--multimodal) — Bild/Video Pipeline
- [Monitoring + Health](#monitoring--health) — Dashboards, Metriken
- [Karpathy Optimizer](#karpathy-optimizer) — Meta-Skill, Anti-RAG

---

## V2-Kern

> Alle V1 + V2 Regeln gelten unverändert.
> Siehe [V1](./DKZ_PLAYBOOK_V1.md) | [V2](./DKZ_PLAYBOOK_V2.md) | [ZERO](./DKZ_PLAYBOOK_ZERO.md)

---

## Agent Framework

### A2A (Agent-to-Agent) Protokoll

```
┌─────────────┐    A2A     ┌─────────────┐
│  Agent A    │───────────→│  Agent B    │
│  (Wispe™)   │←───────────│  (James™)   │
└─────────────┘   JSON-RPC  └─────────────┘
       │                          │
       ▼                          ▼
┌─────────────┐            ┌─────────────┐
│  NanoBot    │            │  NanoChat   │
│  Registry   │            │  Messaging  │
└─────────────┘            └─────────────┘
```

### Agent-Karte (Agent Card Schema)

```json
{
  "name": "James™ Evaluator",
  "version": "2.0.0",
  "description": "Prompt-Scoring + Code-Review Agent",
  "capabilities": ["evaluate", "review", "score"],
  "protocols": ["a2a", "mcp"],
  "endpoint": "http://localhost:9880/agents/james",
  "auth": "api-key",
  "input_schema": {
    "type": "object",
    "properties": {
      "prompt": { "type": "string" },
      "mode": { "enum": ["score", "review", "improve"] }
    }
  }
}
```

### Agent-Registry

| Agent | Port | Protokoll | Status |
|:------|:-----|:----------|:-------|
| James™ | 9880 | MCP + A2A | 🟢 |
| Wispe™ | 8899 | HTTP + WS | 🟢 |
| OpenClaw™ | 8800 | FastAPI | 🟡 |
| Pi Agent | 9881 | MCP | 🟢 |
| Builder Agent | 9882 | MCP | 🟢 |
| NanoBot | 9890 | Internal | 🟢 |
| NanoChat | 9891 | WebSocket | 🟢 |

### LangGraph Integration

```python
# Agent-Orchestrierung mit LangGraph
from langgraph.graph import StateGraph

workflow = StateGraph(AgentState)
workflow.add_node("james", james_evaluate)
workflow.add_node("developer", developer_code)
workflow.add_node("tester", tester_verify)
workflow.add_node("reviewer", reviewer_check)

workflow.add_edge("james", "developer")
workflow.add_edge("developer", "tester")
workflow.add_edge("tester", "reviewer")
workflow.add_conditional_edges("reviewer", route_result)
```

### Cognee Knowledge Graph

```python
# Wissens-Injection für Agenten
import cognee

await cognee.add("modules/wissen-hub/archive/")
await cognee.cognify()
results = await cognee.search("Wie funktioniert der Prompt-Hub?")
```

---

## LLM Integration

### 15+ Provider

| Provider | Modelle | API-Typ | Status |
|:---------|:--------|:--------|:-------|
| **OpenAI** | GPT-4o, o1, o3 | REST | 🟢 |
| **Anthropic** | Claude 3.5/4 Sonnet/Opus | REST | 🟢 |
| **Google** | Gemini 2.5 Pro/Flash | REST | 🟢 |
| **Groq** | Llama 3.3, Mixtral | REST | 🟢 |
| **Mistral** | Mistral Large, Codestral | REST | 🟢 |
| **HuggingFace** | Open Models (70B+) | REST | 🟢 |
| **OpenRouter** | Multi-Provider Gateway | REST | 🟢 |
| **NVIDIA** | NIM, Llama, Nemotron | REST | 🟢 |
| **WebUI** | Lokale LLMs (Ollama) | REST | 🟡 |
| **LM Studio** | Lokale GGUF Models | REST | 🟡 |
| **Together** | Open Models Cloud | REST | 🟡 |
| **Cerebras** | Ultra-Fast Inference | REST | 🟡 |
| **DeepSeek** | DeepSeek V3, R1 | REST | 🟡 |
| **Perplexity** | Search + LLM | REST | 🟡 |
| **Cohere** | Command R+ | REST | 🟡 |

### llms.txt Standard

Jedes Projekt MUSS eine `llms.txt` im Root haben:

```
# DEVKiTZ™ Ecosystem

> DEVKiTZ ist ein KI-Entwickler-Ökosystem mit 89+ Dashboard-Modulen.

## Docs
- [Playbook](docs/DKZ_PLAYBOOK_V3.md): Vollständiges Regelwerk
- [Architecture](docs/ARCHITECTURE.md): System-Architektur
- [API](docs/API.md): ONTHERUN + NEXUZ API

## Stack
- Frontend: Vanilla HTML/CSS/JS (kein Framework)
- Backend: Node.js + Express
- Design: DkZ™ v2 (#fa1e4e Accent, Dark Mode)
- Fonts: Inter + JetBrains Mono

## Rules
- IMMER esc() für User-Input (XSS)
- IMMER CSS Variables (--accent, --bg)
- NIEMALS React/Vue/Angular
- Git Commit nach JEDER Änderung
```

### Model-Routing

```javascript
// Automatisches Model-Routing basiert auf Task-Typ
const MODEL_ROUTES = {
    'code':     { provider: 'anthropic', model: 'claude-sonnet-4' },
    'chat':     { provider: 'openai',    model: 'gpt-4o' },
    'research': { provider: 'google',    model: 'gemini-2.5-pro' },
    'fast':     { provider: 'groq',      model: 'llama-3.3-70b' },
    'vision':   { provider: 'openai',    model: 'gpt-4o' },
    'local':    { provider: 'ollama',    model: 'llama3.2:latest' },
    'eval':     { provider: 'anthropic', model: 'claude-sonnet-4' },
    'embed':    { provider: 'openai',    model: 'text-embedding-3-large' }
};
```

---

## Knowledge Pipeline

### Obsidian Second Brain

```
Input Sources                    Processing                  Output
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Chat     │────→│ Raw .md  │────→│ LLM Wiki │────→│ Obsidian │
│ Logs     │     │ Archive  │     │ Condense │     │ Vault    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Research │────→│ AutoRes. │────→│ Cognee   │────→│ Graphify │
│ Sessions │     │ MCP      │     │ KG Build │     │ Canvas   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### AutoResearch Pipeline (Karpathy Method)

```
Topic → Deep Research → Think Research → Fast Research
    → Condense → Wiki Entry → Obsidian Note
    → Dead-Path Pruning → Knowledge Graph Update
```

### Research-Modi

| Modus | Befehl | LLM | Zweck |
|:------|:-------|:----|:------|
| **Fast** | `/fast` | Gemini Flash | Schnelle Fakten |
| **Think** | `/think` | Gemini Pro | Tiefe Analyse |
| **FakeCheck** | `/fakecheck` | Multi-LLM | Fakten verifizieren |
| **Deep** | `/deep` | Claude + Gemini | Autonome Forschung |
| **Pro** | `/pro` | Gemini Pro + Search | Web + Reasoning |

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: DkZ CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm test
      
  release:
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - uses: softprops/action-gh-release@v2
        with:
          files: build_out/*.exe
```

### TestCafe Audit Standard

```bash
# Headless (CI)
npx testcafe chrome:headless tests/ --reporter spec

# Headed (Lokal)
npx testcafe chrome tests/

# Mit Report
npx testcafe chrome:headless tests/ --reporter json:report.json
```

### Release-Workflow

```
Code → Test (100% grün) → Tag → Push → GitHub Actions
→ Build → Release → CHANGELOG → PR → Merge
```

---

## Syntax Patterns

### Prefix-System

| Prefix | Bedeutung | Beispiel |
|:-------|:----------|:---------|
| `/` | Workflow/Command | `/startup`, `/build`, `/test` |
| `@` | Agent-Mention | `@james`, `@wispe`, `@developer` |
| `#` | Tag/Kategorie | `#wispe`, `#dashboard`, `#roadmap` |
| `!` | Priority/Alert | `!urgent`, `!breaking`, `!r24` |
| `$` | Variable/Config | `$accent`, `$bg`, `$port` |
| `~` | Approximate/Fuzzy | `~50 Tests`, `~3 Stunden` |
| `>` | Quote/Reference | `> Playbook §47` |
| `::` | Namespace | `dkz::theme`, `wispe::brain` |

### Console-Commands (Wispe™)

| Command | Funktion |
|:--------|:---------|
| `help` | Hilfe anzeigen |
| `clear` | Console leeren |
| `brain` | Brain View öffnen |
| `fast [query]` | Schnelle Recherche |
| `think [query]` | Tiefe Analyse |
| `fakecheck [claim]` | Fakten-Check |
| `note [text]` | Notiz speichern |
| `history` | Chat-Verlauf |
| `export` | Daten exportieren |
| `status` | System-Status |

### Keyboard Shortcuts

| Shortcut | Funktion |
|:---------|:---------|
| `Ctrl+K` | Command Palette |
| `Ctrl+/` | Console Toggle |
| `Ctrl+B` | Brain View |
| `Ctrl+S` | Speichern |
| `Ctrl+E` | Export |
| `ESC` | Panel schließen |
| `Tab` | Auto-Complete |
| `↑/↓` | History navigieren |

---

## NanoBot + NanoChat

### NanoBot — Auto-Classifier

```javascript
// Agent-Routing basiert auf Input-Analyse
class NanoBot {
    classify(input) {
        if (input.match(/code|fix|build|debug/i)) return 'developer';
        if (input.match(/test|check|verify/i)) return 'tester';
        if (input.match(/review|score|eval/i)) return 'james';
        if (input.match(/search|research|find/i)) return 'researcher';
        if (input.match(/doc|readme|wiki/i)) return 'dokumentar';
        return 'general';
    }
    
    async route(input) {
        const agent = this.classify(input);
        return await this.agents[agent].process(input);
    }
}
```

### NanoChat — Agent Messaging

```javascript
// WebSocket-basierte Agent-Kommunikation
class NanoChat {
    constructor() {
        this.ws = new WebSocket('ws://localhost:9891');
        this.channels = new Map();
    }
    
    // Agent-zu-Agent Nachricht
    send(from, to, message) {
        this.ws.send(JSON.stringify({
            type: 'a2a',
            from: from,
            to: to,
            payload: message,
            timestamp: Date.now()
        }));
    }
    
    // Broadcast an alle Agenten
    broadcast(from, message) {
        this.ws.send(JSON.stringify({
            type: 'broadcast',
            from: from,
            payload: message
        }));
    }
}
```

### Kommunikations-Protokoll

```
┌──────────┐     NanoChat      ┌──────────┐
│  Wispe™  │──── WebSocket ───→│  James™  │
│  (Voice) │                    │  (Eval)  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │        ┌──────────┐          │
     └───────→│ NanoBot  │←─────────┘
              │ Registry │
              │ + Router │
              └────┬─────┘
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
    ┌─────────┐ ┌─────┐ ┌──────┐
    │Developer│ │Tester│ │Reviewer│
    └─────────┘ └─────┘ └──────┘
```

---

## ComfyUI + Multimodal

### REST-API Bridge

```javascript
// ComfyUI Integration
class ComfyBridge {
    constructor(url = 'http://localhost:8188') {
        this.url = url;
    }
    
    async generate(workflow, params) {
        const response = await fetch(`${this.url}/prompt`, {
            method: 'POST',
            body: JSON.stringify({ prompt: workflow, ...params })
        });
        return response.json();
    }
    
    async getStatus(promptId) {
        return fetch(`${this.url}/history/${promptId}`).then(r => r.json());
    }
}
```

### Multimodale Pipeline

| Input | Verarbeitung | Output |
|:------|:-------------|:-------|
| Text → | LLM + Prompt Engineering | → Bild (ComfyUI) |
| Bild → | Vision + OCR (Mistral) | → Beschreibung |
| Audio → | Whisper STT | → Text |
| Text → | TTS (Fish/Coqui) | → Audio |
| Bilder → | Video Pipeline | → MP4 |

---

## Monitoring + Health

### System-Metriken

```javascript
// Health-Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        agents: agentRegistry.getStatus(),
        version: pkg.version,
        timestamp: new Date().toISOString()
    });
});
```

### Ampel-Dashboard

| System | Grün | Gelb | Rot |
|:-------|:-----|:-----|:----|
| **ONTHERUN™** | Alle Tools OK | 1-2 Tools fail | Server down |
| **NEXUZ™** | API erreichbar | Slow response | Timeout |
| **James™** | Score berechnet | Fallback-Score | Keine Antwort |
| **NanoBot** | Routing OK | Unbekannter Input | Registry leer |
| **NanoChat** | WS verbunden | Reconnecting | Disconnected |

---

## Karpathy Optimizer

### Meta-Skill Prinzipien

1. **Anti-RAG:** Keine rohen Dokumente in den Kontext — nur kondensierte Master-Wikis
2. **Tree of Thoughts:** Vor dem Coden Denkbaum erstellen
3. **Dead-End Prediction:** Sackgassen vorhersagen und vermeiden
4. **Self-Correction:** Automatische Fehler-Erkennung und -Korrektur
5. **Token-Effizienz:** Maximale Information bei minimalen Tokens

### Anwendung auf Legacy-Systeme

| System | Optimierung |
|:-------|:-----------|
| NanoBot | Classifier-Logik verdichten |
| NanoChat | Message-Format optimieren |
| PyTorch | Training-Loops effizienter |
| Prompts | Token-Reduktion ohne Qualitätsverlust |

---

## 🗺️ V3 Roadmap

| Phase | Features | Timeline |
|:------|:---------|:---------|
| **3.0** | Brain View, Chat-Persistenz, TestCafe | ✅ Done |
| **3.1** | A2A Protokoll, Agent Cards | Q2 2026 |
| **3.2** | LangGraph Orchestrierung | Q2 2026 |
| **3.3** | ComfyUI Bridge, Multimodal | Q3 2026 |
| **3.4** | CI/CD GitHub Actions | Q3 2026 |
| **3.5** | Knowledge Graph (Cognee) | Q3 2026 |
| **4.0** | Full Autonomy + Self-Healing | Q4 2026 |

---

## 📊 V3 Statistiken

| Metrik | V1 | V2 | V3 |
|:-------|:---|:---|:---|
| Sektionen | 10 | 35 | 47+ |
| Regeln | 10 | 25+ | 50+ |
| Agenten | — | 7 | 7+ NanoBot |
| Provider | — | 8 | 15+ |
| Tests | — | — | 59+ (TestCafe) |
| Workflows | — | 19 | 50+ |
| Skills | — | 5 | 15+ |
| Issues | — | — | 26+ |

---

> **📌 Version:** V3 Next Gen Full Stack (v3.0.0)
> **🚦 Status:** 🟢 VERBINDLICH
> **✨ DkZ devkitz** — „Vorausschauend. Direkt. Klar. Innovativ."
