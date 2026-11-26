/* V315 IIFE scripts 52–63 order preserved */

;
/* 52 assets/v262_ink_ui.js */
/* V262 — corrige ReferenceError em prévia de grifo, sem modificar dados. */
/* V106 — legibilidade nítida, ajuste apenas visual e transparência salva intacta. */
/* V102 — editor de tinta e legibilidade; DOM existente e listeners preservados. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
if(window.BancoMestreInkUiV102)return;
function node(tag,className,text){
 const x=document.createElement(tag);
 if(className)x.className=className;
 if(text)x.textContent=text;
 return x;
}
function init(){
 const editor=$('pdfDialog'),ink=editor?.querySelector('.bm100-ink'),
  nativeColor=$('pdfInkColor'),opacity=$('pdfMarkerOpacityV046'),
  api=window.BancoMestrePDFV042;
 if(!editor||!ink||!nativeColor||!opacity||!api||
    $('bm102InkPalette'))return false;
 const group=node('section','bm102-ink-palette');group.id='bm102InkPalette';
 group.setAttribute('aria-label','Cor, transparência e legibilidade');
 const title=node('h4','bm102-ink-title','Cor do desenho e grifo livre');
 const desc=node('p','bm102-ink-desc',
  'Escolha um tom rápido ou use o seletor de cor personalizada.');
 const palette=node('div','bm102-colors');palette.setAttribute('role','group');
 palette.setAttribute('aria-label','Cores rápidas para desenho');
 const presets=[
  {color:'#FDE68A',label:'Amarelo'},
  {color:'#BBF7D0',label:'Verde'},
  {color:'#BAE6FD',label:'Azul'},
  {color:'#FECDD3',label:'Rosa'}
 ];
 const buttons=[];
 for(const p of presets){
  const b=node('button','bm102-color-choice',p.label);b.type='button';
  b.style.setProperty('--bm102-color',p.color);
  b.title='Usar '+p.label.toLowerCase()+' no desenho ou grifo livre';
  b.setAttribute('aria-label',b.title);
  b.addEventListener('click',()=>{
   nativeColor.value=p.color.toLowerCase();
   nativeColor.dispatchEvent(new Event('input',{bubbles:true}));
   nativeColor.dispatchEvent(new Event('change',{bubbles:true}));
   updatePreview();
  });
  buttons.push(b);palette.append(b);
 }
 const sample=node('div','bm102-sample');
 sample.setAttribute('aria-label','Prévia da cor e transparência');
 const samplePrefix=node('span','bm102-sample-label','Exemplo: ');
 const sampleText=node('span','bm102-sample-text','texto legível');
 sample.append(samplePrefix,sampleText);
 const message=node('p','bm102-ink-hint','Quanto menor a porcentagem, mais transparente será o próximo grifo.');
 const readableLabel=node('label','bm102-readable-label');
 const readableInput=document.createElement('input');
 readableInput.type='checkbox';readableInput.id='bm102ReadableHighlights';
 readableInput.checked=api.readableHighlights!==false;
 readableInput.setAttribute('aria-label','Grifos nítidos: preservar contraste das letras no PDF');
 const readableText=node('span','',
  'Grifo nítido (sem apagar as letras)');
 readableLabel.append(readableInput,readableText);
 const readableInfo=node('p','bm102-ink-hint',
  'Mistura a cor com a página, mantendo as letras escuras. Só muda a tela, não altera os grifos ou o PDF exportado.');
 const tintControl=node('label','bm106-tint-label');
 tintControl.id='bm106TintControl';
 const tintTitle=node('span','','Intensidade da cor na tela');
 const tintSlider=document.createElement('input');
 tintSlider.type='range';tintSlider.min='30';tintSlider.max='80';
 tintSlider.step='5';tintSlider.id='bm106TintStrength';
 tintSlider.value=String(Math.round((api.screenHighlightIntensity||.55)*100));
 tintSlider.setAttribute('aria-label','Intensidade visual dos grifos textuais, sem modificar arquivos');
 const tintOutput=document.createElement('output');
 tintOutput.id='bm106TintValue';tintOutput.htmlFor='bm106TintStrength';
 tintOutput.textContent=tintSlider.value+'%';
 tintControl.append(tintTitle,tintSlider,tintOutput);
 tintControl.hidden=!readableInput.checked;
 const tintNote=node('p','bm102-ink-hint','Ajuste apenas a aparência do grifo. As cores e transparências gravadas permanecem intactas.');
 tintNote.id='bm106TintNote';tintNote.hidden=!readableInput.checked;
 tintSlider.addEventListener('input',()=>{
  const result=api.setScreenHighlightIntensity?.(Number(tintSlider.value)/100);
  tintOutput.textContent=Math.round((result??.55)*100)+'%';
 });

 const preview=node('div','bm102-preview-panel');preview.append(sample,message);
 function updatePreview(){
  const hex=nativeColor.value||'#17616a';
  const r=parseInt(hex.slice(1,3),16)||0,g=parseInt(hex.slice(3,5),16)||0,
   b=parseInt(hex.slice(5,7),16)||0;
  const alpha=Math.max(.1,Math.min(.65,Number(opacity.value)/100||.25));
  sampleText.style.backgroundColor='rgba('+r+','+g+','+b+','+alpha+')';
  for(const button of buttons){
   const active=button.style.getPropertyValue('--bm102-color').toLowerCase()===hex.toLowerCase();
   button.setAttribute('aria-pressed',String(active));
  }
 }
 palette.addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowLeft'].includes(e.key))return;
  const active=buttons.indexOf(document.activeElement);
  if(active<0)return;
  e.preventDefault();
  const next=buttons[(active+(e.key==='ArrowRight'?1:buttons.length-1))%buttons.length];
  next.focus();next.click();
 });
 group.append(title,desc,palette);
 // Keep both native controls in place: neither listeners nor input nodes are replaced.
 ink.prepend(group);ink.append(preview,readableLabel,tintControl,tintNote,readableInfo);
 nativeColor.setAttribute('aria-label','Cor personalizada do desenho e grifo livre');
 nativeColor.addEventListener('input',updatePreview);
 opacity.addEventListener('input',updatePreview);
 readableInput.addEventListener('change',()=>{
  api.setReadableHighlights?.(readableInput.checked);
  tintControl.hidden=!readableInput.checked;
  tintNote.hidden=!readableInput.checked;
 });
 const coverage=$('pdfStatusV037');
 if(coverage){
  coverage.textContent='Cobertura dos cartões';
  coverage.title='Marcar a situação dos flashcards para o conteúdo da página (Integral, Parcial, Sem cartão ou Não auditado)';
  coverage.setAttribute('aria-label',coverage.title);
  const annotations=editor.querySelector('[data-bm100-group="annotations"]');
  if(annotations&&!$('bm102CoverageHint')){
   const hint=node('p','bm102-coverage-hint',
    'Cobertura: selecione a ferramenta e clique no dispositivo para registrar Integral, Parcial, Sem cartão ou Não auditado. Não altera o SRS.');
   hint.id='bm102CoverageHint';annotations.append(hint);
  }
 }
 updatePreview();
 return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.addEventListener('bm-pdf-tools-organized',init);
window.BancoMestreInkUiV102=Object.freeze({refresh:init});
})();

;
/* 53 assets/v103_mobile_pdf.js */
/* V103 — PDF: ferramentas recolhíveis no celular sem copiar os botões originais.
 * Mantém navegação, rolagem, seleção, persistência e painel de grifos.
 */
(function(){
 'use strict';
 if(window.BancoMestreMobilePdfV103)return;
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),tools=$('pdfLocalTools'),
  floating=$('bmV056FloatingControls'),side=dialog?.querySelector('.bm-v046-pdf-side');
 if(!dialog||!tools||!floating||!side)return;
 const media=window.matchMedia('(max-width:760px)');
 const KEY='BM103_PDF_MOBILE_TOOLS_COLLAPSED';
 let preference=null;
 try{const stored=localStorage.getItem(KEY);if(stored==='0'||stored==='1')preference=stored==='1'}catch(_){}
 const toggle=document.createElement('button');toggle.id='bm103ToggleTools';
 toggle.type='button';toggle.setAttribute('aria-controls','pdfLocalTools');
 toggle.setAttribute('aria-label','Mostrar ou recolher ferramentas de edição');
 const page=document.createElement('span');page.id='bm103CurrentPage';
 page.setAttribute('aria-live','off');page.textContent='';
 floating.prepend(toggle,page);
 const quick=document.createElement('button');quick.id='bm103TextSelect';quick.type='button';
 quick.textContent='Grifar';quick.title='Ativar seleção de texto por primeiro e último toque';
 quick.setAttribute('aria-label','Grifar texto por primeiro e último toque');
 floating.insertBefore(quick,page);
 function shown(){return dialog.open&&!tools.hidden}
 function sync(){
  const active=shown(),collapsed=media.matches&&(preference===null?true:preference);
  dialog.classList.toggle('bm103-tools-collapsed',active&&collapsed);
  toggle.hidden=!active;quick.hidden=!active;
  page.hidden=!active;
  toggle.textContent=collapsed?'☰ Ferramentas':'✕ Recolher';
  toggle.setAttribute('aria-expanded',String(active&&!collapsed));
  toggle.title=collapsed?'Mostrar ferramentas de edição':'Recolher ferramentas para ler';
  quick.setAttribute('aria-pressed',String(window.BancoMestrePDFV042?.currentTool==='select'));
  if(active){
   const p=window.BancoMestrePDFV042?.currentPage||1;
   page.textContent='Pág. '+p;
  }
 }
 toggle.addEventListener('click',()=>{
  // A preferência representa o estado futuro (true = recolhido).
  preference=!dialog.classList.contains('bm103-tools-collapsed');
  try{localStorage.setItem(KEY,preference?'1':'0')}catch(_){}
  sync();
 });
 quick.addEventListener('click',()=>{
  const el=$('bm068SelectTool');
  if(el&&!el.disabled)el.click();
  else if($('pdfPan')&&!$('pdfPan').disabled)$('pdfPan').click();
  sync();
 });
 window.addEventListener('bm-pdf-tool-change',sync);
 window.addEventListener('bm-pdf-active-page-rendered',sync);
 new MutationObserver(sync).observe(tools,{attributes:true,attributeFilter:['hidden']});
 dialog.addEventListener('close',()=>{
  dialog.classList.remove('bm103-tools-collapsed');page.textContent='';
 });
 media.addEventListener?.('change',sync);
 sync();
 window.BancoMestreMobilePdfV103=Object.freeze({
  refresh:sync,get collapsed(){return dialog.classList.contains('bm103-tools-collapsed')}
 });
})();

