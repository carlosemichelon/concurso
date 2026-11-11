/* V089 — legacy native PDF.js selection disabled only while precise word selector is ready. */
/* V087 — seleção comum: cor + assunto escolhidos pelo usuário. Sem classificação automática. */
/* V082 — compatibilidade com quebras de linha PDF.js, conservadorismo nas falhas. */
/* V081 — prévia multicolorida por cláusulas e gravação conjunta após confirmação. */
/* V080 — modo manual pede escolha de cor; histórico de grifos inalterado. */
/* V075 — seis cores fixas e laranja para conteúdo importante; grifos antigos intactos. */
/* V074 — um grifo por seleção, cor automática conservadora e escolha manual prioritária. */
/* V073: seleção conectada ao ciclo do PDF; seis cores de estudo, sem recolorir os grifos previamente salvos. */
/* V070: grifador rápido com classificação por palavra/trecho e sugestão de nota. */
/* V069: seleção e menu de grifos estabilizados. */
/* Banco Mestre V068 — grifador completo inspirado no fluxo funcional da Bússola Highlights. */
(function BancoMestreGrifadorV068(){
'use strict';
const $=id=>document.getElementById(id);
const dlg=$('pdfDialog'),wrap=$('pdfPageWrap'),pageCanvas=$('pdfLocalCanvas'),tools=$('pdfLocalTools'),marker=$('pdfMarker');
const api=()=>window.BancoMestrePDFV042;
if(!dlg||!wrap||!pageCanvas||!marker||!tools||$('bm068SelectTool'))return;
const names=Object.freeze([
 {kind:'proibicao',color:'#FF8F96',label:'Proibições e vedações'},
 {kind:'obrigacao',color:'#86DCAA',label:'Obrigações e deveres'},
 {kind:'prazo_numero',color:'#FFEA70',label:'Prazos e números'},
 {kind:'excecao',color:'#89C7FF',label:'Exceções e ressalvas'},
 {kind:'banca',color:'#CCA7FF',label:'Palavras-chave da banca'},
 {kind:'destaque',color:'#FFB86B',label:'Conteúdo importante a destacar'}
].map(Object.freeze));
const KEY_COLOR='BM_PDF_TEXT_COLOR_V061',KEY_QUICK='BM068_GRIFO_RAPIDO',KEY_HOTKEYS='BM068_HOTKEYS',KEY_SMART='BM070_CLASSIFICACAO_RAPIDA',META='BM062_GRIFOS_META';
const allowed=['highlight','underline','double-underline','strike','conceal'];
let activeLayer=null,serial=0,context=null,activeId=null,reselection=null,popupEnabled=true,lastAt={x:240,y:120};
let mutationVersion=0,pendingUndo=null;
window.addEventListener('bm-pdf-mark-changed',()=>{mutationVersion++});
let quick=false,smart=false,lastColor='#FFB86B',lastStyle='highlight',toastTimer=0,keys={quick:'Alt+Q',panel:'Alt+W'};
try{quick=localStorage.getItem(KEY_QUICK)!=='0';smart=localStorage.getItem(KEY_SMART)!=='0';lastColor=localStorage.getItem(KEY_COLOR)||lastColor;
 const from=JSON.parse(localStorage.getItem(KEY_HOTKEYS)||'null');
 if(from?.quick&&from?.panel)keys=from;
}catch{}
quick=false;smart=false; // Preferências antigas preservadas, mas inativas.
 const goodColor=x=>/^#[0-9a-f]{6}$/i.test(x||'');
if(!goodColor(lastColor)||!names.some(x=>x.color.toLowerCase()===lastColor.toLowerCase()))
 lastColor='#FFB86B';
// Os valores antigos em localStorage continuam intactos, porém não alteram as seis categorias.
const selectBtn=document.createElement('button');selectBtn.id='bm068SelectTool';selectBtn.type='button';
selectBtn.textContent='Selecionar texto';selectBtn.title='Selecione o texto e depois escolha a cor e o assunto';
selectBtn.setAttribute('aria-pressed','false');marker.parentNode.insertBefore(selectBtn,marker);
selectBtn.onclick=()=>api()?.selectTextMode?.();
const topBar=document.createElement('div');topBar.id='bm068QuickBar';topBar.className='bm068-reader-shortcuts';
topBar.innerHTML='<div class="bm068-brand"><span class="bm068-symbol">◈</span><strong>Grifador</strong><small>texto + notas</small></div>'+
 '<div class="bm068-reader-actions"><button type="button" id="bm068QuickToggle">Rápido</button>'+
 '<button type="button" id="bm068OpenPanel">☰ Meus grifos</button>'+
 '<button type="button" id="bm068Settings">⚙ Atalhos</button>'+
 '<button type="button" id="bm070Smart" aria-pressed="true" title="Reconhecer várias cores dentro do parágrafo, por trecho completo">◈ Cores por trecho</button></div>'+
 '<small id="bm068ModeHint" role="status">Arraste para selecionar palavras</small>';
tools.prepend(topBar);
const popup=document.createElement('div');popup.id='bm068Palette';popup.hidden=true;
popup.setAttribute('role','group');popup.setAttribute('aria-label','Ferramentas do trecho selecionado');
popup.innerHTML='<div class="bm068-floating-head"><span id="bm068CurrentText">Grifo</span><button id="bm068FloatClose" type="button" title="Fechar menu" aria-label="Fechar menu">×</button></div>'+
 '<div id="bm068Colors" class="bm068-colors" aria-label="Cores de grifo"></div>'+
 '<div class="bm068-commands"><button id="bm068Apply" type="button" hidden>Grifar selecionado</button>'+
 '<button id="bm070ApplyAuto" type="button" hidden>◈ Aplicar cores sugeridas</button>'+
 '<button id="bm068Underline" type="button" title="Sublinhar trecho">U̲</button>'+
 '<button id="bm068DoubleUnderline" type="button" title="Sublinhar duas vezes">U̳</button>'+
 '<button id="bm068Strike" type="button" title="Tachar trecho">S̶</button>'+
 '<button id="bm068Hide" type="button" title="Ocultar texto na leitura">⋯ Ocultar</button>'+
 '<button id="bm068Note" type="button">✎ Nota</button>'+
 '<button id="bm068Cards" type="button">▣ Cartão</button>'+
 '<button id="bm068Copy" type="button">⧉ Copiar</button>'+
 '<button id="bm068Resize" type="button">↔ Trecho</button>'+
 '<button id="bm068Delete" type="button">⌫ Excluir</button></div>';
dlg.append(popup);
const subjectPanel=document.createElement('section');subjectPanel.id='bm086SubjectPanel';subjectPanel.hidden=true;
subjectPanel.innerHTML='<p class="bm086Step">1. Cor → 2. Assunto → 3. Salvar</p>'+
 '<div class="bm086Fields"><label>Disciplina (opcional)<input id="bm086Discipline" maxlength="120" placeholder="Ex.: Direito Constitucional"></label>'+
 '<label>Assunto *<input id="bm086Topic" maxlength="140" required list="bm086TopicList" placeholder="Ex.: Fundamentos da República"></label>'+
 '<label>Subassunto (opcional)<input id="bm086Subtopic" maxlength="140" placeholder="Ex.: Soberania popular"></label></div>'+
 '<datalist id="bm086TopicList"></datalist>';
popup.querySelector('.bm068-commands').before(subjectPanel);
const disciplineInput=$('bm086Discipline'),topicInput=$('bm086Topic'),subtopicInput=$('bm086Subtopic');
let chosenColor=null;
function manualValues(){return {discipline:disciplineInput.value.trim().slice(0,120),
 topic:topicInput.value.trim().slice(0,140),subtopic:subtopicInput.value.trim().slice(0,140),basis:'escolha_manual'}}
function pressColor(){for(const b of $('bm068Colors').querySelectorAll('button[data-color]'))
 b.setAttribute('aria-pressed',String(chosenColor?.color===b.dataset.color))}
function topicOptions(){
 const list=$('bm086TopicList');list.replaceChildren();
 const topics=Object.values(readMeta()).map(x=>String(x?.topic||'').trim()).filter(Boolean);
 for(const mark of api()?.currentMarks||[])if(mark.subject_suggestion?.topic)topics.push(mark.subject_suggestion.topic);
 for(const value of [...new Set(topics)].slice(0,70)){
  const option=document.createElement('option');option.value=value;list.append(option)
 }
}
const selectionOverlay=document.createElement('div');selectionOverlay.id='bm086SelectionOverlay';
selectionOverlay.hidden=true;selectionOverlay.setAttribute('aria-hidden','true');wrap.append(selectionOverlay);
function clearSelectionOverlay(){selectionOverlay.hidden=true;selectionOverlay.replaceChildren()}
function drawSelectionOverlay(rectangles){
 clearSelectionOverlay();if(!Array.isArray(rectangles))return;
 for(const r of rectangles.slice(0,250)){
  if(!Array.isArray(r)||r.length!==4||r.some(x=>!Number.isFinite(x)))continue;
  const box=document.createElement('span');box.className='bm086SelectedRect';
  box.style.left=(r[0]*100)+'%';box.style.top=(r[1]*100)+'%';
  box.style.width=(Math.max(0,r[2]-r[0])*100)+'%';
  box.style.height=(Math.max(0,r[3]-r[1])*100)+'%';selectionOverlay.append(box);
 }
 selectionOverlay.hidden=!selectionOverlay.childElementCount;
}
const advice=document.createElement('p');advice.id='bm074ColorAdvice';advice.hidden=true;
advice.setAttribute('role','status');advice.setAttribute('aria-live','polite');
popup.querySelector('.bm068-commands').before(advice);
const multiPreview=document.createElement('div');multiPreview.id='bm081Preview';multiPreview.hidden=true;
multiPreview.setAttribute('role','status');multiPreview.setAttribute('aria-live','polite');
advice.after(multiPreview);
const multiApply=document.createElement('button');
multiApply.id='bm081ApplyMulti';multiApply.type='button';multiApply.hidden=true;
multiApply.textContent='Aplicar cores identificadas';
popup.querySelector('.bm068-commands').prepend(multiApply);
const editor=document.createElement('section');editor.id='bm068Editor';editor.hidden=true;
editor.setAttribute('role','dialog');editor.setAttribute('aria-modal','true');editor.setAttribute('aria-label','Anotações do trecho selecionado');
editor.innerHTML='<div class="bm068-editor-card"><header><div><strong>✎ Notas do grifo</strong><small id="bm068NoteExcerpt"></small></div>'+
 '<button type="button" id="bm068EditorClose" aria-label="Fechar editor de notas">×</button></header>'+
 '<form id="bm068Form"><p id="bm070Suggestion" class="bm070-suggestion" hidden></p><div class="bm068-form-grid">'+
 '<label class="bm068-wide">Nota rápida<textarea name="note" rows="2" maxlength="12000"></textarea></label>'+
 '<label>Disciplina<input name="discipline" maxlength="120"></label>'+
 '<label>Assunto<input name="topic" maxlength="140"></label>'+
 '<label>Subassunto<input name="subtopic" maxlength="140"></label>'+
 '<label>Tags (vírgulas)<input name="tags" maxlength="600"></label>'+
 '<label>IDs de flashcards existentes<input name="cards" placeholder="CARD-0028, CARD-0078"></label>'+
 '<label class="bm068-wide">Explicação<textarea name="explicacao" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Dúvida<textarea name="duvida" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Correção<textarea name="correcao" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Macete<textarea name="macete" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Pegadinha de prova<textarea name="pegadinha" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Fundamento normativo<textarea name="fundamento" rows="2"></textarea></label>'+
 '<label class="bm068-wide">Fonte complementar<textarea name="fonte" rows="2"></textarea></label>'+
 '</div><div class="bm068-editor-footer"><label><input type="checkbox" name="favorite"> ★ Favorito</label>'+
 '<button type="button" id="bm068Cancel">Cancelar</button><button type="submit" class="bm068-primary">Salvar nota</button></div></form></div>';
dlg.append(editor);
const settings=document.createElement('section');settings.id='bm068SettingsBox';settings.hidden=true;settings.setAttribute('role','dialog');
settings.innerHTML='<div class="bm068-settings-card"><strong>⚙ Atalhos de teclado</strong><p>Configure atalhos sem conflito com o navegador. Use Alt+letra ou Alt+Shift+letra.</p>'+
 '<label>Marcador rápido<input id="bm068KeyQuick" type="text" maxlength="18" value="Alt+Q"></label>'+
 '<label>Painel de grifos<input id="bm068KeyPanel" type="text" maxlength="18" value="Alt+W"></label>'+
 '<p class="bm075-fixed-colors">As seis categorias de cores são fixas na metodologia.</p><p id="bm068SettingsMessage" role="status"></p><div class="bm068-settings-actions"><button type="button" id="bm068SettingsCancel">Cancelar</button><button type="button" id="bm068SettingsSave">Salvar</button></div></div>';
dlg.append(settings);
const toast=document.createElement('div');toast.id='bm068Toast';toast.hidden=true;
toast.innerHTML='<span id="bm068ToastMessage"></span><button id="bm068ToastUndo" type="button" hidden>Desfazer</button>';
dlg.append(toast);
function status(msg,withUndo=false){
 toast.hidden=false;$('bm068ToastMessage').textContent=msg;$('bm068ToastUndo').hidden=!withUndo;
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,withUndo?8500:4000);
}
$('bm068ToastUndo').onclick=()=>{
 const u=pendingUndo;
 pendingUndo=null;toast.hidden=true;
 const a=api();
 if(!u||!a?.editing||a.currentId!==u.docId||a.sourceHash!==u.hash||a.currentPage!==u.page||
   mutationVersion!==u.version||a.currentMarks?.some(m=>m.id===u.id)||!a.canUndo){
  status('Não é seguro desfazer: outra edição ou mudança de página ocorreu.');return;
 }
 a.undoLast();closeMenu();
 status('Última exclusão desfeita.');
};
function safeRead(k){try{return localStorage.getItem(k)}catch{return null}}
function safeWrite(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}
function colorName(color){return names.find(x=>x.color.toLowerCase()===String(color).toLowerCase())?.label||'Personalizado'}
function current(){return api()?.currentMarks?.find(m=>m?.type==='text_highlight'&&m.id===activeId)||null}
function inSelect(){return !!(api()?.editing&&api()?.currentTool==='select'&&dlg.open)}
function closeMenu(){popup.hidden=true;activeId=null;clearSelectionOverlay()}
function closeEditor(){editor.hidden=true}
function updateMode(){
 const active=inSelect();dlg.classList.toggle('bm-v061-text-mode',active);dlg.classList.toggle('bm068-selecting',active);
 selectBtn.setAttribute('aria-pressed',String(active));
 quick=false;smart=false;
 $('bm068QuickToggle').disabled=true;$('bm070Smart').disabled=true;
 $('bm068QuickToggle').setAttribute('aria-pressed','false');$('bm070Smart').setAttribute('aria-pressed','false');
 $('bm068QuickToggle').textContent='Rápido desativado';$('bm070Smart').textContent='Automático desativado';
 $('bm068ModeHint').textContent=!active?'Ative Selecionar texto':
 reselection?'Selecione novamente para ajustar o grifo existente':
 'Arraste sobre as palavras no PDF. Depois escolha a cor e o assunto.';
 if(!active)closeMenu();
}

window.addEventListener('bm-pdf-tool-change',updateMode);
$('bm068QuickToggle').onclick=()=>status('Grifo rápido desativado.');
$('bm070Smart').onclick=()=>status('Classificação automática desativada.');

$('bm068OpenPanel').onclick=()=>{const panel=$('bm064TogglePanel');if(panel)panel.click();else status('O painel de grifos ainda não carregou')};
$('bm068Settings').onclick=()=>{$('bm068KeyQuick').value=keys.quick;$('bm068KeyPanel').value=keys.panel;settings.hidden=false;$('bm068KeyQuick').focus()};
$('bm068SettingsCancel').onclick=()=>settings.hidden=true;
function validKey(s){return /^Alt\+(?:Shift\+)?[A-Z]$/.test(s)&&!['Alt+F','Alt+E','Alt+D','Alt+H','Alt+L','Alt+S','Alt+P','Alt+Shift+F'].includes(s)}
$('bm068SettingsSave').onclick=()=>{
 const a=$('bm068KeyQuick').value.trim().toUpperCase().replace('ALT+SHIFT+','Alt+Shift+').replace('ALT+','Alt+');
 const b=$('bm068KeyPanel').value.trim().toUpperCase().replace('ALT+SHIFT+','Alt+Shift+').replace('ALT+','Alt+');
 if(!validKey(a)||!validKey(b)||a===b){$('bm068SettingsMessage').textContent='Escolha dois atalhos diferentes, no formato Alt+Q ou Alt+Shift+Q, sem conflitos comuns do navegador.';return}
 keys={quick:a,panel:b};safeWrite(KEY_HOTKEYS,JSON.stringify(keys));settings.hidden=true;status('Atalhos personalizados salvos neste navegador');
};
function findOnPage(x,y){
 const marks=api()?.currentMarks||[],pt=wrap.getBoundingClientRect();
 if(!pt.width||!pt.height)return null;
 const px=(x-pt.left)/pt.width,py=(y-pt.top)/pt.height;
 return marks.slice().reverse().find(m=>m.type==='text_highlight'&&Array.isArray(m.rects)&&m.rects.some(b=>Array.isArray(b)&&b.length===4&&px>=b[0]-.003&&px<=b[2]+.003&&py>=b[1]-.005&&py<=b[3]+.005));
}
function popupAt(x,y){
 popup.hidden=false;const bounds=dlg.getBoundingClientRect();
 const width=popup.offsetWidth||356,height=popup.offsetHeight||170;
 popup.style.left=Math.round(Math.max(8,Math.min(bounds.width-width-8,x-bounds.left-30)))+'px';
 popup.style.top=Math.round(Math.max(49,Math.min(bounds.height-height-8,y-bounds.top+9)))+'px';
}
function show(mark,x,y,isPending=false){
 activeId=mark?.id||null;lastAt={x,y};
 $('bm068CurrentText').textContent=mark?.text?.slice(0,135)||'Seleção de texto';
 pendingMulti=null;multiApply.hidden=true;multiApply.disabled=true;
 multiPreview.hidden=true;multiPreview.replaceChildren();
 $('bm070ApplyAuto').hidden=true;$('bm070ApplyAuto').disabled=true;
 subjectPanel.hidden=!(isPending||mark?.id);
 $('bm068Apply').hidden=!(isPending||mark?.id);
 $('bm068Apply').textContent=isPending?'Salvar grifo':'Salvar cor e assunto';
 const saved=mark?.subject_suggestion||{},meta=mark?.id?(readMeta()[identity(mark)]||{}):{};
 if(isPending){
  chosenColor=null;disciplineInput.value='';topicInput.value='';subtopicInput.value='';
  drawSelectionOverlay(pending?.rects);
 }else{
  chosenColor=names.find(c=>c.color.toLowerCase()===String(mark?.color||'').toLowerCase())||null;
  disciplineInput.value=meta.discipline||saved.discipline||'';
  topicInput.value=meta.topic||saved.topic||'';
  subtopicInput.value=meta.subtopic||saved.subtopic||'';
  clearSelectionOverlay();
 }
 topicOptions();$('bm068Apply').disabled=false;
 advice.hidden=!isPending;
 advice.textContent=isPending?'Seleção capturada. Escolha a cor, preencha o assunto e salve.':'';
 $('bm068Resize').disabled=!mark?.id;$('bm068Delete').disabled=!mark?.id;
 $('bm068Hide').textContent=mark?.style==='conceal'?'◉ Mostrar':'⋯ Ocultar';
 $('bm068Cards').disabled=!mark?.id;$('bm068Note').disabled=!mark?.id;
 for(const id of ['bm068Underline','bm068DoubleUnderline','bm068Strike','bm068Hide'])$(id).disabled=!mark?.id;
 pressColor();popupAt(x,y);
}

for(const item of names){
 const b=document.createElement('button');b.type='button';b.className='bm068-swatch';
 b.dataset.color=item.color;b.style.setProperty('--swatch',item.color);
 b.setAttribute('aria-label',item.label+' ('+item.color+')');b.title=item.label;
 b.innerHTML='<span aria-hidden="true">✓</span>';
 b.addEventListener('click',()=>{
  chosenColor=item;lastColor=item.color;lastStyle='highlight';safeWrite(KEY_COLOR,lastColor);pressColor();
  status('Cor escolhida: '+item.label+'. Informe o assunto e clique em Salvar grifo.');
 });
 $('bm068Colors').append(b);
}

const legend=document.createElement('p');legend.id='bm071Legend';legend.className='bm071-color-legend';
legend.textContent='🔴 Proibições  •  🟢 Obrigações  •  🟡 Prazos e números  •  🔵 Exceções  •  🟣 Palavras-chave da banca  •  🟠 Conteúdo importante';
$('bm068Colors').after(legend);
function applyStyle(style){
 if(!allowed.includes(style))return;
 if(!activeId){status('Salve primeiro o grifo com cor e assunto.');return}
 if(api()?.updateTextHighlight(activeId,{style})){lastStyle=style;status('Estilo atualizado')}
}

$('bm068Underline').onclick=()=>applyStyle('underline');
$('bm068DoubleUnderline').onclick=()=>applyStyle('double-underline');
$('bm068Strike').onclick=()=>applyStyle('strike');
$('bm068Hide').onclick=()=>applyStyle(current()?.style==='conceal'?'highlight':'conceal');
$('bm068FloatClose').onclick=()=>{pending=null;pendingAnalysis=null;pendingMulti=null;closeMenu()};
let pending=null,pendingAnalysis=null,pendingMulti=null;
function computeSelectionAnalysis(){
 return window.BancoMestreAnaliseSelecaoV075?.analyze(pending?.words||[],pending?.text||'')||{
  status:'indefinida',kind:null,reason:'Classificador indisponível. Escolha uma cor manualmente.',
  candidates:[],confidence:'indefinida'
 };
}
function confirmOrSuggest(){
 if(!pending)return;
 pendingAnalysis=null;pendingMulti=null;
 show({text:pending.text},lastAt.x,lastAt.y,true);
 status('Escolha a cor, informe o assunto e clique em Salvar grifo. Nenhuma cor foi aplicada automaticamente.');
}

function sameHighlight(mark,selection){
 return mark?.type==='text_highlight'&&mark.text===selection.text&&
 Array.isArray(mark.rects)&&mark.rects.length===selection.rects.length&&
 mark.rects.every((r,i)=>Array.isArray(r)&&r.length===4&&
  r.every((value,j)=>Number.isFinite(value)&&Math.abs(value-selection.rects[i][j])<.001));
}
function saveManualSelection(){
 const selection=pending,opened=current(),chosen=chosenColor,subject=manualValues();
 if(!selection&&!opened){status('Selecione um texto ou abra um grifo salvo.');return}
 if(selection&&!matches(selection.context)){status('Seleção expirada após troca de página. Selecione novamente.');return}
 if(!chosen){status('Escolha uma das seis cores.');return}
 if(!subject.topic){status('Informe o assunto antes de salvar.');topicInput.focus();return}
 const patch={color:chosen.color,color_label:chosen.label,
  classification_kind:chosen.kind,classification_status:'confirmada',subject_suggestion:subject};
 let saved=null,wasExisting=false;
 if(selection){
  const existing=api()?.currentMarks?.find(mark=>sameHighlight(mark,selection));
  if(existing){
   if(!api()?.updateTextHighlight?.(existing.id,patch)){status('Falha ao atualizar o grifo existente.');return}
   saved=api()?.currentMarks?.find(mark=>mark.id===existing.id);wasExisting=true;
  }else{
   const record={
    text:selection.text,rects:selection.rects,anchor:selection.anchor,
    page:selection.page,documentId:selection.documentId,sourceHash:selection.sourceHash,
    ...patch,style:'highlight',confidence:'indefinida',detail:'escolha_manual',
    segment_index:null,segment_total:1,note_suggestion:''
   };
   saved=api()?.addTextHighlight?.(record);
   if(saved?.duplicate)wasExisting=true;
  }
 }else{
  if(!api()?.updateTextHighlight?.(opened.id,patch)){status('Falha ao atualizar a classificação.');return}
  saved=api()?.currentMarks?.find(mark=>mark.id===opened.id);wasExisting=true;
 }
 if(!saved){status('Falha ao salvar. Os grifos anteriores foram preservados.');return}
 const metadata=readMeta(),id=identity(saved);
 metadata[id]={...(metadata[id]||{}),discipline:subject.discipline,
  topic:subject.topic,subtopic:subject.subtopic};
 const synced=safeWrite(META,JSON.stringify(metadata));
 pending=null;pendingAnalysis=null;pendingMulti=null;clearSelectionOverlay();
 show(saved,lastAt.x,lastAt.y,false);
 status((wasExisting?'Grifo atualizado.':'Grifo salvo.')+' Assunto: '+subject.topic+
  (synced?'':' — o grifo foi salvo, mas o índice da biblioteca não pôde ser atualizado.'));
 window.BancoMestreGrifosV062?.reload?.();
 window.BancoMestreV064PainelGrifos?.refresh?.();
}

function commitMulticolor(){
 status('Grifo automático desabilitado. Escolha a cor e o assunto manualmente.');
}

multiApply.addEventListener('click',commitMulticolor);

$('bm068Apply').onclick=saveManualSelection;
$('bm070ApplyAuto').onclick=()=>status('Classificação automática desabilitada.');
$('bm068Note').onclick=()=>{
 const mark=current();if(!mark){status('Selecione um grifo já salvo.');return}
 closeEditor();const form=$('bm068Form'),extra=mark.note_structured||{};
 const meta=readMeta(),d=meta[identity(mark)]||{},suggested=mark.subject_suggestion||{};
 const hint=$('bm070Suggestion');
 const needsColor=mark.classification_status!=='confirmada',
  needsSubject=!!suggested.topic&&!d.topic,
  needsNote=!!mark.note_suggestion&&!mark.note;
 hint.hidden=!(needsColor||needsSubject||needsNote);
 hint.textContent=hint.hidden?'':('REVISÃO NECESSÁRIA · '+
  [needsColor?'Cor sugerida':null,needsSubject?'Assunto sugerido':null,
   needsNote?'Nota pré-preenchida, ainda não confirmada':null].filter(Boolean).join(' • ')+
  '. Confira a fonte e clique em Salvar nota para aceitar suas alterações.');
 const read=(name,value)=>{form.elements[name].value=value||''};
 read('note',mark.note||mark.note_suggestion||'');
 read('discipline',d.discipline||suggested.discipline);
 read('topic',d.topic||suggested.topic);
 read('subtopic',d.subtopic||suggested.subtopic);
 read('tags',(mark.tags||[]).join(', ')||d.tags);
 read('cards',(mark.card_ids||[]).join(', '));
 for(const name of ['explicacao','duvida','correcao','macete','pegadinha','fundamento','fonte'])read(name,extra[name]);
 form.elements.favorite.checked=mark.favorite||!!d.favorite;
 $('bm068NoteExcerpt').textContent=mark.text.slice(0,155);
 editor.hidden=false;form.elements.note.focus();popup.hidden=true;
};
$('bm068EditorClose').onclick=closeEditor;$('bm068Cancel').onclick=closeEditor;
function identity(mark){return 'TXT:'+api().currentId+':'+api().sourceHash+':'+mark.id}
function readMeta(){try{const obj=JSON.parse(localStorage.getItem(META)||'{}');return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{}}catch{return{}}}
$('bm068Form').onsubmit=e=>{
 e.preventDefault();
 const mark=current();if(!mark){status('O grifo foi alterado. Abra-o novamente.');return}
 const form=e.currentTarget,fields=form.elements;
 const raw=fields.cards.value.trim().toUpperCase().split(/[,;\s]+/).filter(Boolean);
 if(raw.some(id=>!/^(CARD-\d{4,}|PROP-IJUI-\d+)$/.test(id))){status('Confira os IDs de flashcards: CARD-0028, CARD-0078.');return}
 const structured={};
 for(const k of ['explicacao','duvida','correcao','macete','pegadinha','fundamento','fonte'])structured[k]=fields[k].value;
 const tags=fields.tags.value.split(',').map(x=>x.trim()).filter(Boolean);
 const patch={note:fields.note.value,note_structured:structured,tags,favorite:fields.favorite.checked,card_ids:raw,classification_status:'confirmada'};
 if(!api()?.updateTextHighlight(activeId,patch)){status('Falha ao gravar a nota. Seus dados anteriores foram mantidos.');return}
 const meta=readMeta(),id=identity(mark);
 meta[id]={...(meta[id]||{}),discipline:fields.discipline.value.trim().slice(0,120),
  topic:fields.topic.value.trim().slice(0,140),subtopic:fields.subtopic.value.trim().slice(0,140),
  tags:fields.tags.value.trim().slice(0,600),
  favorite:fields.favorite.checked};
 const ok=safeWrite(META,JSON.stringify(meta));
 editor.hidden=true;status(ok?'Nota estruturada salva; grifo atualizado':'Grifo salvo, mas a classificação da biblioteca não pôde ser atualizada');
 window.BancoMestreGrifosV062?.reload?.();window.BancoMestreV064PainelGrifos?.refresh?.();
};
$('bm068Cards').onclick=()=>$('bm068Note').click();
$('bm068Copy').onclick=async()=>{
 const text=current()?.text||pending?.text;
 if(!text)return;
 try{await navigator.clipboard.writeText(text);status('Trecho copiado')}catch{status('Não foi possível copiar o trecho')}
};
$('bm068Resize').onclick=()=>{
 if(!current())return;
 reselection={id:activeId,page:api().currentPage,documentId:api().currentId,hash:api().sourceHash};
 closeMenu();status('Selecione novamente o trecho completo no PDF para atualizar o mesmo grifo');updateMode();
};
$('bm068Delete').onclick=()=>{
 const id=activeId;if(!id)return;
 if(api()?.removeTextHighlight(id)){
   const a=api();
   pendingUndo={id,version:mutationVersion,docId:a.currentId,hash:a.sourceHash,page:a.currentPage};
   closeMenu();status('Grifo excluído. Use Desfazer para recuperar.',true);
  }
 else status('Falha ao excluir; grifo preservado');
};
function matches(c){return !!(c&&api()?.editing&&api().currentId===c.documentId&&api().currentPage===c.page&&api().sourceHash===c.sourceHash)}
function makeLayer(){
 const layer=document.createElement('div');layer.className='textLayer bm-v061-text-layer';
 layer.setAttribute('aria-label','Texto selecionável do PDF');
 return layer;
}
// Invalida a seleção anterior assim que a página/zoom começa a mudar.
function clearTextLayer(reason){
 serial++;
 const selection=window.getSelection();
 if(activeLayer&&selection&&!selection.isCollapsed&&
    (activeLayer.contains(selection.anchorNode)||activeLayer.contains(selection.focusNode))){
  selection.removeAllRanges();
 }
 if(activeLayer){activeLayer.remove();activeLayer=null}
 context=null;pending=null;pendingAnalysis=null;pendingMulti=null;reselection=null;closeMenu();
 dlg.classList.remove('bm-v061-text-mode','bm068-selecting');
 if(reason)$('bm068ModeHint').textContent=reason;
}
window.addEventListener('bm-pdf-render-start',()=>{
 clearTextLayer('Atualizando a página; a seleção ficará disponível após o carregamento.');
});
window.addEventListener('bm-pdf-active-page-rendered',async event=>{
 const c=event.detail,ticket=++serial;
 // New coordinate-based selector owns text selection. Keep old annotation/editor functions.
 if(window.BancoMestrePreciseSelectV089?.ready){
  if(activeLayer){activeLayer.remove();activeLayer=null}
  context=null;pending=null;pendingAnalysis=null;pendingMulti=null;closeMenu();updateMode();return;
 }
 if(activeLayer){activeLayer.remove();activeLayer=null}
 context=null;pending=null;pendingAnalysis=null;pendingMulti=null;closeMenu();
 if(!matches(c))return;
 const layer=makeLayer();
 let attached=false;
 try{
  const page=await api().getCurrentPdfPage();
  if(ticket!==serial||!matches(c)||!page)return;
  const content=await page.getTextContent();
  if(ticket!==serial||!matches(c))return;
  if(!content.items?.some(item=>String(item.str||'').trim())){
   $('bm068ModeHint').textContent='PDF sem texto selecionável; use grifo livre ou OCR em etapa futura';return;
  }
  const viewport=page.getViewport({scale:c.viewportScale});
  layer.style.width=pageCanvas.style.width;layer.style.height=pageCanvas.style.height;
  layer.style.setProperty('--scale-factor',String(c.viewportScale));
  if(!window.pdfjsLib?.renderTextLayer)throw Error('Camada de texto PDF.js indisponível');
  // O PDF.js precisa medir a camada já anexada ao documento real.
  layer.style.setProperty('pointer-events','none','important');wrap.append(layer);attached=true;
  const task=window.pdfjsLib.renderTextLayer({textContentSource:content,container:layer,viewport,textDivs:[]});
  await task.promise;
  if(ticket!==serial||!matches(c))return;
  layer.style.removeProperty('pointer-events');
  activeLayer=layer;context=c;updateMode();
 }catch(err){
  if(ticket===serial){
   $('bm068ModeHint').textContent='Falha ao montar o texto selecionável; grifo livre disponível.';
   console.warn('V073 camada de seleção',err);
  }
 }finally{
  // Camadas obsoletas nunca interceptam cliques/seleções após zoom ou troca de página.
  if(attached&&(ticket!==serial||activeLayer!==layer))layer.remove();
 }
});
const clamp=x=>Math.max(0,Math.min(1,x));
const inLayer=x=>!!(activeLayer&&x&&activeLayer.contains(x.nodeType===3?x.parentNode:x));
function rects(range){
 const area=wrap.getBoundingClientRect(),out=[];
 if(area.width<1||area.height<1)return [];
 for(const r of range.getClientRects()){
  const left=clamp((Math.max(area.left,r.left)-area.left)/area.width);
  const top=clamp((Math.max(area.top,r.top)-area.top)/area.height);
  const right=clamp((Math.min(area.right,r.right)-area.left)/area.width);
  const bottom=clamp((Math.min(area.bottom,r.bottom)-area.top)/area.height);
  if(right-left>.0007&&bottom-top>.001)out.push([left,top,right,bottom]);
 }
 out.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
 const joined=[];
 for(const b of out){
  const p=joined[joined.length-1];
  if(p&&Math.abs(p[1]-b[1])<.003&&Math.abs(p[3]-b[3])<.004&&b[0]<=p[2]+.003){p[2]=Math.max(p[2],b[2]);p[3]=Math.max(p[3],b[3])}
  else joined.push(b.slice());
 }
 return joined.slice(0,250);
}

function wordsFromRange(range){
 const words=[],walker=document.createTreeWalker(activeLayer,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(!range.intersectsNode(node))continue;
  const content=node.textContent||'';
  const from=node===range.startContainer?range.startOffset:0;
  const to=node===range.endContainer?range.endOffset:content.length;
  if(to<=from||from<0||to>content.length)continue;
  const selection=content.slice(from,to),regex=/\S+/gu;
  let match;
  while((match=regex.exec(selection))){
   const first=from+match.index,last=first+match[0].length,part=document.createRange();
   part.setStart(node,first);part.setEnd(node,last);
   const box=rects(part);
   if(!box.length)continue;
   words.push({text:match[0],rects:box,
    prefix:content.slice(Math.max(0,first-60),first),
    suffix:content.slice(last,last+60)});
   if(words.length>180)return [];
  }
 }
 return words;
}
// Captura palavras inteiras usando offsets do próprio Range, inclusive em vários spans.
// Se o mapeamento DOM/PDF não for exato, devolve null e impede aplicação multicolorida.
// V082: alinhar Range do PDF.js ao texto selecionado, inclusive quebras <br>.
// Selection.toString() pode conter \n que Range.toString() não representa.
// Em caso de incompatibilidade, não criar grifos automáticos.
function wordsWithGeometry(range,selectedText){
 if(!activeLayer||!range)return null;
 const text=String(selectedText||'').replace(/\u00a0/g,' ').trim();
 if(!text||text.length>20000)return null;
 const walker=document.createTreeWalker(activeLayer,NodeFilter.SHOW_TEXT),parts=[];
 let node;
 while((node=walker.nextNode())){
  if(!range.intersectsNode(node))continue;
  const val=node.textContent||'',from=node===range.startContainer?range.startOffset:0,
   to=node===range.endContainer?range.endOffset:val.length;
  if(from<0||to>val.length||to<=from)continue;
  parts.push({node,from,to,raw:val.slice(from,to)});
 }
 if(!parts.length)return null;
 // Cada caractere visível corresponde a uma posição DOM real.
 const mapping=Array(text.length).fill(null);let cursor=0,matched=0;
 for(const part of parts){
  for(let i=0;i<part.raw.length;i++){
   const ch=part.raw[i]==='\u00a0'?' ':part.raw[i];
   // Ignorar apenas espaços iniciais retirados pelo trim() da seleção.
   if(cursor===0&&/\s/u.test(ch)&&!/\s/u.test(text[0]))continue;
   // Quebra virtual que Selection.toString() insere para <br> do PDF.js.
   while(cursor<text.length&&/\s/u.test(text[cursor])&&!/\s/u.test(ch))cursor++;
   if(cursor>=text.length)return null;
   const equal=ch===text[cursor]||(/\s/u.test(ch)&&/\s/u.test(text[cursor]));
   if(!equal)return null;
   mapping[cursor]={node:part.node,start:part.from+i,end:part.from+i+1};
   cursor++;matched++;
  }
 }
 if(text.slice(cursor).trim()||!matched)return null;
 const first=parts[0],last=parts.at(-1);
 if(first.from>0&&/[\p{L}\p{N}]/u.test(first.node.textContent[first.from-1]||'')&&
    /^[\p{L}\p{N}]/u.test(text))return null;
 if(last.to<(last.node.textContent||'').length&&
    /[\p{L}\p{N}]/u.test(last.node.textContent[last.to]||'')&&
    /[\p{L}\p{N}]$/u.test(text))return null;
 const words=[];
 for(const match of text.matchAll(/\S+/gu)){
  const start=match.index,end=start+match[0].length;
  const from=mapping[start],to=mapping[end-1];
  if(!from||!to)return null;
  const part=document.createRange();part.setStart(from.node,from.start);part.setEnd(to.node,to.end);
  const boxes=rects(part);if(!boxes.length)return null;
  words.push({text:match[0],start,end,rects:boxes});
  if(words.length>180)return null;
 }
 return words.length?words:null;
}
function readSelection(){
 if(window.BancoMestrePreciseSelectV089?.ready)return;
 if(!inSelect()||!activeLayer||!matches(context))return;
 const selection=window.getSelection();
 if(!selection||selection.isCollapsed||selection.rangeCount!==1||!inLayer(selection.anchorNode)||!inLayer(selection.focusNode))return;
 const range=selection.getRangeAt(0),text=String(selection.toString()||'').replace(/\u00a0/g,' ').trim();
 if(!text||text.length>20000)return;
 const boxes=rects(range);if(!boxes.length)return;
 const words=wordsFromRange(range),positionedWords=wordsWithGeometry(range,text);
 const end=range.getBoundingClientRect(),at={x:end.right,y:end.bottom};
 // Usar os limites normalizados do Range (inclusive seleções reversas).
 const anchor={prefix:range.startContainer?.textContent?.slice(Math.max(0,range.startOffset-60),range.startOffset)||'',
  suffix:range.endContainer?.textContent?.slice(range.endOffset,range.endOffset+60)||''};
 selection.removeAllRanges();lastAt=at;
 if(reselection){
  const target=reselection;reselection=null;
  if(target.page!==api().currentPage||target.documentId!==api().currentId||target.hash!==api().sourceHash){
   status('A página de origem mudou. A edição foi cancelada.');return;
  }
  if(api().updateTextHighlight(target.id,{text,rects:boxes,anchor})){
   const mark=api().currentMarks.find(m=>m.id===target.id);show(mark,at.x,at.y);
   status('Trecho ajustado sem alterar o ID do grifo');
  }else status('Não foi possível alterar o trecho; original preservado');
  updateMode();return;
 }
 pending={text,rects:boxes,anchor,words,positionedWords,page:context.page,documentId:context.documentId,sourceHash:context.sourceHash,context};
 confirmOrSuggest();
}
// Em dispositivos móveis, seleção por toque pode não disparar mouseup.
document.addEventListener('touchend',()=>{
 if(!inSelect()||!activeLayer||!editor.hidden||!settings.hidden)return;
 setTimeout(readSelection,220);
},true);
document.addEventListener('mouseup',e=>{
 if(e.button!==0||!inSelect()||!activeLayer||editor.hidden===false||settings.hidden===false)return;
 setTimeout(readSelection,0);
},true);
wrap.addEventListener('click',e=>{
 if(!inSelect()||!activeLayer||!matches(context)||!inLayer(e.target))return;
 const selection=window.getSelection();
 if(selection&&!selection.isCollapsed)return;
 const m=findOnPage(e.clientX,e.clientY);
 if(m){pending=null;pendingAnalysis=null;show(m,e.clientX,e.clientY)}
},true);
document.addEventListener('keydown',e=>{
 if(!dlg.open)return;
 if(e.key==='Escape'){
  if(!editor.hidden){closeEditor();e.preventDefault();e.stopPropagation();return}
  if(!settings.hidden){settings.hidden=true;e.preventDefault();e.stopPropagation();return}
  if(!popup.hidden){closeMenu();e.preventDefault();e.stopPropagation();return}
   if(reselection){reselection=null;updateMode();status('Ajuste do trecho cancelado.');e.preventDefault();e.stopPropagation();return}
 }
 const target=e.target?.closest?.('input,textarea,[contenteditable="true"],select');
 if(target||e.repeat)return;
 const pressed='Alt+'+(e.shiftKey?'Shift+':'')+String(e.key||'').toUpperCase();
 if(e.altKey&&!e.ctrlKey&&!e.metaKey&&(pressed===keys.quick||pressed===keys.panel)){
  e.preventDefault();
  if(pressed===keys.quick)$('bm068QuickToggle').click();
  else $('bm068OpenPanel').click();
 }
},true);
$('bm068FloatClose').onclick=()=>{pending=null;pendingAnalysis=null;closeMenu()};
dlg.addEventListener('close',()=>{serial++;if(activeLayer){activeLayer.remove();activeLayer=null}context=null;pending=null;pendingAnalysis=null;reselection=null;closeMenu();closeEditor();settings.hidden=true;toast.hidden=true});
updateMode();
window.BancoMestreGrifadorV068={get active(){return inSelect()},get quick(){return quick},get semanticColors(){return smart},get layerReady(){return !!activeLayer},openNotes(id){const mark=api()?.currentMarks?.find(m=>m.id===id);if(mark){show(mark,Math.max(100,innerWidth*.5),Math.max(80,innerHeight*.2));$('bm068Note').click()}},openMark(id){const mark=api()?.currentMarks?.find(m=>m.id===id);if(mark)show(mark,Math.max(100,innerWidth*.5),Math.max(80,innerHeight*.2))}};
})();
