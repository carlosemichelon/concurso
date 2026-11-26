/* V315 JS compacto · módulos IIFE originais em ordem · índices 100–111 */

;
/* 101 · assets/vc23_trt_source_reader.js */
(function(){'use strict';
const files={"TRT01-C001":"assets/trt01_c001_v211.json","TRT01-C002":"assets/trt01_c002_v212.json","TRT01-C003":"assets/trt01_c003_v215.json","TRT01-C004":"assets/trt01_c004_v217.json","TRT01-C005":"assets/trt01_c005_v220.json","TRT01-C006":"assets/trt01_c006_v221.json","TRT01-C007":"assets/trt01_c007_v222.json","TRT01-C008":"assets/trt01_c008_v224.json","TRT01-C009":"assets/trt01_c009_v227.json","TRT02-C001":"assets/trt02_c001_v230.json","TRT02-C002":"assets/trt02_c002_v237.json","TRT02-C004":"assets/trt02_c004_v232.json","TRT02-C005":"assets/trt02_c005_v235.json","TRT02-C006":"assets/trt02_c006_v236.json"}, cache=new Map();
async function loadRecord(id){if(!Object.hasOwn(files,id))throw Error('ID TRT desconhecido');if(!cache.has(id)){cache.set(id,fetch(files[id],{cache:'default'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(r=>{if(r.id!==id||r.layers?.length!==11)throw Error('Registro TRT inconsistente');return r}).catch(e=>{cache.delete(id);throw e}));}return cache.get(id);}
window.BM236TrtCardsGrid=Object.freeze({loadRecord,getRecord:id=>typeof cards!=='undefined'?cards.find(c=>c.id===id)||null:null,isHidden:()=>false,refresh:()=>{},ids:Object.keys(files),get loaded(){return Object.keys(files).length}});
})();
;
/* 102 · assets/v222_images_live.js */
/* V221 — Biblioteca de imagens sempre visível, sem recarga de página.
 * Mantém o Drive como única fonte visual e preserva grifos, IDs e buscas existentes. */
(function(){
'use strict';
if(window.BM221ImagesLive)return;
const $=id=>document.getElementById(id);
let mounted=false,refreshStarted=0,pending=false,observer=null,loginWasSeen=false;
function sourceReady(){return Boolean(window.BancoMestreDriveImagesV182?.connected);}
function node(){
 const root=$('imagens')?.querySelector('.panel'),rows=$('imageRows');
 if(!root||!rows)return null;
 let vp=$('bm221DriveViewport');
 if(!vp){
  vp=document.createElement('div');vp.id='bm221DriveViewport';
  vp.setAttribute('aria-label','Imagens originais do Google Drive');
  const anchor=$('bm153Directory')||$('bm209SyncBar')||root.querySelector('.controls');
  if(anchor&&anchor.parentElement===root)anchor.after(vp);
  else root.append(vp);
 }
 if(rows.parentElement!==vp)vp.append(rows);
 rows.hidden=false;vp.hidden=false;
 // O renderizador de grupos legado pode tornar a grade invisível. Esta fonte é única.
 rows.style.setProperty('display','grid','important');
 return {root,rows,vp};
}
function sync(){
 const place=node();if(!place)return false;
 const {rows,vp}=place,source=$('bm084-grid');
 if(!window.BM209SingleImageViewer?.ready&&source&&source.children.length){
  const fresh=[...source.children].filter(x=>x.tagName==='ARTICLE');
  if(fresh.length){
   for(const old of rows.querySelectorAll(':scope > article.bm209ImageFromDrive'))old.remove();
   for(const card of fresh){
    card.classList.add('card','bm209ImageFromDrive');
    card.dataset.bm209ImageOrigin='drive';
    rows.append(card);
   }
  }
 }
 const known=[...rows.querySelectorAll(':scope > article.bm209ImageFromDrive')];
 for(const other of rows.querySelectorAll(':scope > article:not(.bm209ImageFromDrive)'))other.hidden=true;
 vp.dataset.bm221Count=String(known.length);
 const status=$('bm221ImageVisible');
 if(status){
  if(!sourceReady())status.textContent='Conecte o Google Drive para visualizar os originais.';
  else if(known.length)status.textContent=known.length+' imagens exibidas nesta página · atualizadas sem recarregar o site.';
  else status.textContent='Drive conectado. A consulta de imagens está sendo concluída ou não há resultados para os filtros.';
 }
 return known.length>0;
}
function queue(){
 if(pending)return;
 pending=true;requestAnimationFrame(()=>{pending=false;sync();});
}
function css(){
 if($('bm221-images-style'))return;
 const style=document.createElement('style');style.id='bm221-images-style';
 style.textContent=[
 '#imagens #bm221DriveViewport{display:block!important;visibility:visible!important;min-height:60px;margin:10px 0 18px}',
 '#imagens #bm221DriveViewport[hidden]{display:block!important}',
 '#imagens #bm221DriveViewport #imageRows{display:grid!important;visibility:visible!important;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:10px}',
 '#imagens #bm221DriveViewport #imageRows[hidden]{display:grid!important}',
 '#imagens #bm221DriveViewport article.bm209ImageFromDrive{display:block!important;visibility:visible!important;min-width:0}',
 '#imagens #bm221ImageVisible{font-size:12px;color:#516a6d;padding:5px 0}'
 ].join('\n');
 document.head.append(style);
}
function refresh(reason){
 if(!sourceReady())return false;
 const now=Date.now();
 if(now-refreshStarted<25000)return false;
 refreshStarted=now;
 const provider=window.BancoMestreDriveImagesV182;
 if(!provider?.refresh)return false;
 Promise.resolve(provider.refresh()).then(()=>queue()).catch(err=>{
  const state=$('bm221ImageVisible');
  if(state)state.textContent='Atualização do Drive indisponível: '+String(err?.message||err);
 });
 return true;
}
function initialise(){
 if(mounted)return;
 const root=$('imagens')?.querySelector('.panel');
 if(!root||!$('imageRows'))return;
 mounted=true;css();
 const info=document.createElement('p');info.id='bm221ImageVisible';info.setAttribute('role','status');
 const anchor=$('bm153Directory')||$('bm209SyncBar')||root.querySelector('.controls');
 if(anchor?.parentElement===root)anchor.after(info);else root.append(info);
 sync();
 const source=$('bm084-grid');
 if(source&&!observer){
  observer=new MutationObserver(queue);
  observer.observe(source,{childList:true});
 }
 document.addEventListener('bm209-drive-render',queue);
 document.addEventListener('bm218-image-filter-change',queue);
 document.addEventListener('bm-media-drive-authorized',()=>{
  loginWasSeen=true;queue();
  // O sincronizador Drive já recebe este evento. Não iniciar outra varredura concorrente.
 });
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){queue();refresh('visible');}
 });
 window.addEventListener('focus',()=>{queue();refresh('focus');});
 window.addEventListener('online',()=>{queue();refresh('online');});
 document.querySelector('nav button[data-page="imagens"]')?.addEventListener('click',()=>{
  queue();refresh('images-tab');
 });
 const viewport=$('bm221DriveViewport');
 if(viewport)new MutationObserver(queue).observe(viewport,{childList:true});
 if(sourceReady()){loginWasSeen=true;queue();}
}
document.readyState==='loading'
 ?document.addEventListener('DOMContentLoaded',initialise,{once:true})
 :initialise();
window.BM221ImagesLive=Object.freeze({refresh,render:queue,get ready(){return mounted},get loginSeen(){return loginWasSeen}});
})();