;
/* 54 assets/v104_mobile_gestures.js */
/* V104 — pinch-to-zoom do PDF, Desfazer sempre acessível no telefone.
 * Reusa o motor setZoomAt/undoLast; não cria versões paralelas de grifos.
 */
(function(){
'use strict';
if(window.BancoMestrePdfGesturesV104)return;
const $=id=>document.getElementById(id);
const dialog=$('pdfDialog'),pane=$('pdfLocalMode'),wrap=$('pdfPageWrap'),
 floating=$('bmV056FloatingControls'),api=window.BancoMestrePDFV042;
if(!dialog||!pane||!wrap||!floating||!api)return;
const touchOnly=window.matchMedia('(pointer:coarse)');
let pinch=null,zooming=false;
const distance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
const midpoint=(a,b)=>({x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2});
const undo=document.createElement('button');
undo.id='bm104FloatingUndo';undo.type='button';
undo.textContent='↶';
undo.setAttribute('aria-label','Desfazer último grifo ou anotação nesta página');
undo.title='Desfazer última alteração desta página';
undo.setAttribute('aria-controls','pdfInkCanvas');
const marker=$('bm103CurrentPage');
if(marker&&marker.parentNode===floating)floating.insertBefore(undo,marker);
else floating.prepend(undo);
function updateUndo(){
 const visible=dialog.open&&api.editing&&touchOnly.matches;
 undo.hidden=!visible;
 undo.disabled=!visible||!api.canUndo||zooming;
 undo.setAttribute('aria-disabled',String(undo.disabled));
}
undo.addEventListener('click',()=>{
 if(!api.editing||!api.canUndo||zooming)return;
 api.undoLast();
 updateUndo();
});
function clearPreview(){
 wrap.style.transform='';
 wrap.style.transformOrigin='';
 wrap.classList.remove('bm104-pinching');
}
function begin(e){
 if(!dialog.open||!api.editing||!touchOnly.matches||e.touches.length!==2||zooming)return;
 const [a,b]=e.touches;
 const sep=distance(a,b);
 if(sep<22)return;
 if(!api.beginPinch?.())return;
 window.BancoMestrePreciseSelectV094?.cancelPending?.();
 const center=midpoint(a,b),rect=wrap.getBoundingClientRect();
 const px=Math.max(0,Math.min(100,100*(center.x-rect.left)/Math.max(1,rect.width)));
 const py=Math.max(0,Math.min(100,100*(center.y-rect.top)/Math.max(1,rect.height)));
 pinch={sep,base:api.zoomLevel||1,center,ratio:1};
 wrap.style.transformOrigin=px+'% '+py+'%';
 wrap.classList.add('bm104-pinching');
 e.preventDefault();
}
function move(e){
 if(!pinch)return;
 if(e.touches.length<2)return;
 const [a,b]=e.touches,sep=distance(a,b);
 if(sep<1)return;
 const ratio=Math.min(3/Math.max(.55,pinch.base),Math.max(.55/pinch.base,sep/pinch.sep));
 pinch.ratio=ratio;
 pinch.center=midpoint(a,b);
 wrap.style.transform='scale('+ratio.toFixed(3)+')';
 if(e.cancelable)e.preventDefault();
}
async function end(e){
 if(!pinch||e.touches.length>=2)return;
 const details=pinch;pinch=null;
 clearPreview();
 if(e.cancelable)e.preventDefault();
 zooming=true;updateUndo();
 try{
  if(Math.abs(details.ratio-1)>.025)
   await api.setZoomAt?.(details.base*details.ratio,details.center);
 }catch(err){
  const message=$('pdfLocalStatus');if(message)message.textContent='Não foi possível aplicar zoom: '+err.message;
 }finally{
  api.endPinch?.();zooming=false;updateUndo();
 }
}
pane.addEventListener('touchstart',begin,{passive:false,capture:true});
pane.addEventListener('touchmove',move,{passive:false,capture:true});
pane.addEventListener('touchend',end,{passive:false,capture:true});
pane.addEventListener('touchcancel',end,{passive:false,capture:true});
dialog.addEventListener('close',()=>{
 pinch=null;clearPreview();api.endPinch?.();updateUndo();
});
for(const name of ['bm-pdf-active-page-rendered','bm-pdf-mark-changed','bm-pdf-tool-change','bm-pdf-zoom-changed']){
 window.addEventListener(name,updateUndo);
}
touchOnly.addEventListener?.('change',updateUndo);
updateUndo();
window.BancoMestrePdfGesturesV104=Object.freeze({
 get zooming(){return zooming||!!pinch},
 get undoVisible(){return !undo.hidden},
 updateUndo
});
})();

;
/* 55 assets/v105_pdf_horizontal.js */
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

;
/* 56 assets/v122_grifos_master_core.js */
/* V122: mestre privado conserva grifos ativos e pequenos IDs de exclusão (sem conteúdo apagado). */
/* V104 — núcleo determinístico do ÚNICO mestre ativo.
 * Sem rede. Preserva divergências em conflicts[] e nunca remove marcações.
 * O sync V103 fornece captura segura, escopo das chaves e merge local.
 */
