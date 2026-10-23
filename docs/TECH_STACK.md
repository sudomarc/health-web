# Décision technique

**Stack retenu : HTML5 sémantique, CSS natif, JavaScript en modules, Node.js 22 et npm.** Pas de dépendances tierces au runtime.

## Pourquoi ce choix ?
Le périmètre actuel est une page institutionnelle essentiellement éditoriale, avec quelques interactions locales. Le HTML natif apporte une structure directement indexable, le CSS permet une présentation responsive sans bundle, et JavaScript n'est utilisé que pour le menu et la simulation. L'absence de dépendances simplifie les audits, les builds et l'hébergement statique.

## Options comparées

| Option | Avantages | Limites pour le MVP | Décision |
|---|---|---|---|
| HTML/CSS/JS natifs | Léger, SEO direct, très peu de maintenance, aucune dépendance externe | Organisation manuelle si le site devient complexe | **Retenu** |
| Vite + React + TypeScript | Composants réutilisables, riche écosystème | Bundle/configuration supplémentaires pour une page statique | À reconsidérer si l'interface devient applicative |
| Next.js | Rendu serveur, routes et backend possibles | Surdimensionné sans comptes, CMS ou API validés | Écarté à ce stade |
| Astro | Excellent pour plusieurs pages éditoriales et des îlots interactifs | Dépendance/build supplémentaire pour le périmètre actuel | Alternative crédible pour une extension de contenu |

## Architecture
- `index.html` : structure, contenus et métadonnées.
- `styles.css` : tokens visuels, responsive, focus et mouvement réduit.
- `src/main.js` : interactions navigateur sans réseau ni stockage.
- `src/appointment-demo.mjs` : fonction pure de validation simulée.
- `scripts/dev-server.mjs` : serveur local lié à 127.0.0.1 et limité à une liste blanche de fichiers.
- `scripts/build.mjs` : copie contrôlée vers `dist/`.
- `scripts/check-site.mjs` : vérifie ancres, anti-indexation et absence d'effets réseau/persistance.
- `test/` : tests natifs Node ; `.github/workflows/ci.yml` exécute les contrôles.

## Backend
Il n'existe pas de processus de réservation approuvé ni d'infrastructure autorisée à traiter des données. Un backend maintenant augmenterait les risques sans nécessité de démonstration. Toute API de réservation future nécessitera une conception indépendante, une minimisation des données, une politique de conservation et une revue de sécurité/confidentialité.

## Commandes et déploiement
Avec Node.js 22.12+ et npm :
```bash
npm ci
npm run dev
npm test
npm run check
npm run build
npm run preview
```

Développement : http://127.0.0.1:4173 ; prévisualisation du build : http://127.0.0.1:4174 ; sortie statique : `dist/`. Hébergement possible sur GitHub Pages (après adaptation du chemin si nécessaire), Netlify, Vercel Static ou un hébergeur de fichiers statiques. Garder l'anti-indexation tant que la publication n'a pas été autorisée.

## Alternatives écartées
Aucun framework CSS, système d'icônes, bibliothèque de composants, analytique ou gestionnaire de formulaires : leur coût excède leur utilité dans ce MVP.
