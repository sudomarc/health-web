import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

/* ------------------------------------------------------------------ */
/* Diaporama du héros                                                 */
/* ------------------------------------------------------------------ */

const html = await readFile("index.html", "utf8");
const css = await readFile("styles.css", "utf8");
const main = await readFile("src/main.js", "utf8");
const manifest = JSON.parse(await readFile("assets/img/manifest.json", "utf8"));
const declared = Object.fromEntries(manifest.images.map((image) => ["./" + image.file, image]));

function heroSlides() {
  return Array.from(html.matchAll(/<img[^>]+class="[^"]*\bhero-slide\b[^>]*>/g));
}

test("le héros contient un diaporama d'au moins deux images", () => {
  assert.ok(heroSlides().length >= 2, "Le diaporama héros doit contenir au moins deux images.");
});

test("chaque image du diaporama est déclarée au manifeste et existe sur le disque", async () => {
  for (const match of heroSlides()) {
    const srcMatch = match[0].match(/src="\.\/([^"]+)"/);
    assert.ok(srcMatch, "Image de diaporama sans src relatif : " + match[0].slice(0, 80));
    const file = "./" + srcMatch[1];
    assert.ok(declared[file], "Image de diaporama non déclarée au manifeste : " + file);
    const info = await stat(file);
    assert.ok(info.isFile() && info.size > 0, "Image de diaporama manquante ou vide : " + file);
  }
});

test("chaque image du diaporama porte un texte alternatif stable", () => {
  for (const match of heroSlides()) {
    assert.ok(/alt="[^"]+"/.test(match[0]), "Image de diaporama sans texte alternatif : " + match[0].slice(0, 80));
  }
});

test("aucune image du diaporama n'est présentée comme une photographie authentique de la clinique", () => {
  for (const match of heroSlides()) {
    const srcMatch = match[0].match(/src="\.\/([^"]+)"/);
    assert.ok(srcMatch, "Image de diaporama sans src : " + match[0].slice(0, 80));
    const entry = declared["./" + srcMatch[1]];
    assert.ok(entry, "Image de diaporama absente du manifeste : " + srcMatch[1]);
    assert.equal(entry.authentic, false, "Image présentée comme authentique : " + srcMatch[1]);
    assert.ok(entry.source, "Source manquante au manifeste : " + srcMatch[1]);
    assert.ok(entry.provider, "Fournisseur manquant au manifeste : " + srcMatch[1]);
    assert.ok(entry.license, "Licence manquante au manifeste : " + srcMatch[1]);
    assert.ok(entry.attribution, "Attribution manquante au manifeste : " + srcMatch[1]);
  }
});

test("le changement d'image s'effectue automatiquement par une minuterie JavaScript", () => {
  assert.ok(/\bsetTimeout\b/.test(main), "Le changement automatique du diaporama doit utiliser un minuteur JavaScript.");
  assert.match(main, /\bhero-slide\b/, "Le diaporama héros doit piloter les éléments .hero-slide en JavaScript.");
  assert.ok(!/setInterval/.test(main), "Une seule minuterie récurrente (setTimeout chainé) est attendue, pas de setInterval.");
});

test("la transition du diaporama utilise l'opacité, jamais une translation", () => {
  assert.ok(/opacity\s*:\s*0[\s\S]{0,200}?opacity\s*:\s*1/.test(css) || /transition[\s\S]{0,160}?opacity/.test(css),
    "La transition du diaporama doit animer l'opacité.");
  const heroCss = css.match(/(\.hero-slide[\s\S]{0,400}?\})/g);
  assert.ok(heroCss && heroCss.some((block) => /opacity/.test(block) && !/translate/.test(block)),
    "Le bloc CSS du diaporama doit animer l'opacité sans translation.");
  assert.ok(!/hero-slide[\s\S]{0,300}?translate/.test(css) && !/hero-media[\s\S]{0,300}?translate/.test(css),
    "Aucune translation (slide gauche-droite) ne doit animer le héros.");
});

test("les chemins des images du diaporama sont relatifs (compatibles avec /health-web/)", () => {
  for (const match of heroSlides()) {
    assert.ok(/src="\.\//.test(match[0]), "Chemin d'image du héros non relatif : " + match[0].slice(0, 100));
    assert.ok(!/src="\//.test(match[0]), "Chemin absolu racine interdit : " + match[0].slice(0, 100));
  }
});

test("un échec de chargement d'image ne laisse pas le héros blanc (image de secours)", () => {
  assert.ok(/hero-clinician\.jpg/.test(main), "Une image de secours doit être prévue en cas d'échec de chargement.");
  assert.match(main, /onerror|hero-slide--failed/, "Les échecs de chargement doivent être détectés en JavaScript.");
  assert.ok(/background:\s*var\(--line\)/.test(css) || /hero-media[\s\S]{0,200}?background/.test(css),
    "Le conteneur héros doit garder un fond visible si les images manquent.");
});

test("la préférence de réduction des mouvements est respectée pour le diaporama", () => {
  assert.match(main, /prefers-reduced-motion/, "Le diaporama doit tenir compte de prefers-reduced-motion.");
  assert.match(css, /@media[\s\S]{0,500}?prefers-reduced-motion: reduce[\s\S]{0,500}?hero-slide/,
    "Le CSS doit neutraliser l'animation du diaporama en mouvement réduit.");
});

test("le héros reste utilisable sans image chargée (texte et badge conservés, fond visible)", () => {
  assert.ok(/class="[^"]*\bhero-media\b[^"]*"[\s\S]{0,120}?aria-label="Diaporama d'illustration de la clinique"/.test(html),
    "Le conteneur héros doit rester présent dans le HTML sans JavaScript.");
  assert.ok(/hero-media[\s\S]{0,300}?background:\s*var\(--line\)/.test(css),
    "Le conteneur héros doit garder un fond visible si les images manquent.");
});