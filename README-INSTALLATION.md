# WebStorming OS V1.1.5 — Boot Guard Fix

## Correction principale

La V1.1.4 a prouvé que tous les fichiers chargeaient correctement en HTTP 200.
Le problème restant était le garde de démarrage : le panneau `Diagnostic de démarrage` pouvait rester visible même quand l'interface était prête, car le CSS `.ws-boot-panel { display:grid }` annulait l'attribut HTML `hidden`.

La V1.1.5 corrige cela :

- `[hidden]` forcé en `display:none !important` ;
- fermeture robuste du panneau diagnostic ;
- timers boot soft/hard nettoyés quand l'app est prête ;
- signal `webstorming:app-ready` ;
- détection visuelle `.ws-app` en secours ;
- timeout soft augmenté à 12 secondes ;
- timeout hard augmenté à 30 secondes ;
- panneau démarrage initialement en `style="display:none"`.

## Installation GitHub Pages

1. Dézipper l'archive.
2. Envoyer le contenu du dossier `webstorming-os-v1.1.5-boot-guard-fix/` à la racine du dépôt GitHub Pages `webstorming-dev-vault`.
3. Commit + push.
4. Ouvrir :

```text
https://webstormingproject.github.io/webstorming-dev-vault/diagnose.html
```

5. Cliquer sur `Vider cache + service workers`.
6. Revenir à :

```text
https://webstormingproject.github.io/webstorming-dev-vault/
```

## Résultat attendu

L'interface doit s'afficher sans panneau rouge. Si une vraie erreur JS survient, le diagnostic s'affiche avec la cause.
