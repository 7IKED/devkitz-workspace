---
name: dkz-ralph-loop
description: The Ralph-Loop Execution Pipeline for preventing Context Drift.
---

# Ralph-Loop™ (6 Phasen)

1. **LESEN** -> Parse prd.json, constitution, AGENTS.md and GEMINI.md/CLAUDE.md.
2. **SPAWN** -> Inject only relevant Context (via James) into a fresh execution session.
3. **EXECUTE** -> Developer writes the code.
4. **VERIFY** -> Tester/Reviewer checks syntax and logic.
5. **COMMIT** -> Commit to Git and update prd.json / features.json.
6. **LOOP** -> Proceed to the next task with fresh context.

**Crucial**: Never accumulate massive context. Always isolate tasks. Always update tracking files (task.md, features.json) at the COMMIT phase.
