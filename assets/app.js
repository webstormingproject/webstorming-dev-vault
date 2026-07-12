let projects=[], dataSource="aucune", diagnostics=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const arr=v=>Array.isArray(v)?v:[];
const norm=p=>({id:p?.id||String(Math.random()),name:p?.name||"Projet",category:p?.category||"Non classé",status:p?.status||"À vérifier",priority:p?.priority||"Normale",summary:p?.summary||"",stack:arr(p?.stack),repo:p?.repo||"",version:p?.version||"Non renseignée",health:p?.health||"À vérifier",next:arr(p?.next),progress:Number(p?.progress)||0,dependencies:arr(p?.dependencies),focus:Boolean(p?.focus)});

async function loadProjects(){
  diagnostics=[];
  try{
    const r=await fetch("projects.json",{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const d=await r.json();
    if(!Array.isArray(d)||!d.length) throw new Error("Catalogue vide");
    projects=d.map(norm);dataSource="projects.json";diagnostics.push(["OK","Catalogue principal",`${projects.length} projets`]);
  }catch(e){
    projects=arr(window.WS_FALLBACK_PROJECTS).map(norm);dataSource="secours intégré";
    diagnostics.push(["WARN","Catalogue principal",e.message],["OK","Catalogue de secours",`${projects.length} projets`]);
  }
}
async function boot(){await loadProjects();fillSelectors();renderAll();bind();tick();setInterval(tick,1000);$("#app").classList.remove("hidden");$("#boot").remove();initVoice()}
function tick(){const d=new Date();$("#today").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("#time").textContent=d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
function fillSelectors(){
  [...new Set(projects.map(p=>p.category))].sort().forEach(v=>$("#cat").add(new Option(v,v)));
  [...new Set(projects.map(p=>p.status))].sort().forEach(v=>$("#status").add(new Option(v,v)));
  projects.forEach(p=>{$("#quickProject").add(new Option(p.name,p.name));$("#ideaProject").add(new Option(p.name,p.name))});
}
function renderAll(){$("#sourceBadge").textContent=`Données : ${dataSource}`;$("#loadMessage").textContent=`${projects.length} projets chargés.`;renderStats();renderPriority();renderCategories();renderProjects();renderWork();renderIdeas();renderMap();renderRoadmap();renderDiagnostics()}
function renderStats(){$("#count").textContent=projects.length;$("#focusCount").textContent=projects.filter(p=>p.focus).length;$("#dependencyCount").textContent=projects.reduce((a,p)=>a+p.dependencies.length,0);$("#avg").textContent=Math.round(projects.reduce((a,p)=>a+p.progress,0)/Math.max(1,projects.length))+"%"}
function renderPriority(){const w={Critique:0,Haute:1,Moyenne:2,Normale:3};const ps=[...projects].sort((a,b)=>(w[a.priority]??9)-(w[b.priority]??9)).slice(0,7);$("#priorityList").innerHTML=ps.map(p=>`<div class="priority-item"><div><b>${esc(p.name)}</b><small>${esc(p.next[0]||"À définir")}</small></div><div class="progress"><i style="width:${p.progress}%"></i></div><button class="link-btn" data-open="${esc(p.id)}">${p.progress}%</button></div>`).join("");const p=ps[0];$("#nextAction").innerHTML=p?`<b>${esc(p.name)}</b><br>${esc(p.next[0]||"Revoir la roadmap")}`:"Aucune action"}
function renderCategories(){const m={};projects.forEach(p=>m[p.category]=(m[p.category]||0)+1);const max=Math.max(1,...Object.values(m));$("#categoryBars").innerHTML=Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join("")}
function card(p){return `<article class="card"><div class="card-head"><h3>${esc(p.name)}</h3><button class="focus-toggle ${p.focus?"on":""}" data-focus="${esc(p.id)}">${p.focus?"Focus":"Ajouter au focus"}</button></div><div class="meta"><span class="badge">${esc(p.category)}</span><span class="badge">${esc(p.status)}</span><span class="badge">${esc(p.priority)}</span></div><p>${esc(p.summary)}</p><div class="card-progress"><div class="progress"><i style="width:${p.progress}%"></i></div><b>${p.progress}%</b></div><div class="actions"><button class="btn" data-open="${esc(p.id)}">Ouvrir</button>${p.repo?`<a class="btn secondary" target="_blank" rel="noopener" href="https://github.com/${esc(p.repo)}">GitHub</a>`:""}</div></article>`}
function renderProjects(){const q=$("#q").value.toLowerCase(),c=$("#cat").value,s=$("#status").value;const list=projects.filter(p=>(!c||p.category===c)&&(!s||p.status===s)&&JSON.stringify(p).toLowerCase().includes(q));$("#cards").innerHTML=list.map(card).join("")||"<p>Aucun projet.</p>"}
function renderWork(){const focus=projects.filter(p=>p.focus).sort((a,b)=>b.progress-a.progress);$("#workGrid").innerHTML=focus.map(p=>`<article class="work-card"><div><span class="eyebrow">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.next[0]||"Définir la prochaine action")}</p></div><div class="work-actions"><span>${p.progress}%</span><button class="btn" data-open="${esc(p.id)}">Travailler</button></div></article>`).join("")||"<article class='panel'><p>Aucun projet sélectionné. Ajoute-en depuis l’onglet Projets.</p></article>"}
function openProject(id){const p=projects.find(x=>x.id===id);if(!p)return;const notes=projectNotes(id);$("#dialogContent").innerHTML=`<span class="eyebrow">${esc(p.category)}</span><h2>${esc(p.name)}</h2><p>${esc(p.summary)}</p><div class="meta"><span class="badge">${esc(p.status)}</span><span class="badge">${esc(p.priority)}</span><span class="badge">${p.progress}%</span><span class="badge">V${esc(p.version)}</span></div><h3>Prochaines actions</h3><ul>${p.next.map(x=>`<li>${esc(x)}</li>`).join("")||"<li>À définir</li>"}</ul><h3>Dépendances</h3><div class="meta">${p.dependencies.map(id=>`<span class="badge">${esc(projects.find(x=>x.id===id)?.name||id)}</span>`).join("")||"<span class='muted'>Aucune</span>"}</div><h3>Notes du projet</h3><div class="voice-field"><textarea id="projectNoteText" placeholder="Ajouter ou dicter une note…"></textarea><button class="field-mic" type="button" data-voice-target="projectNoteText" title="Dicter une note">🎙</button></div><button class="primary" data-save-note="${esc(id)}">Enregistrer la note</button><div class="idea-list">${notes.map(n=>`<article class="idea-item"><p>${esc(n.text)}</p><small>${new Date(n.createdAt).toLocaleString("fr-FR")}</small></article>`).join("")||"<p class='muted'>Aucune note.</p>"}</div>`;$("#projectDialog").showModal()}
function projectNotes(id){try{return JSON.parse(localStorage.getItem(`wsNotes:${id}`)||"[]")}catch{return []}}
function saveProjectNote(id,text){text=String(text||"").trim();if(!text)return;const a=projectNotes(id);a.unshift({text,createdAt:new Date().toISOString()});localStorage.setItem(`wsNotes:${id}`,JSON.stringify(a));openProject(id)}
function ideas(){try{return JSON.parse(localStorage.getItem("wsIdeas")||"[]")}catch{return []}}
function addIdea(t,p,priority="Normale"){t=String(t||"").trim();if(!t)return false;const a=ideas();a.unshift({text:t,project:p,priority,createdAt:new Date().toISOString()});localStorage.setItem("wsIdeas",JSON.stringify(a));renderIdeas();return true}
function renderIdeas(){renderRecentIdeas();$("#ideaList").innerHTML=ideas().map(i=>`<article class="idea-item"><div><b>${esc(i.project)}</b> <span class="badge">${esc(i.priority)}</span></div><p>${esc(i.text)}</p><small>${new Date(i.createdAt).toLocaleString("fr-FR")}</small></article>`).join("")||"<p class='muted'>Aucune idée.</p>"}
function renderMap(){$("#dependencyMap").innerHTML=projects.filter(p=>p.dependencies.length).map(p=>`<div class="dep-row"><button class="dep-main" data-open="${esc(p.id)}">${esc(p.name)}</button><span>→</span><div>${p.dependencies.map(id=>`<button class="dep-node" data-open="${esc(id)}">${esc(projects.find(x=>x.id===id)?.name||id)}</button>`).join("")}</div></div>`).join("")||"<p>Aucune dépendance définie.</p>"}
function renderRoadmap(){const now=projects.filter(p=>p.priority==="Critique"||p.focus).slice(0,8),next=projects.filter(p=>p.priority==="Haute"&&!now.includes(p)).slice(0,8),later=projects.filter(p=>!now.includes(p)&&!next.includes(p)).slice(0,10);const h=a=>a.map(p=>`<article class="road-item"><b>${esc(p.name)}</b><span>${esc(p.next[0]||"À préciser")}</span></article>`).join("")||"<p class='muted'>Rien.</p>";$("#roadNow").innerHTML=h(now);$("#roadNext").innerHTML=h(next);$("#roadLater").innerHTML=h(later)}
function renderDiagnostics(){diagnostics.push(["INFO","Source active",dataSource],["INFO","Projets chargés",String(projects.length)],["INFO","Notes projets","localStorage"],["INFO","Mode travail",`${projects.filter(p=>p.focus).length} projets`]);$("#diagList").innerHTML=diagnostics.map(d=>`<div class="diag-row"><span class="diag-${d[0].toLowerCase()}">${esc(d[0])}</span><b>${esc(d[1])}</b><small>${esc(d[2])}</small></div>`).join("")}
function showView(id){$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));window.scrollTo({top:0,behavior:"smooth"})}
function bind(){
  $$(".tab").forEach(b=>b.onclick=()=>showView(b.dataset.view));$$("[data-view-jump]").forEach(b=>b.onclick=()=>showView(b.dataset.viewJump));
  ["q","cat","status"].forEach(id=>$("#"+id).addEventListener(id==="q"?"input":"change",renderProjects));
  document.addEventListener("click",e=>{const o=e.target.closest("[data-open]");if(o)openProject(o.dataset.open);const f=e.target.closest("[data-focus]");if(f){const p=projects.find(x=>x.id===f.dataset.focus);p.focus=!p.focus;renderAll()}const s=e.target.closest("[data-save-note]");if(s)saveProjectNote(s.dataset.saveNote,$("#projectNoteText").value)});
  $(".dialog-close").onclick=()=>$("#projectDialog").close();
  $("#saveIdea").onclick=()=>{if(addIdea($("#ideaText").value,$("#ideaProject").value,$("#ideaPriority").value))$("#ideaText").value=""};
  $("#exportIdeas").onclick=()=>{const b=new Blob([JSON.stringify(ideas(),null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="webstorming-ideas.json";a.click()};
  $("#clearIdeas").onclick=()=>{if(confirm("Vider toutes les idées ?")){localStorage.removeItem("wsIdeas");renderIdeas()}};
  $("#reloadData").onclick=()=>location.reload();
}

/* === WebStorming OS V1.1.2 Long Voice === */
let voiceRecognition=null;
let voiceFinalText="";
let voiceInterimText="";
let voiceListening=false;
let voiceRequestedTarget="auto";
let voiceUserStopped=true;
let voiceRestartTimer=null;
let voiceHadError=false;

function voiceApi(){
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
function initVoice(){
  const API=voiceApi();

  if(!API){
    setVoiceState(
      "Vocal indisponible",
      "Utilise Chrome ou Edge récent. Le reste du cockpit continue normalement.",
      "error"
    );
    $("#voiceGlobal").disabled=true;
    $$(".field-mic").forEach(b=>b.disabled=true);
    return;
  }

  voiceRecognition=new API();
  voiceRecognition.lang="fr-FR";
  voiceRecognition.continuous=true;
  voiceRecognition.interimResults=true;
  voiceRecognition.maxAlternatives=1;

  voiceRecognition.onstart=()=>{
    voiceListening=true;
    voiceHadError=false;
    clearTimeout(voiceRestartTimer);

    $("#voiceGlobal").classList.add("listening");
    $("#voiceGlobal").setAttribute("aria-pressed","true");
    $("#voiceButtonLabel").textContent="Arrêter l’écoute";
    setVoiceButtons(false, false);
    $("#voiceCancel").disabled=false;

    setVoiceState(
      "Je t’écoute en continu",
      currentVoiceText() || "Tu peux parler longtemps. Clique sur « Arrêter l’écoute » quand tu as terminé.",
      "listening"
    );
  };

  voiceRecognition.onspeechstart=()=>{
    setVoiceTitleOnly("Voix détectée","listening");
  };

  voiceRecognition.onresult=e=>{
    voiceInterimText="";

    for(let i=e.resultIndex;i<e.results.length;i++){
      const transcript=(e.results[i][0].transcript || "").trim();
      if(!transcript) continue;

      if(e.results[i].isFinal){
        voiceFinalText += (voiceFinalText ? " " : "") + transcript;
      }else{
        voiceInterimText += (voiceInterimText ? " " : "") + transcript;
      }
    }

    renderVoiceTranscript();
  };

  voiceRecognition.onerror=e=>{
    const messages={
      "not-allowed":"Accès au microphone refusé. Autorise le micro dans les réglages du site.",
      "service-not-allowed":"Le service vocal est bloqué par le navigateur.",
      "no-speech":"Aucune parole détectée. L’écoute va reprendre.",
      "audio-capture":"Aucun microphone n’est disponible.",
      "network":"Le service vocal a rencontré une erreur réseau.",
      "aborted":"Écoute arrêtée."
    };

    if(e.error==="no-speech"){
      setVoiceState("Silence détecté",messages[e.error],"listening");
      return;
    }

    if(e.error==="aborted" && voiceUserStopped){
      return;
    }

    voiceHadError=true;
    setVoiceState("Problème vocal",messages[e.error]||`Erreur vocale : ${e.error}`,"error");
  };

  voiceRecognition.onend=()=>{
    voiceListening=false;
    $("#voiceGlobal").classList.remove("listening");
    $("#voiceGlobal").setAttribute("aria-pressed","false");

    if(!voiceUserStopped && !voiceHadError){
      $("#voiceButtonLabel").textContent="Reprise de l’écoute…";
      voiceRestartTimer=setTimeout(()=>{
        try{
          voiceRecognition.start();
        }catch{
          finalizeVoiceSession($("#voiceAutoSubmit")?.checked===true);
        }
      },250);
      return;
    }

    finalizeVoiceSession($("#voiceAutoSubmit")?.checked===true);
  };

  $("#voiceGlobal").addEventListener("click",()=>{
    if(voiceListening || !voiceUserStopped) stopVoice();
    else startVoice("auto");
  });

  $("#voiceInsert").addEventListener("click",insertVoiceText);
  $("#voiceSaveIdea").addEventListener("click",saveVoiceAsIdea);
  $("#voiceExecute").addEventListener("click",executeVoiceText);
  $("#voiceCancel").addEventListener("click",cancelVoice);

  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-voice-target]");
    if(b) startVoice(b.dataset.voiceTarget);
  });
}
function setVoiceButtons(hasText, listening){
  $("#voiceInsert").disabled=!hasText || listening;
  $("#voiceSaveIdea").disabled=!hasText || listening;
  $("#voiceExecute").disabled=!hasText || listening;
}
function setVoiceTitleOnly(title,mode=""){
  $("#voiceState").textContent=title;
  $(".voice-console").dataset.state=mode;
}
function setVoiceState(title,text,mode=""){
  $("#voiceState").textContent=title;
  $("#voiceTranscript").textContent=text;
  $(".voice-console").dataset.state=mode;
}
function renderVoiceTranscript(){
  const text=currentVoiceText();
  $("#voiceTranscript").textContent=text || "Écoute…";
  setVoiceButtons(Boolean(text), true);
}
function startVoice(target="auto"){
  if(!voiceRecognition) return;

  voiceRequestedTarget=target;
  voiceUserStopped=false;
  voiceHadError=false;
  voiceFinalText="";
  voiceInterimText="";

  const exists=[...$("#voiceTarget").options].some(o=>o.value===target);
  $("#voiceTarget").value=exists?target:"auto";

  setVoiceButtons(false, true);
  $("#voiceCancel").disabled=false;

  try{
    voiceRecognition.start();
  }catch(e){
    if(e.name!=="InvalidStateError"){
      setVoiceState("Impossible de démarrer",e.message,"error");
    }
  }
}
function stopVoice(){
  voiceUserStopped=true;
  clearTimeout(voiceRestartTimer);

  if(voiceRecognition){
    try{ voiceRecognition.stop(); }catch{}
  }

  if(!voiceListening){
    finalizeVoiceSession($("#voiceAutoSubmit")?.checked===true);
  }
}
function finalizeVoiceSession(autoSend=false){
  clearTimeout(voiceRestartTimer);
  voiceListening=false;

  $("#voiceGlobal").classList.remove("listening");
  $("#voiceGlobal").setAttribute("aria-pressed","false");
  $("#voiceButtonLabel").textContent="Parler à WebStorming";

  const text=currentVoiceText();

  if(text){
    $("#voiceTranscript").textContent=text;
    setVoiceTitleOnly("Texte prêt","ready");
    setVoiceButtons(true, false);
    $("#voiceCancel").disabled=false;
  }else if(!voiceHadError){
    setVoiceState(
      "Aucun texte reconnu",
      "Clique sur le micro et parle immédiatement. Utilise Chrome ou Edge.",
      "error"
    );
    setVoiceButtons(false, false);
    $("#voiceCancel").disabled=false;
  }
}
function cancelVoice(){
  voiceUserStopped=true;
  clearTimeout(voiceRestartTimer);

  if(voiceRecognition){
    try{ voiceRecognition.abort(); }catch{}
  }

  voiceFinalText="";
  voiceInterimText="";
  voiceHadError=false;

  setVoiceButtons(false, false);
  $("#voiceCancel").disabled=true;
  setVoiceState("Micro en attente","La transcription apparaîtra ici.","");
}
function currentVoiceText(){
  return [voiceFinalText.trim(),voiceInterimText.trim()].filter(Boolean).join(" ").trim();
}
function selectedVoiceTarget(){
  const selected=$("#voiceTarget").value;
  return selected==="auto"?voiceRequestedTarget:selected;
}
function insertVoiceText(){
  const text=currentVoiceText();
  if(!text) return;

  const target=selectedVoiceTarget()==="auto" ? "quickIdea" : selectedVoiceTarget();
  writeVoiceTo(target,text);
  cancelVoice();
}
function saveVoiceAsIdea(){
  const text=currentVoiceText();
  if(!text) return;

  const p=findProjectByVoice(text);
  const project=p?.name || ($("#quickProject")?.value || "Général");

  addIdea(text,project,"Normale");
  showView("ideas");
  cancelVoice();
}
function executeVoiceText(){
  const text=currentVoiceText();
  if(!text) return;

  if(executeVoiceCommand(text)){
    cancelVoice();
    return;
  }

  setVoiceState(
    "Commande non reconnue",
    "Le texte est conservé. Tu peux l’insérer ou l’enregistrer comme idée.",
    "error"
  );
}
function writeVoiceTo(target,text){
  const el=document.getElementById(target);

  if(!el){
    setVoiceState(
      "Destination indisponible",
      "Ouvre d’abord la fiche ou choisis une autre destination.",
      "error"
    );
    return;
  }

  el.value=(el.value?el.value.trim()+" ":"")+text.trim();
  el.dispatchEvent(new Event("input",{bubbles:true}));
  el.focus();

  if(target==="q"){
    showView("projects");
    renderProjects();
  }
}
function normalizeVoice(s){
  return s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[’']/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function findProjectByVoice(text){
  const n=normalizeVoice(text);

  return projects.find(p=>{
    const name=normalizeVoice(p.name);
    return n.includes(name) ||
      name.split(" ").filter(x=>x.length>3).some(x=>n.includes(x));
  });
}
function executeVoiceCommand(text){
  const n=normalizeVoice(text);
  const p=findProjectByVoice(text);

  if(/^(ouvre|ouvrir|affiche|montre)\b/.test(n) && p){
    openProject(p.id);
    return true;
  }

  if(/(ajoute|mettre|mets).*(focus|mode travail)/.test(n) && p){
    p.focus=true;
    renderAll();
    showView("work");
    return true;
  }

  if(/(retire|enleve|supprime).*(focus|mode travail)/.test(n) && p){
    p.focus=false;
    renderAll();
    showView("work");
    return true;
  }

  if(/^(cherche|recherche|trouve)\b/.test(n)){
    const query=text.replace(/^(cherche|recherche|trouve)\s*/i,"").trim();
    $("#q").value=query;
    showView("projects");
    renderProjects();
    return true;
  }

  if(/(commence|demarre|ouvre).*(journee|mode travail)/.test(n)){
    showView("work");
    return true;
  }

  if(/(nouvelle idee|ajoute une idee|note une idee)/.test(n)){
    const cleaned=text
      .replace(/.*?(nouvelle idée|ajoute une idée|note une idée)\s*(pour|sur)?\s*/i,"")
      .trim();

    const project=p?.name||"Général";
    if(cleaned) addIdea(cleaned,project,"Normale");

    showView("ideas");
    return true;
  }

  if(/(montre|affiche).*(priorites|roadmap)/.test(n)){
    showView("roadmap");
    return true;
  }

  return false;
}

function renderRecentIdeas(){
  const target=$("#recentIdeas"); if(!target) return;
  const list=ideas().slice(0,4);
  target.innerHTML=list.map(i=>`<article class="idea-item"><div><b>${esc(i.project)}</b> <span class="badge">${esc(i.priority)}</span></div><p>${esc(i.text)}</p><small>${new Date(i.createdAt).toLocaleString("fr-FR")}</small></article>`).join("")||"<p class='muted'>Aucune idée capturée.</p>";
}

boot();