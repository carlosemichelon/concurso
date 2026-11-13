/* Banco Mestre V167 — Assuntos responsivos: interface somente leitura.
   Mantém IDs, enunciados, versos, imagens, PDFs, SRS e hash #tema?g=&s=. */
(function(){
'use strict';
if(window.BM167TopicUI)return;
const section=document.getElementById('tema');
const panel=section?.querySelector(':scope > .panel');
const study=document.getElementById('topicStudyBlocks');
const overview=document.getElementById('topicOverview');
if(!section||!panel||!study||!overview)return;
const make=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e};
const paths={
 list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
 bulb:'<path d="M9 18h6M10 22h4"/><path d="M15.5 14.5a6 6 0 1 0-7 0c1 .7 1.5 1.8 1.5 3h4c0-1.2.5-2.3 1.5-3Z"/>',
 images:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 network:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6.8 7.2 11 17M17.2 7.2 13 17M7 6h10"/>',
 expand:'<path d="M8 3H5a2 2 0 0 0-2 2v3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3M21 8V5a2 2 0 0 0-2-2h-3"/>',
 collapse:'<path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7"/>'
};
function icon(name){
 const wrapper=make('span','bm167-icon');wrapper.setAttribute('aria-hidden','true');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 for(const [k,v] of Object.entries({width:'18',height:'18',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round'}))svg.setAttribute(k,v);
 svg.innerHTML=paths[name]||paths.list;wrapper.append(svg);return wrapper;
}
function button(text,name,cls){
 const b=make('button',cls||'bm167-nav-button');b.type='button';
 b.append(icon(name),document.createTextNode(text));return b;
}
const lead=panel.querySelector('.topicLead');
const toolbar=make('div','bm167-toolbar');
const nav=make('nav','bm167-nav');nav.setAttribute('aria-label','Navegação dentro do assunto');
const links=[
 {id:'topicStudyBlocks',label:'Subassuntos',icon:'list'},
 {id:'topicMacetes',label:'Macetes',icon:'bulb'},
 {id:'topicMedia',label:'Imagens e PDFs',icon:'images'},
 {id:'topicRelated',label:'Relações',icon:'network'}
];
const navButtons=[];
const resourceFolds={};
function openDestination(id){
 const destination=document.getElementById(id);if(!destination)return;
 if(id!=='topicStudyBlocks'){
  const fold=resourceFolds[id];
  if(fold){fold.hidden=false;fold.open=true}
 }
 // Respeitar menu fixo e não forçar abertura de gabaritos.
 (resourceFolds[id]||destination).scrollIntoView({behavior:'smooth',block:'start'});
}
for(const link of links){
 const b=button(link.label,link.icon,'bm167-nav-button');
 b.dataset.target=link.id;b.addEventListener('click',()=>openDestination(link.id));
 nav.append(b);navButtons.push(b);
}
const controls=make('div','bm167-toolbar-actions');
const expand=button('Expandir todos','expand','bm167-control');
const collapse=button('Recolher todos','collapse','bm167-control');
const summary=make('small','bm167-progress','');
controls.append(expand,collapse,summary);
toolbar.append(nav,controls);
if(lead)lead.after(toolbar);else panel.prepend(toolbar);
const note=panel.querySelector(':scope > p.intro');
if(note)note.textContent='Escolha um subassunto para ler as perguntas. O verso continua oculto até você revelar; o pop-up permite responder e classificar.';
const heading=panel.querySelector(':scope > h3.sectionTitle');
if(heading)heading.textContent='Estudo por subassunto';
const topicBack=document.getElementById('topicBack');
if(topicBack)topicBack.title='Voltar à biblioteca de assuntos';
const topicGo=document.getElementById('topicGoCards');
if(topicGo)topicGo.textContent='Ver os flashcards deste assunto na biblioteca';
for(const [id,label,iconName,subtitle] of [
 ['topicMacetes','Macetes do acervo','bulb','Recursos de memorização associados a este assunto'],
 ['topicMedia','Imagens e PDFs','images','Materiais catalogados; confira a origem e a associação'],
 ['topicRelated','Relações e referências','network','Vínculos documentados e sugestões temáticas']
]){
 const el=document.getElementById(id);if(!el||!el.parentElement)continue;
 const fold=make('details','bm167-resource-fold');fold.id='bm167-'+id+'-fold';fold.open=false;fold.hidden=true;
 const head=make('summary','bm167-resource-summary');
 const title=make('span','bm167-resource-title');title.append(icon(iconName),document.createTextNode(label));
 head.append(title,make('small','bm167-resource-subtitle',subtitle));
 el.before(fold);fold.append(head,el);
 resourceFolds[id]=fold;
}
function groups(){return [...study.querySelectorAll(':scope > details.v034Subtopic')]}
expand.addEventListener('click',()=>{for(const g of groups())g.open=true;updateButtons()});
collapse.addEventListener('click',()=>{for(const g of groups())g.open=false;updateButtons()});
function updateButtons(){
 const gs=groups(),opened=gs.filter(g=>g.open).length;
 expand.disabled=!gs.length||opened===gs.length;collapse.disabled=!opened;
 summary.textContent=gs.length?opened+' de '+gs.length+' abertos':'';
}
study.addEventListener('toggle',updateButtons,true);
function decorateOverview(){
 overview.hidden=!overview.children.length;
 const outline=overview.querySelector('.v034SubjectOutline');if(!outline||outline.dataset.bm167Ready==='yes')return;
 outline.dataset.bm167Ready='yes';
 const row=outline.querySelector(':scope > .chipLinks');
 if(row){
  const wrap=make('details','bm167-subindex');
  const sum=make('summary','', 'Índice dos subassuntos · '+row.querySelectorAll('button').length+' opções');
  row.before(wrap);wrap.append(sum,row);wrap.open=false;
 }
}
function decorateCards(){
 for(const g of groups()){
  if(g.dataset.bm167Ready!=='yes'){
   g.dataset.bm167Ready='yes';
   const sum=g.querySelector(':scope > summary');
   if(sum){
    const original=sum.textContent.trim();
    const m=original.match(/^(.*?)\s*·\s*(\d+)\s+cartão\(ões\)\s*·\s*abrir$/);
    if(m){
     sum.replaceChildren();
     sum.append(make('span','bm167-subtopic-name',m[1]),make('span','bm167-subtopic-count',Number(m[2])===1?'1 cartão':m[2]+' cartões'));
     sum.setAttribute('aria-label',m[1]+': '+m[2]+' cartão(ões). Expandir ou recolher');
    }
   }
  }
  for(const article of g.querySelectorAll('article.bm124TopicCard')){
   if(article.dataset.bm167Ready==='yes')continue;
   const id=article.dataset.cardId||'';
   const strong=article.querySelector(':scope > strong');
   if(strong&&id){
    const prefix=id+' — ';
    if(strong.textContent.startsWith(prefix))strong.textContent=strong.textContent.slice(prefix.length);
    const kicker=make('span','bm167-study-id',id);strong.before(kicker);
   }
   const actions=article.querySelector('.bm124CardActions');
   if(actions){
    const first=actions.querySelector('button');
    if(first&&/Estudar no pop-up|Estudar cartão/.test(first.textContent)){
     first.classList.add('bm167-study-action');
     first.textContent='Abrir estudo no pop-up';
     first.title='Ler, responder e classificar este cartão no pop-up';
    }
   }
   article.dataset.bm167Ready='yes';
  }
 }
}
function updateSections(){
 const lookup={topicStudyBlocks:groups().length>0,
  topicMacetes:!!document.getElementById('topicMacetes')?.children.length,
  topicMedia:!!document.getElementById('topicMedia')?.children.length,
  topicRelated:!!document.getElementById('topicRelated')?.children.length};
 for(const b of navButtons){
  const id=b.dataset.target;
  b.disabled=!lookup[id];b.hidden=!lookup[id];
 }
 for(const [id,fold] of Object.entries(resourceFolds)){
  const el=document.getElementById(id);
  const populated=!!el?.children.length;
  fold.hidden=!populated;
  if(populated&&el.hidden)el.hidden=false;
 }
 toolbar.hidden=!lookup.topicStudyBlocks&&!lookup.topicMacetes&&!lookup.topicMedia;
}
function refresh(){
 decorateOverview();decorateCards();updateSections();updateButtons();
}
let pending=false;
function schedule(){
 if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refresh()});
}
const watch=new MutationObserver(schedule);
watch.observe(study,{childList:true,subtree:true});
watch.observe(overview,{childList:true});
for(const id of ['topicMacetes','topicMedia','topicRelated']){
 const el=document.getElementById(id);if(el)watch.observe(el,{childList:true});
}
schedule();
window.BM167TopicUI=Object.freeze({
 version:'V167',refresh:schedule,
 expandAll(){for(const g of groups())g.open=true;updateButtons()},
 collapseAll(){for(const g of groups())g.open=false;updateButtons()},
 get counts(){return {subtopics:groups().length,topic:document.getElementById('topicHeading')?.textContent||''}}
});
})();