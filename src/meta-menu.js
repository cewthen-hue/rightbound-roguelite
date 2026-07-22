(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const gameZone = document.getElementById("gameZone");
  const hpFill = document.getElementById("hpFill");
  const jumpButton = document.getElementById("jumpButton");
  const toast = document.getElementById("gameToast");

  const ECONOMY_STORAGE_KEY = "rightbound-economy-v1";
  const SELECTED_LEVEL_KEY = "rightbound-selected-level-v1";
  const DEFAULT_ECONOMY = Object.freeze({ gold: 0 });

  const WORLD = {
    id: 1,
    name: "Les Faubourgs oubliés",
    subtitle: "Monde 1",
    description: "Traverse les quartiers abandonnés et atteins le gardien du secteur."
  };

  const LEVELS = [
    { id: 1, name: "Entrée des ruines", power: 30, chest: "Bronze", type: "normal", playable: true },
    { id: 2, name: "Rue des ferrailleurs", power: 40, chest: "Bronze", type: "normal", playable: false },
    { id: 3, name: "Passage effondré", power: 50, chest: "Bronze", type: "normal", playable: false },
    { id: 4, name: "Toits abandonnés", power: 60, chest: "Bronze", type: "normal", playable: false },
    { id: 5, name: "Le Maraudeur", power: 75, chest: "Argent", type: "elite", playable: false },
    { id: 6, name: "Zone des carcasses", power: 90, chest: "Bronze", type: "normal", playable: false },
    { id: 7, name: "Dépôt condamné", power: 105, chest: "Argent", type: "normal", playable: false },
    { id: 8, name: "Avenue des cendres", power: 120, chest: "Argent", type: "normal", playable: false },
    { id: 9, name: "Dernier barrage", power: 140, chest: "Or", type: "normal", playable: false },
    { id: 10, name: "Gardien des Faubourgs", power: 165, chest: "Diamant", type: "boss", playable: false }
  ];

  const ICONS = {
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z"/><path d="M8 4v13M16 7v13"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10l2 12H5L7 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    skills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.1 5.7L20 10l-5.2 3.1L14 20l-4.2-5.1L4 16l2.5-6L4 6l5.7.8L12 2Z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21h-4v-.1a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1-2.8-2.8.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 14H3v-4h.1a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2l-.1-.1L7 4.1l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 3V3h4v.1a1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1L20 7l-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 10h.1v4H21a1.8 1.8 0 0 0-1.6 1Z"/></svg>'
  };

  let launchAction = null;
  let renderingMenu = false;
  let levelOneCompleted = false;
  let toastTimer = 0;
  let economy = loadEconomy();
  let selectedLevelId = loadSelectedLevel();

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

  function loadSelectedLevel() {
    try {
      const parsed = Number(localStorage.getItem(SELECTED_LEVEL_KEY));
      return LEVELS.some((level) => level.id === parsed) ? parsed : 1;
    } catch {
      return 1;
    }
  }

  function saveSelectedLevel() {
    try { localStorage.setItem(SELECTED_LEVEL_KEY, String(selectedLevelId)); } catch {}
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

  function currentLevel() {
    return LEVELS.find((level) => level.id === selectedLevelId) || LEVELS[0];
  }

  function levelTypeLabel(level) {
    if (level.type === "boss") return "Boss du monde";
    if (level.type === "elite") return "Élite";
    return "Normal";
  }

  function buildLevelDots() {
    return LEVELS.map((level) => {
      const classes = ["level-dot", level.type];
      if (level.id === selectedLevelId) classes.push("selected");
      if (level.id === 1 && levelOneCompleted) classes.push("completed");
      if (!level.playable) classes.push("locked");
      return `<button type="button" class="${classes.join(" ")}" data-level-id="${level.id}" aria-label="Niveau ${level.id}, ${level.name}">${level.id}</button>`;
    }).join("");
  }

  function startSelectedLevel() {
    const level = currentLevel();
    if (!level.playable) {
      showToast("Ce niveau sera disponible dans une prochaine version.");
      return;
    }
    if (typeof launchAction !== "function") {
      showToast("Le niveau est encore en cours de chargement.");
      return;
    }
    window.setTimeout(launchAction, 100);
  }

  function selectLevel(levelId) {
    const next = LEVELS.find((level) => level.id === levelId);
    if (!next) return;
    selectedLevelId = next.id;
    saveSelectedLevel();
    refreshLevelSelection();
  }

  function refreshLevelSelection() {
    const level = currentLevel();
    const showcase = modalContent.querySelector(".level-showcase");
    if (!showcase) return;

    showcase.dataset.type = level.type;
    const number = document.getElementById("selectedLevelNumber");
    const name = document.getElementById("selectedLevelName");
    const type = document.getElementById("selectedLevelType");
    const power = document.getElementById("selectedLevelPower");
    const chest = document.getElementById("selectedLevelChest");
    const footer = document.getElementById("selectedLevelFooter");
    const play = document.getElementById("playSelectedLevel");
    const status = document.getElementById("selectedLevelStatus");
    const reward = document.getElementById("selectedLevelReward");

    if (number) number.textContent = `Niveau ${level.id} / ${LEVELS.length}`;
    if (name) name.textContent = level.name;
    if (type) type.textContent = levelTypeLabel(level);
    if (power) power.textContent = String(level.power);
    if (chest) chest.textContent = `Coffre ${level.chest}`;
    if (footer) footer.textContent = level.playable ? "Secteur disponible" : "Secteur verrouillé";
    if (play) {
      play.disabled = !level.playable;
      play.textContent = level.playable ? "JOUER" : "VERROUILLÉ";
    }
    if (status) status.textContent = level.playable ? "Disponible" : "À débloquer";
    if (reward) reward.textContent = `▰ ${level.chest}`;

    modalContent.querySelectorAll(".level-dot").forEach((button) => {
      button.classList.toggle("selected", Number(button.dataset.levelId) === level.id);
    });

    const previous = document.getElementById("previousLevelButton");
    const next = document.getElementById("nextLevelButton");
    if (previous) previous.disabled = level.id <= 1;
    if (next) next.disabled = level.id >= LEVELS.length;

    const selectedButton = modalContent.querySelector(`.level-dot[data-level-id="${level.id}"]`);
    selectedButton?.scrollIntoView?.({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function renderMainMenu() {
    renderingMenu = true;
    economy = loadEconomy();
    setMenuOverlayMode();
    overlay.classList.remove("hidden");
    const level = currentLevel();
    const completedCount = levelOneCompleted ? 1 : 0;

    modalContent.innerHTML = `
      <section class="game-menu level-menu menu-entering" aria-label="Sélection du niveau">
        <header class="level-topbar">
          <div class="level-profile">
            <span class="level-profile-badge">N1</span>
            <div class="level-profile-copy"><small>Héros</small><strong>Éclaireur</strong></div>
          </div>
          <div class="level-currencies">
            <div class="level-gold" aria-label="Solde de golds"><i aria-hidden="true"></i><strong id="menuGoldValue">${formatGold(economy.gold)}</strong></div>
            <div class="level-power" aria-label="Puissance du héros"><span aria-hidden="true">⚡</span><strong>83</strong></div>
          </div>
        </header>

        <section class="world-heading">
          <div class="world-heading-copy"><small>${WORLD.subtitle}</small><h1>${WORLD.name}</h1></div>
          <span class="world-progress">${completedCount} / ${LEVELS.length}</span>
        </section>

        <section class="level-showcase" data-type="${level.type}" aria-label="Niveau sélectionné">
          <div class="level-card-header">
            <div class="level-card-title"><small id="selectedLevelNumber">Niveau ${level.id} / ${LEVELS.length}</small><h2 id="selectedLevelName">${level.name}</h2></div>
            <span class="level-type-badge" id="selectedLevelType">${levelTypeLabel(level)}</span>
          </div>
          <div class="level-scene-skyline" aria-hidden="true"><span class="level-building-back"></span><span class="level-building-front"></span><span class="level-ground"></span><span class="level-mist"></span></div>
          <div class="level-hero" aria-hidden="true">
            <span class="level-hero-head"></span><span class="level-hero-neck"></span><span class="level-hero-torso"></span>
            <span class="level-hero-arm left"></span><span class="level-hero-arm right"></span>
            <span class="level-hero-hand left"></span><span class="level-hero-hand right"></span>
            <span class="level-hero-leg left"></span><span class="level-hero-leg right"></span>
            <span class="level-hero-foot left"></span><span class="level-hero-foot right"></span>
          </div>
          <div class="level-hero-platform" aria-hidden="true"></div>
          <div class="level-scene-footer"><span>${WORLD.description}</span><strong id="selectedLevelFooter">${level.playable ? "Secteur disponible" : "Secteur verrouillé"}</strong></div>
        </section>

        <section class="level-facts" aria-label="Informations du niveau">
          <article class="level-fact"><span class="level-fact-icon">⚡</span><div><small>Puissance conseillée</small><strong id="selectedLevelPower">${level.power}</strong></div></article>
          <article class="level-fact reward"><span class="level-fact-icon">▰</span><div><small>Récompense garantie</small><strong id="selectedLevelChest">Coffre ${level.chest}</strong></div></article>
        </section>

        <section class="level-selector" aria-label="Choix du niveau">
          <button type="button" class="level-arrow" id="previousLevelButton" aria-label="Niveau précédent">‹</button>
          <div class="level-track">${buildLevelDots()}</div>
          <button type="button" class="level-arrow" id="nextLevelButton" aria-label="Niveau suivant">›</button>
        </section>

        <section class="level-play-row">
          <span class="level-play-status" id="selectedLevelStatus">${level.playable ? "Disponible" : "À débloquer"}</span>
          <button type="button" class="level-play-button" id="playSelectedLevel" ${level.playable ? "" : "disabled"}>${level.playable ? "JOUER" : "VERROUILLÉ"}</button>
          <span class="level-play-reward" id="selectedLevelReward">▰ ${level.chest}</span>
        </section>

        <nav class="game-dock" aria-label="Navigation principale">
          <button class="dock-button" disabled>${ICONS.bag}<span>Équipement</span></button>
          <button class="dock-button" disabled>${ICONS.skills}<span>Compétences</span></button>
          <button class="dock-button active">${ICONS.map}<span>Niveaux</span></button>
          <button class="dock-button" id="dockSettingsButton">${ICONS.settings}<span>Affichage</span></button>
        </nav>
      </section>`;

    document.getElementById("playSelectedLevel")?.addEventListener("click", startSelectedLevel);
    document.getElementById("previousLevelButton")?.addEventListener("click", () => selectLevel(selectedLevelId - 1));
    document.getElementById("nextLevelButton")?.addEventListener("click", () => selectLevel(selectedLevelId + 1));
    modalContent.querySelectorAll(".level-dot").forEach((button) => {
      button.addEventListener("click", () => selectLevel(Number(button.dataset.levelId)));
    });

    refreshLevelSelection();

    window.setTimeout(() => {
      modalContent.querySelector(".game-menu")?.classList.remove("menu-entering");
      renderingMenu = false;
      syncFloatingHealthVisibility();
    }, 450);
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
      selectedLevelId = 1;
      saveSelectedLevel();
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
    backButton.textContent = "Menu";
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
  });

  document.addEventListener("rightbound:economy-changed", updateGoldDisplay);

  window.RightboundEconomy = { getGold, setGold, addGold, spendGold };
  window.RightboundUI = { renderMainMenu, showInstallHelp, showToast };
  positionFloatingHealth();
  updateFloatingHealth();
  syncFloatingHealthVisibility();
  inspectOverlayContent();
})();
