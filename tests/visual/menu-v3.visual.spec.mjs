import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const matrix = JSON.parse(fs.readFileSync(new URL("../menu-v3-visual-profiles.json", import.meta.url), "utf8"));
const artifactsRoot = path.resolve("artifacts/menu-v3-visual");

function artifactPath(projectName, suffix) {
  const safeName = projectName.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  return path.join(artifactsRoot, `${safeName}-${suffix}`);
}

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function seedDeterministicState(page) {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("rightbound-economy-v1", JSON.stringify({
      gold:2010,
      appliedRewardIds:[]
    }));
    localStorage.setItem("rightbound-progression-v2", JSON.stringify({
      schemaVersion:2,
      unlockedLevel:10,
      completedLevels:[1,2,3,4,5,6,7,8,9],
      nextRunSerial:1,
      activeRun:null,
      rewardedRunIds:[]
    }));
    localStorage.setItem("rightbound-selected-level-v1", "10");
    localStorage.setItem("rightbound-hero-progression-v1", JSON.stringify({
      schemaVersion:1,
      level:1,
      xp:0
    }));
    localStorage.setItem("rightbound-menu-v3-debug", "false");
  });
}

async function forceStressBuild(page) {
  await page.evaluate(() => {
    const original = window.RightboundBuild || {};
    window.RightboundBuild = Object.freeze({
      ...original,
      getPowerScore:() => 109,
      getReadiness:(recommended = 165) => Object.freeze({
        key:"danger",
        label:"Très faible",
        power:109,
        recommended,
        ratio:recommended > 0 ? 109 / recommended : 0
      })
    });
    window.RightboundMenuV3Data?.refreshNow?.();
    window.RightboundMenuV3Interactions?.refreshNow?.();
    window.RightboundMenuV3Geometry?.refresh?.();
  });
  await settle(page);
}

async function collectMetrics(page) {
  return page.evaluate(({ expectations }) => {
    const shell = document.querySelector(".menu-v3-shell");
    if (!shell) throw new Error("Menu V3 shell unavailable.");

    const rect = (node) => {
      const value = node.getBoundingClientRect();
      return {
        left:value.left,
        top:value.top,
        right:value.right,
        bottom:value.bottom,
        width:value.width,
        height:value.height
      };
    };
    const inside = (child, parent, tolerance = 1.25) => (
      child.left >= parent.left - tolerance &&
      child.top >= parent.top - tolerance &&
      child.right <= parent.right + tolerance &&
      child.bottom <= parent.bottom + tolerance
    );
    const textOverflow = (node) => (
      node.scrollWidth - node.clientWidth > expectations.overflowTolerancePx ||
      node.scrollHeight - node.clientHeight > expectations.overflowTolerancePx
    );

    const shellRect = rect(shell);
    const moduleSelectors = [
      ".menu-v3-topbar",
      ".menu-v3-world-header",
      ".menu-v3-stage-card",
      ".menu-v3-selector",
      ".menu-v3-action",
      ".menu-v3-dock"
    ];
    const modules = moduleSelectors.map((selector) => {
      const node = shell.querySelector(selector);
      if (!node) return { selector, missing:true };
      const bounds = rect(node);
      return {
        selector,
        ...bounds,
        insideShell:inside(bounds, shellRect, expectations.overflowTolerancePx),
        internalOverflow:(
          node.scrollWidth - node.clientWidth > expectations.overflowTolerancePx ||
          node.scrollHeight - node.clientHeight > expectations.overflowTolerancePx
        )
      };
    });

    const orderedGaps = modules.slice(0, -1).map((current, index) => ({
      from:current.selector,
      to:modules[index + 1].selector,
      gap:modules[index + 1].top - current.bottom
    }));

    const importantTextSelectors = [
      '.menu-v3-resource-slot[data-resource="gold"] .menu-v3-resource-value',
      '[data-v3-bind="level-number"]',
      '[data-v3-bind="level-name"]',
      '[data-v3-bind="readiness"]',
      '[data-v3-bind="recommended-power"]',
      '[data-v3-bind="hero-power"]',
      '[data-v3-bind="reward"]',
      ".menu-v3-selector-title",
      ".menu-v3-play-copy strong",
      ".menu-v3-play-copy span"
    ];
    const importantText = importantTextSelectors.map((selector) => {
      const node = shell.querySelector(selector);
      return {
        selector,
        text:node?.textContent?.trim() || "",
        missing:!node,
        overflow:node ? textOverflow(node) : true,
        bounds:node ? rect(node) : null
      };
    });

    const selector = shell.querySelector(".menu-v3-selector");
    const selectorRect = rect(selector);
    const nodes = [...shell.querySelectorAll(".menu-v3-level-slot")].map((node) => {
      const bounds = rect(node);
      return {
        level:Number(node.dataset.v3Level),
        state:node.dataset.levelState,
        selected:node.classList.contains("selected"),
        visible:bounds.width > 0 && bounds.height > 0,
        insideSelector:inside(bounds, selectorRect, expectations.overflowTolerancePx),
        ...bounds
      };
    });

    const play = shell.querySelector(".menu-v3-play-slot");
    const dock = shell.querySelector(".menu-v3-dock");
    const gold = shell.querySelector('.menu-v3-resource-slot[data-resource="gold"] .menu-v3-resource-value');
    const geometryReport = window.RightboundMenuV3Geometry?.measure?.() || window.RightboundMenuV3Geometry?.getReport?.() || null;

    return {
      viewport:{ width:window.innerWidth, height:window.innerHeight },
      pageOverflow:{
        horizontal:Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        vertical:Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      },
      shell:{
        ...shellRect,
        widthWithinLimit:shellRect.width <= expectations.maximumShellWidth + expectations.overflowTolerancePx,
        internalOverflow:(
          shell.scrollWidth - shell.clientWidth > expectations.overflowTolerancePx ||
          shell.scrollHeight - shell.clientHeight > expectations.overflowTolerancePx
        )
      },
      modules,
      orderedGaps,
      importantText,
      nodes,
      play:{ ...rect(play), visible:rect(play).width > 0 && rect(play).height > 0 },
      dock:{ ...rect(dock), visible:rect(dock).width > 0 && rect(dock).height > 0 },
      gold:{
        text:gold?.textContent?.trim() || "",
        overflow:gold ? textOverflow(gold) : true
      },
      geometryReport
    };
  }, { expectations:matrix.expectations });
}

