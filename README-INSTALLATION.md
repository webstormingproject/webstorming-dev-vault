# WebStorming OS V1.1.4 — Boot Fix

## Objectif

Corriger le blocage observé sur GitHub Pages :

```text
Initialisation de WebStorming OS v1.0...
```

Cette V1.1.4 ajoute :

- chemins relatifs compatibles GitHub Pages ;
- boot guard anti-écran figé ;
- diagnostic visible après 8 secondes ;
- page `diagnose.html` ;
- service worker qui purge les anciens caches ;
- bouton pour vider cache/service workers ;
- manifest PWA propre.

## Installation rapide GitHub Pages

1. Dézipper l'archive.
2. Envoyer le contenu du dossier `webstorming-os-v1.1.4-boot-fix/` à la racine du dépôt GitHub Pages `webstorming-dev-vault`.
3. Commit + push.
4. Ouvrir :

```text
https://webstormingproject.github.io/webstorming-dev-vault/
```

5. Ouvrir aussi :

```text
https://webstormingproject.github.io/webstorming-dev-vault/diagnose.html
```

## Test conseillé après déploiement

Dans Chrome :

1. Ouvrir la page.
2. Faire `Ctrl + F5`.
3. Si l'ancienne version reste bloquée, ouvrir `diagnose.html`.
4. Cliquer `Vider cache + service workers`.
5. Revenir sur `index.html`.

## Attention

Ce ZIP est un micro-rush de **Boot Fix**. Il sécurise le démarrage et donne un socle fonctionnel.
Il ne contient pas forcément tous les modules métier de l'ancienne WebStorming OS, car le code source complet de cette app n'était pas disponible dans cette session.

Pour fusionner avec l'ancienne app, suivre `PATCH-SNIPPET.md`.
