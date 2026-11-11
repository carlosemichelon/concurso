/* V090 — barra compacta funcional de PDF. Mantém os botões e handlers originais. */
(function(){
'use strict';
if(window.BancoMestrePDFToolbarV090)return;
const root=document.getElementById('pdfDialog'),content=root?.querySelector('.bm-v046-pdf-content');
if(!root||!content)return;
const $=id=>document.getElementById(id),api=()=>window.BancoMestrePDFV042;
const bar=document.createElement('nav');bar.id='bm090ActionBar';
bar.setAttribute('aria-label','Ferramentas principais de PDF');
function button(id,label,icon,fn){
 const b=document.createElement('button');b.type='button';b.id='bm090'+id;
 const glyph=document.createElement('span');glyph.className='bm090-glyph';glyph.setAttribute('aria-hidden','true');
 glyph.textContent=icon;b.append(glyph,document.createTextNode(label));
 b.setAttribute('aria-label',label);b.title=label;b.onclick=fn;bar.append(b);return b;
}
const btnClick=id=>()=>$(id)?.click();
const select=button('Select','Selecionar','▣',()=>api()?.selectTextMode?.());
const move=button('Move','Mover','✥',btnClick('pdfPan'));
const prev=button('Prev','Anterior','‹',btnClick('pdfPrev'));
const next=button('Next','Próxima','›',btnClick('pdfNext'));
const page=document.createElement('input');page.type='number';page.id='bm090Page';
page.min='1';page.inputMode='numeric';page.setAttribute('aria-label','Número da página');
const form=document.createElement('form');form.id='bm090PageForm';form.append(page);
const go=document.createElement('button');go.type='submit';go.textContent='Ir';form.append(go);bar.append(form);
form.onsubmit=async e=>{
 e.preventDefault();const p=api(),n=Number(page.value);
 if(!p?.editing||!Number.isInteger(n)||n<1||n>p.totalPages){
  page.setCustomValidity('Número de página inválido');page.reportValidity?.();return}
 page.setCustomValidity('');go.disabled=true;
 try{await p.goToPage?.(n)}finally{go.disabled=false;refresh()}
};
const count=document.createElement('span');count.id='bm090PageCount';bar.append(count);
const minus=button('Minus','Diminuir zoom','−',btnClick('pdfZoomOut'));
const plus=button('Plus','Aumentar zoom','+',btnClick('pdfZoomIn'));
const fit=button('Fit','Zoom padrão','□',async()=>{fit.disabled=true;try{await api()?.resetZoomV085?.()}finally{refresh()}});
const undo=button('Undo','Desfazer','↶',()=>{api()?.undoLast?.();refresh()});
const redo=button('Redo','Refazer','↷',()=>{api()?.redoLast?.();refresh()});
const marks=button('Marks','Meus grifos','▤',btnClick('bm068OpenPanel'));
const drafts=button('Drafts','Fila de cores (0)','◈',()=>window.BancoMestrePreciseSelectV089?.openDrafts?.());
const exportBtn=button('Export','Baixar PDF','↓',btnClick('pdfExportPDF'));
const drive=button('Drive','Salvar Drive','☁',btnClick('pdfSaveDriveV042'));
const more=button('More','Mais ferramentas','☷',()=>{
 const on=root.classList.toggle('bm090-expand');root.classList.toggle('bm089-more',on);more.setAttribute('aria-expanded',String(on));
});
more.setAttribute('aria-expanded','false');
const instruction=document.createElement('div');instruction.id='bm090Help';
instruction.setAttribute('role','status');
instruction.textContent='Seleção por duas palavras: início → fim. Escolha cor e assunto antes de salvar.';
content.prepend(instruction);content.prepend(bar);
root.classList.add('bm090-streamlined');
function refresh(){
 const p=api(),active=!!p?.editing;
 root.classList.toggle('bm090-open',active);
 bar.hidden=!active;instruction.hidden=!active;
 select.setAttribute('aria-pressed',String(p?.currentTool==='select'));
 move.setAttribute('aria-pressed',String(p?.currentTool==='pan'));
 for(const b of [select,move,prev,next,minus,plus,fit,undo,redo,marks,exportBtn])b.disabled=!active;
 const queued=window.BancoMestrePreciseSelectV089?.draftCount||0;
 drafts.textContent='◈ Fila de cores ('+queued+')';drafts.disabled=!active||!queued;
 prev.disabled=!active||p.currentPage<=1;next.disabled=!active||p.currentPage>=p.totalPages;
 undo.disabled=!active||!p.canUndo;redo.disabled=!active||!p.canRedo;
 drive.disabled=!active||!$('pdfSaveDriveV042')||$('pdfSaveDriveV042').disabled;
 page.disabled=!active;go.disabled=!active;
 if(active){
  if(document.activeElement!==page)page.value=String(p.currentPage);
  page.max=String(p.totalPages);count.textContent='de '+p.totalPages+' · '+p.zoomPercent+'%';
  instruction.textContent=p.currentTool==='select'
   ?'Selecione o primeiro e o último termo, confira o trecho e escolha uma cor.'
   :p.currentTool==='pan'?'Mover ativado. Escolha Selecionar para voltar ao grifo.'
   :'Ferramenta '+p.currentTool+' ativa. Use Selecionar para marcar texto.';
 }
}
for(const event of ['bm-pdf-active-page-rendered','bm-pdf-render-start',
 'bm-pdf-tool-change','bm-pdf-mark-changed','bm-pdf-storage-changed']){
 window.addEventListener(event,()=>queueMicrotask(refresh));
}
root.addEventListener('click',()=>queueMicrotask(refresh));
root.addEventListener('close',()=>{root.classList.remove('bm090-open','bm090-expand','bm089-more');refresh()});
root.addEventListener('keydown',e=>{
 if(!root.open||!api()?.editing||e.altKey||e.ctrlKey||e.metaKey||e.isComposing)return;
 if(e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 if(e.key==='F2'){e.preventDefault();select.click()}
 if(e.key==='F3'){e.preventDefault();move.click()}
},true);
refresh();
window.BancoMestrePDFToolbarV090=Object.freeze({refresh,get ready(){return !!bar.parentNode}});
})();