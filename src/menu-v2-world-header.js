(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const VERSION = "0.28.0";
  let scheduled = false;

  function normalizeTitle(shell) {
    const title = shell.querySelector(".menu-v2-world-copy h1");
    if (!title || title.dataset.worldHeaderNormalized === "true") return;

    title.dataset.worldHeaderNormalized = "true";
    title.setAttribute("aria-label", "Les Faubourgs oubliés");
    title.innerHTML = `
      <span class="menu-v2-world-line">LES FAUBOURGS</span>
      <span class="menu-v2-world-line">OUBLIÉS</span>`;
  }

  function normalizeUtilities(shell) {
    const settings = shell.querySelector('[data-menu-v2-utility="settings"]');
    const journal = shell.querySelector('[data-menu-v2-utility="journal"]');

    if (settings) {
      settings.setAttribute("aria-label", "Ouvrir les options");
      const label = settings.querySelector(":scope > span:last-child");
      if (label && label.textContent !== "OPTIONS") label.textContent = "OPTIONS";
    }

    if (journal) {
      journal.setAttribute("aria-label", "Ouvrir le journal");
      const label = journal.querySelector(":scope > span:last-child");
      if (label && label.textContent !== "JOURNAL") label.textContent = "JOURNAL";
    }
  }

  function syncHeader() {
    const shell = modalContent.querySelector(".menu-v2-shell");
    if (!shell) return;

    shell.dataset.menuV2WorldHeader = VERSION;
    normalizeTitle(shell);
    normalizeUtilities(shell);
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncHeader();
    });
  }

  new MutationObserver(scheduleSync).observe(modalContent, {
    childList: true,
    subtree: true
  });

  window.addEventListener("resize", scheduleSync, { passive: true });

  window.RightboundMenuV2WorldHeader = Object.freeze({
    version: VERSION,
    refresh: scheduleSync
  });

  scheduleSync();
})();
