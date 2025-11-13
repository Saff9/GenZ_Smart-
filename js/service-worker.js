/* ========== 
   GenZ Smart - service-worker.js
   PWA Logic for Offline Caching and Asset Management.
========== */

const CACHE_NAME = 'genz-smart-v1';

// List of files to cache upon installation (App Shell)
const urlsToCache = [
    '/',
    '/index.html',
    '/blog.html',
    '/about.html',
    '/admin.html',
    '/analytics.html',
    '/comments.html',
    '/settings.html',
    '/offline.html',
    '/styles/main.css',
    '/styles/analytics.css',
    '/styles/comments.css',
    '/js/app.js',
    '/js/analytics.js',
    '/js/comments.js',
    '/js/settings.js',
    '/js/notifications.js',
    '/js/admin.js',
    '/assets/logo.png',
    '/assets/favicon.ico',
    '/assets/your-photo.jpg',
    // Third-party libraries (e.g., FontAwesome)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

/**
 * Installation: Caches the App Shell files.
 */
self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching App Shell assets');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Forces the waiting service worker to become the active service worker
});

/**
 * Activation: Cleans up old caches.
 */
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`Service Worker: Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Makes the service worker control all clients immediately
    );
});

/**
 * Fetch: Intercepts network requests.
 * Strategy: Cache First, then Network (for App Shell), Network First, then Cache (for dynamic content).
 */
self.addEventListener('fetch', event => {
    // If request is for an HTML page, use Cache First strategy with a Network fallback (and an offline page)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    // No cache hit - go to network
                    return fetch(event.request)
                        .catch(() => {
                            // If network fails, serve offline page
                            return caches.match('/offline.html');
                        });
                })
        );
        return; // Stop here for navigation requests
    }

    // For all other assets (CSS, JS, Images, Fonts), use Cache First strategy
    event.respondWith(
        caches.match(event.request).then(response => {
            // Cache hit - return response
            if (response) {
                return response;
            }
            
            // Clone the request as it's a stream and can only be consumed once
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(response => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response (since the browser consumes the response stream)
                const responseToCache = response.clone();

                // Only cache assets that are GET requests and not part of the local database
                if (event.request.method === 'GET' && !event.request.url.includes('GenZDb')) {
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }

                return response;
            });
        })
    );
});

// Mock Push Notification handling (requires server-side logic in a real app)
self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Push received:', data);
    
    const title = data.title || 'GenZ Smart Update';
    const options = {
        body: data.body || 'New activity in the community!',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Open the page corresponding to the notification data
    const targetUrl = event.notification.data.url;
    event.waitUntil(
        clients.openWindow(targetUrl)
    );
});
