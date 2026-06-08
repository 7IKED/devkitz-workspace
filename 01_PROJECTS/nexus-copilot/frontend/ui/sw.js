// PWA Service Worker (Offline-Cache)
const CACHE_NAME = 'nexus-copilot-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './js/nexus-client.js'
];

// Install Event - Caching Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch Event - Network First, falling back to cache
self.addEventListener('fetch', (e) => {
  // Ignoriere API calls
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
