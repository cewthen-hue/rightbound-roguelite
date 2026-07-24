import fs from "node:fs";

const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const components = fs.readFileSync("src/menu-v3/menu-v3-components.js", "utf8");
const componentCss = fs.readFileSync("styles/menu-v3/menu-v3.components.css", "utf8");
const skinCss = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const responsive = fs.readFileSync("styles/menu-v3/menu-v3.responsive.css", "utf8");
const geometryCss = fs.readFileSync("styles/menu-v3/menu-v3.geometry.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");

const requiredDecorators = [
  "decorateProfile", "decorateResources", "decorateUtilities", "decorateStage",
  "decorateLevels", "decoratePlay", "decorateDock"
];
for (const decorator of requiredDecorators) {
  if (!components.includes(`function ${decorator}`)) throw new Error(`Menu V3 decorator missing: ${decorator}.`);
}

const requiredComponentClasses = [
  "menu-v3-avatar-art", "menu-v3-xp-meter", "menu-v3-resource-icon", "menu-v3-utility-icon",
  "menu-v3-scene-art", "menu-v3-css-hero", "menu-v3-node-number", "menu-v3-play-icon",
  "menu-v3-dock-label", "menu-v3-future-assets", "menu-v3-future-stage-background",
  "menu-v3-future-stage-hero", "menu-v3-future-stage-frame"
];
for (const className of requiredComponentClasses) {
  if (!components.includes(className)) throw new Error(`Menu V3 component markup missing: ${className}.`);
  if (!componentCss.includes(`.${className}`) && !skinCss.includes(`.${className}`) && !responsive.includes(`.${className}`) && !geometryCss.includes(`.${className}`)) {
    throw new Error(`Menu V3 component style missing: ${className}.`);
  }
}

for (const resource of ["gold", "gems", "energy"]) {
  if (!components.includes(resource)) throw new Error(`Menu V3 resource component missing: ${resource}.`);
}

for (const slot of ["hero-portrait", "world-ribbon", "stage-background", "stage-hero", "stage-frame", "play-frame", "play-icon"]) {
  if (!components.includes(slot)) throw new Error(`Static Lot 4 asset slot missing: ${slot}.`);
}
for (const dynamicSlot of ["`resource-${type}`", "`utility-${key}`", "`stat-${key}`", "`level-node-${level}`", "`dock-${key}`"]) {
  if (!components.includes(dynamicSlot)) throw new Error(`Dynamic Lot 4 asset slot pattern missing: ${dynamicSlot}.`);
}
if (!components.includes("function defineAssetSlot")) throw new Error("Central asset-slot metadata helper is missing.");
if (!components.includes('data-v3-asset-mode="cover"')) throw new Error("Stage background cover mode is missing.");
if (!components.includes('data-v3-asset-mode="nine-slice"')) throw new Error("Nine-slice frame mode is missing.");
if (!components.includes('data-v3-asset-anchor="50% 100%"')) throw new Error("Stage hero bottom-center anchor is missing.");

if (!components.includes('node.dataset.levelState || "loading"')) throw new Error("Menu V3 components must wait for real level states.");
if (components.includes('level <= 2 ? "completed"')) throw new Error("Hard-coded demo level states must not return.");
if (!components.includes('VERSION = "0.35.0-lot4"')) throw new Error("Menu V3 Lot 4 component version mismatch.");
if (!shell.includes('VERSION = "0.33.0-lot3.3"')) throw new Error("Menu V3 structural shell version mismatch.");
if (!shell.includes('localStorage.getItem(DEBUG_STORAGE_KEY) === "true"')) throw new Error("Debug mode must remain disabled by default.");
if (!componentCss.includes("Final sprites remain forbidden before Lot 5")) throw new Error("Sprite-independent component rule is missing.");
if (!skinCss.includes("no final sprites")) throw new Error("Sprite-independent skin rule is missing.");
if (!skinCss.includes("height:58%")) throw new Error("Temporary CSS hero scale is missing.");
if (!skinCss.includes('selected[data-level-state="locked"]')) throw new Error("Locked selection styling is missing.");
if (!skinCss.includes('data-play-state="completed"')) throw new Error("Replay styling is missing.");
if (!responsive.includes("height:clamp(38px,10.2vw,42px)")) throw new Error("Compact level-node sizing is missing.");
if (!responsive.includes("font-size:clamp(26px,7.2vw,35px)")) throw new Error("Enlarged play title is missing.");
if (/<img\b/i.test(components) || /url\([^)]*assets\/menu-v3\//.test(components + componentCss + skinCss + geometryCss)) {
  throw new Error("Menu V3 must not load final image assets before Lot 5.");
}

const cssIndex = index.indexOf("menu-v3.components.css?v=0.31.0");
const skinIndex = index.indexOf("menu-v3.skin.css?v=0.33.0");
const responsiveIndex = index.indexOf("menu-v3.responsive.css?v=0.31.2");
const geometryCssIndex = index.indexOf("menu-v3.geometry.css?v=0.35.1");
const debugIndex = index.indexOf("menu-v3.debug.css?v=0.35.0");
if (cssIndex < 0 || skinIndex < 0 || responsiveIndex < 0 || geometryCssIndex < 0 || debugIndex < 0 || !(cssIndex < skinIndex && skinIndex < responsiveIndex && responsiveIndex < geometryCssIndex && geometryCssIndex < debugIndex)) {
  throw new Error("Menu V3 CSS must load in components, skin, responsive, geometry, debug order.");
}

const shellIndex = index.indexOf("menu-v3-shell.js?v=0.33.0");
const componentJsIndex = index.indexOf("menu-v3-components.js?v=0.35.0");
const dataJsIndex = index.indexOf("menu-v3-data.js?v=0.34.0");
const interactionsIndex = index.indexOf("menu-v3-interactions.js?v=0.34.0");
const syncIndex = index.indexOf("menu-v3-sync.js?v=0.34.0");
const geometryJsIndex = index.indexOf("menu-v3-geometry.js?v=0.35.0");
if (shellIndex < 0 || componentJsIndex < 0 || dataJsIndex < 0 || interactionsIndex < 0 || syncIndex < 0 || geometryJsIndex < 0 || !(shellIndex < componentJsIndex && componentJsIndex < dataJsIndex && dataJsIndex < interactionsIndex && interactionsIndex < syncIndex && syncIndex < geometryJsIndex)) {
  throw new Error("Menu V3 scripts must load in shell, components, data, interactions, sync, geometry order.");
}

console.log("Menu V3 component and future asset-slot contract passed after the Lot 4 iPhone review.");
