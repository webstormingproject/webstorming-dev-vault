/* WebStorming OS V1.2.1 service worker */
const CACHE = 'webstorming-os-v1.2.1-mission-builder';
const ASSETS = [
  './',
  './index.html',
  './diagnose.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/js/boot-guard.js',
  './assets/js/app.js',
  './assets/icons/icon.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => undefined));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k.startsWith('webstorming-os-')).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone()).catch(() => undefined);
      return fresh;
    } catch (e) {
      const cached = await caches.match(req);
      return cached || caches.match('./index.html');
    }
  })());
});
