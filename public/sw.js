// Service worker for mobile-optimized caching
const CACHE_NAME = 'pacifinance-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/og-image.webp'
];

// Install event - Cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CRITICAL_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Cache first for images, network first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Cache first for images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
  }
  
  // Network first for everything else
  else {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })))
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data?.text() }; }
  const title = payload.title || 'Pacifinance';
  event.waitUntil(self.registration.showNotification(title, {
    body: payload.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    tag: payload.tag || 'pacifinance-reminder',
    data: {url: payload.url || '/dashboard'},
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requestedUrl = new URL(event.notification.data?.url || '/dashboard', self.location.origin);
  // Never let a push payload send the user off-site: only same-origin targets are honored.
  const target = (requestedUrl.origin === self.location.origin ? requestedUrl : new URL('/dashboard', self.location.origin)).href;
  event.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then((clients) => {
    const existing = clients.find((client) => client.url === target);
    return existing ? existing.focus() : self.clients.openWindow(target);
  }));
});
