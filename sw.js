const CACHE = "agriman-v8";
const ASSETS = ["./logo.jpg", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isAppShellPath(pathname) {
  return (
    pathname.endsWith("/") ||
    pathname.endsWith("/index.html") ||
    pathname.endsWith("/admin.html") ||
    pathname.endsWith("/admin.js") ||
    pathname.endsWith("/app.js") ||
    pathname.endsWith("/styles.css") ||
    pathname.endsWith("/config.js") ||
    pathname.endsWith("/sw.js")
  );
}

// Network-first for app shell; do not serve stale HTML/JS/CSS from cache on update.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isAppShellPath(url.pathname)) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
