// Service Worker para PWA
const CACHE_NAME = 'laiza-makeup-v3-force-update'; // Versão V3 para garantir renovação
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Instalação
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o novo SW a assumir imediatamente
  console.log('[SW] Installing v4 - Forçando atualização imediata');
  // ⚡ FORÇA ATIVAÇÃO IMEDIATA - NÃO ESPERA
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v4 - Limpando TUDO');
  
  event.waitUntil(
    Promise.all([
      // 🧹 LIMPA TODOS OS CACHES ANTIGOS (v1, v2, v3)
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deletando cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // ⚡ ASSUME CONTROLE IMEDIATO DE TODAS AS PÁGINAS ABERTAS
      self.clients.claim()
    ])
  );
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
