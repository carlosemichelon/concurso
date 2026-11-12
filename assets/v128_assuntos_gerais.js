/* Navegacao geral: camada visual sobre os grupos canônicos V024.
   Nao altera cards, sub, group, IDs, fontes, historico ou SRS. */
(function(){
'use strict';
if(window.BM128General)return;
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
// Classificação editorial da lista real de 1.216 cartões legados ENG_GERAL,
// derivada de seus 217 assuntos cadastrados. Não modifica o cadastro.
const LEGACY_SUBJECT_GROUPS={
 "edificacoes": [
  "Coberturas",
  "Coberturas de madeira",
  "Compatibilização",
  "Coordenação modular",
  "Definições de edificações",
  "Desempenho",
  "Desempenho habitacional",
  "Desempenho térmico",
  "Desempenho térmico — ABNT NBR 15220-1",
  "Desempenho térmico — síntese e fórmulas",
  "Dimensionamento de sanitários",
  "Elementos construtivos",
  "Engenharia diagnóstica",
  "Esquadrias",
  "Fotometria",
  "Impermeabilização — NBR 9575",
  "Instalações elétricas",
  "Instalações elétricas — comandos",
  "Instalações elétricas — croquis",
  "Instalações elétricas / NBR 5410",
  "Light Steel Framing",
  "Manutenção predial",
  "NBR 5410 — aterramento",
  "Patologias",
  "Planejamento urbano",
  "Projetos arquitetônicos",
  "Sistemas construtivos",
  "Uso, operação e manutenção"
 ],
 "estruturas": [
  "Ações estruturais",
  "Álgebra aplicada / Matrizes de rigidez",
  "Análise estrutural",
  "Análise estrutural / estruturas hiperestáticas",
  "Combinações de ações",
  "Compressão simples",
  "Concreto armado",
  "Concreto armado — elasticidade",
  "Conversão de cargas distribuídas, pressão e peso próprio",
  "Corpo rígido no plano",
  "Corpo rígido: cinemática e inércia de massa",
  "Deformação plástica após descarga",
  "Elasticidade",
  "Equação diferencial da viga",
  "Equilíbrio seccionado",
  "Estática",
  "Estática / apoios",
  "Estática / esforços internos",
  "Estática / Pórticos e reações",
  "Estrutura molecular",
  "Estruturas",
  "Estruturas — Mísulas",
  "Estruturas — treliças",
  "Estruturas / Análise estrutural",
  "Estruturas / Cargas e unidades",
  "Estruturas / Concreto",
  "Estruturas / Concreto armado",
  "Estruturas / Concreto armado — domínios de deformação",
  "Estruturas / Equilíbrio de momentos",
  "Estruturas / Esforços internos de barras",
  "Estruturas / Estabilidade e deformações",
  "Estruturas / Lajes e apoios",
  "Estruturas / Lajes e charneiras",
  "Estruturas / Lajes e distribuição de cargas",
  "Estruturas / Quadro isostático e cortante",
  "Estruturas / Resistência dos materiais",
  "Estruturas / Treliças",
  "Estruturas de aço",
  "Estruturas de concreto",
  "Estruturas de madeira",
  "Estruturas hiperestáticas",
  "Estruturas metálicas",
  "Isostaticidade e forças horizontais em quadros",
  "Lajes e esforços",
  "Linha elástica",
  "Madeira",
  "Matriz de rigidez",
  "Mecânica das estruturas",
  "Método matricial da rigidez",
  "Momento e tensão",
  "Peso próprio de viga",
  "Pórticos",
  "Pórticos planos",
  "PTV e compatibilidade",
  "Reações de carga concentrada central/excêntrica",
  "Relações diferenciais entre carga, cortante e momento",
  "Segundo grau de deformação",
  "Tabelas de flechas",
  "Treliças planas",
  "Viga Gerber",
  "Vigas hiperestáticas",
  "Vínculos e reações de apoios"
 ],
 "geotecnia": [
  "Darcy e permeabilidade",
  "Empuxo ativo e passivo",
  "Ensaios de solos",
  "Estática / fundações",
  "Fundações",
  "Fundações rasas",
  "Geotecnia",
  "Geotecnia / Fundações e tensões",
  "Geotecnia / taludes",
  "Geotecnia e solos",
  "Granulometria de solos",
  "Índices físicos do solo",
  "Lei de Darcy",
  "Mecânica dos solos",
  "Mecânica dos Solos",
  "Muros de arrimo",
  "NBR 6122",
  "Pedologia",
  "Ruptura de taludes",
  "Taludes",
  "Tensões geostáticas",
  "Terzaghi",
  "Tirantes x grampos"
 ],
 "materiais": [
  "Agregados em concretos",
  "Alvenaria estrutural",
  "CA-50",
  "Cimento Portland",
  "Concreto pré-moldado",
  "Concreto projetado",
  "Ensaios de agregados",
  "Estática e Resistência dos Materiais",
  "Etringita tardia",
  "Geologia e materiais",
  "História do abastecimento",
  "Materiais / argamassa",
  "Materiais / cal",
  "Materiais / cimento",
  "Materiais / Concreto e controle de qualidade",
  "Materiais de construção",
  "NBR 12655 — responsabilidades",
  "Patologia do concreto",
  "Polímeros",
  "Química orgânica",
  "Resistência característica e média",
  "Resistência dos materiais",
  "Resistência dos Materiais",
  "Resistência dos materiais — cisalhamento",
  "Revestimentos cerâmicos",
  "Tecnologia do concreto",
  "Tração indireta por compressão diametral"
 ],
 "planejamento": [
  "Avaliação de imóveis",
  "Avaliação imobiliária",
  "Gestão de obras / Concretagem e perdas",
  "Medição em estruturas",
  "Orçamento",
  "Orçamentos",
  "Planejamento",
  "Planejamento / finanças",
  "Planejamento de obras"
 ],
 "rodovias": [
  "Curva circular simples",
  "Curva com espirais",
  "Ensaios de pavimentos",
  "Estruturas rodoviárias",
  "Geometria rodoviária",
  "Máximo de momento sob carga móvel",
  "Pavimentação",
  "Pavimento rígido",
  "Pontes e viadutos",
  "Projeto geométrico",
  "Rodovias",
  "Rodovias / Terraplanagem",
  "Rodovias e pavimentação",
  "Rumos quadrantes",
  "Terraplenagem",
  "Topografia",
  "Topografia e terraplenagem",
  "Topografia rodoviária"
 ],
 "seguranca": [
  "Acessibilidade",
  "Acessibilidade — NBR 9050",
  "Aterros sanitários",
  "Combustão",
  "Equipamentos de proteção individual",
  "Ergonomia",
  "Instalações elétricas — segurança",
  "Licenciamento ambiental",
  "Meio ambiente",
  "NR-10",
  "NR-17 — AEP",
  "NR-17 — AET",
  "NR-17 — exceções",
  "NR-18 — acesso sanitário",
  "NR-18 — água",
  "NR-5 — CIPA",
  "NR-5 — CIPA / Competências integradas",
  "NR-5 — eleição CIPA",
  "NR24",
  "Proteção ativa x passiva",
  "Proteção catódica",
  "Resíduos e entulho",
  "Resíduos sólidos",
  "Saídas de emergência",
  "Segurança contra incêndio",
  "Segurança do trabalho"
 ],
 "hidraulica": [
  "Diâmetros de tubo",
  "Esgoto doméstico",
  "Esgoto predial",
  "ETA",
  "Hidráulica",
  "Hidráulica — carneiro hidráulico",
  "Hidráulica de seção aberta",
  "Hidráulica de tubulações",
  "Hidrologia",
  "Hidrostática",
  "Hidrostática em barragem",
  "Instalações hidráulicas",
  "Instalações hidrossanitárias",
  "Instalações prediais de água fria",
  "Instalações prediais de esgoto",
  "Instalações prediais de esgoto e ventilação",
  "Instalações sanitárias",
  "Mecânica dos fluidos",
  "Método racional",
  "Probabilidade de cheia",
  "Redes coletoras — NBR 9649",
  "Saneamento",
  "Tratamento de água"
 ],
 "eng_outros": [
  "Dutos e Terminais — edital 2026",
  "Normas técnicas — Vigência"
 ]
};
const LEGACY_BY_SUBJECT=new Map(Object.entries(LEGACY_SUBJECT_GROUPS).flatMap(([category,subjects])=>subjects.map(subject=>[normalize(subject),category])));
const CAT_BY_ID=new Map(CATS.map(c=>[c.id,c]));
function category(value,subjectOverride){
 const data=value&&typeof value==='object'?value:null;
 const group=data?(data.provisional?'LEGISLACAO':data.group):value;
 const subject=subjectOverride??(data?(data.provisional?'Ijuí — legislação FUNDATEC':data.subject):'');
 if(group==='ENG_GERAL')return CAT_BY_ID.get(LEGACY_BY_SUBJECT.get(normalize(subject))||'eng_outros');
 return BY_GROUP.get(group)||(String(group||'').startsWith('ENG_')?CAT_BY_ID.get('eng_outros'):CAT_BY_ID.get('informatica'));
}
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
 for(const id of ['cardReviewedOnly','cardRecoveredOnly'])if($(id))$(id).checked=false;
}
function chooseGeneral(id,goCards){
 general=CATS.some(x=>x.id===id)?id:'all';
 const select=$('bm128CardGeneral');if(select)select.value=general;
 clearNarrowFilters();
 if(goCards)section('cartoes');
 cardRender();
 if(goCards)$('cardRows')?.scrollIntoView({block:'start',behavior:'smooth'});
}
window.BM128General=Object.freeze({
 classificationOf:entry=>category(entry).id,

 matches(c){
  const q=$('cardSearch')?.value.trim()||'';
  if(/^(?:CARD-\d{4}|IJUI-[A-Za-z0-9_-]+|PROP-IJUI-\d+)$/i.test(q))return true;
  if(focusGroup)return true; // Link explícito do assunto prevalece sobre filtro geral.
  return general==='all'||category(c).id===general;
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
  const cat=category(c).id, k=g+'|'+subject(c);
  totals.set(cat,(totals.get(cat)||0)+1);
  if(q && normalize([c.front,c.back,c.expl,c.id,c.subject,c.sub].filter(Boolean).join(' ')).includes(q))lookup.set(k,true);
 }
 root.replaceChildren();
 let shown=0;
 const hasCategoryWord=c=>q && normalize(c.label+' '+c.area).includes(q);
 for(const cat of CATS){
  if(chosen!=='all'&&cat.area!==chosen)continue;
  const all=topicRows.filter(t=>category(t.group,t.subject).id===cat.id);
  if(!all.length)continue;
  const hitAll=hasCategoryWord(cat);
  const results=all.filter(t=>!q||hitAll||
   normalize(t.subject+' '+t.label+' '+(t.group||'')).includes(q)||
   lookup.has(t.group+'|'+t.subject));
  if(q&&!results.length)continue;
  shown++;
  const box=el('details','bm128GeneralTopic');
  // Só abrir automaticamente grupos com resposta a busca.
  box.open=!!q;
  const summary=el('summary','bm128GeneralSummary');
  summary.append(el('strong','',cat.label));
  const n=totals.get(cat.id)||0;
  summary.append(el('span','bm128GeneralCount',n+' cartões · '+all.length+' assuntos detalhados'));
  box.append(summary);
  const inside=el('div','bm128GeneralBody');
  const actions=el('div','bm128GeneralActions');
  const show=el('button','','Ver cartões de '+cat.label);
  show.type='button';show.onclick=()=>chooseGeneral(cat.id,true);
  actions.append(show);inside.append(actions);
  const hint=el('p','bm128GeneralHint','Assuntos específicos ficam aqui dentro. Use a busca acima também por pergunta, norma ou palavra-chave.');
  inside.append(hint);
  const tiles=el('div','bm128GeneralTiles');
  const sorted=results.slice().sort((a,b)=>b.count-a.count||a.subject.localeCompare(b.subject,'pt-BR'));
  function createTopic(t){
   const btn=el('button','bm128GeneralFine');
   btn.type='button';
   btn.append(el('span','',t.subject));
   btn.append(el('small','',(t.count||0)+' cartão(ões)'+(t.imgCount?' · '+t.imgCount+' imagens':'')));
   btn.onclick=()=>window.BancoMestreV034.openTopic(t);
   return btn;
  }
  sorted.slice(0,12).forEach(t=>tiles.append(createTopic(t)));
  if(sorted.length>12){
   const more=el('button','bm128GeneralMore','Mostrar outros '+(sorted.length-12)+' assuntos');
   more.type='button';
   more.onclick=()=>{sorted.slice(12).forEach(t=>tiles.append(createTopic(t)));more.remove()};
   inside.append(more);
  }
  inside.insertBefore(tiles,inside.querySelector('.bm128GeneralMore'));
  box.append(inside);root.append(box);
 }
 if(!shown)root.append(el('p','bm128GeneralEmpty','Nenhum resultado. Tente o nome do conceito, uma norma ou parte da pergunta.'));
 const active=chosen==='all'?'':(' · '+chosen);
 count.textContent=shown+' grupos gerais'+active+(q?' · busca aplicada':'');
}
function setupCardFilter(){
 const old=$('cardTopicFilter');if(!old||$('bm128CardGeneral'))return;
 const controls=old.parentElement;
 const select=el('select');select.id='bm128CardGeneral';select.setAttribute('aria-label','Assunto geral dos cartões');
 select.add(new Option('Todos os assuntos gerais','all'));
 for(const c of CATS)select.add(new Option(c.label,c.id));
 old.before(select);
 const refine=el('details','bm128FineRefine');
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
  const cat=category(raw);
  if(!buckets.has(cat.id))buckets.set(cat.id,{cat,items:[]});
  buckets.get(cat.id).items.push(card);
  const path=card.querySelector('.v036-card-path');
  if(path && !path.querySelector('.bm128OriginalSubject'))path.append(el('span','bm128OriginalSubject',subject(raw)));
 }
 if(!buckets.size)return;
 root.replaceChildren();
 for(const cat of CATS){
  const item=buckets.get(cat.id);if(!item)continue;
  const details=el('details','bm128CardsGroup');details.open=true;
  const summary=el('summary','bm128CardsSummary');
  summary.append(el('strong','',cat.label),el('span','',item.items.length+' exibidos'));
  details.append(summary);
  const grid=el('div','bm128CardsGrid');
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
 const s=$('bm128CardGeneral');
 const label=category(t.group,t.subject).id;
 general=label;if(s)s.value=general;
 return originalOpen(t);
};
const style=el('style');style.textContent=[
 '.bm128GeneralTopic{border:1px solid #d6e3e1;border-radius:10px;background:#fff;margin:9px 0;overflow:hidden}',
 '.bm128GeneralSummary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;cursor:pointer;flex-wrap:wrap}',
 '.bm128GeneralSummary strong{font-size:17px;color:#173e43}',
 '.bm128GeneralCount{font-size:12px;color:#61767b}',
 '.bm128GeneralBody{border-top:1px solid #edf1f0;padding:14px}',
 '.bm128GeneralActions{margin-bottom:10px}',
 '.bm128GeneralActions button{background:#16616a;color:white;border-color:#16616a;font-weight:700}',
 '.bm128GeneralHint{font-size:12px;color:#637a80;margin-bottom:12px}',
 '.bm128GeneralTiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:8px}',
 '.bm128GeneralFine{text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;font-size:13px;background:#f8faf9}',
 '.bm128GeneralFine span{overflow-wrap:anywhere}',
 '.bm128GeneralFine small{color:#637a80;font-size:11px}',
 '.bm128GeneralMore{margin-top:12px}',
 '.bm128CardsGroup{border:1px solid #d7e4e1;border-radius:10px;background:#fff;margin:9px 0}',
 '.bm128CardsSummary{padding:12px 14px;display:flex;justify-content:space-between;gap:10px;cursor:pointer}',
 '.bm128CardsGrid{display:grid;gap:9px;padding:9px;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr))}',
 '.bm128OriginalSubject{color:#526e78;font-size:11px}',
 '.bm128FineRefine{display:inline-block;max-width:100%;border:1px solid #dbe4e3;border-radius:7px;padding:5px 9px}',
 '.bm128FineRefine summary{font-size:12px;cursor:pointer}',
 '.bm128FineRefine select{display:block;margin:8px 0 0;max-width:100%}',
 '@media(max-width:680px){.bm128GeneralSummary{padding:12px}.bm128GeneralSummary strong{font-size:15px}.bm128CardsGrid{grid-template-columns:1fr}}'
].join('\n');document.head.append(style);
if(topicRows.length)topicRender();
if(cards.length)cardRender();
})();
