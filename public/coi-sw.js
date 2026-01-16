// Service Worker - 添加 COOP/COEP 头部
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        const newHeaders = new Headers(response.headers);
        
        // 添加 COOP 和 COEP 头部
        newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
        
        return new Response(await response.arrayBuffer(), {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        return fetch(event.request);
      }
    })()
  );
});