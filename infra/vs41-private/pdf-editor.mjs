// Keep the original PDF renderer and tools; private page snapshots replace browser storage.
export function privatePdfEditor(source){
 const a=source.indexOf('/* 3 assets/pdf_v122.js */'),b=source.indexOf('/* 4 assets/',a);
 if(a<0||b<0)throw Error('Contrato editor PDF divergente');
 let s=source.slice(a,b);
 const replace=(x,y)=>{if(s.split(x).length!==2)throw Error('Contrato editor divergente: '+x.slice(0,100));s=s.replace(x,y)};
 function block(x,y,v){const i=s.indexOf(x),j=s.indexOf(y,i+x.length);if(i<0||j<0)throw Error('Contrato editor divergente: '+x);s=s.slice(0,i)+v+'\n'+s.slice(j)}
 block('async function storeFile(id,file){','function key(page=pageNo){',`async function storeFile(){return false}
 async function storedFile(){return null}
 `);
 block('function annotations(page=pageNo){','let annotationsInView=[];',`const privatePages=new Map();let privateBusy=false,privateError=false,privateEpoch=0;
 async function ensurePage(page){
  const k=key(page),epoch=privateEpoch,doc=selected.id,hash=info.hash;
  if(privatePages.has(k))return;
  const row=await window.BMVS41PrivateAnnotations.get(doc,page);
  if(epoch!==privateEpoch||selected?.id!==doc||info?.hash!==hash||row.hash!==hash)throw Error('Versão do PDF ou sessão alterada');
  privatePages.set(k,row);
 }
 function annotations(page=pageNo){
  if(!info||!selected)return [];
  return structuredClone(privatePages.get(key(page))?.marks||[]).filter(m=>m&&!m.bm108_deleted_at);
 }
 function privateReady(){return !!info&&!!selected&&privatePages.has(key())&&!privateBusy&&!privateError}
 function storeStrokes(){
  if(!privateReady()){if(info&&selected)annotationsInView=annotations();status('Grifos não confirmados. Reabra a página antes de alterar.');return false}
  const k=key(),prior=privatePages.get(k),epoch=privateEpoch,marks=structuredClone(annotationsInView),doc=selected.id,page=pageNo,hash=info.hash;
  const input={event_id:crypto.randomUUID(),hash,previous:prior.revision,marks};
  privateBusy=true;controls(false);status('Gravando grifos privados…');
  void window.BMVS41PrivateAnnotations.save(doc,page,input).then(row=>{
   if(epoch!==privateEpoch)return;
   if(row.revision!==input.event_id||row.hash!==hash)throw Error('Revisão divergente');
   privatePages.set(k,row);status('Grifos privados gravados e conferidos.');
   window.dispatchEvent(new CustomEvent('bm-vs41-annotations-confirmed',{detail:{documentId:doc,page,revision:row.revision}}));
  }).catch(e=>{if(epoch===privateEpoch){privateError=true;if(selected?.id===doc&&pageNo===page){annotationsInView=annotations();paint()}status('Gravação não confirmada: '+e.message+'. Reabra o PDF para conferir.')}})
  .finally(()=>{if(epoch===privateEpoch){privateBusy=false;controls(!!pdf)}});
  return true;
 }
 `);
 replace('function controls(open){','function controls(open){\n open=open&&privateReady();');
 replace('if(pinchBlocked||!pdf||painting||exportBusy||tool===\'pan\'||e.button>0)return;','if(!privateReady()||pinchBlocked||!pdf||painting||exportBusy||tool===\'pan\'||e.button>0)return;');
 replace('function historyEdit(type){','function historyEdit(type){\n if(!privateReady())return;');
 replace('  annotationsInView=annotations();','  await ensurePage(pageNo);if(ticket!==serial||!pdf)return;\n  annotationsInView=annotations();');
 replace(' const marks=annotations(target);',' await ensurePage(target);if(ticket!==serial||!pdf)return;\n const marks=annotations(target);');
 replace('function close(){','function close(){\n privateEpoch++;privatePages.clear();privateBusy=false;privateError=false;');
 replace("  info={name,size:blob.size,hash:''};info.hash=await hashBuffer(buf);","  info={name,size:blob.size,hash:''};info.hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buf))].map(x=>x.toString(16).padStart(2,'0')).join('');");
 replace("pageNo=savedPage(current.id,info.hash,pdf.numPages);","pageNo=1;");
 replace('function saveCurrentPage(){','function saveCurrentPage(){return;');
 replace("   try{strokes=JSON.parse(localStorage.getItem(storageKey)||'[]')}","   try{await ensurePage(k);strokes=annotations(k)}");
 replace(" if(!pdf||!sourceBytes||!info||!selected||exportBusy)"," if(!privateReady()||!pdf||!sourceBytes||!info||!selected||exportBusy)");
 // Original API methods remain for other modules, but the isolated path never invokes browser cache or Drive OAuth.
 replace("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","/test-pdfjs/pdf.min.js");
 replace("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js","/test-pdfjs/pdf.min.js");
 replace("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js","/test-pdfjs/pdf.worker.min.js");
 const marker='window.BancoMestrePDFV035=';
 replace(marker,`window.BMVS41PrivatePdfEditor=Object.freeze({
  async open(doc,blob){
   if(privateBusy)throw Error('Aguarde a confirmação dos grifos');
   close();selected=doc;
   if(!$('pdfDialog').open||!Array.isArray(doc.card_ids)||!doc.card_ids.length||blob.type!=='application/pdf')throw Error('PDF privado indisponível');
   $('pdfOriginal').hidden=true;$('pdfChooseLocal').hidden=true;
   await openBytes(blob,doc.title+'.pdf',false);
   if(!pdf||!privateReady())throw Error('PDF ou grifos não confirmados');
   $('pdfChangeFile').disabled=true;
   return true;
  },
  get busy(){return privateBusy},get confirmed(){return privateReady()}
 });
 document.addEventListener('click',e=>{if(privateBusy&&e.target.closest?.('#pdfClose,#bmV056ClosePDF')){e.preventDefault();e.stopImmediatePropagation();status('Aguarde a confirmação dos grifos.')}},true);
 $('pdfDialog').addEventListener('cancel',e=>{if(privateBusy)e.preventDefault()});
 `+marker);
 replace(" for(const id of menu)canUse(id,open);"," for(const id of menu)canUse(id,open);canUse('pdfChangeFile',false);");
 replace("function addTextHighlight(r){","function addTextHighlight(r){if(!privateReady())return null;");
 replace("function addTextHighlights(records){","function addTextHighlights(records){if(!privateReady())return null;");
 replace("function updateTextHighlight(id,patch){","function updateTextHighlight(id,patch){if(!privateReady())return false;");
 // No additional local save paths on this private editor.
 return source.slice(0,a)+s+source.slice(b);
}
