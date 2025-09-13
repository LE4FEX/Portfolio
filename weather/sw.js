const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'data-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![STATIC_CACHE, DYNAMIC_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // ข้าม non-GET
  if (e.request.method !== 'GET') return;

  // ไฟล์ static ใน origin เดียวกัน → cache first
  const isStatic = url.origin === location.origin;
  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }

  // request OpenWeather → stale-while-revalidate
  const isWeather = /api\.openweathermap\.org\/data\/2\.5\/weather/.test(url.href);
  if (isWeather) {
    e.respondWith(staleWhileRevalidate(e.request));
  }
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(req);

  const networkPromise = fetch(req)
    .then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  // ถ้ามี cache ให้ตอบกลับทันที และอัปเดตเบื้องหลัง
  if (cached) {
    networkPromise;
    return cached;
  }

  // ถ้าไม่มี cache รอเน็ต ถ้าเน็ตพัง ส่ง 503
  const net = await networkPromise;
  return net || new Response(JSON.stringify({ error: 'offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
