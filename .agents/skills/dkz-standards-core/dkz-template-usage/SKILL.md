---
name: dkz-template-usage
description: Enforces the use of bmad-module-template.html when creating new UI modules or dashboards.
---

# DEVKiTZ Template Rule

When a user asks you (an LLM/Agent) to create a new "Dashboard", "Module", "View", or "UI Page" in the web interface, you **MUST NOT** start from scratch.

## Mandatory Starting Point
You must use the following file as your boilerplate:
\`C:\\DEVKiTZ\\github-hub\\templates\\bmad-module-template.html\`

## Why?
1. It contains the exact loading order for \`dkz-theme.css\`, \`dkz-debug.js\`, \`dkz-premium.js\`, and \`dkz-hyperreal-bg.js\`.
2. It guarantees compatibility with the Matrix/Contrast Mode and the Glassmorphism Theme Profiler.
3. It guarantees XSS-Safety by enforcing \`esc()\` for dynamic data.

## Instructions
1. Copy the contents of \`bmad-module-template.html\`.
2. Create your new module directory (e.g., \`01_dashboard/modules/new-feature/\`).
3. Create \`index.html\` pasting the template content.
4. Adjust the \`<h1>\` title.
5. Insert your feature logic strictly inside the \`<div class="glass-card dkz-fade">\` area.
6. Use \`var(--accent)\` and \`var(--bg)\` instead of hardcoded hex colors for new elements.