;
/* 103 · assets/v222_pdf_editor_route.js */
/* V221 — clique da biblioteca abre PDFs diretamente no editor, sem passagem obrigatória
 * pelo iframe Google Drive; atualizar a lista após reconectar/voltar à aba. */
(function(){
'use strict';
if(window.BM221PdfEditorRoute)return;
const $=id=>document.getElementById(id);
const ID=/^[A-Za-z0-9_-]{15,}$/;
// Não sobrescrever pdfOpen: o próprio renderizador PDF usa esta função internamente.
let refreshAt=0;
function source(doc){
 if(!doc||typeof doc!=='object')return null;
 const fileId=String(doc.file_id||'');
 if(ID.test(fileId))return doc;
 const url=String(doc.url||'');
 const hit=url.match(/^https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{15,})\/(?:view|preview)(?:[?#].*)?$/);
 if(hit)return {...doc,file_id:hit[1]};
 return null;
}
function reader(){return window.BancoMestreDriveV042||window.BancoMestreDriveV038;}
function open(doc){
 const managed=source(doc);
 const connect=reader();
 if(!managed||!connect?.openAndEdit)return false;
 // Se o PDF já está aberto com anotações, não perder os grifos ao pressionar novamente.
 if(window.BancoMestrePDFV042?.editing&&
    window.BancoMestrePDFV042?.currentDoc?.id===managed.id)return true;
 const response=connect.openAndEdit(managed);
 if(!connect.connected&&connect.ready)connect.authorize();
 Promise.resolve(response).then(ok=>{
  const status=$('bm-pdf-sync-status');
  if(ok===true&&status)status.textContent='PDF aberto no editor: grifos, notas e anotações disponíveis nesta página.';
 }).catch(error=>{
  const status=$('bm-pdf-sync-status');
  if(status)status.textContent='Não foi possível abrir o PDF no editor: '+String(error?.message||error);
 });
 return response;
}
function update(force=false){
 const provider=window.BancoMestrePDFSyncV130,connected=!!window.BancoMestreMediaSyncV182?.token?.();
 if(!connected||!provider?.refresh)return false;
 const now=Date.now();
 if(!force&&now-refreshAt<120000)return false;
 refreshAt=now;
 Promise.resolve(provider.refresh()).catch(error=>{
  const box=$('bm-pdf-sync-status');
  if(box)box.textContent='Consulta de PDFs indisponível: '+String(error?.message||error);
 });
 return true;
}
function init(){
 const list=$('pdfRows');
 // Captura apenas o gesto "Ler / editar PDF" na biblioteca.
 // Deixa pdfOpen intocado para o próprio PDF.js inicializar a tela sem recursão.
 list?.addEventListener('click',event=>{
  const button=event.target.closest?.('button');
  if(!button||!/^Ler\s*\/\s*editar\s+PDF$/i.test(button.textContent?.trim()||''))return;
  const article=button.closest('article.card'),id=article?.querySelector(':scope > .tag')?.textContent?.trim();
  if(!id||typeof docs==='undefined'||!Array.isArray(docs))return;
  const record=docs.find(x=>x.id===id);
  if(!source(record)||!reader()?.openAndEdit)return;
  event.preventDefault();event.stopImmediatePropagation();
  void open(record);
 },true);
 document.addEventListener('bm-media-drive-authorized',()=>{
  // O módulo de PDF já programou a varredura inicial após a autorização.
  const status=$('bm-pdf-sync-status');
  if(status)status.textContent='Drive conectado. Conferindo PDFs para edição nesta página…';
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
 window.addEventListener('focus',()=>update());
 window.addEventListener('online',()=>update());
 const nav=document.querySelector('nav button[data-page="pdfs"]');
 nav?.addEventListener('click',()=>update());
 // Abrir PDF é uma operação de leitura: o original do Drive não é sobrescrito.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BM221PdfEditorRoute=Object.freeze({open,source,update,get installed(){return Boolean($('pdfRows'))}});
})();

;
/* 104 · Identificação do portal — delegada ao único proprietário BM206Header. */
(function(){
'use strict';
if(window.BM232SiteVersion)return;
const current=document.documentElement.getAttribute('data-bm-portal-version')||'';
function refresh(){window.BM206Header?.render();}
window.BM232SiteVersion=Object.freeze({refresh,get version(){return current}});
})();

;
/* 105 · assets/v232_grid_persist.js */
/* V232 — preservar a grade dos flashcards em qualquer busca ou filtro.
   Muda só os nós de apresentação; não altera filtros, IDs, conteúdo, SRS ou paginação. */
(function(){
'use strict';
if(window.BM232GridPersist || typeof cardRender!=='function')return;
const rows=()=>document.getElementById('cardRows');
function normalize(){
 const root=rows();
 if(!root)return 0;
 const groups=root.querySelectorAll(':scope > .bm128CardsGroup');
 if(groups.length){
   // Os cartões já filtrados foram criados pelo renderizador original.
   // Retirá-los dos agrupamentos não altera o conteúdo nem seus listeners.
   const items=Array.from(root.querySelectorAll('article.card'));
   if(items.length)root.replaceChildren(...items);
 }
 root.classList.add('bm191-all-grid');
 return root.querySelectorAll(':scope > article.card').length;
}
const original=cardRender;
cardRender=function(...args){
 const result=original.apply(this,args);
 normalize();
 return result;
};
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',normalize,{once:true});
}else normalize();
document.addEventListener('bm-v185-cards-synced',normalize);
window.BM232GridPersist=Object.freeze({refresh:normalize});
})();

;
