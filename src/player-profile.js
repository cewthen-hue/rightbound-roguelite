(() => {
  "use strict";

  const STORAGE_KEY = "rightbound-player-profile-v1";
  const LEGACY_INVENTORY_KEY = "rightbound-inventory-v3";
  const SCHEMA_VERSION = 1;
  const INVENTORY_MIGRATION_VERSION = 1;
  const BAG_SIZE = 24;
  const QUICK_SIZE = 3;
  const STARTER_ITEM_ID = "weapon-garrison-sword";
  const EQUIPMENT_TYPES = Object.freeze(["weapon", "helmet", "chest", "jewel", "boots", "relic"]);
  const EQUIPMENT_SLOT_TYPES = Object.freeze({
    "equip-weapon": "weapon",
    "equip-helmet": "helmet",
    "equip-chest": "chest",
    "equip-jewel": "jewel",
    "equip-boots": "boots",
    "equip-relic": "relic"
  });

  const catalog = window.RightboundItemCatalog;
  if (!catalog) {
    console.error("[Rightbound] Le profil joueur nécessite le catalogue d’objets.");
    return;
  }

  function emptyEquipment() {
    return Object.fromEntries(EQUIPMENT_TYPES.map((type) => [type, null]));
  }

  function createStarterProfile() {
    const starterUid = "item-000001";
    return {
      schemaVersion: SCHEMA_VERSION,
      inventoryMigrationVersion: INVENTORY_MIGRATION_VERSION,
      starterGranted: true,
      nextItemSerial: 2,
      ownedItems: [{
        uid: starterUid,
        itemId: STARTER_ITEM_ID,
        level: 1,
        source: "starter",
        acquiredAt: Date.now()
      }],
      equipment: { ...emptyEquipment(), weapon: starterUid },
      bag: Array(BAG_SIZE).fill(null),
      quickSlots: Array(QUICK_SIZE).fill(null)
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeInteger(value, fallback = 0, minimum = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(minimum, Math.floor(parsed));
  }

  function normalizeInstance(raw, usedUids) {
    if (!raw || typeof raw !== "object") return null;
    const uid = typeof raw.uid === "string" ? raw.uid.trim() : "";
    const itemId = typeof raw.itemId === "string" ? raw.itemId.trim() : "";
    if (!uid || usedUids.has(uid) || !catalog.getItem(itemId)) return null;
    usedUids.add(uid);
    return {
      uid,
      itemId,
      level: normalizeInteger(raw.level, 1, 1),
      source: typeof raw.source === "string" && raw.source ? raw.source : "unknown",
      acquiredAt: normalizeInteger(raw.acquiredAt, Date.now(), 0)
    };
  }

  function sanitizeProfile(raw) {
    const usedUids = new Set();
    const ownedItems = Array.isArray(raw?.ownedItems)
      ? raw.ownedItems.map((entry) => normalizeInstance(entry, usedUids)).filter(Boolean)
      : [];
    const knownUids = new Set(ownedItems.map((entry) => entry.uid));
    const placed = new Set();

    const equipment = emptyEquipment();
    EQUIPMENT_TYPES.forEach((type) => {
      const uid = raw?.equipment?.[type];
      const instance = ownedItems.find((entry) => entry.uid === uid);
      const item = instance ? catalog.getItem(instance.itemId) : null;
      if (instance && item?.type === type && !placed.has(uid)) {
        equipment[type] = uid;
        placed.add(uid);
      }
    });

    const bag = Array(BAG_SIZE).fill(null);
    if (Array.isArray(raw?.bag)) {
      raw.bag.slice(0, BAG_SIZE).forEach((uid, index) => {
        if (knownUids.has(uid) && !placed.has(uid)) {
          bag[index] = uid;
          placed.add(uid);
        }
      });
    }

    const quickSlots = Array(QUICK_SIZE).fill(null);
    if (Array.isArray(raw?.quickSlots)) {
      raw.quickSlots.slice(0, QUICK_SIZE).forEach((uid, index) => {
        const instance = ownedItems.find((entry) => entry.uid === uid);
        const item = instance ? catalog.getItem(instance.itemId) : null;
        if (item?.type === "consumable" && !placed.has(uid)) {
          quickSlots[index] = uid;
          placed.add(uid);
        }
      });
    }

    ownedItems.forEach((instance) => {
      if (placed.has(instance.uid)) return;
      const emptyIndex = bag.findIndex((uid) => uid === null);
      if (emptyIndex >= 0) {
        bag[emptyIndex] = instance.uid;
        placed.add(instance.uid);
      }
    });

    const highestSerial = ownedItems.reduce((highest, instance) => {
      const match = instance.uid.match(/^item-(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);

    return {
      schemaVersion: SCHEMA_VERSION,
      inventoryMigrationVersion: INVENTORY_MIGRATION_VERSION,
      starterGranted: raw?.starterGranted === true,
      nextItemSerial: Math.max(normalizeInteger(raw?.nextItemSerial, 1, 1), highestSerial + 1),
      ownedItems,
      equipment,
      bag,
      quickSlots
    };
  }

  function migrateLegacyInventory() {
    const freshProfile = createStarterProfile();
    try {
      localStorage.removeItem(LEGACY_INVENTORY_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshProfile));
    } catch {}
    document.dispatchEvent(new CustomEvent("rightbound:inventory-migrated", {
      detail: {
        version: INVENTORY_MIGRATION_VERSION,
        starterItemId: STARTER_ITEM_ID,
        preservedKeys: ["rightbound-economy-v1", "rightbound-chests-v1", "rightbound-level-1-completed"]
      }
    }));
    return freshProfile;
  }

  function loadProfile() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!raw || normalizeInteger(raw.inventoryMigrationVersion) < INVENTORY_MIGRATION_VERSION) {
        return migrateLegacyInventory();
      }
      const clean = sanitizeProfile(raw);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      return clean;
    } catch {
      return migrateLegacyInventory();
    }
  }

  let state = loadProfile();

  function saveProfile(reason = "update") {
    state = sanitizeProfile(state);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    document.dispatchEvent(new CustomEvent("rightbound:profile-changed", {
      detail: { reason, profile: getState() }
    }));
    return getState();
  }

  function getState() {
    return clone(state);
  }

  function getInstance(uid) {
    const instance = state.ownedItems.find((entry) => entry.uid === uid);
    return instance ? { ...instance } : null;
  }

  function getItemForInstance(uid) {
    const instance = state.ownedItems.find((entry) => entry.uid === uid);
    return instance ? catalog.getItem(instance.itemId) : null;
  }

  function getOwnedInstances() {
    return state.ownedItems.map((entry) => ({ ...entry }));
  }

  function getOwnedItemIds() {
    return state.ownedItems.map((entry) => entry.itemId);
  }

  function hasItem(itemId) {
    return state.ownedItems.some((entry) => entry.itemId === itemId);
  }

  function slotDescriptor(slotId) {
    if (EQUIPMENT_SLOT_TYPES[slotId]) return { kind: "equipment", key: EQUIPMENT_SLOT_TYPES[slotId] };
    const bagMatch = /^bag-(\d+)$/.exec(slotId || "");
    if (bagMatch) {
      const index = Number(bagMatch[1]);
      if (index >= 0 && index < BAG_SIZE) return { kind: "bag", index };
    }
    const quickMatch = /^quick-(\d+)$/.exec(slotId || "");
    if (quickMatch) {
      const index = Number(quickMatch[1]);
      if (index >= 0 && index < QUICK_SIZE) return { kind: "quick", index };
    }
    return null;
  }

  function getSlotUid(slotId) {
    const descriptor = slotDescriptor(slotId);
    if (!descriptor) return null;
    if (descriptor.kind === "equipment") return state.equipment[descriptor.key] || null;
    if (descriptor.kind === "bag") return state.bag[descriptor.index] || null;
    return state.quickSlots[descriptor.index] || null;
  }

  function setSlotUid(slotId, uid) {
    const descriptor = slotDescriptor(slotId);
    if (!descriptor) return false;
    if (descriptor.kind === "equipment") state.equipment[descriptor.key] = uid;
    else if (descriptor.kind === "bag") state.bag[descriptor.index] = uid;
    else state.quickSlots[descriptor.index] = uid;
    return true;
  }

  function findSlotByUid(uid) {
    const equipmentEntry = Object.entries(state.equipment).find(([, placedUid]) => placedUid === uid);
    if (equipmentEntry) return `equip-${equipmentEntry[0]}`;
    const bagIndex = state.bag.indexOf(uid);
    if (bagIndex >= 0) return `bag-${bagIndex}`;
    const quickIndex = state.quickSlots.indexOf(uid);
    if (quickIndex >= 0) return `quick-${quickIndex}`;
    return null;
  }

  function slotAccepts(slotId, itemType) {
    const descriptor = slotDescriptor(slotId);
    if (!descriptor) return false;
    if (descriptor.kind === "bag") return true;
    if (descriptor.kind === "quick") return itemType === "consumable";
    return descriptor.key === itemType;
  }

  function moveInstance(uid, targetSlotId) {
    const sourceSlotId = findSlotByUid(uid);
    const movingItem = getItemForInstance(uid);
    if (!sourceSlotId || !movingItem || !slotDescriptor(targetSlotId)) return { ok: false, reason: "invalid-move" };
    if (sourceSlotId === targetSlotId) return { ok: true, reason: "unchanged", sourceSlotId, targetSlotId };
    if (!slotAccepts(targetSlotId, movingItem.type)) return { ok: false, reason: "incompatible-target" };

    const targetUid = getSlotUid(targetSlotId);
    if (targetUid) {
      const targetItem = getItemForInstance(targetUid);
      if (!targetItem || !slotAccepts(sourceSlotId, targetItem.type)) return { ok: false, reason: "incompatible-swap" };
    }

    setSlotUid(sourceSlotId, targetUid || null);
    setSlotUid(targetSlotId, uid);
    saveProfile("move-item");
    return { ok: true, reason: targetUid ? "swapped" : "moved", sourceSlotId, targetSlotId, targetUid };
  }

  function nextUid() {
    let uid = "";
    do {
      uid = `item-${String(state.nextItemSerial).padStart(6, "0")}`;
      state.nextItemSerial += 1;
    } while (state.ownedItems.some((entry) => entry.uid === uid));
    return uid;
  }

  function firstFreeBagSlot() {
    return state.bag.findIndex((uid) => uid === null);
  }

  function grantItem(itemId, options = {}) {
    const item = catalog.getItem(itemId);
    if (!item) return { ok: false, reason: "unknown-item" };
    const bagIndex = firstFreeBagSlot();
    if (bagIndex < 0) return { ok: false, reason: "bag-full" };

    const instance = {
      uid: nextUid(),
      itemId,
      level: normalizeInteger(options.level, 1, 1),
      source: typeof options.source === "string" && options.source ? options.source : "loot",
      acquiredAt: Date.now()
    };
    state.ownedItems.push(instance);
    state.bag[bagIndex] = instance.uid;
    saveProfile("grant-item");
    return { ok: true, reason: "granted", instance: { ...instance }, slotId: `bag-${bagIndex}`, item };
  }

  function getEquippedInstances() {
    return Object.fromEntries(EQUIPMENT_TYPES.map((type) => [type, getInstance(state.equipment[type])]));
  }

  function getLoadoutStats(baseStats = {}) {
    const totals = {
      damage: Number(baseStats.damage) || 0,
      armor: Number(baseStats.armor) || 0,
      hp: Number(baseStats.hp) || 0,
      power: Number(baseStats.power) || 0,
      speed: Number(baseStats.speed) || 0,
      critChance: Number(baseStats.critChance) || 0,
      attackSpeed: Number(baseStats.attackSpeed) || 0,
      cooldownReduction: Number(baseStats.cooldownReduction) || 0,
      healing: Number(baseStats.healing) || 0,
      dodge: Number(baseStats.dodge) || 0
    };

    Object.values(state.equipment).forEach((uid) => {
      const item = getItemForInstance(uid);
      if (!item) return;
      Object.entries(item.stats || {}).forEach(([key, value]) => {
        totals[key] = (totals[key] || 0) + (Number(value) || 0);
      });
    });
    return totals;
  }

  function getPowerScore(baseStats = { damage: 12, armor: 0, hp: 100 }) {
    const stats = getLoadoutStats(baseStats);
    return Math.round(
      (stats.damage || 0) * 2 + (stats.armor || 0) * 3 + Math.max(0, (stats.hp || 0) - 100) * 0.5 +
      (stats.power || 0) * 4 + (stats.speed || 0) * 1.5 + (stats.critChance || 0) * 2 +
      (stats.attackSpeed || 0) * 1.5 + (stats.cooldownReduction || 0) * 2 +
      (stats.healing || 0) + (stats.dodge || 0) * 2
    );
  }

  function getBagSpace() {
    const used = state.bag.filter(Boolean).length;
    return { used, capacity: BAG_SIZE, free: BAG_SIZE - used };
  }

  window.RightboundPlayerProfile = Object.freeze({
    storageKey: STORAGE_KEY,
    schemaVersion: SCHEMA_VERSION,
    inventoryMigrationVersion: INVENTORY_MIGRATION_VERSION,
    starterItemId: STARTER_ITEM_ID,
    getState,
    getInstance,
    getItemForInstance,
    getOwnedInstances,
    getOwnedItemIds,
    hasItem,
    getSlotUid,
    findSlotByUid,
    slotAccepts,
    moveInstance,
    grantItem,
    getEquippedInstances,
    getLoadoutStats,
    getPowerScore,
    getBagSpace
  });

  document.dispatchEvent(new CustomEvent("rightbound:player-profile-ready", {
    detail: { schemaVersion: SCHEMA_VERSION, profile: getState() }
  }));
})();
