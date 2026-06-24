# DkZ Copilot Desktop v3 — Erweiterungs-Roadmap

## ASCII Dependency Mindmap

```
┌─────────────────────────────────────────────────────────────┐
│                 DkZ Copilot Desktop v3 ++                    │
│                  Erweiterungs-Roadmap                        │
└─────────────────────────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│  PHASE 1            │ │  PHASE 2            │ │  PHASE 3            │
│  James v4 Guardian  │ │  Hermes Chat v2     │ │  JAMEZ™ Modules     │
│  Core               │ │  Deep Integration   │ │  Expansion          │
└─────────┬───────────┘ └──────────┬──────────┘ └──────────┬──────────┘
          │                        │                        │
          │                        │                        │
          └──────────┬─────────────┘                        │
                     │                                      │
                     ▼                                      │
          ┌─────────────────────┐                            │
          │  PHASE 4            │                            │
          │  Tray + Shortcuts   │◄───────────────────────────┘
          │  Erweitert          │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  PHASE 5            │
          │  Build + Deployment │
          │  (immer zuletzt!)   │
          └─────────────────────┘

PHASE 1 ── James v4 ──→ PHASE 2 ── Hermes ──→ PHASE 3 ── JAMEZ ──→ PHASE 4 ── Tray ──→ PHASE 5 ── Build
  (Health-IPC)         (API + History)      (Tabs + Charts)     (Shortcuts)         (Installer)
```

---

## PHASE 1: James v4 Guardian Integration (Basis)

**Ziel:** Echte James-Guardian-Health-API statt lokaler Mock-Responses. Automatische Diagnose + Ampel-Steuerung.

### Tasks

- [ ] **T1.1: James API-Client in main.js**
  - Neues Modul `james-client.js` mit fetch() zu `localhost:3040/api/v1/free-hub/cascade`
  - Regelmässiger Polling (alle 30s) für Ampel-Update
  - Response-Parsing: Health-Score → Ampel-Farbe (≥80% grün, ≥50% gelb, <50% rot)
  - Fallback bei Timeout: gelb mit "James unreachable"

- [ ] **T1.2: Automatic Health Check on Boot**
  - Beim App-Start: einmal James anpingen
  - Falls Antwort: grün + letzte Health-Meldung im Tooltip
  - Falls keine Antwort: gelb + "James offline"

- [ ] **T1.3: Deep-Diagnose-Tab in renderer**
  - Health-Tab in `ui/index.html` mit Echtzeit-Daten
  - CPU/RAM/Disk-Auslastung (via James oder node-os-utils)
  - Git-Status, letzte Commits, offene Issues
  - Agenten-Status (wer läuft, wer nicht)

- [ ] **T1.4: Notification-System ausbauen**
  - Bei Ampel-Wechsel rot → Desktop-Notification
  - Bei Service-Ausfall → automatische Warnung
  - Health-Check-Log in LocalStorage speichern

---

## PHASE 2: Hermes Chat Deep Integration

**Ziel:** Echte AI-API-Calls statt `mockChatResponse()`. Multi-Modell-Support, Chat History, Streaming.

### Tasks

- [ ] **T2.1: OpenAI-kompatibler API-Client**
  - Neues Modul `hermes-client.js` in `ui/`
  - Konfigurierbarer Endpoint (default: OLLAMA `http://localhost:11434/v1`)
  - Alternativ: OpenRouter, LM Studio, Puter
  - `POST /v1/chat/completions` mit Streaming (`stream: true`)

- [ ] **T2.2: Settings-Flyout in index.html**
  - API-URL + API-Key konfigurierbar (LocalStorage)
  - Modell-Auswahl (Dropdown, dynamisch aus /v1/models)
  - System-Prompt-Editor
  - Temperaturen + Max-Tokens-Slider

- [ ] **T2.3: Streaming Chat-Rendering**
  - `fetch()` mit `ReadableStream` statt mockChatResponse
  - Server-Sent Events parsen
  - Token-für-Token-Rendering im Chat-Bubble
  - Stop-Button während Generation

- [ ] **T2.4: Conversation History**
  - Nach Sessions gruppiert (Sidebar links)
  - Titel automatisch aus erster User-Message
  - Löschen, Export (JSON/Markdown), Suche
  - LocalStorage-basiert (später Puter-Sync)

---

## PHASE 3: JAMEZ™ Module Expansion

**Ziel:** 3 neue Analyse-Tabs im JAMEZ™-System: System Monitor, Code Review, Agent Status.

### Tasks

