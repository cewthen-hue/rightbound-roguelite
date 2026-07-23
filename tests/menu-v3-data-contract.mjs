import fs from "node:fs";

const data = fs.readFileSync("src/menu-v3/menu-v3-data.js", "utf8");
const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const skin = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

const requiredSources = [
  "RightboundEconomy",
  "RightboundProgression",
  "RightboundBuild",
  "RightboundPlayerProfile"
];

for (const source of requiredSources) {
  if (!data.includes(`window.${source}`)) throw new Error(`Menu V3 Lot 3.1 data source missing: ${source}.`);
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

if (!data.includes('VERSION = "0.32.0-lot3.1"')) throw new Error("Menu V3 Lot 3.1 version mismatch.");
if (!data.includes('HERO_STORAGE_KEY = "rightbound-hero-progression-v1"')) throw new Error("Persistent hero progression key is missing.");
if (!data.includes("function xpRequiredForLevel")) throw new Error("Permanent hero XP curve is missing.");
if (!data.includes("function addHeroXp")) throw new Error("Future permanent XP grant API is missing.");
if (!data.includes("gems:0, energy:0, energyCost:10")) throw new Error("Temporary gems and energy values must remain zero during Lot 3.1.");
if (!data.includes("getReadiness")) throw new Error("Build readiness must come from the real build API.");
if (!data.includes("getSelectedLevel")) throw new Error("Selected-level data must come from the real progression API.");
if (!data.includes("getGold")) throw new Error("Gold must come from the real economy API.");
if (!data.includes("getPowerScore")) throw new Error("Hero power must come from the real build or profile API.");
if (!data.includes("rightbound:economy-changed")) throw new Error("Economy refresh event is missing.");
if (!data.includes("rightbound:progression-changed")) throw new Error("Progression refresh event is missing.");
if (!data.includes("rightbound:build-changed")) throw new Error("Build refresh event is missing.");
if (!data.includes("rightbound:menu-v3-synced")) throw new Error("Menu selection refresh event is missing.");
if (!data.includes("node.textContent !== next")) throw new Error("Lot 3.1 binder must avoid redundant text mutations.");
if (!skin.includes('data-readiness="low"') || !skin.includes('data-readiness="danger"')) {
  throw new Error("Real readiness colors are missing from the skin.");
}
if (/assets\/menu-v3\//.test(data + shell + skin)) throw new Error("Lot 3.1 must not load final sprites.");

const shellIndex = index.indexOf("menu-v3-shell.js?v=0.32.0");
const componentsIndex = index.indexOf("menu-v3-components.js?v=0.31.1");
const dataIndex = index.indexOf("menu-v3-data.js?v=0.32.0");
if (shellIndex < 0 || componentsIndex < 0 || dataIndex < 0 || !(shellIndex < componentsIndex && componentsIndex < dataIndex)) {
  throw new Error("Menu V3 data layer must load after shell and components.");
}
if (!serviceWorker.includes('rightbound-shell-v0.32.0')) throw new Error("PWA cache version is not aligned with Lot 3.1.");
if (!serviceWorker.includes("menu-v3-data.js?v=0.32.0")) throw new Error("Menu V3 data layer is missing from the PWA shell.");

console.log("Menu V3 Lot 3.1 data contract passed.");
