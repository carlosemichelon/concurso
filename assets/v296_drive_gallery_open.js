/* V296: links para gerenciar/excluir no Drive, sem permissão de exclusão no portal. */
/* V228: editor completo de informações acionado em cada original Drive. */
/* V218: nomes legíveis, classificação existente por ID e pendências explícitas. */
/* V217: pasta Drive é a fonte de imagens; nenhuma dependência de catálogo de mídia publicado. */
/* V215: galeria usa a autorização única do leitor, preservando layout da V1. */
/* Banco Mestre V213 — Drive como fonte visual principal, sem publicar fotos no GitHub.
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
const SVG='image/svg+xml';
const PREVIEW_MIME=new Set([...MIME,SVG]);
let alreadyPublic=0,expandedOnce=false;
const MAX_BYTES=15000000;
const CONTRACT='assets/v202_storage_contract.json?v=202';
let contractReady=false;
async function assertPaths(){
 const response=await fetch(CONTRACT,{cache:'no-store'});
 if(!response.ok)throw Error('Contrato de pastas indisponível; consulta de imagens bloqueada');
 const c=await response.json();
 const read=c.runtime_scan_roots?.images;
 if(c.schema!=='BancoMestreStorageContractV202'||c.canonical_write_destinations?.images?.folder_id!==FOLDER_ID||
 !Array.isArray(read)||read.length!==ROOTS.length||ROOTS.some((x,i)=>x.id!==read[i]))
  throw Error('Pastas de imagens divergentes entre portal e contrato. Nenhuma lista será substituída.');
 contractReady=true;return c;
}
let access='',expires=0,oauth=null,checking=false,photos=[],visible=24;
let lastGoodAt=0,lastAttemptAt=0,lastSyncError='';
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const blobs=new Map(); // URLs somente em memória do navegador
const $=id=>document.getElementById(id);
function msg(s,error){const el=$('bm084-status');if(el){el.textContent=s;el.style.color=error?'#953b32':'#315e57';}}
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function currentToken(){return (access&&Date.now()<expires?access:'')||window.BancoMestreMediaSyncV182?.token?.()||'';}
function validToken(){return Boolean(currentToken());}
function idOf(file){return 'DRIVE-IMG-'+file.id;}
function fileLink(file){return 'https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/view';}
function info(file){return window.BM228DriveImageEditor?.meta?.(file)||window.BM218ImageMetadata?.resolve?.(file)||{displayTitle:String(file.name||'Imagem').replace(/\.(png|jpe?g|webp|gif|svg)$/i,'').replace(/_/g,' '),fileName:file.name||'',area:'',subject:'',subsubject:'',group:'',cards:[],classified:false,status:'Assunto ainda não classificado',location:file.drivePath||''};}
function title(file){return info(file).displayTitle;}
function moveToAtlas(box){
 const dir=$('bm153Directory');if(!dir)return false;
 const heading=dir.querySelector('.bm153Heading');
 if(heading)heading.after(box);else dir.prepend(box);
 return true;
}
function ui(){
 const host=$('imagens')?.querySelector('.panel');if(!host||$('bm084-sync'))return;
 const box=el('details','bm153Group bm205DriveGroup');box.id='bm084-sync';
 const summary=el('summary','bm205DriveSummary');summary.id='bm205-drive-summary';
 const title=el('strong','','Google Drive · imagens novas no Atlas');
 const badge=el('span','','Conecte o Drive');badge.id='bm205-drive-count';
 summary.append(title,badge);
 const body=el('div','bm153GroupBody bm205DriveBody');
 const help=el('p','','Originais das pastas autorizadas do Drive. Para excluir uma imagem, clique em Abrir no Drive e escolha Mover para a lixeira no Google Drive. Nenhum original é publicado no GitHub.');
 help.style.cssText='font-size:12px;margin:0 0 9px;color:#526c6a';
 const controls=el('div','');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:7px';
 const connect=el('button','','Conectar Drive');connect.type='button';connect.id='bm084-connect';connect.disabled=true;
 const refresh=el('button','','Atualizar imagens');refresh.type='button';refresh.id='bm084-refresh';refresh.disabled=true;
 const folder=el('a','','Pasta oficial');folder.href='https://drive.google.com/drive/folders/'+FOLDER_ID;folder.target='_blank';folder.rel='noopener noreferrer';
 const recovered=el('a','','Originais históricos');recovered.href='https://drive.google.com/drive/folders/'+ROOTS[1].id;recovered.target='_blank';recovered.rel='noopener noreferrer';
 const search=el('input','');search.id='bm084-search';search.type='search';search.placeholder='Filtrar imagens do Drive';search.setAttribute('aria-label','Buscar imagens autenticadas no Atlas');search.style.cssText='padding:7px 9px;border:1px solid #bacdc7;border-radius:6px;max-width:210px';
 controls.append(connect,refresh,folder,recovered,search);
 const status=el('p','','Aguardando conexão. As imagens públicas continuam disponíveis.');
 const syncTime=el('small','','Nenhuma consulta autorizada nesta sessão.');syncTime.id='bm207-sync-time';syncTime.style.cssText='display:block;font-size:11px;color:#516a68;margin:4px 0 9px';status.id='bm084-status';status.setAttribute('role','status');status.style.cssText='font-size:12px;margin:9px 0';
 const grid=el('div','');grid.id='bm084-grid';grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,180px),1fr));gap:10px';
 const more=el('button','','Mostrar mais imagens');more.type='button';more.id='bm084-more';more.hidden=true;more.style.marginTop='10px';
 body.append(help,controls,status,syncTime,grid,more);box.append(summary,body);
 if(!moveToAtlas(box)){
  host.append(box);
  const observer=new MutationObserver(()=>{if(moveToAtlas(box))observer.disconnect()});
  observer.observe(host,{childList:true,subtree:true});
 }
 connect.onclick=()=>{
  if(validToken()){void refreshList(true);return;}
  if(window.BancoMestreDriveV042?.ready){window.BancoMestreDriveV042.authorize();return;}
  msg('Conexão Google ainda não está pronta. Tente novamente.',true);
 }; // V215: uma autorização compartilhada pelo leitor Drive; sem popup próprio por imagem.
 refresh.onclick=()=>{void refreshList(true);};
 search.oninput=()=>{visible=24;render();};
 more.onclick=()=>{visible+=24;render();};
 $('imageSearch')?.addEventListener('input',()=>{visible=24;render()});
 document.addEventListener('bm218-image-filter-change',()=>{visible=24;render();});
 document.addEventListener('bm153-drive-filter-change',()=>{visible=24;render();});
 for(const id of ['imageFilter','imageAreaV044','bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'])
  $(id)?.addEventListener('change',()=>{visible=24;render()});
}
function loadGIS(){return new Promise((resolve,reject)=>{
 if(window.google?.accounts?.oauth2){resolve();return;}
 const js=document.createElement('script');js.src='https://accounts.google.com/gsi/client';js.async=true;js.onload=resolve;js.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(js);
});}
async function init(){
 ui();if(!$('bm084-sync'))return;
 try{
  await assertPaths();
  await window.BM218ImageMetadata?.load?.(); // Metadados textuais, sem arquivos de imagem do GitHub.
  const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!response.ok)throw Error('Configuração OAuth indisponível');
  const conf=await response.json();if(!conf.client_id||!conf.client_id.endsWith('.apps.googleusercontent.com'))throw Error('OAuth Client ID inválido');
   if(conf.authorized_javascript_origin&&location.origin!==conf.authorized_javascript_origin)throw Error('Origem divergente da registrada no OAuth: '+location.origin);
  await loadGIS();
  oauth=google.accounts.oauth2.initTokenClient({client_id:conf.client_id,scope:SCOPE,callback:result=>{
   if(result.error||!result.access_token){lastSyncError=String(result.error_description||result.error||'sem token');msg('Autorização Google não concluída: '+lastSyncError+'. Verifique permissões e origem OAuth; imagens preservadas.',true);return;}
   access=result.access_token;expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
   window.BancoMestreMediaSyncV182?.publishToken(access,Number(result.expires_in||3600));
   $('bm084-refresh').disabled=false;void refreshList(true);
  },error_callback:e=>{lastSyncError=String(e?.message||e?.type||e?.error||'janela de acesso bloqueada');msg('Falha ao autorizar o Drive: '+lastSyncError+'. Se aparecer origin_mismatch, cadastre https://carlosemichelon.github.io no Google Cloud.',true);}});
  $('bm084-connect').disabled=false;
  document.addEventListener('bm-media-drive-authorized',()=>{
   if(validToken()&&!checking){$('bm084-refresh').disabled=false;const button=$('bm084-connect');if(button)button.textContent='Drive conectado';void refreshList(false)}
  });
  if(validToken())void refreshList(false);
  else msg('Conecte o Drive uma vez ao abrir o site para consultar imagens e PDFs sem autorizar cada arquivo.');
  const resume=()=>{if(!document.hidden&&validToken()&&Date.now()-lastAttemptAt>12000)void refreshList(false)};
  document.addEventListener('visibilitychange',resume);
  window.addEventListener('focus',resume);
  window.addEventListener('online',resume);
  setInterval(()=>{
   if(validToken()){if(!document.hidden)void refreshList(false);return;}
   if(access||photos.length||blobs.size){
   access='';expires=0;
   for(const data of blobs.values())URL.revokeObjectURL(data.url);
   blobs.clear();photos=[];alreadyPublic=0;
   if($('bm084-refresh'))$('bm084-refresh').disabled=true;
   render();
   msg('Sessão expirada. Pré-visualizações privadas foram retiradas desta página; reconecte para consultar o Drive.',true);
  }
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
function historicalDriveIds(){
 // Metadados opcionais de vínculos dos cartões; não impedem novas imagens no Drive.
 const ids=new Set();
 if(typeof imgs!=='undefined'&&Array.isArray(imgs)){
  for(const item of imgs){
   const id=item.driveFileId;
   if(typeof id==='string'&&/^[A-Za-z0-9_-]{15,}$/.test(id))ids.add(id);
  }
 }
 return ids;
}
async function listImages(){
 if(!contractReady)await assertPaths();
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
    if(!PREVIEW_MIME.has(f.mimeType))continue;
    if(f.mimeType===SVG)skippedSvg++;
    if(Number(f.size||0)>MAX_BYTES){skippedLarge++;continue;}
    if(!unique.has(f.id))unique.set(f.id,{...f,drivePath:folder.path});
    if(unique.size>1500)throw Error('Mais de 1500 imagens; divida o acervo antes de sincronizar');
   }
   next=data.nextPageToken||'';
  }while(next);
 }
 const publicIds=historicalDriveIds();
 const allFiles=[...unique.values()]; // A fonte é o Drive: não descartar as imagens já catalogadas no site.
 return {files:allFiles.sort((a,b)=>
  a.drivePath.localeCompare(b.drivePath,'pt-BR')||a.name.localeCompare(b.name,'pt-BR')),
  alreadyPublic:[...unique.keys()].filter(id=>publicIds.has(id)).length,
  skippedSvg,skippedLarge,folders:visited.size};
}
/* A resposta alt=media pode chegar como application/octet-stream ou text/plain.
 * SVG é verificado e exibido como imagem, sem injetar HTML no documento.
 */
