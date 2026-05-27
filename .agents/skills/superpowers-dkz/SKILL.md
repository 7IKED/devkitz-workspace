---
name: superpowers-dkz
description: Use when starting any task — DkZ™ adaptierte Superpowers Methodik. Skills MÜSSEN geprüft werden BEVOR jede Antwort oder Aktion. Brainstorming vor Code. Plans vor Execution.
---

# Superpowers DkZ™ — Agenten-Methodik

> Adaptiert von `obra/superpowers` für das DEVKiTZ™ Ökosystem.
> Quelle: `C:\DEVKiTZ\02_RESEARCH\superpowers\`

## Kern-Prinzip

**Skills IMMER prüfen BEVOR du antwortest oder handelst.**
Auch bei 1% Chance, dass ein Skill relevant ist → MUSS er invoked werden.

## Priorität

1. **User-Anweisungen** (GEMINI.md, CLAUDE.md, REGELWERK.md) — höchste Priorität
2. **DkZ™ Skills** — überschreiben Standard-Verhalten
3. **Default System Prompt** — niedrigste Priorität

## Workflow (Pflicht-Reihenfolge)

```
1. BRAINSTORMING    → Idee → Design → Spec (BEVOR Code!)
2. WRITING-PLANS    → Bite-sized Tasks (2-5 Min pro Task)
3. EXECUTION        → Subagent oder Inline, Task für Task
4. TDD              → RED → GREEN → REFACTOR
5. CODE-REVIEW      → Nach jedem Task prüfen
6. VERIFICATION     → Verifizieren BEVOR "fertig" gesagt wird
7. COMMIT           → Git Commit nach jeder Änderung
```

## Red Flags (STOP — du rationalisierst!)

| Gedanke | Realität |
|:--------|:---------|
| "Nur eine einfache Frage" | Fragen sind Tasks. Skills prüfen. |
| "Ich brauche erstmal Kontext" | Skill-Check KOMMT VOR Klärungsfragen. |
| "Lass mich erstmal den Code anschauen" | Skills sagen dir WIE du schaust. |
| "Das braucht keinen formellen Skill" | Wenn ein Skill existiert → nutze ihn. |
| "Ich kenne diesen Skill" | Skills ändern sich. Aktuelle Version lesen. |
| "Der Skill ist übertrieben" | Einfache Dinge werden komplex. Nutze ihn. |
| "Ich mache erstmal nur das eine" | Check BEVOR du IRGENDWAS tust. |

## DkZ™ Skill-Library

### Verfügbare Skills (`.agents/skills/`)

| Skill | Trigger |
|:------|:--------|
| `cloud-functions` | GCP Cloud Functions erstellen/deployen |
| `second-brain-sync` | Obsidian Vault aktualisieren, Dailys, Logs |
| `mcp-builder` | MCP Server erstellen |
| `autoresearch` | Tiefe Recherche mit Karpathy-Methodik |
| `superpowers-dkz` | Diese Datei — Agenten-Methodik |

### Verfügbare Workflows (`.agents/workflows/`)

| Workflow | Trigger |
|:---------|:--------|
| `cloud-function-deploy` | Function deployen |
| `cloud-function-test` | Function lokal testen |
| `cloud-run-deploy` | Cloud Run Deployment |
| `gcp-project-setup` | GCP Projekt einrichten |
| `daily-sync` | Obsidian Daily Note + Logs |
| `startup` | Session-Start |
| `system-check` | System-Health prüfen |

## Systematic Debugging (4 Phasen)

```
Phase 1: ROOT CAUSE  → Fehler lesen, reproduzieren, Beweise sammeln
Phase 2: PATTERN     → Arbeitende Beispiele finden, vergleichen
Phase 3: HYPOTHESIS  → Eine Theorie, minimal testen
Phase 4: FIX         → Test schreiben, fixen, verifizieren
```

**Eisernes Gesetz:** KEINE Fixes ohne Root-Cause-Analyse!
**3+ Fixes gescheitert?** → Architektur hinterfragen, nicht weiterfixen.

## Writing Plans (Bite-Sized Tasks)

Jeder Task = 2-5 Minuten:
1. Failing Test schreiben
2. Test laufen lassen (muss FAIL sein)
3. Minimalen Code schreiben
4. Test laufen lassen (muss PASS sein)
5. Commit

**KEINE Platzhalter:** "TBD", "TODO", "implementiere später" = Plan-Fehler.

## Second Brain Auto-Sync

Bei JEDER Session:
1. **Daily Note** prüfen/erstellen → `ai-wiki/dailys/YYYY-MM-DD.md`
2. **Session-Log** schreiben → `ai-wiki/logs/sessions/YYYY-MM-DD_session-NN.md`
3. **Erstellte Dateien** im Daily loggen
4. **Learnings** dokumentieren
5. **Metriken** aktualisieren

## ⚡ POWER MODE (Erweiterung)

Sage **"power"** um den erweiterten Modus zu aktivieren:
- 1.442+ awesome-skills aus `~/.gemini/antigravity/skills/`
- Fusioniert mit DkZ™ eigenen 28+ Skills
- Vollständiger Skill: `.agents/skills/power/SKILL.md`

## Referenz
- **POWER Skill:** `C:\DEVKiTZ\.agents\skills\power\SKILL.md`
- **Awesome-Skills (global):** `C:\Users\BAZE²\.gemini\antigravity\skills\`
- **Awesome-Skills (workspace):** `C:\DEVKiTZ\.agents\skills\awesome-skills\`
- Superpowers Original: `C:\DEVKiTZ\02_RESEARCH\superpowers\`
- Obsidian Skills: `C:\DEVKiTZ\02_RESEARCH\obsidian-skills\`
- DkZ Skills: `C:\DEVKiTZ\.agents\skills\`
- DkZ Workflows: `C:\DEVKiTZ\.agents\workflows\`
- Obsidian Vault: `C:\DEVKiTZ\02_RESEARCH\ai-wiki\`

