// Service Worker para PWA
const CACHE_NAME = 'laiza-makeup-v2'; // Incrementando versão para forçar atualização
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Instalação - cacheia recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Ativação - limpa caches antigos
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
    })
  );
  self.clients.claim();
});

// Estratégia Network First: Tenta rede primeiro para garantir atualizações, se falhar vai pro cache (ideal para Android/PWA)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a rede estiver ok, atualiza o cache e retorna a resposta
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // Se a rede falhar (offline), tenta o cache
        return caches.match(event.request);
      })
  );
});
