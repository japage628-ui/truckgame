console.log('[SW] Dev mode active');

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  clients.claim();
});

// Do NOT intercept fetches - avoids script loading errors
self.addEventListener('fetch', e => {});
