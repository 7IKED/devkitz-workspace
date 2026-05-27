# DEVKiTZ™ Ecosystem: Comprehensive Briefing Document

## Executive Summary

The DEVKiTZ™ ecosystem is a sophisticated, AI-driven developer environment designed to maintain absolute context between sessions, ensuring that "nothing is lost." As of March 2026, the project has evolved into a comprehensive infrastructure comprising over 89 dashboard modules, a centralized knowledge tree with thousands of entries, and a multi-agent methodology known as BMAD™. 

The system is built on a "Vanilla-First" philosophy, eschewing modern frameworks like React or Tailwind in favor of raw HTML5, CSS3, and ES6+ JavaScript to ensure portability and longevity. Governance is maintained through a strict "Regelwerk" (Rulebook) consisting of 35 mandatory rules, overseen by a master agent named James™. The ecosystem prioritizes knowledge persistence through triple-anchoring artifacts across a DataLakeHouse (Apache Iceberg), a searchable HTML Hub, and an AI Copilot pipeline.

---

## Strategic Project Overview

The DEVKiTZ™ ecosystem serves as a "Project Memory" (Projektgedächtnis) for agents and developers. It is organized into three primary categories: **INTERN** (private data), **SYSTEM** (core projects and agents), and **USER** (research and media).

### Core Components
| Component | Description |
| :--- | :--- |
| **Dashboard** | 89+ modules (MOD-001..089+) providing specific tools and views. |
| **BotNet™ Marketplace** | A platform for agents, karma tracking, and the DAC protocol. |
| **ONTHERUN™ MCP Server** | A Node.js/Express backend hosting over 34 integrated tools. |
| **DataLakeHouse™** | Analytical layer using Apache Iceberg and DuckDB. |
| **WissenHub / Wiki Hub™** | A centralized knowledge tree with 4,121 entries from 9 distinct sources. |
| **James™** | The "Master-Agent" and Guardian responsible for system integrity and "R24 Alarms." |
| **BMAD™ & Ralph-Loop™** | Specialized methodologies for feature planning and task execution. |

---

## Technical Architecture and Standards

### The "Vanilla" Tech Stack
The ecosystem enforces a non-negotiable tech stack to maintain simplicity and performance. Using frameworks like React, Vue, or Tailwind is strictly forbidden except in standalone special projects (e.g., the dkz-hub Chrome Extension).

*   **Frontend:** Vanilla HTML5, CSS3 (Custom Properties), JavaScript ES6+.
*   **Design System:** DkZ™ Theme v2 featuring a glassmorphism UI, Inter/JetBrains Mono fonts, and a signature color palette (`--accent: #fa1e4e`).
*   **Persistence:** LocalStorage for offline-first capabilities, backed by DuckDB and Apache Iceberg.
*   **Backend:** Node.js 18+ / Express.js.
*   **AI Integration:** Multi-provider support (OpenAI, Anthropic, Groq, Mistral, Gemini) accessed via the ONTHERUN™ server.

### Mandatory Shared Scripts
Every module within the dashboard must integrate a suite of shared scripts to ensure consistent functionality:
*   **dkz-theme.css:** Global styling and variables.
*   **dkz-navbar.js:** Central navigation and notes API.
*   **dkz-prompt-templates.js:** Access to 344 templates across 35 categories.
*   **dkz-debug.js:** Mandatory for XSS protection (`esc()`) and error overlays.
*   **dkz-james.js:** Integration with the Guardian agent.

---

## Operational Methodologies

The ecosystem utilizes specialized workflows to eliminate "hallucinations" and ensure high-quality code output.

### BMAD™ Methodology (Blueprint → Mapping → Analysis → Design)
This principle dictates that a single agent cannot handle all tasks. Instead, seven specialized agent roles are utilized:
1.  **James™ (Guardian):** Monitors the "Constitution" and triggers alarms; does not code.
2.  **DkZ PM™:** Manages specifications and user stories.
3.  **DkZ Architekt™:** Handles structural planning and tech stack.
4.  **DkZ Developer™:** Executes the Ralph-Loop to write code.
5.  **DkZ Reviewer™:** Performs code reviews (checking for `esc()` and CSS variables).
6.  **DkZ Tester™:** Validates functionality against `tasks.json`.
7.  **DkZ Dokumentar™:** Updates READMEs and Wiki entries.

### The Ralph-Loop™
A 6-phase execution cycle based on Stafford Beer’s Viable System Model (VSM) System 2:
1.  **READ:** Load specifications and the Constitution.
2.  **SPAWN:** Create a fresh context instance.
3.  **EXECUTE:** Developer agent writes code.
4.  **VERIFY:** Reviewer/Tester agents validate the work.
5.  **COMMIT:** Git commit and update the PRD (Product Requirements Document).
6.  **LOOP:** Proceed to the next task in `tasks.json`.

