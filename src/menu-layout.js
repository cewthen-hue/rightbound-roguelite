(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  const assetSystem = window.RightboundMenuAssets;
  if (!modalContent || !assetSystem) return;

  let scheduled = false;
  let syncing = false;

  function iconMarkup(kind) {
    const icons = {
      settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V21h-4v-.1a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1-2.8-2.8.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 14H3v-4h.1a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2l-.1-.1L7 4.1l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 3V3h4v.1a1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1L20 7l-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 10h.1v4H21a1.8 1.8 0 0 0-1.6 1Z"/></svg>',
      journal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4Z"/><path d="m4 7 8 6 8-6"/></svg>',
      inventory: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l2 13H4L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M8 13h8"/></svg>',
      skills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3Z"/><path d="M8 3v18M11 8h5M11 12h5"/></svg>',
      levels: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z"/><path d="M8 4v13M16 7v13"/><circle cx="13" cy="11" r="1.5"/></svg>',
      chests: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4Z"/><path d="M3 7h18v4H3Z"/><path d="M8 7V5h8v2M12 11v9"/></svg>'
    };
    return icons[kind] || "";
  }

  function createUtilityButton(id, kind, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = id;
    button.className = `premium-utility-button ${kind}`;
    button.innerHTML = `<span class="premium-utility-icon">${iconMarkup(kind)}</span><small>${label}</small>`;
    return button;
  }

  function enhanceProfile(root) {
    const profile = root.querySelector(".level-profile");
    if (!profile || profile.dataset.enhanced === "true") return;
    profile.dataset.enhanced = "true";
    profile.innerHTML = `
      <div class="premium-profile-portrait" id="premiumHeroPortrait" aria-hidden="true">
        <span class="portrait-fallback"><i></i><b>J</b></span>
      </div>
      <div class="premium-profile-copy">
        <strong>JACK</strong>
        <div class="premium-profile-progress-row">
          <span>PROGRESSION</span>
          <div class="premium-profile-progress"><i id="premiumProfileProgressFill"></i></div>
          <b id="premiumProfileProgressText">0/10</b>
        </div>
      </div>`;
  }

  function enhanceCurrencies(root) {
    const gold = root.querySelector(".level-gold");
    const power = root.querySelector(".level-power");
    if (gold && !gold.querySelector(".resource-label")) {
      gold.insertAdjacentHTML("afterbegin", '<span class="resource-label">GOLDS</span>');
    }
    if (power && !power.querySelector(".resource-label")) {
      power.insertAdjacentHTML("afterbegin", '<span class="resource-label">PUISSANCE</span>');
    }
  }

  function enhanceWorldHeading(root) {
    const heading = root.querySelector(".world-heading");
    if (!heading || heading.dataset.enhanced === "true") return;
    heading.dataset.enhanced = "true";
    const copy = heading.querySelector(".world-heading-copy");
    const progress = heading.querySelector(".world-progress");
    const settings = createUtilityButton("premiumSettingsButton", "settings", "PARAMÈTRES");
    const journal = createUtilityButton("premiumJournalButton", "journal", "JOURNAL");

    if (copy && progress) copy.appendChild(progress);
    heading.prepend(settings);
    heading.append(journal);

    settings.addEventListener("click", () => window.RightboundUI?.showInstallHelp?.());
    journal.addEventListener("click", () => window.RightboundUI?.showToast?.("Le journal d’expédition sera ajouté plus tard."));
  }

  function enhanceStage(root) {
    const showcase = root.querySelector(".level-showcase");
    if (!showcase || showcase.dataset.enhanced === "true") return;
    showcase.dataset.enhanced = "true";

    const assets = document.createElement("div");
    assets.className = "premium-stage-assets";
    assets.setAttribute("aria-hidden", "true");
    assets.innerHTML = `
      <div class="premium-stage-background" id="premiumStageBackground"></div>
      <div class="premium-stage-atmosphere" id="premiumStageAtmosphere"></div>
      <div class="premium-stage-hero-asset" id="premiumStageHeroAsset"></div>
      <div class="premium-stage-frame-asset" id="premiumStageFrameAsset"></div>`;
    showcase.prepend(assets);

    const footer = showcase.querySelector(".level-scene-footer");
    if (footer) {
      footer.insertAdjacentHTML("afterbegin", '<span class="stage-location-kicker">ZONE ACTIVE</span>');
    }
  }

  function enhanceFacts(root) {
    const facts = root.querySelectorAll(".level-fact");
    if (!facts.length) return;
    const powerFact = facts[0];
    const rewardFact = facts[1];
    if (powerFact && powerFact.dataset.enhanced !== "true") {
      powerFact.dataset.enhanced = "true";
      powerFact.querySelector(".level-fact-icon")?.classList.add("power-visual");
    }
    if (rewardFact && rewardFact.dataset.enhanced !== "true") {
      rewardFact.dataset.enhanced = "true";
      const icon = rewardFact.querySelector(".level-fact-icon");
      if (icon) {
        icon.textContent = "";
        icon.id = "premiumRewardChest";
        icon.classList.add("reward-chest-visual");
      }
    }
  }

  function enhanceSelector(root) {
    const selector = root.querySelector(".level-selector");
    if (!selector || selector.dataset.enhanced === "true") return;
    selector.dataset.enhanced = "true";
    const legend = document.createElement("div");
    legend.className = "premium-level-legend";
    legend.innerHTML = `
      <span><i class="legend-check">✓</i>Terminé</span>
      <span><i class="legend-elite">◆</i>Élite</span>
      <span><i class="legend-boss">☠</i>Boss</span>
      <span><i class="legend-lock">▣</i>Verrouillé</span>`;
    selector.after(legend);
  }

  function enhancePlayRow(root) {
    const row = root.querySelector(".level-play-row");
    const button = root.querySelector("#playSelectedLevel");
    if (!row || !button || row.dataset.enhanced === "true") return;
    row.dataset.enhanced = "true";
    button.insertAdjacentHTML("beforeend", '<small class="premium-play-subtitle">LANCER L’EXPÉDITION</small>');
  }

  function prepareDockButton(button, kind, label, active = false) {
    if (!button) return;
    button.classList.toggle("active", active);
    button.dataset.dockKind = kind;
    button.innerHTML = `<span class="premium-dock-icon" data-nav-asset="${kind}">${iconMarkup(kind)}</span><span>${label}</span>`;
  }

  function enhanceDock(root) {
    const dock = root.querySelector(".game-dock");
    if (!dock || dock.dataset.enhanced === "true") return;
    dock.dataset.enhanced = "true";
    const buttons = [...dock.querySelectorAll(".dock-button")];
    const inventory = buttons[0];
    const skills = buttons[1];
    const levels = buttons[2];
    const chests = buttons[3];

    if (inventory) {
      inventory.disabled = false;
      inventory.id = "dockInventoryButton";
      prepareDockButton(inventory, "inventory", "Inventaire");
      inventory.addEventListener("click", () => window.RightboundInventory?.renderInventory?.());
    }
    if (skills) {
      skills.disabled = true;
      prepareDockButton(skills, "skills", "Compétences");
    }
    if (levels) prepareDockButton(levels, "levels", "Niveaux", true);
    if (chests) {
      chests.id = "dockSettingsButton";
      prepareDockButton(chests, "chests", "Coffres");
    }
  }

  function enhance(root) {
    if (!root || root.dataset.premiumLayout === "true") return;
    root.dataset.premiumLayout = "true";
    root.classList.add("premium-level-menu");
    enhanceProfile(root);
    enhanceCurrencies(root);
    enhanceWorldHeading(root);
    enhanceStage(root);
    enhanceFacts(root);
    enhanceSelector(root);
    enhancePlayRow(root);
    enhanceDock(root);
  }

  function bindStaticAssets(root) {
    assetSystem.bindBackground(root.querySelector("#premiumHeroPortrait"), "heroPortrait", { size: "cover", position: "center top" });
    assetSystem.bindBackground(root.querySelector("#premiumStageBackground"), "worldBackground", { size: "cover", position: "center" });
    assetSystem.bindBackground(root.querySelector("#premiumStageAtmosphere"), "worldAtmosphere", { size: "cover", position: "center" });
    assetSystem.bindBackground(root.querySelector("#premiumStageHeroAsset"), "heroStage", { size: "contain", position: "center bottom" });
    assetSystem.bindBackground(root.querySelector("#premiumStageFrameAsset"), "stageFrame", { size: "100% 100%", position: "center" });
    assetSystem.bindBackground(root.querySelector(".level-card-header"), "levelPlaque", { size: "100% 100%", position: "center" });
    assetSystem.bindBackground(root.querySelector("#playSelectedLevel"), "playButton", { size: "100% 100%", position: "center" });
    assetSystem.bindBackground(root.querySelector('[data-nav-asset="inventory"]'), "navInventory");
    assetSystem.bindBackground(root.querySelector('[data-nav-asset="skills"]'), "navSkills");
    assetSystem.bindBackground(root.querySelector('[data-nav-asset="levels"]'), "navLevels");
    assetSystem.bindBackground(root.querySelector('[data-nav-asset="chests"]'), "navChests");
  }

  function syncProfile(root) {
    const progression = window.RightboundProgression?.getState?.();
    const completed = progression?.completedLevels?.length || 0;
    const total = window.RightboundProgression?.levels?.length || 10;
    const fill = root.querySelector("#premiumProfileProgressFill");
    const text = root.querySelector("#premiumProfileProgressText");
    if (fill) fill.style.width = `${Math.max(0, Math.min(100, completed / total * 100))}%`;
    if (text) text.textContent = `${completed}/${total}`;
  }

  function syncLevelNodes(root) {
    const levels = window.RightboundProgression?.levels || [];
    root.querySelectorAll(".level-dot").forEach((node) => {
      const id = Number(node.dataset.levelId);
      const level = levels.find((entry) => entry.id === id);
      const key = assetSystem.nodeKey(level, {
        locked: node.classList.contains("locked"),
        selected: node.classList.contains("selected"),
        completed: node.classList.contains("completed")
      });
      assetSystem.bindBackground(node, key, { size: "100% 100%" });
    });
  }

  function syncSelectedLevel(root) {
    const level = window.RightboundProgression?.getSelectedLevel?.();
    if (!level) return;
    root.dataset.levelType = level.type;
    root.dataset.chestType = level.chestType;
    const showcase = root.querySelector(".level-showcase");
    if (showcase) showcase.dataset.type = level.type;
    const chest = root.querySelector("#premiumRewardChest");
    if (chest) {
      chest.dataset.chestType = level.chestType;
      assetSystem.bindBackground(chest, assetSystem.chestKey(level.chestType), { size: "contain" });
    }
    const button = root.querySelector("#playSelectedLevel");
    if (button) {
      const key = button.disabled ? "playButtonLocked" : "playButton";
      assetSystem.bindBackground(button, key, { size: "100% 100%" });
    }
  }

  function sync() {
    if (syncing) return;
    syncing = true;
    try {
      const root = modalContent.querySelector(".game-menu.level-menu");
      if (!root) return;
      enhance(root);
      bindStaticAssets(root);
      syncProfile(root);
      syncSelectedLevel(root);
      syncLevelNodes(root);
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
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "disabled"]
  });

  document.addEventListener("rightbound:progression-changed", scheduleSync);
  document.addEventListener("rightbound:build-changed", scheduleSync);
  document.addEventListener("rightbound:chests-changed", scheduleSync);
  window.addEventListener("resize", scheduleSync, { passive: true });

  scheduleSync();
})();
