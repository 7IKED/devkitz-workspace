---
name: Superpowers
description: "DEVKiTZ Superpowers — Meta-Skill mit 14 Sub-Skills fuer fortgeschrittene Agenten-Faehigkeiten. Brainstorming, Parallel-Agents, Git Worktrees, TDD, Debugging, Code Review, Plan Execution. Skills MUESSEN geprueft werden BEVOR jede Antwort oder Aktion."
---

<EXTREMELY-IMPORTANT>
Wenn du auch nur 1% Chance siehst, dass ein Skill relevant sein koennte, MUSST du ihn aufrufen.
WENN EIN SKILL ZU DEINEM TASK PASST, HAST DU KEINE WAHL. DU MUSST IHN NUTZEN.
Das ist nicht verhandelbar. Das ist nicht optional. Du kannst dich NICHT herausreden.
</EXTREMELY-IMPORTANT>

# Superpowers — Agent Bootstrap

> Adaptiert von `obra/superpowers` fuer Antigravity (Gemini) + DEVKiTZ™.
> Originalquelle: github.com/obra/superpowers

---

## Kern-Prinzip

**Skills IMMER pruefen BEVOR du antwortest oder handelst.**
Auch bei 1% Chance, dass ein Skill relevant ist → MUSS er invoked werden.

## Prioritaet

1. **User-Anweisungen** (GEMINI.md, REGELWERK.md, direkte Requests) — hoechste Prioritaet
2. **DkZ™ Skills** (`.agents/skills/`) — ueberschreiben Standard-Verhalten
3. **Superpowers Sub-Skills** — Workflow-Disziplin
4. **Default System Prompt** — niedrigste Prioritaet

---

## Antigravity Aktivierung

> Antigravity nutzt KEIN `Skill`-Tool wie Claude Code.
> Stattdessen: `view_file` auf die SKILL.md des Sub-Skills und Anweisungen befolgen.

### So aktivierst du einen Sub-Skill:

```
1. view_file → .agents/skills/superpowers/[sub-skill]/SKILL.md
2. Anweisungen lesen und EXAKT befolgen
3. Mehrere Sub-Skills kombinierbar (siehe Workflow)
```

---

## Pflicht-Workflow (Reihenfolge)

```
1. BRAINSTORMING    → Idee → Design → Spec (BEVOR Code!)
2. WRITING-PLANS    → Bite-sized Tasks (2-5 Min pro Task)
3. EXECUTION        → Subagent oder Inline, Task fuer Task
4. TDD              → RED → GREEN → REFACTOR
5. CODE-REVIEW      → Nach jedem Task pruefen
6. VERIFICATION     → Verifizieren BEVOR "fertig" gesagt wird
7. COMMIT           → Git Commit nach jeder Aenderung
```

---

## 14 Sub-Skills

| # | Skill | Pfad | Wann nutzen |
|:--|:------|:-----|:------------|
| 1 | 🧠 Brainstorming | `superpowers/brainstorming/SKILL.md` | BEVOR Code geschrieben wird |
| 2 | 🔀 Parallel Agents | `superpowers/dispatching-parallel-agents/SKILL.md` | Mehrere Tasks gleichzeitig |
| 3 | 📋 Plan Execution | `superpowers/executing-plans/SKILL.md` | Plan abarbeiten |
| 4 | 🏁 Branch Finish | `superpowers/finishing-a-development-branch/SKILL.md` | Branch fertig → mergen |
| 5 | 📥 Code Review (Empfang) | `superpowers/receiving-code-review/SKILL.md` | Review-Feedback verarbeiten |
| 6 | 📤 Code Review (Anfrage) | `superpowers/requesting-code-review/SKILL.md` | Review anfordern |
| 7 | 🤖 Subagent Dev | `superpowers/subagent-driven-development/SKILL.md` | Subagent-gesteuerte Entwicklung |
| 8 | 🔍 Debugging | `superpowers/systematic-debugging/SKILL.md` | Bug fixen (4-Phasen!) |
| 9 | 🧪 TDD | `superpowers/test-driven-development/SKILL.md` | Tests schreiben |
| 10 | 🌳 Git Worktrees | `superpowers/using-git-worktrees/SKILL.md` | Parallele Branches |
| 11 | ⚡ Using Superpowers | `superpowers/using-superpowers/SKILL.md` | Meta: Wie Skills nutzen |
| 12 | ✅ Verification | `superpowers/verification-before-completion/SKILL.md` | VOR "fertig" sagen |
| 13 | 📐 Writing Plans | `superpowers/writing-plans/SKILL.md` | Plaene schreiben |
| 14 | 🛠️ Writing Skills | `superpowers/writing-skills/SKILL.md` | Neue Skills erstellen |

