// Retain the original gallery controls and grid; remove global scans and OAuth.
export function privateGallery(source){
 const a=source.indexOf('/* 43 assets/v306_drive_gallery_search.js */'),b=source.indexOf('/* 44 assets/v180_image_bridge.js */',a);
 if(a<0||b<0)throw Error('Contrato galeria divergente');
 const old=source.slice(a,b);
 function take(x,y){const i=old.indexOf(x),j=old.indexOf(y,i+x.length);if(i<0||j<0)throw Error('Contrato galeria divergente: '+x);return old.slice(i,j)}
 let ui=take('function moveToAtlas(box){','function loadGIS()');
 const replace=(s,x,y)=>{if(s.split(x).length!==2)throw Error('Contrato galeria divergente: '+x.slice(0,70));return s.replace(x,y)};
 ui=replace(ui," const folder=el('a','','Pasta oficial');folder.href='https://drive.google.com/drive/folders/'+FOLDER_ID;folder.target='_blank';folder.rel='noopener noreferrer';"," const folder=el('span','','Acervo individual');");
 ui=replace(ui," const recovered=el('a','','Originais históricos');recovered.href='https://drive.google.com/drive/folders/'+ROOTS[1].id;recovered.target='_blank';recovered.rel='noopener noreferrer';"," const recovered=el('span','','');");
 ui=replace(ui,"Originais das pastas autorizadas do Drive. Para excluir uma imagem, clique em Abrir no Drive e escolha Mover para a lixeira no Google Drive. Nenhum original é publicado no GitHub.","Originais do perfil autenticado. Nenhum arquivo é alterado nesta consulta.");
 const c=ui.indexOf(' connect.onclick=()=>{'),d=ui.indexOf(' refresh.onclick=',c);
 if(c<0||d<0)throw Error('Contrato controles galeria divergente');
 ui=ui.slice(0,c)+" connect.disabled=false;refresh.disabled=false;connect.onclick=()=>void refreshList();\n"+ui.slice(d);
 let render=take('function syncMetaFilters(){','let bm263InFlight=null;');
 render=replace(render,"if(lastGoodAt||photos.length)window.BM153ImageLibrary?.setDriveRecords?.(photos.map(info));","if(lastGoodAt||photos.length)window.BM153ImageLibrary?.setDriveRecords?.(photos.map(info));");
 render=replace(render,"  if(window.BM197MediaLinks?.matchesDrive?.(f)===false)return false;","  // Classification only from this profile.");
 render=replace(render,"  if(!legacyFilterMatch(m))return false;","  // The private area and subject filters above are authoritative.");
 const x=render.indexOf("  const link=el('a','','Abrir no Drive');"),y=render.indexOf("  const linked=",x);
 if(x<0||y<0)throw Error('Contrato cartão de imagem divergente');
 render=render.slice(0,x)+"  actions.className='bm422-image-actions';actions.append(open);\n  const frame=el('div','bm422-thumb');frame.append(pic);\n"+render.slice(y);
 render=replace(render,"  if(window.BM228DriveImageEditor?.decorate)window.BM228DriveImageEditor.decorate(card,file);else window.BM197MediaLinks?.decorateDrive?.(card,file);","  card.dataset.privateImageId=file.id;");
 const code=`(function(){
 'use strict';
 const $=id=>document.getElementById(id),normalize=s=>String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
 const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
 let photos=[],visible=24,lastGoodAt=0,lastError='',pending=null,generation=0;
 const aliases=new Map(),urls=new Map(),downloads=new Map();
 const validToken=()=>window.BMVS41Session?.available()===true;
 const idOf=f=>f.id,title=f=>f.title;
 const info=f=>({displayTitle:f.title,fileName:f.title,area:f.area,subject:f.subject,subsubject:f.subsubject,group:f.area,description:f.description,detail:'',note:'',cards:f.card_ids,classified:!!f.subject});
 function msg(s,error){const x=$('bm084-status');if(x){x.textContent=s;x.style.color=error?'#953b32':'#315e57'}}
 function release(){generation++;for(const x of urls.values())URL.revokeObjectURL(x);urls.clear();downloads.clear()}
 async function getImageUrl(file){
  if(!validToken()||!photos.includes(file))throw Error('Imagem fora da sessão');
  if(urls.has(file.id))return urls.get(file.id);
  if(downloads.has(file.id))return downloads.get(file.id);
  const ticket=generation,task=(async()=>{
   const blob=await window.BMVS41PrivateMedia.read(file.card_ids[0],file.id);
   if(ticket!==generation||!validToken()||!photos.includes(file)||!/^image\\/(png|jpeg|webp|gif)$/.test(blob.type))throw Error('Imagem ou sessão alterada');
   const url=URL.createObjectURL(blob);urls.set(file.id,url);return url;
  })();downloads.set(file.id,task);
  try{return await task}finally{if(downloads.get(file.id)===task)downloads.delete(file.id)}
 }
 async function openImage(file){
  try{if(!validToken()||!photos.includes(file))throw Error('Imagem fora da sessão');await window.BMVS41PrivateImageEditor.open(file)}
  catch(e){msg(e.message,true)}
 }
 function loadPreview(img,file){
  const load=()=>getImageUrl(file).then(url=>{if(img.isConnected)img.src=url}).catch(e=>{if(img.isConnected)img.alt=e.message});
  if(!('IntersectionObserver' in window)){void load();return}
  const watcher=new IntersectionObserver(items=>{if(items.some(x=>x.isIntersecting)){watcher.disconnect();void load()}},{rootMargin:'150px'});watcher.observe(img);
 }
 `+ui+'\n'+render+`
 async function refreshList(){
  if(pending)return pending;
  pending=(async()=>{
   try{msg('Consultando imagens privadas…');const list=await window.BMVS41PrivateImages.list();release();photos=list.map(x=>({...x,name:x.title}));lastGoodAt=Date.now();lastError='';
    for(const f of photos)aliases.set(f.id,{imageId:f.id,title:f.title,cardIds:f.card_ids});render();
    $('imageCount').textContent=photos.length+' imagens';msg('Acervo privado confirmado: '+photos.length+' imagens.');$('bm207-sync-time').textContent='Consulta validada nesta sessão';
    return {found:photos.length,scope:'authenticated-profile'};
   }catch(e){release();photos=[];aliases.clear();lastGoodAt=0;lastError=e.message;render();msg(e.message,true);return null}
   finally{pending=null}
  })();return pending;
 }
 function topicRecords(){return !validToken()||!lastGoodAt?null:photos.map(f=>({id:f.id,editorialId:f.id,title:f.title,subject:f.subject,subsubject:f.subsubject,group:f.area,cardIds:f.card_ids,description:f.description,name:f.title,path:'Perfil privado',preview:()=>getImageUrl(f),open:()=>openImage(f)}))}
 window.BancoMestreDriveImagesV182=Object.freeze({refresh:refreshList,refreshAfterMove:refreshList,prepareTopicMetadata:async()=>{},topicRecords,
  get connected(){return validToken()},get lastSuccess(){return lastGoodAt?new Date(lastGoodAt).toISOString():null},get lastError(){return lastError},get lastCount(){return photos.length},get unverifiedCount(){return 0},get alreadyPublic(){return 0},get atlasMode(){return 'drive_only'},get roots(){return []},getEditorialId:id=>photos.some(f=>f.id===id)?id:'',getImageUrlForCard:id=>{const f=photos.find(x=>x.id===id);if(!f)throw Error('Imagem fora do perfil');return getImageUrl(f)}
 });
 function init(){ui();if(location.hash==='#imagens')void refreshList();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('pagehide',release);
 })();`;
 return source.slice(0,a)+code+'\n;\n'+source.slice(b);
}
