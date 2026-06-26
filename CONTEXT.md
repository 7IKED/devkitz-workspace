# DEEPKEEP™ / CLOUDIA² / AiAiKirk — Domain Glossary

> Erstellt: 2026-05-29 · Grill-Session Ergebnis
> Zweck: Einheitliche Begriffe fuer alle LLMs und Agenten

---

## Begriffe

### DEEPKEEP™
Der **unantastbare RAW-Tresor**. Alles wird hierhin verschoben, nichts wird geloescht.
- **Physisch:** Google Drive Ordner (Stammordner, schreibgeschuetzt)
- **Lokal:** Nur Links + INI-Dateien mit ASCII-Mindmap des Drive-Inhalts
- **Regel:** Dateien koennen IN DEEPKEEP verschoben und umbenannt werden, aber NIEMALS geloescht oder herausgenommen
- **Blog:** DEEPKEEP Blog auf Blogger — RAW Research direkt als Wissensdatenbank publizieren
- **Sanitizer:** `deepkeep.js` — Security-Script das Secrets vor Git-Push ersetzt

### CLOUDIA²
Das **Dokumenten-Strukturierungs-System**. Multi-Provider Engine die Ordnerstrukturen organisiert.
- **Provider:** Google Drive, Nextcloud, Cloudflare R2, GitHub, lokale Bibliotheken
- **Funktion:** Sortiert Dateien nach Regeln (Jeff Su 5x99), erstellt Metadaten, dokumentiert in Google Sheets
- **Beziehung:** DEEPKEEP ist der Input-Ordner fuer CLOUDIA² — alles kommt zuerst in DEEPKEEP, dann sortiert CLOUDIA² die Cloud

### AiAiKirk
Der **Chatbot/Assistent** der DEEPKEEP und CLOUDIA² steuert.
- **Tech:** Vanilla HTML/CSS/JS Dashboard (KEIN React!)
- **Funktion:** Copilot-aehnliche UI die alle Systeme orchestriert
- **Vorgaenger:** Google AI Studio App (dist/), NotebookLM MCP Server

### Oracle
**Oracle Database** — als Datenbank-Backend (nicht Oracle Cloud Infrastructure).

### Dashboard
Visuelles **Dashy-Style Glassmorphism Dashboard** das zeigt:
- Alle Google Drive Bibliotheken (Bilder, Musik, Videos, Dokumente, ZIPs)
- Cloudflare Status
- Oracle DB Status
- SecondBrain (Obsidian) durchsuchbar
- Alle Blogs und Homepages
- Lokale Ordner (Desktop, Downloads → 7-Tage-Regel)
- GitHub Repos durchsuchbar

### Suchleiste
**Unified Search** ueber:
- Google Drive (alle Dateien)
- GitHub (alle Repos von 7IKED, DEVTKITS, L33TSTAR, NEWEUROPEORDER)
- Lokale Ordner (C:\Users, C:\DEVKiTZ)
- SecondBrain (Obsidian Vault)
- Blogs und Homepages
- Email-Entwuerfe

---

## Architektur-Regeln

1. **DEEPKEEP = Tresor:** Write-Once, Read-Many. Loeschen VERBOTEN.
2. **CLOUDIA² = Sortierer:** Verschiebt, benennt um, erstellt Metadaten. Loescht NICHT.
3. **AiAiKirk = Steuermann:** Chatbot-UI die alles orchestriert.
4. **Lokale Ordner:** Nur Baumstruktur (00-99) + INI mit ASCII-Mindmap. Dateien leben auf Drive.
5. **Desktop/Downloads:** 7-Tage-Regel — unberuehrte Dateien → DEEPKEEP (Dashboard-Funktion, kein Auto-Scan)
6. **Copilot-Bug:** dkz-copilot.js wirft JavaScript-Fehler beim Laden → GEFIXT.
7. **Graphify-First:** Agenten (Copilot, OpenCode, Antigravity) MÜSSEN vor Architektur-Entscheidungen den Knowledge Graph abfragen.
8. **GitNexus:** Das Repo-Auditing und Verstehen von Verzeichnisstrukturen muss zwingend über GitNexus erfolgen.
9. **AnythingLLM (Understand Anything):** Dient als zentraler RAG/Workspace-Speicher für Dokumenten-verständnis, via Hub/Dashy direkt aufrufbar.

### DkZ Developer™ (Builder Agent)
Das Ausfuehrungsorgan im Ralph-Loop.
- **Interface:** Node.js CLI-Tool / MCP-Call (deterministische Befehlsuebergabe, kein Chat-Prompting)
- **Delegation:** Nutzt Pi-Agent / Nanobots ueber feste API-Schnittstellen

### Terminal-Architektur & Agenten-UI
- **Pi to Pi Architektur:** Multi-Agenten Orchestrierungsmuster nach IndyDevDan. Dezentrale ("flache") Architektur, in der Agenten (wie der Pi-Agent und der Builder) als gleichberechtigte Kollegen peer-to-peer ueber Sockets oder lokale HTTP-Server kommunizieren, anstatt hierarchisch gesteuert zu werden.
- **OPENNEXUZ (Orchestrator):** Zentraler Prozess-Manager (ersetzt James™ fuer diesen Teil). Baut das tmux-Layout auf, verkuppelt Webhooks und startet Subagenten ueber einen dedizierten Befehl (z.B. `dkz-spawn`). Im Pi to Pi Modell dient es nur dem *Starten* der Peers, nicht der Steuerung!
- **tmux (cmux):** Der Terminal-Multiplexer. Jeder Agent laeuft in einem eigenen Fenster/Pane. Spawnt ein Agent Subagenten ueber OPENNEXUZ, oeffnen sich fuer diese automatisch neue, verlinkte Fenster.
- **Atuin (autim):** Shell-History und Kontext-Speicher. Speichert die Logs und den kompletten Kontext jedes Agenten-Fensters synchronisiert in einer Datenbank.
- **IPC-Kommunikation:** Agenten tauschen Daten (Ergebnisse, Code) systemweit ueber Node.js-Dateien/Scripts aus (File-System als Message Broker) und triggern sich gegenseitig via Webhooks (Pi to Pi).
- **Ghosty:** Shell-Level Autocomplete (Ghost-Text), das in jedem neuen tmux-Fenster fuer zsh automatisch aktiviert ist.
- **Nanochat & Nanobot:** Nanochat ist die minimale Terminal-UI in einem dedizierten tmux-Pane. Der Nanobot ist ein Hintergrund-Prozess, der via Webhook kontinuierlich Status-Updates ueber den Fortschritt der arbeitenden Agenten in den Nanochat pusht.
