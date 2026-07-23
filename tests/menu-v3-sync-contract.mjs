import fs from "node:fs";

const sync = fs.readFileSync("src/menu-v3/menu-v3-sync.js", "utf8");
const data = fs.readFileSync("src/menu-v3/menu-v3-data.js", "utf8");
const interactions = fs.readFileSync("src/menu-v3/menu-v3-interactions.js", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

if (!sync.includes('VERSION = "0.34.0-lot3.4"')) throw new Error("Menu V3 synchronization version mismatch.");

const requiredFunctions = [
  "detectView", "snapshotSignature", "emitViewChange", "inspectView", "requestRefresh",
  "dispatchRefreshRequest", "finalizeSync", "performSync", "scheduleSync"
];
for (const functionName of requiredFunctions) {
  if (!sync.includes(`function ${functionName}`)) throw new Error(`Synchronization function missing: ${functionName}.`);
}

for (const view of ["combat", "expedition", "equipment", "chests", "result", "upgrade", "dialog"]) {
  if (!sync.includes(`return "${view}"`)) throw new Error(`View detection missing: ${view}.`);
}

for (const eventName of [
  "rightbound:economy-changed", "rightbound:progression-changed", "rightbound:profile-changed",
  "rightbound:build-changed", "rightbound:run-rewarded", "rightbound:chests-changed",
  "rightbound:chest-opening-recovered", "rightbound:item-granted", "rightbound:hero-progression-changed"
]) {
  if (!sync.includes(eventName)) throw new Error(`Domain refresh event missing: ${eventName}.`);
}

const domainBlock = sync.slice(sync.indexOf("const DOMAIN_EVENTS"), sync.indexOf("const STORAGE_KEYS"));
if (domainBlock.includes("rightbound:menu-v3-synced")) throw new Error("Coordinator must not listen to its own shell event.");
if (!sync.includes("window.RightboundProgression?.resumePendingRunReward?.()")) throw new Error("Pending run rewards are not reconciled.");
if (!sync.includes("window.RightboundMenuV3Data?.refreshNow?.()")) throw new Error("Synchronous data reconciliation is missing.");
if (!sync.includes("window.RightboundMenuV3Interactions?.refreshNow?.()")) throw new Error("Synchronous interaction reconciliation is missing.");
if (!sync.includes("rightbound:menu-v3-refresh-request")) throw new Error("Central module refresh request is missing.");
if (!sync.includes("rightbound:menu-v3-sync-complete")) throw new Error("Stable synchronization completion event is missing.");
if (!sync.includes('shell.dataset.syncStable = "true"')) throw new Error("Stable synchronized shell marker is missing.");
if (!sync.includes("const changed = signature !== lastSignature")) throw new Error("Snapshot change detection order is invalid.");
if (!sync.includes("requestAnimationFrame(() => finalizeSync")) throw new Error("Two-frame settlement is missing.");
if (!sync.includes('window.addEventListener("pageshow"')) throw new Error("App resume synchronization is missing.");
if (!sync.includes('window.addEventListener("focus"')) throw new Error("Focus synchronization is missing.");
if (!sync.includes('document.addEventListener("visibilitychange"')) throw new Error("Visibility synchronization is missing.");
if (!sync.includes('window.addEventListener("storage"')) throw new Error("Storage synchronization is missing.");
if (!sync.includes('modalObserver.observe(modalContent, { childList:true, subtree:false })')) {
  throw new Error("View observer must avoid text-mutation loops.");
}
if (!data.includes("rightbound:menu-v3-data-bound") || !data.includes("getLastSnapshot")) {
  throw new Error("Data layer synchronization handoff is incomplete.");
}
if (!interactions.includes("latestSnapshot") || !interactions.includes("rightbound:menu-v3-data-bound")) {
  throw new Error("Interaction layer does not consume synchronized data.");
}
if (/url\([^)]*assets\/menu-v3\//.test(sync + data + interactions)) throw new Error("Synchronization must remain independent from final sprites.");

const dataIndex = index.indexOf("menu-v3-data.js?v=0.34.0");
const interactionsIndex = index.indexOf("menu-v3-interactions.js?v=0.34.0");
const syncIndex = index.indexOf("menu-v3-sync.js?v=0.34.0");
const geometryIndex = index.indexOf("menu-v3-geometry.js?v=0.35.0");
if (dataIndex < 0 || interactionsIndex < 0 || syncIndex < 0 || geometryIndex < 0 || !(dataIndex < interactionsIndex && interactionsIndex < syncIndex && syncIndex < geometryIndex)) {
  throw new Error("Menu V3 files must load in data, interactions, synchronization, geometry order.");
}
if (!serviceWorker.includes('rightbound-shell-v0.35.0')) throw new Error("PWA cache is not aligned with Lot 4.");
if (!serviceWorker.includes("menu-v3-sync.js?v=0.34.0")) throw new Error("Synchronization coordinator is missing from PWA shell.");
if (!serviceWorker.includes("menu-v3-geometry.js?v=0.35.0")) throw new Error("Geometry validator is missing from PWA shell.");

console.log("Menu V3 synchronization contract passed during Lot 4.");
