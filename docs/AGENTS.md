# 🤖 A2A Agent Cards — DEVKiTZ™

> Agent-to-Agent Protokoll Registry · 12 Agenten · Stand: 2026-05-10

---

## 📋 Agent-Übersicht

| # | Agent | ID | Port | Protokoll | Status |
|:--|:------|:---|:-----|:----------|:-------|
| 1 | 🎯 James™ | `james-evaluator` | 9880 | MCP + A2A | 🟢 |
| 2 | 🗣️ Wispe™ | `wispe-voice` | 8899 | HTTP + WS | 🟢 |
| 3 | 📋 DkZ PM™ | `dkz-pm` | — | A2A | 🟢 |
| 4 | 🏗️ DkZ Architekt™ | `dkz-architekt` | — | A2A | 🟢 |
| 5 | 👨‍💻 DkZ Developer™ | `dkz-developer` | — | A2A + MCP | 🟢 |
| 6 | 🔍 DkZ Reviewer™ | `dkz-reviewer` | — | A2A | 🟢 |
| 7 | 🧪 DkZ Tester™ | `dkz-tester` | — | A2A | 🟢 |
| 8 | 📚 DkZ Dokumentar™ | `dkz-dokumentar` | — | A2A | 🟢 |
| 9 | 🤖 NanoBot | `nanobot` | 9890 | Internal + A2A | 🟢 |
| 10 | 💬 NanoChat | `nanochat` | 9891 | WebSocket | 🟢 |
| 11 | 🧠 Pi Agent | `pi-agent` | 9881 | MCP | 🟢 |
| 12 | 🔨 Builder Agent | `builder-agent` | 9882 | MCP | 🟢 |

---

## 🔄 Kommunikations-Architektur

```
┌─────────────────────────────────────────────────────┐
│                    NanoChat (WS :9891)               │
│         Agent-to-Agent Messaging Bus                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐│
│   │James™ │    │Wispe™ │    │  Pi   │    │Builder││
│   │:9880  │    │:8899  │    │:9881  │    │:9882  ││
│   └───┬───┘    └───┬───┘    └───┬───┘    └───┬───┘│
│       │            │            │            │     │
│       └────────────┴─────┬──────┴────────────┘     │
│                          │                         │
│                    ┌─────▼─────┐                   │
│                    │  NanoBot  │                   │
│                    │  :9890    │                   │
│                    │ Classifier│                   │
│                    │ + Router  │                   │
│                    └─────┬─────┘                   │
│                          │                         │
│              ┌───────────┼───────────┐             │
│              ▼           ▼           ▼             │
│         ┌────────┐ ┌────────┐ ┌──────────┐        │
│         │  PM™   │ │  Dev™  │ │ Tester™  │        │
│         └────────┘ └────────┘ └──────────┘        │
│         ┌────────┐ ┌────────┐ ┌──────────┐        │
│         │Archit™ │ │Review™ │ │  Doku™   │        │
│         └────────┘ └────────┘ └──────────┘        │
└─────────────────────────────────────────────────────┘
```

---

## 📨 NanoChat Message-Format

```json
{
  "id": "msg-uuid-here",
  "type": "send | broadcast | subscribe | history",
  "from": "james-evaluator",
  "to": "dkz-developer",
  "channel": "tasks",
  "payload": {
    "action": "review-complete",
    "score": 85,
    "feedback": "esc() fehlt in Zeile 42"
  },
  "timestamp": 1715339788000
}
```

### Channels

| Channel | Zweck | Wer hört zu |
|:--------|:------|:-----------|
| `general` | Allgemeine Nachrichten | Alle Agenten |
| `tasks` | Task-Zuweisung + Updates | Developer, Tester, PM |
| `alerts` | R24 ALARM, Fehler | James™, alle |
| `reviews` | Code-Review Ergebnisse | Developer, Reviewer |
| `deployments` | Build + Deploy Events | Alle |

---

## 🧠 NanoBot Classification Rules

```javascript
// Input → Agent Mapping
const RULES = {
  developer:  /code|fix|build|debug|implement|create|refactor/i,
  tester:     /test|check|verify|audit|stress|testcafe/i,
  james:      /review|score|eval|rate|improve|guard/i,
  researcher: /search|research|find|analyze|compare|deep/i,
  dokumentar: /doc|readme|wiki|changelog|write|playbook/i,
  pm:         /spec|story|requirement|brief|plan|prd/i,
  architekt:  /architecture|design|structure|stack|blueprint/i
};

// Fallback: 'general' wenn kein Match
```

---

## 🔑 A2A Request/Response

### Request

```json
POST /agents/james
Content-Type: application/json
X-DKZ-Key: your-api-key

{
  "jsonrpc": "2.0",
  "method": "evaluate",
  "params": {
    "prompt": "Erstelle ein Dashboard-Modul für Trading",
    "mode": "score"
  },
  "id": "req-001"
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "score": 72,
    "feedback": "Gut strukturiert, aber fehlende Akzeptanzkriterien",
    "improvements": [
      "Akzeptanzkriterien definieren",
      "Tech-Stack spezifizieren",
      "Testbare Requirements formulieren"
    ]
  },
  "id": "req-001"
}
```

---

## 🔧 Agent-Card Schema (Jeder Agent MUSS)

```json
{
  "name": "Agent Name™",
  "id": "kebab-case-id",
  "version": "semver",
  "description": "Was der Agent tut",
  "capabilities": ["verb1", "verb2"],
  "protocols": ["a2a", "mcp", "http", "websocket"],
  "endpoint": "http://localhost:PORT",
  "port": 9999,
  "auth": { "type": "api-key | internal | none" },
  "input_schema": { "type": "object", "properties": {} },
  "output_schema": { "type": "object", "properties": {} },
  "tags": ["tag1", "tag2"],
  "status": "active | inactive | deprecated"
}
```

---

## 📊 Port-Registry

| Port | Service | Protokoll |
|:-----|:--------|:----------|
| 8899 | Wispe™ (HTTP Server) | HTTP |
| 9880 | ONTHERUN™ MCP | MCP + HTTP |
| 9881 | Pi Agent | MCP |
| 9882 | Builder Agent | MCP |
| 9890 | NanoBot Registry | HTTP |
| 9891 | NanoChat WebSocket | WS |
| 3040 | NEXUZ™ Gateway | REST |
| 8188 | ComfyUI | HTTP |

---

> **📌 Version:** v3.0.0
> **📂 Datei:** `docs/agent-cards.json` (maschinenlesbar)
> **✨ DkZ devkitz** — „Vorausschauend. Direkt. Klar. Innovativ."
