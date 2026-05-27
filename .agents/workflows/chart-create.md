---
description: Chart/Grafik erstellen — Canvas, SVG oder CSS-only Charts für Dashboards
---

# /chart-create — Dashboard Charts

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## CSS-Only Bar Chart (kein Framework!)
```html
<div class="dkz-chart">
    <div class="bar" style="--val:85" data-label="Mo"><span>85%</span></div>
    <div class="bar" style="--val:62" data-label="Di"><span>62%</span></div>
    <div class="bar" style="--val:94" data-label="Mi"><span>94%</span></div>
</div>
```
```css
.dkz-chart { display:flex; align-items:flex-end; gap:8px; height:200px; padding:16px; }
.bar {
    flex:1; background:linear-gradient(to top, var(--accent), rgba(250,30,78,0.3));
    height: calc(var(--val) * 1%); border-radius:6px 6px 0 0;
    position:relative; transition:height 0.6s ease; min-width:32px;
}
.bar::after {
    content:attr(data-label); position:absolute; bottom:-20px;
    left:50%; transform:translateX(-50%); font-size:0.65rem; color:var(--text-secondary);
}
.bar span { position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:0.6rem; color:var(--text-primary); }
```

## Canvas Donut Chart
```javascript
function drawDonut(canvas, value, max, color = '#fa1e4e') {
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 60, lw = 12;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Background
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = lw; ctx.stroke();
    // Value
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + (value/max) * Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    // Text
    ctx.fillStyle = '#e8e8ec'; ctx.font = '600 24px Inter';
    ctx.textAlign = 'center'; ctx.fillText(`${Math.round(value/max*100)}%`, cx, cy + 8);
}
```
