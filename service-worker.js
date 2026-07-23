"use strict";

const CACHE_NAME = "rightbound-shell-v0.30.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles/game.css?v=0.2.1",
  "./styles/menu.css?v=0.3.0",
  "./styles/app.css?v=0.4.0",
  "./styles/fixes.css?v=0.4.4",
  "./styles/economy.css?v=0.10.0",
  "./styles/chests.css?v=0.11.0",
  "./styles/chest-loot.css?v=0.17.0",
  "./styles/level-menu.css?v=0.12.0",
  "./styles/progression.css?v=0.17.0",
  "./styles/build.css?v=0.18.0",
  "./styles/premium-level-menu.css?v=0.20.0",
  "./styles/premium-level-menu-final.css?v=0.21.0",
  "./styles/reference-topbar.css?v=0.22.0",
  "./styles/menu-full-assets.css?v=0.23.0",
  "./styles/inventory.css?v=0.9.0",
  "./styles/typography.css?v=0.22.1",
  "./styles/menu-polish.css?v=0.24.0",
  "./styles/runtime-performance.css?v=0.25.0",
  "./styles/menu-v2.css?v=0.26.0",
  "./styles/menu-v2-topbar.css?v=0.27.0",
  "./styles/menu-v2-world-header.css?v=0.28.0",
  "./styles/menu-v3/menu-v3.tokens.css?v=0.30.0",
  "./styles/menu-v3/menu-v3.layout.css?v=0.30.0",
  "./styles/menu-v3/menu-v3.debug.css?v=0.30.0",
  "./src/items.js?v=0.14.0",
  "./src/player-profile.js?v=0.15.0",
  "./src/build.js?v=0.18.0",
  "./src/combat-runtime.js?v=0.18.1",
  "./src/game.js?v=0.25.0",
  "./src/menu-assets.js?v=0.23.1",
  "./src/meta-menu.js?v=0.17.0",
  "./src/menu-layout.js?v=0.23.0",
  "./src/reference-topbar.js?v=0.23.0",
  "./src/menu-v2.js?v=0.26.0",
  "./src/menu-v2-topbar.js?v=0.27.0",
  "./src/menu-v2-world-header.js?v=0.28.0",
  "./src/menu-v3/menu-v3-shell.js?v=0.30.0",
  "./src/build-ui.js?v=0.18.0",
  "./src/loot.js?v=0.17.0",
  "./src/chests.js?v=0.17.0",
  "./src/inventory.js?v=0.15.0",
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
