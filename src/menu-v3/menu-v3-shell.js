(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) {
    console.error("[Rightbound] Menu V3: conteneur modal introuvable.");
    return;
  }

  const VERSION = "0.30.4-lot1-final";
  const DEBUG_STORAGE_KEY = "rightbound-menu-v3-debug";
  let scheduled = false;
  let debugEnabled = localStorage.getItem(DEBUG_STORAGE_KEY) !== "false";

  function legacyMenu() {
    return modalContent.querySelector(".menu-v2-shell");
  }

  function toast(message) {
    window.RightboundUI?.showToast?.(message);
  }

  function moduleLabel(name) {
    return `data-v3-module="${name}"`;
  }

  function levelSlots() {
    return Array.from({ length: 10 }, (_, index) => {
      const level = index + 1;
      return `<button type="button" class="menu-v3-level-slot" data-v3-level="${level}" aria-label="Niveau ${level}">${level}</button>`;
    }).join("");
  }

  function dockSlot(key, label) {
    return `
      <button type="button" class="menu-v3-dock-slot" data-v3-dock="${key}" aria-label="${label}">
        <span class="menu-v3-dock-icon" aria-hidden="true"></span>
        <span>${label}</span>
      </button>`;
  }

  function buildShell() {
    const shell = document.createElement("section");
    shell.className = `game-menu menu-v3-shell${debugEnabled ? " menu-v3-debug" : ""}`;
    shell.dataset.menuV3 = VERSION;
    shell.setAttribute("aria-label", "Prototype structurel du Menu V3");
    shell.innerHTML = `
      <header class="menu-v3-zone menu-v3-topbar" ${moduleLabel("01 · TOP BAR")}>
        <section class="menu-v3-profile-slot" aria-label="Profil du héros">
          <div class="menu-v3-profile-avatar" aria-hidden="true"></div>
          <div class="menu-v3-profile-copy">
            <strong>JACK</strong>
            <span>NIV. 1</span>
            <div class="menu-v3-profile-xp" aria-label="Expérience">0 / 150 XP</div>
          </div>
        </section>
        <section class="menu-v3-resource-track" aria-label="Ressources">
          <div class="menu-v3-resource-slot"><span>G</span><strong>0</strong><button type="button" aria-label="Ajouter des golds">+</button></div>
          <div class="menu-v3-resource-slot"><span>◆</span><strong>0</strong><button type="button" aria-label="Ajouter des gemmes">+</button></div>
          <div class="menu-v3-resource-slot"><span>ϟ</span><strong>0</strong><button type="button" aria-label="Ajouter de l’énergie">+</button></div>
        </section>
      </header>

      <section class="menu-v3-zone menu-v3-world-header" ${moduleLabel("02 · EN-TÊTE MONDE")}>
        <button type="button" class="menu-v3-utility-slot" data-v3-utility="options">
          <span aria-hidden="true">⚙</span>
          <span>OPTIONS</span>
        </button>
        <div class="menu-v3-world-title-slot">
          <div class="menu-v3-world-ribbon">MONDE 1</div>
          <h1><span>LES FAUBOURGS</span><span>OUBLIÉS</span></h1>
        </div>
        <button type="button" class="menu-v3-utility-slot" data-v3-utility="journal">
          <span aria-hidden="true">▣</span>
          <span>JOURNAL</span>
        </button>
      </section>

      <section class="menu-v3-zone menu-v3-stage-card" ${moduleLabel("03 · CARTE PRINCIPALE")}>
        <header class="menu-v3-stage-heading">
          <div class="menu-v3-stage-heading-copy">
            <span>NIVEAU 1 / 10</span>
            <strong>ENTRÉE DES RUINES</strong>
          </div>
          <div class="menu-v3-stage-badge">SUPÉRIEUR</div>
        </header>
        <div class="menu-v3-stage-scene" aria-label="Zone réservée au décor et à Jack"></div>
        <footer class="menu-v3-stage-stats">
          <article class="menu-v3-stat-slot">
            <div class="menu-v3-stat-icon" aria-hidden="true"></div>
            <div class="menu-v3-stat-copy">
              <span>PUISSANCE CONSEILLÉE</span>
              <strong>30</strong>
              <span>Votre puissance : 44</span>
            </div>
          </article>
          <article class="menu-v3-stat-slot">
            <div class="menu-v3-stat-icon" aria-hidden="true"></div>
            <div class="menu-v3-stat-copy">
              <span>RÉCOMPENSE DE VICTOIRE</span>
              <strong>1 COFFRE BRONZE</strong>
            </div>
          </article>
        </footer>
      </section>

      <section class="menu-v3-zone menu-v3-selector" ${moduleLabel("04 · SÉLECTION NIVEAU")}>
        <div class="menu-v3-selector-title">SÉLECTION DU NIVEAU</div>
        <div class="menu-v3-level-track">${levelSlots()}</div>
        <div class="menu-v3-selector-legend"><span>✓ TERMINÉ</span><span>ÉLITE</span><span>BOSS</span><span>🔒 VERROUILLÉ</span></div>
      </section>

      <section class="menu-v3-zone menu-v3-action" ${moduleLabel("05 · ACTION PRINCIPALE")}>
        <button type="button" class="menu-v3-play-slot" data-v3-action="play">
          <span aria-hidden="true">⚔</span>
          <span class="menu-v3-play-copy"><strong>JOUER</strong><span>LANCER L’EXPÉDITION</span></span>
          <span>ϟ 10</span>
        </button>
      </section>

      <nav class="menu-v3-zone menu-v3-dock" ${moduleLabel("06 · NAVIGATION")} aria-label="Navigation principale">
        ${dockSlot("expedition", "EXPÉDITION")}
        ${dockSlot("equipment", "ÉQUIPEMENT")}
        ${dockSlot("chests", "COFFRES")}
        ${dockSlot("shop", "BOUTIQUE")}
      </nav>`;

    shell.querySelectorAll("[data-v3-level]").forEach((button) => {
      button.addEventListener("click", () => {
        const source = legacyMenu();
        source?.querySelector(`[data-menu-v2-level="${button.dataset.v3Level}"]`)?.click();
        scheduleSync();
      });
    });

    shell.querySelector('[data-v3-action="play"]')?.addEventListener("click", () => {
      const source = legacyMenu();
      const play = source?.querySelector('[data-menu-v2-action="play"], #playSelectedLevel');
      if (play && !play.disabled) play.click();
      else toast("Ce niveau n’est pas encore disponible.");
    });

    shell.querySelectorAll("[data-v3-utility]").forEach((button) => {
      button.addEventListener("click", () => toast(`Le module ${button.dataset.v3Utility} sera construit au Lot 2.`));
    });

    shell.querySelectorAll("[data-v3-dock]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.v3Dock === "expedition") return;
        toast(`L’onglet ${button.textContent.trim()} sera connecté au Lot 3.`);
      });
    });

    shell.querySelectorAll(".menu-v3-resource-slot button").forEach((button) => {
      button.addEventListener("click", () => toast("Les ressources seront connectées au Lot 3."));
    });

    return shell;
  }

  function ensureShell(source) {
    let shell = modalContent.querySelector(".menu-v3-shell");
    if (!shell || shell.dataset.menuV3 !== VERSION) {
      shell?.remove();
      shell = buildShell();
      source.before(shell);
    }
    shell.classList.toggle("menu-v3-debug", debugEnabled);
    return shell;
  }

  function syncFromLegacy(shell, source) {
    source.setAttribute("aria-hidden", "true");

    const selected = source.querySelector("[data-menu-v2-level].selected");
    const selectedId = Number(selected?.dataset.menuV2Level || 1);
    shell.querySelectorAll("[data-v3-level]").forEach((node) => {
      node.classList.toggle("selected", Number(node.dataset.v3Level) === selectedId);
    });

    const sourcePlay = source.querySelector('[data-menu-v2-action="play"], #playSelectedLevel');
    const play = shell.querySelector('[data-v3-action="play"]');
    if (play) {
      play.disabled = Boolean(sourcePlay?.disabled);
      play.setAttribute("aria-disabled", play.disabled ? "true" : "false");
    }
  }

  function removeShell() {
    modalContent.querySelector(".menu-v3-shell")?.remove();
    document.body.classList.remove("menu-v3-active");
  }

  function sync() {
    const source = legacyMenu();
    if (!source) {
      removeShell();
      return;
    }

    document.body.classList.add("menu-v3-active");
    const shell = ensureShell(source);
    syncFromLegacy(shell, source);
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  }

  const observer = new MutationObserver(scheduleSync);
  observer.observe(modalContent, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:["class", "disabled"]
  });

  window.addEventListener("resize", scheduleSync, { passive:true });
  window.addEventListener("orientationchange", scheduleSync, { passive:true });

  window.RightboundMenuV3 = Object.freeze({
    version:VERSION,
    refresh:scheduleSync,
    getShell:() => modalContent.querySelector(".menu-v3-shell"),
    setDebug(enabled) {
      debugEnabled = Boolean(enabled);
      localStorage.setItem(DEBUG_STORAGE_KEY, String(debugEnabled));
      modalContent.querySelector(".menu-v3-shell")?.classList.toggle("menu-v3-debug", debugEnabled);
      return debugEnabled;
    },
    isDebugEnabled:() => debugEnabled
  });

  scheduleSync();
})();
