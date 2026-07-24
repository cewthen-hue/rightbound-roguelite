import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const appShell = fs.readFileSync("src/app-shell.js", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");
const roadmap = fs.readFileSync("docs/MENU_V3_ROADMAP.md", "utf8");
const geometry = fs.readFileSync("src/menu-v3/menu-v3-geometry.js", "utf8");
const geometryCss = fs.readFileSync("styles/menu-v3/menu-v3.geometry.css", "utf8");

if (manifest.orientation !== "portrait-primary") throw new Error("Installed Rightbound must request portrait-primary orientation.");
if (manifest.display !== "standalone") throw new Error("Rightbound must remain installable as a standalone mobile app.");
if (!manifest.categories?.includes("games")) throw new Error("The mobile manifest must declare the games category.");
if (index.includes("orientationNotice") || index.includes("Tourne ton téléphone")) throw new Error("The former landscape rotation prompt must not return.");
if (!appShell.includes('PORTRAIT_ORIENTATION = "portrait-primary"')) throw new Error("Runtime portrait target is missing.");
if (!appShell.includes("orientation.lock(PORTRAIT_ORIENTATION)")) throw new Error("Screen Orientation API portrait lock is missing.");
if (!appShell.includes('document.addEventListener("pointerdown", requestPortraitLockFromGesture')) throw new Error("Portrait lock retry from a user gesture is missing.");
if (!appShell.includes('document.addEventListener("fullscreenchange", requestPortraitLock)')) throw new Error("Portrait lock retry after fullscreen is missing.");
if (!appShell.includes('window.addEventListener("orientationchange"')) throw new Error("Orientation recovery is missing.");
if (!appShell.includes('service-worker.js?v=0.35.1')) throw new Error("Lot 4 reviewed service worker registration is missing.");
if (!index.includes('manifest.webmanifest?v=0.32.1')) throw new Error("Versioned portrait manifest is not loaded.");
if (!index.includes('app-shell.js?v=0.35.1')) throw new Error("Versioned reviewed platform shell is not loaded.");
if (!serviceWorker.includes('rightbound-shell-v0.35.1')) throw new Error("Reviewed mobile platform cache version mismatch.");
if (!geometryCss.includes('body.menu-v3-active #overlay::after')) throw new Error("iPhone bottom continuation correction is missing.");
if (!geometryCss.includes("content:none!important")) throw new Error("Duplicated iPhone bottom band is not disabled.");
for (const profile of ["360x780", "375x812", "390x844", "393x852", "430x932"]) {
  if (!geometry.includes(`id:"${profile}"`)) throw new Error(`Mobile geometry profile missing: ${profile}.`);
}
if (!roadmap.includes("iPhone et Android")) throw new Error("Dual-platform target is missing from roadmap.");
if (!roadmap.includes("Google Play")) throw new Error("Google Play target is missing from roadmap.");

console.log("iPhone and Android portrait platform contract passed after the Lot 4 iPhone review.");
