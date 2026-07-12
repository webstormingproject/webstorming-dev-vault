# WebStorming OS V1.2.0 — Cockpit Core FR

## Objectif

Première version du cockpit français de pilotage global des développements : projets, fournisseurs IA, modèles, capacités, routage, missions et mémoire locale.

## Installation GitHub Pages

1. Dézipper `webstorming-os-v1.2.0-cockpit-core-fr.zip`.
2. Envoyer tout le contenu du dossier à la racine du dépôt GitHub Pages, par exemple `webstorming-dev-vault`.
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

## Important sécurité

Cette V1.2.0 est volontairement un cockpit front/PWA. Elle prépare le gestionnaire API & modèles mais ne doit pas recevoir de clés API de production.

Les vraies clés doivent être stockées dans une phase suivante :

- backend WordPress sécurisé ; ou
- backend local sécurisé ; ou
- service API privé avec chiffrement.

## Modules inclus

- Dashboard global.
- Project Launcher.
- API & Model Manager skeleton.
- Modèles et capacités.
- Smart Router par capacité.
- Mission Builder.
- Export/import JSON.
- Mémoire locale navigateur.
- Boot Guard anti écran bloqué.
- Diagnostic complet.

## Prochaine étape recommandée

V1.2.1 : backend sécurisé minimal ou connecteur WordPress pour tester les clés sans jamais les exposer au navigateur.
