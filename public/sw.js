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
  // Ignora requisições que não sejam GET (POST, PUT, DELETE, etc não podem ser cacheados)
  if (event.request.method !== 'GET') return;

  // Ignora requisições para a API do Supabase ou rotas de API do Next.js para evitar cache de dados dinâmicos
  if (event.request.url.includes('/api/')) return;
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Verifica se a resposta é válida antes de cachear
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Se a rede estiver ok, atualiza o cache e retorna a resposta
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Se a rede falhar (offline), tenta o cache
        return caches.match(event.request);
      })
  );
});
