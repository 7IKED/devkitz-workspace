---
description: Keyboard Shortcuts System — Globale und modul-spezifische Tastenkürzel
---

# /shortcuts — Keyboard Shortcuts

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Global Shortcuts (dkz-shortcuts.js)
```javascript
const SHORTCUTS = {
    'Ctrl+K': () => openCopilot(),
    'Ctrl+Shift+D': () => toggleDebug(),
    'Ctrl+Shift+N': () => openNotes(),
    'Escape': () => closeAllPanels(),
    'F1': () => openGuide(),
    '?': () => showShortcutHelp()
};

document.addEventListener('keydown', (e) => {
    const key = `${e.ctrlKey?'Ctrl+':''}${e.shiftKey?'Shift+':''}${e.altKey?'Alt+':''}${e.key}`;
    if (SHORTCUTS[key]) { e.preventDefault(); SHORTCUTS[key](); }
});
```

## Shortcut-Overlay
```javascript
function showShortcutHelp() {
    const html = Object.entries(SHORTCUTS).map(([key, fn]) =>
        `<div class="shortcut-row">
            <kbd>${esc(key)}</kbd>
            <span>${esc(fn.description || fn.name)}</span>
        </div>`
    ).join('');
    // In Glassmorphism Panel anzeigen
}
```

## Regeln
- **Keine Browser-Shortcuts überschreiben** (Ctrl+C, Ctrl+V etc.)
- **ESC** schließt immer das aktuelle Panel
- **?** zeigt immer die Hilfe
- **NumLock Shortcuts** nur im NanoBot Center
