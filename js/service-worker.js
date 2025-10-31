// ========== GENZ SMART SERVICE WORKER ==========
// Progressive Web App support with offline functionality

const CACHE_NAME = 'genz-smart-v1.2.0';
const STATIC_CACHE = 'genz-static-v1.2.0';
const DYNAMIC_CACHE = 'genz-dynamic-v1.2.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/blog.html',
    '/about.html',
    '/comments.html',
    '/analytics.html',
    '/admin.html',
    '/settings.html',
    '/styles/main.css',
    '/js/app.js',
    '/js/comments.js',
    '/js/analytics.js',
    '/js/settings.js',
    '/js/notifications.js',
    '/js/admin.js',
    '/assets/logo.png',
    '/assets/favicon.ico',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🛠️ Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker installed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Cache installation failed:', error);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('🎯 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip Chrome extensions
    if (event.request.url.startsWith('chrome-extension://')) return;

    // Handle API requests differently
    if (event.request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }

    // Handle navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(event.request));
        return;
    }

    // Handle static assets
    event.respondWith(handleStaticRequest(event.request));
});

async function handleApiRequest(request) {
    try {
        // Try network first for API requests
        const networkResponse = await fetch(request);
        
        // Clone and cache the successful response
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // If network fails, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page or error for API calls
        return new Response(
            JSON.stringify({ error: 'You are offline', timestamp: new Date().toISOString() }),
            { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        
        // Cache the successful response
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // If network fails, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return caches.match('/offline.html');
    }
}

async function handleStaticRequest(request) {
    // Cache first strategy for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Update cache in background
        updateCache(request);
        return cachedResponse;
    }

    // If not in cache, try network
    try {
        const networkResponse = await fetch(request);
        
        // Cache the successful response
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // If both cache and network fail, return error
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

async function updateCache(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silent fail - we have cached version
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Get pending actions from IndexedDB
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            await processPendingAction(action);
        }
        
        console.log('✅ Background sync completed');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'New update from GenZ Smart',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        image: data.image,
        data: data.url,
        actions: [
            {
                action: 'open',
                title: 'Read Now'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        tag: data.tag || 'genz-notification',
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'GenZ Smart', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    
    event.notification.close();

    if (event.action === 'open') {
        const urlToOpen = event.notification.data || '/';
        
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((windowClients) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // If no window/tab is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
    }
});

// Helper functions
async function getPendingActions() {
    // This would typically use IndexedDB
    // For now, return empty array
    return [];
}

async function processPendingAction(action) {
    // Process pending actions like unsent comments, likes, etc.
    console.log('Processing pending action:', action.type);
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'content-update') {
            console.log('🔄 Periodic background sync');
            event.waitUntil(updateContent());
        }
    });
}

async function updateContent() {
    // Update cached content in background
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        // Update strategy would go here
        console.log('📝 Background content update completed');
    } catch (error) {
        console.error('Background update failed:', error);
    }
}

// Message handling for client communication
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: '1.2.0' });
    }
});

console.log('🚀 GenZ Smart Service Worker loaded');
