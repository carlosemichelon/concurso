import {createHash} from 'node:crypto';
import {createReader} from './catalog.mjs';
const API='https://www.googleapis.com/drive/v3/files',PROJECT='bm-portal-multi-v1';
const idOk=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const types=new Set(['image/png','image/jpeg','image/webp','image/gif','application/pdf']);
const fail=()=>{throw Error('Mídia privada indisponível')};
export function createMediaReader({resolveSession,getToken,fetcher=fetch}){
 const read=createReader({resolveSession,getToken,fetcher,includeMedia:true});
 return async(req,cardId,mediaId)=>{
  if(!/^CARD-\d{4,12}$/.test(cardId)||!idOk(mediaId))fail();
  const s=await resolveSession(req);if(!s)fail();
  const {records,media}=await read(req),card=records.find(c=>c.id===cardId&&c.active);
  const links=media.filter(m=>m?.id===mediaId&&Array.isArray(m.card_ids)&&m.card_ids.includes(cardId));
  if(!card||links.length!==1)fail();
  const link=links[0];if(!idOk(link.fileId)||!types.has(link.mimeType)||!/^[a-f0-9]{64}$/.test(link.sha256||''))fail();
  if(link.mimeType!=='application/pdf'&&!card.consolidation?.profile?.editorial?.media?.some(m=>m.id===mediaId&&m.private_original))fail();
  const live=async()=>{const t=await resolveSession(req);if(!t||['subject','rootId','profileId','sessionId'].some(k=>t[k]!==s[k]))fail()};
  const {token}=await getToken();if(!token)fail();
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
