---
description: Performance Agent — Ladezeit, Rendering, Memory Optimierung
---

# /agent-performance — Performance Agent

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Performance-Optimierung

### 1. Messen (IMMER zuerst!)
```bash
# Lighthouse
npx lighthouse file:///[pfad] --output=json

# DevTools Performance Tab
# → Record → Aktion ausführen → Stop → Analyse
```

### 2. Ladezeit optimieren
```html
<!-- Fonts asynchron laden -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Critical CSS inline -->
<style>:root{--bg:#060608;--accent:#fa1e4e}</style>

<!-- Scripts am Ende oder defer -->
<script src="app.js" defer></script>
```

### 3. JavaScript optimieren
```javascript
// Debounce für häufige Events
function debounce(fn, ms = 300) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
window.addEventListener('resize', debounce(handleResize));

// requestAnimationFrame für Animationen
function animate() {
    // Animation Logic
    requestAnimationFrame(animate);
}

// Lazy Loading für Bilder
const img = document.createElement('img');
img.loading = 'lazy';
```

### 4. CSS optimieren
```css
/* GPU-Beschleunigung für Animationen */
.card { will-change: transform; transform: translateZ(0); }

/* Keine Layout-Shifts */
img { width: 100%; aspect-ratio: 16/9; }

/* Reduzierte Bewegung respektieren */
@media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
}
```

### 5. Ziel-Metriken
| Metrik | Gut | OK | Schlecht |
|:-------|:----|:---|:--------|
| FCP | < 1.0s | < 2.5s | > 2.5s |
| LCP | < 1.5s | < 4.0s | > 4.0s |
| CLS | < 0.1 | < 0.25 | > 0.25 |
| TTI | < 2.0s | < 5.0s | > 5.0s |

### 6. Git Commit
```bash
git commit -m "perf([modul]): [was optimiert] — [vorher]→[nachher]"
```
