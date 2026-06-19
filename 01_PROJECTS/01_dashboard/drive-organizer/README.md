# 🧹 Drive Organizer – Jeff Su 5x99 System

> **Sofort aufgeräumt, intelligent sortiert.** Ein Google Apps Script das dein Google Drive in Sekunden aufräumt – inspiriert von [Jeff Su's 5x99 Ordner-System](https://www.youtube.com/watch?v=bB-338_ILQo).

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Google Apps Script](https://img.shields.io/badge/platform-Google%20Apps%20Script-yellow)

## 🎯 Was es macht

| Phase | Aktion | Ergebnis |
|---|---|---|
| **1️⃣ AUFRÄUMEN** | Fegt ALLE losen Dateien & Ordner in `[HELLO WORLD]` | Drive ist **sofort sauber** |
| **2️⃣ SORTIEREN** | Sortiert aus `[HELLO WORLD]` in die Jeff Su Struktur | Alles am **richtigen Platz** |
| **3️⃣ INVENTAR** | Erstellt ein Google Sheet mit allen Dateien | Volle **Übersicht** |

## 📁 Die 5x99 Ordnerstruktur

```
Google Drive/
├── 01_PROJECTS/        ← Aktive Projekte & Code
│   ├── 01_active/
│   ├── 02_templates/
│   ├── 03_shared/
│   └── 99_archived/
├── 02_RESEARCH/        ← Dokumente & Wissen
│   ├── 01_ai_agents/
│   ├── 02_tutorials/
│   ├── 03_frameworks/
│   ├── 04_blueprints/
│   ├── 05_notebooklm/
│   └── 99_archived/
├── 03_MEDIA/           ← Bilder, Video, Audio
│   ├── 01_images/
│   ├── 02_video/
│   ├── 03_audio/
│   ├── 04_ai_generated/
│   └── 99_archived/
├── 04_SYSTEM/          ← Configs, Scripts, Backups
│   ├── 01_configs/
│   ├── 02_scripts/
│   ├── 03_exports/
│   ├── 04_backups/
│   └── 99_archived/
├── [DEEPKEEP]/         ← 🔒 TRESOR – wird nie angefasst
└── [HELLO WORLD]/      ← Sammel-Ordner für Unsortiertes
```

## 🚀 Quick Start (3 Minuten)

### 1. Script installieren
1. Öffne [script.google.com](https://script.google.com)
2. **Neues Projekt** erstellen
3. Inhalt von [`organizer.gs`](organizer.gs) einfügen
4. Speichern (Strg+S)

### 2. Phase 1: Aufräumen
1. Wähle Funktion: `phase1_AUFRÄUMEN`
2. Klick **▶ Ausführen**
3. Google-Berechtigung erteilen
4. ✅ Dein Drive hat jetzt nur noch 6 saubere Ordner!

### 3. Phase 2: Sortieren
1. Wähle Funktion: `phase2_SORTIEREN`
2. Klick **▶ Ausführen**
3. ✅ Dateien werden intelligent in die Ordner sortiert!

### 4. Phase 3: Inventar (Optional)
1. Wähle Funktion: `phase3_INVENTAR`
2. ✅ Google Sheet mit allen Dateien + Zielordner

## 🧠 Sortier-Intelligenz

Das Script nutzt **zwei Ebenen** der Erkennung:

### 1. Name-basiert (höhere Priorität)
| Keyword | Ziel-Ordner |
|---|---|
| dashboard, panel, app, builder | `01_PROJECTS/01_active` |
| agent, prompt, skill, workflow | `02_RESEARCH/01_ai_agents` |
| blueprint, blaupause | `02_RESEARCH/04_blueprints` |
| notebooklm, notebook | `02_RESEARCH/05_notebooklm` |
| backup, export | `04_SYSTEM/04_backups` |

### 2. MIME-Type basiert
| Dateityp | Ziel-Ordner |
|---|---|
| Google Docs | `02_RESEARCH` |
| Google Sheets | `04_SYSTEM/03_exports` |
| PDF | `02_RESEARCH` |
| Bilder | `03_MEDIA/01_images` |
| Videos | `03_MEDIA/02_video` |
| ZIP/RAR | `04_SYSTEM/04_backups` |

## ⚙️ Config Dashboard

Öffne [`dashboard.html`](dashboard.html) für ein visuelles Konfigurationspanel:
- Ordner-Struktur anpassen
- Sortier-Regeln bearbeiten
- Live-Preview der Zuordnung
- Export als Apps Script Config

## 🔄 Auto-Update

Das Script prüft automatisch auf Updates von diesem GitHub Repo:

```javascript
// In Google Apps Script triggern:
// Bearbeiten → Aktuelle Projekt-Trigger → Timer (wöchentlich)
```

## 📜 Lizenz

MIT License – Frei nutzbar, auch kommerziell.

---

**Made with 🧡 by DEVKiTZ | Inspiriert von Jeff Su**
