import {createHash} from 'node:crypto';
import {createReader,readableCardId} from './catalog.mjs';
const API='https://www.googleapis.com/drive/v3/files',PROJECT='bm-portal-multi-v1';
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const types=new Set(['image/png','image/jpeg','image/webp','image/gif','application/pdf']);
const fail=()=>{throw Error('Mídia privada indisponível')};
export function createMediaReader({resolveSession,getToken,fetcher=fetch}){
 const read=createReader({resolveSession,getToken,fetcher,includeMedia:true});
 return async(req,cardId,mediaId)=>{
  if(!readableCardId(cardId)||!idOk(mediaId))fail();
  const s=await resolveSession(req);if(!s)fail();
  const {records,media}=await read(req),card=records.find(c=>c.id===cardId&&c.active);
  const links=media.filter(m=>m?.id===mediaId&&Array.isArray(m.card_ids)&&m.card_ids.includes(cardId));
  if(!card||links.length!==1)fail();
  const link=links[0];if(!idOk(link.fileId)||!types.has(link.mimeType)||!/^[a-f0-9]{64}$/.test(link.sha256||''))fail();
  if(link.mimeType!=='application/pdf'&&!card.consolidation?.profile?.editorial?.media?.some(m=>m.id===mediaId&&m.private_original))fail();
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>t[k]!==s[k]))fail()};
  const {token}=await getToken(s);if(!token)fail();
  const url=API+'/'+encodeURIComponent(link.fileId);
  const fetchDrive=async(query)=>{const res=await fetcher(url+'?'+query,{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});if(!res.ok)fail();return res};
  const meta=async()=>{const r=await fetchDrive('fields=id,mimeType,ownedByMe,shared,trashed,parents,appProperties,size'),m=await r.json();
   if(m.id!==link.fileId||m.mimeType!==link.mimeType||m.ownedByMe!==true||m.shared!==false||m.trashed!==false||m.parents?.length!==1||m.parents[0]!==s.rootId||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.subject||m.appProperties?.bmKind!=='media-file'||m.appProperties?.bmMedia!==mediaId||!Number.isSafeInteger(Number(m.size))||Number(m.size)<1||Number(m.size)>25*1024*1024)fail();
   return Number(m.size);
  };
  await live();const size=await meta(),response=await fetchDrive('alt=media');
  if(response.headers.get('content-type')?.split(';')[0]!==link.mimeType||!response.body)fail();
  const chunks=[];let length=0;for await(const c of response.body){length+=c.length;if(length>size||length>25*1024*1024)fail();chunks.push(Buffer.from(c))}
  const bytes=Buffer.concat(chunks);
  if(length!==size||createHash('sha256').update(bytes).digest('hex')!==link.sha256||await meta()!==size)fail();
  await live();return {bytes,mimeType:link.mimeType,sha256:link.sha256};
 };
}

/** Return only presentation metadata. Never give browser a Drive locator. */
export function createPdfLibrary({resolveSession,getToken,fetcher=fetch}){
 const read=createReader({resolveSession,getToken,fetcher,includeMedia:true});
 return async req=>{
  const {records,media}=await read(req),active=new Set(records.filter(c=>c.active).map(c=>c.id)),seen=new Set(),out=[];
  for(const m of media){
   if(m?.mimeType!=='application/pdf')continue;
   if(!idOk(m.id)||seen.has(m.id)||!idOk(m.fileId)||!/^[a-f0-9]{64}$/.test(m.sha256||'')||!Array.isArray(m.card_ids))fail();
   seen.add(m.id);
   const card_ids=[...new Set(m.card_ids.filter(id=>active.has(id)))];
   if(!card_ids.length)continue;
   const text=(v,fallback)=>typeof v==='string'&&v.trim()?v.trim().slice(0,300):fallback;
   out.push({id:m.id,title:text(m.title,m.id),section:text(m.section,'Materiais de estudo'),category:text(m.category,'PDF'),card_ids});
  }
  return out.sort((a,b)=>a.title.localeCompare(b.title,'pt-BR'));
 };
}

export function createImageLibrary({resolveSession,getToken,fetcher=fetch}){
 const read=createReader({resolveSession,getToken,fetcher,includeMedia:true});
 return async req=>{
  const {records,media}=await read(req),active=new Map(records.filter(c=>c.active).map(c=>[c.id,c])),seen=new Set(),out=[];
  const text=(v,fallback='')=>typeof v==='string'&&v.trim()?v.trim().slice(0,300):fallback;
  for(const m of media){
   if(!m||!['image/png','image/jpeg','image/webp','image/gif'].includes(m.mimeType))continue;
   if(!idOk(m.id)||seen.has(m.id)||!idOk(m.fileId)||!/^[a-f0-9]{64}$/.test(m.sha256||'')||!Array.isArray(m.card_ids))fail();
   seen.add(m.id);
   const card_ids=[...new Set(m.card_ids.filter(id=>active.get(id)?.consolidation?.profile?.editorial?.media?.some(x=>x.id===m.id&&x.private_original)))];
   if(!card_ids.length)continue;
   const c=active.get(card_ids[0]),item=c.consolidation.profile.editorial.media.find(x=>x.id===m.id);
   out.push({id:m.id,title:text(m.title,text(item.caption,m.id)),area:text(m.area,c.discipline),subject:text(m.subject,c.subject),subsubject:text(m.subsubject,c.sub||''),description:text(m.description),card_ids});
  }
  return out.sort((a,b)=>a.title.localeCompare(b.title,'pt-BR'));
 };
}
