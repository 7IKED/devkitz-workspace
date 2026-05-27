---
description: Awesome Prompt-Datenbanken und System-Prompts von GitHub klonen und ins Ökosystem integrieren
---

# Prompt Database Download & Integration

## Quellen (Awesome GitHub Repos)

### System Prompts
| Repo | Beschreibung | URL |
|:-----|:-------------|:----|
| awesome-ai-system-prompts | System-Prompts für ChatGPT, Claude, Perplexity, MetaAI | github.com/dontriskit/awesome-ai-system-prompts |
| awesome-system-prompts | Prompts von Augment Code, Claude Code, Devin, Gemini | github.com/EliFuzz/awesome-system-prompts |
| system-prompts-and-models | System-Prompts für alle großen AI Tools | github.com/x1xhlol/system-prompts-and-models-of-ai-tools |

### Prompt Collections
| Repo | Beschreibung | URL |
|:-----|:-------------|:----|
| awesome-chatgpt-prompts | 150+ ChatGPT Prompts für verschiedene Rollen | github.com/f/awesome-chatgpt-prompts |
| awesome-prompts | Kuratierte Prompts aus GPTs Store | github.com/ai-boost/awesome-prompts |
| Prompt-Engineering-Guide | Guides, Papers, Notebooks zu Prompt Engineering | github.com/dair-ai/Prompt-Engineering-Guide |

### LLM Skills & Workflows
| Repo | Beschreibung | URL |
|:-----|:-------------|:----|
| awesome-llm-skills | 60+ Skills für Claude Code, Codex, Gemini CLI | github.com/Prat011/awesome-llm-skills |
| claude-command-and-control | Claude Commands, Agent-Templates, Orchestrierung | github.com/enuno/claude-command-and-control |
| awesome-n8n-templates | 280+ n8n Automation-Workflows | github.com/enescingoz/awesome-n8n-templates |

## Clone-Befehle
```bash
# System Prompts
git clone --depth 1 https://github.com/dontriskit/awesome-ai-system-prompts.git 02_RESEARCH/awesome-ai-system-prompts
git clone --depth 1 https://github.com/EliFuzz/awesome-system-prompts.git 02_RESEARCH/awesome-system-prompts
git clone --depth 1 https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools.git 02_RESEARCH/system-prompts-ai-tools

# Prompt Collections
git clone --depth 1 https://github.com/f/awesome-chatgpt-prompts.git 02_RESEARCH/awesome-chatgpt-prompts
git clone --depth 1 https://github.com/dair-ai/Prompt-Engineering-Guide.git 02_RESEARCH/prompt-engineering-guide

# LLM Skills
git clone --depth 1 https://github.com/Prat011/awesome-llm-skills.git 02_RESEARCH/awesome-llm-skills
git clone --depth 1 https://github.com/enuno/claude-command-and-control.git 02_RESEARCH/claude-command-and-control

# n8n Workflows
git clone --depth 1 https://github.com/enescingoz/awesome-n8n-templates.git 02_RESEARCH/awesome-n8n-templates
```

## Integration ins DkZ™ Ökosystem
1. Repos klonen → `02_RESEARCH/` Ordner
2. Prompts extrahieren → `dkz-prompt-templates.js` erweitern
3. Skills adaptieren → `.agents/skills/` als SKILL.md
4. Workflows adaptieren → `.agents/workflows/` als Workflow
5. WissenHub → Catalog aktualisieren
6. Copilot → Zugriff auf alle Daten für Suche
