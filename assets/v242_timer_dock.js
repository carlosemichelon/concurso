/* V242 — realoca a barra existente do cronômetro para o rodapé fixo.
   Não cria timer, não duplica IDs, não altera sessões, Drive, cartões ou SRS. */
(function(){
 'use strict';
 if(window.BM242TimerDock)return;
 let dock=null,observer=null;
 function layout(){
  if(!dock||!dock.isConnected)return;
  const height=Math.ceil(dock.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--bm242-dock-height',height+'px');
 }
 function installMobileToggle(bar){
  if(document.getElementById('bm242-mobile-toggle'))return;
  const style=document.createElement('style');
  style.id='bm242-mobile-toggle-style';
  style.textContent=`
  body>.bm241-timer-bar.bm242-bottom-dock #bm242-mobile-toggle{display:none}
  @media(max-width:760px){
   body>.bm241-timer-bar.bm242-bottom-dock #bm242-mobile-toggle{
    display:flex!important;align-items:center;justify-content:space-between;
    width:100%!important;min-width:0!important;min-height:40px!important;
    flex:1 1 100%;border:1px solid #b9d1cb!important;border-radius:8px!important;
    background:#eaf5f2!important;color:#155e62!important;font-size:13px!important;
    font-weight:750!important;text-align:left!important;padding:8px 12px!important;
    touch-action:manipulation;
   }
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed>.bm241-timer-choose,
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed>.bm241-timer-live,
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed>.bm241-timer-status{
    display:none!important;
   }
   body>.bm241-timer-bar.bm242-bottom-dock.bm242-mobile-collapsed{
    max-height:none!important;overflow:hidden!important;
   }
  }`;
  document.head.append(style);
  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.id='bm242-mobile-toggle';
  toggle.setAttribute('aria-controls','bm241-choose bm241-live');
  toggle.setAttribute('aria-label','Recolher ou expandir o cronômetro');
  bar.prepend(toggle);
  const preferenceKey='BM242_MOBILE_TIMER_COLLAPSED_V1';
  let collapsed=false;
  try{collapsed=localStorage.getItem(preferenceKey)==='1'}catch{}
  const media=window.matchMedia('(max-width:760px)');
  function sync(){
   const isClosed=media.matches&&collapsed;
   bar.classList.toggle('bm242-mobile-collapsed',isClosed);
   toggle.setAttribute('aria-expanded',String(!isClosed));
   if(isClosed){
    const live=document.getElementById('bm241-live');
    const active=live&&!live.hidden;
    const time=document.getElementById('bm241-elapsed')?.textContent||'0m 00s';
    const subject=document.getElementById('bm241-subject-label')?.textContent||'Estudo';
    const running=active&&!document.getElementById('bm241-pause')?.hidden;
    toggle.textContent=active
      ? (running?'▶ ':'⏸ ')+time+' · '+subject.slice(0,26)+'  ▴'
      : '⏱ Cronômetro · toque para iniciar  ▴';
   }else{
    toggle.textContent='▾ Recolher cronômetro';
   }
   layout();
  }
  toggle.addEventListener('click',()=>{
   collapsed=!collapsed;
   try{localStorage.setItem(preferenceKey,collapsed?'1':'0')}catch{}
   sync();
  });
  if(media.addEventListener)media.addEventListener('change',sync);
  else media.addListener(sync);
  setInterval(()=>{if(media.matches&&collapsed)sync()},1000);
  sync();
 }
 function install(){
  const bar=document.getElementById('bm241-bar');
  if(!bar)return false;
  dock=bar;
  bar.classList.add('bm242-bottom-dock');
  installMobileToggle(bar);
  bar.setAttribute('aria-label','Cronômetro de estudo — barra inferior fixa');
  bar.setAttribute('role','region');
  if(bar.parentElement!==document.body)document.body.appendChild(bar);
  document.documentElement.classList.add('bm242-dock-enabled');
  if(typeof ResizeObserver!=='undefined'){
   observer=new ResizeObserver(layout);
   observer.observe(bar);
  }
  window.addEventListener('resize',layout,{passive:true});
  window.visualViewport?.addEventListener('resize',layout,{passive:true});
  layout();
  return true;
 }
 function start(){
  if(install())return;
  // O portal injeta os módulos no DOM e pode montar o cronômetro após o script.
  const watcher=new MutationObserver(()=>{
   if(install())watcher.disconnect();
  });
  watcher.observe(document.body,{childList:true,subtree:true});
 }
 window.BM242TimerDock=Object.freeze({refresh:layout,get attached(){return Boolean(dock?.isConnected&&dock.parentElement===document.body)}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
