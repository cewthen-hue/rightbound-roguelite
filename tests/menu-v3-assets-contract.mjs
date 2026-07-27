import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("assets/menu-v3/asset-manifest.json", "utf8"));
const style = JSON.parse(fs.readFileSync("assets/menu-v3/style-contract.json", "utf8"));
const geometry = JSON.parse(fs.readFileSync("assets/menu-v3/geometry-contract.json", "utf8"));
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const validator = fs.readFileSync("scripts/validate-menu-v3-assets.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/runtime-check.yml", "utf8");
const documentation = fs.readFileSync("docs/MENU_V3_ASSET_PIPELINE.md", "utf8");

if (manifest.version !== "0.36.0-lot5.0") throw new Error("Menu V3 asset manifest version mismatch.");
if (manifest.status !== "pipeline-active-assets-planned") throw new Error("Lot 5.0 pipeline status mismatch.");
if (manifest.styleId !== "RIGHTBOUND_STYLE_V1" || manifest.styleId !== style.version) {
  throw new Error("Asset manifest is not linked to the locked Style ID.");
}
if (manifest.geometryContract !== "assets/menu-v3/geometry-contract.json") {
  throw new Error("Asset manifest geometry contract path mismatch.");
}
if (manifest.assets.length !== 24) throw new Error(`Menu V3 manifest must contain 24 assets, found ${manifest.assets.length}.`);

const requiredStatuses = ["planned", "candidate", "approved", "retired"];
if (JSON.stringify(manifest.lifecycle.allowedStatuses) !== JSON.stringify(requiredStatuses)) {
  throw new Error("Asset lifecycle states mismatch.");
}
if (manifest.lifecycle.candidateRequiresSource !== true) throw new Error("Candidate source requirement is missing.");
if (manifest.lifecycle.approvedRequiresSourceAndRuntime !== true) throw new Error("Approved source/runtime requirement is missing.");
if (manifest.lifecycle.retiredMustNotExistInRuntime !== true) throw new Error("Retired runtime prohibition is missing.");
if (manifest.validationDefaults.duplicateRuntimeFilesForbidden !== true) throw new Error("Runtime duplicate protection is missing.");
if (manifest.validationDefaults.unmanifestedFilesForbidden !== true) throw new Error("Unmanifested-file protection is missing.");
if (manifest.validationDefaults.magenta.hex !== "#FF00FF") throw new Error("Technical magenta color mismatch.");
if (manifest.validationDefaults.magenta.maximumPixels !== 0) throw new Error("Runtime magenta tolerance must remain zero pixels.");

const ids = manifest.assets.map((asset) => asset.id);
if (new Set(ids).size !== ids.length) throw new Error("Asset IDs must remain unique.");
const paths = manifest.assets.flatMap((asset) => [asset.source.path, asset.runtime.path]);
if (new Set(paths).size !== paths.length) throw new Error("Asset source/runtime paths must remain unique.");

const requiredAssets = [
  "stage-background", "stage-hero", "stage-frame", "hero-portrait",
  "resource-gold", "resource-gems", "resource-energy",
  "utility-options", "utility-journal", "world-ribbon",
  "stat-power", "stat-reward",
  "level-node-normal", "level-node-completed", "level-node-locked",
  "level-node-elite", "level-node-boss", "level-node-selected-overlay",
  "play-frame", "play-icon",
  "dock-expedition", "dock-equipment", "dock-chests", "dock-shop"
];
for (const id of requiredAssets) {
  if (!ids.includes(id)) throw new Error(`Required Menu V3 asset missing: ${id}.`);
}

const pilots = manifest.assets
  .filter((asset) => Number.isInteger(asset.pilotOrder))
  .sort((left, right) => left.pilotOrder - right.pilotOrder)
  .map((asset) => asset.id);
if (JSON.stringify(pilots) !== JSON.stringify(style.production.pilotAssets)) {
  throw new Error("Manifest pilot order does not match the style contract.");
}

