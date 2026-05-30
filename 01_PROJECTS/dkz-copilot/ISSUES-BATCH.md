# GitHub Issues - Session 2026-05-30

> 8 Issues fuer alle File-Changes dieser Session
> Commits: d111ed7d, c21a23c6, a7e8d276, 99658ba3

---

## Issue 1: feat(copilot): Gateway v2 + Landing Page + EventLog + AutoSync

**Commit:** d111ed7d
**Labels:** dkz-copilot, type-feature, prio-p1

### Dateien:
- `gateway.py` (NEU) - FastAPI Backend Port 3060
- `landing.html` (NEU) - Standalone mit Webhook Trigger
- dkz-eventlog.js Integration
- AutoSync FileWatcher
- HMAC Webhook-Verifizierung
- Ticket-System dkz-XX-NNN

---

## Issue 2: feat(copilot): Graphify React Panel + i18n DE/EN + Contrast Mode

**Commit:** c21a23c6
**Labels:** dkz-copilot, dkz-graphify, type-feature, prio-p1

### Dateien:
- `GraphifyPanel.jsx` (NEU) - React Canvas Force-Layout
- `App.jsx` - i18n DE/EN Toggle, Contrast Mode, Graphify Tab
- `index.css` - Hyperreal Glassmorphism, High-Contrast CSS
- `TICKETS.md` (NEU) - Copilot Queue

### Features:
- Multi-Source: Playbook + GitNexus + MiroFish + OpenHumans + OpenHands
- Stats Dashboard: Kategorien, Quellen, Ebenen
- Source-Indicators im Canvas
- Chat mit Source-Kontext

---

## Issue 3: feat(notepad): Keep-to-Drive Sync + DkZ Tags + Takeout Import

**Commit:** a7e8d276
**Labels:** type-feature, prio-p2

### Dateien:
- `keep-to-drive.gs` (NEU) - Google Apps Script
- `sync-notes.ps1` (NEU) - PowerShell Sync
- `dkz-tags.json` - 26 DkZ Tags
- `github-labels.json` - GitHub Labels Sync
- 482+ Takeout-Dateien importiert

---

## Issue 4: feat(dashboard): 4-Quellen Ring-Chart + Morph Reader + TTS

**Commit:** 99658ba3
**Labels:** dkz-copilot, dkz-dashboard, type-feature, prio-p1

### Dateien:
- `DashboardPanel.jsx` - Komplett neu geschrieben

### Features:
- 4-Quellen Conic-Gradient Ring-Chart
- Morph Reader Dauermodus (persistent)
- TTS Vorlesen: Einzel + Alle + Auto
- Module Quick-Access Grid (12 Module)
- Tagesplan mit Status-Tracking
- Health Panel + News Feed

---

## Issue 5: docs(agents): AGENTS.md auf 51 Agenten erweitert

**Labels:** type-task, prio-p2

### Neue Agenten (42-51):
- DkZ CoPilot Builder
- DkZ Issue Fixer
- DkZ LLMs Builder
- DkZ Module Builder v1 + v2
- DkZ Module Scaffold
- Git Cleanup Agent
- Git Housekeeping
- GitHub README Pusher
- React Panel Builder

---

## Issue 6: fix(health): NanoChat Bridge Port 3040 offline

**Labels:** type-bug, prio-p1, status-open

### Problem:
NanoChat Bridge auf Port 3040 antwortet nicht.
Chat-Funktionen in Graphify und anderen Modulen eingeschraenkt.

### Fix:
Neustart mit dkz-opencode-start.bat oder manuell Node starten.

---

## Issue 7: feat(infra): Gateway v2 auf VPS deployen

**Labels:** dkz-copilot, type-task, prio-p0

### TODO:
1. SSH-Verbindung zu KVM8 pruefen
2. Python Dependencies installieren
3. gateway.py nach /opt/dkz-copilot/ kopieren
4. systemd Service einrichten
5. Nginx Reverse Proxy
6. SSL mit Certbot

---

## Issue 8: feat(keep): Google Apps Script deployen + Keep loeschen

**Labels:** type-task, prio-p2

### TODO:
1. script.google.com oeffnen
2. keep-to-drive.gs einfuegen
3. Google Keep API Service aktivieren
4. fullPipeline ausfuehren
5. Ergebnis pruefen
6. deleteAllKeepNotes ausfuehren
7. Trigger: syncKeepToDrive alle 15 Min
