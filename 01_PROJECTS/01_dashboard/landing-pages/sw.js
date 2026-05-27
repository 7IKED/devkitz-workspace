/**
 * DkZ Landing Pages – Service Worker
 * Offline caching for PWA support
 */
const CACHE_NAME = 'dkz-landing-v1';
const ASSETS = [
    './',
    './index.html',
    './landing.css',
    './detect.js',
    './app.js',
    './manifest.json'
];

// Install
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate – clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch – cache first, network fallback
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(cached => cached || fetch(e.request)
                .then(response => {
                    // Cache new requests dynamically
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    }
                    return response;
                })
            )
            .catch(() => caches.match('./index.html'))
    );
});
