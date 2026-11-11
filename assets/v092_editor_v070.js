/* Banco Mestre V092 — editor V070 (4 cores automáticas) sobre seleção precisa V089.
 * A geometria e os eventos de apontamento V089 foram preservados; apenas editor substituído.
 */
(function(){
'use strict';
if(window.BancoMestrePreciseSelectV089)return;
const root=document.getElementById('pdfDialog'),wrap=document.getElementById('pdfPageWrap'),
 tools=document.getElementById('pdfLocalTools'),api=()=>window.BancoMestrePDFV042,
 engine=window.BancoMestrePreciseCoreV089;
if(!root||!wrap||!tools||!engine)return;
const COLORS=Object.freeze([
 {kind:'regra',color:'#ffe04d',name:'Regra principal'},
 {kind:'agente',color:'#92e8c0',name:'Agente / competência'},
 {kind:'excecao',color:'#ffb3c5',name:'Exceção / ressalva'},
 {kind:'condicao',color:'#a6d7ff',name:'Condição / prazo'}
]);
const overlay=document.createElement('div');overlay.id='bm089WordPointer';overlay.hidden=true;
overlay.setAttribute('aria-label','Seletor de palavras por posição. Clique na primeira e na última palavra ou arraste com o mouse.');
const marks=document.createElement('div');marks.id='bm089RectPreview';marks.setAttribute('aria-hidden','true');
overlay.append(marks);wrap.append(overlay);
const pane=document.createElement('section');pane.id='bm089Editor';pane.hidden=true;
pane.setAttribute('role','dialog');pane.setAttribute('aria-label','Grifo de texto — confirmar');
pane.innerHTML=[
 '<div class="bm089-head"><strong>Grifador V070 · quatro cores</strong><button type="button" id="bm089Close" aria-label="Fechar editor">×</button></div>',
 '<div class="bm092-mode"><span>Classificação automática por regras locais</span><button type="button" id="bm092Toggle" aria-pressed="true">Automático ligado</button></div>',
 '<div class="bm089-excerpt" id="bm089Excerpt" aria-label="Texto selecionado no PDF"></div>',
 '<small class="bm089-tip" id="bm089Coordinates">Seleção precisa V089 preservada</small>',
 '<div class="bm089-label">Cores originais V070</div><div class="bm089-colors" id="bm089Colors"></div>',
 '<section class="bm092-suggestions" id="bm092Suggestions" hidden><strong>Prévia das cores sugeridas</strong>',
 '<p class="bm092-caution">Sugestões locais, não interpretação normativa confirmada. Confira os trechos antes de aplicar.</p>',
 '<div id="bm092Segments"></div></section>',
 '<details class="bm089-extra" id="bm092Details"><summary>Assunto e nota (sugestões editáveis)</summary>',
 '<label class="bm089-field">Assunto<input id="bm089Topic" type="text" maxlength="140" placeholder="Assunto sugerido (opcional)"></label>',
 '<label class="bm089-field">Disciplina<input id="bm089Discipline" type="text" maxlength="120" placeholder="Disciplina sugerida"></label>',
 '<label class="bm089-field">Subassunto<input id="bm089Subtopic" type="text" maxlength="140" placeholder="Subassunto sugerido"></label>',
 '<label class="bm089-field">Nota<input id="bm092Note" type="text" maxlength="1200" placeholder="Observação opcional"></label></details>',
 '<p class="bm089-alert" id="bm089PanelStatus" role="status" aria-live="polite"></p>',
 '<div class="bm089-footer bm092-actions">',
 '<button type="button" id="bm089Retry">Refazer seleção</button>',
 '<button type="button" id="bm092AutoApply">Aplicar as cores sugeridas</button>',
 '<button type="button" id="bm089Save">Grifar tudo com uma cor</button>',
 '<button type="button" id="bm092Delete" hidden>Excluir grifo</button></div>'
].join('');
root.append(pane);
const $=id=>document.getElementById(id);
const hint=document.createElement('div');hint.id='bm089Hint';hint.setAttribute('role','status');
hint.textContent='Selecione texto com precisão: clique na primeira e última palavra (ou arraste com o mouse).';
tools.prepend(hint);
const more=document.createElement('button');more.id='bm089MoreTools';more.type='button';
more.setAttribute('aria-expanded','false');more.textContent='Mais ferramentas';
tools.append(more);
more.onclick=()=>{const open=root.classList.toggle('bm089-more');more.setAttribute('aria-expanded',String(open));
 more.textContent=open?'Ocultar ferramentas extras':'Mais ferramentas'};
const selectBtn=$('bm068SelectTool');
if(selectBtn){selectBtn.textContent='Selecionar texto';selectBtn.title='Selecionar por coordenadas V089; classificação V070 acontece após a seleção';}
root.classList.add('bm089-simplified');
let state=null,readyWords=[],cols=[],ordered=[],start=null,end=null,down=null,
 selected=null,color=null,token=0,source=null,lastClickAt=0,autoActivatedDoc=null,editingId=null,autoOn=true,proposals=[];
const alertMessage=x=>{$('bm089PanelStatus').textContent=String(x)};
function status(x){hint.textContent=String(x)}
function sameContext(){return !!(source&&api()?.editing&&api()?.currentTool==='select'&&
 api().currentId===source.documentId&&api().currentPage===source.page&&
 api().sourceHash===source.sourceHash)}
function resetPreview(){marks.replaceChildren()}
function addPreview(words,focus=false){
 resetPreview();
 if(!words?.length)return;
 const width=source.width,height=source.height;
 for(const w of words.slice(0,190)){
  const r=document.createElement('span');r.className=focus?'bm089-focus-word':'bm089-word-rect';
  r.style.left=(w.x0/width*100)+'%';r.style.top=(w.y0/height*100)+'%';
  r.style.width=((w.x1-w.x0)/width*100)+'%';r.style.height=((w.y1-w.y0)/height*100)+'%';
  marks.append(r);
 }
}
function openPreview(result){
 selected=result;editingId=null;start=null;end=null;down=null;
 pane.hidden=false;overlay.style.pointerEvents='none';
 $('bm089Excerpt').textContent=result.text;
 $('bm089Coordinates').textContent=result.words.length+' palavras selecionadas · coluna '+(result.first.column+1);
 $('bm089Topic').value='';$('bm089Discipline').value='';$('bm089Subtopic').value='';$('bm092Note').value='';
 $('bm089Save').textContent='Grifar tudo com uma cor';$('bm092Delete').hidden=true;
 color=null;for(const b of $('bm089Colors').children)b.setAttribute('aria-pressed','false');
 const historical=window.BancoMestreClassificadorV070;
 const suggested=historical?.suggestSubject?.(result.text,api()?.currentDoc?.title||'')||{};
 $('bm089Topic').value=suggested.topic||'';
 $('bm089Discipline').value=suggested.discipline||'';
 $('bm089Subtopic').value=suggested.subtopic||'';
 const note=historical?.suggestNote?.({text:result.text,kind:null});
 $('bm092Note').placeholder=note?.text||'Observação opcional';
 buildProposals();
 addPreview(result.words);
}
function closePanel(resetAll=true){
 pane.hidden=true;
 if(resetAll){selected=null;editingId=null;proposals=[];start=null;end=null;down=null;resetPreview();}
 overlay.style.pointerEvents='';
 if(sameContext())status('Clique na primeira e na última palavra da próxima seleção ou arraste com o mouse.');
}
function abortGesture(){down=null;start=null;end=null;resetPreview()}
function clear(){
 token++;overlay.hidden=true;overlay.replaceChildren(marks);pane.hidden=true;
 state=null;readyWords=[];cols=[];ordered=[];source=null;selected=null;editingId=null;proposals=[];start=null;end=null;down=null;
 resetPreview();
}
function coords(e){
 const box=wrap.getBoundingClientRect();return {x:(e.clientX-box.left)*source.width/box.width,
 y:(e.clientY-box.top)*source.height/box.height};
}
function nearest(e){
 if(!source||!ordered.length)return null;
 const p=coords(e);
 return engine.nearest(ordered,p.x,p.y,start?.column??null);
}
function previewUntil(w){
 if(!start||!w)return;
 const calculated=engine.selectRange(ordered,start,w,{width:source.width,height:source.height});
 if(calculated.ok){end=w;addPreview(calculated.words);status('Prévia: '+calculated.words.length+' palavras na coluna '+(start.column+1)+'.')}
 else{end=null;addPreview([start],true);status(calculated.error)}
}
function finish(w){
 if(!start||!w){status('Clique em uma palavra do texto, dentro da página.');return}
 const result=engine.selectRange(ordered,start,w,{width:source.width,height:source.height});
 if(!result.ok){status(result.error);return}
 openPreview(result);
}
overlay.addEventListener('pointerdown',e=>{
 if(!sameContext()||!pane.hidden||e.button!==0||e.isPrimary===false)return;
 const word=nearest(e);
 if(!word){status('Clique diretamente sobre uma palavra impressa no PDF.');return}
 if(start&&start.column!==word.column){
  status('Selecione apenas uma coluna por vez. Clique novamente na primeira palavra.');abortGesture();return;
 }
 down={x:e.clientX,y:e.clientY,time:Date.now(),word,
  startWasSet:!!start,pointerType:e.pointerType};
 if(!start){start=word;end=word;addPreview([word],true);
  status('Início: “'+word.text+'”. Clique na última palavra ou arraste até ela.')}
 try{overlay.setPointerCapture(e.pointerId)}catch{}
 e.preventDefault();
});
overlay.addEventListener('pointermove',e=>{
 if(!down||!sameContext()||!pane.hidden)return;
 const delta=Math.hypot(e.clientX-down.x,e.clientY-down.y);
 if(delta<7)return;
 const word=nearest(e);
 if(word)previewUntil(word);
});
overlay.addEventListener('pointerup',e=>{
 if(!down||!sameContext()||!pane.hidden)return;
 const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y)>7;
 const originally=down,word=nearest(e);
 down=null;
 try{if(overlay.hasPointerCapture(e.pointerId))overlay.releasePointerCapture(e.pointerId)}catch{}
 if(moved&&!word){status('Fim fora da coluna ou muito distante da palavra. Nada foi selecionado. Toque na última palavra.');return}
 if(moved&&word){finish(word);return}
 if(originally.startWasSet){if(word)finish(word);else status('Toque em uma palavra da mesma coluna.');return}
 // Um toque num grifo salvo abre a edição existente sem criar grifos sobrepostos.
 if(!moved&&word){
  const p=coords(e),rx=p.x/source.width,ry=p.y/source.height;
  const old=(api()?.currentMarks||[]).find(m=>m.type==='text_highlight'&&Array.isArray(m.rects)&&
    m.rects.some(b=>Array.isArray(b)&&rx>=b[0]&&rx<=b[2]&&ry>=b[1]&&ry<=b[3]));
  if(old?.id){
   abortGesture();openExisting(old.id);
   status('Grifo existente aberto sem modificar o ID ou sua cor.');return;
  }
 }
 if(originally.pointerType==='mouse'&&word===start){
  // Apenas um clique: aguardar ponto final, sem capturar palavras aleatórias.
  status('Primeira palavra escolhida: “'+word.text+'”. Clique na última palavra.');
 }
});
overlay.addEventListener('pointercancel',()=>{down=null});
overlay.addEventListener('contextmenu',e=>{e.preventDefault();abortGesture();status('Seleção cancelada.')});
$('bm089Retry').onclick=()=>closePanel(true);
$('bm089Close').onclick=()=>closePanel(true);
root.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!pane.hidden){e.stopImmediatePropagation();e.preventDefault();closePanel(true)}
},true);
for(const entry of COLORS){
 const b=document.createElement('button');b.type='button';b.className='bm089-color';
 b.textContent=entry.name;b.style.setProperty('--markcolor',entry.color);
 b.setAttribute('aria-label',entry.name);b.setAttribute('aria-pressed','false');
 b.dataset.kind=entry.kind;
 b.onclick=()=>{
  color=entry;
  for(const other of $('bm089Colors').children)other.setAttribute('aria-pressed',String(other===b));
  alertMessage('Cor manual '+entry.name+' selecionada. Use “Grifar tudo com uma cor” para confirmar.');
 };
 $('bm089Colors').append(b);
}
const META='BM062_GRIFOS_META';
const classification=()=>window.BancoMestreClassificadorV070;
function readMeta(){
 try{const m=JSON.parse(localStorage.getItem(META)||'{}');
  return m&&typeof m==='object'&&!Array.isArray(m)?m:{}
 }catch{return {}}
}
function subjectFromForm(){
 return {discipline:$('bm089Discipline').value.trim().slice(0,120),
  topic:$('bm089Topic').value.trim().slice(0,140),
  subtopic:$('bm089Subtopic').value.trim().slice(0,140),
  basis:'escolha_manual'};
}
function recordOf(segment,subject,note=''){
 return {
  text:segment.text,rects:segment.rects,
  anchor:segment.anchor||{quote:segment.text,prefix:'',suffix:''},
  page:source.page,documentId:source.documentId,sourceHash:source.sourceHash,
  color:segment.color,color_label:segment.color_label,
  style:'highlight',classification_kind:segment.classification_kind,
  classification_status:segment.classification_status||'sugestao',
  subject_suggestion:subject,note:String(note||'').slice(0,12000),
  note_suggestion:String(segment.note_suggestion||'').slice(0,1400),
  confidence:segment.confidence||'indefinida',detail:'regra_local',
  segment_index:segment.segment_index,segment_total:segment.segment_total
 };
}
function existingOverlap(records){
 const current=api()?.currentMarks||[];
 return window.BancoMestreMulticorV081?.intersectsExisting?.(records,current)===true;
}
function saveTopicIndex(marks,subjects){
 let ok=true;
 for(let i=0;i<marks.length;i++){
  const subject=subjects[i];
  if(!subject?.topic)continue;
  try{
   const key='TXT:'+source.documentId+':'+source.sourceHash+':'+marks[i].id;
   const data=readMeta();data[key]={...(data[key]||{}),
    discipline:subject.discipline||'',topic:subject.topic||'',
    subtopic:subject.subtopic||''};
   localStorage.setItem(META,JSON.stringify(data));
  }catch{ok=false}
 }
 return ok;
}
function buildProposals(){
 proposals=[];
 const container=$('bm092Segments');container.replaceChildren();
 const section=$('bm092Suggestions');section.hidden=true;
 $('bm092AutoApply').hidden=!autoOn;
 $('bm092AutoApply').disabled=true;
 if(!selected||!autoOn)return;
 const classifier=classification();
 if(!classifier?.classifyWords){alertMessage('Classificador histórico V070 não carregado. Use as quatro cores manuais.');return}
 const width=source.width,height=source.height;
 const tokens=selected.words.map(w=>({
  text:w.text,
  rects:[[w.x0/width,w.y0/height,w.x1/width,w.y1/height]],
  prefix:'',suffix:''
 }));
 const guesses=classifier.classifyWords(tokens,{fallbackColor:'#ffe04d'});
 if(!Array.isArray(guesses)||!guesses.length){
  alertMessage('Nenhuma classificação segura para este trecho. Selecione uma das quatro cores manualmente.');return;
 }
 const joinRects=window.BancoMestreMulticorV081?.joinRects;
 for(const guess of guesses){
  const parts=typeof joinRects==='function'?joinRects(guess.rects):guess.rects;
  if(!Array.isArray(parts)||!parts.length||parts.length>250||
   parts.some(r=>!Array.isArray(r)||r.length!==4||
    r.some(v=>!Number.isFinite(v)||v<0||v>1)||r[0]>=r[2]||r[1]>=r[3])){
   alertMessage('Posições imprecisas no PDF; sugestão cancelada.');return;
  }
  const seg={...guess,rects:parts,
   classification_status:'sugestao',
   note_suggestion:classifier.suggestNote?.(guess)?.text||''};
  proposals.push(seg);
  const line=document.createElement('div');line.className='bm092-segment';
  const dot=document.createElement('span');dot.className='bm092-segment-dot';
  dot.style.background=seg.color;
  const copy=document.createElement('div');copy.className='bm092-segment-text';
  const title=document.createElement('strong');
  title.textContent=seg.color_label;
  const excerpt=document.createElement('span');
  excerpt.textContent=seg.text;
  copy.append(title,excerpt);line.append(dot,copy);container.append(line);
 }
 section.hidden=false;
 $('bm092AutoApply').disabled=!proposals.length;
 alertMessage(proposals.length+' trecho(s) classificados automaticamente com regras V070. Revise a prévia antes de aplicar.');
}
$('bm092Toggle').onclick=()=>{
 autoOn=!autoOn;
 $('bm092Toggle').setAttribute('aria-pressed',String(autoOn));
 $('bm092Toggle').textContent=autoOn?'Automático ligado':'Automático desligado';
 buildProposals();
 if(!autoOn)alertMessage('Cores automáticas desligadas. Você pode grifar a seleção inteira manualmente.');
};
function openExisting(id){
 if(!sameContext())return false;
 const mark=api()?.currentMarks?.find(x=>x.type==='text_highlight'&&x.id===id);
 if(!mark)return false;
 selected=null;editingId=id;proposals=[];start=null;end=null;down=null;
 pane.hidden=false;overlay.style.pointerEvents='none';
 $('bm089Excerpt').textContent=mark.text;
 $('bm089Coordinates').textContent='Grifo existente — ID e histórico mantidos';
 const m=readMeta()['TXT:'+source.documentId+':'+source.sourceHash+':'+mark.id]||{};
 $('bm089Topic').value=m.topic||mark.subject_suggestion?.topic||'';
 $('bm089Discipline').value=m.discipline||mark.subject_suggestion?.discipline||'';
 $('bm089Subtopic').value=m.subtopic||mark.subject_suggestion?.subtopic||'';
 $('bm092Note').value=mark.note||'';
 color=COLORS.find(x=>x.color.toLowerCase()===String(mark.color||'').toLowerCase())||null;
 for(const btn of $('bm089Colors').children)
  btn.setAttribute('aria-pressed',String(btn.dataset.kind===color?.kind));
 $('bm089Save').textContent='Atualizar grifo';
 $('bm092Delete').hidden=false;
 $('bm092AutoApply').hidden=true;$('bm092Suggestions').hidden=true;
 $('bm092Segments').replaceChildren();
 $('bm092Details').open=true;
 const boxes=(mark.rects||[]).map(r=>({
  x0:r[0]*source.width,y0:r[1]*source.height,
  x1:r[2]*source.width,y1:r[3]*source.height
 }));
 addPreview(boxes);
 alertMessage('Edite somente o que desejar. O grifo existente não será recolorido automaticamente.');
 return true;
}
$('bm092Delete').onclick=()=>{
 if(!editingId||!sameContext())return;
 if(!confirm('Excluir este grifo? Você poderá restaurar usando Desfazer.'))return;
 if(!api()?.removeTextHighlight?.(editingId)){
  alertMessage('Não foi possível excluir o grifo; original preservado.');return;
 }
 closePanel(true);status('Grifo excluído. Desfazer permite restaurar.');
 window.BancoMestreGrifosV062?.reload?.();window.BancoMestreV064PainelGrifos?.refresh?.();
};
$('bm092AutoApply').onclick=()=>{
 if(!selected||editingId||!sameContext()||!autoOn||!proposals.length){
  alertMessage('Seleção expirada ou sugestão indisponível.');return;
 }
 const classifier=classification(),form=subjectFromForm(),note=$('bm092Note').value.trim();
 const docName=api()?.currentDoc?.title||api()?.currentDoc?.name||'';
 const records=proposals.map((seg,i)=>{
  const initial=classifier.suggestSubject?.(seg.text,docName)||{};
  const subject={
   discipline:form.discipline||initial.discipline||'',
   topic:form.topic||initial.topic||'',
   subtopic:form.subtopic||initial.subtopic||'',
   basis:form.topic?'escolha_manual':initial.basis||'indefinida',
   status:form.topic?'confirmada':'sugestao'
  };
  return recordOf(seg,subject,i===0?note:'');
 });
 if(existingOverlap(records)){
  alertMessage('Trecho sobreposto a outro grifo salvo. Abra esse grifo para editar.');return;
 }
 const result=api()?.addTextHighlights?.(records);
 if(!result||result.duplicates?.length||result.marks?.length!==records.length){
  alertMessage('Não foi possível aplicar todos os trechos. Confira a seleção e tente novamente.');return;
 }
 const indexOk=saveTopicIndex(result.marks,records.map(r=>r.subject_suggestion));
 const count=result.marks.length;
 closePanel(true);status(count+' trechos grifados com as quatro cores V070 (uma operação Desfazer).'+
 (indexOk?'':' Índice de assuntos local parcialmente indisponível.'));
 window.BancoMestreGrifosV062?.reload?.();window.BancoMestreV064PainelGrifos?.refresh?.();
};
$('bm089Save').onclick=()=>{
 if(!sameContext()){alertMessage('Página ou documento mudou. Selecione novamente.');return}
 const form=subjectFromForm(),note=$('bm092Note').value.trim();
 if(editingId){
  const prev=api()?.currentMarks?.find(m=>m.id===editingId);
  if(!prev){alertMessage('Grifo antigo indisponível.');return}
  const patch={note,classification_status:'confirmada'};
  if(color){
   patch.color=color.color;patch.color_label=color.name;patch.classification_kind=color.kind;
  }
  if(form.topic)patch.subject_suggestion=form;
  if(!api()?.updateTextHighlight?.(prev.id,patch)){
   alertMessage('Não foi possível atualizar; os dados originais continuam intactos.');return;
  }
  const updated=api()?.currentMarks?.find(x=>x.id===prev.id)||prev;
  if(form.topic)saveTopicIndex([updated],[form]);
  closePanel(true);status('Grifo existente atualizado, mantendo ID, notas e vínculos.');
  window.BancoMestreGrifosV062?.reload?.();window.BancoMestreV064PainelGrifos?.refresh?.();
  return;
 }
 if(!selected||!color){alertMessage('Escolha uma das quatro cores para grifar toda a seleção.');return}
 const seg={
  text:selected.text,rects:selected.rects,anchor:selected.anchor,
  color:color.color,color_label:color.name,
  classification_kind:color.kind,classification_status:'confirmada',
  confidence:'indefinida',segment_index:1,segment_total:1,
  note_suggestion:classification()?.suggestNote?.({text:selected.text,kind:color.kind})?.text||''
 };
 const record=recordOf(seg,form,note);
 record.detail='escolha_manual';record.classification_status='confirmada';
 if(existingOverlap([record])){
  alertMessage('Esta posição já tem um grifo. Abra o original para corrigir.');return;
 }
 const saved=api()?.addTextHighlight?.(record);
 if(!saved||saved.duplicate){alertMessage('Grifo duplicado ou erro ao gravar.');return}
 if(form.topic)saveTopicIndex([saved],[form]);
 closePanel(true);status('Grifo manual salvo: '+color.name+'.');
 window.BancoMestreGrifosV062?.reload?.();window.BancoMestreV064PainelGrifos?.refresh?.();
};
function toggle(){
 if(!state||!source)return;
 const active=sameContext();
 overlay.hidden=!active;root.classList.toggle('bm089-precise',active);
 if(active){overlay.style.pointerEvents=pane.hidden?'':'none';
  if(!selected&&!start)status('Selecione o texto: toque na primeira e última palavra, ou arraste com o mouse.')}
 else{closePanel(true);abortGesture()}
}
window.addEventListener('bm-pdf-tool-change',toggle);
window.addEventListener('bm-pdf-render-start',()=>{
 clear();root.classList.remove('bm089-precise');status('Carregando as posições das palavras...');
});
window.addEventListener('bm-pdf-active-page-rendered',async e=>{
 const detail=e.detail||{},t=++token;
 try{
  const page=await api()?.getCurrentPdfPage?.();
  if(!page||t!==token)return;
  const viewport=page.getViewport({scale:detail.viewportScale});
  const content=await page.getTextContent({normalizeWhitespace:false});
  if(t!==token||!api()?.editing||api().currentPage!==detail.page||
    api().currentId!==detail.documentId||api().sourceHash!==detail.sourceHash)return;
  const result=engine.buildWords(content,viewport,window.pdfjsLib?.Util,document.createElement('canvas'));
  cols=engine.detectColumns(result,viewport.width,viewport.height);
  const reading=engine.readingOrder(result,cols);
  source={page:detail.page,documentId:detail.documentId,sourceHash:detail.sourceHash,
   width:viewport.width,height:viewport.height};
  readyWords=result;ordered=reading;state={detail};start=null;end=null;selected=null;
  // O modo principal desta versão é selecionar texto; sem salvar nada automaticamente.
  // Respeitar outras ferramentas se o usuário já as escolheu.
  const docKey=detail.documentId+':'+detail.sourceHash;
  if(reading.length&&api()?.currentTool==='marker'&&autoActivatedDoc!==docKey){
   autoActivatedDoc=docKey;api()?.selectTextMode?.();
  }
  if(!reading.length){status('Esta página não oferece palavras com posições seguras. Use grifo livre ou outro PDF com texto.');overlay.hidden=true;return}
  if(!cols.length||cols.length===2&&result.length>500)status('Seleção por palavras pronta. Se a página tiver várias colunas, selecione um trecho de cada vez.');
  else status('Seleção por palavras pronta em '+(cols.length-1)+' coluna(s).');
  toggle();
 }catch(err){if(t===token){status('Falha ao localizar palavras nesta página: '+String(err.message||err));overlay.hidden=true}}
});
root.addEventListener('close',()=>{clear();root.classList.remove('bm089-precise')});
window.BancoMestrePreciseSelectV089=Object.freeze({ready:true,openExisting,get draftCount(){return 0},get words(){return ordered.length},get columns(){return Math.max(0,cols.length-1)},
  get selectedText(){return selected?.text||''},get hasPanel(){return !pane.hidden}});
})();