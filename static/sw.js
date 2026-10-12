'use strict';

const CACHE_NAME = 'browser-storage-lab-v1';
const DEMO_CACHE_NAME = 'browser-storage-lab-demo-v1';

const APP_SHELL = ['/', '/index.html', '/style.css', '/app.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
                      .then(cache => cache.addAll(APP_SHELL))
                      .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys()
          .then(
              cacheNames => Promise.all(
                  cacheNames
                      .filter(
                          name => name.startsWith('browser-storage-lab-') &&
                              name !== CACHE_NAME &&
                              name !== 'browser-storage-lab-demo-v1')
                      .map(name => caches.delete(name))))
          .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
        fetch(request)
            .then(response => {
              if (response.ok) {
                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => cache.put('/', copy))
                    .catch(() => {});
              }

              return response;
            })
            .catch(async () => {
              const mainCache = await caches.open(CACHE_NAME);
              const demoCache = await caches.open(DEMO_CACHE_NAME);

              const customMatch = await demoCache.match(request);
              if (customMatch) {
                return customMatch;
              }

              return (await mainCache.match(request) ||
                      await mainCache.match('/index.html') ||
                      await mainCache.match('/')) ||
                  new Response(
                         'Приложение недоступно офлайн. Сначала откройте его онлайн.',
                         {
                           status: 503,
                           headers:
                               {'Content-Type': 'text/plain; charset=utf-8'}
                         });
            }));

    return;
  }

  if (request.method === 'GET' &&
      ['/', '/index.html', '/style.css', '/app.js'].includes(url.pathname)) {
    event.respondWith(caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(response => {
        if (!response.ok) {
          return response;
        }

        const copy = response.clone();

        caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy))
            .catch(() => {});

        return response;
      });
    }));
  }
});
