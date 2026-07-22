(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const loot = window.RightboundLoot;
  const profile = window.RightboundPlayerProfile;
  const economy = window.RightboundEconomy;

  if (!overlay || !modalContent || !loot || !profile) {
    console.error("[Rightbound] Le système de coffres nécessite le loot et le profil joueur.");
    return;
  }

  const STORAGE_KEY = "rightbound-chests-v1";
  const SCHEMA_VERSION = 3;
  const CHEST_ORDER = [...loot.order];
  const CHESTS = loot.chests;
  const MAX_GRANT_IDS = 250;

  const CHEST_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10h16v10H4Z"/><path d="M3 7h18v4H3Z"/>
      <path d="M8 7V5h8v2M12 11v9"/>
    </svg>`;

  let state = loadState();
  let renderingChests = false;
  let lastReveal = null;

  function defaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      chests: { bronze: 0, silver: 0, gold: 0, diamond: 0 },
      legacyLevelOneRewardGranted: false,
      firstBronzeItemClaimed: false,
      opened: 0,
      pendingOpening: null,
      grantedRewardIds: []
    };
  }

  function normalizeCount(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
  }

  function normalizeIdList(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((entry) => typeof entry === "string" && entry).slice(-MAX_GRANT_IDS))];
  }

  function sanitizePending(raw) {
    if (!raw || typeof raw !== "object" || !CHESTS[raw.type]) return null;
    const itemId = typeof raw.itemId === "string" && window.RightboundItemCatalog?.getItem?.(raw.itemId)
      ? raw.itemId
      : null;
    const validPhases = new Set(["prepared", "item-granted", "gold-granting", "gold-granted"]);
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : `chest-${Date.now()}`,
      type: raw.type,
      itemId,
      rarity: typeof raw.rarity === "string" ? raw.rarity : null,
      rarityLabel: typeof raw.rarityLabel === "string" ? raw.rarityLabel : null,
      gold: normalizeCount(raw.gold),
      guaranteed: raw.guaranteed === true,
      duplicate: raw.duplicate === true,
      itemDropped: raw.itemDropped === true && Boolean(itemId),
      phase: validPhases.has(raw.phase) ? raw.phase : "prepared",
      instanceUid: typeof raw.instanceUid === "string" ? raw.instanceUid : null,
      goldBefore: normalizeCount(raw.goldBefore),
      goldTarget: normalizeCount(raw.goldTarget),
      startedAt: normalizeCount(raw.startedAt, Date.now())
    };
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || typeof parsed !== "object") return fallback;
      return {
        schemaVersion: SCHEMA_VERSION,
        chests: Object.fromEntries(CHEST_ORDER.map((type) => [type, normalizeCount(parsed.chests?.[type])])),
        legacyLevelOneRewardGranted: parsed.legacyLevelOneRewardGranted === true,
        firstBronzeItemClaimed: parsed.firstBronzeItemClaimed === true,
        opened: normalizeCount(parsed.opened),
        pendingOpening: sanitizePending(parsed.pendingOpening),
        grantedRewardIds: normalizeIdList(parsed.grantedRewardIds)
      };
    } catch {
      return fallback;
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    updateMenuBadge();
    document.dispatchEvent(new CustomEvent("rightbound:chests-changed", { detail: getState() }));
  }

  function getState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      chests: { ...state.chests },
      total: totalChests(),
      opened: state.opened,
      firstBronzeItemClaimed: state.firstBronzeItemClaimed,
      pendingOpening: state.pendingOpening ? { ...state.pendingOpening } : null,
      grantedRewardIds: [...state.grantedRewardIds]
    };
  }

  function totalChests() {
    return CHEST_ORDER.reduce((sum, type) => sum + state.chests[type], 0);
  }

  function grantChest(type, amount = 1, grantId = null) {
    if (!CHESTS[type]) return false;
    if (grantId && state.grantedRewardIds.includes(grantId)) return true;
    state.chests[type] += Math.max(1, normalizeCount(amount));
    if (grantId) {
      state.grantedRewardIds.push(grantId);
      state.grantedRewardIds = state.grantedRewardIds.slice(-MAX_GRANT_IDS);
    }
    saveState();
    return true;
  }

  function formatNumber(value) {
    return normalizeCount(value).toLocaleString("fr-FR");
  }

  function currentGold() {
    return economy?.getGold?.() ?? 0;
  }

  function setGold(value) {
    if (typeof economy?.setGold === "function") return economy.setGold(value);
    const difference = Math.max(0, normalizeCount(value) - currentGold());
    return economy?.addGold?.(difference) ?? currentGold();
  }

  function migrateCompletedLevelReward() {
    if (state.legacyLevelOneRewardGranted) return;
    let completed = false;
    try { completed = localStorage.getItem("rightbound-level-1-completed") === "true"; } catch {}
    if (!completed) return;
    state.legacyLevelOneRewardGranted = true;
    state.chests.bronze += 1;
    saveState();
  }

  function findTransactionInstance(transactionId) {
    const source = `chest:${transactionId}`;
    return profile.getOwnedInstances().find((instance) => instance.source === source) || null;
  }

  function clearInvalidPending(reason) {
    state.pendingOpening = null;
    saveState();
    return { ok: false, reason };
  }

  function processPendingOpening() {
    const pending = state.pendingOpening;
    if (!pending) return { ok: false, reason: "no-pending-opening" };
    if (state.chests[pending.type] <= 0) return clearInvalidPending("missing-chest");

    let instance = pending.instanceUid ? profile.getInstance(pending.instanceUid) : null;

    if (pending.phase === "prepared") {
      if (pending.itemId) {
        instance = instance || findTransactionInstance(pending.id);
        if (!instance) {
          if (profile.getBagSpace().free <= 0) return { ok: false, reason: "bag-full", pending: true };
          const granted = profile.grantItem(pending.itemId, {
            level: 1,
            source: `chest:${pending.id}`
          });
          if (!granted.ok) {
            if (granted.reason === "bag-full") return { ok: false, reason: "bag-full", pending: true };
            return clearInvalidPending(granted.reason || "grant-failed");
          }
          instance = granted.instance;
        }
        pending.instanceUid = instance.uid;
      }
      pending.phase = "item-granted";
      saveState();
    }

    if (pending.phase === "item-granted") {
      pending.goldBefore = currentGold();
      pending.goldTarget = pending.goldBefore + pending.gold;
      pending.phase = "gold-granting";
      saveState();
    }

    if (pending.phase === "gold-granting") {
      if (currentGold() < pending.goldTarget) setGold(pending.goldTarget);
      pending.phase = "gold-granted";
      saveState();
    }

    if (pending.phase === "gold-granted") {
      const item = pending.itemId ? window.RightboundItemCatalog.getItem(pending.itemId) : null;
      const result = {
        ok: true,
        type: pending.type,
        itemId: pending.itemId,
        item,
        rarity: pending.rarity || item?.rarity || null,
        rarityLabel: pending.rarityLabel || (item ? loot.rarityLabels[item.rarity] : null),
        itemDropped: Boolean(item),
        instanceUid: pending.instanceUid,
        gold: pending.gold,
        guaranteed: pending.guaranteed,
        duplicate: pending.duplicate
      };

      state.chests[pending.type] = Math.max(0, state.chests[pending.type] - 1);
      state.opened += 1;
      if (pending.type === "bronze" && pending.guaranteed) state.firstBronzeItemClaimed = true;
      state.pendingOpening = null;
      saveState();
      return result;
    }

    return { ok: false, reason: "incomplete-opening" };
  }

  function recoverPendingOpening() {
    if (!state.pendingOpening) return null;
    const recovered = processPendingOpening();
    if (recovered.ok) {
      console.info("[Rightbound] Ouverture de coffre récupérée après interruption.", recovered);
      document.dispatchEvent(new CustomEvent("rightbound:chest-opening-recovered", { detail: recovered }));
    }
    return recovered;
  }

  function injectChestDockButton() {
    const dock = modalContent.querySelector(".game-menu .game-dock");
    if (!dock) return;

    let button = dock.querySelector("#dockChestsButton");
    if (!button) {
      const oldButton = dock.querySelector("#dockSettingsButton") || dock.lastElementChild;
      if (!oldButton) return;
      button = document.createElement("button");
      button.type = "button";
      button.className = "dock-button chest-dock-button";
      button.id = "dockChestsButton";
      button.innerHTML = `${CHEST_ICON}<span>Coffres</span><b class="chest-dock-badge" aria-label="Coffres disponibles"></b>`;
      oldButton.replaceWith(button);
      button.addEventListener("click", renderChestMenu);
    }
    updateMenuBadge();
  }

  function updateMenuBadge() {
    const badge = document.querySelector("#dockChestsButton .chest-dock-badge");
    if (!badge) return;
    const total = totalChests();
    badge.textContent = total > 99 ? "99+" : String(total);
    badge.classList.toggle("visible", total > 0);
  }

  function renderChestCards() {
    return CHEST_ORDER.map((type) => {
      const chest = CHESTS[type];
      const count = state.chests[type];
      const empty = count <= 0;
      const pendingThisType = state.pendingOpening?.type === type;
      const buttonLabel = empty ? "AUCUN COFFRE" : pendingThisType ? "REPRENDRE" : "OUVRIR";
      return `
        <article class="chest-card ${type} ${empty ? "empty" : "available"}" data-chest-card="${type}">
          <div class="chest-card-top">
            <span class="chest-tier">${chest.label}</span>
            <span class="chest-count">×${count}</span>
          </div>
          <div class="chest-art" aria-hidden="true">
            <span class="chest-lid"></span><span class="chest-body"></span><strong>${chest.symbol}</strong>
          </div>
          <strong class="chest-name">Coffre ${chest.label}</strong>
          <span class="chest-reward-preview">${chest.preview}</span>
          <small>${chest.description}</small>
          <button type="button" class="open-chest-button" data-open-chest="${type}" ${empty ? "disabled" : ""}>
            ${buttonLabel}
          </button>
        </article>`;
    }).join("");
  }

  function renderChestMenu() {
    renderingChests = true;
    state = loadState();
    const recovery = recoverPendingOpening();
    overlay.classList.add("menu-overlay");
    overlay.classList.remove("dialog-overlay", "hidden");
    modalContent.className = "modal menu-modal chest-modal";

    const bagSpace = profile.getBagSpace();
    const pendingText = state.pendingOpening && recovery?.reason === "bag-full"
      ? "Une récompense attend une place libre dans le sac."
      : "Les golds sont garantis. Les objets dépendent du coffre.";

    modalContent.innerHTML = `
      <section class="chest-screen" aria-label="Coffres et récompenses">
        <header class="chest-header">
          <button type="button" class="chest-back" id="chestBackButton" aria-label="Retour aux niveaux">←</button>
          <div class="chest-title-copy"><span>RÉCOMPENSES D’EXPÉDITION</span><h1>COFFRES</h1></div>
          <div class="chest-gold-balance" aria-label="Solde de golds"><i aria-hidden="true"></i><strong id="chestGoldValue">${formatNumber(currentGold())}</strong></div>
        </header>

        <section class="chest-intro">
          <div><small>STOCK DISPONIBLE</small><strong>${totalChests()} coffre${totalChests() > 1 ? "s" : ""}</strong></div>
          <p>${pendingText} Sac : ${bagSpace.used}/${bagSpace.capacity}.</p>
        </section>

        <section class="chest-grid" aria-label="Types de coffres">${renderChestCards()}</section>

        <section class="chest-info-bar">
          <span>Les objets inconnus restent prioritaires.</span>
          <strong>${state.opened} ouvert${state.opened > 1 ? "s" : ""}</strong>
        </section>

        <nav class="chest-dock" aria-label="Navigation principale">
          <button type="button" id="chestInventoryButton"><span>▣</span><small>Inventaire</small></button>
          <button type="button" disabled><span>▤</span><small>Compétences</small></button>
          <button type="button" id="chestLevelsButton"><span>⌁</span><small>Niveaux</small></button>
          <button type="button" class="active"><span>▰</span><small>Coffres</small></button>
        </nav>

        <div class="chest-reveal" id="chestReveal" aria-hidden="true">
          <div class="chest-reveal-card">
            <span class="reveal-kicker" id="revealKicker">COFFRE OUVERT</span>
            <div class="reveal-chest" id="revealChestArt" aria-hidden="true"><span></span><strong></strong></div>
            <h2 id="revealChestTitle"></h2>
            <article class="reveal-loot-item" id="revealLootItem">
              <div class="reveal-item-frame"><img id="revealItemImage" alt="" draggable="false"></div>
              <div class="reveal-item-copy">
                <small id="revealItemRarity"></small>
                <strong id="revealItemName"></strong>
                <span id="revealItemStats"></span>
              </div>
            </article>
            <article class="reveal-no-item" id="revealNoItem" hidden>
              <strong>GOLDS UNIQUEMENT</strong>
              <span>Aucun équipement dans ce coffre.</span>
            </article>
            <div class="reveal-reward"><i aria-hidden="true"></i><strong id="revealGoldAmount"></strong><span>golds</span></div>
            <div class="reveal-actions">
              <button type="button" class="reveal-equip-button" id="equipChestReward">ÉQUIPER</button>
              <button type="button" id="collectChestReward">GARDER</button>
            </div>
          </div>
        </div>
      </section>`;

    document.getElementById("chestBackButton")?.addEventListener("click", () => window.RightboundUI?.renderMainMenu?.());
    document.getElementById("chestLevelsButton")?.addEventListener("click", () => window.RightboundUI?.renderMainMenu?.());
    document.getElementById("chestInventoryButton")?.addEventListener("click", () => window.RightboundInventory?.renderInventory?.());
    modalContent.querySelectorAll("[data-open-chest]").forEach((button) => {
      button.addEventListener("click", () => openChest(button.dataset.openChest));
    });
    document.getElementById("collectChestReward")?.addEventListener("click", closeReveal);
    document.getElementById("equipChestReward")?.addEventListener("click", equipRevealedItem);

    renderingChests = false;
  }

  function openChest(type) {
    const chest = CHESTS[type];
    if (!chest || state.chests[type] <= 0) {
      window.RightboundUI?.showToast?.("Aucun coffre de ce type disponible.");
      return;
    }

    if (state.pendingOpening) {
      const recovered = recoverPendingOpening();
      if (!recovered?.ok) {
        const message = recovered?.reason === "bag-full"
          ? "Cette récompense contient un objet. Libère une place dans le sac pour la récupérer."
          : "Une ouverture précédente doit être finalisée.";
        window.RightboundUI?.showToast?.(message, 3600);
        return;
      }
      lastReveal = recovered;
      showReveal(recovered);
      return;
    }

    const reward = loot.createReward(type, {
      ownedItemIds: profile.getOwnedItemIds(),
      firstBronzeClaimed: state.firstBronzeItemClaimed
    });
    if (!reward) {
      window.RightboundUI?.showToast?.("Impossible de générer la récompense.");
      return;
    }

    state.pendingOpening = {
      id: `opening-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      itemId: reward.itemId,
      rarity: reward.rarity,
      rarityLabel: reward.rarityLabel,
      gold: reward.gold,
      guaranteed: reward.guaranteed,
      duplicate: reward.duplicate,
      itemDropped: reward.itemDropped,
      phase: "prepared",
      instanceUid: null,
      goldBefore: 0,
      goldTarget: 0,
      startedAt: Date.now()
    };
    saveState();

    const result = processPendingOpening();
    if (!result.ok) {
      const message = result.reason === "bag-full"
        ? "Ce coffre contient un objet. Libère une place dans le sac : le coffre est conservé."
        : "L’ouverture a échoué. Le coffre a été conservé.";
      window.RightboundUI?.showToast?.(message, 3800);
      renderChestMenu();
      return;
    }

    lastReveal = result;
    showReveal(result);
  }

  function showReveal(result) {
    const chest = CHESTS[result.type];
    const item = result.item;
    const reveal = document.getElementById("chestReveal");
    const art = document.getElementById("revealChestArt");
    const lootCard = document.getElementById("revealLootItem");
    const noItemCard = document.getElementById("revealNoItem");
    const equipButton = document.getElementById("equipChestReward");
    if (!reveal || !art || !lootCard || !noItemCard || !equipButton) return;

    art.className = `reveal-chest ${result.type}`;
    art.querySelector("strong").textContent = chest.symbol;
    document.getElementById("revealChestTitle").textContent = `Coffre ${chest.label}`;
    document.getElementById("revealGoldAmount").textContent = `+${formatNumber(result.gold)}`;
    document.getElementById("chestGoldValue").textContent = formatNumber(currentGold());

    if (item) {
      document.getElementById("revealKicker").textContent = result.guaranteed
        ? "PREMIER COFFRE — RÉCOMPENSE GARANTIE"
        : result.duplicate ? "DOUBLON OBTENU" : "NOUVEL ÉQUIPEMENT";
      document.getElementById("revealItemImage").src = item.image;
      document.getElementById("revealItemImage").alt = item.name;
      document.getElementById("revealItemRarity").textContent = result.rarityLabel || loot.rarityLabels[item.rarity] || item.rarity;
      document.getElementById("revealItemName").textContent = item.name;
      document.getElementById("revealItemStats").textContent = item.description;
      lootCard.dataset.rarity = item.rarity;
      lootCard.hidden = false;
      noItemCard.hidden = true;
      equipButton.hidden = false;
    } else {
      document.getElementById("revealKicker").textContent = "GOLDS GARANTIS";
      lootCard.hidden = true;
      noItemCard.hidden = false;
      equipButton.hidden = true;
    }

    reveal.classList.add("visible");
    reveal.setAttribute("aria-hidden", "false");
    navigator.vibrate?.([25, 45, 35]);
  }

  function equipRevealedItem() {
    if (!lastReveal?.instanceUid || !lastReveal.item) return;
    const targetSlot = `equip-${lastReveal.item.type}`;
    const moved = profile.moveInstance(lastReveal.instanceUid, targetSlot);
    if (!moved.ok) {
      window.RightboundUI?.showToast?.("Impossible d’équiper cet objet.");
      return;
    }
    window.RightboundUI?.showToast?.(`${lastReveal.item.name} équipé.`);
    lastReveal = null;
    window.RightboundInventory?.renderInventory?.();
  }

  function closeReveal() {
    const reveal = document.getElementById("chestReveal");
    reveal?.classList.remove("visible");
    reveal?.setAttribute("aria-hidden", "true");
    lastReveal = null;
    renderChestMenu();
  }

  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      migrateCompletedLevelReward();
      injectChestDockButton();
    });
  });
  observer.observe(modalContent, { childList: true, subtree: true });

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = loadState();
    recoverPendingOpening();
    updateMenuBadge();
  });

  document.addEventListener("rightbound:economy-changed", () => {
    const value = document.getElementById("chestGoldValue");
    if (value) value.textContent = formatNumber(currentGold());
  });

  document.addEventListener("rightbound:profile-changed", () => {
    if (modalContent.querySelector(".chest-screen") && !modalContent.querySelector(".chest-reveal.visible")) {
      const bagSpace = profile.getBagSpace();
      const intro = modalContent.querySelector(".chest-intro p");
      if (intro) intro.textContent = `Les golds sont garantis. Les objets dépendent du coffre. Sac : ${bagSpace.used}/${bagSpace.capacity}.`;
    }
  });

  document.addEventListener("rightbound:run-rewarded", updateMenuBadge);

  window.RightboundChests = Object.freeze({
    render: renderChestMenu,
    grant: grantChest,
    getState,
    recoverPendingOpening
  });

  migrateCompletedLevelReward();
  recoverPendingOpening();
  injectChestDockButton();
})();
