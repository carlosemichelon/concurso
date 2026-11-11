/* V124 — corrigir variável signature ausente e apresentar cartões diretamente nos assuntos. */

/* Banco Mestre V034: apresentação, conteúdos de assuntos e referências por ID.
   Dados originais, notas SRS e histórico não são modificados. */
(function(){
'use strict';
// Guarda o endereço original antes do bootstrap alterar a hash.
const bm054InitialHash=location.hash;
const byId=id=>document.getElementById(id);
const plain=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim();
function findTopic(c){return topicRows.find(x=>x.group===(c.provisional?'LEGISLACAO':c.group)&&x.subject===(c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros'))}
function gotoCard(id){
 const c=cards.find(x=>x.id===id);
 if(!c)return;
 focusGroup='';
 byId('cardSearch').value=id;byId('cardFilter').value='all';
 byId('cardReviewedOnly').checked=false;byId('cardRecoveredOnly').checked=false;
 byId('cardHidden').checked=true;
 if(byId('cardTopicFilter'))byId('cardTopicFilter').value='all';
 cardLimit=24;section('cartoes');cardRender();
 byId('cardRows').scrollIntoView({block:'start',behavior:'smooth'});
}
function chip(text,click){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=click;return b}
function addTitle(target,title){const h=document.createElement('h3');h.className='sectionTitle';h.textContent=title;target.append(h)}
function addPara(target,text,cls='contextNote'){const p=document.createElement('p');p.className=cls;p.textContent=text;target.append(p)}
function tokenButton(token){
 const b=document.createElement('button');b.type='button';b.className='media-ref';b.textContent=token;
 b.title='Abrir '+token+' no leitor em tela cheia';
 b.onclick=async()=>{
  const normalized=token.toUpperCase().replace(/\s+/g,'-');
  if(normalized.startsWith('CARD-')){gotoCard(normalized);return}
  if(normalized.startsWith('IMG-')){
   try{if(!meta)await loadMeta();if(!imgs.length)await loadImages();const x=meta.images.find(i=>i.no===normalized);if(!x){alert('Imagem não localizada no Atlas: '+normalized);return}await imgOpen(x)}
   catch(e){alert('Não foi possível abrir '+normalized+': '+e.message)}
  }else{
   if(!docs.length)await pdfInit();
   const p=docs.find(x=>x.id.toUpperCase()===normalized);
   if(p)pdfOpen(p);else alert('PDF não localizado no catálogo: '+normalized);
  }
 };
 return b;
}
function linkReferences(parent){
 const re=/\b(?:CARD-\d{4}|IMG-(?:P10-)?\d{1,4}|IJUI-PDF-\d{1,4}|PETRO10-CONAMA-\d{1,4}|MANUSCRITO-252|CAP-\d{1,3}|GUIA-[A-Z0-9-]+)\b/gi;
 const walker=document.createTreeWalker(parent,NodeFilter.SHOW_TEXT);
 const pending=[];while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement?.closest('button,a,code,summary'))continue;if(re.test(n.nodeValue)){pending.push(n)}re.lastIndex=0}
 for(const node of pending){const str=node.nodeValue,fragment=document.createDocumentFragment();let idx=0;for(const match of str.matchAll(re)){fragment.append(document.createTextNode(str.slice(idx,match.index)),tokenButton(match[0]));idx=match.index+match[0].length}fragment.append(document.createTextNode(str.slice(idx)));node.replaceWith(fragment)}
}
function relationGroup(parent,title,items,subtitle){
 if(!items.length)return;
 const div=document.createElement('div');div.className='relationPanel';
 const hd=document.createElement('strong');hd.textContent=title;div.append(hd);
 addPara(div,subtitle,'small');
 const row=document.createElement('div');row.className='chipLinks';
 for(const item of items){row.append(chip(item.label||item.id,()=>gotoCard(item.id)))}
 div.append(row);parent.append(div);
}

function foldAnswer(ans){
 const sets=[
  ['Meu histórico e correções',/Tentativa|Histórico formal|RESPOSTA DISCURSIVA|Conhecimentos demonstrados|Conhecimentos parciais|Erros corrigidos|Lacunas identificadas|Complementações da correção|Macete da revisão|Cobertura cruzada informada|IDs de cobertura|Classificação histórica|Observação de rastreabilidade|Precisão do registro|Próxima revisão|Observações originais|Pendências de conciliação|Precisão da fonte|Resposta discursiva integral/i],
  ['Fontes, versões e rastreabilidade',/Referência da base|Referência de PDF|Fundamento da proposta|PDF original|Origem da questão|Situação editorial|Subassunto|Prioridade histórica/i],
  ['Aprofundamento e evoluções',/Evoluções complementares|Perguntas evolutivas/i]
 ];
 for(const [name,re] of sets){
  const picked=[...ans.children].filter(n=>n.classList?.contains('richSection')&&re.test(n.querySelector('h4')?.textContent||''));
  if(!picked.length)continue;
  const d=document.createElement('details');d.className='answerFold';const s=document.createElement('summary');s.textContent=name+' ('+picked.length+')';d.append(s);
  const b=document.createElement('div');b.className='answerFoldBody';for(const n of picked)b.append(n);d.append(b);ans.append(d);
 }
}
function enhancedCard(article){
 const id=idOf(article),c=cards.find(x=>x.id===id);if(!c)return;
 const ans=article.querySelector('.answer');if(!ans)return;
 for(const b of [...ans.querySelectorAll('.richSection')]){
  const heading=b.querySelector('h4')?.textContent||'';
  if(['Cobertura cruzada com questões de Ijuí','Cobertura cruzada','Imagens relacionadas por grupo — vínculo de ID ainda não confirmado','PDFs relacionados por categoria — vínculo temático','Cobertura do assunto'].includes(heading))b.remove();
  if(heading==='Cobertura cruzada informada (não lançar SRS)')b.querySelector('h4').textContent='IDs de cobertura cruzada do histórico F14/F16 — sem lançamento SRS';
 }

 // V033: evidência direcional e tipologia explícita de cobertura.
 // Nunca confundir referência temática com nova revisão ou domínio demonstrado.
 // A rede F17 é inserida após a renderização pelo módulo de auditoria.
 const buttons=article.querySelector('.buttons');
 const t=findTopic(c);if(t&&buttons)buttons.prepend(chip('Abrir guia do assunto',()=>openTopic(t)));
 linkReferences(ans);linkReferences(article.querySelector('h3'));foldAnswer(ans);
}
const priorCardRender=cardRender;
cardRender=function(){priorCardRender();byId('coverageSummary').replaceChildren();
 const header=document.createElement('p');header.className='notice';header.textContent='Cobertura cruzada = relações entre conhecimentos da base. Arestas do F17 têm fontes e graus de evidência distintos; mesmo assunto não prova cobertura. Nenhuma tentativa nem evento SRS é gerado.';
 byId('coverageSummary').append(header);
 // O resumo detalhado fica na aba Relações entre assuntos.
 for(const a of byId('cardRows').querySelectorAll('article.card'))enhancedCard(a);
};
function makeTopicNote(title,subtitle,text){
 const div=document.createElement('article');div.className='studyNote';
 const tag=document.createElement('span');tag.className='tag';tag.textContent=subtitle||'Conteúdo da base';div.append(tag);
 const h=document.createElement('h3');h.textContent=title;div.append(h);
 addPara(div,text,'');return div;
}

function showTopicImages(t){
 const root=byId('topicMedia');root.replaceChildren();
 addTitle(root,'Imagens e PDFs do assunto');
 const idx=window.BM032VisualIndex;
 const results=(idx?.records||[]).filter(r=>
  r.status!=='pendente'&&r.status!=='reprovada'&&
  (r.relations||[]).some(rel=>rel.group===t.group&&rel.subject===t.subject)
 );
 addPara(root,results.length?results.length+' imagem(ns) com associação de assunto documentada ou compatível com título específico. Verifique a indicação de fonte: a classificação por título não é auditoria do conteúdo técnico da imagem.':'Nenhuma imagem com correspondência específica confirmada para este assunto; o Atlas mantém os arquivos sem associação automática.');
 if(results.length){
  const grid=document.createElement('div');grid.className='topicVisualGrid';
  for(const rec of results){
   const x=meta.images.find(i=>i.no===rec.id);if(!x)continue;
   const div=document.createElement('article');div.className='topicVisualCard';
   const img=document.createElement('img');img.loading='lazy';img.alt='Imagem '+rec.id+' — '+rec.title;img.title='Clique para ampliar e grifar '+rec.id;img.onclick=async()=>{if(!imgs.length)await loadImages();await imgOpen(x)};
   div.append(img);
   const src=x.external?x.preview_url:null;
   if(src)img.src=src;
   else thumb(x).then(t=>{if(t&&img.isConnected)img.src=t;else{img.alt='Miniatura indisponível; abrir pelo identificador';img.classList.add('imageMissing')}}).catch(()=>img.classList.add('imageMissing'));
   const ident=chip(rec.id,async()=>{if(!imgs.length)await loadImages();await imgOpen(x)});
   ident.className='media-ref';div.append(ident);
   const title=document.createElement('p');title.textContent=rec.title;div.append(title);
   const note=document.createElement('small');note.textContent=rec.status==='visual'?'Agrupamento conferido visualmente':rec.status==='documento'?'Vínculo sustentado em relatório':'Associação pelo título — verificar conteúdo';div.append(note);
   if((rec.relatedCards||[]).length){const rows=document.createElement('div');rows.className='chipLinks';
    for(const id of rec.relatedCards)rows.append(chip('Cartão '+id,()=>gotoCard(id)));
    div.append(rows)}
   grid.append(div);
  }
  root.append(grid);
 }
 const keys=[...new Set(plain(t.subject).split(/[^a-z0-9]+/).filter(w=>w.length>=6&&!['gerais','estudo','assunto','concurso','revisao','licenciamento'].includes(w)))];
 const pdfs=docs.filter(d=>keys.some(w=>plain(d.title).includes(w))).slice(0,7);
 if(pdfs.length){
  const wrapper=document.createElement('div');wrapper.className='chipLinks';
  for(const p of pdfs)wrapper.append(chip('PDF · '+p.id+' — '+p.title.slice(0,35),()=>pdfOpen(p)));
  addPara(root,'PDFs sugeridos por correspondência de termos no título — referências temáticas, não vínculo documental confirmado.');
  root.append(wrapper);
 }
}

async function openTopic(t){
 try{
  await loadCards();await loadMeta();if(!docs.length)await pdfInit();
  const subset=cards.filter(c=>(c.provisional?'LEGISLACAO':c.group)===t.group &&
    (c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros')===t.subject);
  window.BM054PendingTopic={group:t.group,subject:t.subject};
  section('tema');
  byId('topicHeading').textContent=t.subject;
  byId('topicGroupCaption').textContent=t.area+' · '+t.label;
  const overview=byId('topicOverview'),guide=byId('topicStudyBlocks');
  overview.replaceChildren();guide.replaceChildren();
  const groups=new Map();
  for(const c of subset){
   const name=(c.sub||'Fundamentos e aplicações').trim();
   if(!groups.has(name))groups.set(name,[]);
   groups.get(name).push(c);
  }
  const index=window.BM032VisualIndex;
  const related=(index?.records||[]).filter(r=>r.status!=='pendente'&&r.status!=='reprovada'&&
    (r.relations||[]).some(z=>z.group===t.group&&z.subject===t.subject));
  const head=document.createElement('div');head.className='v034SubjectOutline';
  const h=document.createElement('h3');h.textContent='Visão do assunto';head.append(h);
  const stats=document.createElement('div');stats.className='v034TopicSummary';
  for(const word of [groups.size+' subassunto(s)',subset.length+' cartão(ões)',related.length+' imagem(ns) identificada(s)']){
   const v=document.createElement('span');v.textContent=word;stats.append(v);
  }
  head.append(stats);
  const note=document.createElement('p');note.textContent='Estude os conceitos por subassunto, consulte as fontes e imagens e pratique os cartões quando desejar. Citações de normas são referências do arquivo, não verificação automática da edição vigente.';head.append(note);
  if(groups.size){
   const nav=document.createElement('div');nav.className='chipLinks';
   let i=0;for(const [name,list] of groups){
    if(i++>=25)break;
    const b=chip(name+' ('+list.length+')',()=>{const target=document.getElementById('v034-sub-'+[...groups.keys()].indexOf(name));if(target){target.open=true;target.scrollIntoView({behavior:'smooth',block:'start'})}});
    nav.append(b);
   }
   head.append(nav);
  }
  const normTexts=subset.map(c=>[c.front,c.back,c.expl,c.sub].filter(Boolean).join(' ')).join(' ');
  const normRe=/\b(?:ABNT\s+)?NBR\s*\d{4,5}(?:[-:]\d{1,3})?(?::\d{4})?|\bNR[-\s]?\d{1,2}\b|\bCONAMA\s*(?:n[ºo.]*)?\s*\d{1,3}\s*\/\s*\d{2,4}\b|\bLei\s*(?:Complementar\s*)?(?:n[ºo.]*)?\s*\d{1,5}(?:\.\d{3})?\s*\/\s*\d{2,4}\b/gi;
  const norms=[...new Set((normTexts.match(normRe)||[]).map(x=>x.trim()))].slice(0,20);
  if(norms.length){
   const label=document.createElement('strong');label.textContent='Normas citadas nos registros';head.append(label);
   const row=document.createElement('div');row.className='v034Norms';
   for(const n of norms){const e=document.createElement('span');e.textContent=n;row.append(e)}head.append(row);
  }
  overview.append(head);
  if(!subset.length){
   guide.append(makeTopicNote('Biblioteca visual do assunto','Assunto com imagens','Este tema possui material de consulta no Atlas, mas não possui cartões de leitura específicos. Consulte as imagens abaixo.'));
  }else{
   for(const [sub,list] of groups){
    const details=document.createElement('details');details.className='v034Subtopic';
    details.id='v034-sub-'+[...groups.keys()].indexOf(sub);
    details.open=false; // V122: todos os subassuntos recolhidos na abertura
    const sum=document.createElement('summary');sum.textContent=sub+' · '+list.length+' cartão(ões) · abrir';details.append(sum);
    const body=document.createElement('div');body.className='v034SubtopicBody';details.append(body);
    // Um cartão por ID: não deduplicar pelo verso, pois perguntas distintas
    // podem ter a mesma resposta. Mostrar a pergunta; ocultar o gabarito.
    const entries=list.filter(c=>c&&c.id&&c.front);
    if(!entries.length)addPara(body,'Ainda não há cartões com pergunta cadastrada neste subassunto.');
    function addRecord(c){
     const article=document.createElement('article');
     article.className='v034Concept bm124TopicCard';
     article.dataset.cardId=c.id;
     const title=document.createElement('strong');
     title.textContent=c.id+' — '+c.front;
     title.title='Frente original do flashcard; gabarito inicialmente oculto';
     article.append(title);
     const answer=document.createElement('details');
     answer.className='bm124TopicAnswer';
     const summary=document.createElement('summary');
     summary.textContent='Revelar resposta do cartão';
     answer.append(summary);
     const back=document.createElement('p');
     back.className='bm124AnswerText';
     back.textContent=c.back||'Resposta não cadastrada';
     answer.append(back);
     if(c.expl||c.mnemonic){
      const extra=document.createElement('details');
      extra.className='bm124TopicExtra';
      const extraSummary=document.createElement('summary');
      extraSummary.textContent='Ver explicação e macete';
      extra.append(extraSummary);
      if(c.expl){
       const explanation=document.createElement('p');
       explanation.textContent=c.expl;
       extra.append(explanation);
      }
      if(c.mnemonic){
       const trick=document.createElement('p');
       trick.textContent='Macete: '+c.mnemonic;
       extra.append(trick);
      }
      answer.append(extra);
     }
     const ref=generalGuide?.por_id?.[c.id]?.ref||c.reference;
     if(ref){
      const small=document.createElement('small');
      small.textContent='Referência: '+ref;
      answer.append(small);
     }
     article.append(answer);
     const line=document.createElement('div');
     line.className='chipLinks bm124CardActions';
     line.append(chip('Estudar cartão '+c.id,()=>gotoCard(c.id)));
     line.append(chip('✎ Grifar / escrever',()=>{
      const ink=window.BancoMestreCardInkV122;
      if(ink?.openId)ink.openId(c.id);
      else gotoCard(c.id);
     }));
     article.append(line);
     body.append(article);
    }
    entries.slice(0,14).forEach(addRecord);
    if(entries.length>14){
     const more=chip('Exibir mais '+(entries.length-14)+' cartão(ões)',()=>{
      entries.slice(14).forEach(addRecord);more.remove();
     });
     body.append(more);
    }
    guide.append(details);
   }
  }
  const tips=[...new Set(subset.map(x=>x.mnemonic).filter(Boolean))].slice(0,12);
  const tipbox=byId('topicMacetes');tipbox.replaceChildren();
  if(tips.length){for(const x of tips)tipbox.append(makeTopicNote('Macete do acervo','Memorização',x))}
  else addPara(tipbox,'Nenhum macete validado está registrado para este tema.');
  showTopicImages(t);
  const rel=byId('topicRelated');rel.replaceChildren();
  addTitle(rel,'Relações documentadas e referências');
  if(window.BancoMestreF17?.renderForTopic)await window.BancoMestreF17.renderForTopic(t);
  else addPara(rel,'As referências históricas deste assunto não estão disponíveis neste momento.');
  const distinct=plain(t.subject).split(/[^a-z0-9]+/).filter(w=>w.length>=6&&!['concreto','estruturas','materiais','engenharia','analise','estudo','tecnica','prediais','gerais','assuntos'].includes(w));
  const suggestions=topicRows.filter(x=>x.group===t.group&&x.subject!==t.subject &&
    distinct.some(w=>plain(x.subject).includes(w))).slice(0,8);
  if(suggestions.length){
   const hd=document.createElement('h3');hd.className='sectionTitle';hd.textContent='Outros assuntos do mesmo núcleo temático';rel.append(hd);
   addPara(rel,'Sugestões pelos termos de classificação. Não são relações de cobertura comprovada.','contextNote');
   const wrap=document.createElement('div');wrap.className='v034NextTopics';
   for(const item of suggestions)wrap.append(chip(item.subject,()=>openTopic(item)));
   rel.append(wrap);
  }
  const bt=byId('topicGoCards');bt.hidden=!subset.length;
  bt.onclick=()=>{focusGroup=t.group;byId('cardSearch').value='';byId('cardFilter').value='all';byId('cardRecoveredOnly').checked=false;byId('cardReviewedOnly').checked=false;if(byId('cardTopicFilter'))byId('cardTopicFilter').value=t.subject;cardLimit=24;section('cartoes');cardRender()};
  byId('topicBack').onclick=()=>{
   if(history.state?.bmTopic===true && history.state?.bmReturnInternal===true)history.back();
   else section('assuntos');
  };
  scrollTo({top:0,behavior:'smooth'});
 }catch(e){alert('Não foi possível abrir o assunto: '+e.message)}
}
const priorTopicRender=topicRender;
topicRender=function(){priorTopicRender();
 const q=plain(byId('topicSearch').value),area=byId('topicArea').value;
 const list=topicRows.filter(x=>(area==='all'||x.area===area)&&plain(x.subject+' '+x.label+' '+x.area).includes(q));
 [...byId('topicRows').querySelectorAll('button.topicCard')].forEach((node,i)=>{
  if(!list[i])return;
  const t=list[i];node.onclick=()=>openTopic(t);
  const n=window.BM033Cross?.countForSubject?.(t.group,t.subject)||0;
  if(n){const small=node.querySelector('small');if(small)small.textContent+=' · '+n+' relações documentadas';}
 });
};
const priorPdfRender=pdfRender;
pdfRender=function(){priorPdfRender();for(const article of byId('pdfRows').querySelectorAll('article.card')){
 const p=docs.find(x=>x.id===idOf(article));if(!p)continue;
 for(const node of [article.querySelector(':scope > .tag'),article.querySelector('h3')])if(node){node.tabIndex=0;node.setAttribute('role','button');node.title='Abrir '+p.id+' em tela cheia';node.onclick=()=>pdfOpen(p);node.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();pdfOpen(p)}}}
 }};
const priorImgRender=imgRender;
imgRender=async function(){await priorImgRender();for(const article of byId('imageRows').querySelectorAll('article.card')){
 const im=imgs.find(x=>x.no===idOf(article));const node=article.querySelector(':scope > .tag');if(!im||!node)continue;
 node.tabIndex=0;node.setAttribute('role','button');node.title='Abrir '+im.no+' em tela cheia';node.onclick=()=>imgOpen(im);node.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();imgOpen(im)}};
 }};
// Os manipuladores de entrada antigos guardavam a função anterior por valor.
byId('topicSearch').oninput=topicRender;byId('topicArea').onchange=topicRender;
byId('pdfSearch').oninput=pdfRender;byId('pdfFilter').onchange=pdfRender;byId('pdfHidden').onchange=pdfRender;
window.BancoMestreV034={openTopic,gotoCard};

// V054: URLs específicas de cada assunto e histórico navegável (Voltar / Avançar).
async function bm054RestoreTopic(hash){
 if(!hash.startsWith('#tema?'))return false;
 const params=new URLSearchParams(hash.slice('#tema?'.length));
 const group=params.get('g'),subject=params.get('s');
 if(!group||!subject)return false;
 if(!topicRows.length)await loadTopics();
 let t=topicRows.find(x=>x.group===group&&x.subject===subject);
 if(!t){
  // Inclui assuntos visuais que são acrescentados durante o carregamento do índice.
  await loadTopics();t=topicRows.find(x=>x.group===group&&x.subject===subject);
 }
 if(!t){console.warn('Assunto do link não encontrado',group,subject);section('assuntos');return false;}
 window.BM054HistoryRestoring=true;
 try{await window.BancoMestreV034.openTopic(t);}
 finally{window.BM054HistoryRestoring=false;}
 return true;
}
async function bm054RestoreNavigation(state){
 const hash=location.hash;
 if(hash.startsWith('#tema?')){await bm054RestoreTopic(hash);return;}
 const page=hash.slice(1);
 const target=['assuntos','pdfs','cartoes','imagens'].includes(page)?page:'assuntos';
 window.BM054HistoryRestoring=true;
 try{section(target);}
 finally{window.BM054HistoryRestoring=false;}
 if(target==='assuntos'){
  const y=typeof state?.bmScrollY==='number'?state.bmScrollY:0;
  if(!topicRows.length)await loadTopics();
  requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
 }else requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
}
window.addEventListener('popstate',e=>{
 bm054RestoreNavigation(e.state).catch(err=>console.warn('Falha ao restaurar navegação de tema',err));
});
document.addEventListener('DOMContentLoaded',()=>{
 // O bootstrap antigo interpreta somente #tema sem parâmetros e pode ir para #assuntos.
 // Restaura a hash completa antes de abrir o assunto pelo identificador estável.
 if(bm054InitialHash.startsWith('#tema?')){
  history.replaceState(history.state,'',bm054InitialHash);
  bm054RestoreTopic(bm054InitialHash).catch(err=>console.warn('Falha ao abrir tema pelo link',err));
 }
});
})();
