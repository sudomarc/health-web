import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { clinicInfo, specialties, PLACEHOLDERS, collectPendingConfirmations } from "../src/clinic-info.mjs";
import { allowedServices } from "../src/appointment-demo.mjs";

/* ------------------------------------------------------------------ */
/* Configuration de la clinique                                        */
/* ------------------------------------------------------------------ */

test("chaque contact de la clinique porte un statut explicite", () => {
  for (const field of [clinicInfo.phone, clinicInfo.email, clinicInfo.address, clinicInfo.emergency]) {
    assert.ok(["documented", "placeholder"].includes(field.status), "Statut invalide : " + field.status);
  }
});

test("un champ placeholder n'est jamais vide et utilise le libellé obligatoire", () => {
  assert.equal(clinicInfo.phone.status, "placeholder");
  assert.equal(clinicInfo.phone.label, PLACEHOLDERS.phone);
  assert.equal(clinicInfo.emailLocal.label, PLACEHOLDERS.email);
  assert.equal(clinicInfo.addressExact.label, PLACEHOLDERS.address);
  assert.equal(clinicInfo.hours.reception.label, PLACEHOLDERS.hours);
});

test("le champ email affiché est explicitement signalé comme appartenant au groupe", () => {
  assert.match(clinicInfo.email.note, /\.ma/);
  assert.ok(clinicInfo.emailLocal.status === "placeholder", "Un email local doit rester à confirmer.");
});

test("le numéro d'urgence est documenté et porte un avertissement de confirmation", () => {
  assert.equal(clinicInfo.emergency.status, "documented");
  assert.match(clinicInfo.emergency.value, /^\+224/);
  assert.match(clinicInfo.emergency.note, /[Cc]onfirm/);
});

test("aucun horaire d'accueil n'est inventé", () => {
  assert.equal(clinicInfo.hours.reception.status, "placeholder");
  assert.equal(clinicInfo.hours.reception.value, null);
  assert.equal(clinicInfo.hours.emergency.status, "documented");
});

test("la certification ISO 9001 n'est jamais présentée comme acquise", () => {
  const iso = clinicInfo.history.find((item) => item.text.includes("ISO 9001"));
  assert.ok(iso, "La mention ISO 9001 doit figurer dans l'historique documenté.");
  assert.match(iso.text, /certification visée, non acquise/);
  assert.ok(!/certification acquise|certifiée|délivrée|obtenue|validée/.test(iso.text),
    "L'ISO 9001 ne doit pas être décrite comme déjà acquise.");
});

test("chaque contact documenté porte un avertissement de confirmation explicite", () => {
  const documentedContacts = [clinicInfo.email, clinicInfo.emergency, clinicInfo.address];
  for (const field of documentedContacts) {
    if (field.status === "documented") {
      assert.ok(field.note, `Contact documenté sans note : ${JSON.stringify(field)}`);
      assert.match(field.note, /confirm|valider/i,
        `Contact documenté sans avertissement de confirmation : ${JSON.stringify(field)}`);
    }
  }
});

test("aucun champ placeholder ne contient de valeur, de contact ou d'horaire inventé", () => {
  const placeholders = [
    clinicInfo.phone, clinicInfo.emailLocal, clinicInfo.addressExact,
    clinicInfo.hours.reception, clinicInfo.appointment.method, clinicInfo.mapLink,
  ];
  for (const field of placeholders) {
    assert.equal(field.status, "placeholder", "Statut attendu : placeholder");
    assert.equal(field.value, null, "Un champ placeholder ne doit contenir aucune valeur : " + field.label);
    assert.ok(field.label && field.label.length > 0, "Libellé placeholder manquant : " + field.label);
  }
});

test("aucune spécialité n'est décrite comme disponible ou confirmée par la clinique", () => {
  for (const specialty of specialties) {
    assert.ok(!/disponible|offert par la clinique|nos médecins|nos équipements|proposée à la clinique|au sein de la clinique/i.test(specialty.text),
      "Spécialité présentée comme confirmée : " + specialty.name);
  }
});

/* ------------------------------------------------------------------ */
/* Spécialités                                                         */
/* ------------------------------------------------------------------ */

test("chaque spécialité documentée est autorisée par le validateur", () => {
  for (const specialty of specialties) {
    assert.ok(allowedServices.has(specialty.id), "Spécialité non autorisée : " + specialty.id);
  }
});

test("le validateur ne contient aucune spécialité absente de la configuration", () => {
  const ids = new Set(specialties.map((specialty) => specialty.id));
  for (const id of allowedServices) {
    assert.ok(ids.has(id), "Service autorisé sans fiche : " + id);
  }
});

test("les numéros de spécialité sont uniques et séquentiels", () => {
  const numbers = specialties.map((specialty) => specialty.number);
  assert.equal(new Set(numbers).size, numbers.length, "Numéros dupliqués.");
  numbers.forEach((number, index) => {
    assert.equal(number, String(index + 1).padStart(2, "0"), "Numérotation incohérente.");
  });
});

test("collectPendingConfirmations recense les champs à confirmer", () => {
  const pending = collectPendingConfirmations();
  const placeholders = pending.filter((item) => !item.documented);
  assert.ok(placeholders.length >= 5, "Plusieurs champs doivent rester à confirmer.");
  const paths = placeholders.map((item) => item.path);
  assert.ok(paths.some((path) => path.startsWith("phone")));
  assert.ok(paths.some((path) => path.startsWith("email")));
  assert.ok(paths.some((path) => path.startsWith("address")));
  assert.ok(paths.some((path) => path.startsWith("hours.reception")));
});

