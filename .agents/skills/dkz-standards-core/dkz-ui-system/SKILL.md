---
name: dkz-ui-system
description: DkZ v2 Design System (Glassmorphism, Matrix/Contrast Mode, XSS Protection).
---

# DkZ UI System

1. **No Frameworks**: Use Vanilla HTML, JS, CSS. No React, Vue, etc.
2. **Theme CSS**: Always include <link rel="stylesheet" href="../../shared/dkz-theme.css">.
3. **XSS Protection**: ALL dynamic innerHTML injections MUST use esc(string). Include <script src="../../shared/dkz-debug.js"></script>.
4. **Hyperreal Background**: Include dkz-hyperreal-bg.js for the Honeycomb + Particles background and the Theme Toolbar.
5. **Matrix Mode**: Contrast mode is toggled via .dkz-matrix-mode on the body. It enforces #000000 backgrounds and #00ff88 text.
6. **Toast**: Use #dkz-toast-container for notifications.
