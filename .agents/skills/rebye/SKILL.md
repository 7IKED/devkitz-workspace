---
name: rebye
description: Session-Wiedereinstieg — Artefakte laden, Walkthrough zeigen, Module/Dashboards fuer Copilot bereitstellen
---

# /rebye — Willkommen zurueck! 🫡

> **Trigger:** `/rebye` oder `rebye`
> **Zweck:** Nach PC-Restart den vollen Kontext wiederherstellen + Copilot briefen

---

## Workflow

### Phase 1: Kontext-Recovery (PFLICHT)

1. **Pflicht-Dateien lesen** (Reihenfolge):
   - `C:\DEVKiTZ\LLM_BOOTSTRAP.md`
   - `C:\DEVKiTZ\GEMINI.md`
   - Letzte `session-index.md` aus Antigravity Brain
   - Letzte `walkthrough.md` aus Antigravity Brain
   - Letzte `task.md` aus Antigravity Brain

2. **Git-Status pruefen:**
   ```bash
   git log -5 --oneline
   git status --short
   ```

3. **Begruessungsprotokoll** ausfuehren (Hallo Europa / Hallo World)

### Phase 2: Artefakte wiederherstellen

4. **ALLE Artefakte aus Brain-Ordner laden:**
   ```
   C:\Users\BAZE²\.gemini\antigravity\brain\[letzte-conversation-id]\
   ```
   - walkthrough.md
   - task.md
   - implementation_plan.md
   - session-index.md
   - free_api_bericht.md (falls vorhanden)
   - scratch/* (Configs, Scripts)

5. **Falls Artefakte fehlen — Drive-Backup pruefen:**
   ```
   C:\Users\BAZE²\Google Drive\DEVKiTZ-Artifacts\[letztes-Datum]\
   ```

6. **Falls Drive fehlt — GitHub Logbackup pruefen:**
   ```
   99_ARCHIVE\logbackup\[letztes-Datum]_session\
   ```

### Phase 3: Walkthrough + Tasks anzeigen

7. **Walkthrough anzeigen** — Kompakte Zusammenfassung:
   - Was wurde in der letzten Session gemacht?
   - Welche Module sind neu/geaendert?
   - Welche Dateien wurden bearbeitet?

8. **Task-Liste anzeigen** — Offene Aufgaben priorisiert:
   - 🔴 Kritisch (Blocker)
   - 🟡 Wichtig (naechste Schritte)
   - 🟢 Nice-to-have

### Phase 4: Copilot-Briefing (Module + Dashboards)

9. **Modul-Uebersicht** — Alle verfuegbaren Module/Dashboards listen:
   ```bash
   dir /b C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\
   ```
   - Neue Module hervorheben (aus letzter Session)
   - Links zu Dashboards zusammenstellen

10. **Copilot Module-Index:**

| Modul | Typ | Status | Pfad |
|:------|:----|:-------|:-----|
| [Name] | Dashboard/Modul | ✅/🆕/⚠️ | `modules/[name]/` |

11. **Letzte Aenderungen zeigen:**
   ```bash
   git diff --stat HEAD~3
   ```

### Phase 5: Arbeitsbereit

12. **Status-Karte:**

```
┌─────────────────────────────────────┐
│  🫡 REBYE — Session Restored       │
├─────────────┬───────────────────────┤
│ Letzte Sess │ [Datum + Zusammenfass]│
│ Artefakte   │ [X] geladen           │
│ Git Branch  │ [Branch + Commits]    │
│ Offene Tasks│ [X von Y erledigt]    │
│ Module      │ [X gesamt, Y neu]     │
│ VPS Status  │ 🟢/🟡/🔴             │
│ Naechster   │ [Top-Prioritaet Task] │
└─────────────┴───────────────────────┘
```

13. Frage: **"Was machen wir zuerst?"**

---

## Regeln

- NIEMALS sofort mit Arbeit anfangen — erst Kontext laden
- ALLE Artefakte laden und anzeigen
- Walkthrough + Tasks + Module-Index IMMER anzeigen
- Copilot muss alle Module/Dashboards einsehen koennen
- Bei fehlenden Artefakten: Drive → GitHub Logbackup → Conversation-Logs
- R8: Keine Umlaute (ae, oe, ue, ss)
