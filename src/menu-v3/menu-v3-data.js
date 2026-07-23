(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const VERSION = "0.34.0-lot3.4";
  const HERO_STORAGE_KEY = "rightbound-hero-progression-v1";
  const HERO_SCHEMA_VERSION = 1;
  const HERO_NAME = "JACK";
  const WORLD = Object.freeze({
    id:1,
    label:"MONDE 1",
    titleLines:["LES FAUBOURGS", "OUBLIÉS"]
  });
  const TEMPORARY_RESOURCES = Object.freeze({ gems:0, energy:0, energyCost:10 });
  const FALLBACK_LEVEL = Object.freeze({
    id:1,
    name:"Entrée des ruines",
    power:30,
    chest:"Bronze",
    chestType:"bronze",
    type:"normal"
  });
  const CHEST_TYPES = Object.freeze(["bronze", "silver", "gold", "diamond"]);
  let scheduled = false;
  let lastSnapshot = null;

  function normalizeInteger(value, fallback = 0, minimum = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(minimum, Math.floor(parsed));
  }

  function xpRequiredForLevel(level) {
    return 150 + Math.max(0, normalizeInteger(level, 1, 1) - 1) * 50;
  }

  function sanitizeHeroProgression(raw) {
    let level = normalizeInteger(raw?.level, 1, 1);
    let xp = normalizeInteger(raw?.xp, 0, 0);
    let required = xpRequiredForLevel(level);

    while (xp >= required) {
      xp -= required;
      level += 1;
      required = xpRequiredForLevel(level);
    }

    return {
      schemaVersion:HERO_SCHEMA_VERSION,
      level,
      xp
    };
  }

  function loadHeroProgression() {
    try {
      const stored = JSON.parse(localStorage.getItem(HERO_STORAGE_KEY));
      const clean = sanitizeHeroProgression(stored);
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(clean));
      return clean;
    } catch {
      const fallback = sanitizeHeroProgression(null);
      try { localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(fallback)); } catch {}
      return fallback;
    }
  }

  let heroProgression = loadHeroProgression();

  function reloadHeroProgression() {
    heroProgression = loadHeroProgression();
    return getHeroProgression();
  }

  function saveHeroProgression(reason = "update") {
    heroProgression = sanitizeHeroProgression(heroProgression);
    try { localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(heroProgression)); } catch {}
    const detail = { reason, progression:getHeroProgression() };
    document.dispatchEvent(new CustomEvent("rightbound:hero-progression-changed", { detail }));
    scheduleSync();
    return detail.progression;
  }

  function getHeroProgression() {
    const level = heroProgression.level;
    const xp = heroProgression.xp;
    const xpRequired = xpRequiredForLevel(level);
    return Object.freeze({
      schemaVersion:HERO_SCHEMA_VERSION,
      level,
      xp,
      xpRequired,
      progress:xpRequired > 0 ? Math.min(1, xp / xpRequired) : 0
    });
  }

  function setHeroProgression(next = {}) {
    heroProgression = sanitizeHeroProgression({
      level:next.level ?? heroProgression.level,
      xp:next.xp ?? heroProgression.xp
    });
    return saveHeroProgression("set");
  }

  function addHeroXp(amount) {
    heroProgression.xp += normalizeInteger(amount, 0, 0);
    return saveHeroProgression("xp-added");
  }

  function formatNumber(value) {
    return normalizeInteger(value, 0, 0).toLocaleString("fr-FR");
  }

  function readinessDisplay(readiness) {
    switch (readiness?.key) {
      case "strong": return "SUPÉRIEUR";
      case "ready": return "ADAPTÉ";
      case "low": return "UN PEU FAIBLE";
      case "danger": return "TRÈS FAIBLE";
      default: return "INCONNU";
    }
  }

  function levelStateLabel(level) {
    if (level.completed) return "terminé";
    if (!level.unlocked) return "verrouillé";
    return "disponible";
  }

  function getLevelsSnapshot() {
    const progressionApi = window.RightboundProgression;
    const levels = progressionApi?.levels?.length ? progressionApi.levels : [FALLBACK_LEVEL];
    const selected = progressionApi?.getSelectedLevel?.() || levels[0] || FALLBACK_LEVEL;
    const progression = progressionApi?.getState?.() || { unlockedLevel:1, completedLevels:[] };

    return Object.freeze(levels.map((level) => {
      const unlocked = Boolean(
        progressionApi?.isLevelUnlocked?.(level.id) ?? level.id <= normalizeInteger(progression.unlockedLevel, 1, 1)
      );
      const completed = Boolean(
        progressionApi?.isLevelCompleted?.(level.id) ?? progression.completedLevels?.includes(level.id)
      );
      const state = completed ? "completed" : unlocked ? "available" : "locked";

      return Object.freeze({
        ...level,
        selected:level.id === selected.id,
        unlocked,
        completed,
        state
      });
    }));
  }

  function getLevelSnapshot(levelsSnapshot) {
    const levels = levelsSnapshot?.length ? levelsSnapshot : getLevelsSnapshot();
    const level = levels.find((entry) => entry.selected) || levels[0] || { ...FALLBACK_LEVEL, selected:true, unlocked:true, completed:false, state:"available" };
    const build = window.RightboundBuild;
    const heroPower = build?.getPowerScore?.() ?? window.RightboundPlayerProfile?.getPowerScore?.() ?? 0;
    const readiness = build?.getReadiness?.(level.power) || {
      key:heroPower >= level.power ? "ready" : "low",
      label:heroPower >= level.power ? "Adaptée" : "Un peu faible",
      power:heroPower,
      recommended:level.power,
      ratio:level.power > 0 ? heroPower / level.power : 0
    };

    return Object.freeze({
      ...level,
      total:levels.length,
      heroPower,
      readiness:Object.freeze({ ...readiness, display:readinessDisplay(readiness) })
    });
  }

  function getChestSnapshot() {
    const raw = window.RightboundChests?.getState?.() || {};
    const counts = Object.fromEntries(CHEST_TYPES.map((type) => [
      type,
      normalizeInteger(raw.chests?.[type], 0, 0)
    ]));
    const calculatedTotal = CHEST_TYPES.reduce((total, type) => total + counts[type], 0);

    return Object.freeze({
      ...counts,
      total:normalizeInteger(raw.total, calculatedTotal, 0),
      opened:normalizeInteger(raw.opened, 0, 0),
      pending:Boolean(raw.pendingOpening)
    });
  }

  function getSnapshot() {
    const hero = getHeroProgression();
    const levels = getLevelsSnapshot();
    const level = getLevelSnapshot(levels);
    const gold = window.RightboundEconomy?.getGold?.() ?? 0;

    return Object.freeze({
      version:VERSION,
      hero:Object.freeze({ name:HERO_NAME, ...hero }),
      resources:Object.freeze({
        gold:normalizeInteger(gold, 0, 0),
        gems:TEMPORARY_RESOURCES.gems,
        energy:TEMPORARY_RESOURCES.energy,
        energyCost:TEMPORARY_RESOURCES.energyCost,
        temporaryPremiumResources:true
      }),
      chests:getChestSnapshot(),
      world:WORLD,
      level,
      levels
    });
  }

  function setText(root, selector, value) {
    const node = root.querySelector(selector);
    const next = String(value);
    if (node && node.textContent !== next) node.textContent = next;
  }

  function setAttribute(node, name, value) {
    if (!node) return;
    const next = String(value);
    if (node.getAttribute(name) !== next) node.setAttribute(name, next);
  }

  function bindLevelStates(shell, levels) {
    levels.forEach((level) => {
      const node = shell.querySelector(`[data-v3-level="${level.id}"]`);
      if (!node) return;

      if (node.dataset.levelType !== level.type) node.dataset.levelType = level.type;
      if (node.dataset.levelState !== level.state) node.dataset.levelState = level.state;
      if (node.dataset.levelUnlocked !== String(level.unlocked)) node.dataset.levelUnlocked = String(level.unlocked);
      if (node.dataset.levelCompleted !== String(level.completed)) node.dataset.levelCompleted = String(level.completed);
      node.classList.toggle("selected", level.selected);

      if (level.selected) setAttribute(node, "aria-current", "true");
      else if (node.hasAttribute("aria-current")) node.removeAttribute("aria-current");

      const selectedLabel = level.selected ? ", sélectionné" : "";
      setAttribute(
        node,
        "aria-label",
        `Niveau ${level.id}, ${level.name}, ${levelStateLabel(level)}${level.type === "elite" ? ", élite" : level.type === "boss" ? ", boss" : ""}${selectedLabel}`
      );
    });
  }

  function bindSnapshot(shell, snapshot) {
    const { hero, resources, world, level, levels } = snapshot;

    setText(shell, '[data-v3-bind="hero-name"]', hero.name);
    setText(shell, '[data-v3-bind="hero-level"]', `NIV. ${hero.level}`);
    setText(shell, ".menu-v3-xp-label", `${formatNumber(hero.xp)} / ${formatNumber(hero.xpRequired)} XP`);
    const xpProgress = `${Math.round(hero.progress * 10000) / 100}%`;
    const xpFill = shell.querySelector(".menu-v3-xp-meter i");
    if (xpFill && xpFill.style.getPropertyValue("--menu-v3-xp-progress") !== xpProgress) {
      xpFill.style.setProperty("--menu-v3-xp-progress", xpProgress);
    }

    setText(shell, '.menu-v3-resource-slot[data-resource="gold"] .menu-v3-resource-value', formatNumber(resources.gold));
    setText(shell, '.menu-v3-resource-slot[data-resource="gems"] .menu-v3-resource-value', formatNumber(resources.gems));
    setText(shell, '.menu-v3-resource-slot[data-resource="energy"] .menu-v3-resource-value', formatNumber(resources.energy));

    setText(shell, '[data-v3-bind="world-label"]', world.label);
    const worldLines = shell.querySelectorAll('[data-v3-bind="world-title"] span');
    worldLines.forEach((node, index) => {
      const next = world.titleLines[index] || "";
      if (node.textContent !== next) node.textContent = next;
    });

    setText(shell, '[data-v3-bind="level-number"]', `NIVEAU ${level.id} / ${level.total}`);
    setText(shell, '[data-v3-bind="level-name"]', String(level.name).toLocaleUpperCase("fr-FR"));
    setText(shell, '[data-v3-bind="readiness"]', level.readiness.display);
    setText(shell, '[data-v3-bind="recommended-power"]', formatNumber(level.power));
    setText(shell, '[data-v3-bind="hero-power"]', `Votre puissance : ${formatNumber(level.heroPower)}`);
    setText(shell, '[data-v3-bind="reward"]', `1 COFFRE ${String(level.chest).toLocaleUpperCase("fr-FR")}`);
    setText(shell, '[data-v3-bind="energy-cost"]', `ϟ ${formatNumber(resources.energyCost)}`);

    const badge = shell.querySelector('[data-v3-bind="readiness"]');
    if (badge && badge.dataset.readiness !== level.readiness.key) badge.dataset.readiness = level.readiness.key;
    const powerPanel = shell.querySelector('.menu-v3-stat-slot[data-stat="power"]');
    if (powerPanel && powerPanel.dataset.readiness !== level.readiness.key) powerPanel.dataset.readiness = level.readiness.key;

    bindLevelStates(shell, levels);

    if (shell.dataset.selectedLevel !== String(level.id)) shell.dataset.selectedLevel = String(level.id);
    if (shell.dataset.selectedLevelState !== level.state) shell.dataset.selectedLevelState = level.state;
    if (shell.dataset.heroLevel !== String(hero.level)) shell.dataset.heroLevel = String(hero.level);
    if (shell.dataset.chestTotal !== String(snapshot.chests.total)) shell.dataset.chestTotal = String(snapshot.chests.total);
    if (shell.dataset.menuV3Data !== VERSION) shell.dataset.menuV3Data = VERSION;
    if (shell.style.getPropertyValue("--menu-v3-xp-progress") !== xpProgress) {
      shell.style.setProperty("--menu-v3-xp-progress", xpProgress);
    }
  }

  function sync() {
    scheduled = false;
    const shell = modalContent.querySelector(".menu-v3-shell.menu-v3-components-ready");
    if (!shell) return null;
    const snapshot = getSnapshot();
    bindSnapshot(shell, snapshot);
    lastSnapshot = snapshot;
    document.dispatchEvent(new CustomEvent("rightbound:menu-v3-data-bound", {
      detail:{ version:VERSION, snapshot }
    }));
    return snapshot;
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  const observer = new MutationObserver(scheduleSync);
  observer.observe(modalContent, { childList:true, subtree:true });

  [
    "rightbound:menu-v3-synced",
    "rightbound:menu-v3-refresh-request",
    "rightbound:economy-changed",
    "rightbound:progression-changed",
    "rightbound:profile-changed",
    "rightbound:build-changed",
    "rightbound:run-rewarded",
    "rightbound:chests-changed",
    "rightbound:chests-ready",
    "rightbound:chest-opening-recovered",
    "rightbound:item-granted",
    "rightbound:player-profile-ready",
    "rightbound:hero-progression-changed"
  ].forEach((eventName) => document.addEventListener(eventName, scheduleSync));

  window.addEventListener("storage", (event) => {
    if (event.key === HERO_STORAGE_KEY) reloadHeroProgression();
    if ([HERO_STORAGE_KEY, "rightbound-economy-v1", "rightbound-progression-v2", "rightbound-player-profile-v1", "rightbound-selected-level-v1", "rightbound-chests-v1"].includes(event.key)) {
      scheduleSync();
    }
  });

  window.addEventListener("pageshow", () => {
    reloadHeroProgression();
    scheduleSync();
  });
  window.addEventListener("focus", scheduleSync, { passive:true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      reloadHeroProgression();
      scheduleSync();
    }
  });

  window.RightboundHeroProgression = Object.freeze({
    version:"1.1.0",
    storageKey:HERO_STORAGE_KEY,
    getState:getHeroProgression,
    setState:setHeroProgression,
    addXp:addHeroXp,
    reload:reloadHeroProgression,
    xpRequiredForLevel
  });

  window.RightboundMenuV3Data = Object.freeze({
    version:VERSION,
    getSnapshot,
    getLastSnapshot:() => lastSnapshot,
    refresh:scheduleSync,
    refreshNow:sync
  });

  scheduleSync();
})();
