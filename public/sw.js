const CACHE_NAME = 'sidao-dicas-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('[Service Worker] Installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  console.log('[Service Worker] Activated');
});

self.addEventListener('fetch', (event) => {
  // Passa a requisição adiante para a rede, que é o mínimo
  // para engatilhar os critérios de PWA no Lighthouse.
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.error('[Service Worker] Fetch failed:', error);
      throw error;
    })
  );
});
