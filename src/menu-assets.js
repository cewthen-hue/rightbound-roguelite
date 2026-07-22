(() => {
  "use strict";

  const assets = Object.freeze({
    heroPortrait: "assets/menu/hero/jack-portrait.webp",
    heroStage: "assets/menu/hero/jack-menu-idle.webp",
    worldBackground: "assets/menu/worlds/world-01-faubourgs.webp",
    worldAtmosphere: "assets/menu/worlds/world-01-atmosphere.webp",
    stageFrame: "assets/menu/ui/frame-stage.png",
    levelPlaque: "assets/menu/ui/frame-level-plaque.png",
    infoPanel: "assets/menu/ui/frame-info-panel.png",
    playButton: "assets/menu/ui/button-play.png",
    playButtonPressed: "assets/menu/ui/button-play-pressed.png",
    playButtonLocked: "assets/menu/ui/button-play-locked.png",
    nodeNormal: "assets/menu/ui/node-normal.png",
    nodeSelected: "assets/menu/ui/node-selected.png",
    nodeCompleted: "assets/menu/ui/node-completed.png",
    nodeLocked: "assets/menu/ui/node-locked.png",
    nodeElite: "assets/menu/ui/node-elite.png",
    nodeBoss: "assets/menu/ui/node-boss.png",
    navInventory: "assets/menu/icons/nav-inventory.png",
    navSkills: "assets/menu/icons/nav-skills.png",
    navLevels: "assets/menu/icons/nav-levels.png",
    navChests: "assets/menu/icons/nav-chests.png",
    iconSettings: "assets/menu/icons/settings.png",
    iconJournal: "assets/menu/icons/journal.png",
    iconGold: "assets/menu/icons/gold.png",
    iconPower: "assets/menu/icons/power.png",
    iconLock: "assets/menu/icons/lock.png",
    iconCheck: "assets/menu/icons/check.png",
    iconElite: "assets/menu/icons/elite.png",
    iconBoss: "assets/menu/icons/boss.png",
    chestBronze: "assets/menu/chests/chest-bronze.png",
    chestSilver: "assets/menu/chests/chest-silver.png",
    chestGold: "assets/menu/chests/chest-gold.png",
    chestDiamond: "assets/menu/chests/chest-diamond.png"
  });

  const applied = new WeakMap();

  function resolve(key) {
    return assets[key] || null;
  }

  function bindBackground(element, key, options = {}) {
    if (!element || !resolve(key)) return Promise.resolve(false);
    const signature = `${key}:${options.size || "contain"}:${options.position || "center"}`;
    if (applied.get(element) === signature) return Promise.resolve(element.classList.contains("menu-asset-ready"));
    applied.set(element, signature);
    element.dataset.assetKey = key;
    element.dataset.assetPath = resolve(key);

    return new Promise((complete) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (applied.get(element) !== signature) return complete(false);
        element.style.backgroundImage = `url("${resolve(key)}")`;
        element.style.backgroundSize = options.size || "contain";
        element.style.backgroundPosition = options.position || "center";
        element.style.backgroundRepeat = "no-repeat";
        element.classList.add("menu-asset-ready");
        complete(true);
      };
      image.onerror = () => {
        if (applied.get(element) === signature) element.classList.remove("menu-asset-ready");
        complete(false);
      };
      image.src = resolve(key);
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
    if (state.locked) return "nodeLocked";
    if (state.selected) return "nodeSelected";
    if (state.completed) return "nodeCompleted";
    if (level?.type === "boss") return "nodeBoss";
    if (level?.type === "elite") return "nodeElite";
    return "nodeNormal";
  }

  window.RightboundMenuAssets = Object.freeze({
    version: "1.0.0",
    paths: assets,
    resolve,
    bindBackground,
    chestKey,
    nodeKey
  });
})();
