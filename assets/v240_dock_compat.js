/* V242 — realoca a barra existente do cronômetro para o rodapé fixo.
   Não cria timer, não duplica IDs, não altera sessões, Drive, cartões ou SRS. */
(function(){
 'use strict';
 if(window.BM240CompatDock)return;
 let dock=null,observer=null;
 function layout(){
  if(!dock||!dock.isConnected)return;
  const height=Math.ceil(dock.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--bm242-dock-height',height+'px');
 }
 function install(){
  const bar=document.getElementById('bm240h-bar');
  if(!bar)return false;
  dock=bar;
  bar.classList.add('bm242-bottom-dock');
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
 window.BM240CompatDock=Object.freeze({refresh:layout,get attached(){return Boolean(dock?.isConnected&&dock.parentElement===document.body)}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
