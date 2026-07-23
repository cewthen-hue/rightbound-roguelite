import fs from "node:fs";

const shell = fs.readFileSync("src/menu-v3/menu-v3-shell.js", "utf8");
const components = fs.readFileSync("src/menu-v3/menu-v3-components.js", "utf8");
const componentCss = fs.readFileSync("styles/menu-v3/menu-v3.components.css", "utf8");
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
  if (!componentCss.includes(`.${className}`) && !responsive.includes(`.${className}`)) {
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

if (!shell.includes('VERSION = "0.31.0-lot2"')) throw new Error("Menu V3 shell is not running the Lot 2 version.");
if (!shell.includes('localStorage.getItem(DEBUG_STORAGE_KEY) === "true"')) {
  throw new Error("Menu V3 debug mode must be disabled by default during Lot 2 review.");
}
if (!components.includes('VERSION = "0.31.0-lot2"')) throw new Error("Menu V3 component version mismatch.");
if (!componentCss.includes("Final sprites remain forbidden before Lot 5")) {
  throw new Error("Menu V3 Lot 2 CSS must explicitly remain sprite-independent.");
}
if (/<img\b/i.test(components) || /assets\/menu-v3\//.test(components + componentCss)) {
  throw new Error("Menu V3 Lot 2 must not load final image assets.");
}

const cssIndex = index.indexOf("menu-v3.components.css?v=0.31.0");
const responsiveIndex = index.indexOf("menu-v3.responsive.css");
const shellIndex = index.indexOf("menu-v3-shell.js?v=0.31.0");
const componentJsIndex = index.indexOf("menu-v3-components.js?v=0.31.0");

if (cssIndex < 0 || responsiveIndex < 0 || cssIndex > responsiveIndex) {
  throw new Error("Menu V3 component CSS must load before responsive rules.");
}
if (shellIndex < 0 || componentJsIndex < 0 || shellIndex > componentJsIndex) {
  throw new Error("Menu V3 shell must load before the component enhancer.");
}

console.log("Menu V3 Lot 2 component contract passed.");
