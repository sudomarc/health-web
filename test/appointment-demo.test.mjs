import test from "node:test";
import assert from "node:assert/strict";
import { createDemoAppointment } from "../src/appointment-demo.mjs";

const today = new Date(2026, 9, 23, 12, 0, 0);
const tomorrow = "2026-10-24";

test("creates a local demo confirmation for valid preferences", () => {
  const result = createDemoAppointment({
    service: "cardiologie", preferredDate: tomorrow, period: "matin"
  }, today);
  assert.equal(result.service, "Cardiologie");
  assert.equal(result.period, "le matin");
  assert.match(result.message, /Aucune demande n'a été envoyée ni enregistrée/);
});

test("rejects an unknown service", () => {
  assert.throws(
    () => createDemoAppointment({ service: "urgences", preferredDate: tomorrow, period: "matin" }, today),
    /Choisissez une spécialité/
  );
});

test("rejects malformed or impossible calendar dates", () => {
  assert.throws(
    () => createDemoAppointment({ service: "cardiologie", preferredDate: "24-10-2026", period: "matin" }, today),
    /date valide/
  );
  assert.throws(
    () => createDemoAppointment({ service: "cardiologie", preferredDate: "2026-02-30", period: "matin" }, today),
    /date indiquée n'est pas valide/
  );
});

test("rejects dates in the past", () => {
  assert.throws(
    () => createDemoAppointment({ service: "cardiologie", preferredDate: "2026-10-22", period: "matin" }, today),
    /date à venir/
  );
});

test("rejects an invalid period", () => {
  assert.throws(
    () => createDemoAppointment({ service: "cardiologie", preferredDate: tomorrow, period: "nuit" }, today),
    /période indicative/
  );
});

test("does not mutate supplied preferences", () => {
  const input = { service: "urologie", preferredDate: tomorrow, period: "indifferent" };
  const snapshot = { ...input };
  createDemoAppointment(input, today);
  assert.deepEqual(input, snapshot);
});

test("rejects today's date (must be strictly in the future)", () => {
  const todayStr = "2026-10-23";
  assert.throws(
    () => createDemoAppointment({ service: "cardiologie", preferredDate: todayStr, period: "matin" }, today),
    /date à venir/
  );
});

test("accepts a date several months ahead", () => {
  const result = createDemoAppointment(
    { service: "neurologie", preferredDate: "2027-03-15", period: "apres-midi" },
    today
  );
  assert.equal(result.service, "Neurologie");
  assert.equal(result.period, "l'après-midi");
});

test("rejects an empty service value", () => {
  assert.throws(
    () => createDemoAppointment({ service: "", preferredDate: tomorrow, period: "matin" }, today),
    /spécialité/
  );
});

test("rejects an empty period value", () => {
  assert.throws(
    () => createDemoAppointment({ service: "cardiologie", preferredDate: tomorrow, period: "" }, today),
    /période indicative/
  );
});

test("returns a message stating no request is sent or recorded", () => {
  const result = createDemoAppointment(
    { service: "urologie", preferredDate: tomorrow, period: "indifferent" },
    today
  );
  assert.match(result.message, /Aucune demande n'a été envoyée ni enregistrée/);
  assert.ok(!/rendez-vous confirmé/.test(result.message), "Le message ne doit pas confirmer un rendez-vous.");
  assert.ok(!/réservé/.test(result.message), "Le message ne doit pas indiquer une réservation.");
});
