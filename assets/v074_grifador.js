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
const names=[
 {kind:'proibicao',color:'#FF8F96',label:'Proibições e vedações'},
 {kind:'obrigacao',color:'#86DCAA',label:'Obrigações e deveres'},
 {kind:'prazo_numero',color:'#FFEA70',label:'Prazos e números'},
 {kind:'excecao',color:'#89C7FF',label:'Exceções e ressalvas'},
 {kind:'banca',color:'#CCA7FF',label:'Palavras-chave da banca'},
 {kind:'regra',color:'#FFB86B',label:'Regra principal'}
];
const KEY_COLOR='BM_PDF_TEXT_COLOR_V061',KEY_QUICK='BM068_GRIFO_RAPIDO',KEY_HOTKEYS='BM068_HOTKEYS',KEY_LABELS='BM068_COLOR_LABELS',KEY_SMART='BM070_CLASSIFICACAO_RAPIDA',META='BM062_GRIFOS_META';
const allowed=['highlight','underline','double-underline','strike','conceal'];
let activeLayer=null,serial=0,context=null,activeId=null,reselection=null,popupEnabled=true,lastAt={x:240,y:120};
let mutationVersion=0,pendingUndo=null;
window.addEventListener('bm-pdf-mark-changed',()=>{mutationVersion++});
let quick=true,smart=true,lastColor='#FFB86B',lastStyle='highlight',toastTimer=0,keys={quick:'Alt+Q',panel:'Alt+W'};
try{quick=localStorage.getItem(KEY_QUICK)!=='0';smart=localStorage.getItem(KEY_SMART)!=='0';lastColor=localStorage.getItem(KEY_COLOR)||lastColor;
 const from=JSON.parse(localStorage.getItem(KEY_HOTKEYS)||'null');
 if(from?.quick&&from?.panel)keys=from;
}catch{}
const goodColor=x=>/^#[0-9a-f]{6}$/i.test(x||'');
if(!goodColor(lastColor)||['#ffe04d','#92e8c0','#ffb3c5','#a6d7ff'].includes(lastColor.toLowerCase()))lastColor='#FFB86B';
try{
 const customLabels=JSON.parse(localStorage.getItem(KEY_LABELS)||'{}');
 if(customLabels&&typeof customLabels==='object')for(const item of names){
  const label=customLabels[item.color];
  if(typeof label==='string'&&label.trim())item.label=label.trim().slice(0,45);
 }
}catch{}
const selectBtn=document.createElement('button');selectBtn.id='bm068SelectTool';selectBtn.type='button';
selectBtn.textContent='🖍 Grifar palavras';selectBtn.title='Selecionar texto diretamente no PDF';
selectBtn.setAttribute('aria-pressed','false');marker.parentNode.insertBefore(selectBtn,marker);
selectBtn.onclick=()=>api()?.selectTextMode?.();
const topBar=document.createElement('div');topBar.id='bm068QuickBar';topBar.className='bm068-reader-shortcuts';
topBar.innerHTML='<div class="bm068-brand"><span class="bm068-symbol">◈</span><strong>Grifador</strong><small>texto + notas</small></div>'+
 '<div class="bm068-reader-actions"><button type="button" id="bm068QuickToggle">Rápido</button>'+
 '<button type="button" id="bm068OpenPanel">☰ Meus grifos</button>'+
 '<button type="button" id="bm068Settings">⚙ Atalhos</button>'+
 '<button type="button" id="bm070Smart" aria-pressed="true" title="Sugerir uma cor para toda a seleção, sem fragmentar">◈ Uma cor por seleção</button></div>'+
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
const advice=document.createElement('p');advice.id='bm074ColorAdvice';advice.hidden=true;
advice.setAttribute('role','status');advice.setAttribute('aria-live','polite');
popup.querySelector('.bm068-commands').before(advice);
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
 '<button type="button" id="bm068EditColors">Editar significados das cores</button><p id="bm068SettingsMessage" role="status"></p><div class="bm068-settings-actions"><button type="button" id="bm068SettingsCancel">Cancelar</button><button type="button" id="bm068SettingsSave">Salvar</button></div></div>';
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
function closeMenu(){popup.hidden=true;activeId=null}
function closeEditor(){editor.hidden=true}
function updateMode(){
 const active=inSelect();
 dlg.classList.toggle('bm-v061-text-mode',active);
 dlg.classList.toggle('bm068-selecting',active);
 selectBtn.setAttribute('aria-pressed',String(active));
 $('bm068QuickToggle').setAttribute('aria-pressed',String(quick));
 $('bm070Smart').setAttribute('aria-pressed',String(smart));
 $('bm070Smart').textContent=smart?'◈ Uma cor por seleção: automática':'◈ Uma cor por seleção: manual';
 $('bm068QuickToggle').textContent=quick?'⚡ Rápido ligado':'⚡ Rápido desligado';
 $('bm068ModeHint').textContent=!active?'Ative Grifar palavras para selecionar texto':
  reselection?'Selecione outro trecho para atualizar o grifo existente':
  quick?(smart?'Selecione o trecho: uma única cor e um único grifo':'Selecione: uma única marca com a cor manual atual'):'Selecione o trecho inteiro e escolha uma única cor';
 if(!active)closeMenu();
}
window.addEventListener('bm-pdf-tool-change',updateMode);
$('bm068QuickToggle').onclick=()=>{quick=!quick;safeWrite(KEY_QUICK,quick?'1':'0');updateMode();status(quick?'Marcador rápido ativado':'Marcador rápido desativado')};
$('bm070Smart').onclick=()=>{smart=!smart;safeWrite(KEY_SMART,smart?'1':'0');updateMode();
 status(smart?'Sugestão de uma cor ativada; trechos mistos exigem escolha manual.':'Cor automática desligada; cor manual ativa. Grifos anteriores mantidos.')};
