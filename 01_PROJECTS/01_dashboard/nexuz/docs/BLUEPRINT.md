# 📋 DkZ Workflow Process Board — BLUEPRINT v1.0

> Kanban-basiertes Prozess-Tracking mit Live-Reports, Mindmaps und Multi-Target Export

---

## 🎯 Vision

Ein visuelles Echtzeit-Dashboard zur Überwachung aller aktiven Prozesse im DkZ-Ökosystem. Hover-aktivierte Reports mit Mindmaps, Fortschrittsbalken, Ordnerstrukturen und Prozess-Plänen. Klick öffnet Detail-Modal mit Multi-Target-Download (Desktop, Dokumente, Nextcloud, Apache, Drive).

---

## 🏗️ Systemarchitektur

```
┌─────────────────────────────────────────────────────────────┐
│                   📋 WORKFLOW PROCESS BOARD                  │
│              DkZ Kanban · Prozess-Tracking · Reports         │
├────────────┬──────────────────────────┬─────────────────────┤
│ 🔍 Filter │     📋 Kanban Board      │   📊 Report Panel   │
│ Sidebar    │   4 Spalten / N Karten   │   Hover-aktiviert   │
│            │                          │                     │
│ Status     │ 📥 Queue    ⚡ Running   │ 🧠 Mindmap (SVG)   │
│ Priorität  │ ✅ Done     ❌ Failed    │ 📊 Fortschritt      │
│ Agent      │                          │ 📁 Datei-Baum       │
│ Stats      │ [Prozesskarte]           │ 📋 Prozess-Plan     │
├────────────┴──────────────────────────┴─────────────────────┤
│                    🖱️ CLICK → DETAIL MODAL                   │
│  ✕ Close · 📋 Copy · 🏠 Home · Download-Bar (5 Targets)    │
├─────────┬─────────┬──────────┬──────────┬──────────────────┤
│ 🖥️      │ 📁       │ ☁️       │ 🌐       │ 📁               │
│ Desktop │ Docs    │ Next-   │ Apache  │ Google           │
│         │         │ cloud   │ Server  │ Drive            │
└─────────┴─────────┴──────────┴──────────┴──────────────────┘
```

---

## 📦 Features

### 1. Kanban Board (Mitte)
| Feature | Beschreibung |
|---------|-------------|
| 4 Spalten | Queue → Running → Done → Failed |
| Prozesskarten | Name, Agent, Fortschrittsbalken, Tags, Zeit |
| Prioritäts-Indikator | Farbige linke Border (rot/gelb/blau) |
| Filter-Integration | Echtzeit-Filterung nach Status/Priorität/Agent |

### 2. Hover-Report Panel (Rechts)
| Sektion | Darstellung |
|---------|-------------|
| 🧠 Mindmap | SVG mit Center → Branches → Children Nodes |
| 📊 Fortschritt | Multi-Step mit animierten Balken + % |
| 📁 Ordnerstruktur | Baum mit Icons, Größen, Status (NEW/MOD/DEL) |
| 📋 Prozess-Plan | Timeline mit farbigen Dots je Phase |

### 3. Click-Modal (Overlay)
| Element | Funktion |
|---------|----------|
| ✕ Button | Schließen (oben links) |
| 📋 Copy | Vollständigen MD-Report in Zwischenablage |
| 🏠 Home | Zurück zu NEXUZ² Command Center |
| ESC Key | Schließen per Tastatur |
| Backdrop Click | Schließen bei Klick außerhalb |

### 4. Download-Bar (Multi-Target)
| Ziel | Icon | Methode |
|------|------|---------|
| Desktop | 🖥️ | Browser-Download |
| Dokumente | 📁 | Browser-Download |
| Nextcloud | ☁️ | API Upload (bereit) |
| Apache | 🌐 | API Upload (bereit) |
| Drive | 📁 | API Upload (bereit) |

**Dateiname-Format:** `_Projektname_stepN.md`  
Beispiel: `_seo-audit_step2.md`

### 5. MD-Report Export
Der generierte Markdown-Report enthält:
- Metadaten (Agent, Status, Fortschritt, Priorität)
- ASCII Fortschrittsbalken (`███████░░░ 70%`)
- ASCII Mindmap (Baum-Darstellung)
- Markdown-Tabelle mit Steps + Details
- File-Tree in Code-Block
- Nummerierter Prozess-Plan mit Emojis

---

## 🔗 Integration

### In NEXUZ²
- Nav-Link „📋 Workflow Board" im Header
- Zurück-Button „← NEXUZ²" im Board

### In OpenClaw
- Registriert als Dashboard-Modul
- PicoClaw Knowledge-Eintrag
- Kann als Frontend für echte Task-Dispatches dienen

### API-Anbindung (vorbereitet)
```
POST /api/nextcloud/upload   → Nextcloud WebDAV
POST /api/apache/upload      → Apache Server SCP/FTP
POST /api/drive/upload       → Google Drive API v3
```

---

## 🎨 Design System

| Token | Wert |
|-------|------|
| Background | `#06060b` |
| Card | `#0f0f18` |
| Border | `#1a1a2a` |
| Accent | `#fa1e4e` |
| Cyan | `#00e5ff` |
| Purple | `#a855f7` |
| Green | `#00ff88` |
| Font | Inter + JetBrains Mono |
| Effects | Glassmorphism, Pulse, Shine |

---

## 📁 Dateistruktur

```
01_PROJECTS/01_dashboard/nexuz/
├── index.html            ← NEXUZ² Command Center (+ Workflow Board Link)
├── module.json           ← Modul-Manifest
├── workflow-board.html   ← 📋 Workflow Process Board (NEU)
├── core/
│   └── registry.json     ← Backend Registry
├── landing/
│   └── index.html        ← Universal Landing Page
└── mcp/
    └── ...               ← Browser Extensions
```

---

## 🔄 Datenfluss

```
User öffnet Workflow Board
    → Kanban rendert 4 Spalten mit Prozesskarten
    → Filter-Sidebar zeigt Status/Priorität/Agent
    
User hovert über Karte
    → Report-Panel rechts zeigt:
        → SVG Mindmap (animierte Edges)
        → Multi-Step Progress Bars
        → File-Tree mit Status-Tags
        → Timeline Prozess-Plan
    
User klickt auf Karte
    → Detail-Modal öffnet (scale-Animation)
    → 2x2 Grid: Mindmap + Steps + Files + Plan
    → Build-Summary mit Tags/Prio/Dateien

User klickt Download
    → Filename: _projektname_stepN.md
    → Desktop/Docs: Browser-Download
    → Nextcloud/Apache/Drive: API-Call + Backup-Download
    → Toast-Notification bestätigt
```

---

*Blueprint v1.0 · 2026-03-08 · DkZ Workflow Process Board*
