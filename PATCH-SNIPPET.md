# Patch V1.1.5 — Boot Guard Fix à fusionner dans une app existante

## 1. CSS obligatoire

Ajouter dans le CSS global :

```css
[hidden],
.ws-boot-panel[hidden],
.ws-boot-panel.is-hidden {
  display: none !important;
}
.ws-boot-panel.is-visible {
  display: grid !important;
}
```

## 2. HTML du panneau diagnostic

Le panneau doit démarrer ainsi :

```html
<section id="ws-boot-panel" class="ws-boot-panel is-hidden" hidden style="display:none">
```

## 3. Quand l'app est prête

Après rendu complet de l'interface :

```js
document.body.dataset.wsReady = '1';
window.dispatchEvent(new CustomEvent('webstorming:app-ready', {
  detail: { message: 'Application prête.' }
}));
window.WebStormingBootFix?.finish('Application prête.');
```

## 4. Ne jamais laisser le boot guard afficher un faux blocage

Si `.ws-app` ou `[data-ws-app-ready="1"]` existe, le boot guard doit considérer que l'app est prête et fermer le diagnostic.