/* ------------------------------------------------------------------ */
/* Manifeste d'images                                                  */
/* ------------------------------------------------------------------ */

test("le manifeste d'images existe et décrit chaque image", async () => {
  const manifest = JSON.parse(await readFile("assets/img/manifest.json", "utf8"));
  assert.ok(Array.isArray(manifest.images) && manifest.images.length >= 6, "Le manifeste doit lister les images.");
  for (const image of manifest.images) {
    assert.ok(image.id && image.file && image.alt, "Entrée de manifeste incomplète : " + JSON.stringify(image));
    assert.ok(typeof image.authentic === "boolean", "Chaque image doit préciser si elle est authentique.");
  }
});

test("toute image déclarée comme non authentique est signalée dans ses métadonnées", async () => {
  const manifest = JSON.parse(await readFile("assets/img/manifest.json", "utf8"));
  for (const image of manifest.images) {
    if (image.authentic === false) {
      assert.ok(image.provider && image.license, "Illustration sans licence : " + image.id);
    }
  }
});

test("chaque image référencée par le manifeste existe sur le disque", async () => {
  const manifest = JSON.parse(await readFile("assets/img/manifest.json", "utf8"));
  for (const image of manifest.images) {
    const info = await stat(image.file);
    assert.ok(info.isFile() && info.size > 0, "Fichier d'image manquant ou vide : " + image.file);
  }
});

test("toutes les images du HTML existent et sont sous licence documentée", async () => {
  const html = await readFile("index.html", "utf8");
  const manifest = JSON.parse(await readFile("assets/img/manifest.json", "utf8"));
  const declared = new Set(manifest.images.map((image) => "./" + image.file));
  for (const match of html.matchAll(/<img[^>]+src="\.\/([^"]+)"/g)) {
    assert.ok(declared.has("./" + match[1]), "Image non déclarée au manifeste : " + match[1]);
    const info = await stat(match[1]);
    assert.ok(info.size > 0, "Image vide : " + match[1]);
  }
});

test("aucune image du prototype n'est présentée comme une photographie authentique de la clinique", async () => {
  const manifest = JSON.parse(await readFile("assets/img/manifest.json", "utf8"));
  for (const image of manifest.images) {
    assert.equal(image.authentic, false, "Image déclarée authentique : " + image.id);
    assert.ok(image.provider && image.license, "Illustration sans provenance/licence : " + image.id);
    assert.ok(image.alt && image.alt.length > 0, "Alt texte manquant : " + image.id);
  }
});

test("la page affiche le bandeau prototype et les protections anti-indexation", async () => {
  const html = await readFile("index.html", "utf8");
  assert.ok(/Prototype indépendant — non officiel/.test(html), "Bandeau « Prototype indépendant — non officiel » manquant.");
  assert.ok(/noindex/.test(html), "Métadonnée anti-indexation (noindex) manquante.");
  assert.ok(/prototype/.test(html.toLowerCase()), "Mention prototype absente de la page.");
});

test("les coordonnées affichées dans le pied de page signalent qu'elles restent à confirmer", async () => {
  const html = await readFile("index.html", "utf8");
  assert.ok(/restent à confirmer/.test(html), "Avertissement de confirmation des coordonnées manquant.");
  assert.ok(/validation-tag/.test(html), "Balises de validation (« à confirmer ») manquantes dans les infos pratiques.");
});

/* ------------------------------------------------------------------ */
/* Intégrité de la page                                                */
/* ------------------------------------------------------------------ */

test("chaque accordéon FAQ expose aria-expanded et aria-controls cohérents", async () => {
  const html = await readFile("index.html", "utf8");
  const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));
  const buttons = Array.from(html.matchAll(/class="faq-question"[^>]*aria-controls="([^"]+)"/g), (match) => match[1]);
  assert.ok(buttons.length >= 4, "Au moins quatre questions doivent exister.");
  for (const target of buttons) {
    assert.ok(ids.has(target), "Réponse FAQ introuvable : #" + target);
  }
});

test("le filtre de spécialités expose son état via aria-pressed", async () => {
  const html = await readFile("index.html", "utf8");
  assert.ok(/data-filter="all" aria-pressed="true"/.test(html), "Le filtre « Toutes » doit être actif par défaut.");
  const chips = Array.from(html.matchAll(/class="filter-chip"[^>]*data-filter="([^"]+)"[^>]*aria-pressed="([^"]+)"/g));
  assert.ok(chips.length >= 5, "Plusieurs filtres doivent être proposés.");
});

test("aucun bouton visible n'est de type button sans comportement déclaré en JS", async () => {
  const main = await readFile("src/main.js", "utf8");
  assert.match(main, /\.faq-question/, "L'accordéon FAQ doit être branché en JavaScript.");
  assert.match(main, /\.filter-chip/, "Le filtre des spécialités doit être branché en JavaScript.");
  assert.match(main, /\.gallery-item/, "La galerie doit être branchée en JavaScript.");
  assert.match(main, /prefers-reduced-motion/, "Les animations doivent respecter le mouvement réduit.");
});