(function(){
'use strict';
if(window.BancoMestreGrifosMasterV104)return;
const legacy=window.BancoMestreGrifosSyncCoreV103;
if(!legacy)return;
const SCHEMA='BancoMestreGrifosMasterV104',MAX_BYTES=legacy.LIMIT_BYTES,
 MAX_CONFLICTS=3000,MAX_RECORDS=10000;
const literal=x=>JSON.stringify(x);
const same=(a,b)=>literal(a)===literal(b);
const identity=legacy.markId;
const moreRecent=(a,b)=>(Date.parse(b?.bm108_changed_at||'')||0)>(Date.parse(a?.bm108_changed_at||'')||0);
const bucket=(key,id)=>key+'\u0000'+id;
function validateRecords(records){
 const fake={schema:legacy.SCHEMA,device:'MASTER-V104-0000',
  generated_at:new Date().toISOString(),records};
 legacy.validate(fake);
 return records;
}
function empty(){
 return {schema:SCHEMA,revision:0,updated_at:new Date().toISOString(),
  records:{},conflicts:[]};
}
function validate(master){
 if(!master||master.schema!==SCHEMA||!Number.isSafeInteger(master.revision)||
    master.revision<0||!master.records||typeof master.records!=='object'||
    Array.isArray(master.records)||!Array.isArray(master.conflicts)||
    master.conflicts.length>MAX_CONFLICTS)throw Error('Mestre de grifos inválido');
 validateRecords(master.records);
 if(literal(master).length>MAX_BYTES)throw Error('Mestre acima de 12 MB');
 for(const c of master.conflicts){
  if(!c||!legacy.validKey(c.key)||typeof c.id!=='string'||
     !Array.isArray(c.variants)||c.variants.length<2||c.variants.length>50||
     c.variants.some(v=>typeof v!=='string'||v.length>400000))
   throw Error('Registro de conflito inválido');
 }
 return master;
}
function merge(master,snapshots){
 const source=master?validate(master):empty();
 if(!Array.isArray(snapshots)||snapshots.length>40)throw Error('Mais de 40 origens; interrompido');
 const records={...source.records},conflictMap=new Map();
 function appendConflict(key,id,values){
  const name=bucket(key,id),entry=conflictMap.get(name)||{key,id,variants:[]};
  for(const v of values){const raw=typeof v==='string'?v:literal(v);
   if(!entry.variants.includes(raw))entry.variants.push(raw);
  }
  if(entry.variants.length>1)conflictMap.set(name,entry);
 }
 for(const c of source.conflicts)appendConflict(c.key,c.id,c.variants);
 // Reunir primeiro todas as exclusões, inclusive registros arquivados legados.
 let deletions=source.records[legacy.DELETIONS]?
   legacy.parse(legacy.DELETIONS,source.records[legacy.DELETIONS]):{};
 for(const snap of snapshots){
  const data=snap?.schema===SCHEMA?validate(snap).records:legacy.validate(snap);
  if(data[legacy.DELETIONS])
   deletions=legacy.mergeDeletions(deletions,
    legacy.parse(legacy.DELETIONS,data[legacy.DELETIONS]));
  for(const [page,text] of Object.entries(data)){
   if(!page.startsWith('BM030_STROKES_PDF:'))continue;
   for(const mark of legacy.parse(page,text)){
    if(!mark?.bm108_deleted_at)continue;
    deletions=legacy.mergeDeletions(deletions,
     {[page]:{[identity(mark)]:mark.bm108_deleted_at}});
   }
  }
 }

 let inserted=0;
 function add(key,newText){
  if(key===legacy.DELETIONS)return;
  if(!legacy.validKey(key))throw Error('Chave fora do catálogo de grifos');
  // Validate JSON and array shape using the existing V103 parser.
  validateRecords({[key]:newText});
  if(!Object.hasOwn(records,key)){records[key]=newText;inserted++;return}
  const oldVal=JSON.parse(records[key]),newVal=JSON.parse(newText);
  if(key==='BM062_GRIFOS_META'){
   const output={...oldVal};
   for(const [id,value] of Object.entries(newVal)){
    if(!Object.hasOwn(output,id)){output[id]=value;inserted++}
    else if(!same(output[id],value)){
     const earlier=output[id];
     if(moreRecent(earlier,value))output[id]=value;
     appendConflict(key,'meta:'+id,[earlier,value]);
    }
   }
   records[key]=literal(output);
   return;
  }
  const output=oldVal.slice(),known=new Map(oldVal.map((m,i)=>[identity(m),i]));
  for(const m of newVal){
   const id=identity(m),at=known.get(id);
   if(at===undefined){known.set(id,output.length);output.push(m);inserted++}
   else if(!same(output[at],m)){
    const earlier=output[at];
    if(moreRecent(earlier,m))output[at]=m;
    appendConflict(key,id,[earlier,m]);
   }
  }
  records[key]=literal(output);
 }
 for(const snap of snapshots){
  const data=snap?.schema===SCHEMA?validate(snap).records:
   legacy.validate(snap);
  for(const [key,value] of Object.entries(data))add(key,value);
  if(snap?.schema===SCHEMA)
   for(const c of snap.conflicts)appendConflict(c.key,c.id,c.variants);
 }

 // Nenhum conteúdo de grifo excluído permanece no arquivo mestre nem em conflitos.
 for(const [page,items] of Object.entries(deletions)){
  if(!page.startsWith('BM030_STROKES_PDF:'))continue;
  if(Object.hasOwn(records,page)){
   const raw=JSON.parse(records[page]);
   const next=legacy.cleanPage(page,raw,deletions);
   if(next.length)records[page]=literal(next);else delete records[page];
  }
  for(const [bucketKey,entry] of conflictMap){
   if(entry.key!==page)continue;
   if(Object.hasOwn(items,entry.id)){conflictMap.delete(bucketKey);continue}
   // Variantes antigas usavam identidades longas para grifos sem texto.
   const matches=entry.variants.some(raw=>{
    try{return Object.hasOwn(items,identity(JSON.parse(raw)))}catch{return false}
   });
   if(matches)conflictMap.delete(bucketKey);
  }
 }
 if(records['BM062_GRIFOS_META']){
  const data=JSON.parse(records['BM062_GRIFOS_META']);
  for(const [page,items] of Object.entries(deletions)){
   const m=/^BM030_STROKES_PDF:(.+):([^:]+):P\d+$/.exec(page);
   if(!m)continue;
   for(const ident of Object.keys(items)){
    if(!ident.startsWith('id:'))continue;
    const k='TXT:'+m[1]+':'+m[2]+':'+ident.slice(3);
    delete data[k];conflictMap.delete(bucket('BM062_GRIFOS_META','meta:'+k));
   }
  }
  records['BM062_GRIFOS_META']=literal(data);
 }
 if(Object.keys(deletions).length)records[legacy.DELETIONS]=literal(deletions);
 const conflicts=[...conflictMap.values()];
 if(conflicts.length>MAX_CONFLICTS)throw Error('Há conflitos demais; exporte backup e revise');
 const result={
  schema:SCHEMA,revision:source.revision,updated_at:source.updated_at,
  records,conflicts
 };
 validate(result);
 return {master:result,inserted,conflicts:conflicts.length,
  changed:!same(source.records,records)||!same(source.conflicts,conflicts)};
}
function contains(master,snapshot){
 validate(master);
 const source=snapshot?.schema===SCHEMA?validate(snapshot).records:legacy.validate(snapshot);
 const conflicts=new Map(master.conflicts.map(c=>[bucket(c.key,c.id),c.variants]));
 const deleted=master.records[legacy.DELETIONS]?
  legacy.parse(legacy.DELETIONS,master.records[legacy.DELETIONS]):{};
 let missing=0;
 for(const [key,text] of Object.entries(source)){
  const items=legacy.parse(key,text);
  if(key===legacy.DELETIONS){
   for(const [page,ids] of Object.entries(items))
    for(const id of Object.keys(ids))if(!deleted[page]?.[id])missing++;
   continue;
  }
  if(key==='BM062_GRIFOS_META'){
   const canonical=master.records[key]?JSON.parse(master.records[key]):{};
   for(const [id,value] of Object.entries(items)){
    const deletedMeta=Object.entries(deleted).some(([page,ids])=>{
     const m=/^BM030_STROKES_PDF:(.+):([^:]+):P\d+$/.exec(page);
     return m&&Object.keys(ids).some(x=>x.startsWith('id:')&&id==='TXT:'+m[1]+':'+m[2]+':'+x.slice(3));
    });
    if(deletedMeta)continue;
    if(Object.hasOwn(canonical,id)&&same(canonical[id],value))continue;
    if(!conflicts.get(bucket(key,'meta:'+id))?.includes(literal(value)))missing++;
   }
   continue;
  }
  const canonical=master.records[key]?JSON.parse(master.records[key]):[];
  const known=new Map(canonical.map(m=>[identity(m),literal(m)]));
  for(const mark of items){
   const id=identity(mark),value=literal(mark);
   if(mark?.bm108_deleted_at||deleted[key]?.[id])continue;
   if(known.get(id)===value||conflicts.get(bucket(key,id))?.includes(value))continue;
   missing++;
  }
 }
 return {ok:missing===0,missing};
}

function final(master){
 const checked=validate(master);
 return {...checked,revision:checked.revision+1,updated_at:new Date().toISOString()};
}
window.BancoMestreGrifosMasterV104=Object.freeze({
 SCHEMA,empty,validate,merge,contains,final
});
})();

;
/* 57 assets/v263_grifos_drive.js */
/* V239: compartilhar token drive.file do botão central sem nova autorização. */
/* V122 — mestre privado de grifos: cores persistentes, IDs mínimos de exclusão entre aparelhos. */
/* V103 — sincronização conservadora de grifos em arquivos PRIVADOS no Drive.
 * Um arquivo JSON por dispositivo, sem substituir o arquivo de outro aparelho.
 * Nenhum token é salvo em localStorage; sem upload sem autenticação/autorização.
 * O core aplica somente importações aditivas e informa alterações conflitantes.
 */
