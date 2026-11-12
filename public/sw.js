const CACHE_NAME = 'manisjaya-cache-v9';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch {}
      await self.clients.claim();
      try {
        const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windowClients) {
          client.postMessage({ type: 'SW_FORCE_RELOAD', cacheVersion: CACHE_NAME });
        }
      } catch {}
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Bypass dev, API, and dynamic endpoints completely
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('.vite') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname.includes('.run.app') ||
    url.hostname.includes('.ai.studio')
  ) {
    if (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname.includes('.run.app') ||
      url.hostname.includes('.ai.studio')
    ) {
      self.registration.unregister().catch(() => {});
    }
    return;
  }

  // Never intercept APK installers or ZIP downloads
  if (
    url.pathname.endsWith('.apk') ||
    url.pathname.endsWith('.zip') ||
    url.pathname.includes('ManisJaya_') ||
    url.search.includes('.apk')
  ) {
    return;
  }

  // Always network-only (no-store) for HTML navigation so GitHub Pages updates appear immediately
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => fetch(event.request))
    );
    return;
  }
});
