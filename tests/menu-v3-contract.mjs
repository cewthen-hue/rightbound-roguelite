import fs from "node:fs";

const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const tokens = fs.readFileSync("styles/menu-v3/menu-v3.tokens.css", "utf8");
const layout = fs.readFileSync("styles/menu-v3/menu-v3.layout.css", "utf8");
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
if (dockSlots !== 5) throw new Error(`Menu V3 must expose exactly five dock slots, found ${dockSlots}.`);

const levelCount = shell.includes("Array.from({ length: 10 }") || shell.includes("Array.from({length:10}");
if (!levelCount) throw new Error("Menu V3 must reserve exactly ten level nodes.");

const requiredTokens = [
  "--menu-v3-topbar-min",
  "--menu-v3-world-min",
  "--menu-v3-selector-min",
  "--menu-v3-action-min",
  "--menu-v3-dock-min",
  "--menu-v3-max-width"
];

for (const token of requiredTokens) {
  if (!tokens.includes(token)) throw new Error(`Centralized Menu V3 token missing: ${token}`);
}

if (!layout.includes("height:100dvh")) throw new Error("Menu V3 shell must use the dynamic viewport height.");
if (!layout.includes("overflow:hidden")) throw new Error("Menu V3 shell must explicitly control overflow.");
if (!layout.includes("env(safe-area-inset-top)")) throw new Error("Menu V3 top safe area is missing.");
if (!layout.includes("env(safe-area-inset-bottom)")) throw new Error("Menu V3 bottom safe area is missing.");
if (!debug.includes("menu-v3-debug")) throw new Error("Menu V3 debug visualization layer is missing.");
if (/assets\/menu-v3\/.test(shell + layout + tokens + debug)) {
  throw new Error("Lot 1 must not depend on final Menu V3 sprites.");
}

console.log("Menu V3 Lot 1 structural contract passed.");
