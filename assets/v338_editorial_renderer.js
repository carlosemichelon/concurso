/* Petrobras 26 · V338. Camada editorial de 18 cartões.
 * Preserva V336, onze módulos anteriores, frentes/versos literais, links e SRS.
 * V333: resposta-modelo em prosa; histórico e módulos num acordeão fechado.
 */
(function(){
'use strict';
if(window.BM338Editorial)return;
const previousRenderer=window.BM198Format;
const previousLayers=window.BM276LayerData;
if(!previousRenderer?.render||!previousLayers?.get)throw Error('V338: leitor base ou módulos indisponíveis');
const url='assets/petro26_study_sync_v338.json?v=337-1';
let packet=null,promise=null;
const target=new Set(['CARD-1548','CARD-1549','CARD-1550','CARD-1551','CARD-1552','CARD-1553','CARD-1554','CARD-1555','CARD-1556','CARD-1557','CARD-1558','CARD-0186','CARD-0567','CARD-1546','CARD-0949','CARD-0694','CARD-0751','CARD-0755']);
function load(){
if(!promise)promise=fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('V338: conteúdo indisponível');return r.json();}).then(x=>{
 if(x.format!=='BancoMestrePetro26StudySyncV338'||x.counts?.total!==18||x.new_cards?.length!==11||x.updates?.length!==7||Object.keys(x.profiles||{}).length!==18)
  throw Error('V338: inconsistência do conjunto didático');
 for(const [id,p] of Object.entries(x.profiles)){
  if(!target.has(id)||p.layers?.length!==11||p.layers.some((m,i)=>m.ord!==i+1||!m.titulo||!m.texto)||p.paragraphs?.length!==3)
   throw Error('V338: 11 módulos ou resposta insuficientes em '+id);
  for(const rel of p.related_card_ids||[]){
   if(target.has(rel)&&!x.profiles[rel]?.related_card_ids?.includes(id))
    throw Error('V338: vínculo não recíproco '+id+'/'+rel);
  }
 }
 packet=x;return x;
}).catch(e=>{promise=null;throw e;});
return promise;
}
const priorGet=previousLayers.get.bind(previousLayers);
window.BM276LayerData=Object.freeze({
 ...previousLayers,
 has:id=>target.has(id)||previousLayers.has?.(id)===true,
 async get(id){
  if(!target.has(id))return priorGet(id);
  const x=await load(),p=x.profiles[id];
  if(!p)throw Error('V338: cartão sem perfil '+id);
  const historic=(x.new_cards.some(c=>c.id===id))?null:await priorGet(id);
  return {id,layers:p.layers,prior_layers:historic?.layers||[],prior_technical_record:historic||null,updated:"2026-11-21"};
 }
});
const el=(tag,cls,text)=>{const a=document.createElement(tag);if(cls)a.className=cls;if(text!==undefined)a.textContent=String(text);return a;};
function emph(s){
 const out=el('p','bm330-para'),parts=String(s).split(/(\*\*[^*]+\*\*)/g);
 for(const p of parts){if(p.startsWith('**')&&p.endsWith('**'))out.append(el('strong','',p.slice(2,-2)));else if(p)out.append(document.createTextNode(p));}
 return out;
}
function table(d){
 const block=el('div','bm330-table-wrap bm338-reference-table'),t=el('table','bm330-table'),head=el('thead'),body=el('tbody'),hr=el('tr');
 for(const h of d.headers){const th=el('th','',h);th.scope='col';hr.append(th);}
 head.append(hr);t.append(head);
 for(const rr of d.rows){const tr=el('tr');rr.forEach((v,i)=>{const td=el(i===0?'th':'td','',v);if(i===0)td.scope='row';tr.append(td)});body.append(tr)}
 t.append(body);block.append(t);return block;
}
function mainFor(id,p){
 const root=el('article','bm330-learning bm336-learning bm338-learning');
 root.dataset.bm338Id=id;
 root.append(el('div','bm330-caption','RESPOSTA-MODELO · '+id),el('h3','',p.title));
 const essay=el('div','bm330-essay');p.paragraphs.forEach(v=>essay.append(emph(v)));root.append(essay);
 if(p.table){const group=el('div','bm330-information');group.append(el('h4','','Quadro técnico comparativo'),table(p.table));root.append(group);}
 if(p.formula)root.append(el('p','bm330-note','Grandezas e relações: '+p.formula));
 root.append(el('p','bm330-note','Origem: '+(p.related_question_ids||[]).join(', ')+' · '+p.source));
 return root;
}
function historyFor(id,p,record){
 const fold=el('details','bm330-evolution bm332-evolution bm338-evolution'),sum=el('summary','bm332-evolution-summary');
 sum.append(el('span','','Resposta evolutiva integral'),el('small','','11 módulos, versões anteriores e fontes preservadas'));
 fold.append(sum);
 const inside=el('div','bm332-evolution-inside');
 const original=window.BM338Originals?.[id];
 if(original){
  const lit=el('details','bm332-inner-accordion');lit.append(el('summary','','Frente, verso e explicação anteriores · V337'));
  lit.append(el('p','', 'Frente original: '+original.front),el('p','', 'Verso original: '+original.back));
  if(original.expl)lit.append(el('p','', 'Explicação anterior: '+original.expl));
  if(original.mnemonic)lit.append(el('p','', 'Macete anterior: '+original.mnemonic));
  if(original.reference)lit.append(el('p','', 'Referência anterior: '+original.reference));
  inside.append(lit);
 }
 const old=record.prior_layers||[];
 if(old.length===11){
  const prev=el('details','bm332-inner-accordion');prev.append(el('summary','','11 módulos da versão anterior · preservados'));
  const list=el('div','bm338-old-modules');
  for(const m of old){list.append(el('h4','',m.titulo),el('p','',m.texto));}
  prev.append(list);inside.append(prev);
 }
 const current=el('details','bm332-inner-accordion');current.append(el('summary','','11 módulos didáticos atualizados'));
 const list=el('div','bm338-new-modules');
 for(const m of p.layers){list.append(el('h4','',m.titulo),el('p','',m.texto));}
 current.append(list);inside.append(current);
 const notes=el('details','bm332-inner-accordion');notes.append(el('summary','','Macete, fontes e pegadinhas'));
 notes.append(el('p','',p.mnemonic),el('p','',p.trap),el('p','',p.source));
 inside.append(notes);
 fold.append(inside);return fold;
}
function render(host,record,id){
 if(!target.has(id))return previousRenderer.render(host,record,id);
 if(record?.layers?.length!==11)throw Error('V338: módulo ausente '+id);
 if(!packet){
  host.replaceChildren(el('p','bm336-loading','Carregando conteúdo atualizado…'));
  load().then(()=>{if(host.isConnected&&(!host.closest('#bmCardPeekV050')||window.BancoMestreVisualizarCardV050?.currentId===id))render(host,record,id)})
   .catch(e=>{if(host.isConnected)host.replaceChildren(el('p','bm336-error',e.message));});
  return {loading:true,modules:11,srsChanged:false};
 }
 const p=packet.profiles[id];if(!p)throw Error('V338: perfil não localizado '+id);
 const main=mainFor(id,p),hist=historyFor(id,p,record);
 const pane=host.closest('.bm197-evolutive'),modal=host.closest('#bmCardPeekV050');
 if(modal&&pane&&window.BancoMestreVisualizarCardV050?.currentId===id){
  pane.before(main);host.replaceChildren(hist);pane.classList.add('bm330-evolution-pane','bm332-evolution-pane','bm338-evolution-pane');
 }else host.replaceChildren(main,hist);
 return {modules:11,paragraphs:p.paragraphs.length,presentation:'V338/V333',srsChanged:false};
}
window.BM198Format=Object.freeze({...previousRenderer,render,version:'V338-PETRO26'});
window.BM338Editorial=Object.freeze({ids:Object.freeze([...target]),load,srs_changed:false,private_srs_changed:false});
load().catch(e=>console.warn('V338: dados editoriais',e));
})();