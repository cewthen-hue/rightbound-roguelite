(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  const assets = window.RightboundMenuAssets;

  if (!modalContent || !assets) {
    console.error("[Rightbound] Menu V2 nécessite le conteneur modal et le système de sprites.");
    return;
  }

  const VERSION = "0.26.0";
  const WORLD = Object.freeze({
    subtitle: "MONDE 1",
    name: "LES FAUBOURGS OUBLIÉS",
    description: "Traverse les quartiers abandonnés et atteins le gardien du secteur."
  });
  const PLACEHOLDER_PROFILE = Object.freeze({
    name: "JACK",
    level: 1,
    xp: 0,
    xpNext: 150,
    gems: 0,
    energy: 0,
    energyMax: 30
  });

  let scheduled = false;
  let syncing = false;
  let legacyObserver = null;
  let observedLegacyRoot = null;

  function formatNumber(value) {
    const number = Number(value);
    return Math.max(0, Number.isFinite(number) ? Math.floor(number) : 0).toLocaleString("fr-FR");
  }

  function readGold() {
    if (typeof window.RightboundEconomy?.getGold === "function") {
      return window.RightboundEconomy.getGold();
    }
    try {
      return JSON.parse(localStorage.getItem("rightbound-economy-v1"))?.gold || 0;
    } catch {
      return 0;
    }
  }

  function getLevels() {
    return window.RightboundProgression?.levels || [];
  }

  function getSelectedLevel() {
    return window.RightboundProgression?.getSelectedLevel?.() || getLevels()[0] || {
      id: 1,
      name: "Entrée des ruines",
      power: 30,
      chest: "Bronze",
      chestType: "bronze",
      type: "normal"
    };
  }

  function isUnlocked(levelId) {
    return window.RightboundProgression?.isLevelUnlocked?.(levelId) !== false;
  }

  function isCompleted(levelId) {
    return window.RightboundProgression?.isLevelCompleted?.(levelId) === true;
  }

  function typeLabel(type) {
    if (type === "boss") return "BOSS";
    if (type === "elite") return "ÉLITE";
    return "NORMAL";
  }

  function readinessFor(level) {
    const fallbackPower = Number(window.RightboundBuild?.getPowerScore?.()) || 0;
    return window.RightboundBuild?.getReadiness?.(level.power) || {
      key: fallbackPower >= level.power ? "ready" : "danger",
      label: fallbackPower >= level.power ? "Adaptée" : "Insuffisante",
      power: fallbackPower,
      recommended: level.power
    };
  }

  function iconButton(label, kind) {
    return `
      <button type="button" class="menu-v2-utility" data-menu-v2-utility="${kind}" aria-label="${label}">
        <span class="menu-v2-utility-icon" data-menu-v2-asset="utility-${kind}" aria-hidden="true"></span>
        <span>${label}</span>
      </button>`;
  }

  function resource(type, label, value) {
    return `
      <div class="menu-v2-resource" data-menu-v2-resource="${type}" aria-label="${label}">
        <span class="menu-v2-resource-icon" data-menu-v2-asset="resource-${type}" aria-hidden="true"></span>
        <strong data-menu-v2-value="${type}">${value}</strong>
        <button type="button" class="menu-v2-resource-add" data-menu-v2-add="${type}" aria-label="Ajouter ${label.toLowerCase()}">+</button>
      </div>`;
  }

  function buildLevelNodes() {
    return getLevels().map((level) => `
      <button type="button" class="menu-v2-level-node" data-menu-v2-level="${level.id}" aria-label="Niveau ${level.id}, ${level.name}">
        <span class="menu-v2-level-status" aria-hidden="true"></span>
        <strong>${level.id}</strong>
      </button>`).join("");
  }

  function dockButton(kind, label, active = false) {
    return `
      <button type="button" class="menu-v2-dock-button${active ? " active" : ""}" data-menu-v2-dock="${kind}" aria-label="${label}">
        <span class="menu-v2-dock-icon" data-menu-v2-asset="dock-${kind}" aria-hidden="true"></span>
        <span>${label}</span>
      </button>`;
  }

  function buildShell() {
    const shell = document.createElement("section");
    shell.className = "game-menu menu-v2-shell";
    shell.dataset.menuV2 = VERSION;
    shell.setAttribute("aria-label", "Menu principal de l’expédition");
    shell.innerHTML = `
      <header class="menu-v2-topbar" data-menu-v2-asset="topbar">
        <div class="menu-v2-profile">
          <div class="menu-v2-portrait" data-menu-v2-asset="portrait">
            <span class="menu-v2-portrait-frame" data-menu-v2-asset="portrait-frame" aria-hidden="true"></span>
          </div>
          <div class="menu-v2-profile-copy">
            <strong class="menu-v2-player-name">${PLACEHOLDER_PROFILE.name}</strong>
            <span class="menu-v2-player-level">NIV. ${PLACEHOLDER_PROFILE.level}</span>
            <div class="menu-v2-xp" role="progressbar" aria-label="Expérience de Jack" aria-valuemin="0" aria-valuemax="${PLACEHOLDER_PROFILE.xpNext}" aria-valuenow="${PLACEHOLDER_PROFILE.xp}">
              <span class="menu-v2-xp-fill" data-menu-v2-asset="xp-fill"></span>
              <span class="menu-v2-xp-frame" data-menu-v2-asset="xp-frame" aria-hidden="true"></span>
              <strong>${PLACEHOLDER_PROFILE.xp} / ${PLACEHOLDER_PROFILE.xpNext} XP</strong>
            </div>
          </div>
        </div>
        <div class="menu-v2-resources">
          ${resource("gold", "Golds", formatNumber(readGold()))}
          ${resource("gems", "Gemmes", PLACEHOLDER_PROFILE.gems)}
          ${resource("energy", "Énergie", `${PLACEHOLDER_PROFILE.energy}/${PLACEHOLDER_PROFILE.energyMax}`)}
        </div>
      </header>

      <section class="menu-v2-world-header" aria-labelledby="menuV2WorldTitle">
        ${iconButton("OPTIONS", "settings")}
        <div class="menu-v2-world-copy">
          <small>${WORLD.subtitle}</small>
          <h1 id="menuV2WorldTitle">${WORLD.name}</h1>
        </div>
        ${iconButton("JOURNAL", "journal")}
      </section>

      <section class="menu-v2-expedition-card" aria-label="Niveau sélectionné">
        <header class="menu-v2-stage-header" data-menu-v2-asset="level-plaque">
          <div class="menu-v2-stage-title">
            <small data-menu-v2-selected="number">NIVEAU 1 / 10</small>
            <h2 data-menu-v2-selected="name">ENTRÉE DES RUINES</h2>
          </div>
          <span class="menu-v2-stage-type" data-menu-v2-selected="type">NORMAL</span>
        </header>

        <div class="menu-v2-stage-scene">
          <div class="menu-v2-stage-background" data-menu-v2-asset="world-background" aria-hidden="true"></div>
          <div class="menu-v2-stage-atmosphere" data-menu-v2-asset="world-atmosphere" aria-hidden="true"></div>
          <div class="menu-v2-stage-hero" data-menu-v2-asset="hero-stage" aria-hidden="true"></div>
          <div class="menu-v2-stage-frame" data-menu-v2-asset="stage-frame" aria-hidden="true"></div>
        </div>

        <footer class="menu-v2-zone-footer">
          <div class="menu-v2-zone-copy">
            <strong>ZONE ACTIVE</strong>
            <span>${WORLD.description}</span>
          </div>
          <div class="menu-v2-zone-state">
            <small data-menu-v2-selected="sector-label">SECTEUR DISPONIBLE</small>
            <strong data-menu-v2-selected="sector-state">PRÊT</strong>
          </div>
        </footer>

        <section class="menu-v2-facts" data-menu-v2-asset="info-panel" aria-label="Puissance et récompense">
          <article class="menu-v2-fact menu-v2-power-fact">
            <span class="menu-v2-power-placeholder" aria-hidden="true">✊</span>
            <div>
              <small>PUISSANCE CONSEILLÉE</small>
              <strong data-menu-v2-selected="power">30</strong>
              <span data-menu-v2-selected="readiness">Votre puissance : 0</span>
            </div>
            <button type="button" class="menu-v2-info-button" data-menu-v2-asset="info" aria-label="Informations sur la puissance"></button>
          </article>
          <article class="menu-v2-fact menu-v2-reward-fact">
            <span class="menu-v2-reward-chest" data-menu-v2-asset="reward-chest" aria-hidden="true"></span>
            <div>
              <small>RÉCOMPENSE DE VICTOIRE</small>
              <strong data-menu-v2-selected="chest">1 COFFRE BRONZE</strong>
            </div>
          </article>
        </section>
      </section>

      <section class="menu-v2-selector" aria-label="Sélection du niveau">
        <div class="menu-v2-section-title"><span></span><strong>SÉLECTION DU NIVEAU</strong><span></span></div>
        <div class="menu-v2-level-row">
          <button type="button" class="menu-v2-level-arrow previous" data-menu-v2-direction="previous" aria-label="Niveau précédent"></button>
          <div class="menu-v2-level-track">${buildLevelNodes()}</div>
          <button type="button" class="menu-v2-level-arrow next" data-menu-v2-direction="next" aria-label="Niveau suivant"></button>
        </div>
        <div class="menu-v2-legend" aria-label="Légende des niveaux">
          <span><i data-menu-v2-legend="check"></i>TERMINÉ</span>
          <span><i data-menu-v2-legend="elite"></i>ÉLITE</span>
          <span><i data-menu-v2-legend="boss"></i>BOSS</span>
          <span><i data-menu-v2-legend="lock"></i>VERROUILLÉ</span>
        </div>
      </section>

      <section class="menu-v2-primary-action">
        <button type="button" class="menu-v2-play" data-menu-v2-asset="play" data-menu-v2-action="play">
          <strong data-menu-v2-selected="play-label">JOUER</strong>
          <span data-menu-v2-selected="play-subtitle">LANCER L’EXPÉDITION</span>
        </button>
      </section>

      <nav class="menu-v2-dock" data-menu-v2-asset="dock-frame" aria-label="Navigation principale">
        ${dockButton("expedition", "EXPÉDITION", true)}
        ${dockButton("hero", "HÉROS")}
        ${dockButton("equipment", "ÉQUIPEMENT")}
        ${dockButton("forge", "FORGE")}
        ${dockButton("shop", "BOUTIQUE")}
      </nav>`;
    return shell;
  }

  function bindAsset(element, key, options = {}) {
    if (!element) return;
    assets.bindBackground(element, key, options);
  }

  function bindStaticAssets(shell) {
    bindAsset(shell.querySelector('[data-menu-v2-asset="topbar"]'), "topbarShell", { size: "100% 100%" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="portrait"]'), "heroPortrait", { size: "cover", position: "center top" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="portrait-frame"]'), "portraitFrame", { size: "100% 100%" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="xp-frame"]'), "xpFrame", { size: "100% 100%" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="xp-fill"]'), "xpFill", { size: "100% 100%", position: "left center" });

    shell.querySelectorAll("[data-menu-v2-resource]").forEach((node) => bindAsset(node, "resourcePanel", { size: "100% 100%" }));
    shell.querySelectorAll("[data-menu-v2-add]").forEach((node) => bindAsset(node, "plusButton", { size: "100% 100%" }));
    bindAsset(shell.querySelector('[data-menu-v2-asset="resource-gold"]'), "iconGold");
    bindAsset(shell.querySelector('[data-menu-v2-asset="resource-gems"]'), "iconGem");
    bindAsset(shell.querySelector('[data-menu-v2-asset="resource-energy"]'), "iconEnergy");

    shell.querySelectorAll(".menu-v2-utility").forEach((node) => bindAsset(node, "utilityButton", { size: "100% 100%" }));
    bindAsset(shell.querySelector('[data-menu-v2-asset="utility-settings"]'), "iconSettings");
    bindAsset(shell.querySelector('[data-menu-v2-asset="utility-journal"]'), "iconJournal");

    bindAsset(shell.querySelector('[data-menu-v2-asset="level-plaque"]'), "levelPlaque", { size: "100% 100%" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="world-background"]'), "worldBackground", { size: "cover" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="world-atmosphere"]'), "worldAtmosphere", { size: "cover" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="hero-stage"]'), "heroStage", { size: "contain", position: "center bottom" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="stage-frame"]'), "stageFrame", { size: "100% 100%" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="info-panel"]'), "infoPanel", { size: "100% 100%" });
    bindAsset(shell.querySelector('[data-menu-v2-asset="info"]'), "iconInfo");

    bindAsset(shell.querySelector('.menu-v2-level-arrow.previous'), "arrowLeft", { size: "100% 100%" });
    bindAsset(shell.querySelector('.menu-v2-level-arrow.next'), "arrowRight", { size: "100% 100%" });
    bindAsset(shell.querySelector('[data-menu-v2-legend="check"]'), "iconCheck");
    bindAsset(shell.querySelector('[data-menu-v2-legend="elite"]'), "iconElite");
    bindAsset(shell.querySelector('[data-menu-v2-legend="boss"]'), "iconBoss");
    bindAsset(shell.querySelector('[data-menu-v2-legend="lock"]'), "iconLock");

    bindAsset(shell.querySelector('[data-menu-v2-asset="dock-frame"]'), "bottomDockFrame", { size: "100% 100%" });
    shell.querySelectorAll(".menu-v2-dock-button").forEach((node) => {
      bindAsset(node, node.classList.contains("active") ? "dockButtonActive" : "dockButton", { size: "100% 100%" });
    });

    const dockAssetMap = {
      expedition: "navLevels",
      hero: "navInventory",
      equipment: "navChests",
      forge: "navSkills",
      shop: "iconGold"
    };
    Object.entries(dockAssetMap).forEach(([kind, key]) => {
      bindAsset(shell.querySelector(`[data-menu-v2-asset="dock-${kind}"]`), key);
    });
  }

  function proxyLegacyClick(selector) {
    const legacyRoot = modalContent.querySelector(".game-menu.level-menu.menu-v2-legacy-source");
    const target = legacyRoot?.querySelector(selector);
    if (!target) return false;
    target.click();
    scheduleSync();
    return true;
  }

  function attachEvents(shell) {
    shell.querySelector('[data-menu-v2-utility="settings"]')?.addEventListener("click", () => {
      window.RightboundUI?.showInstallHelp?.();
    });
    shell.querySelector('[data-menu-v2-utility="journal"]')?.addEventListener("click", () => {
      window.RightboundUI?.showToast?.("Le journal d’expédition sera ajouté plus tard.");
    });

    shell.querySelectorAll("[data-menu-v2-add]").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.menuV2Add;
        const message = type === "gold"
          ? "La boutique de golds sera ajoutée plus tard."
          : type === "gems"
            ? "Le système de gemmes sera ajouté plus tard."
            : "Le système d’énergie sera ajouté plus tard.";
        window.RightboundUI?.showToast?.(message);
      });
    });

    shell.querySelectorAll("[data-menu-v2-level]").forEach((button) => {
      button.addEventListener("click", () => {
        proxyLegacyClick(`.level-dot[data-level-id="${button.dataset.menuV2Level}"]`);
      });
    });

    shell.querySelector('[data-menu-v2-direction="previous"]')?.addEventListener("click", () => proxyLegacyClick("#previousLevelButton"));
    shell.querySelector('[data-menu-v2-direction="next"]')?.addEventListener("click", () => proxyLegacyClick("#nextLevelButton"));
    shell.querySelector('[data-menu-v2-action="play"]')?.addEventListener("click", () => proxyLegacyClick("#playSelectedLevel"));

    shell.querySelector('[data-menu-v2-dock="expedition"]')?.addEventListener("click", () => {});
    shell.querySelector('[data-menu-v2-dock="hero"]')?.addEventListener("click", () => {
      window.RightboundUI?.showToast?.("L’écran Héros sera construit dans un prochain lot.");
    });
    shell.querySelector('[data-menu-v2-dock="equipment"]')?.addEventListener("click", () => {
      if (typeof window.RightboundInventory?.renderInventory === "function") window.RightboundInventory.renderInventory();
      else window.RightboundUI?.showToast?.("L’équipement est encore en cours de chargement.");
    });
    shell.querySelector('[data-menu-v2-dock="forge"]')?.addEventListener("click", () => {
      window.RightboundUI?.showToast?.("La forge sera ajoutée plus tard.");
    });
    shell.querySelector('[data-menu-v2-dock="shop"]')?.addEventListener("click", () => {
      window.RightboundUI?.showToast?.("La boutique sera ajoutée plus tard.");
    });
  }

  function setText(shell, selector, value) {
    const node = shell.querySelector(selector);
    if (node && node.textContent !== value) node.textContent = value;
  }

  function syncNodes(shell, selectedLevel) {
    const levels = getLevels();
    shell.querySelectorAll("[data-menu-v2-level]").forEach((node) => {
      const id = Number(node.dataset.menuV2Level);
      const level = levels.find((entry) => entry.id === id);
      const selected = id === selectedLevel.id;
      const completed = isCompleted(id);
      const locked = !isUnlocked(id);

      node.classList.toggle("selected", selected);
      node.classList.toggle("completed", completed);
      node.classList.toggle("locked", locked);
      node.classList.toggle("elite", level?.type === "elite");
      node.classList.toggle("boss", level?.type === "boss");
      node.setAttribute("aria-current", selected ? "true" : "false");

      const key = assets.nodeKey(level, { selected, completed, locked });
      bindAsset(node, key, { size: "100% 100%" });

      const status = node.querySelector(".menu-v2-level-status");
      let statusKey = null;
      if (completed) statusKey = "iconCheck";
      else if (locked) statusKey = "iconLock";
      else if (level?.type === "boss") statusKey = "iconBoss";
      else if (level?.type === "elite") statusKey = "iconElite";

      status.hidden = !statusKey;
      if (statusKey) bindAsset(status, statusKey);
      else assets.clearBackground(status);
    });

    const previous = shell.querySelector('[data-menu-v2-direction="previous"]');
    const next = shell.querySelector('[data-menu-v2-direction="next"]');
    if (previous) previous.disabled = selectedLevel.id <= 1;
    if (next) next.disabled = selectedLevel.id >= levels.length;
  }

  function syncShell(shell) {
    const level = getSelectedLevel();
    const levels = getLevels();
    const unlocked = isUnlocked(level.id);
    const completed = isCompleted(level.id);
    const readiness = readinessFor(level);

    setText(shell, '[data-menu-v2-value="gold"]', formatNumber(readGold()));
    setText(shell, '[data-menu-v2-selected="number"]', `NIVEAU ${level.id} / ${levels.length || 10}`);
    setText(shell, '[data-menu-v2-selected="name"]', String(level.name || "NIVEAU").toUpperCase());
    setText(shell, '[data-menu-v2-selected="type"]', typeLabel(level.type));
    setText(shell, '[data-menu-v2-selected="power"]', String(level.power || 0));
    setText(shell, '[data-menu-v2-selected="readiness"]', `Votre puissance : ${readiness.power} · ${readiness.label}`);
    setText(shell, '[data-menu-v2-selected="chest"]', `1 COFFRE ${String(level.chest || "Bronze").toUpperCase()}`);

    const sectorLabel = completed ? "SECTEUR TERMINÉ" : unlocked ? "SECTEUR DISPONIBLE" : "SECTEUR VERROUILLÉ";
    const sectorState = completed ? "↻ REJOUABLE" : unlocked ? "PRÊT" : "À DÉBLOQUER";
    setText(shell, '[data-menu-v2-selected="sector-label"]', sectorLabel);
    setText(shell, '[data-menu-v2-selected="sector-state"]', sectorState);

    const typeBadge = shell.querySelector('[data-menu-v2-selected="type"]');
    if (typeBadge) typeBadge.dataset.type = level.type;

    const readinessNode = shell.querySelector('[data-menu-v2-selected="readiness"]');
    if (readinessNode) readinessNode.dataset.readiness = readiness.key;

    const rewardChest = shell.querySelector('[data-menu-v2-asset="reward-chest"]');
    if (rewardChest) bindAsset(rewardChest, assets.chestKey(level.chestType));

    const play = shell.querySelector('[data-menu-v2-action="play"]');
    if (play) {
      play.disabled = !unlocked;
      play.dataset.locked = unlocked ? "false" : "true";
      setText(shell, '[data-menu-v2-selected="play-label"]', unlocked ? "JOUER" : "VERROUILLÉ");
      setText(shell, '[data-menu-v2-selected="play-subtitle"]', unlocked ? "LANCER L’EXPÉDITION" : "TERMINE LE NIVEAU PRÉCÉDENT");
      bindAsset(play, unlocked ? "playButton" : "playButtonLocked", { size: "100% 100%" });
    }

    syncNodes(shell, level);
  }

  function observeLegacyRoot(root) {
    if (observedLegacyRoot === root) return;
    legacyObserver?.disconnect();
    observedLegacyRoot = root;
    legacyObserver = new MutationObserver(scheduleSync);
    legacyObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "disabled"]
    });
  }

  function ensureShell() {
    const legacyRoot = modalContent.querySelector(".game-menu.level-menu");
    if (!legacyRoot) return null;

    legacyRoot.classList.add("menu-v2-legacy-source");
    legacyRoot.setAttribute("aria-hidden", "true");
    observeLegacyRoot(legacyRoot);

    let shell = modalContent.querySelector(".menu-v2-shell");
    if (!shell) {
      shell = buildShell();
      legacyRoot.before(shell);
      bindStaticAssets(shell);
      attachEvents(shell);
    }
    return shell;
  }

  function sync() {
    if (syncing) return;
    syncing = true;
    try {
      const shell = ensureShell();
      if (shell) syncShell(shell);
    } finally {
      syncing = false;
    }
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  new MutationObserver(scheduleSync).observe(modalContent, {
    childList: true,
    subtree: false
  });

  document.addEventListener("rightbound:economy-changed", scheduleSync);
  document.addEventListener("rightbound:progression-changed", scheduleSync);
  document.addEventListener("rightbound:build-changed", scheduleSync);
  window.addEventListener("resize", scheduleSync, { passive: true });

  window.RightboundMenuV2 = Object.freeze({
    version: VERSION,
    refresh: scheduleSync,
    getShell: () => modalContent.querySelector(".menu-v2-shell")
  });

  scheduleSync();
})();
