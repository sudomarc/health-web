import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { allowedServices, allowedPeriods } from "../src/appointment-demo.mjs";

const html = await readFile("index.html", "utf8");

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