(function(){
'use strict';
if(window.BancoMestreGrifosDriveSyncV104)return;
const core=window.BancoMestreGrifosSyncCoreV103,
      masterCore=window.BancoMestreGrifosMasterV104,
      library=document.getElementById('grifos')||document.getElementById('pdfs');
if(!core||!masterCore||!library)return;
const API='https://www.googleapis.com/drive/v3/files',
      UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
      SCOPE='https://www.googleapis.com/auth/drive.file',
      KIND='bm_grifos_sync_v104_master',LEGACY_KIND='bm_grifos_sync_v103',
      DEVICE_KEY='BM103_GRIFOS_DEVICE_ID',
      AUTO_KEY='BM103_GRIFOS_AUTO_SYNC',
      INTERVAL=120000;
let token='',expiry=0,client=null,pendingConsent=null,busy=false,
    lastRun=0,scheduled=null,auto=false,pendingEdit=false;
try{auto=localStorage.getItem(AUTO_KEY)!=='0'}catch(_){auto=true}
function deviceId(){
 let id;try{id=localStorage.getItem(DEVICE_KEY)}catch(_){}
 if(!/^[A-Za-z0-9_-]{8,100}$/.test(id||'')){
  id=globalThis.crypto?.randomUUID?.()||
   'local-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,14);
  try{localStorage.setItem(DEVICE_KEY,id)}catch(_){}
 }
 return id;
}
const device=deviceId(),el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
const section=el('section');section.id='bm103DriveSync';section.className='bm103-drive-sync';
section.setAttribute('aria-label','Compartilhar grifos entre celular e computador');
const title=el('h3','Arquivo mestre único — grifos');
const explain=el('p','Grifos, cores e notas ficam no navegador e no arquivo mestre privado do Drive após conexão. Apagar um grifo remove seu conteúdo; fica apenas uma referência mínima para não reaparecer de cópias antigas. O PDF original não é modificado.');
const controls=el('div');controls.className='bm103-sync-actions';
const connect=el('button','Conectar Google Drive');connect.id='bm103SyncConnect';connect.type='button';connect.disabled=true;
const sync=el('button','Sincronizar agora');sync.id='bm103SyncNow';sync.type='button';sync.disabled=true;
const backup=el('button','Baixar backup local');backup.id='bm103SyncBackup';backup.type='button';
controls.append(connect,sync,backup);
const label=el('label');label.className='bm103-sync-auto';
const check=el('input');check.id='bm103SyncAuto';check.type='checkbox';check.checked=auto;
const info=el('span','Sincronizar após editar; sem consultas periódicas ao Drive');
label.append(check,info);
const status=el('p','Preparando a conexão Google…');status.id='bm103SyncStatus';
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const note=el('p','Segurança: as exclusões são propagadas por identificadores mínimos; nenhum conteúdo apagado é mantido no mestre atual. Backups antigos do dispositivo e revisões históricas do Drive não são apagados automaticamente. Faça backups periódicos dos grifos ainda existentes.');
note.className='bm103-sync-note';
section.append(title,explain,controls,label,status,note);
(library.querySelector('.bm062-panel')||library.querySelector('.panel'))?.append(section);
function say(text,error=false){
 status.textContent=text;status.classList.toggle('bm103-sync-error',error);
}
function authorized(){return !!(window.BM239DriveGlobal?.writeToken?.()||(token&&Date.now()<expiry-60000?token:''))}
function ui(){
 connect.disabled=!client||busy;
 sync.disabled=!authorized()||busy;
 backup.disabled=busy;
 check.disabled=busy;
 connect.textContent=authorized()?'Reconectar conta Google':'Conectar Google Drive';
}
async function bootGoogle(){
 try{
  const conf=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(Error('Configuração OAuth não encontrada')));
  if(!/^[A-Za-z0-9_.-]+\.apps\.googleusercontent\.com$/.test(conf.client_id||''))throw Error('Client ID Google incompleto');
  if(!window.google?.accounts?.oauth2){
   await new Promise((resolve,reject)=>{
    const pre=document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if(pre){let waited=0;const wait=setInterval(()=>{
     if(window.google?.accounts?.oauth2){clearInterval(wait);resolve()}
     else if(++waited>50){clearInterval(wait);reject(Error('Biblioteca Google indisponível'))}
    },120);return}
    const sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';
    sc.async=true;sc.onload=resolve;sc.onerror=()=>reject(Error('Não foi possível carregar Google Identity Services'));
    document.head.append(sc);
   });
  }
  client=window.google.accounts.oauth2.initTokenClient({
   client_id:conf.client_id,scope:SCOPE,callback:r=>{
    if(!pendingConsent)return;
    const pending=pendingConsent;pendingConsent=null;
    if(r?.error||!r?.access_token){pending.reject(Error(r?.error||'Autorização não concedida'));return}
    token=r.access_token;expiry=Date.now()+Math.max(300,Number(r.expires_in)||3600)*1000;
    pending.resolve();
   }
  });
  say('Pronto. Conecte a mesma conta Google em cada aparelho para começar.');
 }catch(e){say('Conexão Google indisponível: '+e.message+'. Backup local permanece disponível.',true)}
 ui();
}
function consent(){
 if(!client)throw Error('Autenticação ainda não está pronta');
 if(pendingConsent)throw Error('Uma autorização já está em andamento');
 // Called synchronously from a real button click to avoid popup blockers.
 return new Promise((resolve,reject)=>{
  pendingConsent={resolve,reject};
  try{client.requestAccessToken({prompt:'consent'})}
  catch(e){pendingConsent=null;reject(e)}
 });
}
async function request(url,options={}){
 if(!authorized())throw Error('Sessão Google expirada; reconecte sua conta');
 const headers={Authorization:'Bearer '+(window.BM239DriveGlobal?.writeToken?.()||token),...options.headers};
 const r=await fetch(url,{...options,headers,cache:'no-store'});
 if(!r.ok){
  if(r.status===401||r.status===403){token='';expiry=0;ui()}
  const body=await r.text().catch(()=>'');
  throw Error('Google Drive HTTP '+r.status+(body.includes('insufficientPermissions')?' (permissão insuficiente)':''));
 }
 return r;
}
async function findFiles(kind){
 const result=[];let next='',pages=0;
 const q="trashed = false and appProperties has { key='bm_kind' and value='"+kind+"' }";
 do{
  const url=new URL(API);
  url.searchParams.set('q',q);url.searchParams.set('spaces','drive');
  url.searchParams.set('pageSize','100');
  url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,size,mimeType,appProperties,modifiedTime,version)');
  if(next)url.searchParams.set('pageToken',next);
  const data=await (await request(url.toString())).json();
  if(data.incompleteSearch)throw Error('Pesquisa do Drive incompleta; nenhuma alteração aplicada');
  for(const f of data.files||[])
   if(f.appProperties?.bm_kind===kind)result.push(f);
  next=data.nextPageToken||'';pages++;
 }while(next&&pages<5);
 if(next)throw Error('Pesquisa incompleta; não é seguro gravar');
 if(result.length>30)throw Error('Há mais de 30 arquivos antigos; é necessária auditoria');
 return result;
}
async function readFile(file,kind){
 if(Number(file.size)>core.LIMIT_BYTES)throw Error('Arquivo Drive maior que 12 MB: '+file.name);
 if(!/^[A-Za-z0-9_-]{10,}$/.test(file.id||''))throw Error('Identificador do Drive inválido');
 const r=await request(API+'/'+encodeURIComponent(file.id)+'?alt=media');
 const text=await r.text();
 if(text.length>core.LIMIT_BYTES)throw Error('Arquivo mestre excede 12 MB');
 const data=JSON.parse(text);
 if(kind===KIND){
  masterCore.validate(data);
 }else{
  core.validate(data);
  if(data.device!==file.appProperties?.bm_device)
   throw Error('Backup antigo associado a dispositivo diferente');
 }
 return data;
}
async function fileMeta(file){
 const url=API+'/'+encodeURIComponent(file.id)+'?fields=id,version,size,appProperties';
 const result=await (await request(url)).json();
 if(result.id!==file.id||result.appProperties?.bm_kind!==KIND)
  throw Error('O arquivo mestre mudou de identificação');
 return result;
}
async function createMaster(snapshot){
 const metadata={
  name:'BancoMestre_Grifos_Mestre.json',mimeType:'application/json',
  appProperties:{bm_kind:KIND,bm_schema:'V104'}
 };
 const boundary='bm104-'+(globalThis.crypto?.randomUUID?.()||Date.now());
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+
  JSON.stringify(metadata)+'\r\n--'+boundary+
  '\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(snapshot)+
  '\r\n--'+boundary+'--';
 const r=await request(UPLOAD+'?uploadType=multipart&fields=id,name,size,appProperties,version',{
  method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body
 });
 const result=await r.json();
 if(!result.id||result.appProperties?.bm_kind!==KIND)
  throw Error('Criação do arquivo mestre não confirmada');
 return result.id;
}
async function updateMaster(file,snapshot){
 const url=UPLOAD+'/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,size,modifiedTime,version';
 const response=await request(url,{method:'PATCH',
  headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(snapshot)});
 const result=await response.json();
 if(result.id!==file.id)throw Error('Atualização do mestre sem identificação confirmada');
 return result;
}
let bm263InFlight=null;
 function syncOnce(manual=false){
  if(bm263InFlight)return bm263InFlight;
  bm263InFlight=syncOnceInner(manual).finally(()=>{bm263InFlight=null});
  return bm263InFlight;
 }
 async function syncOnceInner(manual=false){
 if(busy||!authorized())return;
 if(window.BancoMestrePDFV042?.editing){
  if(manual)say('Feche o PDF antes de sincronizar. Os grifos permanecem salvos localmente.');
  return;
 }
 busy=true;ui();
 try{
  say('Lendo o arquivo mestre privado, as cores e as exclusões confirmadas…');
  const masters=await findFiles(KIND);
  if(masters.length>1)
   throw Error('Foram encontrados dois arquivos mestres. Pare e revise antes de continuar');
  const legacyFiles=await findFiles(LEGACY_KIND);
  // User retains their own device files as read-only migration/restore material.
  const oldBundles=[];
  for(const file of legacyFiles){
   if(!/^[A-Za-z0-9_-]{8,100}$/.test(file.appProperties?.bm_device||''))continue;
   oldBundles.push(await readFile(file,LEGACY_KIND));
  }
  const ownSnapshot=core.capture(localStorage,device);
  const selected=masters[0]||null;
  const remote=selected?await readFile(selected,KIND):null;
  // Preserve alternatives for edited IDs inside the single master file.
  const build=masterCore.merge(remote,[...oldBundles,ownSnapshot]);
  const candidate=masterCore.final(build.master);
  let id=selected?.id;
  if(!selected){
   // Recheck before creating to avoid an obvious double-master race.
   if((await findFiles(KIND)).length)throw Error('Outro aparelho criou o mestre. Sincronize novamente');
   id=await createMaster(candidate);
  }else if(build.changed){
   // Best-effort optimistic concurrency: recheck the Drive version before PATCH.
   // Drive v3 does not document an atomic compare-and-swap for media updates.
   const latest=await fileMeta(selected);
   if(String(latest.version)!==String(selected.version))
    throw Error('O mestre foi alterado por outro aparelho. Clique novamente para mesclar');
   await updateMaster(selected,candidate);
  }
  const confirmed=await readFile({id,size:core.LIMIT_BYTES},KIND);
  const mine=masterCore.contains(confirmed,ownSnapshot);
  const expected=masterCore.contains(confirmed,candidate);
  if(!mine.ok||!expected.ok)throw Error('Conferência pós-gravação não confirmou todos os grifos; sua cópia local foi preservada');
  // Mesclagem preserva anotações ativas e aplica os IDs mínimos de exclusão também neste navegador.
  const remoteSnapshot={
   schema:core.SCHEMA,device:'MASTER-V104-0000',
   generated_at:confirmed.updated_at,records:confirmed.records
  };
  const additions=core.plan(localStorage,[remoteSnapshot]);
  if(additions.writes.length){
   core.apply(localStorage,additions);
   window.dispatchEvent(new CustomEvent('bm-pdf-storage-changed',{detail:{action:'master-import'}}));
  }
  lastRun=Date.now();pendingEdit=false;
  const issues=confirmed.conflicts.length;
  say('Cores/grifos confirmados no Drive: '+Object.keys(confirmed.records).length+
    ' registro(s) de páginas/metadados; '+additions.additions+
    ' acréscimo(s) neste aparelho; exclusões sincronizadas.'+
    (issues?' Existem '+issues+' divergência(s) preservada(s) para revisão.':' Sem divergências detectadas.')+
    ' Arquivo único ativo.');
  status.classList.toggle('bm103-sync-warning',!!issues);
 }catch(e){
  say('Não sincronizado com o mestre: '+e.message+'. Grifos locais mantidos; não apague o navegador.',true);
 }finally{busy=false;ui()}
}
const runSync=syncOnce;
function backupLocal(){
 try{
  const bundle=core.capture(localStorage,device);
  const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='BancoMestre_Grifos_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  say('Download do backup solicitado. Confira se o arquivo foi salvo.');
 }catch(e){say('Não foi possível preparar backup: '+e.message,true)}
}
connect.addEventListener('click',()=>{
 if(!client||busy)return;
 say('Abrindo a autorização do Google…');
 consent().then(()=>{ui();say('Conta conectada. Iniciando a conferência privada dos grifos…');return runSync(true)})
 .catch(e=>{say('Autorização não concluída: '+e.message,true);ui()});
});
sync.addEventListener('click',()=>runSync(true));
backup.addEventListener('click',backupLocal);
check.addEventListener('change',()=>{
 auto=check.checked;try{localStorage.setItem(AUTO_KEY,auto?'1':'0')}catch(_){}
 say(auto?'Salvamento após edições habilitado, sem buscas periódicas.':'Sincronização automática pausada; botão manual disponível.');
 if(auto&&authorized())void runSync();
});
// When the reader closes, upload changes made during this study session.
const reader=document.getElementById('pdfDialog');
if(reader)reader.addEventListener('close',()=>{
 if(pendingEdit&&auto&&authorized()&&!busy)
  setTimeout(()=>{if(document.visibilityState==='visible')void runSync()},800);
});
window.addEventListener('bm-pdf-storage-changed',()=>{
 pendingEdit=true;
 if(!auto||!authorized()||busy||scheduled)return;
 scheduled=setTimeout(()=>{scheduled=null;if(document.visibilityState==='visible')void runSync()},20000);
});
// V326: grifos só sincronizam por edição local, fechamento com pendência ou ação explícita.
window.BancoMestreGrifosDriveSyncV104=Object.freeze({
 get connected(){return authorized()},get deviceId(){return device},
 get lastSync(){return lastRun},sync:()=>runSync(true),get lastStatus(){return status.textContent}
});
bootGoogle();
})();

