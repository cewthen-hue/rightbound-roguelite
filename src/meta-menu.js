(() => {
  "use strict";

  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");
  const gameZone = document.getElementById("gameZone");
  const hpFill = document.getElementById("hpFill");
  const jumpButton = document.getElementById("jumpButton");

  const STAGES = [
    { id: 1, name: "Faubourgs oubliés", icon: "🏚️", accessible: true },
    { id: 2, name: "Voie industrielle", icon: "🏭", accessible: false },
    { id: 3, name: "Forêt contaminée", icon: "🌲", accessible: false },
    { id: 4, name: "Quartier noyé", icon: "🌊", accessible: false },
    { id: 5, name: "Citadelle rouge", icon: "🏰", accessible: false },
    { id: 6, name: "Secteur inconnu", icon: "❓", accessible: false }
  ];

  let launchAction = null;
  let renderingMenu = false;
  let levelOneCompleted = false;

  try {
    levelOneCompleted = localStorage.getItem("rightbound-level-1-completed") === "true";
  } catch {
    levelOneCompleted = false;
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
      const status = completed ? "Terminé" : stage.accessible ? "Disponible" : "Verrouillé";
      const classes = ["stage-node", stage.accessible ? "unlocked" : "locked"];
      if (completed) classes.push("completed");

      return `
        <button
          class="${classes.join(" ")}"
          data-stage="${stage.id}"
          ${stage.accessible ? "" : "disabled"}
          aria-label="${stage.accessible ? `Jouer le niveau ${stage.id}` : `Niveau ${stage.id} verrouillé`}">
          <span class="stage-status">${status}</span>
          <span class="stage-icon">${stage.accessible ? stage.icon : "🔒"}</span>
          <span class="stage-number">NIVEAU ${stage.id}</span>
          <span class="stage-name">${stage.name}</span>
          ${completed ? '<span class="stage-stars">★ ★ ★</span>' : ""}
        </button>
      `;
    }).join("");
  }

  function startLevelOne() {
    if (typeof launchAction !== "function") return;
    launchAction();
  }

  function renderMainMenu() {
    renderingMenu = true;
    setMenuOverlayMode();
    overlay.classList.remove("hidden");

    modalContent.innerHTML = `
      <div class="menu-header">
        <div>
          <div class="eyebrow">EXPÉDITION</div>
          <h1>RIGHTBOUND</h1>
          <p class="menu-subtitle">Choisis un secteur et prépare ton expédition.</p>
        </div>
        <div class="profile-badge">
          <span class="profile-level">1</span>
          <span>Profil</span>
        </div>
      </div>

      <section class="stage-map" aria-label="Carte des niveaux">
        <div class="map-title-row">
          <div>
            <span class="map-kicker">CHAPITRE 1</span>
            <h2>Les territoires perdus</h2>
          </div>
          <span class="map-progress">${levelOneCompleted ? "1" : "0"} / ${STAGES.length}</span>
        </div>
        <div class="map-path" aria-hidden="true"></div>
        <div class="stage-grid">${buildStageNodes()}</div>
      </section>

      <section class="selected-stage-card">
        <div class="selected-stage-top">
          <span class="selected-stage-icon">🏚️</span>
          <div>
            <span class="selected-stage-label">NIVEAU 1</span>
            <h3>Faubourgs oubliés</h3>
          </div>
          <span class="difficulty">NORMAL</span>
        </div>
        <div class="stage-details">
          <span>⚔️ 7 ennemis + 1 élite</span>
          <span>👹 Gardien du secteur</span>
          <span>⏱️ Environ 2 min</span>
        </div>
        <button class="primary play-stage-button" id="playStageOne">JOUER LE NIVEAU 1</button>
      </section>

      <nav class="menu-tabs" aria-label="Sections futures">
        <button disabled><span>🎒</span>Équipement<small>Bientôt</small></button>
        <button disabled><span>✨</span>Compétences<small>Bientôt</small></button>
        <button class="active"><span>🗺️</span>Niveaux<small>Actif</small></button>
      </nav>
    `;

    document.getElementById("playStageOne").addEventListener("click", startLevelOne);
    modalContent.querySelector('[data-stage="1"]').addEventListener("click", startLevelOne);

    requestAnimationFrame(() => {
      renderingMenu = false;
      syncFloatingHealthVisibility();
    });
  }

  function decorateEndScreen(restartButton) {
    if (!restartButton || restartButton.dataset.mapDecorated === "true") return;

    restartButton.dataset.mapDecorated = "true";
    captureLaunchButton(restartButton);
    setDialogOverlayMode();

    const title = modalContent.querySelector("h2")?.textContent || "";
    if (title.includes("Secteur nettoyé")) {
      levelOneCompleted = true;
      try {
        localStorage.setItem("rightbound-level-1-completed", "true");
      } catch {
        // La progression reste visible pendant cette session.
      }
    }

    const actions = document.createElement("div");
    actions.className = "end-menu-actions";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "secondary";
    backButton.textContent = "Retour à la carte";
    backButton.addEventListener("click", renderMainMenu);

    restartButton.classList.add("end-restart-button");
    restartButton.parentNode.insertBefore(actions, restartButton);
    actions.append(backButton, restartButton);
  }

  function inspectOverlayContent() {
    if (renderingMenu) return;

    const firstStartButton = document.getElementById("startButton");
    if (firstStartButton) {
      captureLaunchButton(firstStartButton);
      renderMainMenu();
      return;
    }

    const restartButton = document.getElementById("restartButton");
    if (restartButton) {
      decorateEndScreen(restartButton);
      return;
    }

    if (modalContent.querySelector(".upgrade-card")) {
      setDialogOverlayMode();
    }
  }

  const floatingHealth = document.createElement("div");
  floatingHealth.id = "playerFloatingHp";
  floatingHealth.setAttribute("aria-hidden", "true");
  floatingHealth.innerHTML = '<span class="floating-hp-fill"></span>';
  gameZone.appendChild(floatingHealth);

  const floatingHealthFill = floatingHealth.querySelector(".floating-hp-fill");

  function updateFloatingHealth() {
    const widthValue = hpFill.style.width || "100%";
    const ratio = Number.parseFloat(widthValue) || 0;
    floatingHealthFill.style.width = widthValue;
    floatingHealth.classList.toggle("low", ratio <= 35);
  }

  function positionFloatingHealth() {
    const rect = gameZone.getBoundingClientRect();
    const playerX = Math.max(75, Math.min(105, rect.width * 0.23));
    const playerY = rect.height * 0.80;
    floatingHealth.style.left = `${playerX - 37}px`;
    floatingHealth.style.top = `${playerY - 78}px`;
  }

  function syncFloatingHealthVisibility() {
    floatingHealth.classList.toggle("visible", overlay.classList.contains("hidden"));
  }

  const contentObserver = new MutationObserver(() => {
    requestAnimationFrame(inspectOverlayContent);
  });
  contentObserver.observe(modalContent, { childList: true, subtree: true });

  const overlayObserver = new MutationObserver(syncFloatingHealthVisibility);
  overlayObserver.observe(overlay, { attributes: true, attributeFilter: ["class"] });

  const hpObserver = new MutationObserver(updateFloatingHealth);
  hpObserver.observe(hpFill, { attributes: true, attributeFilter: ["style"] });

  window.addEventListener("resize", positionFloatingHealth, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(positionFloatingHealth, 120), { passive: true });

  jumpButton.addEventListener("click", () => {
    if (jumpButton.disabled) return;
    floatingHealth.classList.remove("jumping");
    void floatingHealth.offsetWidth;
    floatingHealth.classList.add("jumping");
    setTimeout(() => floatingHealth.classList.remove("jumping"), 760);
  }, { capture: true });

  positionFloatingHealth();
  updateFloatingHealth();
  syncFloatingHealthVisibility();
  inspectOverlayContent();
})();
