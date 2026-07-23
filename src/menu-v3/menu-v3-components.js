(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const VERSION = "0.31.0-lot2";
  let scheduled = false;

  const resourceTypes = ["gold", "gems", "energy"];
  const resourceGlyphs = {
    gold:"●",
    gems:"◆",
    energy:"ϟ"
  };

  const dockGlyphs = {
    expedition:"⌖",
    equipment:"⚔",
    chests:"▰",
    shop:"▦"
  };

  function decorateProfile(shell) {
    const avatar = shell.querySelector(".menu-v3-profile-avatar");
    if (avatar && !avatar.querySelector(".menu-v3-avatar-art")) {
      avatar.innerHTML = `
        <span class="menu-v3-avatar-art" aria-hidden="true">
          <i class="menu-v3-avatar-hair"></i>
          <i class="menu-v3-avatar-face"></i>
          <i class="menu-v3-avatar-body"></i>
        </span>`;
    }

    const copy = shell.querySelector(".menu-v3-profile-copy");
    if (copy) {
      copy.querySelector(":scope > strong")?.classList.add("menu-v3-profile-name");
      copy.querySelector(":scope > span")?.classList.add("menu-v3-profile-level");
    }

    const xp = shell.querySelector(".menu-v3-profile-xp");
    if (xp && !xp.querySelector(".menu-v3-xp-meter")) {
      const label = xp.textContent.trim();
      xp.innerHTML = `
        <span class="menu-v3-xp-label">${label}</span>
        <span class="menu-v3-xp-meter" aria-hidden="true"><i style="--menu-v3-xp-progress:8%"></i></span>`;
    }
  }

  function decorateResources(shell) {
    shell.querySelectorAll(".menu-v3-resource-slot").forEach((slot, index) => {
      const type = resourceTypes[index] || "gold";
      slot.dataset.resource = type;

      const icon = slot.querySelector(":scope > span");
      const value = slot.querySelector(":scope > strong");
      const plus = slot.querySelector(":scope > button");

      if (icon) {
        icon.className = "menu-v3-resource-icon";
        icon.textContent = resourceGlyphs[type];
      }
      value?.classList.add("menu-v3-resource-value");
      plus?.classList.add("menu-v3-resource-plus");
    });
  }

  function decorateUtilities(shell) {
    shell.querySelectorAll(".menu-v3-utility-slot").forEach((button) => {
      const icon = button.querySelector(":scope > span:first-child");
      const label = button.querySelector(":scope > span:nth-child(2)");
      icon?.classList.add("menu-v3-utility-icon");
      label?.classList.add("menu-v3-utility-label");

      if (button.dataset.v3Utility === "journal" && !button.querySelector(".menu-v3-notification")) {
        button.insertAdjacentHTML("beforeend", '<span class="menu-v3-notification" aria-label="Nouveau"></span>');
      }
    });
  }

  function decorateStage(shell) {
    const scene = shell.querySelector(".menu-v3-stage-scene");
    if (scene && !scene.querySelector(".menu-v3-scene-art")) {
      scene.innerHTML = `
        <div class="menu-v3-scene-art" aria-hidden="true">
          <span class="menu-v3-scene-sun"></span>
          <span class="menu-v3-scene-cloud menu-v3-scene-cloud-a"></span>
          <span class="menu-v3-scene-cloud menu-v3-scene-cloud-b"></span>
          <span class="menu-v3-scene-building menu-v3-scene-building-left"></span>
          <span class="menu-v3-scene-building menu-v3-scene-building-right"></span>
          <span class="menu-v3-scene-tower"></span>
          <span class="menu-v3-scene-arch"></span>
          <span class="menu-v3-scene-road"></span>
          <span class="menu-v3-css-hero">
            <i class="menu-v3-css-hero-head"></i>
            <i class="menu-v3-css-hero-body"></i>
            <i class="menu-v3-css-hero-arm menu-v3-css-hero-arm-left"></i>
            <i class="menu-v3-css-hero-arm menu-v3-css-hero-arm-right"></i>
            <i class="menu-v3-css-hero-leg menu-v3-css-hero-leg-left"></i>
            <i class="menu-v3-css-hero-leg menu-v3-css-hero-leg-right"></i>
            <i class="menu-v3-css-hero-sword"></i>
          </span>
        </div>`;
    }

    shell.querySelectorAll(".menu-v3-stat-slot").forEach((panel, index) => {
      panel.dataset.stat = index === 0 ? "power" : "reward";
      const icon = panel.querySelector(".menu-v3-stat-icon");
      if (icon) {
        icon.dataset.icon = index === 0 ? "shield" : "chest";
        icon.setAttribute("aria-hidden", "true");
      }
    });
  }

  function decorateLevels(shell) {
    shell.querySelectorAll(".menu-v3-level-slot").forEach((node) => {
      const level = Number(node.dataset.v3Level || 1);
      node.dataset.levelType = level === 5 ? "elite" : level === 10 ? "boss" : "normal";
      node.dataset.levelState = level <= 2 ? "completed" : level === 3 ? "available" : "locked";

      if (!node.querySelector(".menu-v3-node-number")) {
        node.innerHTML = `
          <span class="menu-v3-node-number">${level}</span>
          <span class="menu-v3-node-status" aria-hidden="true"></span>`;
      }
    });

    const legend = shell.querySelector(".menu-v3-selector-legend");
    if (legend && !legend.dataset.componentsReady) {
      legend.dataset.componentsReady = "true";
      legend.innerHTML = `
        <span data-legend="completed"><i aria-hidden="true">✓</i>TERMINÉ</span>
        <span data-legend="elite"><i aria-hidden="true">✦</i>ÉLITE</span>
        <span data-legend="boss"><i aria-hidden="true">♜</i>BOSS</span>
        <span data-legend="locked"><i aria-hidden="true">▣</i>VERROUILLÉ</span>`;
    }
  }

  function decoratePlay(shell) {
    const play = shell.querySelector(".menu-v3-play-slot");
    if (!play) return;

    const icon = play.querySelector(":scope > span:first-child");
    const cost = play.querySelector(":scope > span:last-child");
    icon?.classList.add("menu-v3-play-icon");
    cost?.classList.add("menu-v3-play-cost");
  }

  function decorateDock(shell) {
    shell.querySelectorAll(".menu-v3-dock-slot").forEach((button) => {
      const key = button.dataset.v3Dock || "expedition";
      const icon = button.querySelector(".menu-v3-dock-icon");
      const label = button.querySelector(":scope > span:nth-child(2)");

      if (icon) {
        icon.textContent = dockGlyphs[key] || "•";
        icon.dataset.icon = key;
      }
      label?.classList.add("menu-v3-dock-label");

      button.classList.toggle("is-active", key === "expedition");
      if (key === "expedition") button.setAttribute("aria-current", "page");

      if (key === "chests" && !button.querySelector(".menu-v3-notification")) {
        button.insertAdjacentHTML("beforeend", '<span class="menu-v3-notification menu-v3-dock-notification" aria-label="Nouveau"></span>');
      }
    });
  }

  function enhance(shell) {
    if (!shell || shell.dataset.menuV3Components === VERSION) return;

    decorateProfile(shell);
    decorateResources(shell);
    decorateUtilities(shell);
    decorateStage(shell);
    decorateLevels(shell);
    decoratePlay(shell);
    decorateDock(shell);

    shell.dataset.menuV3Components = VERSION;
    shell.classList.add("menu-v3-components-ready");
  }

  function sync() {
    scheduled = false;
    enhance(modalContent.querySelector(".menu-v3-shell"));
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(modalContent, { childList:true, subtree:true });

  window.RightboundMenuV3Components = Object.freeze({
    version:VERSION,
    refresh:schedule
  });

  schedule();
})();
