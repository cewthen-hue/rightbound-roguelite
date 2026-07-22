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
      rarity: "common",
      rarityLabel: "Commun",
      goldMin: 40,
      goldMax: 80,
      description: "1 objet commun + 40–80 golds",
      hint: "Les objets inconnus sont prioritaires"
    }),
    silver: Object.freeze({
      type: "silver",
      label: "Argent",
      symbol: "A",
      rarity: "rare",
      rarityLabel: "Rare",
      goldMin: 90,
      goldMax: 160,
      description: "1 objet rare + 90–160 golds",
      hint: "Les objets inconnus sont prioritaires"
    }),
    gold: Object.freeze({
      type: "gold",
      label: "Or",
      symbol: "O",
      rarity: "epic",
      rarityLabel: "Épique",
      goldMin: 180,
      goldMax: 300,
      description: "1 objet épique + 180–300 golds",
      hint: "Les objets inconnus sont prioritaires"
    }),
    diamond: Object.freeze({
      type: "diamond",
      label: "Diamant",
      symbol: "D",
      rarity: "legendary",
      rarityLabel: "Légendaire",
      goldMin: 350,
      goldMax: 550,
      description: "1 objet légendaire + 350–550 golds",
      hint: "Les objets inconnus sont prioritaires"
    })
  });

  const ORDER = Object.freeze(["bronze", "silver", "gold", "diamond"]);

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

  function getPool(type) {
    const chest = getChest(type);
    return chest ? catalog.getItemsByRarity(chest.rarity) : [];
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
        gold: FIRST_BRONZE_GOLD,
        guaranteed: true,
        duplicate: ownedItemIds.has(guaranteedItem.id),
        poolExhausted: false
      });
    }

    const fullPool = getPool(type);
    if (!fullPool.length) return null;
    const unseenPool = fullPool.filter((item) => !ownedItemIds.has(item.id));
    const selectedPool = unseenPool.length ? unseenPool : fullPool;
    const selectedItem = selectRandom(selectedPool, random);

    return Object.freeze({
      chestType: type,
      itemId: selectedItem.id,
      item: selectedItem,
      gold: randomInteger(chest.goldMin, chest.goldMax, random),
      guaranteed: false,
      duplicate: ownedItemIds.has(selectedItem.id),
      poolExhausted: unseenPool.length === 0
    });
  }

  window.RightboundLoot = Object.freeze({
    version: "1.0.0",
    order: ORDER,
    chests: CHESTS,
    firstBronzeItemId: FIRST_BRONZE_ITEM_ID,
    firstBronzeGold: FIRST_BRONZE_GOLD,
    getChest,
    getPool,
    createReward
  });

  document.dispatchEvent(new CustomEvent("rightbound:loot-ready", {
    detail: {
      version: "1.0.0",
      chestTypes: ORDER.length,
      firstBronzeItemId: FIRST_BRONZE_ITEM_ID
    }
  }));
})();
