# ⚡ n8n Workflow Viewer — MOD-083

> Visueller n8n Workflow Viewer und Builder mit Drawflow Node-Editor

---

## Features

| # | Feature | Status |
|:--|:--------|:-------|
| F001 | Drawflow Node-Editor (ComfyUI-Style) | ✅ Done |
| F002 | Template-Browser (3.815+ Templates) | ✅ Done |
| F003 | Tag-Filter (Top 12 Tags) | ✅ Done |
| F004 | Volltextsuche (Name, Nodes, Tags) | ✅ Done |
| F005 | Info-Panel (Node & Workflow Details) | ✅ Done |
| F006 | JSON Import/Export (n8n + Drawflow) | ✅ Done |
| F007 | Keyboard Shortcuts | ✅ Done |
| F008 | n8n API Bridge (SSH Tunnel → KVM 8) | 🔜 Planned |
| F009 | Live-Status (aktive Workflows) | 🔜 Planned |
| F010 | Copilot Integration (.n8n Befehl) | 🔜 Planned |
| F011 | DEEPKEEP Templates Integration | 🔜 Planned |

---

## Keyboard Shortcuts

| Tastenkombination | Aktion |
|:------------------|:-------|
| `Ctrl + E` | Workflow exportieren |
| `Ctrl + I` | Workflow importieren |
| `Ctrl + F` | Suche fokussieren |
| `Esc` | Info-Panel schließen |

---

## Tech Stack

- **Node-Editor:** Drawflow v0.0.60 (Vanilla JS, MIT)
- **Design:** DkZ™ Design System v2
- **Daten:** `n8n-catalog.json` (3.815 Templates)
- **Portabel:** Shared Scripts optional

---

## Server-Verbindung

```
Browser → n8n Viewer → SSH Tunnel → KVM 8 → n8n API
                                   (:5678)
```

| Server | Alias | Rolle |
|:-------|:------|:------|
| KVM 8 (VPS 1298466) | `ssh kvm8` | n8n Queue Mode |
| KVM 4 (VPS 1368349) | `ssh openclaw` | OpenClaw |
| KVM 4 (VPS 1360185) | `ssh test-server` | Workflow Tests |
