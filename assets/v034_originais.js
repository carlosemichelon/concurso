
/* V034: fontes integrais de imagem, nunca ampliar uma miniatura como original.
 * Armazenamento opcional em IndexedDB preserva original local e grifos por ID.
 * Não publica arquivos, não altera SRS, não substitui o catálogo original. */
(function(){
'use strict';
const DB_NAME='BancoMestreFontesV034',STORE='sources';
const byId=id=>document.getElementById(id);
let dbPromise,activeChoice=null,candidates=null,dimensions=null,loadedPromise=null;
function db(){
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('IndexedDB indisponível'));
 });
 return dbPromise;
}
async function tx(mode,op){
 const conn=await db();return new Promise((resolve,reject)=>{
  const tr=conn.transaction(STORE,mode),req=op(tr.objectStore(STORE));
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Armazenamento de originais indisponível'));
 });
}
function read(id){return tx('readonly',s=>s.get(id)).catch(()=>null)}
function write(id,file){return tx('readwrite',s=>s.put({id,blob:file,name:file.name,bytes:file.size,modified:file.lastModified,format:file.type,savedAt:new Date().toISOString()}))}
async function getSources(){
 if(!loadedPromise)loadedPromise=Promise.all([
  fetch('assets/originais_candidatos_v028.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null),
  fetch('assets/auditoria_imagens_v024.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null)
 ]).then(([o,a])=>{
  candidates=o?.images||{};dimensions=new Map((a?.images||[]).map(x=>[x.id,{w:x.width,h:x.height}]));
 });
 return loadedPromise;
}
function imageFrom(src){
 return new Promise((ok,fail)=>{
  const image=new Image();image.onload=()=>ok(image);
  image.onerror=()=>fail(Error('A fonte não carregou neste navegador'));
  image.src=src;
 });
}
function ratioOkay(id,image){
 const old=dimensions?.get(id);if(!old?.w||!old?.h||!image.naturalWidth||!image.naturalHeight)return true;
 const a=old.w/old.h,b=image.naturalWidth/image.naturalHeight;
 return Math.abs(a/b-1)<0.055;
}
function viewerHint(id,url,quality){
 return quality+'. '+(url?'Arquivo fonte do Drive disponível no botão Original. ':'')+
 'A edição gráfica fica no navegador; se o Drive bloquear a exportação por origem cruzada, escolha uma cópia local do original.';
}
async function openEditor(x,image,quality,sourceUrl,warning){
 await BancoMestreEditorV030.open({
  image,imageId:x.no,title:x.title,quality,sourceUrl:sourceUrl||'',
  warning:warning||viewerHint(x.no,sourceUrl,quality),
  onExclude:async id=>{await api.setStatus(id,'hidden');await imgRender()}
 });
 const btn=byId('v034SelectOriginal');
 if(btn){btn.hidden=false;btn.onclick=()=>pick(x)}
}
function pick(x){
 activeChoice=x;
 const input=byId('v034OriginalPicker');
 if(!input){alert('Seleção de original indisponível');return}
 input.value='';input.click();
}
async function localOpen(x,record){
 const url=URL.createObjectURL(record.blob);
 try{
  const img=await imageFrom(url);
  await openEditor(x,img,'Original local '+img.naturalWidth+'×'+img.naturalHeight+' px · '+record.name,
   x.source_url||candidates?.[x.no]?.source_url||'',
   'Fonte original escolhida para este ID e armazenada apenas neste navegador. Grifos continuam vinculados ao ID. Nenhum arquivo foi publicado.');
 }finally{URL.revokeObjectURL(url)}
}
const fileInput=byId('v034OriginalPicker');
if(fileInput)fileInput.onchange=async function(){
 const file=this.files?.[0],x=activeChoice;this.value='';
 if(!file||!x)return;
 if(!file.type.startsWith('image/')&&!/\.(png|jpe?g|webp|bmp|gif|svg)$/i.test(file.name)){
  alert('Selecione uma imagem original (PNG, JPG, WebP ou SVG).');return;
 }
 if(file.size>45000000){alert('Imagem acima de 45 MB; escolha outra fonte integral.');return}
 if(!confirm('Associar o arquivo "'+file.name+'" ao ID '+x.no+' — '+x.title+'? Confira se é exatamente a mesma imagem.'))return;
 await getSources();
 const url=URL.createObjectURL(file);
 try{
  const img=await imageFrom(url);
  if(!ratioOkay(x.no,img)){alert('Proporção incompatível com a imagem catalogada. Associação cancelada para não deslocar os grifos.');return}
 }catch(e){alert('Imagem ilegível: '+e.message);return}
 finally{URL.revokeObjectURL(url)}
 try{await write(x.no,file)}catch(e){console.warn('Original não persistiu:',e);alert('A fonte abrirá, mas não pôde ser armazenada para acessos futuros.')}
 const oldModal=byId('imageDialog');if(oldModal?.open)oldModal.close();
 await localOpen(x,{blob:file,name:file.name});
};
const previousImgOpen=imgOpen;
imgOpen=async function(x){
 if(!x?.no)return previousImgOpen(x);
 try{
  await getSources();
  const local=await read(x.no);
  if(local?.blob){await localOpen(x,local);return}
  const candidate=x.external?{preview_url:x.preview_url,source_url:x.source_url,kind:'recorte do Drive'}:candidates?.[x.no];
  if(candidate?.preview_url){
   try{
    const image=await imageFrom(candidate.preview_url);
    if(!ratioOkay(x.no,image))throw Error('Proporção divergente do registro');
    const quality=(x.external?'Recorte do Drive':'Arquivo integral WebP da coleção otimizada no Drive')+' · '+image.naturalWidth+'×'+image.naturalHeight+' px';
    await openEditor(x,image,quality,candidate.source_url,
     viewerHint(x.no,candidate.source_url,quality)+(x.external?'':' Correspondência atribuída pelo nome; confira o conteúdo.'));
    return;
   }catch(e){console.warn('Fonte maior indisponível',x.no,e)}
  }
  // Pranchas P08 mantêm imagens integrais nos próprios shards JSON (sem
  // baixa resolução extra quando já têm dimensões adequadas).
  if(x.shard!==undefined){
   const full=await thumb(x);
   if(full){
    const image=await imageFrom(full);
    if(image.naturalWidth>=900||image.naturalHeight>=1200){
     await openEditor(x,image,'Arquivo integral do acervo '+image.naturalWidth+'×'+image.naturalHeight+' px',null);
     return;
    }
   }
  }
  const use=confirm('Não há fonte original em resolução suficiente confirmada para '+x.no+'. Deseja selecionar a imagem original neste computador? Ela ficará apenas neste navegador.');
  if(use){pick(x);return}
  const target=candidates?.[x.no]?.source_url||x.source_url;
  if(target&&confirm('Abrir o arquivo catalogado no Drive em nova aba?'))window.open(target,'_blank','noopener,noreferrer');
 }catch(e){alert('Não foi possível abrir a imagem na fonte original: '+e.message)}
};
const previousImgRender=imgRender;
imgRender=async function(){
 await previousImgRender();await getSources();
 for(const a of byId('imageRows').querySelectorAll('article.card')){
  const id=a.querySelector(':scope > .tag')?.textContent?.trim();
  const im=imgs.find(x=>x.no===id);if(!im)continue;
  const btns=a.querySelector('.buttons');
  if(!btns?.querySelector('.v034-local')){
   const b=document.createElement('button');b.className='v034-local';b.textContent='Usar original';b.title='Escolher e guardar localmente o arquivo original deste ID';
   b.onclick=()=>pick(im);btns.prepend(b);
  }
  if(candidates?.[id]?.source_url&&!btns.querySelector('.v034-drive')){
   const l=document.createElement('a');l.className='action v034-drive';l.href=candidates[id].source_url;
   l.target='_blank';l.rel='noopener noreferrer';l.textContent='Fonte no Drive';btns.append(l);
  }
  const local=await read(id);
  if(local&&!a.querySelector('.v034-origin')){
   const note=document.createElement('small');note.className='v034-origin';note.textContent='Original local vinculado ao ID';a.append(note);
  }
 }
};
window.BancoMestreOriginaisV034={pick,read,getSources,open:id=>{const x=meta?.images?.find(t=>t.no===id);if(x)return imgOpen(x)}};
})();