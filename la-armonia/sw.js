// Service worker de la app La Armonía (alcance: /Presupuestos/la-armonia/)
// Páginas y archivos de la obra: primero la red (para ver siempre lo último del GitHub),
// si no hay señal se usa la copia guardada. Librerías y fuentes externas: copia guardada primero.
const V = 'armonia-v2';
const PRE = [
  './',
  './?ingeniero',
  './ingeniero/',
  './La-Armonia-carpeta-de-obra-cubierta.pdf',
  './app/',
  './app/manifest.webmanifest',
  './app/icon-192.png',
  './app/icon-512.png',
  './app/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(PRE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', e => {
  if (e.data === 'actualizar') {
    e.waitUntil(caches.open(V).then(c => Promise.allSettled(PRE.map(u => fetch(u, { cache: 'no-store' }).then(r => r.ok && c.put(u, r))))));
  }
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'api.github.com') return; // la app guarda esto por su cuenta

  const externo = /(^|\.)(jsdelivr\.net|googleapis\.com|gstatic\.com|unpkg\.com)$/.test(url.hostname);
  if (externo) {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok || r.type === 'opaque') c.put(req, r.clone());
      return r;
    }));
    return;
  }

  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(V);
    try {
      const r = await fetch(req, { cache: 'no-cache' });
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch (err) {
      return (await c.match(req)) || (await c.match(req, { ignoreSearch: true })) ||
        new Response('<h2 style="font-family:system-ui">Sin conexión y sin copia guardada de esta página.</h2>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  })());
});
