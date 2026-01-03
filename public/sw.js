// Service Worker para PWA
const CACHE_NAME = 'laiza-makeup-v3-force-update'; // Versão V3 para garantir renovação
const urlsToCache = [
  '/',
  '/manifest.json'
];

// PWA DESABILITADO - Este arquivo agora remove qualquer Service Worker instalado
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Remove TODOS os caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Removendo cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Desregistra este próprio service worker
      self.registration.unregister()
    ])
  );
});
