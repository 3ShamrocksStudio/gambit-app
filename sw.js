const CACHE = 'rk-2026-10-18a';
const SHELL = [
  './',
  './index.html',
  './manifest.json'
];
// Cross-origin assets the app needs offline: the chess engine (versioned URL) and Google Fonts.
const ENGINE = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.12.1/chess.min.js';
const XO_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL).then(() =>
      c.add(new Request(ENGINE, { mode: 'cors' })).catch(() => {}) // best effort: CDN down must not block install
    )).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) {
    if (!XO_HOSTS.includes(url.hostname)) return;
    // Cache-first; refresh the fonts stylesheet in the background (its URL is not versioned).
    e.respondWith(
      caches.open(CACHE).then(c => c.match(e.request, { ignoreVary: true }).then(cached => {
        const net = () => fetch(e.request).then(res => {
          if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone());
          return res;
        });
        if (cached) { if (url.hostname === 'fonts.googleapis.com') net().catch(() => {}); return cached; }
        return net();
      }))
    );
    return;
  }

  // Network-first for HTML
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
