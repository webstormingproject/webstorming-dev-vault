(function () {
  'use strict';
  var cfg = window.WEBSTORMING_OS_CONFIG || {};
  var log = [];
  var finished = false;
  var startedAt = Date.now();
  var softTimer = null;
  var hardTimer = null;

  function now() { return new Date().toISOString().replace('T', ' ').replace('Z', ''); }
  function push(type, message, detail) {
    var entry = { time: now(), type: type || 'info', message: String(message || ''), detail: detail || null };
    log.push(entry);
    try { console[type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log']('[WebStorming Boot]', entry.message, entry.detail || ''); } catch (_) {}
    return entry;
  }
  function $(id) { return document.getElementById(id); }
  function setStatus(message) {
    var el = $('ws-loader-status');
    if (el) el.textContent = message;
  }
  function getBaseInfo() {
    var path = window.location.pathname;
    var expected = cfg.expectedBase || '/webstorming-dev-vault/';
    var ok = path.indexOf(expected) === 0 || path === expected.replace(/\/$/, '') || expected === '/';
    return { path: path, expected: expected, ok: ok };
  }
  function showPanel(panel) {
    if (!panel) return;
    showPanel(panel);
    panel.removeAttribute('hidden');
    panel.classList.remove('is-hidden');
    panel.classList.add('is-visible');
    panel.style.display = 'grid';
  }
  function hidePanel(panel) {
    if (!panel) return;
    panel.hidden = true;
    panel.setAttribute('hidden', 'hidden');
    panel.classList.remove('is-visible');
    panel.classList.add('is-hidden');
    panel.style.display = 'none';
  }
  function clearBootTimers() {
    if (softTimer) { clearTimeout(softTimer); softTimer = null; }
    if (hardTimer) { clearTimeout(hardTimer); hardTimer = null; }
  }
  function isAppVisiblyReady() {
    try {
      if (document.body && document.body.dataset && document.body.dataset.wsReady === '1') return true;
      if (document.querySelector('.ws-app')) return true;
      if (document.querySelector('[data-ws-app-ready="1"]')) return true;
      if (document.querySelector('.app, #app, .dashboard, .shell, .ws-dashboard')) return true;
    } catch (_) {}
    return false;
  }
  function renderPanel(summary) {
    var panel = $('ws-boot-panel');
    var summaryEl = $('ws-boot-summary');
    var logEl = $('ws-boot-log');
    if (!panel || !summaryEl || !logEl) return;
    var base = getBaseInfo();
    var lines = [];
    lines.push('Version: ' + (cfg.version || 'unknown') + ' — ' + (cfg.releaseName || ''));
    lines.push('URL: ' + window.location.href);
    lines.push('Path: ' + base.path);
    lines.push('Base attendue: ' + base.expected + ' — ' + (base.ok ? 'OK' : 'À vérifier'));
    lines.push('Temps boot: ' + Math.round((Date.now() - startedAt) / 1000) + 's');
    lines.push('');
    log.forEach(function (e) {
      lines.push('[' + e.time + '] ' + e.type.toUpperCase() + ' — ' + e.message + (e.detail ? ' — ' + safeJson(e.detail) : ''));
    });
    summaryEl.textContent = summary || 'Le démarrage a été interrompu ou ralenti.';
    logEl.textContent = lines.join('\n');
    showPanel(panel);
  }
  function safeJson(value) {
    try { return typeof value === 'string' ? value : JSON.stringify(value); } catch (_) { return String(value); }
  }
  async function clearCachesAndServiceWorkers() {
    push('warn', 'Nettoyage cache PWA demandé');
    try {
      if ('serviceWorker' in navigator) {
        var regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(function (r) { return r.unregister(); }));
        push('info', regs.length + ' service worker(s) désinscrit(s)');
      }
      if ('caches' in window) {
        var keys = await caches.keys();
        await Promise.all(keys.map(function (k) { return caches.delete(k); }));
        push('info', keys.length + ' cache(s) supprimé(s)');
      }
    } catch (err) {
      push('error', 'Échec nettoyage cache PWA', err && (err.stack || err.message || err));
    }
    window.location.reload(true);
  }
  async function checkAssets() {
    var assets = cfg.requiredAssets || [];
    if (!assets.length) return [];
    setStatus('Vérification des fichiers essentiels...');
    var results = [];
    for (var i = 0; i < assets.length; i++) {
      var url = assets[i] + (assets[i].indexOf('?') === -1 ? '?v=' : '&v=') + encodeURIComponent(cfg.version || Date.now());
      try {
        var res = await fetch(url, { method: 'GET', cache: 'no-store' });
        results.push({ asset: assets[i], ok: res.ok, status: res.status });
        push(res.ok ? 'info' : 'error', 'Asset ' + assets[i] + ' → HTTP ' + res.status);
      } catch (err) {
        results.push({ asset: assets[i], ok: false, status: 'fetch_failed' });
        push('error', 'Asset ' + assets[i] + ' inaccessible', err && (err.message || err));
      }
    }
    return results;
  }
  function finish(message) {
    finished = true;
    clearBootTimers();
    setStatus(message || 'Interface prête.');
    var panel = $('ws-boot-panel');
    hidePanel(panel);
    try {
      if (document.body && document.body.dataset) document.body.dataset.wsReady = '1';
      window.dispatchEvent(new CustomEvent('webstorming:boot-ready', { detail: { message: message || 'Interface prête.' } }));
    } catch (_) {}
    push('info', 'Boot terminé');
  }
  function fail(message, detail) {
    finished = true;
    clearBootTimers();
    push('error', message || 'Boot interrompu', detail || null);
    renderPanel(message || 'Erreur pendant le démarrage.');
  }
  function registerButtons() {
    var retry = $('ws-retry');
    var clear = $('ws-clear-cache');
    if (retry) retry.addEventListener('click', function () { window.location.reload(); });
    if (clear) clear.addEventListener('click', clearCachesAndServiceWorkers);
  }
  window.addEventListener('error', function (event) {
    push('error', 'Erreur JavaScript: ' + (event.message || 'inconnue'), {
      source: event.filename,
      line: event.lineno,
      col: event.colno
    });
    if (!finished) renderPanel('Erreur JavaScript pendant le démarrage.');
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason || 'unhandled rejection';
    push('error', 'Promesse rejetée: ' + (reason.message || reason), reason.stack || null);
    if (!finished) renderPanel('Erreur asynchrone pendant le démarrage.');
  });
  window.addEventListener('webstorming:app-ready', function (event) {
    finish(event && event.detail && event.detail.message ? event.detail.message : 'Application prête.');
  });
  document.addEventListener('DOMContentLoaded', function () {
    registerButtons();
    var base = getBaseInfo();
    push('info', 'DOM prêt');
    push(base.ok ? 'info' : 'warn', 'Base path détectée: ' + base.path + ' / attendue: ' + base.expected);
    softTimer = setTimeout(function () {
      if (finished) return;
      if (isAppVisiblyReady()) {
        push('info', 'Interface détectée visuellement prête avant diagnostic soft-timeout');
        finish('Interface prête — détection visuelle.');
        return;
      }
      push('warn', 'Boot supérieur à ' + ((cfg.bootTimeoutMs || 12000) / 1000) + 's');
      renderPanel('Le démarrage prend trop longtemps. Le diagnostic est affiché pour éviter un écran figé.');
    }, cfg.bootTimeoutMs || 12000);
    hardTimer = setTimeout(function () {
      if (finished) return;
      if (isAppVisiblyReady()) {
        push('info', 'Interface détectée visuellement prête avant hard-timeout');
        finish('Interface prête — détection visuelle.');
        return;
      }
      fail('Boot hard timeout: l’application n’a pas confirmé son démarrage.', null);
    }, cfg.bootHardTimeoutMs || 30000);
  });
  window.WebStormingBootFix = {
    log: push,
    setStatus: setStatus,
    finish: finish,
    fail: fail,
    renderPanel: renderPanel,
    checkAssets: checkAssets,
    clearCachesAndServiceWorkers: clearCachesAndServiceWorkers,
    getLog: function () { return log.slice(); },
    getBaseInfo: getBaseInfo
  };
})();
