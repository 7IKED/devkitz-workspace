---
description: Drag & Drop Implementierung — Sortierbare Listen, Kanban-Boards, File-Upload
---

# /drag-drop — Drag & Drop Pattern

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Sortierbare Liste (Vanilla JS)
```javascript
function initDragDrop(container) {
    let dragging = null;
    container.querySelectorAll('[draggable="true"]').forEach(item => {
        item.addEventListener('dragstart', e => {
            dragging = item;
            item.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => {
            dragging.style.opacity = '1';
            dragging = null;
            container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });
        item.addEventListener('dragover', e => { e.preventDefault(); item.classList.add('drag-over'); });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', e => {
            e.preventDefault();
            if (dragging !== item) {
                const rect = item.getBoundingClientRect();
                const after = e.clientY > rect.top + rect.height / 2;
                container.insertBefore(dragging, after ? item.nextSibling : item);
                onOrderChanged(); // Callback
            }
            item.classList.remove('drag-over');
        });
    });
}
```

## CSS
```css
[draggable="true"] { cursor: grab; transition: opacity 0.2s; }
[draggable="true"]:active { cursor: grabbing; }
.drag-over { border-top: 2px solid var(--accent); }
```
