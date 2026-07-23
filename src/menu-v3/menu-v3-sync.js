(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  const overlay = document.getElementById("overlay");
  if (!modalContent || !overlay) return;

  const VERSION = "0.34.0-lot3.4";
  const DOMAIN_EVENTS = Object.freeze([
    "rightbound:economy-changed",
    "rightbound:progression-changed",
    "rightbound:profile-changed",
    "rightbound:build-changed",
    "rightbound:run-rewarded",
    "rightbound:chests-changed",
    "rightbound:chests-ready",
    "rightbound:chest-opening-recovered",
    "rightbound:item-granted",
    "rightbound:hero-progression-changed",
    "rightbound:player-profile-ready",
    "rightbound:menu-v3-synced"
  ]);
  const STORAGE_KEYS = Object.freeze(new Set([
    "rightbound-economy-v1",
    "rightbound-progression-v2",
    "rightbound-player-profile-v1",
    "rightbound-selected-level-v1",
    "rightbound-chests-v1",
    "rightbound-hero-progression-v1"
  ]));

  let scheduled = false;
  let synchronizing = false;
  let dirtyDuringSync = false;
  let revision = 0;
  let lastView = "boot";
  let lastSignature = "";
  const pendingReasons = new Set(["boot"]);

  function detectView() {
    if (overlay.classList.contains("hidden")) return "combat";
    if (modalContent.querySelector(".menu-v3-shell, .menu-v2-shell")) return "expedition";
    if (modalContent.querySelector(".inventory-screen")) return "equipment";
    if (modalContent.querySelector(".chest-screen")) return "chests";
    if (modalContent.querySelector("#restartButton, .run-result-rewards")) return "result";
    if (modalContent.querySelector(".upgrade-card")) return "upgrade";
    if (modalContent.children.length) return "dialog";
    return "empty";
  }

  function snapshotSignature(snapshot) {
    if (!snapshot) return "missing";
    return JSON.stringify({
      hero:[snapshot.hero?.level, snapshot.hero?.xp, snapshot.hero?.xpRequired],
      resources:[snapshot.resources?.gold, snapshot.resources?.gems, snapshot.resources?.energy],
      level:[snapshot.level?.id, snapshot.level?.state, snapshot.level?.heroPower, snapshot.level?.readiness?.key],
      levels:snapshot.levels?.map((level) => [level.id, level.state, level.selected]),
      chests:[snapshot.chests?.total, snapshot.chests?.opened, snapshot.chests?.pending]
    });
  }

  function emitViewChange(nextView, reason) {
    const previousView = lastView;
    lastView = nextView;
    document.body.dataset.rightboundView = nextView;
    document.dispatchEvent(new CustomEvent("rightbound:view-changed", {
      detail:{ version:VERSION, previousView, view:nextView, reason }
    }));
  }

  function inspectView(reason = "dom") {
    const nextView = detectView();
    if (nextView !== lastView) {
      emitViewChange(nextView, reason);
      pendingReasons.add(`view:${nextView}`);
      if (nextView === "expedition") scheduleSync();
    }
    return nextView;
  }

  function requestRefresh(reason = "request") {
    pendingReasons.add(reason);
    if (synchronizing) {
      dirtyDuringSync = true;
      return;
    }
    if (inspectView(reason) === "expedition") scheduleSync();
  }

  function dispatchRefreshRequest(reasons) {
    document.dispatchEvent(new CustomEvent("rightbound:menu-v3-refresh-request", {
      detail:{ version:VERSION, reasons, revision:revision + 1 }
    }));
  }

  function finalizeSync(reasons, snapshot) {
    const shell = modalContent.querySelector(".menu-v3-shell.menu-v3-components-ready");
    if (!shell || detectView() !== "expedition") {
      synchronizing = false;
      pendingReasons.add("menu-unmounted-during-sync");
      return;
    }

    const signature = snapshotSignature(snapshot);
    revision += 1;
    lastSignature = signature;
    shell.dataset.menuV3Sync = VERSION;
    shell.dataset.syncRevision = String(revision);
    shell.dataset.syncStable = "true";

    document.dispatchEvent(new CustomEvent("rightbound:menu-v3-sync-complete", {
      detail:{
        version:VERSION,
        revision,
        reasons,
        changed:signature !== lastSignature,
        selectedLevelId:snapshot?.level?.id ?? null,
        selectedLevelState:snapshot?.level?.state ?? null,
        heroPower:snapshot?.level?.heroPower ?? null,
        gold:snapshot?.resources?.gold ?? null,
        chestTotal:snapshot?.chests?.total ?? 0
      }
    }));

    synchronizing = false;
    if (dirtyDuringSync || pendingReasons.size) {
      dirtyDuringSync = false;
      scheduleSync();
    }
  }

  function performSync() {
    scheduled = false;
    if (synchronizing || inspectView("sync") !== "expedition") return;

    synchronizing = true;
    dirtyDuringSync = false;
    const reasons = pendingReasons.size ? [...pendingReasons] : ["unspecified"];
    pendingReasons.clear();

    window.RightboundProgression?.resumePendingRunReward?.();
    window.RightboundMenuV3?.refresh?.();
    window.RightboundMenuV3Components?.refresh?.();
    dispatchRefreshRequest(reasons);

    requestAnimationFrame(() => {
      const snapshot = window.RightboundMenuV3Data?.refreshNow?.() || window.RightboundMenuV3Data?.getSnapshot?.() || null;
      window.RightboundMenuV3Interactions?.refreshNow?.();

      requestAnimationFrame(() => finalizeSync(reasons, snapshot));
    });
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(performSync);
  }

  const modalObserver = new MutationObserver(() => inspectView("modal-mutation"));
  modalObserver.observe(modalContent, { childList:true, subtree:false });

  const overlayObserver = new MutationObserver(() => inspectView("overlay-state"));
  overlayObserver.observe(overlay, { attributes:true, attributeFilter:["class"] });

  DOMAIN_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, () => requestRefresh(eventName));
  });

  window.addEventListener("storage", (event) => {
    if (!event.key || STORAGE_KEYS.has(event.key)) requestRefresh(`storage:${event.key || "clear"}`);
  });
  window.addEventListener("pageshow", () => requestRefresh("pageshow"));
  window.addEventListener("focus", () => requestRefresh("focus"), { passive:true });
  window.addEventListener("online", () => requestRefresh("online"), { passive:true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestRefresh("visibility-visible");
  });

  window.RightboundMenuV3Sync = Object.freeze({
    version:VERSION,
    refresh:requestRefresh,
    getRevision:() => revision,
    getView:detectView,
    getLastSignature:() => lastSignature,
    isSynchronizing:() => synchronizing
  });

  inspectView("boot");
  requestRefresh("initial-sync");
})();
