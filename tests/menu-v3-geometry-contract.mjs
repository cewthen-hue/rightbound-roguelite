import fs from "node:fs";

const geometryJs = fs.readFileSync("src/menu-v3/menu-v3-geometry.js", "utf8");
const components = fs.readFileSync("src/menu-v3/menu-v3-components.js", "utf8");
const tokens = fs.readFileSync("styles/menu-v3/menu-v3.tokens.css", "utf8");
const geometryCss = fs.readFileSync("styles/menu-v3/menu-v3.geometry.css", "utf8");
const debugCss = fs.readFileSync("styles/menu-v3/menu-v3.debug.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");
const contract = JSON.parse(fs.readFileSync("assets/menu-v3/geometry-contract.json", "utf8"));
const lockDoc = fs.readFileSync("docs/MENU_V3_GEOMETRY_LOCK.md", "utf8");

if (!geometryJs.includes('VERSION = "0.35.0-lot4"')) throw new Error("Lot 4 geometry runtime version mismatch.");
if (contract.version !== "0.35.0-lot4") throw new Error("Machine-readable geometry contract version mismatch.");
if (contract.revision !== "0.35.1") throw new Error("Reviewed geometry revision mismatch.");
if (contract.status !== "geometry-locked-iphone-validated-android-pending") {
  throw new Error("Geometry status must record iPhone approval and pending Android validation.");
}
if (contract.validation?.iphone?.status !== "passed") throw new Error("iPhone geometry validation must be recorded as passed.");
if (contract.validation?.iphone?.evidence !== "real-device-full-screen-capture") throw new Error("iPhone validation evidence type mismatch.");
if (contract.validation?.android?.status !== "pending") throw new Error("Android geometry validation must remain pending.");
for (const stressCase of [
  "four-digit-gold-value",
  "long-level-title",
  "three-digit-recommended-power",
  "diamond-reward-label",
  "ten-visible-level-nodes",
  "iphone-home-indicator-safe-area"
]) {
  if (!contract.validation.iphone.stressCases.includes(stressCase)) throw new Error(`iPhone stress case missing: ${stressCase}.`);
}
if (contract.maxShellWidth !== 430) throw new Error("Machine-readable maximum shell width mismatch.");
if (contract.overflowTolerancePx !== 1.25) throw new Error("Machine-readable overflow tolerance mismatch.");

const profiles = ["360x780", "375x812", "390x844", "393x852", "430x932"];
for (const profile of profiles) {
  if (!geometryJs.includes(`id:"${profile}"`)) throw new Error(`Required phone geometry profile missing: ${profile}.`);
}
if (contract.targetViewports.length !== 5) throw new Error("Geometry contract must contain five target viewports.");
for (const [indexValue, profile] of profiles.entries()) {
  const serialized = `${contract.targetViewports[indexValue].width}x${contract.targetViewports[indexValue].height}`;
  if (serialized !== profile) throw new Error(`Machine-readable viewport order mismatch: expected ${profile}, found ${serialized}.`);
}

for (const functionName of [
  "viewportSize", "nearestProfile", "rectData", "isOutside", "hasInternalOverflow",
  "parseAnchor", "ensureOverlay", "measureModule", "measureAsset", "measureText",
  "measureTouchTargets", "measureSafeAreas", "updateStatus", "measure", "observeShell"
]) {
  if (!geometryJs.includes(`function ${functionName}`)) throw new Error(`Lot 4 geometry function missing: ${functionName}.`);
}

for (const moduleId of [
  "topbar", "world-header", "stage-card", "stage-heading", "stage-scene",
  "stage-stats", "level-selector", "primary-action", "bottom-dock"
]) {
  if (!geometryJs.includes(`id:"${moduleId}"`)) throw new Error(`Measured module missing: ${moduleId}.`);
}

for (const eventName of [
  "rightbound:menu-v3-sync-complete", "rightbound:menu-v3-data-bound",
  "rightbound:menu-v3-geometry-checked"
]) {
  if (!geometryJs.includes(eventName)) throw new Error(`Geometry lifecycle event missing: ${eventName}.`);
}

if (!geometryJs.includes("ResizeObserver")) throw new Error("ResizeObserver geometry validation is missing.");
if (!geometryJs.includes("window.visualViewport")) throw new Error("Visual viewport measurement is missing.");
if (!geometryJs.includes('window.addEventListener("orientationchange"')) throw new Error("Orientation remeasurement is missing.");
if (!geometryJs.includes("node.scrollWidth")) throw new Error("Overflow measurement is missing.");
if (!geometryJs.includes("shellRect.width > 430")) throw new Error("Maximum shell width validation is missing.");
if (!geometryJs.includes('status = errorCount > 0 ? "fail"')) throw new Error("Geometry pass/warning/fail status is missing.");
if (!geometryJs.includes("exportReport")) throw new Error("Geometry report export API is missing.");
if (!geometryJs.includes("targetViewports:TARGET_VIEWPORTS")) throw new Error("Target viewport API is missing.");

for (const token of [
  "--menu-v3-geometry-lock:0.35.1", "--menu-v3-safe-top", "--menu-v3-safe-bottom",
  "--menu-v3-stage-hero-slot-width", "--menu-v3-stage-hero-slot-height",
  "--menu-v3-stage-hero-slot-bottom", "--menu-v3-overflow-tolerance"
]) {
  if (!tokens.includes(token)) throw new Error(`Locked geometry token missing: ${token}.`);
}

