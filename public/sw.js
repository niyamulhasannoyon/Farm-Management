// RBCL Flock Monitor - Service Worker for PWA Offline Caching
const CACHE_NAME = 'rbcl-flock-monitor-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, and update in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Network failure is fine since cachedResponse is returned
          });
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // If offline and request is HTML navigation, fallback to root
        if (event.request.mode === 'navigate') {
          return caches.match('/dashboard');
        }
        return new Response('Network error occurred while offline', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    })
  );
});