async function safeSvgPreview(raw){
 const xmlText=await raw.text();
 const doc=new DOMParser().parseFromString(xmlText,'image/svg+xml');
 const root=doc.documentElement;
 if(!root||String(root.localName||'').toLowerCase()!=='svg'||doc.querySelector('parsererror'))
  throw Error('Arquivo SVG inválido ou não é um desenho SVG');
 const banned=new Set(['script','foreignobject','iframe','object','embed','audio','video','animate','animatemotion','animatetransform','set']);
 for(const node of [root,...root.querySelectorAll('*')]){
  const tag=String(node.localName||'').toLowerCase();
  if(banned.has(tag)){node.remove();continue;}
  if(tag==='style'){
   node.textContent=String(node.textContent||'')
    .replace(/@import[^;]*;/gi,'')
    .replace(/url\(\s*(?!['"]?#)[^)]*\)/gi,'none');
  }
  for(const attr of [...node.attributes]){
   const name=attr.name.toLowerCase(),value=attr.value.trim();
   const internalRef=value.startsWith('#')||
     /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(value);
   if(name.startsWith('on')||/javascript:/i.test(value)||
      ((name==='href'||name==='xlink:href')&&!internalRef)||
      /@import/i.test(value)||
      /url\(\s*(?!['"]?#)[^)]*\)/i.test(value))node.removeAttribute(attr.name);
  }
 }
 const xml=new XMLSerializer().serializeToString(root);
 return new Blob([xml],{type:SVG});
}
async function getImageUrl(file){
 if(!validToken())throw Error('Reconecte o Drive para abrir a imagem');
 const prior=blobs.get(file.id);
 if(prior&&prior.modified===file.modifiedTime)return prior.url;
 if(!PREVIEW_MIME.has(file.mimeType))throw Error('Formato não suportado nesta imagem');
 const r=await authorized(API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const blob=await r.blob();
 if(blob.size>MAX_BYTES)throw Error('Imagem maior que 15 MB');
 const contentType=String(blob.type||'').toLowerCase();
 const compatible=contentType===file.mimeType||!contentType||
   contentType==='application/octet-stream'||
   (file.mimeType===SVG&&['text/plain','text/xml','application/xml'].includes(contentType));
 if(!compatible)throw Error('Conteúdo diferente do arquivo do Drive ('+contentType+')');
 const previewBlob=file.mimeType===SVG?await safeSvgPreview(blob):
  (contentType===file.mimeType?blob:new Blob([blob],{type:file.mimeType}));
 const url=URL.createObjectURL(previewBlob);
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
 getImageUrl(file).then(url=>{if(img.isConnected)img.src=url;}).catch(e=>{
  if(img.isConnected){img.alt='Prévia indisponível: '+e.message;img.title=e.message+' · Abrir original no Drive';}
 });
}
function syncMetaFilters(){
 const area=$('bm218-area-filter'),subject=$('bm218-subject-filter');
 if(!area||!subject)return;
 const metas=photos.map(info);
 const areas=[...new Set(metas.filter(m=>m.classified&&m.area).map(m=>m.area))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const selectedArea=area.value,selectedSubject=subject.value;
 area.replaceChildren(new Option('Todas as disciplinas','all'),...areas.map(x=>new Option(x,x)));
 if(areas.includes(selectedArea))area.value=selectedArea;
 const subjects=[...new Set(metas.filter(m=>m.classified&&m.subject&&(area.value==='all'||m.area===area.value)).map(m=>m.subject))]
  .sort((a,b)=>a.localeCompare(b,'pt-BR'));
 subject.replaceChildren(new Option('Todos os assuntos','all'),...subjects.map(x=>new Option(x,x)));
 if(subjects.includes(selectedSubject))subject.value=selectedSubject;
}
function legacyFilterMatch(m){
 // Never compare public Atlas classification IDs with Drive metadata labels.
 return window.BM153ImageLibrary?.driveMatches?.(m)!==false;
}
function render(){
 const grid=$('bm084-grid');if(!grid)return;grid.replaceChildren();
 if(lastGoodAt||photos.length)window.BM153ImageLibrary?.setDriveRecords?.(photos.map(info));
 syncMetaFilters();
 const q=normalize($('bm084-search')?.value||''),mainQuery=normalize($('imageSearch')?.value||'');
 const selectedArea=$('bm218-area-filter')?.value||'all';
 const selectedSubject=$('bm218-subject-filter')?.value||'all';
 const selectedStatus=$('bm218-status-filter')?.value||'all';
 const onlyFavorites=$('imageFavoriteV055')?.value==='favorites';
 const items=photos.filter(f=>{
  const m=info(f);
  if(onlyFavorites)return false;
  if(selectedArea!=='all'&&m.area!==selectedArea)return false;
  if(selectedSubject!=='all'&&m.subject!==selectedSubject)return false;
  if(selectedStatus==='classified'&&!m.classified)return false;
  if(selectedStatus==='pending'&&m.classified)return false;
  if(!legacyFilterMatch(m))return false;
  if(window.BM197MediaLinks?.matchesDrive?.(f)===false)return false;
  const hay=normalize([f.id,f.name,f.drivePath,idOf(f),m.displayTitle,m.area,m.subject,m.subsubject,m.detail,m.description,m.note,...m.cards].join(' '));
  return hay.includes(q)&&hay.includes(mainQuery);
 });
 for(const file of items.slice(0,visible)){
  const m=info(file);
  const card=el('article','');
  card.style.cssText='background:white;border:1px solid #d5e2dd;border-radius:9px;padding:10px;min-width:0';
  card.dataset.bm218Classified=String(m.classified);
  const pic=el('img','');
  pic.loading='lazy';pic.alt='Prévia de '+m.displayTitle;
  pic.style.cssText='width:100%;height:140px;object-fit:contain;background:#f8faf8;border-radius:5px;cursor:zoom-in';
  pic.onclick=()=>{void openImage(file)};
  const h=el('h4','',m.displayTitle);h.style.cssText='font-size:13px;line-height:1.3;margin:7px 0;overflow-wrap:anywhere';
  const category=el('div','',m.classified?[m.area,m.subject,m.subsubject].filter(Boolean).join(' / '):'Assunto pendente de classificação');
  category.style.cssText='font-size:11px;color:#436469;margin:5px 0;overflow-wrap:anywhere';
  const actions=el('div','');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';
  const open=el('button','','Abrir imagem');open.type='button';open.style.fontSize='12px';open.onclick=()=>{void openImage(file)};
  const link=el('a','','Abrir no Drive');link.href=fileLink(file);link.target='_blank';link.rel='noopener noreferrer';link.title='Abrir o original no Google Drive para gerenciar ou mover para a lixeira';link.setAttribute('aria-label','Abrir '+m.displayTitle+' no Google Drive para gerenciar ou excluir pela lixeira');link.style.fontSize='12px';
  actions.append(open,link);
  const details=el('details','');
  details.style.cssText='font-size:10px;color:#62787b;margin-top:7px;overflow-wrap:anywhere';
  const summary=el('summary','','Nome original e identificador');
  const technical=el('div','','Arquivo: '+m.fileName+' | ID Drive: '+file.id+' | Pasta: '+(file.drivePath||'Atlas'));
  details.append(summary,technical);
  const linked=m.cards.length?el('small','',m.cards.length+' cartão(ões) relacionado(s) no índice'):null;
  if(linked)linked.style.cssText='display:block;font-size:10px;color:#52666a;margin-top:4px';
  card.append(pic,h,category,...(linked?[linked]:[]),actions,details);
  if(window.BM228DriveImageEditor?.decorate)window.BM228DriveImageEditor.decorate(card,file);else window.BM197MediaLinks?.decorateDrive?.(card,file);
  grid.append(card);
  loadPreview(pic,file);
 }
 const more=$('bm084-more');if(more)more.hidden=items.length<=visible;
 const badge=$('bm205-drive-count');if(badge){
  const n=photos.filter(f=>info(f).classified).length;
  badge.textContent=validToken()?photos.length+' imagens · '+n+' com assunto · '+(photos.length-n)+' pendentes':'Conecte o Drive';
 }
 document.dispatchEvent(new CustomEvent('bm209-drive-render',{detail:{
  shown:Math.min(items.length,visible),matching:items.length,available:photos.length,
  classified:photos.filter(f=>info(f).classified).length
 }}));
}
let bm263InFlight=null;
 function refreshList(force){
  if(bm263InFlight)return bm263InFlight;
  bm263InFlight=refreshListInner(force).finally(()=>{bm263InFlight=null});
  return bm263InFlight;
 }
 async function refreshListInner(force){
 if(checking)return;if(!validToken()){msg('Conecte sua conta Google para sincronizar imagens.',true);return;}
 checking=true;lastAttemptAt=Date.now();const button=$('bm084-refresh');if(button)button.disabled=true;
 try{
  msg('Consultando Atlas e originais recuperados no Drive autorizado…');
  const {files:incoming,alreadyPublic:publicCount,skippedSvg,skippedLarge,folders}=await listImages();
  alreadyPublic=publicCount;
  const old=new Map(photos.map(x=>[x.id,x.modifiedTime]));
  const current=new Set(incoming.map(x=>x.id));
  let newCount=incoming.filter(x=>!old.has(x.id)).length;
  let edits=incoming.filter(x=>old.has(x.id)&&old.get(x.id)!==x.modifiedTime).length;
  for(const [id,data] of blobs)if(!current.has(id)||incoming.find(x=>x.id===id)?.modifiedTime!==data.modified){URL.revokeObjectURL(data.url);blobs.delete(id);}
  photos=incoming;
  lastGoodAt=Date.now();lastSyncError=''; // Só ativar modo Drive após consulta bem-sucedida.
  render();
  const group=$('bm084-sync');if(group&&!expandedOnce&&incoming.length){group.open=true;expandedOnce=true;}const stamp=$('bm207-sync-time');if(stamp)stamp.textContent='Última atualização validada: '+new Date(lastGoodAt).toLocaleString('pt-BR')+' · '+folders+' pastas lidas';
   msg('Drive consultado: '+photos.length+' imagens originais; '+newCount+' novas desde a última consulta; '+edits+' alteradas; '+folders+' pastas verificadas. '+skippedSvg+' SVG(s), '+skippedLarge+' imagens acima de 15 MB omitidas. Nenhuma imagem é copiada ao GitHub.');
  return {found:photos.length,alreadyPublic:publicCount,added:newCount,updated:edits,skippedSvg,skippedLarge,folders,scope:'atlas_authenticated_session_only'};
 }catch(e){lastSyncError=e.message;const stamp=$('bm207-sync-time');if(stamp)stamp.textContent='Erro atual: '+lastSyncError+(lastGoodAt?' · consulta anterior: '+new Date(lastGoodAt).toLocaleString('pt-BR'):'');msg('Falha na sincronização: '+e.message+'. Imagens carregadas anteriormente preservadas.',true);return null;}
 finally{checking=false;if(button&&validToken())button.disabled=false;}
}
window.BancoMestreDriveImagesV182=Object.freeze({refresh:()=>refreshList(true),get connected(){return validToken()},syncVersion:'V218',get lastSuccess(){return lastGoodAt?new Date(lastGoodAt).toISOString():null},get lastError(){return lastSyncError},get roots(){return ROOTS.map(x=>x.path)},get lastCount(){return photos.length},get alreadyPublic(){return alreadyPublic},get atlasMode(){return 'drive_only'}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();