// Load current files when online and retain the complete app for offline use.
const CACHE = 'luna-shell-v18';
const FILES = [
  'index.html', 'manifest.webmanifest', 'styles/base.css', 'styles/screens.css',
  'scripts/app.js', 'scripts/screens.js', 'scripts/calendar.js', 'assets/fonts/manrope-cyrillic.woff2', 'assets/fonts/manrope-latin.woff2',
  'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png',
  ...['dream','moon','pink','stars','dusk','crescent','cloudbank'].map(id => 'assets/sky/' + id + '.webp'),
  ...['kitty','bunny','fox','panda','corgi','unicorn','dragon','deer','penguin','koala','owl',
    'llama','hedgehog','dino','capybara','raccoon','whale','axolotl','unicorn-rest'].map(id => 'assets/pets/' + id + '.webp'),
];
const base = new URL(self.registration.scope);
const entry = new URL('index.html', base);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(FILES.map(file => new Request(new URL(file, base), {cache:'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('luna-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(base.href) || url.pathname.endsWith('/version.txt') || url.searchParams.has('luna_refresh')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request, {cache:'no-store'});
      if (response.ok) {
        const copy = response.clone();
        await cache.put(request.mode === 'navigate' ? entry : request, copy).catch(() => {});
      }
      return response;
    } catch {
      return await cache.match(request.mode === 'navigate' ? entry : request) || Response.error();
    }
  })());
});
