/* VS28 — sinalizações privadas, sem excluir ou mover imagens. */
(()=>{'use strict';
const KEY='BM419_IMAGE_FLAGS_V1',FMT='BancoMestreSinalizacaoImagemV1',FOLDER='07 – Atlas de Imagens (sincronização)',API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const valid=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{15,200}$/.test(id);
const evValid=r=>r&&r.format===FMT&&valid(r.fileId)&&/^[a-z0-9-]{36}$/i.test(r.eventId)&&['solicitada','cancelada'].includes(r.state)&&Number.isFinite(Date.parse(r.at));
let events={},bad=false;try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');if(!raw||Array.isArray(raw)||typeof raw!=='object'||Object.values(raw).some(r=>!evValid(r)))throw Error('Registro local inválido');events=raw}catch(e){bad=true}
let inFlight=null,folderCache=null,lastError='',buttons=new Set();
function persist(next){if(bad)throw Error('Registro local inválido; preservado para recuperação.');localStorage.setItem(KEY,JSON.stringify(next));events=next}
function newest(fileId){return Object.values(events).filter(x=>x.fileId===fileId).sort((a,b)=>b.at.localeCompare(a.at)||b.eventId.localeCompare(a.eventId))[0]}
function auth(){return window.BM239DriveGlobal?.writeToken?.()||''}
function checkAuth(t){if(!t||auth()!==t)throw Error('Conexão de escrita do Drive indisponível ou alterada.')}
async function req(url,t,options={}){checkAuth(t);const r=await fetch(url,{...options,headers:{Authorization:'Bearer '+t,...options.headers},cache:'no-store'});if(!r.ok)throw Error('Drive HTTP '+r.status);return r.json()}
const query=(q,fields,pageToken='')=>API+'?'+new URLSearchParams({q,fields,pageSize:'100',...(pageToken?{pageToken}:{})});
async function list(q,fields,t){let a=[],p='';do{const r=await req(query(q,'nextPageToken,files('+fields+')',p),t);a.push(...(r.files||[]));p=r.nextPageToken||''}while(p);return a}
async function folder(t){if(folderCache?.t===t)return folderCache.id;const rows=await list("name = '"+FOLDER+"' and mimeType = 'application/vnd.google-apps.folder' and trashed = false","id,name,capabilities(canAddChildren),shared",t);if(rows.length!==1||rows[0].shared!==false||!rows[0].capabilities?.canAddChildren)throw Error('Pasta Atlas privada e gravável não confirmada.');folderCache={t,id:rows[0].id};return folderCache.id}
function fileName(r){return 'BM419_SINALIZACAO_'+r.eventId+'.json'}
async function putEvent(r,dir,t){const name=fileName(r),q="'"+dir+"' in parents and name = '"+name+"' and trashed = false";let found=await list(q,'id,name,appProperties,parents',t);if(found.length>1)throw Error('Sinalização duplicada; registro local preservado.');
 if(!found.length){const doc={format:FMT,eventId:r.eventId,fileId:r.fileId,title:r.title,state:r.state,at:r.at};const boundary='bm419_'+r.eventId;const meta={name,mimeType:'application/json',parents:[dir],appProperties:{bm_format:FMT,bm_event:r.eventId,bm_image:r.fileId,bm_state:r.state,bm_at:r.at}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(doc)+'\r\n--'+boundary+'--';
 const result=await req(UPLOAD+'?uploadType=multipart&fields=id',t,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});found=[result]}
 const f=found[0];const data=await req(API+'/'+encodeURIComponent(f.id)+'?alt=media',t);if(!evValid(data)||data.eventId!==r.eventId||data.fileId!==r.fileId||data.state!==r.state||data.at!==r.at)throw Error('Conteúdo da sinalização não conferido.');return f.id}
function refresh(){for(const b of buttons){if(!b.parentElement){buttons.delete(b);continue}const r=newest(b.dataset.bm419Image);const marked=r?.state==='solicitada';b.textContent=marked?'Cancelar sinalização':'Sinalizar para exclusão';b.setAttribute('aria-pressed',String(marked));const status=b.nextElementSibling;if(status?.classList.contains('bm419-flag-status'))status.textContent=r?(marked?'Exclusão solicitada':'Sinalização cancelada')+' · '+(r.synced?'Drive confirmado':lastError?'Pendente: '+lastError:'Pendente de Drive'):''}}
async function sync({pull=false}={}){if(inFlight)return inFlight;const t=auth();if(!t){lastError='conecte o Drive';refresh();return false}if(!pull&&!Object.values(events).some(r=>!r.synced))return true;
 inFlight=(async()=>{try{lastError='';const dir=await folder(t);
 if(pull){const rows=await list("'"+dir+"' in parents and trashed = false and appProperties has { key='bm_format' and value='"+FMT+"' }",'id,appProperties',t);const next={...events};for(const f of rows){const a=f.appProperties||{};const r={format:FMT,eventId:a.bm_event,fileId:a.bm_image,state:a.bm_state,at:a.bm_at,title:'',synced:true,driveFileId:f.id};if(evValid(r)&&!next[r.eventId])next[r.eventId]=r}persist(next)}
 for(let r;(r=Object.values(events).find(x=>!x.synced));){const id=await putEvent(r,dir,t);persist({...events,[r.eventId]:{...r,synced:true,driveFileId:id}})}
 refresh();return true}catch(e){lastError=e.message;refresh();return false}finally{inFlight=null}})();return inFlight}
function toggle(file){if(!valid(file?.id))return;try{const prev=newest(file.id),r={format:FMT,eventId:crypto.randomUUID(),fileId:file.id,title:String(file.name||file.title||'').slice(0,300),state:prev?.state==='solicitada'?'cancelada':'solicitada',at:new Date().toISOString(),synced:false};persist({...events,[r.eventId]:r});lastError='';refresh();void sync()}catch(e){alert('Não foi possível registrar: '+e.message)}}
function attach(host,file){if(!host||!valid(file?.id))return;if(host.querySelector(':scope > .bm419-flag'))return;const b=document.createElement('button');b.type='button';b.className='bm419-flag';b.dataset.bm419Image=file.id;b.onclick=e=>{e.preventDefault();e.stopPropagation();toggle(file)};const s=document.createElement('small');s.className='bm419-flag-status';s.setAttribute('role','status');host.append(b,s);buttons.add(b);refresh();queueMicrotask(()=>{if(!b.isConnected)buttons.delete(b)})}
function openEditor(file){const host=document.getElementById('bm419-image-flag');if(!host)return;host.replaceChildren();if(file&&valid(file.id))attach(host,file)}
document.addEventListener('bm239-sync-finished',()=>{void sync({pull:true})});
window.BM419ImageFlags=Object.freeze({attach,openEditor,sync,get pending(){return Object.values(events).filter(x=>!x.synced).length}});
})();