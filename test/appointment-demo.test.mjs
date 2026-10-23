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
