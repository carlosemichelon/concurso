/* Banco Mestre V182 — verificador central de versões de mídia do Drive.
 * Guarda apenas token OAuth temporário em memória e metadados locais mínimos.
 * Não altera PDFs/imagens do Drive nem transfere marcações entre revisões. */
(function(){
'use strict';
if(window.BancoMestreMediaSyncV182)return;
const API='https://www.googleapis.com/drive/v3/files/';
const ID=/^[A-Za-z0-9_-]{15,}$/;
const TTL=45000,MAX_SCAN=90;
let access='',expires=0,queued=false,running=false,lastReport=null;
const pending=new Map();
const checked=new Map();
const $=id=>document.getElementById(id);
function token(){return access&&Date.now()<expires?access:''}
function publishToken(t,seconds){
 if(typeof t!=='string'||t.length<10)return false;
 access=t;expires=Date.now()+Math.max(10,Number(seconds||3600)-90)*1000;
 document.dispatchEvent(new CustomEvent('bm-media-drive-authorized'));
 if(queued){queued=false;void syncAll();}
 else{void refreshVisibleImages(false);}
 return true;
}
function status(s,error=false){
 for(const id of ['bm182-status-pdf','bm182-status-img']){
  const el=$(id);if(el){el.textContent=s;el.style.color=error?'#9b4238':'#436469'}
 }
}
async function metadata(fileId,force=false){
 if(!ID.test(String(fileId||'')))throw Error('ID de arquivo inválido');
 const auth=token();if(!auth)throw Error('Conecte o Google Drive');
 const cached=checked.get(fileId);
 if(!force&&cached&&cached.expires>Date.now())return cached.value;
 if(pending.has(fileId))return pending.get(fileId);
 const job=(async()=>{
  const fields='id,mimeType,name,size,version,modifiedTime,md5Checksum,trashed';
  const response=await fetch(API+encodeURIComponent(fileId)+'?fields='+fields+'&supportsAllDrives=true',{
   headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(response.status===401){access='';expires=0;throw Error('Autorização Google expirada')}
  if(response.status===403||response.status===404)throw Error('Arquivo inacessível nesta conta');
  if(!response.ok)throw Error('Google Drive HTTP '+response.status);
  const m=await response.json();
  if(m.id!==fileId||m.trashed===true)throw Error('Arquivo removido ou ID divergente');
  const out={id:fileId,mimeType:String(m.mimeType||''),size:String(m.size||''),version:String(m.version||''),
    modifiedTime:String(m.modifiedTime||''),md5Checksum:String(m.md5Checksum||'')};
  checked.set(fileId,{value:out,expires:Date.now()+TTL});
  return out;
 })().finally(()=>pending.delete(fileId));
 pending.set(fileId,job);return job;
}
function same(a,b){return !!a&&!!b&&a.id===b.id&&a.mimeType===b.mimeType&&a.size===b.size&&
 a.version===b.version&&a.modifiedTime===b.modifiedTime&&a.md5Checksum===b.md5Checksum}
function fileIdFromUrl(value){
 try{
  const u=new URL(value,location.href);
  if(u.hostname==='drive.google.com'&&(u.pathname==='/thumbnail'||u.pathname==='/uc'))return u.searchParams.get('id');
  if(u.hostname==='drive.google.com'){const m=u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{15,})\//);if(m)return m[1];}
  if(u.hostname==='lh3.googleusercontent.com'){const m=u.pathname.match(/^\/d\/([A-Za-z0-9_-]{15,})(?:\/|$)/);if(m)return m[1]}
 }catch(_){}
 return null;
}
function taggedUrl(value,revision){
 try{
  const u=new URL(value,location.href);
  if(!['drive.google.com','lh3.googleusercontent.com'].includes(u.hostname))return null;
  if(!/^https:$/.test(u.protocol))return null;
  if(u.searchParams.get('bmv')===revision)return null;
  u.searchParams.set('bmv',revision);
  return u.href;
 }catch(_){return null}
}
function revision(m){
 return (m.md5Checksum||m.version||m.modifiedTime||m.size).replace(/[^A-Za-z0-9_.:-]/g,'').slice(0,70);
}
function imageCandidates(force=false){
 const host=document.getElementById('imagens');
 if(!host)return [];
 const found=[],seen=new Set();
 for(const img of host.querySelectorAll('img[src]')){
  if(!img.isConnected||!img.getClientRects().length||img.src.startsWith('blob:'))continue;
  if(!force){const rect=img.getBoundingClientRect(),h=window.innerHeight||800;
   if(rect.bottom < -h||rect.top > h*2)continue; }
  const id=img.dataset.bmMediaId||fileIdFromUrl(img.src);
  if(!id||!ID.test(id)||seen.has(img))continue;
  seen.add(img);found.push({img,id});
  if(found.length>=MAX_SCAN)break;
 }
 return found;
}
async function refreshVisibleImages(force=false){
 if(!token())return {checked:0,updated:0,unavailable:0};
 const list=imageCandidates(force);let pos=0,done=0,updated=0,unavailable=0;
 const worker=async()=>{while(pos<list.length){
  const item=list[pos++],img=item.img;
  try{
   const m=await metadata(item.id,force);
   if(!m.mimeType.startsWith('image/')){unavailable++;continue}
   const rev=revision(m);
   if(!rev)continue;
   const next=taggedUrl(img.src,rev);
   if(next&&img.isConnected){img.dataset.bmMediaId=item.id;img.src=next;updated++}
   done++;
  }catch(_){unavailable++}
 }};
 await Promise.all(Array.from({length:Math.min(4,list.length)},worker));
 return {checked:done,updated,unavailable,limited:list.length===MAX_SCAN};
}
async function syncAll(){
 if(running)return lastReport;
 if(!token()){
  queued=true;status('Conecte o Google Drive para verificar PDFs e imagens.');
  const rd=window.BancoMestreDriveV042;
  if(rd?.ready&&typeof rd.authorize==='function')rd.authorize();
  else{queued=false;status('Conexão Google ainda não pronta. Use Conectar Drive no leitor de PDFs.',true)}
  return null;
 }
 running=true;status('Conferindo os PDFs e as miniaturas disponíveis nesta sessão…');
 const results=await Promise.allSettled([
  window.BancoMestrePDFSyncV130?.refresh?.()??Promise.resolve(null),
  window.BancoMestreDriveImagesV182?.refresh?.()??Promise.resolve(null),
  refreshVisibleImages(true)
 ]);
 const pdf=results[0].status==='fulfilled'?results[0].value:null;
 const imgs=results[1].status==='fulfilled'?results[1].value:null;
 const vis=results[2].status==='fulfilled'?results[2].value:null;
 lastReport={pdf,img:imgs,visible:vis,at:new Date().toISOString()};
 const fails=results.filter(x=>x.status==='rejected').length;
 status('Conferência concluída: '+(pdf?.found??'—')+' PDFs localizados; '+(imgs?.found??'—')+
  ' imagens na pasta Atlas; '+(vis?.checked??0)+' miniaturas verificadas.'+
  (fails?' Algumas consultas não concluíram; originais preservados.':''));
 running=false;return lastReport;
}
function addControl(host,id){
 if(!host||$(id))return;
 const bar=document.createElement('div');
 bar.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 0';
 const btn=document.createElement('button');btn.type='button';btn.textContent='Conferir atualizações no Drive';
 btn.onclick=()=>{void syncAll()};
 const txt=document.createElement('span');txt.id=id;txt.style.cssText='font-size:12px;color:#436469';
 txt.textContent='As versões são conferidas ao abrir PDFs; imagens visíveis, após conectar a conta.';
 bar.append(btn,txt);host.prepend(bar);
}
function init(){
 addControl(document.querySelector('#pdfs .panel'),'bm182-status-pdf');
 addControl(document.querySelector('#imagens .panel'),'bm182-status-img');
 const images=document.getElementById('imagens');
 if(images&&typeof MutationObserver!=='undefined'){
  let scheduled=0;
  const queue=()=>{if(!token()||scheduled)return;scheduled=setTimeout(()=>{
   scheduled=0;void refreshVisibleImages(false);
  },500);};
  const observer=new MutationObserver(records=>{
   if(records.some(r=>r.type==='childList'||r.attributeName==='src'||r.attributeName==='hidden'||r.attributeName==='class'))queue();
  });
  observer.observe(images,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class','hidden']});
  window.addEventListener('scroll',queue,{passive:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BancoMestreMediaSyncV182=Object.freeze({token,publishToken,metadata,same,refreshVisibleImages,syncAll,get lastReport(){return lastReport}});
})();
