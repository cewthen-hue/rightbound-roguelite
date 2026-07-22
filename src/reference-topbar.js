(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  const assetSystem = window.RightboundMenuAssets;
  if (!modalContent || !assetSystem) return;

  const PLACEHOLDER_STATE = Object.freeze({
    heroLevel: 1,
    heroXp: 0,
    heroXpNext: 100,
    gems: 0,
    energy: 0
  });

  const RESOURCE_ASSETS = Object.freeze({
    gold: "iconGold",
    gems: "iconGem",
    energy: "iconEnergy"
  });

  let scheduled = false;
  let updating = false;

  function normalizeNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
  }

  function readStoredGold() {
    const economyApi = window.RightboundEconomy;
    if (typeof economyApi?.getGold === "function") return normalizeNumber(economyApi.getGold());

    try {
      const parsed = JSON.parse(localStorage.getItem("rightbound-economy-v1"));
      return normalizeNumber(parsed?.gold);
    } catch {
      return 0;
    }
  }

  function formatNumber(value) {
    return normalizeNumber(value).toLocaleString("fr-FR");
  }

  function resourceMarkup(type, value, label) {
    return `
      <div class="reference-resource reference-resource-${type}" data-resource-surface="${type}" aria-label="${label}">
        <span class="reference-resource-icon reference-resource-icon-${type}" data-resource-icon="${type}" aria-hidden="true">
          ${type === "energy" ? '<span class="reference-energy-bolt">ϟ</span>' : ""}
        </span>
        <strong id="menu${type[0].toUpperCase()}${type.slice(1)}Value">${value}</strong>
        <button type="button" class="reference-resource-add" data-resource-add="${type}" aria-label="Ajouter ${label.toLowerCase()}"><span>+</span></button>
      </div>`;
  }

  function bindTopbarAssets(topbar) {
    if (!topbar) return;
    assetSystem.bindBackground(topbar, "topbarShell", { size: "100% 100%", position: "center" });
    assetSystem.bindBackground(topbar.querySelector("#premiumHeroPortrait"), "heroPortrait", { size: "cover", position: "center top" });
    assetSystem.bindBackground(topbar.querySelector("#referencePortraitFrame"), "portraitFrame", { size: "100% 100%" });
    assetSystem.bindBackground(topbar.querySelector("#referenceXpFrame"), "xpFrame", { size: "100% 100%" });
    assetSystem.bindBackground(topbar.querySelector("#referenceXpFill"), "xpFill", { size: "100% 100%", position: "left center" });

    topbar.querySelectorAll("[data-resource-surface]").forEach((surface) => {
      assetSystem.bindBackground(surface, "resourcePanel", { size: "100% 100%" });
    });
    topbar.querySelectorAll("[data-resource-icon]").forEach((icon) => {
      assetSystem.bindBackground(icon, RESOURCE_ASSETS[icon.dataset.resourceIcon], { size: "contain" });
    });
    topbar.querySelectorAll("[data-resource-add]").forEach((button) => {
      assetSystem.bindBackground(button, "plusButton", { size: "100% 100%" });
    });
  }

  function buildTopbar(topbar) {
    const gold = readStoredGold();
    const xpRatio = PLACEHOLDER_STATE.heroXpNext > 0
      ? Math.min(100, PLACEHOLDER_STATE.heroXp / PLACEHOLDER_STATE.heroXpNext * 100)
      : 0;

    topbar.className = "level-topbar reference-topbar";
    topbar.dataset.referenceTopbar = "true";
    topbar.innerHTML = `
      <div class="level-profile reference-player-block" data-enhanced="true">
        <div class="premium-profile-portrait reference-player-portrait" id="premiumHeroPortrait" aria-hidden="true">
          <span class="portrait-fallback"><i></i><b>J</b></span>
          <span class="reference-player-portrait-frame" id="referencePortraitFrame"></span>
        </div>
        <div class="reference-player-data">
          <strong class="reference-player-name">JACK</strong>
          <div class="reference-player-level-row">
            <span class="reference-player-level">NIV. ${PLACEHOLDER_STATE.heroLevel}</span>
            <div class="reference-player-xp" role="progressbar" aria-label="Expérience du héros" aria-valuemin="0" aria-valuemax="${PLACEHOLDER_STATE.heroXpNext}" aria-valuenow="${PLACEHOLDER_STATE.heroXp}">
              <span class="reference-player-xp-fill" id="referenceXpFill" style="--xp-ratio:${xpRatio}%"></span>
              <span class="reference-player-xp-frame" id="referenceXpFrame"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="level-currencies reference-resources">
        ${resourceMarkup("gold", formatNumber(gold), "Golds")}
        ${resourceMarkup("gems", String(PLACEHOLDER_STATE.gems), "Gemmes")}
        ${resourceMarkup("energy", String(PLACEHOLDER_STATE.energy), "Énergie")}
      </div>`;

    topbar.querySelectorAll("[data-resource-add]").forEach((button) => {
      button.addEventListener("click", () => {
        const resource = button.dataset.resourceAdd;
        const message = resource === "gold"
          ? "L’accès à la boutique de golds sera ajouté plus tard."
          : resource === "gems"
            ? "Le système de gemmes sera ajouté plus tard."
            : "Le système d’énergie sera ajouté plus tard.";
        window.RightboundUI?.showToast?.(message, 2400);
      });
    });

    bindTopbarAssets(topbar);
  }

  function updateGold(value = readStoredGold()) {
    const node = document.getElementById("menuGoldValue");
    if (node) node.textContent = formatNumber(value);
  }

  function syncTopbar() {
    if (updating) return;
    updating = true;
    try {
      const topbar = modalContent.querySelector(".game-menu.level-menu .level-topbar");
      if (!topbar) return;
      if (topbar.dataset.referenceTopbar !== "true") buildTopbar(topbar);
      else {
        updateGold();
        bindTopbarAssets(topbar);
      }
    } finally {
      updating = false;
    }
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncTopbar();
    });
  }

  new MutationObserver(scheduleSync).observe(modalContent, {
    childList: true,
    subtree: true
  });

  document.addEventListener("rightbound:economy-changed", (event) => {
    updateGold(event.detail?.gold);
  });

  window.RightboundTopbar = Object.freeze({
    version: "2.0.0",
    getPlaceholderState: () => ({ ...PLACEHOLDER_STATE }),
    refresh: scheduleSync
  });

  scheduleSync();
})();