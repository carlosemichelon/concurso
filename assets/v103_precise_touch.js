/* V103 — TOQUE EM DUAS ETAPAS NO CELULAR, MANTENDO SELETOR GEOMÉTRICO V089.
 * V094 — APENAS seletor V089 por coordenadas, acoplado ao menu original V070.
 * Nenhuma paleta, barra, classificação ou escrita nova; tudo continua no V070.
 */
(function(){
 'use strict';
 if(window.BancoMestrePreciseSelectV094)return;
 const root=document.getElementById('pdfDialog'),
       wrap=document.getElementById('pdfPageWrap'),
       canvas=document.getElementById('pdfLocalCanvas'),
       engine=window.BancoMestrePreciseCoreV089,
       api=()=>window.BancoMestrePDFV042,
       grifos=()=>window.BancoMestreGrifadorV068;
 if(!root||!wrap||!canvas||!engine||!grifos()?.acceptPreciseSelection)return;
 const overlay=document.createElement('div');
 overlay.id='bm094WordPointer';overlay.hidden=true;
 overlay.setAttribute('aria-label','Seleção precisa: toque na primeira e na última palavra da mesma coluna ou arraste.');
 const preview=document.createElement('div');preview.id='bm094RectPreview';
 preview.setAttribute('aria-hidden','true');overlay.append(preview);
 wrap.append(overlay);
 let source=null,ordered=[],start=null,down=null,ticket=0;
 const mobile=window.matchMedia?.('(pointer:coarse)')||{matches:false};
 const statusLine=document.createElement('div');statusLine.id='bm103SelectStage';
 statusLine.setAttribute('role','status');statusLine.setAttribute('aria-live','polite');
 const stageText=document.createElement('span');stageText.id='bm103SelectStageText';
 const cancelButton=document.createElement('button');cancelButton.type='button';
 cancelButton.id='bm103CancelSelection';cancelButton.textContent='Cancelar';
 cancelButton.setAttribute('aria-label','Cancelar o ponto inicial de seleção');
 statusLine.append(stageText,cancelButton);
 const content=root.querySelector('.bm-v046-pdf-content');
 if(content)content.append(statusLine);else root.append(statusLine);
 function stage(){
  const show=mobile.matches&&active();
  statusLine.hidden=!show;
  stageText.textContent=start?'2/2 · Toque na última palavra':'1/2 · Toque na primeira palavra';
  cancelButton.hidden=!start;
 }
 cancelButton.addEventListener('click',()=>{reset();message('Seleção cancelada. Toque na primeira palavra.');stage()});
 const hint=()=>document.getElementById('bm068ModeHint');
 const message=s=>{if(hint())hint().textContent=String(s)};
 function active(){
  const a=api();return !!(source&&root.open&&a?.editing&&
   a.currentTool==='select'&&a.currentId===source.documentId&&
   a.currentPage===source.page&&a.sourceHash===source.hash);
 }
 function draw(words,focus){
  preview.replaceChildren();
  if(!source||!words)return;
  for(const w of words.slice(0,180)){
   const s=document.createElement('span');
   s.className=focus?'bm094-focus-word':'bm094-word-rect';
   s.style.left=(w.x0/source.width*100)+'%';
   s.style.top=(w.y0/source.height*100)+'%';
   s.style.width=((w.x1-w.x0)/source.width*100)+'%';
   s.style.height=((w.y1-w.y0)/source.height*100)+'%';
   preview.append(s);
  }
 }
 function reset(){start=null;down=null;draw([]);stage()}
 function clear(){
  ++ticket;source=null;ordered=[];reset();overlay.hidden=true;
  root.classList.remove('bm094-precise');statusLine.hidden=true;
 }
 function toggle(){
  const on=active();
  overlay.hidden=!on;
  root.classList.toggle('bm094-precise',on);
  if(!on)reset();
  stage();
  if(on)message('Clique na primeira e na última palavra da mesma coluna, ou arraste para selecionar.');
 }
 function point(e){
  if(!source)return null;
  const box=wrap.getBoundingClientRect();
  if(!box.width||!box.height)return null;
  return {x:(e.clientX-box.left)*source.width/box.width,
          y:(e.clientY-box.top)*source.height/box.height};
 }
 function nearest(e){
  const p=point(e);if(!p)return null;
  return engine.nearest(ordered,p.x,p.y,start?.column??null);
 }
 function selected(end){
  if(!start||!end||!source)return null;
  return engine.selectRange(ordered,start,end,{width:source.width,height:source.height});
 }
 function finish(end,e){
  const value=selected(end);
  if(!value?.ok){message(value?.error||'Seleção inválida. Escolha palavras da mesma coluna.');return}
  const adopted=grifos()?.acceptPreciseSelection({...value,ok:true,
    width:source.width,height:source.height},{x:e.clientX,y:e.clientY});
  if(!adopted){message('A seleção não pôde ser aplicada: tente selecionar novamente.');return}
  reset();
 }
 function existing(e){
  const p=point(e);if(!p)return false;
  const x=p.x/source.width,y=p.y/source.height;
  const old=(api()?.currentMarks||[]).slice().reverse().find(m=>
   m.type==='text_highlight'&&Array.isArray(m.rects)&&
   m.rects.some(r=>Array.isArray(r)&&r.length===4&&
    x>=r[0]-.003&&x<=r[2]+.003&&y>=r[1]-.005&&y<=r[3]+.005));
  if(!old?.id)return false;
  reset();grifos()?.openMark?.(old.id);
  message('Grifo existente aberto para editar na interface V070.');
  return true;
 }
 overlay.addEventListener('pointerdown',e=>{
  if(!active()||e.button!==0||e.isPrimary===false)return;
  const p=nearest(e);
  if(!p){message('Toque sobre uma palavra para definir a seleção.');return}
  const isTouch=e.pointerType==='touch'||(mobile.matches&&e.pointerType!=='mouse');
  down={x:e.clientX,y:e.clientY,pointerType:e.pointerType,wasSet:!!start,candidate:p};
  if(isTouch){
   // O ponto só é aceito quando o dedo é levantado sem movimento:
   // deslizar verticalmente continua rolando a página naturalmente.
   return;
  }
  if(start&&start.column!==p.column){
   reset();message('Selecione uma coluna por vez. Comece novamente.');return;
  }
  if(!start){start=p;draw([p],true);
   message('Primeira palavra: '+p.text+'. Clique na última palavra ou arraste.');
  }
  try{overlay.setPointerCapture(e.pointerId)}catch{}
  stage();e.preventDefault();
 });
 overlay.addEventListener('pointermove',e=>{
  if(!down||!active())return;
  if(down.pointerType==='touch'||(mobile.matches&&down.pointerType!=='mouse'))return;
  if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<7)return;
  const w=nearest(e),value=selected(w);
  if(value?.ok){draw(value.words);message('Prévia: '+value.words.length+' palavras.')}
 });
 overlay.addEventListener('pointerup',e=>{
  if(!down||!active())return;
  const old=down;down=null;
  try{if(overlay.hasPointerCapture(e.pointerId))overlay.releasePointerCapture(e.pointerId)}catch{}
  const moved=Math.hypot(e.clientX-old.x,e.clientY-old.y)>10;
  const isTouch=old.pointerType==='touch'||(mobile.matches&&old.pointerType!=='mouse');
  const w=nearest(e);
  if(isTouch){
   if(moved){stage();return} // rolagem, não seleção acidental
   if(!w){message('Toque diretamente em uma palavra.');return}
   if(start&&start.column!==w.column){
    reset();message('A seleção deve ficar na mesma coluna. Comece novamente.');return;
   }
   if(old.wasSet){finish(w,e);stage();return}
   if(existing(e)){stage();return}
   start=w;draw([w],true);stage();
   message('Início definido: '+w.text+'. Toque na última palavra da mesma coluna.');
   return;
  }
  if(moved){if(w)finish(w,e);else message('Fim fora da coluna. Selecione novamente.');return}
  if(old.wasSet){if(w)finish(w,e);return}
  if(existing(e))return;
  stage();
 });
 overlay.addEventListener('pointercancel',()=>{down=null});
 overlay.addEventListener('contextmenu',e=>{e.preventDefault();reset();message('Seleção cancelada.')});
 window.addEventListener('bm-pdf-tool-change',toggle);
 window.addEventListener('bm-pdf-active-page-rendered',async e=>{
  const t=++ticket;
  source=null;ordered=[];reset();overlay.hidden=true;
  root.classList.remove('bm094-precise');
  const c=e.detail||{},a=api();
  if(!a?.editing||a.currentId!==c.documentId||a.currentPage!==c.page||
    a.sourceHash!==c.sourceHash)return;
  try{
   const page=await a.getCurrentPdfPage();
   if(t!==ticket||!page)return;
   const content=await page.getTextContent({normalizeWhitespace:false});
   if(t!==ticket)return;
   const viewport=page.getViewport({scale:c.viewportScale});
   const words=engine.buildWords(content,viewport,window.pdfjsLib?.Util,canvas);
   if(!words.length){message('Este PDF não disponibiliza palavras posicionadas para seleção precisa.');return}
   const cuts=engine.detectColumns(words,viewport.width,viewport.height);
   const list=engine.readingOrder(words,cuts);
   if(t!==ticket||a.currentId!==c.documentId||a.currentPage!==c.page)return;
   ordered=list;
   source={page:c.page,documentId:c.documentId,hash:c.sourceHash,
           width:viewport.width,height:viewport.height};
   toggle();
  }catch(err){
   if(t===ticket){console.warn('V094 seletor de texto',err);
    message('Não foi possível preparar seleção precisa neste PDF.')}
  }
 });
 root.addEventListener('close',clear);
 if(mobile.addEventListener)mobile.addEventListener('change',stage);
 window.BancoMestrePreciseSelectV094=Object.freeze({
  ready:true,get words(){return ordered.length},
  get columns(){return source?Math.max(1,new Set(ordered.map(w=>w.column)).size):0}
 });
})();