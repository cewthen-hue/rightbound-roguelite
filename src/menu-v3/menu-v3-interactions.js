(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const VERSION = "0.33.0-lot3.3";
  let scheduled = false;

  function toast(message, duration) {
    window.RightboundUI?.showToast?.(message, duration);
  }

  function legacyMenu() {
    return modalContent.querySelector(".menu-v2-shell");
  }

  function getSnapshot() {
    return window.RightboundMenuV3Data?.getSnapshot?.() || null;
  }

  function pulse() {
    navigator.vibrate?.(8);
  }

  function proxyLevelSelection(levelId) {
    const source = legacyMenu();
    const target = source?.querySelector(`[data-menu-v2-level="${levelId}"]`);
    if (!target) {
      toast("La sélection du niveau est encore en cours de chargement.");
      return false;
    }
    target.click();
    window.RightboundMenuV3Data?.refresh?.();
    scheduleSync();
    return true;
  }

  function launchSelectedLevel() {
    const snapshot = getSnapshot();
    const level = snapshot?.level;
    if (!level) {
      toast("Le niveau est encore en cours de chargement.");
      return false;
    }
    if (!level.unlocked) {
      toast("Termine le niveau précédent pour débloquer ce secteur.", 3200);
      return false;
    }

    const source = legacyMenu();
    const sourcePlay = source?.querySelector('[data-menu-v2-action="play"], #playSelectedLevel');
    if (!sourcePlay || sourcePlay.disabled) {
      toast("Le niveau est encore en cours de chargement.");
      return false;
    }

    pulse();
    sourcePlay.click();
    return true;
  }

  function openEquipment() {
    if (typeof window.RightboundInventory?.renderInventory === "function") {
      pulse();
      window.RightboundInventory.renderInventory();
      return;
    }
    toast("L’équipement est encore en cours de chargement.");
  }

  function openChests() {
    if (typeof window.RightboundChests?.render === "function") {
      pulse();
      window.RightboundChests.render();
      return;
    }
    toast("Les coffres sont encore en cours de chargement.");
  }

  function openShop() {
    pulse();
    toast("La boutique sera construite dans un prochain chantier.", 3000);
  }

  function handleDockAction(key) {
    if (key === "expedition") return;
    if (key === "equipment") return openEquipment();
    if (key === "chests") return openChests();
    if (key === "shop") return openShop();
  }

  function handleUtilityAction(key) {
    if (key === "options") {
      window.RightboundUI?.showInstallHelp?.();
      if (!window.RightboundUI?.showInstallHelp) toast("Les options seront ajoutées prochainement.");
      return;
    }
    if (key === "journal") toast("Le journal d’expédition sera ajouté prochainement.");
  }

  function handleResourceAction(type) {
    if (type === "gold") toast("La boutique de golds sera ajoutée avec la boutique.");
    else if (type === "gems") toast("Le système de gemmes sera ajouté ultérieurement.");
    else toast("Le système d’énergie sera ajouté ultérieurement.");
  }

  function bindShell(shell) {
    if (!shell || shell.dataset.menuV3Interactions === VERSION) return;

    shell.querySelectorAll("[data-v3-level]").forEach((button) => {
      button.addEventListener("click", () => {
        pulse();
        proxyLevelSelection(Number(button.dataset.v3Level));
      });
    });

    shell.querySelector('[data-v3-action="play"]')?.addEventListener("click", launchSelectedLevel);

    shell.querySelectorAll("[data-v3-dock]").forEach((button) => {
      button.addEventListener("click", () => handleDockAction(button.dataset.v3Dock));
    });

    shell.querySelectorAll("[data-v3-utility]").forEach((button) => {
      button.addEventListener("click", () => handleUtilityAction(button.dataset.v3Utility));
    });

    shell.querySelectorAll(".menu-v3-resource-slot").forEach((slot) => {
      slot.querySelector("button")?.addEventListener("click", () => handleResourceAction(slot.dataset.resource));
    });

    shell.dataset.menuV3Interactions = VERSION;
  }

  function setText(node, value) {
    const next = String(value);
    if (node && node.textContent !== next) node.textContent = next;
  }

  function syncPlayButton(shell, snapshot) {
    const play = shell.querySelector('[data-v3-action="play"]');
    const title = play?.querySelector(".menu-v3-play-copy strong");
    const subtitle = play?.querySelector(".menu-v3-play-copy span");
    const icon = play?.querySelector(".menu-v3-play-icon");
    const cost = play?.querySelector(".menu-v3-play-cost");
    const level = snapshot?.level;
    if (!play || !level) return;

    const state = !level.unlocked ? "locked" : level.completed ? "completed" : "available";
    if (play.dataset.playState !== state) play.dataset.playState = state;

    if (state === "locked") {
      play.disabled = true;
      setText(title, "VERROUILLÉ");
      setText(subtitle, level.id > 1 ? `TERMINE LE NIVEAU ${level.id - 1}` : "NIVEAU INDISPONIBLE");
      setText(icon, "▣");
      if (cost) cost.hidden = true;
      play.setAttribute("aria-label", `Niveau ${level.id} verrouillé. Termine le niveau précédent.`);
      return;
    }

    play.disabled = false;
    setText(icon, "⚔");
    if (cost) cost.hidden = false;

    if (state === "completed") {
      setText(title, "REJOUER");
      setText(subtitle, "RELANCER L’EXPÉDITION");
      play.setAttribute("aria-label", `Rejouer le niveau ${level.id}, ${level.name}`);
    } else {
      setText(title, "JOUER");
      setText(subtitle, "LANCER L’EXPÉDITION");
      play.setAttribute("aria-label", `Jouer le niveau ${level.id}, ${level.name}`);
    }
  }

  function syncDock(shell) {
    shell.querySelectorAll("[data-v3-dock]").forEach((button) => {
      const active = button.dataset.v3Dock === "expedition";
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    const chests = window.RightboundChests?.getState?.();
    const total = Number(chests?.total) || 0;
    const notification = shell.querySelector('[data-v3-dock="chests"] .menu-v3-dock-notification');
    if (notification) {
      notification.hidden = total <= 0;
      notification.textContent = total > 99 ? "99+" : total > 0 ? String(total) : "";
      notification.setAttribute("aria-label", `${total} coffre${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`);
    }
  }

  function sync() {
    scheduled = false;
    const shell = modalContent.querySelector(".menu-v3-shell.menu-v3-components-ready");
    if (!shell) return;
    bindShell(shell);
    const snapshot = getSnapshot();
    syncPlayButton(shell, snapshot);
    syncDock(shell);
    if (shell.dataset.menuV3InteractionsReady !== VERSION) shell.dataset.menuV3InteractionsReady = VERSION;
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  new MutationObserver(scheduleSync).observe(modalContent, { childList:true, subtree:true });

  [
    "rightbound:menu-v3-synced",
    "rightbound:progression-changed",
    "rightbound:run-rewarded",
    "rightbound:chests-changed",
    "rightbound:chests-ready",
    "rightbound:profile-changed",
    "rightbound:build-changed"
  ].forEach((eventName) => document.addEventListener(eventName, scheduleSync));

  window.RightboundMenuV3Interactions = Object.freeze({
    version:VERSION,
    refresh:scheduleSync,
    launchSelectedLevel,
    openEquipment,
    openChests
  });

  scheduleSync();
})();
