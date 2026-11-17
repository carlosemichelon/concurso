/* Banco Mestre V2 — visualização de grifos V1 sobre PDF renderizado.
 * Somente leitura, por ID+hash+P; não utiliza cookie/Drive para PDF.js.
 * Os bytes recebidos são somente os que o usuário já abriu no leitor V2.
 */
import {readLegacyPage,renderLegacyAnnotations} from './pdf-overlay.js';

const model={bytes:null,docId:'',hash:'',report:null,pdf:null,task:null,serial:0};
let loader=null;
const el=(tag,cls='',label)=>{
 const x=document.createElement(tag);if(cls)x.className=cls;
 if(label!==undefined)x.textContent=String(label);return x;
};
const $=id=>document.getElementById(id);
const say=(value,invalid=false)=>{
 const note=$('v2PdfReaderNote');if(!note)return;
 note.textContent=value;note.classList.toggle('is-error',invalid);
};
function forgetRendering(){
 model.serial++;
 try{model.task?.cancel?.()}catch(_){}
 model.task=null;
 if(model.pdf){const obj=model.pdf;model.pdf=null;
  try{const result=obj.destroy?.();result?.catch?.(()=>{})}catch(_){}}
}
export function resetPdfOverlay(){
 forgetRendering();
 model.bytes=null;model.docId='';model.hash='';model.report=null;
 const btn=$('v2PdfOverlayShow');if(btn)btn.disabled=true;
 const view=$('v2PdfOverlayView');
 if(view){view.hidden=true;view.setAttribute('aria-hidden','true')}
 const frame=$('v2PdfReaderFrame');if(frame)frame.hidden=false;
 const nav=$('v2PdfOverlayNav');if(nav)nav.replaceChildren();
 // Preservar os dois canvases estáveis do modal; apagar somente seus pixels.
 for(const id of ['v2PdfOverlayBase','v2PdfOverlayInk']){
  const canvas=$(id);
  if(canvas){canvas.width=1;canvas.height=1;canvas.style.width='1px';canvas.style.height='1px'}
 }
 const stage=$('v2PdfOverlayStage');
 if(stage){stage.style.width='1px';stage.style.height='1px'}
}
export function preparePdfOverlay(buffer,documentId,hash){
 resetPdfOverlay();
 if(!(buffer instanceof ArrayBuffer)||!buffer.byteLength)throw Error('PDF sem bytes compatíveis');
 model.bytes=buffer.slice(0);
 model.docId=String(documentId||'');model.hash=String(hash||'');
}
export function enablePdfOverlay(report){
 if(!model.bytes||!model.docId||!model.hash)return;
 if(report?.documentId!==model.docId||report?.hash!==model.hash)
  throw Error('Auditoria de grifos pertence a uma revisão diferente');
 model.report=report;
 const btn=$('v2PdfOverlayShow');
 if(btn)btn.disabled=report.counts.marks===0;
}
async function loadPdfjs(){
 if(globalThis.pdfjsLib?.getDocument)return globalThis.pdfjsLib;
 if(loader)return loader;
 loader=(async()=>{
  for(const url of [
   'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
   'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
  ]){
   try{
    await new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     script.src=url;script.async=true;script.crossOrigin='anonymous';
     script.referrerPolicy='no-referrer';
     script.addEventListener('load',resolve,{once:true});
     script.addEventListener('error',()=>reject(Error('Biblioteca PDF.js indisponível')),{once:true});
     document.head.append(script);
    });
    if(globalThis.pdfjsLib?.getDocument){
     globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc=
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
     return globalThis.pdfjsLib;
    }
   }catch(_){}
  }
  throw Error('Não foi possível carregar PDF.js. A visualização original continua disponível.');
 })().catch(e=>{loader=null;throw e});
 return loader;
}
async function renderPage(pageNo){
 const sequence=++model.serial;
 const instance=model.pdf;
 if(!instance||!model.report||!model.docId)return;
 try{
  try{model.task?.cancel?.()}catch(_){}
  const page=await instance.getPage(pageNo);
  if(model.serial!==sequence)return;
  const raw=page.getViewport({scale:1});
  const stage=$('v2PdfOverlayStage');
  const maxWidth=Math.max(280,Math.min(stage.parentElement?.clientWidth||820,1000));
  const scale=Math.min(2,Math.max(.25,maxWidth/Math.max(raw.width,1)));
  const viewport=page.getViewport({scale});
  const pixelRatio=Math.min(devicePixelRatio||1,2);
  const width=Math.max(1,Math.round(viewport.width*pixelRatio));
  const height=Math.max(1,Math.round(viewport.height*pixelRatio));
  if(width*height>20000000)throw Error('Página grande demais para visualização protegida');
  const base=$('v2PdfOverlayBase'),ink=$('v2PdfOverlayInk');
  for(const canvas of [base,ink]){
   canvas.width=width;canvas.height=height;
   canvas.style.width=viewport.width+'px';
   canvas.style.height=viewport.height+'px';
  }
  stage.style.width=viewport.width+'px';stage.style.height=viewport.height+'px';
  const ctx=base.getContext('2d',{alpha:false});
  model.task=page.render({canvasContext:ctx,viewport,
    transform:pixelRatio===1?undefined:[pixelRatio,0,0,pixelRatio,0,0]});
  await model.task.promise;
  if(model.serial!==sequence)return;
  const marks=readLegacyPage(localStorage,model.docId,model.hash,pageNo);
  // Desenhar diretamente no canvas rasterizado, como na V1: 'multiply' preserva
  // o texto escuro e 'conceal' branco mantém seu efeito de ocultação.
  const result=renderLegacyAnnotations(ctx,marks.marks,width,height);
  say('Página '+pageNo+' de '+instance.numPages+' · '+result.drawn+
    ' grifo(s) V1 exibido(s) · '+marks.removed+' excluído(s) · '+
    result.skipped+' sem geometria. Não houve gravação.');
 }catch(error){
  if(model.serial===sequence&&error?.name!=='RenderingCancelledException')
   say('Renderização da página '+pageNo+' não concluída: '+error.message,true);
 }
}
async function show(){
 if(!model.bytes||!model.docId||!model.hash||!model.report)return;
 const button=$('v2PdfOverlayShow');
 if(!button||button.disabled)return;
 button.disabled=true;
 const sequence=++model.serial;
 try{
  say('Preparando prévia visual dos grifos V1 (apenas leitura)...');
  const lib=await loadPdfjs();
  if(sequence!==model.serial||!$('v2PdfDialog')?.open)return;
  if(!model.pdf){
   const task=lib.getDocument({data:new Uint8Array(model.bytes.slice(0))});
   model.pdf=await task.promise;
  }
  if(sequence!==model.serial||!$('v2PdfDialog')?.open)return;
  const count=model.pdf.numPages;
  if(!Number.isInteger(count)||count<1||count>25000)
   throw Error('Número de páginas do PDF não reconhecido');
  const frame=$('v2PdfReaderFrame'),view=$('v2PdfOverlayView');
  frame.hidden=true;view.hidden=false;view.setAttribute('aria-hidden','false');
  const nav=$('v2PdfOverlayNav');nav.replaceChildren();
  const prev=el('button','','Anterior');prev.type='button';prev.id='v2PdfOverlayPrev';
  const next=el('button','','Próxima');next.type='button';next.id='v2PdfOverlayNext';
  const label=el('label','','Página');label.htmlFor='v2PdfOverlayPage';
  const select=el('select');select.id='v2PdfOverlayPage';
  for(let page=1;page<=count;page++){
   const option=el('option','',String(page));option.value=String(page);select.append(option);
  }
  const navigate=page=>{
   if(!Number.isInteger(page)||page<1||page>count)return;
   select.value=String(page);prev.disabled=page===1;next.disabled=page===count;
   void renderPage(page);
  };
  prev.addEventListener('click',()=>navigate(Number(select.value)-1));
  next.addEventListener('click',()=>navigate(Number(select.value)+1));
  select.addEventListener('change',()=>navigate(Number(select.value)));
  const original=el('button','','PDF original');original.id='v2PdfOverlayOriginal';original.type='button';
  original.addEventListener('click',()=>{
   model.serial++;try{model.task?.cancel?.()}catch(_){}
   view.hidden=true;view.setAttribute('aria-hidden','true');frame.hidden=false;
   say('Modo original sem grifos sobrepostos. Dados históricos preservados.');
  });
  nav.append(prev,label,select,next,original);
  navigate(model.report.pages.find(x=>x.page>=1&&x.page<=count)?.page||1);
 }catch(error){
  if(sequence===model.serial){
   const frame=$('v2PdfReaderFrame'),view=$('v2PdfOverlayView');
   frame.hidden=false;view.hidden=true;view.setAttribute('aria-hidden','true');
   say('Visualização com grifos indisponível: '+error.message,true);
  }
 }finally{if(model.report&&model.bytes)button.disabled=false}
}
export function installPdfOverlay(panel,frame){
 if($('v2PdfOverlayView'))return;
 const tools=panel.querySelector('.v2-pdf-controls');
 if(!tools)return;
 const button=el('button','','Exibir grifos sobre o PDF');
 button.type='button';button.id='v2PdfOverlayShow';button.disabled=true;
 button.addEventListener('click',()=>{void show()});
 tools.append(button);
 const section=el('section','v2-pdf-overlay-view');
 section.id='v2PdfOverlayView';section.hidden=true;section.setAttribute('aria-hidden','true');
 const nav=el('div','v2-pdf-overlay-nav');nav.id='v2PdfOverlayNav';
 const stage=el('div','v2-pdf-overlay-stage');stage.id='v2PdfOverlayStage';
 const base=el('canvas','v2-pdf-overlay-base');base.id='v2PdfOverlayBase';
 const ink=el('canvas','v2-pdf-overlay-ink');ink.id='v2PdfOverlayInk';
 ink.setAttribute('aria-label','Grifos históricos V1: visualização sem edição');
 ink.style.pointerEvents='none';
 stage.append(base,ink);section.append(nav,stage);
 frame.insertAdjacentElement('afterend',section);
}
