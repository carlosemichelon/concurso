// Independent study-control snapshots. No writes to the formal card-review journal.
import {createReader} from './catalog.mjs';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',PROJECT='bm-portal-multi-v1',KIND='study-control';
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_:-]{1,160}$/.test(x);
const fileId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const fail=code=>{const e=Error('Controle privado não confirmado');e.code=code;throw e};
const fresh=()=>({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60,activeTimer:null});
const number=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const day=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const keys=['schema','subjects','sessions','reviews','plans','audit','cycle','cycleIndex','availabilityWeek','availabilityMonth','activeTimer'];
function validate(d){
 if(!d||d.schema!==1||Object.keys(d).some(k=>!keys.includes(k))||Buffer.byteLength(JSON.stringify(d))>220000)fail('input');
 function safe(v,depth=0){if(depth>12)return false;if(v===null||typeof v==='boolean')return true;if(typeof v==='string')return v.length<=30000;if(typeof v==='number')return Number.isFinite(v);if(Array.isArray(v))return v.length<=10000&&v.every(x=>safe(x,depth+1));if(typeof v==='object')return Object.keys(v).length<=100&&Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype'].includes(k)&&safe(x,depth+1));return false}
 if(!safe(d))fail('input');
 for(const k of ['subjects','sessions','reviews','plans','audit']){
  if(!Array.isArray(d[k])||d[k].length>10000||d[k].some(x=>!x||!id(x.id))||new Set(d[k].map(x=>x.id)).size!==d[k].length)fail('input');
 }
 const subs=new Set(d.subjects.map(x=>x.id));
 if(d.subjects.some(x=>typeof x.name!=='string'||!x.name.trim()||x.name.length>300||!/^#[0-9a-f]{6}$/i.test(x.color||'')))fail('input');
 if(d.sessions.some(x=>!subs.has(x.subjectId)||!day(x.date)||!number(x.minutes,.01,1e7)||!Number.isSafeInteger(x.questions)||!Number.isSafeInteger(x.correct)||x.correct<0||x.questions<x.correct))fail('input');
 if(d.reviews.some(x=>!subs.has(x.subjectId)||!day(x.due)||typeof x.done!=='boolean')||d.plans.some(x=>!subs.has(x.subjectId)||!day(x.date)||!number(x.minutes,1,1440)))fail('input');
 if(!Array.isArray(d.cycle)||d.cycle.length>1000||d.cycle.some(x=>!subs.has(x.subjectId)||!number(x.minutes,1,1440))||!Number.isSafeInteger(d.cycleIndex)||d.cycleIndex<0||!number(d.availabilityWeek,0,1000)||!number(d.availabilityMonth,0,5000))fail('input');
 if(d.activeTimer!=null){const t=d.activeTimer;if(!t||!id(t.ownerId)||!id(t.sessionId)||!subs.has(t.subject)||typeof t.running!=='boolean'||!number(t.elapsed,0,1e12)||!number(t.start,0,1e13))fail('input')}
 return d;
}
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function transition(old,next){
 // Preserve previous audit entries and session identity. Removal must be soft.
 if(!eq(old.audit,next.audit.slice(0,old.audit.length)))fail('input');
 if(old.sessions.some(s=>!next.sessions.some(t=>t.id===s.id)))fail('input');
}
export function createStudyStore({resolveSession,getToken,fetcher=fetch,now=Date.now}){
 const read=createReader({resolveSession,getToken,fetcher}),queues=new Map(),uncertain=new Set();
 async function scope(req){
  const s=await resolveSession(req);if(!s||![s.subject,s.rootId,s.profileId,s.sessionId].every(fileId))fail('session');
  await read(req);const {token}=await getToken();if(!token)fail('session');
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>s[k]!==t[k]))fail('session')};
  const request=async(url,opts={})=>{const r=await fetcher(url,{...opts,headers:{Authorization:'Bearer '+token,...opts.headers},cache:'no-store',redirect:'error'});if(!r.ok)fail('drive');return r.json()};
  const meta=async(fid)=>{if(!fileId(fid))fail('metadata');const m=await request(API+'/'+fid+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
   if(m.id!==fid||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!==KIND||!/^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?$/i.test(m.mimeType||'')||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>250000)fail('owner');return m};
  await live();return {s,request,meta,live};
 }
 async function event(ctx,fid){
  const a=await ctx.meta(fid),e=await ctx.request(API+'/'+fid+'?alt=media'),b=await ctx.meta(fid),fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>a[k]||b[k]);
  if(String(a.size)!==String(b.size)||!(fields.length?fields.every(k=>a[k]&&a[k]===b[k]):a.version&&a.version===b.version))fail('revision');
  if(e?.schema!=='BM-STUDY-CONTROL/1'||e.owner!==ctx.s.subject||!uuid(e.event_id)||a.appProperties.bmEvent!==e.event_id||!(e.previous===null||uuid(e.previous))||!Number.isFinite(Date.parse(e.at)))fail('event');
  validate(e.data);return e;
 }
 async function journal(ctx){
  let page='',pages=0;const events=new Map(),children=new Map();
  do{
   if(++pages>10)fail('limit');const u=new URL(API);u.searchParams.set('q',"'"+ctx.s.rootId+"' in parents and trashed=false and appProperties has { key='bmKind' and value='"+KIND+"' }");u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id)');u.searchParams.set('pageSize','1000');if(page)u.searchParams.set('pageToken',page);
   const d=await ctx.request(u.href);if(d.incompleteSearch||!Array.isArray(d.files))fail('list');
   for(const f of d.files){if(events.size>=2000)fail('limit');const e=await event(ctx,f.id);if(events.has(e.event_id)||children.has(e.previous))fail('conflict');events.set(e.event_id,e);children.set(e.previous,e)}
   page=d.nextPageToken||'';
  }while(page);
  let latest=null,n=0;while(children.has(latest?.event_id||null)){const e=children.get(latest?.event_id||null);transition(latest?.data||fresh(),e.data);latest=e;if(++n>events.size)fail('conflict')}
  if(n!==events.size)fail('conflict');await ctx.live();return {events,latest};
 }
 const view=e=>({data:e?.data||fresh(),revision:e?.event_id||null,at:e?.at||null});
 async function get(req){return view((await journal(await scope(req))).latest)}
 async function save(req,input){
  if(!input||!uuid(input.event_id)||!(input.previous===null||uuid(input.previous)))fail('input');validate(input.data);
  const ctx=await scope(req),key=ctx.s.subject,prior=queues.get(key)||Promise.resolve();
  const work=prior.catch(()=>{}).then(async()=>{
   await ctx.live();const h=await journal(ctx),old=h.latest,existing=h.events.get(input.event_id),attempt=key+':'+input.event_id;
   if(existing){if(existing.previous!==input.previous||!eq(existing.data,input.data))fail('conflict');return view(old)}
   if(uncertain.has(attempt)||(old?.event_id||null)!==input.previous)fail('conflict');
   transition(old?.data||fresh(),input.data);
   const e={schema:'BM-STUDY-CONTROL/1',owner:ctx.s.subject,event_id:input.event_id,previous:input.previous,at:new Date(now()).toISOString(),data:input.data};
   const m={name:'BM_STUDY_'+e.event_id+'.json',mimeType:'application/json',parents:[ctx.s.rootId],appProperties:{bmProject:PROJECT,bmOwner:ctx.s.subject,bmKind:KIND,bmEvent:e.event_id}};
   const boundary='bm_'+e.event_id.replaceAll('-',''),body='--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(m)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--\r\n';
   await ctx.live();if(uncertain.size>=10000)fail('limit');uncertain.add(attempt);
   const f=await ctx.request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body}),confirmed=await event(ctx,f.id);if(!eq(confirmed,e))fail('receipt');await ctx.live();return view(confirmed);
  });
  queues.set(key,work);try{return await work}finally{if(queues.get(key)===work)queues.delete(key)}
 }
 return {get,save};
}