$('bm068OpenPanel').onclick=()=>{const panel=$('bm064TogglePanel');if(panel)panel.click();else status('O painel de grifos ainda não carregou')};
$('bm068Settings').onclick=()=>{$('bm068KeyQuick').value=keys.quick;$('bm068KeyPanel').value=keys.panel;settings.hidden=false;$('bm068KeyQuick').focus()};
$('bm068SettingsCancel').onclick=()=>settings.hidden=true;
$('bm068EditColors').onclick=()=>{
 const colorLabels={};try{Object.assign(colorLabels,JSON.parse(safeRead(KEY_LABELS)||'{}'))}catch{}
 for(const item of names){
  const chosen=prompt('Nome de estudo para a cor '+item.color+':',item.label);
  if(chosen===null)break;
  if(chosen.trim()){
   item.label=chosen.trim().slice(0,45);colorLabels[item.color]=item.label;
  }
 }
 if(safeWrite(KEY_LABELS,JSON.stringify(colorLabels))){
  for(const b of $('bm068Colors').querySelectorAll('button[data-color]')){
   const item=names.find(x=>x.color===b.dataset.color);
   if(item){b.title=item.label;b.setAttribute('aria-label',item.label+' ('+item.color+')')}
  }
  $('bm068SettingsMessage').textContent='Legendas de cores salvas neste navegador.';
 }else $('bm068SettingsMessage').textContent='Não foi possível salvar a legenda das cores.';
};
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
function show(mark,x,y,pending=false){
 activeId=mark?.id||null;lastAt={x,y};
 $('bm068CurrentText').textContent=mark?.text?.slice(0,85)||'Seleção de texto';
 const canSuggest=pending&&smart&&pendingAnalysis?.status==='clara';
 $('bm068Apply').hidden=!pending||smart;
 $('bm070ApplyAuto').hidden=!canSuggest;
 if(canSuggest)$('bm070ApplyAuto').textContent='◈ Grifar tudo em '+pendingAnalysis.label;
 advice.hidden=!pending;
 if(pending)advice.textContent=smart?(pendingAnalysis?.reason||'Escolha uma cor para o trecho inteiro.'):
  'Modo manual: escolha uma única cor. O texto inteiro será um grifo.';
 else advice.textContent='';
 $('bm068Resize').disabled=!mark?.id;$('bm068Delete').disabled=!mark?.id;
 $('bm068Hide').textContent=mark?.style==='conceal'?'◉ Mostrar':'⋯ Ocultar';
 $('bm068Cards').disabled=!mark?.id;$('bm068Note').disabled=!mark?.id;
 const selectedColor=pending&&smart&&pendingAnalysis?.status!=='clara'?null:(mark?.color||lastColor);
 for(const b of $('bm068Colors').querySelectorAll('button[data-color]')){
  b.setAttribute('aria-pressed',String(!!selectedColor&&selectedColor.toLowerCase()===b.dataset.color.toLowerCase()));
 }
 popupAt(x,y);
}
for(const item of names){
 const b=document.createElement('button');b.type='button';b.className='bm068-swatch';
 b.dataset.color=item.color;b.style.setProperty('--swatch',item.color);
 b.setAttribute('aria-label',item.label+' ('+item.color+')');b.title=item.label;
 b.innerHTML='<span aria-hidden="true">✓</span>';
 b.addEventListener('click',()=>{
  lastColor=item.color;lastStyle='highlight';safeWrite(KEY_COLOR,lastColor);
  if(activeId){
   if(api()?.updateTextHighlight(activeId,{color:lastColor,color_label:item.label,style:'highlight',classification_kind:item.kind,classification_status:'confirmada'}))status('Cor: '+item.label);
  }else if(pending)commitPending(lastColor,'highlight',false,{kind:item.kind,label:item.label});
  updateMode();
 });
 $('bm068Colors').append(b);
}
const custom=document.createElement('input');custom.type='color';custom.id='bm068CustomColor';custom.title='Escolher outra cor';custom.value=lastColor;
custom.setAttribute('aria-label','Cor personalizada');
custom.addEventListener('change',()=>{
 lastColor=custom.value;lastStyle='highlight';safeWrite(KEY_COLOR,lastColor);
 if(activeId)api()?.updateTextHighlight(activeId,{color:lastColor,color_label:'Personalizado',style:'highlight',classification_kind:'nao_classificado',classification_status:'confirmada'});
 else if(pending)commitPending(lastColor,'highlight',false,{kind:'nao_classificado',label:'Personalizado'});
});
$('bm068Colors').append(custom);
 const legend=document.createElement('p');legend.id='bm071Legend';legend.className='bm071-color-legend';
 legend.textContent='🔴 Proibição  •  🟢 Obrigação  •  🟡 Prazo/número  •  🔵 Exceção  •  🟣 Palavra-chave  •  🟠 Regra principal';
 $('bm068Colors').after(legend);
