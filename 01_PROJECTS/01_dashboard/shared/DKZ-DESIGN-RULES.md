# DkZ™ Premium Design Rules v3.0

> PFLICHT fuer JEDES neue/aktualisierte Modul. KEINE Ausnahmen.
> Stand: 2026-05-29

---

## §D1 — Kontrast + Farben (EISERN)

```css
:root {
  /* HINTERGRUND: Immer tiefschwarz */
  --bg: #060608;
  --surface: #0d0d12;
  --card: #111118;

  /* TEXT: Immer auf grauem Hintergrund */
  --text-bg: rgba(20, 20, 28, 0.85);   /* Grauer Background fuer Schrift */
  --text: #e8e8ed;
  --muted: #6b6b80;

  /* HIGHLIGHTS: Neon leuchtend */
  --accent: #fa1e4e;                     /* Neon Rot */
  --green: #00ff88;                      /* Matrix Gruen */
  --yellow: #ffb800;                     /* Warn Gelb */
  --red: #ff3b5c;                        /* Error Rot */
  --cyan: #06b6d4;                       /* Info Cyan */
  --neon-glow: 0 0 12px rgba(0, 255, 136, 0.4);  /* Matrix Glow */
}
```

**Regeln:**
- Background IMMER `#060608` (tiefschwarz)
- Schrift IMMER auf `--text-bg` (grau) oder `--card` (dunkelgrau)
- Highlights IMMER neon: `--green`, `--accent`, `--cyan`
- KEIN weisser Background, KEIN helles Grau
- Neon-Glow auf aktive Elemente: `box-shadow: var(--neon-glow)`

---

## §D2 — Glassmorphism (PFLICHT)

```css
.glass-panel {
  background: rgba(17, 17, 24, 0.6);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

- ALLE Panels, Cards, Modals = Glassmorphism
- `backdrop-filter: blur(16-24px)`
- Inner Shadow (inset) fuer Tiefe
- Border: `rgba(255,255,255,0.06)` — nie solid

---

## §D3 — Einblend/Ausblend Effekte (PFLICHT)

```css
/* Einblenden */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Ausblenden */
@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}

/* Stagger: Elemente nacheinander einblenden */
.stagger-1 { animation: fadeIn 0.5s ease 0.1s both; }
.stagger-2 { animation: fadeIn 0.5s ease 0.2s both; }
.stagger-3 { animation: fadeIn 0.5s ease 0.3s both; }
.stagger-4 { animation: fadeIn 0.5s ease 0.4s both; }
```

- Page-Load: Stagger Animation (0.1s Versatz pro Element)
- Modal: fadeIn/fadeOut
- Sektionen: Intersection Observer → fadeIn bei Scroll
- KEIN hartes Erscheinen (display:none → display:block)

---

## §D4 — Symbole bei Ueberschriften (PFLICHT)

```
✅ RICHTIG:
  🔧 Settings
  📊 Dashboard
  🚀 Deploy
  ⚡ Performance
  🔒 Security

❌ FALSCH:
  Settings
  Dashboard
  Deploy
```

- JEDE h1, h2, h3, Panel-Header = Symbol am Anfang
- Symbole aus dem Emoji/Unicode Katalog
- Symbole muessen zum Inhalt passen

---

## §D5 — Sprache EN/DE (PFLICHT)

```javascript
const i18n = {
  en: {
    title: '⚙️ Settings',
    save: '💾 Save',
    cancel: '✕ Cancel',
    dark: '🌙 Dark Mode',
    light: '☀️ Light Mode'
  },
  de: {
    title: '⚙️ Einstellungen',
    save: '💾 Speichern',
    cancel: '✕ Abbrechen',
    dark: '🌙 Dunkel',
    light: '☀️ Hell'
  }
};

let lang = localStorage.getItem('dkz-lang') || 'en';

function t(key) { return i18n[lang]?.[key] || i18n.en[key] || key; }

