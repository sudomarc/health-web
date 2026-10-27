/**
 * Source de vérité unique pour les informations de la clinique.
 *
 * Chaque champ porte un `status` :
 *   - "documented" : valeur relevée sur la source publique (internationalclinicconakry.com),
 *                    consultée le 2026-10-24. À confirmer par la clinique avant publication.
 *   - "placeholder" : valeur inconnue. Le libellé obligatoire est affiché à la place.
 *
 * RÈGLE ABSOLUE : ne jamais inventer un téléphone, un email, une adresse, un horaire,
 * un médecin, un prix ou une certification. Un champ "placeholder" reste affiché —
 * il n'est jamais supprimé ni rempli de valeur approximative.
 */

export const PLACEHOLDERS = {
  phone: "[TÉLÉPHONE À CONFIRMER PAR LA CLINIQUE]",
  emergencyPhone: "[NUMÉRO D'URGENCE À CONFIRMER PAR LA CLINIQUE]",
  email: "[EMAIL OFFICIEL À CONFIRMER]",
  address: "[ADRESSE EXACTE À VALIDER]",
  hours: "[HORAIRES À CONFIRMER]",
  contactPerson: "[NOM ET FONCTION À VALIDER]"
};

export const clinicInfo = {
  name: { value: "International Clinic", status: "documented", note: "Dénomination usuelle relevée sur la source publique ; dénomination officielle à confirmer par la clinique." },
  city: { value: "Conakry", status: "documented", note: "Ville relevée sur la source publique ; à confirmer par la clinique." },
  legalName: { value: null, status: "placeholder", label: "[DÉNOMINATION LÉGALE À VALIDER]" },
  tagline: { value: "Vous soigner est notre occupation, vous soigner efficacement reste notre préoccupation.", status: "documented", note: "Slogan publié sur la source publique : affirmation marketing, pas un engagement vérifié. À confirmer avant affichage officiel." },

  address: {
    value: "Camayenne, commune de Dixinn, Conakry, Guinée",
    status: "documented",
    note: "Indication publique relevée sur la source ; adresse exacte et point cartographique à valider."
  },
  addressExact: { value: null, status: "placeholder", label: PLACEHOLDERS.address },

  phone: { value: null, status: "placeholder", label: PLACEHOLDERS.phone },

  emergency: {
    value: "+224 627 49 33 27",
    status: "documented",
    note: "Numéro affiché sur la page source (« Appelez-nous au 00224 627 49 33 27 »), consultée le 24/10/2026. Les fiches tierces affichent des numéros différents : confirmation directe obligatoire avant toute publication.",
    service247: { value: "Accueil des urgences opéré 24 h/24 et 7 j/7", status: "documented" }
  },

  email: {
    value: "contact@internationalclinic.ma",
    status: "documented",
    note: "Adresse affichée sur la source mais appartenant au domaine .ma du groupe (Casablanca) : adresse email de Conakry à confirmer."
  },
  emailLocal: { value: null, status: "placeholder", label: PLACEHOLDERS.email },

  hours: {
    reception: { value: null, status: "placeholder", label: PLACEHOLDERS.hours },
    emergency: { value: "24 h/24 — 7 j/7", status: "documented" },
    perService: { value: null, status: "placeholder", label: "[HORAIRES PAR SERVICE À CONFIRMER]" }
  },

  appointment: {
    method: { value: null, status: "placeholder", label: "[MODALITÉ DE RENDEZ-VOUS À CONFIRMER]" },
    responseTime: { value: null, status: "placeholder", label: "[DÉLAI DE RÉPONSE À CONFIRMER]" }
  },

  mapLink: { value: null, status: "placeholder", label: "[LIEN CARTOGRAPHIQUE À CONFIRMER]" },

  social: [
    {
      label: "Facebook",
      url: null,
      status: "placeholder",
      labelPlaceholder: "[PAGE FACEBOOK OFFICIELLE À CONFIRMER]"
    }
  ],

  history: [
    { year: "Août 2019", text: "Inauguration de l'établissement à Conakry, commune de Dixinn.", status: "documented" },
    { year: "Démarche qualité", text: "Engagement dans une démarche de certification ISO 9001 version 2015 (certification visée, non acquise à ce stade).", status: "documented" },
    { year: "Conventions", text: "Des conventions de prise en charge ont été conclues avec des organismes publics et des institutions privées.", status: "documented" }
  ],

  group: {
    text: "International Clinic Conakry fait partie du Groupe International Clinic et collabore notamment avec International Clinic Casablanca.",
    url: "http://www.internationalclinic.ma/",
    status: "documented"
  }
};

