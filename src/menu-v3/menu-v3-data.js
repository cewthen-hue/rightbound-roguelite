(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const VERSION = "0.32.0-lot3.1";
  const HERO_STORAGE_KEY = "rightbound-hero-progression-v1";
  const HERO_SCHEMA_VERSION = 1;
  const HERO_NAME = "JACK";
  const WORLD = Object.freeze({
    id:1,
    label:"MONDE 1",
    titleLines:["LES FAUBOURGS", "OUBLIÉS"]
  });
  const TEMPORARY_RESOURCES = Object.freeze({ gems:0, energy:0, energyCost:10 });
  let scheduled = false;

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

  function getLevelSnapshot() {
    const progressionApi = window.RightboundProgression;
    const fallback = Object.freeze({ id:1, name:"Entrée des ruines", power:30, chest:"Bronze", chestType:"bronze", type:"normal" });
    const level = progressionApi?.getSelectedLevel?.() || fallback;
    const levels = progressionApi?.levels || [fallback];
    const progression = progressionApi?.getState?.() || { unlockedLevel:1, completedLevels:[] };
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
      unlocked:Boolean(progressionApi?.isLevelUnlocked?.(level.id) ?? level.id <= progression.unlockedLevel),
      completed:Boolean(progressionApi?.isLevelCompleted?.(level.id) ?? progression.completedLevels?.includes(level.id)),
      heroPower,
      readiness:Object.freeze({ ...readiness, display:readinessDisplay(readiness) })
    });
  }

  function getSnapshot() {
    const hero = getHeroProgression();
    const level = getLevelSnapshot();
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
      world:WORLD,
      level
    });
  }

  function setText(root, selector, value) {
    const node = root.querySelector(selector);
    if (node) node.textContent = String(value);
  }

  function bindSnapshot(shell, snapshot) {
    const { hero, resources, world, level } = snapshot;

    setText(shell, '[data-v3-bind="hero-name"]', hero.name);
    setText(shell, '[data-v3-bind="hero-level"]', `NIV. ${hero.level}`);
    setText(shell, ".menu-v3-xp-label", `${formatNumber(hero.xp)} / ${formatNumber(hero.xpRequired)} XP`);
    const xpFill = shell.querySelector(".menu-v3-xp-meter i");
    if (xpFill) xpFill.style.setProperty("--menu-v3-xp-progress", `${Math.round(hero.progress * 10000) / 100}%`);

    setText(shell, '.menu-v3-resource-slot[data-resource="gold"] .menu-v3-resource-value', formatNumber(resources.gold));
    setText(shell, '.menu-v3-resource-slot[data-resource="gems"] .menu-v3-resource-value', formatNumber(resources.gems));
    setText(shell, '.menu-v3-resource-slot[data-resource="energy"] .menu-v3-resource-value', formatNumber(resources.energy));

    setText(shell, '[data-v3-bind="world-label"]', world.label);
    const worldLines = shell.querySelectorAll('[data-v3-bind="world-title"] span');
    worldLines.forEach((node, index) => { node.textContent = world.titleLines[index] || ""; });

    setText(shell, '[data-v3-bind="level-number"]', `NIVEAU ${level.id} / ${level.total}`);
    setText(shell, '[data-v3-bind="level-name"]', String(level.name).toLocaleUpperCase("fr-FR"));
    setText(shell, '[data-v3-bind="readiness"]', level.readiness.display);
    setText(shell, '[data-v3-bind="recommended-power"]', formatNumber(level.power));
    setText(shell, '[data-v3-bind="hero-power"]', `Votre puissance : ${formatNumber(level.heroPower)}`);
    setText(shell, '[data-v3-bind="reward"]', `1 COFFRE ${String(level.chest).toLocaleUpperCase("fr-FR")}`);
    setText(shell, '[data-v3-bind="energy-cost"]', `ϟ ${formatNumber(resources.energyCost)}`);

    const badge = shell.querySelector('[data-v3-bind="readiness"]');
    if (badge) badge.dataset.readiness = level.readiness.key;
    const powerPanel = shell.querySelector('.menu-v3-stat-slot[data-stat="power"]');
    if (powerPanel) powerPanel.dataset.readiness = level.readiness.key;

    shell.dataset.selectedLevel = String(level.id);
    shell.dataset.heroLevel = String(hero.level);
    shell.dataset.menuV3Data = VERSION;
    shell.style.setProperty("--menu-v3-xp-progress", `${Math.round(hero.progress * 10000) / 100}%`);
  }

  function sync() {
    scheduled = false;
    const shell = modalContent.querySelector(".menu-v3-shell.menu-v3-components-ready");
    if (!shell) return;
    bindSnapshot(shell, getSnapshot());
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
    "rightbound:economy-changed",
    "rightbound:progression-changed",
    "rightbound:profile-changed",
    "rightbound:build-changed",
    "rightbound:run-rewarded",
    "rightbound:hero-progression-changed"
  ].forEach((eventName) => document.addEventListener(eventName, scheduleSync));

  window.addEventListener("storage", (event) => {
    if (event.key === HERO_STORAGE_KEY) heroProgression = loadHeroProgression();
    if ([HERO_STORAGE_KEY, "rightbound-economy-v1", "rightbound-progression-v2", "rightbound-player-profile-v1"].includes(event.key)) {
      scheduleSync();
    }
  });

  window.RightboundHeroProgression = Object.freeze({
    version:"1.0.0",
    storageKey:HERO_STORAGE_KEY,
    getState:getHeroProgression,
    setState:setHeroProgression,
    addXp:addHeroXp,
    xpRequiredForLevel
  });

  window.RightboundMenuV3Data = Object.freeze({
    version:VERSION,
    getSnapshot,
    refresh:scheduleSync
  });

  scheduleSync();
})();