- [ ] **T3.1: System Monitor Tab**
  - Echtzeit-CPU/RAM/Disk-Gauges (Canvas-basiert)
  - Netzwerk-I/O, offene Prozesse
  - Batterie-Status (falls Laptop)
  - OS-Info + Uptime

- [ ] **T3.2: Code Review Tab**
  - Lokale Git-Diffs anzeigen
  - James-Integration: "Review this diff" → POST an James Cascade
  - Ergebnis als Chat-Bubble im Diff-Tab
  - Datei-Liste mit geänderten Zeilen

- [ ] **T3.3: Agent Status Tab**
  - Alle DkZ-Agenten mit Status (Online/Offline/Fehler)
  - Letzter Heartbeat, letzte Aktion
  - Schnell-Aktionen: Restart, Logs anzeigen
  - NanoBot-Chat-Bridge-Status (Port 3040)

- [ ] **T3.4: Tab-Management-Verbesserung**
  - Tab-Reihenfolge speicherbar
  - Tab-Icons + Badge (z.B. "3 Alerts" auf Health)
  - Close-Button auf jedem Tab

---

## PHASE 4: Tray + Shortcuts Erweiterung

**Ziel:** Volles Hotkey-System, erweitertes Tray-Menü, Quick-Actions aus dem Tray.

### Tasks

- [ ] **T4.1: Tray-Menü mit Live-Status**
  - Ampel mit Text-Status in Echtzeit (alle 30s Update)
  - Letzte Health-Meldung im Menü
  - Quick-Actions: "Ask Hermes", "Run Health", "Show Logs"
  - Submenü für alle Agenten-Controls

- [ ] **T4.2: Globale Hotkeys ausbauen**
  - `Ctrl+Space`: Quick Chat (bestehend)
  - `Ctrl+Shift+H`: Hermes Console (bestehend)
  - `Ctrl+Shift+O`: Overlay (bestehend)
  - `Ctrl+Shift+M`: System Monitor (NEU)
  - `Ctrl+Shift+R`: Run Health Check (NEU)
  - `Ctrl+Shift+L`: Logs exportieren (NEU)
  - Alle Hotkeys konfigurierbar in Settings

- [ ] **T4.3: Media-Keys + Custom Shortcuts**
  - Media-Keys abfangen (Play/Pause → nichts, sind für Music)
  - Custom-Shortcut-Editor in Settings
  - Shortcut-Profile speicherbar

- [ ] **T4.4: Quick-Action Palette**
  - `Ctrl+Shift+P` → Command Palette Overlay
  - Wie VS Code: tippen + Aktion auswählen
  - Aktionen: alle Hotkeys + Tabs + Tools

---

## PHASE 5: Build + Deployment

**Ziel:** Installer, Auto-Update, Portabel-Modus. Immer zuletzt — nach allen Änderungen.

### Tasks

- [ ] **T5.1: electron-builder Setup**
  - `devDependencies`: `electron-builder`
  - `build/` config in package.json
  - Windows: NSIS Installer (portable optional)
  - Icons: `build/icon.ico`, `build/icon.png`
  - Output: `dist/installer/`

- [ ] **T5.2: Auto-Update (electron-updater)**
  - GitHub Releases als Update-Quelle
  - Prüfung beim Start (hintergrund)
  - "Update verfügbar" → Download + Install-Prompt
  - Fallback: manueller Download-Link

- [ ] **T5.3: Code Signing**
  - Windows: Self-signed oder EV-Cert
  - Oder: Portabel-Modus (kein Signing nötig)
  - CI/CD: GitHub Actions Build-Pipeline

- [ ] **T5.4: Release-Workflow**
  - `npm run release` → Build + Tag + GitHub Release
  - CHANGELOG aus Commits generieren
  - Draft-Release mit Asset-Upload

---

## Zeitplan (Schätzung)

| Phase | Tasks | Geschätzte Zeit |
|-------|-------|----------------|
| P1: James Guardian | 4 Tasks | ~2h |
| P2: Hermes Chat | 4 Tasks | ~3h |
| P3: JAMEZ Modules | 4 Tasks | ~3h |
| P4: Tray + Shortcuts | 4 Tasks | ~1.5h |
| P5: Build + Deployment | 4 Tasks | ~2h |
| **Total** | **20 Tasks** | **~11.5h** |

---

## Done When

- [ ] James-Health-API liefert Echtzeit-Ampel
- [ ] Hermes Chat spricht mit echten LLMs (OLLAMA/OpenRouter)
- [ ] 3 neue JAMEZ™-Tabs laufen stabil
- [ ] Tray zeigt Live-Status + alle Shortcuts funktionieren
- [ ] Windows-Installer wird gebaut (mit/without Signing)
