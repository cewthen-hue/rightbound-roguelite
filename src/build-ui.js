(() => {
  "use strict";

  const build = window.RightboundBuild;
  const modalContent = document.getElementById("modalContent");
  if (!build || !modalContent) return;

  let scheduled = false;
  let updating = false;

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      updateBuildUi();
    });
  }

  function setText(node, value) {
    if (node && node.textContent !== String(value)) node.textContent = String(value);
  }

  function currentLevel() {
    return window.RightboundProgression?.getSelectedLevel?.() || null;
  }

  function updateLevelMenu() {
    const power = build.getPowerScore();
    const powerValue = modalContent.querySelector(".level-power strong");
    setText(powerValue, power);

    const level = currentLevel();
    const recommendedNode = document.getElementById("selectedLevelPower");
    if (!level || !recommendedNode) return;

    const readiness = build.getReadiness(level.power);
    const fact = recommendedNode.closest(".level-fact");
    const playButton = document.getElementById("playSelectedLevel");

    if (fact) {
      fact.dataset.readiness = readiness.key;
      let note = fact.querySelector(".build-readiness");
      if (!note) {
        note = document.createElement("span");
        note.className = "build-readiness";
        recommendedNode.parentElement?.appendChild(note);
      }
      if (note) setText(note, `Votre puissance : ${readiness.power} · ${readiness.label}`);
    }

    if (playButton) {
      playButton.dataset.readiness = readiness.key;
      playButton.title = readiness.key === "danger"
        ? `Puissance recommandée : ${readiness.recommended}. Le niveau reste jouable.`
        : `Votre puissance : ${readiness.power}. Recommandée : ${readiness.recommended}.`;
    }
  }

  function updateInventory() {
    const raw = build.getRawStats();
    setText(document.getElementById("inventoryDamage"), Math.round(raw.damage));
    setText(document.getElementById("inventoryArmor"), Math.round(raw.armor));
    setText(document.getElementById("inventoryHp"), Math.round(raw.hp));
    setText(document.getElementById("inventoryPower"), build.getPowerScore());
  }

  function updateBuildUi() {
    if (updating) return;
    updating = true;
    try {
      updateLevelMenu();
      updateInventory();
      document.body.dataset.buildPower = String(build.getPowerScore());
    } finally {
      updating = false;
    }
  }

  new MutationObserver(scheduleUpdate).observe(modalContent, {
    childList: true,
    subtree: true,
    characterData: true
  });

  document.addEventListener("rightbound:build-changed", scheduleUpdate);
  document.addEventListener("rightbound:progression-changed", scheduleUpdate);
  document.addEventListener("rightbound:combat-loadout-applied", (event) => {
    const detail = event.detail;
    if (!detail) return;
    document.body.dataset.combatLevel = String(detail.levelId || 1);
    document.body.dataset.combatPower = String(detail.build?.powerScore || build.getPowerScore());
  });

  scheduleUpdate();
})();
