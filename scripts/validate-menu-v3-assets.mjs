import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "assets/menu-v3/asset-manifest.json");
const STYLE_PATH = path.join(ROOT, "assets/menu-v3/style-contract.json");
const GEOMETRY_PATH = path.join(ROOT, "assets/menu-v3/geometry-contract.json");
const STRICT = process.argv.includes("--strict");
const REPORT_ONLY = process.argv.includes("--report-only");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const manifest = readJson(MANIFEST_PATH);
const style = readJson(STYLE_PATH);
const geometry = readJson(GEOMETRY_PATH);
const reportDirectory = path.join(ROOT, manifest.folders.reports);
const report = {
  version:manifest.version,
  generatedAt:new Date().toISOString(),
  mode:STRICT ? "strict" : REPORT_ONLY ? "report-only" : "incremental",
  status:"pending",
  summary:{ assets:manifest.assets.length, inspectedFiles:0, passedFiles:0, errors:0, warnings:0, plannedMissing:0 },
  manifestChecks:[],
  assets:[],
  duplicates:[],
  unmanifestedFiles:[],
  errors:[],
  warnings:[]
};

function relative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function addError(code, message, context = {}) {
  report.errors.push({ code, message, ...context });
}

function addWarning(code, message, context = {}) {
  report.warnings.push({ code, message, ...context });
}

