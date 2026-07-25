import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const profiles = JSON.parse(fs.readFileSync("tests/menu-v3-visual-profiles.json", "utf8"));
const config = fs.readFileSync("playwright.config.mjs", "utf8");
const visualTest = fs.readFileSync("tests/visual/menu-v3.visual.spec.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/runtime-check.yml", "utf8");
const geometryContract = JSON.parse(fs.readFileSync("assets/menu-v3/geometry-contract.json", "utf8"));
const roadmap = fs.readFileSync("docs/MENU_V3_ROADMAP.md", "utf8");

if (packageJson.devDependencies?.["@playwright/test"] !== "1.54.2") {
  throw new Error("Playwright must remain pinned for reproducible Lot 4.5 checks.");
}
if (packageJson.scripts?.["test:visual"] !== "playwright test --config=playwright.config.mjs") {
  throw new Error("Visual-test package script is missing.");
}
if (profiles.version !== "0.35.1-lot4.5") throw new Error("Lot 4.5 viewport matrix version mismatch.");

const requiredProfiles = [
  "android-compact-360x780",
  "iphone-compact-375x812",
  "iphone-standard-390x844",
  "android-standard-393x852",
  "android-large-430x932"
];
if (profiles.profiles.length !== requiredProfiles.length) throw new Error("Lot 4.5 must contain exactly five reference profiles.");
for (const [index, id] of requiredProfiles.entries()) {
  if (profiles.profiles[index]?.id !== id) throw new Error(`Viewport profile order mismatch: ${id}.`);
}
if (!profiles.profiles.some((profile) => profile.platform === "ios")) throw new Error("At least one iOS simulation profile is required.");
if (!profiles.profiles.some((profile) => profile.platform === "android")) throw new Error("At least one Android simulation profile is required.");
if (profiles.expectations.requiredLevelNodes !== 10) throw new Error("Visual suite must require ten visible level nodes.");
if (profiles.expectations.maximumShellWidth !== 430) throw new Error("Visual suite maximum shell width mismatch.");
if (profiles.stressContent.gold !== "2010") throw new Error("Four-digit Gold stress case is missing.");
if (profiles.stressContent.levelName !== "GARDIEN DES FAUBOURGS") throw new Error("Long level-title stress case is missing.");
if (profiles.stressContent.reward !== "1 COFFRE DIAMANT") throw new Error("Long reward stress case is missing.");

for (const requiredConfig of [
  "serviceWorkers:\"block\"",
  "workers:1",
  "python3 -m http.server 4173",
  "artifacts/menu-v3-visual/html-report",
  "matrix.profiles.map"
]) {
  if (!config.includes(requiredConfig)) throw new Error(`Playwright configuration missing: ${requiredConfig}.`);
}

for (const requiredAssertion of [
  "pageOverflow.horizontal",
  "pageOverflow.vertical",
  "widthWithinLimit",
  "orderedGaps",
  "importantText",
  "requiredLevelNodes",
  "geometryErrors",
  "RightboundMenuV3Geometry?.setDebug?.(true)",
  "normal.png",
  "debug.png",
  "report.json"
]) {
  if (!visualTest.includes(requiredAssertion)) throw new Error(`Visual geometry assertion missing: ${requiredAssertion}.`);
}
for (const storageKey of [
  "rightbound-economy-v1",
  "rightbound-progression-v2",
  "rightbound-selected-level-v1",
  "rightbound-hero-progression-v1"
]) {
  if (!visualTest.includes(storageKey)) throw new Error(`Deterministic visual-test storage seed missing: ${storageKey}.`);
}
if (!visualTest.includes("getPowerScore:() => 109")) throw new Error("Three-digit hero-power stress state is missing.");
if (!visualTest.includes('key:\"danger\"')) throw new Error("Danger readiness stress state is missing.");

for (const workflowStep of [
  "Install Playwright dependencies",
  "Install Chromium",
  "Run Menu V3 multi-viewport visual tests",
  "Upload Menu V3 visual artifacts",
  "npm run test:visual",
  "actions/upload-artifact@v4"
]) {
  if (!workflow.includes(workflowStep)) throw new Error(`GitHub Actions visual step missing: ${workflowStep}.`);
}
if (!workflow.includes("node tests/menu-v3-visual-contract.mjs")) {
  throw new Error("Static Lot 4.5 contract is not executed in CI.");
}
if (!workflow.includes("if: always()")) throw new Error("Visual artifacts must be uploaded even when a viewport fails.");

if (geometryContract.automation?.status !== "active") throw new Error("Geometry contract does not record active Lot 4.5 automation.");
if (geometryContract.automation?.realAndroidStillRequired !== true) {
  throw new Error("Automated Android simulation must not replace later real-device validation.");
}
if (!roadmap.includes("Lot 4.5 — validation automatisée multi-écrans")) {
  throw new Error("Lot 4.5 is missing from the roadmap.");
}

console.log("Menu V3 Lot 4.5 multi-viewport automation contract passed.");
