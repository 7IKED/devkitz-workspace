# ⚡ n8n Workflow Viewer — MOD-083

> Visueller n8n Workflow Viewer und Builder mit Drawflow Node-Editor
> Teil des DEVKiTZ™ Dashboard Oekosystems

---

## 🖥️ Screenshot

```
┌─────────────────────────────────────────────────────┐
│  ⚡ n8n Workflow Viewer         🔍 Search...  📤 📥 │
├──────────┬──────────────────────────────────────────┤
│ Templates│                                          │
│ 3,815+   │      ┌──────┐    ┌──────┐    ┌──────┐   │
│ ─────────│      │ HTTP │───▶│ Code │───▶│ Send │   │
│ 🏷️ Filters│      │ Node │    │ Node │    │ Email│   │
│ webhook  │      └──────┘    └──────┘    └──────┘   │
│ schedule │                                          │
│ ai_agent │          Drawflow Canvas                 │
│ postgres │                                          │
│ mysql    │                                          │
│ notion   │      ┌──────┐    ┌──────┐               │
│ slack    │      │Set   │───▶│Merge │               │
│ openai   │      │Data  │    │     │               │
└──────────┴──────┴──────┘────┴──────┘───────────────┘
```

---

## ✨ Features

| # | Feature | Status |
|:--|:--------|:-------|
| F001 | 🎨 Drawflow Node-Editor (ComfyUI-Style) | ✅ Done |
| F002 | 📋 Template-Browser (3.815+ Templates) | ✅ Done |
| F003 | 🏷️ Tag-Filter (Top 12 Tags) | ✅ Done |
| F004 | 🔍 Volltextsuche (Name, Nodes, Tags) | ✅ Done |
| F005 | ℹ️ Info-Panel (Node & Workflow Details) | ✅ Done |
| F006 | 📤 JSON Import/Export (n8n + Drawflow) | ✅ Done |
| F007 | ⌨️ Keyboard Shortcuts | ✅ Done |
| F008 | 🌐 n8n API Bridge (SSH Tunnel → KVM 8) | 🔜 Planned |
| F009 | 📡 Live-Status (aktive Workflows) | 🔜 Planned |
| F010 | 🤖 Copilot Integration (.n8n Befehl) | 🔜 Planned |
| F011 | 🔐 DEEPKEEP Templates Integration | 🔜 Planned |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:---------|:-------|
| `Ctrl + E` | Export Workflow |
| `Ctrl + I` | Import Workflow |
| `Ctrl + F` | Focus Search |
| `Esc` | Close Info Panel |

---

## 🛠️ Tech Stack

- **Node-Editor:** Drawflow v0.0.60 (Vanilla JS, MIT)
- **Design:** DkZ™ Design System v2
- **Data:** `n8n-catalog.json` (3.815 Templates)
- **Fonts:** Inter + JetBrains Mono (Google Fonts)
- **Portable:** Shared Scripts optional

---

## 🌐 Server Connection

```
Browser → n8n Viewer → SSH Tunnel → KVM 8 → n8n API
                                   (:5678)
```

| Server | Alias | Role |
|:-------|:------|:-----|
| KVM 8 (VPS 1298466) | `ssh kvm8` | n8n Queue Mode |
| KVM 4 (VPS 1368349) | `ssh openclaw` | OpenClaw |
| KVM 4 (VPS 1360185) | `ssh test-server` | Workflow Tests |

---

## 🗺️ VPS Infrastructure

```
                    ┌─────────────────────────────────────────────────┐
                    │          DEVKiTZ™ ECOSYSTEM OVERVIEW            │
                    │           143 Module · 7 Agenten                │
                    └──────────────────────┬──────────────────────────┘
                                           │
             ┌─────────────────────────────┼──────────────────────────────┐
             │                             │                              │
    ┌────────▼────────┐          ┌─────────▼────────┐          ┌─────────▼────────┐
    │  🖥️ LOKAL       │          │  🌐 VPS LAYER    │          │  ☁️ CLOUD        │
    │  Windows 11     │          │  Hostinger KVM    │          │  GCP + CF + API  │
    │  C:\DEVKiTZ     │          │  Linux Docker     │          │  SaaS Services   │
    └────────┬────────┘          └─────────┬────────┘          └─────────┬────────┘
             │                             │                              │
             ▼                             ▼                              ▼
       140 Module                    3x KVM VPS                     Cloudflare
       53 Skills                     12+ Container                  GitHub Actions
       77 Workflows                  8 LLM Models                   CodeRabbit
```

### KVM8 VPS (devkitz.eu) — Docker Services

