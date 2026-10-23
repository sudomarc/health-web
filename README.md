# International Clinic Conakry — proposition de refonte

> **Prototype indépendant — non officiel.** Cette démonstration n'est ni le site officiel de la clinique ni une confirmation de partenariat. Les coordonnées, horaires et services doivent être validés par un représentant autorisé avant toute diffusion publique.

Proposition de site institutionnel en français, conçue pour rendre l'information plus lisible, faciliter l'orientation et présenter un parcours de demande de rendez-vous sans transmettre ni conserver de données.

## Stack retenu

HTML5 sémantique, CSS natif et JavaScript en modules. Node.js 22 et npm servent au développement, aux tests et au build. Aucune dépendance applicative externe : installation reproductible, surface de maintenance réduite et hébergement statique à faible coût. Justification : [docs/TECH_STACK.md](docs/TECH_STACK.md).

## Démarrage

Prérequis : Node.js **22.12+** et npm.

```bash
npm ci
npm run dev
```

Ouvrir http://127.0.0.1:4173.

## Vérifications

```bash
npm test
npm run check
npm run build
npm run preview
```

Le build génère `dist/`. Le serveur local n'expose qu'une liste explicite de fichiers publics ; la documentation, les scripts internes et les fichiers Git ne sont pas servis.

## Fonctionnalités

- Page d'accueil responsive, navigation mobile et liens de section.
- Liste de spécialités relevées sur la page de référence et clairement signalées comme contenu à confirmer.
- Parcours patient, informations pratiques et pied de page.
- Formulaire local : spécialité, date et période indicative uniquement ; confirmation simulée.
- Aucune donnée personnelle demandée, aucune transmission, aucun stockage navigateur.
- HTML sémantique, lien d'évitement, labels, focus visible, message d'état accessible et réduction des animations.
- Métadonnées `noindex` et `robots.txt` bloquant l'exploration pendant la présentation.

## Structure

```text
.
├── .github/workflows/ci.yml
├── docs/                 # brief, stack, fonctionnalités, pitch, contenu
├── scripts/              # serveur local, contrôles, build
├── src/                  # interactions et logique de démo
├── test/                 # tests Node natifs
├── index.html
├── styles.css
├── package.json
└── package-lock.json
```

## Limites

Le formulaire n'enregistre aucun rendez-vous réel. Les spécialités doivent être confirmées. Les coordonnées téléphoniques relevées dans des sources publiques sont contradictoires ; aucun numéro n'est donc affiché comme fiable. Aucun logo, portrait ou photographie de la clinique n'est reproduit. Un audit sécurité, juridique, accessibilité et validation éditoriale reste nécessaire avant publication.

Lire [ROADMAP.md](ROADMAP.md), [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) et la documentation dans `docs/`.
