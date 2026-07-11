# WebStorming OS V0.4

Cockpit central GitHub Pages pour piloter l’écosystème WebStorming.

## Nouveautés V0.4

- page GitHub avec lecture des dépôts publics ;
- état du dépôt central et date de dernière mise à jour ;
- cache local de cinq minutes pour limiter les appels API ;
- historique des versions et builds ;
- version et build visibles dans le cockpit ;
- projet WebStorming OS ajouté au catalogue ;
- fiches projet enrichies avec version, santé et dépôt ;
- fonctionnement dégradé propre si GitHub est indisponible ;
- aucun secret, mot de passe ou jeton stocké.

## Publication

1. Décompresser l’archive.
2. Remplacer le contenu du dépôt `webstorming-dev-vault`.
3. Valider un commit sur `main`.
4. Attendre le déploiement GitHub Pages.
5. Rafraîchir la page avec `Ctrl + F5`.

## Relier un dépôt à un projet

Dans `projects.json`, renseigner :

```json
"repo": "proprietaire/nom-du-depot"
```

Exemple :

```json
"repo": "webstormingproject/webstorming-dev-vault"
```

Les dépôts privés ne sont pas lus par cette version statique.
