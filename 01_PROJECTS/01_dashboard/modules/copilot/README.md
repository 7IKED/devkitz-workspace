# 🤖 DkZ Copilot™ Hermes v3

> **Der zentrale KI-Assistent des DEVKiTZ™ Ökosystems**

---

## 🎯 Überblick

DkZ Copilot™ Hermes ist das Herzstück des DEVKiTZ™ Ecosystems — ein Multi-LLM Chat-Assistent mit **32 Providern**, Dot-Commands, Iceberg Block Builder und vollständiger Integration in alle 154 Module.

### Key Features

| Feature | Beschreibung |
|:--------|:-------------|
| 🌐 **32 LLM Provider** | Cloud (GPT-4, Claude, Gemini), Free (Blackbox, MiniMax, Kimi), VPS (Ollama, LM Studio), Local |
| 💬 **Dot-Commands** | `.help` `.skills` `.grill` `.clear` `.model` `.export` `.iceberg` `.agents` |
| 🧊 **Iceberg Builder** | Prompt-Blöcke erstellen und katalogisieren |
| 📊 **Agent Monitor** | Echtzeit-Status aller BMAD™ Agenten |
| 💾 **Chat Persistenz** | JSON-Logs mit localStorage + Export |
| 🎨 **Markdown Rendering** | Syntax Highlighting, Code-Blöcke, Tabellen |

---

## 🚀 Quick Start

```html
<!-- In jedem Modul einbinden -->
<script src="../shared/dkz-copilot.js"></script>
```

### Dot-Commands

```
.help          — Alle Commands anzeigen
.skills        — Verfügbare Skills auflisten
.grill         — Grill-Modus aktivieren (Socratic Q&A)
.model gpt-4   — LLM-Provider wechseln
.export json   — Chat als JSON exportieren
.iceberg       — Iceberg Block Builder öffnen
.clear         — Chat leeren
.agents        — BMAD™ Agenten-Status
```

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────┐
│           DkZ Copilot™ Hermes v3        │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Chat UI  │  │ Provider │  │ Skills│ │
│  │ Markdown │  │ Gateway  │  │ Engine│ │
│  │ History  │  │ 32 LLMs  │  │ .cmds │ │
│  └──────────┘  └──────────┘  └───────┘ │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Iceberg  │  │  Agent   │  │ Chat  │ │
│  │ Builder  │  │ Monitor  │  │ Logs  │ │
│  └──────────┘  └──────────┘  └───────┘ │
└─────────────────────────────────────────┘
```

---

## 🔌 LLM Provider (32)

### ☁️ Cloud Provider
- OpenAI (GPT-4o, GPT-4, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- Google (Gemini 2.0 Flash, Gemini Pro)
- xAI (Grok-4.3)
- Mistral (Mistral Large, Codestral)
- Cohere (Command R+)
- OpenRouter (200+ Modelle)

### 🆓 Free Provider (kein API-Key)
- Blackbox AI (MiniMax, Kimi aktiviert)
- Cerebras (Llama 3.3 70B)
- Fireworks AI
- Together AI
- Groq (Llama 3.1)
- Puter Cloud

### 🖥️ VPS Provider
- Ollama (Self-Hosted)
- LM Studio
- vLLM
- LocalAI

---

## 📁 Dateistruktur

```
copilot/
├── index.html          # Haupt-UI
├── dkz-copilot.js      # Core Engine (shared)
├── providers/          # LLM Provider Configs
│   ├── openai.js
│   ├── anthropic.js
│   ├── blackbox.js
│   └── ...
├── skills/             # Skill Definitions
│   ├── grill.js
│   ├── iceberg.js
│   └── ...
└── README.md           # Diese Datei
```

---

## ⚙️ Konfiguration

```javascript
// Provider wechseln
DkzCopilot.setProvider('blackbox-minimax');

// System Prompt setzen
DkzCopilot.setSystemPrompt('Du bist ein Coding-Experte...');

// Temperature anpassen
DkzCopilot.setTemperature(0.7);
```

---

## 🔒 Sicherheit

- ✅ `esc()` bei jedem User-Input (XSS-Schutz)
- ✅ Kein `eval()` — niemals
- ✅ API-Keys nur in localStorage (nie im Code)
- ✅ Rate-Limiting pro Provider
- ✅ Content Security Policy kompatibel

---

## 📊 Metriken

| Metrik | Wert |
|:-------|:-----|
| Lines of Code | ~4.200 |
| Provider | 32 |
| Dot-Commands | 12 |
| Skills | 8 |
| Chat-Logs | JSON + localStorage |

---

## 📋 Changelog

### v3.0 (2026-06)
- 32 LLM Provider
- Blackbox AI mit MiniMax + Kimi
- Iceberg Block Builder
- Agent Monitor Dashboard
- Dot-Command System

### v2.0 (2026-04)
- Multi-Provider Gateway
- Markdown Rendering
- Chat History

### v1.0 (2026-02)
- Erste Version mit OpenRouter

---

*DEVKiTZ™ · DkZ Copilot™ Hermes · Made with ❤️ by 777*
