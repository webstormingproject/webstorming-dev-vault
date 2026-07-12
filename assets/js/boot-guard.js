(function () {
  'use strict';
  const cfg = window.WEBSTORMING_OS_CONFIG || {};
  const bootLog = [];
  const now = () => new Date().toLocaleTimeString('fr-FR');
  const log = (type, message, data) => {
    bootLog.push({ at: now(), type, message, data: data || null });
    window.WS_BOOT_LOG = bootLog;
    const status = document.getElementById('ws-loader-status');
    if (status && type !== 'error') status.textContent = message;
  };

  window.WSBoot = {
    log,
    done() {
      log('ok', 'Cockpit chargé.');
      const panel = document.getElementById('ws-boot-panel');
      if (panel) {
        panel.hidden = true;
        panel.style.display = 'none';
        panel.classList.add('is-hidden');
      }
      window.WS_BOOT_DONE = true;
    },
    fail(message, err) {
      log('error', message, err && (err.stack || err.message || String(err)));
      showBootPanel(message);
    },
    clearCacheAndReload: async function () {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
      } catch (e) {
        console.warn('[WS] purge cache error', e);
      }
      location.reload(true);
    }
  };

  function showBootPanel(summary) {
    const panel = document.getElementById('ws-boot-panel');
    const pre = document.getElementById('ws-boot-log');
    const sum = document.getElementById('ws-boot-summary');
    if (!panel) return;
    if (sum) sum.textContent = summary || 'Le démarrage prend trop longtemps.';
    if (pre) {
      pre.textContent = bootLog.map(x => `[${x.at}] ${x.type.toUpperCase()} — ${x.message}${x.data ? '\n' + x.data : ''}`).join('\n\n');
    }
    panel.hidden = false;
    panel.style.display = 'grid';
    panel.classList.remove('is-hidden');
  }

  async function checkAssets() {
    const assets = cfg.requiredAssets || [];
    for (const asset of assets) {
      try {
        const res = await fetch(asset, { method: 'HEAD', cache: 'no-store' });
        log(res.ok ? 'ok' : 'warn', `${asset} → ${res.status}`);
      } catch (err) {
        log('warn', `${asset} → échec test HEAD`, err.message);
      }
    }
  }

  window.addEventListener('error', (event) => {
    window.WSBoot.fail('Erreur JavaScript pendant le démarrage.', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    window.WSBoot.fail('Promesse rejetée pendant le démarrage.', event.reason);
  });
  window.addEventListener('DOMContentLoaded', () => {
    log('start', `Boot Guard ${cfg.version || ''} démarré.`);
    checkAssets();
    const retry = document.getElementById('ws-retry');
    const clear = document.getElementById('ws-clear-cache');
    if (retry) retry.addEventListener('click', () => location.reload());
    if (clear) clear.addEventListener('click', () => window.WSBoot.clearCacheAndReload());
  });
  setTimeout(() => {
    if (!window.WS_BOOT_DONE) showBootPanel('Le cockpit n’a pas confirmé son démarrage dans le délai prévu.');
  }, cfg.bootTimeoutMs || 9000);
})();
