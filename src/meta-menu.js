(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const gameZone = document.getElementById("gameZone");
  const hpFill = document.getElementById("hpFill");
  const jumpButton = document.getElementById("jumpButton");
  const toast = document.getElementById("gameToast");

  const ECONOMY_STORAGE_KEY = "rightbound-economy-v1";
  const DEFAULT_ECONOMY = Object.freeze({ gold: 0 });

  const STAGES = [
    { id: 1, name: "Faubourgs oubliés", accessible: true },
    { id: 2, name: "Voie industrielle", accessible: false },
    { id: 3, name: "Forêt contaminée", accessible: false },
    { id: 4, name: "Quartier noyé", accessible: false },
    { id: 5, name: "Citadelle rouge", accessible: false },
    { id: 6, name: "Bastion du nord", accessible: false }
  ];

  const ICONS = {
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z"/><path d="M8 4v13M16 7v13"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10l2 12H5L7 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    skills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.1 5.7L20 10l-5.2 3.1L14 20l-4.2-5.1L4 16l2.5-6L4 6l5.7.8L12 2Z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21h-4v-.1a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1-2.8-2.8.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 14H3v-4h.1a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2l-.1-.1L7 4.1l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 3V3h4v.1a1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1L20 7l-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 10h.1v4H21a1.8 1.8 0 0 0-1.6 1Z"/></svg>',
    stage: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9l8-5 8 5v11"/><path d="M8 20v-7h8v7M3 20h18"/></svg>'
  };

  let launchAction = null;
  let renderingMenu = false;
  let levelOneCompleted = false;
  let toastTimer = 0;
  let economy = loadEconomy();

  try {
    levelOneCompleted = localStorage.getItem("rightbound-level-1-completed") === "true";
  } catch {
    levelOneCompleted = false;
  }

  function normalizeGold(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
  }

  function loadEconomy() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ECONOMY_STORAGE_KEY));
      return { gold: normalizeGold(parsed?.gold ?? DEFAULT_ECONOMY.gold) };
    } catch {
      return { ...DEFAULT_ECONOMY };
    }
  }

  function saveEconomy() {
    try { localStorage.setItem(ECONOMY_STORAGE_KEY, JSON.stringify(economy)); } catch {}
  }

  function formatGold(value) {
    return normalizeGold(value).toLocaleString("fr-FR");
  }

  function updateGoldDisplay() {
    const balance = document.getElementById("menuGoldValue");
    if (balance) balance.textContent = formatGold(economy.gold);
  }

  function emitEconomyChange() {
    document.dispatchEvent(new CustomEvent("rightbound:economy-changed", {
      detail: { gold: economy.gold }
    }));
  }

  function setGold(value) {
    economy.gold = normalizeGold(value);
    saveEconomy();
    updateGoldDisplay();
    emitEconomyChange();
    return economy.gold;
  }

  function addGold(amount) {
    return setGold(economy.gold + normalizeGold(amount));
  }

  function spendGold(amount) {
    const cost = normalizeGold(amount);
    if (cost > economy.gold) return false;
    setGold(economy.gold - cost);
    return true;
  }

  function getGold() {
    return economy.gold;
  }

  function showToast(message, duration = 2600) {
    if (!toast || !message) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), duration);
  }

  function captureLaunchButton(button) {
    if (!button) return;
    launchAction = () => button.click();
  }

  function setMenuOverlayMode() {
    overlay.classList.add("menu-overlay");
    overlay.classList.remove("dialog-overlay");
    modalContent.className = "modal menu-modal";
  }

  function setDialogOverlayMode() {
    overlay.classList.remove("menu-overlay");
    overlay.classList.add("dialog-overlay");
    modalContent.className = "modal";
  }

  function buildStageNodes() {
    return STAGES.map((stage) => {
      const completed = stage.id === 1 && levelOneCompleted;
      const classes = ["stage-node", stage.accessible ? "unlocked" : "locked"];
      if (completed) classes.push("completed");

      return `
        <button class="${classes.join(" ")}" data-stage="${stage.id}"
          ${stage.accessible ? "" : "disabled"}
          aria-label="${stage.accessible ? `Jouer le niveau ${stage.id}` : `Niveau ${stage.id} verrouillé`}">
          ${stage.accessible
            ? `<span class="stage-number">${stage.id}</span>`
            : '<span class="stage-lock" aria-hidden="true"></span>'}
        </button>`;
    }).join("");
  }

  function dispatchShellAction(name) {
    document.dispatchEvent(new CustomEvent(`rightbound:${name}`));
  }

  function startLevelOne() {
    if (typeof launchAction !== "function") {
      showToast("Le niveau est encore en cours de chargement.");
      return;
    }
    window.setTimeout(launchAction, 100);
  }

  function renderMainMenu() {
    renderingMenu = true;
    economy = loadEconomy();
    setMenuOverlayMode();
    overlay.classList.remove("hidden");

    modalContent.innerHTML = `
      <section class="game-menu menu-entering" aria-label="Menu principal">
        <header class="menu-topbar">
          <div class="menu-brand">
            <span class="menu-kicker">Expédition mobile</span>
            <h1 class="menu-title">RIGHT<span>BOUND</span></h1>
          </div>
          <div class="menu-actions">
            <div class="menu-gold-balance" aria-label="Solde d'or">
              <span class="menu-gold-coin" aria-hidden="true">●</span>
              <strong id="menuGoldValue">${formatGold(economy.gold)}</strong>
            </div>
            <div class="menu-tools">
              <button class="menu-tool-button" id="installGameButton" aria-label="Installer le jeu">⇩</button>
              <button class="menu-tool-button" id="fullscreenGameButton" aria-label="Plein écran">⛶</button>
            </div>
          </div>
        </header>

        <div class="menu-map-scene">
          <div class="map-scene-header">
            <div class="chapter-label"><small>Chapitre 1</small><strong>Territoires perdus</strong></div>
            <span class="map-counter">${levelOneCompleted ? "1" : "0"} / ${STAGES.length}</span>
          </div>
          <div class="map-landscape" aria-hidden="true">
            <span class="ridge-back"></span><span class="ridge-front"></span><span class="road"></span>
          </div>
          <div class="stage-path" aria-label="Plateau des niveaux">
            ${buildStageNodes()}<span class="stage-boss-mark" aria-hidden="true">M</span>
          </div>
        </div>

        <section class="selected-stage-banner" aria-label="Niveau sélectionné">
          <div class="stage-banner-top">
            <span class="stage-emblem">${ICONS.stage}</span>
            <div class="stage-banner-copy">
              <small>Niveau 1</small><h2>Faubourgs oubliés</h2>
              <p>Traverse les ruines et élimine le gardien du secteur.</p>
            </div>
            <span class="stage-difficulty">NORMAL</span>
          </div>
          <div class="stage-banner-actions">
            <div class="stage-rewards">
              <span class="reward-chip">8 ennemis</span><span class="reward-chip">1 boss</span><span class="reward-chip">~2 min</span>
            </div>
            <button class="play-stage-button" id="playStageOne">JOUER</button>
          </div>
        </section>

        <nav class="game-dock" aria-label="Navigation principale">
          <button class="dock-button" disabled>${ICONS.bag}<span>Équipement</span></button>
          <button class="dock-button" disabled>${ICONS.skills}<span>Compétences</span></button>
          <button class="dock-button active">${ICONS.map}<span>Niveaux</span></button>
          <button class="dock-button" id="dockSettingsButton">${ICONS.settings}<span>Affichage</span></button>
        </nav>
      </section>`;

    document.getElementById("playStageOne")?.addEventListener("click", startLevelOne);
    modalContent.querySelector('[data-stage="1"]')?.addEventListener("click", startLevelOne);
    document.getElementById("installGameButton")?.addEventListener("click", () => dispatchShellAction("install-request"));
    document.getElementById("fullscreenGameButton")?.addEventListener("click", () => dispatchShellAction("fullscreen-request"));
    document.getElementById("dockSettingsButton")?.addEventListener("click", () => dispatchShellAction("fullscreen-request"));

    if (document.body.classList.contains("install-available")) {
      document.getElementById("installGameButton")?.classList.add("install-ready");
    }

    window.setTimeout(() => {
      modalContent.querySelector(".game-menu")?.classList.remove("menu-entering");
      renderingMenu = false;
      syncFloatingHealthVisibility();
    }, 550);
  }

  function showInstallHelp() {
    setDialogOverlayMode();
    overlay.classList.remove("hidden");
    modalContent.innerHTML = `
      <div class="install-sheet">
        <h2>Installer Rightbound</h2>
        <p class="subtitle">Lance le jeu comme une application, sans l’interface habituelle de Safari.</p>
        <ol class="install-steps">
          <li>Ouvre le bouton <strong>Partager</strong> de Safari.</li>
          <li>Choisis <strong>Sur l’écran d’accueil</strong>.</li>
          <li>Lance Rightbound depuis sa nouvelle icône.</li>
        </ol>
        <button class="primary" id="closeInstallHelp">Compris</button>
      </div>`;
    document.getElementById("closeInstallHelp")?.addEventListener("click", renderMainMenu, { once: true });
  }

  function decorateEndScreen(restartButton) {
    if (!restartButton || restartButton.dataset.gameDecorated === "true") return;
    restartButton.dataset.gameDecorated = "true";
    captureLaunchButton(restartButton);
    setDialogOverlayMode();

    const victory = (modalContent.querySelector("h2")?.textContent || "").includes("Secteur nettoyé");
    if (victory) {
      levelOneCompleted = true;
      try { localStorage.setItem("rightbound-level-1-completed", "true"); } catch {}
    }

    const mark = document.createElement("div");
    mark.className = "result-mark";
    mark.textContent = victory ? "✓" : "×";
    modalContent.prepend(mark);

    const actions = document.createElement("div");
    actions.className = "end-menu-actions";
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "secondary";
    backButton.textContent = "Carte";
    backButton.addEventListener("click", renderMainMenu);
    restartButton.textContent = "Rejouer";
    restartButton.parentNode.insertBefore(actions, restartButton);
    actions.append(backButton, restartButton);
  }

  function inspectOverlayContent() {
    if (renderingMenu) return;
    const startButton = document.getElementById("startButton");
    if (startButton) {
      captureLaunchButton(startButton);
      renderMainMenu();
      return;
    }
    const restartButton = document.getElementById("restartButton");
    if (restartButton) {
      decorateEndScreen(restartButton);
      return;
    }
    if (modalContent.querySelector(".upgrade-card")) setDialogOverlayMode();
  }

  const floatingHealth = document.createElement("div");
  floatingHealth.id = "playerFloatingHp";
  floatingHealth.setAttribute("aria-hidden", "true");
  floatingHealth.innerHTML = '<span class="floating-hp-fill"></span>';
  gameZone.appendChild(floatingHealth);
  const floatingHealthFill = floatingHealth.querySelector(".floating-hp-fill");

  function updateFloatingHealth() {
    const widthValue = hpFill.style.width || "100%";
    floatingHealthFill.style.width = widthValue;
    floatingHealth.classList.toggle("low", (Number.parseFloat(widthValue) || 0) <= 35);
  }

  function positionFloatingHealth() {
    const rect = gameZone.getBoundingClientRect();
    const playerX = Math.max(75, Math.min(105, rect.width * 0.23));
    const playerY = rect.height * 0.80;
    floatingHealth.style.left = `${playerX - 36}px`;
    floatingHealth.style.top = `${playerY - 78}px`;
  }

  function syncFloatingHealthVisibility() {
    floatingHealth.classList.toggle("visible", overlay.classList.contains("hidden"));
  }

  new MutationObserver(() => requestAnimationFrame(inspectOverlayContent))
    .observe(modalContent, { childList: true, subtree: true });
  new MutationObserver(syncFloatingHealthVisibility)
    .observe(overlay, { attributes: true, attributeFilter: ["class"] });
  new MutationObserver(updateFloatingHealth)
    .observe(hpFill, { attributes: true, attributeFilter: ["style"] });

  window.addEventListener("resize", positionFloatingHealth, { passive: true });
  window.addEventListener("storage", (event) => {
    if (event.key !== ECONOMY_STORAGE_KEY) return;
    economy = loadEconomy();
    updateGoldDisplay();
  });

  jumpButton.addEventListener("click", () => {
    if (jumpButton.disabled) return;
    floatingHealth.classList.remove("jumping");
    void floatingHealth.offsetWidth;
    floatingHealth.classList.add("jumping");
    setTimeout(() => floatingHealth.classList.remove("jumping"), 760);
  }, { capture: true });

  document.addEventListener("rightbound:install-available", () => {
    document.body.classList.add("install-available");
    document.getElementById("installGameButton")?.classList.add("install-ready");
  });

  document.addEventListener("rightbound:economy-changed", updateGoldDisplay);

  window.RightboundEconomy = { getGold, setGold, addGold, spendGold };
  window.RightboundUI = { renderMainMenu, showInstallHelp, showToast };
  positionFloatingHealth();
  updateFloatingHealth();
  syncFloatingHealthVisibility();
  inspectOverlayContent();
})();
