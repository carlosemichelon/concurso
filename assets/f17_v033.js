
/* V033 — F17: relações com evidência, sentido, origem e limitações.
   Nenhum evento, avaliação, data ou cartão é gravado/modificado aqui. */
(function(){
'use strict';
const refPath='assets/f17_interconexoes_v033.json';
const $=id=>document.getElementById(id);
const plain=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const labels={
 direta:'Núcleo demonstrado',
 parcial:'Cobertura parcial',
 indireta:'Cobertura indireta',
 associado:'Associação da agenda F17',
 nao_avaliado:'Não avaliado',
 contextual:'Referência contextual',
 contraste:'Erro/contraste corrigido'
};
const explanations={
 direta:'Há registro do núcleo na resposta arquivada; o cartão de destino NÃO recebeu revisão formal por isso.',
 parcial:'A resposta tocou parte do núcleo, mas faltaram condições, regras ou detalhes.',
 indireta:'Cobertura indireta anotada no F17; não gera evento nem muda o agendamento.',
 associado:'Relação registrada na agenda do F17; não comprova resposta autônoma.',
 nao_avaliado:'Tema apareceu como contexto, complemento ou lacuna; não foi avaliado na tentativa.',
 contextual:'Assunto próximo ou vínculo anterior fraco; consultar a referência sem atribuir domínio.',
 contraste:'Relação útil para corrigir um erro; não representa acerto no tema ligado.'
};
const order=['direta','parcial','indireta','associado','contraste','nao_avaliado','contextual'];
let data=null,pending=null;
const nodeMap=new Map();
function el(tag,text,cls){
 const x=document.createElement(tag);if(text!==undefined&&text!==null)x.textContent=String(text);if(cls)x.className=cls;return x;
}
function note(target,value,cls){target.append(el('p',value,cls||'f17Note'))}
function chip(label,fn,cls){
 const b=el('button',label,cls||'f17Chip');b.type='button';b.onclick=fn;return b;
}
function link(label,url){
 const a=el('a',label,'f17Source');a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function cardNode(id){return nodeMap.get(id)||cards.find(c=>c.id===id)||{id,subject:'Assunto a verificar',group:null,front:'Item não recuperado'};}
function edgeKey(e){return e.source==='F17_V029'?'Auditoria F17 V029':'Resposta arquivada V030';}
function refUrl(source){return 'https://github.com/carlosemichelon/concurso/blob/gh-pages/assets/'+(source==='F17_V029'?'f17_historico_auditado_v029.json':'f17_respostas_9_v030.json');}
async function ready(){
 if(data)return data;
 if(!pending)pending=fetch(refPath,{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('Índice F17 não encontrado');
  const json=await r.json();
  if(json.format!=='BancoMestreF17InterconexaoV033'||
   json.counts.historic_events!==21||json.counts.archived_answers!==9||
   json.counts.f17_relations!==7||json.counts.proposals!==9)
    throw Error('Versão F17 incompatível com a base');
  data=json;
  for(const n of json.card_nodes)nodeMap.set(n.id,n);
  return json;
 }).catch(e=>{pending=null;throw e});
 return pending;
}
async function openCard(id){
 if(!cards.length)await loadCards();
 if(!cards.length){note($('f17Results'),'Os cartões ainda não foram carregados; tente novamente após abrir Flashcards.');return}
 window.BancoMestreV033?.gotoCard(id);
}
async function openSubject(group,subject){
 if(!cards.length)await loadCards();
 if(!topicRows.length)await loadTopics();
 const t=topicRows.find(t=>t.group===group&&t.subject===subject);
 if(t&&window.BancoMestreV033?.openTopic)await window.BancoMestreV033.openTopic(t);
 else {section('assuntos');$('topicSearch').value=subject;topicRender()}
}
function namedCard(id){const c=cardNode(id);return id+' · '+(c.subject||'Assunto não identificado');}
function subjectAction(node){
 const b=chip('Assunto: '+node.subject,()=>openSubject(node.group,node.subject));
 b.title=node.group||'';return b;
}
function appendEdge(root,e,compact){
 const a=cardNode(e.from),b=cardNode(e.to),box=el('article',null,'f17Edge');
 const head=el('div',null,'f17EdgeHead');
 head.append(el('strong',labels[e.kind]||e.kind,'f17Status '+e.kind));
 head.append(el('span',edgeKey(e),'f17SourceCaption'));
 box.append(head);
 const row=el('div',null,'f17EdgeNodes');
 const origin=chip(namedCard(e.from),()=>openCard(e.from),'f17Node');
 origin.title=a.front||'';row.append(origin,el('span','→','f17Arrow'));
 const dst=chip(namedCard(e.to),()=>openCard(e.to),'f17Node');
 dst.title=b.front||'';row.append(dst);
 box.append(row);
 note(box,e.evidence||'Vínculo registrado na fonte.');
 if(!compact)note(box,explanations[e.kind]||'Não é evento de revisão formal.','f17Caution');
 const tool=el('div',null,'f17Tools');
 if(a.group&&a.subject)tool.append(subjectAction(a));
 if(b.group&&b.subject&&!(a.group===b.group&&a.subject===b.subject))tool.append(subjectAction(b));
 tool.append(link('Ver evidência original',refUrl(e.source)));
 box.append(tool);root.append(box);
}
function cardEvidence(id){return data?.edges.filter(e=>e.from===id||e.to===id)||[]}
function classifyLabel(id){return labels[id]||id}
function renderCardSummary(parent){
 if(!data)return;
 const sum=el('div',null,'f17QuickSummary');
 sum.append(chip('Abrir mapa da auditoria F17',openDashboard,'primary'));
 note(sum,'21 eventos históricos · 9 respostas arquivadas · 7 relações de agenda · 28 relações analíticas da resposta · 9 propostas históricas. São categorias de evidência, não 35 revisões adicionais.');
 parent.append(sum);
}
function decorateCard(article,c,ans){
 if(!data)return;
 const id=c.id,historical=data.historical.find(x=>x.id===id),edges=cardEvidence(id),proposals=data.proposals.filter(p=>p.related_cards.includes(id));
 if(!historical&&!edges.length&&!proposals.length)return;
 const box=el('section',null,'f17CardEvidence');
 box.append(el('h4','Auditoria F17 — evidências por ID'));
 if(historical){
  const d=el('div',null,'f17Timeline');
  d.append(el('strong','Revisão histórica existente: '+historical.evaluation));
  note(d,'Data: '+historical.date+(historical.local_time?' · '+historical.local_time:'')+' · '+historical.precision);
  note(d,'Origem: '+historical.origin+'. Data de revisão existente V015: '+(historical.existing_due_date||'não informada')+' (sem recálculo).');
  box.append(d);
 }
 if(edges.length){
  const groups=el('div',null,'f17EvidenceLinks');
  for(const kind of order){
   const list=edges.filter(e=>e.kind===kind);if(!list.length)continue;
   const d=el('details');d.open=kind==='direta'||kind==='parcial'||kind==='indireta';
   d.append(el('summary',classifyLabel(kind)+' ('+list.length+')'));
   for(const e of list)appendEdge(d,e,true);
   groups.append(d);
  }
  box.append(groups);
 }
 if(proposals.length){
  const d=el('details');d.append(el('summary','Evoluções históricas vinculadas ('+proposals.length+') — não aprovadas como novo cartão'));
  for(const p of proposals){const row=el('div',null,'f17Proposal');row.append(el('b',p.id+' · '+p.subject));note(row,p.question);d.append(row)}
  box.append(d);
 }
 box.append(chip('Explorar conexões F17',openDashboard));
 ans.append(box);
}
async function renderTopic(t,subset,root){
 await ready();
 root.replaceChildren();
 root.append(el('h3','Interconexão F17 e referências de assuntos','sectionTitle'));
 const ids=new Set(subset.map(c=>c.id)),edges=data.edges.filter(e=>ids.has(e.from)||ids.has(e.to));
 const hists=data.historical.filter(e=>ids.has(e.id)),arqs=subset.filter(c=>answersF17?.por_id?.[c.id]);
 const props=data.proposals.filter(p=>p.related_cards.some(id=>ids.has(id)));
 note(root,'Escopo do assunto: '+subset.length+' cartões; '+hists.length+' evento(s) históricos F17; '+arqs.length+' resposta(s) arquivada(s); '+edges.length+' relações documentais/analíticas; '+props.length+' evolução(ões) históricas. Nenhuma relação altera o SRS.');
 if(hists.length||arqs.length){
  const d=el('details');d.open=true;d.append(el('summary','Histórico e respostas documentadas'));
  for(const e of hists){
   const r=el('div',null,'f17TopicRecord');
   r.append(chip(e.id,()=>openCard(e.id)),el('span','Avaliação histórica: '+e.evaluation+' · '+e.date+' · '+e.precision));
   d.append(r);
  }
  for(const c of arqs){const x=answersF17.por_id[c.id];const row=el('div',null,'f17TopicRecord');row.append(chip(c.id,()=>openCard(c.id)),el('span','Resposta discursiva arquivada; lacunas: '+(x.lacunas_em_relacao_ao_enunciado||'não descritas')));d.append(row)}
  root.append(d);
 }
 if(edges.length){
  const byKind=order.map(k=>[k,edges.filter(e=>e.kind===k)]).filter(x=>x[1].length);
  for(const [kind,items] of byKind){
   const d=el('details');d.open=['direta','parcial','indireta'].includes(kind);
   d.append(el('summary',classifyLabel(kind)+' · '+items.length+' vínculo(s)'));
   for(const e of items)appendEdge(d,e,true);
   root.append(d);
  }
  const other=new Map();
  for(const e of edges){
   for(const id of [e.from,e.to]){
    const c=cardNode(id),key=c.group+'|'+c.subject;
    if(!c.group||!c.subject||key===t.group+'|'+t.subject)continue;
    if(!other.has(key))other.set(key,{group:c.group,subject:c.subject,sourceIds:new Set(),kinds:new Set()});
    const val=other.get(key);val.sourceIds.add(id);val.kinds.add(e.kind);
   }
  }
  if(other.size){
   const d=el('div',null,'f17SubjectConnections');d.append(el('h4','Outros assuntos ligados pelos IDs documentados'));
   const row=el('div',null,'f17Tools');
   for(const info of [...other.values()].sort((a,b)=>a.subject.localeCompare(b.subject,'pt-BR'))){
    row.append(chip(info.subject+' · '+[...info.kinds].map(x=>labels[x]).join('/'),()=>openSubject(info.group,info.subject)));
   }
   d.append(row);root.append(d);
  }
 }else note(root,'Nenhum vínculo de cobertura auditado neste assunto na amostra F17 disponível. Isso não impede conexões em outros históricos nem significa que o conteúdo não foi estudado.');
 if(props.length){
  const d=el('details');d.append(el('summary',props.length+' evolução(ões) propostas no histórico F17 (sem aprovação como novo cartão)'));
  for(const p of props){
   const r=el('div',null,'f17Proposal');r.append(el('strong',p.id+' — '+p.subject));note(r,p.question);note(r,'Resposta-fonte arquivada: '+p.answer);
   d.append(r);
  }
  root.append(d);
 }
 const pdfRefs=[...new Map(arqs.filter(c=>{
  const r=answersF17.por_id[c.id]?.referencia_pdf_confirmada_no_csv||'';
  return r&&!/^(não confirmada|não identificada)/i.test(r);
 }).map(c=>[c.id,answersF17.por_id[c.id].referencia_pdf_confirmada_no_csv])).entries()];
 if(pdfRefs.length){
  const d=el('details');d.append(el('summary','Referências de páginas encontradas nos registros ('+pdfRefs.length+')'));
  for(const [id,text] of pdfRefs)note(d,id+': '+text);
  note(d,'A referência de página é mantida literalmente. Não foi criado link para PDF sem identificação inequívoca do arquivo.');
  root.append(d);
 }
 const significant=s=>plain(s).split(/[^a-z0-9]+/).filter(w=>w.length>=6&&!['assuntos','estruturas','engenharia','materiais','estrutural','concurso','prediais','aplicada','normas','tecnica','tecnicas','concreto','cimento'].includes(w));
 const current=new Set(significant(t.subject));
 const suggestions=topicRows.filter(x=>x.group===t.group&&x.subject!==t.subject&&significant(x.subject).some(w=>current.has(w))).slice(0,6);
 if(suggestions.length){
  const d=el('details');d.append(el('summary','Assuntos próximos por palavras do título — sem evidência F17 ('+suggestions.length+')'));
  const tools=el('div',null,'f17Tools');
  for(const x of suggestions)tools.append(chip(x.subject,()=>window.BancoMestreV033.openTopic(x)));
  d.append(tools);root.append(d);
 }
 root.append(chip('Abrir auditoria F17 completa',openDashboard));
 note(root,'Fontes: arquivos F17 V029 e Respostas F17 V030. Direcionalidade e nível não são notas SRS; relações apenas conceituais nunca adiam revisões.');
}
function record(title,head,lines,actions){
 const a=el('article',null,'f17Item');
 a.append(el('strong',title));
 if(head)a.append(el('p',head,'f17Note'));
 for(const t of lines||[])if(t)a.append(el('p',t,'f17Note'));
 if(actions?.length){const div=el('div',null,'f17Tools');for(const item of actions)div.append(item);a.append(div)}
 return a;
}
function modeName(v){return {vinculos:'Relações por evidência',eventos:'Revisões históricas',respostas:'Respostas e lacunas',propostas:'Evoluções propostas',assuntos:'Referências por assunto'}[v]||v}
async function renderDashboard(){
 const root=$('f17Results');if(!root)return;
 try{await ready()}catch(e){root.textContent='Não foi possível carregar F17: '+e.message;return}
 const q=plain($('f17Search').value),mode=$('f17Mode').value,kind=$('f17Kind').value;
 const eligible=t=>!q||plain(t).includes(q);
 root.replaceChildren();
 $('f17Metrics').textContent=data.counts.historic_events+' eventos · '+data.counts.archived_answers+' respostas · '+data.counts.f17_relations+' vínculos F17 · '+data.counts.interpreted_answer_relations+' relações interpretadas · '+data.counts.proposals+' evoluções';
 let count=0;
 if(mode==='vinculos'){
  const matches=data.edges.filter(e=>(kind==='all'||e.kind===kind)&&eligible([e.from,e.to,e.evidence,cardNode(e.from).subject,cardNode(e.to).subject,edgeKey(e)].join(' ')));
  for(const e of matches)appendEdge(root,e,false);
  count=matches.length;
 }else if(mode==='eventos'){
  const matches=data.historical.filter(x=>eligible([x.id,x.evaluation,x.origin,x.notes,x.date,cardNode(x.id).subject].join(' ')));
  for(const x of matches){
   const c=cardNode(x.id);
   root.append(record(x.id+' · '+c.subject,'Avaliação histórica: '+x.evaluation+' · '+x.date+(x.local_time?' '+x.local_time:''),
    ['Tentativa: '+x.attempt+' · Origem: '+x.origin,'Precisão do registro: '+x.precision,'Próxima revisão registrada na V015: '+(x.existing_due_date||'não confirmada')+' · Não recalculada neste painel',x.notes],
    [chip('Abrir cartão',()=>openCard(x.id)),link('Fonte F17 V029',refUrl('F17_V029'))]));
  }count=matches.length;
 }else if(mode==='respostas'){
  if(!answersF17)await loadCards();
  const source=answersF17?.por_id||{};
  for(const [id,x] of Object.entries(source)){
   if(!eligible([id,cardNode(id).subject,x.conhecimentos_demonstrados,x.conhecimentos_parciais,x.lacunas_em_relacao_ao_enunciado,x.erros_corrigidos].join(' ')))continue;
   const d=el('details',null,'f17Response');
   d.append(el('summary',id+' · '+cardNode(id).subject+' · '+x.classificacao_historica_csv));
   for(const [name,value] of [['Conhecimentos demonstrados',x.conhecimentos_demonstrados],['Cobertura parcial',x.conhecimentos_parciais],['Erros corrigidos',x.erros_corrigidos],['Lacunas identificadas',x.lacunas_em_relacao_ao_enunciado],['Referência de PDF arquivada',x.referencia_pdf_confirmada_no_csv],['Relações originais informadas',x.cobertura_cruzada_ids_informados]]){
    if(value)note(d,name+': '+value);
   }
   d.append(chip('Abrir cartão',()=>openCard(id)));
   root.append(d);count++;
  }
 }else if(mode==='propostas'){
  const matches=data.proposals.filter(x=>eligible([x.id,x.subject,x.question,x.related_cards.join(' ')].join(' ')));
  for(const x of matches){
   const a=record(x.id+' · '+x.subject,x.question,['Resposta de fonte histórica: '+x.answer,'Status: evolução histórica; não aprovada como novo cartão; nenhum SRS gerado'],x.related_cards.map(id=>chip(id,()=>openCard(id))));
   root.append(a);
  }count=matches.length;
 }else if(mode==='assuntos'){
  const m=new Map();
  for(const n of data.card_nodes){
   const key=n.group+'|'+n.subject;if(!m.has(key))m.set(key,{group:n.group,subject:n.subject,ids:new Set(),edges:0});
   m.get(key).ids.add(n.id);
  }
  for(const e of data.edges)for(const id of [e.from,e.to]){const n=cardNode(id),val=m.get(n.group+'|'+n.subject);if(val)val.edges++}
  const matches=[...m.values()].filter(x=>eligible(x.subject+' '+[...x.ids].join(' '))).sort((a,b)=>a.subject.localeCompare(b.subject,'pt-BR'));
  for(const x of matches){
   root.append(record(x.subject,[...x.ids].length+' cartão(ões) presentes nos registros · '+x.edges+' apontamentos de relação',
    ['Agrupamento de referências F17, não índice de domínio ou conclusão do assunto'],
    [chip('Abrir guia do assunto',()=>openSubject(x.group,x.subject)),...[...x.ids].slice(0,5).map(id=>chip(id,()=>openCard(id)))])
   );
  }count=matches.length;
 }
 $('f17ResultCount').textContent=count+' resultado(s) — '+modeName(mode);
 if(!count)note(root,'Sem registros nesta combinação. Experimente outro termo ou tipo de evidência.');
}
async function openDashboard(){
 section('f17');$('f17Search').value='';$('f17Mode').value='vinculos';$('f17Kind').value='all';
 return renderDashboard();
}
const nav=document.querySelector('nav button[data-page="f17"]');
if(nav)nav.addEventListener('click',()=>renderDashboard());
$('f17Search')?.addEventListener('input',renderDashboard);
$('f17Mode')?.addEventListener('change',()=>{$('f17Kind').disabled=$('f17Mode').value!=='vinculos';renderDashboard()});
$('f17Kind')?.addEventListener('change',renderDashboard);
window.BM033Cross={ready,renderCardSummary,decorateCard,renderTopic,openDashboard,renderDashboard};
ready().then(()=>{
 if(document.querySelector('#cartoes.active')&&cards.length)cardRender();
 if(document.querySelector('#f17.active'))renderDashboard();
}).catch(e=>console.warn('Mapa F17:',e));
if(location.hash==='#f17'){section('f17');renderDashboard()}
})();