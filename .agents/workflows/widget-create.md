---
description: Responsive Dashboard Widget erstellen — DkZ Design System Glassmorphism Card
---

# /widget-create — Dashboard Widget

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Widget-Template (HTML)
```html
<div class="dkz-widget" id="widget-[name]">
    <div class="widget-header">
        <span class="widget-icon">📊</span>
        <h3 class="widget-title">[Titel]</h3>
        <span class="widget-badge">Live</span>
    </div>
    <div class="widget-body">
        <!-- Content -->
    </div>
    <div class="widget-footer">
        <span class="widget-meta">Aktualisiert: <time></time></span>
    </div>
</div>
```

## Widget-CSS
```css
.dkz-widget {
    background: var(--bg-card, rgba(18,18,24,0.85));
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: var(--radius-md, 12px);
    padding: 20px;
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-card);
    transition: transform 0.2s, box-shadow 0.2s;
}
.dkz-widget:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.widget-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.widget-title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.widget-badge {
    margin-left: auto; font-size: 0.6rem; padding: 2px 8px;
    background: rgba(0,255,136,0.1); color: var(--green);
    border-radius: 4px; font-weight: 600;
}
```

## Git Commit
```bash
git commit -m "feat([modul]): [widget-name] dashboard widget erstellt"
```
