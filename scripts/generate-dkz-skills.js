const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join('C:', 'DEVKiTZ', '.agents', 'skills', 'dkz-standards-core');

if (!fs.existsSync(SKILLS_DIR)) {
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
}

const skills = [
    {
        name: 'dkz-bmad',
        desc: 'BMAD Methodology (Blueprint, Mapping, Analysis, Design)',
        content: `---
name: dkz-bmad
description: The core BMAD methodology (Blueprint, Mapping, Analysis, Design) for DEVKiTZ.
---

# BMAD™ Methodik

BMAD is the mandatory architecture process for DEVKiTZ agents:

1. **Blueprint**: Create a high-level architecture overview (\`BLAUPAUSE.md\`).
2. **Mapping**: Define the precise file structure and dependencies.
3. **Analysis**: Check edge cases, XSS vulnerabilities (esc), and backward compatibility.
4. **Design**: Implement the UI strictly using DkZ v2 CSS tokens (Glassmorphism, Hyperreal).

**Agents**:
- James™: Guardian, context injection.
- DkZ Architekt™: Designs the Blueprint.
- DkZ Developer™: Executes the code.
- DkZ Tester™: Verifies.

**Rule**: Do not start coding before BMAD is complete and approved.
`
    },
    {
        name: 'dkz-ralph-loop',
        desc: 'The Ralph-Loop Context Pipeline',
        content: `---
name: dkz-ralph-loop
description: The Ralph-Loop Execution Pipeline for preventing Context Drift.
---

# Ralph-Loop™ (6 Phasen)

1. **LESEN** → Parse \`prd.json\`, \`constitution\`, \`AGENTS.md\` and \`GEMINI.md/CLAUDE.md\`.
2. **SPAWN** → Inject only relevant Context (via James™) into a fresh execution session.
3. **EXECUTE** → Developer™ writes the code.
4. **VERIFY** → Tester™/Reviewer™ checks syntax and logic.
5. **COMMIT** → Commit to Git and update \`prd.json\` / \`features.json\`.
6. **LOOP** → Proceed to the next task with fresh context.

**Crucial**: Never accumulate massive context. Always isolate tasks. Always update tracking files (\`task.md\`, \`features.json\`) at the COMMIT phase.
`
    },
    {
        name: 'dkz-ui-system',
        desc: 'DkZ v2 Design System, Glassmorphism, Matrix Mode',
        content: `---
name: dkz-ui-system
description: DkZ v2 Design System (Glassmorphism, Matrix/Contrast Mode, XSS Protection).
---

# DkZ UI System

1. **No Frameworks**: Use Vanilla HTML, JS, CSS. No React, Vue, etc.
2. **Theme CSS**: Always include \`<link rel="stylesheet" href="../../shared/dkz-theme.css">\`.
3. **XSS Protection**: ALL dynamic innerHTML injections MUST use \`esc(string)\`. Include \`<script src="../../shared/dkz-debug.js"></script>\`.
4. **Hyperreal Background**: Include \`dkz-hyperreal-bg.js\` for the Honeycomb + Particles background and the Theme Toolbar (✨ / 💻).
5. **Matrix Mode**: Contrast mode is toggled via \`.dkz-matrix-mode\` on the \`<body>\`. It enforces `#000000` backgrounds and `#00ff88` text.
6. **Toast**: Use `#dkz-toast-container` for notifications.
`
    },
    {
        name: 'dkz-persistence',
        desc: 'DEEPKEEP, Iceberg, and Artifacts',
        content: `---
name: dkz-persistence
description: DEVKiTZ Persistence Rules (DEEPKEEP, Iceberg, LocalStorage).
---

# DEVKiTZ Persistence & DEEPKEEP™

1. **LocalStorage First**: Web modules must operate offline-first using \`localStorage\`.
2. **Iceberg Analytics**: Backend processes log to DuckDB/Apache Iceberg for long-term analytics.
3. **Triple Anchoring**: All AI artifacts (Task, Plan, Walkthrough) must be saved locally and indexed by James™.
4. **DEEPKEEP™**: The 7-day-rule applies. Do not delete files without permission; move them to \`99_ARCHIVE/\`.
`
    }
];

skills.forEach(skill => {
    const skillPath = path.join(SKILLS_DIR, skill.name);
    if (!fs.existsSync(skillPath)) {
        fs.mkdirSync(skillPath, { recursive: true });
    }
    fs.writeFileSync(path.join(skillPath, 'SKILL.md'), skill.content, 'utf-8');
    console.log(`✅ Skill created: ${skill.name}`);
});

console.log('🎉 DkZ Standard Skills generated for OpenCode & Nemotron!');
