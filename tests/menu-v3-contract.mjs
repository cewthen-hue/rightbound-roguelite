import fs from "node:fs";

const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const tokens = fs.readFileSync("styles/menu-v3/menu-v3.tokens.css", "utf8");
const layout = fs.readFileSync("styles/menu-v3/menu-v3.layout.css", "utf8");
const skin = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const responsive = fs.readFileSync("styles/menu-v3/menu-v3.responsive.css", "utf8");
const geometry = fs.readFileSync("styles/menu-v3/menu-v3.geometry.css", "utf8");
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
  if (!shell.includes(`dockSlot("${requiredDock}"`)) throw new Error(`Required Menu V3 dock slot missing: ${requiredDock}.`);
}

const levelCount = shell.includes("Array.from({ length: 10 }") || shell.includes("Array.from({length:10}");
if (!levelCount) throw new Error("Menu V3 must reserve exactly ten level nodes.");
if (shell.includes("(Supérieur)")) throw new Error("The redundant power readiness line must not return to the compact stats panel.");
if (!shell.includes('VERSION = "0.33.0-lot3.3"')) throw new Error("Menu V3 structural shell version mismatch.");
if (shell.includes('addEventListener("click"')) throw new Error("Menu V3 shell must remain structural.");

const requiredBindings = [
  "hero-name", "hero-level", "hero-xp", "world-label", "world-title", "level-number",
  "level-name", "readiness", "recommended-power", "hero-power", "reward", "energy-cost"
];
for (const binding of requiredBindings) {
  if (!shell.includes(`data-v3-bind="${binding}"`)) throw new Error(`Menu V3 data binding missing: ${binding}.`);
}

const requiredTokens = [
  "--menu-v3-geometry-lock", "--menu-v3-safe-top", "--menu-v3-safe-bottom",
  "--menu-v3-stage-hero-slot-width", "--menu-v3-stage-hero-slot-height",
  "--menu-v3-topbar-min", "--menu-v3-world-min", "--menu-v3-stage-stats-min",
  "--menu-v3-selector-min", "--menu-v3-action-min", "--menu-v3-dock-min",
  "--menu-v3-dock-bg", "--menu-v3-max-width"
];
for (const token of requiredTokens) {
  if (!tokens.includes(token)) throw new Error(`Centralized Menu V3 token missing: ${token}`);
}

if (!tokens.includes("--menu-v3-geometry-lock:0.35.1")) throw new Error("Lot 4 iPhone review geometry lock version is missing.");
if (!tokens.includes("--menu-v3-selector-min:72px")) throw new Error("Compact selector token is missing.");
if (!tokens.includes("--menu-v3-action-min:76px")) throw new Error("Enlarged action token is missing.");
if (!layout.includes("height:100dvh")) throw new Error("Menu V3 shell must use the dynamic viewport height.");
if (!layout.includes("overflow:hidden")) throw new Error("Menu V3 shell must explicitly control overflow.");
if (!layout.includes("grid-template-columns:repeat(4")) throw new Error("Menu V3 dock must use four equal columns.");
if (!skin.includes('selected[data-level-state="locked"]')) throw new Error("Locked-node protection is missing.");
if (!skin.includes('data-play-state="locked"') || !skin.includes('data-play-state="completed"')) {
  throw new Error("Play-button states are incomplete.");
}
if (!responsive.includes("box-sizing:border-box")) throw new Error("Safe-area box sizing is missing.");
if (!responsive.includes("width:32px!important")) throw new Error("Compact level node profile is missing.");
if (!responsive.includes("min-height:70px!important")) throw new Error("Enlarged play button profile is missing.");
if (!geometry.includes("final layout authority before sprite production")) throw new Error("Lot 4 geometry authority file is missing.");
if (!geometry.includes("var(--menu-v3-safe-bottom)")) throw new Error("Locked dock safe area is missing.");
if (!geometry.includes("menu-v3-future-stage-hero")) throw new Error("Future hero sprite slot geometry is missing.");
if (!geometry.includes("max(80px,calc(58px + env(safe-area-inset-bottom)))")) {
  throw new Error("Standard-phone dock safe-area track is missing.");
}
if (!geometry.includes('body.menu-v3-active #overlay::after')) throw new Error("iPhone duplicate bottom continuation override is missing.");
if (!geometry.includes('grid-template-columns:minmax(0,1.2fr)')) throw new Error("Gold resource width protection is missing.");
if (!geometry.includes('.menu-v3-resource-slot[data-resource="gold"]')) throw new Error("Gold-specific numeric slot is missing.");
if (!debug.includes("menu-v3-geometry-overlay")) throw new Error("Lot 4 geometry overlay is missing.");
if (!debug.includes("menu-v3-safe-area-top") || !debug.includes("menu-v3-safe-area-bottom")) {
  throw new Error("Safe-area debug guides are missing.");
}
if (/url\([^)]*assets\/menu-v3\//.test(shell + layout + skin + responsive + geometry + tokens + debug)) {
  throw new Error("Menu V3 must remain independent from final sprite files before Lot 5.");
}

console.log("Menu V3 structural and geometry contract passed after the Lot 4 iPhone review.");
