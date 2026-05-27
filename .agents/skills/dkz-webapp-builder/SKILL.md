# 🏗️ DkZ™ WebApp Builder — Master Skill

> **Skill-ID:** `dkz-webapp-builder`
> **Version:** 2.0.0
> **Alias:** `wab`, `builder`, `dkz-build`
> **Terminal:** `dkz skill:wab` oder `dkz build`
> **Zweck:** Baut und erweitert DkZ™ devkitz Web App Module
> **Für:** ALLE LLMs (Antigravity, Claude, ChatGPT, Gemini, Hermes, DeepSeek, Codex)

---

## 📋 PFLICHT: Vor JEDER Nutzung lesen

Dieser Skill definiert die **exakte Bauweise** für alle Module, Panels, Boards und UI-Elemente der DkZ™ devkitz Web App V2. Jeder LLM der diesen Skill liest MUSS die gleiche Ausgabe produzieren.

---

## 🎯 Architektur-Mandat

```
TECHNOLOGIE:     Vanilla JS ES6+ — KEIN React, Vue, Angular, jQuery
STYLING:         Vanilla CSS3 + CSS Custom Properties
DATEN:           IndexedDB (async) + LocalStorage (sync, Präferenzen)
RENDERING:       Manuelles DOM — KEIN Virtual DOM
ANIMATIONEN:     Canvas API + CSS Transitions/Animations
BUNDLE:          Single HTML + CSS + JS Files — KEIN Build-Tool
LOKAL:           100% offline-fähig — KEINE CDN-Abhängigkeiten (außer Fonts)
```

### Farb-System (PFLICHT)
```css
:root {
  --pink: #ff007f;        /* Primär-Akzent */
  --cyan: #00ffd5;        /* Sekundär-Akzent */
  --bg: #000;             /* Hintergrund */
  --card: rgba(255,255,255,.03);  /* Glassmorphism-Card */
  --border: rgba(255,255,255,.07); /* Rahmen */
  --text: #fff;           /* Haupttext */
  --text2: rgba(255,255,255,.5);  /* Sekundärtext */
  --font: 'Inter', sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
```

### Glassmorphism-Pattern (IMMER anwenden)
```css
.element {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 4px 24px rgba(0,0,0,.3);
}
```

### 3D Button-Pattern (IMMER für Buttons)
```css
.btn3d {
  transform-style: preserve-3d;
  perspective: 600px;
  box-shadow: 0 4px 0 #b3005a, 0 6px 16px rgba(255,0,127,.3);
}
.btn3d:hover { transform: translateY(-2px); }
.btn3d:active { transform: translateY(2px); box-shadow: 0 1px 0 ...; }
```

---

## 📁 Dateistruktur (PFLICHT)

```
dkz-webapp-v2/
├── index.html              ← App Shell
├── style.css               ← Design System
├── core/
│   ├── app.js              ← Einstiegspunkt
│   ├── events.js           ← Event Bus
│   ├── storage.js          ← IndexedDB CRUD
│   └── config.js           ← Management-Tabelle
├── modules/
│   ├── [modul-name].js     ← Pro Modul eine Datei
│   └── ...
├── assets/
│   └── logo.png
└── docs/
    ├── README.md
    └── HANDBUCH.md
```

---

## 🔧 Modul erstellen (Schritt-für-Schritt)

### 1. HTML-Anker in index.html
```html
<div id="v-[modulname]" class="view">
  <h2 class="sec-title">[Modul-Titel]</h2>
  <!-- Modul-Inhalt -->
</div>
```

### 2. Tab in Navigation
```html
<button class="tab" onclick="showV('[modulname]',this)">[Icon] [Name]</button>
```

### 3. JavaScript-Modul
```javascript
// modules/[modulname].js
// DkZ™ Modul: [Name]
// Skill: dkz-webapp-builder
// Pattern: Revealing Module

const [ModulName] = (() => {
  // Private State
  let state = {};

  // Init
  function init() { /* ... */ }

  // Render
  function render() {
    const el = document.getElementById('v-[modulname]');
    el.innerHTML = `
      <div class="g-card" style="padding:1rem">
        <!-- Content -->
      </div>`;
  }

  // Public API
  return { init, render };
})();
```

