const CACHE_NAME = 'magic-admin-cache-v1';
const ASSETS = [
    'admin.html',
    'indexfiles/style-admin.css',
    'indexfiles/admin.js',
    'indexfiles/friethuis-logo.png'
];

// Install Service Worker
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch events (Network-first fallback to Cache)
self.addEventListener('fetch', (e) => {
    // Only cache local assets, skip Firebase DB calls and external CDNs if needed
    if (e.request.url.startsWith(self.location.origin)) {
        e.respondWith(
            fetch(e.request).catch(() => {
                return caches.match(e.request);
            })
        );
    }
});
