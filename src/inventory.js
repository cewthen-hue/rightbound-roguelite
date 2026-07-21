(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const STORAGE_KEY = "rightbound-inventory-v3";
  const BAG_SLOTS = 24;
  const QUICK_SLOTS = 3;

  const ITEMS = {
    "helmet-scout": { name: "Casque du pisteur", type: "helmet", rarity: "rare", glyph: "⌒", level: 1, armor: 3, description: "+3 armure" },
    "helmet-iron": { name: "Heaume de fer", type: "helmet", rarity: "common", glyph: "⌂", level: 1, armor: 4, description: "+4 armure" },
    "chest-guard": { name: "Plastron du garde", type: "chest", rarity: "uncommon", glyph: "▣", level: 1, armor: 8, hp: 20, description: "+8 armure · +20 PV" },
    "blade-rusted": { name: "Lame ébréchée", type: "weapon", rarity: "rare", glyph: "†", level: 1, damage: 7, description: "+7 dégâts" },
    "axe-iron": { name: "Hache lourde", type: "weapon", rarity: "uncommon", glyph: "⚒", level: 1, damage: 10, description: "+10 dégâts" },
    "relic-traveler": { name: "Relique du voyageur", type: "relic", rarity: "common", glyph: "Ⅱ", level: 1, armor: 4, description: "+4 armure" },
    "boots-ranger": { name: "Bottes du rôdeur", type: "boots", rarity: "uncommon", glyph: "⌄", level: 1, armor: 2, speed: 5, description: "+2 armure · +5 vitesse" },
    "jewel-spark": { name: "Éclat azur", type: "jewel", rarity: "epic", glyph: "◇", level: 1, power: 4, description: "+4 puissance" },
    "potion-red": { name: "Potion de soin", type: "consumable", rarity: "common", glyph: "✚", level: 1, count: 3, description: "Restaure immédiatement 40 PV" },
    "potion-blue": { name: "Potion d’énergie", type: "consumable", rarity: "rare", glyph: "◒", level: 1, count: 2, description: "Réduit les temps de recharge" },
    "bomb-small": { name: "Bombe artisanale", type: "consumable", rarity: "uncommon", glyph: "●", level: 1, count: 2, description: "Inflige des dégâts de zone" }
  };

  const DEFAULT_PLACEMENTS = {
    "helmet-scout": "bag-0",
    "helmet-iron": "bag-1",
    "chest-guard": "equip-chest",
    "blade-rusted": "equip-weapon",
    "axe-iron": "bag-2",
    "relic-traveler": "bag-3",
    "boots-ranger": "equip-boots",
    "jewel-spark": "bag-4",
    "potion-red": "quick-0",
    "potion-blue": "bag-5",
    "bomb-small": "bag-6"
  };

  const EQUIPMENT_TYPES = {
    "equip-weapon": "weapon",
    "equip-helmet": "helmet",
    "equip-chest": "chest",
    "equip-jewel": "jewel",
    "equip-boots": "boots",
    "equip-relic": "relic"
  };

  const VALID_SLOTS = new Set([
    ...Object.keys(EQUIPMENT_TYPES),
    ...Array.from({ length: BAG_SLOTS }, (_, index) => `bag-${index}`),
    ...Array.from({ length: QUICK_SLOTS }, (_, index) => `quick-${index}`)
  ]);

  const RARITY_LABELS = { common: "Commun", uncommon: "Inhabituel", rare: "Rare", epic: "Épique" };
  let placements = loadPlacements();
  let selectedItemId = null;
  let sheetStartY = 0;

  const bagSlotIds = () => Array.from({ length: BAG_SLOTS }, (_, index) => `bag-${index}`);

  function loadPlacements() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || typeof parsed !== "object") return { ...DEFAULT_PLACEMENTS };
      const used = new Set();
      const clean = {};

      Object.keys(ITEMS).forEach((itemId) => {
        const slotId = parsed[itemId];
        if (VALID_SLOTS.has(slotId) && !used.has(slotId)) {
          clean[itemId] = slotId;
          used.add(slotId);
        }
      });

      Object.keys(ITEMS).forEach((itemId) => {
        if (clean[itemId]) return;
        const fallback = DEFAULT_PLACEMENTS[itemId];
        const target = VALID_SLOTS.has(fallback) && !used.has(fallback)
          ? fallback
          : bagSlotIds().find((slotId) => !used.has(slotId));
        if (target) {
          clean[itemId] = target;
          used.add(target);
        }
      });
      return clean;
    } catch {
      return { ...DEFAULT_PLACEMENTS };
    }
  }

  function savePlacements() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(placements)); } catch {}
  }

  function slotMarkup(id, accept, label, extraClass = "") {
    return `<div class="inventory-slot ${extraClass}" data-slot="${id}" data-accept="${accept}" data-label="${label}"></div>`;
  }

  function renderInventory() {
    overlay.classList.add("menu-overlay");
    overlay.classList.remove("dialog-overlay", "hidden");
    modalContent.className = "modal menu-modal";
    selectedItemId = null;

    modalContent.innerHTML = `
      <section class="inventory-screen" aria-label="Inventaire et équipement">
        <header class="inventory-header">
          <button class="inventory-back" id="inventoryBack" aria-label="Retour à la carte">‹</button>
          <div class="inventory-title"><h1>INVENTAIRE</h1></div>
          <div class="inventory-power" id="inventoryPower">0 PUI.</div>
        </header>

        <section class="character-loadout" aria-label="Équipement du personnage">
          ${slotMarkup("equip-weapon", "weapon", "Arme", "equipment-slot weapon")}
          ${slotMarkup("equip-helmet", "helmet", "Casque", "equipment-slot helmet")}
          ${slotMarkup("equip-chest", "chest", "Armure", "equipment-slot chest")}
          ${slotMarkup("equip-jewel", "jewel", "Bijou", "equipment-slot jewel")}
          ${slotMarkup("equip-boots", "boots", "Bottes", "equipment-slot boots")}
          ${slotMarkup("equip-relic", "relic", "Relique", "equipment-slot relic")}
          <div class="inventory-avatar" aria-label="Avatar provisoire du personnage">
            <span class="avatar-head"></span><span class="avatar-neck"></span><span class="avatar-torso"></span>
            <span class="avatar-arm left"></span><span class="avatar-arm right"></span>
            <span class="avatar-hand left"></span><span class="avatar-hand right"></span>
            <span class="avatar-leg left"></span><span class="avatar-leg right"></span>
            <span class="avatar-foot left"></span><span class="avatar-foot right"></span>
          </div>
        </section>

        <section class="loadout-summary" aria-label="Statistiques">
          <div class="loadout-stat"><span class="loadout-stat-icon">⚔</span><strong id="inventoryDamage">12</strong><span>Dég.</span></div>
          <div class="loadout-stat"><span class="loadout-stat-icon">🛡</span><strong id="inventoryArmor">0</strong><span>Arm.</span></div>
          <div class="loadout-stat"><span class="loadout-stat-icon">♥</span><strong id="inventoryHp">100</strong><span>PV</span></div>
        </section>

        <section class="inventory-storage" aria-label="Sac à dos">
          <div class="storage-heading">
            <strong>SAC À DOS</strong>
            <div class="storage-heading-actions">
              <button type="button" aria-label="Trier">↕</button>
              <button type="button" aria-label="Filtrer">⌁</button>
              <span id="bagCapacity">0 / ${BAG_SLOTS}</span>
            </div>
          </div>
          <div class="bag-grid">${bagSlotIds().map((slotId) => slotMarkup(slotId, "any", "")).join("")}</div>
        </section>

        <section class="quickbar" aria-label="Raccourcis de consommables">
          <span class="quickbar-label">Raccourcis</span>
          <div class="quickbar-slots">
            ${Array.from({ length: QUICK_SLOTS }, (_, index) => slotMarkup(`quick-${index}`, "consumable", "")).join("")}
          </div>
        </section>

        <nav class="inventory-dock" aria-label="Navigation principale">
          <button class="dock-button active"><span>▣</span><span>Inventaire</span></button>
          <button class="dock-button" disabled><span>✦</span><span>Compétences</span></button>
          <button class="dock-button" id="inventoryMapButton"><span>⌁</span><span>Niveaux</span></button>
          <button class="dock-button" id="inventoryHelpButton"><span>?</span><span>Aide</span></button>
        </nav>

        <div class="inventory-sheet-backdrop" id="inventorySheetBackdrop"></div>
        <aside class="inventory-sheet" id="inventorySheet" aria-hidden="true">
          <div class="inventory-sheet-handle" id="inventorySheetHandle"></div>
          <div class="inventory-sheet-head">
            <div class="inventory-sheet-title"><strong id="sheetName"></strong><span id="sheetDescription"></span></div>
            <span class="inventory-sheet-rarity" id="sheetRarity"></span>
          </div>
          <div class="inventory-sheet-meta"><span id="sheetLevel"></span><span id="sheetPosition"></span></div>
          <div class="inventory-sheet-actions">
            <button class="inventory-sheet-primary" id="sheetPrimaryAction"></button>
            <button class="inventory-sheet-secondary" id="sheetSecondaryAction"></button>
          </div>
        </aside>
      </section>`;

    document.getElementById("inventoryBack")?.addEventListener("click", returnToMap);
    document.getElementById("inventoryMapButton")?.addEventListener("click", returnToMap);
    document.getElementById("inventoryHelpButton")?.addEventListener("click", showHelp);
    document.getElementById("inventorySheetBackdrop")?.addEventListener("click", closeSheet);
    wireSheetGestures();
    renderItems();
  }

  function returnToMap() { window.RightboundUI?.renderMainMenu?.(); }

  function showHelp() {
    window.RightboundUI?.showToast?.("Glisse un objet vers une case compatible. Touche-le pour ouvrir sa fiche.", 3200);
  }

  function createItemElement(itemId) {
    const item = ITEMS[itemId];
    const element = document.createElement("div");
    element.className = "inventory-item";
    element.dataset.itemId = itemId;
    element.dataset.rarity = item.rarity;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.innerHTML = `<span class="item-level">N${item.level}</span><span class="item-glyph">${item.glyph}</span>${item.count ? `<span class="item-count">${item.count}</span>` : ""}`;
    element.addEventListener("pointerdown", (event) => beginPointerInteraction(event, itemId, element));
    return element;
  }

  function renderItems() {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => slot.replaceChildren());
    Object.entries(placements).forEach(([itemId, slotId]) => {
      const slot = modalContent.querySelector(`[data-slot="${slotId}"]`);
      if (slot && ITEMS[itemId]) slot.appendChild(createItemElement(itemId));
    });
    const bagCount = Object.values(placements).filter((slotId) => slotId.startsWith("bag-")).length;
    document.getElementById("bagCapacity").textContent = `${bagCount} / ${BAG_SLOTS}`;
    updateStats();
  }

  function updateStats() {
    const totals = Object.entries(placements)
      .filter(([, slotId]) => slotId.startsWith("equip-"))
      .reduce((result, [itemId]) => {
        const item = ITEMS[itemId];
        result.damage += item.damage || 0;
        result.armor += item.armor || 0;
        result.hp += item.hp || 0;
        result.power += item.power || 0;
        result.speed += item.speed || 0;
        return result;
      }, { damage: 12, armor: 0, hp: 100, power: 0, speed: 0 });

    const score = totals.damage * 2 + totals.armor * 3 + Math.round((totals.hp - 100) / 2) + totals.power * 5 + totals.speed;
    document.getElementById("inventoryDamage").textContent = totals.damage;
    document.getElementById("inventoryArmor").textContent = totals.armor;
    document.getElementById("inventoryHp").textContent = totals.hp;
    document.getElementById("inventoryPower").textContent = `${score} PUI.`;
  }

  function openSheet(itemId) {
    selectedItemId = itemId;
    const item = ITEMS[itemId];
    const slotId = placements[itemId];
    const equipped = slotId.startsWith("equip-");
    const quick = slotId.startsWith("quick-");

    document.getElementById("sheetName").textContent = item.name;
    document.getElementById("sheetDescription").textContent = item.description;
    document.getElementById("sheetRarity").textContent = RARITY_LABELS[item.rarity];
    document.getElementById("sheetLevel").textContent = `Niveau ${item.level}`;
    document.getElementById("sheetPosition").textContent = equipped ? "Équipé" : quick ? "Raccourci" : "Dans le sac";

    const primary = document.getElementById("sheetPrimaryAction");
    const secondary = document.getElementById("sheetSecondaryAction");
    primary.textContent = item.type === "consumable" ? "UTILISER" : equipped ? "RETIRER" : "ÉQUIPER";
    secondary.textContent = item.type === "consumable" ? (quick ? "RETIRER" : "RACCOURCI") : "FERMER";

    primary.onclick = () => item.type === "consumable" ? useConsumable(itemId) : toggleEquipment(itemId);
    secondary.onclick = () => item.type === "consumable" ? toggleQuickSlot(itemId) : closeSheet();

    document.getElementById("inventorySheetBackdrop").classList.add("visible");
    const sheet = document.getElementById("inventorySheet");
    sheet.classList.add("visible");
    sheet.setAttribute("aria-hidden", "false");
  }

  function closeSheet() {
    document.getElementById("inventorySheetBackdrop")?.classList.remove("visible");
    const sheet = document.getElementById("inventorySheet");
    sheet?.classList.remove("visible");
    sheet?.setAttribute("aria-hidden", "true");
    selectedItemId = null;
  }

  function toggleEquipment(itemId) {
    const item = ITEMS[itemId];
    const current = placements[itemId];
    const equipSlotId = Object.keys(EQUIPMENT_TYPES).find((slotId) => EQUIPMENT_TYPES[slotId] === item.type);
    if (!equipSlotId) return;
    const target = modalContent.querySelector(`[data-slot="${current.startsWith("equip-") ? firstFreeBag() : equipSlotId}"]`);
    if (target) moveItem(itemId, target);
    closeSheet();
  }

  function toggleQuickSlot(itemId) {
    const current = placements[itemId];
    const targetId = current.startsWith("quick-") ? firstFreeBag() : firstFreeQuickSlot();
    if (!targetId) {
      window.RightboundUI?.showToast?.("Aucun emplacement libre.");
      return;
    }
    const target = modalContent.querySelector(`[data-slot="${targetId}"]`);
    if (target) moveItem(itemId, target);
    closeSheet();
  }

  function useConsumable(itemId) {
    window.RightboundUI?.showToast?.(`${ITEMS[itemId].name} utilisée.`);
    closeSheet();
  }

  function firstFreeBag() { return bagSlotIds().find((slotId) => !itemAtSlot(slotId)); }
  function firstFreeQuickSlot() { return Array.from({ length: QUICK_SLOTS }, (_, index) => `quick-${index}`).find((slotId) => !itemAtSlot(slotId)); }
  function itemAtSlot(slotId) { return Object.keys(placements).find((itemId) => placements[itemId] === slotId) || null; }

  function slotAccepts(slot, itemType) {
    if (!slot) return false;
    const accept = slot.dataset.accept;
    return accept === "any" || accept === itemType;
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
    if (targetItemId && !slotAccepts(sourceSlot, ITEMS[targetItemId].type)) {
      window.RightboundUI?.showToast?.("Impossible d’échanger ces objets.");
      return;
    }
    if (targetItemId) placements[targetItemId] = sourceSlotId;
    placements[itemId] = targetSlotId;
    savePlacements();
    navigator.vibrate?.(10);
    renderItems();
  }

  function highlightSlots(itemType) {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => {
      slot.classList.toggle("drop-valid", slotAccepts(slot, itemType));
      slot.classList.toggle("drop-invalid", !slotAccepts(slot, itemType));
    });
  }

  function clearSlotHighlights() {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => slot.classList.remove("drop-valid", "drop-invalid", "drop-target"));
  }

  function beginPointerInteraction(event, itemId, sourceElement) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    let active = false;
    let ghost = null;
    let currentTarget = null;

    const startDrag = () => {
      active = true;
      sourceElement.classList.add("dragging");
      ghost = sourceElement.cloneNode(true);
      ghost.classList.add("drag-ghost");
      document.body.appendChild(ghost);
      highlightSlots(ITEMS[itemId].type);
    };

    const moveGhost = (x, y) => {
      if (!ghost) return;
      ghost.style.left = `${x}px`;
      ghost.style.top = `${y}px`;
    };

    const onMove = (moveEvent) => {
      if (!active && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) >= 8) startDrag();
      if (!active) return;
      moveEvent.preventDefault();
      moveGhost(moveEvent.clientX, moveEvent.clientY);
      currentTarget?.classList.remove("drop-target");
      currentTarget = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest(".inventory-slot") || null;
      if (currentTarget && slotAccepts(currentTarget, ITEMS[itemId].type)) currentTarget.classList.add("drop-target");
    };

    const finish = (upEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      if (active) {
        const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest(".inventory-slot") || null;
        if (target) moveItem(itemId, target);
      } else {
        openSheet(itemId);
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

  function wireSheetGestures() {
    const handle = document.getElementById("inventorySheetHandle");
    handle?.addEventListener("pointerdown", (event) => { sheetStartY = event.clientY; });
    handle?.addEventListener("pointerup", (event) => {
      if (event.clientY - sheetStartY > 55) closeSheet();
    });
  }

  function wireMenuInventoryButton() {
    const button = modalContent.querySelector(".game-dock .dock-button:first-child");
    if (!button || button.dataset.inventoryWired === "true") return;
    button.disabled = false;
    button.dataset.inventoryWired = "true";
    const label = button.querySelector("span:last-child");
    if (label) label.textContent = "Inventaire";
    button.addEventListener("click", renderInventory);
  }

  new MutationObserver(() => requestAnimationFrame(wireMenuInventoryButton)).observe(modalContent, { childList: true, subtree: true });
  window.RightboundInventory = { renderInventory };
  wireMenuInventoryButton();
})();
