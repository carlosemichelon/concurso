/* V072 — Biblioteca rastreia porque cada grifo recebeu cor sugerida. */
/* V070: Biblioteca com sugestões de cor, assunto e nota não confirmadas. */
/* V069: atualização imediata após persistência de grifos. */
/* Banco Mestre V068 (biblioteca evolutiva) — biblioteca de grifos; base e SRS preservados. */
(function BancoMestreGrifosV062(){
'use strict';
const $=id=>document.getElementById(id);
const PREFIX='BM030_STROKES_PDF:',META_KEY='BM062_GRIFOS_META';
if($('grifos')||!document.querySelector('header nav')||!document.querySelector('main footer'))return;
const nav=document.querySelector('header nav');
const btn=document.createElement('button');btn.type='button';btn.dataset.page='grifos';btn.textContent='Grifos';btn.title='Biblioteca local de grifos e backup';nav.append(btn);
const view=document.createElement('section');view.id='grifos';
view.innerHTML=`
<div class="panel bm062-panel">
 <div class="bm062-top"><div><h2>Biblioteca de Grifos</h2><p class="intro">Consulte as marcações deste navegador. Grifos V061 e grifos antigos são preservados, sem migração automática.</p></div>
 <div class="bm062-topbuttons"><button type="button" id="bm062Refresh">↻ Atualizar</button><button type="button" id="bm062Backup" class="primary">⬇ Backup integral dos grifos</button></div></div>
 <div id="bm062Stats" class="bm062-stats" aria-live="polite"></div>
 <p class="notice">Os grifos estão salvos neste navegador. <b>Não há sincronização com Google Drive nesta etapa.</b> O backup inclui marcações e metadados, mas não contém PDFs, flashcards, SRS nem arquivos de IndexedDB.</p>
 <div class="bm062-filters" role="search" aria-label="Filtros da Biblioteca de Grifos">
 <input id="bm062Search" type="search" placeholder="Buscar palavras, notas, documento ou tags" aria-label="Pesquisar grifos">
 <select id="bm062Discipline" aria-label="Disciplina"><option value="">Todas as disciplinas</option></select>
 <select id="bm062Topic" aria-label="Assunto"><option value="">Todos os assuntos</option></select>
 <select id="bm062Document" aria-label="Documento"><option value="">Todos os PDFs</option></select>
 <select id="bm062Color" aria-label="Cor"><option value="">Todas as cores</option></select>
 <select id="bm062Kind" aria-label="Tipo"><option value="">Todos os tipos</option><option value="text">Texto selecionado</option><option value="legacy">Grifo visual anterior</option></select>
 <label class="bm062-check"><input id="bm062Favs" type="checkbox">Somente favoritos</label></div>
 <div class="bm062-export"><span id="bm062Count" aria-live="polite"></span>
 <button type="button" id="bm062Txt">Exportar TXT</button><button type="button" id="bm062Md">Exportar Markdown</button>
 <button type="button" id="bm062Json">Exportar JSON</button><button type="button" id="bm062Print">Relatório / PDF</button></div>
 <div id="bm062Results" class="bm062-results"></div><p><button id="bm062More" type="button" hidden>Mostrar mais</button></p>
 <p id="bm062Message" class="bm062-msg" role="status" aria-live="polite"></p></div>`;
document.querySelector('main footer').before(view);
let metadata={},all=[],filtered=[],limit=70,catalog=new Map(),badKeys=0;
const status=msg=>$('bm062Message').textContent=msg||'';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
function node(tag,text,cls){const x=document.createElement(tag);if(text!==null&&text!==undefined)x.textContent=String(text);if(cls)x.className=cls;return x}
function button(label,fn){const b=node('button',label);b.type='button';b.onclick=fn;return b}
function loadMeta(){try{const x=JSON.parse(localStorage.getItem(META_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return{}}}
function saveMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(metadata));return true}catch(e){status('Falha ao salvar informações locais: '+e.message);return false}}
function scan(){
 const rows=[];let bad=0;
 try{for(let n=0;n<localStorage.length;n++){
  const key=localStorage.key(n);if(!key||!key.startsWith(PREFIX))continue;
  const parts=/^BM030_STROKES_PDF:(.+):([^:]+):P(\d+)$/.exec(key);
  if(!parts){bad++;continue}
  let marks;try{marks=JSON.parse(localStorage.getItem(key)||'[]')}catch{bad++;continue}
  if(!Array.isArray(marks)){bad++;continue}
  marks.forEach((mark,index)=>{
   if(!mark||!['text_highlight','highlighter','rect'].includes(mark.type))return;
   const docId=String(mark.source_id||parts[1]),hash=String(mark.source_hash||parts[2]);
   const page=Number(parts[3]),kind=mark.type==='text_highlight'?'text':'legacy';
   const identity=kind==='text'&&mark.id?'TXT:'+docId+':'+hash+':'+mark.id:'LEGACY:'+key+':'+index;
   rows.push({key,docId,hash,page,kind,identity,mark,index});
  });
 }}catch(e){status('Leitura local incompleta: '+e.message)}
 badKeys=bad;
 return rows.sort((a,b)=>(Date.parse(b.mark.created_at||'')||0)-(Date.parse(a.mark.created_at||'')||0)||
 a.docId.localeCompare(b.docId)||a.page-b.page||a.index-b.index);
}
const title=e=>catalog.get(e.docId)?.title||e.docId;
const source=e=>catalog.get(e.docId);
function details(e){
 const d=metadata[e.identity]||{},suggest=e.mark.subject_suggestion||{};
 return {discipline:d.discipline||suggest.discipline||'',
   topic:d.topic||suggest.topic||'',subtopic:d.subtopic||suggest.subtopic||'',
   tags:d.tags||((e.mark.tags||[]).join(', ')),
   favorite:Object.hasOwn(d,'favorite')?!!d.favorite:!!e.mark.favorite,
   note:e.kind==='text'?(e.mark.note||''):(d.note||''),
   noteSuggestion:e.kind==='text'&&!e.mark.note?(e.mark.note_suggestion||''):'',
   subjectStatus:d.topic?'confirmado':suggest.topic?'sugestao':'indefinido',
   classificationStatus:e.kind==='text'?(e.mark.classification_status||'nao_classificado'):'',
   structured:e.kind==='text'?(e.mark.note_structured||{}):{}};
}
function setOptions(id,values,header){
 const ctl=$(id),before=ctl.value;ctl.replaceChildren(new Option(header,''));
 [...new Set(values.map(norm).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(x=>ctl.add(new Option(x,x)));
 ctl.value=[...ctl.options].some(o=>o.value===before)?before:'';
}
function refreshFilters(){
 setOptions('bm062Discipline',all.map(e=>details(e).discipline),'Todas as disciplinas');
 setOptions('bm062Topic',all.map(e=>details(e).topic),'Todos os assuntos');
 setOptions('bm062Document',all.map(e=>e.docId),'Todos os PDFs');
 setOptions('bm062Color',all.map(e=>e.mark.color||'#ffd400'),'Todas as cores');
 for(const o of $('bm062Document').options)if(o.value)o.textContent=title({docId:o.value})+' · '+o.value;
}
function getFiltered(){
 const q=fold($('bm062Search').value),di=$('bm062Discipline').value,to=$('bm062Topic').value,
  doc=$('bm062Document').value,co=$('bm062Color').value,kind=$('bm062Kind').value,
  fav=$('bm062Favs').checked;
 return all.filter(e=>{
  const d=details(e);
  if(di&&d.discipline!==di||to&&d.topic!==to||doc&&e.docId!==doc||
     co&&(e.mark.color||'#ffd400')!==co||kind&&e.kind!==kind||fav&&!d.favorite)return false;
  return !q||fold([e.mark.text,title(e),e.docId,e.page,d.note,d.tags,d.discipline,d.topic,
   e.mark.color_label,e.mark.style,e.mark.classification_kind,d.classificationStatus,d.subtopic,d.noteSuggestion,
   ...Object.values(d.structured),(e.mark.card_ids||[]).join(' ')].join(' ')).includes(q);
 });
}
function editNote(e,newNote){
 if(e.kind==='legacy'){metadata[e.identity]={...(metadata[e.identity]||{}),note:newNote};return saveMeta()}
 const api=window.BancoMestrePDFV042;
 if(api?.editing&&api.currentId===e.docId&&api.sourceHash===e.hash&&api.currentPage===e.page){
  return !!api.updateTextHighlight(e.mark.id,{note:newNote,classification_status:'confirmada'});
 }
 try{
  const list=JSON.parse(localStorage.getItem(e.key)||'[]');
  if(!Array.isArray(list))throw Error('Estrutura inválida');
  const i=list.findIndex(m=>m?.type==='text_highlight'&&m.id===e.mark.id);
  if(i<0)throw Error('ID do grifo não localizado');
  list[i]={...list[i],note:newNote,classification_status:'confirmada',updated_at:new Date().toISOString()};
  localStorage.setItem(e.key,JSON.stringify(list));return true;
 }catch(err){status('Nota não gravada: '+err.message);return false}
}
function makeEditor(e){
 const d=details(e),form=node('form',null,'bm062-form');
 for(const [key,label,value,textarea] of [
  ['discipline','Disciplina',d.discipline,false],['topic','Assunto',d.topic,false],
  ['subtopic','Subassunto',d.subtopic,false],['tags','Tags (separadas por vírgula)',d.tags,false],
  ['note',e.kind==='text'?'Nota vinculada ao grifo':'Observação local do grifo antigo',d.note||d.noteSuggestion,true]
 ]){
  const holder=node('label',label),field=document.createElement(textarea?'textarea':'input');
  field.name=key;field.value=value;
  if(textarea)field.rows=3;else field.maxLength=key==='tags'?600:140;
  holder.append(field);form.append(holder);
 }
 const acts=node('div',null,'bm062-formactions'),save=node('button','Salvar','primary');save.type='submit';acts.append(save);
 acts.append(button('Cancelar',()=>form.hidden=true));form.append(acts);form.hidden=true;
 form.onsubmit=ev=>{
  ev.preventDefault();
  const entry={...metadata[e.identity],
   discipline:norm(form.elements.discipline.value).slice(0,120),
   topic:norm(form.elements.topic.value).slice(0,140),
   subtopic:norm(form.elements.subtopic.value).slice(0,140),
   tags:norm(form.elements.tags.value).slice(0,600)};
  const before=metadata[e.identity];metadata[e.identity]=entry;
  if(!saveMeta()){if(before)metadata[e.identity]=before;else delete metadata[e.identity];return}
  const updated=String(form.elements.note.value).slice(0,12000);
  if((updated!==String(d.note||'')||e.kind==='text'&&e.mark.classification_status==='sugestao')&&!editNote(e,updated))return;
  status('Classificação e nota revisadas. PDF e flashcards originais não foram alterados.');
  load();
 };
 return form;
}
function item(e){
 const d=details(e),card=node('article',null,'bm062-item'),head=node('div',null,'bm062-rowhead');
 card.style.setProperty('--mark-color',/^#[a-f0-9]{6}$/i.test(e.mark.color||'')?e.mark.color:'#ffd400');
 head.append(node('span',e.kind==='text'?'Texto selecionado':'Grifo antigo · texto pendente','bm062-type'),
  node('strong',title(e),'bm062-origin'),node('span','Página '+e.page,'bm062-page'));
 card.append(head,node('p',e.kind==='text'?norm(e.mark.text)||'[Texto indisponível]':
  'Marcação visual preservada; o texto será identificado somente após migração assistida.','bm062-quote'));
 const line=[d.discipline,d.topic,d.subtopic,d.tags&&'Tags: '+d.tags].filter(Boolean).join(' • ');
 card.append(node('p',line||'Sem classificação','bm062-secondary'));
 if(e.kind==='text'){
   const style=e.mark.style||'highlight',styleNames={highlight:'Marca-texto',underline:'Sublinhado',
    'double-underline':'Duplo sublinhado',strike:'Tachado',conceal:'Oculto'};
   card.append(node('small', (styleNames[style]||style)+' · '+(e.mark.color_label||e.mark.color||''),'bm068-library-style'));
 }
 if(e.kind==='text'&&(e.mark.classification_status==='sugestao'||d.subjectStatus==='sugestao')){
  const needed=[e.mark.classification_status==='sugestao'?'cor':'',d.subjectStatus==='sugestao'?'assunto':''].filter(Boolean).join(' e ');
  card.append(node('small','◈ Revisão pendente: '+needed,'bm070-suggestion-label'));
  if(e.mark.classification_confidence){
   const reasons={referencia_normativa:'Referência normativa',expressao:'Expressão detectada',
     palavra:'Palavra-chave',numero:'Número',percentual:'Percentual',regra_local:'Contexto geral'};
   card.append(node('small',
    'Motivo: '+(reasons[e.mark.classification_basis]||'Regra local')+
    ' · confiança '+e.mark.classification_confidence,'bm072-context'));
  }
 }
 if(d.note)card.append(node('p','Nota confirmada: '+d.note,'bm062-note'));
 else if(d.noteSuggestion)card.append(node('p','Sugestão de nota (não confirmada): '+d.noteSuggestion,'bm062-note bm070-note-suggestion'));
 if(e.kind==='text'){
  const labels={explicacao:'Explicação',duvida:'Dúvida',correcao:'Correção',
   macete:'Macete',pegadinha:'Pegadinha',fundamento:'Fundamento normativo',fonte:'Fonte'};
  const fields=Object.entries(d.structured).filter(([k,v])=>labels[k]&&String(v||'').trim());
  for(const [k,value] of fields)card.append(node('p',labels[k]+': '+value,'bm062-note bm068-library-structured'));
  if((e.mark.history||[]).length)card.append(node('small','Histórico: '+e.mark.history.length+' alteração(ões)','bm068-library-history'));
 }
 card.append(node('p','Documento: '+e.docId+' · Hash '+e.hash+' · Página '+e.page,'bm062-source'));
 const actions=node('div',null,'bm062-itembuttons');
 actions.append(button('Abrir no PDF',()=>{
  if(!window.BancoMestreV062OpenPdf?.(e.docId,e.page,e.hash)){
   status('Este PDF não foi localizado no catálogo. Os dados de origem continuam no backup.');
  }else status('PDF aberto. Clique em Editar PDF para carregar a cópia local e navegar à página.');
 }));
 const original=source(e);
 if(original?.url){const a=node('a','Fonte original','bm062-inline');a.href=original.url;a.target='_blank';a.rel='noopener noreferrer';actions.append(a)}
 if(e.kind==='text')actions.append(button('Copiar texto',async()=>{
  try{await navigator.clipboard.writeText(e.mark.text||'');status('Texto copiado.')}catch{status('Cópia indisponível; selecione o texto exibido.')}
 }));
 actions.append(button(d.favorite?'★ Favorito':'☆ Favoritar',()=>{
  metadata[e.identity]={...(metadata[e.identity]||{}),favorite:!d.favorite};
  if(saveMeta())load();
 }));
 const form=makeEditor(e);
 actions.append(button('✎ Editar nota/classificação',()=>{form.hidden=!form.hidden;if(!form.hidden)form.querySelector('input')?.focus()}));
 card.append(actions,form);return card;
}
function render(){
 filtered=getFiltered();const out=$('bm062Results');out.replaceChildren();
 const count=all.filter(e=>e.kind==='text').length;
 $('bm062Stats').textContent=all.length+' grifos encontrados · '+count+' com texto · '+(all.length-count)+' visuais antigos'+
  (badKeys?' · '+badKeys+' registro(s) ilegíveis':'');
 $('bm062Count').textContent=filtered.length+' resultado(s)';
 if(!all.length)out.append(node('p','Nenhum grifo foi encontrado neste navegador. Abra um PDF no editor e grife um trecho para começar.','notice'));
 else if(!filtered.length)out.append(node('p','Nenhum grifo corresponde aos filtros.','muted'));
 else for(const e of filtered.slice(0,limit))out.append(item(e));
 $('bm062More').hidden=filtered.length<=limit;
}
function load(){metadata=loadMeta();all=scan();refreshFilters();render()}
let loaded=false;
async function open(){
 if(!loaded){
  loaded=true;
  try{const r=await fetch('assets/pdf_catalog_v062.json',{cache:'no-store'});
   if(!r.ok)throw Error('Indisponível');
   catalog=new Map((await r.json()).documents.map(d=>[String(d.id),d]));
  }catch{status('Catálogo não disponível; IDs de documentos continuarão visíveis.')}
 }
 limit=70;load();
}
btn.onclick=()=>{if(typeof window.section==='function')window.section('grifos');open()};
$('bm062Refresh').onclick=()=>{load();status('Grifos locais atualizados; nenhum registro alterado.')};
for(const id of ['bm062Search','bm062Discipline','bm062Topic','bm062Document','bm062Color','bm062Kind','bm062Favs'])
 $(id).addEventListener(id==='bm062Search'?'input':'change',()=>{limit=70;render()});
$('bm062More').onclick=()=>{limit+=70;render()};
const fname=(label,ext)=>'BancoMestre_'+label+'_'+new Date().toISOString().slice(0,10)+'.'+ext;
function download(content,name,mime){
 const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function row(e){
 const d=details(e);return {id:e.mark.id||null,source_key:e.key,source_index:e.index,
  document_id:e.docId,document_title:title(e),source_url:source(e)?.url||'',
  source_hash:e.hash,page:e.page,type:e.mark.type,text:e.kind==='text'?e.mark.text||'':null,
  color:e.mark.color||null,color_label:e.mark.color_label||null,
  style:e.mark.style||'highlight',rects:e.mark.rects||null,points:e.mark.points||null,
  anchor:e.mark.anchor||null,note:d.note,note_suggestion:d.noteSuggestion||e.mark.note_suggestion||null,
  note_structured:d.structured,discipline:d.discipline,topic:d.topic,subtopic:d.subtopic,
  subject_suggestion:e.mark.subject_suggestion||null,
  classification_kind:e.mark.classification_kind||null,
  classification_confidence:e.mark.classification_confidence||null,
  classification_basis:e.mark.classification_basis||null,
  classification_status:e.mark.classification_status||null,
  subject_status:d.subjectStatus||null,
  tags:d.tags,favorite:d.favorite,
  card_ids:e.mark.card_ids||[],created_at:e.mark.created_at||null,updated_at:e.mark.updated_at||null,
  history:e.mark.history||[],
  status:e.kind==='text'?'texto_selecionado':'pendente_migracao'};
}
const rows=()=>filtered.map(row);
$('bm062Json').onclick=()=>{
 download(JSON.stringify({format:'BancoMestreBibliotecaGrifosV062',exported_at:new Date().toISOString(),
  count:filtered.length,entries:rows()},null,2),fname('Grifos_Selecionados','json'),'application/json;charset=utf-8');
 status('JSON filtrado exportado.');
};
$('bm062Txt').onclick=()=>{
 const out=rows().map((e,i)=>[(i+1)+'. '+e.document_title+' — Página '+e.page,
  e.text||'[Grifo visual sem texto associado]',[e.discipline,e.topic,e.tags].filter(Boolean).join(' / '),
  e.note&&'Nota: '+e.note,
  !e.note&&e.note_suggestion&&'Nota SUGERIDA (não confirmada): '+e.note_suggestion,
  ...Object.entries(e.note_structured||{}).filter(([,v])=>v).map(([k,v])=>k+': '+v),
  'ID: '+(e.id||'legado')+' · Hash: '+e.source_hash,
  e.source_url&&'Fonte: '+e.source_url].filter(Boolean).join('\n')).join('\n\n---\n\n');
 download(out,fname('Grifos_Selecionados','txt'),'text/plain;charset=utf-8');status('TXT filtrado exportado.');
};
$('bm062Md').onclick=()=>{
 const out='# Grifos do Banco Mestre\n\n'+rows().map((e,i)=>[
  '## '+(i+1)+'. '+e.document_title+' — Página '+e.page,
  '> '+(e.text||'[Grifo visual sem texto associado]').replace(/\n/g,'\n> '),
  [e.discipline,e.topic,e.tags].filter(Boolean).join(' / '),
  e.note&&'**Nota:** '+e.note,
   !e.note&&e.note_suggestion&&'**Nota sugerida (não confirmada):** '+e.note_suggestion,
   ...Object.entries(e.note_structured||{}).filter(([,v])=>v).map(([k,v])=>'**'+k+':** '+v),
   '**Estilo:** '+e.style,'**ID:** '+(e.id||'legado'),e.source_url&&'**Fonte:** '+e.source_url
 ].filter(Boolean).join('\n\n')).join('\n\n---\n\n');
 download(out,fname('Grifos_Selecionados','md'),'text/markdown;charset=utf-8');status('Markdown filtrado exportado.');
};
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('bm062Print').onclick=()=>{
 const p=window.open('','_blank');if(!p){status('Janela bloqueada. Habilite a impressão pelo navegador.');return}
 const body=rows().map((e,i)=>'<article><h2>'+escape((i+1)+'. '+e.document_title)+'</h2>'+
  '<small>Página '+e.page+' · '+escape([e.discipline,e.topic,e.tags].filter(Boolean).join(' / '))+'</small>'+
  '<p>'+escape(e.text||'[Grifo visual sem texto associado]')+'</p>'+
  (e.note?'<p><b>Nota:</b> '+escape(e.note)+'</p>':'')+
  (!e.note&&e.note_suggestion?'<p><b>Nota sugerida (não confirmada):</b> '+escape(e.note_suggestion)+'</p>':'')+
  Object.entries(e.note_structured||{}).filter(([,v])=>v).map(([k,v])=>'<p><b>'+escape(k)+':</b> '+escape(v)+'</p>').join('')+
  '<small>ID: '+escape(e.id||'legado')+' · Hash: '+escape(e.source_hash)+'</small></article>').join('');
 p.document.open();p.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de Grifos</title><style>body{font:12pt/1.5 Arial;margin:2cm;color:#111}h1{font-size:20pt}h2{font-size:13pt}article{border-bottom:1px solid #aaa;padding:12px 0;break-inside:avoid}p{white-space:pre-wrap}small{font-size:9pt;color:#555}</style></head><body><h1>Biblioteca de Grifos — Banco Mestre</h1><p>'+filtered.length+' registros · Use Imprimir → Salvar como PDF</p>'+body+'</body></html>');
 p.document.close();p.focus();p.print();status('Relatório aberto. Selecione “Salvar como PDF”.');
};
$('bm062Backup').onclick=()=>{
 const originals=[];
 try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);
  if(key?.startsWith(PREFIX))originals.push({key,value:localStorage.getItem(key)})}}
 catch(e){status('Falha na leitura do backup: '+e.message);return}
 const data={format:'BancoMestreBackupGrifosV062',created_at:new Date().toISOString(),
  origin:location.origin,scope:'somente_annotacoes_pdf_localStorage_e_metadados',
  contains_pdf_files:false,contains_indexeddb:false,contains_srs:false,
  annotation_keys:originals.sort((a,b)=>a.key.localeCompare(b.key)),
  metadata_key:META_KEY,metadata_raw:localStorage.getItem(META_KEY)};
 download(JSON.stringify(data,null,2),fname('BACKUP_Integral_Grifos','json'),'application/json;charset=utf-8');
 status('Backup solicitado: '+originals.length+' registro(s) de página/documento. Verifique o arquivo salvo. Não inclui PDFs nem IndexedDB.');
};
window.addEventListener('hashchange',()=>{if(location.hash==='#grifos')open()});
window.addEventListener('bm-pdf-active-page-rendered',e=>{
 const wanted=window.BM062PendingGo;
 if(!wanted||e.detail?.documentId!==wanted.docId)return;
 window.BM062PendingGo=null;
 if(e.detail.sourceHash!==wanted.hash){
  status('Versão diferente do grifo: não houve reposicionamento automático.');return;
 }
 if(Number.isInteger(wanted.page)&&wanted.page!==e.detail.page){
  setTimeout(()=>{window.BancoMestrePDFV042?.goToPage(wanted.page)},0);
 }
});
if(location.hash==='#grifos'){window.section?.('grifos');open()}
window.addEventListener('bm-pdf-storage-changed',()=>{
  if(document.getElementById('grifos')?.classList.contains('active'))load();
 });
 window.BancoMestreGrifosV062={reload:load,get count(){return all.length}};
})();
