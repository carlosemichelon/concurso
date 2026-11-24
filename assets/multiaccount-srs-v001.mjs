import {createImageStateSync} from './multiaccount-image-state-v001.mjs';
import {profileImageAccess} from './multiaccount-images-v001.mjs';
import {createMarksSync} from './multiaccount-marks-v001.mjs';
import {profilePdfAccess,hydrateProfileMarks} from './multiaccount-pdf-v001.mjs';
import {checkedDiscursive,newDiscursive,historicalDiscursive,mergeDiscursive} from './multiaccount-discursive-v001.mjs';
import {ACCOUNT_RATINGS,checkedReviewEvent,newReviewEvent,mergeReviewRows,formalEasyEvidence} from './multiaccount-review-events-v001.mjs';
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
export function createAccountRuntime({session,storage,idb,reviewEvents=null,discursiveEvents=null,uuid=()=>crypto.randomUUID(),clock=()=>new Date()}){
 if(session.phase!=='ready'||!session.identity||!session.current)throw Error('Perfil autenticado indisponível');
 const info={...session.identity,email_verified:true},profile=session.current;
 if(profile.subject!==info.sub)throw Error('Perfil e sessão divergentes');
 const cards=profileCatalog(profile),srs=profileSrs(profile,cards),context=createAccountContext(info,storage,idb),pdfAccess=profilePdfAccess({session,profile,allowedGroups:["eng_materiais","eng_geotecnia","eng_estruturas","eng_instalacoes","eng_hidraulica","eng_ambiental","eng_rodovias","eng_topografia","eng_patologias","eng_seguranca","eng_desempenho","eng_planejamento","leg_ijui","leg_geral","leg_apostila","lang_port","lang_math","completo","eng_outros","leg_outros","lang_outros","apoio_provas","apoio_drive","lang_info"]});let active=true,busy=false,uncertain=false;const events=reviewEvents===null?[]:reviewEvents.map(e=>checkedReviewEvent(e,info.sub));if(new Set(events.map(e=>e.event_id)).size!==events.length)throw Error('Eventos duplicados');const allowed=new Set(cards.filter(c=>c.active).map(c=>c.id));
 const imageAccess=profileImageAccess({session,profile,cardIds:cards.map(c=>c.id)});
 const priorDisc=historicalDiscursive(profile.privateData.questions||[]),discEvents=discursiveEvents===null?[]:discursiveEvents.map(e=>checkedDiscursive(e,info.sub));let discBusy=false,discUncertain=false;mergeDiscursive(priorDisc,discEvents,info.sub);
 const check=()=>{if(!active||session.phase!=='ready'||session.identity?.sub!==info.sub)throw Error('Sessão de perfil encerrada; recarregue o portal')};
 const imageState=createImageStateSync({owner:info.sub,storage:context.local,session,images:imageAccess.catalog(),cardIds:cards.map(c=>c.id),check});
 return Object.freeze({subject:info.sub,mode:'account',ratings:ACCOUNT_RATINGS,get reviewReady(){return active&&session.phase==='ready'&&reviewEvents!==null&&typeof session.appendReview==='function'&&!uncertain},canAcquire:id=>{check();return formalEasyEvidence(id,profile.privateData.srs,events,clock().toISOString())>=2},async recordReview(id,rating){check();if(reviewEvents===null||typeof session.appendReview!=='function'||busy||uncertain)throw Error('Gravação individual indisponível ou pendente de confirmação.');if(!allowed.has(id))throw Error('Cartão não ativo no perfil.');const event=newReviewEvent({owner:info.sub,id,rating,history:profile.privateData.srs,events,now:clock(),uuid:uuid()});busy=true;try{const saved=await session.appendReview(event);check();const valid=checkedReviewEvent(saved,info.sub);if(valid.event_id!==event.event_id||valid.id!==id||valid.rating!==rating||valid.due!==event.due)throw Error('Confirmação divergente');events.push(valid);return saved}catch(e){uncertain=true;throw Error('Gravação não confirmada. Reabra a sessão para consultar o diário antes de repetir: '+e.message)}finally{busy=false}},get discursiveReady(){return active&&session.phase==='ready'&&discursiveEvents!==null&&typeof session.appendDiscursive==='function'&&!discUncertain},discursive:()=>{check();return mergeDiscursive(priorDisc,discEvents,info.sub)},async recordDiscursive(id,answer,rating,note=''){check();if(discursiveEvents===null||typeof session.appendDiscursive!=='function'||discBusy||discUncertain)throw Error('Gravação discursiva indisponível ou pendente de confirmação.');if(!allowed.has(id))throw Error('Cartão não ativo no perfil.');const card=cards.find(c=>c.id===id),row=newDiscursive({owner:info.sub,card,answer,rating,note,now:clock(),uuid:uuid()});discBusy=true;try{const saved=await session.appendDiscursive(row);check();const valid=checkedDiscursive(saved,info.sub);if(valid.id!==row.id||valid.card_id!==id||valid.answer!==answer||valid.rating!==rating||valid.note!==note)throw Error('Confirmação divergente');discEvents.push({...valid,fileId:saved.fileId});return saved}catch(e){discUncertain=true;throw Error('Gravação não confirmada. Reabra a sessão e consulte o histórico antes de repetir. '+e.message)}finally{discBusy=false}},imageState,writeImageSetting:(key,value)=>{check();imageState.write(key,value)},imageCatalog:()=>{check();return imageAccess.catalog()},imageInfo:id=>{check();return imageAccess.get(id)},imageLinks:id=>{check();return imageAccess.links(id)},async readImage(id){check();const result=await imageAccess.read(id);check();return result},get pdfCopyReady(){return active&&session.phase==='ready'&&pdfAccess.copyReady},async savePdfCopy(prepared){check();const result=await pdfAccess.saveCopy(prepared);check();return result},pdfCatalog:()=>{check();return pdfAccess.catalog()},async readPdf(doc){check();const result=await pdfAccess.read(doc);check();return result},hydrateMarks:core=>{check();return hydrateProfileMarks(context.local,profile.privateData.annotations||[],core)},marksSync:(core,masterCore,device)=>{check();return createMarksSync({owner:info.sub,storage:context.local,session,core,masterCore,history:profile.privateData.annotations||[],check,device})},get local(){check();return context.local},openDatabase:(name,version)=>{check();return context.openDatabase(name,version)},catalog:()=>{check();return clone(cards)},srs:()=>{check();return {records:mergeReviewRows(srs.rows,events.filter(e=>allowed.has(e.id)),info.sub),undated:srs.undated.length,unmatched:srs.unmatched.length,version:'perfil individual',updated:'',driveFileId:profile.profileId}},close:()=>{active=false;context.close()}});
}

export async function prepareAccountRuntime(options){const [events,discursive]=await Promise.all([options.session.readReviewEvents(),typeof options.session.readDiscursive==='function'?options.session.readDiscursive():null]);const runtime=createAccountRuntime({...options,reviewEvents:events,discursiveEvents:discursive});try{if(runtime.imageState.available)await runtime.imageState.hydrate();return runtime}catch(e){runtime.close();throw e}}