### 4. CSS — Modul-spezifisch
```css
/* Immer Glassmorphism + 3D */
#v-[modulname] .card { /* g-card Pattern nutzen */ }
```

---

## 🔑 Syntax-Referenz

### Patterns
| Pattern | Code | Wann |
|:--------|:-----|:-----|
| Glass Card | `class="g-card"` | Jedes Container-Element |
| 3D Button Pink | `class="btn3d btn3d-pink"` | Primäre Aktionen |
| 3D Button Ghost | `class="btn3d btn3d-ghost"` | Sekundäre Aktionen |
| 3D Button Cyan | `class="btn3d btn3d-cyan"` | Tertiäre Aktionen |
| Tooltip | `data-tip="Text"` | Jedes interaktive Element |
| Blink | `class="blink"` | Updates / Setup nötig |
| Sync Dot | `class="sync-dot green/yellow/red"` | Status-Anzeige |
| Popup | `class="popup-overlay"` + `class="popup"` | Modale Fenster |
| Slide Panel | `class="slide-panel"` | KI / Content Panels |
| View | `class="view"` + `class="on"` | Tab-Inhalte |

### Präfixe
| Präfix | Bedeutung | Beispiel |
|:-------|:----------|:---------|
| `v-` | View-Container | `id="v-dash"` |
| `g-` | Glassmorphism | `class="g-card"` |
| `btn3d-` | 3D-Button Variante | `class="btn3d-pink"` |
| `s-` | Settings-Row | `class="s-row"` |
| `ki-` | KI-Panel Element | `id="ki-chat"` |
| `sync-` | Sync-Status | `class="sync-dot"` |

### Shortcuts (Terminal)
| Shortcut | Befehl | Beschreibung |
|:---------|:-------|:-------------|
| `dkz build` | Skill ausführen | WebApp Builder starten |
| `dkz build:module [name]` | Neues Modul | Erstellt Modul-Dateien |
| `dkz build:panel [name]` | Neues Panel | Slide-Panel erstellen |
| `dkz build:popup [name]` | Neues Popup | Popup-Dialog erstellen |
| `dkz build:board [name]` | Neues Board | Dashboard-Board Card |
| `dkz build:settings [key]` | Setting hinzufügen | Settings-Bereich erweitern |

---

## 🤖 LLM-Instruktionen

### Für Claude / Antigravity / ChatGPT / Gemini:
```
WENN du ein DkZ™ WebApp-Modul erstellst:
1. LIES diesen Skill KOMPLETT
2. NUTZE ausschließlich die definierten Patterns
3. JEDES Element bekommt ein data-tip Tooltip
4. JEDER Button ist ein btn3d (NIEMALS normaler button)
5. JEDER Container ist ein g-card (NIEMALS div ohne Klasse)
6. JEDE Farbe kommt aus CSS Custom Properties (NIEMALS hardcoded)
7. JEDE Aktion wird geloggt via log() Funktion
8. JEDER State wird in IndexedDB gespeichert (NIEMALS nur RAM)
9. SICHERHEIT: esc() bei JEDEM User-Input
10. COMMIT nach jeder Änderung
```

### Qualitäts-Checkliste (VOR jedem Commit)
```
□ Glassmorphism auf allen Cards?
□ 3D Buttons statt flache?
□ Tooltips auf jedem interaktiven Element?
□ esc() bei User-Input?
□ log() bei jeder Aktion?
□ IndexedDB für persistente Daten?
□ CSS Variables statt hardcoded Farben?
□ Responsive (grid auto-fit)?
□ Auto-Hide Nav funktioniert noch?
□ Bottom-Bar Ticker aktualisiert?
```

---

## 📚 Sub-Skills (verlinkt)

| Skill | Alias | Pfad |
|:------|:------|:-----|
| Glassmorphism 3D | `glass`, `g3d` | `skills/glassmorphism-3d/SKILL.md` |
| Panel System | `panels`, `slide` | `skills/panel-system/SKILL.md` |
| Canvas Engine | `canvas`, `particles` | `skills/canvas-engine/SKILL.md` |
| Account Connector | `auth`, `connect` | `skills/account-connector/SKILL.md` |
| Mod Builder | `modbot`, `mod` | `skills/mod-builder/SKILL.md` |

---

*Dieser Skill ist PFLICHT für jede WebApp-Änderung. NIEMALS ohne ihn arbeiten.*
