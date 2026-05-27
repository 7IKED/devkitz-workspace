---
description: Progressive Web App (PWA) Setup — Manifest, Service Worker, Offline-First Architektur
---

# /pwa-setup — PWA Architektur aufbauen

> **Kernregel:** Der passende und ordentlich eingetragene Workflow ist wichtiger als das Ergebnis.

## Wann verwenden?
- Neues Projekt soll als installierbare Web-App funktionieren
- Bestehendes Modul soll offline-fähig werden
- Mobile-First Dashboard bauen

## Workflow

### 1. Manifest erstellen
```json
{
    "name": "DkZ [MODUL-NAME]",
    "short_name": "[KURZ]",
    "description": "[Beschreibung]",
    "start_url": "./index.html",
    "display": "standalone",
    "background_color": "#060608",
    "theme_color": "#fa1e4e",
    "icons": [
        { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
}
```

### 2. Service Worker (`sw.js`)
```javascript
const CACHE_NAME = 'dkz-[modul]-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    '../../shared/dkz-theme.css'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
```

### 3. In `index.html` einbinden
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#fa1e4e">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}
</script>
```

### 4. Icons generieren
- 192x192 PNG (Homescreen)
- 512x512 PNG (Splash Screen)
- Favicon 32x32 + 16x16
- Apple Touch Icon 180x180

### 5. Offline-Status UI
```javascript
window.addEventListener('online', () => showStatus('🟢 Online'));
window.addEventListener('offline', () => showStatus('🔴 Offline — Lokale Daten aktiv'));
```

### 6. Testen
- Chrome DevTools → Application → Manifest prüfen
- Lighthouse → PWA Audit durchführen
- "Installieren" Button in Adressleiste testen

### 7. Git Commit
```bash
git add -A
git commit -m "feat([modul]): PWA Architektur mit Service Worker und Offline-First"
```

## DkZ Design Regeln für PWA
- `--bg: #060608` als Background
- `--accent: #fa1e4e` als Theme Color
- Fonts: Inter + JetBrains Mono (im Cache!)
- Glassmorphism-Panels für Mobile
- Touch-Targets: min. 44x44px
