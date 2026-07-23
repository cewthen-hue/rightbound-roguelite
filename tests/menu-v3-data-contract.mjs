import fs from "node:fs";

const data = fs.readFileSync("src/menu-v3/menu-v3-data.js", "utf8");
const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const components = fs.readFileSync("src/menu-v3/menu-v3-components.js", "utf8");
const skin = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

const requiredSources = [
  "RightboundEconomy",
  "RightboundProgression",
  "RightboundBuild",
  "RightboundPlayerProfile",
  "RightboundChests"
];

for (const source of requiredSources) {
  if (!data.includes(`window.${source}`)) throw new Error(`Menu V3 data source missing: ${source}.`);
}

const requiredBindings = [
  "hero-name",
  "hero-level",
  "world-label",
  "world-title",
  "level-number",
  "level-name",
  "readiness",
  "recommended-power",
  "hero-power",
  "reward",
  "energy-cost"
];

for (const binding of requiredBindings) {
  if (!shell.includes(`data-v3-bind="${binding}"`)) throw new Error(`Shell binding missing: ${binding}.`);
  if (!data.includes(`data-v3-bind=\\"${binding}\\"`) && !data.includes(`data-v3-bind="${binding}"`)) {
    throw new Error(`Data binder missing: ${binding}.`);
  }
}

if (!data.includes('VERSION = "0.34.0-lot3.4"')) throw new Error("Menu V3 Lot 3.4 data version mismatch.");
if (!data.includes('HERO_STORAGE_KEY = "rightbound-hero-progression-v1"')) throw new Error("Persistent hero progression key is missing.");
if (!data.includes("function xpRequiredForLevel")) throw new Error("Permanent hero XP curve is missing.");
if (!data.includes("function addHeroXp")) throw new Error("Future permanent XP grant API is missing.");
if (!data.includes("gems:0, energy:0, energyCost:10")) throw new Error("Temporary gems and energy values must remain zero.");
if (!data.includes("getReadiness")) throw new Error("Build readiness must come from the real build API.");
if (!data.includes("getSelectedLevel")) throw new Error("Selected-level data must come from the real progression API.");
if (!data.includes("getGold")) throw new Error("Gold must come from the real economy API.");
if (!data.includes("getPowerScore")) throw new Error("Hero power must come from the real build or profile API.");
if (!data.includes("function getLevelsSnapshot")) throw new Error("Real ten-level snapshot is missing.");
if (!data.includes("function getChestSnapshot")) throw new Error("Real chest stock snapshot is missing.");
if (!data.includes("chests:getChestSnapshot()")) throw new Error("Chest stock is not included in the unified snapshot.");
if (!data.includes('state = completed ? "completed" : unlocked ? "available" : "locked"')) {
  throw new Error("Real completed/available/locked state resolution is missing.");
}
if (!data.includes("function bindLevelStates")) throw new Error("Real node-state binder is missing.");
if (!data.includes('node.dataset.levelType = level.type')) throw new Error("Elite and boss types are not connected to nodes.");
if (!data.includes('node.dataset.levelState = level.state')) throw new Error("Progression states are not connected to nodes.");
if (!data.includes('node.classList.toggle("selected", level.selected)')) throw new Error("Selected node is not driven by real data.");
if (!data.includes("rightbound:economy-changed")) throw new Error("Economy refresh event is missing.");
if (!data.includes("rightbound:progression-changed")) throw new Error("Progression refresh event is missing.");
if (!data.includes("rightbound:build-changed")) throw new Error("Build refresh event is missing.");
if (!data.includes("rightbound:chests-changed")) throw new Error("Chest refresh event is missing.");
if (!data.includes("rightbound:menu-v3-refresh-request")) throw new Error("Central synchronization refresh event is missing.");
if (!data.includes("rightbound:menu-v3-data-bound")) throw new Error("Synchronized data-bound event is missing.");
if (!data.includes("window.addEventListener(\"pageshow\"")) throw new Error("Page-resume data refresh is missing.");
if (!data.includes("document.visibilityState === \"visible\"")) throw new Error("Visible-app data refresh is missing.");
if (!data.includes("node.textContent !== next")) throw new Error("Binder must avoid redundant text mutations.");
if (!components.includes('levelState || "loading"')) throw new Error("Components must not restore demo progression.");
if (!skin.includes('selected[data-level-state="locked"]')) throw new Error("Selected locked nodes must preserve their locked identity.");
if (!skin.includes('data-level-type="elite"') || !skin.includes('data-level-type="boss"')) {
  throw new Error("Elite and boss node-state skins are missing.");
}
if (!skin.includes('data-readiness="low"') || !skin.includes('data-readiness="danger"')) {
  throw new Error("Real readiness colors are missing from the skin.");
}
if (/assets\/menu-v3\//.test(data + shell + skin)) throw new Error("Menu V3 data must not load final sprites.");

const shellIndex = index.indexOf("menu-v3-shell.js?v=0.33.0");
const componentsIndex = index.indexOf("menu-v3-components.js?v=0.32.1");
const dataIndex = index.indexOf("menu-v3-data.js?v=0.34.0");
const interactionsIndex = index.indexOf("menu-v3-interactions.js?v=0.34.0");
const syncIndex = index.indexOf("menu-v3-sync.js?v=0.34.0");
if (shellIndex < 0 || componentsIndex < 0 || dataIndex < 0 || interactionsIndex < 0 || syncIndex < 0 || !(shellIndex < componentsIndex && componentsIndex < dataIndex && dataIndex < interactionsIndex && interactionsIndex < syncIndex)) {
  throw new Error("Menu V3 scripts must load in shell, components, data, interactions, sync order.");
}
if (!serviceWorker.includes('rightbound-shell-v0.34.0')) throw new Error("PWA cache version is not aligned with Lot 3.4.");
if (!serviceWorker.includes("menu-v3-data.js?v=0.34.0")) throw new Error("Menu V3 data layer is missing from the PWA shell.");
if (!serviceWorker.includes("menu-v3-interactions.js?v=0.34.0")) throw new Error("Menu V3 interaction layer is missing from the PWA shell.");
if (!serviceWorker.includes("menu-v3-sync.js?v=0.34.0")) throw new Error("Menu V3 synchronization layer is missing from the PWA shell.");

console.log("Menu V3 Lot 3.4 synchronized data contract passed.");
