# 🤖 DkZ™ Free AI Hub — User Guide

> **19 Provider · 50 Modelle · 10 Tabs · $0.00 Kosten**

---

## 📥 Installation

### Voraussetzungen
- Node.js 18+ installiert
- Git (optional, für Updates)

### Quick Start
```bash
# 1. Repository klonen (falls nicht vorhanden)
git clone https://github.com/777/devkitz-ecosystem.git C:\DEVKiTZ

# 2. Gateway starten
cd C:\DEVKiTZ\ONTHERUN
npm install
npm run gateway

# 3. Hub öffnen
# → http://localhost:3040/hub/
```

### Erster Start-Check
Nach dem Starten sollte im Header **"GATEWAY ✓"** (grün) erscheinen.
Falls nicht, prüfe ob Port 3040 frei ist: `netstat -ano | findstr 3040`

---

## 🎯 Benutzung

### Tab-Übersicht

| Tab | Funktion | Provider | Shortcut |
|:----|:---------|:---------|:---------|
| 🌐 Provider | Alle 19 Provider mit Status | — | — |
| 💬 Chat | KI-Chat mit Cascade | Pollinations → OpenRouter → HF → Groq | Enter |
| 🎨 Bild | Bildgenerierung | Pollinations FLUX, HF SDXL | Enter |
| 🎬 Video | Videogenerierung | Pollinations | Enter |
| 🔊 Audio | Text-to-Speech | Browser SpeechSynthesis | Enter |
| 🎙️ STT | Speech-to-Text | Whisper Large v3, SeamlessM4T | — |
| 📷 OCR | Texterkennung | TrOCR, GOT-OCR2, Qwen2-VL | — |
| 🎵 Musik | Beats, Songs, SFX | MusicGen, Suno, AudioLDM2 | Enter |
| 🔬 Research | Tiefenanalyse | DeepSeek-R1, QwQ-32B, Gemini | Enter |
| 🛒 Commerce | Shop-Assistent | Qwen AiCo (Alibaba) | Enter |

### Chat benutzen
1. Tab **"💬 Chat"** anklicken
2. Provider wählen: **Auto (Cascade)** rotiert durch 4 Free Provider
3. Nachricht eingeben + **Enter** oder **Senden ▶**
4. Antwort erscheint mit Provider-Tag und Kosten ($0.00)

### STT benutzen (Speech-to-Text)
1. Tab **"🎙️ STT"** anklicken
2. Modell wählen (Whisper Large v3 empfohlen)
3. Audio-Datei auswählen (.mp3, .wav, .ogg, .m4a)
4. **"Transkribieren 🎙️"** klicken
5. Text erscheint in der Ausgabe

### OCR benutzen
1. Tab **"📷 OCR"** anklicken
2. Modell wählen (TrOCR für Handschrift, GOT-OCR für Dokumente)
3. Bild-Datei auswählen (.png, .jpg, .webp)
4. **"Erkennen 📷"** klicken

### Commerce / AiCo benutzen
1. Tab **"🛒 Commerce"** anklicken
2. Modus wählen: Produktbeschreibung, E-Mail, Shop-SEO, Übersetzung
3. Produkt/Auftrag beschreiben
4. **"Generieren 🛒"** klicken

---

## ⌨️ Shortcuts & Trigger

| Shortcut | Aktion |
|:---------|:-------|
| `Ctrl+T` | TestStraße Panel öffnen/schließen |
| `Enter` | Nachricht/Prompt senden (in jedem Tab) |
| `Tab` | Zwischen Tabs navigieren |

---

## 🔌 Einbindung in andere Projekte

### Als iframe
```html
<iframe src="http://localhost:3040/hub/" width="100%" height="800" frameborder="0"></iframe>
```

### Als API (Terminal/CLI)
```bash
# Chat
curl -X POST http://localhost:3040/api/v1/free-hub/cascade \
  -H "Content-Type: application/json" \
  -d '{"message":"Erkläre mir React Hooks"}'

# SEO Audit
curl -X POST http://localhost:3040/api/v1/seo/full-audit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Health
curl http://localhost:3040/api/v1/health
```

