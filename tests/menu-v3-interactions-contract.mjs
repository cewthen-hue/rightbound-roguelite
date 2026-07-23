import fs from "node:fs";

const interactions = fs.readFileSync("src/menu-v3/menu-v3-interactions.js", "utf8");
const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const skin = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

if (!interactions.includes('VERSION = "0.34.0-lot3.4"')) throw new Error("Menu V3 synchronized interaction version mismatch.");
if (!shell.includes('VERSION = "0.33.0-lot3.3"')) throw new Error("Menu V3 structural shell version mismatch.");
if (shell.includes('addEventListener("click"')) throw new Error("Click behavior must not be duplicated inside the structural shell.");

const requiredFunctions = [
  "proxyLevelSelection", "launchSelectedLevel", "openEquipment", "openChests",
  "openShop", "handleDockAction", "syncPlayButton", "syncDock"
];
for (const functionName of requiredFunctions) {
  if (!interactions.includes(`function ${functionName}`)) throw new Error(`Menu V3 function missing: ${functionName}.`);
}

if (!interactions.includes("play.dataset.playState")) throw new Error("Dynamic play-button state binding is missing.");
if (!interactions.includes('setText(title, "JOUER")')) throw new Error("Available-level play label is missing.");
if (!interactions.includes('setText(title, "REJOUER")')) throw new Error("Completed-level replay label is missing.");
if (!interactions.includes('setText(title, "VERROUILLÉ")')) throw new Error("Locked-level label is missing.");
if (!interactions.includes('TERMINE LE NIVEAU ${level.id - 1}')) throw new Error("Locked-level guidance is missing.");
if (!interactions.includes("play.disabled = true") || !interactions.includes("play.disabled = false")) {
  throw new Error("Play-button enabled and disabled states are incomplete.");
}
if (!interactions.includes("sourcePlay.click()")) throw new Error("Real expedition launch bridge is missing.");
if (!interactions.includes("RightboundInventory.renderInventory")) throw new Error("Equipment navigation is not connected.");
if (!interactions.includes("RightboundChests.render")) throw new Error("Chest navigation is not connected.");
if (!interactions.includes("snapshot?.chests?.total")) throw new Error("Real chest count is not read from the unified snapshot.");
if (!interactions.includes("rightbound:menu-v3-data-bound")) throw new Error("Interactions are not synchronized with bound data.");
if (!interactions.includes("rightbound:menu-v3-refresh-request")) throw new Error("Central refresh event is missing.");
if (!interactions.includes('window.addEventListener("pageshow"')) throw new Error("Interaction refresh after app resume is missing.");
if (!interactions.includes("Les options du jeu seront ajoutées")) throw new Error("Options placeholder is missing.");
if (!interactions.includes("La boutique sera construite")) throw new Error("Shop placeholder is missing.");
if (!interactions.includes('rightbound:chests-changed')) throw new Error("Chest badge refresh event is missing.");
if (!interactions.includes('rightbound:progression-changed')) throw new Error("Play-state progression refresh event is missing.");
if (!skin.includes('data-play-state="locked"') || !skin.includes('data-play-state="completed"')) {
  throw new Error("Locked and replay action styling is incomplete.");
}
if (!skin.includes('menu-v3-dock-notification:not([hidden])')) throw new Error("Real chest-count badge styling is missing.");
if (/url\([^)]*assets\/menu-v3\//.test(interactions + shell + skin)) throw new Error("Interactions must remain independent from final sprites.");

const shellIndex = index.indexOf("menu-v3-shell.js?v=0.33.0");
const dataIndex = index.indexOf("menu-v3-data.js?v=0.34.0");
const interactionsIndex = index.indexOf("menu-v3-interactions.js?v=0.34.0");
const syncIndex = index.indexOf("menu-v3-sync.js?v=0.34.0");
const geometryIndex = index.indexOf("menu-v3-geometry.js?v=0.35.0");
if (shellIndex < 0 || dataIndex < 0 || interactionsIndex < 0 || syncIndex < 0 || geometryIndex < 0 || !(shellIndex < dataIndex && dataIndex < interactionsIndex && interactionsIndex < syncIndex && syncIndex < geometryIndex)) {
  throw new Error("Menu V3 interaction, synchronization and geometry layers are loaded in the wrong order.");
}
if (!serviceWorker.includes('rightbound-shell-v0.35.0')) throw new Error("PWA cache is not aligned with Lot 4.");
for (const path of ["menu-v3-interactions.js?v=0.34.0", "menu-v3-sync.js?v=0.34.0", "menu-v3-geometry.js?v=0.35.0"]) {
  if (!serviceWorker.includes(path)) throw new Error(`PWA shell entry missing: ${path}.`);
}

console.log("Menu V3 synchronized interaction contract passed during Lot 4.");