function setLang(newLang) {
  lang = newLang;
  localStorage.setItem('dkz-lang', lang);
  renderAll(); // Alle UI-Texte neu rendern
}
```

- Standard-Sprache: **English**
- Toggle oben rechts im Header: `EN | DE`
- localStorage persistiert Sprachwahl
- ALLE sichtbaren Texte via `t('key')` Funktion

---

## §D6 — Sound System (AN/AUS)

```javascript
const SFX = {
  enabled: localStorage.getItem('dkz-sfx') !== 'off',

  play(type) {
    if (!this.enabled) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch(type) {
      case 'click':
        osc.frequency.value = 800;
        gain.gain.value = 0.08;
        osc.start(); osc.stop(ctx.currentTime + 0.05);
        break;
      case 'success':
        osc.frequency.value = 520;
        gain.gain.value = 0.06;
        osc.start(); osc.stop(ctx.currentTime + 0.1);
        setTimeout(() => {
          const o2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.value = 780;
          g2.gain.value = 0.06;
          o2.start(); o2.stop(ctx.currentTime + 0.12);
        }, 80);
        break;
      case 'error':
        osc.frequency.value = 220;
        gain.gain.value = 0.05;
        osc.start(); osc.stop(ctx.currentTime + 0.15);
        break;
      case 'toggle':
        osc.frequency.value = 660;
        gain.gain.value = 0.04;
        osc.start(); osc.stop(ctx.currentTime + 0.03);
        break;
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('dkz-sfx', this.enabled ? 'on' : 'off');
    if (this.enabled) this.play('toggle');
  }
};
```

- Sound AN/AUS Toggle im Header (🔊/🔇)
- Click-Sound bei Buttons
- Success-Sound bei Save/Submit
- Error-Sound bei Fehler
- WebAudio API (kein externes File noetig)
- localStorage persistiert Sound-Praeferenz

---

## §D7 — Hyperreal Aesthetik (BEVORZUGT)

Referenz: `.agents/skills/hyperreal-ui/SKILL.md`

Prioritaet bei JEDEM Modul:
1. Canvas Partikel-Background (wenn performant)
2. Glassmorphism Panels
3. Neon-Glow auf interaktive Elemente
4. Stagger Intro-Animation
5. Hover-Effekte mit Transform + BoxShadow
6. Ripple-Effekt bei Buttons

---

## §D8 — Hintergrund-Bilder (Veo 4K/8K)

Fuer Banner und Kacheln:
- Bilder via `generate_image` Tool erstellen
- 4K/8K Aufloesung bevorzugen
- Bilder als CSS Background: `background-size: cover`
- IMMER mit Overlay: `linear-gradient(rgba(6,6,8,0.7), rgba(6,6,8,0.9))`
- Bilder duerfen NICHT die Lesbarkeit stoeren
- Bilder in `shared/images/` ablegen

---

## §D9 — Dark/Light Mode

```css
[data-theme="light"] {
  --bg: #f0f0f4;
  --surface: #ffffff;
  --card: #fafafa;
  --text: #1a1a2e;
  --muted: #6b7280;
  --border: #e0e0e8;
}
```

- Toggle im Header: 🌙/☀️
- Standard: DARK (immer!)
- Light Mode optional (fuer Praesentation/Druck)
- localStorage persistiert Theme

---

## §D10 — Qualitaets-Checkliste (vor Commit)

- [ ] Kontrast: Tiefschwarz + Neon Highlights?
- [ ] Glassmorphism auf allen Panels/Cards?
- [ ] Einblend-Effekte beim Laden?
- [ ] Symbole bei ALLEN Ueberschriften?
- [ ] EN/DE Toggle im Header?
- [ ] Sound AN/AUS Toggle?
- [ ] Hyperreal Partikel/Canvas (wenn sinnvoll)?
- [ ] esc() bei JEDEM innerHTML?
- [ ] Hub-Button vorhanden?
- [ ] Shared Scripts eingebunden?
- [ ] Tooltips auf interaktiven Elementen?
- [ ] Responsive (Mobile-first)?
- [ ] KEIN console.log?
- [ ] Google Fonts (Inter + JetBrains Mono)?
