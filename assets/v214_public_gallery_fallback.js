/* Banco Mestre V214 - catálogo alternativo de imagens publicadas V211 integradas na biblioteca V1.
 * 93 arquivos originais ja referenciados na V180 e 144 novos, sem duplicar IDs.
 * Mantem o renderizador, filtros, edicao, grifos, cartões e SRS da V1.
 */
(function(){
 'use strict';
 if(window.BM214PublishedGallery)return;
 const DATA='assets/v211_published_images.json?v=213';
 const OLD='assets/v180_native_image_additions.json?v=180';
 const $=id=>document.getElementById(id);
 const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const realImgRender=typeof imgRender==='function'?imgRender:null;
 if(!realImgRender){console.warn('V213: renderizador original da V1 indisponivel');return;}
 let catalogPromise=null,byDrive=new Map(),fresh=[],limit=24,lastFilter='',count=0,error='',button=null,status=null;
 function originalId(r){return 'DRIVE-IMG-'+r.driveFileId;}
 function getLinkData(r){
  return window.BM197MediaLinks?.get?.(originalId(r))||{type:r.type||'conteudo',cardIds:r.cardIds||[]};
 }
 async function ensureCatalog(){
  if(catalogPromise)return catalogPromise;
  catalogPromise=(async()=>{
   const [p,v]=await Promise.all([fetch(DATA,{cache:'no-store'}),fetch(OLD,{cache:'no-store'})]);
   if(!p.ok||!v.ok)throw Error('Catálogos V211/V180 indisponíveis');
   const [a,b]=await Promise.all([p.json(),v.json()]);
   if(a.schema!=='BancoMestrePublishedDriveImagesV211'||a.records?.length!==237||
      b.schema!=='BancoMestreNativeImageAdditionsV180'||b.records?.length!==93)
     throw Error('Quantidade ou formato incompatível dos catálogos');
   const known=new Set(b.records.map(x=>x.driveFileId));
   const ids=new Set();
   for(const r of a.records){
    if(!r.driveFileId||ids.has(r.driveFileId)||!/^assets\/drive-images\/v211\/[A-Za-z0-9_.-]+\.(?:png|jpg|webp|gif|svg)$/.test(r.path))
     throw Error('Arquivo repetido, ausente ou caminho inválido');
    ids.add(r.driveFileId);
   }
   const overlaps=a.records.filter(r=>known.has(r.driveFileId));
   const added=a.records.filter(r=>!known.has(r.driveFileId));
   if(overlaps.length!==93||added.length!==144||a.expectedUnified!==323)
    throw Error('Auditoria de sobreposição divergente; acervo original preservado');
   byDrive=new Map(a.records.map(r=>[r.driveFileId,r]));
   fresh=added;
   const originalThumb=typeof thumb==='function'?thumb:null;
   if(originalThumb){
    thumb=async function(x){
     const id=x?.driveFileId||String(x?.no||'').replace(/^DRIVE-IMG-/,'');
     const media=byDrive.get(id);
     return media?.path||originalThumb(x);
    };
   }
   return true;
  })().catch(e=>{catalogPromise=null;error=e.message;throw e});
  return catalogPromise;
 }
 function make(tag,cls,txt){
  const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;
 }
 function css(){
  if($('bm213-style'))return;
  const style=make('style');style.id='bm213-style';
  style.textContent=[
   '#imagens .bm213StaticImage{min-width:0;display:flex;flex-direction:column;gap:7px;padding:10px}',
   '#imagens .bm213StaticImage .bm213Thumb{display:block;width:100%;height:150px;object-fit:contain;background:#f0f6f4;border-radius:8px;cursor:zoom-in}',
   '#imagens .bm213StaticImage h3{font-size:14px;line-height:1.4;overflow-wrap:anywhere;margin:3px 0}',
   '#imagens .bm213StaticImage .bm213Meta{font-size:11px;color:#536c70;overflow-wrap:anywhere}',
   '#imagens .bm213StaticImage .bm213Actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:auto}',
   '#imagens .bm213StaticImage .bm213Actions button{font-size:12px;padding:7px 9px;min-height:32px}',
   '#imagens #bm213-info{font-size:12px;color:#42666a;padding:7px 2px;margin:2px 0 8px}',
   '#imagens #bm213-more[hidden]{display:none!important}',
   '@media(max-width:680px){#imagens .bm213StaticImage .bm213Thumb{height:132px}}'
  ].join('\n');
  document.head.append(style);
 }
 function controlsKey(){
  const ids=['imageSearch','imageFilter','imageHidden','imageFavoriteV055','bm197-type-filter',
   'bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'];
  return ids.map(id=>{const n=$(id);return id==='imageHidden'?(n?.checked?'1':'0'):(n?.value||'')}).join('|');
 }
 function allowed(r,hidden){
  const type=$('bm197-type-filter')?.value||'todas';
  const d=getLinkData(r);
  if(type!=='todas'&&type!==d.type)return false;
  const q=fold($('imageSearch')?.value?.trim()||'');
  if(q&&!fold([r.title,r.name,r.imageId,r.driveFileId,r.topic,r.subtopic,r.sourceFolder,
    ...(d.cardIds||[]),...(r.questionRefs||[])].join(' ')).includes(q))return false;
  const category=$('imageFilter')?.value||'all';
  if(category!=='all'&&category!=='V213-publicadas')return false;
  const fav=$('imageFavoriteV055')?.value||'all';
  if(fav==='favorites')return false; // nunca presumir que uma nova imagem e favorita
  const hierarchy=window.BM153ImageLibrary?.filters;
  if(hierarchy&&Object.values(hierarchy).some(v=>v!=='all'))return false;
  return ($('imageHidden')?.checked||!hidden.has(originalId(r)));
 }
 function addChoice(){
  const el=$('imageFilter');
  if(el&&![...el.options].some(o=>o.value==='V213-publicadas'))
   el.add(new Option('Imagens novas V213 (144)','V213-publicadas'));
 }
 function addControls(){
  if(!status){
   status=$('bm213-info');
   if(!status){status=make('div');status.id='bm213-info';status.setAttribute('role','status');
    const rows=$('imageRows');rows?.parentElement?.insertBefore(status,rows);}
  }
  if(!button){
   button=$('bm213-more');
   if(!button){
    button=make('button','','Mostrar mais imagens publicadas');button.id='bm213-more';
    button.type='button';button.hidden=true;
    const parent=$('bm153Results')||$('imageRows')?.parentElement;
    parent?.append(button);
    button.onclick=()=>{limit+=24;void drawNew();};
   }
  }
  css();addChoice();
 }
 function mediaCard(r,hidden){
  const id=originalId(r),card=make('article','card bm213StaticImage');
  card.dataset.bm213ImageId=id;
  const preview=make('img','thumb bm213Thumb');
  preview.loading='lazy';preview.decoding='async';preview.src=r.path;
  preview.alt='Ampliar: '+(r.title||r.name);
  preview.title='Abrir imagem original no leitor de imagens da V1';
  preview.tabIndex=0;preview.setAttribute('role','button');
  preview.onerror=()=>{preview.alt='Prévia indisponível - '+(r.title||r.name)};
  const synthetic={no:id,title:r.title||r.name,category:r.topic||r.group||'Imagens Drive publicadas',
    driveFileId:r.driveFileId,source_url:r.path,external:true};
  const open=()=>{if(typeof imgOpen==='function')void imgOpen(synthetic);
   else window.open(r.path,'_blank','noopener');};
  preview.onclick=open;
  preview.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};
  const title=make('h3','',r.title||r.name||id);
  const meta=make('div','bm213Meta',(r.topic||'Assunto a conferir')+
    ' · '+(getLinkData(r).type==='cartao'?'Imagem de cartão':'Imagem de conteúdo')+
    ' · ID '+id);
  const actions=make('div','bm213Actions');
  const openButton=make('button','primary','Ampliar');openButton.type='button';openButton.onclick=open;
  const hide=make('button','',hidden.has(id)?'Restaurar':'Excluir');
  hide.type='button';hide.onclick=async()=>{
   try{await window.BancoMestreImagens.setStatus(id,hidden.has(id)?'visible':'hidden');await imgRender();}
   catch(e){alert('Não foi possível alterar a visibilidade: '+e.message);}
  };
  actions.append(openButton,hide);
  card.append(preview,title,meta,actions);
  if(r.sourceStatus==='reprovada')card.append(make('small','bm213Meta','Atenção: material técnico reprovado'));
  window.BM197MediaLinks?.decorateDrive?.(card,{id:r.driveFileId,name:r.name});
  return card;
 }
 async function drawNew(){
  addControls();
  const rows=$('imageRows');if(!rows)return;
  for(const old of [...rows.querySelectorAll('.bm213StaticImage')])old.remove();
  let hidden=new Set();
  try{hidden=new Set((await window.BancoMestreImagens.all()).filter(x=>x.status==='hidden').map(x=>x.id));}
  catch(e){console.warn('V213: estado de visibilidade indisponível',e);}
  const matching=fresh.filter(r=>allowed(r,hidden)),shown=Math.min(limit,matching.length);
  const frag=document.createDocumentFragment();
  for(const r of matching.slice(0,shown))frag.append(mediaCard(r,hidden));
  rows.append(frag);
  count=matching.length;
  if(status)status.textContent='Atlas V1: 179 imagens anteriores + 144 novas publicadas = 323 imagens distintas. '+
    (matching.length?shown+' de '+matching.length+' novas exibidas nesta busca. ':'Nenhuma imagem nova corresponde aos filtros.')+
    ' As 93 já existentes foram reconhecidas sem duplicação.';
  if(button){button.hidden=shown>=matching.length;button.disabled=shown>=matching.length;}
  window.BM209SingleImageViewer?.refresh?.();
 }
 imgRender=async function(...args){
  const key=controlsKey();if(key!==lastFilter){limit=24;lastFilter=key;}
  try{await ensureCatalog();}
  catch(e){
   await realImgRender(...args);
   addControls();
   if(status)status.textContent='Imagens V213 ainda indisponíveis: '+e.message+
    '. O acervo anterior da V1 permanece acessível.';
   return;
  }
  // Preferir as cópias estáticas integrais das 93 imagens já catalogadas,
  // sem editar a classificação, o conteúdo do Drive nem os IDs da V180.
  if(Array.isArray(imgs)&&typeof origMap==='object'&&origMap){
   for(const item of imgs){
    const media=item.driveFileId&&byDrive.get(item.driveFileId);
    if(media)origMap[item.no]={...(origMap[item.no]||{}),verified:true,
     preview_url:media.path,source_url:media.path};
   }
  }
  await realImgRender(...args);
  await drawNew();
 };
 window.BM214PublishedGallery=Object.freeze({
  get ready(){return Boolean(fresh.length===144);},
  get total(){return fresh.length+179;},
  get additional(){return fresh.length;},
  get displayedAdditional(){return Math.min(limit,count);},
  get error(){return error;},
  refresh:()=>imgRender()
 });
})();
