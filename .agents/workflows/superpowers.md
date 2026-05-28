---
name: superpowers
description: "DEVKiTZ Superpowers — Meta-Skill mit 14 Sub-Skills fuer fortgeschrittene Agenten-Faehigkeiten: Brainstorming, Parallel-Agents, Git Worktrees, TDD, Debugging, Code Review, Plan Execution."
globs: []
---

# /superpowers — Meta-Skill Aktivierung

> **Wann:** Immer wenn fortgeschrittene Agent-Operationen benoetigt werden.
> **Was:** Aktiviert 14 Sub-Skills fuer Brainstorming, Debugging, TDD, Code Review, Plan Execution und mehr.

---

## Schritt 1: Haupt-Skill laden

Lies die vollstaendige SKILL.md mit allen Anweisungen:

```
view_file → .agents/skills/superpowers/SKILL.md
```

Alternativ die DkZ-spezifische Variante:

```
view_file → .agents/skills/superpowers-dkz/SKILL.md
```

## Schritt 2: Sub-Skill auswaehlen

Jeden Sub-Skill per `view_file` auf seine SKILL.md laden:

| # | Skill | Laden mit |
|:--|:------|:----------|
| 1 | 🧠 Brainstorming | `view_file → .agents/skills/superpowers/brainstorming/SKILL.md` |
| 2 | 🔀 Parallel Agents | `view_file → .agents/skills/superpowers/dispatching-parallel-agents/SKILL.md` |
| 3 | 📋 Plan Execution | `view_file → .agents/skills/superpowers/executing-plans/SKILL.md` |
| 4 | 🏁 Branch Finish | `view_file → .agents/skills/superpowers/finishing-a-development-branch/SKILL.md` |
| 5 | 📥 Code Review (Empfang) | `view_file → .agents/skills/superpowers/receiving-code-review/SKILL.md` |
| 6 | 📤 Code Review (Anfrage) | `view_file → .agents/skills/superpowers/requesting-code-review/SKILL.md` |
| 7 | 🤖 Subagent Dev | `view_file → .agents/skills/superpowers/subagent-driven-development/SKILL.md` |
| 8 | 🔍 Debugging | `view_file → .agents/skills/superpowers/systematic-debugging/SKILL.md` |
| 9 | 🧪 TDD | `view_file → .agents/skills/superpowers/test-driven-development/SKILL.md` |
| 10 | 🌳 Git Worktrees | `view_file → .agents/skills/superpowers/using-git-worktrees/SKILL.md` |
| 11 | ⚡ Using Superpowers | `view_file → .agents/skills/superpowers/using-superpowers/SKILL.md` |
| 12 | ✅ Verification | `view_file → .agents/skills/superpowers/verification-before-completion/SKILL.md` |
| 13 | 📐 Writing Plans | `view_file → .agents/skills/superpowers/writing-plans/SKILL.md` |
| 14 | 🛠️ Writing Skills | `view_file → .agents/skills/superpowers/writing-skills/SKILL.md` |

## Schritt 3: Ausfuehren

1. SKILL.md des Sub-Skills per `view_file` laden und mit `IsSkillFile: true` markieren
2. Anweisungen exakt befolgen
3. Mehrere Sub-Skills kombinierbar

## Kombinations-Beispiele

### Feature implementieren:
```
1. brainstorming → Idee validieren
2. writing-plans → Tasks aufteilen
3. test-driven-development → Tests zuerst
4. requesting-code-review → Review
5. verification-before-completion → Check
6. finishing-a-development-branch → Merge
```

### Bug fixen:
```
1. systematic-debugging → Root Cause (4 Phasen!)
2. test-driven-development → Failing Test
3. verification-before-completion → Fix verifizieren
```

### POWER MODE:
```
Sage "power" → Aktiviert 1.442+ Awesome-Skills zusaetzlich
Skill: .agents/skills/power/SKILL.md
```
