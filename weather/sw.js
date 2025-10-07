// PWA service worker (cache-first static, SWR for OpenWeather API)
const STATIC_CACHE = 'static-v3';
const DATA_CACHE   = 'data-v3';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install',(e)=>{
  e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',(e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>![STATIC_CACHE,DATA_CACHE].includes(k)).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',(e)=>{
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const same = url.origin === location.origin;
  const isWeatherApi = url.origin === 'https://api.openweathermap.org';

  // static -> cache-first
  if (same){
    e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
    return;
  }
  // weather api -> stale-while-revalidate
  if (isWeatherApi){
    e.respondWith(swr(e.request));
    return;
  }
});

async function swr(req){
  const cache = await caches.open(DATA_CACHE);
  const cached = await cache.match(req);
  const net = fetch(req).then(res=>{ if(res.ok) cache.put(req,res.clone()); return res; }).catch(()=>null);
  if (cached) return cached;
  const res = await net;
  return res || new Response(JSON.stringify({ error:'offline' }), { status:503, headers:{'Content-Type':'application/json'} });
}
