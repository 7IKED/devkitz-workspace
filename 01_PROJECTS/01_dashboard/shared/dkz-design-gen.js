/**
 * dkz-design-gen.js — Automatische design.md Erstellung
 * @DKZ:TAG → [SHARED:design-gen] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * DEVKiTZ™ Shared Script · v0.01 · 2026-04-08
 * 
 * Generiert eine design.md für jedes Projekt/Modul basierend auf:
 * - CSS Variables (Farben, Fonts, Spacing)
 * - Vorhandene Shared Scripts
 * - Modul-Features aus features.json
 * - NLM/Stitch/Banana Content-Vorlagen
 * 
 * Nutzung:
 *   DkzDesignGen.scan()           → Scannt aktuelles Modul
 *   DkzDesignGen.generate()       → Generiert design.md Inhalt
 *   DkzDesignGen.download()       → Lädt design.md herunter
 *   DkzDesignGen.forNLM()         → NLM-optimierte Version
 *   DkzDesignGen.forStitch()      → Stitch MCP-optimierte Version
 *   DkzDesignGen.forBanana()      → NanoBanna PRO Vorlage
 */

const DkzDesignGen = (() => {
    'use strict';

    // --- Konfiguration ---
    const VERSION = '0.01';
    const DKZ_COLORS = {
        '--bg': { hex: '#060608', name: 'Background', role: 'Basis-Hintergrund' },
        '--accent': { hex: '#fa1e4e', name: 'Neonrot', role: 'Primär-Akzent' },
        '--green': { hex: '#00ff88', name: 'Success Green', role: 'Status OK' },
        '--yellow': { hex: '#ffb800', name: 'Warning Yellow', role: 'Status Degraded' },
        '--red': { hex: '#ff3b5c', name: 'Error Red', role: 'Status Offline' },
        '--blue': { hex: '#3b82f6', name: 'Info Blue', role: 'Links & Info' },
        '--text-primary': { hex: '#e8e8ec', name: 'Text Primary', role: 'Haupttext' },
        '--text-secondary': { hex: '#8a8a9a', name: 'Text Secondary', role: 'Nebentext' },
        '--bg-card': { hex: 'rgba(18,18,24,0.85)', name: 'Card BG', role: 'Karten' }
    };

    const DKZ_FONTS = {
        ui: { name: 'Inter', type: 'sans-serif', weights: [400, 600, 700], role: 'UI Text' },
        mono: { name: 'JetBrains Mono', type: 'monospace', weights: [400], role: 'Code' }
    };

    // --- Modul-Scanner ---
    function scanCurrentModule() {
        const styles = getComputedStyle(document.documentElement);
        const colors = {};
        const fonts = {};

        // CSS Variables auslesen
        Object.keys(DKZ_COLORS).forEach(key => {
            const val = styles.getPropertyValue(key).trim();
            colors[key] = val || DKZ_COLORS[key].hex;
        });

        // Fonts erkennen
        const bodyFont = styles.fontFamily;
        fonts.main = bodyFont.includes('Inter') ? 'Inter' : bodyFont.split(',')[0].trim();
        fonts.mono = 'JetBrains Mono';

        // Shared Scripts prüfen
        const scripts = Array.from(document.querySelectorAll('script[src]'))
            .map(s => s.src.split('/').pop())
            .filter(s => s.startsWith('dkz-'));

        // Modul-Titel
        const title = document.title || 'Unbekanntes Modul';
        const h1 = document.querySelector('h1');
        const modulName = h1 ? h1.textContent.trim() : title;

        return {
            title: modulName,
            pageTitle: title,
            colors,
            fonts,
            scripts,
            hasGlassmorphism: !!document.querySelector('[style*="backdrop-filter"], [class*="glass"]'),
            hasBlobs: !!document.querySelector('.blob, [class*="blob"]'),
            hasToast: !!document.getElementById('toast'),
            hasHamburger: !!document.querySelector('.dkz-hamburger, [class*="hamburger"]'),
            timestamp: new Date().toISOString().split('T')[0]
        };
    }

    // --- Markdown-Generator ---
    function generateDesignMd(scan) {
        const s = scan || scanCurrentModule();

        return `# ${s.title} — Design System

> Auto-generiert von dkz-design-gen.js v${VERSION} · ${s.timestamp}
> DkZ™ Design System v2 · Cyberclean Dark

---

## Farben

| Variable | Wert | Rolle |
|:---------|:-----|:------|
${Object.entries(DKZ_COLORS).map(([k, v]) => `| \`${k}\` | \`${s.colors[k] || v.hex}\` | ${v.role} |`).join('\n')}

## Typografie

| Rolle | Font | Gewichte |
|:------|:-----|:---------|
| UI Text | ${DKZ_FONTS.ui.name} | 400, 600, 700 |
| Code | ${DKZ_FONTS.mono.name} | 400 |

## Effekte

| Effekt | Wert | Status |
|:-------|:-----|:-------|
| Glassmorphism | \`backdrop-filter: blur(20px)\` | ${s.hasGlassmorphism ? '✅ Aktiv' : '❌ Nicht erkannt'} |
| Background Blobs | \`filter: blur(120px)\` | ${s.hasBlobs ? '✅ Aktiv' : '❌ Nicht erkannt'} |
| Toast-Benachrichtigung | Grün, unten rechts | ${s.hasToast ? '✅ Aktiv' : '❌ Nicht erkannt'} |
| Hamburger Navigation | Slide-In Panel | ${s.hasHamburger ? '✅ Aktiv' : '❌ Nicht erkannt'} |

## Shared Scripts

${s.scripts.length > 0 ? s.scripts.map(sc => `- \`${sc}\``).join('\n') : '- Keine Shared Scripts gefunden'}

