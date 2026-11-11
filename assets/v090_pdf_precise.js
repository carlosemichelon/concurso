/* Banco Mestre V090 — selection by PDF coordinates (not native DOM text selection).
 * Click start/end or drag within ONE column; review color/topic then explicitly save.
 */
(function(){
'use strict';
if(window.BancoMestrePreciseSelectV089)return;
const root=document.getElementById('pdfDialog'),wrap=document.getElementById('pdfPageWrap'),
 tools=document.getElementById('pdfLocalTools'),api=()=>window.BancoMestrePDFV042,
 engine=window.BancoMestrePreciseCoreV089;
if(!root||!wrap||!tools||!engine)return;
const COLORS=Object.freeze([
 {kind:'proibicao',color:'#FF8F96',name:'Proibições'},
 {kind:'obrigacao',color:'#86DCAA',name:'Obrigações'},
 {kind:'prazo_numero',color:'#FFEA70',name:'Prazos e números'},
 {kind:'excecao',color:'#89C7FF',name:'Exceções'},
 {kind:'banca',color:'#CCA7FF',name:'Palavras-chave'},
 {kind:'destaque',color:'#FFB86B',name:'Conteúdo central'}
]);
const overlay=document.createElement('div');overlay.id='bm089WordPointer';overlay.hidden=true;
overlay.setAttribute('aria-label','Seletor de palavras por posição. Clique na primeira e na última palavra ou arraste com o mouse.');
const marks=document.createElement('div');marks.id='bm089RectPreview';marks.setAttribute('aria-hidden','true');
overlay.append(marks);wrap.append(overlay);
const pane=document.createElement('section');pane.id='bm089Editor';pane.hidden=true;
pane.setAttribute('role','dialog');pane.setAttribute('aria-label','Grifo de texto — confirmar');
pane.innerHTML=[
 '<div class="bm089-head"><strong>Grifar texto selecionado</strong><button type="button" id="bm089Close" aria-label="Cancelar seleção">×</button></div>',
 '<div class="bm089-excerpt" id="bm089Excerpt" aria-label="Trecho detectado no PDF"></div>',
 '<small class="bm089-tip" id="bm089Coordinates">Seleção conforme as posições originais no PDF.</small>',
 '<div class="bm089-label">1 · Escolha a cor</div><div class="bm089-colors" id="bm089Colors"></div>',
 '<div class="bm089-label">2 · Assunto do grifo</div>',
 '<label class="bm089-field">Assunto *<input type="text" id="bm089Topic" maxlength="140" required autocomplete="off" placeholder="Ex.: Fundamentos da República"></label>',
 '<details class="bm089-extra"><summary>Disciplina e subassunto (opcionais)</summary>',
 '<label class="bm089-field">Disciplina<input id="bm089Discipline" type="text" maxlength="120" placeholder="Ex.: Direito Constitucional"></label>',
 '<label class="bm089-field">Subassunto<input id="bm089Subtopic" type="text" maxlength="140" placeholder="Ex.: Soberania"></label>',
 '</details>',
 '<label class="bm089-field">Nota (opcional)<textarea id="bm090Note" rows="2" maxlength="12000" placeholder="Macete ou observação de revisão"></textarea></label>',
 '<p class="bm089-alert" id="bm089PanelStatus" role="status" aria-live="polite"></p>',
 '<section class="bm090-drafts" id="bm090DraftSection" hidden><strong id="bm090DraftCount"></strong><div id="bm090DraftList"></div></section>',
 '<div class="bm089-footer"><button type="button" id="bm089Retry">Cancelar</button><button type="button" id="bm089Save">Salvar grifo</button>',
 '<button type="button" id="bm090AddDraft">Adicionar à fila de cores</button>',
 '<button type="button" id="bm090SaveDrafts" disabled>Salvar fila (0)</button>',
 '<button type="button" id="bm090Discard" hidden>Descartar fila</button>',
 '<button type="button" id="bm090Delete" hidden>Excluir grifo</button></div>'
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
if(selectBtn){selectBtn.textContent='Selecionar texto';selectBtn.title='Seleção precisa por palavras e colunas, sem seleção nativa nem IA automática.'}
root.classList.add('bm089-simplified');
let state=null,readyWords=[],cols=[],ordered=[],start=null,end=null,down=null,
 selected=null,color=null,token=0,source=null,lastClickAt=0,autoActivatedDoc=null,editingId=null,drafts=[];
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
 $('bm089Topic').value='';$('bm089Discipline').value='';$('bm089Subtopic').value='';$('bm090Note').value='';
 $('bm090Delete').hidden=true;$('bm090AddDraft').hidden=false;$('bm089Save').hidden=false;$('bm089Save').textContent='Salvar grifo';
 color=null;for(const b of $('bm089Colors').children)b.setAttribute('aria-pressed','false');
 alertMessage('Escolha cor e assunto; nada foi salvo ainda.');
 addPreview(result.words);$('bm089Topic').focus({preventScroll:true});
}
function closePanel(resetAll=true){
 pane.hidden=true;
 if(resetAll){selected=null;editingId=null;start=null;end=null;down=null;resetPreview();}
 overlay.style.pointerEvents='';
 if(sameContext())status('Clique na primeira e na última palavra da próxima seleção ou arraste com o mouse.');
}
function abortGesture(){down=null;start=null;end=null;resetPreview()}
function clear(){
 token++;overlay.hidden=true;overlay.replaceChildren(marks);pane.hidden=true;
 state=null;readyWords=[];cols=[];ordered=[];source=null;selected=null;editingId=null;start=null;end=null;down=null;drafts=[];renderDrafts();
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
   status('Grifo existente aberto na mesma janela.');return;
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
 b.setAttribute('aria-label',entry.name);b.setAttribute('aria-pressed','false');b.dataset.kind=entry.kind;
 b.onclick=()=>{
  color=entry;
  for(const other of $('bm089Colors').children)other.setAttribute('aria-pressed',String(other===b));
  alertMessage('Cor escolhida: '+entry.name+'. Preencha o assunto e salve.');
 };
 $('bm089Colors').append(b);
}

function openExisting(id){
 if(!sameContext())return false;
 const mark=api()?.currentMarks?.find(m=>m.type==='text_highlight'&&m.id===id);
 if(!mark)return false;
 selected=null;editingId=id;start=null;end=null;down=null;
 pane.hidden=false;overlay.style.pointerEvents='none';
 $('bm089Excerpt').textContent=mark.text||'Grifo existente';
 $('bm089Coordinates').textContent='Editar grifo existente · ID e cartões preservados';
 $('bm089Topic').value=mark.subject_suggestion?.topic||'';
 $('bm089Discipline').value=mark.subject_suggestion?.discipline||'';
 $('bm089Subtopic').value=mark.subject_suggestion?.subtopic||'';
 $('bm090Note').value=mark.note||'';
 color=COLORS.find(x=>x.color.toLowerCase()===String(mark.color||'').toLowerCase())||null;
 for(const btn of $('bm089Colors').children)btn.setAttribute('aria-pressed',String(btn.dataset.kind===color?.kind));
 $('bm089Save').hidden=false;$('bm089Save').textContent='Atualizar grifo';$('bm090Delete').hidden=false;$('bm090AddDraft').hidden=true;
 const b=mark.rects.map(r=>({x0:r[0]*source.width,y0:r[1]*source.height,
  x1:r[2]*source.width,y1:r[3]*source.height}));addPreview(b);
 alertMessage('Edite os campos e confirme: o grifo mantém o mesmo ID.');
 return true;
}
$('bm090Delete').onclick=()=>{
 if(!editingId||!sameContext())return;
 if(!confirm('Excluir este grifo? Você poderá usar Desfazer.'))return;
 if(!api()?.removeTextHighlight?.(editingId)){alertMessage('Falha ao excluir.');return}
 closePanel(true);status('Grifo excluído. Use Desfazer para recuperar.');
 window.BancoMestreGrifosV062?.reload?.();
 window.BancoMestreV064PainelGrifos?.refresh?.();
};

function recordsOverlap(a,b){
 return window.BancoMestreMulticorV081?.intersectsExisting?.(
 [{rects:a.rects}],[{type:'text_highlight',rects:b.rects}])===true;
}
function clashSaved(record){
 return window.BancoMestreMulticorV081?.intersectsExisting?.(
 [record],api()?.currentMarks)===true;
}
function buildManualRecord(){
 if(!sameContext()||!selected||!color)return null;
 const subject={discipline:$('bm089Discipline').value.trim().slice(0,120),
 topic:$('bm089Topic').value.trim().slice(0,140),
 subtopic:$('bm089Subtopic').value.trim().slice(0,140),basis:'escolha_manual'};
 if(!subject.topic)return null;
 return {text:selected.text,rects:selected.rects,anchor:selected.anchor,
 page:source.page,documentId:source.documentId,sourceHash:source.sourceHash,
 color:color.color,color_label:color.name,style:'highlight',
 classification_kind:color.kind,classification_status:'confirmada',
 subject_suggestion:subject,confidence:'indefinida',detail:'escolha_manual',
 segment_index:null,segment_total:1,note_suggestion:'',note:$('bm090Note').value.trim().slice(0,12000)};
}
function renderDrafts(){
 const section=$('bm090DraftSection');section.hidden=!drafts.length;
 $('bm090DraftCount').textContent=drafts.length+' trecho(s) aguardando confirmação';
 const list=$('bm090DraftList');list.replaceChildren();
 for(let i=0;i<drafts.length;i++){
  const d=drafts[i],row=document.createElement('div');row.className='bm090-draft-row';
  const label=document.createElement('span');label.textContent=d.color_label+' · '+d.subject_suggestion.topic+' · '+d.text.slice(0,65);
  label.style.borderLeft='8px solid '+d.color;
  const del=document.createElement('button');del.type='button';del.textContent='Retirar';
  del.setAttribute('aria-label','Retirar da fila o trecho '+(i+1));
  del.onclick=()=>{drafts.splice(i,1);renderDrafts()};
  row.append(label,del);list.append(row);
 }
 $('bm090SaveDrafts').disabled=!drafts.length;
 $('bm090SaveDrafts').textContent='Salvar fila ('+drafts.length+')';
 $('bm090Discard').hidden=!drafts.length;
}
$('bm090AddDraft').onclick=()=>{
 if(editingId)return;
 const record=buildManualRecord();
 if(!record){alertMessage('Escolha cor e assunto antes de adicionar à fila.');return}
 if(drafts.length>=24){alertMessage('Fila cheia: salve até 24 trechos.');return}
 if(clashSaved(record)||drafts.some(d=>recordsOverlap(d,record))){
  alertMessage('O trecho sobrepõe um grifo salvo ou outro item da fila.');return;
 }
 drafts.push(record);renderDrafts();closePanel(true);
 status('Trecho '+drafts.length+' na fila, ainda não salvo. Selecione outro e escolha outra cor.');
};
$('bm090SaveDrafts').onclick=()=>{
 if(!sameContext()||!drafts.length)return;
 if(drafts.some((d,i)=>clashSaved(d)||drafts.slice(0,i).some(x=>recordsOverlap(x,d)))){
  status('Fila com sobreposição. Retire o trecho conflitante.');return}
 const records=drafts.map((d,i)=>({...d,segment_index:i+1,segment_total:drafts.length}));
 const result=api()?.addTextHighlights?.(records);
 if(!result||result.duplicates?.length||result.marks?.length!==records.length){
  status('Não foi possível salvar a fila. Nenhum lote foi confirmado.');return;
 }
 for(let i=0;i<result.marks.length;i++){
  try{
   const meta=readMeta(),key='TXT:'+source.documentId+':'+source.sourceHash+':'+result.marks[i].id;
   meta[key]={...(meta[key]||{}),...records[i].subject_suggestion};
   localStorage.setItem(META,JSON.stringify(meta))
  }catch{}
 }
 const saved=drafts.length;drafts=[];renderDrafts();closePanel(true);
 status(saved+' grifos de cores selecionadas salvos juntos. Um único Desfazer desfaz o lote.');
 window.BancoMestreGrifosV062?.reload?.();window.BancoMestreV064PainelGrifos?.refresh?.();
};
$('bm090Discard').onclick=()=>{
 if(!drafts.length||!confirm('Descartar todos os trechos ainda não salvos?'))return;
 drafts=[];renderDrafts();status('Fila descartada. Grifos antigos preservados.');
};
renderDrafts();

const META='BM062_GRIFOS_META';
function openDrafts(){
 if(!sameContext()||!drafts.length)return false;
 selected=null;editingId=null;pane.hidden=false;overlay.style.pointerEvents='none';
 $('bm089Excerpt').textContent='Fila de grifos de diferentes cores';
 $('bm089Coordinates').textContent='Confira a lista e clique em Salvar fila. Nada foi salvo até aqui.';
 $('bm089Save').hidden=true;$('bm090AddDraft').hidden=true;$('bm090Delete').hidden=true;
 renderDrafts();alertMessage('Fila pronta para confirmar todos os grifos em uma única operação.');
 return true;
}
function readMeta(){try{const m=JSON.parse(localStorage.getItem(META)||'{}');return m&&typeof m==='object'&&!Array.isArray(m)?m:{}}catch{return {}}}
$('bm089Save').onclick=()=>{
 if(!sameContext()){alertMessage('Documento ou página mudou. Selecione novamente.');return}
 if(!color){alertMessage('Escolha uma das seis cores.');return}
 const subject={discipline:$('bm089Discipline').value.trim().slice(0,120),
 topic:$('bm089Topic').value.trim().slice(0,140),
 subtopic:$('bm089Subtopic').value.trim().slice(0,140),basis:'escolha_manual'};
 if(!subject.topic){alertMessage('Informe o assunto para classificar o grifo.');$('bm089Topic').focus();return}
 const note=$('bm090Note').value.trim().slice(0,12000);
 let saved,existing=false;
 if(editingId){
  const original=api()?.currentMarks?.find(m=>m.id===editingId);
  if(!original){alertMessage('Grifo original não encontrado.');return}
  const patch={color:color.color,color_label:color.name,classification_kind:color.kind,
   classification_status:'confirmada',subject_suggestion:subject,note};
  if(!api()?.updateTextHighlight?.(original.id,patch)){
   alertMessage('Não foi possível editar; o grifo original foi mantido.');return}
  saved=api()?.currentMarks?.find(m=>m.id===original.id);existing=true;
 }else{
  if(!selected){alertMessage('Selecione um trecho antes de salvar.');return}
  if(window.BancoMestreMulticorV081?.intersectsExisting?.([{rects:selected.rects}],api()?.currentMarks)){
   alertMessage('Existe grifo nesta região. Abra-o para editar; não sobreponha.');return}
  const record={text:selected.text,rects:selected.rects,anchor:selected.anchor,
    page:source.page,documentId:source.documentId,sourceHash:source.sourceHash,
    color:color.color,color_label:color.name,style:'highlight',
    classification_kind:color.kind,classification_status:'confirmada',
    subject_suggestion:subject,confidence:'indefinida',detail:'escolha_manual',
    segment_index:null,segment_total:1,note_suggestion:'',
    note:$('bm090Note').value.trim().slice(0,12000)};
  saved=api()?.addTextHighlight?.(record);
  if(!saved||saved.duplicate){alertMessage('Grifo duplicado ou falha no salvamento.');return}
  // A nota é salva junto com o registro no núcleo PDF V090.
 }
 if(!saved){alertMessage('Falha ao salvar o registro.');return}
 const key='TXT:'+source.documentId+':'+source.sourceHash+':'+saved.id;
 let indexed=true;
 try{const metadata=readMeta();metadata[key]={...(metadata[key]||{}),...subject};
 localStorage.setItem(META,JSON.stringify(metadata))}catch{indexed=false}
 closePanel(true);
 status((existing?'Grifo atualizado no mesmo ID':'Grifo salvo')+' · '+color.name+' · '+subject.topic+
   (indexed?'':' (assunto preservado no próprio registro).'));
 window.BancoMestreGrifosV062?.reload?.();
 window.BancoMestreV064PainelGrifos?.refresh?.();
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
window.BancoMestrePreciseSelectV089=Object.freeze({ready:true,openExisting,openDrafts,get draftCount(){return drafts.length},get words(){return ordered.length},get columns(){return Math.max(0,cols.length-1)},
  get selectedText(){return selected?.text||''},get hasPanel(){return !pane.hidden}});
})();