function check(condition, code, message, context = {}) {
  report.manifestChecks.push({ code, status:condition ? "pass" : "fail", message });
  if (!condition) addError(code, message, context);
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes:true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function normalizeFormat(format) {
  if (format === "jpg") return "jpeg";
  return String(format || "").toLowerCase();
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function parseHexColor(hex) {
  const normalized = String(hex).replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) throw new Error(`Invalid hexadecimal color: ${hex}`);
  return {
    red:Number.parseInt(normalized.slice(0, 2), 16),
    green:Number.parseInt(normalized.slice(2, 4), 16),
    blue:Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function percent(value, total) {
  return total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0;
}

function inspectPixels(raw, info, asset, fileSpec) {
  const alphaThreshold = manifest.validationDefaults.magenta.minimumAlpha;
  const magenta = parseHexColor(manifest.validationDefaults.magenta.hex);
  const tolerance = manifest.validationDefaults.magenta.channelTolerance;
  let minimumX = info.width;
  let minimumY = info.height;
  let maximumX = -1;
  let maximumY = -1;
  let opaquePixels = 0;
  let magentaPixels = 0;
  let edgePixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const red = raw[offset];
      const green = raw[offset + 1];
      const blue = raw[offset + 2];
      const alpha = info.channels >= 4 ? raw[offset + 3] : 255;
      if (alpha >= alphaThreshold) {
        opaquePixels += 1;
        minimumX = Math.min(minimumX, x);
        minimumY = Math.min(minimumY, y);
        maximumX = Math.max(maximumX, x);
        maximumY = Math.max(maximumY, y);
        if (x === 0 || y === 0 || x === info.width - 1 || y === info.height - 1) edgePixels += 1;
        if (
          Math.abs(red - magenta.red) <= tolerance &&
          Math.abs(green - magenta.green) <= tolerance &&
          Math.abs(blue - magenta.blue) <= tolerance
        ) {
          magentaPixels += 1;
        }
      }
    }
  }

  const hasContent = opaquePixels > 0;
  const boundingWidth = hasContent ? maximumX - minimumX + 1 : 0;
  const boundingHeight = hasContent ? maximumY - minimumY + 1 : 0;
  const margins = hasContent ? {
    left:percent(minimumX, info.width),
    right:percent(info.width - maximumX - 1, info.width),
    top:percent(minimumY, info.height),
    bottom:percent(info.height - maximumY - 1, info.height)
  } : { left:100, right:100, top:100, bottom:100 };

  return {
    opaquePixels,
    opaqueCoveragePercent:percent(opaquePixels, info.width * info.height),
    magentaPixels,
    edgePixels,
    boundingBox:hasContent ? {
      x:minimumX,
      y:minimumY,
      width:boundingWidth,
      height:boundingHeight,
      widthPercent:percent(boundingWidth, info.width),
      heightPercent:percent(boundingHeight, info.height)
    } : null,
    transparentMarginsPercent:margins,
    alphaExpectation:fileSpec.alpha,
    contentRules:asset.content
  };
}

async function inspectFile(asset, kind, fileSpec) {
  const absolutePath = path.join(ROOT, fileSpec.path);
  const result = {
    kind,
    path:fileSpec.path,
    exists:fs.existsSync(absolutePath),
    status:"pending",
    checks:[],
    errors:[],
    warnings:[]
  };
  if (!result.exists) {
    result.status = "missing";
    return result;
  }

  report.summary.inspectedFiles += 1;
  const fail = (code, message, details = {}) => {
    result.errors.push({ code, message, ...details });
    addError(code, message, { assetId:asset.id, kind, path:fileSpec.path, ...details });
  };
  const pass = (code, message) => result.checks.push({ code, status:"pass", message });
  const fileStats = fs.statSync(absolutePath);
  result.bytes = fileStats.size;
  result.sha256 = sha256(absolutePath);

  const extension = path.extname(fileSpec.path).slice(1).toLowerCase();
  if (extension !== fileSpec.format) fail("asset-extension", `Extension .${extension} incorrecte, .${fileSpec.format} attendue.`);
  else pass("asset-extension", `Extension .${extension} conforme.`);

  if (fileStats.size > fileSpec.maxBytes) fail("asset-weight", `${fileStats.size} octets dépassent la limite de ${fileSpec.maxBytes}.`);
  else pass("asset-weight", `Poids ${fileStats.size}/${fileSpec.maxBytes} octets.`);

  let image;
  let metadata;
  try {
    image = sharp(absolutePath, { failOn:"error" });
    metadata = await image.metadata();
  } catch (error) {
    fail("asset-decode", `Image impossible à décoder : ${error.message}`);
    result.status = "fail";
    return result;
  }

  result.metadata = {
    format:metadata.format,
    width:metadata.width,
    height:metadata.height,
    channels:metadata.channels,
    hasAlpha:Boolean(metadata.hasAlpha),
    space:metadata.space
  };

  if (normalizeFormat(metadata.format) !== normalizeFormat(fileSpec.format)) {
    fail("asset-format", `Format interne ${metadata.format} incorrect, ${fileSpec.format} attendu.`);
  } else pass("asset-format", `Format interne ${metadata.format} conforme.`);

  if (metadata.width !== fileSpec.width || metadata.height !== fileSpec.height) {
    fail("asset-dimensions", `Dimensions ${metadata.width}×${metadata.height} incorrectes, ${fileSpec.width}×${fileSpec.height} attendues.`);
  } else pass("asset-dimensions", `Dimensions ${metadata.width}×${metadata.height} conformes.`);

  const expectedRatio = fileSpec.width / fileSpec.height;
  const actualRatio = (metadata.width || 0) / (metadata.height || 1);
  if (Math.abs(actualRatio - expectedRatio) > manifest.validationDefaults.ratioTolerance) {
    fail("asset-ratio", `Ratio ${actualRatio.toFixed(4)} hors tolérance autour de ${expectedRatio.toFixed(4)}.`);
  } else pass("asset-ratio", `Ratio ${actualRatio.toFixed(4)} conforme.`);

  if (fileSpec.alpha === "required" && !metadata.hasAlpha) fail("asset-alpha", "Canal alpha obligatoire mais absent.");
  else if (fileSpec.alpha === "forbidden" && metadata.hasAlpha) fail("asset-alpha", "Canal alpha interdit mais présent.");
  else pass("asset-alpha", `Règle alpha « ${fileSpec.alpha} » respectée.`);

  try {
    const { data, info } = await sharp(absolutePath).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
    result.pixelAnalysis = inspectPixels(data, info, asset, fileSpec);
    const analysis = result.pixelAnalysis;
    const maximumMagenta = manifest.validationDefaults.magenta.maximumPixels;
    if (analysis.magentaPixels > maximumMagenta) {
      fail("asset-magenta", `${analysis.magentaPixels} pixels magenta détectés, maximum ${maximumMagenta}.`);
    } else pass("asset-magenta", "Aucun pixel magenta résiduel détecté.");

    if (fileSpec.alpha === "required") {
      if (!analysis.boundingBox) {
        fail("asset-empty", "Aucun pixel visible détecté.");
      } else {
        const minimumWidth = asset.content.minimumWidthPercent;
        const minimumHeight = asset.content.minimumHeightPercent;
        if (analysis.boundingBox.widthPercent < minimumWidth) {
          fail("asset-content-width", `Zone utile large de ${analysis.boundingBox.widthPercent} %, minimum ${minimumWidth} %.`);
        } else pass("asset-content-width", `Largeur utile ${analysis.boundingBox.widthPercent} % conforme.`);
        if (analysis.boundingBox.heightPercent < minimumHeight) {
          fail("asset-content-height", `Zone utile haute de ${analysis.boundingBox.heightPercent} %, minimum ${minimumHeight} %.`);
        } else pass("asset-content-height", `Hauteur utile ${analysis.boundingBox.heightPercent} % conforme.`);

        const maximumMargin = asset.content.maximumTransparentMarginPercentPerSide;
        for (const [side, margin] of Object.entries(analysis.transparentMarginsPercent)) {
          if (margin > maximumMargin) fail("asset-transparent-margin", `Marge transparente ${side} de ${margin} %, maximum ${maximumMargin} %.`, { side, margin });
          else pass(`asset-transparent-margin-${side}`, `Marge ${side} ${margin} % conforme.`);
        }
      }
      if (asset.content.clearEdgeRequired && analysis.edgePixels > 0) {
        fail("asset-edge-contact", `${analysis.edgePixels} pixels visibles touchent le bord du canvas.`);
      } else if (asset.content.clearEdgeRequired) pass("asset-edge-contact", "Aucun pixel visible ne touche le bord.");
    }
  } catch (error) {
    fail("asset-pixel-analysis", `Analyse des pixels impossible : ${error.message}`);
  }

  result.status = result.errors.length > 0 ? "fail" : "pass";
  if (result.status === "pass") report.summary.passedFiles += 1;
  return result;
}

function validateManifest() {
  check(manifest.version === "0.36.0-lot5.0", "manifest-version", "Version du manifeste Lot 5.0 conforme.");
  check(manifest.styleId === style.version, "manifest-style", "Style ID lié au contrat artistique.");
  check(manifest.geometryContract === "assets/menu-v3/geometry-contract.json", "manifest-geometry-path", "Contrat géométrique référencé.");
  check(manifest.assets.length >= 20, "manifest-asset-count", "Le manifeste couvre la bibliothèque principale du Menu V3.");

  const ids = manifest.assets.map((asset) => asset.id);
  check(new Set(ids).size === ids.length, "manifest-unique-ids", "Identifiants d’assets uniques.");
  const filePaths = manifest.assets.flatMap((asset) => [asset.source.path, asset.runtime.path]);
  check(new Set(filePaths).size === filePaths.length, "manifest-unique-paths", "Chemins source et runtime uniques.");

  const geometrySlots = new Set(geometry.assetSlots.map((slot) => slot.id));
  const allowedStatuses = new Set(manifest.lifecycle.allowedStatuses);
  for (const asset of manifest.assets) {
    if (!allowedStatuses.has(asset.status)) addError("manifest-status", `Statut inconnu pour ${asset.id}: ${asset.status}.`, { assetId:asset.id });
    if (!geometrySlots.has(asset.slot)) addError("manifest-slot", `Slot géométrique inconnu pour ${asset.id}: ${asset.slot}.`, { assetId:asset.id });
    if (!style.production.pilotAssets.includes(asset.id) && asset.pilotOrder) addError("manifest-pilot-order", `${asset.id} ne doit pas posséder pilotOrder.`, { assetId:asset.id });
    if (!["contain", "cover", "nine-slice"].includes(asset.mode)) addError("manifest-mode", `Mode de rendu invalide pour ${asset.id}.`, { assetId:asset.id });
    if (!/^\d+% \d+%$/.test(asset.anchor)) addError("manifest-anchor", `Ancre invalide pour ${asset.id}: ${asset.anchor}.`, { assetId:asset.id });
  }
  const orderedPilots = manifest.assets.filter((asset) => asset.pilotOrder).sort((a, b) => a.pilotOrder - b.pilotOrder).map((asset) => asset.id);
  check(JSON.stringify(orderedPilots) === JSON.stringify(style.production.pilotAssets), "manifest-pilot-order", "Ordre des trois pilotes conforme au contrat artistique.");
}

function findUnmanifestedFiles() {
  const allowed = new Set(manifest.validationDefaults.allowedIgnoredFiles);
  const declared = new Set(manifest.assets.flatMap((asset) => [asset.source.path, asset.runtime.path]));
  for (const folderKey of ["source", "runtime"]) {
    const directory = path.join(ROOT, manifest.folders[folderKey]);
    for (const filePath of listFiles(directory)) {
      const rel = relative(filePath);
      if (allowed.has(path.basename(filePath))) continue;
      if (!declared.has(rel)) {
        report.unmanifestedFiles.push(rel);
        addError("asset-unmanifested", `Fichier non déclaré dans le manifeste : ${rel}.`, { path:rel });
      }
    }
  }
}

async function validateAssets() {
  const runtimeHashes = new Map();
  for (const asset of manifest.assets) {
    const sourceExists = fs.existsSync(path.join(ROOT, asset.source.path));
    const runtimeExists = fs.existsSync(path.join(ROOT, asset.runtime.path));
    const assetReport = {
      id:asset.id,
      family:asset.family,
      status:asset.status,
      slot:asset.slot,
      mode:asset.mode,
      anchor:asset.anchor,
      presence:{ source:sourceExists, runtime:runtimeExists },
      files:[]
    };

    const sourceRequired = STRICT || asset.status === "candidate" || asset.status === "approved";
    const runtimeRequired = STRICT || asset.status === "approved";
    if (asset.status === "retired") {
      if (runtimeExists) addError("asset-retired-runtime", `Asset retiré encore présent dans runtime : ${asset.id}.`, { assetId:asset.id });
    } else {
      if (sourceRequired && !sourceExists) addError("asset-source-missing", `Source obligatoire manquante : ${asset.source.path}.`, { assetId:asset.id });
      if (runtimeRequired && !runtimeExists) addError("asset-runtime-missing", `Runtime obligatoire manquant : ${asset.runtime.path}.`, { assetId:asset.id });
      if (!sourceExists && !runtimeExists && asset.status === "planned") report.summary.plannedMissing += 1;
      if (runtimeExists && !sourceExists) addError("asset-source-runtime-pair", `Runtime présent sans source maître : ${asset.id}.`, { assetId:asset.id });
    }

    if (sourceExists) assetReport.files.push(await inspectFile(asset, "source", asset.source));
    if (runtimeExists) {
      const runtimeResult = await inspectFile(asset, "runtime", asset.runtime);
      assetReport.files.push(runtimeResult);
      if (runtimeResult.sha256) {
        const duplicate = runtimeHashes.get(runtimeResult.sha256);
        if (duplicate) {
          const pair = [duplicate, asset.id];
          report.duplicates.push(pair);
          addError("asset-duplicate", `Fichiers runtime identiques : ${duplicate} et ${asset.id}.`, { assets:pair });
        } else runtimeHashes.set(runtimeResult.sha256, asset.id);
      }
    }
    report.assets.push(assetReport);
  }
}

function writeReports() {
  report.summary.errors = report.errors.length;
  report.summary.warnings = report.warnings.length;
  report.status = report.errors.length > 0 ? "fail" : "pass";
  fs.mkdirSync(reportDirectory, { recursive:true });
  fs.writeFileSync(path.join(reportDirectory, "report.json"), JSON.stringify(report, null, 2));

  const lines = [
    "# Rapport de validation des assets Menu V3",
    "",
    `- Version : \`${report.version}\``,
    `- Mode : \`${report.mode}\``,
    `- Statut : **${report.status.toUpperCase()}**`,
    `- Assets déclarés : ${report.summary.assets}`,
    `- Fichiers inspectés : ${report.summary.inspectedFiles}`,
    `- Fichiers conformes : ${report.summary.passedFiles}`,
    `- Assets planifiés sans fichier : ${report.summary.plannedMissing}`,
    `- Erreurs : ${report.summary.errors}`,
    `- Avertissements : ${report.summary.warnings}`,
    "",
    "## État des assets",
    "",
    "| Asset | Cycle | Source | Runtime | Résultat |",
    "|---|---|---:|---:|---|"
  ];
  for (const asset of report.assets) {
    const failed = asset.files.some((file) => file.status === "fail");
    lines.push(`| \`${asset.id}\` | ${asset.status} | ${asset.presence.source ? "oui" : "non"} | ${asset.presence.runtime ? "oui" : "non"} | ${failed ? "échec" : asset.files.length ? "conforme" : "planifié"} |`);
  }
  if (report.errors.length) {
    lines.push("", "## Erreurs", "");
    for (const error of report.errors) lines.push(`- **${error.code}** — ${error.message}`);
  }
  if (report.warnings.length) {
    lines.push("", "## Avertissements", "");
    for (const warning of report.warnings) lines.push(`- **${warning.code}** — ${warning.message}`);
  }
  fs.writeFileSync(path.join(reportDirectory, "report.md"), `${lines.join("\n")}\n`);
}

try {
  validateManifest();
  findUnmanifestedFiles();
  await validateAssets();
} catch (error) {
  addError("validator-crash", error.stack || error.message);
} finally {
  writeReports();
}

const summary = report.summary;
console.log(`[Menu V3 assets] ${report.status.toUpperCase()} — ${summary.inspectedFiles} fichier(s) inspecté(s), ${summary.plannedMissing} asset(s) planifié(s), ${summary.errors} erreur(s).`);
console.log(`[Menu V3 assets] Rapports : ${relative(path.join(reportDirectory, "report.json"))} et ${relative(path.join(reportDirectory, "report.md"))}`);

if (report.errors.length > 0 && !REPORT_ONLY) process.exitCode = 1;