test.describe("Menu V3 Lot 4.5 multi-viewport geometry", () => {
  test("renders the locked stress state without geometric regression", async ({ page }, testInfo) => {
    fs.mkdirSync(artifactsRoot, { recursive:true });
    const pageErrors = [];
    const consoleErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await seedDeterministicState(page);
    await page.goto(`/index.html?lot45=${encodeURIComponent(testInfo.project.name)}`, { waitUntil:"domcontentloaded" });
    await page.waitForSelector(".menu-v3-shell.menu-v3-components-ready", { state:"visible" });
    await page.waitForFunction(() => Boolean(
      window.RightboundMenuV3Geometry?.getReport?.() &&
      document.querySelector('.menu-v3-resource-slot[data-resource="gold"] .menu-v3-resource-value')
    ));
    await page.addStyleTag({ content:`
      *,*::before,*::after{
        animation:none!important;
        transition:none!important;
        caret-color:transparent!important;
      }
      html{scroll-behavior:auto!important}
    ` });
    await forceStressBuild(page);

    await expect(page.locator('.menu-v3-resource-slot[data-resource="gold"] .menu-v3-resource-value')).toHaveText("2 010");
    await expect(page.locator('[data-v3-bind="level-name"]')).toHaveText("GARDIEN DES FAUBOURGS");
    await expect(page.locator('[data-v3-bind="recommended-power"]')).toHaveText("165");
    await expect(page.locator('[data-v3-bind="hero-power"]')).toHaveText("Votre puissance : 109");
    await expect(page.locator('[data-v3-bind="reward"]')).toHaveText("1 COFFRE DIAMANT");

    const metrics = await collectMetrics(page);
    const geometryErrors = metrics.geometryReport?.issues?.filter((issue) => issue.severity === "error") || [];

    expect(metrics.viewport.width).toBe(testInfo.project.use.viewport.width);
    expect(metrics.viewport.height).toBe(testInfo.project.use.viewport.height);
    expect(metrics.pageOverflow.horizontal).toBeLessThanOrEqual(matrix.expectations.maximumPageOverflowPx);
    expect(metrics.pageOverflow.vertical).toBeLessThanOrEqual(matrix.expectations.maximumPageOverflowPx);
    expect(metrics.shell.widthWithinLimit).toBe(true);
    expect(metrics.shell.internalOverflow).toBe(false);
    expect(metrics.modules.every((module) => !module.missing && module.insideShell && !module.internalOverflow)).toBe(true);
    expect(metrics.orderedGaps.every((entry) => entry.gap >= -matrix.expectations.maximumModuleOverlapPx)).toBe(true);
    expect(metrics.importantText.every((entry) => !entry.missing && !entry.overflow)).toBe(true);
    expect(metrics.nodes).toHaveLength(matrix.expectations.requiredLevelNodes);
    expect(metrics.nodes.every((node) => node.visible && node.insideSelector)).toBe(true);
    expect(metrics.nodes.filter((node) => node.selected).map((node) => node.level)).toEqual([10]);
    expect(metrics.gold.text).toBe("2 010");
    expect(metrics.gold.overflow).toBe(false);
    expect(metrics.play.visible).toBe(true);
    expect(metrics.dock.visible).toBe(true);
    expect(metrics.play.bottom).toBeLessThanOrEqual(metrics.viewport.height + matrix.expectations.overflowTolerancePx);
    expect(metrics.dock.bottom).toBeLessThanOrEqual(metrics.viewport.height + matrix.expectations.overflowTolerancePx);
    expect(geometryErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    const normalScreenshot = artifactPath(testInfo.project.name, "normal.png");
    await page.screenshot({ path:normalScreenshot, fullPage:false, animations:"disabled" });

    await page.evaluate(() => window.RightboundMenuV3Geometry?.setDebug?.(true));
    await settle(page);
    const debugScreenshot = artifactPath(testInfo.project.name, "debug.png");
    await page.screenshot({ path:debugScreenshot, fullPage:false, animations:"disabled" });
    await page.evaluate(() => window.RightboundMenuV3Geometry?.setDebug?.(false));

    fs.writeFileSync(
      artifactPath(testInfo.project.name, "report.json"),
      JSON.stringify({
        suiteVersion:matrix.version,
        project:testInfo.project.name,
        platform:testInfo.project.metadata.platform,
        generatedAt:new Date().toISOString(),
        pageErrors,
        consoleErrors,
        metrics
      }, null, 2)
    );
  });
});
