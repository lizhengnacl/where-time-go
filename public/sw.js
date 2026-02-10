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
      // 注销自身
      self.registration.unregister(),
      // 清理所有缓存
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name);
      }),
      // 立即接管页面
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker unregistered and caches cleared.');
    })
  );
});
