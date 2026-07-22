(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const PLACEHOLDER_STATE = Object.freeze({
    heroLevel: 1,
    heroXp: 0,
    heroXpNext: 100,
    gems: 0,
    energy: 0,
    energyMax: 30
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
    const icon = type === "energy" ? '<span class="reference-energy-bolt">ϟ</span>' : "";
    return `
      <div class="reference-resource reference-resource-${type}" aria-label="${label}">
        <span class="reference-resource-icon reference-resource-icon-${type}" aria-hidden="true">${icon}</span>
        <strong id="menu${type[0].toUpperCase()}${type.slice(1)}Value">${value}</strong>
        <button type="button" class="reference-resource-add" data-resource-add="${type}" aria-label="Ajouter ${label.toLowerCase()}">+</button>
      </div>`;
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
        </div>
        <div class="reference-player-data">
          <strong class="reference-player-name">JACK</strong>
          <div class="reference-player-level-row">
            <span class="reference-player-level">NIV. ${PLACEHOLDER_STATE.heroLevel}</span>
            <div class="reference-player-xp" role="progressbar" aria-label="Expérience du héros" aria-valuemin="0" aria-valuemax="${PLACEHOLDER_STATE.heroXpNext}" aria-valuenow="${PLACEHOLDER_STATE.heroXp}">
              <i style="width:${xpRatio}%"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="level-currencies reference-resources">
        ${resourceMarkup("gold", formatNumber(gold), "Golds")}
        ${resourceMarkup("gems", String(PLACEHOLDER_STATE.gems), "Gemmes")}
        ${resourceMarkup("energy", `${PLACEHOLDER_STATE.energy}/${PLACEHOLDER_STATE.energyMax}`, "Énergie")}
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

    window.RightboundMenuAssets?.bindBackground?.(
      topbar.querySelector("#premiumHeroPortrait"),
      "heroPortrait",
      { size: "cover", position: "center top" }
    );
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
      else updateGold();
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
    version: "1.0.0",
    getPlaceholderState: () => ({ ...PLACEHOLDER_STATE }),
    refresh: scheduleSync
  });

  scheduleSync();
})();
