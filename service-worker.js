"use strict";

const CACHE_NAME = "rightbound-shell-v0.10.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles/game.css?v=0.2.1",
  "./styles/menu.css?v=0.3.0",
  "./styles/app.css?v=0.4.0",
  "./styles/fixes.css?v=0.4.3",
  "./styles/economy.css?v=0.10.0",
  "./styles/inventory.css?v=0.9.0",
  "./src/game.js?v=0.2.1",
  "./src/meta-menu.js?v=0.10.0",
  "./src/inventory.js?v=0.9.0",
  "./src/health-sync.js?v=0.4.3",
  "./src/app-shell.js?v=0.4.0",
  "./assets/icons/icon.svg",
  "./assets/icons/maskable.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
      return response;
    }).catch(() => caches.match("./index.html", { ignoreSearch: true })));
    return;
  }

  event.respondWith(caches.match(request, { ignoreSearch: false }).then((cached) => {
    const network = fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => cached);
    return cached || network;
  }));
});
