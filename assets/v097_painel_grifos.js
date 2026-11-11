/* V097 — grupos no painel, sem modificar cores, IDs nem grifos existentes. */
/* V070: painel exibe nota/assunto propostos como revisão pendente. */
/* V069: atualização imediata após persistência de grifos. */
/* V068 — painel de grifos avançado do documento no leitor PDF. */
(function BancoMestreV064PainelGrifos(){
 'use strict';
 const $=id=>document.getElementById(id);
 const dialog=$('pdfDialog'),content=dialog?.querySelector('.bm-v046-pdf-content'),
  mode=$('pdfLocalMode'),tools=$('pdfLocalTools'),api=window.BancoMestrePDFV042;
 if(!dialog||!content||!mode||!tools||!api||$('bm064HighlightPanel'))return;
 const META='BM062_GRIFOS_META';
 const grouping=()=>window.BancoMestreHighlightGroupsV097;
 const reader=document.createElement('div');reader.id='bm064Reader';reader.className='bm064-reader';
 mode.replaceWith(reader);reader.append(mode);
 const grip=document.createElement('div');grip.id='bm064PanelGrip';grip.className='bm064-grip';
 grip.setAttribute('role','separator');grip.setAttribute('aria-label','Redimensionar painel de grifos');
 grip.setAttribute('aria-orientation','vertical');grip.tabIndex=0;
 const panel=document.createElement('aside');panel.id='bm064HighlightPanel';panel.className='bm064-highlight-panel';
 panel.setAttribute('aria-label','Grifos e anotações deste PDF');
 panel.innerHTML='<div class="bm064-head"><strong>Grifos deste PDF</strong><button id="bm064Close" type="button" title="Recolher painel">×</button></div>'+
 '<p id="bm064PanelCaption" class="bm064-caption" aria-live="polite">Abra um PDF local para consultar marcações.</p>'+
 '<div class="bm064-panel-controls"><input id="bm064Search" type="search" placeholder="Pesquisar texto, nota, página" aria-label="Pesquisar grifos neste PDF"><button id="bm064Refresh" type="button" title="Recarregar grifos">↻</button></div>'+
 '<div id="bm064PanelList" class="bm064-list"></div>'+
 '<small class="bm064-footer">Grifos antigos não são convertidos automaticamente em texto.</small>';
 reader.append(grip,panel);
 const toggle=document.createElement('button');toggle.id='bm064TogglePanel';toggle.type='button';
 toggle.textContent='☰ Grifos do PDF';toggle.title='Mostrar ou recolher a lista de grifos do documento';
 toggle.setAttribute('aria-controls','bm064HighlightPanel');toggle.setAttribute('aria-expanded','false');
 tools.prepend(toggle);
 let open=false,rows=[],lastKey='',lastId='',onAction=false,refreshPending=false;
 const safe=s=>String(s??'');
 const norm=s=>safe(s).replace(/\s+/g,' ').trim();
 const formatText=x=>norm(x).slice(0,450);
 function getMeta(){
  try{return JSON.parse(localStorage.getItem(META)||'{}')||{}}catch{return{}}
 }
 function saveMeta(meta){
  try{localStorage.setItem(META,JSON.stringify(meta));return true}
  catch(e){$('bm064PanelCaption').textContent='Não foi possível salvar a nota: '+e.message;return false}
 }
 function identity(e){
  if(e.mark.type==='text_highlight'&&e.mark.id)
   return 'TXT:'+e.docId+':'+e.hash+':'+e.mark.id;
  return 'LEGACY:'+e.key+':'+e.index;
 }
 const isText=m=>m?.type==='text_highlight';
 const getNote=(e,meta)=>{
  const d=meta[identity(e)]||{};
  return isText(e.mark)?safe(e.mark.note||''):safe(d.note||'');
 };
 function scan(){
  if(!api.editing||!api.currentId||!api.sourceHash)return [];
  const docId=String(api.currentId),hash=String(api.sourceHash),prefix='BM030_STROKES_PDF:'+docId+':'+hash+':P';
  const result=[];
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key||!key.startsWith(prefix))continue;
   const n=key.slice(prefix.length);
   if(!/^[1-9]\d*$/.test(n))continue;
   let arr;try{arr=JSON.parse(localStorage.getItem(key)||'[]')}catch{continue}
   if(!Array.isArray(arr))continue;
   arr.forEach((mark,index)=>{
    if(!['text_highlight','highlighter','rect'].includes(mark?.type))return;
    result.push({docId,hash,key,page:Number(n),index,mark});
   });
  }
  return result.sort((a,b)=>a.page-b.page||a.index-b.index);
 }
 function position(e){
  const m=e.mark;
  if(isText(m)&&Array.isArray(m.rects)&&m.rects[0])return Math.max(0,Math.min(1,(m.rects[0][1]+m.rects[0][3])/2));
  if(m.type==='rect'&&Array.isArray(m.box))return Math.max(0,Math.min(1,(m.box[1]+m.box[3])/2));
  if(Array.isArray(m.points)&&m.points[0])return Math.max(0,Math.min(1,m.points[0][1]));
  return .12;
 }
 function centerMark(e){
  const pane=mode,wrap=$('pdfPageWrap');
  if(!wrap||!pane)return;
  const paneRect=pane.getBoundingClientRect(),wrapRect=wrap.getBoundingClientRect();
  const top=pane.scrollTop+wrapRect.top-paneRect.top+position(e)*wrapRect.height;
  pane.scrollTo({top:Math.max(0,top-pane.clientHeight*.4),behavior:'smooth'});
 }
 async function navigate(e){
  if(!api.editing||api.currentId!==e.docId||api.sourceHash!==e.hash)return;
  try{
   await api.goToPage(e.page);
   requestAnimationFrame(()=>centerMark(e));
  }catch(err){$('bm064PanelCaption').textContent='Erro ao abrir a página: '+err.message}
 }
 function updateNote(e){
  const meta=getMeta(),before=getNote(e,meta);
  const typed=prompt(isText(e.mark)?'Nota vinculada ao trecho selecionado:':'Observação deste grifo visual:',before);
  if(typed===null)return;
  const text=typed.slice(0,12000);
  if(isText(e.mark)){
   if(api.currentId!==e.docId||api.sourceHash!==e.hash)return;
   if(api.currentPage===e.page){
    if(!api.updateTextHighlight(e.mark.id,{note:text})){
     $('bm064PanelCaption').textContent='Nota não salva. Reabra a página e tente novamente.';return;
    }
   }else{
    try{
     const marks=JSON.parse(localStorage.getItem(e.key)||'[]');
     const i=marks.findIndex(m=>m?.id===e.mark.id&&m.type==='text_highlight');
     if(i<0)throw Error('Grifo não encontrado');
     marks[i]={...marks[i],note:text,updated_at:new Date().toISOString()};
     localStorage.setItem(e.key,JSON.stringify(marks));
    }catch(err){$('bm064PanelCaption').textContent='Nota não salva: '+err.message;return}
   }
  }else{
   const id=identity(e);meta[id]={...(meta[id]||{}),note:text};if(!saveMeta(meta))return;
  }
  refresh();
 }
 function markNode(e,meta){
  const row=document.createElement('article');row.className='bm064-mark';
  if(e.page===api.currentPage)row.classList.add('bm064-mark-active-page');
  const color=/^#[0-9a-f]{6}$/i.test(e.mark.color||'')?e.mark.color:'#ffd400';
  row.style.setProperty('--bm064-mark-color',color);
  const header=document.createElement('div');header.className='bm064-mark-head';
  const location=document.createElement('span');location.textContent='Pág. '+e.page+' · '+(isText(e.mark)?'Texto':'Grifo livre');
  const edit=document.createElement('button');edit.type='button';edit.textContent='✎ Nota';
  edit.title='Adicionar ou editar a nota deste grifo';
  edit.addEventListener('click',async()=>{
   if(isText(e.mark)&&window.BancoMestreGrifadorV068){
    await navigate(e);
    window.BancoMestreGrifadorV068.openNotes(e.mark.id);
   }else updateNote(e);
  });
  header.append(location,edit);
  const preview=document.createElement('button');preview.type='button';preview.className='bm064-preview';
  preview.textContent=isText(e.mark)?formatText(e.mark.text)||'[Trecho sem texto]':'Marcação visual — texto ainda não identificado';
  preview.title='Ir ao grifo na página '+e.page;preview.addEventListener('click',()=>navigate(e));
  const note=getNote(e,meta);row.append(header,preview);
  if(note){const n=document.createElement('p');n.className='bm064-note';n.textContent='Nota: '+note;row.append(n)}
  if(isText(e.mark)&&e.mark.classification_status==='sugestao'){
   const noteBox=document.createElement('p');noteBox.className='bm064-note bm070-panel-suggestion';
   const info=e.mark.subject_suggestion||{};
   noteBox.textContent='◈ SUGESTÃO NÃO CONFIRMADA — '+(e.mark.color_label||'Sem categoria')+
    (info.topic?' · '+info.topic:'')+
    (info.subtopic?' / '+info.subtopic:'');
   row.append(noteBox);
   if(!note&&e.mark.note_suggestion){
    const text=document.createElement('p');text.className='bm064-note bm070-panel-suggestion';
    text.textContent='Nota proposta: '+e.mark.note_suggestion;row.append(text);
   }
  }
  if(isText(e.mark)&&e.mark.note_structured){
   const labels={explicacao:'Explicação',duvida:'Dúvida',correcao:'Correção',macete:'Macete',pegadinha:'Pegadinha',fundamento:'Fundamento',fonte:'Fonte'};
   for(const [k,val] of Object.entries(e.mark.note_structured)){
    if(!labels[k]||!String(val||'').trim())continue;
    const n=document.createElement('p');n.className='bm064-note';n.textContent=labels[k]+': '+val;row.append(n);
   }
  }
  if(isText(e.mark)&&(e.mark.tags||[]).length){
   const tag=document.createElement('small');tag.textContent='Tags: '+e.mark.tags.join(', ');row.append(tag);
  }
  const cards=Array.isArray(e.mark.card_ids)?e.mark.card_ids.filter(Boolean):[];
  if(cards.length){const c=document.createElement('small');c.textContent='Cartões: '+cards.join(', ');row.append(c)}
  return row;
 }
 // Um parágrafo com várias cores aparece como um único item, mas mantém
 // os registros e comandos próprios de cada trecho nos detalhes.
 function groupedNode(group,meta){
  const parts=group.parts||[],first=parts[0];
  if(!first)return document.createElement('div');
  if(parts.length===1)return markNode(first,meta);
  const article=document.createElement('article');
  article.className='bm064-mark bm097-paragraph';
  if(first.page===api.currentPage)article.classList.add('bm064-mark-active-page');
  const header=document.createElement('div');header.className='bm064-mark-head';
  const name=document.createElement('span');name.textContent='Pág. '+first.page+' · Parágrafo multicolorido';
  const count=document.createElement('small');count.textContent=parts.length+' trechos';
  header.append(name,count);
  const preview=document.createElement('button');preview.className='bm064-preview';preview.type='button';
  preview.textContent=formatText(grouping()?.paragraphText(group)||parts.map(e=>e.mark.text||'').join(' '));
  preview.title='Ir ao parágrafo na página '+first.page;
  preview.addEventListener('click',()=>navigate(first));
  const colors=document.createElement('div');colors.className='bm097-colors';
  colors.setAttribute('aria-label','Cores utilizadas neste parágrafo');
  const unique=new Map();
  for(const e of parts){
   const c=/^#[0-9a-f]{6}$/i.test(e.mark?.color||'')?e.mark.color:'#ffd400';
   if(!unique.has(c.toLowerCase()))unique.set(c.toLowerCase(),e.mark.color_label||'Cor do grifo');
  }
  for(const [color,label] of unique){
   const swatch=document.createElement('span');swatch.className='bm097-color';
   swatch.style.setProperty('--bm097-color',color);
   swatch.title=label;swatch.textContent=label;colors.append(swatch);
  }
  const details=document.createElement('details');details.className='bm097-details';
  const summary=document.createElement('summary');
  summary.textContent='Ver ou editar os '+parts.length+' trechos coloridos';
  details.append(summary);
  for(const e of parts)details.append(markNode(e,meta));
  article.append(header,preview,colors,details);
  return article;
 }
 function render(){
  const list=$('bm064PanelList'),caption=$('bm064PanelCaption');
  list.replaceChildren();
  const query=norm($('bm064Search').value).toLowerCase(),meta=getMeta();
  const displayed=grouping()?.groupRows(rows)||rows.map(e=>({parts:[e]}));
  const selected=displayed.filter(group=>!query||norm([
   group.parts[0]?.page,grouping()?.paragraphText(group),
   ...group.parts.flatMap(e=>[
    e.mark.text,getNote(e,meta),e.mark.type,e.mark.note_suggestion,
    e.mark.color_label,e.mark.subject_suggestion?.topic,e.mark.subject_suggestion?.subtopic,
    (e.mark.card_ids||[]).join(' ')
   ])
  ].join(' ')).toLowerCase().includes(query));
  const total=displayed.length;
  caption.textContent=total+' seleção(ões)/grifo(s) neste PDF · '+
   rows.length+' trecho(s) armazenado(s) · '+selected.length+' visíveis · página '+(api.currentPage||'—');
  if(!selected.length){
   const p=document.createElement('p');p.className='bm064-empty';
   p.textContent=total?'Nenhum grifo corresponde à busca.':'Nenhum grifo salvo nesta cópia do PDF.';
   list.append(p);return;
  }
  let previousPage=-1;
  for(const group of selected.slice(0,600)){
   const e=group.parts[0];if(!e)continue;
   if(e.page!==previousPage){
    previousPage=e.page;const title=document.createElement('h4');title.textContent='Página '+e.page;
    list.append(title);
   }
   list.append(groupedNode(group,meta));
  }
  if(selected.length>600){
   const extra=document.createElement('p');
   extra.textContent='Mostrando as primeiras 600 seleções; refine a busca.';
   list.append(extra);
  }
 }
 function refresh(){
  try{
   if(!api.editing){rows=[];lastKey='';$('bm064PanelList').replaceChildren();$('bm064PanelCaption').textContent='Abra um PDF editável para consultar grifos.';return}
   const current=String(api.currentId)+'|'+String(api.sourceHash);
   if(lastKey!==current){lastKey=current;$('bm064Search').value=''}
   rows=scan();render();
  }catch(e){$('bm064PanelCaption').textContent='Falha ao consultar grifos: '+e.message}
 }
 function setOpen(next){
  open=!!next;
  reader.classList.toggle('bm064-show-grifos',open);
  toggle.setAttribute('aria-expanded',String(open));
  panel.setAttribute('aria-hidden',String(!open));
  grip.setAttribute('aria-hidden',String(!open));
  toggle.textContent=open?'☰ Ocultar grifos':'☰ Grifos do PDF';
  if(open)refresh();
 }
 toggle.addEventListener('click',()=>setOpen(!open));
 $('bm064Close').addEventListener('click',()=>setOpen(false));
 $('bm064Refresh').addEventListener('click',refresh);
 $('bm064Search').addEventListener('input',render);
 let resizing=null;
 grip.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  resizing={x:e.clientX,width:panel.getBoundingClientRect().width};
  grip.setPointerCapture(e.pointerId);e.preventDefault();
 });
 grip.addEventListener('pointermove',e=>{
  if(!resizing||!grip.hasPointerCapture(e.pointerId))return;
  const maximum=Math.min(620,Math.max(245,reader.getBoundingClientRect().width-200));
  const width=Math.round(Math.max(245,Math.min(maximum,resizing.width+resizing.x-e.clientX)));
  reader.style.setProperty('--bm064-panel-width',width+'px');
 });
 grip.addEventListener('pointerup',e=>{
  if(!resizing)return;
  resizing=null;
  if(grip.hasPointerCapture(e.pointerId))grip.releasePointerCapture(e.pointerId);
 });
 grip.addEventListener('pointercancel',()=>{resizing=null});
 grip.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();
  const current=panel.getBoundingClientRect().width;
  const width=Math.max(245,Math.min(620,current+(e.key==='ArrowLeft'?15:-15)));
  reader.style.setProperty('--bm064-panel-width',Math.round(width)+'px');
 });
 window.addEventListener('bm-pdf-active-page-rendered',()=>{if(open)refresh()});
 window.addEventListener('bm-pdf-mark-changed',()=>{if(open)refresh()});
 window.addEventListener('bm-pdf-storage-changed',()=>{if(open)refresh()});
 const observer=new MutationObserver(()=>{
  if(mode.classList.contains('active')){if(open)refresh();}
  else $('bm064PanelCaption').textContent='Abra um PDF editável para consultar grifos.';
 });
 observer.observe(mode,{attributes:true,attributeFilter:['class']});
 const previousAdd=api.addTextHighlight.bind(api),previousUpdate=api.updateTextHighlight.bind(api),
  previousRemove=api.removeTextHighlight.bind(api);
 api.addTextHighlight=function(...args){const value=previousAdd(...args);if(value&&open)refresh();return value};
 api.updateTextHighlight=function(...args){const value=previousUpdate(...args);if(value&&open)refresh();return value};
 api.removeTextHighlight=function(...args){const value=previousRemove(...args);if(value&&open)refresh();return value};
 // Grifos livres são salvos na camada legada. Atualizar após o pointerup e comandos de desfazer.
 const ink=$('pdfInkCanvas');
 ink?.addEventListener('pointerup',()=>{if(open)setTimeout(refresh,30)});
 for(const id of ['pdfUndo','pdfRedo','pdfClearPage','pdfEraser']){
  $(id)?.addEventListener('click',()=>{if(open)setTimeout(refresh,30)});
 }
 window.addEventListener('storage',e=>{
  if(open&&(e.key?.startsWith('BM030_STROKES_PDF:')||e.key===META))refresh();
 });
 dialog.addEventListener('close',()=>{lastKey='';rows=[];setOpen(false)});
 setOpen(false);
 window.BancoMestreV064PainelGrifos={refresh,open:()=>setOpen(true),close:()=>setOpen(false)};
})();
