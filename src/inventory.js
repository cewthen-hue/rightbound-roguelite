(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const profile = window.RightboundPlayerProfile;
  const catalog = window.RightboundItemCatalog;
  const BAG_SLOTS = 24;
  const QUICK_SLOTS = 3;
  const DESIGN_WIDTH = 390;
  const DESIGN_HEIGHT = 844;
  const BASE_STATS = Object.freeze({ damage: 12, armor: 0, hp: 100, power: 0, speed: 0 });

  if (!overlay || !modalContent || !profile || !catalog) {
    console.error("[Rightbound] Inventaire indisponible : profil joueur ou catalogue manquant.");
    return;
  }

  const EQUIPMENT_SLOT_IDS = Object.freeze({
    weapon: "equip-weapon",
    helmet: "equip-helmet",
    chest: "equip-chest",
    jewel: "equip-jewel",
    boots: "equip-boots",
    relic: "equip-relic"
  });

  const RARITY_LABELS = Object.freeze({
    common: "Commun",
    rare: "Rare",
    epic: "Épique",
    legendary: "Légendaire"
  });

  let selectedInstanceUid = null;
  let resizeHandler = null;

  const bagSlotIds = () => Array.from({ length: BAG_SLOTS }, (_, index) => `bag-${index}`);

  function slotMarkup(id, accept, label, extraClass = "") {
    return `<div class="inventory-slot ${extraClass}" data-slot="${id}" data-accept="${accept}" data-label="${label}"></div>`;
  }

  function getFirstOwnedUid() {
    const state = profile.getState();
    return Object.values(state.equipment).find(Boolean) || state.bag.find(Boolean) || state.quickSlots.find(Boolean) || null;
  }

  function ensureSelectedInstance() {
    if (selectedInstanceUid && profile.getInstance(selectedInstanceUid)) return;
    selectedInstanceUid = getFirstOwnedUid();
  }

  function renderInventory() {
    overlay.classList.add("menu-overlay");
    overlay.classList.remove("dialog-overlay", "hidden");
    modalContent.className = "modal menu-modal inventory-modal";
    ensureSelectedInstance();

    modalContent.innerHTML = `
      <div class="inventory-viewport">
        <section class="inventory-screen" aria-label="Inventaire et équipement">
          <header class="inventory-header">
            <button class="inventory-back" id="inventoryBack" aria-label="Retour aux niveaux">←</button>
            <div class="inventory-title">
              <span>PRÉPARATION DU HÉROS</span>
              <h1>INVENTAIRE</h1>
            </div>
            <div class="inventory-power" aria-label="Puissance"><span>⚡</span><strong id="inventoryPower">0</strong></div>
          </header>

          <nav class="inventory-tabs" aria-label="Sections de préparation">
            <button class="active" type="button">Inventaire</button>
            <button type="button" disabled>Compétences</button>
            <button type="button" id="inventoryTopMapButton">Niveaux</button>
            <button type="button" id="inventoryTopHelpButton">Aide</button>
          </nav>

          <section class="character-loadout" aria-label="Équipement du personnage">
            ${slotMarkup("equip-weapon", "weapon", "ARME", "equipment-slot weapon")}
            ${slotMarkup("equip-helmet", "helmet", "CASQUE", "equipment-slot helmet")}
            ${slotMarkup("equip-chest", "chest", "PLASTRON", "equipment-slot chest")}
            ${slotMarkup("equip-jewel", "jewel", "ANNEAU", "equipment-slot jewel")}
            ${slotMarkup("equip-boots", "boots", "BOUCLIER", "equipment-slot boots")}
            ${slotMarkup("equip-relic", "relic", "AMULETTE", "equipment-slot relic")}
            <div class="inventory-avatar" aria-label="Avatar provisoire du personnage">
              <span class="avatar-head"></span><span class="avatar-neck"></span><span class="avatar-torso"></span>
              <span class="avatar-arm left"></span><span class="avatar-arm right"></span>
              <span class="avatar-hand left"></span><span class="avatar-hand right"></span>
              <span class="avatar-leg left"></span><span class="avatar-leg right"></span>
              <span class="avatar-foot left"></span><span class="avatar-foot right"></span>
            </div>
            <div class="inventory-rune" aria-hidden="true"><span>✦ ᚱ ᛟ ᚨ ᛉ ✦</span></div>
          </section>

          <section class="loadout-summary" aria-label="Statistiques">
            <div class="loadout-stat damage"><span class="loadout-stat-icon">⚔</span><strong id="inventoryDamage">12</strong><span>DÉGÂTS</span></div>
            <div class="loadout-stat armor"><span class="loadout-stat-icon">⬡</span><strong id="inventoryArmor">0</strong><span>ARMURE</span></div>
            <div class="loadout-stat hp"><span class="loadout-stat-icon">♥</span><strong id="inventoryHp">100</strong><span>VIE</span></div>
          </section>

          <section class="inventory-storage" aria-label="Sac à dos">
            <div class="storage-heading"><strong>SAC À DOS</strong><span id="bagCapacity">0 / ${BAG_SLOTS}</span></div>
            <div class="bag-window"><div class="bag-grid">${bagSlotIds().map((slotId) => slotMarkup(slotId, "any", "")).join("")}</div></div>
          </section>

          <section class="quickbar" aria-label="Potions rapides">
            <strong>POTIONS</strong>
            <div class="quickbar-slots">${Array.from({ length: QUICK_SLOTS }, (_, index) => slotMarkup(`quick-${index}`, "consumable", "")).join("")}</div>
          </section>

          <section class="selected-item" aria-label="Objet sélectionné">
            <div class="selected-item-icon" id="selectedItemIcon"></div>
            <div class="selected-item-copy"><strong id="selectedItemName">Aucun objet</strong><span id="selectedItemDescription">Les équipements gagnés apparaîtront ici.</span></div>
            <span class="selected-item-rarity" id="selectedItemRarity">—</span>
          </section>

          <nav class="inventory-dock" aria-label="Navigation principale">
            <button class="dock-button active"><span>▣</span><span>Inventaire</span></button>
            <button class="dock-button" disabled><span>▤</span><span>Compétences</span></button>
            <button class="dock-button" id="inventoryMapButton"><span>⌁</span><span>Niveaux</span></button>
            <button class="dock-button" id="inventoryHelpButton"><span>?</span><span>Aide</span></button>
          </nav>
        </section>
      </div>`;

    document.getElementById("inventoryBack")?.addEventListener("click", returnToMap);
    document.getElementById("inventoryMapButton")?.addEventListener("click", returnToMap);
    document.getElementById("inventoryTopMapButton")?.addEventListener("click", returnToMap);
    document.getElementById("inventoryHelpButton")?.addEventListener("click", showHelp);
    document.getElementById("inventoryTopHelpButton")?.addEventListener("click", showHelp);

    installInventoryFit();
    renderItems();
    renderSelectedItem();
  }

  function installInventoryFit() {
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
      window.visualViewport?.removeEventListener("resize", resizeHandler);
    }

    resizeHandler = () => {
      const screen = modalContent.querySelector(".inventory-screen");
      if (!screen) return;
      const viewport = window.visualViewport;
      const width = viewport?.width || window.innerWidth;
      const height = viewport?.height || window.innerHeight;
      const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
      screen.style.setProperty("--inventory-scale", String(Math.max(0.72, scale)));
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler, { passive: true });
    window.visualViewport?.addEventListener("resize", resizeHandler, { passive: true });
  }

  function returnToMap() {
    window.RightboundUI?.renderMainMenu?.();
  }

  function showHelp() {
    window.RightboundUI?.showToast?.("Glisse un équipement vers une case compatible. Touche-le pour afficher sa fiche.", 3200);
  }

  function itemVisualMarkup(item) {
    if (item?.image) {
      return `<img class="item-image" src="${item.image}" alt="" draggable="false" decoding="async" style="width:100%;height:100%;padding:3px;object-fit:contain;pointer-events:none;user-select:none">`;
    }
    return `<span class="item-glyph">${item?.glyph || "?"}</span>`;
  }

  function createItemElement(instanceUid) {
    const instance = profile.getInstance(instanceUid);
    const item = profile.getItemForInstance(instanceUid);
    if (!instance || !item) return null;

    const element = document.createElement("div");
    element.className = "inventory-item";
    element.dataset.instanceUid = instanceUid;
    element.dataset.itemId = item.id;
    element.dataset.rarity = item.rarity;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", `${item.name}, niveau ${instance.level}`);
    element.innerHTML = `<span class="item-level">N${instance.level}</span>${itemVisualMarkup(item)}`;
    element.addEventListener("pointerdown", (event) => beginPointerInteraction(event, instanceUid, element));
    return element;
  }

  function appendInstanceToSlot(instanceUid, slotId) {
    if (!instanceUid) return;
    const slot = modalContent.querySelector(`[data-slot="${slotId}"]`);
    const element = createItemElement(instanceUid);
    if (slot && element) slot.appendChild(element);
  }

  function renderItems() {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => slot.replaceChildren());
    const state = profile.getState();

    Object.entries(EQUIPMENT_SLOT_IDS).forEach(([type, slotId]) => {
      appendInstanceToSlot(state.equipment[type], slotId);
    });
    state.bag.forEach((instanceUid, index) => appendInstanceToSlot(instanceUid, `bag-${index}`));
    state.quickSlots.forEach((instanceUid, index) => appendInstanceToSlot(instanceUid, `quick-${index}`));

    const capacity = document.getElementById("bagCapacity");
    const bagSpace = profile.getBagSpace();
    if (capacity) capacity.textContent = `${bagSpace.used} / ${bagSpace.capacity}`;

    updateStats();
    modalContent.querySelectorAll(".inventory-item").forEach((node) => {
      node.classList.toggle("selected", node.dataset.instanceUid === selectedInstanceUid);
    });
  }

  function updateStats() {
    const totals = profile.getLoadoutStats(BASE_STATS);
    document.getElementById("inventoryDamage").textContent = Math.round(totals.damage);
    document.getElementById("inventoryArmor").textContent = Math.round(totals.armor);
    document.getElementById("inventoryHp").textContent = Math.round(totals.hp);
    document.getElementById("inventoryPower").textContent = profile.getPowerScore(BASE_STATS);
  }

  function openSheet(instanceUid) {
    if (!profile.getInstance(instanceUid)) return;
    selectedInstanceUid = instanceUid;
    renderSelectedItem();
    modalContent.querySelectorAll(".inventory-item").forEach((node) => {
      node.classList.toggle("selected", node.dataset.instanceUid === selectedInstanceUid);
    });
  }

  function renderSelectedItem() {
    ensureSelectedInstance();
    const item = selectedInstanceUid ? profile.getItemForInstance(selectedInstanceUid) : null;
    const instance = selectedInstanceUid ? profile.getInstance(selectedInstanceUid) : null;
    const icon = document.getElementById("selectedItemIcon");
    const name = document.getElementById("selectedItemName");
    const description = document.getElementById("selectedItemDescription");
    const rarity = document.getElementById("selectedItemRarity");
    const sheet = document.querySelector(".selected-item");

    if (!item || !instance) {
      if (icon) icon.innerHTML = "";
      if (name) name.textContent = "Aucun objet";
      if (description) description.textContent = "Les équipements gagnés apparaîtront ici.";
      if (rarity) rarity.textContent = "—";
      sheet?.removeAttribute("data-rarity");
      return;
    }

    if (icon) icon.innerHTML = itemVisualMarkup(item);
    if (name) name.textContent = item.name;
    if (description) description.textContent = item.description;
    if (rarity) rarity.textContent = RARITY_LABELS[item.rarity] || item.rarity;
    sheet?.setAttribute("data-rarity", item.rarity);
  }

  function slotAccepts(slot, itemType) {
    if (!slot) return false;
    return profile.slotAccepts(slot.dataset.slot, itemType);
  }

  function moveItem(instanceUid, targetSlot) {
    const item = profile.getItemForInstance(instanceUid);
    const targetSlotId = targetSlot?.dataset.slot;
    if (!item || !targetSlotId) return;

    const result = profile.moveInstance(instanceUid, targetSlotId);
    if (!result.ok) {
      const message = result.reason === "incompatible-swap"
        ? "Impossible d’échanger ces équipements."
        : "Cet équipement ne peut pas être placé ici.";
      window.RightboundUI?.showToast?.(message);
      return;
    }

    navigator.vibrate?.(10);
    renderItems();
    renderSelectedItem();
  }

  function grantItem(itemId, options = {}) {
    const result = profile.grantItem(itemId, options);
    if (!result.ok) {
      if (result.reason === "bag-full") window.RightboundUI?.showToast?.("Sac à dos plein.");
      return result;
    }

    selectedInstanceUid = result.instance.uid;
    if (modalContent.querySelector(".inventory-screen")) {
      renderItems();
      renderSelectedItem();
    }
    document.dispatchEvent(new CustomEvent("rightbound:item-granted", {
      detail: { ...result, itemId }
    }));
    return result;
  }

  function hasItem(itemId) {
    return profile.hasItem(itemId);
  }

  function getOwnedItemIds() {
    return profile.getOwnedItemIds();
  }

  function highlightSlots(itemType) {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => {
      const valid = slotAccepts(slot, itemType);
      slot.classList.toggle("drop-valid", valid);
      slot.classList.toggle("drop-invalid", !valid);
    });
  }

  function clearSlotHighlights() {
    modalContent.querySelectorAll(".inventory-slot").forEach((slot) => {
      slot.classList.remove("drop-valid", "drop-invalid", "drop-target");
    });
  }

  function beginPointerInteraction(event, instanceUid, sourceElement) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const item = profile.getItemForInstance(instanceUid);
    if (!item) return;

    let active = false;
    let ghost = null;
    let currentTarget = null;

    const startDrag = () => {
      active = true;
      sourceElement.classList.add("dragging");
      ghost = sourceElement.cloneNode(true);
      ghost.classList.add("drag-ghost");
      document.body.appendChild(ghost);
      highlightSlots(item.type);
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
      if (currentTarget && slotAccepts(currentTarget, item.type)) currentTarget.classList.add("drop-target");
    };

    const finish = (upEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      if (active) {
        const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest(".inventory-slot") || null;
        if (target) moveItem(instanceUid, target);
      } else {
        openSheet(instanceUid);
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
    const button = modalContent.querySelector(".game-dock .dock-button:first-child");
    if (!button || button.dataset.inventoryWired === "true") return;
    button.disabled = false;
    button.dataset.inventoryWired = "true";
    const label = button.querySelector("span:last-child");
    if (label) label.textContent = "Inventaire";
    button.addEventListener("click", renderInventory);
  }

  new MutationObserver(() => requestAnimationFrame(wireMenuInventoryButton))
    .observe(modalContent, { childList: true, subtree: true });

  document.addEventListener("rightbound:profile-changed", () => {
    if (!modalContent.querySelector(".inventory-screen")) return;
    ensureSelectedInstance();
    renderItems();
    renderSelectedItem();
  });

  window.RightboundInventory = Object.freeze({
    renderInventory,
    grantItem,
    hasItem,
    getOwnedItemIds,
    getOwnedInstances: profile.getOwnedInstances,
    getItem: (itemId) => catalog.getItem(itemId),
    getProfile: profile.getState
  });

  wireMenuInventoryButton();
})();
