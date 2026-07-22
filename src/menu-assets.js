(() => {
  "use strict";

  const root = "assets/menu_full";
  const assets = Object.freeze({
    heroPortrait: `${root}/jack-portrait.webp`,
    heroStage: `${root}/jack-menu-idle.png`,
    worldBackground: `${root}/world-01-faubourgs.webp`,
    worldAtmosphere: `${root}/world-01-atmosphere.png`,

    topbarShell: `${root}/topbar-shell.png`,
    portraitFrame: `${root}/topbar-portrait-frame.png`,
    resourcePanel: `${root}/topbar-resource-bg.png`,
    plusButton: `${root}/topbar-plus-button.png`,
    xpFrame: `${root}/xp-bar-frame.png`,
    xpFill: `${root}/xp-bar-fill.png`,

    utilityButton: `${root}/utility-button-bg.png`,
    stageFrame: `${root}/frame-stage.png`,
    levelPlaque: `${root}/frame-level-plaque.png`,
    infoPanel: `${root}/frame-info-panel.png`,
    bottomDockFrame: `${root}/frame-bottom-dock.png`,

    playButton: `${root}/button-play.png`,
    playButtonPressed: `${root}/button-play-pressed.png`,
    playButtonLocked: `${root}/button-play-locked.png`,
    dockButton: `${root}/button-dock.png`,
    dockButtonActive: `${root}/button-dock-active.png`,

    nodeNormal: `${root}/node-normal.png`,
    nodeSelected: `${root}/node-selected.png`,
    nodeCompleted: `${root}/node-completed.png`,
    nodeLocked: `${root}/node-locked.png`,
    nodeElite: `${root}/node-elite.png`,
    nodeBoss: `${root}/node-boss.png`,
    arrowLeft: `${root}/arrow-left.png`,
    arrowRight: `${root}/arrow-right.png`,

    navInventory: `${root}/nav-inventory.png`,
    navSkills: `${root}/nav-skills.png`,
    navLevels: `${root}/nav-levels.png`,
    navChests: `${root}/nav-chests.png`,

    iconSettings: `${root}/settings.png`,
    iconJournal: `${root}/journal.png`,
    iconGold: `${root}/gold.png`,
    iconGem: `${root}/gem.png`,
    iconEnergy: `${root}/energy.png`,
    iconLock: `${root}/lock.png`,
    iconCheck: `${root}/check.png`,
    iconElite: `${root}/elite.png`,
    iconBoss: `${root}/boss.png`,
    iconInfo: `${root}/info.png`,

    chestBronze: `${root}/chest-bronze.png`,
    chestSilver: `${root}/chest-silver.png`,
    chestGold: `${root}/chest-gold.png`,
    chestDiamond: `${root}/chest-diamond.png`
  });

  const applied = new WeakMap();

  function resolve(key) {
    return assets[key] || null;
  }

  function clearBackground(element) {
    if (!element) return;
    applied.delete(element);
    element.classList.remove("menu-asset-ready", "menu-asset-loading");
    element.removeAttribute("data-asset-key");
    element.removeAttribute("data-asset-path");
    ["background-image", "background-size", "background-position", "background-repeat"]
      .forEach((property) => element.style.removeProperty(property));
  }

  function bindBackground(element, key, options = {}) {
    const path = resolve(key);
    if (!element || !path) return Promise.resolve(false);

    const signature = `${key}:${options.size || "contain"}:${options.position || "center"}`;
    if (applied.get(element) === signature) {
      return Promise.resolve(element.classList.contains("menu-asset-ready"));
    }

    applied.set(element, signature);
    element.dataset.assetKey = key;
    element.dataset.assetPath = path;
    element.classList.remove("menu-asset-ready");
    element.classList.add("menu-asset-loading");

    return new Promise((complete) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (applied.get(element) !== signature) return complete(false);
        element.style.setProperty("background-image", `url("${path}")`, "important");
        element.style.setProperty("background-size", options.size || "contain", "important");
        element.style.setProperty("background-position", options.position || "center", "important");
        element.style.setProperty("background-repeat", "no-repeat", "important");
        element.classList.remove("menu-asset-loading");
        element.classList.add("menu-asset-ready");
        complete(true);
      };
      image.onerror = () => {
        if (applied.get(element) === signature) {
          element.classList.remove("menu-asset-loading", "menu-asset-ready");
        }
        complete(false);
      };
      image.src = path;
    });
  }

  function chestKey(type) {
    return {
      bronze: "chestBronze",
      silver: "chestSilver",
      gold: "chestGold",
      diamond: "chestDiamond"
    }[type] || "chestBronze";
  }

  function nodeKey(level, state = {}) {
    if (state.completed) return "nodeCompleted";
    if (level?.type === "boss") return "nodeBoss";
    if (level?.type === "elite") return "nodeElite";
    if (state.selected) return "nodeSelected";
    if (state.locked) return "nodeLocked";
    return "nodeNormal";
  }

  window.RightboundMenuAssets = Object.freeze({
    version: "2.0.1",
    paths: assets,
    resolve,
    bindBackground,
    clearBackground,
    chestKey,
    nodeKey
  });
})();