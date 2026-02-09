const CACHE_NAME = "timary-v1";
const ASSETS_TO_CACHE = ["/time/", "/time/index.html", "/time/manifest.json"];

// 安装时缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// 网络优先策略 (适用于 API 和 动态资源)
self.addEventListener("fetch", (event) => {
  // 只处理同源请求，且只缓存 GET 请求
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果网络请求成功，克隆一份存入缓存
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络请求失败，尝试从缓存读取
        return caches.match(event.request);
      }),
  );
});
