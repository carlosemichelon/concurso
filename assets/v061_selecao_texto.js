/* Banco Mestre V061 — seleção real de texto por camada PDF.js e menu flutuante.
 * Estágio 1: usa as mesmas anotações locais V060; biblioteca/sincronização em etapas futuras.
 */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),wrap=$('pdfPageWrap'),pageCanvas=$('pdfLocalCanvas');
 const marker=$('pdfMarker'),api=()=>window.BancoMestrePDFV042;
 if(!dialog||!wrap||!pageCanvas||!marker||$('bmV061SelectTool'))return;
 const selectBtn=document.createElement('button');
 selectBtn.type='button';selectBtn.id='bmV061SelectTool';
 selectBtn.textContent='▤ Selecionar texto';
 selectBtn.title='Arraste sobre as palavras do PDF. O texto será grifado automaticamente, como na Bússola.';
 selectBtn.setAttribute('aria-pressed','false');
 marker.parentNode.insertBefore(selectBtn,marker);
 selectBtn.addEventListener('click',()=>api()?.selectTextMode?.());
 const info=document.createElement('p');info.id='bmV061SelectHint';info.setAttribute('role','status');
 info.textContent='Seleção por palavras · grifo livre disponível no botão Grifar.';
 const tools=$('pdfLocalTools');
 tools.append(info);
 const popup=document.createElement('div');popup.id='bmV061Popup';
 popup.hidden=true;popup.setAttribute('role','group');
 popup.setAttribute('aria-label','Opções do texto grifado');
 popup.innerHTML='<span id="bmV061PopupLabel">Texto grifado</span><label title="Alterar a cor do grifo">Cor <input type="color" id="bmV061PopupColor" aria-label="Alterar a cor do grifo"></label><button type="button" id="bmV061PopupNote">✎ Nota</button><button type="button" id="bmV061PopupCard">▣ Flashcard</button><button type="button" id="bmV061PopupUndo">↶ Desfazer grifo</button><button type="button" id="bmV061PopupClose" aria-label="Fechar opções">×</button>';
 dialog.append(popup);
 let activeLayer=null,generation=0,activeId=null,lastContext=null;
 const isSelect=()=>api()?.editing&&api()?.currentTool==='select';
 function dismiss(){popup.hidden=true;activeId=null;}
 function sync(){
  const active=!!isSelect();dialog.classList.toggle('bm-v061-text-mode',active);
  selectBtn.setAttribute('aria-pressed',String(active));
  info.textContent=active?'Selecione palavras com o mouse para grifar automaticamente. Sem texto digital? Use Grifar (livre).':'Modo de grifo livre, caneta ou navegação. Use Selecionar texto para marcar palavras.';
  if(!active)dismiss();
 }
 window.addEventListener('bm-pdf-tool-change',sync);
 function validate(c){
  const a=api();return !!(a?.editing&&c&&a.currentPage===c.page&&a.currentId===c.documentId&&a.sourceHash===c.sourceHash);
 }
 function createLayer(){
  const layer=document.createElement('div');layer.className='textLayer bm-v061-text-layer';
  layer.setAttribute('aria-label','Texto do PDF selecionável por arraste');
  layer.setAttribute('data-mode','pdf-native-selection');
  return layer;
 }
 window.addEventListener('bm-pdf-active-page-rendered',async e=>{
  const context=e.detail;
  const serial=++generation;
  dismiss();
  if(activeLayer){activeLayer.remove();activeLayer=null;}
  lastContext=null;
  if(!validate(context))return;
  const next=createLayer();
  try{
   const page=await api().getCurrentPdfPage();
   if(!page||!validate(context)||serial!==generation)return;
   const textContent=await page.getTextContent();
   if(!validate(context)||serial!==generation)return;
   if(!textContent.items?.some(item=>String(item.str||'').trim())){
    info.textContent='Esta página não possui texto digital selecionável. Use Grifar (livre); OCR ficará para outra etapa.';
    return;
   }
   const viewport=page.getViewport({scale:context.viewportScale});
   next.style.width=pageCanvas.style.width;next.style.height=pageCanvas.style.height;
   next.style.setProperty('--scale-factor',String(context.viewportScale));
   const lib=window.pdfjsLib;
   if(!lib?.renderTextLayer)throw Error('PDF.js não forneceu o renderizador da camada textual');
   const job=lib.renderTextLayer({textContentSource:textContent,container:next,viewport,textDivs:[]});
   await job.promise;
   if(!validate(context)||serial!==generation)return;
   wrap.append(next);activeLayer=next;lastContext=context;
   sync();
  }catch(err){
   if(serial===generation&&validate(context)){
    info.textContent='Não foi possível selecionar palavras nesta página. O grifador livre continua disponível.';
    console.warn('V061: camada de texto não carregada:',err);
   }
  }
 });
 function clamp(n){return Math.max(0,Math.min(1,n))}
 function withinLayer(node){return !!(activeLayer&&node&&activeLayer.contains(node.nodeType===3?node.parentNode:node))}
 function rectsFromRange(range){
  const root=wrap.getBoundingClientRect(),boxes=[];
  if(root.width<1||root.height<1)return [];
  for(const r of range.getClientRects()){
   const left=clamp((Math.max(root.left,r.left)-root.left)/root.width);
   const top=clamp((Math.max(root.top,r.top)-root.top)/root.height);
   const right=clamp((Math.min(root.right,r.right)-root.left)/root.width);
   const bottom=clamp((Math.min(root.bottom,r.bottom)-root.top)/root.height);
   if(right-left>.0007&&bottom-top>.001)boxes.push([left,top,right,bottom]);
  }
  boxes.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
  const merged=[];
  for(const b of boxes){
   const prior=merged[merged.length-1];
   if(prior&&Math.abs(prior[1]-b[1])<.003&&Math.abs(prior[3]-b[3])<.004&&b[0]<=prior[2]+.003){
    prior[2]=Math.max(prior[2],b[2]);prior[3]=Math.max(prior[3],b[3]);
   }else merged.push(b.slice());
  }
  return merged.slice(0,250);
 }
 function show(mark,at){
  activeId=mark.id;
  $('bmV061PopupColor').value=mark.color;
  $('bmV061PopupLabel').textContent=mark.text.length>55?mark.text.slice(0,52)+'…':mark.text;
  popup.hidden=false;
  // O menu fica dentro do <dialog>; coordenadas limitadas à área visível.
  const bounds=dialog.getBoundingClientRect(),pw=popup.offsetWidth||355,ph=popup.offsetHeight||45;
  popup.style.left=Math.round(Math.max(8,Math.min(bounds.width-pw-8,at.x-bounds.left)))+'px';
  popup.style.top=Math.round(Math.max(8,Math.min(bounds.height-ph-8,at.y-bounds.top+12)))+'px';
 }
 function capture(){
  if(!isSelect()||!lastContext||!validate(lastContext)||!activeLayer)return;
  const sel=window.getSelection();
  if(!sel||sel.isCollapsed||sel.rangeCount!==1||!withinLayer(sel.anchorNode)||!withinLayer(sel.focusNode))return;
  const text=String(sel.toString()||'').replace(/\u00a0/g,' ').trim();
  if(!text||text.length>20000)return;
  const range=sel.getRangeAt(0);
  const rects=rectsFromRange(range);if(!rects.length)return;
  const last=range.getBoundingClientRect();
  const mark=api().addTextHighlight({text,rects,page:lastContext.page,documentId:lastContext.documentId,sourceHash:lastContext.sourceHash,color:$('pdfInkColor')?.value});
  if(!mark)return;
  sel.removeAllRanges();
  show(mark,{x:last.right,y:last.bottom});
 }
 // A seleção do navegador é concluída após mouseup; realizar na próxima tarefa.
 document.addEventListener('mouseup',e=>{
  if(e.button!==0||!isSelect()||!dialog.open||!activeLayer)return;
  setTimeout(capture,0);
 },true);
 $('bmV061PopupClose').onclick=dismiss;
 $('bmV061PopupColor').addEventListener('input',e=>{
  if(activeId&&api()?.updateTextHighlight(activeId,{color:e.target.value})&&$('pdfInkColor'))$('pdfInkColor').value=e.target.value;
 });
 $('bmV061PopupNote').onclick=()=>{
  if(!activeId)return;
  const mark=api()?.currentMarks?.find(m=>m.id===activeId);if(!mark)return;
  const note=prompt('Anotação associada ao texto grifado:',mark.note||'');
  if(note!==null)api().updateTextHighlight(activeId,{note});
 };
 $('bmV061PopupCard').onclick=()=>{
  if(!activeId)return;
  const mark=api()?.currentMarks?.find(m=>m.id===activeId);if(!mark)return;
  const raw=prompt('Vincular IDs de flashcards já existentes (ex.: CARD-0028, CARD-0078). Não cria cartões automaticamente.',(mark.card_ids||[]).join(', '));
  if(raw===null)return;
  const ids=raw.toUpperCase().split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean);
  if(ids.some(id=>!/^(CARD-\d{4,}|PROP-IJUI-\d+)$/.test(id))){alert('Confira os IDs: use CARD-0001 ou PROP-IJUI-001.');return;}
  api().updateTextHighlight(activeId,{card_ids:ids});
 };
 $('bmV061PopupUndo').onclick=()=>{
  if(activeId)api()?.removeTextHighlight(activeId);
  dismiss();
 };
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!popup.hidden){dismiss();e.stopPropagation();}
 },true);
 dialog.addEventListener('close',()=>{generation++;if(activeLayer){activeLayer.remove();activeLayer=null;}dismiss();lastContext=null;});
 // A sincronização visual inicial ocorre ao abrir uma cópia local do PDF.
 sync();
 window.BancoMestreSelecaoTextoV061={get ready(){return !!activeLayer},get active(){return isSelect()},select(){api()?.selectTextMode?.()}};
})();