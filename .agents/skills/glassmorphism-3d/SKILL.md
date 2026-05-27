# 🔮 Glassmorphism 3D — Design Skill

> **Skill-ID:** `glassmorphism-3d`
> **Alias:** `glass`, `g3d`
> **Terminal:** `dkz skill:glass`
> **Für:** ALLE LLMs

---

## Glassmorphism Card (COPY-PASTE READY)

### CSS Pattern
```css
.g-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 4px 24px rgba(0,0,0,.3);
  transition: all .35s cubic-bezier(.4,0,.2,1);
  position: relative;
  overflow: hidden;
}
/* Gradient Overlay */
.g-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,0,127,.04), transparent 60%);
  pointer-events: none;
  border-radius: inherit;
}
/* Hover: 3D Rotation + Glow */
.g-card:hover {
  transform: translateY(-6px) rotateX(2deg) rotateY(-1deg);
  border-color: rgba(255,0,127,.2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08),
    0 20px 60px rgba(255,0,127,.12),
    0 0 40px rgba(255,0,127,.06);
}
```

### 3D Button Pattern
```css
/* PINK (Primär) */
.btn3d-pink {
  background: var(--pink);
  color: #000;
  border: 1px solid var(--pink);
  box-shadow: 0 4px 0 #b3005a, 0 6px 16px rgba(255,0,127,.3);
  text-shadow: 0 1px 0 rgba(255,255,255,.2);
}
.btn3d-pink:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #b3005a, 0 10px 24px rgba(255,0,127,.4);
}
.btn3d-pink:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #b3005a;
}

/* GHOST (Sekundär) */
.btn3d-ghost {
  background: rgba(255,255,255,.03);
  color: var(--text2);
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
}
.btn3d-ghost:hover {
  border-color: var(--pink);
  color: var(--pink);
  box-shadow: 0 0 16px rgba(255,0,127,.15);
}

/* CYAN (Tertiär) */
.btn3d-cyan {
  background: var(--cyan);
  color: #000;
  box-shadow: 0 4px 0 #009980, 0 6px 16px rgba(0,255,213,.2);
}
```

### Hell/Dunkel Toggle
```css
[data-theme=light] {
  --bg: #f5f5f7;
  --bg2: #eee;
  --text: #111;
  --text2: rgba(0,0,0,.5);
  --card: rgba(255,255,255,.7);
  --border: rgba(0,0,0,.08);
}
```

### Blink-Animation (Setup nötig)
```css
.blink {
  animation: blink 1.5s infinite;
}
@keyframes blink {
  0%, 100% { border-color: var(--border); }
  50% { border-color: var(--pink); box-shadow: 0 0 10px rgba(255,0,127,.15); }
}
```

### Tooltip Pattern
```css
[data-tip]:hover::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,.9);
  color: #fff;
  font-size: .7rem;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  border: 1px solid var(--border);
  z-index: 999;
}
```

---

## LLM Anweisung

```
WENN du UI-Elemente für DkZ erstellst:
- JEDES Container-Element = g-card Klasse
- JEDER Button = btn3d + Variante (pink/ghost/cyan)
- JEDES interaktive Element = data-tip="Beschreibung"
- NIEMALS background:#xxx → IMMER var(--card) oder rgba()
- NIEMALS border-radius:XXpx → IMMER var(--radius)
- NIEMALS font-family:xxx → IMMER var(--font) oder var(--mono)
- IMMER backdrop-filter UND -webkit-backdrop-filter
- IMMER ::before gradient overlay auf Cards
- IMMER box-shadow mit inset + outer
```