const geometrySlots = new Set(geometry.assetSlots.map((slot) => slot.id));
for (const asset of manifest.assets) {
  if (asset.status !== "planned") throw new Error(`All Lot 5.0 assets must initially remain planned: ${asset.id}.`);
  if (!geometrySlots.has(asset.slot)) throw new Error(`Unknown geometry slot for ${asset.id}: ${asset.slot}.`);
  if (!["contain", "cover", "nine-slice"].includes(asset.mode)) throw new Error(`Invalid render mode for ${asset.id}.`);
  if (!/^\d+% \d+%$/.test(asset.anchor)) throw new Error(`Invalid anchor for ${asset.id}.`);
  for (const kind of ["source", "runtime"]) {
    const spec = asset[kind];
    if (!spec.path.startsWith(`assets/menu-v3/${kind}/`)) throw new Error(`${asset.id} ${kind} path is outside its canonical folder.`);
    if (!Number.isInteger(spec.width) || !Number.isInteger(spec.height) || spec.width <= 0 || spec.height <= 0) {
      throw new Error(`${asset.id} ${kind} dimensions are invalid.`);
    }
    if (!Number.isInteger(spec.maxBytes) || spec.maxBytes <= 0) throw new Error(`${asset.id} ${kind} weight limit is invalid.`);
    if (!["png", "webp"].includes(spec.format)) throw new Error(`${asset.id} ${kind} format is unsupported.`);
    if (!["required", "forbidden"].includes(spec.alpha)) throw new Error(`${asset.id} ${kind} alpha rule is invalid.`);
  }
  if (asset.content.minimumWidthPercent <= 0 || asset.content.minimumWidthPercent > 100) throw new Error(`${asset.id} minimum content width is invalid.`);
  if (asset.content.minimumHeightPercent <= 0 || asset.content.minimumHeightPercent > 100) throw new Error(`${asset.id} minimum content height is invalid.`);
  if (asset.content.maximumTransparentMarginPercentPerSide < 0 || asset.content.maximumTransparentMarginPercentPerSide > 100) {
    throw new Error(`${asset.id} transparent margin rule is invalid.`);
  }
}

const stageBackground = manifest.assets.find((asset) => asset.id === "stage-background");
if (stageBackground.runtime.format !== "webp" || stageBackground.runtime.alpha !== "forbidden") {
  throw new Error("Stage background must remain an opaque WebP runtime asset.");
}
const stageHero = manifest.assets.find((asset) => asset.id === "stage-hero");
if (stageHero.runtime.width !== 512 || stageHero.runtime.height !== 1280 || stageHero.anchor !== "50% 100%") {
  throw new Error("Stage hero runtime geometry mismatch.");
}
const nodes = manifest.assets.filter((asset) => asset.family.startsWith("level-node"));
if (nodes.some((asset) => asset.runtime.width !== 128 || asset.runtime.height !== 160)) {
  throw new Error("Level-node runtime dimensions must remain 128×160.");
}

if (packageJson.version !== "0.36.0") throw new Error("Package version is not aligned with Lot 5.0.");
if (packageJson.devDependencies?.sharp !== "0.34.3") throw new Error("Sharp must remain pinned for reproducible image inspection.");
for (const scriptName of ["test:assets", "test:assets:strict", "report:assets"]) {
  if (!packageJson.scripts?.[scriptName]) throw new Error(`Package asset script missing: ${scriptName}.`);
}

for (const requiredImplementation of [
  "sharp",
  "asset-unmanifested",
  "asset-dimensions",
  "asset-ratio",
  "asset-alpha",
  "asset-magenta",
  "asset-transparent-margin",
  "asset-edge-contact",
  "asset-duplicate",
  "asset-source-runtime-pair",
  "report.json",
  "report.md",
  "--strict",
  "--report-only"
]) {
  if (!validator.includes(requiredImplementation)) throw new Error(`Asset validator capability missing: ${requiredImplementation}.`);
}
if (!validator.includes("crypto.createHash(\"sha256\")")) throw new Error("SHA-256 duplicate detection is missing.");
if (!validator.includes("ensureAlpha().raw()")) throw new Error("Pixel-level alpha analysis is missing.");
if (!validator.includes("metadata.hasAlpha")) throw new Error("Image alpha metadata validation is missing.");

for (const workflowRequirement of [
  "Validate Menu V3 Lot 5.0 asset pipeline contract",
  "Run Menu V3 incremental asset validation",
  "Upload Menu V3 asset validation reports",
  "npm run test:assets",
  "menu-v3-lot-5-0-assets-${{ github.sha }}",
  "artifacts/menu-v3-assets",
  "if: always()"
]) {
  if (!workflow.includes(workflowRequirement)) throw new Error(`GitHub Actions asset pipeline requirement missing: ${workflowRequirement}.`);
}

for (const documentationRequirement of [
  "Version : `0.36.0-lot5.0`",
  "24 assets",
  "npm run test:assets",
  "npm run test:assets:strict",
  "pixels proches de `#FF00FF`",
  "empreinte SHA-256",
  "stage-background",
  "stage-hero",
  "stage-frame"
]) {
  if (!documentation.includes(documentationRequirement)) throw new Error(`Asset pipeline documentation missing: ${documentationRequirement}.`);
}

console.log("Menu V3 Lot 5.0 asset pipeline contract passed.");
