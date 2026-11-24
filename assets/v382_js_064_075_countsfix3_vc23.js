/* V315 IIFE 64–75 order preserved */

;
/* 64 assets/v122_visual_compact.js */
/* V122 — estatísticas e Atlas sem textos repetitivos. */
(function(){
 'use strict';
 if(window.BancoMestreVisualCompactV122)return;
 function adapt(){
  const stats=document.querySelector('header .bm-v046-header-stats');
  if(stats){
   const spans=stats.querySelectorAll(':scope > .stat > span');
   const labels=['PDFs no Drive','Cartões ativos','Imagens / Atlas'];
   for(let i=0;i<spans.length&&i<labels.length;i++)spans[i].textContent=labels[i];
  }
  const image=document.getElementById('imagens');
  if(!image)return;
  const notices=[...image.querySelectorAll('.panel > .notice')];
  for(const notice of notices)if((notice.textContent||'').trim().startsWith('Atlas de 270 imagens, organizado por área e assunto.'))notice.remove();
  document.getElementById('bm087-visibility-info')?.remove();
 }
 adapt();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',adapt,{once:true});
 const root=document.getElementById('imagens');
 if(root&&typeof MutationObserver==='function'){
  let active=false;
  new MutationObserver(()=>{
   if(active)return;
   const target=document.getElementById('bm087-visibility-info');
   const notice=[...root.querySelectorAll('.panel > .notice')]
    .find(el=>(el.textContent||'').startsWith('Atlas de 270 imagens, organizado por área e assunto.'));
   if(target||notice){active=true;adapt();active=false}
  }).observe(root,{childList:true,subtree:true});
 }
 window.BancoMestreVisualCompactV122=Object.freeze({refresh:adapt});
})();

;
/* 65 assets/v123_cards_recovery.js */
/* V123 — retomada segura de flashcards após carga de JSON e navegação. */
(function(){
'use strict';
if(window.BancoMestreCardRecoveryV123)return;
const $=id=>document.getElementById(id),root=$('cartoes'),list=$('cardRows');
if(!root||!list)return;
const controls=root.querySelector('.controls'),notice=document.createElement('div');
notice.id='bm123CardsLoadStatus';
notice.setAttribute('role','status');
notice.setAttribute('aria-live','polite');
notice.hidden=true;
const reload=document.createElement('button');reload.type='button';reload.textContent='Recarregar cartões';
reload.hidden=true;
reload.className='bm123-card-retry';
notice.append(document.createElement('span'),reload);
if(controls)controls.after(notice);else root.querySelector('.panel')?.prepend(notice);
function msg(text,canRetry=false){
 const span=notice.querySelector('span');if(span)span.textContent=text;
 notice.hidden=!text;reload.hidden=!canRetry;
}
function number(){return typeof cards!=='undefined'&&Array.isArray(cards)?cards.length:0}
async function check(force=false){
 if(typeof loadCards!=='function')return;
 if(!number())msg('Carregando o catálogo oficial '+BM_CATALOG.display_version+'…');
 try{
  await loadCards();
  if(number()!==BM_CATALOG.counts.canonical+BM_CATALOG.counts.ijui)throw Error('O catálogo oficial está incompleto ('+number()+' IDs).');
  if(typeof cardRender==='function')cardRender();
  const count=$('cardCount')?.textContent||'';
  if(!list.querySelector('article.card')){
   msg('A base foi carregada ('+number()+' IDs), mas nenhum cartão corresponde aos filtros atuais. Limpe a busca e os filtros.',true);
  }else msg('');
 }catch(e){msg('Não foi possível exibir os cartões: '+e.message+'. Verifique a conexão e tente novamente.',true);}
}
function resetFilters(){
 try{focusGroup=''}catch(_){}
 const search=$('cardSearch');if(search)search.value='';
 const filter=$('cardFilter');if(filter)filter.value='all';
 const topic=$('cardTopicFilter');if(topic)topic.value='all';
 for(const id of ['cardRecoveredOnly','cardReviewedOnly']){const x=$(id);if(x)x.checked=false;}
}
reload.addEventListener('click',()=>{
 resetFilters();check(true);
});
for(const button of document.querySelectorAll('header nav button[data-page="cartoes"]')){
 button.addEventListener('click',()=>{
  resetFilters();void check();
 });
}
if(location.hash==='#cartoes')void check();
window.BancoMestreCardRecoveryV123=Object.freeze({refresh:check,reset:resetFilters,get count(){return number()}});
})();

;
/* 66 assets/v245_assuntos_gerais.js */
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
// V243: reclassificação visual de NRs conforme conteúdo de Segurança do Trabalho.
 // São rótulos já existentes nos cartões; nenhuma modificação dos originais.
 LEGACY_SUBJECT_GROUPS.seguranca.push(...["NR-17 Geral","NR-17 Anexo I","NR-6 — Equipamento de Proteção Individual","NR-6 — Proteção Respiratória","NR-7 — PCMSO","NR-1 × NR-9 × NR-7","NR-4 × NR-5 × NR-7 — CIPA × SESMT","NR-8","NR-17 Anexo II","NR-17 — Organização","NR-17 — Mapa"]);
 const LEGACY_BY_SUBJECT=new Map(Object.entries(LEGACY_SUBJECT_GROUPS).flatMap(([category,subjects])=>subjects.map(subject=>[normalize(subject),category])));
