
/* Banco Mestre V033: rede de referências F17, somente leitura.
   A mesma área temática NÃO implica cobertura ou revisão SRS. */
(function(){
'use strict';
const INDEX='assets/f17_rede_referencias_v033.json';
const $=id=>document.getElementById(id);
const make=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x};
const add=(parent,tag,cls,content)=>{const x=make(tag,cls,content);parent.append(x);return x};
const sourceLabel={auditoria_f17:'Histórico de revisões',resposta_arquivada:'Resposta histórica F14/F16'};
const labels={
 indireta_historica:'Indireta registrada · sem revisão',
 associado_sem_tentativa:'Associação registrada · sem revisão',
 citacao_sem_grau:'ID citado · cobertura não graduada',
 direta_informada:'Direta informada · a conferir',
 parcial_informada:'Parcial informada · a conferir',
 indireta_informada:'Indireta informada · a conferir',
 nao_avaliado:'Não avaliado',
 nao_demonstrada:'Não demonstrado'
};
let index=null,loading=null,activeFilter='all',search='';
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function getCard(id){return cards.find(c=>c.id===id)}
function groupOf(c){return c?.provisional?'LEGISLACAO':c?.group}
function subjectOf(c){return c?.provisional?'Ijuí — legislação FUNDATEC':c?.subject||'Outros'}
function topicOf(id){const c=getCard(id);return c?topicRows.find(t=>t.group===groupOf(c)&&t.subject===subjectOf(c)):null}
function ensureCards(){
 if(cards.filter(c=>!c.provisional).length===1494)return Promise.resolve();
 return loadCards().then(async()=>{
  if(cards.filter(c=>!c.provisional).length===1494)return;
  for(let i=0;i<100;i++){
   await new Promise(resolve=>setTimeout(resolve,120));
   if(cards.filter(c=>!c.provisional).length===1494)return;
  }
  throw Error('Base V015 não terminou de carregar.');
 });
}
async function load(){
 if(index)return index;
 if(!loading)loading=fetch(INDEX,{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('Rede de evidências F17 indisponível');
  const d=await r.json();
  if(d.format!=='BancoMestreF17RedeV033'||d.counts.formal_events!==21||d.counts.archived_responses!==9||d.counts.distinct_primary_cards!==22||d.counts.audited_indirect_edges!==7)throw Error('Rede F17 divergente dos históricos');
  for(const e of d.edges)if(e.creates_srs!==false)throw Error('Vínculo indevido com SRS');
  index=d;return d;
 }).catch(e=>{loading=null;throw e});
 return loading;
}
function edgesFor(id){return (index?.edges||[]).filter(e=>e.from===id||e.to===id)}
function proposalsFor(id){return (index?.evolutions||[]).filter(p=>p.ids.includes(id))}
function showCard(id){
 if(!$('cardSearch'))return;
 $('cardFilter').value='all';$('cardRecoveredOnly').checked=false;$('cardReviewedOnly').checked=false;$('cardHidden').checked=true;
 window.BancoMestreV033.gotoCard(id);
 const a=[...document.querySelectorAll('#cardRows article.card')].find(el=>el.querySelector(':scope > .tag')?.textContent.trim()===id);
 if(a){a.querySelector('details')?.setAttribute('open','');a.scrollIntoView({block:'start',behavior:'smooth'})}
}
async function showTopic(id){
 await ensureCards();
 const t=topicOf(id);
 if(t){await window.BancoMestreV033.openTopic(t);return}
 // Carregar os assuntos quando o destino ainda não foi materializado.
 await loadTopics();
 const next=topicOf(id);if(next)await window.BancoMestreV033.openTopic(next);
 else showCard(id);
}
function btn(name,func,cls=''){const b=make('button',cls,name);b.type='button';b.onclick=func;return b}
function sourceHref(edge){return edge.kind==='auditoria_f17'?index.sources.auditoria:index.sources.respostas}
function sourceLink(href,label){
 const a=make('a','f17-source',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function refButton(id){return btn(id,()=>showCard(id),'f17-id')}
function contextLabel(id){let c=getCard(id)||index?.context_cards?.find(c=>c.id===id);return c?(c.subject+' · '+(c.sub||'sem subassunto')).slice(0,95):'ID da base';}
function isCrossSubject(e){
 let a=getCard(e.from)||index?.context_cards?.find(c=>c.id===e.from);
 let b=getCard(e.to)||index?.context_cards?.find(c=>c.id===e.to);
 return !!(a&&b&&(a.subject!==b.subject||a.group!==b.group));
}
function itemEdge(e,id){
 const box=make('div','f17-edge');
 const relation=make('div','f17-edge-line');
 if(id){const other=e.from===id?e.to:e.from;relation.append(refButton(other));
  add(relation,'span','f17-edge-direction',e.from===id?'→ referenciado':'← origem');
 }else{relation.append(refButton(e.from));add(relation,'span','f17-edge-direction','→');relation.append(refButton(e.to))}
 const text=make('span','f17-degree'+(e.classification==='nao_avaliado'||e.classification==='nao_demonstrada'?' f17-degree-muted':''),labels[e.classification]||e.classification);
 relation.append(text);box.append(relation);
 const idRelated=id?(e.from===id?e.to:e.from):e.to;
 add(box,'div','f17-edge-topic',contextLabel(idRelated)+(isCrossSubject(e)?' · assunto distinto':''));
 add(box,'p','f17-evidence','Registro: '+e.evidence);
 const foot=make('div','f17-evidence-footer');
 foot.append(sourceLink(sourceHref(e),sourceLabel[e.kind]||e.kind));
 add(foot,'span','', 'Sem nova tentativa SRS');box.append(foot);
 return box;
}
function evolution(p){
 const x=make('article','f17-evolution');const h=add(x,'strong','',p.id+' · '+p.tema);
 add(x,'p','',p.pergunta);
 add(x,'p','f17-muted','Complemento histórico: '+p.complemento);
 const links=make('div','f17-link-row');for(const id of p.ids)links.append(refButton(id));
 x.append(links,sourceLink(index.sources.auditoria,'Proposta histórica · não incorporada'));
 return x;
}
function cardBlock(id,compact=false){
 const c=getCard(id)||index.context_cards.find(x=>x.id===id),node=index.nodes.find(x=>x.id===id),ev=auditF17?.historico_por_id?.[id],ans=answersF17?.por_id?.[id];
 const box=make('article','f17-item');const heading=make('div','f17-item-head');
 heading.append(refButton(id));
 const title=make('div','');add(title,'strong','',c?.subject||'Assunto não localizado');add(title,'small','',c?.front||'');heading.append(title);box.append(heading);
 const flags=make('div','f17-flags');
 if(ev)flags.append(make('span','f17-mini','Revisão registrada: '+ev.avaliacao+' · '+ev.data_local));
 if(ans)flags.append(make('span','f17-mini','Resposta histórica arquivada'));
 if(!ev&&ans)flags.append(make('span','f17-mini','Sem evento formal localizado neste índice'));
 box.append(flags);
 const actions=make('div','f17-link-row');
 actions.append(btn('Abrir cartão',()=>showCard(id)));
 actions.append(btn('Consultar assunto',()=>showTopic(id)));
 box.append(actions);
 if(!compact){
  const detail=make('details','f17-detail');const sum=add(detail,'summary','','Ver evidências, lacunas e vínculos');
  const body=make('div','f17-detail-body');
  if(ev){
   add(body,'p','','Origem: '+ev.origem_evento+'. Precisão: '+ev.precisao_temporal+'. Próxima revisão preservada na V015: '+(ev.proxima_revisao_existente_v015||'não registrada')+'.');
   if(ev.observacoes_da_correcao)add(body,'p','f17-muted',ev.observacoes_da_correcao);
   body.append(sourceLink(index.sources.auditoria,'Fonte do evento F17'));
  }
  if(ans){
   for(const [key,label] of [['conhecimentos_demonstrados','Conhecimentos demonstrados no arquivo'],['conhecimentos_parciais','Pontos parciais'],['erros_corrigidos','Erros corrigidos'],['lacunas_em_relacao_ao_enunciado','Lacunas documentadas']]){
    if(ans[key]){const x=make('div','f17-knowledge');add(x,'strong','',label);add(x,'p','',ans[key]);body.append(x)}
   }
   const raw=make('details','f17-raw');add(raw,'summary','','Resposta original arquivada (fonte CSV)');
   add(raw,'p','',ans.resposta_original_arquivada);body.append(raw);
   body.append(sourceLink(index.sources.respostas,'Fonte do texto arquivado'));
  }
  const connections=edgesFor(id);
  if(connections.length){
   add(body,'h4','','Conexões e grau de evidência ('+connections.length+')');
   for(const e of connections)body.append(itemEdge(e,id));
  }else add(body,'p','f17-muted','Nenhuma aresta explícita registrada para este ID. Mesmo assunto não equivale a cobertura.');
  const proposals=proposalsFor(id);
  if(proposals.length){add(body,'h4','','Evoluções históricas relacionadas');for(const p of proposals)body.append(evolution(p))}
  detail.append(body);box.append(detail);
 }
 return box;
}
async function dashboard(){
 const root=$('f17Rows');if(!root)return;
 try{await ensureCards();await load();const f=$('f17Kind').value;const q=clean($('f17Search').value);
  const stat=$('f17Stats');stat.replaceChildren();
  for(const [num,label] of [[21,'eventos formais'],[9,'respostas arquivadas'],[7,'vínculos auditados'],[index.counts.archived_mention_edges,'menções em respostas'],[9,'propostas evolutivas']]){
   const a=make('div','f17-stat');add(a,'strong','',String(num));add(a,'span','',label);stat.append(a)}
  let nodes=index.nodes.filter(n=>{
   const ar=edgesFor(n.id),pa=proposalsFor(n.id);
   return (f==='all'||(f==='formal'&&n.has_formal_event)||(f==='response'&&n.has_archived_response)||(f==='links'&&ar.length)||(f==='evolution'&&pa.length))&&
    clean(n.id+' '+n.group+' '+n.subject+' '+n.sub+' '+n.front+' '+ar.flatMap(e=>[e.to,e.from,e.evidence]).join(' ')).includes(q);
  }).sort((a,b)=>a.subject.localeCompare(b.subject,'pt-BR')||a.id.localeCompare(b.id));
  $('f17Count').textContent=nodes.length+' registros principais. 22 IDs distintos representam 21 eventos + 9 respostas com sobreposição; relação não é tentativa.';
  root.replaceChildren();
  if(!nodes.length)add(root,'p','f17-muted','Nenhum registro encontrado nos filtros atuais.');
  for(const n of nodes)root.append(cardBlock(n.id,false));
  const inter=$('f17SubjectNetwork');inter.replaceChildren();
  const e=index.edges.filter(isCrossSubject);
  add(inter,'h3','','Ligações entre assuntos diferentes · '+e.length+' registros documentais');
  add(inter,'p','f17-muted','Pode haver mais de uma fonte para o mesmo par. Links aqui não autorizam declarar domínio ou pular revisão.');
  for(const x of e){if(!q||clean(x.from+' '+x.to+' '+contextLabel(x.from)+' '+contextLabel(x.to)).includes(q))inter.append(itemEdge(x))}
  if(index.evolutions.length){
   const dst=$('f17Proposals');dst.replaceChildren();add(dst,'h3','','Evoluções complementares (sem promoção)');
   for(const p of index.evolutions){if(!q||clean(p.tema+' '+p.pergunta+' '+p.ids.join(' ')).includes(q))dst.append(evolution(p))}
  }
 }catch(e){root.replaceChildren();add(root,'p','f17-error','Falha ao carregar auditoria: '+e.message)}
}
async function renderForTopic(t){
 const target=$('topicRelated');if(!target)return;
 target.querySelector('#f17TopicReferences')?.remove();
 const box=make('div','f17-topic');box.id='f17TopicReferences';add(box,'h3','','Referências cruzadas auditáveis — F17');
 try{
  await load();await ensureCards();
  const relevant=[...new Map([...index.context_cards,...index.nodes].filter(c=>c.group===t.group&&c.subject===t.subject).map(c=>[c.id,c])).values()];
  const seeds=index.nodes.filter(c=>c.group===t.group&&c.subject===t.subject);
  // Somente relações explícitas com ao menos um cartão do assunto.
  const ids=new Set(relevant.map(x=>x.id));
  const edges=index.edges.filter(e=>ids.has(e.from)||ids.has(e.to));
  const evols=index.evolutions.filter(p=>p.ids.some(x=>ids.has(x)));
  if(!ids.size){
   add(box,'p','f17-muted','Não existem referências específicas F17 documentadas para este assunto. O acervo pode conter outros conhecimentos, mas sem prova de cobertura cruzada.');
  }else{
   add(box,'p','f17-muted',relevant.length+' ID(s) da rede vinculados a este assunto; '+seeds.filter(x=>x.has_formal_event).length+' com evento formal F17 e '+edges.length+' menções documentais ligadas. Não equivale ao número de revisões realizadas.');
   const row=make('div','f17-link-row');for(const c of relevant)row.append(refButton(c.id));box.append(row);
   if(edges.length){add(box,'h4','','Conhecimentos associados e grau de cobertura');for(const e of edges)box.append(itemEdge(e,null))}
   if(evols.length){add(box,'h4','','Evoluções históricas relacionadas');for(const p of evols)box.append(evolution(p))}
  }
  const nav=btn('Ver todas as relações',()=>{section('auditoria');dashboard()});
  nav.className='f17-view-all';box.append(nav);
 }catch(e){add(box,'p','f17-error','Rede F17 indisponível: '+e.message)}
 if($('topicHeading')?.textContent!==t.subject)return;
 target.append(box);
}
function renderForCard(article){
 if(!index)return;
 const id=article.querySelector(':scope > .tag')?.textContent?.trim();
 if(!id)return;
 const relevant=edgesFor(id),prop=proposalsFor(id),f=index.nodes.some(n=>n.id===id);
 if(!f&&!relevant.length&&!prop.length)return;
 const answer=article.querySelector('.answer');if(!answer)return;
 answer.querySelector('.f17-card-references')?.remove();
 const block=make('div','f17-card-references');
 add(block,'h3','','Referências F17 classificadas');
 if(index.nodes.some(n=>n.id===id))add(block,'p','f17-muted','Este cartão tem registro histórico. A classificação formal vem exclusivamente do evento F17.');
 if(relevant.length){for(const e of relevant)block.append(itemEdge(e,id))}
 else add(block,'p','f17-muted','Não há relação de cobertura registrada para este ID. Proximidade temática não significa acerto.');
 if(prop.length){add(block,'h4','','Evoluções (não incluídas automaticamente)');for(const p of prop)block.append(evolution(p))}
 const actions=make('div','f17-link-row');
 actions.append(btn('Ver histórico e relações',()=>{section('auditoria');$('f17Search').value=id;dashboard()}));block.append(actions);
 answer.append(block);
}
const priorCardRender=cardRender;
cardRender=function(){priorCardRender();if(index)for(const node of document.querySelectorAll('#cardRows article.card'))renderForCard(node)};
const priorSection=section;
section=function(name){
 priorSection(name);
 if(name==='auditoria')dashboard();
};
$('f17Search')?.addEventListener('input',()=>dashboard());
$('f17Kind')?.addEventListener('change',()=>dashboard());
window.BancoMestreF17={load,renderForTopic,dashboard,showCard,showTopic};
load().then(()=>{if(document.querySelector('#cartoes.active'))cardRender();}).catch(e=>console.warn('Rede F17:',e));
})();
