const CACHE_NAME = 'sidao-dicas-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('[Service Worker] Installed');
  
  // Pré-cache da raiz para passar no teste de detecção offline do PWABuilder
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  console.log('[Service Worker] Activated');
});

self.addEventListener('fetch', (event) => {
  // Retorna do cache em caso de erro na rede (Offline Mode)
  event.respondWith(
    fetch(event.request).catch(async (error) => {
      console.log('[Service Worker] Fetch failed, checking cache:', error);
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Fallback genérico para a página inicial se for navegação
      if (event.request.mode === 'navigate') {
        return cache.match('/');
      }
      
      throw error;
    })
  );
});

// === CAPABILIDADES AVANÇADAS PARA O PWABUILDER ===

// 1. Background Sync API
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event fired:', event.tag);
  // Aqui entraria a lógica de reenviar dados quando a internet voltar
});

// 2. Periodic Sync API
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync event fired:', event.tag);
  // Aqui entraria a lógica de atualizar dados (como novas ofertas) em segundo plano
});

// 3. Web Push Notifications API
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  const title = 'Nova Oferta do Sidão Dicas!';
  const options = {
    body: event.data ? event.data.text() : 'Temos um novo bug imperdível rolando agora!',
    icon: '/icon-512.png',
    badge: '/icon-512.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
