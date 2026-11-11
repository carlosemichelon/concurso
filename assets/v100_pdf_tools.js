/* V100 — organização da barra do editor PDF a partir do DOM real fornecido
 * pelo estudante em 11/11/2026. Não criar cópias dos botões nem substituir
 * listeners; mover os mesmos nós, preservar IDs, estado, form e ARIA.
 */
(function(){
'use strict';
if(window.BancoMestrePdfToolsV100)return;
const $=id=>document.getElementById(id);
const icons={
 note:'<path d="M5 3h12l3 3v15H5zM17 3v4h3M9 11h7M9 15h7"/>',
 card:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M7 8h2M15 8h2"/>',
 coverage:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 more:'<circle cx="4.5" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="19.5" cy="12" r="1.1"/>',
 audit:'<path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/>'
};
function decorate(id,key,label){
 const b=$(id);if(!b||!icons[key])return;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">'+icons[key]+'</svg>';
 b.style.setProperty('--bm096-mask','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');
 b.dataset.bm096Context='notes';b.dataset.bm096Icon=key;
 b.textContent=label;
 if(!b.title)b.title=label;
}
function section(name,label){
 const el=document.createElement('div');
 el.className='pdfGroup bm100-section';el.dataset.bm100Group=name;
 el.setAttribute('role','group');el.setAttribute('aria-label',label);
 const heading=document.createElement('h3');heading.className='bm100-heading';
 heading.textContent=label;el.append(heading);return el;
}
function heading(el,label,name){
 el.classList.add('bm100-section');el.dataset.bm100Group=name;
 el.setAttribute('role','group');el.setAttribute('aria-label',label);
 const h=document.createElement('h3');h.className='bm100-heading';h.textContent=label;
 el.prepend(h);
}
function row(kind,ids){
 const el=document.createElement('div');el.className='bm100-row bm100-'+kind;
 for(const id of ids){const b=$(id);if(b)el.append(b)}
 return el;
}
function init(){
 const dialog=$('pdfDialog'),root=$('pdfLocalTools'),main=$('pdfMainV043');
 if(!dialog||!root||!main||root.dataset.bm100Ready==='1')return false;
 const find=id=>Array.from(main.children).find(x=>x.classList?.contains('pdfGroup')&&x.querySelector('#'+id));
 const nav=find('pdfPrev'),draw=find('pdfDraw'),history=find('pdfUndo'),files=find('pdfExportPDF');
 const select=$('bm068SelectTool'),dock=$('bmV057PdfDock');
 if(!nav||!draw||!history||!files||!select||!dock)return false;
 // Todos os comandos existem antes de mudar a árvore DOM.
 const required=['pdfPrev','pdfNext','pdfPager','pdfZoomOut','pdfZoomIn',
  'pdfDraw','pdfMarker','pdfEraser','pdfPan','pdfUndo','pdfRedo',
  'pdfExportPDF','pdfSaveDriveV042','pdfNoteV037','pdfCardV037','pdfStatusV037'];
 if(required.some(id=>!$(id)))return false;
 heading(nav,'Navegação','navigation');
 heading(draw,'Desenho livre','drawing');
 heading(history,'Histórico','history');
 heading(files,'Salvar e exportar','save');
 const selection=section('selection','Grifar texto');
 const annotations=section('annotations','Anotações');
 main.insertBefore(selection,draw);
 draw.after(annotations);
 selection.append(select);
 // Estrutura por duas colunas; o contador de página permanece no meio.
 nav.append(row('pages',['pdfPrev','pdfPager','pdfNext']));
 nav.append(row('zoom',['pdfZoomOut','pdfZoomIn']));
 nav.append(dock); // Mesma form, handlers intactos; no grupo de navegação.
 draw.append(row('draw',['pdfDraw','pdfMarker','pdfEraser','pdfPan']));
 const ink=document.createElement('div');ink.className='bm100-ink';
 const allLabels=Array.from(draw.children).filter(n=>n.tagName==='LABEL');
 allLabels.forEach(label=>ink.append(label));draw.append(ink);
 annotations.append(row('annotations',['pdfNoteV037','pdfCardV037','pdfStatusV037']));
 history.append(row('history',['pdfUndo','pdfRedo']));
 files.append(row('save',['pdfExportPDF','pdfSaveDriveV042']));
 // Ícones ausentes no legado V043; não alterar o desenho dos SVGs existentes.
 decorate('pdfNoteV037','note','Nota');
 decorate('pdfCardV037','card','Cartão');
 decorate('pdfStatusV037','coverage','Cobertura');
 decorate('pdfMoreV043','more','Mais opções');
 decorate('bm067ReaderRun','audit','Diagnóstico');
 const drive=$('pdfSaveDriveV042');if(drive&&/^\s*☁\s*Drive\s*$/u.test(drive.textContent||''))
  drive.textContent='Salvar no Drive';
 const shortcuts=$('bm068QuickBar');
 if(shortcuts){
  shortcuts.classList.add('bm100-shortcuts');
  const panel=$('bm068OpenPanel'),settings=$('bm068Settings');
  if(panel)panel.textContent='Meus grifos';
  if(settings)settings.textContent='Atalhos';
 }
 main.setAttribute('aria-label','Ferramentas de PDF organizadas: navegação, seleção de texto, desenho, anotações, histórico e salvamento.');
 root.dataset.bm100Ready='1';
 window.dispatchEvent(new CustomEvent('bm-pdf-tools-organized',{detail:{version:'V100',groups:6}}));
 return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.addEventListener('bm-pdf-tool-change',()=>{if($('pdfLocalTools')?.dataset.bm100Ready!=='1')init()});
window.BancoMestrePdfToolsV100=Object.freeze({refresh:init,get ready(){return $('pdfLocalTools')?.dataset.bm100Ready==='1'}});
})();