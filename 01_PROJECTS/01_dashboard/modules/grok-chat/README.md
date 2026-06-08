# 🧠 Grok Chat

> **xAI Grok Integration mit Reasoning Mode und Projects**

---

## 🎯 Überblick

Heavy xAI Grok Chat-Client — vollwertige Integration von Grok (xAI) mit Chat-History, Projekt-Verwaltung und Reasoning Mode. Optimiert für Code-Analyse, wissenschaftliche Fragen und kreative Aufgaben.

### Key Features

| Feature | Beschreibung |
|:--------|:-------------|
| 🧠 **Grok-4.3** | Neuestes xAI Modell mit erweitertem Reasoning |
| 💬 **Chat-History** | Persistente Gespräche mit localStorage |
| 📁 **Projects** | Chats nach Projekten organisieren |
| 🔍 **Reasoning Mode** | Step-by-Step Denkprozess sichtbar |
| 📋 **Code Highlighting** | Syntax Highlighting für 50+ Sprachen |
| 📤 **Export** | Chat als JSON oder Markdown exportieren |

---

## 🚀 Quick Start

1. Öffne `grok-chat/index.html` im Dashboard
2. API-Key eingeben (oder Free-Tier nutzen)
3. Chat starten — Grok antwortet mit Reasoning

---

## 🏗️ Architektur

```
┌───────────────────────────────┐
│        Grok Chat UI           │
├───────────────────────────────┤
│  ┌─────────┐  ┌────────────┐ │
│  │ Chat    │  │ Projects   │ │
│  │ Panel   │  │ Manager    │ │
│  └─────────┘  └────────────┘ │
├───────────────────────────────┤
│  ┌─────────┐  ┌────────────┐ │
│  │ xAI API │  │ Reasoning  │ │
│  │ Client  │  │ Renderer   │ │
│  └─────────┘  └────────────┘ │
└───────────────────────────────┘
```

---

## ⚙️ Konfiguration

```javascript
// Im localStorage
{
  "grok_api_key": "xai-...",
  "grok_model": "grok-4.3",
  "grok_temperature": 0.7,
  "grok_reasoning": true
}
```

---

## 📁 Dateistruktur

```
grok-chat/
├── index.html      # Chat-UI
├── grok-chat.js    # Core Logic
├── styles.css      # DkZ Design System
└── README.md       # Diese Datei
```

---

## 🔒 Sicherheit

- ✅ `esc()` bei jedem User-Input
- ✅ API-Key nur in localStorage
- ✅ Kein `eval()` — niemals
- ✅ CORS-kompatibel

---

## 📋 Changelog

### v1.0 (2026-06)
- xAI Grok-4.3 Integration
- Chat History mit Projects
- Reasoning Mode
- Markdown + Code Rendering

---

*DEVKiTZ™ · Grok Chat · Made with ❤️ by 777*
