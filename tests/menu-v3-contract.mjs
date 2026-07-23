import fs from "node:fs";

const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const tokens = fs.readFileSync("styles/menu-v3/menu-v3.tokens.css", "utf8");
const layout = fs.readFileSync("styles/menu-v3/menu-v3.layout.css", "utf8");
const skin = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const responsive = fs.readFileSync("styles/menu-v3/menu-v3.responsive.css", "utf8");
const debug = fs.readFileSync("styles/menu-v3/menu-v3.debug.css", "utf8");

const requiredModules = [
  "menu-v3-topbar",
  "menu-v3-world-header",
  "menu-v3-stage-card",
  "menu-v3-selector",
  "menu-v3-action",
  "menu-v3-dock"
];

for (const className of requiredModules) {
  if (!shell.includes(className)) throw new Error(`Menu V3 module missing from shell: ${className}`);
  if (!layout.includes(`.${className}`)) throw new Error(`Menu V3 layout rule missing: ${className}`);
}

const dockSlots = (shell.match(/dockSlot\("/g) || []).length;
if (dockSlots !== 4) throw new Error(`Menu V3 must expose exactly four dock slots, found ${dockSlots}.`);
if (shell.includes('dockSlot("hero"')) throw new Error("The separate Hero tab must not exist in Menu V3.");

for (const requiredDock of ["expedition", "equipment", "chests", "shop"]) {
  if (!shell.includes(`dockSlot("${requiredDock}"`)) {
    throw new Error(`Required Menu V3 dock slot missing: ${requiredDock}.`);
  }
}

const levelCount = shell.includes("Array.from({ length: 10 }") || shell.includes("Array.from({length:10}");
if (!levelCount) throw new Error("Menu V3 must reserve exactly ten level nodes.");
if (shell.includes("(Supérieur)")) throw new Error("The redundant power readiness line must not return to the compact stats panel.");
if (!shell.includes('VERSION = "0.33.0-lot3.3"')) throw new Error("Menu V3 shell version must match the active Lot 3.3 build.");
if (shell.includes("addEventListener(\"click\"")) throw new Error("Menu V3 shell must remain structural; interactions belong in menu-v3-interactions.js.");

const requiredBindings = [
  "hero-name",
  "hero-level",
  "hero-xp",
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
  if (!shell.includes(`data-v3-bind="${binding}"`)) throw new Error(`Menu V3 data binding missing: ${binding}.`);
}

const requiredTokens = [
  "--menu-v3-topbar-min",
  "--menu-v3-world-min",
  "--menu-v3-stage-stats-min",
  "--menu-v3-selector-min",
  "--menu-v3-action-min",
  "--menu-v3-dock-min",
  "--menu-v3-dock-bg",
  "--menu-v3-max-width"
];

for (const token of requiredTokens) {
  if (!tokens.includes(token)) throw new Error(`Centralized Menu V3 token missing: ${token}`);
}

if (!tokens.includes("--menu-v3-selector-min:72px")) throw new Error("Lot 2.2 compact selector token is missing.");
if (!tokens.includes("--menu-v3-action-min:76px")) throw new Error("Lot 2.2 enlarged action token is missing.");
if (!layout.includes("height:100dvh")) throw new Error("Menu V3 shell must use the dynamic viewport height.");
if (!layout.includes("overflow:hidden")) throw new Error("Menu V3 shell must explicitly control overflow.");
if (!layout.includes("env(safe-area-inset-top)")) throw new Error("Menu V3 top safe area is missing.");
if (!layout.includes("env(safe-area-inset-bottom)")) throw new Error("Menu V3 bottom safe area is missing.");
if (!layout.includes("grid-template-columns:repeat(4")) throw new Error("Menu V3 dock must use four equal columns.");
if (!skin.includes("menu-v3-resource-track")) throw new Error("Menu V3 skin layer is missing its top-bar refinement.");
if (!skin.includes('selected[data-level-state="locked"]')) throw new Error("Lot 3.2 selected locked-node protection is missing.");
if (!skin.includes('data-play-state="locked"')) throw new Error("Lot 3.3 locked play-button state is missing.");
if (!skin.includes('data-play-state="completed"')) throw new Error("Lot 3.3 replay state is missing.");
if (!responsive.includes("box-sizing:border-box")) throw new Error("Menu V3 shell must include its safe-area padding inside 100dvh.");
if (!responsive.includes("menu-v3-selector-legend")) throw new Error("Menu V3 legend overflow protection is missing.");
if (!responsive.includes("menu-v3-stage-stats")) throw new Error("Menu V3 stats readability rules are missing.");
if (!responsive.includes("menu-v3-dock-slot")) throw new Error("Menu V3 dock continuation rules are missing.");
if (!responsive.includes("max-height:860px")) throw new Error("Menu V3 standard phone height profile is missing.");
if (!responsive.includes("minmax(306px,1fr)")) throw new Error("Menu V3 must reserve a dominant stage on standard phones.");
if (!responsive.includes("74px\n      74px")) throw new Error("Lot 2.2 selector and action balance is missing.");
if (!responsive.includes("width:32px!important")) throw new Error("Lot 2.2 compact level node profile is missing.");
if (!responsive.includes("min-height:70px!important")) throw new Error("Lot 2.2 enlarged play button profile is missing.");
if (!responsive.includes("body.menu-v3-active #overlay::after")) throw new Error("Menu V3 bottom surface continuation is missing.");
if (!debug.includes("menu-v3-debug")) throw new Error("Menu V3 debug visualization layer is missing.");
if (/assets\/menu-v3\//.test(shell + layout + skin + responsive + tokens + debug)) {
  throw new Error("Menu V3 must remain independent from final sprites before Lot 5.");
}

console.log("Menu V3 structural contract passed during Lot 3.3.");
