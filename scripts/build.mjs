import { cp, mkdir, rm, readdir, stat, readFile } from "node:fs/promises";
import { dirname, resolve, extname } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
const publicFiles = [
  "index.html",
  "styles.css",
  "robots.txt",
  "src/main.js",
  "src/appointment-demo.mjs",
  "src/clinic-info.mjs"
];
const publicDirectories = ["assets"];

// Patterns de secrets interdits dans les fichiers publiés (drapeau 'g' requis par matchAll).
const secretPatterns = [
  /\b(API[_-]?KEY|SECRET[_-]?KEY|PRIVATE[_-]?KEY|ACCESS[_-]?TOKEN|AUTH[_-]?TOKEN)\b/gi,
  /\b(ghp_|github_pat_|glpat-|xoxb-|sk_live_|sk_test_)\w+/g
];

// Fichiers/répertoires interdits dans le build (interne, secrets, artefacts locaux).
const forbiddenPaths = [
  ".env",
  ".env.local",
  ".env.production",
  ".git",
  "node_modules",
  "dist",
  "scripts/shots"
];

function isForbidden(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  return forbiddenPaths.some((fp) => normalized === fp || normalized.startsWith(fp + "/"));
}

function scanForSecrets(content, filePath) {
  const findings = [];
  for (const pattern of secretPatterns) {
    for (const match of content.matchAll(pattern)) {
      findings.push({ file: filePath, pattern: pattern.source, match: match[0].slice(0, 40) });
    }
  }
  return findings;
}

async function collectDirectoryFiles(dirRelative) {
  const files = [];
  const absDir = resolve(root, dirRelative);
  const entries = await readdir(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = dirRelative + "/" + entry.name;
    if (isForbidden(rel)) continue;
    if (entry.isDirectory()) {
      files.push(...await collectDirectoryFiles(rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

async function validateSourceExists(relativePath) {
  const abs = resolve(root, relativePath);
  try {
    const statInfo = await stat(abs);
    if (!statInfo.isFile()) {
      throw new Error("Ce n'est pas un fichier : " + relativePath);
    }
  } catch {
    throw new Error("Fichier source manquant pour le build : " + relativePath);
  }
}

const secretFindings = [];

// 1. Valider que tous les fichiers sources déclarés existent et sont exempts de secrets.
for (const relativePath of publicFiles) {
  await validateSourceExists(relativePath);
  if (!isForbidden(relativePath)) {
    const content = await readFile(resolve(root, relativePath), "utf8");
    secretFindings.push(...scanForSecrets(content, relativePath));
  }
}

// 2. Collecter et valider les fichiers du répertoire assets.
const assetFiles = await collectDirectoryFiles("assets");
for (const relativePath of assetFiles) {
  const ext = extname(relativePath).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".svg", ".json", ".webp", ".gif"].includes(ext)) {
    // Les assets binaires ne sont pas scannés en texte (pas de secret attendu).
    continue;
  }
  const content = await readFile(resolve(root, relativePath), "utf8");
  secretFindings.push(...scanForSecrets(content, relativePath));
}

if (secretFindings.length > 0) {
  console.error("ERREUR : secrets détectés dans les fichiers destinés au build :");
  for (const finding of secretFindings) {
    console.error("  " + finding.file + " : " + finding.match + " (pattern " + finding.pattern + ")");
  }
  process.exit(1);
}

// 3. Nettoyer et recréer dist/.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// 4. Copier les fichiers déclarés.
for (const relativePath of publicFiles) {
  const destination = resolve(output, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await cp(resolve(root, relativePath), destination);
}

// 5. Copier les assets (contenu public, aucun secret).
for (const relativeDir of publicDirectories) {
  const destination = resolve(output, relativeDir);
  await mkdir(dirname(destination), { recursive: true });
  await cp(resolve(root, relativeDir), destination, { recursive: true });
}

// 6. Vérifier que tous les fichiers copiés sont présents dans dist/.
const allExpected = [...publicFiles, ...assetFiles.map((f) => f)];
const missing = [];
for (const relativePath of allExpected) {
  try {
    await stat(resolve(output, relativePath));
  } catch {
    missing.push(relativePath);
  }
}
if (missing.length > 0) {
  console.error("ERREUR : fichiers attendus absents de dist/ :");
  for (const path of missing) {
    console.error("  " + path);
  }
  process.exit(1);
}

console.log("Build statique terminé : " + output);
console.log("Fichiers publiables : " + publicFiles.length + " + " + assetFiles.length + " asset(s) ; aucun secret détecté.");
