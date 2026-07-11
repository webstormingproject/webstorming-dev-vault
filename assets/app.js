let projects=[];
let config={version:"0.4",build:"WS4V04",pagesUrl:"#",githubOwner:"webstormingproject",centralRepo:"webstorming-dev-vault"};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const repoName=p=>String(p.repo||"").trim();

async function init(){
  try{
    const [pr,cr]=await Promise.all([fetch("projects.json"),fetch("config.json")]);
    if(!pr.ok) throw new Error("projects.json introuvable");
    projects=await pr.json();
    if(cr.ok) config=await cr.json();
  }catch(err){
    document.body.insertAdjacentHTML("afterbegin",`<div class="fatal">Chargement partiel : ${esc(err.message)}</div>`);
  }
  applyConfig(); fillSelectors(); renderStats(); renderPriority(); renderCategories();
  renderProjects(); renderRoadmap(); renderIdeas(); renderBuilds(); bindUI();
  tick(); setInterval(tick,1000);
  refreshGithub();
}

function applyConfig(){
  $("#appVersion").textContent=`V${config.version}`;
  $("#buildLabel").textContent=`Build ${config.build}`;
  $("#currentVersion").textContent=`WebStorming OS V${config.version}`;
  $("#currentBuild").textContent=config.build;
  $("#pagesLink").href=config.pagesUrl||"#";
}

function tick(){
  const d=new Date();
  $("#today").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("#time").textContent=d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
}

function fillSelectors(){
  const cats=[...new Set(projects.map(p=>p.category))].filter(Boolean).sort();
  const sts=[...new Set(projects.map(p=>p.status))].filter(Boolean).sort();
  cats.forEach(x=>$("#cat").insertAdjacentHTML("beforeend",`<option>${esc(x)}</option>`));
  sts.forEach(x=>$("#status").insertAdjacentHTML("beforeend",`<option>${esc(x)}</option>`));
  [$("#quickProject"),$("#ideaProject")].forEach(sel=>{
    projects.forEach(p=>sel.insertAdjacentHTML("beforeend",`<option value="${esc(p.name)}">${esc(p.name)}</option>`));
  });
}

function renderStats(){
  $("#count").textContent=projects.length;
  $("#critical").textContent=projects.filter(p=>p.priority==="Critique").length;
  $("#repoCount").textContent=projects.filter(p=>repoName(p)).length;
  const avg=projects.length?Math.round(projects.reduce((a,p)=>a+(Number(p.progress)||0),0)/projects.length):0;
  $("#avg").textContent=avg+"%";
}

function renderPriority(){
  const weights={Critique:0,Haute:1,Moyenne:2,Normale:3};
  const arr=[...projects].sort((a,b)=>(weights[a.priority]??9)-(weights[b.priority]??9)).slice(0,6);
  $("#priorityList").innerHTML=arr.map(p=>`
    <div class="priority-item">
      <div><b>${esc(p.name)}</b><small>${esc(p.next?.[0]||"À définir")}</small></div>
      <div class="progress"><i style="width:${Math.min(100,Math.max(0,p.progress||0))}%"></i></div>
      <button class="link-btn" data-open-project="${esc(p.id)}">${Number(p.progress)||0}%</button>
    </div>`).join("");
  const p=arr[0];
  $("#nextAction").innerHTML=p?`<b>${esc(p.name)}</b><br>${esc(p.next?.[0]||"Revoir la roadmap")}`:"Aucune action définie.";
}

function renderCategories(){
  const m={}; projects.forEach(p=>m[p.category]=(m[p.category]||0)+1);
  const vals=Object.values(m), max=vals.length?Math.max(...vals):1;
  $("#categoryBars").innerHTML=Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
    <div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join("");
}

function projectCard(p){
  const repo=repoName(p);
  return `<article class="card">
    <div class="card-head"><h3>${esc(p.name)}</h3><span class="health health-${slug(p.health)}">${esc(p.health||"À vérifier")}</span></div>
    <div class="meta"><span class="badge">${esc(p.category)}</span><span class="badge">${esc(p.status)}</span><span class="badge">${esc(p.priority)}</span></div>
    <p>${esc(p.summary)}</p>
    <div class="meta">${(p.stack||[]).map(x=>`<span class="badge">${esc(x)}</span>`).join("")}</div>
    <div class="card-progress"><div class="progress"><i style="width:${Number(p.progress)||0}%"></i></div><b>${Number(p.progress)||0}%</b></div>
    <div class="actions">
      <button class="btn" data-open-project="${esc(p.id)}">Fiche projet</button>
      ${repo?`<a class="btn secondary" href="https://github.com/${esc(repo)}" target="_blank" rel="noopener">GitHub</a>`:`<span class="btn disabled">Dépôt à relier</span>`}
    </div>
  </article>`;
}