/**
 * Spécialités relevées sur la page source (menu « Spécialité » et grille d'icônes).
 * `text` : description affichée dans le prototype (source ou définition neutre).
 * `source` : "source" si le texte provient de la page publique, "placeholder" s'il s'agit
 *            d'une définition neutre écrite pour le prototype et à faire valider.
 * `status: "documented"` = l'intitulé est présent sur la source ; la disponibilité
 *                        et le périmètre réel restent à confirmer par la clinique.
 */
export const specialties = [
  {
    id: "cardiologie",
    name: "Cardiologie",
    number: "01",
    status: "documented",
    text: "Le cardiologue est le médecin spécialisé dans l'étude du cœur et des vaisseaux. Il suit certains patients au long cours.",
    source: "source"
  },
  {
    id: "gynecologie",
    name: "Gynécologie",
    number: "02",
    status: "documented",
    text: "La gynécologie traite de la physiologie du système génital féminin et de l'ensemble des affections qui le concernent.",
    source: "source"
  },
  {
    id: "endocrinologie",
    name: "Endocrinologie",
    number: "03",
    status: "documented",
    text: "L'endocrinologue est le spécialiste des problèmes hormonaux. Il prend en charge les pathologies liées à un dérèglement du système endocrinien.",
    source: "source"
  },
  {
    id: "gastro-enterologie",
    name: "Gastro-entérologie",
    number: "04",
    status: "documented",
    text: "Spécialité consacrée à l'appareil digestif et à ses pathologies. Description à faire valider par la clinique.",
    source: "placeholder"
  },
  {
    id: "neurologie",
    name: "Neurologie",
    number: "05",
    status: "documented",
    text: "La neurologie traite des maladies du système nerveux, central et périphérique. Description à faire valider par la clinique.",
    source: "placeholder"
  },
  {
    id: "ophtalmologie",
    name: "Ophtalmologie",
    number: "06",
    status: "documented",
    text: "Spécialité de la vision et de l'œil : examen, suivi et prise en charge des affections oculaires. Description à faire valider.",
    source: "placeholder"
  },
  {
    id: "traumatologie",
    name: "Traumatologie",
    number: "07",
    status: "documented",
    text: "Spécialité des lésions de l'appareil locomoteur d'origine traumatique. Description à faire valider par la clinique.",
    source: "placeholder"
  },
  {
    id: "urologie",
    name: "Urologie",
    number: "08",
    status: "documented",
    text: "L'urologie traite des voies urinaires et de l'appareil génital masculin. Description à faire valider par la clinique.",
    source: "placeholder"
  },
  {
    id: "psychopathologie",
    name: "Psychopathologie",
    number: "09",
    status: "documented",
    text: "Intitulé présent sur la page source. Intitulé, périmètre et disponibilité à confirmer par la clinique.",
    source: "placeholder"
  },
  {
    id: "visceralgie",
    name: "Viscéralgie",
    number: "10",
    status: "documented",
    text: "Intitulé présent sur la page source. Intitulé, périmètre et disponibilité à confirmer par la clinique.",
    source: "placeholder"
  },
  {
    id: "esthetique",
    name: "Esthétique",
    number: "11",
    status: "documented",
    text: "Intitulé présent sur la page source. Intitulé, périmètre et disponibilité à confirmer par la clinique.",
    source: "placeholder"
  }
];

/** Champs restant à confirmer — checklist éditoriale générée depuis la configuration. */
export function collectPendingConfirmations(info = clinicInfo) {
  const pending = [];
  const walk = (node, path) => {
    if (node && typeof node === "object") {
      if ("status" in node) {
        if (node.status === "placeholder") {
          pending.push({ path, label: node.label || node.labelPlaceholder || null });
        } else if (node.status === "documented") {
          pending.push({ path, label: node.value ?? node.text ?? null, documented: true });
        }
        return;
      }
      for (const key of Object.keys(node)) walk(node[key], path ? path + "." + key : key);
    }
  };
  walk(info, "");
  return pending;
}
