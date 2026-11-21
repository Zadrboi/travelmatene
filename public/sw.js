/**
 * TravelMateNE Production Service Worker
 * Version: travelmatene-v1
 * Features: Offline Pre-caching, Cache-First for static assets,
 *           Network-First with offline fallback for pages and metrics.
 */

const CACHE_NAME = 'travelmatene-v1';

const PRECACHE_URLS = [
  '/',
  '/explore',
  '/permits/checker',
  '/transport',
  '/insights',
  '/dashboard',
  '/offline.html',
  '/manifest.json',
];

// Install: precache critical shell pages and offline screen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch((err) => console.warn('[SW] Cache add skipped:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: purge outdated cache generations
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name.startsWith('travelmatene-'))
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy dispatch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin or non-GET requests
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Strategy A: Cache-First for fonts, images, scripts, stylesheets, and _next/static
  const isStaticAsset =
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Return empty or fallback if asset fails
            return cachedResponse || new Response('', { status: 408 });
          });
      })
    );
    return;
  }

  // Strategy B: Network-First with cache fallback for pages and /api/metrics
  const isPageNavigation = request.mode === 'navigate';
  const isMetricsApi = url.pathname === '/api/metrics';

  if (isPageNavigation || isMetricsApi) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          // If page navigation fails and not in cache, present the dedicated offline pocket screen
          if (isPageNavigation) {
            const offlineScreen = await caches.match('/offline.html');
            if (offlineScreen) {
              return offlineScreen;
            }
          }
          return new Response('Network offline. Content unavailable.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // Strategy C: Default Stale-While-Revalidate for other same-origin requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
