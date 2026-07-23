import fs from "node:fs";

const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const components = fs.readFileSync("src/menu-v3/menu-v3-components.js", "utf8");
const componentCss = fs.readFileSync("styles/menu-v3/menu-v3.components.css", "utf8");
const skinCss = fs.readFileSync("styles/menu-v3/menu-v3.skin.css", "utf8");
const responsive = fs.readFileSync("styles/menu-v3/menu-v3.responsive.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");

const requiredDecorators = [
  "decorateProfile",
  "decorateResources",
  "decorateUtilities",
  "decorateStage",
  "decorateLevels",
  "decoratePlay",
  "decorateDock"
];

for (const decorator of requiredDecorators) {
  if (!components.includes(`function ${decorator}`)) throw new Error(`Menu V3 decorator missing: ${decorator}.`);
}

const requiredComponentClasses = [
  "menu-v3-avatar-art",
  "menu-v3-xp-meter",
  "menu-v3-resource-icon",
  "menu-v3-utility-icon",
  "menu-v3-scene-art",
  "menu-v3-css-hero",
  "menu-v3-node-number",
  "menu-v3-play-icon",
  "menu-v3-dock-label"
];

for (const className of requiredComponentClasses) {
  if (!components.includes(className)) throw new Error(`Menu V3 component markup missing: ${className}.`);
  if (!componentCss.includes(`.${className}`) && !skinCss.includes(`.${className}`) && !responsive.includes(`.${className}`)) {
    throw new Error(`Menu V3 component style missing: ${className}.`);
  }
}

for (const resource of ["gold", "gems", "energy"]) {
  if (!components.includes(resource)) throw new Error(`Menu V3 resource component missing: ${resource}.`);
}

if (!components.includes('node.dataset.levelState || "loading"')) {
  throw new Error("Menu V3 components must wait for real level states instead of injecting demo progression.");
}
if (components.includes('level <= 2 ? "completed"')) {
  throw new Error("Hard-coded demo level states must not return after Lot 3.2.");
}
if (!components.includes('VERSION = "0.32.1-lot3.2"')) throw new Error("Menu V3 component version mismatch.");
if (!shell.includes('VERSION = "0.33.0-lot3.3"')) throw new Error("Menu V3 structural shell version mismatch.");
if (!shell.includes('localStorage.getItem(DEBUG_STORAGE_KEY) === "true"')) {
  throw new Error("Menu V3 debug mode must remain disabled by default.");
}
if (!componentCss.includes("Final sprites remain forbidden before Lot 5")) {
  throw new Error("Menu V3 CSS must explicitly remain sprite-independent.");
}
if (!skinCss.includes("no final sprites")) throw new Error("Menu V3 skin must remain independent from final sprites.");
if (!skinCss.includes("menu-v3-resource-track")) throw new Error("Lot 2.1 resource spacing refinement is missing.");
if (!skinCss.includes("height:58%")) throw new Error("Lot 2.1 temporary hero scale is missing.");
if (!skinCss.includes('data-readiness="danger"')) throw new Error("Lot 3.1 readiness skin states are missing.");
if (!skinCss.includes('selected[data-level-state="locked"]')) throw new Error("Lot 3.2 locked selection styling is missing.");
if (!skinCss.includes('data-play-state="completed"')) throw new Error("Lot 3.3 replay styling is missing.");
if (!skinCss.includes('menu-v3-dock-notification:not([hidden])')) throw new Error("Lot 3.3 real chest badge styling is missing.");
if (!responsive.includes("font-size:clamp(7.4px,1.95vw,9px)")) throw new Error("Lot 2.2 compact legend typography is missing.");
if (!responsive.includes("height:clamp(38px,10.2vw,42px)")) throw new Error("Lot 2.2 compact level-node sizing is missing.");
if (!responsive.includes("padding:4px 4px 0")) throw new Error("Lot 2.2 node/legend separation is missing.");
if (!responsive.includes("font-size:clamp(26px,7.2vw,35px)")) throw new Error("Lot 2.2 enlarged play title is missing.");
if (!responsive.includes("gap:5px")) throw new Error("Lot 2.1 world-title spacing is missing.");
if (/<img\b/i.test(components) || /assets\/menu-v3\//.test(components + componentCss + skinCss)) {
  throw new Error("Menu V3 must not load final image assets before Lot 5.");
}

const cssIndex = index.indexOf("menu-v3.components.css?v=0.31.0");
const skinIndex = index.indexOf("menu-v3.skin.css?v=0.33.0");
const responsiveIndex = index.indexOf("menu-v3.responsive.css?v=0.31.2");
const shellIndex = index.indexOf("menu-v3-shell.js?v=0.33.0");
const componentJsIndex = index.indexOf("menu-v3-components.js?v=0.32.1");
const dataJsIndex = index.indexOf("menu-v3-data.js?v=0.34.0");
const interactionsIndex = index.indexOf("menu-v3-interactions.js?v=0.34.0");
const syncIndex = index.indexOf("menu-v3-sync.js?v=0.34.0");

if (cssIndex < 0 || skinIndex < 0 || responsiveIndex < 0 || !(cssIndex < skinIndex && skinIndex < responsiveIndex)) {
  throw new Error("Menu V3 CSS order must be components, skin, then responsive.");
}
if (shellIndex < 0 || componentJsIndex < 0 || dataJsIndex < 0 || interactionsIndex < 0 || syncIndex < 0 || !(shellIndex < componentJsIndex && componentJsIndex < dataJsIndex && dataJsIndex < interactionsIndex && interactionsIndex < syncIndex)) {
  throw new Error("Menu V3 scripts must load in shell, components, data, interactions, sync order.");
}

console.log("Menu V3 component contract passed during Lot 3.4.");