function applyStyle(style){
 if(!allowed.includes(style))return;
 lastStyle=style;
 if(activeId){if(api()?.updateTextHighlight(activeId,{style}))status('Estilo atualizado')}
 else if(pending){
  if(smart&&pendingAnalysis?.status!=='clara'){
   status('Escolha primeiro uma cor para a seleção inteira.');return;
  }
  commitPending(smart?pendingAnalysis.color:lastColor,style,smart);
 }
}
$('bm068Underline').onclick=()=>applyStyle('underline');
$('bm068DoubleUnderline').onclick=()=>applyStyle('double-underline');
$('bm068Strike').onclick=()=>applyStyle('strike');
$('bm068Hide').onclick=()=>applyStyle(current()?.style==='conceal'?'highlight':'conceal');
$('bm068FloatClose').onclick=()=>{pending=null;pendingAnalysis=null;closeMenu()};
let pending=null,pendingAnalysis=null;
function computeSelectionAnalysis(){
 return window.BancoMestreAnaliseSelecaoV074?.analyze(pending?.words||[],pending?.text||'')||{
  status:'indefinida',kind:null,reason:'Classificador indisponível. Escolha uma cor manualmente.',
  candidates:[],confidence:'indefinida'
 };
}
function confirmOrSuggest(){
 if(!pending)return;
 pendingAnalysis=computeSelectionAnalysis();
 if(quick&&smart&&pendingAnalysis.status==='clara'){
  commitPending(pendingAnalysis.color,lastStyle,true);return;
 }
 if(quick&&!smart){commitPending(lastColor,lastStyle,false);return}
 show({text:pending.text,color:pendingAnalysis.status==='clara'?pendingAnalysis.color:lastColor},
  lastAt.x,lastAt.y,true);
 if(smart&&pendingAnalysis.status!=='clara')
  status('Escolha uma cor para o trecho inteiro. Nenhuma marcação foi salva ainda.');
}
function sameHighlight(mark,selection){
 return mark?.type==='text_highlight'&&mark.text===selection.text&&
 Array.isArray(mark.rects)&&mark.rects.length===selection.rects.length&&
 mark.rects.every((r,i)=>Array.isArray(r)&&r.length===4&&
  r.every((value,j)=>Number.isFinite(value)&&Math.abs(value-selection.rects[i][j])<.001));
}
function commitPending(color=lastColor,style=lastStyle,auto=smart,manualChoice=null){
 if(!pending||!matches(pending.context)){
  status('Seleção expirada; selecione novamente o texto nesta página.');return;
 }
 const original=pending,analysis=pendingAnalysis||computeSelectionAnalysis();
 const classifier=window.BancoMestreClassificadorV072||window.BancoMestreClassificadorV071;
 if(auto&&analysis.status!=='clara'){
  show({text:original.text,color:lastColor},lastAt.x,lastAt.y,true);
  status('Categorias conflitantes ou incertas: escolha a cor. Nada foi salvo.');return;
 }
 const chosen=auto?null:{
  color,kind:manualChoice?.kind||
   names.find(n=>n.color.toLowerCase()===String(color).toLowerCase())?.kind||'nao_classificado',
  label:manualChoice?.label||colorName(color)
 };
 const plan=window.BancoMestreAnaliseSelecaoV074?.planOneHighlight(original,analysis,chosen,style);
 if(plan?.status!=='ready'){
  status('Não foi possível validar a seleção e a cor. Nenhuma alteração foi feita.');return;
 }
 const docName=api()?.currentDoc?.title||api()?.currentDoc?.name||'';
 const kind=plan.mark.classification_kind;
 const suggested=classifier?.suggestNote?.({text:original.text,kind,detail:plan.mark.detail})?.text||'';
 const caveat=analysis.status==='ambigua'?' Há sinais de outras categorias na seleção; confira o contexto.':'';
 const record={...plan.mark,
  subject_suggestion:classifier?.suggestSubject?.(original.text,docName)||{},
  note_suggestion:(suggested+caveat).slice(0,1400)
 };
 const existing=api()?.currentMarks?.find(m=>sameHighlight(m,original));
 let mark=null;
 if(existing){
  if(!auto){
   const ok=api()?.updateTextHighlight(existing.id,{
    color:record.color,color_label:record.color_label,style:record.style,
    classification_kind:record.classification_kind,classification_status:'confirmada'
   });
   if(!ok){status('Não foi possível alterar a cor do grifo existente.');return}
   mark=api()?.currentMarks?.find(m=>m.id===existing.id);
  }else mark=existing;
 }else mark=api()?.addTextHighlight?.(record);
 if(!mark){
  status('Falha ao salvar. A seleção continua disponível para tentar novamente.');return;
 }
 pending=null;pendingAnalysis=null;
 show(mark,lastAt.x,lastAt.y);
 status(existing?(auto?'O grifo já existia: cor preservada.':'Cor alterada no mesmo grifo e ID.'):
  'Um único grifo salvo para a seleção inteira'+(auto?' com cor sugerida.':' com a cor escolhida.')+
  ' Assunto e nota continuam sujeitos a revisão.');
}
$('bm068Apply').onclick=()=>commitPending(lastColor,lastStyle,false);
$('bm070ApplyAuto').onclick=()=>commitPending(pendingAnalysis?.color||lastColor,lastStyle,true);
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
 context=null;pending=null;pendingAnalysis=null;reselection=null;closeMenu();
 dlg.classList.remove('bm-v061-text-mode','bm068-selecting');
 if(reason)$('bm068ModeHint').textContent=reason;
}
window.addEventListener('bm-pdf-render-start',()=>{
 clearTextLayer('Atualizando a página; a seleção ficará disponível após o carregamento.');
});
window.addEventListener('bm-pdf-active-page-rendered',async event=>{
 const c=event.detail,ticket=++serial;
 if(activeLayer){activeLayer.remove();activeLayer=null}
 context=null;pending=null;pendingAnalysis=null;closeMenu();
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
function readSelection(){
 if(!inSelect()||!activeLayer||!matches(context))return;
 const selection=window.getSelection();
 if(!selection||selection.isCollapsed||selection.rangeCount!==1||!inLayer(selection.anchorNode)||!inLayer(selection.focusNode))return;
 const range=selection.getRangeAt(0),text=String(selection.toString()||'').replace(/\u00a0/g,' ').trim();
 if(!text||text.length>20000)return;
 const boxes=rects(range);if(!boxes.length)return;
 const words=wordsFromRange(range);
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
 pending={text,rects:boxes,anchor,words,page:context.page,documentId:context.documentId,sourceHash:context.sourceHash,context};
 confirmOrSuggest();
}
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
