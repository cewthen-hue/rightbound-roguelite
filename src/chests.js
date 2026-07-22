(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  if (!overlay || !modalContent) return;

  const STORAGE_KEY = "rightbound-chests-v1";
  const CHEST_ORDER = ["bronze", "silver", "gold", "diamond"];
  const CHESTS = {
    bronze: {
      label: "Bronze",
      symbol: "B",
      goldMin: 50,
      goldMax: 100,
      description: "50–100 golds",
      hint: "Objets communs à venir"
    },
    silver: {
      label: "Argent",
      symbol: "A",
      goldMin: 120,
      goldMax: 190,
      description: "120–190 golds",
      hint: "Objets inhabituels à venir"
    },
    gold: {
      label: "Or",
      symbol: "O",
      goldMin: 250,
      goldMax: 380,
      description: "250–380 golds",
      hint: "Objets rares à venir"
    },
    diamond: {
      label: "Diamant",
      symbol: "D",
      goldMin: 500,
      goldMax: 750,
      description: "500–750 golds",
      hint: "Objets épiques à venir"
    }
  };

  const CHEST_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10h16v10H4Z"/><path d="M3 7h18v4H3Z"/>
      <path d="M8 7V5h8v2M12 11v9"/>
    </svg>`;

  let state = loadState();
  let renderingChests = false;

  function defaultState() {
    return {
      chests: { bronze: 0, silver: 0, gold: 0, diamond: 0 },
      legacyLevelOneRewardGranted: false,
      opened: 0
    };
  }

  function normalizeCount(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || typeof parsed !== "object") return fallback;
      return {
        chests: Object.fromEntries(CHEST_ORDER.map((type) => [type, normalizeCount(parsed.chests?.[type])])),
        legacyLevelOneRewardGranted: parsed.legacyLevelOneRewardGranted === true,
        opened: normalizeCount(parsed.opened)
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
      chests: { ...state.chests },
      total: totalChests(),
      opened: state.opened
    };
  }

  function totalChests() {
    return CHEST_ORDER.reduce((sum, type) => sum + state.chests[type], 0);
  }

  function grantChest(type, amount = 1) {
    if (!CHESTS[type]) return false;
    state.chests[type] += Math.max(1, normalizeCount(amount));
    saveState();
    return true;
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatNumber(value) {
    return normalizeCount(value).toLocaleString("fr-FR");
  }

  function currentGold() {
    return window.RightboundEconomy?.getGold?.() ?? 0;
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
      const disabled = count <= 0;
      return `
        <article class="chest-card ${type} ${disabled ? "empty" : "available"}" data-chest-card="${type}">
          <div class="chest-card-top">
            <span class="chest-tier">${chest.label}</span>
            <span class="chest-count">×${count}</span>
          </div>
          <div class="chest-art" aria-hidden="true">
            <span class="chest-lid"></span><span class="chest-body"></span><strong>${chest.symbol}</strong>
          </div>
          <strong class="chest-name">Coffre ${chest.label}</strong>
          <span class="chest-reward-preview">${chest.description}</span>
          <small>${chest.hint}</small>
          <button type="button" class="open-chest-button" data-open-chest="${type}" ${disabled ? "disabled" : ""}>
            ${disabled ? "AUCUN COFFRE" : "OUVRIR"}
          </button>
        </article>`;
    }).join("");
  }

  function renderChestMenu() {
    renderingChests = true;
    state = loadState();
    overlay.classList.add("menu-overlay");
    overlay.classList.remove("dialog-overlay", "hidden");
    modalContent.className = "modal menu-modal chest-modal";

    modalContent.innerHTML = `
      <section class="chest-screen" aria-label="Coffres et récompenses">
        <header class="chest-header">
          <button type="button" class="chest-back" id="chestBackButton" aria-label="Retour aux niveaux">←</button>
          <div class="chest-title-copy"><span>RÉCOMPENSES D’EXPÉDITION</span><h1>COFFRES</h1></div>
          <div class="chest-gold-balance" aria-label="Solde de golds"><i aria-hidden="true"></i><strong id="chestGoldValue">${formatNumber(currentGold())}</strong></div>
        </header>

        <section class="chest-intro">
          <div><small>STOCK DISPONIBLE</small><strong>${totalChests()} coffre${totalChests() > 1 ? "s" : ""}</strong></div>
          <p>Termine des niveaux pour gagner des coffres de meilleure qualité.</p>
        </section>

        <section class="chest-grid" aria-label="Types de coffres">${renderChestCards()}</section>

        <section class="chest-info-bar">
          <span>Chaque ouverture est sauvegardée immédiatement.</span>
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
            <span class="reveal-kicker">COFFRE OUVERT</span>
            <div class="reveal-chest" id="revealChestArt" aria-hidden="true"><span></span><strong></strong></div>
            <h2 id="revealChestTitle"></h2>
            <div class="reveal-reward"><i aria-hidden="true"></i><strong id="revealGoldAmount"></strong><span>golds</span></div>
            <button type="button" id="collectChestReward">RÉCUPÉRER</button>
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

    renderingChests = false;
  }

  function openChest(type) {
    const chest = CHESTS[type];
    if (!chest || state.chests[type] <= 0) {
      window.RightboundUI?.showToast?.("Aucun coffre de ce type disponible.");
      return;
    }

    const reward = randomInteger(chest.goldMin, chest.goldMax);
    state.chests[type] -= 1;
    state.opened += 1;
    saveState();
    window.RightboundEconomy?.addGold?.(reward);

    const reveal = document.getElementById("chestReveal");
    const art = document.getElementById("revealChestArt");
    if (!reveal || !art) return;
    art.className = `reveal-chest ${type}`;
    art.querySelector("strong").textContent = chest.symbol;
    document.getElementById("revealChestTitle").textContent = `Coffre ${chest.label}`;
    document.getElementById("revealGoldAmount").textContent = `+${formatNumber(reward)}`;
    document.getElementById("chestGoldValue").textContent = formatNumber(currentGold());
    reveal.classList.add("visible");
    reveal.setAttribute("aria-hidden", "false");
    navigator.vibrate?.([25, 45, 35]);
  }

  function closeReveal() {
    const reveal = document.getElementById("chestReveal");
    reveal?.classList.remove("visible");
    reveal?.setAttribute("aria-hidden", "true");
    renderChestMenu();
  }

  function inspectVictoryScreen() {
    if (renderingChests) return;
    const restartButton = document.getElementById("restartButton");
    if (!restartButton || restartButton.dataset.chestRewarded === "true") return;
    const title = modalContent.querySelector("h2")?.textContent || "";
    if (!title.includes("Secteur nettoyé")) return;

    restartButton.dataset.chestRewarded = "true";
    grantChest("bronze", 1);

    const rewardNotice = document.createElement("section");
    rewardNotice.className = "victory-chest-reward";
    rewardNotice.innerHTML = `
      <span class="victory-chest-icon" aria-hidden="true">▰</span>
      <div><small>RÉCOMPENSE DU NIVEAU</small><strong>Coffre Bronze obtenu</strong></div>
      <span class="victory-chest-added">+1</span>`;

    const actions = modalContent.querySelector(".end-menu-actions");
    if (actions) actions.before(rewardNotice);
    else restartButton.before(rewardNotice);
  }

  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      migrateCompletedLevelReward();
      injectChestDockButton();
      inspectVictoryScreen();
    });
  });
  observer.observe(modalContent, { childList: true, subtree: true });

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = loadState();
    updateMenuBadge();
  });

  document.addEventListener("rightbound:economy-changed", () => {
    const value = document.getElementById("chestGoldValue");
    if (value) value.textContent = formatNumber(currentGold());
  });

  window.RightboundChests = { render: renderChestMenu, grant: grantChest, getState };
  migrateCompletedLevelReward();
  injectChestDockButton();
  inspectVictoryScreen();
})();
