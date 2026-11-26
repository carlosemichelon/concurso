import {createReader} from './catalog.mjs';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',PROJECT='bm-portal-multi-v1';
const RATINGS=Object.freeze({'Difícil':8,Bom:16,'Fácil':24,'Conhecimento preservado':32,'Conhecimento adquirido':64});
const SOURCE='Banco Mestre — revisão formal no site';
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const hasRating=x=>Object.hasOwn(RATINGS,x);
const date=d=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day};
const due=(d,n)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
function fail(code){const e=Error('Revisão privada indisponível');e.code=code;throw e}
export function createReviewStore({resolveSession,getToken,fetcher=fetch,now=Date.now}){
 const readCards=createReader({resolveSession,getToken,fetcher}),queues=new Map(),uncertain=new Set();
 async function scope(req){
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(idOk))fail('session');
  const session={...s};const {token}=await getToken(session);if(!token)fail('token');
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>t[k]!==session[k]))fail('session')};
  const request=async(url,opts={})=>{const r=await fetcher(url,{...opts,headers:{Authorization:'Bearer '+token,...opts.headers},cache:'no-store',redirect:'error'});if(!r.ok)fail('drive');return r.json()};
  const meta=async(id,kind)=>{if(!idOk(id))fail('id');const m=await request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
   if(m.id!==id||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==session.subject||m.appProperties?.bmKind!==kind)fail('owner');
   if(kind==='root'){if(m.mimeType!=='application/vnd.google-apps.folder')fail('mime')}
   else if(!/^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?$/i.test(m.mimeType||'')||m.parents?.length!==1||m.parents[0]!==session.rootId||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>65536)fail('metadata');
   return m;
  };
  await meta(session.rootId,'root');await live();return {session,request,meta,live};
 }
 async function readEvent(ctx,id){
  const before=await ctx.meta(id,'srs-event'),e=await ctx.request(API+'/'+id+'?alt=media'),after=await ctx.meta(id,'srs-event');
  const fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after[k]);
  if(String(before.size)!==String(after.size)||!(fields.length?fields.every(k=>typeof before[k]==='string'&&before[k]&&before[k]===after[k]):before.version&&before.version===after.version))fail('revision');
  if(!e||e.schema!=='bm-srs-formal-event/1'||e.source!==SOURCE||e.owner!==ctx.session.subject||e.project!==PROJECT||!uuid(e.event_id)||before.appProperties.bmEvent!==e.event_id||!/^CARD-\d{4,12}$/.test(e.id||'')||!hasRating(e.rating)||!Number.isFinite(Date.parse(e.at_utc))||date(new Date(e.at_utc))!==e.date_local||e.interval_days!==RATINGS[e.rating]||e.due!==due(e.date_local,e.interval_days))fail('event');
  return e;
 }
 async function list(ctx,eventId){
  const out=[],seen=new Set();let page='',pages=0;
  do{
   if(++pages>25)fail('list-limit');
   const q="'"+ctx.session.rootId+"' in parents and trashed=false and appProperties has { key='bmProject' and value='"+PROJECT+"' } and appProperties has { key='bmKind' and value='srs-event' }"+(eventId?" and appProperties has { key='bmEvent' and value='"+eventId+"' }":"");
   const u=new URL(API);u.searchParams.set('q',q);u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id)');u.searchParams.set('pageSize','1000');if(page)u.searchParams.set('pageToken',page);
   const data=await ctx.request(u.href);if(data.incompleteSearch||!Array.isArray(data.files))fail('list');
   for(const f of data.files){if(out.length>=20000)fail('list-limit');const e=await readEvent(ctx,f.id);if(seen.has(e.event_id)||eventId&&e.event_id!==eventId)fail('duplicate');seen.add(e.event_id);out.push(e)}
   page=data.nextPageToken||'';
  }while(page);
  await ctx.live();return out;
 }
 async function read(req){return list(await scope(req))}
 async function record(req,input){
  if(!input||!uuid(input.event_id)||!/^CARD-\d{4,12}$/.test(input.id||'')||!hasRating(input.rating))fail('input');
  const s=await resolveSession(req);if(!s)fail('session');
  const key=s.subject,previous=queues.get(key)||Promise.resolve();
  const work=previous.catch(()=>{}).then(async()=>{
   const ctx=await scope(req);if(ctx.session.sessionId!==s.sessionId||ctx.session.subject!==key)fail('session');
   const attempt=key+':'+input.event_id,existing=await list(ctx,input.event_id);
   if(existing.length){const e=existing[0];if(e.id!==input.id||e.rating!==input.rating)fail('conflict');uncertain.delete(attempt);return e}
   if(uncertain.has(attempt))fail('uncertain');
   const cards=await readCards(req);if(!cards.records.some(c=>c.id===input.id&&c.active))fail('card');
   if(input.rating==='Conhecimento adquirido'){const history=await list(ctx);if(new Set(history.filter(e=>e.id===input.id&&e.rating==='Fácil').map(e=>e.event_id)).size<2)fail('prerequisite')}
   const at=new Date(now()),day=date(at);
   const e={schema:'bm-srs-formal-event/1',source:SOURCE,owner:key,project:PROJECT,event_id:input.event_id,id:input.id,rating:input.rating,at_utc:at.toISOString(),date_local:day,timezone:'America/Sao_Paulo',kind:'revisao_formal',interval_days:RATINGS[input.rating],due:due(day,RATINGS[input.rating]),validation:'Avaliação explícita do estudante'};
   const metadata={name:'BM_SRS_EVENT_V001_'+e.id+'_'+e.event_id+'.json',mimeType:'application/json',parents:[ctx.session.rootId],appProperties:{bmProject:PROJECT,bmOwner:key,bmKind:'srs-event',bmEvent:e.event_id}};
   const boundary='bm_'+e.event_id.replaceAll('-',''),body='--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--\r\n';
   await ctx.live();if(uncertain.size>=10000)fail('uncertain-limit');uncertain.add(attempt);
   const saved=await ctx.request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
   const confirmed=await readEvent(ctx,saved.id);if(Object.keys(e).some(k=>confirmed[k]!==e[k]))fail('receipt');await ctx.live();return confirmed;
  });
  queues.set(key,work);try{return await work}finally{if(queues.get(key)===work)queues.delete(key)}
 }
 return {read,record};
}
