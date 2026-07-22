(() => {
  "use strict";

  const buildSystem = window.RightboundBuild;
  if (!buildSystem) {
    console.error("[Rightbound] Le pont de combat nécessite le calcul central du build.");
    return;
  }

  const PROGRESSION_KEY = "rightbound-progression-v2";
  const SELECTED_LEVEL_KEY = "rightbound-selected-level-v1";
  const PLAYER_MARKER = Symbol("rightbound-player-runtime");
  const ENEMY_MARKER = Symbol("rightbound-enemy-runtime");
  const nativeAssign = Object.assign;
  const nativePush = Array.prototype.push;

  const LEVEL_FALLBACKS = Object.freeze([
    Object.freeze({ id: 1, power: 30, type: "normal" }),
    Object.freeze({ id: 2, power: 40, type: "normal" }),
    Object.freeze({ id: 3, power: 50, type: "normal" }),
    Object.freeze({ id: 4, power: 60, type: "normal" }),
    Object.freeze({ id: 5, power: 75, type: "elite" }),
    Object.freeze({ id: 6, power: 90, type: "normal" }),
    Object.freeze({ id: 7, power: 105, type: "normal" }),
    Object.freeze({ id: 8, power: 120, type: "normal" }),
    Object.freeze({ id: 9, power: 140, type: "normal" }),
    Object.freeze({ id: 10, power: 165, type: "boss" })
  ]);

  let lastSnapshot = null;
  let feedbackTimer = 0;

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function readProgression() {
    try {
      const value = JSON.parse(localStorage.getItem(PROGRESSION_KEY));
      return value && typeof value === "object" ? value : null;
    } catch {
      return null;
    }
  }

  function getActiveLevelId() {
    const progression = readProgression();
    const activeLevel = Number(progression?.activeRun?.levelId);
    if (Number.isInteger(activeLevel) && activeLevel >= 1 && activeLevel <= 10) return activeLevel;
    try {
      const selected = Number(localStorage.getItem(SELECTED_LEVEL_KEY));
      if (Number.isInteger(selected) && selected >= 1 && selected <= 10) return selected;
    } catch {}
    return 1;
  }

  function getLevelDefinition(levelId = getActiveLevelId()) {
    const liveLevel = window.RightboundProgression?.levels?.find?.((level) => level.id === levelId);
    return liveLevel || LEVEL_FALLBACKS.find((level) => level.id === levelId) || LEVEL_FALLBACKS[0];
  }

  function getLevelScaling(levelId = getActiveLevelId()) {
    const level = getLevelDefinition(levelId);
    const powerRatio = Math.max(1, (Number(level.power) || 30) / 30);
    const typeHpBonus = level.type === "boss" ? 1.12 : level.type === "elite" ? 1.06 : 1;
    const typeDamageBonus = level.type === "boss" ? 1.08 : level.type === "elite" ? 1.04 : 1;
    return Object.freeze({
      levelId,
      recommendedPower: Number(level.power) || 30,
      type: level.type || "normal",
      hpMultiplier: (0.78 + 0.22 * powerRatio) * typeHpBonus,
      damageMultiplier: (0.88 + 0.12 * powerRatio) * typeDamageBonus,
      attackDelayMultiplier: clamp(1 - (levelId - 1) * 0.012, 0.86, 1),
      bossHpBonus: level.type === "boss" ? 1.28 : 1,
      bossDamageBonus: level.type === "boss" ? 1.12 : 1
    });
  }

  function showCombatFeedback(message, kind = "info") {
    const zone = document.getElementById("gameZone");
    if (!zone || !message) return;
    let node = document.getElementById("combatBuildFeedback");
    if (!node) {
      node = document.createElement("div");
      node.id = "combatBuildFeedback";
      node.className = "combat-build-feedback";
      zone.appendChild(node);
    }
    window.clearTimeout(feedbackTimer);
    node.textContent = message;
    node.dataset.kind = kind;
    node.classList.remove("visible");
    void node.offsetWidth;
    node.classList.add("visible");
    feedbackTimer = window.setTimeout(() => node.classList.remove("visible"), 720);
  }

  function isPlayerResetSource(source) {
    return Boolean(
      source && typeof source === "object" &&
      Number(source.maxHp) === 100 &&
      Number(source.damage) === 12 &&
      Number(source.attackDelay) === 0.72 &&
      Number(source.moveSpeed) === 130 &&
      Array.isArray(source.cooldowns)
    );
  }

  function removeHpRuntime(target) {
    if (!target?.[PLAYER_MARKER]) return;
    const currentHp = Number(target.hp) || 0;
    delete target.hp;
    target.hp = currentHp;
    delete target[PLAYER_MARKER];
  }

  function installHpRuntime(target, combatStats) {
    let hpValue = clamp(Number(target.hp) || combatStats.maxHp, 0, Number(target.maxHp) || combatStats.maxHp);

    Object.defineProperty(target, PLAYER_MARKER, {
      value: true,
      configurable: true,
      enumerable: false
    });

    Object.defineProperty(target, "hp", {
      configurable: true,
      enumerable: true,
      get() {
        return hpValue;
      },
      set(nextValue) {
        let next = Number(nextValue);
        if (!Number.isFinite(next)) return;

        if (next < hpValue && hpValue > 0 && combatStats.dodgeChance > 0 && Math.random() < combatStats.dodgeChance) {
          showCombatFeedback("ESQUIVE", "dodge");
          document.dispatchEvent(new CustomEvent("rightbound:passive-dodge", {
            detail: { chance: combatStats.dodgeChance, hp: hpValue }
          }));
          return;
        }

        if (next > hpValue && combatStats.healingMultiplier > 1) {
          next = hpValue + (next - hpValue) * combatStats.healingMultiplier;
        }

        hpValue = clamp(next, 0, Number(target.maxHp) || combatStats.maxHp);
      }
    });
  }

  function updateProvisionalConsumableUi(combatStats) {
    queueMicrotask(() => {
      const button = document.getElementById("potionButton");
      const count = document.getElementById("potionCount");
      const label = button?.querySelector(".slot-name");
      if (count) count.textContent = String(combatStats.potions);
      if (label) label.textContent = combatStats.potions > 0 ? "Potion" : "Vide";
      if (button) button.setAttribute("aria-label", combatStats.potions > 0 ? "Utiliser une potion" : "Aucune potion équipée");
    });
  }

  function applyBuildToReset(target, source) {
    removeHpRuntime(target);
    const combatStats = buildSystem.getCombatStats();
    const patched = {
      ...source,
      maxHp: combatStats.maxHp,
      hp: combatStats.maxHp,
      damage: combatStats.damage,
      armor: combatStats.armor,
      critChance: combatStats.critChance,
      attackDelay: combatStats.attackDelay,
      moveSpeed: combatStats.moveSpeed,
      skillPower: combatStats.skillPower,
      skillCooldownMultiplier: combatStats.skillCooldownMultiplier,
      potions: combatStats.potions
    };

    nativeAssign(target, patched);
    installHpRuntime(target, combatStats);
    updateProvisionalConsumableUi(combatStats);

    const level = getLevelDefinition();
    lastSnapshot = Object.freeze({
      appliedAt: Date.now(),
      levelId: level.id,
      levelType: level.type,
      recommendedPower: level.power,
      build: combatStats,
      readiness: buildSystem.getReadiness(level.power)
    });

    document.dispatchEvent(new CustomEvent("rightbound:combat-loadout-applied", {
      detail: lastSnapshot
    }));
    return target;
  }

  Object.assign = function rightboundAssign(target, ...sources) {
    const resetIndex = sources.findIndex(isPlayerResetSource);
    if (resetIndex < 0) return nativeAssign(target, ...sources);

    const before = sources.slice(0, resetIndex);
    const after = sources.slice(resetIndex + 1);
    if (before.length) nativeAssign(target, ...before);
    applyBuildToReset(target, sources[resetIndex]);
    if (after.length) nativeAssign(target, ...after);
    return target;
  };

  function isEnemyCandidate(value) {
    return Boolean(
      value && typeof value === "object" &&
      typeof value.id === "string" &&
      (value.id === "boss" || /^e-\d+$/.test(value.id)) &&
      Number.isFinite(Number(value.worldPos)) &&
      Number.isFinite(Number(value.maxHp)) &&
      Number.isFinite(Number(value.damage))
    );
  }

  function scaleEnemy(enemy) {
    if (!isEnemyCandidate(enemy) || enemy[ENEMY_MARKER]) return enemy;
    const scaling = getLevelScaling();
    const bossHp = enemy.boss ? scaling.bossHpBonus : 1;
    const bossDamage = enemy.boss ? scaling.bossDamageBonus : 1;

    enemy.maxHp = Math.max(1, Math.round(enemy.maxHp * scaling.hpMultiplier * bossHp));
    enemy.hp = enemy.maxHp;
    enemy.damage = Math.max(1, Math.round(enemy.damage * scaling.damageMultiplier * bossDamage));
    enemy.attackDelay = Math.max(0.62, Number(enemy.attackDelay) * scaling.attackDelayMultiplier);

    Object.defineProperty(enemy, ENEMY_MARKER, {
      value: Object.freeze({
        levelId: scaling.levelId,
        hpMultiplier: scaling.hpMultiplier * bossHp,
        damageMultiplier: scaling.damageMultiplier * bossDamage
      }),
      enumerable: false,
      configurable: false
    });
    return enemy;
  }

  Array.prototype.push = function rightboundPush(...items) {
    items.forEach(scaleEnemy);
    return nativePush.apply(this, items);
  };

  window.RightboundCombatRuntime = Object.freeze({
    version: "1.0.0",
    getActiveLevelId,
    getLevelDefinition,
    getLevelScaling,
    getLastSnapshot: () => lastSnapshot,
    refreshPreview() {
      const level = getLevelDefinition();
      return Object.freeze({
        level,
        build: buildSystem.getCombatStats(),
        readiness: buildSystem.getReadiness(level.power),
        scaling: getLevelScaling(level.id)
      });
    }
  });
})();
