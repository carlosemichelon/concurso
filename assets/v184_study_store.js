/* Banco Mestre V184 — histórico local de prática e diário de estudos.
 * Dados pessoais nunca enviados ao GitHub. Exportação/importação explícita.
 * NÃO altera SRS canônico nem versões/IDs de cartões. */
(function(){
'use strict';
if(window.BM184StudyStore)return;
const SK='BM184_STUDY_SESSIONS_V1',RK='BM184_PRACTICE_EVENTS_V1';
const LIMIT=6000,SCHEMA='BancoMestreDiarioV184';
const RATINGS={Errei:4,'Difícil':8,Bom:16,'Fácil':28};
function localDay(d=new Date()){
 return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function validDay(s){
 if(!/^(20\d\d|2100)-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(String(s||'')))return false;
 const d=new Date(s+'T12:00:00');return !Number.isNaN(d.getTime())&&localDay(d)===s;
}
function shift(s,days){
 if(!validDay(s))throw Error('Data inválida');
 const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+days);return localDay(d);
}
function plain(s,max=500){
 return String(s??'').trim().slice(0,max);
}
function id(){
 return 'BM184-'+(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():
 Date.now()+'-'+Math.random().toString(36).slice(2));
}
function read(key){
 let raw;
 try{raw=localStorage.getItem(key)}catch(e){throw Error('Armazenamento local indisponível: '+e.message)}
 if(raw===null)return [];
 let value;try{value=JSON.parse(raw)}catch(_){throw Error('Histórico local '+key+' está corrompido. Não será sobrescrito.')}
 if(!Array.isArray(value)||value.length>LIMIT)throw Error('Histórico local '+key+' inválido; preserve o backup.');
 return value;
}
function validSession(e){
 return !!e&&typeof e.id==='string'&&e.id.length<130&&validDay(e.day)&&
 Number.isInteger(e.minutes)&&e.minutes>=1&&e.minutes<=1440&&
 typeof e.discipline==='string'&&e.discipline.length>0&&e.discipline.length<=120&&
 typeof e.subject==='string'&&e.subject.length<=220&&
 typeof e.activity==='string'&&e.activity.length<=80&&
 typeof e.note==='string'&&e.note.length<=3000;
}
function validReview(e){
 return !!e&&typeof e.id==='string'&&e.id.length<130&&
 /^(CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+)$/.test(e.cardId||'')&&
 Object.prototype.hasOwnProperty.call(RATINGS,e.rating)&&validDay(e.day)&&validDay(e.due)&&
 Number.isInteger(e.interval)&&e.interval>=4&&e.interval<=90&&
 typeof e.answer==='string'&&e.answer.length<=12000&&
 typeof e.note==='string'&&e.note.length<=3000&&
 typeof e.discipline==='string'&&e.discipline.length<=120&&
 typeof e.subject==='string'&&e.subject.length<=220&&
 typeof e.at==='string'&&e.at.length<=60&&
 Number.isInteger(e.seconds)&&e.seconds>=0&&e.seconds<=86400;
}
let sessions=read(SK),reviews=read(RK);
if(sessions.some(x=>!validSession(x))||reviews.some(x=>!validReview(x)))
 throw Error('Há registros locais inválidos. Nenhum dado será modificado; exporte os originais para auditoria.');
function unique(rows){const ids=rows.map(x=>x.id);return new Set(ids).size===ids.length;}
if(!unique(sessions)||!unique(reviews))throw Error('Há IDs duplicados no histórico local; atualização bloqueada.');
function persist(key,arr){localStorage.setItem(key,JSON.stringify(arr));}
function changed(){
 try{window.dispatchEvent(new CustomEvent('bm184-study-updated'))}catch(_){}
}
function currentSessions(){return sessions.map(x=>({...x})).sort((a,b)=>b.day.localeCompare(a.day)||b.id.localeCompare(a.id))}
function currentReviews(){return reviews.map(x=>({...x})).sort((a,b)=>String(b.at).localeCompare(String(a.at)))}
function totals(from='',to=''){
 const arr=sessions.filter(s=>(!from||s.day>=from)&&(!to||s.day<=to));
 const byDay={},byDiscipline={},byActivity={};let minutes=0;
 for(const r of arr){
  minutes+=r.minutes;
  byDay[r.day]=(byDay[r.day]||0)+r.minutes;
  byDiscipline[r.discipline]=(byDiscipline[r.discipline]||0)+r.minutes;
  byActivity[r.activity]=(byActivity[r.activity]||0)+r.minutes;
 }
 return {minutes,sessions:arr.length,byDay,byDiscipline,byActivity};
}
function saveSession(input){
 const row={
  id:input.id||id(),day:plain(input.day,10),discipline:plain(input.discipline,120),
  subject:plain(input.subject,220),activity:plain(input.activity,80)||'Outros',
  minutes:Number(input.minutes),note:plain(input.note,3000)
 };
 if(!validSession(row))throw Error('Informe data, disciplina e duração entre 1 minuto e 24 horas.');
 const index=sessions.findIndex(x=>x.id===row.id);
 if(index<0&&sessions.length>=LIMIT)throw Error('Limite de sessões alcançado. Exporte seu histórico.');
 const next=[...sessions];if(index>=0)next[index]=row;else next.push(row);
 const total=next.filter(x=>x.day===row.day).reduce((n,x)=>n+x.minutes,0);
 if(total>1440)throw Error('Mais de 24 horas registradas neste dia. Corrija os lançamentos.');
 persist(SK,next);sessions=next;changed();return {...row};
}
function deleteSession(entryId){
 if(!sessions.some(x=>x.id===entryId))throw Error('Lançamento não encontrado.');
 const next=sessions.filter(x=>x.id!==entryId);persist(SK,next);sessions=next;changed();
}
function latest(cardId){
 return reviews.filter(e=>e.cardId===cardId).sort((a,b)=>b.at.localeCompare(a.at))[0]||null;
}
function nextReviews(){
 const map=new Map();
 for(const e of reviews){const prev=map.get(e.cardId);if(!prev||e.at>prev.at)map.set(e.cardId,e)}
 return [...map.values()].map(x=>({...x}));
}
function saveReview(input){
 const cardId=plain(input.cardId,80),rating=String(input.rating||'');
 if(!/^(CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+)$/.test(cardId))
  throw Error('ID de cartão incompatível com a base.');
 if(!Object.prototype.hasOwnProperty.call(RATINGS,rating))throw Error('Avaliação inválida.');
 if(reviews.length>=LIMIT)throw Error('Limite de tentativas alcançado. Exporte o histórico.');
 const old=latest(cardId),base=RATINGS[rating];
 // Intervalos locais operacionais: erro/dificuldade reiniciam; Bom/Fácil avançam x2, teto 90.
 const interval=(rating==='Errei'||rating==='Difícil')?base:
  Math.min(90,old?Math.max(base,old.interval*2):base);
 const day=plain(input.day||localDay(),10);
 const row={
  id:id(),cardId,day,due:shift(day,interval),interval,rating,
  answer:plain(input.answer,12000),note:plain(input.note,3000),
  discipline:plain(input.discipline,120),subject:plain(input.subject,220),
  seconds:Math.min(86400,Math.max(0,Math.round(Number(input.seconds)||0))),
  at:new Date().toISOString()
 };
 if(!validReview(row))throw Error('Tentativa inválida; nada foi registrado.');
 const next=[...reviews,row];persist(RK,next);reviews=next;changed();return {...row};
}
function asSnapshot(){
 return {format:SCHEMA,exported_at:new Date().toISOString(),timezone:'Horário local do dispositivo',
  notes:'Registros operacionais locais, não constituem SRS canônico do Banco Mestre',
  sessions:currentSessions(),reviews:currentReviews()};
}
function importSnapshot(value){
 if(!value||value.format!==SCHEMA||!Array.isArray(value.sessions)||!Array.isArray(value.reviews))
  throw Error('Backup diferente do formato '+SCHEMA);
 if(value.sessions.length>LIMIT||value.reviews.length>LIMIT||
 value.sessions.some(x=>!validSession(x))||value.reviews.some(x=>!validReview(x))||
 !unique(value.sessions)||!unique(value.reviews))
  throw Error('Backup com dados inválidos ou IDs duplicados.');
 const reconcile=(old,coming)=>{
  const seen=new Map(old.map(x=>[x.id,x])),result=[...old];let added=0;
  for(const row of coming){
   const prev=seen.get(row.id);
   if(prev){
    if(JSON.stringify(prev)!==JSON.stringify(row))
     throw Error('Conflito no registro '+row.id+'. Nada será substituído.');
    continue;
   }
   result.push({...row});seen.set(row.id,row);added++;
  }
  if(result.length>LIMIT)throw Error('Limite local de registros excedido.');
  return {result,added};
 };
 const s=reconcile(sessions,value.sessions),r=reconcile(reviews,value.reviews);
 const dayTotals={};for(const e of s.result)dayTotals[e.day]=(dayTotals[e.day]||0)+e.minutes;
 if(Object.values(dayTotals).some(x=>x>1440))throw Error('Backup ultrapassa 24h em pelo menos um dia.');
 // Duas chaves distintas não oferecem transação; restaurar ambas se segunda escrita falhar.
 const oldS=localStorage.getItem(SK),oldR=localStorage.getItem(RK);
 try{persist(SK,s.result);persist(RK,r.result)}
 catch(error){
  try{if(oldS===null)localStorage.removeItem(SK);else localStorage.setItem(SK,oldS);
      if(oldR===null)localStorage.removeItem(RK);else localStorage.setItem(RK,oldR)}catch(_){}
  throw Error('Falha no armazenamento. Tente restaurar o backup em outro navegador: '+error.message);
 }
 sessions=s.result;reviews=r.result;changed();return {sessionsAdded:s.added,reviewsAdded:r.added};
}
window.BM184StudyStore=Object.freeze({
 localDay,shift,validDay,listSessions:currentSessions,listReviews:currentReviews,
 saveSession,deleteSession,saveReview,latest,nextReviews,totals,exportData:asSnapshot,importData:importSnapshot,
 intervals:{...RATINGS},get counts(){return {sessions:sessions.length,reviews:reviews.length}}
});
})();