## Border Radius

| Größe | Wert |
|:------|:-----|
| Small | 8px |
| Medium | 12px |
| Large | 16px |
| Card | 14px |

## Schatten

\`\`\`css
--shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
--shadow-glow: 0 0 20px rgba(250, 30, 78, 0.25);
\`\`\`

## Themes

| Theme | Background | Accent | Kontrast |
|:------|:-----------|:-------|:---------|
| Dark (Standard) | #0e0e10 | #fa1e4e | Normal |
| Crimson | #000000 | #ff2d5e | Intensiv |
| Neon | #050505 | #ff0040 | Maximum |

---

*Generiert mit DkZ Design Gen v${VERSION} · DEVKiTZ™ Ökosystem*
`;
    }

    // --- NLM-optimierte Version ---
    function forNLM(scan) {
        const s = scan || scanCurrentModule();
        return `# ${s.title} — NLM Content Design Brief

> Für NotebookLM Content-Generierung · DkZ™ Design System v2

## Visuelle Identität
- **Primärfarbe:** #fa1e4e (Neonrot) — energisch, tech-forward
- **Hintergrund:** #060608 (Cyberclean Dark) — professionell, premium
- **Akzente:** #00ff88 (Grün für Erfolg), #ffb800 (Gelb für Warnungen)
- **Stil:** Glassmorphism + animierte Background Blobs
- **Typografie:** Inter für UI, JetBrains Mono für Code

## Content-Vorgaben
- **Sprache:** Deutsch
- **Ton:** Professionell, aber zugänglich. Tech-Enthusiasten als Zielgruppe.
- **Format:** Videos mit deutschem Audio (Banana Content Templates)
- **Branding:** DEVKiTZ™ Logo + Neonrot-Akzent in jedem Asset

## 10 Content-Typen
1. 🎙️ Podcast — Deep-Dive Briefing
2. 🎬 Video — Erklärvideo mit Screencast
3. 📊 Slides — Präsentation (10-15 Folien)
4. 📄 Report — Technischer Bericht
5. 🧠 Mind Map — Konzept-Übersicht
6. 📈 Infografik — Daten-Visualisierung
7. 📋 Data Table — Strukturierte Daten
8. ❓ Quiz — Wissenstest
9. 📝 Flashcards — Lern-Karten
10. 🎨 Studio — Custom Design Assets

## Banana/NanoBanna Templates
- Banner: 1920x1080 Dark mit Neonrot-Gradient
- Social: 1080x1080 Quadrat, Bold Text
- Reel: 1080x1920 Hochformat, Animiert
- 4K: 3840x2160 für Präsentationen
`;
    }

    // --- Stitch MCP-optimierte Version ---
    function forStitch(scan) {
        const s = scan || scanCurrentModule();
        return `# ${s.title} — Stitch Design Spec

> Google Stitch MCP UI Generation · DkZ™ Theme

## Design Tokens
\`\`\`json
{
  "colors": {
    "background": "#060608",
    "surface": "#121218",
    "accent": "#fa1e4e",
    "text": "#e8e8ec",
    "textMuted": "#8a8a9a",
    "success": "#00ff88",
    "warning": "#ffb800",
    "error": "#ff3b5c"
  },
  "fonts": {
    "ui": "Inter, sans-serif",
    "mono": "JetBrains Mono, monospace"
  },
  "radius": { "sm": 8, "md": 12, "lg": 16 },
  "effects": {
    "glass": "backdrop-filter: blur(20px)",
    "glow": "box-shadow: 0 0 20px rgba(250,30,78,0.25)",
    "blobBlur": 120
  }
}
\`\`\`

## Layout-Regeln
- Sticky Header mit Glassmorphism
- Cards mit var(--radius) und 1px Border
- Background Blobs (2-3 pro Seite)
- Toast unten rechts für Feedback
- Hamburger ☰ oben links
- Responsive: Desktop-first, Tablet-friendly

## Komponenten (verfügbar)
- Header (sticky, glass)
- Card (dark, bordered, rounded)
- Button Primary (accent gradient)
- Button Ghost (outline)
- Tag (color-coded)
- Toast (green, 2.5s)
- Input (dark bg, accent border on focus)
- Tab Bar (horizontal, underline active)
`;
    }

    // --- Banana Content Vorlage ---
    function forBanana(scan) {
        const s = scan || scanCurrentModule();
        return `# ${s.title} — NanoBanna™ PRO Asset Brief

> Marketing-Asset Vorlage · BanaPRO Builder

## Brand Guidelines
- **Logo:** DEVKiTZ™ in Inter Bold + JetBrains Mono
- **Farbe:** #fa1e4e (Neonrot) auf #060608 (Dark)
- **Stil:** Futuristisch, Tech, Premium

## Asset-Formate

### Banner (1920x1080)
- Hintergrund: Gradient #060608 → #121218
- Akzent: Neonrot Glow links
- Text: Weiß auf Dark, Bold
- CTA: Button mit #fa1e4e

### Social Post (1080x1080)
- Zentral: Feature-Highlight
- Rahmen: 1px #fa1e4e Border
- Font: Inter Bold 48px

### Story/Reel (1080x1920)
- Vertikal: Feature-Stack
- Animation: Slide-In von unten
- Duration: 15-30 Sekunden

### 4K Slide (3840x2160)
- Für Präsentationen
- Minimalistisch: 1 Idee pro Slide
- Code-Beispiele in JetBrains Mono
`;
    }

    // --- Download ---
    function download(content, filename) {
        const blob = new Blob([content || generateDesignMd()], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename || 'design.md';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // --- Public API ---
    return {
        VERSION,
        scan: scanCurrentModule,
        generate: generateDesignMd,
        forNLM,
        forStitch,
        forBanana,
        download,
        downloadNLM: (s) => download(forNLM(s), 'design-nlm.md'),
        downloadStitch: (s) => download(forStitch(s), 'design-stitch.md'),
        downloadBanana: (s) => download(forBanana(s), 'design-banana.md'),
        downloadAll: (s) => {
            const scan = s || scanCurrentModule();
            download(generateDesignMd(scan), 'design.md');
            setTimeout(() => download(forNLM(scan), 'design-nlm.md'), 300);
            setTimeout(() => download(forStitch(scan), 'design-stitch.md'), 600);
            setTimeout(() => download(forBanana(scan), 'design-banana.md'), 900);
        }
    };
})();

// Auto-Register wenn dkz-debug vorhanden
if (typeof window !== 'undefined') {
    window.DkzDesignGen = DkzDesignGen;
}
