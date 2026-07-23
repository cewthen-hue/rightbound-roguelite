(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const VERSION = "0.27.0";
  let scheduled = false;

  function syncTopbar() {
    const shell = modalContent.querySelector(".menu-v2-shell");
    if (!shell) return;

    shell.dataset.menuV2Topbar = VERSION;

    const gems = shell.querySelector('[data-menu-v2-value="gems"]');
    const energy = shell.querySelector('[data-menu-v2-value="energy"]');
    if (gems && gems.textContent !== "0") gems.textContent = "0";
    if (energy && energy.textContent !== "0") energy.textContent = "0";

    const xp = shell.querySelector(".menu-v2-xp");
    const xpText = xp?.querySelector("strong");
    if (xp) {
      xp.setAttribute("aria-valuemin", "0");
      xp.setAttribute("aria-valuemax", "150");
      xp.setAttribute("aria-valuenow", "0");
    }
    if (xpText && xpText.textContent !== "0 / 150 XP") xpText.textContent = "0 / 150 XP";
  }

  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncTopbar();
    });
  }

  new MutationObserver(scheduleSync).observe(modalContent, {
    childList: true,
    subtree: true
  });

  document.addEventListener("rightbound:economy-changed", scheduleSync);
  window.addEventListener("resize", scheduleSync, { passive: true });

  window.RightboundMenuV2Topbar = Object.freeze({
    version: VERSION,
    refresh: scheduleSync
  });

  scheduleSync();
})();
