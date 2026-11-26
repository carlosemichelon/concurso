// Page snapshots append to the authenticated student's root; no overwrites or global searches.
import {createReader} from './catalog.mjs';
import {createHash} from 'node:crypto';
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',PROJECT='bm-portal-multi-v1';
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const shaOk=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const fail=code=>{const e=Error('Grifos privados indisponíveis');e.code=code;throw e};
function marksOk(marks){
 if(!Array.isArray(marks)||marks.length>2000||Buffer.byteLength(JSON.stringify(marks))>240000)return false;
 function safe(v,depth=0){if(depth>12)return false;if(v===null||typeof v==='boolean')return true;if(typeof v==='string')return v.length<=20000;if(typeof v==='number')return Number.isFinite(v);if(Array.isArray(v))return v.length<=20000&&v.every(x=>safe(x,depth+1));if(typeof v==='object')return Object.keys(v).length<=80&&Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype'].includes(k)&&safe(x,depth+1));return false}
 return marks.every(m=>m&&typeof m==='object'&&!Array.isArray(m)&&typeof m.type==='string'&&safe(m));
}
function imageMarksOk(marks){
 const num=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1;
 return marksOk(marks)&&marks.every(m=>['pen','highlighter','rect'].includes(m.type)&&/^#[0-9a-f]{6}$/i.test(m.color||'')&&typeof m.size==='number'&&m.size>=1&&m.size<=40&&
 (m.type==='rect'?Array.isArray(m.box)&&m.box.length===4&&m.box.every(num):Array.isArray(m.points)&&m.points.length>0&&m.points.length<20000&&m.points.every(p=>Array.isArray(p)&&p.length===3&&p.every(num))));
}
export function createAnnotationStore({resolveSession,getToken,fetcher=fetch,now=Date.now,mode='pdf'}){
 if(!['pdf','image'].includes(mode))throw Error('Modo de anotação inválido');
 const image=mode==='image',kind=image?'image-annotation':'pdf-annotation',schema=image?'BM-IMAGE-INK/1':'BM-PDF-PAGE/1',validMarks=image?imageMarksOk:marksOk;
 const read=createReader({resolveSession,getToken,fetcher,includeMedia:true}),queues=new Map(),uncertain=new Set();
 async function scope(req,pdfId,page){
  if(!idOk(pdfId)||!Number.isInteger(page)||page<1||page>100000||(image&&page!==1))fail('input');
  const s=await resolveSession(req);if(!s)fail('session');
  const {records,media}=await read(req),active=new Map(records.filter(c=>c.active).map(c=>[c.id,c]));
  const links=media.filter(m=>m?.id===pdfId&&(image?['image/png','image/jpeg','image/webp','image/gif'].includes(m.mimeType):m.mimeType==='application/pdf')&&Array.isArray(m.card_ids)&&m.card_ids.some(id=>active.has(id)&&(!image||active.get(id)?.consolidation?.profile?.editorial?.media?.some(x=>x.id===pdfId&&x.private_original))));
  if(links.length!==1||!shaOk(links[0].sha256)||!idOk(links[0].fileId))fail('document');
  const link=links[0],key=createHash('sha256').update(pdfId+'\n'+link.sha256+'\n'+page).digest('hex'),{token}=await getToken();if(!token)fail('session');
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>t[k]!==s[k]))fail('session')};
  const request=async(url,opts={})=>{const r=await fetcher(url,{...opts,headers:{Authorization:'Bearer '+token,...opts.headers},cache:'no-store',redirect:'error'});if(!r.ok)fail('drive');return r.json()};
  const meta=async(id,kind)=>{if(!idOk(id))fail('metadata');const m=await request(API+'/'+id+'?fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size,version,headRevisionId,md5Checksum,sha256Checksum');
   if(m.id!==id||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!==kind)fail('owner');
   return m;
  };
  const pdf=await meta(link.fileId,'media-file');
  if(pdf.mimeType!==link.mimeType||pdf.appProperties?.bmMedia!==pdfId||pdf.sha256Checksum&&pdf.sha256Checksum!==link.sha256)fail('document');
  await live();return {s,key,pdfId,page,hash:link.sha256,request,meta,live};
 }
 async function event(ctx,id){
  const before=await ctx.meta(id,kind);
  if(!/^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?$/i.test(before.mimeType)||before.appProperties?.bmPage!==ctx.key||Number(before.size)<1||Number(before.size)>300000||!Number.isSafeInteger(Number(before.size)))fail('metadata');
  const e=await ctx.request(API+'/'+id+'?alt=media'),after=await ctx.meta(id,kind);
  const fields=['headRevisionId','md5Checksum','sha256Checksum'].filter(k=>before[k]||after[k]);
  if(String(before.size)!==String(after.size)||!(fields.length?fields.every(k=>before[k]&&before[k]===after[k]):before.version&&before.version===after.version))fail('revision');
  if(e?.schema!==schema||e.owner!==ctx.s.subject||e.pdfId!==ctx.pdfId||e.hash!==ctx.hash||e.page!==ctx.page||!uuid(e.event_id)||before.appProperties.bmEvent!==e.event_id||!(e.previous===null||uuid(e.previous))||!validMarks(e.marks))fail('event');
  return e;
 }
 async function history(ctx){
  let page='',pages=0;const events=new Map(),children=new Map();
  do{
   if(++pages>10)fail('limit');
   const q="'"+ctx.s.rootId+"' in parents and trashed=false and appProperties has { key='bmKind' and value='"+kind+"' } and appProperties has { key='bmPage' and value='"+ctx.key+"' }";
   const u=new URL(API);u.searchParams.set('q',q);u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id)');u.searchParams.set('pageSize','1000');if(page)u.searchParams.set('pageToken',page);
   const d=await ctx.request(u.href);if(d.incompleteSearch||!Array.isArray(d.files))fail('list');
   for(const f of d.files){if(events.size>=2000)fail('limit');const e=await event(ctx,f.id);if(events.has(e.event_id)||children.has(e.previous))fail('conflict');events.set(e.event_id,e);children.set(e.previous,e)}
   page=d.nextPageToken||'';
  }while(page);
  let latest=null,n=0;while(children.has(latest?.event_id||null)){latest=children.get(latest?.event_id||null);if(++n>events.size)fail('conflict')}
  if(n!==events.size)fail('conflict');await ctx.live();return {events,latest};
 }
 function view(ctx,e){return {pdfId:ctx.pdfId,hash:ctx.hash,page:ctx.page,revision:e?.event_id||null,marks:e?.marks||[]}}
 async function get(req,pdfId,page){const ctx=await scope(req,pdfId,page);return view(ctx,(await history(ctx)).latest)}
 async function save(req,pdfId,page,input){
  if(!input||!uuid(input.event_id)||!shaOk(input.hash)||!(input.previous===null||uuid(input.previous))||!validMarks(input.marks))fail('input');
  const ctx=await scope(req,pdfId,page);if(input.hash!==ctx.hash)fail('conflict');
  const queueKey=ctx.s.subject+':'+ctx.key,prior=queues.get(queueKey)||Promise.resolve();
  const work=prior.catch(()=>{}).then(async()=>{
   await ctx.live();const h=await history(ctx),existing=h.events.get(input.event_id),attempt=queueKey+':'+input.event_id;
   if(existing){if(existing.previous!==input.previous||JSON.stringify(existing.marks)!==JSON.stringify(input.marks))fail('conflict');return view(ctx,h.latest)}
   if(uncertain.has(attempt)||h.latest?.event_id!==undefined&&h.latest.event_id!==input.previous||!h.latest&&input.previous!==null)fail('conflict');
   const e={schema,owner:ctx.s.subject,pdfId,hash:ctx.hash,page,event_id:input.event_id,previous:input.previous,at_utc:new Date(now()).toISOString(),marks:input.marks};
   const m={name:(image?'BM_IMAGE_INK_':'BM_PDF_PAGE_')+ctx.key+'_'+e.event_id+'.json',mimeType:'application/json',parents:[ctx.s.rootId],appProperties:{bmProject:PROJECT,bmOwner:ctx.s.subject,bmKind:kind,bmPage:ctx.key,bmEvent:e.event_id}};
   const boundary='bm_'+e.event_id.replaceAll('-',''),body='--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(m)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--\r\n';
   await ctx.live();if(uncertain.size>=10000)fail('limit');uncertain.add(attempt);
   const created=await ctx.request(UPLOAD,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body}),confirmed=await event(ctx,created.id);
   if(confirmed.event_id!==e.event_id||confirmed.previous!==e.previous||JSON.stringify(confirmed.marks)!==JSON.stringify(e.marks))fail('receipt');
   await ctx.live();return view(ctx,confirmed);
  });
  queues.set(queueKey,work);try{return await work}finally{if(queues.get(queueKey)===work)queues.delete(queueKey)}
 }
 return {get,save};
}