;
/* 58 assets/v109_mobile_library.js */
/* V109 — Flashcards e Imagens: pesquisa primeiro, filtros avançados recolhidos
 * só no celular. Os mesmos nós/IDs são movidos, sem clonar nem perder eventos.
 * Painel de apresentação/estatísticas continua acessível em "Visão geral".
 */
(function(){
'use strict';
if(window.BancoMestreMobileLibraryV109)return;
const main=document.querySelector('main'),hero=main?.querySelector(':scope > .hero'),
 stats=main?.querySelector(':scope > .stats');
const media=window.matchMedia('(max-width:760px)');
if(!main||!hero||!stats)return;
const intro=document.createElement('details');
intro.id='bm109Overview';intro.className='bm109-overview';
const caption=document.createElement('summary');caption.textContent='Visão geral e números do acervo';
intro.append(caption);
hero.before(intro);
intro.append(hero,stats);
let configured=false;
const libraries=[];
for(const id of ['cartoes','imagens']){
 const root=document.getElementById(id),controls=root?.querySelector('.controls');
 if(!root||!controls)continue;
 const introLine=root.querySelector('.panel > p.intro');
 if(introLine)introLine.textContent=id==='cartoes'?
  'Busque um cartão, veja a pergunta e revele a resposta sem alterar o SRS.':
  'Busque uma prancha e toque na imagem para ampliar.';
 const opts=[...controls.children].filter(e=>
  e.tagName==='SELECT'||e.tagName==='LABEL');
 const count=controls.querySelector('#'+(id==='cartoes'?'cardCount':'imageCount'));
 const filter=document.createElement('details');
 filter.className='bm109-filters';
 filter.id='bm109Filters'+(id==='cartoes'?'Cards':'Images');
 const summary=document.createElement('summary');
 summary.textContent=id==='cartoes'?'Filtros de cartões':'Filtros de imagens';
 filter.append(summary);
 // Rich help is still available without occupying initial reading space.
 let help=null;
 if(id==='imagens'){
  const p=root.querySelector('.panel'),notice=p?.querySelector('.notice'),
   original=p?.querySelector('.originalHelp');
  if(notice||original){
   help=document.createElement('details');help.className='bm109-image-help';
   const caption=document.createElement('summary');caption.textContent='Sobre originais e conferência técnica';
   help.append(caption);
   if(notice)help.append(notice);
   if(original)help.append(original);
   const after=p?.querySelector('.controls');
   after?.before(help);
  }
 }
 libraries.push({controls,opts,count,filter,help});
}
function adapt(){
 const mobile=media.matches;
 intro.open=!mobile;
 intro.classList.toggle('bm109-small',mobile);
 for(const lib of libraries){
  const {controls,opts,count,filter,help}=lib;
  if(help)help.open=!mobile;
  if(mobile){
   if(filter.parentNode!==controls)controls.append(filter);
   for(const node of opts)filter.append(node);
   if(!configured)filter.open=false;
  }else{
   for(const node of opts)if(node.parentNode!==controls)
    controls.insertBefore(node,count||filter);
   filter.remove();
  }
 }
 configured=true;
}
adapt();
media.addEventListener?.('change',adapt);
window.BancoMestreMobileLibraryV109=Object.freeze({refresh:adapt,filters:libraries.length});
})();

;
/* 59 assets/v121_calibrador_ui.js */
/* V121 — explicação da vinculação normativa de artigos, incisos e remissões. */
/* Preserva o calibrador por PDF/hash e a seleção explicitamente confirmada. */
/* V111 — mismatch warning, safe persistence and cross-tab preference update. */
/* V110 — Calibrador da lei no editor PDF. Escolha confirmada por documento + hash.
 * Preferência local do aparelho. Cada novo grifo registra o perfil no mestre.
 * Não toca nos grifos previamente existentes.
 */
(function(){
'use strict';
if(window.BancoMestreCalibradorUIV110)return;
const model=window.BancoMestreCalibradoresV110,dialog=document.getElementById('pdfDialog'),
 tools=document.getElementById('pdfLocalTools');
if(!model||!dialog||!tools)return;
const $=id=>document.getElementById(id);
const shell=document.createElement('div');
shell.className='bm110-calibrator';shell.id='bm110Calibrador';
shell.setAttribute('role','group');
shell.setAttribute('aria-label','Calibrador da lei selecionada');
const label=document.createElement('label');label.htmlFor='bm110Profile';
label.textContent='Calibrador da lei';
const select=document.createElement('select');select.id='bm110Profile';
select.setAttribute('aria-label','Escolher a lei para calibrar os grifos');
for(const p of model.profiles){
 const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.label;
 select.append(opt);
}
const suggestion=document.createElement('button');suggestion.id='bm110Suggestion';
suggestion.type='button';suggestion.hidden=true;
const hint=document.createElement('small');hint.id='bm110Hint';
hint.setAttribute('role','status');
const details=document.createElement('details');details.className='bm110-help';
const summary=document.createElement('summary');summary.textContent='Como este perfil grifa?';
const description=document.createElement('p');details.append(summary,description);
shell.append(label,select,suggestion,hint,details);
const bar=$('bm068QuickBar');
if(bar?.parentNode===tools)bar.after(shell);
else tools.prepend(shell);
let currentKey='',selectedId='geral',suggestedId=null;
function current(){
 const pdf=window.BancoMestrePDFV042;
 if(!pdf?.editing||!pdf.currentDoc)return null;
 const doc=pdf.currentDoc,hash=String(pdf.sourceHash||'').slice(0,70);
 if(!doc.id||!hash)return null;
 return {doc,hash,key:'BM110_PROFILE_DOC:'+encodeURIComponent(String(doc.id)).slice(0,180)+':'+encodeURIComponent(hash)};
}
function load(id){
 try{
  const value=localStorage.getItem(id);
  return model.validProfile(value)?value:'geral';
 }catch{return 'geral'}
}
function update(){
 const ctx=current();
 if(!ctx){
  currentKey='';selectedId='geral';suggestedId=null;
  select.value='geral';select.disabled=true;suggestion.hidden=true;
  hint.textContent='Abra um PDF para selecionar o perfil.';
  description.textContent='Sem novas cores: regra, agente, condição e exceção.';
  return;
 }
 if(currentKey!==ctx.key){
  currentKey=ctx.key;selectedId=load(ctx.key);
 }
 select.disabled=false;select.value=selectedId;
 suggestedId=model.detectDocument([ctx.doc.title,ctx.doc.filename,ctx.doc.name].filter(Boolean).join(' '));
 // Suggestions are never activated without the student's explicit click.
 suggestion.hidden=!suggestedId||suggestedId===selectedId;
 if(!suggestion.hidden)suggestion.textContent='Usar sugestão: '+model.getProfile(suggestedId).label;
 const p=model.getProfile(selectedId);
 hint.textContent=selectedId==='geral'?
  'Quatro cores gerais. '+(suggestedId?'Foi reconhecida uma lei: confirme a sugestão.':'Selecione uma lei, se desejar.') :
  (suggestedId&&suggestedId!==selectedId?
   'Confira o perfil: o título sugere '+model.getProfile(suggestedId).label+
    ', mas você escolheu '+p.label+'. A classificação continuará com a sua escolha.':
   'Perfil ativo neste PDF: '+p.label+'.');
 const art1AI=selectedId==='cf88'&&window.BancoMestreCFArtigo1V114&&
  window.BancoMestreIALeiSecaV114?
  ' Art. 1º: formação da República, fundamentos (I–V) e poder do povo. '+
  'IA local supervisionada ('+window.BancoMestreIALeiSecaV114.examples+
  ' exemplos rotulados), somente segunda opinião; a estrutura do artigo decide os grifos seguros.':'';
 const linkage=window.BancoMestreRelacoesNormativasV121?
  ' Relações por lei: artigos, parágrafos, incisos, alíneas e remissões no perfil escolhido. '+
  'No CF/88, os arts. 2º–4º têm trechos literais adicionais. '+
  'A estrutura não comprova a vigência nem a identidade real do PDF.':'';
 description.textContent=p.desc+' Pergunta de revisão: '+p.question+
  ' O reconhecimento é heurístico; confira o dispositivo e a versão da lei.'+art1AI+linkage;
}
function choose(id){
 const ctx=current();
 if(!ctx||!model.validProfile(id))return false;
 // Persist only the preference. It does not edit historical annotations.
 try{localStorage.setItem(ctx.key,id)}
 catch(_){
  select.value=selectedId;
  hint.textContent='Não foi possível salvar o perfil neste navegador; confira o armazenamento.';
  return false;
 }
 currentKey=ctx.key;selectedId=id;update();
 window.dispatchEvent(new CustomEvent('bm-pdf-calibration-changed',{
  detail:{id,documentId:ctx.doc.id,hash:ctx.hash}
 }));
 return true;
}
select.addEventListener('change',()=>choose(select.value));
suggestion.addEventListener('click',()=>{if(suggestedId)choose(suggestedId)});
window.addEventListener('bm-pdf-active-page-rendered',update);
window.addEventListener('bm-pdf-tool-change',update);
window.addEventListener('bm-pdf-tools-organized',update);
window.addEventListener('storage',e=>{
 if(e.key===currentKey){selectedId=load(currentKey);update()}
});
dialog.addEventListener('close',()=>{currentKey='';update()});
update();
window.BancoMestreCalibradorUIV110=Object.freeze({
 refresh:update,choose,getActiveProfileId(){
  const ctx=current();
  if(!ctx)return 'geral';
  return ctx.key===currentKey?selectedId:load(ctx.key);
 },get suggestion(){return suggestedId},get documentKey(){return currentKey}
});
})();


