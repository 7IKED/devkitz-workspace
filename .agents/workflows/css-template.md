---
description: DkZ Design System CSS anwenden — v2 Primary und v1 Alternative
---

# DkZ™ Design System v2 — CSS Template Guide

> Pflicht-Vorlage für alle DEVKiTZ™ Module und Seiten

---

## 🎨 v2 Farbtokens (IMMER verwenden)

```css
:root {
    /* ═══ Primärfarben ═══ */
    --accent: #fa1e4e;                          /* DkZ Rot — Hauptakzent */
    --accent-soft: rgba(250, 30, 78, 0.12);     /* Weiches Rot */
    --accent-glow: rgba(250, 30, 78, 0.4);      /* Glow-Effekt */

    /* ═══ Hintergrund ═══ */
    --bg: #060608;                               /* Body Background */
    --bg-alt: #0a0a0f;                           /* Alternate Section */
    --bg-card: rgba(18, 18, 24, 0.85);           /* Card Background */
    --bg-card-hover: rgba(24, 24, 32, 0.95);     /* Card Hover */

    /* ═══ Text ═══ */
    --text-primary: #e8e8ec;                     /* Haupttext */
    --text-secondary: #8a8a9a;                   /* Sekundärtext */
    --text-muted: #5a5a6a;                       /* Gedämpfter Text */

    /* ═══ Status-Farben (Ampel) ═══ */
    --green: #00ff88;                             /* 🟢 OK / Erfolg */
    --green-soft: rgba(0, 255, 136, 0.12);
    --yellow: #ffb800;                            /* 🟡 Warnung / Degraded */
    --yellow-soft: rgba(255, 184, 0, 0.12);
    --red: #ff3b5c;                               /* 🔴 Fehler / Offline */
    --blue: #3b82f6;                              /* 🔵 Info */
    --blue-soft: rgba(59, 130, 246, 0.12);
    --purple: #a855f7;                            /* 🟣 Spezial */

    /* ═══ Fonts ═══ */
    --font-main: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

    /* ═══ Border & Radius ═══ */
    --border: rgba(255, 255, 255, 0.06);
    --border-hover: rgba(255, 255, 255, 0.12);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;

    /* ═══ Schatten ═══ */
    --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 0 30px var(--accent-glow);

    /* ═══ Transitions ═══ */
    --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📐 v1 Tokens (Alternative — für Modul-CSS)

```css
:root {
    --bg: #0e0e10;
    --card: #1a1a1c;
    --card2: #222226;
    --border: #333338;
    --text: #f6f6f7;
    --muted: #a1a1aa;
    --accent: #fa1e4e;
    --accent-rgb: 250, 30, 78;
    --green: #00ff88;
    --blue: #55ACEE;
    --yellow: #FFB800;
    --red: #fa1e4e;
    --purple: #ec4899;
    --font: 'Inter', sans-serif;
    --mono: 'JetBrains Mono', monospace;
    --glass: rgba(14, 14, 22, .72);
    --blur: blur(24px);
}
```

---

## 🏗️ Pflicht-Struktur für neue Module

### HTML Template

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[MODUL-NAME] — DEVKiTZ™</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../shared/dkz-theme.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- BG Mesh (Pflicht) -->
    <div class="bg-mesh">
        <div class="bg-blob"></div>
        <div class="bg-blob"></div>
    </div>

    <div class="app">
        <!-- Header (Pflicht) -->
        <header class="dkz-header">
            <a href="../../hub/index.html" class="back-btn">← Hub</a>
            <h1>[EMOJI] [Modul-Name]</h1>
            <div class="hdr-right">
                <span class="ver">v1.0.0</span>
            </div>
        </header>

        <!-- Content -->
        <main class="content" id="mainContent">
            <!-- Modul-spezifischer Inhalt hier -->
        </main>
    </div>

    <!-- Toast -->
    <div class="toast" id="toast"></div>

    <!-- Shared Scripts (PFLICHT) -->
    <script src="../../shared/dkz-navbar.js"></script>
    <script src="../../shared/dkz-debug.js"></script>
    <script src="../../shared/dkz-guide.js"></script>
    <script src="../../shared/dkz-crosslinks.js"></script>
    <script src="../../shared/dkz-copilot.js"></script>
    <script src="../../shared/dkz-shortcuts.js"></script>
    <!-- Modul-spezifisches Script -->
    <script src="script.js"></script>
</body>
</html>
```

---

## 🎯 Glassmorphism-Effekte

```css
/* Standard Glass */
.glass {
    background: var(--bg-card);
    border: 1px solid var(--border);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
}

/* Starkes Glass */
.glass-strong {
    background: rgba(14, 14, 22, 0.72);
    -webkit-backdrop-filter: blur(24px);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Glow-on-Hover */
.glow-card {
    position: relative;
    overflow: hidden;
}
.glow-card::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(circle, var(--accent-soft), transparent 70%);
    opacity: 0;
    transition: opacity 0.6s;
    pointer-events: none;
}
.glow-card:hover::before { opacity: 1; }
```

---

## ⚡ Animationen

```css
/* Fade-In */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Pulse Dot (Status) */
@keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
}

/* Blob Float (BG) */
@keyframes blobFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -40px) scale(1.1); }
}

/* Reveal (Scroll) */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Klasse | Verwendung |
|:-----------|:-------|:-----------|
| `≤1024px` | Tablet | Padding reduzieren, Grids anpassen |
| `≤768px` | Mobile | 1-Spalten-Layout, Hamburger-Menü |
| `≤480px` | Small | Minimales Padding, BG-Blobs ausblenden |

---

## 🚫 Verboten

- ❌ Hardcoded Farben (`color: #fa1e4e`) → IMMER `var(--accent)`
- ❌ `font-family: Arial` → IMMER `var(--font-main)` oder `var(--font-mono)`
- ❌ `!important` für Farben → CSS-Spezifität richtig nutzen
- ❌ Inline Styles im HTML → Immer externe CSS-Datei
- ❌ Tailwind, Bootstrap → NUR Vanilla CSS
