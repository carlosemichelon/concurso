/* V316 — avaliações formais SRS no cartão, eventos privados imutáveis no Google Drive.
   Necessita permissão drive.file explícita; não altera snapshot Banco Mestre nem publica SRS. */
(function(){
'use strict';
if(window.BM316SrsJournal)return;
const API='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name';
const PREFIX='BM_SRS_EVENT_V001_';
const RATINGS=Object.freeze({Errei:4,'Difícil':8,Bom:16,'Fácil':24,'Conhecimento preservado':32,'Conhecimento adquirido':64});
let events=[],loaded=false,refreshing=null,working=false,uncertain=false,buttonPanel=null,currentKey='',lastError='',selecting=false,ratedInView=false,ratedMessage='';
const uncertainIds=new Set();
const $=id=>document.getElementById(id);
const token=()=>window.BM239DriveGlobal?.writeToken?.()||'';
const localDate=(d=new Date())=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day};
const addDays=(date,n)=>{const x=new Date(date+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
const validId=id=>/^(?:CARD-\d{4,}|PROP-IJUI-\d{3}|TRT0[12]-C\d{3})$/.test(id||'');
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
  const latest=list[list.length-1],consolidated=latest.rating==='Conhecimento adquirido'||(latest.rating==='Fácil'&&Number(latest.interval_days)===64);
  const intervalDays=Number(latest.interval_days)||({Errei:4,'Difícil':8,Bom:16,'Fácil':32}[latest.rating]||RATINGS[latest.rating]);
  result.push({id,due:/^\d{4}-\d{2}-\d{2}$/.test(latest.due||'')?latest.due:addDays(latest.date_local,intervalDays),rating:latest.rating,
   consolidated,intervalDays,easyFormalCount:formalEasy,attempts:list.length,
   kind:'revisao',source:'Drive privado — avaliação formal no site',lastReview:latest.date_local,
   eventId:latest.event_id,atUtc:latest.at_utc});
 }
 return result;
}
async function getFile(id,auth){
 const resp=await fetch(API+'/'+encodeURIComponent(id)+'?alt=media',{headers:{Authorization:'Bearer '+auth},cache:'no-store'});
 if(!resp.ok)throw Error('Drive HTTP '+resp.status+' ao conferir evento');
 return resp.json();
}
async function load(){
 const auth=token();if(!auth)throw Error('Conecte o Drive com permissão de gravação no cabeçalho.');
 const received=[];let page='',pages=0;
 do{
  if(++pages>25)throw Error('Há mais páginas do que o limite seguro; histórico não foi carregado por completo.');
  const u=new URL(API);
  u.searchParams.set('q',"trashed = false and name contains '"+PREFIX+"'");
  u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,mimeType,createdTime)');
  u.searchParams.set('pageSize','1000');
  if(page)u.searchParams.set('pageToken',page);
  const r=await fetch(u.href,{headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(!r.ok)throw Error('Drive HTTP '+r.status+' ao listar avaliações');
  const j=await r.json();
  if(j.incompleteSearch)throw Error('Drive retornou listagem incompleta');
  received.push(...(j.files||[]).filter(x=>x.name?.startsWith(PREFIX)&&x.mimeType==='application/json'));
  page=j.nextPageToken||'';
 }while(page);
 const gathered=[];
 // Não inferir domínio sem ler o conteúdo real de cada evento.
 for(const info of received){
  const ev=await getFile(info.id,auth);
  if(!checkEvent(ev)||info.name!==PREFIX+ev.id+'_'+ev.event_id+'.json')
   throw Error('Evento SRS inválido no Drive: '+info.name);
  gathered.push(ev);
 }
 const seen=new Set();
 for(const e of gathered){
  if(seen.has(e.event_id))throw Error('Evento duplicado no Drive: '+e.event_id);
  seen.add(e.event_id);
 }
 events=gathered;loaded=true;lastError='';
 document.dispatchEvent(new CustomEvent('bm316-srs-journal-updated',{detail:{records:rows().length,events:events.length}}));
 return {events:events.length,cards:rows().length};
}
async function refresh(){
 if(refreshing)return refreshing;
 refreshing=progress(load(),'histórico de avaliações SRS').catch(e=>{lastError=e.message;throw e}).finally(()=>{refreshing=null;updateStatus()});
 return refreshing;
}
function updateStatus(){
 const el=$('bm316-srs-state');if(!el)return;
 el.textContent=uncertain?'Gravação não confirmada: confira o Drive antes de repetir.':
 ratedInView&&ratedMessage?ratedMessage:
 working?'Salvando e conferindo avaliação no Google Drive…':
 !token()?'Conecte o Drive com gravação para classificar.':
 lastError?'Não foi possível consultar o histórico: '+lastError:
 loaded?'Avaliações privadas disponíveis: '+events.length+' eventos / '+rows().length+' cartões.':
 'Drive autorizado. Consulte o histórico antes de registrar.';
 const connect=$('bm316-srs-connect');if(connect)connect.hidden=Boolean(token());
 const btns=buttonPanel?.querySelectorAll('button[data-grade]')||[];
 btns.forEach(b=>b.disabled=working||selecting||ratedInView||uncertain||!token());
}
async function record(id,rating){
 if(working||uncertain)throw Error('Há outra operação em andamento ou pendente de conferência.');
 if(!validId(id)||!validRating(rating)||rating==='Errei')throw Error('ID ou avaliação inválidos');
 const auth=token();if(!auth)throw Error('Autorize a gravação do Drive no cabeçalho antes de avaliar');
 if(!loaded)await refresh();
 const now=new Date(),date=localDate(now);
 const event={schema:'bm-srs-formal-event/1',source:'Banco Mestre — revisão formal no site',
  event_id:crypto.randomUUID(),id,rating,at_utc:now.toISOString(),date_local:date,
  timezone:'America/Sao_Paulo',kind:'revisao_formal',
  validation:'Avaliação explícita selecionada após revelar o verso; sem comprovação automática da resposta'};
 const previous=events.filter(x=>x.id===id);
 const baselineFromJournal=Math.max(0,...previous.map(x=>Number(x.baseline_easy?.count)||0));
 const sourceRecord=window.BM141Calendar?.records?.().find(x=>x.id===id);
 const provenPrior=sourceRecord?.source==='Drive privado — regra V311'&&
  sourceRecord?.rating==='Fácil'&&sourceRecord?.easyFormalCount>=1&&
  sourceRecord?.lastReview&&sourceRecord.lastReview<date;
 const baseline=Math.max(baselineFromJournal,provenPrior?1:0);
 if(baseline)event.baseline_easy={count:baseline,
  proof:provenPrior?'Avaliação Fácil do snapshot privado com data anterior':'Prova de revisão anterior preservada em evento já confirmado',
  date:provenPrior?sourceRecord.lastReview:(previous[0]?.baseline_easy?.date||null)};
 const easyCount=baseline+new Set(previous.filter(x=>x.rating==='Fácil').map(x=>x.event_id)).size+
  (rating==='Fácil'?1:0);
 if(rating==='Conhecimento adquirido'&&easyCount<2)throw Error('São necessárias duas avaliações Fácil anteriores comprovadas.');
 event.interval_days=RATINGS[rating];
 event.due=addDays(date,event.interval_days);
 const filename=PREFIX+id+'_'+event.event_id+'.json';
 const boundary='bm316_'+event.event_id.replaceAll('-','');
 const parts=[
 '--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',
 JSON.stringify({name:filename,mimeType:'application/json',description:'Avaliação formal privada do Banco Mestre; somente com ação do estudante'})+
 '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',
 JSON.stringify(event)+'\r\n--'+boundary+'--\r\n'];
 const body=new Blob(parts,{type:'multipart/related; boundary='+boundary});
 working=true;updateStatus();let submitted=false;
 try{
  const res=await progress(fetch(UPLOAD,{method:'POST',headers:{
   Authorization:'Bearer '+auth,'Content-Type':'multipart/related; boundary='+boundary
  },body,cache:'no-store'}),'salvamento da avaliação SRS');
  if(!res.ok){if([400,401,403,404,413].includes(res.status)){submitted=false;throw Error('Permissão ou requisição rejeitada pelo Drive (HTTP '+res.status+')')}throw Error('Drive HTTP '+res.status+' ao registrar avaliação');}
  submitted=true;
  const created=await res.json();
  if(!/^[\w-]{15,}$/.test(created.id||''))throw Error('Drive não retornou um ID de arquivo válido');
  const confirmed=await progress(getFile(created.id,auth),'conferência da gravação SRS');
  if(!checkEvent(confirmed)||confirmed.event_id!==event.event_id||
   confirmed.id!==id||confirmed.rating!==rating||confirmed.due!==event.due)
   throw Error('Conteúdo gravado no Drive não corresponde à classificação enviada');
  events.push(confirmed);loaded=true;lastError='';
  document.dispatchEvent(new CustomEvent('bm316-srs-journal-updated',{detail:{id,rating,due:event.due}}));
  return {...confirmed,fileId:created.id};
 }catch(e){
  // Se a rede caiu após enviar, não gerar outra avaliação que duplicaria a tentativa.
  uncertain=submitted||!/Drive HTTP (400|401|403|404|413)|Permissão ou requisição rejeitada/.test(e.message);if(uncertain)uncertainIds.add(id);lastError=e.message;
  throw Error('Registro não confirmado: '+e.message+(uncertain?'. Não clique novamente; confira o arquivo no Drive.':'. Reautorize o Drive e tente novamente.'));
 }finally{working=false;updateStatus()}
}
function build(){
 const overlay=$('bmCardPeekV050'),answer=overlay?.querySelector('.bm-v050-peek-answer');
 if(!overlay||!answer||$('bm316-srs-panel'))return false;
 const box=document.createElement('section');box.id='bm316-srs-panel';
 box.style.cssText='margin:14px 0 5px;padding:12px;border:1px solid #c9dedf;border-radius:9px;background:#f6faf9';
 box.hidden=true;
 const title=document.createElement('strong');title.textContent='Como foi sua resposta?';
 const intro=document.createElement('p');intro.textContent='Classifique depois de responder e revelar o verso. A gravação cria um evento privado no seu Drive.';
 intro.style.cssText='font-size:12px;margin:4px 0 9px;color:#526b73';
 const controls=document.createElement('div');controls.style.cssText='display:flex;gap:7px;flex-wrap:wrap';
 for(const rating of ['Difícil','Bom','Fácil','Conhecimento preservado','Conhecimento adquirido']){
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
    if(currentKey===id){ratedInView=true;
     ratedMessage=rating+' registrado no Drive e conferido. Próxima revisão: '+result.due+' ('+result.interval_days+' dias).';state.textContent=ratedMessage;}
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
  if(currentKey!==id){
   currentKey=id;uncertain=uncertainIds.has(id);ratedInView=false;ratedMessage='';
  }
  // Ocultar e revelar o mesmo verso não autoriza uma segunda avaliação.
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