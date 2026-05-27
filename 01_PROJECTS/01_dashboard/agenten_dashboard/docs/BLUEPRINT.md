# 🧠 SECOND BRAIN – Blaupause / Blueprint v1.0

> Komplettes KI-Team-Management-System · Inspiriert von OpenClaw Mission Control

---

## 🎯 Vision

Ein modulares, selbstverwaltendes AI-Agent-Enterprise-System, das wie ein echtes Unternehmen funktioniert – mit Abteilungen, Budgets, Zugangskontrolle und vollständigem Logging.

---

## 🏗️ Systemarchitektur

```
┌─────────────────────────────────────────────────────┐
│                 🧠 SECOND BRAIN CORE                │
│          Event Bus · Shared State · Auth             │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ 🎯       │ ✅       │ 💬       │ 🏢      │ 📖      │
│ Mission  │ Tasks    │ Chat     │ Org      │ Playbook│
│ Control  │ Board    │ Agent    │ Chart    │ Templ.  │
├──────────┼──────────┼──────────┼──────────┼─────────┤
│ 🏠       │ 🧠       │ 💰       │ 🚦      │ 📋      │
│ Office   │ Memory   │ Costs    │ Control  │ Logs    │
│ View     │ Store    │ Track    │ Panel    │ Analyt. │
├──────────┴──────────┴──────────┴──────────┴─────────┤
│               🔌 Integration Layer                   │
│    OpenClaw · Supabase · GitHub · Slack · LLM APIs   │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Module (10 Tabs)

### Kern-Module (Original)
| # | Modul | Beschreibung |
|---|-------|-------------|
| 1 | 🎯 Mission Control | Live-Metriken, Agent-Status, Activity Feed |
| 2 | ✅ Tasks | Kanban-Board, Prioritäten, Filter |
| 3 | 💬 Chat | Agent-zu-Agent / User-zu-Agent Chat |
| 4 | 🏢 Org | Organisationsstruktur, Hierarchie |
| 5 | 🏠 Office | Pixel-Art Büro, Live Agent Positions |
| 6 | 🧠 Memory | Identities, Prompts, Operating Rules |

### Erweiterte Module (V2)
| # | Modul | Beschreibung |
|---|-------|-------------|
| 7 | 📖 Playbook | Templates, Workflows, Aufbaupläne |
| 8 | 💰 Costs | LLM-Preise, Budgets, Kostenvorlagen |
| 9 | 🚦 Control | Ampel-System, YOLO/Plan, Internet-Zugang |
| 10 | 📋 Logs | Zentrale Logs, CSV Export, Analytics |

---

## 🤖 Agent-Team (12 Agenten)

| Agent | Rolle | Abteilung | Status |
|-------|-------|-----------|--------|
| JARVIS | Chief AI Officer | Executive | 🟢 |
| ATLAS | Senior Research Analyst | Research | 🟢 |
| SCRIBE | Content Strategist | Content | 🟢 |
| NEXUS | Lead Developer | Development | 🟢 |
| NOVA | Creative Director | Creative | 🟢 |
| AXIOM | Sales Intelligence | Sales | 🟢 |
| ECHO | Communications Lead | Content | 🟢 |
| CIPHER | Security Analyst | Development | 🟡 |
| ORBIT | Data Engineer | Research | 🟡 |
| SAGE | Strategy Advisor | Executive | 🟡 |
| FORGE | Infrastructure Lead | Development | 🟡 |
| LYRA | UX Researcher | Creative | 🟡 |

---

## 🚦 Steuerungssystem

### Internet-Ampel (pro Agent + Global)
- 🔴 **AUS** – Kein Internetzugang, komplett offline
- 🟡 **NACHFRAGEN** – Agent fragt vor jeder Anfrage um Erlaubnis
- 🟢 **OPEN NET** – Voller Zugang, keine Einschränkungen

### Ausführungsmodus (pro Agent + Global)
- 🔥 **YOLO** – Alles sofort, ohne Rückfrage, wird rot geloggt
- 📋 **PLAN** – Plan erstellen → Genehmigung → Schritt für Schritt

---

## 💰 LLM-Kostenstruktur

### Empfohlene Modelle nach Aufgabe
| Aufgabe | Empfohlenes Modell | Budget/Task |
|---------|-------------------|-------------|
| Research & Analyse | Claude 3.5 Sonnet | $0.50 |
| Code & Development | GPT-4o | $1.00 |
| Content Creation | Claude 3.5 Sonnet | $0.30 |
| Creative & Design | GPT-4o | $0.40 |
| Data & Pipeline | Gemini 2.0 Flash | $0.20 |
| Strategie & Planung | Claude 3 Opus | $0.80 |
| Security & Audit | o3-mini | $0.60 |
| Quick Tasks | Gemini 2.0 Flash | $0.05 |

---

## 🔄 Datenfluss

```
Agent startet Task
    → Task Board updated
    → Log Engine schreibt Event
    → Cost Tracker loggt LLM Call
    → Budget Manager prüft Limit
        → OK: Weiter
        → Überschritten: Ampel ROT → Agent pausiert

Internet-Anfrage
    → Ampel prüft Status
        → ROT: Blockiert
        → GELB: User bekommt Prompt (Ja/Nein)
        → GRÜN: Sofort durchlassen

YOLO Modus
    → Aufgabe sofort ausgeführt
    → Alle Steps rot markiert im Log
    → Zusammenfassung am Ende

PLAN Modus
    → Plan generiert und angezeigt
    → User genehmigt einzeln oder gesamt
    → Sequenzielle Abarbeitung
    → Jeder Step einzeln geloggt
```

---

## 📁 Dateistruktur

```
agenten_dashboard/
├── index.html          ← Haupt-Dashboard (10 Tabs)
├── styles-v2.css       ← Styles für erweiterte Module
├── tabs-v2.js          ← JS für Playbook, Costs, Control, Logs
├── updater.bat         ← Start-Skript (Server + Browser)
├── README.md           ← Kurzanleitung
└── docs/
    ├── BLUEPRINT.md            ← Diese Datei
    ├── IMPLEMENTATION_PLAN.md  ← Phasen & Meilensteine
    ├── HANDBOOK.md             ← Benutzerhandbuch
    └── USE_CASES.md            ← Anwendungsbeispiele
```

---

*Version 1.0 · 2026-03-08 · SECOND BRAIN / Mission Control*
