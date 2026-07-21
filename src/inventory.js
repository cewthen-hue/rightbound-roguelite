(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const STORAGE_KEY = "rightbound-inventory-v2";
  const BAG_SLOTS = 24;

  const ITEMS = {
    "helmet-scout": { name: "Casque du pisteur", type: "helmet", rarity: "rare", glyph: "⌒", level: 1, armor: 3, description: "+3 armure" },
    "helmet-iron": { name: "Heaume de fer", type: "helmet", rarity: "common", glyph: "⌂", level: 1, armor: 4, description: "+4 armure" },
    "chest-guard": { name: "Plastron du garde", type: "chest", rarity: "uncommon", glyph: "▣", level: 1, armor: 8, hp: 20, description: "+8 armure · +20 PV" },
    "blade-rusted": { name: "Lame ébréchée", type: "weapon", rarity: "rare", glyph: "†", level: 1, damage: 7, description: "+7 dégâts" },
    "axe-iron": { name: "Hache lourde", type: "weapon", rarity: "uncommon", glyph: "⚒", level: 1, damage: 10, description: "+10 dégâts" },
    "legs-traveler": { name: "Jambières du voyageur", type: "legs", rarity: "common", glyph: "Ⅱ", level: 1, armor: 4, description: "+4 armure" },
    "boots-ranger": { name: "Bottes du rôdeur", type: "boots", rarity: "uncommon", glyph: "⌄", level: 1, armor: 2, speed: 5, description: "+2 armure · +5 vitesse" },
    "jewel-spark": { name: "Éclat azur", type: "jewel", rarity: "epic", glyph: "◇", level: 1, power: 4, description: "+4 puissance" },
    "potion-red": { name: "Potions de soin", type: "potion", rarity: "common", glyph: "✚", level: 1, count: 3, description: "Restaure des points de vie" },
    "potion-green": { name: "Potions renforcées", type: "potion", rarity: "uncommon", glyph: "✚", level: 1, count: 2, description: "Soin supérieur" }
  };

  const DEFAULT_PLACEMENTS = {
    "helmet-scout": "bag-0",
    "helmet-iron": "bag-1",
    "chest-guard": "equip-chest",
    "blade-rusted": "equip-weapon",
    "axe-iron": "bag-2",
    "legs-traveler": "bag-3",
    "boots-ranger": "equip-boots",
    "jewel-spark": "bag-4",
    "potion-red": "potion-0",
    "potion-green": "bag-5"
  };

  const EQUIPMENT_TYPES = {
    "equip-helmet": "helmet",
    "equip-chest": "chest",
    "equip-weapon": "weapon",
    "equip-legs": "legs",
    "equip-boots": "boots",
    "equip-jewel": "jewel"
  };

  const VALID_SLOTS = new Set([
    ...Object.keys(EQUIPMENT_TYPES),
    ...Array.from({ length: BAG_SLOTS }, (_, index) => `bag-${index}`),
    "potion-0",
    "potion-1"
  ]);

  const RARITY_LABELS = {
    common: "Commun",
    uncommon: "Inhabituel",
    rare: "Rare",
    epic: "Épique"
  };

  let placements = loadPlacements();
  let selectedItemId = null;

  function bagSlotIds() {
    return Array.from({ length: BAG_SLOTS }, (_, index) => `bag-${index}`);
  }

  function loadPlacements() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || typeof parsed !== "object") return { ...DEFAULT_PLACEMENTS };

      const usedSlots = new Set();
      const clean = {};
      Object.keys(ITEMS).forEach((itemId) => {
        const candidate = parsed[itemId];
        if (VALID_SLOTS.has(candidate) && !usedSlots.has(candidate)) {
          clean[itemId] = candidate;
          usedSlots.add(candidate);
        }
      });

      Object.keys(ITEMS).forEach((itemId) => {
        if (clean[itemId]) return;
        const fallback = DEFAULT_PLACEMENTS[itemId];
        if (VALID_SLOTS.has(fallback) && !usedSlots.has(fallback)) {
          clean[itemId] = fallback;
          usedSlots.add(fallback);
          return;
        }
        const freeBag = bagSlotIds().find((slotId) => !usedSlots.has(slotId));
        if (freeBag) {
          clean[itemId] = freeBag;
          usedSlots.add(freeBag);
        }
      });
      return clean;
    } catch {
      return { ...DEFAULT_PLACEMENTS };
    }
  }

  function savePlacements() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(placements));
    } catch {
      // conservation en mémoire si localStorage indisponible
    }
  }

  function slotMarkup(id, accept, label, extraClass = "") {
    return `<div class="inventory-slot ${extraClass}" data-slot="${id}" data-accept="${accept}" data-label="${label}"></div>`;
  }

  function returnToMap() {
    if (window.RightboundUI?.renderMainMenu) window.RightboundUI.renderMainMenu();
  }

  function showHelp() {
    overlay.classList.remove("menu-overlay");
    overlay.classList.add("dialog-overlay");
    modalContent.className = "modal";
    modalContent.innerHTML = `
      <div class="inventory-help-sheet">
        <h2>Gérer l’équipement</h2>
        <p>Maintiens un objet puis fais-le glisser vers une case compatible.</p>
        <ul>
          <li>Les équipements vont uniquement dans leur emplacement dédié.</li>
          <li>Les potions peuvent être placées dans les deux cases rapides ou dans le sac.</li>
          <li>Déposer un objet sur un autre échange leurs positions si les deux emplacements sont compatibles.</li>
          <li>La disposition de l’inventaire est sauvegardée automatiquement sur ce téléphone.</li>
        </ul>
        <button class="primary" id="closeInventoryHelp">Retour à l’inventaire</button>
      </div>`;
    document.getElementById("closeInventoryHelp")?.addEventListener("click", renderInventory, { once: true });
  }

  function renderInventory() {
    overlay.classList.add("menu-overlay");
    overlay.classList.remove("dialog-overlay");
    overlay.classList.remove("hidden");
    modalContent.className = "modal menu-modal";

    modalContent.innerHTML = `
      <section class="inventory-screen" aria-label="Inventaire et équipement">
        <header class="inventory-header">
          <button class="inventory-back" id="inventoryBack" aria-label="Retour à la carte">‹</button>
          <div class="inventory-title"><small>Préparation du héros</small><h1>INVENTAIRE</h1></div>
          <div class="inventory-power" id="inventoryPower">0 PUI.</div>
        </header>

        <section class="character-loadout" aria-label="Équipement du personnage">
          <div class="inventory-avatar" aria-label="Avatar provisoire du personnage">
            <span class="avatar-head"></span><span class="avatar-neck"></span><span class="avatar-torso"></span>
            <span class="avatar-arm left"></span><span class="avatar-arm right"></span>
            <span class="avatar-hand left"></span><span class="avatar-hand right"></span>
            <span class="avatar-leg left"></span><span class="avatar-leg right"></span>
            <span class="avatar-foot left"></span><span class="avatar-foot right"></span>
          </div>
          ${slotMarkup("equip-helmet", "helmet", "Casque", "equipment-slot helmet")}
          ${slotMarkup("equip-jewel", "jewel", "Bijou", "equipment-slot jewel")}
          ${slotMarkup("equip-chest", "chest", "Plastron", "equipment-slot chest")}
          ${slotMarkup("equip-weapon", "weapon", "Arme", "equipment-slot weapon")}
          ${slotMarkup("equip-legs", "legs", "Jambières", "equipment-slot legs")}
          ${slotMarkup("equip-boots", "boots", "Bottes", "equipment-slot boots")}
        </section>

        <section class="loadout-summary" aria-label="Statistiques de l’équipement">
          <div class="loadout-stat">DÉGÂTS <strong id="inventoryDamage">12</strong></div>
          <div class="loadout-stat">ARMURE <strong id="inventoryArmor">0</strong></div>
          <div class="loadout-stat">VIE <strong id="inventoryHp">100</strong></div>
        </section>

        <section class="inventory-storage" aria-label="Sac à dos">
          <div class="storage-heading"><strong>SAC À DOS</strong><span id="bagCapacity">0 / ${BAG_SLOTS}</span></div>
          <div class="bag-grid">
            ${bagSlotIds().map((slotId) => slotMarkup(slotId, "any", "")).join("")}
          </div>
          <div class="potion-row">
            <span class="potion-row-label">Potions rapides</span>
            <div class="potion-belt">
              ${slotMarkup("potion-0", "potion", "")}${slotMarkup("potion-1", "potion", "")}
            </div>
          </div>
          <aside class="inventory-inspector" id="inventoryInspector">
            <div class="inspector-copy"><strong id="inspectorName"></strong><span id="inspectorDescription"></span></div>
            <span class="inspector-rarity" id="inspectorRarity"></span>
          </aside>
        </section>

        <nav class="inventory-dock" aria-label="Navigation principale">
          <button class="dock-button active"><span>▣</span><span>Inventaire</span></button>
          <button class="dock-button" disabled><span>✦</span><span>Compétences</span></button>
          <button class="dock-button" id="inventoryMapButton"><span>⌁</span><span>Niveaux</span></button>
          <button class="dock-button" id="inventoryHelpButton"><span>?</span><span>Aide</span></button>
        </nav>
      </section>`;

    document.getElementById("inventoryBack")?.addEventListener("click", returnToMap);
    document.getElementById("inventoryMapButton")?.addEventListener("click", returnToMap);
    document.getElementById("inventoryHelpButton")?.addEventListener("click", showHelp);
    renderItems();
  }

  function createItemElement(itemId) {
    const item = ITEMS[itemId];
    const element = document.createElement("div");
    element.className = "inventory-item";
    element.dataset.itemId = itemId;
    element.dataset.rarity = item.rarity;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", item.name);
    element.innerHTML = `
      <span class="item-level">N${item.level}</span>
      <span class="item-glyph">${item.glyph}</span>
      ${item.count ? `<span class="item-count">${item.count}</span>` : ""}`;
    if (selectedItemId === itemId) element.classList.add("selected");
    element.addEventListener("pointerdown", (event) => beginPointerInteraction(event, itemId, element));
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectItem(itemId);
      }
    });
    return element;
  }

  function renderItems() {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => {
      slot.querySelector(".inventory-item")?.remove();
    });

    Object.entries(placements).forEach(([itemId, slotId]) => {
      const slot = modalContent.querySelector(`[data-slot="${slotId}"]`);
      if (slot && ITEMS[itemId]) slot.appendChild(createItemElement(itemId));
    });

    const bagCount = Object.values(placements).filter((slotId) => slotId.startsWith("bag-")).length;
    const capacity = document.getElementById("bagCapacity");
    if (capacity) capacity.textContent = `${bagCount} / ${BAG_SLOTS}`;
    updateStats();
    updateInspector();
  }

  function updateStats() {
    const equippedIds = Object.entries(placements)
      .filter(([, slotId]) => slotId.startsWith("equip-"))
      .map(([itemId]) => itemId);

    const totals = equippedIds.reduce((result, itemId) => {
      const item = ITEMS[itemId];
      result.damage += item.damage || 0;
      result.armor += item.armor || 0;
      result.hp += item.hp || 0;
      result.power += item.power || 0;
      result.speed += item.speed || 0;
      return result;
    }, { damage: 12, armor: 0, hp: 100, power: 0, speed: 0 });

    const powerScore = totals.damage * 2 + totals.armor * 3 + Math.round((totals.hp - 100) / 2) + totals.power * 5 + totals.speed;
    document.getElementById("inventoryDamage").textContent = totals.damage;
    document.getElementById("inventoryArmor").textContent = totals.armor;
    document.getElementById("inventoryHp").textContent = totals.hp;
    document.getElementById("inventoryPower").textContent = `${powerScore} PUI.`;
  }

  function selectItem(itemId) {
    selectedItemId = itemId;
    modalContent.querySelectorAll(".inventory-item").forEach((element) => {
      element.classList.toggle("selected", element.dataset.itemId === itemId);
    });
    updateInspector();
  }

  function updateInspector() {
    const inspector = document.getElementById("inventoryInspector");
    if (!inspector) return;
    const item = ITEMS[selectedItemId];
    inspector.classList.toggle("visible", Boolean(item));
    if (!item) return;
    document.getElementById("inspectorName").textContent = item.name;
    document.getElementById("inspectorDescription").textContent = item.description;
    document.getElementById("inspectorRarity").textContent = RARITY_LABELS[item.rarity] || item.rarity;
  }

  function slotAccepts(slot, itemType) {
    if (!slot) return false;
    const accept = slot.dataset.accept;
    return accept === "any" || accept === itemType;
  }

  function itemAtSlot(slotId) {
    return Object.keys(placements).find((itemId) => placements[itemId] === slotId) || null;
  }

  function moveItem(itemId, targetSlot) {
    const sourceSlotId = placements[itemId];
    const targetSlotId = targetSlot?.dataset.slot;
    const item = ITEMS[itemId];
    if (!sourceSlotId || !targetSlotId || sourceSlotId === targetSlotId || !item) return;

    if (!slotAccepts(targetSlot, item.type)) {
      window.RightboundUI?.showToast?.("Cet objet ne peut pas être placé ici.");
      return;
    }

    const sourceSlot = modalContent.querySelector(`[data-slot="${sourceSlotId}"]`);
    const targetItemId = itemAtSlot(targetSlotId);

    if (targetItemId) {
      const targetItem = ITEMS[targetItemId];
      if (!slotAccepts(sourceSlot, targetItem.type)) {
        window.RightboundUI?.showToast?.("Impossible d’échanger ces deux objets.");
        return;
      }
      placements[targetItemId] = sourceSlotId;
    }

    placements[itemId] = targetSlotId;
    selectedItemId = itemId;
    savePlacements();
    navigator.vibrate?.(12);
    renderItems();
  }

  function highlightSlots(itemType) {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => {
      slot.classList.toggle("drop-valid", slotAccepts(slot, itemType));
      slot.classList.toggle("drop-invalid", !slotAccepts(slot, itemType));
    });
  }

  function clearSlotHighlights() {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => {
      slot.classList.remove("drop-valid", "drop-invalid", "drop-target");
    });
  }

  function beginPointerInteraction(event, itemId, sourceElement) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const item = ITEMS[itemId];
    let active = false;
    let ghost = null;
    let currentTarget = null;

    const positionGhost = (x, y) => {
      if (!ghost) return;
      ghost.style.left = `${x}px`;
      ghost.style.top = `${y}px`;
    };

    const startDrag = () => {
      active = true;
      sourceElement.classList.add("dragging");
      ghost = sourceElement.cloneNode(true);
      ghost.classList.remove("selected", "dragging");
      ghost.classList.add("drag-ghost");
      document.body.appendChild(ghost);
      highlightSlots(item.type);
      positionGhost(startX, startY);
      navigator.vibrate?.(8);
    };

    const onMove = (moveEvent) => {
      const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (!active && distance >= 7) startDrag();
      if (!active) return;
      moveEvent.preventDefault();
      positionGhost(moveEvent.clientX, moveEvent.clientY);
      currentTarget?.classList.remove("drop-target");
      currentTarget = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest(".inventory-slot") || null;
      if (currentTarget && slotAccepts(currentTarget, item.type)) currentTarget.classList.add("drop-target");
    };

    const finish = (upEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);

      if (active) {
        const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest(".inventory-slot") || null;
        if (target) moveItem(itemId, target);
      } else {
        selectItem(itemId);
      }

      sourceElement.classList.remove("dragging");
      ghost?.remove();
      clearSlotHighlights();
    };

    const cancel = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      sourceElement.classList.remove("dragging");
      ghost?.remove();
      clearSlotHighlights();
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }

  function wireMenuInventoryButton() {
    const equipmentButton = modalContent.querySelector(".game-dock .dock-button:first-child");
    if (!equipmentButton || equipmentButton.dataset.inventoryWired === "true") return;
    equipmentButton.disabled = false;
    equipmentButton.dataset.inventoryWired = "true";
    const label = equipmentButton.querySelector("span:last-child");
    if (label) label.textContent = "Inventaire";
    equipmentButton.addEventListener("click", renderInventory);
  }

  new MutationObserver(() => requestAnimationFrame(wireMenuInventoryButton))
    .observe(modalContent, { childList: true, subtree: true });

  window.RightboundInventory = { renderInventory };
  wireMenuInventoryButton();
})();
