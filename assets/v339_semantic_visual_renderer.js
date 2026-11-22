/* V339 — grifos semânticos v014 e figuras funcionais vinculadas aos 18 cartões V338.
 * Não altera SRS, versos históricos, grifos PDF, arquivos de imagens originais ou Atlas.
 * Imagens somente após revelar resposta; negrito seletivo exclusivamente em erros reais. */
(function(){
'use strict';
if(window.BM339Visual)return;
const previous=window.BM198Format;
const v338=window.BM338Editorial;
if(!previous?.render||!v338?.load)throw Error('V339: leitor V338 indisponível');
const url='assets/v339_visual_methodology.json?v=339-1';
let overlay=null,wait=null;
const ids=new Set(v338.ids);
const el=(tag,cls,t)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(t!==undefined)n.textContent=String(t);return n;};
function load(){
 if(!wait)wait=Promise.all([
  fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('V339: destaques indisponíveis');return r.json();}),
  v338.load()
 ]).then(([x])=>{
  if(x.format!=='BMVisualMethodologyV339'||Object.keys(x.cards||{}).length!==18)
   throw Error('V339: índice visual incompleto');
  for(const [id,p] of Object.entries(x.cards)){
   if(!ids.has(id)||!Array.isArray(p.marks)||!p.marks.length||
     p.marks.some(m=>!['core','agent','condition','exception'].includes(m.kind)||!m.text?.trim())||
     !p.visual?.src?.startsWith('assets/card_visuals_v339/')||
     p.visual?.role!=='IMAGEM_DO_CARTAO_VERSO')
    throw Error('V339: grifos/imagem incompletos em '+id);
  }
  overlay=x;return x;
 }).catch(e=>{wait=null;throw e;});
 return wait;
}
function applyMarks(p,marks){
 // Substitui a ênfase genérica por anotações semânticas na versão renderizada,
 // nunca no texto original armazenado.
 const raw=p.textContent||'';
 const lower=raw.toLocaleLowerCase('pt-BR');
 const proposed=[];
 for(const mark of marks){
  let pos=lower.indexOf(mark.text.toLocaleLowerCase('pt-BR'));
  if(pos>=0)proposed.push({...mark,start:pos,end:pos+mark.text.length});
 }
 proposed.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
 const chosen=[];for(const m of proposed){
  if(chosen.some(x=>m.start<x.end&&m.end>x.start))continue;
  chosen.push(m);
 }
 if(!chosen.length)return 0;
 const frag=document.createDocumentFragment();
 let pos=0;
 for(const mark of chosen){
  if(mark.start>pos)frag.append(document.createTextNode(raw.slice(pos,mark.start)));
  const node=el('mark','bm339-highlight bm339-'+mark.kind);
  node.dataset.category=mark.kind;
  node.title=overlay.semantics?.[mark.kind]?.label||mark.kind;
  if(mark.bold){node.append(el('strong','bm339-error',raw.slice(mark.start,mark.end)));}
  else node.textContent=raw.slice(mark.start,mark.end);
  frag.append(node);pos=mark.end;
 }
 if(pos<raw.length)frag.append(document.createTextNode(raw.slice(pos)));
 p.replaceChildren(frag);
 return chosen.length;
}
function addVisual(root,c){
 const media=c.visual;
 const figure=el('figure','bm339-figure');
 figure.dataset.mediaId=media.id;figure.dataset.mediaRole=media.role;
 figure.dataset.original='false';
 const link=el('a','bm339-figure-link');
 link.href=media.src;link.target='_blank';link.rel='noopener noreferrer';
 link.title='Abrir esquema em tamanho original';
 const img=el('img','bm339-image');
 img.src=media.src;img.alt=media.alt||media.caption;img.loading='lazy';img.decoding='async';
 link.append(img);figure.append(link);
 const cap=el('figcaption','bm339-caption');
 cap.append(el('span','',media.caption+' '));
 cap.append(el('span','bm339-caption-source','Esquema didático derivado; original da questão não substituído.'));
 figure.append(cap);
 const paras=root.querySelectorAll('.bm330-essay > p.bm330-para');
 if(paras.length>=2)paras[1].after(figure);
 else (root.querySelector('.bm330-essay')||root).append(figure);
}
function addTechnical(root,c){
 const hasMath=Array.isArray(c.formulas)&&c.formulas.length>0;
 const hasTable=!!c.table;
 if(!hasMath&&!hasTable)return;
 const group=el('section','bm339-technical');
 group.setAttribute('aria-label','Relações quantitativas e quadros técnicos do cartão');
 if(hasMath){
  const section=el('div','bm339-math-section');
  section.append(el('h4','','Fórmulas e grandezas'));
  for(const item of c.formulas){
   const block=el('div','bm339-math-item');
   block.append(el('span','bm339-math-title',item.caption));
   // Fragmento MathML versionado e auditado, nunca texto livre da questão.
   const display=el('div','bm339-math');
   display.innerHTML=item.mathml;block.append(display);
   section.append(block);
  }
  group.append(section);
 }
 if(hasTable){
  const t=c.table;
  const section=el('div','bm339-table-section');
  section.append(el('h4','',t.title));
  const wrap=el('div','bm339-table-scroll'),table=el('table','bm339-table'),thead=el('thead'),tr=el('tr');
  for(const h of t.headers){const th=el('th','',h);th.scope='col';tr.append(th)}
  thead.append(tr);table.append(thead);
  const tb=el('tbody');
  for(const row of t.rows){
   const rr=el('tr');
   row.forEach((val,i)=>{const cell=el(i===0?'th':'td','',val);if(i===0)cell.scope='row';rr.append(cell)});
   tb.append(rr);
  }
  table.append(tb);wrap.append(table);section.append(wrap);
  if(t.note)section.append(el('p','bm339-table-note',t.note));
  group.append(section);
 }
 const legend=root.querySelector('.bm339-legend');
 if(legend)legend.before(group);
 else (root.querySelector('.bm330-essay')||root).after(group);
}
function addLegend(root,c){
 if(!c.marks.length)return;
 const details=el('details','bm339-legend');
 details.append(el('summary','', 'Legenda dos grifos semânticos'));
 const body=el('div','bm339-legend-content');
 for(const kind of ['core','agent','condition','exception']){
  if(!c.marks.some(m=>m.kind===kind))continue;
  const mark=el('mark','bm339-highlight bm339-'+kind,overlay.semantics[kind].label);
  body.append(mark);
 }
 if(c.marks.some(m=>m.bold))body.append(el('small','bm339-error-legend','Negrito: valor ou palavra que causou erro real na questão.'));
 details.append(body);
 const essay=root.querySelector('.bm330-essay');
 if(essay)essay.after(details);else root.append(details);
}
function locate(host,id){
 const pane=host.closest('.bm197-evolutive'),modal=host.closest('#bmCardPeekV050');
 if(modal&&pane){
  const siblings=[...pane.parentElement?.children||[]];
  return siblings.reverse().find(n=>n.dataset?.bm338Id===id)||null;
 }
 return host.querySelector('[data-bm338-id="'+id+'"]');
}
function render(host,record,id){
 if(!ids.has(id))return previous.render(host,record,id);
 if(!overlay){
  host.replaceChildren(el('p','bm336-loading','Preparando grifos e esquemas do cartão…'));
  load().then(()=>{
   if(host.isConnected&&(!host.closest('#bmCardPeekV050')||window.BancoMestreVisualizarCardV050?.currentId===id))
     render(host,record,id);
  }).catch(e=>{if(host.isConnected)host.replaceChildren(el('p','bm336-error',e.message));});
  return {loading:true,modules:11,srsChanged:false};
 }
 const pane=host.closest('.bm197-evolutive'),modal=host.closest('#bmCardPeekV050');
 if(modal&&pane)for(const n of [...pane.parentElement.children]){
  if(n.matches?.('.bm338-learning')&&n!==pane)n.remove();
 }
 const result=previous.render(host,record,id);
 if(result?.loading)return result;
 const root=locate(host,id);
 if(!root)throw Error('V339: resposta visual não localizada em '+id);
 if(root.dataset.bm339Visual==='true')return result;
 const c=overlay.cards[id];root.classList.add('bm339-learning');root.dataset.bm339Visual='true';
 let selected=0;
 for(const p of root.querySelectorAll('.bm330-essay > p.bm330-para'))
  selected+=applyMarks(p,c.marks);
 if(!selected)throw Error('V339: nenhum grifo aplicado em '+id);
 addVisual(root,c);addLegend(root,c);addTechnical(root,c);
 // Acessibilidade e rastreabilidade: o vínculo de imagem pertence ao cartão.
 root.dataset.bm339MediaId=c.visual.id;
 return {...result,presentation:'V339/V333',semantic_marks:selected,visual_assets:1,srsChanged:false};
}
window.BM198Format=Object.freeze({...previous,render,version:'V339-METODOLOGIA'});
window.BM339Visual=Object.freeze({ids:Object.freeze([...ids]),load,semantic_palette:Object.freeze({core:'#FDE68A',agent:'#BBF7D0',condition:'#BAE6FD',exception:'#FECDD3'}),image_type:'DIAGRAMA_DIDATICO_DERIVADO',srs_changed:false,private_srs_changed:false});
load().catch(e=>console.warn('V339: pacote visual',e));
})();