# Roadmap

Les cases reflètent les éléments implémentés dans la branche. Le succès CI doit être confirmé après le lancement du workflow GitHub Actions.

## 1. Fondation technique
- [x] Inspecter le dépôt et relever les fichiers manquants.
- [x] Choisir une architecture statique sans dépendances externes.
- [x] Définir la structure, les scripts npm, les règles agent et la sécurité.
- [x] Ajouter des contrôles de contenu et des tests natifs.
- [x] Confirmer les résultats CI sur GitHub (tests 49/49, check OK — commit sur main).
- [ ] Build bloqué par une anomalie préexistante dans scripts/build.mjs (RegExp non globale dans scanForSecrets, ligne 42) : à corriger avant tout déploiement.
- [ ] Corriger la référence invalide à steps.deployment.outputs.page_url dans deploy-pages.yml (job build).
- [ ] Déployer sur GitHub Pages et vérifier le rendu public après push.

## 2. Prototype de présentation
- [x] Page d'accueil originale et responsive.
- [x] Services, parcours patient, formulaire de démo et informations pratiques.
- [x] Navigation mobile et sélection de service préremplie.
- [x] Mention non officielle et protections anti-indexation.
- [x] Variables CSS corrigées (--paper, --lime, --mint définies dans :root).
- [x] Système de design (tokens typographie, espacement, rayons, ombres).
- [x] États bouton et formulaire (hover, focus, active, disabled, invalide).
- [x] Tests CSS variables, comportement navigation et accessibilité ajoutés (49 tests au total après le renforcement des tests de contenu).
- [x] Tests fonctionnels supplémentaires (date du jour rejetée, date lointaine acceptée, champs vides rejetés, message sans réservation).
- [x] Tests de contenu renforcés : ISO 9001 jamais présentée comme acquise, aucun contact/horaire inventé, bandeau prototype et noindex conservés, toutes les images déclarées illustrations (49 tests au total).
- [ ] Revue visuelle manuelle sur plusieurs navigateurs/appareils.
- [ ] Audit d'accessibilité automatisé complet.

## 3. Validation par la clinique
- [ ] Autorisation de présenter la refonte et d'utiliser le nom/logo.
- [ ] Confirmer spécialités, descriptions et disponibilité.
- [ ] Confirmer adresse, téléphone officiel, contacts et horaires.
- [ ] Valider le parcours d'accueil et de rendez-vous avec les équipes.
- [ ] Approuver les textes, visuels, langues et mentions.

## 4. Fonctionnalités réelles
- [ ] Définir le processus métier de rendez-vous.
- [ ] Choisir un backend/hébergeur après revue sécurité et confidentialité.
- [ ] Définir les accès, la rétention, les suppressions et la journalisation.
- [ ] Ajouter CMS, notifications ou version anglaise seulement si validés.
- [ ] Pas de données médicales avant analyse de conformité appropriée.

## 5. Préparation à la production
- [ ] Autorisation écrite et domaine approuvé.
- [ ] Revues juridique, sécurité, accessibilité et performance.
- [ ] Retirer la mention prototype/noindex uniquement après autorisation explicite.
- [ ] Définir sauvegarde, monitoring, responsable opérationnel et gestion d'incident.
