import fs from "node:fs";

const style = JSON.parse(fs.readFileSync("assets/menu-v3/style-contract.json", "utf8"));
const geometry = JSON.parse(fs.readFileSync("assets/menu-v3/geometry-contract.json", "utf8"));
const charter = fs.readFileSync("docs/MENU_V3_ART_DIRECTION.md", "utf8");
const roadmap = fs.readFileSync("docs/MENU_V3_ROADMAP.md", "utf8");
const readme = fs.readFileSync("assets/menu-v3/README.md", "utf8");

if (style.version !== "RIGHTBOUND_STYLE_V1") throw new Error("Official Rightbound style ID mismatch.");
if (style.status !== "locked-preproduction") throw new Error("Art direction must remain locked during preproduction.");
if (style.scope !== "menu-v3") throw new Error("Style contract scope mismatch.");
if (style.visualDirection.medium !== "premium-2d-cartoon-game-illustration") {
  throw new Error("Official medium must remain premium 2D cartoon game illustration.");
}
if (style.visualDirection.realism !== "stylized-cartoon") throw new Error("Official realism level must remain stylized cartoon.");

for (const forbidden of [
  "semi-realistic",
  "photorealistic",
  "3d-render",
  "flat-vector",
  "chibi",
  "anime",
  "children-cartoon"
]) {
  if (!style.visualDirection.forbiddenDirections.includes(forbidden)) {
    throw new Error(`Forbidden visual direction missing: ${forbidden}.`);
  }
}

if (style.shapeLanguage.characterHeadToBodyRange !== "1:6.5 to 1:7") {
  throw new Error("Adult heroic character proportion range mismatch.");
}
const hierarchy = style.shapeLanguage.detailHierarchy;
if (hierarchy.largeShapesPercent !== 70 || hierarchy.mediumShapesPercent !== 20 || hierarchy.smallDetailsPercent !== 10) {
  throw new Error("70/20/10 detail hierarchy mismatch.");
}

if (style.rendering.lighting.keyDirection !== "upper-left") throw new Error("Official light direction must remain upper-left.");
if (style.rendering.shading !== "two-to-three-large-value-groups-with-soft-selective-blending") {
  throw new Error("Official cartoon shading model mismatch.");
}

const requiredPalette = {
  deepTeal:"#071B24",
  panelTeal:"#123745",
  oliveGreen:"#617F37",
  agedGold:"#D6AA4E",
  bronze:"#9B6B35",
  parchment:"#F2E7C9",
  elitePurple:"#8E4BA7",
  bossRed:"#B93A3A"
};
for (const [name, value] of Object.entries(requiredPalette)) {
  if (style.palette[name] !== value) throw new Error(`Official palette mismatch for ${name}.`);
}

const previewSizes = style.mobileReadability.mandatoryPreviewSizesPx;
if (JSON.stringify(previewSizes) !== JSON.stringify([32, 40, 64])) {
  throw new Error("Mobile preview sizes must remain 32, 40 and 64 px.");
}
if (style.mobileReadability.iconInteriorPlanesMaximum !== 3) throw new Error("Icon interior-plane limit mismatch.");
if (style.mobileReadability.textInsideSpritesForbidden !== true) throw new Error("Text inside sprites must remain forbidden.");

const pilotAssets = style.production.pilotAssets;
if (JSON.stringify(pilotAssets) !== JSON.stringify(["stage-background", "stage-hero", "stage-frame"])) {
  throw new Error("Pilot asset order must remain background, hero, frame.");
}
if (style.production.oneAssetPerTicket !== true) throw new Error("One-asset-per-ticket rule is missing.");
if (style.production.spriteSheetsForbiddenDuringGeneration !== true) throw new Error("Generation sprite sheets must remain forbidden.");
if (style.production.maxCandidatesPerRound !== 3) throw new Error("Maximum candidates per round must remain three.");
if (style.production.batchGenerationBeforePilotApprovalForbidden !== true) {
  throw new Error("Mass generation must remain blocked before pilot approval.");
}
if (style.production.styleIdMustAppearInEveryTicket !== true) throw new Error("Style ID ticket requirement is missing.");
if (style.production.geometryContractMustBeReferencedInEveryTicket !== true) {
  throw new Error("Geometry contract ticket requirement is missing.");
}

if (style.files.sourceFolder !== "assets/menu-v3/source/") throw new Error("Source asset folder mismatch.");
if (style.files.runtimeFolder !== "assets/menu-v3/runtime/") throw new Error("Runtime asset folder mismatch.");
if (style.files.referenceFolder !== "assets/menu-v3/references/") throw new Error("Reference asset folder mismatch.");
if (style.files.transparentFallbackChroma !== "#FF00FF") throw new Error("Technical chroma fallback mismatch.");
if (style.files.magentaAllowedInFinalRuntimeAssets !== false) throw new Error("Magenta must remain forbidden in runtime assets.");

if (style.acceptance.minimumScore !== 9 || style.acceptance.maximumScore !== 10) {
  throw new Error("Asset approval threshold must remain 9/10.");
}
if (style.acceptance.criteria.length !== 5) throw new Error("Acceptance grid must contain five criteria.");
const totalPoints = style.acceptance.criteria.reduce((total, criterion) => total + criterion.maximumPoints, 0);
if (totalPoints !== 10) throw new Error("Acceptance grid must total ten points.");

if (style.promptContract.mandatoryStyleId !== "RIGHTBOUND_STYLE_V1") throw new Error("Prompt Style ID mismatch.");
for (const phrase of [
  "Illustration 2D cartoon premium",
  "jeu mobile RPG fantasy médiéval",
  "lisibles sur petit écran",
  "lumière principale venant du haut gauche"
]) {
  if (!style.promptContract.canonicalStyleBlock.includes(phrase)) {
    throw new Error(`Canonical style block is missing: ${phrase}.`);
  }
}

if (geometry.styleContract !== "style-contract.json") throw new Error("Geometry contract is not linked to the style contract.");
if (geometry.requiredStyleId !== "RIGHTBOUND_STYLE_V1") throw new Error("Geometry contract does not require the official Style ID.");

for (const text of [
  "RPG fantasy médiéval 2D cartoon premium",
  "RIGHTBOUND_STYLE_V1",
  "70 % grandes formes",
  "au moins 9/10",
  "stage-background",
  "stage-hero",
  "stage-frame"
]) {
  if (!charter.includes(text)) throw new Error(`Art direction charter is missing: ${text}.`);
}
if (!charter.includes("Cette charte remplace toute ancienne formulation orientée « semi-réaliste »")) {
  throw new Error("The semi-realistic direction replacement is not explicit.");
}
if (!roadmap.includes("Style ID officiel : `RIGHTBOUND_STYLE_V1`")) throw new Error("Roadmap Style ID is missing.");
if (!roadmap.includes("un seul asset est produit par ticket")) throw new Error("Roadmap one-asset-per-ticket rule is missing.");
if (!roadmap.includes("trois candidats maximum par round")) throw new Error("Roadmap candidate limit is missing.");
if (!readme.includes("RPG fantasy médiéval 2D cartoon premium")) throw new Error("Asset README visual direction is missing.");
if (!readme.includes("style-contract.json")) throw new Error("Asset README style contract link is missing.");

console.log("Rightbound Menu V3 2D cartoon style contract passed.");