;
/* 60 assets/v303_compact_bibliotecas.js */
/* V113 — compactação reversível das bibliotecas, otimizada para celular.
 * Move APENAS nós de apresentação/filtros; preserva IDs, eventos, dados e SRS.
 * <details> inicia fechado em telas pequenas, e volta ao DOM original no desktop.
 */
(function(){
'use strict';
if(window.BancoMestreCompactBibliotecasV113)return;
const mq=window.matchMedia?.('(max-width:760px)');
const pdfSection=document.getElementById('pdfs');
const grifos=document.getElementById('grifos');
if(!mq||!pdfSection||!grifos)return;
const byId=id=>document.getElementById(id);
const mounts=[];
const state={mobile:false,enabled:false};
function makeFold(parent,before,id,label){
 const details=document.createElement('details');
 details.id=id;details.className='bm113-fold';
 const summary=document.createElement('summary');summary.className='bm113-summary';
 const text=document.createElement('strong');text.className='bm113-summary-title';text.textContent=label;
 summary.append(text);
 const content=document.createElement('div');content.className='bm113-fold-body';
 details.append(summary,content);
 parent.insertBefore(details,before||null);
 return {details,summary,text,content};
}
function relocate(node,container,label){
 if(!node||!node.parentNode||!container)return;
 const marker=document.createComment('bm113-original-'+label);
 node.parentNode.insertBefore(marker,node);
 mounts.push({node,marker,container});
}
function move(m,small){
 if(small){
  if(m.node.parentNode!==m.container)m.container.append(m.node);
 }else{
  if(m.marker.parentNode&&m.node.previousSibling!==m.marker)m.marker.after(m.node);
 }
}
function observeDetail(fold,controller){
 fold.details.addEventListener('toggle',()=>{
  if(mq.matches&&fold.details.open)controller?.();
 });
}
function monitorInputs(root,inputs,fold,title){
 const update=()=>{
  let count=0;
  for(const el of inputs){
   if(!el)continue;
   if(el.type==='checkbox'){if(el.checked)count++}
   else if(el.tagName==='SELECT'&&el.value&&el.value!=='all')count++;
  }
  fold.text.textContent=title+(count?' · '+count+' ativo'+(count===1?'':'s'):'');
  fold.details.classList.toggle('bm113-active',count>0);
 };
 for(const el of inputs){el?.addEventListener('change',update);el?.addEventListener('input',update)}
 update();return update;
}
// Flashcards/Imagens: instruções e ajuda técnica são acessíveis dentro dos
// filtros já recolhíveis da V109. A pesquisa e todos os resultados ficam fora.
const cardOptions=byId('bm109FiltersCards'),imageOptions=byId('bm109FiltersImages');
if(cardOptions)relocate(document.querySelector('#cartoes .panel > p.intro'),
 cardOptions,'cards-help');
if(imageOptions){
 relocate(document.querySelector('#imagens .panel > p.intro'),imageOptions,'images-help');
 relocate(document.querySelector('#imagens .bm109-image-help'),imageOptions,'images-original-help');
}
// PDFs: busca e número continuam visíveis; barra de áreas, importação,
// filtros, explicações e exclusões passam à seção expansível no celular.
const pdfPanel=pdfSection.querySelector('.panel');
const pdfControls=pdfPanel?.querySelector('.controls');
const pdfRows=byId('pdfRows');
let pdfFold=null,pdfUpdate=null;
if(false&&pdfPanel&&pdfControls&&pdfRows){
 pdfFold=makeFold(pdfPanel,pdfRows,'bm113PdfOptions','Filtros, áreas e PDFs locais');
 const pdfInputs=['pdfFilter','pdfHidden'].map(byId);
 relocate(pdfPanel.querySelector(':scope > p.intro'),pdfFold.content,'pdf-intro');
 relocate(byId('v037LocalGuides'),pdfFold.content,'pdf-local');
 relocate(byId('pdfAreaNavV036'),pdfFold.content,'pdf-area-navigation');
 for(const el of pdfInputs)relocate(el,pdfFold.content,'pdf-filter-'+el?.id);
 pdfUpdate=monitorInputs(pdfControls,pdfInputs,pdfFold,'Filtros, áreas e PDFs locais');
 const bar=byId('pdfAreaNavV036');
 bar?.addEventListener('click',()=>queueMicrotask(pdfUpdate));
 observeDetail(pdfFold,pdfUpdate);
}
// Biblioteca de Grifos: não movimentar o resultado nem os registros.
// Busca, total e "Atualizar" ficam à vista. Drive, backup, diagnóstico e
// exportação continuam disponíveis num único painel recolhível.
const grifosPanel=grifos.querySelector('.bm062-panel');
const grifosResults=byId('bm062Results');
const grifosFilters=grifos.querySelector('.bm062-filters');
let service=null,filterFold=null,maintenance=null,updateGrifos=null;
if(grifosPanel&&grifosResults&&grifosFilters){
 const top=grifosPanel.querySelector('.bm062-top');
 service=makeFold(grifosPanel,top?.nextSibling||grifosResults,
  'bm113GrifosServices','Sincronização, backups e ferramentas');
 maintenance=makeFold(service.content,null,'bm113Maintenance',
  'Backup, exportação e diagnóstico');
 const syncBrief=document.createElement('small');
 syncBrief.id='bm113SyncBrief';syncBrief.setAttribute('aria-live','polite');
 syncBrief.textContent='Consulte o estado do arquivo mestre';
 service.summary.append(syncBrief);
 const countSlot=document.createElement('div');
 countSlot.className='bm113-grifos-count';countSlot.id='bm113GrifosCount';
 grifosFilters.after(countSlot);
 filterFold=makeFold(grifosFilters,null,'bm113GrifosFilters','Filtrar grifos');
 const filterIds=['bm062Discipline','bm062Topic','bm062Document',
  'bm062Color','bm062Kind','bm062Favs','bm108ShowRemoved'];
 const filterInputs=filterIds.map(byId).filter(Boolean);
 // Favorites and "Mostrar excluídos" are labels containing original checkboxes.
 for(const id of filterIds){
  const el=byId(id);
  if(!el)continue;
  const node=(el.type==='checkbox'?el.closest('label'):el);
  relocate(node,filterFold.content,'grifos-filter-'+id);
 }
 updateGrifos=monitorInputs(grifosFilters,filterInputs,filterFold,'Filtrar grifos');
 // Move the count before moving the export row, to retain its original
 // source position even if the entire export panel moves.
 relocate(byId('bm062Count'),countSlot,'grifos-count');
 relocate(top?.querySelector('.intro'),maintenance.content,'grifos-intro');
 relocate(byId('bm062Backup'),maintenance.content,'grifos-backup');
 relocate(grifosPanel.querySelector(':scope > .notice'),maintenance.content,'grifos-notice');
 relocate(byId('bm066DriveBackup'),maintenance.content,'grifos-legacy-backup');
 relocate(byId('bm067Audit'),maintenance.content,'grifos-diagnostics');
 relocate(grifosPanel.querySelector('.bm062-export'),maintenance.content,'grifos-export');
 relocate(byId('bm103DriveSync'),service.content,'grifos-master');
 const status=byId('bm103SyncStatus');
 const syncUpdate=()=>{
  if(!status)return;
  const info=String(status.textContent||'').replace(/\s+/g,' ').trim();
  syncBrief.textContent=info.length>105?info.slice(0,102)+'…':info||'Estado do Drive não disponível';
  const risky=status.classList.contains('bm103-sync-error')||
   status.classList.contains('bm103-sync-warning');
  service.details.classList.toggle('bm113-attention',risky);
 };
 syncUpdate();
 if(status&&typeof MutationObserver==='function')
  new MutationObserver(syncUpdate).observe(status,{childList:true,subtree:true,
   characterData:true,attributes:true,attributeFilter:['class']});
 observeDetail(filterFold,updateGrifos);
}
function adapt(){
 const small=!!mq.matches;
 if(state.enabled&&state.mobile===small)return;
 state.enabled=true;state.mobile=small;
 // Restore order matters for nested export count: child first, parent second.
 for(const m of mounts)move(m,small);
 for(const fold of [pdfFold,service,filterFold,maintenance]){
  if(!fold)continue;
  fold.details.hidden=!small;
  if(!small)fold.details.open=false;
  if(small&&!fold.details.dataset.bm113Init){
   fold.details.dataset.bm113Init='1';fold.details.open=false;
  }
 }
 pdfUpdate?.();updateGrifos?.();
}
adapt();
mq.addEventListener?.('change',adapt);
if(!mq.addEventListener)mq.addListener?.(adapt);
window.BancoMestreCompactBibliotecasV113=Object.freeze({
 refresh:adapt,get mobile(){return state.mobile},
 get foldCount(){return [pdfFold,service,filterFold,maintenance].filter(Boolean).length},
 get moved(){return mounts.length}
});
})();

