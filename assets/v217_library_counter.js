/* V217: contador mostra apenas imagens realmente verificadas no Drive. */
/* Banco Mestre V213 — contagem da fonte visível, sem somar originais Drive e catálogo.
 * 323 imagens públicas no catálogo alternativo (179 históricas e 144 novas V211); Drive mantém prioridade.
 * Não grava em Drive, não altera imagens, cartões, IDs ou histórico de classificações.
 */
(function(){
 'use strict';
 if(window.BM208AtlasUnified)return;
 // Contador apresenta apenas a fonte autorizada.
 const $=id=>document.getElementById(id);
 const fmt=n=>n.toLocaleString('pt-BR');
 let lastKey='',lastSnapshot=null,countWatcher=null,summaryWatcher=null;
 function snapshot(){
   const provider=window.BancoMestreDriveImagesV182;
   const authenticated=Boolean(provider?.connected && provider?.lastSuccess);
   const raw=authenticated?Number(provider?.lastCount):0;
   const drive=Number.isSafeInteger(raw)&&raw>=0?raw:0;
   const direct=authenticated&&$('imagens')?.dataset.bm213Source==='drive';
   return {public:0,drive,total:drive,direct:true,authenticated,
     lastSuccess:authenticated?String(provider.lastSuccess):null,
     error:provider?.lastError||''};
 }
 function setText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
 function apply(){
   const data=snapshot();
   const key=[data.total,data.direct,data.authenticated,data.lastSuccess,data.error].join('|');
   lastKey=key;lastSnapshot=data;
   const stat=document.querySelector('.stats .stat:nth-child(3)');
   setText(stat?.querySelector('b'),fmt(data.total));
   const description=data.authenticated
    ?'Fonte Drive: '+fmt(data.drive)+' originais consultados · sem cópias no GitHub'
    :'Conecte o Google Drive para consultar as imagens originais';
  setText(stat?.querySelector('span'),description);
   const count=$('imageCount');
   const totalText=data.authenticated
    ?fmt(data.drive)+' originais no Google Drive'
    :'Conecte o Google Drive para ver as imagens';
  setText(count,totalText);
   if(count)count.title=data.lastSuccess?'Drive consultado em '+new Date(data.lastSuccess).toLocaleString('pt-BR'):'Drive não consultado nesta sessão';
   const filterSummary=$('bm155FilterSummary');
   if(filterSummary&&filterSummary.textContent){
     const base=filterSummary.textContent.replace(/ · Total na biblioteca: [\d.]+ imagens$/,'');
     const target=data.authenticated?base+' · Total na biblioteca: '+fmt(data.total)+' imagens':base;
     setText(filterSummary,target);
   }
   const countBadge=$('bm205-drive-count');
   if(data.authenticated)setText(countBadge,fmt(data.drive)+' imagens do Drive');
   const group=$('bm084-sync');
   if(group)group.dataset.bmUnifiedAtlasTotal=String(data.total);
 }
 function observeCounts(){
   const counter=$('imageCount');
   if(counter&&!countWatcher){
     countWatcher=new MutationObserver(apply);
     countWatcher.observe(counter,{childList:true,characterData:true,subtree:true});
   }
   const summary=$('bm155FilterSummary');
   if(summary&&!summaryWatcher){
     summaryWatcher=new MutationObserver(apply);
     summaryWatcher.observe(summary,{childList:true,characterData:true,subtree:true});
   }
 }
 function refresh(){observeCounts();apply();}
 function init(){
   refresh();
   document.addEventListener('bm-media-drive-authorized',refresh);
   document.addEventListener('bm209-drive-render',refresh);
   document.addEventListener('bm213-source-change',refresh);
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
   window.addEventListener('focus',refresh);
   window.addEventListener('pageshow',refresh);
   // Observa mudanças que o renderizador legado faz nos contadores;
   // o intervalo apenas acompanha o resultado do sincronizador Drive V207.
   setInterval(refresh,3000);
 }
 window.BM208AtlasUnified=Object.freeze({refresh,get snapshot(){return snapshot()}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
