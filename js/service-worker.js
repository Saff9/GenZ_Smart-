// service-worker.js - basic offline caching service worker
const CACHE_NAME = 'genzsmart-v1';
const OFFLINE_URL = 'offline.html';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/styles/analytics.css',
  '/styles/comments.css',
  '/assets/logo.png',
  '/assets/favicon.ico',
  '/blog.html',
  '/about.html',
  '/admin.html',
  '/analytics.html',
  '/comments.html',
  '/settings.html',
  '/js/app.js',
  '/js/analytics.js',
  '/js/comments.js',
  '/js/notifications.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).catch(() => caches.match(OFFLINE_URL));
    })
  );
});
