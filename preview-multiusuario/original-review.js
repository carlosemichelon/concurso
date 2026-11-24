/* V316 — avaliações formais SRS no cartão, eventos privados imutáveis no Google Drive.
   Necessita permissão drive.file explícita; não altera snapshot Banco Mestre nem publica SRS. */
(function(){
'use strict';
if(window.BM316SrsJournal)return;
const API='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name';
const PREFIX='BM_SRS_EVENT_V001_';
const RATINGS=Object.freeze({'Difícil':8,Bom:16,'Fácil':24,'Conhecimento preservado':32,'Conhecimento adquirido':64});
let events=[],loaded=false,refreshing=null,working=false,uncertain=false,buttonPanel=null,currentKey='',currentView=-1,lastError='',selecting=false,ratedInView=false,ratedMessage='';
const uncertainIds=new Set();
const $=id=>document.getElementById(id);
const account=window.BMAccountRuntime;if(account?.mode!=='central')throw Error('Perfil autenticado obrigatório');const accountMode=true;
const token=()=>'';
const localDate=(d=new Date())=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day};
const addDays=(date,n)=>{const x=new Date(date+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
const validId=id=>account.catalog().some(c=>c.id===id&&c.active);
const validRating=v=>Object.prototype.hasOwnProperty.call(RATINGS,v);
const progress=(promise,label)=>window.BM316DriveProgress?.track?.(promise,label)||promise;
function checkEvent(e){
 return e&&e.schema==='bm-srs-formal-event/1'&&validId(e.id)&&validRating(e.rating)&&
 /^[a-f0-9-]{32,40}$/i.test(String(e.event_id||''))&&
 /^\d{4}-\d{2}-\d{2}$/.test(e.date_local||'')&&
 /^\d{4}-\d{2}-\d{2}T/.test(e.at_utc||'')&&
 String(e.source||'')==='Banco Mestre — revisão formal no site';
}
function rows(){
 return account.srs().records;
 const grouped=new Map();
 for(const e of events){
  if(!checkEvent(e))continue;
  if(!grouped.has(e.id))grouped.set(e.id,[]);
  grouped.get(e.id).push(e);
 }
 const result=[];
 for(const [id,list] of grouped){
  list.sort((a,b)=>a.at_utc.localeCompare(b.at_utc)||a.event_id.localeCompare(b.event_id));
  const baseline=Math.max(0,...list.map(x=>Number(x.baseline_easy?.count)||0));
  const formalEasy=baseline+new Set(list.filter(x=>x.rating==='Fácil').map(x=>x.event_id)).size;
  const latest=list[list.length-1],consolidated=latest.rating==='Fácil'&&formalEasy>=2;
  const intervalDays=consolidated?64:RATINGS[latest.rating];
  result.push({id,due:addDays(latest.date_local,intervalDays),rating:latest.rating,
   consolidated,intervalDays,easyFormalCount:formalEasy,attempts:list.length,
   kind:'revisao',source:'Drive privado — avaliação formal no site',lastReview:latest.date_local,
   eventId:latest.event_id,atUtc:latest.at_utc});
 }
 return result;
}
async function load(){loaded=true;return {events:null,cards:account.srs().records.length}}
async function refresh(){
 if(refreshing)return refreshing;
 refreshing=progress(load(),'histórico de avaliações SRS').catch(e=>{lastError=e.message;throw e}).finally(()=>{refreshing=null;updateStatus()});
 return refreshing;
}
function updateStatus(){
 const el=$('bm316-srs-state');if(!el)return;
 el.textContent=accountMode?(ratedInView&&ratedMessage?ratedMessage:working?'Salvando avaliação no perfil demonstrativo…':lastError||(!account.reviewReady?'Simulação indisponível. Reabra o perfil.':'Avalie após recuperar a resposta.')):uncertain?'Gravação não confirmada: confira o Drive antes de repetir.':
 ratedInView&&ratedMessage?ratedMessage:
 working?'Salvando e conferindo avaliação no Google Drive…':
 !token()?'Conecte o Drive com gravação para classificar.':
 lastError?'Não foi possível consultar o histórico: '+lastError:
 loaded?'Avaliações privadas disponíveis: '+events.length+' eventos / '+rows().length+' cartões.':
 'Drive autorizado. Consulte o histórico antes de registrar.';
 const connect=$('bm316-srs-connect');if(connect)connect.hidden=accountMode||Boolean(token());
 const btns=buttonPanel?.querySelectorAll('button[data-grade]')||[];
 btns.forEach(b=>b.disabled=working||selecting||ratedInView||uncertain||(accountMode?(!account.reviewReady||(b.dataset.grade==='Conhecimento adquirido'&&!account.canAcquire(currentKey))):!token()));
}
async function record(id,rating){const overlay=$('bmCardPeekV050'),answer=overlay?.querySelector('.bm-v050-peek-answer');if(working||!overlay||overlay.hidden||!answer||answer.hidden||window.BancoMestreVisualizarCardV050?.currentId!==id)throw Error('Revele o verso do cartão ativo antes de avaliar.');working=true;lastError='';updateStatus();try{const result=await account.recordReview(id,rating);document.dispatchEvent(new CustomEvent('bm316-srs-journal-updated',{detail:{id,rating,due:result.due}}));return result}catch(e){lastError=e.message;throw e}finally{working=false;updateStatus()}}
function build(){
 const overlay=$('bmCardPeekV050'),answer=overlay?.querySelector('.bm-v050-peek-answer');
 if(!overlay||!answer||$('bm316-srs-panel'))return false;
 const box=document.createElement('section');box.id='bm316-srs-panel';
 box.style.cssText='margin:14px 0 5px;padding:12px;border:1px solid #c9dedf;border-radius:9px;background:#f6faf9';
 box.hidden=true;
 const title=document.createElement('strong');title.textContent='Como foi sua resposta?';
 const intro=document.createElement('p');intro.textContent='Classifique depois de responder e revelar o verso. Nesta prévia a avaliação fica somente em memória, sem gravação real.';
 intro.style.cssText='font-size:12px;margin:4px 0 9px;color:#526b73';
 const controls=document.createElement('div');controls.style.cssText='display:flex;gap:7px;flex-wrap:wrap';
 for(const rating of (accountMode?Object.keys(account.ratings):['Errei','Difícil','Bom','Fácil'])){
  const b=document.createElement('button');b.type='button';b.dataset.grade=rating;
  b.textContent=rating;b.style.cssText='font-size:12px;padding:8px 12px';
  b.addEventListener('click',async()=>{
   if(working||selecting||ratedInView)return;
   selecting=true;
   const id=window.BancoMestreVisualizarCardV050?.currentId;
   if(!validId(id)){selecting=false;updateStatus();return;}
   const state=$('bm316-srs-state');state.textContent='Registrando…';
   try{
    const result=await record(id,rating);
    ratedInView=true;
    ratedMessage=rating+' simulado nesta aba. Próxima revisão: '+result.due+' ('+result.interval_days+' dias).';
    state.textContent=ratedMessage;
   }catch(e){state.textContent=e.message}
   finally{selecting=false;updateStatus()}
  });
  controls.append(b);
 }
 const connect=document.createElement('button');connect.id='bm316-srs-connect';connect.type='button';
 connect.textContent='Autorizar gravação no Drive';connect.style.cssText='font-size:12px;padding:7px 10px;margin-top:9px';
 connect.addEventListener('click',()=>{
  const main=$('bm239-drive-action');
  if(!main){const el=$('bm316-srs-state');if(el)el.textContent='Conector do Drive indisponível nesta página.';return}
  main.click();
 });
 const state=document.createElement('p');state.id='bm316-srs-state';state.setAttribute('role','status');
 state.style.cssText='font-size:12px;line-height:1.5;margin:8px 0 0;color:#3b6268';
 box.append(title,intro,controls,connect,state);answer.after(box);
 buttonPanel=box;
 function update(){
  const id=window.BancoMestreVisualizarCardV050?.currentId;
  const isVisible=!overlay.hidden&&!answer.hidden&&validId(id);
  const view=window.BancoMestreVisualizarCardV050?.viewSequence;
  if(currentKey!==id||currentView!==view){
   currentKey=id;currentView=view;uncertain=uncertainIds.has(id);ratedInView=false;ratedMessage='';
  }
  box.hidden=!isVisible;updateStatus();
 }
 const obs=new MutationObserver(update);
 obs.observe(overlay,{attributes:true,attributeFilter:['hidden']});
 obs.observe(answer,{attributes:true,attributeFilter:['hidden']});
 const titleEl=$('bmCardPeekTitleV050');
 if(titleEl)obs.observe(titleEl,{childList:true,subtree:true});
 document.addEventListener('bm-media-drive-authorized',()=>{void refresh().catch(()=>{});updateStatus()});
 update();return true;
}
function init(){
 if(build())return;
 const ob=new MutationObserver(()=>{if(build())ob.disconnect()});
 ob.observe(document.body,{childList:true,subtree:true});
}
window.BM316SrsJournal=Object.freeze({refresh,records:rows,record,
 get loaded(){return loaded},get lastError(){return lastError},get count(){return events.length}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();