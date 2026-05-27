---
name: byebye
description: Session beenden — Alle Artefakte sichern (Drive + GitHub Logbackup), Git committen, Copilot briefen
---

# /byebye — Session Ende + PC Restart 👋

> **Trigger:** `/byebye` oder `byebye`
> **Zweck:** Sauberes Session-Ende mit vollstaendiger Persistenz ALLER Artefakte

---

## Workflow

### Phase 1: Artefakt-Inventur (PFLICHT)

1. **ALLE Artefakte im Brain-Ordner auflisten:**
   ```
   C:\Users\BAZE²\.gemini\antigravity\brain\[conversation-id]\
   ```
   - `walkthrough.md` — Aktualisieren mit letzten Aenderungen
   - `task.md` — Offene Tasks markieren
   - `implementation_plan.md` — Status aktualisieren
   - `session-index.md` — Erstellen/Aktualisieren
   - `free_api_bericht.md` — Falls vorhanden
   - Alle `scratch/` Dateien (Configs, Scripts, Notizen)
   - **JEDES einzelne Artefakt zaehlen und auflisten**

2. **Session-Index erstellen** — `session-index.md` mit:
   - Alle Artefakte (Typ, Status, Zusammenfassung)
   - Alle bearbeiteten Dateien (Was geaendert)
   - Alle neuen Module/Dashboards
   - Offene Tasks (priorisiert: 🔴🟡🟢)

### Phase 2: Artefakte in Drive sichern

3. **Artefakte nach Drive kopieren:**
   ```
   Quelle:  C:\Users\BAZE²\.gemini\antigravity\brain\[conv-id]\
   Ziel:    C:\Users\BAZE²\Google Drive\DEVKiTZ-Artifacts\[YYYY-MM-DD]\
   ```
   - Alle `.md` Dateien
   - Alle `scratch/` Dateien
   - Session-Index als Uebersicht

4. **Falls Drive nicht verfuegbar:** Fallback nach:
   ```
   C:\Users\BAZE²\Documents\DkZ\artifacts-backup\[YYYY-MM-DD]\
   ```

### Phase 3: Git Logbackup

5. **Logbackup-Ordner in Git erstellen:**
   ```
   99_ARCHIVE\logbackup\[YYYY-MM-DD]_session\
   ```
   - `session-index.md` kopieren
   - `walkthrough.md` kopieren
   - `task.md` kopieren
   - **NUR Zusammenfassungen, keine vollen Artefakte (Platz sparen)**

6. **Git Status pruefen + Commit:**
   ```bash
   git add -A
   git commit -m "session(end): [Zusammenfassung] — [X] Artefakte gesichert"
   ```

7. **Git Log bestaetigen:**
   ```bash
   git log -3 --oneline
   ```

### Phase 4: Copilot-Vorbereitung

8. **Walkthrough finalisieren** — Abschlusszeile:
   ```
   Session beendet: [Datum + Uhrzeit]
   Artefakte: [X] gesichert (Drive + GitHub)
   Naechste Session: /rebye ausfuehren
   ```

9. **Module-Liste fuer Copilot:**
   - Alle Module in `modules/` auflisten
   - Neue/geaenderte Module markieren
   - Dashboard-Links zusammenstellen

10. **Walkthrough-Zusammenfassung** als lesbare Liste:
    - ✅ Erledigte Aufgaben
    - ⏳ Offene Aufgaben
    - 🔜 Naechste Schritte

### Phase 5: Verabschiedung

11. **Status-Karte:**

```
┌─────────────────────────────────────┐
│  👋 BYEBYE — Session Gesichert     │
├─────────────┬───────────────────────┤
│ Artefakte   │ X Dateien → Drive     │
│ Logbackup   │ → 99_ARCHIVE/logbackup│
│ Git Commits │ [Hash + Message]      │
│ Tasks       │ X/Y erledigt          │
│ Module      │ X neu, Y geaendert    │
│ Restart     │ /rebye ausfuehren     │
└─────────────┴───────────────────────┘
```

12. **"Alles gesichert! Bis gleich — /rebye zum Wiedereinstieg. 🫡"**

---

## Regeln

- NIEMALS Session beenden ohne Git Commit
- ALLE Artefakte muessen gesichert sein (Drive + GitHub Logbackup)
- Artefakte zaehlen — JEDES einzelne muss in der Liste stehen
- Session-Index MUSS erstellt werden
- Copilot-Briefing fuer nahtlosen Wiedereinstieg
- R8: Keine Umlaute
- Bei ungesicherten Aenderungen: WARNUNG, nicht beenden