---

## Knowledge Management and Persistence

Knowledge is treated as the ecosystem's highest value. The "Dual-Database" rule (R30) mandates that no document exists in only one database; both WissenHub and the Research Archive must be synchronized.

### Triple-Anchoring Strategy
Every working artifact (tasks, walkthroughs, research) must be anchored in three locations:
1.  **Iceberg:** The immutable knowledge database for long-term storage.
2.  **Hub:** The HTML interface for searchable discovery and visualization.
3.  **Copilot:** Integrated access for agents to retrieve historical context via the `dkz-copilot.js` API.

### Artifact Typology
| Type | Required Metadata | Purpose |
| :--- | :--- | :--- |
| **Implementierungsplan** | Pre-coding phase | Technical plan and verification steps. |
| **Task-Checkliste** | Project start | Atomic sub-items and progress tracking. |
| **Walkthrough** | Post-coding phase | Proof of work, results, and screenshots. |
| **Research** | Analysis phase | Comparisons, data points, and deep-dives. |

---

## Governance: The "Regelwerk" (Critical Rules)

The system is governed by a strict set of rules that prioritize structural integrity over speed.

*   **Rule 0: "Be part of the solution, never the problem."** All actions must improve the system rather than complicate it.
*   **Rule 1: "Never Delete—Always Archive."** Knowledge loss is prohibited. Files are moved to `99_ARCHIVE/`, never deleted.
*   **Rule 16: "Rules over Instructions."** If a user instruction violates a system rule, the rule takes precedence until the user explicitly overrides it.
*   **Rule 24: "R24 Alarm (Archive Protocol)."** Any attempt to move files to the archive, rename directories, or remove modules from the registry triggers an alarm. Execution requires explicit confirmation from the owner ("777").
*   **Rule 35: "Workflow-First Principle."** Every new function must first be saved as a "Skill" and "Workflow" document before it is executed.

---

## Important Quotes with Context

> **"Zweck: Kontext zwischen Sessions bewahren — NICHTS geht verloren"**
> *Source: CLAUDE.md / GEMINI.md*
> **Context:** This is the primary mission statement found at the header of all memory files. It defines the entire DEVKiTZ™ project as a mechanism for persistent context.

> **"SEI IMMER EIN TEIL DER LÖSUNG, NIE DES PROBLEMS"**
> *Source: REGELWERK.md (Rule 0)*
> **Context:** The "Supreme Rule" that dictates the mindset of any agent or developer entering the ecosystem. It emphasizes proactive improvement and ownership of issues.

> **"Kein Code ohne Plan. Kein Plan ohne Nachweis."**
> *Source: CLAUDE.md (§33)*
> **Context:** Translating to "No code without a plan. No plan without proof," this quote summarizes the mandatory lifecycle of a feature: Implementation Plan → Code → Walkthrough.

> **"Alte Repos sind Goldminen — nicht Müll."**
> *Source: CLAUDE.md (§32)*
> **Context:** Part of Rule 28 regarding the reactivation of old Git repositories. It highlights the value placed on historical data and patterns.

---

## Actionable Insights for Session Management

### Session Startup Protocol
1.  **Read Mandatory Files:** Check `CLAUDE.md`, `GEMINI.md`, and `REGELWERK.md` to establish current state.
2.  **Verify Git Status:** Run `git log -5` to review the most recent changes.
3.  **Run Startup Workflow:** Execute the `/startup` command to align with the Playbook and Registry.
4.  **Check Currency:** Use the WissenHub to identify "outdated" ( >30 days) documents that require updates.

### Feature Development Requirements
*   **Plan First:** Create an `impl-plan_[date]_[title].md` before writing a single line of code.
*   **Use CLI:** Utilize the `dkz` CLI commands (e.g., `dkz status`, `dkz update`) for system control.
*   **Markdown Standards:** Follow the strict skeleton for documentation, including specific header usage (# for title only) and language-tagged code blocks.
*   **Portable Mode:** Ensure new modules can run as standalone files (Portable Mode) by making shared scripts optional.

### Session Conclusion Checklist
1.  **Update Memory:** Document newly built features in the relevant section of `CLAUDE.md` or `GEMINI.md`.
2.  **Sync Knowledge:** Update the `features.json` for modified modules and regenerate Wiki Hub sync data via `generate-sync-data.ps1`.
3.  **Triple Anchor:** Ensure all generated artifacts are stored in the Iceberg Data Layer, the Hub, and are accessible to the Copilot.
4.  **Final Push:** Execute `git push origin master` and verify the result is successful.