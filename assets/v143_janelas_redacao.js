/* Banco Mestre V143 — suporte à escrita sem perder o foco.
   Reagrupa os mesmos painéis originais, não duplica conteúdo nem altera storage. */
(function(){
'use strict';
const train=document.getElementById('aba-treino');
const editor=train?.querySelector('.bm138-editor');
const fields=document.getElementById('treino-campos');
const side=train?.querySelector('.bm138-sidebar');
if(!train||!editor||!fields||!side)return;
const names={
 context:{label:'Notícias e ideias',short:'📰 Contexto',id:'treino-contexto',handler:'treinoBuscarContexto',title:'📰 Notícias, dados e argumentos'},
 brainstorm:{label:'Argumentos',short:'🧠 Argumentos',id:'treino-brainstorm-painel',handler:'treino_toggleBrainstorm',title:'🧠 Construir argumentos'},
 eixos:{label:'Método FTTD',short:'📐 Eixos FTTD',id:'treino-eixos-painel',handler:'treinoSugerirEixos',title:'📐 Pares de eixos argumentativos'},
 saved:{label:'Progressos',short:'📂 Salvos',id:'treino-salvos-card',handler:'treinoCarregarMenu',title:'📂 Progressos salvos'},
 sync:{label:'Sincronizar',short:'☁️ Sincronizar',id:'treino-sync-painel',handler:'treino_toggleSync',title:'☁️ Sincronização de dispositivos'}
};
const panels={};
for(const [key,cfg] of Object.entries(names)){
 const el=document.getElementById(cfg.id);
 if(!el)return;
 panels[key]=el;
}
const mk=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const dock=mk('aside','bm143-tool-dock');
dock.id='bm143-tool-dock';dock.setAttribute('aria-label','Ferramentas de apoio à redação');dock.setAttribute('aria-hidden','true');
const header=mk('header','bm143-tool-head');
const caption=mk('div','bm143-tool-caption');caption.append(mk('span','bm143-eyebrow','CONSULTA DURANTE A ESCRITA'),mk('h2','bm143-tool-title','Ferramentas de apoio'));
const closeTop=mk('button','bm143-close-top','✕ Fechar');closeTop.type='button';closeTop.setAttribute('aria-label','Fechar consulta e voltar ao texto');
header.append(caption,closeTop);
const tabs=mk('nav','bm143-tool-tabs');tabs.setAttribute('aria-label','Alternar ferramentas de apoio');
const tabButtons={};
for(const [key,cfg]of Object.entries(names)){
 const b=mk('button','bm143-tool-tab',cfg.short);b.type='button';b.dataset.tool=key;
 b.setAttribute('aria-pressed','false');tabButtons[key]=b;tabs.append(b);
}
const content=mk('div','bm143-tool-content');
const status=mk('p','bm143-tool-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const notice=mk('p','bm143-tool-notice');
notice.textContent='Referência para estudo. A redação permanece no editor ao lado; não é necessário fechar a consulta para continuar escrevendo.';
const helper=mk('div','bm143-news-warning');
helper.textContent='Atenção: este conteúdo é gerado por IA e contém manchetes fictícias. Confira números, datas e fontes antes de usar em uma redação.';
const refresh=mk('button','bm143-refresh','↻ Gerar outro contexto');refresh.type='button';
const holder=mk('div','bm143-tool-panels');
for(const [key,p] of Object.entries(panels)){
 p.classList.add('bm143-moved-panel');p.dataset.toolPanel=key;holder.append(p);
}
content.append(status,notice,helper,refresh,holder);
const footer=mk('footer','bm143-tool-footer');
footer.append(mk('span','bm143-footer-hint','O texto digitado permanece no editor.'));
const returnButton=mk('button','bm143-return','← Voltar a escrever');returnButton.type='button';footer.append(returnButton);
dock.append(header,tabs,content,footer);
document.body.append(dock);
const actions={};
for(const [key,cfg] of Object.entries(names)){
 const btn=Array.from(side.querySelectorAll('button[onclick]')).find(x=>x.getAttribute('onclick').startsWith(cfg.handler+'('));
 if(btn)actions[key]=btn;
}
if(actions.context){
 actions.context.textContent='📰 Notícias e ideias (IA)';
 actions.context.title='Gerar exemplos e argumentos com IA; não é uma busca de notícias em tempo real';
}
let active=null,newsPending=false,lastEditor=null,lastCaret=null,lastOffset=0;
const editorField=(el)=>el&&el.matches?.('textarea[id^="treino-campo-"]');
function remember(el){
 if(!editorField(el))return;
 lastEditor=el.id;
 try{lastCaret={start:el.selectionStart,end:el.selectionEnd,direction:el.selectionDirection}}catch{lastCaret=null}
}
fields.addEventListener('focusin',e=>remember(e.target));
for(const type of ['keyup','mouseup','input','select'])fields.addEventListener(type,e=>remember(e.target));
function rememberCurrent(){
 if(editorField(document.activeElement))remember(document.activeElement);
 lastOffset=window.scrollY;
}
function restoreWriting(){
 const target=(lastEditor&&document.getElementById(lastEditor))||fields.querySelector('textarea[id^="treino-campo-"]');
 if(target){
  try{target.focus({preventScroll:true})}catch{target.focus()}
  if(lastEditor===target.id&&lastCaret){try{target.setSelectionRange(lastCaret.start,lastCaret.end,lastCaret.direction)}catch{}}
  target.scrollIntoView({block:'center',behavior:'auto'});
 }else{
  editor.scrollIntoView({block:'start',behavior:'auto'});
  window.scrollTo(0,lastOffset);
 }
}
function close(restore=true){
 if(!dock.classList.contains('is-open'))return;
 dock.classList.remove('is-open');dock.setAttribute('aria-hidden','true');
 document.body.classList.remove('bm143-tool-open');
 if(restore)requestAnimationFrame(restoreWriting);
 active=null;
}
function update(){
 if(!active)return;
 const cfg=names[active],el=panels[active];
 caption.querySelector('h2').textContent=cfg.title;
 for(const [key,p] of Object.entries(panels)){
  p.classList.toggle('bm143-active-panel',key===active);
  tabButtons[key].classList.toggle('is-active',key===active);
  tabButtons[key].setAttribute('aria-pressed',String(key===active));
 }
 helper.hidden=active!=='context';refresh.hidden=active!=='context';
 if(active==='context'&&newsPending){
  status.hidden=false;status.textContent='Preparando contexto e argumentos por IA…';
 }else if(el.style.display==='none'){
  status.hidden=false;status.textContent='Este painel está fechado. Escolha a ferramenta novamente para abrir.';
 }else{status.hidden=true;status.textContent=''}
}
function show(key){
 if(!active)rememberCurrent();
 active=key;dock.classList.add('is-open');dock.setAttribute('aria-hidden','false');
 document.body.classList.add('bm143-tool-open');
 update();
}
function run(key,force=false){
 const p=panels[key],button=actions[key];
 if(!p||!button)return;
 show(key);
 if(key==='context'){
  if(newsPending)return;
  if(force||!p.innerHTML.trim()){
   newsPending=true;update();
   const fn=window.treinoBuscarContexto;
   if(typeof fn==='function'){
    Promise.resolve(fn(button)).catch(e=>{status.hidden=false;status.textContent='Não foi possível gerar contexto: '+String(e?.message||e)}).finally(()=>{newsPending=false;update()});
   }else{newsPending=false;status.textContent='Ferramenta de contexto indisponível.'}
  }else{
   p.style.display='block';update();
  }
 }else if(p.style.display==='none'){
  const fn=window[names[key].handler];
  if(typeof fn==='function')fn();
  update();
 }
}
for(const [key,button] of Object.entries(actions)){
 button.addEventListener('click',function(e){
  e.preventDefault();e.stopImmediatePropagation();
  run(key);
 },true);
}
for(const [key,b] of Object.entries(tabButtons))b.addEventListener('click',()=>run(key));
closeTop.addEventListener('click',()=>close());
returnButton.addEventListener('click',()=>close());
refresh.addEventListener('click',()=>run('context',true));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dock.classList.contains('is-open')){e.preventDefault();close()}});
dock.addEventListener('click',e=>{
 const item=e.target.closest('[onclick^="treinoAplicarEixos("]');
 if(item&&typeof window.salvarRespostasNivel==='function')window.salvarRespostasNivel();
},true);
for(const [key,p] of Object.entries(panels)){
 new MutationObserver(()=>{
  if(active!==key)return;
  if(p.style.display==='none'&&!(key==='context'&&newsPending)){
   close();return;
  }
  update();
 }).observe(p,{attributes:true,attributeFilter:['style']});
}
const oldSwitch=window.setTab;
if(typeof oldSwitch==='function'){
 window.setTab=function(name){
  if(name==='temas'||name==='flashcards')close(false);
  return oldSwitch.apply(this,arguments);
 };
}
window.BancoMestreConsultaV143={
 open:run,close:()=>close(),get active(){return active},
 get draftField(){return lastEditor},get panels(){return Object.keys(panels)}
};
})();