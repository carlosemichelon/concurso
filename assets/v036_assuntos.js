
/* Banco Mestre V036 — trilha de disciplinas, assuntos, subassuntos e cartões.
 * Somente apresentação; preserva ID, ordem, frente, verso, fontes e SRS. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const n=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x};
const btn=(txt,fn,cls)=>{const b=n('button',cls,txt);b.type='button';b.onclick=fn;return b};
let indexCache=null;
function subject(c){return c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros'}
function key(group,subject){return group+'|'+subject}
function indexing(){
 if(!cards.length)return null;
 if(indexCache?.size===cards.length)return indexCache;
 const m=new Map();
 for(const c of cards){
  const group=c.provisional?'LEGISLACAO':c.group||'OUTROS',sub=subject(c),k=key(group,sub);
  let val=m.get(k);
  if(!val){val={count:0,subtopics:new Map(),terms:[],examples:[]};m.set(k,val)}
  val.count++;
  const unit=(c.sub||'Fundamentos').trim()||'Fundamentos';
  val.subtopics.set(unit,(val.subtopics.get(unit)||0)+1);
  if(val.terms.length<110)val.terms.push(c.front||'',unit);
  if(val.examples.length<3)val.examples.push(c.id);
 }
 indexCache={size:cards.length,byKey:m};
 return indexCache;
}
function detail(t){return indexing()?.byKey.get(key(t.group,t.subject))}
function matching(){
 const q=norm($('topicSearch').value.trim()),a=$('topicArea').value;
 return topicRows.filter(t=>{
  if(a!=='all'&&t.area!==a)return false;
  if(!q)return true;
  const info=detail(t),words=[t.area,t.subject,t.label,...(info?.terms||[])].join(' ');
  return norm(words).includes(q);
 });
}
function topicTile(t){
 const box=btn('',()=>window.BancoMestreV034.openTopic(t),'v036-topic-tile');
 const info=detail(t);
 const top=n('div','v036-topic-label',t.area);
 const title=n('strong','v036-topic-name',t.subject);
 const description=n('p','v036-topic-examples',[...(info?.subtopics.keys()||[])].slice(0,3).join(' · ')||
  (t.imgCount?'Conteúdo visual disponível':'Consultar a biblioteca do assunto'));
 const metrics=n('div','v036-topic-metrics');
 metrics.append(n('span','',t.count+' cartões'));
 if(t.imgCount)metrics.append(n('span','',t.imgCount+' imagens'));
 if(info?.subtopics.size)metrics.append(n('span','',info.subtopics.size+' subassuntos'));
 box.append(top,title,description,metrics,n('span','v036-topic-link','Abrir assunto'));
 return box;
}
function areaButtons(){
 const areaRoot=$('areaRows'),selected=$('topicArea').value;
 for(const button of areaRoot.querySelectorAll('button.topicCard')){
  const area=button.querySelector('strong')?.textContent;
  if(!area)continue;
  const list=topicRows.filter(t=>t.area===area);
  const cap=button.querySelector('small');
  if(cap)cap.textContent=list.length+' assuntos · '+list.reduce((sum,t)=>sum+t.count,0)+' cartões';
  button.classList.toggle('v036-area-active',selected===area);
  button.onclick=()=>{
   $('topicArea').value=selected===area?'all':area;
   topicRender();
   $('topicRows').scrollIntoView({behavior:'smooth',block:'start'});
  };
 }
}
function renderTopics(){
 if(!topicRows.length)return;
 const current=matching(),root=$('topicRows');root.replaceChildren();
 $('topicCount').textContent=current.length+' assunto(s) disponíveis';
 areaButtons();
 if(!current.length){
  root.append(n('p','v036-empty','Nenhum assunto encontrado. Pesquise pelo nome da disciplina, pergunta, norma ou subassunto.'));
  return;
 }
 const areas=['Engenharia Civil','Português','Matemática','Legislação','Informática','Outros'];
 const groupRank=new Map((meta?.groups||[]).map((g,i)=>[g.id,i]));
 for(const area of areas){
  const items=current.filter(t=>t.area===area);if(!items.length)continue;
  const wrapper=n('div','v036-topic-area');
  const header=n('div','v036-topic-area-head');
  header.append(n('h3','',area),n('span','v036-count',items.length+' assuntos'));
  wrapper.append(header);
  const groups=[...new Set(items.map(t=>t.group))].sort((a,b)=>(groupRank.get(a)??999)-(groupRank.get(b)??999));
  groups.forEach((g,j)=>{
   const children=items.filter(t=>t.group===g).sort((a,b)=>a.subject.localeCompare(b.subject,'pt-BR'));
   const raw=(meta?.groups||[]).find(x=>x.id===g)?.title||children[0].label||g;
   const title=raw.replace(/^Engenharia Civil\s*[—-]\s*/,'').replace(/^Portugu[eê]s\s*[—-]\s*/,'').replace(/^Matem[aá]tica\s*[—-]\s*/,'');
   const details=n('details','v036-topic-cluster');details.open=$('topicSearch').value.trim().length>0||groups.length<=2||j===0;
   const sum=n('summary','v036-topic-cluster-summary');
   sum.append(n('strong','',title),n('span','v036-count',children.length+' assuntos'));
   details.append(sum);
   const grid=n('div','v036-topic-grid');for(const t of children)grid.append(topicTile(t));
   details.append(grid);wrapper.append(details);
  });
  root.append(wrapper);
 }
}
topicRender=function(){renderTopics()};
$('topicSearch').placeholder='Buscar matéria, subassunto, norma ou pergunta';
$('topicSearch').oninput=topicRender;$('topicArea').onchange=topicRender;
// Cartões: filtro explícito por assunto dentro da disciplina escolhida.
function subjectFilterOptions(){
 const sel=$('cardTopicFilter');if(!sel||!cards.length)return;
 const old=sel.value,discipline=$('cardFilter').value;
 const all=cards.filter(c=>discipline==='all'||c.discipline===discipline);
 const names=[...new Set(all.map(subject))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 sel.replaceChildren(new Option('Todos os assuntos','all'));
 for(const name of names)sel.add(new Option(name,name));
 sel.value=names.includes(old)?old:'all';
}
const previousCardRender=cardRender;
cardRender=function(){
 if($('cardSearch').value.trim().match(/^(?:CARD-\d{4}|IJUI-[\w-]+)$/i)||focusGroup){if($('cardTopicFilter'))$('cardTopicFilter').value='all'}
 subjectFilterOptions();
 previousCardRender();
 const root=$('cardRows');if(!root)return;
 const articles=[...root.querySelectorAll(':scope > article.card')];
 if(!articles.length)return;
 const lookup=new Map(cards.map(c=>[c.id,c]));
 const parts=new Map();
 for(const article of articles){
  const id=article.querySelector(':scope > .tag')?.textContent?.trim(),card=lookup.get(id);
  if(!card)continue;
  const topic=subject(card),discipline=card.provisional?'Legislação — Ijuí':card.discipline||'Outros',k=discipline+'|'+topic;
  if(!parts.has(k))parts.set(k,{discipline,topic,articles:[]});
  parts.get(k).articles.push(article);
  const subtitle=article.querySelector(':scope > p');if(subtitle)subtitle.hidden=true;
  const h=article.querySelector(':scope > h3');
  if(h&&!article.querySelector('.v036-card-path')){
   const path=n('div','v036-card-path');
   path.append(n('span','',card.sub||'Fundamentos'),n('span','',card.provisional?'Módulo de Ijuí':'Banco Mestre'));
   article.insertBefore(path,h);
  }
  const reveal=article.querySelector(':scope > details > summary');
  if(reveal)reveal.textContent='Revelar resposta exata e explicações';
 }
 root.classList.add('v036-card-buckets');root.replaceChildren();
 let position=0;
 for(const block of parts.values()){
  const details=n('details','v036-card-group');
  details.open=parts.size<=3||position<2;position++;
  const sum=n('summary','v036-card-group-summary');
  const title=n('span');
  title.append(n('strong','',block.topic),n('small','',block.discipline));
  sum.append(title,n('span','v036-count',block.articles.length+' cartão'+(block.articles.length!==1?'ões':'')));
  details.append(sum);
  const grid=n('div','v036-card-grid');for(const item of block.articles)grid.append(item);
  details.append(grid);root.append(details);
 }
 const counter=$('cardCount');
 if(counter)counter.textContent+=' · '+parts.size+' assunto(s) exibidos';
};
const oldSearch=$('cardSearch').oninput;
$('cardSearch').oninput=()=>{const sel=$('cardTopicFilter');if(sel)sel.value='all';oldSearch?.()};
$('cardFilter').onchange=()=>{focusGroup='';cardLimit=24;subjectFilterOptions();cardRender()};
$('cardTopicFilter').onchange=()=>{focusGroup='';cardLimit=24;cardRender()};
const originalGoto=window.BancoMestreV034.gotoCard;
window.BancoMestreV034.gotoCard=function(id){if($('cardTopicFilter'))$('cardTopicFilter').value='all';return originalGoto(id)};
const originalTopic=window.BancoMestreV034.openTopic;
window.BancoMestreV034.openTopic=async function(t){
 if($('cardTopicFilter'))$('cardTopicFilter').value='all';
 await originalTopic(t);
 // Leitura opcional da mesma disciplina: vínculo editorial, não prova de cobertura.
 const media=$('topicMedia');
 if(media&&docs.length){
  const titles=new Set(norm(t.subject).split(/[^a-z0-9]+/).filter(w=>w.length>=5&&
   !['engenharia','assuntos','concreto','normas','gerais','estruturas','materiais'].includes(w)));
  const list=docs.filter(d=>d.category===t.group)
   .map(d=>({doc:d,score:[...titles].filter(w=>norm(d.title).includes(w)).length}))
   .sort((a,b)=>b.score-a.score||a.doc.title.localeCompare(b.doc.title,'pt-BR'))
   .filter(x=>!media.textContent.includes(x.doc.id)).slice(0,5);
  if(list.length){
   const box=n('div','v036-topic-pdfs');
   box.append(n('h3','','Capítulos e PDFs da mesma disciplina'));
   box.append(n('p','v036-topic-pdf-note','Relação pela classificação do acervo; não significa que o capítulo cubra integralmente este cartão.'));
   const row=n('div','v036-topic-pdf-links');
   for(const item of list)row.append(btn(item.doc.title,()=>pdfOpen(item.doc),'v036-topic-pdf-link'));
   box.append(row);media.append(box);
  }
 }
 const guide=$('topicStudyBlocks');
 if(!guide)return;
 const subtopics=[...guide.querySelectorAll('.v034Subtopic')];
 if(subtopics.length>3&&!$('topicExpandV036')){
  const panel=n('div','v036-topic-expand');panel.id='topicExpandV036';
  panel.append(button('Expandir todos',()=>subtopics.forEach(x=>x.open=true)));
  panel.append(button('Recolher',()=>subtopics.forEach(x=>x.open=false)));
  guide.before(panel);
 }else if($('topicExpandV036'))$('topicExpandV036').remove();
};
window.BancoMestreAssuntosV036={topicRender,cardRender,openTopic:window.BancoMestreV034.openTopic};
if(topicRows.length)topicRender();
if(cards.length)cardRender();
})();
