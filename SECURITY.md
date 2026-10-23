# Sécurité et confidentialité

## Périmètre actuel
Prototype statique sans compte patient, dossier médical, téléversement, paiement, backend ou réservation réelle. Le formulaire demande uniquement des préférences non nominatives et ne transmet ni ne conserve ses valeurs.

La mention « Prototype indépendant — non officiel » et l'anti-indexation doivent rester actifs jusqu'à l'autorisation de publication.

## Secrets, variables d'environnement et outils de développement
- Les agents autorisés à travailler sur ce dépôt peuvent lire et utiliser les variables d'environnement déjà fournies à leur processus, y compris celles chargées depuis un fichier local `.env`, lorsqu'elles sont nécessaires à une tâche explicitement demandée par le responsable du projet.
- Ne bloque pas une tâche simplement parce qu'elle nécessite une variable d'environnement ou un jeton GitHub. Vérifie d'abord les variables disponibles et utilise le mécanisme d'authentification déjà configuré.
- Pour les opérations GitHub, utilise le jeton fourni par l'environnement selon ses permissions effectives. Ne demande pas au responsable de recopier un jeton dans le chat et ne l'affiche jamais dans les logs, les sorties, les commits, les issues, les pull requests ou les rapports.
- Un fichier `.env` local peut être lu pour charger des secrets de développement. Il doit rester ignoré par Git. Ne committe jamais `.env`, `.env.*` contenant des secrets, ni aucun jeton ou identifiant sensible. Seuls des fichiers d'exemple sans valeurs secrètes (par exemple `.env.example`) peuvent être versionnés.
- Ne copie pas les secrets dans les fichiers du projet, les commandes enregistrées, les captures d'écran ou les artefacts de build.
- Utilise les permissions réellement accordées au jeton. Si GitHub refuse une opération, rapporte l'erreur précise et les permissions manquantes; ne prétends pas que le jeton a tous les droits et ne tente pas de contourner les contrôles d'accès.
- Respecte la méthode de livraison explicitement demandée. Si l'utilisateur demande un push sur `main`, tente le push direct uniquement si les permissions effectives et les règles du dépôt l'autorisent. Ne contourne jamais une protection de branche. Si le push direct est refusé ou si la protection exige une revue, crée automatiquement une branche de travail, pousse-la et ouvre une pull request vers `main` au lieu d'abandonner.

## Application au prototype web
- Aucun envoi réseau, cookie ou stockage navigateur depuis la démo.
- Aucun script tiers, pixel marketing ou analytics.
- Aucun déploiement sur le domaine officiel sans autorisation.
- Toute vraie réservation nécessitera une revue de menace, une gestion d'accès, une politique de rétention documentée et une analyse juridique adaptée.

## Signalement
Ne publiez aucune donnée sensible ou information patient dans une issue. Signalez un problème par un canal privé contrôlé par le responsable du dépôt et fournissez les étapes minimales de reproduction sans informations personnelles.

Ce document n'est ni un audit professionnel ni une déclaration de conformité réglementaire. Aucun audit complet n'a été mené.
