/* Adapter for the existing SRS calendar. One authenticated page per account.
 * Do not mount the legacy portal until the authenticated runtime is available.
 * Read-only SRS phase: preserve recorded dates; never invent historical grades.
 */
import {createAccountContext} from './multiaccount-storage-v001.mjs';
const clone=x=>JSON.parse(JSON.stringify(x));
const date=x=>{if(typeof x!=='string')return null;let s=x.trim();const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)s=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');if(!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(s))return null;s=s.slice(0,10);const d=new Date(s+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?s:null};
const ratings=['Errei','Difícil','Bom','Fácil','Conhecimento preservado','Conhecimento adquirido','Consolidado'];
const rating=x=>ratings.find(v=>v===x)||'';
export function profileCatalog(profile){
 const map=new Map();for(const c of [...profile.publicCards,...profile.privateData.cards]){
  if(!c||typeof c.id!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||typeof c.active!=='boolean')throw Error('Ficha de perfil incompatível');
  if(map.has(c.id))throw Error('ID conflitante no perfil: '+c.id+'; conciliação explícita necessária');
  map.set(c.id,clone(c))
 }return [...map.values()]
}
export function profileSrs(profile,cards=profileCatalog(profile)){
 const ids=new Set(cards.map(c=>c.id)),seen=new Set(),rows=[],undated=[],unmatched=[];
 for(const r of profile.privateData.srs){
  if(!r||typeof r.id!=='string'||!r.id||seen.has(r.id))throw Error('Registro SRS inválido ou duplicado');seen.add(r.id);
  if(!ids.has(r.id)){unmatched.push(clone(r));continue}
  const rawDue=r.due??r.next_review??r.proxima_revisao??null,when=date(rawDue);
  if(!when){undated.push(clone(r));continue}
  const grade=rating(r.rating)||rating(r.last_date)||rating(r.grade)||rating(r.avaliacao);
  const lastReview=date(r.lastReview)||date(r.last_review_at)||date(r.grade)||date(r.last_date)||date(r.review_date);
  rows.push({id:r.id,due:when,rating:grade,lastReview,attempts:Number.isInteger(r.attempts)&&r.attempts>=0?r.attempts:null,intervalDays:Number.isInteger(r.intervalDays)&&r.intervalDays>=0?r.intervalDays:null,easyFormalCount:Number.isInteger(r.easyFormalCount)&&r.easyFormalCount>=0?r.easyFormalCount:0,consolidated:r.consolidated===true,kind:grade?'revisao':'agendamento',source:'Perfil privado — vencimento preservado',original:clone(r)})
 }return {rows,undated,unmatched}
}
export function createAccountRuntime({session,storage,idb}){
 if(session.phase!=='ready'||!session.identity||!session.current)throw Error('Perfil autenticado indisponível');
 const info={...session.identity,email_verified:true},profile=session.current;
 if(profile.subject!==info.sub)throw Error('Perfil e sessão divergentes');
 const cards=profileCatalog(profile),srs=profileSrs(profile,cards),context=createAccountContext(info,storage,idb);let active=true;
 const check=()=>{if(!active||session.phase!=='ready'||session.identity?.sub!==info.sub)throw Error('Sessão de perfil encerrada; recarregue o portal')};
 return Object.freeze({subject:info.sub,mode:'account',get local(){check();return context.local},openDatabase:(name,version)=>{check();return context.openDatabase(name,version)},catalog:()=>{check();return clone(cards)},srs:()=>{check();return {records:clone(srs.rows),undated:srs.undated.length,unmatched:srs.unmatched.length,version:'perfil individual',updated:'',driveFileId:profile.profileId}},close:()=>{active=false;context.close()}});
}
