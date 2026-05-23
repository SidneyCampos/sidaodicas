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