const CAT_BY_ID=new Map(CATS.map(c=>[c.id,c]));
function category(value,subjectOverride){
 const data=value&&typeof value==='object'?value:null;
 const group=data?(data.provisional?'LEGISLACAO':data.group):value;
 const subject=subjectOverride??(data?(data.provisional?'Ijuí — legislação FUNDATEC':data.subject):'');
 if(group==='ENG_GERAL'&&normalize(data?.discipline)==='estatistica')return CAT_BY_ID.get('matematica');
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
  if(/^(?:CARD-\d{4}|IJUI-[A-Za-z0-9_-]+|PROP-IJUI-\d+|TRT0[12]-C\d{3})$/i.test(q))return true;
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
  if(/^(?:CARD-\d{4}|IJUI-[\w-]+|PROP-IJUI-\d+|TRT0[12]-C\d{3})$/i.test(q)&&general!=='all'){
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
 // Contagem e identificação oficiais são apresentadas no resumo unificado.
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


;
/* 67 assets/v130_redacao.js */

/* Banco Mestre V130 — Redação e Discursivas.
 * Isolado de cartões, SRS, PDF, grifos e Google Drive. Sem notas artificiais.
 */
(function(){
'use strict';
if(document.getElementById('redacao'))return;
const main=document.querySelector('main'),nav=document.querySelector('header nav');
if(!main||!nav)return;
const root=document.createElement('section');root.id='redacao';
root.innerHTML=
'<div class="panel"><span class="tag">Oficina de escrita · Banco Mestre</span><h2>Redação e discursivas</h2><p class="intro">Pratique escrita, revise e acompanhe reescritas, sem alterar o SRS dos flashcards.</p>'+
'<div class="wr-tabs" role="tablist" aria-label="Modalidades de escrita"><button type="button" data-wrtab="red" class="selected">Redação</button><button type="button" data-wrtab="disc">Discursivas</button><button type="button" data-wrtab="history">Histórico</button><button type="button" data-wrtab="method">Método e revisão</button></div><p class="wr-status" id="wr-status" role="status" aria-live="polite"></p>'+
'<div id="wr-red" class="wr-sub"><div class="wr-layout"><div>'+
'<div class="wr-box"><h3>Planejamento FTTD</h3><div class="wr-flow"><strong>F · Fenômeno/Fato</strong> → <strong>T · Tema</strong> → <strong>T · Tese</strong> → <strong>D · Desenvolvimento</strong></div><p class="wr-warning">Método recuperado do antigo Treinador de Redação. Elabore seu texto antes de solicitar correção.</p>'+
'<label class="wr-field">Tema proposto<input data-wrfield id="wr-r-theme" placeholder="Digite o tema da redação"></label>'+
'<label class="wr-field">Sugestões de temas autorais (não oficiais)<select id="wr-r-example"><option value="">Escolher tema opcional</option><option>Inclusão digital e acesso aos serviços públicos no Brasil</option><option>Desafios do saneamento básico e da sustentabilidade</option><option>Ética e transparência na administração pública</option><option>Educação financeira e proteção do consumidor</option></select></label>'+
'<div class="wr-grid2"><label class="wr-field">Banca ou concurso<input data-wrfield id="wr-r-board" placeholder="Ex.: Cesgranrio"></label><label class="wr-field">Extensão exigida<input data-wrfield id="wr-r-limit" placeholder="Ex.: 20 a 30 linhas"></label></div>'+
'<label class="wr-field">F · Fenômeno/fato para contextualização<textarea data-wrfield id="wr-r-f" rows="2" placeholder="O que contextualiza o tema?"></textarea></label>'+
'<div class="wr-grid2"><label class="wr-field">T · Eixo 1 da tese<input data-wrfield id="wr-r-t1" placeholder="Primeiro argumento"></label><label class="wr-field">T · Eixo 2 da tese<input data-wrfield id="wr-r-t2" placeholder="Segundo argumento"></label></div>'+
'<label class="wr-field">D · Plano do desenvolvimento<textarea data-wrfield id="wr-r-d" rows="3" placeholder="Tópicos frasais, evidências, consequências e conclusão"></textarea></label></div>'+
'<div class="wr-box"><h3>Texto integral</h3><label class="wr-field">Minha redação<textarea data-wrfield id="wr-r-text" class="wr-editor" spellcheck="true" placeholder="Escreva sua redação completa. O texto original permanece na primeira versão."></textarea></label><p class="wr-muted" id="wr-r-stats"></p>'+
'<label class="wr-field">Correção e metas de reescrita<textarea data-wrfield id="wr-r-notes" rows="3" placeholder="Anote avaliações reais após tentar: lacunas, erros de escrita e melhorias"></textarea></label>'+
'<div class="wr-actions"><button type="button" class="primary" data-wraction="save">Salvar versão</button><button type="button" data-wraction="copy">Copiar pedido de correção</button><button type="button" data-wraction="new">Nova redação</button></div><p class="wr-muted">Sem nota automática. Atribua nota somente após conferir critérios da banca.</p></div></div>'+
'<aside><div class="wr-box"><h3>Checklist de revisão</h3><div id="wr-check"></div><p class="wr-muted" id="wr-check-count"></p></div>'+
'<div class="wr-box"><h3>Matriz universal de argumentos</h3><p class="wr-muted">Tecnologia · Economia · Sociedade · Educação · Ética. Analise causas, mecanismos, exemplos e consequências.</p><button type="button" data-wraction="method">Consultar metodologia</button></div></aside></div></div>'+
'<div id="wr-disc" class="wr-sub" hidden><div class="wr-layout"><div><div class="wr-box"><h3>Responder questão discursiva</h3><p class="wr-muted">Responda primeiro, sem consultar o verso. Depois compare o núcleo mínimo e o aprofundamento complementar.</p>'+
'<label class="wr-field">Enunciado<textarea data-wrfield id="wr-d-theme" rows="3" placeholder="Cole ou digite o enunciado integral"></textarea></label>'+
'<label class="wr-field">Sugestões autorais (não são provas oficiais)<select id="wr-d-example"><option value="">Escolher questão opcional</option><option>Diferencie estados-limites últimos e estados-limites de serviço.</option><option>Explique a importância da investigação geotécnica na escolha de fundações.</option><option>Diferencie plano diretor e zoneamento no planejamento urbano.</option></select></label>'+
'<div class="wr-grid2"><label class="wr-field">Área<select data-wrfield id="wr-d-area"><option>Engenharia Civil</option><option>Legislação</option><option>Português</option><option>Matemática</option><option>Outras</option></select></label><label class="wr-field">Banca / ID relacionado<input data-wrfield id="wr-d-board" placeholder="Ex.: PETRO12-Q004"></label></div>'+
'<label class="wr-field">Minha resposta discursiva<textarea data-wrfield id="wr-d-text" class="wr-editor" spellcheck="true" placeholder="Escreva a resposta, antes de ver o gabarito"></textarea></label><p class="wr-muted" id="wr-d-stats"></p>'+
'<label class="wr-field">Fonte conferida após a tentativa<input data-wrfield id="wr-d-source" placeholder="Lei/norma, edição, item, página — se verificados"></label>'+
'<label class="wr-field">Correção, lacunas e avaliação da escrita<textarea data-wrfield id="wr-d-notes" rows="4" placeholder="Resposta mínima, pegadinhas, aplicações, exemplos, erros demonstrados"></textarea></label>'+
'<div class="wr-actions"><button type="button" class="primary" data-wraction="save">Salvar versão</button><button type="button" data-wraction="copy">Copiar pedido de correção</button><button type="button" data-wraction="new">Nova questão</button></div></div></div>'+
'<aside><div class="wr-box"><h3>Metodologia discursiva</h3><ul class="wr-guide"><li>Núcleo mínimo necessário</li><li>Fundamento legal/normativo verificável</li><li>Definição e mecanismo didático</li><li>Aplicação e exemplos práticos</li><li>Exceções, diferenças e pegadinhas</li><li>Lacunas realmente demonstradas</li><li>Qualidade da escrita, macete e cobertura cruzada</li></ul></div>'+
'<div class="wr-box"><h3>Discursivas vinculadas aos cartões</h3><p class="wr-muted">O treino por ID continua nos Flashcards. Esta aba não registra SRS nem cria cartão automaticamente.</p><button type="button" data-wraction="cards">Abrir Flashcards</button></div></aside></div></div>'+
'<div id="wr-history" class="wr-sub" hidden><div class="wr-box"><h3>Histórico de tentativas e reescritas</h3><p class="wr-muted" id="wr-total"></p><div class="wr-actions"><button type="button" class="primary" data-wraction="export">Exportar backup JSON</button><label for="wr-import" class="action" style="cursor:pointer">Importar backup JSON</label><input id="wr-import" type="file" accept=".json,application/json" hidden></div>'+
'<p class="wr-warning">Os textos ficam somente neste navegador. Faça backup para trocar de aparelho ou limpar dados locais. Importação preserva os IDs existentes.</p><div id="wr-list"></div></div></div>'+
'<div id="wr-method" class="wr-sub" hidden><div class="wr-layout"><div class="wr-box"><h3>FTTD, TEEC, Raio-X e Cirurgia</h3><ul class="wr-guide"><li>FTTD: fenômeno/fato → tema → tese → desenvolvimento.</li><li>Introdução: contextualização, recorte e tese.</li><li>Desenvolvimento: tópico frasal, explicação, exemplo/evidência e consequência.</li><li>Conclusão: síntese coerente, proposta de intervenção quando exigida.</li><li>Raio-X: verifique a função de cada trecho e a progressão das ideias.</li><li>Cirurgia do texto: registre erros reais, corrija e compare a reescrita com o original.</li><li>Argumentação: dimensões tecnológica, econômica, social, educacional e ética.</li></ul></div>'+
'<aside class="wr-box"><h3>Regras para discursivas</h3><ul class="wr-guide"><li>Resposta mínima separada do aprofundamento</li><li>Fonte normativa apenas após conferência</li><li>Lacunas demonstradas, sem presumir erros</li><li>Nota oficial só com edital e critérios</li><li>Sem flashcard novo nem SRS sem aprovação</li></ul></aside></div></div></div>';
const footer=main.querySelector('footer');footer?main.insertBefore(root,footer):main.append(root);
const navButton=document.createElement('button');navButton.type='button';navButton.dataset.page='redacao';navButton.textContent='Redação e Discursivas';nav.append(navButton);
const $=s=>root.querySelector(s),el=s=>$('#wr-'+s);
const ID={red:['r-theme','r-board','r-limit','r-f','r-t1','r-t2','r-d','r-text','r-notes'],disc:['d-theme','d-area','d-board','d-text','d-source','d-notes']};
const KEY='BM130_ESCRITA_V1',DRAFT='BM130_RASCUNHOS_V1',FORMAT='BancoMestreEscritaV130';
let mode='red',opened={red:null,disc:null};
function parse(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
let historyDB=parse(KEY,[]),draft=parse(DRAFT,{});if(!Array.isArray(historyDB))historyDB=[];if(!draft||typeof draft!=='object'||Array.isArray(draft))draft={};
function msg(s){el('status').textContent=s}
function record(m){let o={};ID[m].forEach(k=>o[k]=el(k).value);return o}
function fill(m,o){ID[m].forEach(k=>el(k).value=String(o?.[k]??''));stats(m)}
function persist(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch(e){msg('Não foi possível gravar: '+e.message);return false}}
function saveDraft(){draft.red=record('red');draft.disc=record('disc');persist(DRAFT,draft)}
function stats(m){const t=el((m==='red'?'r':'d')+'-text').value.trim();el((m==='red'?'r':'d')+'-stats').textContent=(t?t.split(/\s+/).length:0)+' palavras · '+(t?t.split(/\n\s*\n/).filter(Boolean).length:0)+' parágrafos · '+t.length+' caracteres. Contagem de linhas depende da formatação.'}
function showTab(next){mode=next;root.querySelectorAll('[data-wrtab]').forEach(b=>{b.classList.toggle('selected',b.dataset.wrtab===next);b.setAttribute('aria-selected',String(b.dataset.wrtab===next))});['red','disc','history','method'].forEach(s=>el(s).hidden=s!==next);if(next==='history')renderHistory();msg('')}
navButton.onclick=()=>{section('redacao');showTab('red')};
root.querySelectorAll('[data-wrtab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.wrtab)));
root.querySelectorAll('[data-wrfield]').forEach(x=>x.addEventListener('input',()=>{stats(x.id.startsWith('wr-r-')?'red':'disc');saveDraft()}));
function saveVersion(){const m=mode,d=record(m),theme=d[m==='red'?'r-theme':'d-theme'].trim(),answer=d[m==='red'?'r-text':'d-text'].trim();if(!theme||!answer){msg('Escreva o enunciado e a resposta antes de salvar.');return}
const now=new Date().toISOString(),key=opened[m]||((m==='red'?'RED-':'DISC-')+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7));
let item=historyDB.find(r=>r.id===key);if(item&&item.mode!==m){msg('ID existente de outro tipo de resposta.');return}
if(item&&JSON.stringify(item.versions[item.versions.length-1].data)===JSON.stringify(d)){msg('A versão atual já está salva, sem alterações.');return}
if(!item){item={id:key,mode:m,created:now,versions:[]};historyDB.push(item)}
item.versions.push({at:now,data:d});item.updated=now;
if(!persist(KEY,historyDB)){item.versions.pop();if(!item.versions.length)historyDB=historyDB.filter(r=>r!==item);return}
opened[m]=key;saveDraft();msg('Versão '+item.versions.length+' salva somente neste navegador. ID: '+key);
}
function copy(s){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(s);const t=document.createElement('textarea');t.value=s;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();return ok?Promise.resolve():Promise.reject(Error('Cópia indisponível'))}
function copyPrompt(){const red=mode==='red',d=record(mode),q=d[red?'r-theme':'d-theme'],body=d[red?'r-text':'d-text'];if(!q.trim()||!body.trim()){msg('Informe o tema e escreva a resposta antes de copiar.');return}
const prompt=red?'Corrija esta redação conforme a metodologia de concursos: preserve integralmente minha primeira versão, analise tema, gênero, tese, argumentos, progressão, coesão, coerência e norma-padrão. Justifique com trechos reais, proponha revisão e compare versões. Não invente notas ou critérios oficiais.':'Corrija minha resposta discursiva segundo a Metodologia Mestre do Banco Mestre. Diferencie núcleo mínimo e aprofundamento, fundamento normativo com edição/item somente quando verificados, conceito, mecanismo didático, aplicação, exceções, pegadinhas, lacunas realmente demonstradas, escrita, macetes e cobertura cruzada. Preserve o original. Não crie cartão nem evento SRS sem minha avaliação/autorização.';
const ctx=red?'Banca: '+d['r-board']+'; extensão: '+d['r-limit']+'; fenômeno: '+d['r-f']+'; tese: '+d['r-t1']+' / '+d['r-t2']+'; desenvolvimento: '+d['r-d']:'Área: '+d['d-area']+'; banca e cartão: '+d['d-board']+'; fonte verificada: '+d['d-source'];
copy(prompt+'\nTema/enunciado: '+q+'\n'+ctx+'\nMINHA RESPOSTA ORIGINAL:\n'+body).then(()=>msg('Pedido de correção copiado. Cole-o no ChatGPT para avaliação real.')).catch(e=>msg('Não foi possível copiar: '+e.message));
}
function newTask(){if(!confirm('Começar novo exercício? Rascunho não salvo será perdido.'))return;opened[mode]=null;fill(mode,{});saveDraft();msg('Novo exercício iniciado. As versões salvas permanecem no histórico.')}
function exportBackup(){const blob=new Blob([JSON.stringify({format:FORMAT,exportedAt:new Date().toISOString(),records:historyDB},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='BancoMestre_Redacao_Discursivas_'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),16000);msg('Backup JSON gerado. Guarde em local seguro.')}
function renderHistory(){const target=el('list');target.replaceChildren();el('total').textContent=historyDB.length+' registros no navegador';if(!historyDB.length){target.textContent='Nenhum texto salvo neste navegador.';return}
historyDB.slice().sort((a,b)=>String(b.updated).localeCompare(String(a.updated))).slice(0,100).forEach(r=>{const box=document.createElement('article');box.className='wr-item';const h=document.createElement('h3');h.textContent=r.versions[0].data[r.mode==='red'?'r-theme':'d-theme']||r.id;const p=document.createElement('p');p.className='wr-muted';p.textContent=(r.mode==='red'?'Redação':'Discursiva')+' · '+r.id+' · '+r.versions.length+' versão(ões)';const b=document.createElement('button');b.type='button';b.textContent='Reabrir para reescrever';b.onclick=()=>{opened[r.mode]=r.id;fill(r.mode,r.versions[r.versions.length-1].data);saveDraft();showTab(r.mode);msg('Reaberto '+r.id+'. Original preservado no histórico.');root.scrollIntoView({block:'start'})};const det=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Ver todas as versões, inclusive o original';det.append(sum);r.versions.forEach((v,i)=>{const label=document.createElement('p');label.className='wr-muted';label.textContent='Versão '+(i+1)+' · '+new Date(v.at).toLocaleString('pt-BR');const pre=document.createElement('pre');pre.textContent=v.data[r.mode==='red'?'r-text':'d-text']||'';det.append(label,pre)});box.append(h,p,b,det);target.append(box)});if(historyDB.length>100){const note=document.createElement('p');note.className='wr-muted';note.textContent='Exibidos os 100 mais recentes. Backup contém todos.';target.append(note)}}
function valid(r){return r&&typeof r.id==='string'&&r.id.length<120&&['red','disc'].includes(r.mode)&&Array.isArray(r.versions)&&r.versions.length>0&&r.versions.every(v=>v&&v.data&&typeof v.data[r.mode==='red'?'r-text':'d-text']==='string')}
el('import').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{if(file.size>15e6)throw Error('Arquivo maior que 15 MB');const d=JSON.parse(await file.text());if(d.format!==FORMAT||!Array.isArray(d.records)||!d.records.every(valid))throw Error('Formato ou dados incompatíveis');let added=0,preserved=0;d.records.forEach(r=>{if(historyDB.some(x=>x.id===r.id)){preserved++;return}historyDB.push(r);added++});if(!persist(KEY,historyDB))throw Error('Não foi possível gravar');renderHistory();msg(added+' registros importados; '+preserved+' IDs anteriores preservados.')}catch(e){msg('Importação recusada: '+e.message)}finally{ev.target.value=''}});
const checklist=['Adequação ao tema, ao gênero e ao comando','Contextualização, recorte e tese','Dois eixos coerentes','Tópicos frasais desenvolvidos','Exemplos, explicações e consequências','Coesão, coerência e progressão','Conclusão conforme o edital','Ortografia, concordância, regência e pontuação'];
checklist.forEach(label=>{const row=document.createElement('label'),check=document.createElement('input'),s=document.createElement('span');row.className='wr-check';check.type='checkbox';s.textContent=label;check.onchange=()=>el('check-count').textContent=el('check').querySelectorAll('input:checked').length+'/'+checklist.length+' itens autoconferidos (não é nota)';row.append(check,s);el('check').append(row)});el('check-count').textContent='0/'+checklist.length+' itens autoconferidos (não é nota)';
[['r-example','r-theme'],['d-example','d-theme']].forEach(([example,theme])=>el(example).addEventListener('change',function(){if(!this.value)return;el(theme).value=this.value;saveDraft();msg('Enunciado autoral selecionado.');this.value=''}));
root.querySelectorAll('[data-wraction]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.wraction;if(a==='save')saveVersion();else if(a==='copy')copyPrompt();else if(a==='new')newTask();else if(a==='export')exportBackup();else if(a==='method')showTab('method');else if(a==='cards')section('cartoes')}));
fill('red',draft.red||{});fill('disc',draft.disc||{});
if(location.hash==='#redacao')section('redacao');
window.addEventListener('hashchange',()=>{if(location.hash==='#redacao')section('redacao')});
window.BancoMestreEscritaV130={export:exportBackup,get count(){return historyDB.length}};
})();


;
/* 68 assets/v302_redacao_internal.js */
/* V302 — Redação integrada à navegação do Banco Mestre.
 * A página original V296 continua intacta, dentro do portal. Ao mudar de
 * seção, a janela principal não recarrega e o token OAuth em memória permanece.
 * Nenhuma credencial é enviada ou copiada para o iframe.
 */
(function(){
'use strict';
if(window.BM302RedacaoDentroPortal)return;
const TARGET='./redacao_temas_treino_v296.html?versao=V296';
const HASH='#redacao-oficina';
let host=null,iframe=null;
const $=id=>document.getElementById(id);
function ensure(){
 if(host?.isConnected)return host;
 const main=document.querySelector('main');
 if(!main)return null;
 host=$('bm302-redacao-shell');
 if(!host){
  host=document.createElement('section');host.id='bm302-redacao-shell';
  host.className='bm302-redacao-section';
  host.style.cssText='display:none;max-width:100%;padding:0';
  iframe=document.createElement('iframe');
  iframe.id='bm302-redacao-original';
  iframe.title='Oficina completa de Redação — Banco Mestre';
  iframe.loading='lazy';
  iframe.referrerPolicy='same-origin';
  iframe.style.cssText='border:1px solid #cad4dc;background:#fff;width:100%;height:calc(100vh - 180px);min-height:570px;display:block';
  iframe.addEventListener('load',()=>{
   // Links de retorno da página original levam à seção Assuntos do portal pai,
   // em vez de carregar um segundo Banco Mestre dentro do iframe.
   try{
    const doc=iframe.contentDocument;
    doc?.addEventListener('click',event=>{
     const anchor=event.target.closest?.('a[href]');
     if(!anchor)return;
     const url=new URL(anchor.getAttribute('href'),iframe.contentWindow.location.href);
     if(url.origin===location.origin&&/\/(?:index\.html)?$/.test(url.pathname)){
      event.preventDefault();
      showSection('assuntos');
     }
    },true);
   }catch(_){/* O portal pai permanece conectado mesmo se não for possível inspecionar o iframe. */}
  });
  host.append(iframe);main.append(host);
 }
 iframe=$('bm302-redacao-original');
 return host;
}
function showSection(id){
 const nav=document.querySelector('header nav[aria-label="Seções"]')||document.querySelector('header nav');
 const main=document.querySelector('main');
 if(!main||!nav)return;
 main.querySelectorAll(':scope > section').forEach(s=>s.classList.toggle('active',s.id===id));
 nav.querySelectorAll('button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===(id==='bm302-redacao-shell'?'redacao':id)));
 if(id!=='bm302-redacao-shell'){
  const target=nav.querySelector('button[data-page="'+id+'"]');
  if(target){target.click();return;}
 }
}
function show(){
 const shell=ensure();if(!shell)return;
 const main=document.querySelector('main'),nav=document.querySelector('header nav');
 if(!main||!nav)return;
 main.querySelectorAll(':scope > section').forEach(s=>s.classList.toggle('active',s===shell));
 nav.querySelectorAll('button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='redacao'));
 shell.style.display='block';
 if(iframe&&!iframe.getAttribute('src'))iframe.setAttribute('src',TARGET);
 if(location.hash!==HASH)history.replaceState(history.state,'',location.pathname+location.search+HASH);
 document.dispatchEvent(new CustomEvent('bm302-section-changed',{detail:{section:'redacao',oauthUnchanged:true}}));
 window.scrollTo({top:0,behavior:'instant'});
}
function hideOnOtherSection(){
 if(!host)return;
 const active=host.classList.contains('active');
 host.style.display=active?'block':'none';
}
function init(){
 const nav=document.querySelector('header nav');
 if(!nav)return;
 ensure();
 // Captura antes dos onclick legados que navegavam para uma nova página.
 nav.addEventListener('click',e=>{
  const button=e.target.closest?.('button[data-page]');
  if(button?.dataset.page==='redacao'){
   e.preventDefault();e.stopImmediatePropagation();show();return;
  }
  // Toda navegação normal conserva o documento e o gerenciador de Drive.
  if(button)queueMicrotask(hideOnOtherSection);
 },true);
 window.addEventListener('hashchange',()=>{
  if(location.hash==='#redacao'||location.hash===HASH)show();
  else queueMicrotask(hideOnOtherSection);
 });
 window.addEventListener('popstate',()=>{
  if(location.hash==='#redacao'||location.hash===HASH)show();
  else queueMicrotask(hideOnOtherSection);
 });
 if(location.hash==='#redacao'||location.hash===HASH)show();
}
window.BM302RedacaoDentroPortal=Object.freeze({open:show});
window.BancoMestreRedacaoV146=Object.freeze({abrir:show});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();


;
/* 69 assets/v237_legal_taxonomy.js */
/* V225 — organização jurídica a partir da disciplina/assunto já cadastrados.
 * TRT operacionais são somente índices de apresentação, SEM integração indevida no SRS. */
(function(){
'use strict';
if(window.BM225LegalTaxonomy)return;
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const paths=[];
const CATS=Object.freeze([
 {id:'leg_constitucional',label:'Direito Constitucional'},
 {id:'leg_administrativo',label:'Direito Administrativo e servidores'},
 {id:'leg_etica',label:'Ética profissional — Confea'},
 {id:'leg_urbanistico',label:'Legislação urbanística e fundiária'},
 {id:'leg_ambiental',label:'Legislação ambiental'},
 {id:'leg_licitacoes',label:'Licitações e contratos'},
 {id:'leg_local',label:'Legislação estadual e municipal'},
 {id:'leg_saneamento',label:'Regulação de saneamento'},
 {id:'leg_outras',label:'Outras leis gerais e garantias'}
]);
function isLegal(c){return c?.group==='LEGISLACAO'||/^TRT0[12]-C\d{3}$/.test(c?.id||'')||/legisl|direito/i.test(c?.discipline||'');}
function general(c){
 if(!isLegal(c))return null;
 // O campo antigo de disciplina é genérico (ex.: 'Legislação / Ética').
 // Classificar pelo assunto/subassunto documentados, não por esse rótulo herdado.
 const s=norm([c.subject,c.sub].join(' '));
 if(/^TRT02-C\d{3}$/.test(c.id||''))return 'leg_administrativo';
 if(/^TRT01-C\d{3}$/.test(c.id||'')||/direito constitucional|constitui(c|ç)ao|cf\/?88|principios fundamentais|preambulo/.test(s))return 'leg_constitucional';
 if(/codigo municipal|municipal|decreto rs|legislacao local|legislacao estadual|diretrizes urbanisticas municipais/.test(s))return 'leg_local';
 if(/lei 14\.133|licitac|contrato administrativo|projeto executivo/.test(s))return 'leg_licitacoes';
 if(/licenciamento ambiental|conama|eia|rima|meio ambiente|ambiental/.test(s))return 'leg_ambiental';
 if(/confea|crea|etica/.test(s))return 'leg_etica';
 if(/estatuto da cidade|reurb|regularizacao fundiaria|parcelamento do solo|plano diretor|mobilidade urbana|urbanistic/.test(s))return 'leg_urbanistico';
 if(/saneamento basico|lei 11\.445/.test(s))return 'leg_saneamento';
 if(/improbidade|transparencia|servidor|regime juridico|jurisprudencia.*concurso|agente publico|administrativ|acumulacao/.test(s))return 'leg_administrativo';
 return 'leg_outras';
}
const records=new Map();
let loadPromise=null;
async function load(){
 if(loadPromise)return loadPromise;
 loadPromise=(async()=>{
  const results=await Promise.allSettled(paths.map(async ([id,path])=>{
   const resp=await fetch(path,{cache:'no-store'});
   if(!resp.ok)throw Error(path+' HTTP '+resp.status);
   const c=await resp.json();
   if(c.id!==id||!Array.isArray(c.layers)||c.layers.length!==11)throw Error('TRT inconsistente: '+id);
   return Object.freeze({id,group:'LEGISLACAO',discipline:c.discipline||'Direito Constitucional',
    subject:c.subject||'',sub:c.sub||'',front:c.front||'',back:c.back||'',active:true,
    operational:true,source:'trt_catalog_public',images:c.images?.length||0});
  }));
  let errorCount=0;
  for(const r of results){if(r.status==='fulfilled')records.set(r.value.id,r.value);else errorCount++;}
  document.dispatchEvent(new CustomEvent('bm225-legal-records',{detail:{count:records.size,errors:errorCount}}));
  return {count:records.size,errors:errorCount};
 })();
 return loadPromise;
}
const api=Object.freeze({
 general,isLegal,load,categories:CATS,
 byId:id=>records.get(id)||null,
 all:()=>[...records.values()],
 get loaded(){return records.size},
 get expected(){return paths.length}
});
window.BM225LegalTaxonomy=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void load()},{once:true});else void load();
})();

;
/* 70 assets/v269_flash_filters.js */
/* V269 — coerência entre índice textual e contagem dos filtros de cartões. */
/* V236 — TRT02-C006: tutela/autotutela, filtros e SRS preservados. */
/* V235 — TRT02-C005 incluído; preserve os filtros e SRS. */
/* V232 — TRT02-C004 acrescentado; filtros preservados. */
/* V231 — TRT02-C002 incluído na taxonomia, mantendo regras de busca. */
/* V225 — filtros jurídicos por área; TRT contados sem alterar base/SRS. */
/* Banco Mestre V152 — filtros encadeados de flashcards.
 * Somente apresentação: preserva IDs, texto, grifos e SRS.
 */
(function(){
'use strict';
if(window.BM152FlashFilters)return;
const byId=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const DISC=[
 {id:'eng',label:'Engenharia Civil'},
 {id:'port',label:'Português'},
 {id:'math',label:'Matemática, Lógica e Estatística'},
 {id:'leg',label:'Legislação'},
 {id:'info',label:'Informática'},
 {id:'outros',label:'Sem disciplina identificada'}
];
const CAT=[...(window.BM128General?.categories||[]),...(window.BM225LegalTaxonomy?.categories||[]),{id:'sem_classificacao',label:'Assunto geral não classificado'}];
const state={disc:'all',general:'all',subject:'all',sub:'all'};
let lastLegacy=byId('bm128CardGeneral')?.value||'all';
function subject(c){return String(c.subject||'').trim()||'Assunto não cadastrado'}
function sub(c){return String(c.sub||'').trim()||'Sem subassunto informado'}
function area(c){
 // V243: três cartões de testes de hipóteses pertencem a Estatística,
 // embora tenham sido armazenados no grupo legado ENG_GERAL.
 if(norm(c.discipline)==='estatistica')return 'math';
 const g=String(c.group||'');
 if(c.provisional||g==='LEGISLACAO')return 'leg';
 if(g==='MATEMATICA')return 'math';
 if(g==='PORTUGUES')return 'port';
 if(g==='INFORMATICA')return 'info';
 if(g==='ENG_GERAL'||g.startsWith('ENG_'))return 'eng';
 const d=norm(c.discipline);
 if(/engenharia|estrutura|geotecnia|materiais|saneamento|seguranca|planejamento|topografia/.test(d))return'eng';
 if(/legislacao|direito/.test(d))return'leg';
 if(/matematica|estatistica/.test(d))return'math';
 if(/portugues/.test(d))return'port';
 return'outros';
}
function general(c){
 const law=window.BM225LegalTaxonomy?.general(c);
 if(law)return law;
 if(area(c)==='outros')return 'sem_classificacao';
 return window.BM128General?.classificationOf?.(c)||'sem_classificacao';
}
function exact(){return /^(?:CARD-\d{4,}|IJUI-[A-Za-z0-9_-]+|PROP-IJUI-\d+|TRT0[12]-C\d{3})$/i.test(byId('cardSearch')?.value.trim()||'')}
function matches(c){
 if(exact()||(typeof focusGroup!=='undefined'&&focusGroup))return true;
 return (state.disc==='all'||area(c)===state.disc)&&
  (state.general==='all'||general(c)===state.general)&&
  (state.subject==='all'||subject(c)===state.subject)&&
  (state.sub==='all'||sub(c)===state.sub);
}
const controls=byId('cartoes')?.querySelector('.controls');
if(!controls)return;
const panel=document.createElement('div');panel.id='bm152Filters';panel.className='bm152Filters';panel.setAttribute('aria-label','Filtros encadeados de flashcards');
function makeField(id,label){
 const wrap=document.createElement('label');wrap.className='bm152Field';
 const span=document.createElement('span');span.textContent=label;
 const sel=document.createElement('select');sel.id=id;sel.setAttribute('aria-label',label);
 wrap.append(span,sel);panel.append(wrap);return sel;
}
const discSel=makeField('bm152Discipline','1. Disciplina');
const generalSel=makeField('bm152General','2. Assunto geral');
const subjectSel=makeField('bm152Subject','3. Assunto específico');
const subSel=makeField('bm152Sub','4. Subassunto');
const footer=document.createElement('div');footer.className='bm152FilterFooter';
const status=document.createElement('div');status.id='bm152FilterStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const reset=document.createElement('button');reset.type='button';reset.id='bm152Reset';reset.textContent='Limpar filtros';
footer.append(status,reset);panel.append(footer);controls.before(panel);
const css=document.createElement('style');
css.textContent=[
 '#cartoes #cardFilter,#cartoes #bm128CardGeneral,#cartoes .bm128FineRefine{display:none!important}',
 '#cartoes .bm152Filters{box-sizing:border-box;border:1px solid #d2dfde;background:#f8fbfa;border-radius:12px;padding:14px;margin:12px 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}',
 '#cartoes .bm152Field{display:flex;min-width:0;flex-direction:column;gap:5px;font-weight:700;color:#244751;font-size:12px}',
 '#cartoes .bm152Field select{box-sizing:border-box;width:100%;min-width:0;max-width:100%;border:1px solid #b9cbce;background:#fff;color:#183c45;border-radius:8px;padding:9px;font:500 13px system-ui,Arial,sans-serif;min-height:42px}',
 '#cartoes .bm152Field select:focus-visible{outline:3px solid #55aab1;outline-offset:2px}',
 '#cartoes .bm152Field select:disabled{opacity:.58;background:#eef2f2}',
 '#cartoes .bm152FilterFooter{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #e0e9e8;padding-top:11px;margin-top:2px}',
 '#cartoes #bm152FilterStatus{color:#526a70;font-size:12px;line-height:1.5;flex:1;min-width:190px}',
 '#cartoes #bm152Reset{min-height:37px;font-size:12px;padding:8px 12px;white-space:nowrap}',
 '@media(max-width:990px){#cartoes .bm152Filters{grid-template-columns:repeat(2,minmax(0,1fr))}}',
 '@media(max-width:570px){#cartoes .bm152Filters{grid-template-columns:1fr;padding:11px;gap:9px}#cartoes .bm152FilterFooter{align-items:stretch}#cartoes #bm152Reset{width:100%}}'
].join('\n');
document.head.append(css);
function available(){
 if(typeof cards==='undefined'||!Array.isArray(cards))return[];
 let excluded=new Set();
 try{if(!byId('cardHidden')?.checked&&typeof hidden==='function')excluded=hidden('CARD')}catch(_){}
 const showInactive=!!byId('bm119ShowInactive')?.checked;
 const base=cards.filter(c=>c&&(showInactive||c.provisional||c.active!==false)&&!excluded.has(c.id));
 const trt=window.BM225LegalTaxonomy?.all?.()||[];
 const ids=new Set(base.map(c=>c.id));
 return [...base,...trt.filter(c=>!ids.has(c.id)&&window.BM236TrtCardsGrid?.isHidden?.(c.id)!==true)]; // Navegação TRT sem alterar SRS.
}
function counter(arr,fn){
 const m=new Map();for(const x of arr){const id=fn(x);m.set(id,(m.get(id)||0)+1)}return m;
}
function option(text,value){return new Option(text,value)}
function fill(sel,all,arr,selected){
 sel.replaceChildren(option(all,'all'));
 for(const item of arr)sel.add(option(item.label+' ('+item.count+')',item.value));
 if(selected!=='all'&&!arr.some(x=>x.value===selected))sel.add(option(selected+' (0 nesta busca)',selected));
 sel.value=selected;
 return sel.value;
}
function sorted(map,labels){
 return [...map].filter(([key,value])=>value>0).map(([key,value])=>({value:key,count:value,label:labels?.get(key)||key}))
 .sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR'));
}
function syncTopicLink(){
 const current=byId('bm128CardGeneral')?.value||'all';
 if(current!==lastLegacy){
  if(current!=='all'&&CAT.some(c=>c.id===current)){
   state.disc='all';state.general=current;state.subject='all';state.sub='all';
  }else if(lastLegacy!=='all'){
   state.general='all';state.subject='all';state.sub='all';
  }
  lastLegacy=current;
 }
}
function updateOptions(){
 const q=norm(byId('cardSearch')?.value.trim()||'');
 const all=available().filter(c=>!q||norm([c.id,c.front,c.back,c.discipline,c.subject,c.sub,c.search_keywords,c.reference].filter(Boolean).join(' ')).includes(q));
 const dc=counter(all,area);
 const officialIds=new Set(cards.map(c=>c.id));
 const official=all.filter(c=>officialIds.has(c.id)).length;
 const extra=all.length-official;
 const allLabel='Todas as disciplinas ('+official.toLocaleString('pt-BR')+(extra?' + '+extra.toLocaleString('pt-BR')+' TRT':'')+')';
 state.disc=fill(discSel,allLabel,
  DISC.filter(x=>dc.has(x.id)).map(x=>({...x,value:x.id,count:dc.get(x.id)})),state.disc);
 const a=all.filter(c=>state.disc==='all'||area(c)===state.disc);
 const labels=new Map(CAT.map(x=>[x.id,x.label]));
 state.general=fill(generalSel,'Todos os assuntos gerais ('+a.length+')',sorted(counter(a,general),labels),state.general);
 const b=a.filter(c=>state.general==='all'||general(c)===state.general);
 state.subject=fill(subjectSel,'Todos os assuntos específicos ('+b.length+')',sorted(counter(b,subject)),state.subject);
 const c=b.filter(x=>state.subject==='all'||subject(x)===state.subject);
 if(state.subject==='all'){
  state.sub='all';subSel.replaceChildren(option('Escolha primeiro um assunto específico','all'));subSel.disabled=true;
 }else{
  state.sub=fill(subSel,'Todos os subassuntos ('+c.length+')',sorted(counter(c,sub)),state.sub);
  subSel.disabled=false;
 }
 for(const sel of [discSel,generalSel,subjectSel,subSel])sel.title=sel.selectedOptions[0]?.textContent||'';
 const chosen=[];
 if(state.disc!=='all')chosen.push(DISC.find(x=>x.id===state.disc)?.label||state.disc);
 if(state.general!=='all')chosen.push(labels.get(state.general)||state.general);
 if(state.subject!=='all')chosen.push(state.subject);
 if(state.sub!=='all')chosen.push(state.sub);
 const title=chosen.length?chosen.join(' › '):'Todas as disciplinas e assuntos';
 const matchCount=all.filter(matches).length;
 const matched=all.filter(matches);
 const officialMatched=matched.filter(c=>officialIds.has(c.id)).length;
 status.textContent=title+' · '+officialMatched.toLocaleString('pt-BR')+' do catálogo'+(matchCount>officialMatched?' + '+(matchCount-officialMatched).toLocaleString('pt-BR')+' TRT externos':'')+(q?' · busca textual aplicada':'');
}
function apply(){
 if(byId('cardFilter'))byId('cardFilter').value='all';
 if(byId('cardTopicFilter'))byId('cardTopicFilter').value='all';
 const old=byId('bm128CardGeneral');if(old)old.value='all';lastLegacy='all';
 if(typeof focusGroup!=='undefined')focusGroup='';
 if(typeof cardLimit!=='undefined')cardLimit=24;
 cardRender();
}
discSel.onchange=()=>{state.disc=discSel.value;state.general='all';state.subject='all';state.sub='all';apply()};
generalSel.onchange=()=>{state.general=generalSel.value;state.subject='all';state.sub='all';apply()};
subjectSel.onchange=()=>{state.subject=subjectSel.value;state.sub='all';apply()};
subSel.onchange=()=>{state.sub=subSel.value;apply()};
reset.onclick=()=>{
 state.disc='all';state.general='all';state.subject='all';state.sub='all';
 if(byId('cardSearch'))byId('cardSearch').value='';
 for(const id of ['cardReviewedOnly','cardRecoveredOnly'])if(byId(id))byId(id).checked=false;
 apply();
};
const previousRender=cardRender;
cardRender=function(){syncTopicLink();updateOptions();previousRender();updateOptions()};
window.BM152FlashFilters=Object.freeze({matches,get selection(){return {...state}},reset:()=>reset.click(),general,area,subject,sub});
 document.addEventListener('bm225-legal-records',()=>{if(typeof cardRender==='function')cardRender();});
cardRender();
})();

;
/* 71 assets/v192_pdf_check.js */
/* Banco Mestre V192 — verificação correta do catálogo PDF vigente V149.
   Exige os 78 PDFs ativos, incluindo 34 capítulos V002. Não altera arquivos nem grifos. */
(function(){
'use strict';
if(window.BancoMestrePDFCheckV151)return;
const EXPECTED=78;
const CATALOG='assets/pdf_catalog_v149.json';
const root=document.querySelector('#pdfs .panel');
if(!root)return;
const line=document.createElement('div');line.id='bm151-pdf-check';
line.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 0';
const status=document.createElement('span');status.setAttribute('role','status');
status.setAttribute('aria-live','polite');
status.textContent='Catálogo principal: 78 PDFs (34 capítulos V002). Documentos adicionais do Drive não estão incluídos nesse número inicial.';
const button=document.createElement('button');button.type='button';
button.textContent='↻ Verificar PDFs';
line.append(status,button);
root.insertBefore(line,document.getElementById('pdfAreaNavV036')||root.firstChild);
function currentDocs(){
 try{return typeof docs!=='undefined'&&Array.isArray(docs)?docs:null;}
 catch(_){return null;}
}
function rowsReady(){
 const rows=document.getElementById('pdfRows');
 return !!(rows&&(rows.children.length>0||rows.textContent.trim()));
}
function waitForRows(){
 if(rowsReady())return Promise.resolve(true);
 const rows=document.getElementById('pdfRows');
 if(!rows)return Promise.resolve(false);
 return new Promise(resolve=>{
  let done=false;let observer;
  const finish=ok=>{if(done)return;done=true;if(observer)observer.disconnect();resolve(ok)};
  observer=new MutationObserver(()=>{if(rowsReady())finish(true)});
  observer.observe(rows,{childList:true,subtree:true,characterData:true});
  setTimeout(()=>finish(rowsReady()),5000);
 });
}
let running=null;
function verify(){
 if(running)return running;
 running=(async()=>{
  button.disabled=true;
  status.textContent='Conferindo o catálogo e montando a lista de PDFs…';
  try{
   const response=await fetch(CATALOG,{cache:'no-store'});
   if(!response.ok)throw Error('catálogo indisponível (HTTP '+response.status+')');
   const catalog=await response.json();
   if(catalog.format!=='BancoMestrePDFCatalogV140'||
      catalog.documents?.length!==EXPECTED||
      new Set(catalog.documents.map(d=>d.id)).size!==EXPECTED||
      catalog.documents.filter(d=>/^CAP-V002-\d{2}$/.test(d.id)).length!==34)
    throw Error('catálogo vigente incompleto ou incompatível');
   const needed=new Set(catalog.documents.map(d=>d.id));
   let loaded=currentDocs();
   if(!loaded||![...needed].every(id=>loaded.some(d=>d.id===id))){
    if(typeof pdfInit!=='function')throw Error('inicialização da biblioteca não disponível');
    await pdfInit();
    loaded=currentDocs();
   }
   if(!loaded||![...needed].every(id=>loaded.some(d=>d.id===id)))
    throw Error('os 78 PDFs não entraram na biblioteca');
   if(typeof pdfRender==='function')pdfRender();
   const displayed=await waitForRows();
   if(!displayed)throw Error('a lista não foi desenhada; use Verificar PDFs novamente');
   const rows=document.getElementById('pdfRows');
   const errors=rows?.textContent||'';
   if(/^(?:Erro ao carregar PDFs|Catálogo incompatível|Erro na biblioteca PDF)/i.test(errors.trim()))
    throw Error(errors.trim().slice(0,150));
   status.textContent='✓ Os 78 PDFs do catálogo principal foram conferidos (34 capítulos V002). Outros documentos podem surgir após autenticação do Drive.';
   line.dataset.ok='yes';
  }catch(error){
   status.textContent='Falha na biblioteca PDF: '+error.message;
   line.dataset.ok='no';
   console.warn('Verificação PDFs V151:',error);
  }finally{button.disabled=false}
 })().finally(()=>{running=null});
 return running;
}
button.onclick=()=>{void verify()};
document.querySelector('header nav [data-page="pdfs"]')?.addEventListener('click',()=>{void verify()});
window.BancoMestrePDFCheckV151={verify};
})();

;
/* 72 assets/v209_image_single_library.js */
/* Banco Mestre V209 — filtros de imagens no padrão dos flashcards e catálogo ativo de 86 imagens.
 * O renderizador V060 mantém favoritos, textos editáveis, originais e o leitor.
 * Este módulo apenas filtra por grupo e posiciona os cartões gerados pelo motor original.
 */
(function(){
'use strict';
if(window.BM153ImageLibrary)return;
const $=id=>document.getElementById(id);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const section=$('imagens'),panel=section?.querySelector('.panel');
const rows=$('imageRows'),more=$('moreImages');
if(!panel||!rows||!more)return;
const originalParent=rows.parentNode;
const directory=document.createElement('div');
directory.id='bm153Directory';directory.className='bm153Directory';
const heading=document.createElement('div');heading.className='bm153Heading';
const h=document.createElement('strong');h.textContent='Imagens organizadas por assunto';
const help=document.createElement('span');help.textContent='Abra um grupo para consultar suas imagens, editar cartões ou continuar grifos.';
heading.append(h,help);
const areaNav=document.createElement('div');areaNav.className='bm153AreaNav';areaNav.id='bm153AreaNav';
const toolbar=document.createElement('div');toolbar.className='bm153Toolbar';
const groupLabel=document.createElement('label');groupLabel.textContent='Grupo temático';
const groupSel=document.createElement('select');groupSel.id='bm153GroupSelect';groupSel.setAttribute('aria-label','Selecionar grupo de imagens');
groupLabel.append(groupSel);
const status=document.createElement('span');status.id='bm153Status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
toolbar.append(groupLabel,status);
const listing=document.createElement('div');listing.id='bm153GroupListing';
const filters=document.createElement('div');filters.id='bm155ImageFilters';filters.className='bm155ImageFilters';
function field(id,labelText){
 const label=document.createElement('label');label.className='bm155Field';
 const title=document.createElement('span');title.textContent=labelText;
 const sel=document.createElement('select');sel.id=id;sel.setAttribute('aria-label',labelText);
 label.append(title,sel);filters.append(label);return sel;
}
const discSel=field('bm155DisciplinaImagem','1. Disciplina');
const generalSel=field('bm155AssuntoGeralImagem','2. Assunto geral');
const specificSel=field('bm155AssuntoEspecificoImagem','3. Assunto específico');
const subSel=field('bm155SubassuntoImagem','4. Subassunto');
const foot=document.createElement('div');foot.className='bm155Foot';
const summary155=document.createElement('span');summary155.id='bm155FilterSummary';summary155.setAttribute('role','status');summary155.setAttribute('aria-live','polite');
const reset155=document.createElement('button');reset155.id='bm155Reset';reset155.type='button';reset155.textContent='Limpar filtros';
foot.append(summary155,reset155);filters.append(foot);
directory.append(heading,filters,areaNav,toolbar,listing);
const results=document.createElement('div');results.id='bm153Results';
const controls=panel.querySelector('.controls');
const filterSummary=$('imageIndexV044');
if(filterSummary)filterSummary.after(directory);
else if(controls)controls.after(directory);
else rows.before(directory);
directory.after(results);
results.append(rows,more);
const sheet=document.createElement('style');
sheet.textContent=[
 '#imagens .bm155ImageFilters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:10px 0 12px}',
 '#imagens .bm155Field{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:12px;font-weight:700;color:#264d54}',
 '#imagens .bm155Field select{font:500 13px system-ui,Arial,sans-serif;box-sizing:border-box;width:100%;min-width:0;max-width:100%;border:1px solid #b8cdca;border-radius:8px;background:#fff;padding:9px;min-height:42px;color:#183d44}',
 '#imagens .bm155Field select:focus-visible{outline:3px solid #72b8b9;outline-offset:2px}',
 '#imagens .bm155Field select:disabled{opacity:.6;background:#eef2f2}',
 '#imagens .bm155Foot{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #dce9e7;padding-top:10px}',
 '#imagens #bm155FilterSummary{flex:1;min-width:180px;color:#576f75;font-size:12px;line-height:1.5}',
 '#imagens #bm155Reset{min-height:36px;font-size:12px;border-radius:8px;padding:8px 12px}',
 '#imagens .bm153AreaNav,#imagens .bm153Toolbar{display:none!important}',
 'html[data-bm238-drive-filters="active"] #imagens #imageFilter{display:none!important}',
 '#imagens #bm153GroupListing[hidden]{display:none!important}',
 '#imagens .bm155Help{font-size:12px;color:#61787d;margin:8px 0}',
 '@media(max-width:900px){#imagens .bm155ImageFilters{grid-template-columns:repeat(2,minmax(0,1fr))}}',
 '@media(max-width:560px){#imagens .bm155ImageFilters{grid-template-columns:1fr}#imagens #bm155Reset{width:100%}}',
 '#imagens .bm153Directory{border:1px solid #d4e2df;border-radius:12px;background:#f8fbfa;margin:12px 0;padding:13px}',
 '#imagens .bm153Heading{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px 14px;margin-bottom:11px}',
 '#imagens .bm153Heading strong{font-size:15px;color:#22484d}',
 '#imagens .bm153Heading span{font-size:12px;color:#607a7d}',
 '#imagens .bm153AreaNav{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:11px}',
 '#imagens .bm153AreaNav button{min-height:36px;border-radius:19px;border:1px solid #bad0ce;background:#fff;color:#26545b;padding:8px 11px;font-size:12px}',
 '#imagens .bm153AreaNav button[aria-pressed="true"]{background:#1d666c;border-color:#1d666c;color:#fff;font-weight:700}',
 '#imagens .bm153Toolbar{display:flex;align-items:end;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #e1eae8;padding:10px 0 0}',
 '#imagens .bm153Toolbar label{display:flex;flex-direction:column;gap:5px;flex:1;max-width:420px;min-width:min(100%,240px);font-size:12px;font-weight:700}',
 '#imagens .bm153Toolbar select{width:100%;box-sizing:border-box;border-radius:7px;border:1px solid #b9cfcc;min-height:40px;padding:8px;background:#fff;color:#254751;font-size:13px}',
 '#imagens .bm153Toolbar #bm153Status{font-size:12px;color:#536f71;flex:1;min-width:195px}',
 '#imagens .bm153AreaBlock{margin:13px 0 18px}',
 '#imagens .bm153AreaHeader{display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;align-items:center;padding:5px 1px 9px;border-bottom:1px solid #d3e2e0}',
 '#imagens .bm153AreaHeader strong{font-size:15px;color:#234d53}',
 '#imagens .bm153AreaHeader span{font-size:12px;color:#587377}',
 '#imagens .bm153AreaBlock>p{font-size:12px;margin:7px 0;color:#698084}',
 '#imagens details.bm153Group{border:1px solid #d2e1df;background:#fff;border-radius:9px;margin:8px 0;overflow:hidden}',
 '#imagens details.bm153Group>summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:11px 12px;min-height:42px}',
 '#imagens details.bm153Group>summary strong{font-size:13px;color:#264a50}',
 '#imagens details.bm153Group>summary small{font-size:11px;color:#6c8183;display:block;margin-top:4px;font-weight:400}',
 '#imagens details.bm153Group[open]>summary{border-bottom:1px solid #e2eeeb;background:#f2f8f6}',
 '#imagens .bm153GroupBody{padding:12px}',
 '#imagens .bm153GroupBody #imageRows{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:10px}',
 '#imagens .bm153GroupBody #imageRows>article.card{min-width:0;margin:0}',
 '#imagens #bm153Results{margin-top:10px}',
 '#imagens #bm153Results:not(.bm153Browsing){display:none!important}',
 '#imagens #imageRows[hidden],#imagens #moreImages[hidden]{display:none!important}',
 '#imagens .bm153Guide{font-size:12px;color:#657e81;line-height:1.5;margin:9px 0 0}',
 '#imagens #bm084-sync{margin-top:24px!important}',
 '@media(max-width:680px){#imagens .bm153Directory{padding:10px}#imagens details.bm153Group>summary{padding:10px}#imagens .bm153GroupBody{padding:9px}#imagens .bm153GroupBody #imageRows{grid-template-columns:1fr}}'
].join('\n');document.head.append(sheet);
const groupState={area:'all',group:'all'};
const state={disc:'all',general:'all',specific:'all',sub:'all'};
let driveRecords=null;
const pending='__pendente__';
const driveKeys=m=>({
 disc:String(m?.area||'').trim()||pending,
 general:String(m?.subject||'').trim()||pending,
 specific:String(m?.subsubject||'').trim()||pending,
 sub:String(m?.detail||'').trim()||pending
});
function driveMatches(m){
 if(driveRecords===null)return true;
 const keys=driveKeys(m);
 return Object.entries(state).every(([k,v])=>v==='all'||keys[k]===v);
}
function driveChoices(items,key){
 const counts=new Map();
 for(const m of items){
  const v=driveKeys(m)[key];counts.set(v,(counts.get(v)||0)+1);
 }
 return [...counts].map(([value,count])=>({value,count,label:value===pending?'Sem classificação cadastrada':value}))
  .sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR'));
}
function updateDriveOptions(){
 if(driveRecords===null)return;
 const all=driveRecords;
 const fields=[['disc',discSel,'Todas as disciplinas'],['general',generalSel,'Todos os assuntos gerais'],['specific',specificSel,'Todos os assuntos específicos'],['sub',subSel,'Todos os subassuntos']];
 let eligible=all;
 for(const [key,select,label] of fields){
  const options=driveChoices(eligible,key);
  state[key]=fillSelect(select,label+' ('+eligible.length+')',options,state[key]);
  eligible=eligible.filter(m=>state[key]==='all'||driveKeys(m)[key]===state[key]);
  select.disabled=key!=='disc'&&eligible.length===0;
 }
 const pendingCount=all.filter(m=>!m?.classified||!m.area||!m.subject).length;
 summary155.textContent=eligible.length+' de '+all.length+' imagens do Drive nesta seleção · '+pendingCount+' sem classificação completa';
}
function setDriveRecords(items){
 driveRecords=Array.isArray(items)?items:null;
 document.documentElement.dataset.bm238DriveFilters=driveRecords!==null?'active':'inactive';
 const title=heading.querySelector('strong');
 if(title)title.textContent=driveRecords!==null?'Imagens do Drive — filtros por classificação cadastrada':'Imagens organizadas por assunto';
 updateDriveOptions();
}
let classification=null,classPromise=null,classById=new Map();
let config=null,promise=null,openTarget=null,browsing=false,degraded=false;
function loadConfig(){
 if(config)return Promise.resolve(config);
 if(promise)return promise;
 const expected=Array.isArray(imgs)&&imgs.length===179?179:86;
 promise=fetch(expected===179?'assets/image_grupos_v180.json':'assets/image_grupos_v156.json',{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('índice temático indisponível (HTTP '+r.status+')');
  const d=await r.json();
  if(d.format!=='BancoMestreImageGroupsV156'||d.source_count!==expected||
    d.assigned?.length!==expected||new Set(d.assigned.map(x=>x.id)).size!==expected)
   throw Error('índice temático incompatível com as 270 imagens');
  config=d;return d;
 }).catch(err=>{promise=null;throw err});
 return promise;
}

function loadClassification(){
 if(classification)return Promise.resolve(classification);
 if(classPromise)return classPromise;
 const expected=Array.isArray(imgs)&&imgs.length===179?179:86;
 classPromise=fetch(expected===179?'assets/image_classificacao_v180.json':'assets/image_classificacao_v156.json',{cache:'no-store'}).then(async response=>{
  if(!response.ok)throw Error('classificação de imagens indisponível (HTTP '+response.status+')');
  const data=await response.json();
  if(data.format!=='BancoMestreImageClassificationV156'||data.total!==expected||data.records?.length!==expected||data.generals?.length!==(expected===179?14:13)||
     new Set(data.records.map(x=>x.id)).size!==expected)
   throw Error('classificação de imagens V155 incompatível');
  classById=new Map(data.records.map(x=>[x.id,x]));
  classification=data;return data;
 }).catch(e=>{classPromise=null;throw e});
 return classPromise;
}
const classified=x=>classById.get(x.no)||null;
const byDiscipline=(c,d)=>d==='all'||c?.discipline===d||c?.extra_disciplines?.includes(d);
function groupOf(c,d){
 if(d==='leg'&&c?.extra_disciplines?.includes('leg')&&c.discipline!=='leg')return 'legislacao';
 return c?.general||'';
}
function matchesClass(x,override=false){
 if(override)return true;
 const c=classified(x);if(!c)return false;
 if(!byDiscipline(c,state.disc))return false;
 if(state.general!=='all'&&groupOf(c,state.disc)!==state.general&&!(state.disc==='all'&&c.extra_generals?.includes(state.general)))return false;
 if(state.specific!=='all'&&c.specific!==state.specific)return false;
 if(state.sub!=='all'&&(state.sub==='__none__'?Boolean(c.sub):c.sub!==state.sub))return false;
 return true;
}
function classifiedFilterActive(){return Object.values(state).some(x=>x!=='all')}
function optionsFrom(items,fn,labels){
 const map=new Map();
 for(const img of items){
  for(const key of fn(img)){
   if(key===undefined||key===null)continue;
   map.set(key,(map.get(key)||0)+1);
  }
 }
 return [...map].map(([value,count])=>({value,count,label:labels?.get(value)||value})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR'));
}
function fillSelect(sel,allLabel,choices,selected){
 sel.replaceChildren(new Option(allLabel,'all'));
 for(const choice of choices)sel.add(new Option(choice.label+' ('+choice.count+')',choice.value));
 sel.value=choices.some(x=>x.value===selected)?selected:'all';
 return sel.value;
}
function updateClassOptions(eligible){
 if(driveRecords!==null){updateDriveOptions();return;}
 if(!classification)return;
 const discLabels=new Map(classification.disciplines.map(x=>[x.id,x.label]));
 const generalLabels=new Map(classification.generals.map(x=>[x.id,x.label]));
 const discOpts=optionsFrom(eligible,x=>{
  const c=classified(x);return c?[c.discipline,...(c.extra_disciplines||[])]:[];
 },discLabels);
 state.disc=fillSelect(discSel,'Todas as disciplinas ('+eligible.length+')',discOpts,state.disc);
 const a=eligible.filter(x=>byDiscipline(classified(x),state.disc));
 const generalOpts=optionsFrom(a,x=>{
  const c=classified(x);
  return c?[groupOf(c,state.disc),...(state.disc==='all'?(c.extra_generals||[]):[])]:[];
 },generalLabels);
 state.general=fillSelect(generalSel,'Todos os assuntos gerais ('+a.length+')',generalOpts,state.general);
 const b=a.filter(x=>{
  const c=classified(x);
  return state.general==='all'||groupOf(c,state.disc)===state.general||
    (state.disc==='all'&&c.extra_generals?.includes(state.general));
 });
 state.specific=fillSelect(specificSel,'Todos os assuntos específicos ('+b.length+')',
  optionsFrom(b,x=>[classified(x)?.specific]),state.specific);
 const c=b.filter(x=>state.specific==='all'||classified(x)?.specific===state.specific);
 if(state.specific==='all'){
  state.sub='all';subSel.replaceChildren(new Option('Selecione primeiro um assunto específico','all'));subSel.disabled=true;
 }else{
  const details=optionsFrom(c,x=>[classified(x)?.sub||'__none__'],new Map([['__none__','Sem subdivisão cadastrada']]));
  state.sub=fillSelect(subSel,'Todos os subassuntos ('+c.length+')',details,state.sub);
  subSel.disabled=details.length===1&&details[0].value==='__none__';
 }
 const lookup=sel=>sel.options?.[sel.selectedIndex]?.textContent||'';
 const labels=[discSel,generalSel,specificSel,subSel].map(lookup).filter(Boolean);
 const chosen=classifiedFilterActive()?
  [discSel,generalSel,specificSel,subSel].filter(s=>s.value!=='all').map(s=>s.selectedOptions?.[0]?.textContent?.replace(/\s*\(\d+\)$/,'')||s.value).join(' › '):
  'Todas as disciplinas e assuntos';
 summary155.textContent=chosen+' · '+eligible.length+' imagens disponíveis'+(eligible.length===179?'':' neste modo')+
   ' · 86 históricas preservadas + 93 arquivos classificados visualmente';
}
function filterChange(level,value){
 const order=['disc','general','specific','sub'];
 state[level]=value;for(const later of order.slice(order.indexOf(level)+1))state[later]='all';
 groupState.group='all';groupState.area='all';
 // Alterar categoria não apaga a busca textual nem favoritos escolhidos.
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
 document.dispatchEvent(new Event('bm153-drive-filter-change'));
}

const make=(tag,cls,text)=>{
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!==undefined)e.textContent=String(text);
 return e;
};
function labelFor(x){return window.BancoMestreAtlasV060?.textFor?.(x)||{title:x.title,area:x.category,subject:x.category}}
function activeOtherFilters(){
 const search=$('imageSearch')?.value.trim()||'';
 const area=$('imageAreaV044')?.value||'all';
 const category=$('imageFilter')?.value||'all';
 const fav=$('imageFavoriteV055')?.value||'all';
 return Boolean(search)||area!=='all'||category!=='all'||fav==='favorites';
}
function matches(x){
 if(degraded)return true;
 const q=$('imageSearch')?.value.trim()||'';
 const exact=/^IMG-(?:\d{3}|P10-\d{2}|C1[1234]-\d{3})$/i.test(q);
 if(exact)return true;
 if(!matchesClass(x))return false;
 if(groupState.group!=='all'){
  const group=config?.assigned?.find(y=>y.id===x.no)?.group;
  return group===groupState.group;
 }
 return true; // V209: uma galeria com busca, filtros e imagens Drive
}
function setDefaultAdvanced(){
 const e=$('imageSearch');if(e)e.value='';
 for(const id of ['imageAreaV044','imageFilter','imageFavoriteV055']){
  const sel=$(id);if(sel)sel.value='all';
 }
}
function selectGroup(id){
 groupState.group=id;
 setDefaultAdvanced();
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
}
function selectArea(id){
 groupState.area=id;groupState.group='all';setDefaultAdvanced();
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
}
async function beforeCards(hidden,mode){
 try{
  const [d]=await Promise.all([loadConfig(),loadClassification()]);degraded=false;
  const byId=new Map(d.assigned.map(x=>[x.id,x.group]));
  const groupDefs=new Map(d.groups.map(x=>[x.id,x]));
  const source=Array.isArray(imgs)?imgs:[];
  if(source.length!==86&&source.length!==179)throw Error('Atlas incompleto: '+source.length+' imagens');
  const eligible=source.filter(x=>mode==='all'||(hidden.get(x.no)==='hidden')===(mode==='hidden'));
  updateClassOptions(eligible);
  const counts=new Map();
  for(const img of eligible){
   const id=byId.get(img.no);
   if(!id||!groupDefs.has(id))throw Error('Imagem sem grupo: '+img.no);
   counts.set(id,(counts.get(id)||0)+1);
  }
  const areas=d.areas.filter(a=>[...counts].some(([id,n])=>n>0&&groupDefs.get(id)?.area===a.id));
  const validGroups=d.groups.filter(g=>counts.has(g.id)&&(groupState.area==='all'||g.area===groupState.area));
  if(groupState.group!=='all'&&!validGroups.some(x=>x.id===groupState.group))groupState.group='all';
  groupSel.replaceChildren(new Option('Escolha um grupo temático','all'));
  for(const g of validGroups)groupSel.add(new Option(g.label+' ('+counts.get(g.id)+')',g.id));
  groupSel.value=groupState.group;
  areaNav.replaceChildren();
  const entries=[{id:'all',label:'Todas as áreas',count:eligible.length},...areas.map(a=>({id:a.id,label:a.label,count:eligible.filter(x=>groupDefs.get(byId.get(x.no))?.area===a.id).length}))];
  for(const item of entries){
   const b=make('button','',item.label+' ('+item.count+')');
   b.type='button';b.setAttribute('aria-pressed',String(item.id===groupState.area));
   b.onclick=()=>selectArea(item.id);
   areaNav.append(b);
  }
  const listingAnchor=listing;
  listing.replaceChildren();openTarget=null;
  for(const area of areas){
   if(groupState.area!=='all'&&area.id!==groupState.area)continue;
   const members=validGroups.filter(g=>g.area===area.id).sort((a,b)=>a.order-b.order);
   if(!members.length)continue;
   const block=make('div','bm153AreaBlock');
   const header=make('div','bm153AreaHeader');
   header.append(make('strong','',area.label),make('span','',members.reduce((n,g)=>n+(counts.get(g.id)||0),0)+' imagens'));
   block.append(header,make('p','',area.description));
   for(const g of members){
    const details=make('details','bm153Group');details.dataset.group=g.id;
    const summaryEl=make('summary','');
    const caption=make('span','');
    caption.append(make('strong','',g.label),make('small','',g.subtitle));
    summaryEl.append(caption,make('span','',counts.get(g.id)+' imagens'));
    summaryEl.onclick=e=>{e.preventDefault();selectGroup(groupState.group===g.id?'all':g.id)};
    details.append(summaryEl);
    const body=make('div','bm153GroupBody');details.append(body);
    details.open=groupState.group===g.id;
    if(details.open)openTarget=body;
    block.append(details);
   }
   listing.append(block);
  }
  const advanced=activeOtherFilters()||classifiedFilterActive()||window.BM197MediaLinks?.filterActive?.();
  browsing=true; // V209: mostrar sempre a grade principal
  listing.hidden=true; // grupos temáticos permanecem catalogados, não são outro visualizador
  if(groupState.group!=='all'&&openTarget){
   openTarget.append(rows,more);rows.hidden=false;more.hidden=false;
   results.classList.remove('bm153Browsing');
  }else if(browsing){
   results.append(rows,more);rows.hidden=false;more.hidden=false;
   results.classList.add('bm153Browsing');
  }else{
   results.append(rows,more);rows.hidden=true;more.hidden=true;
   results.classList.remove('bm153Browsing');
  }
  status.textContent=eligible.length+' imagens '+(mode==='hidden'?'excluídas':mode==='all'?'no catálogo':'visíveis')+' em '+validGroups.length+' grupos';
  if(classifiedFilterActive())summary155.textContent+=' · filtros encadeados ativos';
  // V209: o Drive não possui uma segunda galeria.
 }catch(err){
  degraded=true;
  console.warn('Biblioteca de imagens V153:',err);
  status.textContent='Organização indisponível: '+err.message;
  // Se o diretório falhar, a renderização original continua acessível.
  results.append(rows,more);rows.hidden=false;more.hidden=false;
  results.classList.add('bm153Browsing');
  browsing=true;
 }
}
function afterCards(selectedCount,visibleCount,scopeCount){
 if(classifiedFilterActive()||activeOtherFilters()||window.BM197MediaLinks?.filterActive?.())summary155.textContent=selectedCount+' imagens encontradas · exibindo '+visibleCount+' · filtros: '+[state.disc,state.general,state.specific,state.sub].filter(x=>x!=='all').join(' › ');
 if(groupState.group==='all'&&!browsing){
  $('imageCount').textContent=scopeCount+' imagens em grupos temáticos';
  const info=$('imageIndexV044');
  if(info)info.textContent='Selecione um grupo para abrir as imagens. Favoritos, título, descrição e observações pessoais permanecem disponíveis no cartão; o acervo original não é alterado.';
 }else{
  const info=$('imageIndexV044');
  if(info&&groupState.group!=='all')info.textContent='Grupo selecionado · exibindo '+visibleCount+' de '+selectedCount+' imagem(ns) · use Mostrar mais para avançar. Favoritos e edição de cartões preservados.';
 }
 if(groupState.group==='all'&&!browsing)more.hidden=true;
}
discSel.onchange=()=>filterChange('disc',discSel.value);
generalSel.onchange=()=>filterChange('general',generalSel.value);
specificSel.onchange=()=>filterChange('specific',specificSel.value);
subSel.onchange=()=>filterChange('sub',subSel.value);
reset155.onclick=()=>{
 for(const key of ['disc','general','specific','sub'])state[key]='all';
 groupState.area='all';groupState.group='all';setDefaultAdvanced();
 for(const id of ['bm218-area-filter','bm218-subject-filter','bm218-status-filter']){
  const field=$(id);if(field)field.value='all';
 }
 const extraSearch=$('bm084-search');if(extraSearch)extraSearch.value='';
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
 document.dispatchEvent(new Event('bm153-drive-filter-change'));
};
groupSel.onchange=()=>selectGroup(groupSel.value);
const oldSearch=$('imageSearch');
oldSearch?.addEventListener('input',()=>{
 if(oldSearch.value.trim()&&groupState.group!=='all')groupState.group='all';
 },true);
window.BM153ImageLibrary=Object.freeze({
 ready:async()=>Promise.all([loadConfig(),loadClassification()]),matches,beforeCards,afterCards,driveMatches,setDriveRecords,
 get filters(){return {...state}}, reset:()=>reset155.click(),
 get selection(){return {...groupState}},
 selectGroup,selectArea,
 preserved:['70 imagens históricas','16 Petrobras 10','favoritos','textos personalizados','originais','visibilidade','SRS']
});
if(Array.isArray(imgs)&&imgs.length)void imgRender();
})();

;
/* 73 assets/v159_atlas_clean_ui.js */
/* Banco Mestre V159 — remove a barra de filtros duplicada do Atlas.
   Preserva os controles exclusivos dentro de opções recolhíveis e mantém
   os elementos legados necessários aos listeners do renderizador V156.
   Não altera catálogos, favoritos, exclusões, IDs ou SRS. */
(function(){
 'use strict';
 function install(){
  const root=document.getElementById('imagens');
  const old=root?.querySelector('.bm-v044-atlas-controls');
  const advanced=root?.querySelector('#bm155ImageFilters');
  if(!root||!old||!advanced||root.classList.contains('bm159-atlas-clean'))return;
  const ids=['imageFavoriteV055','imageSortV044','imageVisibilityV045'];
  if(!ids.every(id=>document.getElementById(id)))return;

  const details=document.createElement('details');
  details.id='bm159AtlasOptions';
  const summary=document.createElement('summary');
  summary.textContent='Mais opções: favoritas, ordenação e imagens ocultas';
  details.appendChild(summary);
  const fields=document.createElement('div');
  fields.className='bm159AtlasFields';
  details.appendChild(fields);

  function moveSelect(id,caption){
   const select=document.getElementById(id);
   const field=document.createElement('label');
   field.className='bm159AtlasField';
   const title=document.createElement('span');
   title.textContent=caption;
   field.append(title,select);
   fields.append(field);
  }
  moveSelect('imageFavoriteV055','Favoritos');
  moveSelect('imageSortV044','Ordenar imagens');
  moveSelect('imageVisibilityV045','Visibilidade local');

  const manage=document.createElement('div');
  manage.className='bm159AtlasManagement';
  const exportButton=document.getElementById('exportExcludedV046');
  const status=document.getElementById('exportExcludedStatusV046');
  if(exportButton)manage.appendChild(exportButton);
  if(status)manage.appendChild(status);
  const note=document.createElement('small');
  note.textContent='Imagens excluídas neste menu são ocultações locais. As 184 removidas do catálogo ativo não são restauradas.';
  manage.appendChild(note);
  details.appendChild(manage);
  advanced.after(details);

  const style=document.createElement('style');
  style.id='bm159AtlasStyle';
  style.textContent=[
   '#imagens.bm159-atlas-clean .bm-v044-atlas-controls{display:none!important}',
   '#imagens #bm159AtlasOptions{border:1px solid #dbe7e5;border-radius:10px;margin:10px 0 14px;background:#fff}',
   '#imagens #bm159AtlasOptions>summary{cursor:pointer;padding:11px 14px;color:#2b5258;font-size:13px;font-weight:650}',
   '#imagens #bm159AtlasOptions>summary:focus-visible{outline:2px solid #31848a;outline-offset:3px}',
   '#imagens .bm159AtlasFields{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:12px;padding:0 14px 12px}',
   '#imagens .bm159AtlasField{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:650;min-width:0}',
   '#imagens .bm159AtlasField select{width:100%;min-width:0;min-height:39px;border-radius:8px;border:1px solid #bfd2ce;padding:8px;background:#fff;color:#17353b;font:500 13px system-ui,Arial,sans-serif}',
   '#imagens .bm159AtlasManagement{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:9px 14px 13px;border-top:1px solid #e2ece9}',
   '#imagens .bm159AtlasManagement small{flex-basis:100%;color:#61777c;font-size:11px}',
   '#imagens #exportExcludedStatusV046{font-size:12px}',
   '@media(max-width:720px){#imagens .bm159AtlasFields{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(style);
  root.classList.add('bm159-atlas-clean');
  window.BancoMestreAtlasUIV159={ready:true,mode:'busca-unificada',preserved:ids};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
})();

;
/* 74 assets/v165_cards_navigation.js */
/* Banco Mestre V165 — navegação exclusivamente na biblioteca + pop-up.
 * Os links antigos ?cartao=ID abrem automaticamente a janela local.
 * Não cria abas, barras individuais, filtros particulares nem eventos SRS. */
(function(){
'use strict';
if(window.BM165CardsNavigation)return;
const root=document.getElementById('cardRows');
if(!root)return;
const valid=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+|TRT0[12]-C\d{3})$/i;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const read=id=>window.BancoMestreVisualizarCardV050?.showId?.(id);
function decorate(){
 for(const article of root.querySelectorAll('article.card')){
  const id=idOf(article);
  if(!valid.test(id))continue;
  article.tabIndex=0;
  article.title='Clique para abrir '+id+' na janela de estudo, sem sair da biblioteca';
  for(const old of article.querySelectorAll(':scope > .bm-open-card,:scope > .bm-open-hint'))old.remove();
 }
}
let scheduled=false;
const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()})};
new MutationObserver(schedule).observe(root,{childList:true,subtree:true});schedule();
root.addEventListener('click',e=>{
 if(e.defaultPrevented)return;
 const article=e.target.closest('article.card');
 if(!article||!root.contains(article))return;
 if(e.target.closest('a,button,input,textarea,select,label,summary,details,form,[contenteditable="true"]'))return;
 const id=idOf(article);if(!valid.test(id))return;
 e.preventDefault();e.stopPropagation();
 read(id);
},true);
root.addEventListener('keydown',e=>{
 if(e.target.tagName!=='ARTICLE'||!e.target.classList.contains('card'))return;
 if(e.key==='Enter'||e.key===' '){
  e.preventDefault();
  const id=idOf(e.target);if(valid.test(id))read(id);
 }
});
const requested=new URLSearchParams(location.search).get('cartao');
async function openDeepLink(){
 if(!requested||!valid.test(requested))return;
 try{
  // Aguarde loadCards concluir, evitando o código individual antigo.
  if(typeof loadCards==='function')await loadCards();
  if(typeof section==='function')section('cartoes');
  for(let attempt=0;attempt<30;attempt++){
   if(read(requested))return;
   await new Promise(resolve=>setTimeout(resolve,120));
  }
  const note=document.createElement('p');
  note.className='bm165-link-missing';note.setAttribute('role','status');
  note.textContent='Não foi possível localizar o cartão '+requested+' nesta biblioteca. Verifique o ID e a conexão.';
  root.prepend(note);
 }catch(error){
  console.warn('Não foi possível abrir o cartão solicitado:',error);
  if(typeof section==='function')section('cartoes');
 }
}
if(requested)void openDeepLink();
window.BM165CardsNavigation=Object.freeze({
 mode:'pop-up',open(id){return valid.test(id)?!!read(id):false},
 get requested(){return requested}
});
})();

;
/* 75 assets/v276_layers_bridge.js */
/* V276: complemento por ID dos 11 módulos publicados; leitura sob demanda, sem SRS ou dados privados. */
(function(){
'use strict';
if(window.BM276LayerData)return;
const known=new Set(["CARD-0118","CARD-0175","CARD-0333","CARD-0468","CARD-0480","CARD-0543","CARD-0547","CARD-0548","CARD-0549","CARD-0551","CARD-0552","CARD-0553","CARD-0579","CARD-0621","CARD-0623","CARD-0624","CARD-0625","CARD-0626","CARD-0629","CARD-0631","CARD-0632","CARD-0642","CARD-1033","CARD-1034","CARD-1386","CARD-1520","CARD-1521","CARD-1522","CARD-1523","CARD-1524","CARD-1525","CARD-1526","CARD-1527","CARD-1528","CARD-1529","CARD-1530","CARD-1531","CARD-1532","CARD-1533","CARD-1413","CARD-1534","CARD-0578","CARD-0924"]);
const cache=new Map();
const source=id=>(id==='CARD-0578'||id==='CARD-0924')?'assets/v277_petro22_relacionados_layers.json?v=277-1':(id==='CARD-1413'||id==='CARD-1534')?'assets/v276_petro22_public_layers.json?v=276-1':'assets/layers_public_v274_sync.json?v=274-1';
async function get(id){
 if(!known.has(id))return null;
 const path=source(id);
 if(!cache.has(path)){
  const p=fetch(path,{cache:'default'}).then(r=>{if(!r.ok)throw Error('Camadas adicionais HTTP '+r.status);return r.json()}).then(obj=>{
   if(!Array.isArray(obj.records))throw Error('Camadas adicionais inválidas');
   const map=new Map();
   for(const it of obj.records){
    if(!it.id||map.has(it.id)||!Array.isArray(it.layers)||it.layers.length!==11||it.layers.some((v,i)=>v.ord!==i+1||!v.titulo||!v.texto))throw Error('11 módulos inválidos: '+it.id);
    map.set(it.id,it);
   }return map;
  });
  cache.set(path,p);p.catch(()=>{if(cache.get(path)===p)cache.delete(path)});
 }
 return (await cache.get(path)).get(id)||null;
}
window.BM276LayerData=Object.freeze({has:id=>known.has(id),get});
})();
