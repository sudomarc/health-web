import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
const publicFiles = [
  "index.html",
  "styles.css",
  "robots.txt",
  "src/main.js",
  "src/appointment-demo.mjs"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const relativePath of publicFiles) {
  const destination = resolve(output, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await cp(resolve(root, relativePath), destination);
}

console.log("Build statique terminé : " + output);
console.log("Fichiers publiables : " + publicFiles.length + " ; aucune dépendance ou secret ajouté.");
