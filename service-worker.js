
const CACHE_NAME = 'rekberan-cache-v3'; // Incremented cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/public/icons/icon-192x192.png', // Updated path
  '/public/icons/icon-512x512.png', // Updated path
  // Tailwind CSS is handled differently below for no-cors
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache:', CACHE_NAME);
        
        // Cache Tailwind CSS with no-cors
        try {
          const tailwindRequest = new Request('https://cdn.tailwindcss.com', { mode: 'no-cors' });
          await cache.add(tailwindRequest);
          console.log('Tailwind CSS (no-cors) added to cache.');
        } catch (err) {
          console.error('Failed to cache Tailwind CSS (no-cors):', err);
        }
        
        // Add other URLs
        try {
          await cache.addAll(urlsToCache);
          console.log('Core assets added to cache.');
        } catch (err) {
            console.error('Failed to cache core assets:', err, urlsToCache);
        }
      })
      .catch(err => {
        console.error('Failed to open cache during install:', err);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // For HTML navigation requests, try network first, then cache.
  if (event.request.mode === 'navigate' && event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) { // Only cache valid responses
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/index.html'); 
            });
        })
    );
    return;
  }

  // For other assets (CSS from CDN, JS, images, manifest), try cache first, then network.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response (2xx status) or an opaque response (for no-cors)
            if (!response || (response.status !== 200 && response.type !== 'opaque')) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        ).catch(err => {
            console.warn('Fetch failed for:', event.request.url, '; returning undefined from cache or network error', err);
            // Optionally, return a fallback for specific asset types, e.g., a placeholder image.
            // For now, just let the browser handle the network error if not cached.
        });
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Ensure new service worker takes control immediately
  );
});