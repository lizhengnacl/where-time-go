/**
 * 自毁型 Service Worker
 * 用于注销旧版本 PWA 并清理缓存
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name);
      }),
      self.clients.claim()
    ])
  );
});
