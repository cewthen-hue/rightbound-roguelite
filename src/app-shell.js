(() => {
  "use strict";

  const bootScreen = document.getElementById("bootScreen");
  const overlay = document.getElementById("overlay");
  const PORTRAIT_ORIENTATION = "portrait-primary";
  let deferredInstallPrompt = null;
  let wakeLock = null;
  let portraitLockPending = false;

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

  async function requestPortraitLock() {
    const orientation = window.screen?.orientation;
    if (!orientation?.lock || portraitLockPending) return false;

    portraitLockPending = true;
    try {
      await orientation.lock(PORTRAIT_ORIENTATION);
      document.documentElement.dataset.orientationLock = "active";
      return true;
    } catch {
      document.documentElement.dataset.orientationLock = "deferred";
      return false;
    } finally {
      portraitLockPending = false;
    }
  }

  async function requestPortraitLockFromGesture() {
    const locked = await requestPortraitLock();
    if (locked) document.removeEventListener("pointerdown", requestPortraitLockFromGesture, true);
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
        await requestPortraitLock();
        showToast("Mode plein écran activé.");
        return;
      } catch {
        // Safari iOS ne permet pas toujours le plein écran depuis une page classique.
      }
    }

    if (isStandalone()) {
      await requestPortraitLock();
      showToast("Rightbound est déjà lancé comme une application.");
    } else {
      window.RightboundUI?.showInstallHelp?.();
    }
  }

  async function requestInstall() {
    if (isStandalone()) {
      await requestPortraitLock();
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

  window.addEventListener("appinstalled", async () => {
    deferredInstallPrompt = null;
    document.body.classList.add("is-standalone");
    await requestPortraitLock();
    showToast("Rightbound a été installé.");
  });

  document.addEventListener("rightbound:install-request", requestInstall);
  document.addEventListener("rightbound:fullscreen-request", requestFullscreen);
  document.addEventListener("pointerdown", requestPortraitLockFromGesture, { capture:true, passive:true });
  document.addEventListener("fullscreenchange", requestPortraitLock);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    requestPortraitLock();
    if (document.body.classList.contains("is-playing")) acquireWakeLock();
  });

  window.addEventListener("orientationchange", () => {
    window.setTimeout(requestPortraitLock, 120);
  }, { passive:true });

  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("dragstart", (event) => event.preventDefault());

  if (overlay) {
    const observer = new MutationObserver(syncPlayState);
    observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
    syncPlayState();
  }

  if (isStandalone()) {
    document.body.classList.add("is-standalone");
    requestPortraitLock();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("service-worker.js?v=0.34.0", { scope: "./" });
        registration.update();
      } catch (error) {
        console.warn("Service worker non disponible :", error);
      }
    });
  }

  window.RightboundPlatform = Object.freeze({
    version:"1.0.1",
    orientation:PORTRAIT_ORIENTATION,
    isStandalone,
    requestPortraitLock
  });

  window.addEventListener("load", requestPortraitLock, { once:true });

  if (document.readyState === "complete") hideBootScreen();
  else window.addEventListener("load", hideBootScreen, { once: true });

  window.setTimeout(hideBootScreen, 1500);
})();
