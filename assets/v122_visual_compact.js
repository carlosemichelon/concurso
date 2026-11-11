/* V122 — estatísticas e Atlas sem textos repetitivos. */
(function(){
 'use strict';
 if(window.BancoMestreVisualCompactV122)return;
 function adapt(){
  const stats=document.querySelector('header .bm-v046-header-stats');
  if(stats){
   const spans=stats.querySelectorAll(':scope > .stat > span');
   const labels=['PDFs','Cartões + Ijuí','Imagens visíveis'];
   for(let i=0;i<spans.length&&i<labels.length;i++)spans[i].textContent=labels[i];
  }
  const image=document.getElementById('imagens');
  if(!image)return;
  const notices=[...image.querySelectorAll('.panel > .notice')];
  for(const notice of notices)if((notice.textContent||'').trim().startsWith('Atlas de 270 imagens, organizado por área e assunto.'))notice.remove();
  document.getElementById('bm087-visibility-info')?.remove();
 }
 adapt();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',adapt,{once:true});
 const root=document.getElementById('imagens');
 if(root&&typeof MutationObserver==='function'){
  let active=false;
  new MutationObserver(()=>{
   if(active)return;
   const target=document.getElementById('bm087-visibility-info');
   const notice=[...root.querySelectorAll('.panel > .notice')]
    .find(el=>(el.textContent||'').startsWith('Atlas de 270 imagens, organizado por área e assunto.'));
   if(target||notice){active=true;adapt();active=false}
  }).observe(root,{childList:true,subtree:true});
 }
 window.BancoMestreVisualCompactV122=Object.freeze({refresh:adapt});
})();