```
┌──────────────────────────────────────────────────────┐
│  KVM8 · 8 vCPU · 16 GB RAM · 200 GB SSD             │
│  devkitz.eu / devkitz.sites / api.devkitz.eu         │
├──────────────────────────────────────────────────────┤
│  🟢 nginx-proxy          :80/:443  Reverse Proxy     │
│  🟢 dkz-ontherun         :3040     MCP + NanoChat    │
│  🟢 dkz-webhook-hub      :9090     Webhooks          │
│  🟢 dkz-postgres         :5432     PostgreSQL 16     │
│  🟢 dkz-redis            :6379     Redis AOF 256MB   │
│  🟡 dkz-n8n              :5678     Queue Mode        │
│  🟡 dkz-docker-db        :9890     SQLite + Express  │
│  🟡 telegram-bot         :8443     BotNet™           │
│  🟡 watchtower           auto      Auto-Update       │
└──────────────────────────────────────────────────────┘
```

### LLM Fleet (vLLM + llama-swap)

```
┌──────────────────────────────────────────────────────┐
│  :8080  llama-swap        Router/Proxy               │
│         ├── Heartbeat: Gemma4 E2B (Always-On)        │
│         ├── Swap Pool: Qwen3/Gemma4 (TTL 300s)       │
│         └── Solo: 26B+ Models (TTL 180s)             │
│                                                      │
│  :8811  vLLM Engine       OpenAI-compatible           │
│         /v1/models · /v1/chat/completions             │
│                                                      │
│  MODELS:                                             │
│  ❤️ Gemma4 E2B      ~2 GB   Heartbeat   ALWAYS       │
│  ⚡ Gemma4 E4B      ~3 GB   Balance     SWAP         │
│  🚀 Qwen3 4B        ~3 GB   Quick       SWAP         │
│  💻 Qwen3.5 9B      ~6 GB   Coder       SWAP         │
│  🧠 Qwen3 14B       ~10 GB  Standard    SWAP         │
│  ⚡ Gemma4 26B MoE  ~16 GB  Frontend    SOLO         │
│  🔬 Qwen3.6 27B     ~17 GB  Dense       SOLO         │
│  🏆 Qwen3.6 35B MoE ~22 GB  Backend     SOLO         │
└──────────────────────────────────────────────────────┘
```

### Network Flow

```
  USER (Browser/Mobile)
       │
       ▼
  ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
  │ Cloudflare  │────▶│ KVM8 VPS     │────▶│ LLM Dedicated    │
  │ DNS + CDN   │     │ nginx :443   │     │ vLLM :8811       │
  │ SSL/DDoS    │     │ node  :3040  │     │ llama-swap :8080 │
  └─────────────┘     └──────┬───────┘     └──────────────────┘
                             │
                    ┌────────┼────────────────┐
                    │        │                │
              ┌─────▼──┐ ┌──▼────┐     ┌─────▼──────┐
              │ n8n    │ │Webhook│     │ Telegram   │
              │ :5678  │ │ :9090 │     │ Bot :8443  │
              └────────┘ └───────┘     └────────────┘
```

---

## 📊 Status

| Component | Status | Blocker |
|:----------|:-------|:--------|
| KVM8 VPS (devkitz.eu) | 🟢 LIVE | — |
| vLLM / llama-swap | 🔴 AUTH 401 | Token/Auth konfigurieren |
| DkZ Gateway :3040 | 🟢 LIVE | — |
| n8n :5678 | 🟡 STANDBY | Docker start noetig |
| Cloudflare DNS | 🟢 LIVE | — |
| GitHub Actions | 🟢 LIVE | — |
| CodeRabbit | 🟢 LIVE | — |

---

## 📂 File Structure

```
n8n-viewer/
├── index.html              # Hauptseite (Drawflow Editor)
├── n8n-viewer.css           # DkZ Design System Styles
├── n8n-viewer.js            # Viewer Logic + Drawflow Init
├── n8n-catalog.json         # 3.815 Workflow Templates (9.5 MB)
├── n8n-catalog.js           # JS Export der Templates
├── features.json            # Feature Registry
├── README.md                # Diese Datei
└── infographics/            # Diagramme + Visuals
```

---

## 🔗 Links

| Resource | URL |
|:---------|:----|
| 🌐 Dashboard | [devkitz.sites](https://devkitz.sites) |
| 🏠 Landing | [devkitz.eu](https://devkitz.eu) |
| 📱 App | [dkz.app](https://dkz.app) |
| 📦 GitHub | [D-VKITZ](https://github.com/D-VKITZ) |
| 📖 Wiki | [DEVKiTZ Wiki](https://devkitz.eu/wiki) |

---

<sub>DEVKiTZ™ · n8n Workflow Viewer · v1.00.0 · 2026</sub>
<sub>🌐 [devkitz.eu](https://devkitz.eu) · 📱 [dkz.app](https://dkz.app) · 📦 [GitHub](https://github.com/D-VKITZ)</sub>
