/* V299 — sincronização automática durante a sessão OAuth válida.
 * NUNCA persiste access/refresh tokens, nem inicia OAuth fora de um gesto do usuário.
 * Renova leituras e reconciliações já autorizadas; conflitos permanecem bloqueados
 * pelos módulos originais. Com a aba fechada ou token vencido, pausa claramente.
 */
(function(){
'use strict';
if(window.BM299DriveContinuous)return;
const CYCLE=5*60*1000,RETRY=2*60*1000;
let lastAttempt=0,running=false,everAuthorized=false,indicator=null;
const globalDrive=()=>window.BM239DriveGlobal;
const openTab=()=>document.visibilityState==='visible'&&navigator.onLine!==false;
const authorized=()=>Boolean(globalDrive()?.writeAuthorized&&globalDrive()?.connected);
const status=()=>{
 const d=globalDrive(),isAuthorized=authorized();
 if(isAuthorized)everAuthorized=true;
 return !d?.connectionStatus?.ready?'aguardando':isAuthorized?'ligado':everAuthorized?'reconectar':'conectar';
};
function ensureIndicator(){
 if(indicator?.isConnected)return indicator;
 const action=document.getElementById('bm239-drive-action');
 const details=document.getElementById('bm239-sync-details');
 if(!action||!details)return null;
 indicator=document.getElementById('bm299-drive-continuous');
 if(!indicator){
  indicator=document.createElement('small');
  indicator.id='bm299-drive-continuous';
  indicator.setAttribute('role','status');
  indicator.style.cssText='font-size:11px;white-space:nowrap;max-width:100%;color:#4b626b';
  details.insertAdjacentElement('afterend',indicator);
 }
 return indicator;
}
function refresh(){
 const indicator=ensureIndicator();if(!indicator)return;
 const current=status();
 if(current==='ligado'){
  indicator.textContent='Automático ligado';
  indicator.title='Com o Drive autorizado, verificação a cada 5 minutos nesta aba aberta. Acesso Google não é permanente.';
 }else if(current==='reconectar'){
  indicator.textContent='Automático pausado · reconectar Drive';
  indicator.title='A autorização Google expirou. Clique em Conectar Drive para retomar as atualizações automáticas.';
 }else{
  indicator.textContent=current==='aguardando'?'Automático aguardando Drive':'Automático aguardando autorização';
  indicator.title='A sincronização automática começa após autorizar o Google Drive pelo botão do cabeçalho.';
 }
}
async function tick(){
 refresh();
 const d=globalDrive();
 if(running||!openTab()||!authorized()||!d?.sync)return;
 const busy=document.getElementById('bm239-drive-action')?.getAttribute('aria-busy')==='true';
 if(busy)return;
 const latest=Date.parse(d.lastReport?.at||'')||0;
 const due=Math.max(lastAttempt,latest);
 if(Date.now()-due<CYCLE)return;
 running=true;lastAttempt=Date.now();
 try{await d.sync();}
 catch(error){
  const el=ensureIndicator();
  if(el){el.textContent='Automático: conferência pendente';el.title=String(error?.message||error);}
 }finally{running=false;refresh();}
}
function init(){
 ensureIndicator();refresh();
 // O fluxo OAuth já efetua a primeira verificação: evita operações concorrentes.
 document.addEventListener('bm-media-drive-authorized',()=>{lastAttempt=Date.now();refresh();});
 document.addEventListener('bm239-sync-finished',()=>{lastAttempt=Date.now();refresh();});
 window.addEventListener('focus',()=>{refresh();void tick();});
 window.addEventListener('online',()=>{refresh();void tick();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){refresh();void tick();}});
 setInterval(()=>{refresh();void tick();},30000);
}
window.BM299DriveContinuous=Object.freeze({get active(){return authorized()},refresh,tick});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
