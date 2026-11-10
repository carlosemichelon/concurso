/* Banco Mestre V085 — ergonomia e ícones vetoriais dos comandos PDF.
 * Reaproveita IDs/listeners existentes: nenhuma ação decorativa ou alteração em SRS.
 */
(function(){
'use strict';
const root=document.getElementById('pdfDialog'),tools=document.getElementById('pdfLocalTools');
const $=id=>document.getElementById(id),api=()=>window.BancoMestrePDFV042;
if(!root||!tools||root.dataset.bm085PdfUi==='1')return;
root.dataset.bm085PdfUi='1';
const SVG=Object.freeze({
 external:'<path d="M14 3h7v7M21 3l-10 10"/><path d="M19 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h7"/>',
 left:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',
 zoomIn:'<circle cx="10.7" cy="10.7" r="7"/><path d="m16 16 5 5M10.7 7v7.4m-3.7-3.7h7.4"/>',
 zoomOut:'<circle cx="10.7" cy="10.7" r="7"/><path d="m16 16 5 5M7 10.7h7.4"/>',
 pen:'<path d="m13 6 5 5M4 20l5.6-1.2L20 8.4l-4.4-4.4L5.2 14.4 4 20Z"/><path d="m3 21 5-.8"/>',
 highlighter:'<path d="m9 11 5 5M4 20h16M7 14l7-7 4 4-7 7H7v-4Z"/><path d="m14 7 2.5-2.5 4 4L18 11"/>',
 eraser:'<path d="m19 5 2 2a2 2 0 0 1 0 3L10 21H4l-3-3a2 2 0 0 1 0-3L12 4a2 2 0 0 1 3 0l4 1Z"/><path d="m7.5 11.5 6 6M10 21h11"/>',
 hand:'<path d="M8 13V5a2 2 0 0 1 4 0v6-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v9a8 8 0 0 1-8 8h-1a8 8 0 0 1-7-4l-2-4a2 2 0 0 1 3-2l3 3"/>',
 undo:'<path d="M9 14 4 9l5-5M4 9h9a7 7 0 1 1 0 14h-2"/>',
 redo:'<path d="m15 14 5-5-5-5M20 9h-9a7 7 0 0 0 0 14h2"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v7m4-7v7"/>',
 fileDown:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6M12 11v7m-3-3 3 3 3-3"/>',
 fileUp:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6M12 18v-7m-3 3 3-3 3 3"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 17 5-5 4 4 3-3 6 6"/>',
 cloud:'<path d="M5.5 18a4.5 4.5 0 1 1 1-9 6 6 0 0 1 11-1 4.5 4.5 0 1 1 1 10H5.5Z"/><path d="m12 10 0 8m-3-3 3 3 3-3"/>',
 note:'<path d="M4 3h16v13l-5 5H4V3Z M15 21v-5h5M8 8h8M8 12h5"/>',
 card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6M9 19v2m6-2v2"/>',
 check:'<path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="10"/>',
 type:'<path d="M4 7V4h16v3M12 4v16m-4 0h8"/>',
 sparkle:'<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3Z M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 book:'<path d="M4 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4ZM20 4h-5a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h5V4Z"/>',
 settings:'<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="10" cy="17" r="2"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7V2Z"/>',
 more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 close:'<path d="M5 5 19 19M19 5 5 19"/>',
 panel:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M12 8h6M12 12h6"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 10v7M12 7h.01"/>',
 reset:'<path d="M3 11a9 9 0 1 1 4 8M3 4v7h7"/><path d="M12 8v8m-3-3 3 3 3-3"/>',
 underline:'<path d="M6 3v8a6 6 0 0 0 12 0V3M4 21h16"/>',
 strike:'<path d="M6 6c2-3 10-3 12 0M12 6c-3 4 4 6 4 9M4 12h16M7 19c3 2 8 2 10 0"/>',
 hide:'<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6ZM4 4l16 16"/>',
 copy:'<rect x="7" y="7" width="13" height="13" rx="2"/><path d="M17 7V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3"/>',
 move:'<path d="m12 2-3 3 3-3 3 3M12 2v20m0 0-3-3 3 3 3-3M2 12h20m-20 0 3-3-3 3 3 3m17-3-3-3 3 3-3 3"/>'
});
const specs={
 pdfClose:['close','Fechar','Fechar o leitor de PDF'],
 pdfOriginal:['external','Consultar Drive','Abrir o PDF original no Google Drive (sem editar o arquivo)'],
 pdfChooseLocal:['fileUp','Editar PDF','Abrir ou continuar edição do PDF local'],
 pdfPrev:['left','Anterior','Página anterior'],
 pdfNext:['right','Próxima','Próxima página'],
 pdfZoomOut:['zoomOut','− Zoom','Diminuir zoom'],
 pdfZoomIn:['zoomIn','+ Zoom','Aumentar zoom'],
 pdfDraw:['pen','Caneta','Desenhar à mão livre no PDF'],
 pdfMarker:['highlighter','Grifo livre','Marca-texto por arraste ou clique início/fim; diferente de selecionar texto'],
 pdfEraser:['eraser','Borracha','Remover traços ao tocar'],
 pdfPan:['hand','Mover','Deslocar a página sem desenhar'],
 pdfUndo:['undo','Desfazer','Desfazer alteração (Ctrl+Z)'],
 pdfRedo:['redo','Refazer','Refazer alteração (Ctrl+Y ou Ctrl+Shift+Z)'],
 pdfClearPage:['trash','Limpar página','Apagar todas as marcações da página com confirmação e possibilidade de desfazer'],
 pdfExportPDF:['fileDown','Salvar PDF','Baixar cópia PDF com os grifos; original preservado'],
 pdfExportPNG:['image','Salvar imagem','Baixar imagem PNG da página anotada'],
 pdfChangeFile:['fileUp','Trocar PDF','Escolher outra cópia PDF autorizada'],
 pdfSaveDriveV042:['cloud','Salvar Drive','Salvar cópia anotada no Google Drive'],
 pdfNoteV037:['note','Nota','Adicionar nota textual na página'],
 pdfCardV037:['card','Vincular CARD','Vincular flashcard existente à página'],
 pdfStatusV037:['check','Cobertura','Registrar cobertura da página'],
 pdfMoreV043:['more','Mais opções','Mostrar ou recolher ferramentas adicionais'],
 bm068SelectTool:['type','Selecionar texto','Selecionar texto digital para grifos precisos'],
 bm068QuickToggle:['bolt','Modo rápido','Alternar modo rápido de seleção'],
 bm070Smart:['sparkle','Cores por trecho','Alternar classificação de cores automática/manual'],
 bm068OpenPanel:['book','Meus grifos','Abrir o painel de grifos e anotações'],
 bm068Settings:['settings','Atalhos','Configurar atalhos de estudo'],
 bm081ApplyMulti:['check','Aplicar cores','Aplicar todos os trechos da prévia em uma operação'],
 bm068Apply:['check','Grifar texto','Grifar seleção confirmada'],
 bm070ApplyAuto:['sparkle','Sugerir cor','Aplicar sugestão de grifo'],
 bm068FloatClose:['close','Fechar','Fechar paleta de grifos'],
 bm068Note:['note','Nota','Editar nota do grifo existente'],
 bm068Cards:['card','Cartão','Relacionar grifo a flashcard'],
 bm068Copy:['copy','Copiar','Copiar texto grifado'],
 bm068Resize:['move','Ajustar','Reajustar seleção de um grifo'],
 bm068Delete:['trash','Excluir','Excluir grifo selecionado'],
 bm068Underline:['underline','Sublinhar','Sublinhar trecho'],
 bm068DoubleUnderline:['underline','2 linhas','Sublinhar com duas linhas'],
 bm068Strike:['strike','Tachar','Tachar trecho'],
 bm068Hide:['hide','Ocultar','Ocultar ou mostrar texto na leitura'],
 bmV057Marker:['highlighter','Grifo livre','Grifar livremente na página; dois cliques para linha reta'],
 bmV057Pan:['hand','Mover','Mover página'],
 bmV057Undo:['undo','Desfazer','Desfazer último grifo'],
 bmV057Redo:['redo','Refazer','Refazer último grifo'],
 bmV057GoPage:['right','Ir','Abrir a página digitada'],
 bmV056OpenPdfMenu:['menu','Menu','Abrir opções do leitor PDF'],
 bmV056ClosePDF:['close','Fechar','Fechar PDF'],
 bmV056ShowAnnotations:['panel','Ferramentas','Abrir ferramentas PDF'],
 bmV056CloseAnnotations:['close','Recolher','Recolher ferramentas'],
 bmV061SelectTool:['type','Selecionar','Selecionar texto no PDF'],
 bm084Launch:['sparkle','Janela inteligente','Selecionar e revisar trechos em uma janela']
};
const dynamic=new Set(['pdfChooseLocal','pdfSaveDriveV042','bm068QuickToggle','bm070Smart','bm068Hide','bmV056CloseAnnotations']);
const keepText=id=>!dynamic.has(id);
const svgns='http://www.w3.org/2000/svg';
function icon(name){
 const element=document.createElementNS(svgns,'svg');
 element.setAttribute('viewBox','0 0 24 24');
 element.setAttribute('width','20');element.setAttribute('height','20');
 element.setAttribute('fill','none');element.setAttribute('stroke','currentColor');
 element.setAttribute('stroke-width','1.85');element.setAttribute('stroke-linecap','round');
 element.setAttribute('stroke-linejoin','round');element.setAttribute('aria-hidden','true');
 element.setAttribute('focusable','false');element.setAttribute('class','bm085-icon');
 element.innerHTML=SVG[name]||SVG.info;return element;
}
function cleanLabel(raw,fallback){
 const s=String(raw||'').trim().replace(/^[^A-Za-zÀ-ÿ0-9]{1,5}\s*/u,'').replace(/\s+/gu,' ');
 return s&&s.length<=36?s:fallback;
}
function enhanceButton(btn){
 const id=btn.id,p=specs[id];if(!p||btn.querySelector('.bm085-icon'))return;
 // Reaproveitar o mesmo botão original: nunca clonar ou substituir seu handler.
 const visible=keepText(id)?p[1]:cleanLabel(btn.textContent,p[1]);
 const wasDisabled='disabled' in btn?btn.disabled:null,pressed=btn.getAttribute('aria-pressed');
 btn.replaceChildren(icon(p[0]));
 const label=document.createElement('span');label.className='bm085-button-label';label.textContent=visible;btn.append(label);
 btn.classList.add('bm085-action');
 if(id==='pdfClearPage'||id==='bm068Delete')btn.classList.add('bm085-danger');
 btn.setAttribute('aria-label',p[2]);btn.title=p[2];
 if(pressed!==null)btn.setAttribute('aria-pressed',pressed);
 if(wasDisabled!==null)btn.disabled=wasDisabled;
}
const modeLabels={select:'Texto selecionável',pen:'Caneta livre',marker:'Grifo livre',eraser:'Borracha',pan:'Mover página',note:'Nota na página',card:'Vincular cartão',status:'Cobertura'};
let lastMode='';
function refresh(){
 const p=api(),t=p?.currentTool||'',mode=modeLabels[t]||'Leitura';
 if(lastMode!==mode){lastMode=mode;const target=$('bm085Mode');
  if(target){target.textContent=p?.editing?'Ferramenta: '+mode:'Leitura do PDF';target.title=mode;}}
 const reset=$('bm085ZoomReset');if(reset){
  reset.disabled=!p?.editing;
  reset.title=p?.editing?'Voltar à largura padrão (100%). Zoom atual: '+p.zoomPercent+'%':'Abra o PDF para controlar o zoom';
 }
 for(const [id,tool] of [['pdfNoteV037','note'],['pdfCardV037','card'],['pdfStatusV037','status']]){
  const b=$(id);if(b){const v=String(p?.editing&&t===tool);if(b.getAttribute('aria-pressed')!==v)b.setAttribute('aria-pressed',v);}
 }
}
const main=$('pdfMainV043');
if(main&&!$('bm085Mode')){
 const top=document.createElement('div');top.className='bm085-toolbar-head';
 const badge=document.createElement('span');badge.id='bm085Mode';badge.setAttribute('role','status');badge.textContent='Leitura do PDF';
 const collapse=document.createElement('button');collapse.type='button';collapse.id='bm085Compact';collapse.className='bm085-compact-toggle';
 collapse.append(icon('panel'),document.createTextNode(' Compactar'));collapse.title='Alternar barra ampla e compacta';collapse.setAttribute('aria-label','Alternar largura da barra de ferramentas');
 top.append(badge,collapse);main.prepend(top);
 const saved=(()=>{try{return localStorage.getItem('BM085_PDF_COMPACT')}catch{return null}})();
 const compact=saved===null?!!window.matchMedia?.('(max-width:700px)').matches:saved==='1';
 const updateCompact=on=>{root.classList.toggle('bm085-compact',on);collapse.setAttribute('aria-pressed',String(on));
  collapse.title=on?'Expandir ferramentas com rótulos':'Compactar ferramentas para ampliar a página';
  collapse.lastChild.textContent=on?' Expandir':' Compactar';};
 updateCompact(compact);
 collapse.onclick=()=>{const v=!root.classList.contains('bm085-compact');updateCompact(v);
  try{localStorage.setItem('BM085_PDF_COMPACT',v?'1':'0')}catch{}};
 const originalGroups=[...main.querySelectorAll(':scope > .pdfGroup')];
 ['Navegação e zoom','Desenhar e grifar','Histórico e limpeza','Salvar e exportar'].forEach((name,i)=>{
  const g=originalGroups[i];if(g){g.dataset.bm085Label=name;g.setAttribute('role','group');g.setAttribute('aria-label',name)}
 });
 const zoom=$('pdfZoomIn');
 if(zoom&&!$('bm085ZoomReset')){
  const reset=document.createElement('button');reset.type='button';reset.id='bm085ZoomReset';
  reset.append(icon('reset'),document.createTextNode(' Ajustar'));reset.className='bm085-action bm085-reset';
  reset.setAttribute('aria-label','Voltar ao zoom padrão de 100%');
  zoom.after(reset);
  reset.onclick=async()=>{if(reset.disabled)return;
   reset.disabled=true;try{await api()?.resetZoomV085?.()}finally{refresh()}};
 }
 const help=document.createElement('button');help.type='button';help.id='bm085HelpToggle';
 help.append(icon('info'),document.createTextNode(' Ajuda e atalhos'));
 help.setAttribute('aria-expanded','false');help.setAttribute('aria-controls','bm085HelpPanel');
 const tip=document.createElement('div');tip.id='bm085HelpPanel';tip.hidden=true;
 tip.textContent='Grifo livre: pinta ao arrastar. Selecionar texto: marca palavras digitais. Borracha: remove traços tocados. Notas/CARD: adicionam registros na página. Desfazer: Ctrl+Z; Refazer: Ctrl+Y ou Ctrl+Shift+Z. Atalhos de ferramentas: Shift+S (texto), Shift+C (caneta), Shift+G (grifo livre), Shift+B (borracha), Shift+H (mover). Salvar PDF cria uma cópia; o original permanece intacto.';
 help.onclick=()=>{const open=tip.hidden;tip.hidden=!open;help.setAttribute('aria-expanded',String(open))};
 main.append(help,tip);
 root.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!tip.hidden){tip.hidden=true;help.setAttribute('aria-expanded','false');e.stopPropagation();return}
  if(!root.open||!api()?.editing||!e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||e.isComposing||e.repeat)return;
  if(e.target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return;
  const selected=window.getSelection?.();
  if(selected&&!selected.isCollapsed)return;
  const ids={s:'bm068SelectTool',c:'pdfDraw',g:'pdfMarker',b:'pdfEraser',h:'pdfPan'};
  const id=ids[String(e.key||'').toLowerCase()],button=$(id);
  if(button&&!button.disabled){e.preventDefault();button.click()}
 },true);
}
function enhance(){
 for(const id of Object.keys(specs)){const b=$(id);if(b)enhanceButton(b)}
 refresh();
}
let scheduled=false;
function schedule(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;enhance()});
}
const observer=new MutationObserver(schedule);
observer.observe(tools,{childList:true,subtree:true});
const dock=$('bmV057PdfDock');if(dock)observer.observe(dock,{childList:true,subtree:true});
const extra=$('bmV056FloatingControls');if(extra)observer.observe(extra,{childList:true,subtree:true});
const palette=$('bm068Palette');if(palette)observer.observe(palette,{childList:true,subtree:true});
const toolbar=$('bmV056Toolbar');if(toolbar)observer.observe(toolbar,{childList:true,subtree:true});
const events=['bm-pdf-tool-change','bm-pdf-active-page-rendered','bm-pdf-mark-changed','bm-pdf-marker-state'];
for(const ev of events)window.addEventListener(ev,schedule);
root.addEventListener('click',()=>queueMicrotask(refresh));
root.addEventListener('close',()=>{lastMode='';refresh()});
enhance();
window.BancoMestrePDFUIV085=Object.freeze({get ready(){return !!$('bm085Mode')},get iconCount(){return root.querySelectorAll('.bm085-action .bm085-icon').length},get collapsed(){return root.classList.contains('bm085-compact')},refresh});
})();