### Als PowerShell
```powershell
# Chat
$body = @{message="Was ist DkZ?"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3040/api/v1/free-hub/cascade" -Method Post -ContentType "application/json" -Body $body

# SEO Audit
$body = @{url="https://devkitz.eu"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3040/api/v1/seo/full-audit" -Method Post -ContentType "application/json" -Body $body
```

---

## 🧪 TestStraße v3.0.0

### Starten
Drücke `Ctrl+T` auf jeder DkZ-Seite.

### 10 Test-Kategorien (50+ Checks)

| Kategorie | Tests | Prüft |
|:----------|:------|:------|
| 🧪 Custom | variabel | Modul-spezifische Tests |
| 📦 Shared Scripts | 4+ | dkz-debug, dkz-guide, dkz-navbar |
| 🏗️ DOM Health | 8+ | Viewport, H1, Charset, Links |
| 🤖 Agentic | 6 | llms.txt, robots.txt, ai:model, Shortcuts, API |
| 🔍 Social SEO | 11 | OG Tags, Twitter Cards, JSON-LD, Canonical |
| 💼 Business SEO | 8 | Meta Description, Keywords, Lang, Preconnect |
| 🤖 AI-SEO | 8 | ai:description, Heading-Hierarchie, Content |
| ⚡ Performance Pro | 7 | FCP, LCP, TTI, Resources, Page Size |
| 🛡️ Security | 6 | HTTPS, Mixed Content, noopener, CSRF |
| 📊 Metriken | 4 | DOM Load, Paint Time, Memory |

### API
```javascript
DkzTest.assert(condition, 'Label')        // Custom Assertion
DkzTest.assertExists('#element', 'Name')   // DOM Element Check
DkzTest.assertLocalStorage('key', 'Name')  // Storage Check
DkzTest.assertPerformance(fn, 100, 'Name') // Perf Check
DkzTest.assertNoConsoleErrors()            // Console Clean
DkzTest.assertResponsive()                 // Viewport Check
DkzTest.assertAccessibility()              // A11y Check
DkzTest.run()                              // Alle Tests ausführen
DkzTest.runTestStrasse()                   // Volle Pipeline
DkzTest.exportReport()                     // JSON Export
```

---

## 📋 Prefixes & Patterns

### DkZ Tag-System
```
@DKZ:RULES → Regel-Referenz
@DKZ:TAG → [SYS:xxx] [CAT:xxx] [LANG:xxx]
@DKZ:MODULE → Modul-Name
```

### API Prefixes
```
/api/v1/chat          → LLM Chat
/api/v1/free-hub/     → Free Hub Cascade
/api/v1/seo/          → SEO Audits
/api/v1/health        → System Health
/api/v1/modules       → Modul-Registry
/api/v1/pi-agent/     → Agent Orchestration
/api/v1/mcp/          → MCP Server Bridge
```

### Provider Cascade Order
```
1. Pollinations  (kein Key, immer verfügbar)
2. OpenRouter    (Free Models, Key optional)
3. HuggingFace   (Free Inference, Key optional)
4. Groq          (Free Tier, Key required)
```

---

## 📁 Dateistruktur
```
01_PROJECTS/01_dashboard/modules/free-ai-hub/
├── index.html      ← Hub WebUI (19 Provider, 10 Tabs)
├── llms.txt        ← Maschinenlesbare Dokumentation
└── README.md       ← Dieses Handbuch

ONTHERUN/
├── gateway/server.js        ← Express Gateway (Port 3040)
├── gateway/routes/seo.js    ← SEO Audit Endpoints
├── gateway/routes/chat.js   ← Chat Routing
└── .env                     ← API Keys Konfiguration

01_PROJECTS/01_dashboard/shared/
└── dkz-test.js              ← TestStraße v3.0.0
```