if (!geometryCss.includes("final layout authority before sprite production")) throw new Error("Geometry lock authority comment is missing.");
if (!geometryCss.includes("max(80px,calc(58px + env(safe-area-inset-bottom)))")) throw new Error("Standard-phone safe dock track is missing.");
if (!geometryCss.includes("max(72px,calc(50px + env(safe-area-inset-bottom)))")) throw new Error("Short-phone safe dock track is missing.");
if (!geometryCss.includes('body.menu-v3-active #overlay::after')) throw new Error("Duplicate iPhone bottom continuation override is missing.");
if (!geometryCss.includes("content:none!important")) throw new Error("Duplicate iPhone bottom continuation is not disabled.");
if (!geometryCss.includes('grid-template-columns:minmax(0,1.2fr) repeat(2,minmax(0,.9fr))')) {
  throw new Error("Gold resource width distribution is missing.");
}
if (!geometryCss.includes('.menu-v3-resource-slot[data-resource="gold"]')) throw new Error("Gold-specific numeric width is missing.");
if (!geometryCss.includes("menu-v3-future-stage-background") || !geometryCss.includes("menu-v3-future-stage-hero") || !geometryCss.includes("menu-v3-future-stage-frame")) {
  throw new Error("Stage asset geometry slots are incomplete.");
}
if (contract.stageHeroSlot.width !== "28%" || contract.stageHeroSlot.height !== "70%" || contract.stageHeroSlot.anchor !== "50% 100%") {
  throw new Error("Machine-readable stage hero slot does not match locked CSS geometry.");
}

for (const debugClass of [
  "menu-v3-geometry-overlay", "menu-v3-safe-area-top", "menu-v3-safe-area-bottom",
  "menu-v3-geometry-axis-x", "menu-v3-geometry-axis-y", "menu-v3-geometry-status",
  "menu-v3-geometry-tag", "menu-v3-geometry-marker"
]) {
  if (!debugCss.includes(debugClass)) throw new Error(`Geometry debug visual missing: ${debugClass}.`);
}
if (!debugCss.includes('[data-v3-geometry-overflow="true"]')) throw new Error("Overflow debug highlighting is missing.");
if (!debugCss.includes('[data-v3-geometry-outside="true"]')) throw new Error("Outside-shell debug highlighting is missing.");

for (const metadata of ["v3AssetSlot", "v3AssetMode", "v3AssetAnchor"]) {
  if (!components.includes(metadata)) throw new Error(`Future asset metadata missing: ${metadata}.`);
}
if (!components.includes('VERSION = "0.35.0-lot4"')) throw new Error("Lot 4 component metadata version mismatch.");
if (!components.includes('data-v3-asset-anchor="50% 100%"')) throw new Error("Hero bottom-center anchor metadata is missing.");
if (!components.includes('data-v3-asset-mode="cover"')) throw new Error("Background cover metadata is missing.");
if (!components.includes('data-v3-asset-mode="nine-slice"')) throw new Error("Frame nine-slice metadata is missing.");

const slotIds = new Set(contract.assetSlots.map((slot) => slot.id));
for (const slotId of [
  "hero-portrait", "resource-gold", "resource-gems", "resource-energy", "utility-options",
  "utility-journal", "world-ribbon", "stage-background", "stage-hero", "stage-frame",
  "stat-power", "stat-reward", "level-node-*", "play-frame", "play-icon",
  "dock-expedition", "dock-equipment", "dock-chests", "dock-shop"
]) {
  if (!slotIds.has(slotId)) throw new Error(`Machine-readable future asset slot missing: ${slotId}.`);
}
if (!lockDoc.includes("RightboundMenuV3Geometry.setDebug(true)")) throw new Error("Geometry debug instructions are missing.");
if (!lockDoc.includes("validation finale sur captures réelles")) throw new Error("Phone validation requirement is missing from geometry documentation.");

const responsiveCssIndex = index.indexOf("menu-v3.responsive.css?v=0.31.2");
const geometryCssIndex = index.indexOf("menu-v3.geometry.css?v=0.35.1");
const debugCssIndex = index.indexOf("menu-v3.debug.css?v=0.35.0");
if (responsiveCssIndex < 0 || geometryCssIndex < 0 || debugCssIndex < 0 || !(responsiveCssIndex < geometryCssIndex && geometryCssIndex < debugCssIndex)) {
  throw new Error("Geometry CSS must load after responsive and before debug.");
}

const syncJsIndex = index.indexOf("menu-v3-sync.js?v=0.34.0");
const geometryJsIndex = index.indexOf("menu-v3-geometry.js?v=0.35.0");
if (syncJsIndex < 0 || geometryJsIndex < 0 || syncJsIndex > geometryJsIndex) throw new Error("Geometry runtime must load after synchronization.");
if (!index.includes("menu-v3-components.js?v=0.35.0")) throw new Error("Lot 4 components are not loaded.");
if (!index.includes("app-shell.js?v=0.35.1")) throw new Error("Lot 4 reviewed app shell is not loaded.");
if (!serviceWorker.includes('rightbound-shell-v0.35.1')) throw new Error("Lot 4 reviewed PWA cache version mismatch.");
for (const path of [
  "menu-v3.tokens.css?v=0.35.1", "menu-v3.geometry.css?v=0.35.1",
  "menu-v3.debug.css?v=0.35.0", "menu-v3-components.js?v=0.35.0",
  "menu-v3-geometry.js?v=0.35.0", "app-shell.js?v=0.35.1"
]) {
  if (!serviceWorker.includes(path)) throw new Error(`Lot 4 PWA shell entry missing: ${path}.`);
}
if (/url\([^)]*assets\/menu-v3\//.test(geometryJs + components + geometryCss + debugCss)) {
  throw new Error("Lot 4 must define slots without loading final sprite files.");
}

console.log("Menu V3 Lot 4 geometry contract passed with iPhone approved and Android pending.");
