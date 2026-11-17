/* V211: galeria publica estatica. Nenhuma consulta ou autorizacao Drive e necessaria para exibir as 237 imagens publicadas. */
(function(){
'use strict';
if(window.BM211Gallery)return;
const DATA='assets/v211_published_images.json?v=211';
const EDITORIAL='assets/v198_editorial_images_catalog.json?v=198';
const $=id=>document.getElementById(id);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let items=[],matches=[],visible=24,selected=-1,dialog=null;
let searchEl,typeEl,originEl,countEl,gridEl,moreEl,modalImg,modalTitle,modalMeta;
function node(tag,cls,text){
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(text!==undefined)x.textContent=text;
 return x;
}
function css(){
 const style=document.createElement('style');
 style.id='bm211-css';
 style.textContent=[
  '#imagens .intro,#imagens>.panel>.notice,#imagens>.panel>.controls,#imagens #bm153Directory,#imagens #bm153Results,#imagens #imageRows,#imagens #moreImages,#imagens #bm084-sync,#imagens #bm209SyncBar,#imagens #bm209More,#imagens #imageIndexV044,#imagens #imageCount{display:none!important}',
  '#bm211Gallery{margin-top:12px}',
  '#bm211Gallery .bm211Controls{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;align-items:center}',
  '#bm211Gallery input,#bm211Gallery select{font:inherit;font-size:13px;border:1px solid #b5cdca;background:#fff;color:#173e42;border-radius:8px;padding:9px;min-height:39px;max-width:100%}',
  '#bm211Gallery input{flex:1 1 230px;min-width:120px}',
  '#bm211Gallery select{flex:1 1 150px;min-width:130px}',
  '#bm211Gallery .bm211Count{font-size:12px;color:#49696b;line-height:1.6;margin:4px 0 10px}',
  '#bm211Gallery .bm211Grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,168px),1fr));gap:10px}',
  '#bm211Gallery .bm211Card{appearance:none;border:1px solid #d4e3e0;border-radius:10px;background:#fff;color:#183f42;padding:8px;text-align:left;cursor:zoom-in;display:flex;flex-direction:column;gap:6px;min-width:0}',
  '#bm211Gallery .bm211Card:hover{border-color:#59999a;background:#f8fcfb}',
  '#bm211Gallery .bm211Card:focus-visible{outline:3px solid #6caeaf;outline-offset:2px}',
  '#bm211Gallery .bm211Card img{display:block;width:100%;height:138px;object-fit:contain;background:#eef5f3;border-radius:6px}',
  '#bm211Gallery .bm211Card strong{font-size:12px;font-weight:650;line-height:1.35;overflow-wrap:anywhere}',
  '#bm211Gallery .bm211Card small{font-size:10px;color:#5c7476;line-height:1.4;overflow-wrap:anywhere}',
  '#bm211Gallery .bm211More{display:block;margin:14px auto;padding:9px 20px;min-height:40px;border:1px solid #aac9c4;border-radius:8px;background:#eaf4f2;color:#155456;cursor:pointer;font-weight:700}',
  '#bm211Gallery .bm211More[hidden]{display:none!important}',
  '#bm211Dialog{max-width:min(96vw,1100px);max-height:94vh;width:min(96vw,1100px);padding:12px;border:1px solid #c6d8d6;border-radius:12px;background:#fff;color:#183a3c}',
  '#bm211Dialog::backdrop{background:rgba(8,25,28,.8)}',
  '#bm211Dialog .bm211DialogBar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px}',
  '#bm211Dialog .bm211DialogBar strong{flex:1 1 200px;font-size:14px;overflow-wrap:anywhere}',
  '#bm211Dialog button{border-radius:7px;padding:7px 11px;border:1px solid #abc4c0;background:#f1f7f5;color:#183c40;cursor:pointer}',
  '#bm211Dialog img{display:block;max-width:100%;max-height:76vh;object-fit:contain;margin:auto}',
  '#bm211Dialog .bm211Meta{font-size:12px;color:#587175;margin-top:8px}',
  '@media(max-width:540px){#bm211Gallery .bm211Grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}#bm211Gallery .bm211Card img{height:120px}#bm211Gallery .bm211Card{padding:6px}}'
 ].join('\n');
 document.head.append(style);
}
function detail(r){
 return (r.type==='cartao'?'Imagem de cartão':'Imagem de conteúdo')+' · '+(r.origin==='drive'?'Drive publicado':'Histórico')+
  (r.cardIds?.length?' · '+r.cardIds.join(', '):'');
}
async function imageUrl(r){
 if(r.origin==='drive')return r.path;
 const x=r.raw;
 if(x.shard!==undefined&&typeof thumb==='function'){
  try{return await thumb(x)}catch(e){console.warn('Miniatura historica',e)}
 }
 return x.preview_url||x.source_url||'';
}
function showImage(index){
 selected=index;
 const r=matches[index];if(!r)return;
 modalTitle.textContent=r.title;
 modalMeta.textContent=detail(r)+(r.sourceStatus==='reprovada'?' · Atenção: material não aprovado tecnicamente':'');
 modalImg.removeAttribute('src');
 modalImg.alt='Abrindo '+r.title;
 if(!dialog.open)dialog.showModal();
 void imageUrl(r).then(src=>{
  if(selected!==index)return;
  if(src){modalImg.src=src;modalImg.alt=r.title;}
  else modalMeta.textContent+=' · Prévia indisponível';
 }).catch(()=>{modalMeta.textContent+=' · Não foi possível carregar a imagem';});
}
function card(r,index){
 const b=node('button','bm211Card');b.type='button';b.title='Ampliar imagem: '+r.title;
 const pic=node('img');pic.loading='lazy';pic.decoding='async';pic.alt=r.title;
 pic.onerror=()=>{pic.onerror=null;pic.removeAttribute('src');pic.alt='Prévia indisponível: '+r.title;};
 const title=node('strong','',r.title);
 const subtitle=node('small','',detail(r));
 b.append(pic,title,subtitle);
 b.addEventListener('click',()=>showImage(index));
 void imageUrl(r).then(src=>{if(src&&b.isConnected)pic.src=src}).catch(()=>{});
 return b;
}
function refresh(){
 const q=normalize(searchEl.value.trim()),t=typeEl.value,o=originEl.value;
 matches=items.filter(r=>(t==='all'||r.type===t)&&(o==='all'||r.origin===o)&&
  (!q||normalize([r.title,r.name,r.imageId,r.sourceFolder,r.topic,r.subtopic,...(r.cardIds||[])].join(' ')).includes(q)));
 const shown=Math.min(visible,matches.length);
 const frag=document.createDocumentFragment();
 for(let i=0;i<shown;i++)frag.append(card(matches[i],i));
 gridEl.replaceChildren(frag);
 countEl.textContent=matches.length+' imagem(ns) encontrada(s) · exibindo '+shown+
  ' · biblioteca única, sem sincronização manual e sem login do Google';
 moreEl.hidden=shown>=matches.length;
 moreEl.disabled=shown>=matches.length;
}
function mount(records,legacy,editorialMap){
 const panel=$('imagens')?.querySelector('.panel');if(!panel)return;
 css();
 const header=panel.querySelector('h2');if(header)header.textContent='Visualizador de imagens';
 const root=node('div');root.id='bm211Gallery';
 const heading=node('p','',records.length+' imagens do Drive publicadas no GitHub + '+legacy.length+
  ' imagens históricas · IDs preservados; sem duplicação');
 heading.style.cssText='font-size:13px;margin:0;color:#3b6061';
 const controls=node('div','bm211Controls');
 searchEl=node('input');searchEl.type='search';searchEl.placeholder='Buscar imagem, assunto ou cartão';searchEl.setAttribute('aria-label','Buscar imagens');
 typeEl=node('select');typeEl.setAttribute('aria-label','Tipo da imagem');
 for(const [v,label] of [['all','Todos os tipos'],['cartao','Imagem de cartão'],['conteudo','Imagem de conteúdo']])typeEl.add(new Option(label,v));
 originEl=node('select');originEl.setAttribute('aria-label','Origem da imagem');
 for(const [v,label] of [['all','Todas as imagens'],['drive','Drive publicado'],['historico','Histórico']])originEl.add(new Option(label,v));
 controls.append(searchEl,typeEl,originEl);
 countEl=node('div','bm211Count');countEl.setAttribute('role','status');countEl.setAttribute('aria-live','polite');
 gridEl=node('div','bm211Grid');
 moreEl=node('button','bm211More','Mostrar mais imagens');moreEl.type='button';
 root.append(heading,controls,countEl,gridEl,moreEl);panel.append(root);
 dialog=node('dialog');dialog.id='bm211Dialog';
 const bar=node('div','bm211DialogBar'),prev=node('button','','Anterior'),next=node('button','','Próxima'),close=node('button','','Fechar');
 prev.type=next.type=close.type='button';
 modalTitle=node('strong');bar.append(modalTitle,prev,next,close);
 modalImg=node('img');modalMeta=node('p','bm211Meta');dialog.append(bar,modalImg,modalMeta);document.body.append(dialog);
 close.onclick=()=>dialog.close();
 prev.onclick=()=>showImage((selected-1+matches.length)%matches.length);
 next.onclick=()=>showImage((selected+1)%matches.length);
 dialog.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'){e.preventDefault();prev.click();}
  if(e.key==='ArrowRight'){e.preventDefault();next.click();}
 });
 const controlsChanged=()=>{visible=24;refresh();};
 searchEl.oninput=controlsChanged;typeEl.onchange=controlsChanged;originEl.onchange=controlsChanged;
 moreEl.onclick=()=>{visible+=24;refresh();};
 items=records.map(r=>({...r,origin:'drive',sourceFolder:r.sourceFolder||''})).concat(
  legacy.map(x=>{const a=editorialMap.get(x.no)||{};return{
   origin:'historico',imageId:x.no,title:x.title||x.no,name:x.no,
   type:a.type==='cartao'?'cartao':'conteudo',cardIds:Array.isArray(a.cardIds)?a.cardIds:[],
   sourceStatus:a.sourceStatus||x.status||'',topic:x.category||'',subtopic:'',sourceFolder:x.source||'',raw:x
  }}));
 refresh();
 window.BM211Gallery=Object.freeze({version:'V211',count:items.length,publishedDrive:records.length,legacy:legacy.length,refresh});
}
async function init(){
 const section=$('imagens');if(!section)return;
 const panel=section.querySelector('.panel');
 if(!panel||$('bm211Gallery'))return;
 try{
  const responses=await Promise.all([
   fetch(DATA,{cache:'no-store'}),
   fetch(EDITORIAL,{cache:'no-store'})
  ]);
  if(!responses.every(x=>x.ok))throw Error('Catálogo estático ou classificação não disponível');
  const [catalog,editorial]=await Promise.all(responses.map(x=>x.json()));
  if(catalog.schema!=='BancoMestrePublishedDriveImagesV211'||catalog.records?.length!==237||
    new Set(catalog.records.map(x=>x.driveFileId)).size!==237||
    !catalog.records.every(x=>/^assets\/drive-images\/v211\/[A-Za-z0-9_.-]+\.(?:png|jpg|gif|webp|svg)$/.test(x.path)))
   throw Error('Catálogo V211 incompleto ou com caminho inválido');
  const ids=new Set(catalog.records.map(x=>x.driveFileId));
  let legacy=[];
  try{
   if(typeof loadImages==='function')await loadImages();
   if(typeof imgs!=='undefined'&&Array.isArray(imgs))
    legacy=imgs.filter(x=>!ids.has(String(x.driveFileId||x.id||'')));
  }catch(e){console.warn('V211: acervo histórico não carregado; preservado no site V210',e);}
  const ed=new Map((editorial.records||[]).map(x=>[x.imageId,x]));
  mount(catalog.records,legacy,ed);
 }catch(e){
  console.error('V211: visualizador estático indisponível',e);
  const warning=node('p','', 'Visualizador V211 indisponível: '+e.message+'. Acesse a V210 como alternativa.');
  warning.style.color='#953b32';
  panel.append(warning);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});
else void init();
})();