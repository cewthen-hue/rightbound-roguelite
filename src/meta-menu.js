(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const gameZone = document.getElementById("gameZone");
  const hpFill = document.getElementById("hpFill");
  const jumpButton = document.getElementById("jumpButton");
  const toast = document.getElementById("gameToast");

  const ECONOMY_STORAGE_KEY = "rightbound-economy-v1";
  const PROGRESSION_STORAGE_KEY = "rightbound-progression-v2";
  const SELECTED_LEVEL_KEY = "rightbound-selected-level-v1";
  const MAX_REWARD_IDS = 300;

  const WORLD = Object.freeze({
    id: 1,
    name: "Les Faubourgs oubliés",
    subtitle: "Monde 1",
    description: "Traverse les quartiers abandonnés et atteins le gardien du secteur."
  });

  const LEVELS = Object.freeze([
    Object.freeze({ id: 1, name: "Entrée des ruines", power: 30, chest: "Bronze", chestType: "bronze", type: "normal" }),
    Object.freeze({ id: 2, name: "Rue des ferrailleurs", power: 40, chest: "Bronze", chestType: "bronze", type: "normal" }),
    Object.freeze({ id: 3, name: "Passage effondré", power: 50, chest: "Bronze", chestType: "bronze", type: "normal" }),
    Object.freeze({ id: 4, name: "Toits abandonnés", power: 60, chest: "Bronze", chestType: "bronze", type: "normal" }),
    Object.freeze({ id: 5, name: "Le Maraudeur", power: 75, chest: "Argent", chestType: "silver", type: "elite" }),
    Object.freeze({ id: 6, name: "Zone des carcasses", power: 90, chest: "Bronze", chestType: "bronze", type: "normal" }),
    Object.freeze({ id: 7, name: "Dépôt condamné", power: 105, chest: "Argent", chestType: "silver", type: "normal" }),
    Object.freeze({ id: 8, name: "Avenue des cendres", power: 120, chest: "Argent", chestType: "silver", type: "normal" }),
    Object.freeze({ id: 9, name: "Dernier barrage", power: 140, chest: "Or", chestType: "gold", type: "normal" }),
    Object.freeze({ id: 10, name: "Gardien des Faubourgs", power: 165, chest: "Diamant", chestType: "diamond", type: "boss" })
  ]);

  const ICONS = Object.freeze({
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z"/><path d="M8 4v13M16 7v13"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10l2 12H5L7 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
    skills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.1 5.7L20 10l-5.2 3.1L14 20l-4.2-5.1L4 16l2.5-6L4 6l5.7.8L12 2Z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21h-4v-.1a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1-2.8-2.8.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 14H3v-4h.1a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2l-.1-.1L7 4.1l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 3V3h4v.1a1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1L20 7l-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 10h.1v4H21a1.8 1.8 0 0 0-1.6 1Z"/></svg>'
  });

  let launchAction = null;
  let renderingMenu = false;
  let toastTimer = 0;
  let economy = loadEconomy();
  let progression = loadProgression();
  let selectedLevelId = loadSelectedLevel();

  function normalizeInteger(value, fallback = 0, minimum = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(minimum, Math.floor(parsed));
  }

  function normalizeIdList(value, limit = MAX_REWARD_IDS) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((entry) => typeof entry === "string" && entry).slice(-limit))];
  }

  function defaultEconomy() {
    return { gold: 0, appliedRewardIds: [] };
  }

  function loadEconomy() {
    const fallback = defaultEconomy();
    try {
      const parsed = JSON.parse(localStorage.getItem(ECONOMY_STORAGE_KEY));
      if (!parsed || typeof parsed !== "object") return fallback;
      return {
        gold: normalizeInteger(parsed.gold, 0, 0),
        appliedRewardIds: normalizeIdList(parsed.appliedRewardIds)
      };
    } catch {
      return fallback;
    }
  }

  function saveEconomy() {
    try { localStorage.setItem(ECONOMY_STORAGE_KEY, JSON.stringify(economy)); } catch {}
  }

  function formatGold(value) {
    return normalizeInteger(value).toLocaleString("fr-FR");
  }

  function updateGoldDisplay() {
    const balance = document.getElementById("menuGoldValue");
    if (balance) balance.textContent = formatGold(economy.gold);
  }

  function emitEconomyChange(reason = "update") {
    document.dispatchEvent(new CustomEvent("rightbound:economy-changed", {
      detail: { gold: economy.gold, reason }
    }));
  }

  function setGold(value) {
    economy.gold = normalizeInteger(value, 0, 0);
    saveEconomy();
    updateGoldDisplay();
    emitEconomyChange("set");
    return economy.gold;
  }

  function addGold(amount) {
    return setGold(economy.gold + normalizeInteger(amount, 0, 0));
  }

  function addGoldOnce(rewardId, amount) {
    if (typeof rewardId !== "string" || !rewardId) return addGold(amount);
    if (economy.appliedRewardIds.includes(rewardId)) return economy.gold;
    economy.gold += normalizeInteger(amount, 0, 0);
    economy.appliedRewardIds.push(rewardId);
    economy.appliedRewardIds = economy.appliedRewardIds.slice(-MAX_REWARD_IDS);
    saveEconomy();
    updateGoldDisplay();
    emitEconomyChange("reward");
    return economy.gold;
  }

  function spendGold(amount) {
    const cost = normalizeInteger(amount, 0, 0);
    if (cost > economy.gold) return false;
    setGold(economy.gold - cost);
    return true;
  }

  function getGold() {
    return economy.gold;
  }

  function defaultProgression() {
    return {
      schemaVersion: 2,
      unlockedLevel: 1,
      completedLevels: [],
      nextRunSerial: 1,
      activeRun: null,
      rewardedRunIds: []
    };
  }

  function sanitizeRun(raw) {
    if (!raw || typeof raw !== "object") return null;
    const levelId = normalizeInteger(raw.levelId, 0, 1);
    if (!LEVELS.some((level) => level.id === levelId)) return null;
    const phases = new Set(["playing", "result-detected", "gold-granted", "chest-granted"]);
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : `run-recovered-${Date.now()}`,
      levelId,
      startedAt: normalizeInteger(raw.startedAt, Date.now(), 0),
      phase: phases.has(raw.phase) ? raw.phase : "playing",
      victory: raw.victory === true,
      combatGold: normalizeInteger(raw.combatGold, 0, 0),
      permanentGold: normalizeInteger(raw.permanentGold, 0, 0),
      chestType: typeof raw.chestType === "string" ? raw.chestType : null
    };
  }

  function loadProgression() {
    const fallback = defaultProgression();
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESSION_STORAGE_KEY));
      if (parsed && typeof parsed === "object") {
        const completedLevels = [...new Set((Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [])
          .map((entry) => normalizeInteger(entry, 0, 1))
          .filter((entry) => LEVELS.some((level) => level.id === entry)))]
          .sort((a, b) => a - b);
        return {
          schemaVersion: 2,
          unlockedLevel: Math.min(LEVELS.length, Math.max(1, normalizeInteger(parsed.unlockedLevel, 1, 1))),
          completedLevels,
          nextRunSerial: Math.max(1, normalizeInteger(parsed.nextRunSerial, 1, 1)),
          activeRun: sanitizeRun(parsed.activeRun),
          rewardedRunIds: normalizeIdList(parsed.rewardedRunIds)
        };
      }
    } catch {}

    let legacyCompleted = false;
    try { legacyCompleted = localStorage.getItem("rightbound-level-1-completed") === "true"; } catch {}
    if (legacyCompleted) {
      fallback.completedLevels = [1];
      fallback.unlockedLevel = 2;
    }
    saveProgressionValue(fallback);
    return fallback;
  }

  function saveProgressionValue(value) {
    try { localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(value)); } catch {}
  }

  function saveProgression(reason = "update") {
    saveProgressionValue(progression);
    document.dispatchEvent(new CustomEvent("rightbound:progression-changed", {
      detail: { reason, progression: getProgressionState() }
    }));
  }

  function getProgressionState() {
    return JSON.parse(JSON.stringify(progression));
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

  function levelById(levelId) {
    return LEVELS.find((level) => level.id === levelId) || null;
  }

  function isLevelUnlocked(levelId) {
    return levelId <= progression.unlockedLevel;
  }

  function isLevelCompleted(levelId) {
    return progression.completedLevels.includes(levelId);
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
      if (isLevelCompleted(level.id)) classes.push("completed");
      if (!isLevelUnlocked(level.id)) classes.push("locked");
      return `<button type="button" class="${classes.join(" ")}" data-level-id="${level.id}" aria-label="Niveau ${level.id}, ${level.name}">${level.id}</button>`;
    }).join("");
  }

  function prepareRun(levelId) {
    const level = levelById(levelId);
    if (!level || !isLevelUnlocked(levelId)) return null;
    const recentActiveRun = progression.activeRun;
    if (recentActiveRun?.phase === "playing" && Date.now() - recentActiveRun.startedAt < 1500) {
      return recentActiveRun;
    }
    const run = {
      id: `run-${String(progression.nextRunSerial).padStart(6, "0")}-${Date.now()}`,
      levelId,
      startedAt: Date.now(),
      phase: "playing",
      victory: false,
      combatGold: 0,
      permanentGold: 0,
      chestType: level.chestType
    };
    progression.nextRunSerial += 1;
    progression.activeRun = run;
    saveProgression("run-started");
    return run;
  }

  function startSelectedLevel() {
    const level = currentLevel();
    if (!isLevelUnlocked(level.id)) {
      showToast("Termine le niveau précédent pour débloquer ce secteur.");
      return;
    }
    if (typeof launchAction !== "function") {
      showToast("Le niveau est encore en cours de chargement.");
      return;
    }
    prepareRun(level.id);
    window.setTimeout(launchAction, 100);
  }

  function selectLevel(levelId) {
    const next = levelById(levelId);
    if (!next) return;
    selectedLevelId = next.id;
    saveSelectedLevel();
    refreshLevelSelection();
  }

  function refreshLevelSelection() {
    const level = currentLevel();
    const unlocked = isLevelUnlocked(level.id);
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
    if (chest) chest.textContent = `1 coffre ${level.chest}`;
    if (footer) footer.textContent = unlocked ? (isLevelCompleted(level.id) ? "Secteur terminé — rejouable" : "Secteur disponible") : "Secteur verrouillé";
    if (play) {
      play.disabled = !unlocked;
      play.textContent = unlocked ? "JOUER" : "VERROUILLÉ";
    }
    if (status) status.textContent = unlocked ? (isLevelCompleted(level.id) ? "Rejouable" : "Disponible") : "À débloquer";
    if (reward) reward.textContent = `▰ ×1 ${level.chest}`;

    modalContent.querySelectorAll(".level-dot").forEach((button) => {
      const buttonLevelId = Number(button.dataset.levelId);
      button.classList.toggle("selected", buttonLevelId === level.id);
      button.classList.toggle("completed", isLevelCompleted(buttonLevelId));
      button.classList.toggle("locked", !isLevelUnlocked(buttonLevelId));
    });

    const previous = document.getElementById("previousLevelButton");
    const next = document.getElementById("nextLevelButton");
    if (previous) previous.disabled = level.id <= 1;
    if (next) next.disabled = level.id >= LEVELS.length;

    modalContent.querySelector(`.level-dot[data-level-id="${level.id}"]`)?.scrollIntoView?.({
      behavior: "smooth", block: "nearest", inline: "center"
    });
  }

  function extractCombatGold() {
    const text = modalContent.textContent || "";
    const match = text.match(/(\d+)\s*pièces/i);
    return match ? normalizeInteger(match[1], 0, 0) : 0;
  }

  function ensureResultRun() {
    if (progression.activeRun) return progression.activeRun;
    const level = currentLevel();
    progression.activeRun = {
      id: `run-fallback-${Date.now()}`,
      levelId: level.id,
      startedAt: Date.now(),
      phase: "playing",
      victory: false,
      combatGold: 0,
      permanentGold: 0,
      chestType: level.chestType
    };
    saveProgression("fallback-run-created");
    return progression.activeRun;
  }

  function finalizeRun(victory) {
    const run = ensureResultRun();
    const level = levelById(run.levelId) || LEVELS[0];

    if (progression.rewardedRunIds.includes(run.id)) {
      progression.activeRun = null;
      saveProgression("duplicate-result-ignored");
      return {
        alreadyRewarded: true,
        victory,
        levelId: level.id,
        level,
        combatGold: run.combatGold,
        permanentGold: run.permanentGold,
        chestGranted: victory,
        chestLabel: level.chest
      };
    }

    if (run.phase === "playing") {
      run.victory = victory;
      run.combatGold = extractCombatGold();
      run.permanentGold = victory ? run.combatGold : Math.floor(run.combatGold * 0.25);
      run.chestType = level.chestType;
      run.phase = "result-detected";
      saveProgression("result-detected");
    }

    if (run.phase === "result-detected") {
      addGoldOnce(`run-gold:${run.id}`, run.permanentGold);
      run.phase = "gold-granted";
      saveProgression("run-gold-granted");
    }

    if (run.phase === "gold-granted" && run.victory) {
      const chestGranted = window.RightboundChests?.grant?.(
        run.chestType,
        1,
        `run-level-${level.id}-chest:${run.id}`
      );
      if (!chestGranted) {
        saveProgression("chest-grant-pending");
        return {
          pending: true,
          victory: true,
          levelId: level.id,
          level,
          combatGold: run.combatGold,
          permanentGold: run.permanentGold,
          chestGranted: false,
          chestLabel: level.chest
        };
      }
      run.phase = "chest-granted";
      saveProgression("run-chest-granted");
    }

    if (run.phase === "gold-granted" && !run.victory) run.phase = "chest-granted";

    if (run.phase === "chest-granted") {
      if (run.victory) {
        if (!progression.completedLevels.includes(level.id)) progression.completedLevels.push(level.id);
        progression.completedLevels.sort((a, b) => a - b);
        progression.unlockedLevel = Math.max(
          progression.unlockedLevel,
          Math.min(LEVELS.length, level.id + 1)
        );
        selectedLevelId = Math.min(LEVELS.length, level.id + 1);
        saveSelectedLevel();
      }

      progression.rewardedRunIds.push(run.id);
      progression.rewardedRunIds = progression.rewardedRunIds.slice(-MAX_REWARD_IDS);
      progression.activeRun = null;
      saveProgression(run.victory ? "victory-finalized" : "defeat-finalized");

      const result = {
        victory: run.victory,
        levelId: level.id,
        level,
        combatGold: run.combatGold,
        permanentGold: run.permanentGold,
        chestGranted: run.victory,
        chestType: level.chestType,
        chestLabel: level.chest,
        unlockedLevel: progression.unlockedLevel
      };
      document.dispatchEvent(new CustomEvent("rightbound:run-rewarded", { detail: result }));
      return result;
    }

    return {
      pending: true,
      victory: run.victory,
      levelId: level.id,
      level,
      combatGold: run.combatGold,
      permanentGold: run.permanentGold,
      chestGranted: false,
      chestLabel: level.chest
    };
  }

  function resumePendingRunReward() {
    if (!progression.activeRun || progression.activeRun.phase === "playing") return null;
    return finalizeRun(progression.activeRun.victory);
  }

  function renderMainMenu() {
    renderingMenu = true;
    economy = loadEconomy();
    progression = loadProgression();
    resumePendingRunReward();
    setMenuOverlayMode();
    overlay.classList.remove("hidden");
    const level = currentLevel();
    const unlocked = isLevelUnlocked(level.id);
    const completedCount = progression.completedLevels.length;

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
          <div class="level-scene-footer"><span>${WORLD.description}</span><strong id="selectedLevelFooter">${unlocked ? (isLevelCompleted(level.id) ? "Secteur terminé — rejouable" : "Secteur disponible") : "Secteur verrouillé"}</strong></div>
        </section>

        <section class="level-facts" aria-label="Informations du niveau">
          <article class="level-fact"><span class="level-fact-icon">⚡</span><div><small>Puissance conseillée</small><strong id="selectedLevelPower">${level.power}</strong></div></article>
          <article class="level-fact reward"><span class="level-fact-icon">▰</span><div><small>Récompense de victoire</small><strong id="selectedLevelChest">1 coffre ${level.chest}</strong></div></article>
        </section>

        <section class="level-selector" aria-label="Choix du niveau">
          <button type="button" class="level-arrow" id="previousLevelButton" aria-label="Niveau précédent">‹</button>
          <div class="level-track">${buildLevelDots()}</div>
          <button type="button" class="level-arrow" id="nextLevelButton" aria-label="Niveau suivant">›</button>
        </section>

        <section class="level-play-row">
          <span class="level-play-status" id="selectedLevelStatus">${unlocked ? (isLevelCompleted(level.id) ? "Rejouable" : "Disponible") : "À débloquer"}</span>
          <button type="button" class="level-play-button" id="playSelectedLevel" ${unlocked ? "" : "disabled"}>${unlocked ? "JOUER" : "VERROUILLÉ"}</button>
          <span class="level-play-reward" id="selectedLevelReward">▰ ×1 ${level.chest}</span>
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

  function addResultRewardSummary(result, restartButton) {
    if (!result || modalContent.querySelector(".run-result-rewards")) return;
    const summary = document.createElement("section");
    summary.className = `run-result-rewards ${result.victory ? "victory" : "defeat"}`;
    summary.innerHTML = result.victory
      ? `
        <div class="run-reward-row gold"><span>◉</span><div><small>GOLDS DE COMBAT</small><strong>+${formatGold(result.permanentGold)} golds</strong></div></div>
        <div class="run-reward-row chest"><span>▰</span><div><small>RÉCOMPENSE DU NIVEAU ${result.levelId}</small><strong>1 coffre ${result.chestLabel}</strong></div></div>`
      : `
        <div class="run-reward-row gold"><span>◉</span><div><small>25 % DES GOLDS CONSERVÉS</small><strong>+${formatGold(result.permanentGold)} golds</strong></div></div>
        <div class="run-reward-row lost"><span>×</span><div><small>AUCUN COFFRE</small><strong>Le niveau doit être terminé</strong></div></div>`;
    const actions = modalContent.querySelector(".end-menu-actions");
    if (actions) actions.before(summary);
    else restartButton.before(summary);
  }

  function decorateEndScreen(restartButton) {
    if (!restartButton || restartButton.dataset.gameDecorated === "true") return;
    restartButton.dataset.gameDecorated = "true";
    captureLaunchButton(restartButton);
    setDialogOverlayMode();

    const victory = (modalContent.querySelector("h2")?.textContent || "").includes("Secteur nettoyé");
    const result = finalizeRun(victory);
    const runLevelId = result?.levelId || selectedLevelId;

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
    restartButton.addEventListener("click", () => prepareRun(runLevelId), { capture: true, once: true });
    restartButton.parentNode.insertBefore(actions, restartButton);
    actions.append(backButton, restartButton);
    addResultRewardSummary(result, restartButton);
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
    if (event.key === ECONOMY_STORAGE_KEY) {
      economy = loadEconomy();
      updateGoldDisplay();
    }
    if (event.key === PROGRESSION_STORAGE_KEY) progression = loadProgression();
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
  document.addEventListener("rightbound:chests-changed", resumePendingRunReward);

  window.RightboundEconomy = Object.freeze({ getGold, setGold, addGold, addGoldOnce, spendGold });
  window.RightboundProgression = Object.freeze({
    levels: LEVELS,
    getState: getProgressionState,
    getSelectedLevel: currentLevel,
    isLevelUnlocked,
    isLevelCompleted,
    prepareRun,
    resumePendingRunReward
  });
  window.RightboundUI = Object.freeze({ renderMainMenu, showInstallHelp, showToast });

  positionFloatingHealth();
  updateFloatingHealth();
  syncFloatingHealthVisibility();
  inspectOverlayContent();
})();
