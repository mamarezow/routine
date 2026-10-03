/* Offline cache. Bump VERSION whenever you change any app file. */
const VERSION = "routine-v1";
const FILES = ["./", "index.html", "app.js", "manifest.webmanifest",
  "fonts/inter.woff2", "fonts/inter-600.woff2", "fonts/sahel.woff2", "fonts/sahel-bold.woff2",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Network first for pages (so updates show up), cache first for everything else */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const isPage = e.request.mode === "navigate";
  e.respondWith(isPage
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
    : caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok && new URL(e.request.url).origin === location.origin) { const c = res.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); } return res; })));
});
