/* WebStorming OS V1.1.5 — Boot Guard Fix service worker
   Strategy: network-first + old cache purge. Prevents stale broken boot. */
const WS_VERSION = 'webstorming-os-v1.1.5-boot-fix';
const KEEP = new Set([WS_VERSION]);
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(WS_VERSION).then((cache) => cache.addAll([
    './',
    './index.html',
    './assets/css/app.css',
    './assets/js/boot-guard.js',
    './assets/js/app.js',
    './diagnose.html',
    './manifest.webmanifest'
  ]).catch(() => undefined)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => KEEP.has(key) ? undefined : caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(event.request);
      const cache = await caches.open(WS_VERSION);
      cache.put(event.request, fresh.clone()).catch(() => undefined);
      return fresh;
    } catch (_) {
      const cached = await caches.match(event.request);
      return cached || caches.match('./index.html');
    }
  })());
});
