(() => {
  "use strict";

  const catalog = window.RightboundItemCatalog;
  if (!catalog) {
    console.error("[Rightbound] Le système de loot nécessite le catalogue d’objets.");
    return;
  }

  const FIRST_BRONZE_ITEM_ID = "helmet-watchman";
  const FIRST_BRONZE_GOLD = 50;

  const CHESTS = Object.freeze({
    bronze: Object.freeze({
      type: "bronze",
      label: "Bronze",
      symbol: "B",
      goldMin: 40,
      goldMax: 80,
      itemChance: 80,
      rarityWeights: Object.freeze({ common: 80, none: 20 }),
      preview: "80 % Commun · 20 % golds seuls",
      description: "40–80 golds garantis"
    }),
    silver: Object.freeze({
      type: "silver",
      label: "Argent",
      symbol: "A",
      goldMin: 90,
      goldMax: 160,
      itemChance: 100,
      rarityWeights: Object.freeze({ rare: 70, common: 30 }),
      preview: "70 % Rare · 30 % Commun",
      description: "90–160 golds garantis"
    }),
    gold: Object.freeze({
      type: "gold",
      label: "Or",
      symbol: "O",
      goldMin: 180,
      goldMax: 300,
      itemChance: 100,
      rarityWeights: Object.freeze({ rare: 50, epic: 35, common: 15 }),
      preview: "50 % Rare · 35 % Épique · 15 % Commun",
      description: "180–300 golds garantis"
    }),
    diamond: Object.freeze({
      type: "diamond",
      label: "Diamant",
      symbol: "D",
      goldMin: 350,
      goldMax: 550,
      itemChance: 100,
      rarityWeights: Object.freeze({ legendary: 40, epic: 30, rare: 20, common: 10 }),
      preview: "40 % Légendaire · 30 % Épique · 20 % Rare · 10 % Commun",
      description: "350–550 golds garantis"
    })
  });

  const ORDER = Object.freeze(["bronze", "silver", "gold", "diamond"]);
  const RARITY_LABELS = Object.freeze({
    common: "Commun",
    rare: "Rare",
    epic: "Épique",
    legendary: "Légendaire"
  });

  function randomInteger(min, max, random = Math.random) {
    return Math.floor(random() * (max - min + 1)) + min;
  }

  function selectRandom(entries, random = Math.random) {
    if (!entries.length) return null;
    return entries[Math.floor(random() * entries.length)] || entries[0];
  }

  function getChest(type) {
    return CHESTS[type] || null;
  }

  function getPoolByRarity(rarity) {
    return rarity && rarity !== "none" ? catalog.getItemsByRarity(rarity) : [];
  }

  function rollRarity(chest, random = Math.random) {
    const roll = random() * 100;
    let cursor = 0;
    for (const [rarity, weight] of Object.entries(chest.rarityWeights)) {
      cursor += Number(weight) || 0;
      if (roll < cursor) return rarity;
    }
    return Object.keys(chest.rarityWeights).at(-1) || "none";
  }

  function chooseItem(rarity, ownedItemIds, random = Math.random) {
    const fullPool = getPoolByRarity(rarity);
    if (!fullPool.length) return { item: null, duplicate: false, poolExhausted: true };
    const unseenPool = fullPool.filter((item) => !ownedItemIds.has(item.id));
    const selectedPool = unseenPool.length ? unseenPool : fullPool;
    const selectedItem = selectRandom(selectedPool, random);
    return {
      item: selectedItem,
      duplicate: ownedItemIds.has(selectedItem.id),
      poolExhausted: unseenPool.length === 0
    };
  }

  function createReward(type, options = {}) {
    const chest = getChest(type);
    if (!chest) return null;

    const ownedItemIds = new Set(Array.isArray(options.ownedItemIds) ? options.ownedItemIds : []);
    const firstBronzeClaimed = options.firstBronzeClaimed === true;
    const random = typeof options.random === "function" ? options.random : Math.random;

    if (type === "bronze" && !firstBronzeClaimed) {
      const guaranteedItem = catalog.getItem(FIRST_BRONZE_ITEM_ID);
      if (!guaranteedItem) return null;
      return Object.freeze({
        chestType: type,
        itemId: guaranteedItem.id,
        item: guaranteedItem,
        rarity: guaranteedItem.rarity,
        rarityLabel: RARITY_LABELS[guaranteedItem.rarity],
        gold: FIRST_BRONZE_GOLD,
        guaranteed: true,
        itemDropped: true,
        duplicate: ownedItemIds.has(guaranteedItem.id),
        poolExhausted: false
      });
    }

    const rarity = rollRarity(chest, random);
    const gold = randomInteger(chest.goldMin, chest.goldMax, random);

    if (rarity === "none") {
      return Object.freeze({
        chestType: type,
        itemId: null,
        item: null,
        rarity: null,
        rarityLabel: null,
        gold,
        guaranteed: false,
        itemDropped: false,
        duplicate: false,
        poolExhausted: false
      });
    }

    const selected = chooseItem(rarity, ownedItemIds, random);
    return Object.freeze({
      chestType: type,
      itemId: selected.item?.id || null,
      item: selected.item,
      rarity,
      rarityLabel: RARITY_LABELS[rarity] || rarity,
      gold,
      guaranteed: false,
      itemDropped: Boolean(selected.item),
      duplicate: selected.duplicate,
      poolExhausted: selected.poolExhausted
    });
  }

  window.RightboundLoot = Object.freeze({
    version: "2.0.0",
    order: ORDER,
    chests: CHESTS,
    rarityLabels: RARITY_LABELS,
    firstBronzeItemId: FIRST_BRONZE_ITEM_ID,
    firstBronzeGold: FIRST_BRONZE_GOLD,
    getChest,
    getPoolByRarity,
    rollRarity,
    createReward
  });

  document.dispatchEvent(new CustomEvent("rightbound:loot-ready", {
    detail: {
      version: "2.0.0",
      chestTypes: ORDER.length,
      firstBronzeItemId: FIRST_BRONZE_ITEM_ID
    }
  }));
})();
