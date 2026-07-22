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
    button.innerHTML = `<span class="premium-utility-icon" data-utility-asset="${kind}">${iconMarkup(kind)}</span><small>${label}</small>`;
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
          <span>MONDE 1</span>
          <div class="premium-profile-progress"><i id="premiumProfileProgressFill"></i></div>
          <b id="premiumProfileProgressText">0/10</b>
        </div>
      </div>`;
  }

  function enhanceCurrencies(root) {
    const gold = root.querySelector(".level-gold");
    const power = root.querySelector(".level-power");
    gold?.querySelectorAll(".resource-label").forEach((node) => node.remove());
    power?.querySelectorAll(".resource-label").forEach((node) => node.remove());

    const goldIcon = gold?.querySelector("i");
    if (goldIcon) goldIcon.dataset.resourceAsset = "gold";
  }

  function enhanceWorldHeading(root) {
    const heading = root.querySelector(".world-heading");
    if (!heading || heading.dataset.enhanced === "true") return;
    heading.dataset.enhanced = "true";
    const copy = heading.querySelector(".world-heading-copy");
    const progress = heading.querySelector(".world-progress");
    const settings = createUtilityButton("premiumSettingsButton", "settings", "OPTIONS");
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

    showcase.querySelector(".level-scene-skyline")?.remove();
    showcase.querySelector(".level-hero")?.remove();
    showcase.querySelector(".level-hero-platform")?.remove();

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
    if (footer && !footer.querySelector(".stage-location-kicker")) {
      footer.insertAdjacentHTML("afterbegin", '<span class="stage-location-kicker">ZONE ACTIVE</span>');
    }
  }

  function enhanceFacts(root) {
    const factsPanel = root.querySelector(".level-facts");
    const facts = root.querySelectorAll(".level-fact");
    if (!factsPanel || !facts.length) return;
    factsPanel.classList.add("menu-full-info-panel");

    const powerFact = facts[0];
    const rewardFact = facts[1];
    if (powerFact && powerFact.dataset.enhanced !== "true") {
      powerFact.dataset.enhanced = "true";
      const icon = powerFact.querySelector(".level-fact-icon");
      if (icon) {
        icon.textContent = "";
        icon.id = "premiumPowerInfo";
        icon.classList.add("power-visual");
      }
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
    if (!selector) return;
    selector.querySelector("#previousLevelButton")?.setAttribute("data-arrow-asset", "left");
    selector.querySelector("#nextLevelButton")?.setAttribute("data-arrow-asset", "right");
    if (selector.dataset.enhanced === "true") return;
    selector.dataset.enhanced = "true";

    const legend = document.createElement("div");
    legend.className = "premium-level-legend";
    legend.innerHTML = `
      <span><i data-legend-asset="check"></i>Terminé</span>
      <span><i data-legend-asset="elite"></i>Élite</span>
      <span><i data-legend-asset="boss"></i>Boss</span>
      <span><i data-legend-asset="lock"></i>Verrouillé</span>`;
    selector.after(legend);
  }

  function ensurePlaySubtitle(button) {
    if (!button) return null;
    let subtitle = button.querySelector(".premium-play-subtitle");
    if (!subtitle) {
      subtitle = document.createElement("small");
      subtitle.className = "premium-play-subtitle";
      button.appendChild(subtitle);
    }
    subtitle.textContent = button.disabled ? "TERMINE LE NIVEAU PRÉCÉDENT" : "LANCER L’EXPÉDITION";
    return subtitle;
  }

  function enhancePlayRow(root) {
    const row = root.querySelector(".level-play-row");
    const button = root.querySelector("#playSelectedLevel");
    if (!row || !button) return;
    ensurePlaySubtitle(button);
    if (row.dataset.enhanced === "true") return;
    row.dataset.enhanced = "true";

    button.addEventListener("pointerdown", () => {
      if (!button.disabled) assetSystem.bindBackground(button, "playButtonPressed", { size: "100% 100%" });
    });
    const restore = () => {
      const key = button.disabled ? "playButtonLocked" : "playButton";
      assetSystem.bindBackground(button, key, { size: "100% 100%" });
    };
    button.addEventListener("pointerup", restore);
    button.addEventListener("pointercancel", restore);
    button.addEventListener("pointerleave", restore);
  }

  function prepareDockButton(button, kind, label, active = false) {
    if (!button) return;
    button.classList.toggle("active", active);
    button.dataset.dockKind = kind;
    button.innerHTML = `<span class="premium-dock-icon" data-nav-asset="${kind}">${iconMarkup(kind)}</span><span>${label}</span>`;
  }

  function enhanceDock(root) {
    const dock = root.querySelector(".game-dock");
    if (!dock) return;
    const buttons = [...dock.querySelectorAll(".dock-button")];

    if (dock.dataset.enhanced !== "true") {
      dock.dataset.enhanced = "true";
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

    const chestButton = dock.querySelector("#dockChestsButton");
    if (chestButton && !chestButton.querySelector('[data-nav-asset="chests"]')) {
      const badge = chestButton.querySelector(".chest-dock-badge");
      const badgeText = badge?.textContent || "0";
      const badgeVisible = badge?.classList.contains("visible");
      chestButton.dataset.dockKind = "chests";
      chestButton.innerHTML = `<span class="premium-dock-icon" data-nav-asset="chests">${iconMarkup("chests")}</span><span>Coffres</span><b class="chest-dock-badge${badgeVisible ? " visible" : ""}" aria-label="Coffres disponibles">${badgeText}</b>`;
    }
  }

  function enhance(root) {
    if (!root) return;
    root.classList.add("premium-level-menu", "menu-full-assets");
    enhanceProfile(root);
    enhanceCurrencies(root);
    enhanceWorldHeading(root);
    enhanceStage(root);
    enhanceFacts(root);
    enhanceSelector(root);
    enhancePlayRow(root);
    enhanceDock(root);
    root.dataset.premiumLayout = "true";
  }

  function bindStaticAssets(root) {
    assetSystem.bindBackground(root.querySelector("#premiumHeroPortrait"), "heroPortrait", { size: "cover", position: "center top" });
    assetSystem.bindBackground(root.querySelector("#premiumStageBackground"), "worldBackground", { size: "cover", position: "center" });
    assetSystem.bindBackground(root.querySelector("#premiumStageAtmosphere"), "worldAtmosphere", { size: "cover", position: "center" });
    assetSystem.bindBackground(root.querySelector("#premiumStageHeroAsset"), "heroStage", { size: "contain", position: "center bottom" });
    assetSystem.bindBackground(root.querySelector("#premiumStageFrameAsset"), "stageFrame", { size: "100% 100%", position: "center" });
    assetSystem.bindBackground(root.querySelector(".level-card-header"), "levelPlaque", { size: "100% 100%", position: "center" });
    assetSystem.bindBackground(root.querySelector(".level-facts"), "infoPanel", { size: "100% 100%" });
    assetSystem.bindBackground(root.querySelector("#premiumPowerInfo"), "iconInfo", { size: "contain" });

    root.querySelectorAll(".premium-utility-button").forEach((button) => {
      assetSystem.bindBackground(button, "utilityButton", { size: "100% 100%" });
    });
    assetSystem.bindBackground(root.querySelector('[data-utility-asset="settings"]'), "iconSettings");
    assetSystem.bindBackground(root.querySelector('[data-utility-asset="journal"]'), "iconJournal");

    assetSystem.bindBackground(root.querySelector('[data-arrow-asset="left"]'), "arrowLeft", { size: "100% 100%" });
    assetSystem.bindBackground(root.querySelector('[data-arrow-asset="right"]'), "arrowRight", { size: "100% 100%" });

    assetSystem.bindBackground(root.querySelector('[data-legend-asset="check"]'), "iconCheck");
    assetSystem.bindBackground(root.querySelector('[data-legend-asset="elite"]'), "iconElite");
    assetSystem.bindBackground(root.querySelector('[data-legend-asset="boss"]'), "iconBoss");
    assetSystem.bindBackground(root.querySelector('[data-legend-asset="lock"]'), "iconLock");

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
      const state = {
        locked: node.classList.contains("locked"),
        selected: node.classList.contains("selected"),
        completed: node.classList.contains("completed")
      };
      assetSystem.bindBackground(node, assetSystem.nodeKey(level, state), { size: "100% 100%" });

      let status = node.querySelector(".node-status-icon");
      if (!status) {
        status = document.createElement("span");
        status.className = "node-status-icon";
        status.setAttribute("aria-hidden", "true");
        node.appendChild(status);
      }

      let statusKey = null;
      if (state.completed) statusKey = "iconCheck";
      else if (state.locked) statusKey = "iconLock";
      else if (level?.type === "boss") statusKey = "iconBoss";
      else if (level?.type === "elite") statusKey = "iconElite";

      status.hidden = !statusKey;
      if (statusKey) assetSystem.bindBackground(status, statusKey, { size: "contain" });
      else assetSystem.clearBackground(status);
    });
  }

  function syncDockAssets(root) {
    const dock = root.querySelector(".game-dock");
    if (!dock) return;
    assetSystem.bindBackground(dock, "bottomDockFrame", { size: "100% 100%" });
    dock.querySelectorAll(".dock-button, .chest-dock-button").forEach((button) => {
      assetSystem.bindBackground(button, button.classList.contains("active") ? "dockButtonActive" : "dockButton", { size: "100% 100%" });
    });
    assetSystem.bindBackground(root.querySelector('[data-nav-asset="chests"]'), "navChests");
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
      ensurePlaySubtitle(button);
      const key = button.disabled ? "playButtonLocked" : "playButton";
      assetSystem.bindBackground(button, key, { size: "100% 100%" });
    }
  }

  function syncChestScreen(screen) {
    if (!screen) return;
    screen.classList.add("menu-full-chest-assets");
    assetSystem.bindBackground(screen.querySelector(".chest-gold-balance i"), "iconGold", { size: "contain" });

    screen.querySelectorAll("[data-chest-card]").forEach((card) => {
      const type = card.dataset.chestCard;
      const art = card.querySelector(".chest-art");
      if (art) assetSystem.bindBackground(art, assetSystem.chestKey(type), { size: "contain" });
    });

    const dock = screen.querySelector(".chest-dock");
    if (dock) {
      assetSystem.bindBackground(dock, "bottomDockFrame", { size: "100% 100%" });
      const iconKeys = ["navInventory", "navSkills", "navLevels", "navChests"];
      [...dock.querySelectorAll("button")].forEach((button, index) => {
        assetSystem.bindBackground(button, button.classList.contains("active") ? "dockButtonActive" : "dockButton", { size: "100% 100%" });
        const icon = button.querySelector("span");
        if (icon && iconKeys[index]) assetSystem.bindBackground(icon, iconKeys[index], { size: "contain" });
      });
    }
  }

  function sync() {
    if (syncing) return;
    syncing = true;
    try {
      const root = modalContent.querySelector(".game-menu.level-menu");
      if (root) {
        enhance(root);
        bindStaticAssets(root);
        syncProfile(root);
        syncSelectedLevel(root);
        syncLevelNodes(root);
        syncDockAssets(root);
      }
      syncChestScreen(modalContent.querySelector(".chest-screen"));
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