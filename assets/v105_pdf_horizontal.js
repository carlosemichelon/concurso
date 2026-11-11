/* V105 — navegação lateral do PDF no telefone.
 * O deslocamento horizontal é nativo do scroller (touch-action pan-x pan-y).
 * Botão Mover opcional apenas quando a página ultrapassa a largura da tela.
 * Mantém a seleção por dois toques, zoom por pinça e ferramentas originais.
 */
(function(){
'use strict';
if(window.BancoMestrePdfPanV105)return;
const $=id=>document.getElementById(id);
const dialog=$('pdfDialog'),pane=$('pdfLocalMode'),wrap=$('pdfPageWrap'),
 api=window.BancoMestrePDFV042,panButton=$('pdfPan'),selectButton=$('bm068SelectTool');
if(!dialog||!pane||!wrap||!api||!panButton||!selectButton)return;
const coarse=window.matchMedia('(pointer:coarse)');
const narrow=window.matchMedia('(max-width:760px)');
let previous='select',frame=0;
const toggle=document.createElement('button');
toggle.id='bm105PanToggle';toggle.type='button';toggle.hidden=true;
toggle.setAttribute('aria-controls','pdfLocalMode');
toggle.setAttribute('aria-label','Alternar modo mover e seleção de palavras');
dialog.append(toggle);
const restore={
 'select':'bm068SelectTool',
 'pen':'pdfDraw',
 'marker':'pdfMarker',
 'eraser':'pdfEraser',
 'note':'pdfNoteV037',
 'card':'pdfCardV037',
 'status':'pdfStatusV037'
};
function check(){
 frame=0;
 const enabled=!!dialog.open&&!!api.editing&&(coarse.matches||narrow.matches)&&pane.classList.contains('active');
 const pageWidth=Math.max(wrap.offsetWidth||0,wrap.getBoundingClientRect?.().width||0);
 const overflow=Math.max(pane.scrollWidth-pane.clientWidth,pageWidth-pane.clientWidth);
 const visible=enabled&&overflow>6;
 toggle.hidden=!visible;
 const moving=api.currentTool==='pan';
 toggle.setAttribute('aria-pressed',String(moving));
 toggle.textContent=moving?'✓ Mover ativo':'↔ Mover página';
 toggle.title=moving?'Voltar à ferramenta anterior':'Mover a página ampliada para os lados, sem marcar';
 toggle.setAttribute('aria-label',moving?
  'Modo Mover ativado. Toque para retornar à ferramenta anterior.':
  'Ativar Mover para arrastar a página ampliada sem grifar');
}
function schedule(){
 if(frame)return;
 frame=requestAnimationFrame(check);
}
toggle.addEventListener('click',()=>{
 if(!api.editing)return;
 if(api.currentTool==='pan'){
  const id=restore[previous]||restore.select;
  const control=$(id);
  if(control&&!control.disabled)control.click();
  else if(!selectButton.disabled)selectButton.click();
 }else{
  previous=api.currentTool||'select';
  if(!panButton.disabled)panButton.click();
 }
 schedule();
});
for(const evt of ['bm-pdf-active-page-rendered','bm-pdf-zoom-changed','bm-pdf-tool-change']){
 window.addEventListener(evt,schedule);
}
window.addEventListener('resize',schedule,{passive:true});
coarse.addEventListener?.('change',schedule);
narrow.addEventListener?.('change',schedule);
dialog.addEventListener('close',()=>{toggle.hidden=true});
if(window.ResizeObserver){
 const ro=new ResizeObserver(schedule);
 ro.observe(pane);
 // The page size changes after PDF.js has painted the new zoom level.
 ro.observe(wrap);
}
check();
window.BancoMestrePdfPanV105=Object.freeze({
 refresh:check,
 get canPanHorizontally(){return pane.scrollWidth-pane.clientWidth>6},
 get moverEnabled(){return api.currentTool==='pan'}
});
})();