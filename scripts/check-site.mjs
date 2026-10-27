import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const html = await readFile("index.html", "utf8");
const clientCode = await readFile("src/main.js", "utf8") +
  "\n" + await readFile("src/appointment-demo.mjs", "utf8");
const css = await readFile("styles.css", "utf8");
const robots = await readFile("robots.txt", "utf8");
const root = process.cwd();

// Ressources publiques déclarées par le build : toutes doivent exister sur le disque.
const publicFiles = [
  "index.html",
  "styles.css",
  "robots.txt",
  "src/main.js",
  "src/appointment-demo.mjs",
  "src/clinic-info.mjs"
];
for (const relativePath of publicFiles) {
  await stat(resolve(root, relativePath));
}

// Toute ressource locale référencée (images, scripts, feuilles de style) doit exister.
// Cela empêche les images cassées ou les liens fantômes d'atteindre la production.
const referencedAssets = new Set();
for (const match of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) {
  referencedAssets.add(match[1]);
}
for (const relativePath of referencedAssets) {
  await stat(resolve(root, relativePath));
}

// Aucune ressource locale ne doit être référencée par un chemin absolu racine
// (ex: /styles.css, /src/main.js). Sur un site GitHub Pages de projet servi
// sous /health-web/, de tels chemins visent la racine du domaine et renvoient 404.
for (const match of html.matchAll(/(?:href|src)="\/([^"]+)"/g)) {
  assert.fail("Référence absolue racine détectée : /" + match[1] +
    " (incompatible avec le sous-chemin GitHub Pages ; utiliser un chemin relatif)");
}

assert.match(html, /<html lang="fr">/, "La langue principale doit être déclarée.");
assert.match(html, /name="robots" content="noindex, nofollow, noarchive, nosnippet"/, "Le prototype doit rester hors index.");
assert.match(html, /Prototype indépendant — non officiel/, "La mention de prototype doit rester visible.");
assert.match(robots, /User-agent:\s*\*\s*Disallow:\s*\//, "robots.txt doit interdire l'exploration.");
assert.match(html, /<main id="contenu">/, "Un élément main doit être présent.");
assert.match(html, /class="skip-link" href="#contenu"/, "Le lien d'évitement clavier est requis.");
assert.match(html, /aria-label="Navigation principale"/, "La navigation doit être nommée.");
assert.match(html, /aria-expanded="false" aria-controls="navigation-principale"/, "Le menu doit exposer son état.");
assert.match(html, /<form class="request-form" id="demo-form">/, "Le formulaire de démonstration doit exister.");
assert.match(html, /name="preferredDate"/, "Le formulaire doit proposer une date.");
assert.match(html, /id="form-status" role="status" aria-live="polite"/, "Le retour du formulaire doit être annoncé.");
assert.match(html, /Aucune demande n'a été envoyée ni enregistrée/, "La simulation doit être explicitement signalée.");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "La préférence de mouvement réduit doit être respectée.");
assert.match(css, /:focus-visible/, "Les états de focus doivent être visibles.");
assert.doesNotMatch(clientCode, /\bfetch\s*\(|\bXMLHttpRequest\b|localStorage|sessionStorage|sendBeacon|document\.cookie/, "La démo ne doit pas transmettre ou persister les données.");

const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.has(match[1]), "Ancre interne sans cible : #" + match[1]);
}

const labelTargets = new Set(Array.from(html.matchAll(/<label[^>]+for="([^"]+)"/g), (match) => match[1]));
for (const fieldId of ["service", "preferred-date", "period"]) {
  assert.ok(ids.has(fieldId), "Champ manquant : " + fieldId);
  assert.ok(labelTargets.has(fieldId), "Champ sans libellé explicite : " + fieldId);
}

assert.match(html, /<meta name="description"/, "La description est manquante.");

// --- Contrôles d'accessibilité et d'intégrité des nouvelles sections ---

// Chaque bouton d'accordéon FAQ doit contrôler une région réellement présente.
for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
  assert.ok(ids.has(match[1]), "aria-controls pointe vers une cible inexistante : #" + match[1]);
}

// Toute image référencée doit avoir un attribut alt (informatif ou vide si décorative).
for (const match of html.matchAll(/<img[^>]*>/g)) {
  assert.ok(/alt="[^"]*"/.test(match[0]), "Image sans attribut alt : " + match[0].slice(0, 80));
}

// Les liens téléphoniques ne doivent contenir que le numéro documenté sur la source.
// Cela interdit d'inventer un numéro de téléphone dans une nouvelle section.
const allowedTelLinks = new Set(["tel:+224627493327"]);
for (const match of html.matchAll(/href="(tel:[^"]+)"/g)) {
  assert.ok(allowedTelLinks.has(match[1]), "Lien téléphonique non documenté : " + match[1]);
}

// Les liens mailto ne doivent contenir que l'adresse relevée sur la source.
const allowedMailLinks = new Set(["mailto:contact@internationalclinic.ma"]);
for (const match of html.matchAll(/href="(mailto:[^"]+)"/g)) {
  assert.ok(allowedMailLinks.has(match[1]), "Lien email non documenté : " + match[1]);
}

// Le mouvement réduit doit aussi neutraliser les apparitions au défilement.
assert.match(css, /\.reveal\s*\{\s*opacity:\s*1;\s*transform:\s*none;/, "Les apparitions doivent être neutralisées en mouvement réduit.");

console.log("Contrôle statique réussi : métadonnées, ancres, formulaire local, sécurité de base, focus, images, FAQ et coordonnées documentées.");
