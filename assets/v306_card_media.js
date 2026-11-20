/* Banco Mestre V306 — imagens originais diretamente nos flashcards.
 * Somente vínculos por ID explícitos; OAuth de leitura, sem copiar bytes para o GitHub.
 * Enunciados e figuras na frente; imagens de explicação em <details> fechado.
 */
(function(){
'use strict';
if(window.BM306CardMedia)return;
const $=id=>document.getElementById(id);
const CARD=/^(?:CARD-\d{4,}|PETRO\d+-C\d{3})$/i,FILE=/^[A-Za-z0-9_-]{15,}$/;
const LOCAL='BM197_IMAGENS_TIPO_VINCULOS_V1',META='BM228_DRIVE_IMAGE_INFO_V1';
let index=null,loadPromise=null,observer=null,intersection=null,scheduled=false,processed=new WeakMap();
const tracked=new Set(),requests=new WeakMap();
function local(key){try{const x=JSON.parse(localStorage.getItem(key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
async function load(){
 if(index)return index;if(loadPromise)return loadPromise;
 loadPromise=Promise.all([
  fetch('assets/v211_published_images.json?v=211').then(r=>{if(!r.ok)throw Error('Índice V211 indisponível');return r.json()}),
  fetch('assets/v198_editorial_images_catalog.json?v=198').then(r=>{if(!r.ok)throw Error('Índice V198 indisponível');return r.json()})
 ]).then(([d,e])=>{
  if(d.schema!=='BancoMestrePublishedDriveImagesV211'||d.records?.length!==237||e.schema!=='BancoMestreImageEditorialCatalogV198'||e.records?.length!==179)throw Error('Catálogo de imagens incompatível');
  const editorial=new Map(e.records.map(x=>[x.imageId,x])),map=new Map();
  for(const r of d.records){
   const id=String(r.imageId||''),file=String(r.driveFileId||'');
   if(!/^IMG-[A-Z0-9_-]+$/.test(id)||!FILE.test(file))continue;
   const e=editorial.get(id),ids=Array.isArray(e?.cardIds)?e.cardIds:r.cardIds;
   map.set(id,{
    id,file,title:String(r.title||id).slice(0,150),
    type:e?.type||r.type||'conteudo',subtype:e?.subtype||r.subtype||'',
    cardIds:Array.isArray(ids)?ids.filter(v=>typeof v==='string'&&CARD.test(v)):[],
    basis:e?.basis||r.classificationBasis||''
   });
  }
  index=map;return map;
 }).catch(err=>{loadPromise=null;console.warn('V306 imagens de cartões:',err);return null});
 return loadPromise;
}
function linked(cardId){
 if(!index)return [];
 const overrides=local(LOCAL),notes=local(META),out=[];
 for(const r of index.values()){
  const edit=overrides[r.id]||overrides['DRIVE-IMG-'+r.file];
  const type=edit?.type||r.type,ids=Array.isArray(edit?.cardIds)?edit.cardIds:r.cardIds;
  if(type!=='cartao'||!ids.includes(cardId))continue;
  out.push({...r,title:String(notes[r.file]?.title||r.title).slice(0,150),
    subtype:edit?.subtype||r.subtype,basis:edit?'manual_local':r.basis});
 }
 return out.sort((a,b)=>a.id.localeCompare(b.id,'pt-BR'));
}
function provider(){const p=window.BancoMestreDriveImagesV182;return p?.connected&&typeof p.getImageUrlForCard==='function'?p:null}
function preview(img,file,figure){
 const run=async()=>{
  if(!img.isConnected)return;
  const p=provider();
  if(!p){img.hidden=true;img.dataset.state='unavailable';return;}
  if(img.dataset.state==='loading'||img.dataset.state==='ready')return;
  img.dataset.state='loading';
  try{
   const url=await p.getImageUrlForCard(file);
   if(!img.isConnected)return;
   img.src=url;img.hidden=false;img.dataset.state='ready';
   figure.querySelector('.bm306-image-status').textContent='Imagem original consultada no Drive';
  }catch(e){
   img.hidden=true;img.dataset.state='unavailable';
   figure.querySelector('.bm306-image-status').textContent='Prévia indisponível nesta sessão. Original preservado.';
  }
 };
 requests.set(figure,run);tracked.add(figure);
 if(intersection)intersection.observe(figure);else void run();
}
function item(r){
 const fig=document.createElement('figure');fig.className='bm306-image-item';fig.dataset.imageId=r.id;
 const img=document.createElement('img');img.className='bm306-preview';img.alt=r.title+' ('+r.id+')';img.loading='lazy';img.decoding='async';img.hidden=true;
 const cap=document.createElement('figcaption');
 const title=document.createElement('strong');title.textContent=r.title;
 const id=document.createElement('span');id.textContent=r.id;
 const status=document.createElement('small');status.className='bm306-image-status';status.textContent='Conecte o Drive para exibir o original';
 const link=document.createElement('a');link.href='https://drive.google.com/file/d/'+encodeURIComponent(r.file)+'/view';
 link.target='_blank';link.rel='noopener noreferrer';link.textContent='Abrir original no Drive';
 cap.append(title,id,status,link);
 if(r.basis==='correspondencia_didatica_especifica'){
  const note=document.createElement('small');note.textContent='Associação didática registrada · conferir vínculo';note.className='bm306-image-basis';cap.append(note);
 }
 fig.append(img,cap);preview(img,r.file,fig);return fig;
}
function gallery(recs){
 const root=document.createElement('div');root.className='bm306-card-images';
 const direct=recs.filter(r=>r.subtype==='enunciado'||r.subtype==='figura');
 const explanations=recs.filter(r=>r.subtype!=='enunciado'&&r.subtype!=='figura');
 if(direct.length){
  const head=document.createElement('strong');head.className='bm306-image-heading';head.textContent='Figura ou enunciado original';
  root.append(head,...direct.slice(0,10).map(item));
 }
 if(explanations.length){
  const fold=document.createElement('details');fold.className='bm306-explanations';
  const sum=document.createElement('summary');sum.textContent='Imagens explicativas ('+explanations.length+') — abrir após responder';
  fold.append(sum,...explanations.slice(0,12).map(item));root.append(fold);
 }
 return root;
}
function cards(){
 if(!index)return;
 for(const article of $('cardRows')?.querySelectorAll('article.card')||[]){
  const id=String(article.querySelector(':scope > .tag')?.textContent||'').trim();
  if(!CARD.test(id)||processed.get(article)===id)continue;
  processed.set(article,id);
  const recs=linked(id);if(!recs.length)continue;
  const g=gallery(recs),answer=article.querySelector(':scope > details');
  if(answer)answer.before(g);else article.append(g);
 }
}
function modal(){
 if(!index)return;
 const root=$('bmCardPeekV050'),question=root?.querySelector('.bm163-question');
 if(!root||root.hidden||!question)return;
 const id=window.BancoMestreVisualizarCardV050?.currentId;if(!CARD.test(id))return;
 let slot=question.querySelector(':scope > .bm306-modal-gallery');
 if(!slot){slot=document.createElement('div');slot.className='bm306-modal-gallery';question.append(slot)}
 if(slot.dataset.card===id)return;
 slot.dataset.card=id;slot.replaceChildren();
 const recs=linked(id);if(recs.length)slot.append(gallery(recs));
}
function retry(){
 for(const fig of tracked){
  if(!fig.isConnected){tracked.delete(fig);continue}
  const img=fig.querySelector('img');
  if(provider()&&img.dataset.state!=='ready')void requests.get(fig)?.();
 }
}
function update(){cards();modal();retry()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update()})}
function rebuild(){
 processed=new WeakMap();
 $('cardRows')?.querySelectorAll('.bm306-card-images').forEach(x=>x.remove());
 const slot=$('bmCardPeekV050')?.querySelector('.bm306-modal-gallery');if(slot)slot.dataset.card='';
 schedule();
}
async function init(){
 intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){
   intersection.unobserve(e.target);
   void requests.get(e.target)?.();
  }
 },{rootMargin:'240px'}):null;
 if(!await load())return;
 observer=new MutationObserver(schedule);
 const root=$('cardRows'),modal=$('bmCardPeekV050'),title=$('bmCardPeekTitleV050');
 if(root)observer.observe(root,{childList:true,subtree:true});
 if(title)observer.observe(title,{childList:true,subtree:true});
 if(modal)observer.observe(modal,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('bm209-drive-render',schedule);
 document.addEventListener('bm-media-drive-authorized',schedule);
 document.addEventListener('bm228-image-info-changed',rebuild);
 window.addEventListener('bm197-links-changed',rebuild);
 schedule();
}
window.BM306CardMedia=Object.freeze({refresh:()=>{if(index)schedule();else void load().then(schedule)},get ready(){return !!index},linked:id=>linked(id).map(r=>({imageId:r.id,driveFileId:r.file,role:r.subtype})),get sourceCount(){return index?.size||0}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();