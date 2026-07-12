# Patch snippet — WebStorming OS V1.1.4 Boot Fix

Si tu veux corriger l'application existante sans remplacer toute l'interface, applique ces points :

1. Copier `assets/js/boot-guard.js` dans le projet.
2. Charger `boot-guard.js` avant le script principal :

```html
<script>
window.WEBSTORMING_OS_CONFIG = {
  version: '1.1.4',
  releaseName: 'Boot Fix',
  expectedBase: '/webstorming-dev-vault/',
  bootTimeoutMs: 8000,
  bootHardTimeoutMs: 15000,
  requiredAssets: [
    './assets/css/app.css',
    './assets/js/boot-guard.js',
    './assets/js/app.js',
    './manifest.webmanifest'
  ]
};
</script>
<script defer src="./assets/js/boot-guard.js"></script>
<script defer src="./assets/js/app.js"></script>
```

3. Remplacer les chemins absolus `/assets/...` par `./assets/...`, ou configurer Vite :

```js
export default defineConfig({ base: '/webstorming-dev-vault/' });
```

4. Remplacer temporairement le service worker par `sw.js` V1.1.4 pour purger les anciens caches.

5. Dans le script principal, appeler à la fin du démarrage :

```js
window.WebStormingBootFix?.finish('Interface prête.');
```

6. Si une erreur bloque l'application :

```js
window.WebStormingBootFix?.fail('Erreur boot', error);
```

Règle Journalia/WebStorming : jamais d'écran d'initialisation bloqué sans diagnostic visible.
