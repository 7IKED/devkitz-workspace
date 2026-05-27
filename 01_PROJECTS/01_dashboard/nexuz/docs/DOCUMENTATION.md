# 📋 DkZ Workflow Process Board — Dokumentation

> Version 1.0 · 2026-03-08

---

## Übersicht

Das **Workflow Process Board** ist ein Kanban-basiertes Prozess-Tracking-Dashboard im DkZ-Ökosystem. Es bietet Echtzeit-Überwachung aller aktiven Workflows mit visuellen Reports, Mindmaps und Multi-Target-Export.

**Standort:** `01_PROJECTS/01_dashboard/nexuz/workflow-board.html`  
**Zugang:** NEXUZ² Command Center → Header → „📋 Workflow Board"

---

## Bedienung

### 1. Kanban Board
Das Board zeigt alle Prozesse in 4 Spalten:

| Spalte | Bedeutung |
|--------|-----------|
| 📥 **Queue** | Wartend auf Ausführung |
| ⚡ **Running** | Aktuell aktiv |
| ✅ **Done** | Erfolgreich abgeschlossen |
| ❌ **Failed** | Fehlgeschlagen |

### 2. Filter (linke Sidebar)
- **Status:** Alle / Running / Queue / Done / Failed
- **Priorität:** Alle / Hoch (🔴) / Mittel (🟡) / Niedrig (🔵)
- **Agent:** Alle / PicoClaw / Gemini / AutoPilot

### 3. Hover-Report (rechte Seite)
Fahre mit der Maus über eine Prozesskarte. Das Panel rechts zeigt:

- **🧠 Mindmap** — SVG-Darstellung der Prozess-Struktur
- **📊 Fortschritt** — Animierte Balken pro Step mit %-Werten
- **📁 Ordnerstruktur** — File-Tree mit `NEW` / `MOD` / `DEL` Tags
- **📋 Prozess-Plan** — Zeitliche Abfolge mit Status-Dots

### 4. Detail-Modal (Click)
Klicke auf eine Prozesskarte für den vollständigen Report:

**Toolbar:**
| Button | Funktion |
|--------|----------|
| ✕ | Fenster schließen |
| 📋 | Kompletten MD-Report kopieren |
| 🏠 | Zurück zu NEXUZ² Home |

**Inhalt:**
- Gesamtfortschritt mit animiertem Balken
- 2×2 Grid: Mindmap + Steps + Files + Plan
- Build-Zusammenfassung mit Tags und Statistiken

### 5. Download / Export
Am unteren Rand des Modals:

| Button | Ziel | Methode |
|--------|------|---------|
| 🖥️ Desktop | Downloads-Ordner | Browser-Download |
| 📁 Dokumente | Downloads-Ordner | Browser-Download |
| ☁️ Nextcloud | Nextcloud Server | API (vorbereitet) |
| 🌐 Apache | Apache Server | API (vorbereitet) |
| 📁 Drive | Google Drive | API (vorbereitet) |

**Dateiname:** `_[projekt-id]_step[N].md`  
Beispiel: `_seo-audit_step2.md` (2 von 5 Steps erledigt)

---

## Tastaturkürzel

| Taste | Aktion |
|-------|--------|
| `ESC` | Modal schließen |
| Klick außerhalb | Modal schließen |

---

## Prozesskarten

Jede Karte zeigt:
- **Agent-Icon** mit farbigem Hintergrund
- **Prozessname** + Agent-Bezeichnung
- **Fortschrittsbalken** mit % und Dauer
- **Tags** (z.B. `seo`, `audit`, `metrics`)
- **Startzeit** mit Uhr-Icon
- **Prioritäts-Indikator** (farbige linke Border)

---

## MD-Report Format

Der exportierte Markdown-Report enthält:

```markdown
# Prozessname

> **Agent:** Gemini 💎
> **Status:** RUNNING
> **Fortschritt:** 62%
> **Priorität:** HIGH

## Gesamtfortschritt
███████████████████░░░░░░░░░░░░ 62%

## 🧠 Mindmap
(ASCII Baum-Darstellung)

## 📊 Fortschritt
(Tabelle mit Steps, Status, Bars)

## 📁 Ordnerstruktur
(File-Tree in Code-Block)

## 📋 Prozess-Plan
(Nummerierte Phasen mit Emojis)
```

---

## Technische Details

| Eigenschaft | Wert |
|-------------|------|
| Typ | Single-File HTML (CSS + JS inline) |
| Dependencies | Google Fonts (Inter, JetBrains Mono) |
| Framework | Vanilla JS |
| Rendering | DOM-based Kanban + SVG Mindmaps |
| State | In-memory (PROCESSES Array) |
| Bundle | ~90KB |

---

## Integration

### NEXUZ² Command Center
- Header-Link: „📋 Workflow Board"
- Zurück-Button: „← NEXUZ²"

### OpenClaw
- Registriert in `picoclaw_knowledge.py` Memory
- Task-IDs können mit OpenClaw Dispatcher synchronisiert werden

### Playbook Runner
- Board kann Playbook-Ausführungen als Prozesskarten anzeigen
- Status-Updates via Event-Bus (geplant)

---

*Dokumentation v1.0 · 2026-03-08 · DkZ Workflow Process Board*
