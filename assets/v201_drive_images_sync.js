/* Banco Mestre V201 — consulta de duas árvores de imagens do Drive, somente leitura, sem publicação automática.
 * Banco Mestre V084 — Imagens privadas do Google Drive, somente leitura.
   Descoberta por pasta após consentimento do proprietário; não publica imagens
   nem substitui os 270 registros históricos do Atlas. */
(function(){
'use strict';
if(window.BancoMestreDriveImagesV182)return;
const FOLDER_ID='1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6';
const ROOTS=[
 {id:FOLDER_ID,path:'Atlas de Imagens'},
 {id:'1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo',path:'Originais recuperados das conversas P11–P14'}
];
const INTERVAL=120000;
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const API='https://www.googleapis.com/drive/v3/files';
const MIME=new Set(['image/jpeg','image/png','image/webp','image/gif']);
const MAX_BYTES=15000000;
let access='',expires=0,oauth=null,checking=false,photos=[],visible=24;
const blobs=new Map(); // URLs somente em memória do navegador
const $=id=>document.getElementById(id);
function msg(s,error){const el=$('bm084-status');if(el){el.textContent=s;el.style.color=error?'#953b32':'#315e57';}}
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function currentToken(){return (access&&Date.now()<expires?access:'')||window.BancoMestreMediaSyncV182?.token?.()||'';}
function validToken(){return Boolean(currentToken());}
function idOf(file){return 'DRIVE-IMG-'+file.id;}
function fileLink(file){return 'https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/view';}
function title(file){return String(file.name||'Imagem').replace(/\.(png|jpe?g|webp|gif)$/i,'').replace(/_/g,' ').slice(0,170);}
function ui(){
 const host=$('imagens')?.querySelector('.panel');if(!host||$('bm084-sync'))return;
 const box=el('section','bm084-drive-images');box.id='bm084-sync';
 box.style.cssText='display:block;margin:14px 0 22px;padding:15px;border:1px solid #c9d9d5;border-radius:12px;background:#f3f8f6';
 const h=el('h3','', 'Imagens do Google Drive — sincronização');h.style.margin='0 0 8px';
 const desc=el('p','', 'Consulte as imagens do Atlas e os originais recuperados das conversas P11–P14 após autorização. Esta é uma visualização privada nesta sessão: não envia imagens ao GitHub, não cria cartões e não altera o catálogo público V198.');
 desc.style.cssText='font-size:13px;margin:0 0 10px';
 const controls=el('div','');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:9px';
 const connect=el('button','','Conectar Drive e sincronizar imagens');connect.type='button';connect.id='bm084-connect';connect.disabled=true;
 const refresh=el('button','','Verificar imagens agora');refresh.type='button';refresh.id='bm084-refresh';refresh.disabled=true;
 const folder=el('a','','Abrir pasta do Atlas no Drive');folder.href='https://drive.google.com/drive/folders/'+FOLDER_ID;folder.target='_blank';folder.rel='noopener noreferrer';
 const recovered=el('a','','Abrir originais recuperados');recovered.href='https://drive.google.com/drive/folders/'+ROOTS[1].id;recovered.target='_blank';recovered.rel='noopener noreferrer';
 const search=el('input','');search.id='bm084-search';search.type='search';search.placeholder='Buscar imagem do Drive';search.setAttribute('aria-label','Buscar imagens sincronizadas');search.style.cssText='padding:7px 10px;border:1px solid #bacdc7;border-radius:6px;max-width:230px';
 controls.append(connect,refresh,folder,recovered,search);
 const status=el('p','','Conecte sua conta para consultar as imagens desta pasta. Nenhuma imagem privada é publicada no GitHub.');
 status.id='bm084-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;margin:10px 0';
 const grid=el('div','');grid.id='bm084-grid';grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,190px),1fr));gap:12px';
 const more=el('button','','Mostrar mais imagens do Drive');more.type='button';more.id='bm084-more';more.hidden=true;more.style.marginTop='12px';
 box.append(h,desc,controls,status,grid,more);
 const after=host.querySelector('.notice')||host.querySelector('.intro');
 if(after)after.after(box);else host.prepend(box);
 connect.onclick=()=>{if(oauth)oauth.requestAccessToken({prompt:validToken()?'':'consent'});};
 refresh.onclick=()=>{void refreshList(true);};
 search.oninput=()=>{visible=24;render();};
 more.onclick=()=>{visible+=24;render();};
}
function loadGIS(){return new Promise((resolve,reject)=>{
 if(window.google?.accounts?.oauth2){resolve();return;}
 const js=document.createElement('script');js.src='https://accounts.google.com/gsi/client';js.async=true;js.onload=resolve;js.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(js);
});}
async function init(){
 ui();if(!$('bm084-sync'))return;
 try{
  const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!response.ok)throw Error('Configuração OAuth indisponível');
  const conf=await response.json();if(!conf.client_id||!conf.client_id.endsWith('.apps.googleusercontent.com'))throw Error('OAuth Client ID inválido');
  await loadGIS();
  oauth=google.accounts.oauth2.initTokenClient({client_id:conf.client_id,scope:SCOPE,callback:result=>{
   if(result.error||!result.access_token){msg('Autorização recusada; imagens anteriores preservadas.',true);return;}
   access=result.access_token;expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
   window.BancoMestreMediaSyncV182?.publishToken(access,Number(result.expires_in||3600));
   $('bm084-refresh').disabled=false;void refreshList(true);
  },error_callback:()=>msg('Não foi possível autorizar o Drive; imagens anteriores preservadas.',true)});
  $('bm084-connect').disabled=false;
  document.addEventListener('bm-media-drive-authorized',()=>{
   if(validToken()&&!checking){$('bm084-refresh').disabled=false;void refreshList(false)}
  });
  if(validToken())void refreshList(false);
  msg('Pronto. Uma conta Google autorizada pode atualizar estas imagens sem novo login. Verificação a cada 2 minutos, enquanto conectado.');
  setInterval(()=>{
   if(validToken()){void refreshList(false);return;}
   if(access){access='';$('bm084-refresh').disabled=true;msg('Sessão expirada. Reconecte para continuar a sincronização.',true);}
  },INTERVAL);
 }catch(e){msg('Sincronização indisponível: '+e.message,true);}
}
async function authorized(url){
 if(!validToken())throw Error('Conexão expirada; reconecte o Google Drive');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+currentToken()},cache:'no-store'});
 if(r.status===401)throw Error('Autorização expirada');
 if(r.status===403)throw Error('Conta conectada não possui acesso à pasta/imagem');
 if(!r.ok)throw Error('Google Drive HTTP '+r.status);
 return r;
}
async function listImages(){
 // V184: a pasta Atlas contém coleções P11–P14 em SUBPASTAS.
 // A antiga varredura consultava apenas arquivos diretamente na raiz.
 const FOLDER='application/vnd.google-apps.folder';
 const queue=ROOTS.map(x=>({...x}));
 const visited=new Set(),unique=new Map();
 let skippedSvg=0,skippedLarge=0;
 for(let offset=0;offset<queue.length;offset++){
  const folder=queue[offset];
  if(visited.has(folder.id))continue;
  visited.add(folder.id);
  if(visited.size>300)throw Error('Mais de 300 pastas no Atlas; varredura interrompida e acervo preservado');
  let next='',pages=0;
  do{
   if(++pages>20)throw Error('Pasta com paginação excessiva');
   const q=new URLSearchParams({
    q:"'"+folder.id+"' in parents and trashed = false",
    fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime)',
    pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'
   });
   if(next)q.set('pageToken',next);
   const response=await authorized(API+'?'+q.toString());
   const data=await response.json();
   for(const f of data.files||[]){
    if(!f?.id||!f.name)continue;
    if(f.mimeType===FOLDER){
     if(!visited.has(f.id))queue.push({id:f.id,path:folder.path+' / '+f.name});
     continue;
    }
    if(!/^[A-Za-z0-9_-]{15,}$/.test(f.id))continue;
    if(f.mimeType==='image/svg+xml'){skippedSvg++;continue;}
    if(!MIME.has(f.mimeType))continue;
    if(Number(f.size||0)>MAX_BYTES){skippedLarge++;continue;}
    if(!unique.has(f.id))unique.set(f.id,{...f,drivePath:folder.path});
    if(unique.size>1500)throw Error('Mais de 1500 imagens; divida o acervo antes de sincronizar');
   }
   next=data.nextPageToken||'';
  }while(next);
 }
 return {files:[...unique.values()].sort((a,b)=>
  a.drivePath.localeCompare(b.drivePath,'pt-BR')||a.name.localeCompare(b.name,'pt-BR')),
  skippedSvg,skippedLarge,folders:visited.size};
}
async function getImageUrl(file){
 const prior=blobs.get(file.id);
 if(prior&&prior.modified===file.modifiedTime)return prior.url;
 if(!validToken())throw Error('Reconecte o Drive para abrir a imagem');
 const r=await authorized(API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const blob=await r.blob();if(!MIME.has(blob.type))throw Error('Formato não suportado');if(blob.size>MAX_BYTES)throw Error('Imagem maior que 15 MB');
 const url=URL.createObjectURL(blob);
 if(prior)URL.revokeObjectURL(prior.url);
 blobs.set(file.id,{url,modified:file.modifiedTime});
 return url;
}
async function openImage(file){
 try{
  msg('Abrindo imagem '+title(file)+'...');
  const src=await getImageUrl(file);
  const image=new Image();image.src=src;await image.decode();
  if(typeof BancoMestreEditorV030?.open==='function'){
   await BancoMestreEditorV030.open({image,imageId:idOf(file),title:title(file),
    quality:'Arquivo original autenticado do Google Drive — '+file.mimeType,
    sourceUrl:fileLink(file),
    warning:'Grifos deste ID são salvos apenas neste navegador. O Drive e os IDs dos registros existentes permanecem intactos.'});
  }else window.open(src,'_blank','noopener,noreferrer');
  msg('Imagem aberta. Marcações locais preservadas pelo ID '+idOf(file)+'.');
 }catch(e){msg('Não foi possível abrir: '+e.message+'. Use Original no Drive.',true);}
}
function loadPreview(img,file){
 if(!validToken())return;
 getImageUrl(file).then(url=>{if(img.isConnected)img.src=url;}).catch(()=>{if(img.isConnected)img.alt='Prévia indisponível. Abra no Drive.';});
}
function render(){
 const grid=$('bm084-grid');if(!grid)return;grid.replaceChildren();
 const q=($('bm084-search')?.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const items=photos.filter(f=>(window.BM197MediaLinks?.matchesDrive?.(f)!==false)&&(String(f.id||'')+' '+String(f.name||'')+' '+String(f.drivePath||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));
 for(const file of items.slice(0,visible)){
  const card=el('article','');card.style.cssText='background:white;border:1px solid #d5e2dd;border-radius:9px;padding:10px;min-width:0';
  const pic=el('img','');pic.loading='lazy';pic.alt='Prévia de '+title(file);pic.style.cssText='width:100%;height:140px;object-fit:contain;background:#f8faf8;border-radius:5px;cursor:zoom-in';
  pic.onclick=()=>{void openImage(file)};
  const h=el('h4','',title(file));h.style.cssText='font-size:13px;line-height:1.3;margin:7px 0;overflow-wrap:anywhere';
  const id=el('small','',idOf(file));id.style.cssText='display:block;color:#52656a;font-size:10px;overflow-wrap:anywhere';
  const actions=el('div','');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';
  const open=el('button','','Abrir e grifar');open.type='button';open.style.fontSize='12px';open.onclick=()=>{void openImage(file)};
  const link=el('a','','Original no Drive');link.href=fileLink(file);link.target='_blank';link.rel='noopener noreferrer';link.style.fontSize='12px';
  actions.append(open,link);
   const location=el('small','',file.drivePath||'Atlas');location.style.cssText='display:block;font-size:10px;color:#657a7b;margin-top:4px';
   card.append(pic,h,id,location,actions);window.BM197MediaLinks?.decorateDrive?.(card,file);grid.append(card);
  loadPreview(pic,file);
 }
 const more=$('bm084-more');if(more)more.hidden=items.length<=visible;
}
async function refreshList(force){
 if(checking)return;if(!validToken()){msg('Conecte sua conta Google para sincronizar imagens.',true);return;}
 checking=true;const button=$('bm084-refresh');if(button)button.disabled=true;
 try{
  msg('Consultando Atlas e originais recuperados no Drive autorizado…');
  const {files:incoming,skippedSvg,skippedLarge,folders}=await listImages();
  const old=new Map(photos.map(x=>[x.id,x.modifiedTime]));
  const current=new Set(incoming.map(x=>x.id));
  let newCount=incoming.filter(x=>!old.has(x.id)).length;
  let edits=incoming.filter(x=>old.has(x.id)&&old.get(x.id)!==x.modifiedTime).length;
  for(const [id,data] of blobs)if(!current.has(id)||incoming.find(x=>x.id===id)?.modifiedTime!==data.modified){URL.revokeObjectURL(data.url);blobs.delete(id);}
  photos=incoming;
  render();
  msg('Consulta do Drive concluída nesta sessão: '+photos.length+' imagem(ns) JPEG/PNG/WebP/GIF em '+folders+' pastas do Atlas e originais recuperados; '+newCount+' adicionada(s), '+edits+' atualizada(s) na lista privada. '+skippedSvg+' arquivo(s) SVG e '+skippedLarge+' arquivo(s) acima de 15 MB não são pré-visualizados. Catálogo público e cartões não foram publicados/alterados.');
  return {found:photos.length,added:newCount,updated:edits,skippedSvg,skippedLarge,folders,scope:'session_only'};
 }catch(e){msg('Falha na sincronização: '+e.message+'. Imagens carregadas anteriormente preservadas.',true);return null;}
 finally{checking=false;if(button&&validToken())button.disabled=false;}
}
window.BancoMestreDriveImagesV182=Object.freeze({refresh:()=>refreshList(true),get connected(){return validToken()},syncVersion:'V201',get roots(){return ROOTS.map(x=>x.path)},get lastCount(){return photos.length}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();