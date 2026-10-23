# Contribuer

Lire [AGENTS.md](AGENTS.md), [README.md](README.md) et la documentation pertinente dans `docs/`.

## Modifications
- Travailler dans une branche dédiée ; ne pas pousser directement dans `main`.
- Garder les changements ciblés et ajouter des tests à toute logique nouvelle.
- Préférer des fonctions pures et les modules natifs.
- Ne pas ajouter de dépendance sans bénéfice démontré et mise à jour de la décision technique.
- Ne jamais committer secret, donnée patient ou coordonnées supposées.
- Consigner les validations éditoriales dans [docs/CONTENT_CHECKLIST.md](docs/CONTENT_CHECKLIST.md).

## Contrôles obligatoires
```bash
npm ci
npm test
npm run check
npm run build
```

Décrire dans la PR les changements, les résultats réellement obtenus, les risques et les vérifications restantes. Une compilation réussie ne remplace pas une revue manuelle mobile ni un audit d'accessibilité.
