# 🔄 Flussdiagramme — DEVKiTZ™ Ökosystem

> Architektur-Übersicht aller 20 Projekte · Stand: 2026-05-10

---

## 📊 Gesamt-Ökosystem

```mermaid
graph TB
    User[👤 User] --> Hub[🏠 Dashboard Hub]
    Hub --> Modules[📦 89+ Module]
    Hub --> Wispe[🗣️ Wispe Voice]
    Hub --> Wiki[📚 Wiki Hub]
    
    Modules --> Shared[🔧 Shared Scripts]
    Shared --> Theme[🎨 DkZ Theme v2]
    Shared --> Navbar[☰ Navbar]
    Shared --> Copilot[🤖 Copilot]
    
    Hub --> ONTHERUN[⚡ ONTHERUN MCP]
    ONTHERUN --> LLMs[🧠 15+ LLM Provider]
    ONTHERUN --> NanoBot[🤖 NanoBot Router]
    NanoBot --> Agents[📋 12 Agenten]
    
    Agents --> NanoChat[💬 NanoChat WS]
    NanoChat --> Tasks[📋 Task Channel]
    NanoChat --> Reviews[🔍 Review Channel]
    NanoChat --> Alerts[🚨 Alert Channel]
    
    Hub --> DataLake[🗄️ DataLakeHouse]
    DataLake --> DuckDB[(DuckDB)]
    DataLake --> Iceberg[(Iceberg)]
    
    Hub --> SecondBrain[🧠 Second Brain]
    SecondBrain --> Obsidian[📓 Obsidian Vault]
    SecondBrain --> Search[🔍 Cross-Repo Search]
    
    Hub --> GitHub[📊 GitHub]
    GitHub --> Kanban[📋 Kanban Board]
    GitHub --> Issues[🎫 71 Issues]
    GitHub --> Repos[📦 20+ Repos]
```

---

## 📦 Projekte (20)

### 1. Dashboard Hub

```mermaid
graph LR
    User[User] --> Hub[Hub index.html]
    Hub --> Discovery[Auto-Discovery]
    Discovery --> Module[89+ Module]
    Module --> SharedScripts[Shared Scripts]
    SharedScripts --> LocalStorage[(localStorage)]
```

### 2. DataLakeHouse™

```mermaid
graph LR
    RawData[Raw Data] --> DuckDB[(DuckDB)]
    DuckDB --> Iceberg[(Apache Iceberg)]
    Iceberg --> Analytics[Analytics Engine]
    Analytics --> Dashboard[Dashboard Widgets]
```

### 3. FlyerPRO™

```mermaid
graph LR
    User[User] --> Editor[Pro Editor]
    Editor --> ColorEngine[HSV Color Engine]
    ColorEngine --> Templates[Template System]
    Templates --> Export[4K Export PNG/PDF]
```

### 4. Flyer Engine

```mermaid
graph LR
    Input[User Input] --> Canvas[HTML5 Canvas]
    Canvas --> Layers[Layer System]
    Layers --> Render[Render Pipeline]
    Render --> PNG[PNG Export]
```

### 5. Domain Control

```mermaid
graph LR
    DNS[DNS Config] --> Cloudflare[Cloudflare CDN]
    Cloudflare --> Nginx[Nginx Reverse Proxy]
    Nginx --> VPS[Hostinger VPS]
    VPS --> Sites[49 Sites]
```

### 6. Doc Engine

```mermaid
graph LR
    Markdown[Markdown Input] --> Parser[MD Parser]
    Parser --> Template[DkZ Template]
    Template --> HTML[HTML Output]
    HTML --> PDF[PDF Export]
```

### 7. DkZ Core (OpenClaw)

```mermaid
graph LR
    Constitution[Constitution] --> Agents[BMAD Agenten]
    Agents --> Tasks[Task Decomposition]
    Tasks --> Code[Code Generation]
    Code --> Review[Code Review]
```

### 8. AiAiKirk

```mermaid
graph LR
    Sources[Quellen] --> NLM[NotebookLM]
    NLM --> Podcast[Audio Podcast]
    NLM --> MindMap[Mind Map]
    MindMap --> Archive[WissenHub Archive]
```

### 9. Autopilot

```mermaid
graph LR
    Task[Task Input] --> Classifier[NanoBot Classifier]
    Classifier --> Agent[Zugewiesener Agent]
    Agent --> Execute[Code Execution]
    Execute --> Verify[Auto-Verify]
```

### 10. devkitz.eu Landing

```mermaid
graph LR
    DNS[DNS] --> Cloudflare[Cloudflare]
    Cloudflare --> Traefik[Traefik Proxy]
    Traefik --> Nginx[Nginx Container]
    Nginx --> HTML[Welcome Page]
```

### 11. Wiki Hub™

```mermaid
graph LR
    Sources[9 Quellen] --> Parser[Sync Parser]
    Parser --> Index[4121 Einträge]
    Index --> Search[Volltextsuche]
    Search --> Display[Wiki Viewer]
```

### 12. Wispe™ Voice Agent

```mermaid
graph LR
    Voice[🎤 Voice Input] --> STT[Speech-to-Text]
    STT --> LLM[LLM Processing]
    LLM --> Brain[Brain View]
    Brain --> TTS[Text-to-Speech]
    TTS --> Audio[🔊 Audio Output]
```

### 13. Trading Agents PRO

