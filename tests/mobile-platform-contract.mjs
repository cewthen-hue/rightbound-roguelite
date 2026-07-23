import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const appShell = fs.readFileSync("src/app-shell.js", "utf8");
const serviceWorker = fs.readFileSync("service-worker.js", "utf8");
const roadmap = fs.readFileSync("docs/MENU_V3_ROADMAP.md", "utf8");

if (manifest.orientation !== "portrait-primary") {
  throw new Error("Installed Rightbound must request portrait-primary orientation.");
}
if (manifest.display !== "standalone") throw new Error("Rightbound must remain installable as a standalone mobile app.");
if (!manifest.categories?.includes("games")) throw new Error("The mobile manifest must declare the games category.");
if (index.includes("orientationNotice") || index.includes("Tourne ton téléphone")) {
  throw new Error("The former landscape rotation prompt must not return.");
}
if (!appShell.includes('PORTRAIT_ORIENTATION = "portrait-primary"')) {
  throw new Error("Runtime portrait orientation target is missing.");
}
if (!appShell.includes("orientation.lock(PORTRAIT_ORIENTATION)")) {
  throw new Error("Screen Orientation API portrait lock is missing.");
}
if (!appShell.includes('document.addEventListener("pointerdown", requestPortraitLockFromGesture')) {
  throw new Error("Portrait lock retry from a user gesture is missing.");
}
if (!appShell.includes('document.addEventListener("fullscreenchange", requestPortraitLock)')) {
  throw new Error("Portrait lock must be retried after entering fullscreen.");
}
if (!appShell.includes('window.addEventListener("orientationchange"')) {
  throw new Error("Portrait lock recovery after orientation changes is missing.");
}
if (!index.includes('manifest.webmanifest?v=0.32.1')) throw new Error("Versioned portrait manifest is not loaded.");
if (!index.includes('app-shell.js?v=0.32.1')) throw new Error("Versioned platform shell is not loaded.");
if (!serviceWorker.includes('rightbound-shell-v0.33.0')) throw new Error("Mobile platform cache version mismatch.");
if (!roadmap.includes("iPhone et Android")) throw new Error("The dual-platform mobile target is missing from the roadmap.");
if (!roadmap.includes("Google Play")) throw new Error("The Google Play release target is missing from the roadmap.");

console.log("iPhone and Android portrait platform contract passed.");