function renderProjects(){
  const q=($("#q").value||"").toLowerCase(),cat=$("#cat").value,st=$("#status").value;
  const list=projects.filter(p=>(!cat||p.category===cat)&&(!st||p.status===st)&&JSON.stringify(p).toLowerCase().includes(q));
  $("#cards").innerHTML=list.map(projectCard).join("")||"<p>Aucun projet trouvé.</p>";
}

function openProject(id){
  const p=projects.find(x=>x.id===id); if(!p)return;
  const repo=repoName(p);
  $("#dialogContent").innerHTML=`
    <span class="eyebrow">${esc(p.category)}</span>
    <h2>${esc(p.name)}</h2>
    <p>${esc(p.summary)}</p>
    <div class="meta">
      <span class="badge">${esc(p.status)}</span><span class="badge">${esc(p.priority)}</span>
      <span class="badge">${Number(p.progress)||0}%</span><span class="badge">Version ${esc(p.version||"Non renseignée")}</span>
    </div>
    <h3>Technologies</h3><div class="meta">${(p.stack||[]).map(x=>`<span class="badge">${esc(x)}</span>`).join("")}</div>
    <h3>Prochaines actions</h3><ul>${(p.next||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
    <h3>Dépôt</h3>
    ${repo?`<a class="btn" target="_blank" rel="noopener" href="https://github.com/${esc(repo)}">${esc(repo)}</a>`:"<p class='muted'>Dépôt GitHub à renseigner dans projects.json.</p>"}`;
  $("#projectDialog").showModal();
}

function renderRoadmap(){
  const sorted=[...projects].sort((a,b)=>(b.progress||0)-(a.progress||0));
  const now=sorted.filter(p=>p.priority==="Critique"||p.status==="En cours").slice(0,7);
  const next=sorted.filter(p=>p.priority==="Haute"&&!now.includes(p)).slice(0,7);
  const later=sorted.filter(p=>!now.includes(p)&&!next.includes(p)).slice(0,9);
  const html=arr=>arr.map(p=>`<article class="road-item"><b>${esc(p.name)}</b><span>${esc(p.next?.[0]||"À préciser")}</span></article>`).join("")||"<p class='muted'>Rien pour le moment.</p>";
  $("#roadNow").innerHTML=html(now); $("#roadNext").innerHTML=html(next); $("#roadLater").innerHTML=html(later);
}

function ideas(){try{return JSON.parse(localStorage.getItem("wsIdeas")||"[]")}catch{return []}}
function saveIdeas(v){localStorage.setItem("wsIdeas",JSON.stringify(v))}
function addIdea(text,project,priority="Normale"){
  const clean=String(text||"").trim(); if(!clean)return false;
  const list=ideas(); list.unshift({id:crypto.randomUUID?.()||String(Date.now()),text:clean,project,priority,createdAt:new Date().toISOString()});
  saveIdeas(list); renderIdeas(); return true;
}
function renderIdeas(){
  const list=ideas();
  $("#ideaList").innerHTML=list.map(i=>`<article class="idea-item">
    <div><b>${esc(i.project)}</b><span class="badge">${esc(i.priority)}</span></div>
    <p>${esc(i.text)}</p><small>${new Date(i.createdAt).toLocaleString("fr-FR")}</small>
  </article>`).join("")||"<p class='muted'>Aucune idée enregistrée sur cet appareil.</p>";
}

function slug(v){return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}

async function fetchRepo(fullName,force=false){
  const cacheKey=`wsRepo:${fullName}`;
  if(!force){
    try{
      const cached=JSON.parse(localStorage.getItem(cacheKey)||"null");
      if(cached&&Date.now()-cached.savedAt<5*60*1000)return cached.data;
    }catch{}
  }
  const r=await fetch(`https://api.github.com/repos/${encodeURIComponent(fullName).replace("%2F","/")}`,{headers:{"Accept":"application/vnd.github+json"}});
  if(!r.ok)throw new Error(r.status===404?"Dépôt introuvable":`GitHub ${r.status}`);
  const data=await r.json();
  localStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),data}));
  return data;
}

