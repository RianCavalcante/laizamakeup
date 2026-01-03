// Service Worker para PWA - Laiza Makeup
const CACHE_NAME = 'laiza-makeup-v4-cache-imgs';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon.jpg'
];

self.addEventListener('install', (evt) => {
  // Pre-cache static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  // Remove previous cached data from disk
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);

  // 1. Estratégia de Cache Agressivo para Imagens do Supabase
  // Verifica se é uma requisição para o storage do supabase
  if (url.origin.includes('supabase.co') && url.pathname.includes('/storage/v1/object/public/')) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.match(evt.request).then((response) => {
          // Se encontrou no cache, retorna imediatamente (Cache First)
          if (response) {
            return response;
          }
          // Se não, busca na rede, cacheia e retorna
          return fetch(evt.request).then((networkResponse) => {
            cache.put(evt.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. Estratégia Stale-While-Revalidate para o App (Next.js pages, CSS, JS)
  // Ignora requisições de API/POST/Next Internals que não devem ser cacheadas
  if (evt.request.method !== 'GET' || url.pathname.startsWith('/_next/static/development')) {
    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        const fetchPromise = fetch(evt.request).then((networkResponse) => {
          // Atualiza o cache com a versão mais nova
          cache.put(evt.request, networkResponse.clone());
          return networkResponse;
        });
        
        // Retorna o que tiver no cache PRIMEIRO, ou espera a rede se não tiver nada
        return response || fetchPromise;
      });
    })
  );
});
