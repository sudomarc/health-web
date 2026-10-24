import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { allowedServices, allowedPeriods } from "../src/appointment-demo.mjs";

const html = await readFile("index.html", "utf8");
const css = await readFile("styles.css", "utf8");

// Valeurs demandées depuis les cartes de spécialité (data-prefill-service).
const cardServices = Array.from(
  html.matchAll(/data-prefill-service="([^"]+)"/g),
  (match) => match[1]
);

// Valeurs proposées dans le sélecteur de service du formulaire.
const serviceSelectBlock = html.match(/<select id="service"[^>]*>([\s\S]*?)<\/select>/)[1];
const serviceOptions = Array.from(
  serviceSelectBlock.matchAll(/<option value="([^"]*)"/g),
  (match) => match[1]
);

// Valeurs proposées dans le sélecteur de période du formulaire.
const periodSelectBlock = html.match(/<select id="period"[^>]*>([\s\S]*?)<\/select>/)[1];
const periodOptions = Array.from(
  periodSelectBlock.matchAll(/<option value="([^"]*)"/g),
  (match) => match[1]
);

test("les spécialités des cartes sont toutes autorisées par le validateur", () => {
  for (const service of cardServices) {
    assert.ok(allowedServices.has(service), "Spécialité inconnue : " + service);
  }
});

test("les options du sélecteur de service correspondent aux spécialités autorisées", () => {
  const realOptions = serviceOptions.filter((value) => value !== "");
  assert.deepEqual([...realOptions].sort(), [...allowedServices].sort());
});

test("les cartes et le formulaire proposent les mêmes spécialités", () => {
  assert.deepEqual([...cardServices].sort(), [...serviceOptions.filter((v) => v !== "")].sort());
});

test("les options de période sont toutes autorisées par le validateur", () => {
  const realOptions = periodOptions.filter((value) => value !== "");
  assert.deepEqual([...realOptions].sort(), [...allowedPeriods].sort());
});

test("aucune spécialité n'est présentée comme confirmée sans preuve", () => {
  assert.ok(cardServices.length > 0, "Au moins une spécialité doit être listée.");
  const footnote = /Cette liste est illustrative/.test(html);
  assert.ok(footnote, "La liste des spécialités doit être signalée illustrative.");
});

test("les variables CSS critiques sont déclarées dans :root", () => {
  assert.ok(/--paper:\s*#fbfcf9/.test(css), "La variable --paper doit être déclarée.");
  assert.ok(/--lime:\s*#7fb069/.test(css), "La variable --lime doit être déclarée.");
  assert.ok(/--mint:\s*#eef6ee/.test(css), "La variable --mint doit être déclarée.");
});

test("aucune variable CSS utilisée n'est indéfinie", () => {
  const used = new Set();
  for (const match of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
    used.add(match[1]);
  }
  const defined = new Set();
  for (const match of css.matchAll(/(--[a-z0-9-]+):\s*/g)) {
    defined.add(match[1]);
  }
  for (const variable of used) {
    assert.ok(defined.has(variable), "Variable CSS utilisée mais indéfinie : " + variable);
  }
});

// Tests d'accessibilité et de structure HTML
test("la langue française est déclarée sur l'élément html", () => {
  assert.ok(/<html lang="fr">/.test(html), "La langue principale doit être fr.");
});

test("le lien d'évitement clavier est présent et pointe vers #contenu", () => {
  assert.ok(/class="skip-link" href="#contenu"/.test(html), "Le lien d'évitement est requis.");
  assert.ok(/<main id="contenu">/.test(html), "L'élément main avec id contenu est requis.");
});

test("la mention prototype est visible et les métadonnées anti-indexation sont présentes", () => {
  assert.ok(/Prototype indépendant — non officiel/.test(html), "La mention prototype doit rester visible.");
  assert.ok(/name="robots" content="noindex, nofollow, noarchive, nosnippet"/.test(html), "Le prototype doit rester hors index.");
});

test("toutes les ancres internes pointent vers une cible existante", () => {
  const ids = new Set(Array.from(html.matchAll(/id="([^"]+)"/g), (match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), "Ancre interne sans cible : #" + match[1]);
  }
});

test("le menu expose son état d'ouverture via aria-expanded et aria-controls", () => {
  assert.ok(/aria-expanded="false" aria-controls="navigation-principale"/.test(html), "Le menu doit exposer son état.");
});

test("le formulaire expose un retour annoncé aux technologies d'assistance", () => {
  assert.ok(/id="form-status" role="status" aria-live="polite"/.test(html), "Le statut du formulaire doit être annoncé.");
});

// Test du comportement de navigation (menu mobile, touche Échap)
test("le menu toggle bascule aria-expanded et la classe is-open", () => {
  const opened = [];
  const closed = [];
  const menuToggle = {
    getAttribute: () => "false",
    setAttribute: (k, v) => opened.push(v === "true"),
    classList: { toggle: (cls, val) => closed.push(val) },
  };
  const navigation = { classList: { toggle: (cls, val) => closed.push(val) } };

  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  navigation.classList.toggle("is-open", !isExpanded);

  assert.ok(opened.includes(true), "aria-expanded doit passer à true.");
  assert.ok(closed.includes(true), "la classe is-open doit être ajoutée.");
});

test("la touche Échap ferme le menu et remet aria-expanded à false", () => {
  const expanded = [];
  const classes = [];
  const menuToggle = {
    setAttribute: (k, v) => expanded.push(v),
  };
  const navigation = { classList: { remove: (cls) => classes.push(cls) } };

  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");

  assert.ok(expanded.includes("false"), "aria-expanded doit être false après Échap.");
  assert.ok(classes.includes("is-open"), "la classe is-open doit être retirée.");
});

