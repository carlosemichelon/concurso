/* Banco Mestre V084 — Imagens privadas do Google Drive, somente leitura.
   Descoberta por pasta após consentimento do proprietário; não publica imagens
   nem substitui os 270 registros históricos do Atlas. */
(function(){
'use strict';
const FOLDER_ID='1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6';
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
function validToken(){return Boolean(access&&Date.now()<expires);}
function idOf(file){return 'DRIVE-IMG-'+file.id;}
function fileLink(file){return 'https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/view';}
function title(file){return String(file.name||'Imagem').replace(/\.(png|jpe?g|webp|gif)$/i,'').replace(/_/g,' ').slice(0,170);}
function ui(){
 const host=$('imagens')?.querySelector('.panel');if(!host||$('bm084-sync'))return;
 const box=el('section','bm084-drive-images');box.id='bm084-sync';
 box.style.cssText='margin:14px 0 22px;padding:15px;border:1px solid #c9d9d5;border-radius:12px;background:#f3f8f6';
 const h=el('h3','', 'Imagens do Google Drive — sincronização');h.style.margin='0 0 8px';
 const desc=el('p','', 'Novas imagens da pasta Atlas no Drive aparecem aqui após autorização. Os 270 registros antigos, seus IDs e seus grifos permanecem separados.');
 desc.style.cssText='font-size:13px;margin:0 0 10px';
 const controls=el('div','');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:9px';
 const connect=el('button','','Conectar Drive e sincronizar imagens');connect.type='button';connect.id='bm084-connect';connect.disabled=true;
 const refresh=el('button','','Verificar imagens agora');refresh.type='button';refresh.id='bm084-refresh';refresh.disabled=true;
 const folder=el('a','','Abrir pasta de imagens no Drive');folder.href='https://drive.google.com/drive/folders/'+FOLDER_ID;folder.target='_blank';folder.rel='noopener noreferrer';
 const search=el('input','');search.id='bm084-search';search.type='search';search.placeholder='Buscar imagem do Drive';search.setAttribute('aria-label','Buscar imagens sincronizadas');search.style.cssText='padding:7px 10px;border:1px solid #bacdc7;border-radius:6px;max-width:230px';
 controls.append(connect,refresh,folder,search);
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
   $('bm084-refresh').disabled=false;void refreshList(true);
  },error_callback:()=>msg('Não foi possível autorizar o Drive; imagens anteriores preservadas.',true)});
  $('bm084-connect').disabled=false;
  msg('Pronto. Autorize a leitura do Drive para buscar imagens na pasta Atlas. Verificação a cada 2 minutos, enquanto conectado.');
  setInterval(()=>{
   if(validToken()){void refreshList(false);return;}
   if(access){access='';$('bm084-refresh').disabled=true;msg('Sessão expirada. Reconecte para continuar a sincronização.',true);}
  },INTERVAL);
 }catch(e){msg('Sincronização indisponível: '+e.message,true);}
}
async function authorized(url){
 if(!validToken())throw Error('Conexão expirada; reconecte o Google Drive');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+access},cache:'no-store'});
 if(r.status===401)throw Error('Autorização expirada');
 if(r.status===403)throw Error('Conta conectada não possui acesso à pasta/imagem');
 if(!r.ok)throw Error('Google Drive HTTP '+r.status);
 return r;
}
async function listImages(){
 let next='',result=[],loops=0;
 do{
  if(++loops>20)throw Error('Pasta com paginação excessiva');
  const args=new URLSearchParams({q:"'"+FOLDER_ID+"' in parents and trashed = false and mimeType contains 'image/'",fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime)',pageSize:'1000'});
  if(next)args.set('pageToken',next);
  const r=await authorized(API+'?'+args.toString());const d=await r.json();
  result.push(...(d.files||[]));next=d.nextPageToken||'';
 }while(next);
 if(result.length>1500)throw Error('Mais de 1500 imagens; subdivida o acervo');
 const unique=new Map();
 for(const f of result){
  if(!/^[A-Za-z0-9_-]{15,}$/.test(f.id)||!MIME.has(f.mimeType))continue;
  if(Number(f.size||0)>MAX_BYTES)continue; // Arquivos maiores: abrir no Drive
  unique.set(f.id,f);
 }
 return [...unique.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
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
    warning:'Grifos deste ID são salvos apenas neste navegador. O Drive e os 270 IDs anteriores permanecem intactos.'});
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
 const items=photos.filter(f=>(f.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));
 for(const file of items.slice(0,visible)){
  const card=el('article','');card.style.cssText='background:white;border:1px solid #d5e2dd;border-radius:9px;padding:10px;min-width:0';
  const pic=el('img','');pic.loading='lazy';pic.alt='Prévia de '+title(file);pic.style.cssText='width:100%;height:140px;object-fit:contain;background:#f8faf8;border-radius:5px;cursor:zoom-in';
  pic.onclick=()=>{void openImage(file)};
  const h=el('h4','',title(file));h.style.cssText='font-size:13px;line-height:1.3;margin:7px 0;overflow-wrap:anywhere';
  const id=el('small','',idOf(file));id.style.cssText='display:block;color:#52656a;font-size:10px;overflow-wrap:anywhere';
  const actions=el('div','');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';
  const open=el('button','','Abrir e grifar');open.type='button';open.style.fontSize='12px';open.onclick=()=>{void openImage(file)};
  const link=el('a','','Original no Drive');link.href=fileLink(file);link.target='_blank';link.rel='noopener noreferrer';link.style.fontSize='12px';
  actions.append(open,link);card.append(pic,h,id,actions);grid.append(card);
  loadPreview(pic,file);
 }
 const more=$('bm084-more');if(more)more.hidden=items.length<=visible;
}
async function refreshList(force){
 if(checking)return;if(!validToken()){msg('Conecte sua conta Google para sincronizar imagens.',true);return;}
 checking=true;const button=$('bm084-refresh');if(button)button.disabled=true;
 try{
  msg('Conferindo a pasta Imagens do Atlas no Drive…');
  const incoming=await listImages();
  const old=new Map(photos.map(x=>[x.id,x.modifiedTime]));
  const current=new Set(incoming.map(x=>x.id));
  let newCount=incoming.filter(x=>!old.has(x.id)).length;
  let edits=incoming.filter(x=>old.has(x.id)&&old.get(x.id)!==x.modifiedTime).length;
  for(const [id,data] of blobs)if(!current.has(id)||incoming.find(x=>x.id===id)?.modifiedTime!==data.modified){URL.revokeObjectURL(data.url);blobs.delete(id);}
  photos=incoming;
  render();
  msg('Drive sincronizado: '+photos.length+' imagem(ns) nesta pasta'+(force?'':'; '+newCount+' nova(s), '+edits+' atualizada(s)')+'. Verificação a cada 2 minutos enquanto conectado. Os 270 registros originais continuam separados.');
 }catch(e){msg('Falha na sincronização: '+e.message+'. Imagens carregadas anteriormente preservadas.',true);}
 finally{checking=false;if(button&&validToken())button.disabled=false;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();