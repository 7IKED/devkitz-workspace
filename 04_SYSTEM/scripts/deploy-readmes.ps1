# DEVKiTZ README Deployer — BMAD Design fuer alle Repos
# Farben: weiss (#fff), rot (#fa1e4e), gruen (#00ff88), gelb (#ffb800), blau (#3b82f6), violett (#6366f1)
# Style: for-the-badge Badges, Mermaid Diagrams, Tabellen, Tags

$env:GITHUB_TOKEN = ""

Write-Host "=== DEVKiTZ README Deployer ===" -ForegroundColor Red
Write-Host ""

function Deploy-Readme {
    param([string]$Repo, [string]$Content, [string]$Path = "README.md", [string]$Message)
    
    $existingSha = $null
    try {
        $existingSha = gh api "repos/D-VKITZ/$Repo/contents/$Path" --jq '.sha' 2>$null
    } catch {}
    
    $encoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Content))
    
    $body = @{
        message = $Message
        content = $encoded
    }
    if ($existingSha) {
        $body.sha = $existingSha
    }
    
    $json = $body | ConvertTo-Json -Compress
    $result = echo $json | gh api "repos/D-VKITZ/$Repo/contents/$Path" --method PUT --input - 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $Repo/$Path" -ForegroundColor Green
    } else {
        Write-Host "  [ERR] $Repo/$Path — $result" -ForegroundColor Red
    }
}

# ============================================================
# 1. AGENT-SWARM README
# ============================================================
Write-Host "`n[1/8] agent-swarm README..." -ForegroundColor Yellow

$agentSwarmReadme = @'
<div align="center">

# 🤖 Agent Swarm™

### Multi-Agent Orchestrierung · BotNet™ · NanoChat · Hermes™

*Autonome KI-Agent-Schwärme für das DEVKiTZ™ Ökosystem — Koordination, Kommunikation, Kollaboration*

---

