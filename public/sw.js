const CACHE_NAME = 'business-manager-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/logo.png',
  '/images/invoice-background.png',
  '/images/paid-stamp.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/invoices',
  '/products',
  '/materials',
  '/purchases',
  '/reports',
];

// On install, cache the core assets.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Failed to cache initial assets:', err);
        })
      })
  );
});

// On fetch, use a "network falling back to cache" strategy.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
      return;
  }

  event.respondWith(
    // Try the network first
    fetch(event.request)
      .then((response) => {
        // If we get a valid response, cache it and return it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If the network fails, try to get it from the cache.
        return caches.match(event.request);
      })
  );
});


// On activate, remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
