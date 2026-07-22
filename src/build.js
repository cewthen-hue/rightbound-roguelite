(() => {
  "use strict";

  const profile = window.RightboundPlayerProfile;
  if (!profile) {
    console.error("[Rightbound] Le calcul du build nécessite le profil joueur.");
    return;
  }

  const BASE_STATS = Object.freeze({
    damage: 12,
    armor: 0,
    hp: 100,
    power: 0,
    speed: 0,
    critChance: 0,
    attackSpeed: 0,
    cooldownReduction: 0,
    healing: 0,
    dodge: 0
  });

  const BASE_COMBAT = Object.freeze({
    critChance: 0.08,
    attackDelay: 0.72,
    moveSpeed: 130,
    skillPower: 1,
    skillCooldownMultiplier: 1,
    potions: 0
  });

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function countQuickConsumables() {
    const state = profile.getState();
    return state.quickSlots.reduce((total, uid) => {
      if (!uid) return total;
      return profile.getItemForInstance(uid)?.type === "consumable" ? total + 1 : total;
    }, 0);
  }

  function getRawStats() {
    return Object.freeze({ ...profile.getLoadoutStats(BASE_STATS) });
  }

  function getPowerScore() {
    return profile.getPowerScore(BASE_STATS);
  }

  function getCombatStats() {
    const raw = getRawStats();
    const attackSpeed = clamp(raw.attackSpeed || 0, 0, 65);
    const cooldownReduction = clamp(raw.cooldownReduction || 0, 0, 50);
    const healing = clamp(raw.healing || 0, 0, 100);
    const dodge = clamp(raw.dodge || 0, 0, 45);

    return Object.freeze({
      raw,
      powerScore: getPowerScore(),
      maxHp: Math.max(1, Math.round(raw.hp)),
      damage: Math.max(1, Number(raw.damage) || 1),
      armor: Math.max(0, Number(raw.armor) || 0),
      critChance: clamp(BASE_COMBAT.critChance + (raw.critChance || 0) / 100, 0, 0.75),
      attackDelay: clamp(BASE_COMBAT.attackDelay / (1 + attackSpeed / 100), 0.24, BASE_COMBAT.attackDelay),
      moveSpeed: BASE_COMBAT.moveSpeed * (1 + clamp(raw.speed || 0, 0, 80) / 100),
      skillPower: BASE_COMBAT.skillPower + Math.max(0, raw.power || 0) * 0.05,
      skillCooldownMultiplier: clamp(BASE_COMBAT.skillCooldownMultiplier - cooldownReduction / 100, 0.5, 1),
      healingMultiplier: 1 + healing / 100,
      dodgeChance: dodge / 100,
      potions: countQuickConsumables()
    });
  }

  function getReadiness(recommendedPower) {
    const recommended = Math.max(1, Number(recommendedPower) || 1);
    const power = getPowerScore();
    const ratio = power / recommended;
    if (ratio < 0.8) return Object.freeze({ key: "danger", label: "Très insuffisante", power, recommended, ratio });
    if (ratio < 1) return Object.freeze({ key: "low", label: "Un peu faible", power, recommended, ratio });
    if (ratio < 1.35) return Object.freeze({ key: "ready", label: "Adaptée", power, recommended, ratio });
    return Object.freeze({ key: "strong", label: "Supérieure", power, recommended, ratio });
  }

  function getEquippedItems() {
    const state = profile.getState();
    return Object.fromEntries(Object.entries(state.equipment).map(([type, uid]) => [
      type,
      uid ? profile.getItemForInstance(uid) : null
    ]));
  }

  function emitBuildChange(reason = "profile-update") {
    document.dispatchEvent(new CustomEvent("rightbound:build-changed", {
      detail: {
        reason,
        stats: getCombatStats(),
        equippedItems: getEquippedItems()
      }
    }));
  }

  document.addEventListener("rightbound:profile-changed", (event) => {
    emitBuildChange(event.detail?.reason || "profile-update");
  });

  window.RightboundBuild = Object.freeze({
    version: "1.0.0",
    baseStats: BASE_STATS,
    baseCombat: BASE_COMBAT,
    getRawStats,
    getPowerScore,
    getCombatStats,
    getReadiness,
    getEquippedItems
  });

  queueMicrotask(() => emitBuildChange("ready"));
})();
