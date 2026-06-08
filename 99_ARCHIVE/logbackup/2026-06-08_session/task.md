# Task: Nexus Copilot (All-in-One .exe + Gemma 4 + Autonomie)

## Phase 1: Architektur-Merge & Cleanup
- [ ] Backend-Ordner löschen / ignorieren
- [ ] `frontend/package.json` um express, cors etc. ergänzen

## Phase 2: Electron Main (Server & Autonomie)
- [ ] Express.js Server in `frontend/main.js` integrieren
- [ ] Ollama Bridge (`gemma4:12b`) Endpoint in `main.js` bauen
- [ ] Autonome Command-Execution (CMD Run via child_process) implementieren
- [ ] IPC-Kommunikation für Terminal-Logs zum Frontend

## Phase 3: Frontend UI & Graphify
- [ ] Graphify-Ordner/Pfad aus `devkitz-workspace` in UI einbetten (als iFrame/Tab)
- [ ] Chat-Interface an Gemma 4 anpassen (System Prompts)
- [ ] Autonomie-Indikator (Ladebalken für ausgeführte Commands) einbauen

## Phase 4: Build & Verify
- [ ] `npm install` im frontend ausführen
- [ ] `npm run build:win` ausführen, um die `.exe` zu generieren
- [ ] Start der `.exe` und Autonomie testen
- [ ] Walkthrough aktualisieren
