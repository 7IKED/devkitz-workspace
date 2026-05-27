# ⚡ DkZ Dashboard

> **Version:** v0.01.1_01 | **Module:** 56 | **Dashboards:** 14 | **Status:** AKTIV

Das DkZ Dashboard ist das zentrale Kontroll-Interface des DEVKiTZ Ökosystems — 56 Module für Development, AI, Content, Design und System-Management.

---

## 🚀 Quick Start

```bash
# Klonen
git clone https://github.com/BAZE2/devkitz-dashboard.git
cd devkitz-dashboard

# Direkt öffnen (kein Build nötig!)
open hub/index.html
# oder mit Live Server:
npx serve .
```

> **Kein Build-Prozess nötig.** Jedes Modul ist standalone HTML/CSS/JS.

---

## 📂 Struktur

```
devkitz-dashboard/
├── hub/              ← 🏠 Startseite mit Auto-Discovery
├── modules/          ← 56 eigenständige Module
│   ├── ruleboard/    ← 📜 Ecosystem Rules & Debug
│   ├── clipboard/    ← 📋 Clipboard Manager
│   ├── ai_chat/      ← 🤖 AI Chat Interface
│   └── ...           ← 53 weitere Module
├── shared/           ← 🔧 DkZ System Components
│   ├── dkz-eventbus.js    ← Cross-Module Bus
│   ├── dkz-console.js     ← Ctrl+K Console
│   ├── dkz-health.js      ← Ctrl+D Debug
│   └── dkz-shortcuts.js   ← Keyboard Shortcuts
├── BLAUPAUSE.md      ← 🏗️ Architecture Blueprint
├── REGISTRY.json     ← 🗂️ Module Registry
└── .coderabbit.yaml  ← 🐰 CodeRabbit Config
```

## 🎨 Design System

| Element | Wert |
|:---|:---|
| Accent | `#fa1e4e` |
| Background | `#0e0e10` |
| Font UI | Inter |
| Font Code | JetBrains Mono |
| Style | Glassmorphism + Dark |
| Icons | Emoji-basiert |

## ⌨️ Shortcuts

| Shortcut | Funktion |
|:---|:---|
| `Ctrl+K` | Universal Console |
| `Ctrl+D` | Debug Panel |
| `Ctrl+/` | Shortcut Help |
| `Ctrl+H` | → Hub |

## 📜 Regeln

Dieses Projekt folgt dem [DEVKiTZ REGELWERK](../REGELWERK.md) (20 Regeln, R0-R19).

- **R9:** Versionierung `vX.XX.X_XX`
- **R17:** ORDNER.ini in jedem Ordner
- **R19:** Abschluss-Analyse nach jedem Projekt

## 🤖 Copilot & CodeRabbit

- `.github/copilot-instructions.md` — Regeln für GitHub Copilot
- `.coderabbit.yaml` — Automatische Code-Reviews mit DkZ-Standards
- `.github/ISSUE_TEMPLATE/` — Bug, Feature, Debug Report Templates

## 📄 Lizenz

© DEVKiTZ™ 2026 — All Rights Reserved
