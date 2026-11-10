/* V084 experimental — Janela inteligente para seleção e grifos, sem chave API. */
(function(){
'use strict';
const dlg=document.getElementById('pdfDialog'),tools=document.getElementById('pdfLocalTools');
const E=window.BancoMestreSelectionEngineV084,api=()=>window.BancoMestrePDFV042;
if(!dlg||!tools||!E||window.BancoMestreSelectionWindowV084)return;
const config=window.BancoMestreClaudeConfigV084||{};
const trigger=document.createElement('button');trigger.id='bm084Launch';trigger.type='button';
trigger.textContent='✦ Janela inteligente';tools.append(trigger);
const panel=document.createElement('section');panel.id='bm084Window';panel.hidden=true;
panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Janela inteligente de seleção de texto');
panel.innerHTML=[
"<header><strong>✦ Janela inteligente</strong><button id='bm084X' aria-label='Fechar'>×</button></header>",
"<p>Selecione um artigo no PDF. Nesta janela, selecione palavras inteiras e escolha uma cor. Confira antes de gravar.</p>",
"<small id='bm084Origin'>Aguardando texto do PDF</small>",
"<pre id='bm084Text' tabindex='0' aria-label='Texto selecionável'>Selecione no PDF para começar.</pre>",
"<div id='bm084Chosen' role='status'>Nenhuma seleção interna.</div>",
"<div id='bm084Colors' class='bm084-colors'></div>",
"<nav class='bm084-actions'><button id='bm084Pick'>Selecionar no PDF</button><button id='bm084Local'>Sugestões locais</button><button id='bm084AI'>Analisar com Claude</button><button id='bm084Clear'>Limpar</button></nav>",
"<h3>Trechos para revisar <span id='bm084Count'>0</span></h3>",
"<div id='bm084List' class='bm084-list'></div>",
"<p id='bm084Status' role='status' aria-live='polite'>Nenhum grifo foi alterado.</p>",
"<footer><button id='bm084Cancel'>Cancelar</button><button id='bm084Apply' disabled>Aplicar seleção aprovada</button></footer>"
].join('');
dlg.append(panel);
const $=id=>panel.querySelector('#'+id),palette=E.COLORS;
let armed=false,selection=null,items=[],inner=null,ticket=0,abort=null;
const say=x=>{$('bm084Status').textContent=String(x)};
const matches=()=>!!(selection&&api()?.editing&&api().currentPage===selection.page&&api().currentId===selection.documentId&&api().sourceHash===selection.sourceHash);
function draw(){
 const list=$('bm084List');list.replaceChildren();
 $('bm084Count').textContent=String(items.length);
 $('bm084Apply').disabled=!matches()||!items.some(p=>p.enabled);
 if(!items.length){const p=document.createElement('p');p.textContent='Selecione palavras no quadro ou peça sugestões locais.';list.append(p)}
 for(const item of [...items].sort((a,b)=>a.start-b.start)){
  const row=document.createElement('div');row.className='bm084-row';
  const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=!!item.enabled;
  enabled.setAttribute('aria-label','Usar trecho '+item.text.slice(0,75));enabled.onchange=()=>{item.enabled=enabled.checked;draw()};
  const mid=document.createElement('div');mid.className='bm084-main';
  const quote=document.createElement('div');quote.className='bm084-quote';quote.textContent=item.text;
  const color=document.createElement('select');color.setAttribute('aria-label','Categoria');
  for(const [kind,info] of Object.entries(palette)){
   const opt=document.createElement('option');opt.value=kind;opt.textContent=info.label;color.append(opt)}
  color.value=item.kind;
  color.onchange=()=>{const updated=E.create(selection,item.start,item.end,color.value,item.reason,'manual');
   if(updated.error){say(updated.error);return}Object.assign(item,updated);draw()};
  const why=document.createElement('small');why.textContent=item.reason||'Trecho selecionado';
  mid.append(quote,color,why);
  const remove=document.createElement('button');remove.textContent='Excluir';remove.onclick=()=>{items=items.filter(p=>p!==item);draw()};
  row.append(enabled,mid,remove);list.append(row);
 }
}
function reset(){
 ticket++;abort?.abort();abort=null;selection=null;items=[];inner=null;
 $('bm084Text').textContent='Selecione no PDF para começar.';
 $('bm084Origin').textContent='Aguardando texto do PDF';
 $('bm084Chosen').textContent='Nenhuma seleção interna.';draw()
}
function close(){armed=false;panel.hidden=true;trigger.setAttribute('aria-pressed','false');reset()}
function arm(){armed=true;panel.hidden=false;trigger.setAttribute('aria-pressed','true');api()?.selectTextMode?.();
 say('Arraste sobre o artigo na página do PDF. O conteúdo aparecerá nesta janela.')}
function capture(raw){
 if(!armed)return false;
 ticket++;abort?.abort();abort=null;
 const words=Array.isArray(raw?.positionedWords)?raw.positionedWords:[];
 selection={text:String(raw?.text||''),page:raw?.page,documentId:raw?.documentId,sourceHash:raw?.sourceHash,
  positionedWords:words.map(w=>({text:w.text,start:w.start,end:w.end,rects:Array.isArray(w.rects)?w.rects.map(r=>r.slice()):[]}))};
 panel.hidden=false;inner=null;items=[];$('bm084Text').textContent=selection.text;
 $('bm084Origin').textContent='Página '+selection.page+' · '+selection.text.length+' caracteres';
 $('bm084Chosen').textContent='Selecione aqui palavras inteiras para destacar.';
 if(E.validSource(selection)){
  const suggestions=E.fromLocal(selection);
  if(suggestions.ok)items=suggestions.segments.map(p=>({...p,enabled:true}));
  say(items.length+' sugestões locais. Pode mudar as cores, excluir e adicionar trechos.');
 }else say('Geometria insegura: selecione novamente o trecho no PDF. Não será possível gravar aqui.');
 draw();return true;
}
function storeSelection(){
 const s=window.getSelection(),node=$('bm084Text').firstChild;
 if(!selection||!s||s.isCollapsed||s.rangeCount!==1||node?.nodeType!==Node.TEXT_NODE)return;
 const r=s.getRangeAt(0);
 if(r.startContainer!==node||r.endContainer!==node||r.endOffset<=r.startOffset)return;
 inner={start:r.startOffset,end:r.endOffset};
 $('bm084Chosen').textContent='Selecionado: '+selection.text.slice(inner.start,inner.end).trim().slice(0,160);
}
$('bm084Text').addEventListener('mouseup',storeSelection);
$('bm084Text').addEventListener('keyup',storeSelection);
$('bm084Text').addEventListener('touchend',()=>setTimeout(storeSelection,170));
for(const [kind,info] of Object.entries(palette)){
 const b=document.createElement('button');b.textContent=info.label;b.type='button';
 b.className='bm084-swatch';b.style.setProperty('--swatch',info.color);
 b.onclick=()=>{
  if(!inner||!matches()){say('Selecione primeiro um trecho no texto desta janela.');return}
  const p=E.create(selection,inner.start,inner.end,kind,'Seleção manual','manual');
  if(p.error){say(p.error);return}
  if(!E.verify(selection,[...items,p]).ok){say('Há sobreposição; exclua o trecho conflitante.');return}
  items.push({...p,enabled:true});inner=null;window.getSelection()?.removeAllRanges();
  $('bm084Chosen').textContent='Trecho adicionado; selecione outro.';draw();
  say('Prévia atualizada. Nenhuma anotação foi gravada ainda.');
 };
 $('bm084Colors').append(b);
}
trigger.onclick=()=>panel.hidden?arm():close();
$('bm084X').onclick=close;$('bm084Cancel').onclick=close;$('bm084Pick').onclick=arm;
$('bm084Clear').onclick=()=>{items=[];draw();say('Prévia limpa. PDF preservado.')};
$('bm084Local').onclick=()=>{
 if(!matches()){say('Selecione texto válido no PDF.');return}
 const result=E.fromLocal(selection);if(!result.ok){say(result.error);return}
 items=result.segments.map(p=>({...p,enabled:true}));draw();
 say('Sugestões locais atualizadas; revise antes de gravar.');
};
const ready=typeof config.endpoint==='string'&&/^https:\/\/[^/]+\/.+/i.test(config.endpoint);
$('bm084AI').disabled=!ready;
if(!ready){$('bm084AI').textContent='Claude: servidor pendente';$('bm084AI').title='A chave API fica em um servidor privado, nunca no navegador.'}
$('bm084AI').onclick=async()=>{
 if(!ready||!matches()||abort)return;
 const n=++ticket;abort=new AbortController();const task=abort;
 $('bm084AI').disabled=true;say('Enviando somente o texto selecionado à IA...');
 try{
  const response=await fetch(config.endpoint,{method:'POST',credentials:'include',
   headers:{'Content-Type':'application/json'},body:JSON.stringify({text:selection.text}),signal:task.signal});
  if(!response.ok)throw Error('Serviço privado não autorizado/disponível (HTTP '+response.status+').');
  const data=await response.json();
  if(n!==ticket||!matches())return;
  const out=E.fromAI(selection,data);
  if(!out.ok){say(out.error);return}
  items=out.segments.map(p=>({...p,enabled:true}));draw();
  say('Claude sugeriu '+items.length+' trecho(s). Revise antes de gravar.');
 }catch(e){if(!task.signal.aborted)say(String(e.message||e).slice(0,180))}
 finally{if(abort===task)abort=null;$('bm084AI').disabled=!ready}
};
$('bm084Apply').onclick=()=>{
 if(!matches()){say('Documento mudou. Refaça a seleção.');return}
 const chosen=items.filter(p=>p.enabled),result=E.records(selection,chosen);
 if(!result.ok||!chosen.length){say(result.error||'Selecione pelo menos um trecho.');return}
 if(window.BancoMestreMulticorV081?.intersectsExisting?.(chosen,api()?.currentMarks)){
  say('Existe grifo anterior sobreposto. Nada foi alterado.');return}
 const saved=api()?.addTextHighlights?.(result.records);
 if(!saved){say('Não foi possível salvar; o grupo foi revertido.');return}
 const count=saved.marks?.length||0,page=selection.page;
 close();window.dispatchEvent(new CustomEvent('bm084-applied',{detail:{count,page}}));
};
window.addEventListener('bm-pdf-render-start',close);
dlg.addEventListener('close',close);
window.BancoMestreSelectionWindowV084=Object.freeze({capture,arm,close,get armed(){return armed}});
trigger.setAttribute('aria-pressed','false');
})();