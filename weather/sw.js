// PWA service worker for Weather App (cache-first static, SWR for data)
const STATIC_CACHE = 'static-v2';
const DATA_CACHE   = 'data-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => ![STATIC_CACHE, DATA_CACHE].includes(k)).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const same = url.origin === location.origin;
  const isFn = url.pathname.startsWith('/.netlify/functions/weather');

  // static -> cache-first
  if (same && !isFn) {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
    return;
  }

  // function -> stale-while-revalidate
  if (same && isFn) e.respondWith(swr(e.request));
});

async function swr(req) {
  const cache = await caches.open(DATA_CACHE);
  const cached = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
                        .catch(() => null);
  if (cached) return cached;
  const res = await net;
  return res || new Response(JSON.stringify({ error:'offline' }), { status:503, headers:{'Content-Type':'application/json'}});
}