function repoCard(p,state){
  const repo=repoName(p);
  if(!repo)return `<article class="card repo-card unavailable"><h3>${esc(p.name)}</h3><p>Dépôt non relié.</p><small>Ajoute <code>owner/repository</code> dans projects.json.</small></article>`;
  if(state.loading)return `<article class="card repo-card"><h3>${esc(p.name)}</h3><p>Chargement de ${esc(repo)}…</p></article>`;
  if(state.error)return `<article class="card repo-card error"><h3>${esc(p.name)}</h3><p>${esc(state.error)}</p><a target="_blank" rel="noopener" href="https://github.com/${esc(repo)}">Ouvrir GitHub</a></article>`;
  const d=state.data;
  return `<article class="card repo-card">
    <div class="card-head"><h3>${esc(p.name)}</h3><span class="health health-en-ligne">GitHub</span></div>
    <p><b>${esc(d.full_name)}</b></p>
    <div class="repo-metrics">
      <span>★ ${d.stargazers_count}</span><span>⑂ ${d.forks_count}</span><span>Issues ${d.open_issues_count}</span>
    </div>
    <small>Dernière mise à jour : ${new Date(d.updated_at).toLocaleString("fr-FR")}</small>
    <div class="actions"><a class="btn" href="${esc(d.html_url)}" target="_blank" rel="noopener">Ouvrir le dépôt</a></div>
  </article>`;
}

async function refreshGithub(force=false){
  const linked=projects.filter(p=>repoName(p));
  const states=new Map(linked.map(p=>[p.id,{loading:true}]));
  renderGithub(states);
  $("#centralRepoStatus").textContent="Connexion à GitHub…";
  const results=await Promise.all(linked.map(async p=>{
    try{return [p.id,{data:await fetchRepo(repoName(p),force)}]}
    catch(e){return [p.id,{error:e.message}]}
  }));
  results.forEach(([id,s])=>states.set(id,s));
  renderGithub(states);
  const central=projects.find(p=>repoName(p)===`${config.githubOwner}/${config.centralRepo}`)||projects.find(p=>p.id==="webstorming-os");
  const st=central?states.get(central.id):null;
  if(st?.data){
    $("#centralRepoStatus").innerHTML=`<b>${esc(st.data.full_name)}</b><br><span>${esc(st.data.default_branch)} · ${st.data.open_issues_count} issue(s) ouverte(s)</span><br><small>Mis à jour ${new Date(st.data.updated_at).toLocaleString("fr-FR")}</small>`;
  }else{
    $("#centralRepoStatus").textContent=st?.error||"Dépôt central non configuré.";
  }
  $("#githubRefreshState").textContent=`Dernière lecture : ${new Date().toLocaleTimeString("fr-FR")}`;
}

function renderGithub(states){
  $("#githubGrid").innerHTML=projects.map(p=>repoCard(p,states.get(p.id)||{})).join("");
}

function renderBuilds(){
  const builds=[
    {version:"0.4",build:"WS4V04",date:"11/07/2026",title:"GitHub & historique des builds",current:true},
    {version:"0.3",build:"WS3V03",date:"11/07/2026",title:"Cockpit, roadmap et Atelier des idées"},
    {version:"0.2",build:"WS2V02",date:"11/07/2026",title:"Catalogue central des projets"},
    {version:"0.1",build:"WS1V01",date:"11/07/2026",title:"Première mémoire WebStorming"}
  ];
  $("#buildTimeline").innerHTML=builds.map(b=>`<article class="build-item ${b.current?"current":""}">
    <div><b>V${b.version}</b><small>${esc(b.date)}</small></div>
    <div><strong>${esc(b.title)}</strong><span>${esc(b.build)}</span></div>
  </article>`).join("");
}

function bindUI(){
  $$(".tab").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
  $$("[data-goto]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.goto)));
  ["q","cat","status"].forEach(id=>$("#"+id).addEventListener(id==="q"?"input":"change",renderProjects));
  $("#saveQuickIdea").addEventListener("click",()=>{
    const ok=addIdea($("#quickIdea").value,$("#quickProject").value);
    $("#ideaFeedback").textContent=ok?"Idée enregistrée sur cet appareil.":"Écris d’abord une idée.";
    if(ok)$("#quickIdea").value="";
  });
  $("#saveIdea").addEventListener("click",()=>{
    if(addIdea($("#ideaText").value,$("#ideaProject").value,$("#ideaPriority").value))$("#ideaText").value="";
  });
  $("#exportIdeas").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(ideas(),null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`webstorming-ideas-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
  });
  $("#clearIdeas").addEventListener("click",()=>{if(confirm("Supprimer toutes les idées locales ?")){saveIdeas([]);renderIdeas()}});
  $("#refreshGithub").addEventListener("click",()=>refreshGithub(true));
  $("#refreshGithubPage").addEventListener("click",()=>refreshGithub(true));
  $("#projectDialog .dialog-close").addEventListener("click",()=>$("#projectDialog").close());
  document.addEventListener("click",e=>{
    const id=e.target.closest("[data-open-project]")?.dataset.openProject;
    if(id)openProject(id);
  });
}
function showView(id){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  $$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
init();