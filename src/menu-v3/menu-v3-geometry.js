(() => {
  "use strict";

  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const VERSION = "0.35.0-lot4";
  const TOLERANCE = 1.25;
  const TARGET_VIEWPORTS = Object.freeze([
    Object.freeze({ id:"360x780", width:360, height:780 }),
    Object.freeze({ id:"375x812", width:375, height:812 }),
    Object.freeze({ id:"390x844", width:390, height:844 }),
    Object.freeze({ id:"393x852", width:393, height:852 }),
    Object.freeze({ id:"430x932", width:430, height:932 })
  ]);
  const MODULES = Object.freeze([
    Object.freeze({ id:"topbar", selector:".menu-v3-topbar" }),
    Object.freeze({ id:"world-header", selector:".menu-v3-world-header" }),
    Object.freeze({ id:"stage-card", selector:".menu-v3-stage-card" }),
    Object.freeze({ id:"stage-heading", selector:".menu-v3-stage-heading" }),
    Object.freeze({ id:"stage-scene", selector:".menu-v3-stage-scene" }),
    Object.freeze({ id:"stage-stats", selector:".menu-v3-stage-stats" }),
    Object.freeze({ id:"level-selector", selector:".menu-v3-selector" }),
    Object.freeze({ id:"primary-action", selector:".menu-v3-action" }),
    Object.freeze({ id:"bottom-dock", selector:".menu-v3-dock" })
  ]);
  const TEXT_TARGETS = Object.freeze([
    ".menu-v3-profile-name",
    ".menu-v3-profile-level",
    ".menu-v3-xp-label",
    ".menu-v3-resource-value",
    ".menu-v3-utility-label",
    ".menu-v3-world-title-slot h1",
    ".menu-v3-stage-heading-copy strong",
    ".menu-v3-stage-heading-copy span",
    ".menu-v3-stage-badge",
    ".menu-v3-stat-copy span",
    ".menu-v3-stat-copy strong",
    ".menu-v3-selector-title",
    ".menu-v3-selector-legend span",
    ".menu-v3-play-copy strong",
    ".menu-v3-play-copy span",
    ".menu-v3-dock-label"
  ]);
  const COMPACT_TOUCH_EXCEPTIONS = Object.freeze([
    ".menu-v3-level-slot",
    ".menu-v3-resource-plus"
  ]);

  let scheduled = false;
  let lastReport = null;
  let resizeObserver = null;
  let observedShell = null;

  function round(value, precision = 1) {
    const factor = 10 ** precision;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function viewportSize() {
    const viewport = window.visualViewport;
    return {
      width:round(viewport?.width || window.innerWidth || document.documentElement.clientWidth, 1),
      height:round(viewport?.height || window.innerHeight || document.documentElement.clientHeight, 1),
      scale:round(viewport?.scale || 1, 2),
      dpr:round(window.devicePixelRatio || 1, 2)
    };
  }

  function nearestProfile(viewport) {
    return TARGET_VIEWPORTS.reduce((best, profile) => {
      const distance = Math.abs(profile.width - viewport.width) + Math.abs(profile.height - viewport.height);
      return !best || distance < best.distance ? { ...profile, distance:round(distance, 1) } : best;
    }, null);
  }

  function rectData(rect, shellRect) {
    return Object.freeze({
      x:round(rect.left - shellRect.left),
      y:round(rect.top - shellRect.top),
      width:round(rect.width),
      height:round(rect.height),
      right:round(rect.right - shellRect.left),
      bottom:round(rect.bottom - shellRect.top),
      ratio:rect.height > 0 ? round(rect.width / rect.height, 3) : 0,
      centerX:round(rect.left - shellRect.left + rect.width / 2),
      centerY:round(rect.top - shellRect.top + rect.height / 2)
    });
  }

  function isOutside(rect, shellRect) {
    return rect.left < shellRect.left - TOLERANCE ||
      rect.top < shellRect.top - TOLERANCE ||
      rect.right > shellRect.right + TOLERANCE ||
      rect.bottom > shellRect.bottom + TOLERANCE;
  }

  function hasInternalOverflow(node) {
    return node.scrollWidth - node.clientWidth > TOLERANCE || node.scrollHeight - node.clientHeight > TOLERANCE;
  }

  function parseAnchor(value = "50% 50%") {
    const parts = String(value).trim().split(/\s+/);
    const x = Number.parseFloat(parts[0]) || 50;
    const y = Number.parseFloat(parts[1] ?? parts[0]) || 50;
    return { x:Math.max(0, Math.min(100, x)), y:Math.max(0, Math.min(100, y)) };
  }

  function ensureOverlay(shell) {
    let overlay = shell.querySelector(":scope > .menu-v3-geometry-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "menu-v3-geometry-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML = `
        <span class="menu-v3-safe-area menu-v3-safe-area-top"></span>
        <span class="menu-v3-safe-area menu-v3-safe-area-bottom"></span>
        <span class="menu-v3-geometry-axis menu-v3-geometry-axis-x"></span>
        <span class="menu-v3-geometry-axis menu-v3-geometry-axis-y"></span>
        <output class="menu-v3-geometry-status"></output>
        <div class="menu-v3-geometry-tags"></div>`;
      shell.append(overlay);
    }
    return overlay;
  }

  function clearGeometryMarks(shell, overlay) {
    shell.querySelectorAll("[data-v3-geometry-id]").forEach((node) => {
      delete node.dataset.v3GeometryId;
      delete node.dataset.v3GeometryOverflow;
      delete node.dataset.v3GeometryOutside;
    });
    overlay.querySelector(".menu-v3-geometry-tags")?.replaceChildren();
  }

  function addTag(tags, record, kind, anchor = null) {
    const tag = document.createElement("span");
    tag.className = `menu-v3-geometry-tag is-${kind}`;
    tag.style.left = `${record.rect.x}px`;
    tag.style.top = `${record.rect.y}px`;
    tag.style.maxWidth = `${Math.max(42, record.rect.width)}px`;
    tag.textContent = kind === "asset"
      ? `${record.id} · ${record.rect.width}×${record.rect.height} · ${record.mode}`
      : `${record.id} · ${record.rect.width}×${record.rect.height}`;
    tags.append(tag);

    const marker = document.createElement("i");
    marker.className = `menu-v3-geometry-marker is-${kind}`;
    marker.style.left = `${anchor ? record.rect.x + record.rect.width * anchor.x / 100 : record.rect.centerX}px`;
    marker.style.top = `${anchor ? record.rect.y + record.rect.height * anchor.y / 100 : record.rect.centerY}px`;
    marker.title = anchor ? `${record.id} — ancre ${anchor.x}% ${anchor.y}%` : `${record.id} — centre`;
    tags.append(marker);
  }

  function measureModule(shell, shellRect, definition, tags, issues) {
    const node = shell.querySelector(definition.selector);
    if (!node) {
      issues.push({ severity:"error", code:"module-missing", target:definition.id });
      return null;
    }

    const rect = node.getBoundingClientRect();
    const outside = isOutside(rect, shellRect);
    const overflow = hasInternalOverflow(node);
    const zeroSized = rect.width < 1 || rect.height < 1;
    node.dataset.v3GeometryId = definition.id;
    node.dataset.v3GeometryOverflow = String(overflow);
    node.dataset.v3GeometryOutside = String(outside);

    if (outside) issues.push({ severity:"error", code:"module-outside-shell", target:definition.id });
    if (overflow) issues.push({ severity:"error", code:"module-overflow", target:definition.id });
    if (zeroSized) issues.push({ severity:"error", code:"module-zero-size", target:definition.id });

    const record = Object.freeze({ id:definition.id, rect:rectData(rect, shellRect), overflow, outside, zeroSized });
    addTag(tags, record, "module");
    return record;
  }

  function measureAsset(node, shellRect, tags, issues) {
    const id = node.dataset.v3AssetSlot || "unknown-asset";
    const mode = node.dataset.v3AssetMode || "contain";
    const anchor = parseAnchor(node.dataset.v3AssetAnchor);
    const rect = node.getBoundingClientRect();
    const outside = isOutside(rect, shellRect);
    const zeroSized = rect.width < 1 || rect.height < 1;
    node.dataset.v3GeometryId = `asset:${id}`;
    node.dataset.v3GeometryOutside = String(outside);

    if (outside) issues.push({ severity:"error", code:"asset-slot-outside-shell", target:id });
    if (zeroSized) issues.push({ severity:"error", code:"asset-slot-zero-size", target:id });

    const record = Object.freeze({
      id,
      mode,
      anchor:Object.freeze(anchor),
      rect:rectData(rect, shellRect),
      outside,
      zeroSized
    });
    addTag(tags, record, "asset", anchor);
    return record;
  }

  function measureText(shell, issues) {
    const results = [];
    TEXT_TARGETS.forEach((selector) => {
      shell.querySelectorAll(selector).forEach((node, index) => {
        const overflow = node.scrollWidth - node.clientWidth > TOLERANCE || node.scrollHeight - node.clientHeight > TOLERANCE;
        if (!overflow) return;
        const id = `${selector}:${index}`;
        results.push(id);
        issues.push({ severity:"warning", code:"text-overflow", target:id });
        node.dataset.v3GeometryOverflow = "true";
      });
    });
    return Object.freeze(results);
  }

  function measureTouchTargets(shell, issues) {
    const compact = (node) => COMPACT_TOUCH_EXCEPTIONS.some((selector) => node.matches(selector));
    return Object.freeze([...shell.querySelectorAll("button")].map((node) => {
      const rect = node.getBoundingClientRect();
      const exception = compact(node);
      const valid = rect.width + TOLERANCE >= 44 && rect.height + TOLERANCE >= 44;
      if (!valid && !exception) {
        issues.push({ severity:"warning", code:"touch-target-under-44", target:node.getAttribute("aria-label") || node.className });
      }
      return Object.freeze({
        target:node.getAttribute("aria-label") || node.dataset.v3Dock || node.dataset.v3Level || node.className,
        width:round(rect.width),
        height:round(rect.height),
        valid,
        compactException:exception
      });
    }));
  }

  function measureSafeAreas(overlay) {
    const top = overlay.querySelector(".menu-v3-safe-area-top")?.getBoundingClientRect().height || 0;
    const bottom = overlay.querySelector(".menu-v3-safe-area-bottom")?.getBoundingClientRect().height || 0;
    return Object.freeze({ top:round(top), bottom:round(bottom) });
  }

  function updateStatus(shell, overlay, report) {
    shell.dataset.v3Geometry = VERSION;
    shell.dataset.v3GeometryStatus = report.status;
    shell.dataset.v3GeometryProfile = report.profile.id;
    shell.dataset.v3GeometryIssues = String(report.issues.length);
    shell.style.setProperty("--menu-v3-safe-top-measured", `${report.safeArea.top}px`);
    shell.style.setProperty("--menu-v3-safe-bottom-measured", `${report.safeArea.bottom}px`);

    const status = overlay.querySelector(".menu-v3-geometry-status");
    if (status) {
      status.dataset.status = report.status;
      status.textContent = `LOT 4 · ${report.status.toLocaleUpperCase("fr-FR")} · ${report.viewport.width}×${report.viewport.height} · ${report.issues.length} anomalie${report.issues.length > 1 ? "s" : ""}`;
    }
  }

  function measure() {
    scheduled = false;
    const shell = modalContent.querySelector(".menu-v3-shell.menu-v3-components-ready");
    if (!shell) return null;

    observeShell(shell);
    const overlay = ensureOverlay(shell);
    clearGeometryMarks(shell, overlay);
    const tags = overlay.querySelector(".menu-v3-geometry-tags");
    const issues = [];
    const shellRect = shell.getBoundingClientRect();
    const viewport = viewportSize();
    const profile = nearestProfile(viewport);

    const shellOverflow = hasInternalOverflow(shell);
    if (shellOverflow) issues.push({ severity:"error", code:"shell-overflow", target:"menu-v3-shell" });
    if (shellRect.width > 430 + TOLERANCE) issues.push({ severity:"error", code:"shell-over-max-width", target:round(shellRect.width) });
    if (Math.abs(shellRect.height - viewport.height) > 2.5) {
      issues.push({ severity:"warning", code:"shell-viewport-height-mismatch", target:`${round(shellRect.height)} / ${viewport.height}` });
    }

    const modules = MODULES.map((definition) => measureModule(shell, shellRect, definition, tags, issues)).filter(Boolean);
    const assets = [...shell.querySelectorAll("[data-v3-asset-slot]")]
      .map((node) => measureAsset(node, shellRect, tags, issues));
    const textOverflows = measureText(shell, issues);
    const touchTargets = measureTouchTargets(shell, issues);
    const safeArea = measureSafeAreas(overlay);

    const errorCount = issues.filter((issue) => issue.severity === "error").length;
    const warningCount = issues.filter((issue) => issue.severity === "warning").length;
    const status = errorCount > 0 ? "fail" : warningCount > 0 ? "warning" : "pass";

    const report = Object.freeze({
      version:VERSION,
      generatedAt:new Date().toISOString(),
      status,
      viewport:Object.freeze(viewport),
      profile:Object.freeze(profile),
      shell:Object.freeze({ ...rectData(shellRect, shellRect), overflow:shellOverflow }),
      safeArea,
      modules:Object.freeze(modules),
      assets:Object.freeze(assets),
      textOverflows,
      touchTargets,
      issues:Object.freeze(issues.map((issue) => Object.freeze(issue)))
    });

    lastReport = report;
    updateStatus(shell, overlay, report);
    document.dispatchEvent(new CustomEvent("rightbound:menu-v3-geometry-checked", { detail:report }));
    return report;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(measure));
  }

  function observeShell(shell) {
    if (observedShell === shell) return;
    resizeObserver?.disconnect();
    observedShell = shell;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(shell);
      MODULES.forEach(({ selector }) => {
        const node = shell.querySelector(selector);
        if (node) resizeObserver.observe(node);
      });
    }

    new MutationObserver((records) => {
      if (records.some((record) => record.attributeName === "class")) schedule();
    }).observe(shell, { attributes:true, attributeFilter:["class"] });
  }

  new MutationObserver(schedule).observe(modalContent, { childList:true, subtree:false });
  document.addEventListener("rightbound:menu-v3-sync-complete", schedule);
  document.addEventListener("rightbound:menu-v3-data-bound", schedule);
  window.addEventListener("resize", schedule, { passive:true });
  window.addEventListener("orientationchange", schedule, { passive:true });
  window.visualViewport?.addEventListener("resize", schedule, { passive:true });
  document.fonts?.ready?.then(schedule).catch(() => {});

  window.RightboundMenuV3Geometry = Object.freeze({
    version:VERSION,
    targetViewports:TARGET_VIEWPORTS,
    measure,
    refresh:schedule,
    getReport:() => lastReport,
    exportReport:() => JSON.stringify(lastReport, null, 2),
    setDebug(enabled) {
      window.RightboundMenuV3?.setDebug?.(Boolean(enabled));
      schedule();
      return Boolean(enabled);
    }
  });

  schedule();
})();
