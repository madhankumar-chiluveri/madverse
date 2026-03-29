const CACHE_NAME = "madvibe-v5";
const STATIC_ASSETS = [
  "/manifest.json",
  "/app-icon.svg",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
];

function shouldCacheAsset(url) {
  return (
    url.origin === self.location.origin &&
    (
      url.pathname === "/manifest.json" ||
      url.pathname === "/app-icon.svg" ||
      url.pathname === "/apple-touch-icon.png" ||
      url.pathname.startsWith("/icons/")
    )
  );
}

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          const response = await fetch(asset, { cache: "no-cache" });

          if (!response.ok) {
            throw new Error(`Failed to precache ${asset}: ${response.status}`);
          }

          await cache.put(asset, response);
        })
      );

      await self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;
  if (!shouldCacheAsset(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
          }

          return response;
        })
        .catch(() => cached ?? new Response("Offline", { status: 503 }));

      return cached ?? networkFetch;
    })
  );
});

// Warm cached assets in the background if we served from cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || !shouldCacheAsset(url)) return;

  event.waitUntil(
    fetch(request)
      .then((response) => {
        if (!response.ok) return;

        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response);
        });
      })
      .catch(() => {})
  );
});

// Background sync for offline mutations
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-mutations") {
    event.waitUntil(syncOfflineMutations());
  }
});

async function syncOfflineMutations() {
  // Mutations are handled by Convex's built-in optimistic updates
  // This is a placeholder for custom offline queue implementation
  console.log("[SW] Syncing offline mutations");
}
