import fs from "node:fs";

const interactions = fs.readFileSync("src/menu-v3/menu-v3-interactions.js", "utf8");
const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const skin = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

if (!interactions.includes('VERSION = "0.33.0-lot3.3"')) throw new Error("Menu V3 Lot 3.3 interaction version mismatch.");
if (!shell.includes('VERSION = "0.33.0-lot3.3"')) throw new Error("Menu V3 shell version mismatch during Lot 3.3.");
if (shell.includes('addEventListener("click"')) throw new Error("Click behavior must not be duplicated inside the structural shell.");

const requiredFunctions = [
  "proxyLevelSelection",
  "launchSelectedLevel",
  "openEquipment",
  "openChests",
  "openShop",
  "handleDockAction",
  "syncPlayButton",
  "syncDock"
];

for (const functionName of requiredFunctions) {
  if (!interactions.includes(`function ${functionName}`)) throw new Error(`Lot 3.3 function missing: ${functionName}.`);
}

if (!interactions.includes("play.dataset.playState")) throw new Error("Dynamic play-button state binding is missing.");
if (!interactions.includes('setText(title, "JOUER")')) throw new Error("Available-level play label is missing.");
if (!interactions.includes('setText(title, "REJOUER")')) throw new Error("Completed-level replay label is missing.");
if (!interactions.includes('setText(title, "VERROUILLÉ")')) throw new Error("Locked-level label is missing.");
if (!interactions.includes('TERMINE LE NIVEAU ${level.id - 1}')) throw new Error("Locked-level guidance is missing.");
if (!interactions.includes("play.disabled = true")) throw new Error("Locked levels must disable the play button.");
if (!interactions.includes("play.disabled = false")) throw new Error("Available levels must enable the play button.");
if (!interactions.includes("sourcePlay.click()")) throw new Error("Real expedition launch bridge is missing.");
if (!interactions.includes("RightboundInventory.renderInventory")) throw new Error("Equipment navigation is not connected to the real inventory.");
if (!interactions.includes("RightboundChests.render")) throw new Error("Chest navigation is not connected to the real chest screen.");
if (!interactions.includes("RightboundChests?.getState")) throw new Error("Real chest notification count is missing.");
if (!interactions.includes("La boutique sera construite")) throw new Error("The not-yet-built shop must expose an explicit placeholder response.");
if (!interactions.includes('rightbound:chests-changed')) throw new Error("Chest badge refresh event is missing.");
if (!interactions.includes('rightbound:progression-changed')) throw new Error("Play-state progression refresh event is missing.");
if (!skin.includes('data-play-state="locked"')) throw new Error("Locked action styling is missing.");
if (!skin.includes('data-play-state="completed"')) throw new Error("Replay action styling is missing.");
if (!skin.includes('menu-v3-dock-notification:not([hidden])')) throw new Error("Real chest-count badge styling is missing.");
if (/assets\/menu-v3\//.test(interactions + shell + skin)) throw new Error("Lot 3.3 must remain independent from final sprites.");

const shellIndex = index.indexOf("menu-v3-shell.js?v=0.33.0");
const dataIndex = index.indexOf("menu-v3-data.js?v=0.32.1");
const interactionsIndex = index.indexOf("menu-v3-interactions.js?v=0.33.0");
if (shellIndex < 0 || dataIndex < 0 || interactionsIndex < 0 || !(shellIndex < dataIndex && dataIndex < interactionsIndex)) {
  throw new Error("Menu V3 interaction layer must load after shell and data.");
}
if (!serviceWorker.includes('rightbound-shell-v0.33.0')) throw new Error("PWA cache version is not aligned with Lot 3.3.");
if (!serviceWorker.includes("menu-v3-interactions.js?v=0.33.0")) throw new Error("Lot 3.3 interaction file is missing from the PWA shell.");

console.log("Menu V3 Lot 3.3 interaction contract passed.");
