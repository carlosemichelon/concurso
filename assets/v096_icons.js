/* V096 — Iconografia original em linha, sem bibliotecas externas.
   Site: navegação discreta tipo plataforma de questões.
   Editores: ferramentas de contorno arredondado tipo caderno digital.
   Não substitui nós, eventos, classes funcionais ou armazenamento. */
(function(){
'use strict';
if(window.BancoMestreIconsV096)return;
const paths={
 'book-open':'<path d="M12 7a8 8 0 0 0-8-2v14a8 8 0 0 1 8 2"/><path d="M12 7a8 8 0 0 1 8-2v14a8 8 0 0 0-8 2"/><path d="M12 7v14"/>',
 'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
 'layers':'<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 'images':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 16-5-5L5 21"/>',
 'highlighter':'<path d="m9 11-6 6 4 4 6-6M12 8l4-4a3 3 0 0 1 4 4l-6 6-5-5z"/><path d="m3 21 4-4M3 23h18"/>',
 'pen-line':'<path d="m12 19 7-7 3 3-7 7-5 1zM19 12l-4-4 2-2a2.8 2.8 0 0 1 4 4z"/><path d="M2 8h9M2 13h6"/>',
 'eraser':'<path d="m20 20 2-2-9-9-9 9a2 2 0 0 0 0 3l1 1h15"/><path d="m8 14 7 7"/>',
 'hand':'<path d="M8 12V6a1.5 1.5 0 0 1 3 0v4-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v7c0 5-3 7-7 7h-2c-2 0-4-2-5-4l-3-4a1.8 1.8 0 0 1 3-2l2 2"/>',
 'lasso':'<path d="M14 21c-4-1-7-3-7-6 0-3 3-5 7-5 5 0 8 2 8 5 0 2-1 4-4 5M12 21c0 2-3 2-3 0 0-2 3-2 3 0z"/><path d="M3 3l7 6M4 11l-1-8 8 1"/>',
 'undo':'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a6 6 0 0 1 0 12h-2"/>',
 'redo':'<path d="m15 14 5-5-5-5"/><path d="M20 9H9a6 6 0 0 0 0 12h2"/>',
 'chevron-left':'<path d="m15 18-6-6 6-6"/>',
 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
 'zoom-in':'<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5M8 11h6M11 8v6"/>',
 'zoom-out':'<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5M8 11h6"/>',
 'download':'<path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v4h16v-4"/>',
 'save':'<path d="M4 3h14l3 3v15H3V3z"/><path d="M7 3v7h10V3M7 21v-7h10v7"/>',
 'folder':'<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11H3z"/>',
 'settings':'<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
 'x':'<path d="M5 5l14 14M19 5 5 19"/>',
 'note':'<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>',
 'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 'trash':'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
 'ruler':'<path d="m3 16 13-13 5 5-13 13zM12 7l3 3M9 10l3 3M6 13l3 3"/>',
 'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 'more':'<circle cx="4" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>',
 'star':'<path d="m12 2 3 7 7 .7-5.3 4.8 1.6 7.5-6.3-4-6.3 4 1.6-7.5L2 9.7 9 9z"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 'shield':'<path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6z"/><path d="m8 12 3 3 5-6"/>',
 'scale':'<path d="M12 3v18M5 21h14M3 7h18"/><path d="m6 7-3 6h6zM18 7l-3 6h6z"/>',
 'calculator':'<rect x="4" y="2" width="16" height="20" rx="2"/><rect x="7" y="5" width="10" height="4" rx="1"/><path d="M8 13h1M13 13h1M8 17h1M13 17h1"/>',
 'building':'<path d="M3 22V7l9-5 9 5v15M9 22v-6h6v6M7 9h2M15 9h2M7 13h2M15 13h2"/>',
 'graduation':'<path d="m2 9 10-5 10 5-10 5zM6 12v5c4 4 8 4 12 0v-5M22 9v7"/>',
 'droplet':'<path d="M12 2C9 6 5 10 5 15a7 7 0 0 0 14 0c0-5-4-9-7-13z"/>',
 'hardhat':'<path d="M3 18h18M6 18v-5a6 6 0 0 1 12 0v5M12 7v6M3 21h18"/>',
 'type':'<path d="M3 5h18M12 5v14M8 19h8M7 5v3M17 5v3"/>',
 'clipboard':'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h6"/>',
 'maximize':'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
 'rotate':'<path d="M20 5v6h-6M4 19v-6h6"/><path d="M5 10a8 8 0 0 1 14-5M19 14a8 8 0 0 1-14 5"/>',
 'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 'underline':'<path d="M6 3v7a6 6 0 0 0 12 0V3M3 21h18"/>',
 'strikethrough':'<path d="M4 12h16M17 6c-1-2-3-3-5-3-4 0-6 2-6 5 0 5 12 3 12 9 0 3-3 5-6 5-3 0-5-1-6-3"/>',
 'sliders':'<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
 'palette':'<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 2-2c0-1-.8-1.5-.8-2.5 0-1.5 1.3-2.5 2.8-2.5H20a3 3 0 0 0 3-3 9 9 0 0 0-11-8z"/><circle cx="7" cy="10" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="15" r="1"/>',
 'link':'<path d="M10 13a5 5 0 0 0 8 .5l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-8-.5l-3 3a5 5 0 0 0 7 7l2-2"/>'
};
function svg(name){
 const content=paths[name]||paths['file-text'];
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+content+'</svg>';
}
function assign(el,name,context,label){
 if(!el||!paths[name])return false;
 if(context)el.dataset.bm096Context=context;
 el.dataset.bm096Icon=name;
 const uri='url("data:image/svg+xml,'+encodeURIComponent(svg(name))+'")';
 el.style.setProperty('--bm096-mask',uri);
 if(label&&el.dataset.bm096Label!=='1'){
  el.textContent=label;el.dataset.bm096Label='1';
 }
 if(el.tagName==='BUTTON'&&!el.hasAttribute('title'))el.title=(label||el.textContent||'Ferramenta').trim();
 return true;
}
const stable=[
 ['#pdfDraw','pen-line','Caneta'],['#pdfMarker','highlighter','Grifo livre'],
 ['#pdfEraser','eraser','Borracha'],['#pdfPan','hand','Mover'],
 ['#bm068SelectTool','lasso','Grifar palavras'],
 ['#pdfPrev','chevron-left','Anterior'],['#pdfNext','chevron-right','Próxima'],
 ['#pdfZoomOut','zoom-out','Zoom −'],['#pdfZoomIn','zoom-in','Zoom +'],
 ['#pdfUndo','undo','Desfazer'],['#pdfRedo','redo','Refazer'],
 ['#pdfClearPage','trash','Limpar página'],['#pdfExportPDF','download','Exportar PDF'],
 ['#pdfExportPNG','images','Exportar PNG'],['#pdfChangeFile','folder','Trocar PDF'],
 ['#pdfClose','x','Fechar'],['#pdfChooseLocal','pen-line','Editar PDF'],
 ['#pdfSaveDriveV042','save',null],['#bmV057GoPage','arrow-right',null],
 ['#bm068QuickToggle','highlighter',null],['#bm068OpenPanel','layers',null],
 ['#bm068Settings','settings',null],['#bm070Smart','palette',null],
 ['#bm068FloatClose','x',null],['#bm068Apply','highlighter',null],
 ['#bm070ApplyAuto','palette',null],['#bm068Note','note',null],
 ['#bm068Cards','graduation',null],['#bm068Copy','copy',null],
 ['#bm068Resize','lasso',null],['#bm068Delete','trash',null],
 ['#bm068Underline','underline',null],['#bm068DoubleUnderline','underline',null],
 ['#bm068Strike','strikethrough',null],['#bm068Hide','eye',null],
 ['#bm068EditorClose','x',null],['#bm068SettingsCancel','x',null],
 ['#bm068SettingsSave','save',null],['#pdfOriginal','link',null],
 ['#pdfSaveDriveV042','save',null]
];
const imageTools=[
 ['[data-ink-tool="pen"]','pen-line','Caneta'],
 ['[data-ink-tool="highlighter"]','highlighter','Marca-texto'],
 ['[data-ink-tool="eraser"]','eraser','Borracha'],
 ['[data-ink-tool="select"]','lasso','Selecionar'],
 ['[data-ink-tool="pan"]','hand','Mover'],
 ['#undo','undo','Desfazer'],['#redo','redo','Refazer'],
 ['#deleteSelected','trash',null],['#zoomOutImage','zoom-out',null],
 ['#zoomWidthImage','maximize',null],['#zoomFitImage','maximize',null],
 ['#zoomActualImage','ruler',null],['#zoomInImage','zoom-in',null],
 ['#hideOpened','eye',null],['#imgClose','x','Fechar'],
 ['#v034SelectOriginal','folder',null],['#originalDriveLink','link',null]
];
const navIcons={assuntos:'book-open',pdfs:'file-text',cartoes:'graduation',imagens:'images',grifos:'highlighter'};
const topical=[
 [/portugu[eê]s|gram[aá]tica|redac[aã]o/i,'type'],
 [/matem[aá]tica|l[oó]gica|c[aá]lculo/i,'calculator'],
 [/legisla[cç][aã]o|lei|direito|norma/i,'scale'],
 [/estrutura|edifica[cç][aã]o|concreto|a[cç]o/i,'building'],
 [/geotecnia|funda[cç][aã]o|solo/i,'layers'],
 [/hidraul|hidr[aá]ul|saneamento|[aá]gua|esgoto/i,'droplet'],
 [/seguran[cç]a|nr[- ]|trabalho/i,'shield'],
 [/obra|rodov|pavimenta/i,'hardhat']
];
function topicIcon(text){
 const normalized=String(text||'');
 for(const [re,icon] of topical)if(re.test(normalized))return icon;
 return 'book-open';
}
function decorateSite(){
 document.querySelectorAll('header nav button[data-page]').forEach(btn=>
  assign(btn,navIcons[btn.dataset.page]||'book-open','site'));
 for(const rootId of ['areaRows','topicRows']){
  const root=document.getElementById(rootId);
  if(!root)return;
  root.querySelectorAll('.topicCard').forEach(card=>{
   if(rootId==='topicRows'&&card.dataset.bm096Icon)return;
   assign(card,topicIcon(card.textContent),rootId==='areaRows'?'area':'topic');
  });
 }
 for(const [id,icon] of [['topicGoCards','graduation'],['bm062Refresh','rotate'],['bm062Backup','download'],['moreCards','more'],['moreImages','more'],['topicBack','chevron-left']])
  assign(document.getElementById(id),icon,'site');
 for(const id of ['topicSearch','pdfSearch','cardSearch','imageSearch']){
  const el=document.getElementById(id);if(!el)return;
  el.classList.add('bm096-search');
  el.style.backgroundImage='url("data:image/svg+xml,'+encodeURIComponent(svg('search'))+'")';
 }
}
function decorateEditors(){
 const pdf=document.getElementById('pdfDialog');
 if(pdf){
  for(const [selector,icon,label] of stable)assign(pdf.querySelector(selector),icon,'notes',label);
 }
 const image=document.getElementById('imageDialog');
 if(image)for(const [selector,icon,label] of imageTools)
  assign(image.querySelector(selector),icon,'notes',label);
}
function refresh(){decorateSite();decorateEditors();}
function observeNames(){
 for(const id of ['bm068QuickToggle','bm070Smart']){
  const node=document.getElementById(id);if(!node||node.dataset.bm096Watch==='1')continue;
  node.dataset.bm096Watch='1';
  const ob=new MutationObserver(()=>{
   const s=node.textContent||'';
   const clean=s.replace(/^[◈⚡✎🖍]\s*/u,'');
   if(clean!==s)node.textContent=clean;
  });
  ob.observe(node,{childList:true,characterData:true});
 }
}
function init(){
 refresh();observeNames();
 for(const id of ['areaRows','topicRows']){
  const n=document.getElementById(id);if(!n)continue;
  const obs=new MutationObserver(()=>decorateSite());
  obs.observe(n,{childList:true,subtree:true});
 }
 window.addEventListener('bm-pdf-tool-change',()=>{decorateEditors();observeNames()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BancoMestreIconsV096=Object.freeze({refresh,hasIcon:name=>!!paths[name]});
})();