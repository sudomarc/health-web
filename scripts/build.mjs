import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

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

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const relativePath of publicFiles) {
  const destination = resolve(output, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await cp(resolve(root, relativePath), destination);
}

// Copie récursive des images et du manifeste d'assets (contenu libre, aucun secret).
for (const relativeDir of publicDirectories) {
  const destination = resolve(output, relativeDir);
  await mkdir(dirname(destination), { recursive: true });
  await cp(resolve(root, relativeDir), destination, { recursive: true });
}

console.log("Build statique terminé : " + output);
console.log("Fichiers publiables : " + publicFiles.length + " + répertoire(s) assets ; aucune dépendance ou secret ajouté.");
