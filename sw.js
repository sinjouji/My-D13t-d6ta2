// sw.js - 推し活ダイエット ServiceWorker
const CACHE_NAME = 'oshi-diet-v4';
const BASE = '/My-D13t-d6ta2/';
const ASSETS = [
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-152.png',
  BASE + 'icon-167.png',
  BASE + 'icon-180.png',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith('http')) return;
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(res => {
            if (res && res.status === 200 && res.type === 'basic') {
              const clone = res.clone();
              caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            }
            return res;
          })
          .catch(() => {
            if (e.request.destination === 'document') {
              return caches.match(BASE + 'index.html');
            }
          });
      })
  );
});