```mermaid
graph LR
    Market[📈 Market Data] --> Signals[Signal Detection]
    Signals --> Strategy[Strategy Engine]
    Strategy --> Execute[Order Execution]
    Execute --> Report[Performance Report]
```

### 14. Chrome Extensions

```mermaid
graph LR
    Popup[Extension Popup] --> SW[Service Worker]
    SW --> API[Dashboard API]
    API --> Dashboard[DkZ Dashboard]
    Dashboard --> Sync[Cross-Device Sync]
```

### 15. FishTTS

```mermaid
graph LR
    Text[Text Input] --> Tokenizer[Tokenizer]
    Tokenizer --> Model[TTS Model]
    Model --> Vocoder[Vocoder]
    Vocoder --> Audio[Audio WAV]
```

### 16. ComfyUI Bridge

```mermaid
graph LR
    Prompt[Prompt] --> Workflow[ComfyUI Workflow]
    Workflow --> ComfyUI[ComfyUI Engine]
    ComfyUI --> Generation[Image/Video Gen]
    Generation --> Output[Asset Output]
```

### 17. Passkeys

```mermaid
graph LR
    Register[Registration] --> Challenge[Server Challenge]
    Challenge --> Auth[Authenticator]
    Auth --> Verify[Server Verify]
    Verify --> Login[Authenticated Session]
```

### 18. Second Brain

```mermaid
graph LR
    Raw[raw/ Dateien] --> Obsidian[Obsidian Vault]
    Obsidian --> Skills[01_Skills]
    Skills --> Search[09_Search Index]
    Search --> Agents[Agent Access]
```

### 19. ONTHERUN™ MCP

```mermaid
graph LR
    Request[MCP Request] --> Router[Tool Router]
    Router --> Tool[34+ Tools]
    Tool --> LLM[LLM Provider]
    LLM --> Response[JSON Response]
```

### 20. Graphify

```mermaid
graph LR
    Data[Knowledge Data] --> Nodes[Graph Nodes]
    Nodes --> Edges[Relationships]
    Edges --> Layout[Force Layout]
    Layout --> Interactive[Interactive UI]
```

---

## 📋 Repo-Registry

| # | Repo | Beschreibung | Visibility |
|:--|:-----|:-------------|:-----------|
| 1 | [dkz-dashboard](https://github.com/7IKED/dkz-dashboard) | 89+ Module Dashboard | 🔒 Private |
| 2 | [dkz-datalakehouse](https://github.com/7IKED/dkz-datalakehouse) | DuckDB + Iceberg | 🔒 Private |
| 3 | [dkz-flyer-pro](https://github.com/7IKED/dkz-flyer-pro) | FlyerPRO Design-Tool | 🔒 Private |
| 4 | [dkz-flyer-engine](https://github.com/7IKED/dkz-flyer-engine) | Canvas Flyer Generator | 🔒 Private |
| 5 | [dkz-domain-control](https://github.com/7IKED/dkz-domain-control) | 49 Domain Management | 🔒 Private |
| 6 | [dkz-doc-engine](https://github.com/7IKED/dkz-doc-engine) | Dokumenten-Generator | 🔒 Private |
| 7 | [dkz-core](https://github.com/7IKED/dkz-core) | Kern-Projekt OpenClaw | 🔒 Private |
| 8 | [dkz-aiaikirk](https://github.com/7IKED/dkz-aiaikirk) | NotebookLM + AI | 🔒 Private |
| 9 | [dkz-autopilot](https://github.com/7IKED/dkz-autopilot) | Agent-Workflow | 🔒 Private |
| 10 | [dkz-landing-eu](https://github.com/7IKED/dkz-landing-eu) | devkitz.eu | 🔒 Private |
| 11 | [dkz-wiki-hub](https://github.com/7IKED/dkz-wiki-hub) | Wissensbaum 4121 | 🔒 Private |
| 12 | [dkz-wispe](https://github.com/7IKED/dkz-wispe) | Voice Agent | 🔒 Private |
| 13 | [dkz-trading-agents](https://github.com/7IKED/dkz-trading-agents) | Trading PRO | 🔒 Private |
| 14 | [dkz-chrome-extensions](https://github.com/7IKED/dkz-chrome-extensions) | Chrome DkZ Hub | 🔒 Private |
| 15 | [dkz-fishtts](https://github.com/7IKED/dkz-fishtts) | Text-to-Speech | 🔒 Private |
| 16 | [dkz-comfyui-bridge](https://github.com/7IKED/dkz-comfyui-bridge) | ComfyUI Multimodal | 🔒 Private |
| 17 | [dkz-passkeys](https://github.com/7IKED/dkz-passkeys) | WebAuthn | 🔒 Private |
| 18 | [dkz-second-brain](https://github.com/7IKED/dkz-second-brain) | Obsidian Knowledge | 🔒 Private |
| 19 | [dkz-ontherun](https://github.com/7IKED/dkz-ontherun) | MCP Server | 🔒 Private |
| 20 | [dkz-graphify](https://github.com/7IKED/dkz-graphify) | Knowledge Graph | 🔒 Private |
| — | [devkitz-workspace](https://github.com/7IKED/devkitz-workspace) | **Hauptrepo (alles)** | 🔒 Private |

---

> **✨ DkZ devkitz** — 21 Repos · 71 Issues · Kanban Board
