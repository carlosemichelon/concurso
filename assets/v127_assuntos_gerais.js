/* Navegacao geral: camada visual sobre os grupos canônicos V024.
   Nao altera cards, sub, group, IDs, fontes, historico ou SRS. */
(function(){
'use strict';
if(window.BM127General)return;
const $=id=>document.getElementById(id);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const CATS=[
 {id:'estruturas',label:'Estruturas',area:'Engenharia Civil',groups:['ENG_ESTRUTURAS_VIGAS','ENG_ESTRUTURAS_TRELICAS','ENG_ESTRUTURAS_CONCRETO','ENG_ESTRUTURAS_ACO_MADEIRA']},
 {id:'geotecnia',label:'Geotecnia e Fundações',area:'Engenharia Civil',groups:['ENG_GEOTECNIA']},
 {id:'materiais',label:'Materiais e Tecnologia do Concreto',area:'Engenharia Civil',groups:['ENG_MATERIAIS']},
 {id:'hidraulica',label:'Hidráulica e Saneamento',area:'Engenharia Civil',groups:['ENG_HIDRAULICA']},
 {id:'rodovias',label:'Rodovias e Topografia',area:'Engenharia Civil',groups:['ENG_RODOVIAS','ENG_TOPOGRAFIA']},
 {id:'edificacoes',label:'Instalações e Edificações',area:'Engenharia Civil',groups:['ENG_INSTALACOES','ENG_DESEMPENHO','ENG_PATOLOGIAS']},
 {id:'seguranca',label:'Segurança e Meio Ambiente',area:'Engenharia Civil',groups:['ENG_SEGURANCA','ENG_AMBIENTAL']},
 {id:'planejamento',label:'Planejamento, Orçamento e Gestão',area:'Engenharia Civil',groups:['ENG_PLANEJAMENTO']},
 {id:'eng_outros',label:'Outros assuntos de Engenharia Civil',area:'Engenharia Civil',groups:['ENG_OUTROS']},
 {id:'portugues',label:'Português',area:'Português',groups:['PORTUGUES']},
 {id:'matematica',label:'Matemática e Lógica',area:'Matemática',groups:['MATEMATICA']},
 {id:'legislacao',label:'Legislação',area:'Legislação',groups:['LEGISLACAO']},
 {id:'informatica',label:'Informática',area:'Informática',groups:['INFORMATICA']}
];
const BY_GROUP=new Map(CATS.flatMap(c=>c.groups.map(g=>[g,c])));
const category=(g)=>BY_GROUP.get(g)||{id:'outros',label:'Outros',area:'Outros',groups:[]};
const subject=c=>c.provisional?'Ijuí — legislação FUNDATEC':(c.subject||'Outros');
let general='all';
function el(tag,cls,text){
 const node=document.createElement(tag);if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;return node;
}
function visibleCards(){return cards.filter(c=>c && (c.provisional||c.active!==false));}
function clearNarrowFilters(){
 const fine=$('cardTopicFilter'),discipline=$('cardFilter'),search=$('cardSearch');
 if(fine)fine.value='all';
 if(discipline)discipline.value='all';
 if(search)search.value='';
 focusGroup='';cardLimit=24;
}
function chooseGeneral(id,goCards){
 general=CATS.some(x=>x.id===id)?id:'all';
 const select=$('bm127CardGeneral');if(select)select.value=general;
 clearNarrowFilters();
 if(goCards)section('cartoes');
 cardRender();
 if(goCards)$('cardRows')?.scrollIntoView({block:'start',behavior:'smooth'});
}
window.BM127General=Object.freeze({
 matches(c){
  const q=$('cardSearch')?.value.trim()||'';
  if(/^(?:CARD-\d{4}|IJUI-[A-Za-z0-9_-]+|PROP-IJUI-\d+)$/i.test(q))return true;
  if(focusGroup)return true; // Link explícito do assunto prevalece sobre filtro geral.
  return general==='all'||category(c.provisional?'LEGISLACAO':c.group).id===general;
 },
 categories:CATS.map(x=>({id:x.id,label:x.label,groups:x.groups.slice()})),
 select:chooseGeneral
});

function renderGeneralTopics(){
 const root=$('topicRows'),count=$('topicCount'),input=$('topicSearch'),area=$('topicArea');
 if(!root||!count||!input||!area||!topicRows.length)return;
 const q=normalize(input.value.trim()),chosen=area.value;
 const valid=visibleCards();
 const lookup=new Map();
 const totals=new Map();
 for(const c of valid){
  const g=c.provisional?'LEGISLACAO':c.group;
  const cat=category(g).id, k=g+'|'+subject(c);
  totals.set(cat,(totals.get(cat)||0)+1);
  if(q && normalize([c.front,c.back,c.expl,c.id,c.subject,c.sub].filter(Boolean).join(' ')).includes(q))lookup.set(k,true);
 }
 root.replaceChildren();
 let shown=0;
 const hasCategoryWord=c=>q && normalize(c.label+' '+c.area).includes(q);
 for(const cat of CATS){
  if(chosen!=='all'&&cat.area!==chosen)continue;
  const all=topicRows.filter(t=>category(t.group).id===cat.id);
  if(!all.length)continue;
  const hitAll=hasCategoryWord(cat);
  const results=all.filter(t=>!q||hitAll||
   normalize(t.subject+' '+t.label+' '+(t.group||'')).includes(q)||
   lookup.has(t.group+'|'+t.subject));
  if(q&&!results.length)continue;
  shown++;
  const box=el('details','bm127GeneralTopic');
  // Só abrir automaticamente grupos com resposta a busca.
  box.open=!!q;
  const summary=el('summary','bm127GeneralSummary');
  summary.append(el('strong','',cat.label));
  const n=totals.get(cat.id)||0;
  summary.append(el('span','bm127GeneralCount',n+' cartões · '+all.length+' assuntos detalhados'));
  box.append(summary);
  const inside=el('div','bm127GeneralBody');
  const actions=el('div','bm127GeneralActions');
  const show=el('button','','Ver cartões de '+cat.label);
  show.type='button';show.onclick=()=>chooseGeneral(cat.id,true);
  actions.append(show);inside.append(actions);
  const hint=el('p','bm127GeneralHint','Assuntos específicos ficam aqui dentro. Use a busca acima também por pergunta, norma ou palavra-chave.');
  inside.append(hint);
  const tiles=el('div','bm127GeneralTiles');
  const sorted=results.slice().sort((a,b)=>b.count-a.count||a.subject.localeCompare(b.subject,'pt-BR'));
  function createTopic(t){
   const btn=el('button','bm127GeneralFine');
   btn.type='button';
   btn.append(el('span','',t.subject));
   btn.append(el('small','',(t.count||0)+' cartão(ões)'+(t.imgCount?' · '+t.imgCount+' imagens':'')));
   btn.onclick=()=>window.BancoMestreV034.openTopic(t);
   return btn;
  }
  sorted.slice(0,12).forEach(t=>tiles.append(createTopic(t)));
  if(sorted.length>12){
   const more=el('button','bm127GeneralMore','Mostrar outros '+(sorted.length-12)+' assuntos');
   more.type='button';
   more.onclick=()=>{sorted.slice(12).forEach(t=>tiles.append(createTopic(t)));more.remove()};
   inside.append(more);
  }
  inside.insertBefore(tiles,inside.querySelector('.bm127GeneralMore'));
  box.append(inside);root.append(box);
 }
 if(!shown)root.append(el('p','bm127GeneralEmpty','Nenhum resultado. Tente o nome do conceito, uma norma ou parte da pergunta.'));
 const active=chosen==='all'?'':(' · '+chosen);
 count.textContent=shown+' grupos gerais'+active+(q?' · busca aplicada':'');
}
function setupCardFilter(){
 const old=$('cardTopicFilter');if(!old||$('bm127CardGeneral'))return;
 const controls=old.parentElement;
 const select=el('select');select.id='bm127CardGeneral';select.setAttribute('aria-label','Assunto geral dos cartões');
 select.add(new Option('Todos os assuntos gerais','all'));
 for(const c of CATS)select.add(new Option(c.label,c.id));
 old.before(select);
 const refine=el('details','bm127FineRefine');
 refine.append(el('summary','','Refinar por assunto específico'));
 refine.append(old);
 select.after(refine);
 select.onchange=()=>chooseGeneral(select.value,false);
 $('cardSearch')?.addEventListener('input',()=>{
  const q=$('cardSearch').value.trim();
  if(/^(?:CARD-\d{4}|IJUI-[\w-]+|PROP-IJUI-\d+)$/i.test(q)&&general!=='all'){
   general='all';select.value='all';
  }
 },true);
}
function regroupRenderedCards(){
 const root=$('cardRows');if(!root)return;
 const oldGroups=[...root.querySelectorAll(':scope > details.v036-card-group')];
 if(!oldGroups.length)return;
 const byId=new Map(cards.map(c=>[c.id,c]));
 const buckets=new Map();
 for(const card of root.querySelectorAll('article.card')){
  const id=card.querySelector(':scope > .tag')?.textContent.trim();
  const raw=byId.get(id);if(!raw)continue;
  const cat=category(raw.provisional?'LEGISLACAO':raw.group);
  if(!buckets.has(cat.id))buckets.set(cat.id,{cat,items:[]});
  buckets.get(cat.id).items.push(card);
  const path=card.querySelector('.v036-card-path');
  if(path && !path.querySelector('.bm127OriginalSubject'))path.append(el('span','bm127OriginalSubject',subject(raw)));
 }
 if(!buckets.size)return;
 root.replaceChildren();
 for(const cat of CATS){
  const item=buckets.get(cat.id);if(!item)continue;
  const details=el('details','bm127CardsGroup');details.open=true;
  const summary=el('summary','bm127CardsSummary');
  summary.append(el('strong','',cat.label),el('span','',item.items.length+' exibidos'));
  details.append(summary);
  const grid=el('div','bm127CardsGrid');
  item.items.forEach(card=>grid.append(card));
  details.append(grid);root.append(details);
 }
 const counter=$('cardCount');
 if(counter)counter.textContent=counter.textContent.replace(/ · \d+ assunto\(s\) exibidos/g,'')+' · organizado por grupos gerais';
}
const originalTopicRender=topicRender;
topicRender=function(){renderGeneralTopics()};
const originalCardRender=cardRender;
cardRender=function(){originalCardRender();regroupRenderedCards()};
$('topicSearch').placeholder='Buscar assunto, norma, palavra ou pergunta do cartão';
$('topicSearch').oninput=topicRender;
$('topicArea').onchange=topicRender;
setupCardFilter();
const originalOpen=window.BancoMestreV034?.openTopic;
if(originalOpen)window.BancoMestreV034.openTopic=async function(t){
 const s=$('bm127CardGeneral');
 const label=category(t.group).id;
 general=label;if(s)s.value=general;
 return originalOpen(t);
};
const style=el('style');style.textContent=[
 '.bm127GeneralTopic{border:1px solid #d6e3e1;border-radius:10px;background:#fff;margin:9px 0;overflow:hidden}',
 '.bm127GeneralSummary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;cursor:pointer;flex-wrap:wrap}',
 '.bm127GeneralSummary strong{font-size:17px;color:#173e43}',
 '.bm127GeneralCount{font-size:12px;color:#61767b}',
 '.bm127GeneralBody{border-top:1px solid #edf1f0;padding:14px}',
 '.bm127GeneralActions{margin-bottom:10px}',
 '.bm127GeneralActions button{background:#16616a;color:white;border-color:#16616a;font-weight:700}',
 '.bm127GeneralHint{font-size:12px;color:#637a80;margin-bottom:12px}',
 '.bm127GeneralTiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:8px}',
 '.bm127GeneralFine{text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;font-size:13px;background:#f8faf9}',
 '.bm127GeneralFine span{overflow-wrap:anywhere}',
 '.bm127GeneralFine small{color:#637a80;font-size:11px}',
 '.bm127GeneralMore{margin-top:12px}',
 '.bm127CardsGroup{border:1px solid #d7e4e1;border-radius:10px;background:#fff;margin:9px 0}',
 '.bm127CardsSummary{padding:12px 14px;display:flex;justify-content:space-between;gap:10px;cursor:pointer}',
 '.bm127CardsGrid{display:grid;gap:9px;padding:9px;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr))}',
 '.bm127OriginalSubject{color:#526e78;font-size:11px}',
 '.bm127FineRefine{display:inline-block;max-width:100%;border:1px solid #dbe4e3;border-radius:7px;padding:5px 9px}',
 '.bm127FineRefine summary{font-size:12px;cursor:pointer}',
 '.bm127FineRefine select{display:block;margin:8px 0 0;max-width:100%}',
 '@media(max-width:680px){.bm127GeneralSummary{padding:12px}.bm127GeneralSummary strong{font-size:15px}.bm127CardsGrid{grid-template-columns:1fr}}'
].join('\n');document.head.append(style);
if(topicRows.length)topicRender();
if(cards.length)cardRender();
})();