;
/* 61 assets/v118_ui_compact.js */
/* Banco Mestre V118 — reduz detalhes visuais sem remover eventos.
   Vade: move nos existentes (preserva listeners e input de backup).
   PDF: distingue catalogo Drive de conexao ao editor PDF. */
(function(){
 'use strict';
 if(window.BancoMestreCompactSyncV118)return;
 const $=id=>document.getElementById(id);
 function init(){
  const vade=$('bmVade041');
  if(vade&&!vade.classList.contains('bm118-ready')){
   const actions=vade.querySelector('.bm-vade-actions');
   const opener=actions?.querySelector('button:not(.bm-vade-secondary)');
   const intro=vade.querySelector(':scope > p:not(.bm-vade-status)');
   const status=vade.querySelector(':scope > .bm-vade-status');
   if(actions&&opener&&intro&&status){
    const details=document.createElement('details');
    details.className='bm118-vade-more';
    const summary=document.createElement('summary');
    summary.textContent='Backups e informações';
    summary.setAttribute('aria-label','Mostrar opções de backup e informações do Vade Mecum');
    const body=document.createElement('div');
    body.className='bm118-vade-body';
    // Move itens reais; nunca clones, para preservar funcao de importar e salvar.
    body.append(intro);
    for(const child of [...actions.children]){
     if(child!==opener)body.append(child);
    }
    body.append(status);
    details.append(summary,body);
    actions.append(details);
    vade.classList.add('bm118-ready');
    const update=()=>{
      const message=(status.textContent||'').replace(/\s+/g,' ').trim();
      summary.title=message;
      status.title=message;
      const urgent=/erro|falha|não foi possível|incompatível|corrompid|atenção/i.test(message);
      details.dataset.attention=urgent?'1':'0';
      summary.textContent=urgent?'Backups e aviso':'Backups e informações';
    };
    update();
    if(typeof MutationObserver==='function')
     new MutationObserver(update).observe(status,{childList:true,subtree:true,characterData:true});
   }
  }
  const pdfSync=$('bm-pdf-sync');
  const catalogButton=$('bm-pdf-sync-connect');
  if(pdfSync&&catalogButton){
   const label=pdfSync.querySelector(':scope > strong');
   if(label)label.textContent='Catálogo PDF do Drive';
   catalogButton.textContent='Sincronizar catálogo';
   catalogButton.title='Atualizar a lista de documentos das pastas NRs e Licenciamento. A autorização para abrir PDFs no editor é separada.';
   const editButton=$('driveConnectV038');
   if(editButton)editButton.title='Autorizar acesso aos arquivos para abrir os PDFs privados no editor';
  }
  for(const id of ['bm-v075-status','bm-v114-home-status','bm-v116-home-status','bm-pdf-sync-status']){
   const el=$(id);
   if(!el||el.dataset.bm118Title==='1')continue;
   el.dataset.bm118Title='1';
   const update=()=>{el.title=(el.textContent||'').replace(/\s+/g,' ').trim();};
   update();
   if(typeof MutationObserver==='function')
    new MutationObserver(update).observe(el,{childList:true,subtree:true,characterData:true});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
 window.BancoMestreCompactSyncV118=Object.freeze({refresh:init});
})();

;
/* 62 assets/v201_public_cards_ui.js */
/* V201 — esclarecimento da fonte estática e do limite de sincronização; UI V200 preservada para a base V194 didática é carregada dos JSON públicos do GitHub.
   Sem Google OAuth para cartões. PDFs e grifos mantêm suas próprias conexões.
   Dados SRS e histórico pessoal não fazem parte dos JSON públicos. */
(function(){
 'use strict';
 if(window.BancoMestreStaticCardsV119)return;
 const $=id=>document.getElementById(id);
 function init(){
  const cards=$('cartoes')?.querySelector('.panel');
  const home=$('assuntos')?.querySelector('.panel');
  if(!cards||!home)return;
  const old=cards.querySelector('#bm-v075-sync');
  if(old)old.remove(); // não inicializado na V119; proteção contra módulo legado
  const oldHome=home.querySelector('#bm-v116-home-sync, #bm-v114-home-sync');
  if(oldHome)oldHome.remove();
  if(!$('bm119PublicSource')){
    const info=document.createElement('div');
    info.id='bm119PublicSource';
    info.setAttribute('role','status');
    info.textContent='Entre com sua conta Google para carregar seus cartões.';
    cards.insertBefore(info,cards.querySelector('.controls')||cards.firstChild);
  }
  if(!$('bm119HomeSource')){
    const info=document.createElement('div');
    info.id='bm119HomeSource';
    info.setAttribute('role','status');
    info.textContent='Entre com sua conta Google para explorar seus assuntos.';
    home.insertBefore(info,home.querySelector('#areaRows')||home.firstChild);
  }
  const controls=cards.querySelector('.controls');
  if(controls&&!$('bm119ShowInactive')){
    const label=document.createElement('label');
    label.className='checkbox';label.id='bm119InactiveLabel';
    const input=document.createElement('input');input.type='checkbox';input.id='bm119ShowInactive';
    label.append(input,document.createTextNode('Mostrar inativos (arquivo)'));
    controls.append(label);
    input.addEventListener('change',()=>{if(typeof cardRender==='function')cardRender();});
  }
  // O indicador oficial pertence exclusivamente ao módulo BM184Header.
  if(typeof cardRender==='function')cardRender();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.BancoMestreStaticCardsV119=Object.freeze({refresh:init,version:'V194 didática',total:1518,active:1501,inactive:17});
 window.BancoMestreStaticCardsV194=window.BancoMestreStaticCardsV119;
})();

;
/* 63 assets/v122_flashcard_ink.js */
/* Banco Mestre V122 — caneta, marca-texto, borracha e escrita por cartão.
   Camada pessoal do navegador: não altera perguntas, respostas, IDs, nem SRS. */
(function(){
 'use strict';
 if(window.BancoMestreCardInkV122)return;
 const root=document.getElementById('cardRows');
 if(!root)return;
 const KEY='BM122_CARD_INK:';
 const cardId=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
 const valid=id=>/^(?:CARD-\d{4,5}|PROP-IJUI-[A-Za-z0-9_-]+|TRT0[12]-C00[1-9])$/.test(id);
 const node=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x};
 const button=(text,fn,cls)=>{const b=node('button',text,cls);b.type='button';b.addEventListener('click',fn);return b};
 const overlay=node('div',undefined,'bm122-ink-overlay');overlay.id='bm122CardInk';overlay.hidden=true;
 const backdrop=node('div',undefined,'bm122-ink-backdrop');
 const dialog=node('section',undefined,'bm122-ink-dialog');
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Anotar flashcard');dialog.tabIndex=-1;
 const top=node('div',undefined,'bm122-ink-head');
 const name=node('strong','Anotações do cartão');
 const close=button('✕ Fechar',()=>hide());
 top.append(name,close);
 const guide=node('p','Grife, risque ou escreva sobre a frente ou o verso. Os traços e a nota ficam salvos neste navegador; a base original e o SRS não mudam.','bm122-ink-hint');
 const sides=node('div',undefined,'bm122-ink-sides');
 const frontButton=button('Frente',()=>sideChange('front'),'bm122-ink-side');
 const backButton=button('Verso',()=>sideChange('back'),'bm122-ink-side');
 sides.append(frontButton,backButton);
 const tools=node('div',undefined,'bm122-ink-tools');
 const modes=[['read','Ler / selecionar'],['pen','Caneta'],['highlight','Marca-texto'],['erase','Borracha']];
 let mode='pen',side='front',id='',data=null,working=null,returnFocus=null,persistDelay=null;
 const toolButtons=new Map();
 for(const [value,label] of modes){
  const control=button(label,()=>modeChange(value),'bm122-ink-tool');
  control.dataset.tool=value;toolButtons.set(value,control);tools.append(control);
 }
 const colorLabel=node('label','Cor: ');
 const color=document.createElement('input');color.type='color';color.value='#174059';color.setAttribute('aria-label','Cor do traço');
 colorLabel.append(color);
 const sizeLabel=node('label','Espessura: ');
 const size=document.createElement('input');size.type='range';size.min='2';size.max='28';size.value='7';size.step='1';
 size.setAttribute('aria-label','Espessura do traço');sizeLabel.append(size);
 const undo=button('↶ Desfazer traço',()=>{
  if(!data)return;
  if(data[side].length){data[side].pop();save();paint()}
 });
 const clear=button('Limpar este lado',()=>{
  if(!data||!data[side].length)return;
  if(!confirm('Apagar apenas os traços da '+(side==='front'?'frente':'resposta')+' deste cartão? A nota escrita será preservada.'))return;
  data[side]=[];save();paint();
 });
 tools.append(colorLabel,sizeLabel,undo,clear);
 const sheet=node('div',undefined,'bm122-ink-sheet');
 const sheetText=node('div',undefined,'bm122-ink-sheet-text');
 const sheetCaption=node('small',undefined,'bm122-ink-sheet-caption');
 const question=node('p',undefined,'bm122-ink-question');
 sheetText.append(sheetCaption,question);
 const canvas=document.createElement('canvas');canvas.className='bm122-ink-canvas';canvas.setAttribute('aria-label','Área de desenho do flashcard');
 sheet.append(sheetText,canvas);
 const notesLabel=node('label','Anotações escritas (salvas neste cartão)','bm122-ink-notes-label');
 const notes=document.createElement('textarea');notes.rows=4;notes.maxLength=18000;notes.placeholder='Digite sua resposta, dúvida, macete ou observações sobre este cartão.';
 notesLabel.append(notes);
 const bottom=node('div',undefined,'bm122-ink-bottom');
 const saveState=node('span','As alterações são salvas automaticamente.');saveState.setAttribute('role','status');
 const saveBtn=button('Salvar agora',()=>save());
 bottom.append(saveState,saveBtn);
 dialog.append(top,guide,sides,tools,sheet,notesLabel,bottom);overlay.append(backdrop,dialog);document.body.append(overlay);
 let previousBodyOverflow='';
 function fresh(){return {version:1,front:[],back:[],note:'',updated_at:''}}
 function read(id){
  try{
   const x=JSON.parse(localStorage.getItem(KEY+id)||'null');
   if(!x||x.version!==1||!Array.isArray(x.front)||!Array.isArray(x.back)||typeof x.note!=='string')return fresh();
   const filter=arr=>arr.filter(s=>s&&['pen','highlight'].includes(s.kind)&&
    /^#[0-9a-f]{6}$/i.test(s.color||'')&&Array.isArray(s.points)&&s.points.length<=2500)
    .slice(-600);
   return {...x,front:filter(x.front),back:filter(x.back),note:x.note.slice(0,18000)};
  }catch{return fresh()}
 }
 function save(){
  if(!data||!id)return;
  if(persistDelay){clearTimeout(persistDelay);persistDelay=null}
  data.note=notes.value.slice(0,18000);data.updated_at=new Date().toISOString();
  try{localStorage.setItem(KEY+id,JSON.stringify(data));saveState.textContent='Salvo neste navegador · '+new Date().toLocaleTimeString('pt-BR')}
  catch(e){saveState.textContent='Não foi possível salvar: '+e.message}
 }
 function scheduleSave(){if(persistDelay)clearTimeout(persistDelay);persistDelay=setTimeout(save,450)}
 function rect(){return canvas.getBoundingClientRect()}
 function dimensions(){return {w:Math.max(1,canvas.clientWidth),h:Math.max(1,canvas.clientHeight)}}
 function point(e){const r=rect();return [
  Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),
  Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)))
 ]}
 function drawStroke(ctx,stroke,w,h){
  const pts=stroke.points||[];if(!pts.length)return;
  ctx.save();ctx.globalAlpha=stroke.kind==='highlight'?.27:1;
  ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;
  ctx.lineWidth=Math.max(1,Number(stroke.width)||5)*(w/650);
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(pts[0][0]*w,pts[0][1]*h);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]*w,pts[i][1]*h);
  if(pts.length===1)ctx.lineTo(pts[0][0]*w+.1,pts[0][1]*h+.1);
  ctx.stroke();ctx.restore();
 }
 function paint(){
  const {w,h}=dimensions(),dpr=Math.min(3,window.devicePixelRatio||1);
  const width=Math.ceil(w*dpr),height=Math.ceil(h*dpr);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  for(const s of data?.[side]||[])drawStroke(ctx,s,w,h);
 }
 function modeChange(next){
  if(next==='highlight'&&color.value.toLowerCase()==='#174059')color.value='#fde68a';
  else if(next==='pen'&&color.value.toLowerCase()==='#fde68a')color.value='#174059';
  mode=next;
  for(const [k,b] of toolButtons)b.setAttribute('aria-pressed',String(k===mode));
  canvas.style.pointerEvents=mode==='read'?'none':'auto';
  canvas.style.touchAction=mode==='read'?'auto':'none';
  canvas.style.cursor=mode==='erase'?'cell':mode==='read'?'auto':'crosshair';
  guide.textContent=mode==='read'?'Modo leitura: selecione o texto do cartão sem desenhar.':'Use mouse, dedo ou caneta digital para '+(mode==='erase'?'apagar um traço':'grifar ou escrever')+'. As alterações são salvas automaticamente.';
 }
 function sideChange(next){
  if(!data)return;
  if(working){working=null;save()}
  side=next;sheetCaption.textContent=next==='front'?'FRENTE — PERGUNTA':'VERSO — RESPOSTA';
  const c=((typeof cards!=='undefined'&&Array.isArray(cards))?cards.find(x=>x.id===id):null)||window.BM236TrtCardsGrid?.getRecord?.(id);
  question.textContent=next==='front'?(c?.front||'Sem pergunta'):(c?.back||'Sem resposta cadastrada');
  frontButton.setAttribute('aria-pressed',String(next==='front'));
  backButton.setAttribute('aria-pressed',String(next==='back'));
  requestAnimationFrame(paint);
 }
 function eraseAt(p){
  const {w,h}=dimensions();
  let best=-1,distance=22*22;
  const strokes=data[side];
  for(let i=0;i<strokes.length;i++){
   const s=strokes[i],pts=s.points||[];
   for(let j=0;j<pts.length;j++){
    const dx=(pts[j][0]-p[0])*w,dy=(pts[j][1]-p[1])*h;
    const d=dx*dx+dy*dy;
    if(d<distance){distance=d;best=i}
   }
  }
  if(best>=0){strokes.splice(best,1);paint();save()}
 }
 canvas.addEventListener('pointerdown',e=>{
  if(!data||mode==='read')return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();
  const p=point(e);
  if(mode==='erase'){eraseAt(p);return}
  const stroke={kind:mode,color:color.value,width:Math.max(2,Number(size.value))*(mode==='highlight'?2.2:1),points:[p]};
  if(data[side].length>=600){saveState.textContent='Limite de traços atingido: apague alguns traços antes de continuar.';return}
  data[side].push(stroke);working=stroke;
  canvas.setPointerCapture?.(e.pointerId);paint();
 });
 canvas.addEventListener('pointermove',e=>{
  if(!working)return;e.preventDefault();const p=point(e),last=working.points[working.points.length-1];
  if(Math.hypot(p[0]-last[0],p[1]-last[1])<.0015)return;
  if(working.points.length<2500)working.points.push(p);
  paint();
 });
 function stopStroke(e){
  if(!working)return;
  working=null;
  if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  save();paint();
 }
 canvas.addEventListener('pointerup',stopStroke);canvas.addEventListener('pointercancel',stopStroke);
 notes.addEventListener('input',scheduleSave);
 function open(cardId,focus){
  if(!valid(cardId))return;
  const collection=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
  if(!collection.some(c=>c.id===cardId)&&!window.BM236TrtCardsGrid?.getRecord?.(cardId)?.front)return;
  if(!overlay.hidden)hide();
  id=cardId;data=read(cardId);returnFocus=focus||document.activeElement;
  name.textContent='✎ Anotar flashcard '+cardId;notes.value=data.note||'';
  previousBodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  overlay.hidden=false;sideChange('front');modeChange('pen');
  saveState.textContent=data.updated_at?'Anotações recuperadas · '+new Date(data.updated_at).toLocaleString('pt-BR'):'Novo cartão de anotações';
  dialog.focus({preventScroll:true});requestAnimationFrame(paint);
 }
 function hide(){
  if(overlay.hidden)return;
  save();overlay.hidden=true;document.body.style.overflow=previousBodyOverflow;
  id='';data=null;working=null;returnFocus?.focus?.({preventScroll:true});returnFocus=null;
 }
 close.addEventListener('click',hide);backdrop.addEventListener('click',hide);
 document.addEventListener('keydown',e=>{
  if(overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();hide()}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}
 });
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(!overlay.hidden)paint()}).observe(sheet);
 window.addEventListener('resize',()=>{if(!overlay.hidden)paint()});
 function decorate(){
  for(const article of root.querySelectorAll('article.card')){
   if(article.querySelector('.bm122-ink-launch'))continue;
   const c=cardId(article);if(!valid(c))continue;
   const launch=button('✎ Grifar / escrever',()=>open(c,launch),'bm122-ink-launch');
   launch.title='Anotar e grifar a frente ou o verso de '+c+' sem alterar a resposta';
   const actions=article.querySelector(':scope > .buttons');
   if(actions)actions.prepend(launch);
   else article.append(launch);
  }
 }
 let scheduled=false;
 const observer=new MutationObserver(()=>{
  if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()});
 });
 observer.observe(root,{childList:true,subtree:true});decorate();
 const peek=document.querySelector('#bmCardPeekV050 .bm-v050-peek-header');
 if(peek&&!peek.querySelector('.bm122-ink-peek-btn')){
  const launch=button('✎ Anotar',()=>{
   const found=document.querySelector('#bmCardPeekTitleV050')?.textContent?.match(/(?:CARD-\d{4,5}|PROP-IJUI-[\w-]+)/)?.[0];
   if(found)open(found,launch);
  },'bm122-ink-peek-btn');
  peek.append(launch);
 }
 window.BancoMestreCardInkV122=Object.freeze({openId:id=>open(id),close:hide,get active(){return !overlay.hidden}});
})();
