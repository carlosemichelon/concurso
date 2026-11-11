/* V097 — group one multicolor selection logically while preserving all its colors. */
/* V095 — paleta fixa, fluxo original V070 e seletor preciso V089 preservados. */
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
 {kind:'importante',color:'#ffe04d',label:'Importante'},
 {kind:'proibicao',color:'#ff8f96',label:'Proibição / exceção restritiva'},
 {kind:'obrigacao',color:'#86dcaa',label:'Obrigação / prazos / números'},
 {kind:'excecao',color:'#89c7ff',label:'Exceções / palavras-chave'}
];
const KEY_COLOR='BM_PDF_TEXT_COLOR_V061',KEY_QUICK='BM068_GRIFO_RAPIDO',KEY_HOTKEYS='BM068_HOTKEYS',KEY_LABELS='BM068_COLOR_LABELS',KEY_SMART='BM070_CLASSIFICACAO_RAPIDA',META='BM062_GRIFOS_META';
const allowed=['highlight','underline','double-underline','strike','conceal'];
let activeLayer=null,serial=0,context=null,activeId=null,reselection=null,popupEnabled=true,lastAt={x:240,y:120};
let mutationVersion=0,pendingUndo=null;
window.addEventListener('bm-pdf-mark-changed',()=>{mutationVersion++});
let quick=true,smart=true,lastColor='#ffe04d',lastStyle='highlight',toastTimer=0,keys={quick:'Alt+Q',panel:'Alt+W'};
try{quick=localStorage.getItem(KEY_QUICK)!=='0';smart=localStorage.getItem(KEY_SMART)!=='0';lastColor=localStorage.getItem(KEY_COLOR)||lastColor;
 const from=JSON.parse(localStorage.getItem(KEY_HOTKEYS)||'null');
 if(from?.quick&&from?.panel)keys=from;
}catch{}
const goodColor=x=>/^#[0-9a-f]{6}$/i.test(x||'');
if(!goodColor(lastColor)||!names.some(x=>x.color.toLowerCase()===lastColor.toLowerCase()))lastColor='#ffe04d';
// Nomes da paleta V095 fixos, sem alterar registros antigos.
const selectBtn=document.createElement('button');selectBtn.id='bm068SelectTool';selectBtn.type='button';
selectBtn.textContent='🖍 Grifar palavras';selectBtn.title='Selecionar texto diretamente no PDF';
selectBtn.setAttribute('aria-pressed','false');marker.parentNode.insertBefore(selectBtn,marker);
selectBtn.onclick=()=>api()?.selectTextMode?.();
const topBar=document.createElement('div');topBar.id='bm068QuickBar';topBar.className='bm068-reader-shortcuts';
topBar.innerHTML='<div class="bm068-brand"><span class="bm068-symbol">◈</span><strong>Grifador</strong><small>texto + notas</small></div>'+
 '<div class="bm068-reader-actions"><button type="button" id="bm068QuickToggle">Rápido</button>'+
 '<button type="button" id="bm068OpenPanel">☰ Meus grifos</button>'+
 '<button type="button" id="bm068Settings">⚙ Atalhos</button>'+
 '<button type="button" id="bm070Smart" aria-pressed="true" title="Sugerir cores para palavras e trechos separados">◈ Cores por trecho</button></div>'+
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
 $('bm070Smart').textContent=smart?'◈ Cores automáticas: ligadas':'◈ Cores automáticas: desligadas';
 $('bm068QuickToggle').textContent=quick?'⚡ Rápido ligado':'⚡ Rápido desligado';
 $('bm068ModeHint').textContent=!active?'Ative Grifar palavras para selecionar texto':
  reselection?'Selecione outro trecho para atualizar o grifo existente':
  quick?(smart?'Arraste o trecho: sugestão das 4 cores por palavra ou frase':'Arraste: use a cor escolhida sem classificação'):'Selecione o texto e escolha a cor ou a sugestão';
 if(!active)closeMenu();
}
window.addEventListener('bm-pdf-tool-change',updateMode);
$('bm068QuickToggle').onclick=()=>{quick=!quick;safeWrite(KEY_QUICK,quick?'1':'0');updateMode();status(quick?'Marcador rápido ativado':'Marcador rápido desativado')};
$('bm070Smart').onclick=()=>{smart=!smart;safeWrite(KEY_SMART,smart?'1':'0');updateMode();
 status(smart?'Cores por trecho ligadas. Classificações e notas serão sugeridas.':'Classificação automática desligada. Nenhum grifo anterior foi alterado.')};
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
 $('bm068Apply').hidden=!pending;
 $('bm070ApplyAuto').hidden=!pending||!window.BancoMestreClassificadorV070;
 $('bm068Resize').disabled=!mark?.id;$('bm068Delete').disabled=!mark?.id;
 $('bm068Hide').textContent=mark?.style==='conceal'?'◉ Mostrar':'⋯ Ocultar';
 $('bm068Cards').disabled=!mark?.id;$('bm068Note').disabled=!mark?.id;
 for(const b of $('bm068Colors').querySelectorAll('button[data-color]')){
  b.setAttribute('aria-pressed',String((mark?.color||lastColor).toLowerCase()===b.dataset.color));
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
  }else if(!quick)commitPending(lastColor,'highlight',false);
  updateMode();
 });
 $('bm068Colors').append(b);
}
// Quatro cores apenas; nenhuma quinta cor livre no novo menu.
function applyStyle(style){
 if(!allowed.includes(style))return;
 lastStyle=style;
 if(activeId){if(api()?.updateTextHighlight(activeId,{style}))status('Estilo atualizado')}
 else if(!quick)commitPending(lastColor,style,false);
}
$('bm068Underline').onclick=()=>applyStyle('underline');
$('bm068DoubleUnderline').onclick=()=>applyStyle('double-underline');
$('bm068Strike').onclick=()=>applyStyle('strike');
$('bm068Hide').onclick=()=>applyStyle(current()?.style==='conceal'?'highlight':'conceal');
$('bm068FloatClose').onclick=closeMenu;
let pending=null;
function commitPending(color=lastColor,style=lastStyle,auto=smart){
 if(!pending||!matches(pending.context)){status('Seleção expirada. Selecione o texto novamente.');return}
 const original=pending;pending=null;
 const classifier=window.BancoMestreClassificadorV070;
 if(auto&&classifier&&Array.isArray(original.words)&&original.words.length){
  const pieces=classifier.classifyWords(original.words,{fallbackColor:color});
  if(pieces.length){
   const docName=api()?.currentDoc?.title||api()?.currentDoc?.name||'';
   const groupId=pieces.length>1?'BM-GRP-'+(globalThis.crypto?.randomUUID?.()||
    Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,13)):null;
   const entries=pieces.map(x=>{
    const subject=classifier.suggestSubject(x.text,docName);
    return {...original,...x,style,color:x.color,color_label:x.color_label,
     anchor:x.anchor||original.anchor,
     selection_group_id:groupId,
     selection_group_text:groupId&&x.segment_index===1?original.text:'',
     subject_suggestion:subject,note_suggestion:classifier.suggestNote(x).text,
     classification_status:'sugestao'};
   });
   const res=api()?.addTextHighlights?.(entries);
   if(res){
    const last=res.marks?.at(-1)||api()?.currentMarks?.find(x=>res.duplicates?.includes(x.id));
    if(last)show(last,lastAt.x,lastAt.y);
    status(res.marks?.length?
     groupId?'Um parágrafo com '+res.marks.length+' trechos coloridos salvo. Confira o painel.':res.marks.length+' trecho(s) classificados por cor. Confira as sugestões.':
     'Todos os trechos já estavam grifados; nenhum duplicado criado.');
    return;
   }
   // Rejeitar em vez de gravar parcialmente se algum retângulo for inválido.
   status('Não foi possível salvar os trechos. Nenhum novo grifo foi incorporado.');return;
  }
 }
 const mark=api().addTextHighlight({...original,color,style,color_label:colorName(color),
  subject_suggestion:classifier?.suggestSubject(original.text,api()?.currentDoc?.title||''),
  note_suggestion:classifier?.suggestNote({text:original.text,kind:null})?.text||'',
  classification_kind:'nao_classificado',classification_status:'sugestao'});
 if(mark){show(mark,lastAt.x,lastAt.y);status(mark.duplicate?'Este trecho já estava grifado.':'Grifo salvo. Assunto e nota podem ser revisados.')}
 else status('Não foi possível salvar o grifo; confira o armazenamento.');
}
$('bm068Apply').onclick=()=>commitPending(lastColor,lastStyle,false);
$('bm070ApplyAuto').onclick=()=>commitPending(lastColor,lastStyle,true);
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
window.addEventListener('bm-pdf-active-page-rendered',async event=>{
 const c=event.detail,ticket=++serial;
 closeMenu();pending=null;reselection=null;
 if(activeLayer){activeLayer.remove();activeLayer=null}context=null;
 if(!matches(c))return;
 const layer=makeLayer();
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
  const task=window.pdfjsLib.renderTextLayer({textContentSource:content,container:layer,viewport,textDivs:[]});
  await task.promise;
  if(ticket!==serial||!matches(c))return;
  wrap.append(layer);activeLayer=layer;context=c;updateMode();
 }catch(err){
  if(ticket===serial){$('bm068ModeHint').textContent='Não foi possível selecionar texto nesta página. O grifador livre continua disponível.';console.warn('V068 seleção',err)}
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

 // V094: use the exact V070 highlight logic with V089 geometry, not DOM ranges.
 function acceptPreciseSelection(result,screen){
  const a=api();
  const c={documentId:a?.currentId,page:a?.currentPage,sourceHash:a?.sourceHash};
  if(!inSelect()||!matches(c)||!result?.ok||
     !Array.isArray(result.rects)||!result.rects.length||
     !Array.isArray(result.words)||!result.words.length||
     !Number.isFinite(result.width)||result.width<=0||
     !Number.isFinite(result.height)||result.height<=0)return false;
  const words=result.words.map(w=>({
   text:w.text,
   rects:[[w.x0/result.width,w.y0/result.height,w.x1/result.width,w.y1/result.height]],
   prefix:'',suffix:''
  }));
  const all=words.flatMap(w=>w.rects);
  if(all.some(r=>r.some(v=>!Number.isFinite(v)||v<0||v>1)||r[0]>=r[2]||r[1]>=r[3]))return false;
  const box=wrap.getBoundingClientRect();
  const at={x:Number.isFinite(screen?.x)?screen.x:box.right,
            y:Number.isFinite(screen?.y)?screen.y:box.bottom};
  lastAt=at;
  const anchor=result.anchor||{quote:result.text,prefix:'',suffix:''};
  if(reselection){
   const target=reselection;reselection=null;
   if(target.page!==c.page||target.documentId!==c.documentId||target.hash!==c.sourceHash){
    status('A página de origem mudou. A edição foi cancelada.');return false;
   }
   if(a.updateTextHighlight(target.id,{text:result.text,rects:result.rects,anchor})){
    const mark=a.currentMarks.find(m=>m.id===target.id);
    show(mark,at.x,at.y);status('Trecho ajustado sem alterar o ID do grifo');
   }else status('Não foi possível alterar o trecho; original preservado');
   updateMode();return true;
  }
  pending={text:result.text,rects:result.rects,anchor,words,
           page:c.page,documentId:c.documentId,sourceHash:c.sourceHash,context:c};
  if(quick)commitPending(lastColor,lastStyle,smart);
  else show({text:result.text,color:lastColor},at.x,at.y,true);
  return true;
 }

 function readSelection(){
  if(window.BancoMestrePreciseSelectV094?.ready)return;
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
 if(quick)commitPending(lastColor,lastStyle,smart);
 else show({text,color:lastColor},at.x,at.y,true);
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
 if(m){pending=null;show(m,e.clientX,e.clientY)}
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
$('bm068FloatClose').onclick=closeMenu;
dlg.addEventListener('close',()=>{serial++;if(activeLayer){activeLayer.remove();activeLayer=null}context=null;pending=null;reselection=null;closeMenu();closeEditor();settings.hidden=true;toast.hidden=true});
updateMode();
window.BancoMestreGrifadorV068={acceptPreciseSelection,get active(){return inSelect()},get quick(){return quick},get semanticColors(){return smart},get layerReady(){return !!activeLayer},openNotes(id){const mark=api()?.currentMarks?.find(m=>m.id===id);if(mark){show(mark,Math.max(100,innerWidth*.5),Math.max(80,innerHeight*.2));$('bm068Note').click()}},openMark(id){const mark=api()?.currentMarks?.find(m=>m.id===id);if(mark)show(mark,Math.max(100,innerWidth*.5),Math.max(80,innerHeight*.2))}};
})();
