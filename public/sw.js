// Service Worker per cache ottimizzato mobile
const CACHE_NAME = 'pacifinance-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/src/assets/LandingPage/PacifinanceArt2NoBg.webp',
  '/src/assets/Brand/PacifinanceLogoPNG3NoBg.webp'
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
  
  // Cache first per immagini
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
  
  // Network first per tutto il resto
  else {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});