---

## Red Flags (STOP — du rationalisierst!)

| Gedanke | Realitaet |
|:--------|:----------|
| "Nur eine einfache Frage" | Fragen sind Tasks. Skills pruefen. |
| "Ich brauche erstmal Kontext" | Skill-Check KOMMT VOR Klaerungsfragen. |
| "Lass mich erstmal den Code anschauen" | Skills sagen dir WIE du schaust. |
| "Das braucht keinen formellen Skill" | Wenn ein Skill existiert → nutze ihn. |
| "Ich kenne diesen Skill" | Skills aendern sich. Aktuelle Version lesen. |
| "Der Skill ist uebertrieben" | Einfache Dinge werden komplex. Nutze ihn. |
| "Ich mache erstmal nur das eine" | Check BEVOR du IRGENDWAS tust. |
| "Das fuehlt sich produktiv an" | Undisziplinierte Aktion verschwendet Zeit. |
| "Ich weiss was das heisst" | Konzept kennen ≠ Skill nutzen. Invoke! |

---

## Systematic Debugging (4 Phasen)

```
Phase 1: ROOT CAUSE  → Fehler lesen, reproduzieren, Beweise sammeln
Phase 2: PATTERN     → Arbeitende Beispiele finden, vergleichen
Phase 3: HYPOTHESIS  → Eine Theorie, minimal testen
Phase 4: FIX         → Test schreiben, fixen, verifizieren
```

**Eisernes Gesetz:** KEINE Fixes ohne Root-Cause-Analyse!
**3+ Fixes gescheitert?** → Architektur hinterfragen, nicht weiterfixen.

---

## Skill-Typ Erkennung

**Rigid** (TDD, Debugging, Security): Folge EXAKT. Keine Abweichung.
**Flexible** (Patterns, Design): Passe Prinzipien an Kontext an.

Der Skill selbst sagt dir welcher Typ er ist.

---

## Kombinations-Beispiele

### Feature implementieren:
```
1. brainstorming → Idee validieren
2. writing-plans → Tasks aufteilen
3. subagent-driven-development → Subagenten fuer parallele Arbeit
4. test-driven-development → Tests zuerst
5. requesting-code-review → Review
6. verification-before-completion → Final-Check
7. finishing-a-development-branch → Merge
```

### Bug fixen:
```
1. systematic-debugging → Root Cause finden
2. test-driven-development → Failing Test schreiben
3. verification-before-completion → Fix verifizieren
```

---

## POWER MODE (Erweiterung)

Sage **"power"** fuer den erweiterten Modus:
- 1.442+ awesome-skills aus `~/.gemini/antigravity/skills/`
- Fusioniert mit DkZ™ eigenen 53+ Skills
- Vollstaendiger Skill: `.agents/skills/power/SKILL.md`

---

## DkZ™ Variante

Fuer DkZ-spezifische Anpassungen (Second Brain, Cloud Functions, etc.):
- `.agents/skills/superpowers-dkz/SKILL.md`

## Referenz

| Was | Pfad |
|:----|:-----|
| Superpowers Root | `.agents/skills/superpowers/` |
| DkZ-Variante | `.agents/skills/superpowers-dkz/SKILL.md` |
| POWER Skill | `.agents/skills/power/SKILL.md` |
| Workflow | `.agents/workflows/superpowers.md` |
| Navigator | `.agents/skills/NAVIGATOR.md` |
| Awesome-Skills | `~/.gemini/antigravity/skills/` |
