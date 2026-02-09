const CACHE_NAME = "where-time-go-v2";
const ASSETS_TO_CACHE = ["/time/", "/time/index.html", "/time/manifest.json"];

// 安装 Service Worker 并缓存基础资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

// 激活并清理旧缓存
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
});

// 拦截请求并尝试从缓存中获取
self.addEventListener("fetch", (event) => {
  // 仅拦截同源的 GET 请求
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // 排除 API 请求，API 请求应走网络
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              // 动态缓存新的资源
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
      .catch(() => {
        // 离线兜底
        if (event.request.mode === "navigate") {
          return caches.match("/time/");
        }
      }),
  );
});
