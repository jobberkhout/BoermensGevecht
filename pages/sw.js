/*
 * Keeps a copy of the game on the phone, so it plays without internet once it
 * has been opened. The whole game is one page, so that page is nearly all
 * there is to keep.
 *
 * Online, the newest version is fetched and the copy refreshed. With no
 * internet, or a connection too slow to wait for, the copy is played.
 */
const CACHE = 'boermens-gevecht-1';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
/** How long to wait for the network before playing the copy. */
const PATIENCE = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // The page is kept under one name, whatever was added to its address.
      const key = request.mode === 'navigate' ? './' : request;
      const kept = await cache.match(key, { ignoreSearch: true });
      const fresh = fetch(request).then((response) => {
        if (response.ok) void cache.put(key, response.clone());
        return response;
      });
      if (!kept) return fresh;
      const late = new Promise((resolve) => setTimeout(() => resolve(kept), PATIENCE));
      return Promise.race([fresh.catch(() => kept), late]);
    })(),
  );
});
