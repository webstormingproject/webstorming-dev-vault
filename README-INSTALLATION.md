# WebStorming OS V1.2.1 — Mission Builder opérationnel

## Objectif

Cette version transforme le cockpit en vrai bureau de préparation de missions : choix projet, brique, type de mission, templates, spécialistes recommandés, cahier de mission, export texte/JSON et sauvegarde locale.

## Installation GitHub Pages

1. Dézipper `webstorming-os-v1.2.1-mission-builder.zip`.
2. Envoyer tout le contenu du dossier à la racine du dépôt GitHub Pages `webstorming-dev-vault`.
3. Vérifier que `.nojekyll` est bien présent.
4. Commit / push.
5. Ouvrir :

```text
https://webstormingproject.github.io/webstorming-dev-vault/
```

6. En cas de souci :

```text
https://webstormingproject.github.io/webstorming-dev-vault/diagnose.html
```

## Nouveautés V1.2.1

- Mission Builder opérationnel.
- Templates prêts : Media Workshop, backend API sécurisé, boot diagnostic PWA, éditorial Gemini/Claude, Smart Router.
- Sélection de brique Journalia.
- Version / micro-rush.
- Livrable attendu.
- Critères de validation.
- Scoring automatique des spécialistes.
- Mission prête à copier vers Codex/Gemini/Claude/autres.
- Export mission en `.txt`.
- Copie JSON mission.
- Sauvegarde et réouverture des missions.
- Migration de la mémoire locale V1.2.0 vers V1.2.1.

## Sécurité

Cette version reste une PWA statique. Elle ne doit pas recevoir de vraies clés API de production. Les clés réelles doivent passer par un backend sécurisé WordPress/local dans une prochaine phase.
