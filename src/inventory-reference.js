(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const detailByName = {
    "Casque du pisteur": "⌒",
    "Heaume de fer": "⌂",
    "Plastron du garde": "▣",
    "Lame ébréchée": "†",
    "Hache lourde": "⚒",
    "Relique du voyageur": "Ⅱ",
    "Bottes du rôdeur": "⌄",
    "Éclat azur": "◇",
    "Potion de soin": "✚",
    "Potion d’énergie": "◒",
    "Bombe artisanale": "●"
  };

  function applyApprovedLayout() {
    const screen = modalContent.querySelector(".inventory-screen");
    if (!screen || screen.dataset.referenceReady === "true") return;

    screen.dataset.referenceReady = "true";
    screen.classList.add("reference-inventory");

    const title = screen.querySelector(".inventory-title");
    if (title && !title.querySelector(".inventory-eyebrow")) {
      title.insertAdjacentHTML("afterbegin", '<span class="inventory-eyebrow">PRÉPARATION DU HÉROS</span>');
    }

    const header = screen.querySelector(".inventory-header");
    if (header && !screen.querySelector(".inventory-top-tabs")) {
      header.insertAdjacentHTML("afterend", `
        <nav class="inventory-top-tabs" aria-label="Sections de préparation">
          <button type="button" class="active">Inventaire</button>
          <button type="button" disabled>Compétences</button>
          <button type="button" id="referenceLevelsTab">Niveaux</button>
          <button type="button" id="referenceHelpTab">Aide</button>
        </nav>`);
    }

    const power = screen.querySelector(".inventory-power");
    if (power) {
      const syncPower = () => {
        const value = power.textContent.match(/\d+/)?.[0] || "0";
        power.dataset.score = value;
      };
      syncPower();
      new MutationObserver(syncPower).observe(power, { childList: true, characterData: true, subtree: true });
    }

    const labelMap = {
      "equip-weapon": "ARME",
      "equip-helmet": "CASQUE",
      "equip-chest": "PLASTRON",
      "equip-jewel": "ANNEAU",
      "equip-boots": "BOUCLIER",
      "equip-relic": "AMULETTE"
    };
    Object.entries(labelMap).forEach(([slotId, label]) => {
      const slot = screen.querySelector(`[data-slot="${slotId}"]`);
      if (slot) slot.dataset.label = label;
    });

    const sheet = screen.querySelector(".inventory-sheet");
    const dock = screen.querySelector(".inventory-dock");
    if (sheet && dock) {
      if (!sheet.querySelector(".reference-detail-icon")) {
        sheet.insertAdjacentHTML("afterbegin", '<div class="reference-detail-icon" aria-hidden="true">⚒</div>');
      }
      dock.before(sheet);
      sheet.classList.add("visible");
      sheet.setAttribute("aria-hidden", "false");

      const name = sheet.querySelector("#sheetName");
      const description = sheet.querySelector("#sheetDescription");
      const rarity = sheet.querySelector("#sheetRarity");
      if (name && !name.textContent) name.textContent = "Hache lourde";
      if (description && !description.textContent) description.textContent = "+10 dégâts";
      if (rarity && !rarity.textContent) rarity.textContent = "Inhabituel";
      updateDetailIcon(screen);
    }

    screen.querySelector("#referenceLevelsTab")?.addEventListener("click", () => {
      screen.querySelector("#inventoryMapButton")?.click();
    });
    screen.querySelector("#referenceHelpTab")?.addEventListener("click", () => {
      screen.querySelector("#inventoryHelpButton")?.click();
    });

    const sheetName = screen.querySelector("#sheetName");
    if (sheetName) {
      new MutationObserver(() => updateDetailIcon(screen)).observe(sheetName, { childList: true, characterData: true, subtree: true });
    }
  }

  function updateDetailIcon(screen) {
    const name = screen.querySelector("#sheetName")?.textContent?.trim();
    const icon = screen.querySelector(".reference-detail-icon");
    if (icon) icon.textContent = detailByName[name] || "◇";
  }

  new MutationObserver(() => requestAnimationFrame(applyApprovedLayout))
    .observe(modalContent, { childList: true, subtree: true });

  requestAnimationFrame(applyApprovedLayout);
})();
