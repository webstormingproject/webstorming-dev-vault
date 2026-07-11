
let projects=[];
async function load(){
  const res=await fetch('projects.json');
  projects=await res.json();
  render();
}
function render(){
 const q=(document.getElementById('q').value||'').toLowerCase();
 const cat=document.getElementById('cat').value;
 const list=projects.filter(p=>{
   const txt=[p.name,p.category,p.status,p.priority,p.summary,(p.stack||[]).join(' ')].join(' ').toLowerCase();
   return (!q||txt.includes(q)) && (!cat||p.category===cat);
 });
 document.getElementById('count').textContent=list.length;
 document.getElementById('critical').textContent=projects.filter(p=>p.priority==='Critique').length;
 document.getElementById('active').textContent=projects.filter(p=>['Actif','En cours','Fonctionnel'].includes(p.status)).length;
 document.getElementById('cats').textContent=[...new Set(projects.map(p=>p.category))].length;
 document.getElementById('cards').innerHTML=list.map(p=>`
   <article class="card">
     <h3>${p.name}</h3>
     <div class="meta">
       <span class="badge">${p.category}</span>
       <span class="badge">${p.status}</span>
       <span class="badge priority-${p.priority}">${p.priority}</span>
     </div>
     <p>${p.summary}</p>
     <div class="meta">${(p.stack||[]).map(s=>`<span class="badge">${s}</span>`).join('')}</div>
     <div class="actions">
       <a class="btn" href="projects/${p.id}/README.md">Fiche projet</a>
       <a class="btn secondary" href="incoming/${p.id}/">Dépôt fichiers</a>
     </div>
   </article>`).join('');
}
document.addEventListener('input', render);
load();
