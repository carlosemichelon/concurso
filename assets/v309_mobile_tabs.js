/* V309 — menu de abas recolhível apenas no celular.
 * Não substitui botões nem handlers originais. Preserva foco/teclado, hash e navegação de desktop.
 */
(function(){
'use strict';
if(window.BM309MobileTabs)return;
const MQ='(max-width:620px)';
let btn=null,nav=null,mql=null,open=false,observer=null;
function activeName(){
 const active=nav?.querySelector('button[data-page].active');
 const s=String(active?.textContent||'Assuntos').trim();
 if(active?.dataset.page==='redacao')return 'Redação';
 if(active?.dataset.page==='controle-estudos')return 'Controle de Estudos';
 return s.length>33?s.slice(0,32)+'…':s;
}
function apply(){
 if(!btn||!nav)return;
 const mobile=Boolean(mql?.matches);
 if(!mobile)open=false;
 const expanded=mobile&&open;
 btn.hidden=!mobile;
 btn.setAttribute('aria-expanded',String(expanded));
 btn.setAttribute('aria-label',(expanded?'Recolher':'Abrir')+' abas de navegação. Atual: '+activeName());
 nav.hidden=mobile&&!expanded;
 document.documentElement.dataset.bm309MenuOpen=String(expanded);
 const label=btn.querySelector('.bm309-menu-label');
 if(label)label.textContent=expanded?'Recolher abas':'Abas';
 const current=btn.querySelector('.bm309-menu-current');
 if(current)current.textContent=activeName();
 const symbol=btn.querySelector('.bm309-menu-symbol');
 if(symbol)symbol.textContent=expanded?'×':'☰';
}
function hide(){if(!open)return;open=false;apply()}
function setup(){
 nav=document.querySelector('body>header .head>nav[aria-label="Seções"]');
 if(!nav)return;
 if(document.getElementById('bm309-mobile-tabs-toggle'))return;
 nav.id=nav.id||'bm309-main-sections';
 btn=document.createElement('button');
 btn.type='button';btn.id='bm309-mobile-tabs-toggle';btn.className='bm309-mobile-tabs-toggle';
 btn.setAttribute('aria-controls',nav.id);btn.setAttribute('aria-expanded','false');
 const icon=document.createElement('span');icon.className='bm309-menu-symbol';icon.setAttribute('aria-hidden','true');icon.textContent='☰';
 const label=document.createElement('strong');label.className='bm309-menu-label';label.textContent='Abas';
 const current=document.createElement('span');current.className='bm309-menu-current';current.textContent=activeName();
 const chevron=document.createElement('span');chevron.className='bm309-menu-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='⌄';
 btn.append(icon,label,current,chevron);
 nav.before(btn);
 btn.addEventListener('click',()=>{open=!open;apply()});
 nav.addEventListener('click',e=>{
  if(e.target.closest?.('button[data-page]')){
   hide();
   queueMicrotask(apply);
  }
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){hide();btn.focus()}});
 window.addEventListener('hashchange',()=>{hide();queueMicrotask(apply)});
 window.addEventListener('popstate',()=>{hide();queueMicrotask(apply)});
 mql=window.matchMedia(MQ);
 mql.addEventListener?.('change',()=>{open=false;apply()});
 observer=new MutationObserver(()=>{if(btn?.isConnected)apply()});
 observer.observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
 apply();
}
window.BM309MobileTabs=Object.freeze({get ready(){return Boolean(btn)},get open(){return open},close:hide});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();