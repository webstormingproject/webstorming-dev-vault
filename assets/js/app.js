(function () {
  'use strict';

  const VERSION = '1.2.0';
  const STORAGE_KEY = 'webstorming-os-cockpit-v120';
  const CAPABILITIES = [
    'analyse', 'texte', 'code', 'image', 'video', 'audio', 'wordpress', 'github', 'recherche', 'retouche', 'traduction', 'mission'
  ];
  const STATUS = ['idée', 'cadrage', 'rush', 'test', 'stable', 'pause'];
  const PRIORITIES = ['basse', 'normale', 'haute', 'rush'];

  const seedState = () => ({
    meta: {
      version: VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerMode: 'Cockpit personnel — données locales navigateur'
    },
    projects: [
      {
        id: uid('prj'),
        name: 'Journalia',
        family: 'Plateforme média IA',
        status: 'rush',
        priority: 'rush',
        channel: 'Branche Conseil / R&D + Codex',
        goal: 'Piloter la production média IA, WordPress, pipelines vidéo, retouches, fallback et modules spécialisés.',
        next: 'Brancher Media Studio, Media Workshop et API Manager dans une logique cockpit.',
        notes: 'Développement collaboratif responsable. Chaque brique analyse, propose et remonte les meilleures solutions.',
        createdAt: new Date().toISOString(),
        decisions: ['Architecture modulaire avec Commandante Orchestrateur et Branche Conseil / Recherche / Développement.']
      },
      {
        id: uid('prj'),
        name: 'WebStorming OS',
        family: 'Cockpit multi-IA',
        status: 'rush',
        priority: 'haute',
        channel: 'PWA / GitHub Pages puis backend sécurisé',
        goal: 'Centraliser les projets, les IA, les missions, les clés, les modèles et les décisions.',
        next: 'Tester Cockpit Core FR puis préparer connexion backend WordPress ou local sécurisé.',
        notes: 'Ne jamais stocker les clés de production dans une app statique. Backend obligatoire pour secrets réels.',
        createdAt: new Date().toISOString(),
        decisions: ['V1.2.0 = Project Launcher + API Manager skeleton + Mission Builder.']
      },
      {
        id: uid('prj'),
        name: 'Journalia Media Workshop',
        family: 'Retouche / remplacement média',
        status: 'cadrage',
        priority: 'haute',
        channel: 'WordPress plugin + PWA',
        goal: 'Retoucher, remplacer, améliorer et versionner les médias WordPress sans écraser les originaux.',
        next: 'Créer V0.1 image non destructive avec versions et rollback.',
        notes: 'Séparation claire entre génération et post-production.',
        createdAt: new Date().toISOString(),
        decisions: ['Génération = AI Media Studio. Retouche/remplacement = Media Workshop.']
      }
    ],
    providers: [
      {
        id: uid('pro'),
        name: 'OpenAI',
        type: 'API IA',
        status: 'à configurer',
        keyLabel: 'sk-••••••••••',
        keyStored: false,
        notes: 'Texte, analyse, image, édition selon modèles actifs. Clé réelle à stocker côté backend sécurisé.',
        models: [
          { id: uid('mdl'), name: 'gpt-image-1', capabilities: ['image', 'retouche'], priority: 1, status: 'manuel' },
          { id: uid('mdl'), name: 'gpt-4.1 / modèle texte', capabilities: ['analyse', 'texte', 'mission'], priority: 2, status: 'manuel' }
        ]
      },
      {
        id: uid('pro'),
        name: 'Gemini',
        type: 'API IA',
        status: 'à configurer',
        keyLabel: 'AIza••••••••',
        keyStored: false,
        notes: 'Très utile pour textes longs, synthèses, rédaction structurée et variantes éditoriales.',
        models: [
          { id: uid('mdl'), name: 'gemini texte', capabilities: ['texte', 'analyse', 'mission'], priority: 1, status: 'manuel' }
        ]
      },
      {
        id: uid('pro'),
        name: 'Codex',
        type: 'Spécialiste code',
        status: 'canal externe',
        keyLabel: 'via interface dédiée',
        keyStored: false,
        notes: 'Développement, correction code, refactoring, ZIP, tests techniques.',
        models: [
          { id: uid('mdl'), name: 'codex-code', capabilities: ['code', 'wordpress', 'github'], priority: 1, status: 'canal' }
        ]
      },
      {
        id: uid('pro'),
        name: 'Runway / Luma / Kling',
        type: 'API vidéo',
        status: 'à choisir',
        keyLabel: 'non configurée',
        keyStored: false,
        notes: 'Prévu pour génération vidéo, image-to-video, restyle, formats courts.',
        models: [
          { id: uid('mdl'), name: 'video-primary', capabilities: ['video'], priority: 1, status: 'prévu' }
        ]
      }
    ],
    missions: [],
    logs: [
      { id: uid('log'), at: new Date().toISOString(), level: 'info', message: 'Cockpit Core FR initialisé.' }
    ]
  });

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const state = seedState();
        saveState(state);
        return state;
      }
      const parsed = JSON.parse(raw);
      parsed.projects ||= [];
      parsed.providers ||= [];
      parsed.missions ||= [];
      parsed.logs ||= [];
      parsed.meta ||= { version: VERSION };
      return parsed;
    } catch (err) {
      console.warn('State load error, reseeding', err);
      const state = seedState();
      saveState(state);
      return state;
    }
  }

  function saveState(nextState) {
    nextState.meta ||= {};
    nextState.meta.version = VERSION;
    nextState.meta.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  let state = loadState();
  let activeView = 'dashboard';
  let selectedProjectId = state.projects[0]?.id || '';
  let lastMissionText = '';

  function addLog(level, message) {
    state.logs.unshift({ id: uid('log'), at: new Date().toISOString(), level, message });
    state.logs = state.logs.slice(0, 80);
    saveState(state);
  }

  function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-visible'), 3100);
  }

  function render() {
    const root = document.getElementById('ws-root');
    root.innerHTML = `
      <div class="ws-layout">
        ${renderSidebar()}
        <section class="main">
          ${renderTopbar()}
          <section id="view-dashboard" class="view ${activeView === 'dashboard' ? 'is-active' : ''}">${renderDashboard()}</section>
          <section id="view-projects" class="view ${activeView === 'projects' ? 'is-active' : ''}">${renderProjects()}</section>
          <section id="view-api" class="view ${activeView === 'api' ? 'is-active' : ''}">${renderApiManager()}</section>
          <section id="view-router" class="view ${activeView === 'router' ? 'is-active' : ''}">${renderRouter()}</section>
          <section id="view-mission" class="view ${activeView === 'mission' ? 'is-active' : ''}">${renderMissionBuilder()}</section>
          <section id="view-memory" class="view ${activeView === 'memory' ? 'is-active' : ''}">${renderMemory()}</section>
        </section>
      </div>
      ${renderModals()}
    `;
    bindEvents();
    window.WSBoot && window.WSBoot.done && window.WSBoot.done();
  }

  function renderSidebar() {
    const nav = [
      ['dashboard', 'Vue globale', '●'],
      ['projects', 'Projets', '●'],
      ['api', 'API & Modèles', '●'],
      ['router', 'Smart Router', '●'],
      ['mission', 'Mission Builder', '●'],
      ['memory', 'Mémoire / Export', '●']
    ];
    return `
      <aside class="sidebar">
        <div class="brand">
          <img src="./assets/icons/icon.svg" alt="" />
          <div><strong>WebStorming OS</strong><span>Cockpit FR v${VERSION}</span></div>
        </div>
        <nav class="nav" aria-label="Navigation principale">
          ${nav.map(([id, label]) => `<button type="button" data-view="${id}" class="${activeView === id ? 'is-active' : ''}"><span class="dot"></span>${label}</button>`).join('')}
        </nav>
        <div class="sidebar-footer">
          <button type="button" class="primary" data-open-modal="project">+ Nouveau projet</button>
          <button type="button" class="secondary" data-action="install-pwa">Installer PWA</button>
          <div class="tiny-note"><strong>Mode V1.2.0 :</strong> cockpit local navigateur. Les clés de production doivent passer par un backend sécurisé WordPress/local dans la prochaine phase.</div>
        </div>
      </aside>
    `;
  }

  function renderTopbar() {
    const titleMap = {
      dashboard: 'Pilotage global de tes devs',
      projects: 'Project Launcher',
      api: 'API & Model Manager',
      router: 'Smart Router / Fallback',
      mission: 'Mission Builder',
      memory: 'Mémoire projet & Export'
    };
    return `
      <header class="topbar">
        <div>
          <p class="eyebrow">Cockpit personnel multi-IA</p>
          <h1>${titleMap[activeView]}</h1>
          <p>Une seule interface, plusieurs cerveaux, une mémoire projet et une chaîne de mission claire.</p>
        </div>
        <div class="top-actions">
          <button type="button" class="primary" data-open-modal="project">Nouveau projet</button>
          <button type="button" class="secondary" data-open-modal="provider">Ajouter API</button>
          <button type="button" class="ghost" data-action="export-json">Exporter JSON</button>
        </div>
      </header>
    `;
  }

  function renderDashboard() {
    const k = computeKpis();
    const recent = state.projects.slice(0, 4);
    return `
      <div class="grid cols-4">
        ${kpi('Projets', k.projects, '🧭')}
        ${kpi('Fournisseurs', k.providers, '🔑')}
        ${kpi('Modèles', k.models, '🧠')}
        ${kpi('Missions', k.missions, '🚀')}
      </div>
      <div class="grid cols-2" style="margin-top:1rem">
        <div class="card">
          <h2>Vue opérationnelle</h2>
          <p>Ce cockpit sert à centraliser tes développements : idées, projets, API, modèles, choix du spécialiste, missions Codex/Gemini/Claude/autres, décisions et exports.</p>
          <div class="button-row">
            <button class="primary" data-open-modal="project">Démarrer un projet</button>
            <button class="secondary" data-view="mission">Créer une mission</button>
            <button class="ghost" data-view="api">Configurer API</button>
          </div>
        </div>
        <div class="card security-box">
          <strong>Sécurité clés API</strong>
          <p>Cette V1.2.0 est un cockpit front/PWA. Elle prépare le gestionnaire de clés, mais les vraies clés sensibles ne doivent pas être utilisées en production ici. Prochaine étape : backend sécurisé WordPress/local pour chiffrement et appels serveur.</p>
        </div>
      </div>
      <div class="card" style="margin-top:1rem">
        <h2>Projets actifs</h2>
        <div class="list">
          ${recent.map(renderProjectItem).join('') || '<p>Aucun projet.</p>'}
        </div>
      </div>
    `;
  }

  function kpi(label, value, icon) {
    return `<div class="card kpi"><div><div class="value">${value}</div><div class="label">${label}</div></div><div class="icon">${icon}</div></div>`;
  }

  function computeKpis() {
    return {
      projects: state.projects.length,
      providers: state.providers.length,
      models: state.providers.reduce((acc, p) => acc + (p.models || []).length, 0),
      missions: state.missions.length
    };
  }

  function renderProjects() {
    return `
      <div class="grid cols-2">
        <div class="card">
          <h2>Créer / piloter</h2>
          <p>Le Project Launcher transforme une idée en fiche projet exploitable : objectif, statut, priorité, canal conseillé et prochaine action.</p>
          <button class="primary" data-open-modal="project">+ Nouveau projet</button>
        </div>
        <div class="card soft">
          <h2>Règle Journalia</h2>
          <p>Aucun intervenant n’est un simple exécutant. Chaque brique analyse, donne son expertise, propose, alerte et remonte les meilleures solutions.</p>
        </div>
      </div>
      <div class="card" style="margin-top:1rem">
        <h2>Tous les projets</h2>
        <div class="list">${state.projects.map(renderProjectItem).join('') || '<p>Aucun projet.</p>'}</div>
      </div>
    `;
  }

  function renderProjectItem(project) {
    return `
      <article class="item">
        <div class="item-header">
          <div>
            <h3>${escapeHtml(project.name)}</h3>
            <div class="meta">
              <span class="badge gold">${escapeHtml(project.family || 'projet')}</span>
              <span class="badge blue">${escapeHtml(project.status)}</span>
              <span class="badge ${project.priority === 'rush' ? 'red' : 'green'}">priorité ${escapeHtml(project.priority)}</span>
            </div>
          </div>
          <div class="button-row">
            <button class="secondary" data-action="select-project" data-id="${project.id}">Mission</button>
            <button class="ghost" data-action="delete-project" data-id="${project.id}">Suppr.</button>
          </div>
        </div>
        <p><strong>Objectif :</strong> ${escapeHtml(project.goal)}</p>
        <p><strong>Prochaine action :</strong> ${escapeHtml(project.next)}</p>
        <p><strong>Canal conseillé :</strong> ${escapeHtml(project.channel)}</p>
      </article>
    `;
  }

  function renderApiManager() {
    return `
      <div class="grid cols-2">
        <div class="card">
          <h2>Fournisseurs IA</h2>
          <p>Déclare les API, les modèles et les capacités. Le routeur s’en servira ensuite pour choisir le bon spécialiste.</p>
          <button class="primary" data-open-modal="provider">+ Ajouter fournisseur</button>
        </div>
        <div class="card security-box">
          <strong>Rappel important</strong>
          <p>Stockage clés : V1.2.0 = squelette local. Pour production, on branchera une table WordPress/backend avec chiffrement, permissions, nonces et appels serveur.</p>
        </div>
      </div>
      <div class="card" style="margin-top:1rem">
        <h2>Liste fournisseurs / modèles</h2>
        <div class="list">${state.providers.map(renderProviderItem).join('')}</div>
      </div>
    `;
  }

  function renderProviderItem(provider) {
    const models = provider.models || [];
    return `
      <article class="item">
        <div class="item-header">
          <div>
            <h3>${escapeHtml(provider.name)}</h3>
            <div class="meta">
              <span class="badge gold">${escapeHtml(provider.type)}</span>
              <span class="badge ${provider.status.includes('configurer') ? 'red' : 'green'}">${escapeHtml(provider.status)}</span>
              <span class="badge">clé : ${escapeHtml(provider.keyLabel || 'masquée')}</span>
            </div>
          </div>
          <div class="button-row">
            <button class="secondary" data-open-modal="model" data-provider-id="${provider.id}">+ Modèle</button>
            <button class="ghost" data-action="delete-provider" data-id="${provider.id}">Suppr.</button>
          </div>
        </div>
        <p>${escapeHtml(provider.notes || '')}</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Modèle</th><th>Capacités</th><th>Priorité</th><th>Statut</th></tr></thead>
            <tbody>
              ${models.map(m => `<tr><td>${escapeHtml(m.name)}</td><td>${(m.capabilities || []).map(c => `<span class="badge blue">${escapeHtml(c)}</span>`).join(' ')}</td><td>${escapeHtml(m.priority || '-')}</td><td>${escapeHtml(m.status || '-')}</td></tr>`).join('') || '<tr><td colspan="4">Aucun modèle.</td></tr>'}
            </tbody>
          </table>
        </div>
      </article>
    `;
  }

  function renderRouter() {
    const rows = CAPABILITIES.map(cap => {
      const candidates = [];
      state.providers.forEach(p => (p.models || []).forEach(m => {
        if ((m.capabilities || []).includes(cap)) candidates.push({ provider: p.name, model: m.name, priority: Number(m.priority || 99), status: m.status || '-' });
      }));
      candidates.sort((a, b) => a.priority - b.priority);
      const primary = candidates[0];
      const fallbacks = candidates.slice(1, 4);
      return `<tr>
        <td><span class="badge gold">${escapeHtml(cap)}</span></td>
        <td>${primary ? `${escapeHtml(primary.provider)} / ${escapeHtml(primary.model)}` : '<span class="badge red">non couvert</span>'}</td>
        <td>${fallbacks.map(f => `<span class="badge blue">${escapeHtml(f.provider)} / ${escapeHtml(f.model)}</span>`).join(' ') || '<span class="badge">aucun</span>'}</td>
        <td>${candidates.length ? '<span class="badge green">routable</span>' : '<span class="badge red">à configurer</span>'}</td>
      </tr>`;
    }).join('');
    return `
      <div class="card">
        <h2>Routage par capacité</h2>
        <p>Le Smart Router choisira le meilleur modèle selon la tâche, puis basculera vers un fallback si le modèle principal échoue.</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Capacité</th><th>Principal</th><th>Fallbacks</th><th>État</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <div class="grid cols-2" style="margin-top:1rem">
        <div class="card soft"><h3>Logique prévue</h3><p>Demande → capacité → modèle principal → retry → fallback modèle → fallback fournisseur → erreur claire si aucun modèle compatible.</p></div>
        <div class="card soft"><h3>Prochaine phase</h3><p>Tests réels des clés, remontée automatique modèles, quotas, latence, coût estimé et mise en quarantaine temporaire d’un fournisseur instable.</p></div>
      </div>
    `;
  }

  function renderMissionBuilder() {
    const projectOptions = state.projects.map(p => `<option value="${p.id}" ${p.id === selectedProjectId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
    const current = state.projects.find(p => p.id === selectedProjectId) || state.projects[0];
    const recommended = current ? recommendSpecialists(current.goal + ' ' + current.next + ' ' + current.family) : [];
    return `
      <div class="grid cols-2">
        <div class="card">
          <h2>Créer une mission</h2>
          <form id="mission-form" class="form">
            <div class="field"><label>Projet</label><select name="projectId">${projectOptions}</select></div>
            <div class="field"><label>Type de mission</label><select name="missionType">
              <option value="cadrage">Cadrage / architecture</option>
              <option value="codage">Codage / correction</option>
              <option value="texte">Rédaction / prompt / contenu</option>
              <option value="image">Image / retouche</option>
              <option value="video">Vidéo / média</option>
              <option value="audit">Audit / test</option>
            </select></div>
            <div class="field"><label>Besoin précis</label><textarea name="need" placeholder="Décris la mission à lancer..."></textarea></div>
            <div class="field"><label>Contraintes</label><textarea name="constraints" placeholder="Sécurité, WordPress, cPanel, GitHub, délais, versions, etc."></textarea></div>
            <button class="primary" type="submit">Générer mission</button>
          </form>
        </div>
        <div class="card soft">
          <h2>Spécialistes recommandés</h2>
          <p>Pour le projet sélectionné :</p>
          <div class="meta">${recommended.map(r => `<span class="badge gold">${escapeHtml(r)}</span>`).join(' ') || '<span class="badge">à préciser</span>'}</div>
          <p style="margin-top:1rem">Le document généré respecte la chaîne Journalia : analyse, répartition, expertise, retour terrain et droit de remontée technique.</p>
        </div>
      </div>
      <div class="card" style="margin-top:1rem">
        <div class="item-header"><h2>Mission prête à transmettre</h2><div class="button-row"><button class="secondary" data-action="copy-mission">Copier</button><button class="ghost" data-action="save-mission">Sauver mission</button></div></div>
        <pre id="mission-output" class="mission-output">${escapeHtml(lastMissionText || 'Remplis le formulaire pour générer une mission structurée.')}</pre>
      </div>
    `;
  }

  function recommendSpecialists(text) {
    const lower = text.toLowerCase();
    const out = ['Branche Conseil / R&D'];
    if (/code|plugin|wordpress|php|js|github|zip|correction|développement/.test(lower)) out.push('Journalia Codex');
    if (/texte|article|rédaction|script|éditorial|prompt/.test(lower)) out.push('Gemini / Claude');
    if (/image|photo|retouche|visuel/.test(lower)) out.push('Modèle Image spécialisé');
    if (/video|vidéo|jt|montage|avatar/.test(lower)) out.push('Modèle Vidéo / Pipeline');
    if (/audio|voix|tts|son/.test(lower)) out.push('Moteur Audio / TTS');
    return Array.from(new Set(out));
  }

  function renderMemory() {
    const data = JSON.stringify(state, null, 2);
    return `
      <div class="grid cols-2">
        <div class="card"><h2>Export / sauvegarde</h2><p>Exporte tout le cockpit en JSON : projets, fournisseurs, modèles, missions, logs. Tu peux le garder comme sauvegarde ou le réimporter plus tard.</p><div class="button-row"><button class="primary" data-action="export-json">Télécharger JSON</button><button class="secondary" data-action="copy-json">Copier JSON</button><button class="danger" data-action="reset-state">Réinitialiser</button></div></div>
        <div class="card"><h2>Import</h2><p>Colle un export JSON valide pour restaurer la mémoire locale.</p><form id="import-form" class="form"><textarea name="json" placeholder="Coller JSON ici"></textarea><button class="secondary" type="submit">Importer</button></form></div>
      </div>
      <div class="card" style="margin-top:1rem"><h2>Logs récents</h2><div class="list">${state.logs.slice(0,12).map(l => `<div class="item"><div class="meta"><span class="badge ${l.level === 'error' ? 'red' : 'green'}">${escapeHtml(l.level)}</span><span>${new Date(l.at).toLocaleString('fr-FR')}</span></div><div>${escapeHtml(l.message)}</div></div>`).join('')}</div></div>
      <div class="card" style="margin-top:1rem"><h2>JSON courant</h2><pre class="json-output">${escapeHtml(data)}</pre></div>
    `;
  }

  function renderModals() {
    return `
      <div id="modal-project" class="modal" role="dialog" aria-modal="true" aria-label="Nouveau projet">
        <div class="modal-card">
          <div class="modal-head"><h2>Nouveau projet</h2><button class="close ghost" data-close-modal>×</button></div>
          <form id="project-form" class="form two">
            <div class="field"><label>Nom du projet</label><input name="name" required placeholder="Ex : Media Workshop" /></div>
            <div class="field"><label>Famille</label><input name="family" placeholder="WordPress, PWA, IA, média..." /></div>
            <div class="field"><label>Statut</label><select name="status">${STATUS.map(s => `<option>${s}</option>`).join('')}</select></div>
            <div class="field"><label>Priorité</label><select name="priority">${PRIORITIES.map(p => `<option>${p}</option>`).join('')}</select></div>
            <div class="field"><label>Canal conseillé</label><input name="channel" placeholder="Codex, Gemini, Claude, WordPress..." /></div>
            <div class="field"><label>Prochaine action</label><input name="next" placeholder="Micro-rush V0.1, audit, patch..." /></div>
            <div class="field" style="grid-column:1/-1"><label>Objectif</label><textarea name="goal" required></textarea></div>
            <div class="field" style="grid-column:1/-1"><label>Notes / philosophie</label><textarea name="notes"></textarea></div>
            <div class="button-row" style="grid-column:1/-1"><button class="primary" type="submit">Créer le projet</button><button class="ghost" type="button" data-close-modal>Annuler</button></div>
          </form>
        </div>
      </div>

      <div id="modal-provider" class="modal" role="dialog" aria-modal="true" aria-label="Ajouter fournisseur">
        <div class="modal-card">
          <div class="modal-head"><h2>Ajouter fournisseur IA/API</h2><button class="close ghost" data-close-modal>×</button></div>
          <div class="security-box" style="margin-bottom:1rem"><strong>V1.2.0 :</strong> n’utilise pas ici une clé de production. Le vrai stockage sécurisé arrive en backend WordPress/local.</div>
          <form id="provider-form" class="form two">
            <div class="field"><label>Nom fournisseur</label><input name="name" required placeholder="OpenAI, Gemini, Runway..." /></div>
            <div class="field"><label>Type</label><input name="type" placeholder="Texte, code, image, vidéo..." /></div>
            <div class="field"><label>Statut</label><select name="status"><option>à configurer</option><option>actif</option><option>canal externe</option><option>à choisir</option><option>pause</option></select></div>
            <div class="field"><label>Libellé clé masquée</label><input name="keyLabel" placeholder="sk-••••••" /></div>
            <div class="field" style="grid-column:1/-1"><label>Notes</label><textarea name="notes"></textarea></div>
            <div class="button-row" style="grid-column:1/-1"><button class="primary" type="submit">Ajouter fournisseur</button><button class="ghost" type="button" data-close-modal>Annuler</button></div>
          </form>
        </div>
      </div>

      <div id="modal-model" class="modal" role="dialog" aria-modal="true" aria-label="Ajouter modèle">
        <div class="modal-card">
          <div class="modal-head"><h2>Ajouter modèle</h2><button class="close ghost" data-close-modal>×</button></div>
          <form id="model-form" class="form two">
            <input type="hidden" name="providerId" />
            <div class="field"><label>Nom modèle</label><input name="name" required placeholder="gpt-image-1, gemini, runway..." /></div>
            <div class="field"><label>Priorité</label><input name="priority" type="number" min="1" value="1" /></div>
            <div class="field"><label>Statut</label><select name="status"><option>manuel</option><option>actif</option><option>prévu</option><option>canal</option><option>test requis</option></select></div>
            <div class="field"><label>Capacités</label><select name="capabilities" multiple size="8">${CAPABILITIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
            <div class="button-row" style="grid-column:1/-1"><button class="primary" type="submit">Ajouter modèle</button><button class="ghost" type="button" data-close-modal>Annuler</button></div>
          </form>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      activeView = btn.dataset.view;
      render();
    }));
    document.querySelectorAll('[data-open-modal]').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.openModal, btn.dataset)));
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModals));
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModals(); }));

    const projectForm = document.getElementById('project-form');
    if (projectForm) projectForm.addEventListener('submit', onProjectSubmit);
    const providerForm = document.getElementById('provider-form');
    if (providerForm) providerForm.addEventListener('submit', onProviderSubmit);
    const modelForm = document.getElementById('model-form');
    if (modelForm) modelForm.addEventListener('submit', onModelSubmit);
    const missionForm = document.getElementById('mission-form');
    if (missionForm) missionForm.addEventListener('submit', onMissionSubmit);
    if (missionForm) missionForm.projectId.addEventListener('change', e => { selectedProjectId = e.target.value; render(); });
    const importForm = document.getElementById('import-form');
    if (importForm) importForm.addEventListener('submit', onImportSubmit);

    document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', onAction));
  }

  function openModal(name, data) {
    closeModals();
    const modal = document.getElementById(`modal-${name}`);
    if (!modal) return;
    modal.classList.add('is-open');
    if (name === 'model') {
      const form = document.getElementById('model-form');
      if (form && data.providerId) form.providerId.value = data.providerId;
    }
  }

  function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('is-open'));
  }

  function onProjectSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const project = Object.fromEntries(fd.entries());
    project.id = uid('prj');
    project.createdAt = new Date().toISOString();
    project.decisions = [];
    state.projects.unshift(project);
    selectedProjectId = project.id;
    addLog('info', `Projet créé : ${project.name}`);
    saveState(state);
    closeModals();
    activeView = 'projects';
    render();
    toast('Projet créé.');
  }

  function onProviderSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const provider = Object.fromEntries(fd.entries());
    provider.id = uid('pro');
    provider.models = [];
    provider.keyStored = false;
    state.providers.unshift(provider);
    addLog('info', `Fournisseur ajouté : ${provider.name}`);
    saveState(state);
    closeModals();
    activeView = 'api';
    render();
    toast('Fournisseur ajouté.');
  }

  function onModelSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const providerId = fd.get('providerId');
    const provider = state.providers.find(p => p.id === providerId);
    if (!provider) return toast('Fournisseur introuvable.');
    const caps = Array.from(e.currentTarget.capabilities.selectedOptions).map(o => o.value);
    provider.models ||= [];
    provider.models.push({
      id: uid('mdl'),
      name: fd.get('name'),
      priority: Number(fd.get('priority') || 1),
      status: fd.get('status'),
      capabilities: caps
    });
    addLog('info', `Modèle ajouté : ${fd.get('name')} sur ${provider.name}`);
    saveState(state);
    closeModals();
    activeView = 'api';
    render();
    toast('Modèle ajouté.');
  }

  function onMissionSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    selectedProjectId = fd.get('projectId');
    const project = state.projects.find(p => p.id === selectedProjectId);
    const type = fd.get('missionType');
    const need = fd.get('need') || project?.next || '';
    const constraints = fd.get('constraints') || 'Respecter l’architecture Journalia, sécurité, modularité, micro-rush, tests et retour d’expertise.';
    lastMissionText = buildMission(project, type, need, constraints);
    addLog('info', `Mission générée pour ${project?.name || 'projet'}`);
    render();
    toast('Mission générée.');
  }

  function buildMission(project, type, need, constraints) {
    const specialists = recommendSpecialists(`${type} ${need} ${project?.goal || ''}`);
    return `MISSION JOURNALIA / WEBSTORMING OS\n\nProjet : ${project?.name || 'Non défini'}\nFamille : ${project?.family || '-'}\nType de mission : ${type}\nPriorité : ${project?.priority || 'normale'}\n\n1. CONTEXTE\n${project?.goal || 'Contexte à préciser.'}\n\n2. BESOIN À TRAITER\n${need}\n\n3. CONTRAINTES / CADRE\n${constraints}\n\n4. SPÉCIALISTES RECOMMANDÉS\n${specialists.map(s => '- ' + s).join('\n')}\n\n5. ATTENDUS\n- Analyse technique avant exécution\n- Proposition de meilleure solution si nécessaire\n- Développement par micro-rush\n- Livraison testable\n- Logs/diagnostic lisibles\n- Documentation d’installation\n- Retour d’expertise si une option plus solide est détectée\n\n6. RÈGLE PHILOSOPHIQUE JOURNALIA\nAucun intervenant n’est un simple exécutant. Chaque brique doit analyser, proposer, alerter et faire remonter toute meilleure solution. Le dernier étage a le même pouvoir d’expertise que le premier si son analyse améliore la mission.\n\n7. PROCHAINE ACTION\nPréparer une V0.1/V1 testable, limitée, stable, et éviter toute usine à gaz.`;
  }

  function onImportSubmit(e) {
    e.preventDefault();
    const txt = new FormData(e.currentTarget).get('json');
    try {
      const parsed = JSON.parse(txt);
      if (!parsed.projects || !parsed.providers) throw new Error('Structure invalide');
      state = parsed;
      saveState(state);
      addLog('info', 'Import JSON effectué.');
      activeView = 'dashboard';
      render();
      toast('Import réussi.');
    } catch (err) {
      toast('Import impossible : JSON invalide.');
    }
  }

  function onAction(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'install-pwa') return toast('Dans Chrome/Edge : menu navigateur → Installer l’application.');
    if (action === 'select-project') { selectedProjectId = id; activeView = 'mission'; return render(); }
    if (action === 'delete-project') return deleteProject(id);
    if (action === 'delete-provider') return deleteProvider(id);
    if (action === 'copy-mission') return copyText(lastMissionText || document.getElementById('mission-output')?.textContent || '');
    if (action === 'save-mission') return saveMission();
    if (action === 'export-json') return exportJson();
    if (action === 'copy-json') return copyText(JSON.stringify(state, null, 2));
    if (action === 'reset-state') return resetState();
  }

  function deleteProject(id) {
    const p = state.projects.find(x => x.id === id);
    if (!p || !confirm(`Supprimer le projet « ${p.name} » ?`)) return;
    state.projects = state.projects.filter(x => x.id !== id);
    addLog('info', `Projet supprimé : ${p.name}`);
    saveState(state);
    render();
    toast('Projet supprimé.');
  }

  function deleteProvider(id) {
    const p = state.providers.find(x => x.id === id);
    if (!p || !confirm(`Supprimer le fournisseur « ${p.name} » ?`)) return;
    state.providers = state.providers.filter(x => x.id !== id);
    addLog('info', `Fournisseur supprimé : ${p.name}`);
    saveState(state);
    render();
    toast('Fournisseur supprimé.');
  }

  function saveMission() {
    if (!lastMissionText) return toast('Aucune mission à sauvegarder.');
    state.missions.unshift({ id: uid('mis'), at: new Date().toISOString(), projectId: selectedProjectId, text: lastMissionText });
    addLog('info', 'Mission sauvegardée dans la mémoire locale.');
    saveState(state);
    render();
    toast('Mission sauvegardée.');
  }

  async function copyText(text) {
    if (!text) return toast('Rien à copier.');
    try {
      await navigator.clipboard.writeText(text);
      toast('Copié dans le presse-papiers.');
    } catch {
      toast('Copie impossible automatiquement.');
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `webstorming-cockpit-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Export JSON lancé.');
  }

  function resetState() {
    if (!confirm('Réinitialiser la mémoire locale du cockpit ?')) return;
    state = seedState();
    saveState(state);
    activeView = 'dashboard';
    lastMissionText = '';
    render();
    toast('Mémoire réinitialisée.');
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW error', err));
    });
  }

  function start() {
    try {
      registerServiceWorker();
      render();
    } catch (err) {
      window.WSBoot && window.WSBoot.fail ? window.WSBoot.fail('Erreur au rendu du cockpit.', err) : console.error(err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
