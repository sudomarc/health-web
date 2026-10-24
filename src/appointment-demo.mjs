export const allowedServices = new Set([
  "cardiologie", "gynecologie", "endocrinologie", "gastro-enterologie",
  "neurologie", "ophtalmologie", "traumatologie", "urologie"
]);
export const allowedPeriods = new Set(["matin", "apres-midi", "indifferent"]);
const serviceLabels = {
  cardiologie: "Cardiologie",
  gynecologie: "Gynécologie",
  endocrinologie: "Endocrinologie",
  "gastro-enterologie": "Gastro-entérologie",
  neurologie: "Neurologie",
  ophtalmologie: "Ophtalmologie",
  traumatologie: "Traumatologie",
  urologie: "Urologie"
};

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/**
 * Creates a local-only confirmation for the demo form.
 * There is deliberately no network, persistence, cookie, or analytics side effect.
 */
export function createDemoAppointment(input, now = new Date()) {
  const service = input && input.service;
  const preferredDate = input && input.preferredDate;
  const period = input && input.period;

  if (!allowedServices.has(service)) {
    throw new TypeError("Choisissez une spécialité proposée dans cette démonstration.");
  }
  if (typeof preferredDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    throw new TypeError("Choisissez une date valide.");
  }

  const parsed = new Date(preferredDate + "T12:00:00.000Z");
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== preferredDate) {
    throw new TypeError("La date indiquée n'est pas valide.");
  }
  if (preferredDate <= localDateString(now)) {
    throw new TypeError("Choisissez une date à venir.");
  }
  if (!allowedPeriods.has(period)) {
    throw new TypeError("Choisissez une période indicative.");
  }

  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(parsed);
  const periodLabel = period === "matin" ? "le matin" :
    period === "apres-midi" ? "l'après-midi" : "sans préférence";

  return {
    service: serviceLabels[service],
    preferredDate: dateLabel,
    period: periodLabel,
    message: "Simulation prête pour " + serviceLabels[service] + ", le " + dateLabel +
      ", " + periodLabel + ". Aucune demande n'a été envoyée ni enregistrée."
  };
}
