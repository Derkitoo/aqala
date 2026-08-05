// Service worker for offline PWA support.
// CACHE_VERSION is stamped with a unique build id by scripts/cache-bust.js
// on every deploy, so a new deploy always gets a fresh cache namespace and
// old caches are purged on activate — this is what keeps this worker safe
// after the "Requiring unknown module" stale-bundle incident: entry files
// (index.html, index-*.js, __common-*.js, __expo-metro-runtime-*.js) are
// ALWAYS fetched network-first and only served from cache when truly
// offline, so online users never get a stale entry bundle. Only the
// content-hashed static assets (fonts, images) are cache-first, since
// their filename already changes whenever their content does.
const CACHE_VERSION = 'msfoeo2w';
const CACHE_NAME = `aqala-${CACHE_VERSION}`;
const SCOPE = self.registration.scope; // e.g. https://derkitoo.github.io/aqala/

function isEntryFile(url) {
  return (
    url.href === SCOPE ||
    url.href === SCOPE + 'index.html' ||
    /\/index-[^/]+\.js$/.test(url.pathname) ||
    /\/__common-[^/]+\.js$/.test(url.pathname) ||
    /\/__expo-metro-runtime-[^/]+\.js$/.test(url.pathname)
  );
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([SCOPE, SCOPE + 'manifest.json']).catch(() => {}),
    ),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isEntryFile(url)) {
    // Network-first: always prefer the freshest entry bundle, fall back to
    // cache only when offline.
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Cache-first for content-hashed static assets.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      });
    }),
  );
});
