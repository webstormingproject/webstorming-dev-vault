(function () {
  'use strict';
  var cfg = window.WEBSTORMING_OS_CONFIG || {};
  var boot = window.WebStormingBootFix;
  function $(id) { return document.getElementById(id); }

  function card(title, text) {
    return '<article class="ws-card"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(text) + '</p></article>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  }
  async function installSafeServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      boot && boot.log('warn', 'Service worker non supporté dans ce navigateur');
      return 'non supporté';
    }
    try {
      var reg = await navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(cfg.version || '1.1.5'), { scope: './' });
      boot && boot.log('info', 'Service worker enregistré', reg.scope);
      return 'enregistré';
    } catch (err) {
      boot && boot.log('warn', 'Service worker non enregistré', err && (err.message || err));
      return 'erreur non bloquante';
    }
  }
  async function render() {
    if (!boot) throw new Error('Boot guard absent: assets/js/boot-guard.js ne charge pas.' );
    boot.setStatus('Diagnostic des assets en cours...');
    var assets = await boot.checkAssets();
    var failed = assets.filter(function (r) { return !r.ok; });
    if (failed.length) {
      boot.fail('Fichier essentiel introuvable: ' + failed.map(function (r) { return r.asset + ' (' + r.status + ')'; }).join(', '));
      return;
    }

    boot.setStatus('Activation du mode PWA sécurisé...');
    var swStatus = await installSafeServiceWorker();
    var base = boot.getBaseInfo();
    var root = $('ws-root');
    root.innerHTML = '' +
      '<section class="ws-app">' +
        '<header class="ws-hero">' +
          '<div>' +
            '<div class="ws-kicker">WebStorming OS</div>' +
            '<h1>V1.1.5 Boot Guard Fix</h1>' +
            '<p>Le démarrage est réparé : chemins relatifs GitHub Pages, diagnostic visible, cache PWA contrôlé et anti-écran figé. Cette version sert de socle stable pour reprendre le développement.</p>' +
          '</div>' +
          '<div class="ws-badge">BOOT OK</div>' +
        '</header>' +
        '<div class="ws-grid">' +
          '<article class="ws-card"><h3>État technique</h3><ul class="ws-status-list">' +
            '<li><span>HTML / CSS / JS</span><span><i class="ws-dot"></i></span></li>' +
            '<li><span>Base path</span><span>' + escapeHtml(base.ok ? 'OK' : 'À vérifier') + '</span></li>' +
            '<li><span>Service worker</span><span>' + escapeHtml(swStatus) + '</span></li>' +
            '<li><span>Version</span><span>' + escapeHtml(cfg.version || '1.1.5') + '</span></li>' +
          '</ul></article>' +
          card('Protection anti-blocage', 'Si le boot dépasse 8 secondes, un panneau de diagnostic remplace maintenant l’écran figé avec les erreurs utiles.') +
          card('GitHub Pages corrigé', 'Tous les assets utilisent des chemins relatifs ./ pour fonctionner dans /webstorming-dev-vault/ sans casser la PWA.') +
          card('Cache PWA maîtrisé', 'Le service worker V1.1.5 nettoie les anciens caches et privilégie le réseau pour éviter de servir une ancienne version cassée.') +
          card('Diagnostic complet', 'Une page diagnose.html permet de vérifier manifest, scripts, CSS, service worker et chemins de déploiement.') +
          '<article class="ws-card"><h3>Actions</h3><p>Après validation, on peut réinjecter les modules métier un par un sans jamais revenir à un écran noir bloqué.</p><div class="ws-actions"><a href="./diagnose.html">Ouvrir diagnostic</a><button type="button" id="clear-from-app">Vider cache</button></div></article>' +
        '</div>' +
      '</section>';
    var clear = document.getElementById('clear-from-app');
    if (clear) clear.addEventListener('click', function () { boot.clearCachesAndServiceWorkers(); });
    document.body.dataset.wsReady = '1';
    root.setAttribute('data-ws-app-ready', '1');
    try { window.dispatchEvent(new CustomEvent('webstorming:app-ready', { detail: { message: 'WebStorming OS V1.1.5 prêt.' } })); } catch (_) {}
    boot.finish('WebStorming OS V1.1.5 prêt.');
  }
  document.addEventListener('DOMContentLoaded', function () {
    render().catch(function (err) {
      if (boot) boot.fail('Erreur boot app.js', err && (err.stack || err.message || err));
      else throw err;
    });
  });
})();
