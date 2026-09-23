// GharHisab Industrial PWA Service Worker
const CACHE_VERSION = "gharhisab-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/houses",
  "/payments",
  "/emails",
  "/settings",
  "/login",
  "/manifest.json",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/apple-touch-icon.png",
];

// Install: precache app shell and static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("[SW] Pre-cache partial fail:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key.startsWith("gharhisab-") && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => {
              console.log("[SW] Removing outdated cache:", key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first for pages and API, Stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Non-GET requests pass directly through
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore chrome extensions or non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Never cache API calls directly in SW to avoid stale financial data
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Static Assets (_next/static, icons, images, fonts): Cache-first with stale-while-revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff|woff2|ttf|eot|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match("/icons/icon-192.png"));
      })
    );
    return;
  }

  // HTML page navigation: Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const dashboardFallback = await caches.match("/dashboard");
          if (dashboardFallback) return dashboardFallback;
          return caches.match("/");
        })
    );
    return;
  }

  // Other GET requests: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Support manual skipWaiting from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
