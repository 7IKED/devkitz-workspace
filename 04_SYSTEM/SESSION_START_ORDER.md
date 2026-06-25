# SESSION START ORDER — DkZ Session-Protokoll

> Version 1.0 | Stand: 2026-06-25
> Verbindliche Reihenfolge fuer den Beginn JEDER Session.
> LLM-agnostisch — funktioniert mit Gemini, Claude, GPT, Hermes.

---

## Uebersicht

```
  Phase 0: FIND_YOURSELF      — Wer bin ich? Welches Modell? Welcher Agent?
  Phase 1: CONTEXT_LOAD        — Pflichtdateien lesen + Status erfassen
  Phase 2: CONNECTIVITY_CHECK  — Dienste testen (3050, 3040, SSH, gh)
  Phase 3: GIT_SYNC            — Letzte Commits, Branch, offene Aenderungen
  Phase 4: REDNOTE_SCAN        — Offene Fehler/Issues checken
  Phase 5: BRIEFING            — User begruessen + Aktionsplan vorlegen
  Phase 6: SWITCH              — /rebye (weiter) oder Neustart (neu)
```

---

## Phase 0: FIND_YOURSELF

**Ziel:** Das Modell muss seine Identitaet und Rolle verstehen.

1. Werde ich von **Gemini (Antigravity)**, **Claude (Copilot/Codex)**, **GPT (OpenCode)** oder **Hermes** gesteuert?
2. Welcher Agent-Typ bin ich? (James Guardian, Developer, Tester, ...)
3. Welche Skills habe ich zur Verfuegung? (siehe `.agents/skills/NAVIGATOR.md`)
4. Welches Betriebssystem? (Windows 11 — PowerShell 5.1)
5. Starte ich nach einem PC-Restart oder innerhalb derselben Session?

> **ENTSCHEIDUNG:** Wenn PC-Restart → Phase 1 mit REBYE (vollstaendiger Kontext).
> Wenn gleiche Session → Phase 1 ohne REBYE (nur Git-Check).

---

## Phase 1: CONTEXT_LOAD

**Ziel:** Alle wichtigen Dateien in den Kontext laden.

### Pflicht (in dieser Reihenfolge):

| # | Datei | Zweck |
|:--|:------|:------|
| 1 | `AGENTS.md` | Agenten-Registry + Rollen |
| 2 | `REGELWERK.md` | Coding Rules + Constraints |
| 3 | `LLM_BOOTSTRAP.md` | LLM-spezifische Konfiguration |
| 4 | `.agents/skills/NAVIGATOR.md` | Alle Skills im Ueberblick |
| 5 | `.agents/skills/llms.txt` | Maschinenlesbare Skill-Liste |

### Wenn REBYE (PC-Restart):

| # | Datei | Zweck |
|:--|:------|:------|
| 6 | Letzte `session-index.md` aus Antigravity Brain | Was wurde gemacht? |
| 7 | Letzte `walkthrough.md` aus Antigravity Brain | Detail-Walkthrough |
| 8 | Letzte `task.md` aus Antigravity Brain | Offene Tasks |

> **Fallback:** Wenn Antigravity Brain nicht verfuegbar → `99_ARCHIVE/logbackup/` prüfen.

---

## Phase 2: CONNECTIVITY_CHECK

**Ziel:** Sicherstellen dass die wichtigsten Dienste erreichbar sind.

```
  [3050] NanoChat Bridge     — http://localhost:3050/api/status
  [3040] ONTHERUN API Gateway — http://localhost:3040/api/health
  [9881] Iceberg Backend      — http://localhost:9881/health
  [SSH]  KVM8 VPS             — ssh kvm8 "echo OK"
  [gh]   GitHub Auth          — gh auth status
```

### Ausgabe (Ampel):

```
  ✅ NanoChat      :3040 — ONLINE
  ⚠️ ONTHERUN      :3040 — OFFLINE (wird bei Bedarf gestartet)
  ✅ Iceberg       :9881 — ONLINE
  ✅ SSH KVM8              — OK (46d uptime)
  ✅ GitHub Auth            — 7IKED logged in
```

---

## Phase 3: GIT_SYNC

**Ziel:** Git-Status erfassen und sicherstellen dass wir auf dem richtigen Branch sind.

### Befehle:

