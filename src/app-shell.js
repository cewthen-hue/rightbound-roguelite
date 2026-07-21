(() => {
  "use strict";

  const bootScreen = document.getElementById("bootScreen");
  const overlay = document.getElementById("overlay");
  let deferredInstallPrompt = null;
  let wakeLock = null;

  const isStandalone = () => (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );

  function hideBootScreen() {
    window.setTimeout(() => bootScreen?.classList.add("is-hidden"), 360);
  }

  function showToast(message) {
    window.RightboundUI?.showToast?.(message);
  }

  async function requestFullscreen() {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        showToast("Mode plein écran désactivé.");
      } catch {
        showToast("Impossible de quitter le plein écran.");
      }
      return;
    }

    const root = document.documentElement;
    const request = root.requestFullscreen || root.webkitRequestFullscreen;

    if (request) {
      try {
        await request.call(root);
        showToast("Mode plein écran activé.");
        return;
      } catch {
        // Safari iOS ne permet pas toujours le plein écran depuis une page classique.
      }
    }

    if (isStandalone()) {
      showToast("Rightbound est déjà lancé comme une application.");
    } else {
      window.RightboundUI?.showInstallHelp?.();
    }
  }

  async function requestInstall() {
    if (isStandalone()) {
      showToast("Rightbound est déjà installé.");
      return;
    }

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") showToast("Installation lancée.");
      deferredInstallPrompt = null;
      document.body.classList.remove("install-available");
      return;
    }

    window.RightboundUI?.showInstallHelp?.();
  }

  async function acquireWakeLock() {
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        wakeLock = null;
      });
    } catch {
      wakeLock = null;
    }
  }

  function syncPlayState() {
    const playing = overlay?.classList.contains("hidden") === true;
    document.body.classList.toggle("is-playing", playing);
    if (playing) acquireWakeLock();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.dispatchEvent(new CustomEvent("rightbound:install-available"));
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    document.body.classList.add("is-standalone");
    showToast("Rightbound a été installé.");
  });

  document.addEventListener("rightbound:install-request", requestInstall);
  document.addEventListener("rightbound:fullscreen-request", requestFullscreen);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && document.body.classList.contains("is-playing")) {
      acquireWakeLock();
    }
  });

  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("dragstart", (event) => event.preventDefault());

  if (overlay) {
    const observer = new MutationObserver(syncPlayState);
    observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
    syncPlayState();
  }

  if (isStandalone()) {
    document.body.classList.add("is-standalone");
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("service-worker.js?v=0.4.0", { scope: "./" });
        registration.update();
      } catch (error) {
        console.warn("Service worker non disponible :", error);
      }
    });
  }

  if (document.readyState === "complete") hideBootScreen();
  else window.addEventListener("load", hideBootScreen, { once: true });

  window.setTimeout(hideBootScreen, 1500);
})();
