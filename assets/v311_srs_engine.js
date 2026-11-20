/* Banco Mestre V311 — motor SRS público, dados SRS privados.
 * Intervalos: Errei 4, Difícil 8, Bom 16, Fácil 32; Consolidado 64 somente
 * depois de duas avaliações formais Fácil do mesmo cartão, comprovadas por eventos.
 * Não escreve no SRS canônico nem publica histórico pessoal no GitHub.
 */
(function(root){
 'use strict';
 if(root.BMSRSV311)return;
 const INTERVALS=Object.freeze({Errei:4,'Difícil':8,Bom:16,'Fácil':32,Consolidado:64});
 const PRIVATE_FALLBACK_ID='1UmHRLkQ27RNxL9wwC7Sy0oOAEGUSN8-w';
 const API='https://www.googleapis.com/drive/v3/files/';
 const clean=v=>String(v==null?'':v).trim();
 const rating=v=>{
  const x=clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return ({errei:'Errei',dificil:'Difícil',bom:'Bom',facil:'Fácil'})[x]||'';
 };
 const date=v=>{
  const s=clean(v);
  let iso=/^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(0,10):null;
  if(!iso){
   const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
   if(m)iso=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
  }
  if(!iso)return null;
  const d=new Date(iso+'T12:00:00Z');
  return !isNaN(d)&&d.toISOString().slice(0,10)===iso?iso:null;
 };
 const addDays=(v,n)=>{
  const iso=date(v);
  if(!iso||!Number.isInteger(n)||n<0)return null;
  const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);
  return d.toISOString().slice(0,10);
 };
 function formalEasyHistory(rec,lastRating){
  const arr=Array.isArray(rec.events)?rec.events:
    Array.isArray(rec.review_events)?rec.review_events:
    Array.isArray(rec.historico)?rec.historico:[];
  const distinct=new Set();
  for(const e of arr){
   const k=clean(e.kind||e.tipo||e.type||'revisao').toLowerCase();
   if(/recorr|refer|import|edicao|editorial/.test(k))continue;
   if(rating(e.rating||e.avaliacao||e.grade||e.classificacao)!=='Fácil')continue;
   const stamp=clean(e.timestamp||e.data_hora||e.date||e.data_local);
   const key=clean(e.event_id||e.id)||stamp;
   if(!key||!date(stamp))continue;
   distinct.add(key);
  }
  // Registros antigos agregados não comprovam duas tentativas Fácil.
  return Math.max(distinct.size,distinct.size?0:(lastRating==='Fácil'?1:0));
 }
 function fromSrs(rec){
  if(!rec||!/^CARD-\d{4,}$/.test(clean(rec.id)))return null;
  const id=clean(rec.id);
  // V163 tem os campos legados invertidos: last_date guarda a nota;
  // grade guarda a data. Suporta também futuras estruturas corrigidas.
  const lastRating=rating(rec.last_date)||rating(rec.rating)||rating(rec.grade)||rating(rec.avaliacao);
  const lastDate=date(rec.grade)||date(rec.last_date)||date(rec.last_review_at)||date(rec.review_date);
  const attempts=Math.max(0,Number(rec.attempts||rec.tentativas||0)||0);
  const originalDue=date(rec.next_review||rec.proxima_revisao);
  const references=Array.isArray(rec.reference_events)?rec.reference_events:
   Array.isArray(rec.references)?rec.references:[];
  const auto=byReferences(references,lastRating);
  // Um marco de referência documentado posterior à última revisão real
  // produz classificação automática separada, nunca duas avaliações Fácil formais.
  if(auto.count>=5&&(!lastDate||auto.at>lastDate)){
   return {id,due:auto.due,rating:auto.rating,intervalDays:auto.intervalDays,
    easyFormalCount:formalEasyHistory(rec,lastRating),consolidated:false,
    source:'Drive privado — recorrência SRS documentada',originalDue,
    lastReview:lastDate,attempts,referenceCount:auto.count,kind:auto.kind};
  }
  if(!lastRating||!lastDate||attempts===0){
   if(!originalDue)return null;
   return {id,due:originalDue,rating:'',intervalDays:null,easyFormalCount:0,
    consolidated:false,source:'Drive privado — agendamento sem avaliação',originalDue,kind:'agendamento'};
  }
  const easyFormalCount=formalEasyHistory(rec,lastRating);
  const consolidated=lastRating==='Fácil'&&easyFormalCount>=2;
  const intervalDays=consolidated?64:INTERVALS[lastRating];
  return {id,due:addDays(lastDate,intervalDays),rating:lastRating,
   intervalDays,easyFormalCount,consolidated,source:'Drive privado — regra V311',
   originalDue,lastReview:lastDate,attempts,kind:'revisao'};
 }
 function fromSnapshot(snapshot){
  if(!snapshot||!Array.isArray(snapshot.srs)||snapshot.srs.length<20||
      !Array.isArray(snapshot.cards)||snapshot.cards.length<1000)
   throw Error('Formato do Banco Mestre privado incompatível; fila anterior preservada');
  const available=new Set(snapshot.cards.map(x=>x.id));
  const items=new Map();
  for(const r of snapshot.srs){
   const v=fromSrs(r);
   if(v&&available.has(v.id))items.set(v.id,v);
  }
  return {records:[...items.values()],cards:available.size,
   srsRecords:snapshot.srs.length,version:clean(snapshot.version),
   updated:clean(snapshot.updated),source:'Snapshot privado do Google Drive'};
 }
 function byReferences(references,currentRating){
  const events=new Map();
  for(const e of Array.isArray(references)?references:[]){
   if(!e||!date(e.date||e.at||e.timestamp))continue;
   const key=clean(e.eventId||e.event_id||e.sourceId||e.source_id);
   if(!key||events.has(key))continue;
   if(e.valid===false||e.passive===true||e.kind==='auditoria'||e.kind==='importacao')continue;
   events.set(key,date(e.date||e.at||e.timestamp));
  }
  const total=events.size;
  const sorted=[...events.values()].sort();
  if(total>=10)return {count:total,rating:'Fácil',intervalDays:32,
   due:addDays(sorted[9],32),at:sorted[9],consolidated:false,kind:'classificacao_por_recorrencia'};
  if(total>=5)return {count:total,rating:'Bom',intervalDays:16,
   due:addDays(sorted[4],16),at:sorted[4],consolidated:false,kind:'classificacao_por_recorrencia'};
  return {count:total,rating:rating(currentRating),intervalDays:null,due:null,
   consolidated:false,kind:'sem_limiar'};
 }
 function token(){return root.BancoMestreMediaSyncV182?.token?.()||''}
 async function fetchDriveJson(id,auth){
  const response=await fetch(API+encodeURIComponent(id)+'?alt=media&supportsAllDrives=true',{
   headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(!response.ok)throw Error('Drive HTTP '+response.status+' — SRS privado indisponível');
  return response.json();
 }
 async function latestPrivate(){
  const auth=token();
  if(!auth)throw Error('Conecte o Google Drive no cabeçalho para carregar a fila privada');
  // A busca não persiste nem expõe o token. Se a listagem não estiver autorizada,
  // a fonte fixa V163 continua disponível como fallback explicitamente identificado.
  let candidates=[];
  try{
   const u=new URL('https://www.googleapis.com/drive/v3/files');
   u.searchParams.set('q', "trashed=false and name contains 'BANCO_MESTRE_PRIVADO_V'");
   u.searchParams.set('fields','nextPageToken,files(id,name,mimeType,modifiedTime)');
   u.searchParams.set('pageSize','100');
   u.searchParams.set('orderBy','modifiedTime desc');
   const resp=await fetch(u.href,{headers:{Authorization:'Bearer '+auth},cache:'no-store'});
   if(resp.ok){
    const d=await resp.json();
    candidates=(d.files||[]).filter(x=>/^BANCO_MESTRE_PRIVADO_V\d+.*\.json$/i.test(x.name||''))
      .sort((a,b)=>(b.name.match(/_V(\d+)/i)?.[1]||0)-(a.name.match(/_V(\d+)/i)?.[1]||0))
      .slice(0,5);
   }
  }catch(_){}
  if(!candidates.some(x=>x.id===PRIVATE_FALLBACK_ID))
   candidates.push({id:PRIVATE_FALLBACK_ID,name:'BANCO_MESTRE_PRIVADO_V163.json'});
  let lastError='';
  for(const item of candidates){
   try{
    const snapshot=await fetchDriveJson(item.id,auth);
    const out=fromSnapshot(snapshot);
    if(Number(out.version.replace(/\D/g,''))<163)continue;
    return {...out,driveFileId:item.id,fileName:item.name};
   }catch(e){lastError=String(e.message||e)}
  }
  throw Error('Nenhuma fonte privada íntegra disponível. '+lastError);
 }
 root.BMSRSV311=Object.freeze({intervals:INTERVALS,date,addDays,rating,fromSrs,
  fromSnapshot,byReferences,latestPrivate,privateFallbackId:PRIVATE_FALLBACK_ID});
})(window);
