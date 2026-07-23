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
  if (!components.includes(`function ${decorator}`)) {
    throw new Error(`Menu V3 Lot 2 decorator missing: ${decorator}.`);
  }
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

for (const state of ["completed", "available", "locked"]) {
  if (!components.includes(`"${state}"`)) throw new Error(`Menu V3 level state missing: ${state}.`);
}

for (const type of ["elite", "boss", "normal"]) {
  if (!components.includes(`"${type}"`)) throw new Error(`Menu V3 level type missing: ${type}.`);
}

if (!shell.includes('VERSION = "0.32.0-lot3.1"')) throw new Error("Menu V3 shell is not running the active Lot 3.1 version.");
if (!shell.includes('localStorage.getItem(DEBUG_STORAGE_KEY) === "true"')) {
  throw new Error("Menu V3 debug mode must remain disabled by default.");
}
if (!components.includes('VERSION = "0.31.1-lot2.1"')) throw new Error("Menu V3 component version mismatch.");
if (!componentCss.includes("Final sprites remain forbidden before Lot 5")) {
  throw new Error("Menu V3 Lot 2 CSS must explicitly remain sprite-independent.");
}
if (!skinCss.includes("no final sprites")) {
  throw new Error("Menu V3 skin must remain independent from final sprites.");
}
if (!skinCss.includes("menu-v3-resource-track")) throw new Error("Lot 2.1 resource spacing refinement is missing.");
if (!skinCss.includes("height:58%")) throw new Error("Lot 2.1 temporary hero scale is missing.");
if (!skinCss.includes('data-readiness="danger"')) throw new Error("Lot 3.1 readiness skin states are missing.");
if (!responsive.includes("font-size:clamp(7.4px,1.95vw,9px)")) {
  throw new Error("Lot 2.2 compact legend typography is missing.");
}
if (!responsive.includes("height:clamp(38px,10.2vw,42px)")) {
  throw new Error("Lot 2.2 compact level-node sizing is missing.");
}
if (!responsive.includes("padding:4px 4px 0")) {
  throw new Error("Lot 2.2 separation between nodes and legend is missing.");
}
if (!responsive.includes("font-size:clamp(26px,7.2vw,35px)")) {
  throw new Error("Lot 2.2 enlarged play-title treatment is missing.");
}
if (!responsive.includes("gap:5px")) throw new Error("Lot 2.1 world-title spacing refinement is missing.");
if (/<img\b/i.test(components) || /assets\/menu-v3\//.test(components + componentCss + skinCss)) {
  throw new Error("Menu V3 must not load final image assets before Lot 5.");
}

const cssIndex = index.indexOf("menu-v3.components.css?v=0.31.0");
const skinIndex = index.indexOf("menu-v3.skin.css?v=0.32.0");
const responsiveIndex = index.indexOf("menu-v3.responsive.css?v=0.31.2");
const shellIndex = index.indexOf("menu-v3-shell.js?v=0.32.0");
const componentJsIndex = index.indexOf("menu-v3-components.js?v=0.31.1");
const dataJsIndex = index.indexOf("menu-v3-data.js?v=0.32.0");

if (cssIndex < 0 || skinIndex < 0 || responsiveIndex < 0 || !(cssIndex < skinIndex && skinIndex < responsiveIndex)) {
  throw new Error("Menu V3 CSS order must be components, skin, then responsive.");
}
if (shellIndex < 0 || componentJsIndex < 0 || dataJsIndex < 0 || !(shellIndex < componentJsIndex && componentJsIndex < dataJsIndex)) {
  throw new Error("Menu V3 scripts must load in shell, components, data order.");
}

console.log("Menu V3 component contract passed during Lot 3.1.");