```powershell
git log -5 --oneline --graph
git status --short
git branch --show-current
git stash list
```

### Bewertung:

| Status | Bedeutung | Aktion |
|:-------|:----------|:-------|
| Clean | Keine offenen Aenderungen | Weiter |
| Modified + Staged | Uncommitted Work | Fragen: committen oder verwerfen? |
| Modified + Unstaged | Work in Progress | Fragen: weitermachen? |
| Detached HEAD | Kritisch | `git checkout master` |
| Stash vorhanden | Ausgelagerte Arbeit | Fragen: pop? |

---

## Phase 4: REDNOTE_SCAN

**Ziel:** Pruefen ob kritische Fehler von der letzten Session offen sind.

```powershell
$rednote = Get-Content -LiteralPath "04_SYSTEM/REDNOTE.json" -Raw | ConvertFrom-Json
Write-Host "Kritisch: $($rednote.stats.critical) | Warnungen: $($rednote.stats.warnings)"
```

- **0 kritisch** → Weiter
- **> 0 kritisch** → `/checkup` empfehlen

---

## Phase 5: BRIEFING

**Ziel:** Dem User einen klaren Status und die naechsten Schritte praesentieren.

### Format:

```
╔═══════════════════════════════════════╗
║   DkZ SESSION BRIEFING — 2026-06-25  ║
╚═══════════════════════════════════════╝

  Modell:          Gemini 2.5 Pro (Antigravity)
  Agent:           DkZ Developer
  Branch:          master (clean)
  Letzter Commit:  0eb66b4c — BLOCK E: READMEs erstellt
  NanoChat:        ✅ ONLINE
  SSH KVM8:        ✅ OK
  REDNOTE:         0 kritisch, 2 warnungen

── Letzte 5 Commits ──
  * 0eb66b4c BLOCK E: READMEs erstellt (ONTHERUN, dkz-center, nemotron-swarm)
  * 9a3f2b1c BLOCK D: Archivierte Module nach 99_ARCHIVE/
  * 4d7e1a5f BLOCK C: llms.txt + NAVIGATOR.md auf 62 Skills
  * 2b5f8e7a BLOCK B: Body attributes + CSS cleanup
  * 1a2b3c4d BLOCK A: --neon-red → --accent in 10 Modulen

── Offene Tasks ──
  [] BLOCK F: 04_SYSTEM/SESSION_START_ORDER.md erstellt (DONE)
  [] BLOCK G: ADR 0001 erstellen
  [] Abschluss: git add + commit + push

── Naechste Schritte ──
  1. BLOCK G: ADR erstellen
  2. Finaler Commit + Push
```

---

## Phase 6: SWITCH

**Ziel:** Entscheiden ob wir weiterarbeiten oder neu starten.

| Situation | Aktion |
|:----------|:-------|
| User kam via `/rebye` zurueck | Liste offene Tasks, frage: "Wo weitermachen?" |
| User startet neue Session | Startup-Skill ausfuehren, dann "Was moechtest Du tun?" |
| Gleiche Session, kein Restart | Direkt mit dem naechsten Task fortfahren |

---

## Anhang: Checkliste (Quick Reference)

```
[ ] FIND_YOURSELF  — Modell, Agent-Typ, OS
[ ] CONTEXT_LOAD   — AGENTS.md + REGELWERK.md + LLM_BOOTSTRAP.md
[ ] CONNECTIVITY   — 3040, 3050, 9881, SSH, gh
[ ] GIT_SYNC       — log, status, branch
[ ] REDNOTE_SCAN   — kritische Fehler?
[ ] BRIEFING       — Status anzeigen
[ ] SWITCH         — /rebye oder Neustart
```

---

## Verwandte Skills

| Skill | Pfad | Zweck |
|:------|:------|:------|
| `startup` | `.agents/skills/startup/SKILL.md` | Auto-Health-Check (10 Schritte) |
| `rebye` | `.agents/skills/rebye/SKILL.md` | Session-Wiedereinstieg nach PC-Restart |
| `byebye` | `.agents/skills/byebye/SKILL.md` | Session-Ende mit Artefakt-Sicherung |
| `checkup` | `.agents/skills/checkup/SKILL.md` | Tiefe Diagnostik bei Problemen |
| `anal` | `.agents/skills/anal/SKILL.md` | Wochen-Analyse (Git + Tasks + Health) |
