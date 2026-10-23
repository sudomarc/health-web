# Fonctionnalités et état réel

## Implémenté dans le prototype

| Fonctionnalité | Comportement | Limite |
|---|---|---|
| Navigation | Ancres, menu mobile, fermeture après sélection ou Escape | Pas de routage multi-page |
| Accueil | Proposition de valeur, appels à l'action et identité originale provisoire | Aucun logo officiel |
| Services | Spécialités relevées sur la page publique de référence | Disponibilité non confirmée par la clinique |
| Parcours patient | Trois étapes explicatives | Proposition UX, pas procédure clinique réelle |
| Demande | Choix service/date/période puis confirmation locale | Aucun rendez-vous enregistré ou transmis |
| Préremplissage | Un service choisi depuis une carte remplit le champ de démo | Démonstration uniquement |
| Informations pratiques | Localisation indicative et détails explicitement à valider | Aucun numéro de téléphone affiché |
| Anti-indexation | Mention non officielle, meta robots et robots.txt | Doit rester actif avant autorisation |
| Accessibilité de base | HTML sémantique, lien d'évitement, labels, focus, statut annoncé, mouvement réduit | Pas d'audit WCAG complet |
| Vérifications | Tests Node, contrôle des ancres, build statique et CI | Résultat CI à confirmer |

## Formulaire
Aucun nom, téléphone, email, symptôme ou détail médical n'est demandé. Il n'existe aucun endpoint. La validation est locale et indique qu'aucune demande n'a été envoyée ni enregistrée. Le code du formulaire ne doit utiliser ni réseau, ni cookie, ni stockage local/de session.

## Non implémenté volontairement
Réservation réelle, consultation de disponibilités, email/SMS/WhatsApp, API, portail patient, dossier médical, paiement, CMS, administration, analytique, notifications, traduction et audits réglementaires.
