
let projects=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function init(){
  const r=await fetch('projects.json'); projects=await r.json();
  fillSelectors(); renderStats(); renderPriority(); renderCategories(); renderProjects(); renderRoadmap(); renderIdeas(); tick(); setInterval(tick,1000);
}
function tick(){const d=new Date(); $('#today').textContent=d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});$('#time').textContent=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});}
function fillSelectors(){
  const cats=[...new Set(projects.map(p=>p.category))].sort(), sts=[...new Set(projects.map(p=>p.status))].sort();
  cats.forEach(x=>$('#cat').insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`)); sts.forEach(x=>$('#status').insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));
  [$('#quickProject'),$('#ideaProject')].forEach(sel=>projects.forEach(p=>sel.insertAdjacentHTML('beforeend',`<option value="${esc(p.name)}">${esc(p.name)}</option>`)));
}
function renderStats(){
  $('#count').textContent=projects.length; $('#critical').textContent=projects.filter(p=>p.priority==='Critique').length;
  $('#active').textContent=projects.filter(p=>['Actif','Existant','En cours'].includes(p.status)).length;
  $('#avg').textContent=Math.round(projects.reduce((a,p)=>a+(p.progress||0),0)/projects.length)+'%';
}
function renderPriority(){
  const arr=[...projects].sort((a,b)=>({Critique:0,Haute:1,Moyenne:2}[a.priority]??3)-({Critique:0,Haute:1,Moyenne:2}[b.priority]??3)).slice(0,6);
  $('#priorityList').innerHTML=arr.map(p=>`<div class="priority-item"><div><b>${esc(p.name)}</b><small>${esc(p.next?.[0]||'À définir')}</small></div><div class="progress"><i style="width:${p.progress}%"></i></div><button class="link-btn" onclick="openProject('${p.id}')">${p.progress}%</button></div>`).join('');
  const p=arr[0]; $('#nextAction').innerHTML=`<b>${esc(p.name)}</b><br>${esc(p.next?.[0]||'Revoir la roadmap')}`;
}
function renderCategories(){
  const m={};projects.forEach(p=>m[p.category]=(m[p.category]||0)+1);const max=Math.max(...Object.values(m));
  $('#categoryBars').innerHTML=Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join('');
}
function projectCard(p){return `<article class="card"><h3>${esc(p.name)}</h3><div class="meta"><span class="badge">${esc(p.category)}</span><span class="badge">${esc(p.status)}</span><span class="badge">${esc(p.priority)}</span></div><p>${esc(p.summary)}</p><div class="meta">${(p.stack||[]).map(x=>`<span class="badge">${esc(x)}</span>`).join('')}</div><div class="card-progress"><div class="progress"><i style="width:${p.progress}%"></i></div><b>${p.progress}%</b></div><div class="actions"><button class="btn" onclick="openProject('${p.id}')">Fiche projet</button><a class="btn secondary" href="incoming/${p.id}/">Dépôt fichiers</a></div></article>`}
function renderProjects(){
  const q=($('#q').value||'').toLowerCase(),cat=$('#cat').value,st=$('#status').value;
  const list=projects.filter(p=>(!cat||p.category===cat)&&(!st||p.status===st)&&JSON.stringify(p).toLowerCase().includes(q));
  $('#cards').innerHTML=list.map(projectCard).join('')||'<p>Aucun projet trouvé.</p>';
}
function openProject(id){
  const p=projects.find(x=>x.id===id); if(!p)return;
  $('#dialogContent').innerHTML=`<span class="eyebrow">${esc(p.category)}</span><h2>${esc(p.name)}</h2><p>${esc(p.summary)}</p><div class="meta"><span class="badge">${esc(p.status)}</span><span class="badge">${esc(p.priority)}</span><span class="badge">${p.progress}%</span></div><h3>Technologies</h3><div class="meta">${p.stack.map(x=>`<span class="badge">${esc(x)}</span>`).join('')}</div><h3>Prochaines actions</h3><ul class="dialog-next">${(p.next||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><b>Dépôt :</b> ${esc(p.repo)}</p><a class="btn" href="projects/${p.id}/README.md">Ouvrir le README</a>`;
  $('#projectDialog').showModal();
}
function renderRoadmap(){
  const crit=projects.filter(p=>p.priority==='Critique'), high=projects.filter(p=>p.priority==='Haute'), rest=projects.filter(p=>!['Critique','Haute'].includes(p.priority));
  const cards=a=>a.map(p=>`<div class="road-card"><b>${esc(p.name)}</b><small>${esc(p.next?.[0]||'À définir')}</small></div>`).join('');
  $('#roadNow').innerHTML=cards(crit);$('#roadNext').innerHTML=cards(high);$('#roadLater').innerHTML=cards(rest);
}
function getIdeas(){try{return JSON.parse(localStorage.getItem('wsIdeas')||'[]')}catch(e){return[]}}
function saveIdea(project,text){if(!text.trim())return;const a=getIdeas();a.unshift({id:crypto.randomUUID?crypto.randomUUID():Date.now(),project,text:text.trim(),date:new Date().toISOString()});localStorage.setItem('wsIdeas',JSON.stringify(a));renderIdeas();}
function renderIdeas(){
  const a=getIdeas();$('#ideasList').innerHTML=a.length?a.map(i=>`<div class="idea"><div class="idea-head"><span>${esc(i.project)} · ${new Date(i.date).toLocaleString('fr-FR')}</span><button onclick="deleteIdea('${i.id}')">Supprimer</button></div><p>${esc(i.text)}</p></div>`).join('):'<p class="subtitle">Aucune idée enregistrée pour le moment.</p>';
}
function deleteIdea(id){localStorage.setItem('wsIdeas',JSON.stringify(getIdeas().filter(i=>String(i.id)!==String(id))));renderIdeas();}
$$('.tab').forEach(b=>b.addEventListener('click',()=>{ $$('.tab').forEach(x=>x.classList.remove('active')); $$('.view').forEach(x=>x.classList.remove('active')); b.classList.add('active'); $('#'+b.dataset.view).classList.add('active');}));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>document.querySelector(`.tab[data-view="${b.dataset.goto}"]`).click()));
['q','cat','status'].forEach(id=>$('#'+id).addEventListener(id==='q'?'input':'change',renderProjects));
$('#saveQuickIdea').addEventListener('click',()=>{saveIdea($('#quickProject').value,$('#quickIdea').value);$('#quickIdea').value='';$('#ideaFeedback').textContent='Idée enregistrée dans la mémoire locale.';setTimeout(()=>$('#ideaFeedback').textContent='',2500)});
$('#addIdea').addEventListener('click',()=>{saveIdea($('#ideaProject').value,$('#ideaText').value);$('#ideaText').value='';});
$('#exportIdeas').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(getIdeas(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='webstorming-ideas.json';a.click();URL.revokeObjectURL(a.href);});
$('#projectDialog .close').addEventListener('click',()=>$('#projectDialog').close());
init().catch(e=>{document.body.insertAdjacentHTML('beforeend','<p style="padding:20px;color:#ff9b9b">Impossible de charger projects.json.</p>');console.error(e)});
