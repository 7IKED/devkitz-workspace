/**
 * DkZ Service Worker — Offline-Support
 * @DKZ:TAG → [SYS:sw] [CAT:shared] [LANG:js]
 * @version v0.01.1_01
 *
 * Strategy: Cache-First for static assets, Network-First for APIs
 */
const CACHE_NAME = 'dkz-v2';
const STATIC_ASSETS = [
    '../shared/dkz-theme.css',
    '../shared/dkz-debug.js',
    '../shared/dkz-guide.js',
    '../shared/dkz-copilot.js',
    '../shared/dkz-shortcuts.js',
    '../shared/dkz-export.js',
    '../shared/dkz-crosslinks.js',
];

// Install — Pre-cache shared assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => console.warn('[DkZ SW] Pre-cache failed:', err))
    );
});

// Activate — Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — Cache-First for static, Network-First for dynamic
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip external APIs and non-http
    if (!url.protocol.startsWith('http')) return;
    if (url.hostname !== self.location.hostname && !url.pathname.includes('fonts.googleapis')) return;

    // Google Fonts — Cache first
    if (url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Local assets — Cache first, network fallback
    if (url.pathname.match(/\.(css|js|html|json|svg|png|ico|woff2?)$/)) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                const fetchPromise = fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => cached);

                return cached || fetchPromise;
            })
        );
        return;
    }
});