![Version](https://img.shields.io/badge/Version-1.0-fa1e4e?style=for-the-badge&logo=semver&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-00ff88?style=for-the-badge&logo=statuspage&logoColor=white)
![Agents](https://img.shields.io/badge/Agents-7+-6366f1?style=for-the-badge&logo=probot&logoColor=white)
![Bots](https://img.shields.io/badge/NanoBots-2-ffb800?style=for-the-badge&logo=robot&logoColor=black)
![Bridge](https://img.shields.io/badge/NanoChat-Port_3040-3b82f6?style=for-the-badge&logo=chat&logoColor=white)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-3b82f6?style=for-the-badge&logo=opensourceinitiative&logoColor=white)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-fa1e4e?style=for-the-badge&logo=socketdotio&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-Server-6366f1?style=for-the-badge&logo=fastapi&logoColor=white)

![BotNet](https://img.shields.io/badge/BotNet™-Fleet-fa1e4e?style=for-the-badge&logo=robot&logoColor=white)
![Copilot](https://img.shields.io/badge/Copilot-Bridge-00ff88?style=for-the-badge&logo=github&logoColor=white)
![Hermes](https://img.shields.io/badge/Hermes™-Messenger-ffb800?style=for-the-badge&logo=messenger&logoColor=black)
![Iceberg](https://img.shields.io/badge/Iceberg™-Archive-3b82f6?style=for-the-badge&logo=archive&logoColor=white)
![Health](https://img.shields.io/badge/Health_Check-Active-00ff88?style=for-the-badge&logo=heart&logoColor=white)
![Made with](https://img.shields.io/badge/Made_with-DEVKiTZ™-fa1e4e?style=for-the-badge&logo=heart&logoColor=white)

</div>

---

## 📖 Überblick

**Agent Swarm™** ist das Multi-Agent-Orchestrierungssystem von DEVKiTZ™. Es koordiniert autonome KI-Agenten über die **NanoChat Bridge** (Port 3040), ermöglicht Cross-Agent-Kommunikation und verwaltet den gesamten Agent-Lifecycle — von Spawn bis Shutdown.

> **Kernprinzip:** Agenten arbeiten autonom in ihrem Scope, kommunizieren über standardisierte Protokolle und werden durch James™ überwacht.

---

## 🏛️ Architektur

```mermaid
graph TB
    subgraph SWARM["🤖 Agent Swarm™"]
        J["🎯 James™<br/>Guardian"]
        AG["🤖 Antigravity<br/>Gemini"]
        OC["💻 OpenCode<br/>Gemma"]
        DS["🔬 DeepSeek<br/>R1"]
    end

    subgraph BRIDGE["🌉 NanoChat Bridge"]
        NC["📡 Port 3040<br/>WebSocket"]
        HM["📨 Hermes™<br/>Messenger"]
    end

    subgraph STORAGE["💾 Persistenz"]
        LS["📦 localStorage"]
        IC["🧊 Iceberg™<br/>Archive"]
        RN["🔴 REDNOTE<br/>Fehler-DB"]
    end

    J --> AG & OC & DS
    AG & OC & DS <--> NC
    NC --> HM
    HM --> LS & IC & RN

    style SWARM fill:#060608,stroke:#fa1e4e,stroke-width:3px,color:#fff
    style BRIDGE fill:#060608,stroke:#3b82f6,stroke-width:2px,color:#fff
    style STORAGE fill:#060608,stroke:#00ff88,stroke-width:2px,color:#fff
```

---

## 🤖 Agent Fleet

| # | Agent | Runtime | Kanal | Status |
|:--|:------|:--------|:------|:-------|
| 1 | 🎯 **James™** | Guardian | Dashboard | `🟢 Active` |
| 2 | 🤖 **Antigravity** | Gemini | NanoBot | `🟢 Active` |
| 3 | 💻 **OpenCode** | Gemma 4 | NanoBot | `🟢 Active` |
| 4 | 🔬 **DeepSeek** | R1 Cloud | API | `🟡 On-Demand` |
| 5 | 📋 **DkZ PM™** | BMAD | Internal | `🟢 Defined` |
| 6 | 🏗️ **DkZ Architekt™** | BMAD | Internal | `🟢 Defined` |
| 7 | 👨‍💻 **DkZ Developer™** | BMAD | Internal | `🟢 Defined` |

---

## 🌉 NanoChat Bridge

Die Bridge ermöglicht Cross-Agent-Kommunikation über WebSocket:

```
Agent ←→ NanoChat Bridge (Port 3040) ←→ Dashboard
  ↕                                        ↕
REDNOTE.json                          localStorage
```

### Nachrichtenformat

```json
{
  "from": "antigravity",
  "to": "dashboard",
  "type": "status",
  "payload": { "module": "blog-gallery", "status": "complete" },
  "timestamp": "2026-05-28T16:00:00Z"
}
```

---

## 📁 Struktur

```
agent-swarm/
├── README.md           # Diese Datei
├── botnet/             # NanoBot Fleet Definitionen
│   ├── nanobot-antigravity.js
│   └── nanobot-opencode.js
├── bridge/             # NanoChat Bridge Server
│   └── nanochat-server.js
├── hermes/             # Messenger-System
│   └── hermes-core.js
├── iceberg/            # Archiv-System
│   └── catalog.json
└── health/             # Health-Check Module
    └── swarm-health.js
```

---

## 🔗 Links

| Resource | Link |
|:---------|:-----|
| 🏠 DEVKiTZ™ Dashboard | [D-VKITZ.github.io](https://github.com/D-VKITZ/D-VKITZ.github.io) |
| 🤖 BMAD™ Framework | [bmad-framework](https://github.com/D-VKITZ/bmad-framework) |
| 📊 GitHub Projects | [Projects](https://github.com/orgs/D-VKITZ/projects) |

---

<div align="center">

*Teil des [DEVKiTZ™](https://github.com/D-VKITZ) Ökosystems · Made with ❤️ by 777*

</div>
'@

Deploy-Readme -Repo "agent-swarm" -Content $agentSwarmReadme -Message "docs: BMAD-Style README mit Badges, Mermaid, Tags"

# ============================================================
# 2. KERN README
# ============================================================
Write-Host "`n[2/8] KERN README..." -ForegroundColor Yellow

$kernReadme = @'
<div align="center">

# ⚙️ KERN

### Kern-Infrastruktur · Config · Scripts · System-Tools

*Das Fundament des DEVKiTZ™ Ökosystems — Shared Scripts, Konfiguration, Build-Tools und System-Utilities*

---

![Version](https://img.shields.io/badge/Version-1.0-fa1e4e?style=for-the-badge&logo=semver&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-00ff88?style=for-the-badge&logo=statuspage&logoColor=white)
![Scripts](https://img.shields.io/badge/Scripts-20+-6366f1?style=for-the-badge&logo=powershell&logoColor=white)
![Config](https://img.shields.io/badge/Config-Centralized-ffb800?style=for-the-badge&logo=gear&logoColor=black)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-3b82f6?style=for-the-badge&logo=opensourceinitiative&logoColor=white)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PowerShell](https://img.shields.io/badge/PowerShell-7+-5391FE?style=for-the-badge&logo=powershell&logoColor=white)
![Bash](https://img.shields.io/badge/Bash-Scripts-4EAA25?style=for-the-badge&logo=gnubash&logoColor=white)

![Health](https://img.shields.io/badge/Health_Check-Chain-00ff88?style=for-the-badge&logo=heart&logoColor=white)
![REDNOTE](https://img.shields.io/badge/REDNOTE-Error_DB-fa1e4e?style=for-the-badge&logo=database&logoColor=white)
![Automator](https://img.shields.io/badge/Automator-GitHub_API-6366f1?style=for-the-badge&logo=github&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![DuckDB](https://img.shields.io/badge/DuckDB-Analytics-FFF000?style=for-the-badge&logo=duckdb&logoColor=black)
![Made with](https://img.shields.io/badge/Made_with-DEVKiTZ™-fa1e4e?style=for-the-badge&logo=heart&logoColor=white)

</div>

---

## 📖 Überblick

**KERN** ist die zentrale Infrastruktur-Schicht des DEVKiTZ™ Ökosystems. Hier liegen alle System-Scripts, Konfigurationsdateien, Health-Check-Ketten, Build-Tools und Automations-Utilities, die von allen anderen Repos und Modulen benötigt werden.

> **Kernprinzip:** Eine zentrale Quelle der Wahrheit für Konfiguration, Scripts und System-Zustand.

---

## 🏛️ Architektur

```mermaid
graph TB
    subgraph KERN["⚙️ KERN Infrastruktur"]
        SC["📜 Scripts<br/>Python + PS + Bash"]
        CF["⚙️ Config<br/>JSON + YAML"]
        HC["🏥 Health Chain<br/>Automated Checks"]
    end

    subgraph CONSUMERS["📦 Consumers"]
        DB["🖥️ Dashboard<br/>132+ Module"]
        AG["🤖 Agents<br/>BMAD Fleet"]
        SW["🌊 Swarm<br/>NanoChat"]
    end

    subgraph OUTPUT["📊 Output"]
        RN["🔴 REDNOTE<br/>Error DB"]
        FJ["📋 features.json<br/>Registry"]
        LG["📝 Logs<br/>Event Stream"]
    end

    SC & CF & HC --> DB & AG & SW
    DB & AG & SW --> RN & FJ & LG

    style KERN fill:#060608,stroke:#fa1e4e,stroke-width:3px,color:#fff
    style CONSUMERS fill:#060608,stroke:#3b82f6,stroke-width:2px,color:#fff
    style OUTPUT fill:#060608,stroke:#00ff88,stroke-width:2px,color:#fff
```

---

## 📜 Scripts

| Script | Sprache | Zweck |
|:-------|:--------|:------|
| `health-check-chain.py` | Python | Automatisierte System-Prüfungskette |
| `rednote-collector.js` | Node.js | Zentrale Fehler-Datenbank Manager |
| `dkz-project-automator.py` | Python | GitHub Projects Automatisierung |
| `deploy-readmes.ps1` | PowerShell | README Deployment für alle Repos |

---

## 📁 Struktur

```
KERN/
├── README.md              # Diese Datei
├── scripts/               # System-Scripts
│   ├── health-check-chain.py
│   ├── rednote-collector.js
│   └── dkz-project-automator.py
├── config/                # Zentrale Konfiguration
│   ├── ecosystem.json
│   └── agents.json
└── templates/             # Vorlagen
    └── module-template/
```

---

## 🔗 Links

| Resource | Link |
|:---------|:-----|
| 🏠 DEVKiTZ™ Dashboard | [D-VKITZ.github.io](https://github.com/D-VKITZ/D-VKITZ.github.io) |
| 🤖 BMAD™ Framework | [bmad-framework](https://github.com/D-VKITZ/bmad-framework) |
| 🤖 Agent Swarm™ | [agent-swarm](https://github.com/D-VKITZ/agent-swarm) |

---

<div align="center">

*Teil des [DEVKiTZ™](https://github.com/D-VKITZ) Ökosystems · Made with ❤️ by 777*

</div>
'@

Deploy-Readme -Repo "KERN" -Content $kernReadme -Message "docs: BMAD-Style README mit Badges, Mermaid, Tags"

# ============================================================
# 3. D-VKITZ.github.io README
# ============================================================
Write-Host "`n[3/8] D-VKITZ.github.io README..." -ForegroundColor Yellow

$dashboardReadme = @'
<div align="center">

# 🖥️ DEVKiTZ™ Dashboard

### 132+ Module · Kanban · Hub · Builder · Ökosystem

*Das vollständige KI-Entwickler-Dashboard — Vanilla HTML5/CSS3/JS · Glassmorphism Design · Offline-First*

---

![Version](https://img.shields.io/badge/Version-2.0-fa1e4e?style=for-the-badge&logo=semver&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-00ff88?style=for-the-badge&logo=statuspage&logoColor=white)
![Module](https://img.shields.io/badge/Module-132+-6366f1?style=for-the-badge&logo=grid&logoColor=white)
![Shared](https://img.shields.io/badge/Shared_Scripts-15+-ffb800?style=for-the-badge&logo=javascript&logoColor=black)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-3b82f6?style=for-the-badge&logo=opensourceinitiative&logoColor=white)

![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Custom_Props-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Framework](https://img.shields.io/badge/Framework-None™-fa1e4e?style=for-the-badge&logo=cancel&logoColor=white)

![Glassmorphism](https://img.shields.io/badge/Design-Glassmorphism-6366f1?style=for-the-badge&logo=css3&logoColor=white)
![Dark Mode](https://img.shields.io/badge/Theme-Dark_Mode-060608?style=for-the-badge&logo=moon&logoColor=white)
![Offline](https://img.shields.io/badge/Offline-First-00ff88?style=for-the-badge&logo=pwa&logoColor=white)
![localStorage](https://img.shields.io/badge/Storage-localStorage-ffb800?style=for-the-badge&logo=database&logoColor=black)

![Inter](https://img.shields.io/badge/Font-Inter-3b82f6?style=for-the-badge&logo=googlefonts&logoColor=white)
![JetBrains](https://img.shields.io/badge/Code-JetBrains_Mono-fa1e4e?style=for-the-badge&logo=jetbrains&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=for-the-badge&logo=github&logoColor=white)
![Made with](https://img.shields.io/badge/Made_with-DEVKiTZ™-fa1e4e?style=for-the-badge&logo=heart&logoColor=white)

</div>

---

## 📖 Überblick

**DEVKiTZ™ Dashboard** ist das zentrale Frontend des KI-Entwickler-Ökosystems. Mit über **132 Modulen** deckt es alles ab — von Blog-Management über n8n-Workflows bis hin zu Agent-Orchestrierung. Gebaut in reinem Vanilla HTML5/CSS3/JavaScript, ohne jedes Framework.

> **Designprinzip:** Schwarz (#060608) + Neon Rot (#fa1e4e) + Glassmorphism. Jedes Modul ist eigenständig lauffähig und teilt sich Shared Scripts.

---

## 🏛️ Architektur

```mermaid
graph TB
    subgraph DASHBOARD["🖥️ Dashboard"]
        HUB["🏠 Hub<br/>Modul-Launcher"]
        MOD["📦 132+ Module<br/>Eigenständig"]
        SH["🔗 Shared Scripts<br/>dkz-*.js"]
    end

    subgraph MODULES["📦 Modul-Kategorien"]
        M1["📊 Analytics<br/>Charts, Stats"]
        M2["📝 Content<br/>Blog, NLM"]
        M3["🤖 Agents<br/>NanoBot, Swarm"]
        M4["🔧 Tools<br/>Builder, Debug"]
        M5["🎨 Design<br/>Gallery, Vibe"]
    end

    subgraph INFRA["⚙️ Infrastruktur"]
        LS["💾 localStorage"]
        GH["📡 GitHub API"]
        NC["🌉 NanoChat"]
    end

    HUB --> MOD
    MOD --> SH
    MOD --> M1 & M2 & M3 & M4 & M5
    M1 & M2 & M3 & M4 & M5 --> LS & GH & NC

    style DASHBOARD fill:#060608,stroke:#fa1e4e,stroke-width:3px,color:#fff
    style MODULES fill:#060608,stroke:#6366f1,stroke-width:2px,color:#fff
    style INFRA fill:#060608,stroke:#00ff88,stroke-width:2px,color:#fff
```

---

## 📦 Modul-Highlights

| Kategorie | Module | Beispiele |
|:----------|:-------|:----------|
| 🎨 **Design** | 5 | Vibe Gallery, Design Gallery, DkZ Design Studio |
| 📝 **Content** | 8 | Blog Gallery, Blog Commander, NLM Integration |
| 🤖 **Agents** | 4 | NanoBot Center, Agent Dashboard, Copilot |
| 🔧 **Builder** | 6 | Builder Gallery, Mod Builder, Webapp Builder |
| 📊 **Analytics** | 5 | System Check, Loop Dashboard, Health Monitor |
| 🔄 **Workflows** | 4 | n8n Viewer, Workflow Builder, Kanban |
| 🌐 **Hub** | 3 | GitHub Hub, WissenHub, Research Hub |

---

## 🎨 Design System v2

| Token | Wert | Verwendung |
|:------|:-----|:-----------|
| `--bg` | `#060608` | Hintergrund |
| `--card` | `#1a1a1c` | Karten |
| `--accent` | `#fa1e4e` | Akzent (Neon Rot) |
| `--green` | `#00ff88` | Erfolg |
| `--blue` | `#55ACEE` | Info |
| `--yellow` | `#FFB800` | Warnung |
| `--purple` | `#a855f7` | Feature |

---

## 📁 Struktur

```
D-VKITZ.github.io/
├── hub/                   # Modul-Launcher
│   └── index.html
├── modules/               # 132+ Module
│   ├── blog-gallery/
│   ├── design-gallery/
│   ├── vibe-gallery/
│   ├── n8n-viewer/
│   ├── nanobot-center/
│   └── ...
├── shared/                # Shared Scripts
│   ├── dkz-theme.css
│   ├── dkz-navbar.js
│   ├── dkz-console.js
│   └── dkz-debug.js
└── features.json          # Modul-Registry
```

---

## 🔗 Links

| Resource | Link |
|:---------|:-----|
| 🤖 BMAD™ Framework | [bmad-framework](https://github.com/D-VKITZ/bmad-framework) |
| 🤖 Agent Swarm™ | [agent-swarm](https://github.com/D-VKITZ/agent-swarm) |
| ⚙️ KERN | [KERN](https://github.com/D-VKITZ/KERN) |
| 📊 GitHub Projects | [Projects](https://github.com/orgs/D-VKITZ/projects) |

---

<div align="center">

*[DEVKiTZ™](https://github.com/D-VKITZ) Ökosystem · Made with ❤️ by 777*

</div>
'@

Deploy-Readme -Repo "D-VKITZ.github.io" -Content $dashboardReadme -Message "docs: BMAD-Style README mit Badges, Mermaid, Design System"

# ============================================================
# 4. BB-Terminal README
# ============================================================
Write-Host "`n[4/8] BB-Terminal README..." -ForegroundColor Yellow

$bbTerminalReadme = @'
<div align="center">

# 💻 BB-Terminal

### Browser-Based Terminal · WebShell · DEVKiTZ™ CLI

*Vollständiges Terminal-Interface im Browser — Dark Theme, Shortcuts, Scriptable*

---

![Version](https://img.shields.io/badge/Version-1.0-fa1e4e?style=for-the-badge&logo=semver&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-00ff88?style=for-the-badge&logo=statuspage&logoColor=white)
![Terminal](https://img.shields.io/badge/Terminal-Browser-6366f1?style=for-the-badge&logo=windowsterminal&logoColor=white)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-3b82f6?style=for-the-badge&logo=opensourceinitiative&logoColor=white)

![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Dark_Theme-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JetBrains Mono](https://img.shields.io/badge/Font-JetBrains_Mono-fa1e4e?style=for-the-badge&logo=jetbrains&logoColor=white)

![Keyboard](https://img.shields.io/badge/Shortcuts-Active-00ff88?style=for-the-badge&logo=keyboard&logoColor=white)
![History](https://img.shields.io/badge/History-localStorage-ffb800?style=for-the-badge&logo=history&logoColor=black)
![Scriptable](https://img.shields.io/badge/Scriptable-Commands-6366f1?style=for-the-badge&logo=code&logoColor=white)
![Made with](https://img.shields.io/badge/Made_with-DEVKiTZ™-fa1e4e?style=for-the-badge&logo=heart&logoColor=white)

</div>

---

## 📖 Überblick

**BB-Terminal** ist ein voll funktionsfähiges Browser-Terminal mit DEVKiTZ™ Branding. Es bietet eine CLI-Oberfläche direkt im Browser — mit Command History, Auto-Completion, Keyboard Shortcuts und einem dunklen Neon-Theme.

> **Verwendung:** Debugging, Quick-Access zu DkZ-Commands, Agent-Kommunikation und System-Status.

---

## 🔗 Links

| Resource | Link |
|:---------|:-----|
| 🏠 DEVKiTZ™ Dashboard | [D-VKITZ.github.io](https://github.com/D-VKITZ/D-VKITZ.github.io) |
| 🤖 BMAD™ Framework | [bmad-framework](https://github.com/D-VKITZ/bmad-framework) |

---

<div align="center">

*Teil des [DEVKiTZ™](https://github.com/D-VKITZ) Ökosystems · Made with ❤️ by 777*

</div>
'@

Deploy-Readme -Repo "BB-Terminal" -Content $bbTerminalReadme -Message "docs: BMAD-Style README mit Badges und Tags"

Write-Host "`n=== DONE ===" -ForegroundColor Green
