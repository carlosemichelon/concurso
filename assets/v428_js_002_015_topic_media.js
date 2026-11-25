/* V315 IIFE scripts 2–15 original execution */

;
/* 2 assets/v171_assuntos_rapidos.js */
/* V170 — versão de trabalho isolada; preservar a V169 */
/* V126 — link direto rápido: índice visual por assunto, sem carga duplicada, com cartões exatos por título. */
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
   if(!docs.length)await (window.BM169PdfInitPromise||pdfInit());
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

/* V169: somente mídia do assunto, sob demanda e sem disparar novo pdfInit duplicado. */
let bm169MediaSequence=0;
let bm170TopicRequest=0;
let bm171QuickPdfPromise=null;
function bm171GetQuickPdf(){
 if(!bm171QuickPdfPromise)bm171QuickPdfPromise=fetch('assets/topic_pdf_links_v170.json',{cache:'force-cache'})
  .then(async r=>{if(!r.ok)throw Error('Catálogo rápido não acessível');return r.json()})
  .then(d=>{if(d.format!=='BancoMestreTopicPDFLinksV170'||d.documents?.length!==78)throw Error('Índice PDF incompatível');return d.documents})
  .catch(e=>{console.warn('PDFs do assunto:',e);bm171QuickPdfPromise=null;return null});
 return bm171QuickPdfPromise;
}
function bm171RenderTopicMedia(t,fastPdf){
 const root=byId('topicMedia');
 if(!root)return;
 const run=String(++bm169MediaSequence);
 root.dataset.bm169Run=run;
 root.replaceChildren();
 const pending=[];
 addTitle(root,'Imagens e PDFs do assunto');
 const idx=window.BM032VisualIndex;
 const results=(idx?.records||[]).filter(r=>
  r.status!=='pendente'&&r.status!=='reprovada'&&
  (r.relations||[]).some(rel=>rel.group===t.group&&rel.subject===t.subject)
 );
 if(results.length)addPara(root,results.length+' imagem(ns) com associação temática; consulte a fonte e confira a exatidão técnica.','contextNote');
 if(results.length){
  const grid=document.createElement('div');grid.className='topicVisualGrid bm169-topic-images';
  const byImageId=new Map(meta.images.map(x=>[x.no,x]));
  for(const rec of results){
   const x=byImageId.get(rec.id);if(!x)continue;
   const div=document.createElement('article');div.className='topicVisualCard bm169-topic-card';
   const img=document.createElement('img');
   img.loading='eager';img.decoding='async';img.width=420;img.height=240;
   if(grid.children.length<3)img.setAttribute('fetchpriority','high');
   img.alt='Imagem '+rec.id+' — '+rec.title;img.title='Clique para ampliar e grifar '+rec.id;
   img.onclick=async()=>{if(!imgs.length)await loadImages();await imgOpen(x)};
   const frame=document.createElement('div');frame.className='bm422-thumb';frame.append(img);div.append(frame);
   const src=x.external?(String(x.preview_url||'').startsWith('https://drive.google.com/thumbnail?')?String(x.preview_url).replace(/([?&])sz=w\d+/,'$1sz=w600'):x.preview_url):(/^IMG-\d{3}$/.test(rec.id)?'assets/topic_thumbs_v170/'+rec.id+'.jpg':null);
   pending.push(new Promise(resolve=>{
    let finished=false,attempt=0;
    const active=()=>root.dataset.bm169Run===run;
    function finish(ok){if(finished)return;finished=true;clearTimeout(deadline);img.onload=null;img.onerror=null;if(!ok&&active()){img.alt='Miniatura indisponível; abrir pelo identificador '+rec.id;img.classList.add('imageMissing')}resolve(ok)}
    const deadline=setTimeout(()=>finish(false),45000);
    img.onload=()=>finish(true);
    img.onerror=async()=>{if(finished)return;if(x.external||attempt++||!active()){finish(false);return}try{const fallback=await thumb(x);if(finished)return;if(fallback&&active())img.src=fallback;else finish(false)}catch(e){finish(false)}};
    if(src)img.src=src;else finish(false);
   }));
   const ident=chip(rec.id,async()=>{if(!imgs.length)await loadImages();await imgOpen(x)});
   ident.className='media-ref';div.append(ident);
   const title=document.createElement('p');title.textContent=rec.title;div.append(title);
   const note=document.createElement('small');
   note.textContent=rec.status==='visual'?'Agrupamento conferido visualmente':rec.status==='documento'?'Vínculo sustentado em relatório':'Associação pelo título — verificar conteúdo';
   div.append(note);
   if((rec.relatedCards||[]).length){
    const rows=document.createElement('div');rows.className='chipLinks';
    for(const id of rec.relatedCards)rows.append(chip('Cartão '+id,()=>gotoCard(id)));
    div.append(rows);
   }
   grid.append(div);
  }
  root.append(grid);
 }
 const pdfHolder=document.createElement('div');pdfHolder.className='bm169-topic-pdf-holder';
 root.append(pdfHolder);
 const renderPdfs=(fast)=>{
  if(root.dataset.bm169Run!==run||!pdfHolder.isConnected)return;
  pdfHolder.replaceChildren();
  const source=docs.length?docs:(Array.isArray(fast)?fast:[]);
  if(!source.length){
   addPara(pdfHolder,'O catálogo de PDFs não ficou disponível. Você ainda pode consultar a biblioteca de PDFs.','contextNote');
   return;
  }
  const keys=[...new Set(plain(t.subject).split(/[^a-z0-9]+/).filter(w=>w.length>=6&&!['gerais','estudo','assunto','concurso','revisao','licenciamento'].includes(w)))];
  const pdfs=source.filter(d=>keys.some(w=>plain(d.title).includes(w))).slice(0,7);
  if(pdfs.length){
   const wrap=document.createElement('div');wrap.className='chipLinks bm169-pdf-links';
   for(const p of pdfs)wrap.append(chip('PDF · '+p.id+' — '+p.title.slice(0,35),()=>pdfOpen(docs.find(x=>x.id===p.id)||p)));
   addPara(pdfHolder,'Sugestões por título, sem vínculo documental confirmado.','contextNote');
   pdfHolder.append(wrap);
  }
  if(docs.length){
   const tokens=new Set(plain(t.subject).split(/[^a-z0-9]+/).filter(w=>w.length>=5&&
    !['engenharia','assuntos','concreto','normas','gerais','estruturas','materiais'].includes(w)));
   const additional=docs.filter(d=>d.category===t.group&&!pdfs.some(p=>p.id===d.id))
    .map(d=>({doc:d,score:[...tokens].filter(w=>plain(d.title).includes(w)).length}))
    .sort((a,b)=>b.score-a.score||a.doc.title.localeCompare(b.doc.title,'pt-BR')).slice(0,5);
   if(additional.length){
    const box=document.createElement('div');box.className='v036-topic-pdfs';
    addTitle(box,'Capítulos e PDFs da mesma disciplina');
    addPara(box,'Referências por categoria, sem confirmação de cobertura integral.','v036-topic-pdf-note');
    const row=document.createElement('div');row.className='v036-topic-pdf-links';
    for(const item of additional){const b=chip(item.doc.title,()=>pdfOpen(item.doc));b.className='v036-topic-pdf-link';row.append(b);}
    box.append(row);pdfHolder.append(box);
   }
  }
 };
 renderPdfs(docs.length?docs:fastPdf);
 return {run,pending};
}


/* Assuntos: mostrar apenas o acesso aos materiais. A S Pen em hover, 
   o movimento de rolagem e a troca de tema não requisitam as mídias. */
function showTopicImages(t){
 const root=byId('topicMedia');if(!root)return;
 ++bm169MediaSequence; // invalida respostas de imagens/PDFs do assunto anterior
 root.dataset.bm169Run=String(bm169MediaSequence);
 root.replaceChildren();root.removeAttribute('aria-busy');
 document.getElementById('bm428TopicProgress')?.remove();
 root.classList.add('bm171-media-closed');
 root.classList.remove('bm171-media-open');
 const open=chip('Consultar imagens e PDFs deste assunto',async()=>{
  if(open.disabled||root.classList.contains('bm171-media-open'))return;
  let run=root.dataset.bm169Run;
  open.disabled=true;
  open.textContent='Carregando imagens e PDFs…';
  root.setAttribute('aria-busy','true');
  document.getElementById('bm428TopicProgress')?.remove();
  const loading=document.createElement('div');loading.id='bm428TopicProgress';loading.className='bm428-media-loading';loading.dataset.state='loading';
  const label=document.createElement('p');label.className='bm418-media-label';label.setAttribute('role','status');label.setAttribute('aria-live','polite');label.textContent='Carregando catálogo de imagens…';
  const bar=document.createElement('progress');bar.className='bm418-media-progress';bar.setAttribute('aria-label','Carregamento de imagens e PDFs'); // indeterminado; não simula percentual
  loading.append(label,bar);root.before(loading);
  try{
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   await loadMeta();
   if(!open.isConnected||root.dataset.bm169Run!==run)return;
   label.textContent='Localizando PDFs relacionados…';
   const fastPdf=docs.length?docs:await bm171GetQuickPdf();
   if(!open.isConnected||root.dataset.bm169Run!==run)return;
   label.textContent='Preparando materiais do assunto…';
   root.classList.remove('bm171-media-closed');
   root.classList.add('bm171-media-open');
   open.setAttribute('aria-expanded','true');
   const batch=bm171RenderTopicMedia(t,fastPdf);
   if(!batch)throw Error('Área de materiais indisponível');
   run=batch.run;
   const total=batch.pending.length;let done=0;
   if(total){
    bar.max=total;bar.value=0;
    label.textContent='Carregando miniaturas (0 de '+total+')…';
   }
   const results=await Promise.all(batch.pending.map(p=>p.then(ok=>{
    if(root.dataset.bm169Run===batch.run){done++;bar.value=done;label.textContent='Carregando miniaturas ('+done+' de '+total+')…'}return ok;
   })));
   if(root.dataset.bm169Run!==batch.run)return;
   root.removeAttribute('aria-busy');
   const failed=results.filter(ok=>!ok).length;
   bar.max=Math.max(1,total);bar.value=bar.max;
   loading.dataset.state=failed?'warning':'complete';
   label.textContent=failed?'Consulta concluída · '+(total-failed)+' de '+total+' miniaturas disponíveis':'Consulta concluída'+(total?' · '+total+' miniatura(s) carregada(s)':' · sem miniaturas neste assunto');
   if(failed)addPara(root,failed+' miniatura(s) indisponível(is). Abra pelo identificador ou tente consultar o assunto novamente.','contextNote');
  }catch(e){
   if(root.dataset.bm169Run!==run)return;
   root.removeAttribute('aria-busy');
   loading.dataset.state='error';bar.hidden=true;label.textContent='Não foi possível concluir a consulta. Tente novamente.';
   root.classList.remove('bm171-media-open');
   root.classList.add('bm171-media-closed');
   if(!open.isConnected)root.replaceChildren(open);
   open.textContent='Tentar consultar imagens e PDFs novamente';
   open.title=String(e?.message||e);
   open.disabled=false;
  }
 });
 open.className='bm171-open-media';
 open.setAttribute('aria-expanded','false');
 open.setAttribute('aria-label','Carregar e consultar imagens e PDFs do assunto');
 root.append(open);
}

async function openTopic(t){
 try{
  const request=++bm170TopicRequest;
  window.BM054PendingTopic={group:t.group,subject:t.subject};
  section('tema');
  byId('topicHeading').textContent=t.subject;
  byId('topicGroupCaption').textContent=t.area+' · '+t.label;
  const mediaNode=byId('topicMedia'),overviewNode=byId('topicOverview');
  if(mediaNode?.parentNode===overviewNode?.parentNode)overviewNode.after(mediaNode);
  byId('topicStudyBlocks').textContent='Carregando os cartões e subassuntos…';
  showTopicImages(t);
  await loadMeta();
  if(request!==bm170TopicRequest)return;
  await loadCards();
  if(request!==bm170TopicRequest)return;
  // Respect original groups. On visual-only subjects, link same-title cards
  // only if exactly one canonical group owns that subject.
  const direct=cards.filter(c=>(
    (c.provisional?'LEGISLACAO':c.group)===t.group &&
    (c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros')===t.subject &&
    (c.provisional||c.active!==false)));
  let subset=direct,linkedFromOtherGroup='';
  if(!direct.length && t.visualOnly && t.group.startsWith('ENG_')){
   const candidates=cards.filter(c=>!c.provisional&&c.active!==false&&c.subject===t.subject);
   const groups=new Set(candidates.map(c=>c.group));
   if(groups.size===1&&candidates.length){
    linkedFromOtherGroup=[...groups][0];
    subset=candidates;
   }
  }
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
  if(linkedFromOtherGroup){
   const info=document.createElement('p');
   info.className='bm126-cross-category-info';
   info.textContent='Cartões relacionados pelo nome exato do assunto ('+subset.length+
    '), cadastrados originalmente em '+linkedFromOtherGroup+
    '. Os IDs e a classificação original não foram alterados.';
   head.append(info);
  }
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
 if(!group||!subject||group.length>120||subject.length>250)return false;
 let t=topicRows.find(x=>x.group===group&&x.subject===subject);
 if(!t){
  // A deep link already tells us its topic; avoid rebuilding every topic tile.
  await loadCards();
  await loadMeta();
  const exact=cards.filter(c=>(c.provisional?'LEGISLACAO':c.group)===group &&
   (c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros')===subject);
  const imageRecords=window.BM032VisualIndex?.records||[];
  const visualMatches=imageRecords.filter(r=>
   r.status!=='pendente'&&r.status!=='reprovada'&&
   (r.relations||[]).some(rel=>rel.group===group&&rel.subject===subject));
  const matchingGroup=meta?.groups?.find(g=>g.id===group);
  if(exact.length||visualMatches.length){
   t={group,subject,count:exact.length,imgCount:visualMatches.length,
    area:topicAreaOf(group),label:matchingGroup?.title||group,
    visualOnly:!exact.length};
  }else{
   // Old URL may refer to a group changed by a later consolidation:
   // follow it only if the exact subject exists in one and only one group.
   const sameTitle=cards.filter(c=>
    (c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros')===subject);
   const groups=new Set(sameTitle.map(c=>c.provisional?'LEGISLACAO':c.group));
   if(groups.size===1){
    const resolved=[...groups][0];
    const original=meta?.groups?.find(g=>g.id===resolved);
    t={group:resolved,subject,count:sameTitle.length,area:topicAreaOf(resolved),
     label:original?.title||resolved,visualOnly:false};
   }
  }
 }
 // Only use the full index as a fallback when the direct lookup cannot resolve.
 if(!t){
  if(!topicRows.length)await loadTopics();
  t=topicRows.find(x=>x.group===group&&x.subject===subject);
 }
 if(!t){
  console.warn('Assunto do link não encontrado',group,subject);
  section('assuntos');return false;
 }
 window.BM054HistoryRestoring=true;
 try{
  await window.BancoMestreV034.openTopic(t);
  // Keep the shareable link canonical when the group's ID was migrated.
  if(t.group!==group){
   const updated='#tema?g='+encodeURIComponent(t.group)+'&s='+encodeURIComponent(t.subject);
   history.replaceState(history.state,'',updated);
  }
 }finally{window.BM054HistoryRestoring=false}
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


;
/* 3 assets/pdf_v122.js */
/* V111 — provenance supports twelve law profiles + General, no old mark rewrite. */
/* V110 — save approved calibration context only on newly created highlights. */
/* V109 — origem/evidência da sugestão gravadas nos novos núcleos (sem recolorir antigos). */
/* V108 — reversible archived PDF highlights; safe editor changes with timestamp. */
/* V106 — crisp highlighted text using PDF-canvas multiply; stored marks unchanged. */
/* V104 — PDF pinch zoom anchored to touch center. Existing editor and scroll preserved. */
/* V102 — retomar a última página neste navegador; exibição de realces com contraste legível. */
/* V101 — leitura fluida: reuso de páginas, cancelamento de renders obsoletos e prévia progressiva. */
/* V097 — preserve logical multicolor group identity; no existing marks changed. */
/* V070: agrupamento atômico de grifos sem migrar registros anteriores. */
/* V069: estabilização do grifador — eventos de persistência e seleção após renderização. */
/* Banco Mestre V122: cores e grifos permanecem vinculados ao PDF, exclusão definitiva sem guardar marca completa. */
/* Banco Mestre V068: grifador avançado; os arquivos da V061 permanecem intactos. */
/* Banco Mestre V061: modo texto, V060 intacta. */

/* Banco Mestre V048 — leitor e editor PDF persistente com referência aos cartões, direto na página.
   PDF.js rasteriza para leitura; camada de tinta transparente usa IDs antigos
   BM030_STROKES_PDF:...; pdf-lib grava uma CÓPIA PDF anotada sem substituir original.
   O iframe Google Drive é somente leitura (origem cruzada).
   Cópias autorizadas podem ser guardadas apenas neste navegador em IndexedDB. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const versionTag='V038';
const DB_NAME='BancoMestrePDFLocalV035',STORE='sources';
let selected=null,pdf=null,sourceBytes=null,info=null,pageNo=1,zoom=1,task=Promise.resolve(),serial=0,painting=false,tool='marker',draft=null,undo=new Map(),redo=new Map(),loadingLib=null,loadingSaveLib=null,dbPromise=null,exportBusy=false,cachedSource=null;
let pinchBlocked=false;
const OPACITY_KEY='BM_PDF_MARKER_OPACITY_V046';
 const LAST_PAGE_PREFIX='BM102_PDF_LAST_PAGE:';
 const READABLE_KEY='BM102_PDF_READABLE_HIGHLIGHTS';
 const SCREEN_INTENSITY_KEY='BM106_PDF_SCREEN_HIGHLIGHT_STRENGTH';
 let screenIntensity=.55;
 try{
  const saved=Number(localStorage.getItem(SCREEN_INTENSITY_KEY));
  if(Number.isFinite(saved)&&saved>=.30&&saved<=.80)screenIntensity=saved;
 }catch(_){}
 let readableHighlights=true;
 try{readableHighlights=localStorage.getItem(READABLE_KEY)!=='0'}catch(_){}
 const pageKey=(id,hash)=>LAST_PAGE_PREFIX+encodeURIComponent(String(id||''))+':'+String(hash||'');
 function savedPage(id,hash,total){
  try{
   const n=Number(localStorage.getItem(pageKey(id,hash)));
   return Number.isSafeInteger(n)&&n>=1&&n<=total?n:1;
  }catch{return 1}
 }
 function saveCurrentPage(){
  if(!pdf||!selected?.id||!info?.hash||pageNo<1||pageNo>pdf.numPages)return;
  try{localStorage.setItem(pageKey(selected.id,info.hash),String(pageNo))}catch(_){}
 }

let markerOpacity=.25;
// V058: clique inicial e clique final produzem um trecho horizontal.
// Uma ação de arrastar continua gerando o grifo livre da versão anterior.
let pendingMarkerStart=null,markerGesture=null;
function notifyMarkerState(){
 window.dispatchEvent(new CustomEvent('bm-pdf-marker-state',{
  detail:{pending:!!pendingMarkerStart}
 }));
}
function cancelMarkerStart(){
 pendingMarkerStart=null;markerGesture=null;draft=null;notifyMarkerState();
}
function straightHighlight(start,end){
 // Preserva o mesmo formato de grifo da base e das exportações anteriores.
 // A altura é a do PRIMEIRO clique: o traço permanece alinhado à mesma linha.
 const y=start[1];
 return {type:'highlighter',color:$('pdfInkColor').value,size:12,
  opacity:markerOpacity,points:[[start[0],y,.65],[end[0],y,.65]],straight:true};
}
try{const saved=Number(localStorage.getItem(OPACITY_KEY));if(saved>=.1&&saved<=.65)markerOpacity=saved}catch(_){};
const pageCanvas=$('pdfLocalCanvas'),inkCanvas=$('pdfInkCanvas');
const pageWrap=$('pdfPageWrap'),pagePane=$('pdfLocalMode'),inkCtx=inkCanvas.getContext('2d');
let bm420FitMode='page';
function bm420BaseScale(original){
 const w=Math.max(40,pagePane.clientWidth-32),h=Math.max(40,pagePane.clientHeight-32);
 const target=bm420FitMode==='page'?Math.min(w/original.width,h/original.height):w/original.width;
 return Math.max(.08,Math.min(2,target));
}
async function bm420Fit(mode){
 if(!pdf||painting||exportBusy)return false;
 bm420FitMode=mode;zoom=1;await render();centerActive();pagePane.scrollLeft=0;
 window.dispatchEvent(new CustomEvent('bm-pdf-zoom-changed',{detail:{zoom}}));return true;
}
let bm420Drag=null;
pagePane.addEventListener('pointerdown',e=>{
 if(!pdf||painting||exportBusy||!$('pdfDialog').open||e.pointerType==='touch'||!(e.button===0&&(tool==='pan'||e.shiftKey)||e.button===1))return;
 if(e.target.closest?.('button,input,select,textarea,a,[contenteditable=true]'))return;
 e.preventDefault();e.stopImmediatePropagation();bm420Drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:pagePane.scrollLeft,sy:pagePane.scrollTop};
 pagePane.classList.add('bm420-dragging');pagePane.setPointerCapture(e.pointerId);
},true);
pagePane.addEventListener('pointermove',e=>{
 if(bm420Drag?.id!==e.pointerId)return;e.preventDefault();e.stopImmediatePropagation();
 pagePane.scrollLeft=bm420Drag.sx-(e.clientX-bm420Drag.x);pagePane.scrollTop=bm420Drag.sy-(e.clientY-bm420Drag.y);
},true);
function bm420StopDrag(e){if(bm420Drag?.id!==e.pointerId)return;bm420Drag=null;pagePane.classList.remove('bm420-dragging');if(e.type!=='lostpointercapture'){e.preventDefault();e.stopImmediatePropagation();if(pagePane.hasPointerCapture(e.pointerId))pagePane.releasePointerCapture(e.pointerId)}}
for(const name of ['pointerup','pointercancel','lostpointercapture'])pagePane.addEventListener(name,bm420StopDrag,true);
$('pdfDialog').addEventListener('close',()=>{bm420Drag=null;pagePane.classList.remove('bm420-dragging')});
// Janela virtual de três páginas: evita carregar centenas de canvases de uma só vez.
const prevSlice=document.createElement('div'),nextSlice=document.createElement('div');
for(const slice of [prevSlice,nextSlice]){
 slice.className='bm-v048-neighbor';slice.hidden=true;
 slice.setAttribute('aria-label','Página adjacente do PDF, disponível para leitura por rolagem');
}
pageWrap.before(prevSlice);pageWrap.after(nextSlice);
const topInPane=el=>el.getBoundingClientRect().top-pagePane.getBoundingClientRect().top+pagePane.scrollTop;
let suppressScroll=false,promoting=false,renderingNeighbors=false;
const rasterCache=new Map(),neighborTasks=new Set(),CACHE_PIXELS=12000000;
let activeRenderTask=null,lastTravelDirection=1;
const rasterKey=(n,w,h,scale)=>n+'|'+w+'x'+h+'|'+scale.toFixed(5);
function getRaster(id){const r=rasterCache.get(id);if(r){rasterCache.delete(id);rasterCache.set(id,r)}return r||null}
function rememberRaster(id,r){
 if(r.width*r.height>CACHE_PIXELS)return;
 rasterCache.delete(id);rasterCache.set(id,r);
 let pixels=Array.from(rasterCache.values()).reduce((a,x)=>a+x.width*x.height,0);
 while(rasterCache.size>2||pixels>CACHE_PIXELS){
  const oldKey=rasterCache.keys().next().value,old=rasterCache.get(oldKey);
  pixels-=old.width*old.height;rasterCache.delete(oldKey);
 }
}
function previewRaster(n,w,h){
 for(const r of Array.from(rasterCache.values()).reverse())
  if(r.page===n&&Math.abs(r.logicalWidth-w)<3&&Math.abs(r.logicalHeight-h)<3)return r.canvas;
 return null;
}
const isCancel=e=>e?.name==='RenderingCancelledException'||/rendering cancel/i.test(String(e?.message||''));
function cancelRenders(){
 for(const job of neighborTasks){try{job.cancel()}catch(_){}}
 neighborTasks.clear();renderingNeighbors=false;
 if(activeRenderTask){try{activeRenderTask.cancel()}catch(_){}}
}
function clearRenderCache(){rasterCache.clear()}


const menu=['pdfPrev','pdfNext','pdfZoomOut','pdfZoomIn','pdfFitPage','pdfFitWidth','pdfDraw','pdfMarker','pdfEraser','pdfPan','pdfUndo','pdfRedo','pdfClearPage','pdfExportPNG','pdfExportPDF','pdfChangeFile'];
const status=message=>$('pdfLocalStatus').textContent=message;
function library(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('Biblioteca indisponível: '+url));document.head.append(s)})}
async function pdfjs(){
 if(window.pdfjsLib)return window.pdfjsLib;
 if(!loadingLib)loadingLib=(async()=>{
  try{await library('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')}
  catch{await library('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js')}
  if(!window.pdfjsLib)throw Error('Leitor PDF.js não foi carregado');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
 })().catch(e=>{loadingLib=null;throw e});
 return loadingLib;
}
async function pdflib(){
 if(window.PDFLib)return window.PDFLib;
 if(!loadingSaveLib)loadingSaveLib=(async()=>{
  try{await library('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js')}
  catch{await library('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js')}
  if(!window.PDFLib)throw Error('Gerador de PDF indisponível');
  return window.PDFLib;
 })().catch(e=>{loadingSaveLib=null;throw e});
 return loadingSaveLib;
}
function db(){
 if(!dbPromise)dbPromise=new Promise((yes,no)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};
  req.onsuccess=()=>yes(req.result);req.onerror=()=>no(req.error||Error('Armazenamento indisponível'));
 });
 return dbPromise;
}
async function storeFile(id,file){
 try{
  const d=await db();
  await new Promise((yes,no)=>{
   const tr=d.transaction(STORE,'readwrite');
   tr.objectStore(STORE).put({id,blob:file,name:file.name,size:file.size,saved:new Date().toISOString()});
   tr.oncomplete=yes;tr.onerror=()=>no(tr.error||Error('Não foi possível guardar o PDF'));
  });
  return true;
 }catch(e){console.warn('PDF local não persistido:',e);return false}
}
async function storedFile(id){
 try{
  const d=await db();
  return await new Promise((yes,no)=>{
   const req=d.transaction(STORE,'readonly').objectStore(STORE).get(id);
   req.onsuccess=()=>yes(req.result);req.onerror=()=>no(req.error);
  });
 }catch{return null}
}
function key(page=pageNo){return 'BM030_STROKES_PDF:'+selected.id+':'+info.hash+':P'+page}
function annotations(page=pageNo){
 if(!info||!selected)return [];
 try{
  const r=JSON.parse(localStorage.getItem(key(page))||'[]');
  return Array.isArray(r)?r.filter(m=>m&&!m.bm108_deleted_at):[];
 }catch{return []}
}
/* V122: o documento original não é alterado. As cores e posições são salvas
   pelo mesmo ID e hash do PDF, com exclusões que não guardam a marcação. */
function storeStrokes(){
 try{
  const core=window.BancoMestreGrifosSyncCoreV103;
  if(!core?.persistPage)throw Error('Persistência de grifos V122 indisponível');
  core.persistPage(localStorage,key(),annotationsInView);
  window.dispatchEvent(new CustomEvent('bm-pdf-storage-changed',{detail:{
   documentId:selected?.id||null,sourceHash:info?.hash||null,page:pageNo
  }}));
  return true;
 }catch(e){status('Anotações não foram salvas neste navegador: '+e.message);return false}
}
let annotationsInView=[];
function snapshot(){const id=key();if(!undo.has(id))undo.set(id,[]);const list=undo.get(id);list.push(JSON.stringify(annotationsInView));if(list.length>60)list.shift();redo.set(id,[])}
function canUse(id,on){$(id).disabled=!on}
function controls(open){
 for(const id of menu)canUse(id,open);
 if(open&&pdf){canUse('pdfPrev',pageNo>1);canUse('pdfNext',pageNo<pdf.numPages)}
 else {canUse('pdfPrev',false);canUse('pdfNext',false)}
 if(open){
  canUse('pdfUndo',(undo.get(key())||[]).length>0);
  canUse('pdfRedo',(redo.get(key())||[]).length>0);
 }
}
function markTool(name){
 cancelMarkerStart();
 tool=name;draft=null;pagePane.classList.toggle('bm420-pan',name==='pan');
 for(const [key,n] of [['pdfDraw','pen'],['pdfMarker','marker'],['pdfEraser','eraser'],['pdfPan','pan']])$(key).setAttribute('aria-pressed',String(n===tool));
 inkCanvas.style.cursor=tool==='pan'?'grab':tool==='select'?'text':tool==='eraser'?'cell':'crosshair';
 inkCanvas.style.touchAction=tool==='pan'?'pan-x pan-y':tool==='select'?'auto':'none';
 inkCanvas.style.pointerEvents=(tool==='pan'||tool==='select')?'none':'auto';
 const selectButton=$('bmV061SelectTool');if(selectButton)selectButton.setAttribute('aria-pressed',String(tool==='select'));
 window.dispatchEvent(new CustomEvent('bm-pdf-tool-change',{detail:{tool}}));
}
function stroke(ctx,m,w,h,onScreen=false){
 if(!m)return;
 if(m.type==='text_highlight'&&Array.isArray(m.rects)){
  ctx.save();
  const color=m.color||'#ffd400',style=m.style||'highlight';
  for(const b of m.rects){
   if(!Array.isArray(b)||b.length!==4||!b.every(Number.isFinite))continue;
   const x=b[0]*w,y=b[1]*h,width=Math.max(0,b[2]-b[0])*w,height=Math.max(0,b[3]-b[1])*h;
   if(style==='underline'||style==='double-underline'){
    ctx.globalAlpha=.92;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1.5,height*.08);
    ctx.beginPath();ctx.moveTo(x,y+height-1);ctx.lineTo(x+width,y+height-1);ctx.stroke();
    if(style==='double-underline'){ctx.beginPath();ctx.moveTo(x,y+height-4);ctx.lineTo(x+width,y+height-4);ctx.stroke()}
   }else if(style==='strike'){
    ctx.globalAlpha=.92;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1.5,height*.075);
    ctx.beginPath();ctx.moveTo(x,y+height*.55);ctx.lineTo(x+width,y+height*.55);ctx.stroke();
   }else if(style==='conceal'){
    ctx.globalAlpha=.97;ctx.fillStyle='#ffffff';ctx.fillRect(x,y,width,height);
    ctx.globalAlpha=1;ctx.fillStyle='#6d7b84';ctx.font=Math.max(8,Math.min(16,height*.78))+'px system-ui,Arial';
    ctx.fillText('⋯',x+3,y+height*.76,Math.max(0,width-4));
   }else{
    ctx.globalAlpha=Math.max(.08,Math.min(.65,Number(m.opacity)||.25));
     if(onScreen&&readableHighlights)ctx.globalAlpha=Math.min(ctx.globalAlpha,.28);
    ctx.fillStyle=color;ctx.fillRect(x,y,width,height);
   }
  }
  ctx.restore();return;
 }
 if(m.type==='rect'&&Array.isArray(m.box)&&m.box.length===4){
  const b=m.box;ctx.save();ctx.globalAlpha=Math.max(.1,Math.min(.65,Number(m.opacity)||.25));
  ctx.fillStyle=m.color||'#ffd400';
  ctx.fillRect(Math.min(b[0],b[2])*w,Math.min(b[1],b[3])*h,Math.abs(b[2]-b[0])*w,Math.abs(b[3]-b[1])*h);
  ctx.restore();return;
 }
 if((m.type==='note'||m.type==='card'||m.type==='status')&&Array.isArray(m.pos)){
  ctx.save();ctx.globalAlpha=1;ctx.fillStyle=m.color||'#17616a';
  const fontSize=Math.max(10,Math.min(w,h)*.025);
  ctx.font='bold '+fontSize+'px system-ui,Arial,sans-serif';
  const lines=String(m.text||'').split('\n').slice(0,5);
  let y=m.pos[1]*h;for(const line of lines){ctx.fillText(line.slice(0,110),m.pos[0]*w,y);y+=fontSize*1.25}ctx.restore();return;
 }
 if(!Array.isArray(m.points)||!m.points.length)return;
 ctx.save();
 const isPen=m.type==='pen',opacity=isPen?1:Math.max(.1,Math.min(.65,Number(m.opacity)||.25));
 ctx.globalAlpha=opacity;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle=m.color||(isPen?'#174059':'#ffd400');ctx.fillStyle=ctx.strokeStyle;
 const thick=Math.max(1,Math.min(w,h)*(m.size||3)/1000*(isPen?1:1.7));
 const pts=m.points;
 if(pts.length===1){ctx.beginPath();ctx.arc(pts[0][0]*w,pts[0][1]*h,thick/2,0,Math.PI*2);ctx.fill()}
 else if(!isPen){
  // Um único caminho evita que segmentos sucessivos acumulem opacidade e
  // escureçam o marca-texto. Também vale na exportação PDF/PNG.
  ctx.lineWidth=thick;
  ctx.beginPath();ctx.moveTo(pts[0][0]*w,pts[0][1]*h);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]*w,pts[i][1]*h);
  ctx.stroke();
 }else{for(let i=1;i<pts.length;i++){
  const a=pts[i-1],b=pts[i];
  ctx.lineWidth=thick*(.55+.3*((a[2]||.65)+(b[2]||.65)));
  ctx.beginPath();ctx.moveTo(a[0]*w,a[1]*h);ctx.lineTo(b[0]*w,b[1]*h);ctx.stroke();
 }}
 ctx.restore();
}
// Highlight fills are drawn directly over the PDF image using Multiply.
// This keeps dark letters dark; a translucent upper canvas washes them out.
function isFillHighlight(m){
 return m?.type==='text_highlight'&&Array.isArray(m.rects)&&
  (m.style||'highlight')==='highlight';
}
function drawCrispHighlight(ctx,m,w,h){
 if(!isFillHighlight(m))return;
 ctx.save();
 ctx.globalCompositeOperation='multiply';
 ctx.globalAlpha=screenIntensity;
 ctx.fillStyle=/^#[0-9a-f]{6}$/i.test(m.color||'')?m.color:'#FDE68A';
 for(const box of m.rects){
  if(!Array.isArray(box)||box.length!==4||!box.every(Number.isFinite))continue;
  const x=box[0]*w,y=box[1]*h;
  const width=Math.max(0,(box[2]-box[0])*w);
  const height=Math.max(0,(box[3]-box[1])*h);
  if(width>0&&height>0)ctx.fillRect(x,y,width,height);
 }
 ctx.restore();
}
let activePdfRaster=null,lastPdfTintSignature=null;
function paint(){
 const w=inkCanvas.width,h=inkCanvas.height;
 if(activePdfRaster&&w&&h&&pageCanvas.width===w&&pageCanvas.height===h){
  const tinted=readableHighlights?annotationsInView.filter(isFillHighlight):[];
  const signature=readableHighlights?
   screenIntensity+'|'+JSON.stringify(tinted.map(m=>[m.id,m.color,m.style,m.rects])):'disabled';
  if(signature!==lastPdfTintSignature){
   const ctx=pageCanvas.getContext('2d',{alpha:false});
   ctx.drawImage(activePdfRaster,0,0,w,h);
   if(readableHighlights)
    for(const m of tinted)drawCrispHighlight(ctx,m,w,h);
   lastPdfTintSignature=signature;
  }
 }
 inkCtx.clearRect(0,0,w,h);
 for(const m of annotationsInView){
  if(readableHighlights&&isFillHighlight(m))continue;
  stroke(inkCtx,m,w,h,true);
 }
 if(draft)stroke(inkCtx,draft,w,h,true);
 if(info)controls(!painting&&!exportBusy&&!!pdf);
}
function at(e){const r=inkCanvas.getBoundingClientRect();return [
 Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),
 Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height))),e.pressure||.65];}
function gapToSegment(px,py,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/den)):0;
 return Math.hypot(px-ax-t*dx,py-ay-t*dy);
}
function near(m,p){
 if(m?.type==='text_highlight'&&Array.isArray(m.rects))return m.rects.some(b=>Array.isArray(b)&&b.length===4&&p[0]>=b[0]-.004&&p[0]<=b[2]+.004&&p[1]>=b[1]-.004&&p[1]<=b[3]+.004);
 if(m?.pos)return Math.hypot(p[0]-m.pos[0],p[1]-m.pos[1])<.055;
 if(!m?.points?.length)return false;
 const points=m.points,tol=.018+Math.max(0,(m.size||4))/3000;
 if(points.length===1)return Math.hypot(p[0]-points[0][0],p[1]-points[0][1])<tol;
 for(let i=1;i<points.length;i++){if(gapToSegment(p[0],p[1],points[i-1][0],points[i-1][1],points[i][0],points[i][1])<tol)return true}
 return false;
}
inkCanvas.addEventListener('pointerdown',e=>{
 if(pinchBlocked||!pdf||painting||exportBusy||tool==='pan'||e.button>0)return;
 const p=at(e);
 if(tool==='note'||tool==='card'||tool==='status'){
  let typed=tool==='status'?prompt('Cobertura do dispositivo: 1=Integral; 2=Parcial; 3=Sem cartão; 4=Não auditado'):
   prompt(tool==='card'?'ID(s) de cartões (ex.: CARD-1280):':'Anotação textual nesta página da lei:');
  if(!typed||!typed.trim())return;
  typed=typed.trim();
  if(tool==='status'){
   const labels={'1':'[COBERTO]','2':'[PARCIAL]','3':'[SEM CARTAO]','4':'[NAO AUDITADO]'};
   if(!labels[typed]){status('Escolha um número de 1 a 4.');return}
   typed=labels[typed];
  }
  if(tool==='card'){
   const matches=typed.toUpperCase().match(/(?:CARD-\d{4,}|PROP-IJUI-\d+)/g);
   if(!matches?.length){status('Informe um ID de cartão válido (CARD-0001 ou PROP-IJUI-001).');return}
   typed=[...new Set(matches)].join(' · ');
  }
  snapshot();annotationsInView.push({type:tool,color:$('pdfInkColor').value,pos:[p[0],p[1]],text:typed});
  storeStrokes();paint();e.preventDefault();return;
 }
 if(tool==='eraser'){
  const i=annotationsInView.findLastIndex(m=>near(m,p));
  if(i<0)return;
  if(!confirm('Excluir esta marcação do PDF? A exclusão ficará somente neste navegador e poderá ser desfeita.'))return;
  snapshot();annotationsInView.splice(i,1);storeStrokes();paint();return;
 }
 if(tool==='marker'){
  markerGesture=pendingMarkerStart?'second':'first';
  draft=markerGesture==='second'?straightHighlight(pendingMarkerStart,p):
   {type:'highlighter',color:$('pdfInkColor').value,size:12,opacity:markerOpacity,points:[p]};
 }else draft={type:'pen',color:$('pdfInkColor').value,size:3,opacity:1,points:[p]};
 inkCanvas.setPointerCapture(e.pointerId);e.preventDefault();paint();
});
inkCanvas.addEventListener('pointermove',e=>{
 if(pinchBlocked)return;
 if(tool==='marker'&&pendingMarkerStart&&markerGesture===null){
  // Prévia horizontal entre o primeiro clique e a posição do mouse.
  draft=straightHighlight(pendingMarkerStart,at(e));paint();return;
 }
 if(!draft||!inkCanvas.hasPointerCapture(e.pointerId))return;
 const p=at(e);
 if(tool==='marker'&&markerGesture==='second'){
  draft=straightHighlight(pendingMarkerStart,p);paint();return;
 }
 const pts=draft.points,last=pts[pts.length-1];
 if(Math.hypot((p[0]-last[0])*inkCanvas.width,(p[1]-last[1])*inkCanvas.height)>=1.6){
  pts.push(p);paint();
 }
});
inkCanvas.addEventListener('pointerleave',()=>{
 if(tool==='marker'&&pendingMarkerStart&&markerGesture===null){draft=null;paint()}
});
function endStroke(e){
 if(pinchBlocked){draft=null;return}
 if(!draft)return;
 if(inkCanvas.hasPointerCapture(e.pointerId))inkCanvas.releasePointerCapture(e.pointerId);
 if(tool==='marker'&&markerGesture==='first'){
  // Um clique simples só define a origem: não grava um ponto no documento.
  const start=draft.points[0],end=at(e);
  const distance=Math.hypot((end[0]-start[0])*inkCanvas.width,
   (end[1]-start[1])*inkCanvas.height);
  if(distance<5){
   pendingMarkerStart=start;markerGesture=null;draft=null;
   notifyMarkerState();
   status('Início do grifo definido. Clique no fim da mesma linha. Esc cancela.');
   paint();return;
  }
 }else if(tool==='marker'&&markerGesture==='second'){
  const start=pendingMarkerStart,end=at(e);
  const distance=Math.abs((end[0]-start[0])*inkCanvas.width);
  if(distance<5){
   markerGesture=null;draft=null;
   status('Escolha o ponto final mais distante do início.');
   paint();return;
  }
  draft=straightHighlight(start,end);
 }
 snapshot();annotationsInView.push(draft);
 cancelMarkerStart();storeStrokes();paint();
}
inkCanvas.addEventListener('pointerup',endStroke);
inkCanvas.addEventListener('pointercancel',e=>{
 cancelMarkerStart();
 if(inkCanvas.hasPointerCapture(e.pointerId))inkCanvas.releasePointerCapture(e.pointerId);
 paint();
});
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||!pendingMarkerStart||!$('pdfDialog')?.open)return;
 if(e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 e.preventDefault();cancelMarkerStart();paint();
 status('Grifo de dois cliques cancelado.');
},true);
function historyEdit(type){
 if(pendingMarkerStart){cancelMarkerStart();paint();}
 const id=key(),from=type==='undo'?undo:redo,to=type==='undo'?redo:undo,stack=from.get(id)||[];
 if(!stack.length)return;
 const current=JSON.stringify(annotationsInView),oldMarks=annotationsInView.slice();
 if(!to.has(id))to.set(id,[]);to.get(id).push(current);
 annotationsInView=JSON.parse(stack.pop());
 const newKeys=new Set(annotationsInView.map(markIdentity));
 const oldMap=new Map(oldMarks.map(m=>[markIdentity(m),m]));
 const now=new Date().toISOString();
 annotationsInView=annotationsInView.map(m=>{
  const previous=oldMap.get(markIdentity(m));
  if(previous&&JSON.stringify({...previous,bm108_changed_at:null})===
      JSON.stringify({...m,bm108_changed_at:null}))return m;
  return {...m,bm108_deleted_at:null,bm108_changed_at:now,updated_at:now};
 });
 const deleted=oldMarks.filter(m=>!newKeys.has(markIdentity(m))).map(archiveMark);
 storeStrokes(deleted);paint();
 window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{action:type,page:pageNo}}));
}
async function renderNeighbor(slice,target,ticket){
 if(target<1||target>pdf.numPages){
  const rel=slice===prevSlice?pagePane.scrollTop-topInPane(pageWrap):null;
  slice.hidden=true;slice.replaceChildren();slice.dataset.page='';slice.dataset.ready='0';
  if(rel!==null&&!painting&&!promoting){
   const wanted=Math.max(0,topInPane(pageWrap)+rel);
   if(Math.abs(pagePane.scrollTop-wanted)>1){
    suppressScroll=true;pagePane.scrollTop=wanted;
    requestAnimationFrame(()=>{suppressScroll=false});
   }
  }
  return;
 }
 const page=await pdf.getPage(target);
 if(ticket!==serial||!pdf)return;
 const original=page.getViewport({scale:1});
 const scale=bm420BaseScale(original)*zoom;
 const viewport=page.getViewport({scale});
 const max=Math.min(1,2200/Math.max(viewport.width,viewport.height),Math.sqrt(4500000/(viewport.width*viewport.height)));
 const physical=page.getViewport({scale:scale*max});
 const width=Math.max(1,Math.round(physical.width)),height=Math.max(1,Math.round(physical.height));
 const image=document.createElement('canvas');image.width=width;image.height=height;
 image.style.width=Math.round(viewport.width)+'px';image.style.height=Math.round(viewport.height)+'px';
 const context=image.getContext('2d',{alpha:false});
 context.fillStyle='white';context.fillRect(0,0,width,height);
 const warm=previewRaster(target,Math.round(viewport.width),Math.round(viewport.height));
 if(warm)context.drawImage(warm,0,0,width,height);
 else{
  const job=page.render({canvasContext:context,viewport:physical});
  neighborTasks.add(job);
  try{await job.promise}
  catch(e){if(isCancel(e)||ticket!==serial)return;throw e}
  finally{neighborTasks.delete(job)}
 }
 if(ticket!==serial||!pdf)return;
 const marker=document.createElement('canvas');marker.width=width;marker.height=height;
 marker.style.width=image.style.width;marker.style.height=image.style.height;
 const ctx=marker.getContext('2d');
 const marks=annotations(target);
 if(readableHighlights)
  for(const m of marks)if(isFillHighlight(m))drawCrispHighlight(context,m,width,height);
 for(const m of marks){
  if(readableHighlights&&isFillHighlight(m))continue;
  stroke(ctx,m,width,height,true);
 }
 const label=document.createElement('small');label.className='bm-v048-page-caption';
 label.textContent='Página '+target+' — role para ativar a edição';
 const surface=document.createElement('div');surface.className='bm-v048-neighbor-canvas';
 surface.append(image,marker);
 // A prévia ANTERIOR pode ter outra altura: preservar o texto visível.
 const relativeToActive=slice===prevSlice?
  pagePane.scrollTop-topInPane(pageWrap):null;
 slice.style.width=image.style.width;
 slice.replaceChildren(label,surface);
 slice.dataset.page=String(target);slice.dataset.ready='1';slice.hidden=false;
 if(relativeToActive!==null&&!painting&&!promoting){
  const wanted=Math.max(0,topInPane(pageWrap)+relativeToActive);
  if(Math.abs(pagePane.scrollTop-wanted)>1){
   suppressScroll=true;pagePane.scrollTop=wanted;
   requestAnimationFrame(()=>{suppressScroll=false});
  }
 }
 // Also retry after the short promotion cooldown when the user stops at a boundary.
  requestAnimationFrame(checkScrollPromotion);
  setTimeout(()=>{if(ticket===serial)requestAnimationFrame(checkScrollPromotion)},150);
}
async function renderOne(ticket){
 if(!pdf||ticket!==serial)return;
 painting=true;controls(false);status('Carregando página '+pageNo+'...');
 let readyDetail=null;
 try{
  const page=await pdf.getPage(pageNo);if(ticket!==serial)return;
  const original=page.getViewport({scale:1});
  const visual=bm420BaseScale(original)*zoom;
  const dpi=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const viewport=page.getViewport({scale:visual*dpi});
  const max=Math.sqrt(9000000/(viewport.width*viewport.height));
  const factor=Math.min(1,max,3800/Math.max(viewport.width,viewport.height));
  const physical=page.getViewport({scale:visual*dpi*factor});
  const w=Math.round(physical.width),h=Math.round(physical.height);
  const cacheId=rasterKey(pageNo,w,h,visual);
  let raster=getRaster(cacheId)?.canvas;
  if(!raster){
   raster=document.createElement('canvas');raster.width=w;raster.height=h;
   const c=raster.getContext('2d',{alpha:false});
   c.fillStyle='white';c.fillRect(0,0,w,h);
   const job=page.render({canvasContext:c,viewport:physical});
   activeRenderTask=job;
   try{await job.promise}
   catch(e){if(isCancel(e)||ticket!==serial)return;throw e}
   finally{if(activeRenderTask===job)activeRenderTask=null}
   if(ticket!==serial||!pdf)return;
   rememberRaster(cacheId,{page:pageNo,width:w,height:h,
    logicalWidth:Math.round(visual*original.width),
    logicalHeight:Math.round(visual*original.height),canvas:raster});
  }
  if(ticket!==serial||!pdf)return;
  for(const cv of [pageCanvas,inkCanvas]){
   cv.width=w;cv.height=h;cv.style.width=Math.round(w/(dpi*factor))+'px';
   cv.style.height=Math.round(h/(dpi*factor))+'px';
  }
  pageWrap.style.width=pageCanvas.style.width;pageWrap.style.height=pageCanvas.style.height;
  activePdfRaster=raster;lastPdfTintSignature=null;
  const ctx=pageCanvas.getContext('2d',{alpha:false});ctx.drawImage(raster,0,0,w,h);
  annotationsInView=annotations();
  draft=null;markTool(tool);paint();
  readyDetail={page:pageNo,documentId:selected?.id||null,sourceHash:info?.hash||null,viewportScale:visual};
  $('pdfPager').textContent='Página '+pageNo+' de '+pdf.numPages+' · '+Math.round(zoom*100)+'%';
  $('pdfPager').title='Zoom relativo ao ajuste '+(bm420FitMode==='page'?'de página inteira':'à largura');
  $('pdfFitPage').setAttribute('aria-pressed',String(bm420FitMode==='page'&&zoom===1));$('pdfFitWidth').setAttribute('aria-pressed',String(bm420FitMode==='width'&&zoom===1));
  status('Rolagem contínua entre páginas; grifos e cartões são editáveis somente na página ativa. O original permanece preservado.');
  renderingNeighbors=true;
  const renderingPage=pageNo;
  // Give the active page one paint before computing neighbors.
  requestAnimationFrame(()=>setTimeout(async()=>{
   if(ticket!==serial||!pdf)return;
   const work=lastTravelDirection<0?
    [[prevSlice,renderingPage-1],[nextSlice,renderingPage+1]]:
    [[nextSlice,renderingPage+1],[prevSlice,renderingPage-1]];
   try{
    for(const [slice,target] of work){
     if(ticket!==serial||!pdf)break;
     try{await renderNeighbor(slice,target,ticket)}
     catch(e){if(ticket===serial&&!isCancel(e))
      status('Página atual disponível. Prévia vizinha não carregou: '+e.message)}
    }
   }finally{
    if(ticket===serial){renderingNeighbors=false;requestAnimationFrame(checkScrollPromotion)}
   }
  },0));
 }catch(e){if(ticket===serial)status('Erro ao renderizar a página: '+e.message)}
 finally{
  if(ticket===serial){
   painting=false;controls(!!pdf);
   if(readyDetail){saveCurrentPage();window.dispatchEvent(new CustomEvent('bm-pdf-active-page-rendered',{detail:readyDetail}));}
  }
 }
}
function render(){const ticket=++serial;cancelRenders();task=task.catch(()=>{}).then(()=>renderOne(ticket));return task}

/* V048 — rolagem vertical contínua, com vizinhas visualizáveis e uma
   página editável ativa. PDF grande: apenas anterior, atual e próxima
   renderizadas; IDs e marcas são mantidos por número/hash do documento. */
let lastScrollPromotion=0;
async function promoteByScroll(direction){
 if(!pdf||painting||promoting||draft||exportBusy)return;
 const target=direction>0?nextSlice:prevSlice;
 if(target.hidden||target.dataset.page!==String(pageNo+direction)||target.dataset.ready!=='1')return;
 promoting=true;lastTravelDirection=direction;lastScrollPromotion=Date.now();
 const relative=pagePane.scrollTop-topInPane(target);
 pageNo+=direction;
 try{
  await render();
  if(!pdf)return;
  suppressScroll=true;
  pagePane.scrollTop=Math.max(0,topInPane(pageWrap)+relative);
  requestAnimationFrame(()=>{suppressScroll=false});
 }finally{promoting=false}
}
let scrollFrame=0;
function checkScrollPromotion(){
 if(suppressScroll||promoting||painting||!pdf||draft||exportBusy)return;
 if(Date.now()-lastScrollPromotion<130)return;
 const center=pagePane.scrollTop+pagePane.clientHeight/2;
 if(!nextSlice.hidden&&nextSlice.dataset.ready==='1'&&
    nextSlice.dataset.page===String(pageNo+1)&&
    center>topInPane(nextSlice)+Math.min(85,nextSlice.offsetHeight/5))
  void promoteByScroll(1);
 else if(!prevSlice.hidden&&prevSlice.dataset.ready==='1'&&
    prevSlice.dataset.page===String(pageNo-1)&&center<topInPane(pageWrap)-30)
  void promoteByScroll(-1);
}
pagePane.addEventListener('scroll',()=>{
 if(suppressScroll||promoting||painting||!pdf||draft||exportBusy)return;
 if(scrollFrame)return;
 scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;checkScrollPromotion()});
},{passive:true});
pagePane.tabIndex=0;
pagePane.setAttribute('aria-label','Leitor PDF de rolagem contínua: role para avançar ou voltar. Apenas a página central ativa recebe grifos e cartões; para rolar com toque escolha Mover.');
function centerActive(){
 suppressScroll=true;
 pagePane.scrollTop=Math.max(0,topInPane(pageWrap)-8);
 requestAnimationFrame(()=>{suppressScroll=false});
}
// V057 — ir diretamente para qualquer página válida, mantendo o fluxo
// normal de renderização, rolagem e anotações da página ativa.
// V104: zoom por pinça em torno do ponto tocado, sem mudar a rolagem contínua.
async function setZoomAt(next,{x,y}={}){
 if(!pdf||!Number.isFinite(next)||painting||exportBusy)return false;
 const value=Math.max(.55,Math.min(3,Math.round(next*100)/100));
 if(value===zoom)return true;
 const paneRect=pagePane.getBoundingClientRect();
 const before=pageWrap.getBoundingClientRect();
 const viewX=Number.isFinite(x)?x:Math.round(paneRect.left+paneRect.width/2);
 const viewY=Number.isFinite(y)?y:Math.round(paneRect.top+paneRect.height/2);
 const fracX=Math.min(1,Math.max(0,(viewX-before.left)/Math.max(1,before.width)));
 const fracY=Math.min(1,Math.max(0,(viewY-before.top)/Math.max(1,before.height)));
 const insideX=viewX-paneRect.left,insideY=viewY-paneRect.top;
 zoom=value;
 await render();
 if(!pdf)return false;
 suppressScroll=true;
 const after=pageWrap.getBoundingClientRect();
 const horizontal=pagePane.scrollLeft+after.left-paneRect.left;
 const desiredX=horizontal+fracX*after.width-insideX;
 pagePane.scrollLeft=Math.max(0,desiredX);
 const vertical=topInPane(pageWrap);
 pagePane.scrollTop=Math.max(0,vertical+fracY*after.height-insideY);
 requestAnimationFrame(()=>{suppressScroll=false});
 window.dispatchEvent(new CustomEvent('bm-pdf-zoom-changed',{detail:{zoom}}));
 return true;
}
async function goToPage(input){
 if(!pdf)return false;
 const n=Number(input);
 if(!Number.isInteger(n)||n<1||n>pdf.numPages)return false;
 if(n!==pageNo){pageNo=n;await render();}
 centerActive();
 return true;
}
async function hashBuffer(b){
 if(crypto?.subtle){const raw=await crypto.subtle.digest('SHA-256',b.slice(0));return [...new Uint8Array(raw)].slice(0,12).map(n=>n.toString(16).padStart(2,'0')).join('')}
 return 'local-'+b.byteLength+'-'+info.name.replace(/\W/g,'');
}
async function openBytes(blob,name,remember){
 if(!selected||!blob)return;
 status('Preparando PDF no editor do Banco Mestre...');
 try{
  const lib=await pdfjs(),buf=await blob.arrayBuffer();
  if(buf.byteLength>120000000)throw Error('PDF muito grande para edição local nesta versão');
  const current=selected;
  info={name,size:blob.size,hash:''};info.hash=await hashBuffer(buf);
  sourceBytes=new Uint8Array(buf.slice(0));
  if(pdf){cancelRenders();clearRenderCache();activePdfRaster=null;lastPdfTintSignature=null;try{await pdf.destroy()}catch{}}
  pdf=await lib.getDocument({data:new Uint8Array(buf.slice(0))}).promise;
  pageNo=savedPage(current.id,info.hash,pdf.numPages);zoom=1;bm420FitMode='page';undo.clear();redo.clear();
  $('pdfFileName').textContent=name+' · '+pdf.numPages+' páginas';
  $('pdfFrame').classList.add('localHidden');
  $('pdfLocalMode').classList.add('active');
  $('pdfLocalTools').hidden=false;
  markTool('select'); // V061: seleção textual padrão, grifo livre alternativo.
  $('pdfIntro').hidden=true;
  if(remember){
   const saved=await storeFile(current.id,new File([blob],name,{type:'application/pdf'}));
   if(saved)try{localStorage.setItem('BM_PDF_HAS_SOURCE_V037:'+current.id,'1')}catch(e){}
   if(!saved)status('PDF aberto, porém o armazenamento neste navegador não está disponível.');
  }
  await render();
  centerActive();
 }catch(e){
  status('Não foi possível editar o PDF: '+e.message+'. Confira se ele está íntegro e não está protegido por senha.');
  $('pdfLocalMode').classList.remove('active');$('pdfFrame').classList.remove('localHidden');
  $('pdfLocalTools').hidden=true;$('pdfIntro').hidden=false;sourceBytes=null;info=null;pdf=null;
 }
}
async function openCached(){
 if(!selected)return false;
 const saved=await storedFile(selected.id);
 if(!saved?.blob)return false;
 await openBytes(saved.blob,saved.name,false);return !!pdf;
}
function enterEditor(){
 if(!selected)return;
 if(pdf){$('pdfLocalMode').classList.add('active');return}
 if(cachedSource?.id===selected.id&&cachedSource.blob){
  openBytes(cachedSource.blob,cachedSource.name,false);return;
 }
 // Chamada síncrona no clique do usuário: navegadores podem bloquear o
 // seletor de arquivos quando .click() ocorre após uma espera assíncrona.
 status('Escolha uma cópia autorizada deste PDF uma vez. A edição é feita aqui, sem upload.');
 $('pdfFileInput').click();
}
function selectFile(file){
 if(!file||!selected)return;
 if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'){status('Selecione um PDF válido.');return}
 if(file.size>120000000){status('PDF muito grande (limite 120 MB).');return}
 if(selected.filename&&selected.filename.toLowerCase()!==file.name.toLowerCase()){
  if(!confirm('O arquivo selecionado tem nome diferente do documento '+selected.id+'. Confirma que é o PDF correto?'))return;
 }
 openBytes(file,file.name,true);
}
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function buildAnnotated(){
 if(!pdf||!sourceBytes||!info||!selected||exportBusy)throw Error('Abra um PDF no editor antes de salvar.');
 const sourceDoc=selected,sourceName=info.name,sourceHash=info.hash,originalBytes=sourceBytes.slice();
 exportBusy=true;controls(false);
 status('Preparando cópia PDF com marcações — original preservado...');
 try{
  const lib=await pdflib();
  const pdfOutput=await lib.PDFDocument.load(originalBytes);
  const pages=pdfOutput.getPages();let count=0;
  for(let k=1;k<=pages.length;k++){
   const storageKey='BM030_STROKES_PDF:'+sourceDoc.id+':'+sourceHash+':P'+k;
   let strokes;
   try{strokes=JSON.parse(localStorage.getItem(storageKey)||'[]')}
   catch{throw Error('Anotações locais inválidas na página '+k)}
   if(!Array.isArray(strokes))throw Error('Dados de marcação inválidos na página '+k);
   strokes=strokes.filter(m=>m&&(m.points?.length||m.pos?.length||(m.type==='rect'&&m.box?.length===4)||(m.type==='text_highlight'&&m.rects?.length)));
   if(!strokes.length)continue;
   const cv=document.createElement('canvas');cv.width=1400;cv.height=Math.round(1400*pages[k-1].getHeight()/Math.max(1,pages[k-1].getWidth()));
   const ctx=cv.getContext('2d');
   for(const mark of strokes)stroke(ctx,mark,cv.width,cv.height);
   const img=await pdfOutput.embedPng(cv.toDataURL('image/png'));
   const pg=pages[k-1];pg.drawImage(img,{x:0,y:0,width:pg.getWidth(),height:pg.getHeight(),opacity:1});
   count++;
  }
  const bytes=await pdfOutput.save({useObjectStreams:true});
  const name=sourceName.replace(/\.pdf$/i,'')+'_ANOTADO.pdf';
  return {blob:new Blob([bytes],{type:'application/pdf'}),name,pagesMarked:count,
   doc:{id:sourceDoc.id,title:sourceDoc.title||sourceName,file_id:sourceDoc.file_id||'',hash:sourceHash}};
 }finally{exportBusy=false;controls(!!pdf)}
}
async function exportPDF(){
 try{
  const result=await buildAnnotated();
  download(result.blob,result.name);
  status('Cópia '+result.name+' gerada com '+result.pagesMarked+' página(s) anotada(s). O PDF original não foi alterado.');
 }catch(e){status('Não foi possível exportar o PDF anotado: '+e.message)}
}

function close(){
 cancelMarkerStart();clearTimeout(neighborTintTimer);
 serial++;cancelRenders();clearRenderCache();activePdfRaster=null;lastPdfTintSignature=null;const p=pdf;pdf=null;info=null;sourceBytes=null;selected=null;cachedSource=null;pageNo=1;undo.clear();redo.clear();draft=null;
 $('pdfLocalMode').classList.remove('active');$('pdfFrame').classList.remove('localHidden');$('pdfLocalTools').hidden=true;
 prevSlice.hidden=true;nextSlice.hidden=true;prevSlice.replaceChildren();nextSlice.replaceChildren();
 $('pdfFileInput').value='';$('pdfFileName').textContent='';$('pdfIntro').hidden=false;
 if(p)p.destroy().catch(()=>{});
}
const priorPdfOpen=pdfOpen;
pdfOpen=function(doc){
 close();selected=doc;
 // Se a janela já estiver aberta durante OAuth, não chamar showModal novamente.
 if($('pdfDialog').open){
  $('docTitle').textContent=doc.title;
  $('pdfOriginal').href=doc.url||'';
  if(doc.file_id)$('pdfFrame').src='https://drive.google.com/file/d/'+encodeURIComponent(doc.file_id)+'/preview';
 }else priorPdfOpen(doc);
 $('pdfChooseLocal').textContent='✎ Editar PDF';
 status('Para grifar e editar nesta página, clique em “Editar PDF”. Documentos privados do Drive precisam de seleção local inicial.');
 storedFile(doc.id).then(record=>{
  if(selected?.id!==doc.id||!record?.blob)return;
  cachedSource={...record,id:doc.id};
  $('pdfChooseLocal').textContent='✎ Continuar edição';
  status('Cópia autorizada já salva neste navegador. Clique em “Continuar edição” para abrir as páginas e grifos.');
 }).catch(()=>{});
};
$('pdfChooseLocal').onclick=enterEditor;
$('pdfFileInput').onchange=e=>{const f=e.target.files?.[0];e.target.value='';selectFile(f)};
$('pdfChangeFile').onclick=()=>$('pdfFileInput').click();
$('pdfPrev').onclick=async()=>{if(pdf&&pageNo>1){pageNo--;await render();centerActive()}};
$('pdfNext').onclick=async()=>{if(pdf&&pageNo<pdf.numPages){pageNo++;await render();centerActive()}};
$('pdfZoomOut').onclick=async()=>{if(pdf){zoom=Math.max(.55,Math.round(zoom/1.25*100)/100);await render();centerActive()}};
$('pdfZoomIn').onclick=async()=>{if(pdf){zoom=Math.min(3,Math.round(zoom*1.25*100)/100);await render();centerActive()}};
$('pdfFitPage').onclick=()=>void bm420Fit('page');$('pdfFitWidth').onclick=()=>void bm420Fit('width');
$('pdfDraw').onclick=()=>markTool('pen');
$('pdfMarker').onclick=()=>markTool('marker');
$('pdfEraser').onclick=()=>markTool('eraser');
$('pdfPan').onclick=()=>markTool('pan');
$('pdfUndo').onclick=()=>historyEdit('undo');
$('pdfRedo').onclick=()=>historyEdit('redo');
$('pdfClearPage').onclick=()=>{
 if(!pdf||!annotationsInView.length)return;
 if(!confirm('Apagar todas as marcações desta página do PDF? Você poderá desfazer a operação.'))return;
 snapshot();const archived=annotationsInView.map(archiveMark);annotationsInView=[];storeStrokes(archived);paint();
};
$('pdfExportPNG').onclick=()=>{
 if(!pdf)return;
 const cv=document.createElement('canvas');cv.width=pageCanvas.width;cv.height=pageCanvas.height;
 const ctx=cv.getContext('2d');ctx.drawImage(pageCanvas,0,0);ctx.drawImage(inkCanvas,0,0);
 cv.toBlob(blob=>{if(blob)download(blob,selected.id+'_pagina_'+pageNo+'_anotada.png')},'image/png');
};
$('pdfExportPDF').onclick=exportPDF;
$('pdfClose').onclick=()=>$('pdfDialog').close();
$('pdfDialog').addEventListener('close',()=>{$('pdfFrame').src='about:blank';close()});
// Novos controles são agregados, preservando todas as ferramentas e grifos anteriores.
const peTools=$('pdfLocalTools')?.querySelector('.pdfGroup[aria-label="Ferramentas do PDF"]');
if(peTools){
 for(const [id,label,kind] of [['pdfNoteV037','Nota','note'],['pdfCardV037','Vincular CARD','card'],['pdfStatusV037','Cobertura','status']]){
  const button=document.createElement('button');button.id=id;button.type='button';button.textContent=label;
  button.title=kind==='card'?'Registre ID de cartão na página do dispositivo':'Escreva anotação textual nesta página';
  button.onclick=()=>markTool(kind);peTools.append(button);
 }
}
// Transparência ajustável apenas para marca-texto, sem afetar caneta ou notas.
const opacityLabel=document.createElement('label');
opacityLabel.id='pdfMarkerOpacityWrapV046';
opacityLabel.title='Opacidade dos próximos grifos. As marcações já salvas mantêm sua transparência.';
opacityLabel.setAttribute('aria-label','Transparência do marca-texto');
opacityLabel.innerHTML='<span>Grifo</span> <input id="pdfMarkerOpacityV046" type="range" min="10" max="65" step="5" value="'+Math.round(markerOpacity*100)+'" aria-label="Opacidade dos próximos grifos"> <output id="pdfOpacityValueV046">'+Math.round(markerOpacity*100)+'%</output>';
const colorLabel=$('pdfInkColor')?.parentElement;
if(colorLabel)colorLabel.after(opacityLabel);
$('pdfMarkerOpacityV046').addEventListener('input',e=>{
 markerOpacity=Math.max(.1,Math.min(.65,Number(e.target.value)/100));
 $('pdfOpacityValueV046').textContent=Math.round(markerOpacity*100)+'%';
 try{localStorage.setItem(OPACITY_KEY,String(markerOpacity))}catch(_){}
});
markTool('marker');
function openAndEdit(doc){
 pdfOpen(doc);
 const local=String(doc.id||'').startsWith('LOCAL-');
 $('pdfOriginal').hidden=local;
 if(local){$('pdfFrame').src='about:blank';$('pdfIntro').textContent='PDF-guia original deste navegador. As marcações permanecem vinculadas a este arquivo. Exporte o PDF anotado como cópia de segurança.';}
 const storedFlag=localStorage.getItem('BM_PDF_HAS_SOURCE_V037:'+doc.id)==='1';
 if(storedFlag){
  storedFile(doc.id).then(record=>{
   if(selected?.id!==doc.id)return;
   if(record?.blob){cachedSource={...record,id:doc.id};openBytes(record.blob,record.name,false)}
   else status('Arquivo não restaurado. Clique Editar PDF e escolha o original novamente.');
  }).catch(()=>status('Falha ao restaurar cópia anterior. Clique Editar PDF.'));
 }else enterEditor();
}
window.BancoMestrePDFV035={get editing(){return !!pdf},render,exportPDF};
function openLocalFile(doc,file){
 pdfOpen(doc);$('pdfOriginal').hidden=true;$('pdfFrame').src='about:blank';
 selectFile(file);
}
window.BancoMestrePDFV037={get editing(){return !!pdf},render,exportPDF,openAndEdit,openLocal:openAndEdit,openLocalFile};
window.BancoMestrePDFV038={
 get editing(){return !!pdf},
 render,exportPDF,
 openPreview(doc){pdfOpen(doc)},
 async openStored(doc){
  const local=await storedFile(doc.id);
  if(!local?.blob)return false;
  pdfOpen(doc);
  await openBytes(local.blob,local.name||doc.filename||doc.title+'.pdf',false);
  return !!pdf;
 },
 async openFromDrive(doc,blob){
  if(!blob||!doc)throw Error('Origem PDF inválida');
  pdfOpen(doc);
  const name=doc.filename||doc.title+'.pdf';
  await openBytes(blob,name,true);
  if(!pdf)throw Error('Não foi possível renderizar o documento recebido do Drive');
  return true;
 }
};
// Ctrl+Z desfaz a última anotação na página ativa; o navegador mantém
// seus atalhos em campos de texto e quando o editor PDF está fechado.
document.addEventListener('keydown',e=>{
 if(!$('pdfDialog')?.open||!pdf||$('imageDialog')?.open||e.isComposing||e.altKey)return;
 if(e.target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return;
 if(!(e.ctrlKey||e.metaKey))return;
 const key=String(e.key).toLowerCase();
 if(key==='z'||key==='y'){
  e.preventDefault();
  historyEdit(key==='y'||e.shiftKey?'redo':'undo');
 }
},true);

/* V059 — extração aproximada de texto sob grifos, por coordenada PDF.js.
   Os grifos originais estão em coordenadas normalizadas; o PDF.js devolve
   texto e transformações no espaço da página visível. Nenhum PDF é editado. */
function bm059ExtractPageText(textContent,viewport,highlights,pdfUtil){
 const width=viewport.width,height=viewport.height;
 const glyphs=[];
 const styles=textContent.styles||{};
 const transform=pdfUtil?.transform;
 if(typeof transform!=='function')throw Error('Transformações de texto do PDF.js não disponíveis');
 const charWeight=c=>{
  if(/\s/u.test(c))return .35;
  if(/[ilI1.,:;!|'\u0060]/u.test(c))return .42;
  if(/[mwMW@%&]/u.test(c))return 1.45;
  if(/[A-ZÀ-Ý]/u.test(c))return 1.12;
  return 1;
 };
 let rotatedIgnored=0;
 for(let index=0;index<(textContent.items||[]).length;index++){
  const item=textContent.items[index];
  if(!item?.str||!Array.isArray(item.transform))continue;
  const matrix=transform(viewport.transform,item.transform);
  const font=Math.max(1,Math.hypot(matrix[2],matrix[3])||item.height||9);
  // Grifos em linhas horizontais: texto vertical/rotacionado precisa revisão.
  if(Math.abs(matrix[1])>Math.abs(matrix[0])*.18){rotatedIgnored++;continue;}
  const dir=item.dir==='rtl'?-1:1;
  const chars=Array.from(item.str);
  const weights=chars.map(charWeight),totalWeight=weights.reduce((a,b)=>a+b,0)||1;
  const span=Math.max(font*.2,Math.abs(Number(item.width)||0)*viewport.scale);
  const style=styles[item.fontName]||{};
  const ascent=Number.isFinite(style.ascent)?style.ascent:.82;
  const descent=Number.isFinite(style.descent)?style.descent:-.18;
  const baseline=matrix[5];
  const centerY=baseline-(ascent+descent)*font/2;
  let cursor=matrix[4];
  for(let ci=0;ci<chars.length;ci++){
   const advance=span*weights[ci]/totalWeight;
   const left=dir>0?cursor:cursor-advance,right=left+advance;
   glyphs.push({
    char:chars[ci],left,right,x:(left+right)/2,y:centerY,
    height:Math.max(4,font),item:index,character:ci
   });
   cursor+=dir*advance;
  }
 }
 function distToSegment(x,y,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
  const t=den?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/den)):0;
  return Math.hypot(x-(ax+t*dx),y-(ay+t*dy));
 }
 function hitsGlyph(mark,g){
  if(mark.type==='text_highlight'&&Array.isArray(mark.rects)&&mark.rects.length){
   return mark.rects.some(b=>Array.isArray(b)&&b.length===4&&g.right>=b[0]*width-1&&g.left<=b[2]*width+1&&g.y>=b[1]*height-g.height*.4&&g.y<=b[3]*height+g.height*.4);
  }
  if(mark.type==='rect'&&Array.isArray(mark.box)&&mark.box.length===4){
   const [ax,ay,bx,by]=mark.box;
   const x0=Math.min(ax,bx)*width,x1=Math.max(ax,bx)*width;
   const y0=Math.min(ay,by)*height,y1=Math.max(ay,by)*height;
   return g.right>=x0-1&&g.left<=x1+1&&
     g.y>=y0-g.height*.4&&g.y<=y1+g.height*.4;
  }
  const points=(mark.points||[]).filter(p=>Array.isArray(p)&&p.length>=2&&
   Number.isFinite(p[0])&&Number.isFinite(p[1]));
  if(!points.length)return false;
  const pointToPx=p=>[p[0]*width,p[1]*height];
  const radius=Math.max(3.0,Math.min(width,height)*(Number(mark.size)||12)/1000*.5,g.height*.54);
  if(points.length===1){
   const p=pointToPx(points[0]);return Math.hypot(g.x-p[0],g.y-p[1])<=radius;
  }
  // A extensão horizontal do glifo é considerada, evitando perder as letras
  // nas extremidades dos grifos de dois cliques.
  for(let i=1;i<points.length;i++){
   const a=pointToPx(points[i-1]),b=pointToPx(points[i]);
   if(mark.straight||Math.abs(a[1]-b[1])<=2){
    if(g.right>=Math.min(a[0],b[0])-2&&g.left<=Math.max(a[0],b[0])+2&&
      Math.abs(g.y-(a[1]+b[1])/2)<=radius)return true;
   }else if(distToSegment(g.x,g.y,...a,...b)<=radius)return true;
  }
  return false;
 }
 function joinGlyphs(selected){
  if(!selected.length)return '';
  selected.sort((a,b)=>a.y-b.y||a.left-b.left||a.item-b.item||a.character-b.character);
  const lines=[];
  for(const g of selected){
   const last=lines[lines.length-1];
   if(last&&Math.abs(last.y-g.y)<Math.max(3,Math.min(last.height,g.height)*.52)){
    last.glyphs.push(g);
    last.y=(last.y*(last.glyphs.length-1)+g.y)/last.glyphs.length;
   }else lines.push({y:g.y,height:g.height,glyphs:[g]});
  }
  return lines.map(line=>{
   line.glyphs.sort((a,b)=>a.left-b.left||a.item-b.item||a.character-b.character);
   let out='',previous=null;
   for(const g of line.glyphs){
    if(previous&&g.item!==previous.item&&
     g.left-previous.right>Math.max(2,g.height*.23)&&
     out&&!/\s$/.test(out)&&!/^\s$/.test(g.char))out+=' ';
    out+=g.char;previous=g;
   }
   return out.replace(/\s+/gu,' ').trim();
  }).filter(Boolean).join('\n');
 }
 return {
  hasDigitalText:glyphs.some(g=>g.char.trim()),
  rotatedIgnored,
  texts:highlights.map((mark,i)=>{
   const selected=glyphs.filter(g=>hitsGlyph(mark,g));
   return {mark_index:i+1,type:mark.type||'highlighter',
    text:joinGlyphs(selected),
    status:!glyphs.some(g=>g.char.trim())?'sem_texto_digital':
      selected.length?'extraido_para_conferencia':'sem_correspondencia_geometrica'};
  })
 };
}
async function bm059ExtractHighlights({scope='all',onProgress}={}){
 if(!pdf||!selected||!info)throw Error('Abra uma cópia editável do PDF antes de extrair.');
 const currentDocumentId=selected.id,currentHash=info.hash;
 const pages=[];
 for(let n=1;n<=pdf.numPages;n++){
  if(scope==='current'&&n!==pageNo)continue;
  const marks=annotations(n).filter(m=>
   (m?.type==='highlighter'&&Array.isArray(m.points)&&m.points.length)||
   (m?.type==='rect'&&Array.isArray(m.box)&&m.box.length===4)||
   (m?.type==='text_highlight'&&Array.isArray(m.rects)&&m.rects.length));
  if(marks.length)pages.push({number:n,marks});
 }
 const result={
  format:'BancoMestreTextosGrifadosV059',
  document_id:currentDocumentId,document_title:selected.title||info.name||currentDocumentId,
  source_filename:info.name,source_hash:currentHash,
  scope:scope==='current'?'pagina_ativa':'documento_inteiro',
  total_pages:pdf.numPages,highlighted_pages:pages.length,
  highlight_count:pages.reduce((acc,p)=>acc+p.marks.length,0),
  generated_at:new Date().toISOString(),
  method:'intersecao geometrica entre tracos e caracteres da camada de texto PDF.js; resultado aproximado, deve ser conferido',
  entries:[],
  warnings:[]
 };
 let scanned=0,unmatched=0,errors=0;
 for(let i=0;i<pages.length;i++){
  if(!pdf||!selected||selected.id!==currentDocumentId||!info||info.hash!==currentHash)
   throw Error('O documento mudou durante a extração. Abra o PDF novamente.');
  const record=pages[i];
  if(typeof onProgress==='function')onProgress(i+1,pages.length,record.number);
  try{
   const pdfPage=await pdf.getPage(record.number);
   const tc=await pdfPage.getTextContent();
   const viewport=pdfPage.getViewport({scale:1});
   const parsed=bm059ExtractPageText(tc,viewport,record.marks,window.pdfjsLib?.Util);
   if(!parsed.hasDigitalText)scanned++;
   if(parsed.rotatedIgnored)result.warnings.push('Página '+record.number+': '+parsed.rotatedIgnored+' trechos rotacionados não analisados.');
   for(const t of parsed.texts){
    const sourceMark=record.marks[t.mark_index-1];
    const precise=sourceMark?.type==='text_highlight'&&typeof sourceMark.text==='string'&&!!sourceMark.text.trim();
    if(t.status==='sem_correspondencia_geometrica'&&!precise)unmatched++;
    result.entries.push({page:record.number,mark:t.mark_index,
     text:precise?sourceMark.text:t.text,status:precise?'texto_selecionado':t.status,
     anchor_id:precise?sourceMark.id:null});
   }
  }catch(e){
   errors++;
   for(let j=0;j<record.marks.length;j++){
    result.entries.push({page:record.number,mark:j+1,text:'',
     status:'erro_de_leitura',error:String(e.message||e)});
   }
  }
 }
 if(scanned)result.warnings.push(scanned+' página(s) grifada(s) sem camada de texto digital; essas páginas exigem OCR.');
 if(unmatched)result.warnings.push(unmatched+' grifo(s) não corresponderam a texto detectável; confira posicionamento, direção ou qualidade do PDF.');
 if(errors)result.warnings.push(errors+' página(s) não puderam ser processadas.');
 result.extracted_count=result.entries.filter(e=>(e.status==='extraido_para_conferencia'||e.status==='texto_selecionado')&&e.text).length;
 return result;
}



function validateTextRecord(r){
 if(!pdf||!selected||!info||painting||exportBusy||tool!=='select'||!r||
 r.page!==pageNo||r.documentId!==selected.id||r.sourceHash!==info.hash)return null;
 const text=String(r.text||'').trim();
 const rects=(Array.isArray(r.rects)?r.rects:[]).filter(b=>Array.isArray(b)&&b.length===4&&
 b.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&b[0]<b[2]&&b[1]<b[3]).slice(0,250);
 if(!text||!rects.length||text.length>20000)return null;
 return {text,rects};
}
function identicalHighlight(a,b){
 return a?.type==='text_highlight'&&a.text===b.text&&
 Array.isArray(a.rects)&&a.rects.length===b.rects.length&&
 a.rects.every((box,i)=>Array.isArray(box)&&box.length===4&&box.every((v,j)=>Number.isFinite(v)&&Math.abs(v-b.rects[i][j])<.001));
}
function buildTextMark(r,validated){
 const {text,rects}=validated,id='BM-TXT-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
 const color=/^#[0-9a-f]{6}$/i.test(r.color||'')?r.color:($('pdfInkColor')?.value||'#ffe000');
 const kinds=['regra','agente','excecao','condicao','importante','proibicao','obrigacao','nao_classificado'];
 const classificationKind=kinds.includes(r.classification_kind)?r.classification_kind:'nao_classificado';
 const suggestion=r.subject_suggestion&&typeof r.subject_suggestion==='object'?r.subject_suggestion:{};
 const mark={type:'text_highlight',id,text,rects,color,opacity:markerOpacity,
  style:['highlight','underline','double-underline','strike','conceal'].includes(r.style)?r.style:'highlight',
  color_label:String(r.color_label||'').slice(0,90),
  anchor:{quote:text,prefix:String(r.anchor?.prefix||'').slice(0,100),suffix:String(r.anchor?.suffix||'').slice(0,100)},
  source_id:selected.id,source_hash:info.hash,page:pageNo,created_at:new Date().toISOString(),
  classification_kind:classificationKind,
  classification_status:r.classification_status==='confirmada'?'confirmada':'sugestao',
  classification_confidence:['alta','media','baixa'].includes(r.classification_confidence)?r.classification_confidence:'manual',
  classification_evidence:String(r.classification_evidence||'').slice(0,180),
  calibration_profile:/^(?:geral|cf88|licitacoes|improbidade|estatuto|servidores|processo|lgpd|lai|lrf|lbi|pnma|lc95)$/.test(r.calibration_profile||'')?
   r.calibration_profile:'geral',
  calibration_evidence:String(r.calibration_evidence||'').slice(0,220),
  subject_suggestion:{
   discipline:String(suggestion.discipline||'').slice(0,120),
   topic:String(suggestion.topic||'').slice(0,140),
   subtopic:String(suggestion.subtopic||'').slice(0,140),
   basis:String(suggestion.basis||'').slice(0,60)
  },
  note_suggestion:String(r.note_suggestion||'').slice(0,1400),
  segment_index:Number.isInteger(r.segment_index)?r.segment_index:null,
  segment_total:Number.isInteger(r.segment_total)?r.segment_total:null,
  selection_group_id:typeof r.selection_group_id==='string'&&/^BM-GRP-[0-9A-Za-z-]{10,100}$/.test(r.selection_group_id)
   ?r.selection_group_id:null,
  selection_group_text:r.segment_index===1&&typeof r.selection_group_text==='string'
   ?r.selection_group_text.slice(0,12000):'',
  note:'',note_structured:{},tags:[],favorite:false,card_ids:[],history:[]};
 return mark;
}
function addTextHighlight(r){
 const valid=validateTextRecord(r);
 if(!valid)return null;
 const match={text:valid.text,rects:valid.rects};
 const duplicate=annotationsInView.find(m=>identicalHighlight(m,match));
 if(duplicate)return {...duplicate,duplicate:true};
 const mark=buildTextMark(r,valid);
 snapshot();annotationsInView.push(mark);
 if(!storeStrokes()){
  annotationsInView.pop();
  undo.get(key())?.pop();paint();return null;
 }
 paint();
 window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{id:mark.id,action:'create',page:pageNo}}));
 return {...mark};
}
// Uma seleção pode produzir várias cores e frases. Persistência e desfazer são atômicos.
function addTextHighlights(records){
 if(!Array.isArray(records)||!records.length||records.length>40)return null;
 const created=[],duplicates=[];
 for(const r of records){
  const valid=validateTextRecord(r);
  if(!valid)return null; // nenhuma gravação parcial em caso de trecho inválido
  const match={text:valid.text,rects:valid.rects};
  const dup=[...annotationsInView,...created].find(m=>identicalHighlight(m,match));
  if(dup){duplicates.push(dup.id);continue}
  created.push(buildTextMark(r,valid));
 }
 if(!created.length)return {marks:[],duplicates,unchanged:true};
 snapshot();
 annotationsInView.push(...created);
 if(!storeStrokes()){
  annotationsInView.splice(annotationsInView.length-created.length,created.length);
  undo.get(key())?.pop();paint();return null;
 }
 paint();
 window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{
  ids:created.map(m=>m.id),action:'create-group',page:pageNo
 }}));
 return {marks:created.map(m=>({...m})),duplicates,unchanged:false};
}
function updateTextHighlight(id,patch){
 if(!pdf||painting||exportBusy||!id||!patch||typeof patch!=='object')return false;
 const i=annotationsInView.findIndex(m=>m?.type==='text_highlight'&&m.id===id);
 if(i<0)return false;
 const previous=annotationsInView[i],mark={...previous};
 if(Object.hasOwn(patch,'color')&&/^#[0-9a-f]{6}$/i.test(patch.color))mark.color=patch.color;
 if(Object.hasOwn(patch,'color_label'))mark.color_label=String(patch.color_label||'').slice(0,90);
 if(Object.hasOwn(patch,'style')&&['highlight','underline','double-underline','strike','conceal'].includes(patch.style))mark.style=patch.style;
 if(Object.hasOwn(patch,'note'))mark.note=String(patch.note||'').slice(0,12000);
 if(Object.hasOwn(patch,'text')||Object.hasOwn(patch,'rects')){
  if(typeof patch.text!=='string'||!patch.text.trim()||patch.text.length>20000)return false;
  if(!Array.isArray(patch.rects)||!patch.rects.length||patch.rects.length>250||
   !patch.rects.every(b=>Array.isArray(b)&&b.length===4&&b.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&b[0]<b[2]&&b[1]<b[3]))return false;
  mark.text=patch.text.trim();mark.rects=patch.rects.map(b=>b.slice());
  mark.anchor={quote:mark.text,prefix:String(patch.anchor?.prefix||'').slice(0,100),
   suffix:String(patch.anchor?.suffix||'').slice(0,100)};
 }
 if(Object.hasOwn(patch,'note_structured')){
  const accepted=['explicacao','duvida','correcao','macete','pegadinha','fundamento','fonte'];
  const source=patch.note_structured&&typeof patch.note_structured==='object'?patch.note_structured:{};
  mark.note_structured=Object.fromEntries(accepted.map(k=>[k,String(source[k]||'').slice(0,8000)]));
 }
 if(Object.hasOwn(patch,'tags')){
  mark.tags=[...new Set((Array.isArray(patch.tags)?patch.tags:[]).map(x=>String(x||'').trim().slice(0,45)).filter(Boolean))].slice(0,30);
 }
 if(Object.hasOwn(patch,'favorite'))mark.favorite=!!patch.favorite;
 if(Object.hasOwn(patch,'classification_status')&&['sugestao','confirmada'].includes(patch.classification_status))
  mark.classification_status=patch.classification_status;
 if(Object.hasOwn(patch,'classification_kind')&&['regra','agente','excecao','condicao','importante','proibicao','obrigacao','nao_classificado'].includes(patch.classification_kind))
  mark.classification_kind=patch.classification_kind;
 if(Object.hasOwn(patch,'card_ids')){
  mark.card_ids=[...new Set((Array.isArray(patch.card_ids)?patch.card_ids:[]).map(x=>String(x).trim()).filter(x=>/^(CARD-\d{4,}|PROP-IJUI-\d+)$/i.test(x)))].slice(0,80);
 }
 const changed=['color','color_label','style','note','text','rects','note_structured','tags','favorite','card_ids','classification_status','classification_kind']
  .some(k=>Object.hasOwn(patch,k)&&JSON.stringify(mark[k])!==JSON.stringify(previous[k]));
 if(!changed)return true;
 // Histórico incremental: registrar apenas campos alterados para preservar espaço do navegador.
 const fields=['color','color_label','style','note','text','rects','note_structured','tags','favorite','card_ids','classification_status','classification_kind'];
 const before={};
 for(const name of fields){
  if(JSON.stringify(mark[name])!==JSON.stringify(previous[name]))before[name]=previous[name]??null;
 }
 mark.history=[...(Array.isArray(previous.history)?previous.history:[]).slice(-19),{
  at:new Date().toISOString(),action:'edit',before
 }];
 mark.updated_at=new Date().toISOString();mark.bm108_changed_at=mark.updated_at;
 snapshot();annotationsInView[i]=mark;
 if(!storeStrokes()){annotationsInView[i]=previous;paint();return false}
 paint();window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{id,action:'edit',page:pageNo}}));
 return true;
}
function removeTextHighlight(id){
 if(!pdf||painting||exportBusy)return false;
 const i=annotationsInView.findIndex(m=>m?.type==='text_highlight'&&m.id===id);
 if(i<0)return false;
 snapshot();const [old]=annotationsInView.splice(i,1);
 if(!storeStrokes()){annotationsInView.splice(i,0,old);paint();return false}paint();window.dispatchEvent(new CustomEvent('bm-pdf-mark-changed',{detail:{id,action:'remove',page:pageNo}}));return true;
}

let neighborTintTimer=0;
function rerenderVisibleMarks(){
 if(!pdf)return;
 // Paint the editable page immediately; debounce adjacent previews to keep
 // a dragged intensity slider responsive on mobile.
 lastPdfTintSignature=null;paint();
 clearTimeout(neighborTintTimer);
 const ticket=serial;
 neighborTintTimer=setTimeout(()=>{
  if(ticket!==serial||!pdf)return;
  for(const slice of [prevSlice,nextSlice]){
   if(slice.hidden||slice.dataset.ready!=='1')continue;
   const number=Number(slice.dataset.page);
   if(!Number.isSafeInteger(number)||number<1||number>pdf.numPages)continue;
   void renderNeighbor(slice,number,ticket).catch(e=>{
    if(ticket===serial&&!isCancel(e))
     status('Prévia será atualizada ao mudar de página: '+e.message);
   });
  }
 },190);
}
window.BancoMestrePDFV042={
 get editing(){return !!pdf},
 getCurrentPdfPage(){return pdf?pdf.getPage(pageNo):Promise.resolve(null)},
 selectTextMode(){if(!pdf)return false;markTool('select');return true},
 addTextHighlight,addTextHighlights,updateTextHighlight,removeTextHighlight,
 get currentTool(){return tool},
 extractHighlights:bm059ExtractHighlights,
 get straightHighlightPending(){return !!pendingMarkerStart},
 get canUndo(){return !!pdf&&(undo.get(key())||[]).length>0},
 get canRedo(){return !!pdf&&(redo.get(key())||[]).length>0},
 goToPage,
 undoLast(){if(!pdf)return false;historyEdit('undo');return true},
 redoLast(){if(!pdf)return false;historyEdit('redo');return true},
 buildAnnotated,
 get currentId(){return selected?.id||null},
 get currentDoc(){return selected?{...selected}:null},
 get sourceHash(){return info?.hash||null},
 get currentPage(){return pageNo},
 get totalPages(){return pdf?.numPages||0},
 get zoomLevel(){return zoom},
 fitPage:()=>bm420Fit('page'),fitWidth:()=>bm420Fit('width'),get fitMode(){return bm420FitMode},
 setZoomAt,
 beginPinch(){
  if(!pdf)return false;
  pinchBlocked=true;
  draft=null;cancelMarkerStart();paint();
  return true;
 },
 endPinch(){
  // Leave a short guard for late pointerup events after touchend.
  setTimeout(()=>{pinchBlocked=false},120);
 },

 get readableHighlights(){return readableHighlights},
 get screenHighlightIntensity(){return screenIntensity},
 setScreenHighlightIntensity(value){
  const v=Number(value);
  if(!Number.isFinite(v))return screenIntensity;
  screenIntensity=Math.max(.30,Math.min(.80,Math.round(v*100)/100));
  try{localStorage.setItem(SCREEN_INTENSITY_KEY,String(screenIntensity))}catch(_){}
  rerenderVisibleMarks();
  return screenIntensity;
 },
 setReadableHighlights(on){
  readableHighlights=!!on;
  try{localStorage.setItem(READABLE_KEY,readableHighlights?'1':'0')}catch(_){}
  rerenderVisibleMarks();
  return readableHighlights;
 },
 get currentMarks(){return annotationsInView.map(x=>({...x}))}
};
})();

;
/* 4 assets/v241_boot_topic.js */
/* V126 — navegação direta evita carregamento integral do índice visual de Assuntos. */

/* Banco Mestre V034 — índice auditado de mídias por assunto.
   Todo o trabalho acontece como camada visual: não modifica os originais, os
   cartões canônicos, a rotina SRS ou o histórico local já armazenado. */
(function(){
'use strict';
const INDEX_PATH='assets/imagens_assuntos_v156.json';
const priorSetStatus=api.setStatus.bind(api),priorAllStatus=api.all.bind(api);
const validP10=/^IMG-P10-\d{2}$/;
api.setStatus=async function(id,status){
 if(!validP10.test(id))return priorSetStatus(id,status);
 if(status!=='visible'&&status!=='hidden')throw Error('Situação inválida');
 localStorage.setItem('BM032_VIS_'+id,status);
 return {id,status,updatedAt:new Date().toISOString()};
};
api.all=async function(){
 const a=await priorAllStatus();
 const r=[];
 for(let n=1;n<=16;n++){const id='IMG-P10-'+String(n).padStart(2,'0');const status=localStorage.getItem('BM032_VIS_'+id);if(status)r.push({id,status})}
 return [...a,...r];
};
let sourcePromise=null,applied=false;
const validKey=/^IMG-(?:P10-)?[0-9]{1,4}$/;
async function getIndex(){
 if(!sourcePromise)sourcePromise=fetch(INDEX_PATH,{cache:'no-store'}).then(async r=>{
   if(!r.ok)throw Error('Índice de vínculos indisponível');
   const d=await r.json();
   if(d.format!=='BancoMestreImagemAssuntoIndexV156'||d.counts.legacy!==70||d.counts.new!==16)throw Error('Catálogo de imagens incompatível');
   window.BM032VisualIndex=d;
   return d;
 }).catch(e=>{sourcePromise=null;throw e});
 return sourcePromise;
}
const previousLoadMeta=loadMeta;
loadMeta=async function(){
 const m=await previousLoadMeta();
 const idx=await getIndex();
 if(!applied){
  const byId=new Map(idx.records.map(r=>[r.id,r]));
  for(const im of m.images){
   const record=byId.get(im.no);if(!record)continue;
   if(record.group!==im.group){
    im.original_group=im.group;im.group=record.group;
    im.category=im.no==='IMG-044'||im.no==='IMG-045'||im.no==='IMG-046'?
      'Engenharia Civil / Estruturas / Aço e NBR 8800':
      im.no==='IMG-052'?'Engenharia Civil / Edificações / Esquadrias e portas':
      ['IMG-004','IMG-010','IMG-024'].includes(im.no)?'Engenharia Civil / Estruturas / Pórticos e análise estrutural':im.category;
   }
   im.subject_links=record.relations;
   im.link_evidence=record.status;
  }
  for(const rec of idx.records.filter(r=>/^IMG-P10-/.test(r.id))){
   if(!validKey.test(rec.id))throw Error('ID de imagem inválido');
   m.images.push({
    no:rec.id,title:rec.title,group:rec.group,
    category:'Engenharia Civil / Licenciamento Ambiental / Petrobras 10',
    status:rec.status==='pendente'?'Assunto do recorte pendente de auditoria':'Documento preservado no Drive; verifique a vigência técnica',
    source:rec.source,restricted:false,type:'Recorte normativo original',external:true,
    preview_url:rec.thumbnail,source_url:rec.url,file_id:rec.file_id,
    subject_links:rec.relations,link_evidence:rec.status
   });
  }
  m.image_counts_v032={original:70,petrobras10:16,total:m.images.length};
  const badge=document.querySelector('#imagens .intro');
  if(badge)badge.textContent='Atlas ativo: 70 imagens históricas mantidas + 16 recortes Petrobras 10. Os 184 registros excluídos foram retirados do catálogo vigente. Associações por evidência, sem atribuição automática ao cartão por grupo. Clique em qualquer imagem/ID para ampliar.';
  const stat=document.querySelector('.stats .stat:nth-child(3) b');
  if(stat)stat.textContent=String(m.images.length);
  applied=true;
 }
 return m;
};
const previousLoadTopics=loadTopics;
loadTopics=async function(){
 try{
  await previousLoadTopics();
  const idx=await getIndex(),base=await loadMeta();
  let topicSet=new Set(topicRows.map(t=>t.group+'|'+t.subject));
  for(const rec of idx.records){
   if(rec.status==='pendente'||rec.status==='reprovada')continue;
   for(const rel of rec.relations||[]){
    const key=rel.group+'|'+rel.subject;if(topicSet.has(key))continue;
    const g=base.groups.find(x=>x.id===rel.group);
    topicRows.push({group:rel.group,subject:rel.subject,count:0,area:topicAreaOf(rel.group),label:g?.title||rel.group,visualOnly:true});
    topicSet.add(key);
   }
  }
  topicRows.sort((a,b)=>a.area.localeCompare(b.area,'pt-BR')||a.subject.localeCompare(b.subject,'pt-BR'));
  const imagePerTopic=new Map();
  for(const rec of idx.records){
   if(rec.status==='pendente'||rec.status==='reprovada')continue;
   for(const rel of rec.relations||[]){
    const key=rel.group+'|'+rel.subject;
    imagePerTopic.set(key,(imagePerTopic.get(key)||0)+1);
   }
  }
  for(const t of topicRows)t.imgCount=imagePerTopic.get(t.group+'|'+t.subject)||0;
  for(const button of document.querySelectorAll('#areaRows button.topicCard')){
    const area=button.querySelector('strong')?.textContent;
    const a=topicRows.filter(t=>t.area===area);
    const sum=a.reduce((n,t)=>n+(t.imgCount||0),0);
    const count=button.querySelector('small');
    if(count)count.textContent=a.length+' assuntos · '+sum+' associações visuais; clique para explorar.';
  }
  const caption=document.querySelector('#assuntos .intro');
  if(caption)caption.textContent='Abra cada assunto para ler explicações, consultar imagens e PDFs e, quando houver, praticar os cartões. Alguns assuntos possuem imagens mesmo sem flashcards.';
  topicRender();
 }catch(e){console.warn('Falha na classificação temática:',e);const root=document.getElementById('topicRows');if(root&&!root.children.length)root.textContent='Erro ao carregar vínculos de assuntos: '+e.message;}
};
const previousThumb=thumb;
thumb=async function(x){if(x.external)return x.preview_url;return previousThumb(x)};
const previousImgOpen=imgOpen;
imgOpen=async function(x){
 if(!x?.external)return previousImgOpen(x);
 try{
  const image=await picture(x.preview_url);
  await BancoMestreEditorV030.open({
   image,imageId:x.no,title:x.title,
   quality:'Imagem original catalogada no Google Drive (prévia ampliada; edição gráfica depende da disponibilidade da prévia)',
   sourceUrl:x.source_url,
   warning:'Esta imagem vem do Drive. Grifos e riscos são salvos apenas neste navegador; não modificam o arquivo do Google Drive. Consulte a fonte e a vigência.',
   onExclude:async id=>{await api.setStatus(id,'hidden');await imgRender()}
  });
 }catch(e){
  alert('A prévia da imagem não abriu. Será aberto o arquivo original no Google Drive para leitura.');
  window.open(x.source_url,'_blank','noopener,noreferrer');
 }
};
const priorImgRenderV032=imgRender;
imgRender=async function(){
 await priorImgRenderV032();
 for(const a of document.querySelectorAll('#imageRows article.card')){
  const id=a.querySelector(':scope > .tag')?.textContent?.trim();
  const im=imgs.find(x=>x.no===id);if(!im?.external)continue;
  const target=a.querySelector('.buttons');
  if(target&&!target.querySelector('.v032-open')){const b=action('Abrir e grifar',()=>imgOpen(im),'primary');b.classList.add('v032-open');target.prepend(b);target.append(link('Original no Drive',im.source_url))}
  const preview=a.querySelector('img.thumb');if(preview)preview.onerror=()=>{preview.alt='Prévia indisponível; abra pelo botão Original no Drive';preview.title=preview.alt};
 }
};
const route=location.hash.slice(1);
if(route.startsWith('tema?')){
 // V126: não gerar todo o catálogo quando o link já aponta para um assunto.
 // A navegação específica será resolvida no módulo v126_assuntos_rapidos.js.
 document.querySelectorAll('main section').forEach(node=>node.classList.toggle('active',node.id==='tema'));
 const target=document.getElementById('topicStudyBlocks');
 if(target&&!target.childNodes.length)target.textContent='Abrindo assunto e cartões…';
}else if(['assuntos','pdfs','cartoes','imagens'].includes(route))section(route);
else if(route===''||route==='controle-estudos'){
 // V241: não reescrever a rota inicial como #assuntos. O Controle é montado
 // por seu próprio módulo no DOMContentLoaded e deve poder ativar a seção.
 // Rotas profundas ?cartao/?tema/?pdf sem hash também permanecem intactas.
}else section('assuntos');
window.BancoMestreMediaV034={getIndex};
})();


;
/* 5 assets/f17_rede_v034.js */

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
 window.BancoMestreV034.gotoCard(id);
 const a=[...document.querySelectorAll('#cardRows article.card')].find(el=>el.querySelector(':scope > .tag')?.textContent.trim()===id);
 if(a){a.querySelector('details')?.setAttribute('open','');a.scrollIntoView({block:'start',behavior:'smooth'})}
}
async function showTopic(id){
 await ensureCards();
 const t=topicOf(id);
 if(t){await window.BancoMestreV034.openTopic(t);return}
 // Carregar os assuntos quando o destino ainda não foi materializado.
 await loadTopics();
 const next=topicOf(id);if(next)await window.BancoMestreV034.openTopic(next);
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
   body.append(sourceLink(index.sources.auditoria,'Fonte histórica da revisão'));
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
 const box=make('div','f17-topic');box.id='f17TopicReferences';add(box,'h3','','Conhecimentos e referências associados');
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
  // Relações exibidas no próprio assunto; a aba separada foi retirada na V034.
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
 actions.append(btn('Ver relações no assunto',()=>showTopic(id)));block.append(actions);
 answer.append(block);
}
const priorCardRender=cardRender;
cardRender=function(){priorCardRender();if(index)for(const node of document.querySelectorAll('#cardRows article.card'))renderForCard(node)};
// Não existe aba de auditoria na V034. A rede continua acessível nos cartões e assuntos.
window.BancoMestreF17={load,renderForTopic,dashboard,showCard,showTopic};
load().then(()=>{if(document.querySelector('#cartoes.active'))cardRender();}).catch(e=>console.warn('Rede F17:',e));
})();


;
/* 6 assets/v034_originais.js */

/* V034: fontes integrais de imagem, nunca ampliar uma miniatura como original.
 * Armazenamento opcional em IndexedDB preserva original local e grifos por ID.
 * Não publica arquivos, não altera SRS, não substitui o catálogo original. */
(function(){
'use strict';
const DB_NAME='BancoMestreFontesV034',STORE='sources';
const byId=id=>document.getElementById(id);
let dbPromise,activeChoice=null,candidates=null,dimensions=null,loadedPromise=null;
function db(){
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('IndexedDB indisponível'));
 });
 return dbPromise;
}
async function tx(mode,op){
 const conn=await db();return new Promise((resolve,reject)=>{
  const tr=conn.transaction(STORE,mode),req=op(tr.objectStore(STORE));
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Armazenamento de originais indisponível'));
 });
}
function read(id){return tx('readonly',s=>s.get(id)).catch(()=>null)}
function write(id,file){return tx('readwrite',s=>s.put({id,blob:file,name:file.name,bytes:file.size,modified:file.lastModified,format:file.type,savedAt:new Date().toISOString()}))}
async function getSources(){
 if(!loadedPromise)loadedPromise=Promise.all([
  fetch('assets/originais_candidatos_v028.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null),
  fetch('assets/auditoria_imagens_v024.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null)
 ]).then(([o,a])=>{
  candidates=o?.images||{};dimensions=new Map((a?.images||[]).map(x=>[x.id,{w:x.width,h:x.height}]));
 });
 return loadedPromise;
}
function imageFrom(src){
 return new Promise((ok,fail)=>{
  const image=new Image();image.onload=()=>ok(image);
  image.onerror=()=>fail(Error('A fonte não carregou neste navegador'));
  image.src=src;
 });
}
function ratioOkay(id,image){
 const old=dimensions?.get(id);if(!old?.w||!old?.h||!image.naturalWidth||!image.naturalHeight)return true;
 const a=old.w/old.h,b=image.naturalWidth/image.naturalHeight;
 return Math.abs(a/b-1)<0.055;
}
function viewerHint(id,url,quality){
 return quality+'. '+(url?'Arquivo fonte do Drive disponível no botão Original. ':'')+
 'A edição gráfica fica no navegador; se o Drive bloquear a exportação por origem cruzada, escolha uma cópia local do original.';
}
async function openEditor(x,image,quality,sourceUrl,warning){
 await BancoMestreEditorV030.open({
  image,imageId:x.no,title:x.title,quality,sourceUrl:sourceUrl||'',
  warning:warning||viewerHint(x.no,sourceUrl,quality),
  onExclude:async id=>{await api.setStatus(id,'hidden');await imgRender()}
 });
 const btn=byId('v034SelectOriginal');
 if(btn){btn.hidden=false;btn.onclick=()=>pick(x)}
}
function pick(x){
 activeChoice=x;
 const input=byId('v034OriginalPicker');
 if(!input){alert('Seleção de original indisponível');return}
 input.value='';input.click();
}
async function localOpen(x,record){
 const url=URL.createObjectURL(record.blob);
 try{
  const img=await imageFrom(url);
  await openEditor(x,img,'Original local '+img.naturalWidth+'×'+img.naturalHeight+' px · '+record.name,
   x.source_url||candidates?.[x.no]?.source_url||'',
   'Fonte original escolhida para este ID e armazenada apenas neste navegador. Grifos continuam vinculados ao ID. Nenhum arquivo foi publicado.');
 }finally{URL.revokeObjectURL(url)}
}
const fileInput=byId('v034OriginalPicker');
if(fileInput)fileInput.onchange=async function(){
 const file=this.files?.[0],x=activeChoice;this.value='';
 if(!file||!x)return;
 if(!file.type.startsWith('image/')&&!/\.(png|jpe?g|webp|bmp|gif|svg)$/i.test(file.name)){
  alert('Selecione uma imagem original (PNG, JPG, WebP ou SVG).');return;
 }
 if(file.size>45000000){alert('Imagem acima de 45 MB; escolha outra fonte integral.');return}
 if(!confirm('Associar o arquivo "'+file.name+'" ao ID '+x.no+' — '+x.title+'? Confira se é exatamente a mesma imagem.'))return;
 await getSources();
 const url=URL.createObjectURL(file);
 try{
  const img=await imageFrom(url);
  if(!ratioOkay(x.no,img)){alert('Proporção incompatível com a imagem catalogada. Associação cancelada para não deslocar os grifos.');return}
 }catch(e){alert('Imagem ilegível: '+e.message);return}
 finally{URL.revokeObjectURL(url)}
 try{await write(x.no,file)}catch(e){console.warn('Original não persistiu:',e);alert('A fonte abrirá, mas não pôde ser armazenada para acessos futuros.')}
 const oldModal=byId('imageDialog');if(oldModal?.open)oldModal.close();
 await localOpen(x,{blob:file,name:file.name});
};
const previousImgOpen=imgOpen;
imgOpen=async function(x){
 if(!x?.no)return previousImgOpen(x);
 try{
  await getSources();
  const local=await read(x.no);
  if(local?.blob){await localOpen(x,local);return}
  const candidate=x.external?{preview_url:x.preview_url,source_url:x.source_url,kind:'recorte do Drive'}:candidates?.[x.no];
  if(candidate?.preview_url){
   try{
    const image=await imageFrom(candidate.preview_url);
    if(!ratioOkay(x.no,image))throw Error('Proporção divergente do registro');
    const quality=(x.external?'Recorte do Drive':'Arquivo integral WebP da coleção otimizada no Drive')+' · '+image.naturalWidth+'×'+image.naturalHeight+' px';
    await openEditor(x,image,quality,candidate.source_url,
     viewerHint(x.no,candidate.source_url,quality)+(x.external?'':' Correspondência atribuída pelo nome; confira o conteúdo.'));
    return;
   }catch(e){console.warn('Fonte maior indisponível',x.no,e)}
  }
  // Pranchas P08 mantêm imagens integrais nos próprios shards JSON (sem
  // baixa resolução extra quando já têm dimensões adequadas).
  if(x.shard!==undefined){
   const full=await thumb(x);
   if(full){
    const image=await imageFrom(full);
    if(image.naturalWidth>=900||image.naturalHeight>=1200){
     await openEditor(x,image,'Arquivo integral do acervo '+image.naturalWidth+'×'+image.naturalHeight+' px',null);
     return;
    }
   }
  }
  const use=confirm('Não há fonte original em resolução suficiente confirmada para '+x.no+'. Deseja selecionar a imagem original neste computador? Ela ficará apenas neste navegador.');
  if(use){pick(x);return}
  const target=candidates?.[x.no]?.source_url||x.source_url;
  if(target&&confirm('Abrir o arquivo catalogado no Drive em nova aba?'))window.open(target,'_blank','noopener,noreferrer');
 }catch(e){alert('Não foi possível abrir a imagem na fonte original: '+e.message)}
};
const previousImgRender=imgRender;
imgRender=async function(){
 await previousImgRender();await getSources();
 for(const a of byId('imageRows').querySelectorAll('article.card')){
  const id=a.querySelector(':scope > .tag')?.textContent?.trim();
  const im=imgs.find(x=>x.no===id);if(!im)continue;
  const btns=a.querySelector('.buttons');
  if(!btns?.querySelector('.v034-local')){
   const b=document.createElement('button');b.className='v034-local';b.textContent='Usar original';b.title='Escolher e guardar localmente o arquivo original deste ID';
   b.onclick=()=>pick(im);btns.prepend(b);
  }
  if(candidates?.[id]?.source_url&&!btns.querySelector('.v034-drive')){
   const l=document.createElement('a');l.className='action v034-drive';l.href=candidates[id].source_url;
   l.target='_blank';l.rel='noopener noreferrer';l.textContent='Fonte no Drive';btns.append(l);
  }
  const local=await read(id);
  if(local&&!a.querySelector('.v034-origin')){
   const note=document.createElement('small');note.className='v034-origin';note.textContent='Original local vinculado ao ID';a.append(note);
  }
 }
};
window.BancoMestreOriginaisV034={pick,read,getSources,open:id=>{const x=meta?.images?.find(t=>t.no===id);if(x)return imgOpen(x)}};
})();

;
/* 7 assets/confirm_v035.js */

/* V035 — segurança de exclusões: nenhuma alteração destrutiva sem confirmação.
 * Alvos: ocultar imagem/PDF, apagar seleção, tecla Delete e botão excluir.
 * "Restaurar" não é destrutivo; não requer pergunta. */
(function(){
'use strict';
function tagOf(button){
 const a=button.closest('article.card');
 return a?.querySelector(':scope > .tag')?.textContent?.trim()||'';
}
function isDestructive(button){
 if(!button||button.disabled||button.dataset.bmArchiveAction==='true')return false;
 if(['deleteSelected','hideOpened'].includes(button.id))return true;
 const t=button.textContent?.trim().toLowerCase()||'';
 if(t==='excluir'||t==='excluir da visualização'||t==='apagar seleção'||t==='remover')return true;
 return false;
}
function message(button){
 const code=tagOf(button);
 if(button.id==='deleteSelected')return 'Apagar os traços selecionados desta imagem? Você poderá desfazer no histórico do editor.';
 if(button.id==='hideOpened')return 'Ocultar esta imagem da lista de estudo? O arquivo original será preservado e você poderá restaurar a imagem depois.';
 if(code.startsWith('IJUI-PDF-')||code.startsWith('PETRO10-')||code.startsWith('MANUSCRITO-')||code.startsWith('CAP-')||code.startsWith('GUIA-'))return 'Excluir o PDF '+code+' da visualização neste navegador? O arquivo do Drive não será apagado e poderá ser restaurado.';
 if(code.startsWith('IMG-'))return 'Excluir a imagem '+code+' da visualização neste navegador? O original e os grifos serão preservados e poderão ser restaurados.';
 return 'Confirma esta exclusão? Nenhum arquivo original do Google Drive será apagado por esta ação.';
}
document.addEventListener('click',e=>{
 const button=e.target?.closest?.('button');
 if(!isDestructive(button))return;
 if(!confirm(message(button))){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation()}
},true);
document.addEventListener('keydown',e=>{
 const image=document.getElementById('imageDialog');
 if(e.key!=='Delete'||!image?.open)return;
 if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
 const selected=document.getElementById('selectedCount');
 if(!selected||!selected.textContent?.trim())return;
 if(!confirm('Apagar as marcações selecionadas? Esta ação poderá ser desfeita no editor.')){
  e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 }
},true);
})();


;
/* 8 assets/v271_pdfs_progressive.js */
/* V269 — PDFs privados: navegação somente após sessão Drive e varredura atual; arquivos locais seguem independentes. */
/* V268: bibliotecas até 200 PDFs abertas, totais transparentes, cache distinguido. */

/* Banco Mestre V260 — grupos de PDF renderizados sob demanda, 24 cartões por lote.
 * Mantém a lógica de catálogo/Drive V259 e originais intactos. */
/* Banco Mestre V259 — compatibilidade entre catálogo histórico e PDFs confirmados.
 * Grupo de categorias V149, sem alteração de IDs ou links privados. */
/* Banco Mestre V140 — biblioteca PDF com grupos dinâmicos adicionais do Drive.
 * Catálogo e arquivos originais são preservados. */
(function(){
'use strict';
const byId=id=>document.getElementById(id);
function driveValid(){
 const core=window.BancoMestreMediaSyncV182?.token?.();
 const fromPdf=window.BancoMestrePDFSyncV130?.connected;
 return Boolean(core||fromPdf);
}
function accessGate(){
 const loggedIn=driveValid(),verified=document.documentElement.dataset.bm217PdfVerified==='true';
 const active=loggedIn&&verified;
 document.documentElement.dataset.bm269PdfAuth=active?'authorized':loggedIn?'scanning':'locked';
 const notice=byId('bm269PdfLocked');
 if(notice)notice.textContent=active?''
   :loggedIn
   ?'Drive conectado. Aguardando a conferência dos PDFs antes de abrir a biblioteca privada.'
   :'Conecte o Google Drive para consultar a biblioteca de PDFs privados. Arquivos importados do seu computador continuam disponíveis localmente.';
 if(!active){
  const count=byId('pdfCount'),head=byId('pdfStat'),rows=byId('pdfRows');
  if(count)count.textContent='Biblioteca privada — Drive não conferido nesta sessão';
  if(head)head.textContent='—';
  if(rows)rows.replaceChildren();
 }
 return active;
}
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const node=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e};
const button=(label,fn,cls)=>{const b=node('button',cls,label);b.type='button';b.onclick=fn;return b};
let data=null,lookup=null,groups=null,areas=null,pending=null;
async function ready(){
 if(data)return data;
 if(!pending)pending=fetch('assets/pdf_grupos_v149.json',{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('Índice de PDFs indisponível');
  const d=await r.json();if(d.format!=='BancoMestrePDFGroupsV140'||d.assigned?.length!==78)throw Error('Índice incompatível');
  if(new Set(d.assigned.map(x=>x.id)).size!==78)throw Error('IDs de PDFs repetidos');
  data=d;groups=new Map(d.groups.map(g=>[g.id,g]));areas=new Map(d.areas.map(a=>[a.id,a]));
  lookup=new Map(d.assigned.map(x=>[x.id,groups.get(x.group)]));
  return d;
 }).catch(err=>{pending=null;throw err});
 return pending;
}
function updateFilters(){
 const sel=byId('pdfFilter');if(!sel||sel.dataset.bm036==='1')return;
 sel.replaceChildren(new Option('Todos os grupos','all'));
 for(const area of data.areas){
  sel.add(new Option(area.label,'area:'+area.id));
  for(const g of data.groups.filter(x=>x.area===area.id).sort((a,b)=>a.order-b.order))
   sel.add(new Option('   — '+g.label,'group:'+g.id));
 }
 sel.dataset.bm036='1';sel.value='all';
 const n=byId('pdfAreaNavV036');if(n){
  n.replaceChildren();
  n.append(button('Todos',()=>choose('all'),'v036-pdf-pill'));
  for(const area of data.areas)n.append(button(area.label,()=>choose('area:'+area.id),'v036-pdf-pill'));
 }
}
function choose(value){
 byId('pdfFilter').value=value;pdfRender();
 byId('pdfRows').scrollIntoView({block:'start',behavior:'smooth'});
}
function sourceType(p){
 if(p.id.startsWith('BMPDF-20261112-'))return 'PDF integrado ao Banco Mestre';
 if(p.id.startsWith('DRIVE-PDF-'))return 'PDF sincronizado do Drive';
 if(p.id.startsWith('IJUI-PDF-'))return 'Norma ou lei';
 if(p.id.startsWith('NR-'))return 'Norma Regulamentadora';
 if(p.id.startsWith('CAP-'))return 'Capítulo do manuscrito';
 if(p.id.startsWith('GUIA-'))return 'Guia de estudo';
 if(p.id.startsWith('PETRO10-'))return 'Licenciamento / Petrobras';
 return 'Manuscrito integral';
}

/* VS29: nomes de leitura separados da numeração e do arquivo original. */
function bm420PdfDisplayParts(p){
 const raw=String(p.filename||p.title||'Documento PDF').replace(/\.pdf$/i,'');
 const match=raw.match(/^\s*(?:\d{1,3}[\s_-]+)?p\s*(\d{1,4})\s*[-–]\s*p?\s*(\d{1,4})[\s_-]+(.+)$/iu);
 const body=(match?match[3]:raw).replace(/_+/g,' ').replace(/\s+/g,' ').trim()
  .replace(/\b(?:resist ncia|isost ticas?|hiperest ticas?|princ pios?|a es|cer micas?|constru o|funda es|instala es|instala o|hidr ulica|mec nica|el tricas?|topogr fica|avalia es|avalia o|seguran a|prote o|legisla o|portugu s|matem tica|l gica|or amento|p blicas?|edifica es|pavimenta o|sinaliza o|movimenta o)\b/giu,x=>({"resist ncia":"resistência","isost tica":"isostática","isost ticas":"isostáticas","hiperest tica":"hiperestática","hiperest ticas":"hiperestáticas","princ pio":"princípio","princ pios":"princípios","a es":"ações","a o":"aço","cer mica":"cerâmica","cer micas":"cerâmicas","constru o":"construção","funda es":"fundações","instala es":"instalações","instala o":"instalação","hidr ulica":"hidráulica","mec nica":"mecânica","el trica":"elétrica","el tricas":"elétricas","topogr fica":"topográfica","avalia es":"avaliações","avalia o":"avaliação","seguran a":"segurança","prote o":"proteção","legisla o":"legislação","portugu s":"português","matem tica":"matemática","l gica":"lógica","or amento":"orçamento","p blica":"pública","p blicas":"públicas","edifica es":"edificações","pavimenta o":"pavimentação","sinaliza o":"sinalização","movimenta o":"movimentação"})[x.toLowerCase()]||x);
 const key=normalize(body).replace(/[^a-z0-9]+/g,' ').trim();
 const exact={
  'cimento portland':'Cimento Portland',
  'concreto tecnologia controle e ensaios':'Concreto — tecnologia, controle e ensaios',
  'agregados':'Agregados',
  'argamassas':'Argamassas',
  'alvenaria e cer micas':'Alvenaria e cerâmicas',
  'alvenaria e ceramicas':'Alvenaria e cerâmicas',
  'materiais de constru o civil':'Materiais de construção civil',
  'materiais de construcao civil':'Materiais de construção civil',
  'a es estruturais nbr 6120 e 6122':'Ações estruturais — NBR 6120 e NBR 6122',
  'acoes estruturais nbr 6120 e 6122':'Ações estruturais — NBR 6120 e NBR 6122',
  'resist ncia dos materiais':'Resistência dos materiais',
  'resistencia dos materiais':'Resistência dos materiais',
  'estruturas e concreto armado nbr 6118':'Estruturas e concreto armado — NBR 6118',
  'estruturas isost ticas':'Estruturas isostáticas',
  'estruturas isostaticas':'Estruturas isostáticas',
  'hiperest tica e princ pio dos trabalhos virtuais':'Hiperestática e princípio dos trabalhos virtuais',
  'hiperestatica e principio dos trabalhos virtuais':'Hiperestática e princípio dos trabalhos virtuais',
  'estruturas de a o nbr 8800':'Estruturas de aço — NBR 8800',
  'estruturas de madeira':'Estruturas de madeira'
 };
 return {body,exact:exact[key]||'',range:match&&Number(match[1])>0&&Number(match[2])>=Number(match[1])?[Number(match[1]),Number(match[2])]:null};
}
/* V271: somente nomes EXIBIDOS dos PDFs do Drive, sem renomear fonte/ID/grifos. */
function prettyPdfTitle(p){
 if(!p._driveDynamic) return p.title||'Documento PDF';
 const display=bm420PdfDisplayParts(p);
 if(display.exact)return display.exact;
 const raw=display.body;
 let name=raw.replace(/\.pdf$/i,'')
  .replace(/([a-zà-ÿ])([A-Z])(?=[a-zà-ÿ])/g,'$1 $2')
  .replace(/_+/g,' ')
  .replace(/\s+/g,' ')
  .replace(/(?:\s+(?:20\d{6}|\d{6,8})\s+\d{4,6})+$/,'')
  .replace(/^(?:pdf\s+file|arquivo\s+pdf)\s+/i,'')
  .replace(/\s+arquivo\s+fornecido(?=\s|$)/gi,'')
  .trim();
 const acronyms=new Set(['ABNT','NBR','NR','DNIT','CONAMA','EIA','RIMA','ETA','ETE','CREA','CONFEA','PCMSO','LGPD','SRS','PDF','PRF','TRT','BIM','CAD','BDI','SPT','RQD','GRO']);
 const spelling={resumao:'Resumão',raciocinio:'Raciocínio',mecanica:'Mecânica',fundacoes:'Fundações',instalacoes:'Instalações',legislacao:'Legislação',portugues:'Português',tecnologico:'Tecnológico',edificacoes:'Edificações',protecao:'Proteção',avaliacao:'Avaliação',resolucoes:'Resoluções',construcao:'Construção',paginas:'páginas',pagina:'página',eletricas:'Elétricas',hidraulica:'Hidráulica',informacao:'Informação',questoes:'Questões',orcamento:'Orçamento',publicas:'Públicas',praticas:'Práticas',situacoes:'Situações',previsao:'Previsão',trafego:'Tráfego',informatica:'Informática',seguranca:'Segurança',comentarios:'Comentários',organizacao:'Organização',organica:'Orgânica',fisica:'Física',autocad:'AutoCAD',sintaxe:'Sintaxe',tecnica:'Técnica',tecnicas:'Técnicas',educacao:'Educação',administracao:'Administração',licencas:'Licenças',especificacoes:'Especificações',utilizacao:'Utilização',producao:'Produção'};
 const joiners=new Set(['de','da','do','das','dos','e','em','para','com','por','ao','a','o','na','no']);
 name=name.split(' ').map((token,i)=>{
  if(/^\d+ed$/i.test(token))return token.toLowerCase();
  const word=token.match(/[A-Za-zÀ-ÿ]+/);
  if(!word)return token;
  const key=word[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const replacement=acronyms.has(key.toUpperCase())?key.toUpperCase()
   :spelling[key]||(i>0&&joiners.has(key)?key:word[0].charAt(0).toLocaleUpperCase('pt-BR')+word[0].slice(1).toLocaleLowerCase('pt-BR'));
  return token.slice(0,word.index)+replacement+token.slice(word.index+word[0].length);
 }).join(' ').replace(/\s+/g,' ').trim();
 if(/^backup\s+/i.test(name))name=name.replace(/^backup\s+/i,'Backup — ');
 else if(/^fonte\s+/i.test(name))name=name.replace(/^fonte\s+/i,'Fonte — ');
 return name.slice(0,190)||'Documento PDF';
}

function pdfCard(p,off){
 const a=node('article','v036-pdf-card');
 const meta=node('div','v036-pdf-meta');
 meta.append(node('span','v036-pdf-id',p.id),node('span','',sourceType(p)));
 if(p.pages?.length===2)meta.append(node('span','', 'Páginas '+p.pages[0]+'–'+p.pages[1]));
 else if(p._driveDynamic){const range=bm420PdfDisplayParts(p).range;if(range)meta.append(node('span','v420-pdf-pages','Páginas '+range[0]+'–'+range[1]+' · nome de origem'));}
 if(off)meta.append(node('span','v036-muted','Oculto'));
 if(p._driveArchive)meta.append(node('span','v036-muted','Histórico — original preservado'));
 const displayTitle=prettyPdfTitle(p);
 const view=(displayTitle===p.title)?p:{...p,title:displayTitle};
 const read=()=>window.BancoMestreDriveV038.openAndEdit(view,p._driveSynced?{forceDrive:true}:{});
 const title=node('h4','v036-pdf-title',displayTitle);
 title.tabIndex=0;title.setAttribute('role','button');
 title.title=p.filename?'Ler '+displayTitle+' (original: '+p.filename+')':'Ler '+p.id;
 title.onclick=read;
 title.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();read()}};
 const actions=node('div','v036-pdf-actions');
 actions.append(button('Ler e editar no site',read,'v036-primary'));
 const link=node('a','v036-pdf-link','Abrir no Drive');
 link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);
 // V035 confirma qualquer exclusão antes de realizar esta ação.
 if(p.file_id&&!String(p.id).startsWith('LOCAL-')){
  const move=button('Excluir',()=>window.BM421PdfArchive?.request(p,move),'v036-danger');
  move.dataset.bmArchiveAction='true';move.title='Mover o PDF para a pasta Excluídos no Google Drive, sem apagar o arquivo';actions.append(move);
  if(off)actions.append(button('Mostrar localmente',()=>{if(exclude('PDF',p.id,false))pdfRender()},'v036-soft'));
 }else actions.append(button(off?'Restaurar':'Ocultar localmente',()=>{if(exclude('PDF',p.id,!off))pdfRender()},off?'v036-soft':'v036-danger'));
 if(p._driveDynamic&&p.filename){
  const original=node('details','v420-pdf-origin');
  original.append(node('summary','','Arquivo original'),node('small','v271-pdf-origin',p.filename));
  original.title='Caminho no Drive: '+(p.drivePath||p.section||'não informado');
  a.append(meta,title,actions,original);
 }else a.append(meta,title,actions);
 return a;
}
function matched(p,filter,search){
 const group=lookup.get(p.id);if(!group)return false;
 const area=areas.get(group.area);
 if(filter.startsWith('area:')&&group.area!==filter.slice(5))return false;
 if(filter.startsWith('group:')&&group.id!==filter.slice(6))return false;
 const text=normalize([prettyPdfTitle(p),p.title,p.id,p.section,p.category,p.drivePath,p.filename,group.label,group.subtitle,area?.label].join(' '));
 return !search||text.includes(search);
}
function render(){
 const root=byId('pdfRows');if(!root)return;
 const search=normalize(byId('pdfSearch').value).trim(),f=byId('pdfFilter').value;
 const off=hidden('PDF'),show=byId('pdfHidden').checked;
 const selected=docs.filter(p=>(show||!off.has(p.id))&&matched(p,f,search));
 root.replaceChildren();
 const visibleGroups=new Set(selected.map(p=>lookup.get(p.id)?.id));
 const compact=search.length>0||f!=='all';
 // Atualizar contagens mesmo quando o Drive retorna zero PDFs confirmados.
 const archived=docs.filter(p=>p._driveArchive).length,excludedCount=docs.filter(p=>off.has(p.id)).length;
 byId('pdfCount').textContent=selected.length+' de '+docs.length+' PDFs listados · '+visibleGroups.size+
   ' grupos · '+archived+' históricos · '+excludedCount+' ocultos localmente';
 const tabs=byId('pdfAreaNavV036');
 if(tabs){for(const b of tabs.querySelectorAll('button')){
  const id=b.textContent==='Todos'?'all':'area:'+(data.areas.find(x=>x.label===b.textContent)?.id||'');
  b.classList.toggle('selected',f===id);
 }}
 if(!selected.length){
  root.append(node('p','v036-empty','Nenhum PDF localizado. Altere o filtro ou o termo pesquisado; se a consulta ao Drive foi concluída, confira a mensagem de sincronização.'));
  return;
 }
 let openedAny=false;
 for(const area of data.areas){
  const areaDocs=selected.filter(p=>lookup.get(p.id).area===area.id);
  if(!areaDocs.length)continue;
  const block=node('div','v036-pdf-area');
  const head=node('div','v036-area-head');
  head.append(node('h3','',area.label),node('span','v036-count',areaDocs.length+' documentos'));
  block.append(head,node('p','v036-area-desc',area.description));
  const groupList=data.groups.filter(g=>g.area===area.id).sort((a,b)=>a.order-b.order);
  for(const group of groupList){
   const items=areaDocs.filter(p=>lookup.get(p.id).id===group.id);
   if(!items.length)continue;
   const detail=node('details','v036-pdf-group');
   detail.open=compact||selected.length<=200||!openedAny;
   openedAny=true;
   const summary=node('summary','v036-pdf-summary');
   const left=node('span','v036-pdf-heading');
   left.append(node('strong','',group.label),node('small','',group.subtitle));
   summary.append(left,node('span','v036-count',items.length+' PDF'+(items.length>1?'s':'')));
   detail.append(summary);
   const grid=node('div','v036-pdf-grid');
   detail.append(grid);
   const more=button('Mostrar mais documentos',()=>appendNext(),'v036-pdf-more');
   more.style.cssText='min-height:40px;padding:7px 12px;margin:8px 0;border:1px solid #b2d1c9;border-radius:7px;background:#eff7f4;color:#1a6059';
   detail.append(more);
   let shown=0;
   function appendNext(){
    const end=Math.min(shown+(selected.length<=200?items.length:24),items.length);
    const fragment=document.createDocumentFragment();
    for(let i=shown;i<end;i++)fragment.append(pdfCard(items[i],off.has(items[i].id)));
    grid.append(fragment);
    shown=end;
    more.hidden=shown>=items.length;
    if(!more.hidden)more.textContent='Mostrar mais ('+shown+' de '+items.length+' exibidos)';
   }
   const ensureVisible=()=>{if(detail.open&&shown===0)appendNext()};
   detail.addEventListener('toggle',ensureVisible);
   if(detail.open)ensureVisible();
   block.append(detail);
  }
  root.append(block);
 }
}
const oldPdfRender=pdfRender;
pdfRender=function(){
 if(!accessGate())return;
 // O catálogo histórico V149 (78 IDs) e a lista VERIFICADA do Drive V217 são
 // estados distintos. A lista verificada pode legitimamente conter um subconjunto.
 // Não bloquear a biblioteca por faltarem IDs históricos não localizados.
 const verified=['true','cached'].includes(document.documentElement.dataset.bm217PdfVerified);
 ready().then(()=>{
  if(!verified&&docs.length>0&&
     data.assigned.filter(a=>!/^DRIVE-PDF-/.test(a.id))
       .some(a=>!docs.some(p=>p.id===a.id)))
   throw Error('Catálogo histórico de PDFs incompleto antes da verificação do Drive');
  updateFilters();render();
 }).catch(e=>{
  console.warn('Grupos PDF V259:',e);
  // Se os grupos estiverem indisponíveis, mostrar os registros presentes,
  // sem certificar o Drive nem apagar referências ou dados.
  oldPdfRender();
 });
};
byId('pdfSearch').placeholder='Pesquisar título, norma, assunto ou código';
byId('pdfSearch').oninput=()=>pdfRender();
byId('pdfFilter').onchange=()=>pdfRender();
byId('pdfHidden').onchange=()=>pdfRender();
window.BancoMestrePDFGruposV036={
 ready,render,getGroup:id=>lookup?.get(id),
 registerExternal(records){
  if(!data||!lookup||!groups)throw Error('Índice de PDFs não iniciado');
  for(const rec of records){
   if(!rec||!/^DRIVE-PDF-[A-Za-z0-9_-]{15,}$/.test(rec.id))throw Error('ID de PDF externo inválido');
   const group=groups.get(rec.group);
   if(!group)throw Error('Grupo desconhecido: '+rec.group);
   if(!lookup.has(rec.id)){lookup.set(rec.id,group);data.assigned.push({id:rec.id,group:rec.group,confidence:'Metadados do Drive autenticado'});}
  }
 }
};
if(docs.length)pdfRender();
function updateGate(){if(typeof pdfRender==='function')pdfRender()}
document.addEventListener('bm-media-drive-authorized',updateGate);
document.addEventListener('bm269-pdf-verification-finished',updateGate);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateGate()});
window.addEventListener('focus',updateGate);
window.addEventListener('pageshow',updateGate);
setInterval(()=>{
 if(document.visibilityState==='visible' &&
  document.documentElement.dataset.bm269PdfAuth==='authorized' && !driveValid())updateGate();
},30000);
window.BM269PdfGate=Object.freeze({get access(){return accessGate()},refresh:updateGate});

/* PDFs locais: usar sempre a mesma cópia no IndexedDB, sem publicar no repositório. */
const LOCAL_KEY='BM_PDFS_GUIAS_LOCAIS_V037';
function listLocal(){try{const x=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function saveLocal(arr){localStorage.setItem(LOCAL_KEY,JSON.stringify(arr))}
function buildLocal(){
 const panel=byId('v037LocalGuides');if(!panel)return;
 const list=panel.querySelector('.v037-local-list');list.replaceChildren();
 for(const doc of listLocal()){
  const art=node('article','v037-local-card');
  art.append(node('strong','',doc.title),node('small','',doc.filename+' · cópia guardada neste navegador'));
  art.append(button('Continuar marcações',()=>window.BancoMestrePDFV037.openAndEdit(doc),'v036-primary'));
  list.append(art);
 }
 if(!list.children.length)list.append(node('p','v036-muted','Nenhum PDF-guia próprio importado neste navegador.'));
}
function addLocalFile(file){
 if(!file||(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf')){alert('Selecione um documento PDF.');return}
 if(file.size>120000000){alert('Este editor aceita PDFs de até 120 MB.');return}
 const title=file.name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ');
 const slug=file.name.toLowerCase().replace(/[^a-z0-9.-]+/g,'_').slice(0,80);
 const id='LOCAL-'+slug;
 const docs=listLocal(),existing=docs.find(x=>x.id===id);
 if(existing&&!confirm('Esta lei já possui um guia neste navegador. Reimportar a fonte pode deslocar marcações se a paginação mudou. Confirma que é o MESMO PDF original?'))return;
 const record={id,title,filename:file.name,file_id:'',url:''};
 if(!existing){docs.push(record);saveLocal(docs)}
 buildLocal();window.BancoMestrePDFV037.openLocalFile(record,file);
}
function initLocal(){
 const target=byId('pdfAreaNavV036');if(!target||byId('v037LocalGuides'))return;
 const panel=node('div','v037-local-panel');panel.id='v037LocalGuides';
 const h=node('h3','', 'Leis complementares fora do catálogo');
 const help=node('p','v036-muted','Importe uma vez o PDF original da lei. A posição dos dispositivos e suas marcações serão preservadas neste navegador. Exporte o PDF anotado para backup.');
 const input=node('input');input.type='file';input.accept='.pdf,application/pdf';input.hidden=true;
 input.onchange=e=>{const f=e.target.files?.[0];e.target.value='';if(f)addLocalFile(f)};
 panel.append(h,help,button('Adicionar lei não catalogada',()=>input.click(),'v036-primary'),input,node('div','v037-local-list'));
 target.before(panel);buildLocal();
}
initLocal();
})();


;
/* 9 assets/v171_assuntos_navegacao.js */
/* V171: PDFs adicionais somente após abertura explícita dos materiais do assunto. */

/* Banco Mestre V037 — trilha de disciplinas, assuntos, subassuntos e cartões.
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

function metaLabel(t){
 const raw=(meta?.groups||[]).find(g=>g.id===t.group)?.title||t.label||t.group;
 return raw.replace(/^(Engenharia Civil|Português|Matemática)\s*[—-]\s*/i,'');
}
function presentTopic(t){
 const info=detail(t),count=topicRows.filter(x=>norm(x.subject)===norm(t.subject)).length;
 const first=[...(info?.subtopics?.keys()||[])].find(x=>x&&!/^(Fundamentos|Outros|Conceitos)$/i.test(x));
 if(/^(Outros|Geral|Conceitos gerais|Diversos|Fundamentos)$/i.test(t.subject))return t.subject+' — '+(first||metaLabel(t));
 return count>1?t.subject+' — '+metaLabel(t):t.subject;
}
function topicTile(t){
 const box=btn('',()=>window.BancoMestreV034.openTopic(t),'v036-topic-tile');
 const info=detail(t);
 const top=n('div','v036-topic-label',metaLabel(t));
 const title=n('strong','v036-topic-name',presentTopic(t));
 const subs=[...(info?.subtopics.keys()||[])].filter(x=>x&&!/^(Fundamentos|Outros)$/i.test(x)).slice(0,2);
 const first=(info?.terms||[]).find(x=>String(x).trim().endsWith('?'))||'';
 const desc=[subs.join(' · '),first?('Ex.: '+first.slice(0,105)):''].filter(Boolean).join(' | ');
 const description=n('p','v036-topic-examples',desc|| (t.imgCount?'Imagens técnicas disponíveis':'Cartões e explicações para consulta'));
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
 if($('cardSearch').value.trim().match(/^(?:CARD-\d{4}|IJUI-[\w-]+)$/i)){if($('cardTopicFilter'))$('cardTopicFilter').value='all'}
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
  const chosen=articles.find(a=>lookup.get(a.querySelector(':scope > .tag')?.textContent?.trim())?.subject===block.topic);
  const representative=chosen?lookup.get(chosen.querySelector(':scope > .tag')?.textContent?.trim()):null;
  const group=(meta?.groups||[]).find(g=>g.id===representative?.group)?.title||block.discipline;
  title.append(n('strong','',block.topic),n('small','',group.replace(/^(Engenharia Civil|Português|Matemática)\s*[—-]\s*/i,'')));
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
 // A tela do assunto é de LEITURA identificável, sem painéis genéricos ou macetes fora dos cartões.
 for(const id of ['topicOverview','topicMacetes','topicRelated']){
  const block=$(id);if(block){block.hidden=true;block.replaceChildren()}
 }
 const heading=$('topicHeading');if(heading)heading.textContent=presentTopic(t);
 const caption=$('topicGroupCaption');if(caption)caption.textContent=t.area+' › '+metaLabel(t)+' › '+t.subject;
 const guideRoot=$('topicStudyBlocks');
 if(guideRoot){
  const byCard=new Map(cards.map(c=>[c.id,c]));
  for(const item of guideRoot.querySelectorAll('.v034Concept')){
   const strong=item.querySelector('strong');if(!strong)continue;
   const id=strong.textContent.match(/(?:CARD-\d{4}|PROP-IJUI-\d+)/)?.[0];
   const c=id?byCard.get(id):null;
   if(c){strong.textContent=id+' — '+c.front;strong.title='Enunciado original, ID estável';}
  }
 }
 const start=$('topicGoCards');
 if(start)start.onclick=()=>{
  focusGroup=t.group;$('cardSearch').value='';$('cardFilter').value='all';
  subjectFilterOptions();$('cardTopicFilter').value=t.subject;
  cardLimit=24;section('cartoes');cardRender();
 };
 // Leitura opcional da mesma disciplina: vínculo editorial, não prova de cobertura.
 const media=$('topicMedia');
 if(media&&media.classList.contains('bm171-media-open')&&docs.length){
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


;
/* 10 assets/v038_discursivas.js */
/* Banco Mestre V038 — resposta discursiva, lacunas e resposta-guia para todos os cartões.
   Registro local voluntário; não inventar correção por IA nem eventos SRS. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const STORE='BM_V037_CARTAO_GUIA_'; // manter armazenamento anterior.
let universal=null;
const universalPromise=fetch('assets/guias_universais_v038.json',{cache:'force-cache'}).then(async r=>{
 if(!r.ok)throw Error('Índice universal de cartões indisponível');
 const json=await r.json();
 if(json.format!=='BancoMestreGuiasUniversaisV038'||json.counts.records<1516)throw Error('Índice universal incompleto');
 universal=json;return json;
}).catch(e=>{console.warn('Guia universal não carregado:',e);return null});
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function val(id){try{return JSON.parse(localStorage.getItem(STORE+id)||'null')||{id,answer:'',gaps:'',guide:'',notes:'',updated:null,history:[]}}catch{return{id,answer:'',gaps:'',guide:'',notes:'',history:[]}}}
function keep(id,record){record.updated=new Date().toISOString();try{localStorage.setItem(STORE+id,JSON.stringify(record));return true}catch(e){alert('Não foi possível salvar localmente. Exporte seu registro antes de sair: '+e.message);return false}}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e}
function button(name,fn,cls){const b=el('button',cls,name);b.type='button';b.onclick=fn;return b}
function guideSource(c){
 const g=c.origin_question_id?guideData?.questoes?.[c.origin_question_id]:null;
 const rec=answersF17?.por_id?.[c.id];
 const u=universal?.cards?.[c.id];
 const legal=c.provisional||c.group==='LEGISLACAO'||/legisla/i.test(c.discipline||'');
 return {
  g,rec,legal,u,
  minimum:g?.resposta_minima||c.back||'Verso original não cadastrado.',
  developed:g?.resposta_modelo||u?.developed_answer||'Não foi localizada uma resposta-guia aprofundada e auditada para este cartão. A explicação histórica é mantida abaixo, mas ainda não equivale a um guia completo.',
  source:g?.dispositivo||c.reference||u?.reference||'Fundamento específico ainda não auditado para este cartão.',
  pdf:g?.fonte||'Vínculo exato do PDF original e página ainda não confirmado.',
  risks:g?.pegadinhas||c.expl||'Condições, exceções, aplicação prática e comparações exigem auditoria individual.',
  gaps:g?.lacunas?.map(x=>x.id+' — '+x.fixar).join('\n')||rec?.lacunas_em_relacao_ao_enunciado||'Lacunas pessoais ainda não avaliadas. A ausência de registro não é evidência de domínio.',
  cross:g?.vinculos_cartoes?.map(x=>x.cartao+' — '+x.tema+' ('+x.tratamento+')').join('\n')||rec?.cobertura_cruzada_ids_informados||'Cobertura cruzada ainda não demonstrada.',
  rubric:(u?.criteria||[]).join('\n• '),
  quality:u?.review_status||'CARTÃO FUTURO — GUIA NÃO AUDITADO',
  historical:u?.historical_explanation||c.expl||''
 };
}
function para(root,title,value){
 if(value===undefined||value===null||value==='')return;
 const section=el('section','v037-guide-piece');
 section.append(el('h4','',title),el('p','',value));root.append(section);
}
function copyText(t,feedback){
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(t).then(()=>feedback('Conteúdo copiado. Cole no ChatGPT para correção discursiva completa.')).catch(()=>fallback())}
 else fallback();
 function fallback(){const ta=el('textarea');ta.value=t;document.body.append(ta);ta.select();try{document.execCommand('copy');feedback('Conteúdo copiado.')}catch{feedback('Cópia automática indisponível; selecione o texto.')}ta.remove()}
}
function makeWorkspace(article,c){
 if(article.querySelector('.v037-train'))return;
 let ref=guideSource(c);const memory=val(c.id);
 const answer=article.querySelector(':scope > details');
 if(!answer)return;
 // A pergunta continua visível. O verso permanece oculto até a tentativa ou abertura explícita.
 answer.hidden=true;
 const panel=el('div','v037-train');
 panel.append(el('h4','v037-train-title','Resposta discursiva · '+c.id));
 const intro=el('p','v037-help',ref.legal?
  'Lei seca: responda antes de consultar o texto. Na correção, diferencie sua redação da literalidade legal verificada.':
  'Responda livremente, sem consultar o verso. A comparação distingue mínimo necessário, aprofundamento e lacunas.');
 panel.append(intro);
 const textarea=el('textarea','v037-answer');textarea.rows=4;textarea.placeholder='Escreva aqui sua resposta antes de revelar o cartão...';textarea.value=memory.answer||'';
 panel.append(textarea);
 const actions=el('div','v037-actions'),status=el('small','v037-message',memory.updated?'Último registro local: '+new Date(memory.updated).toLocaleString('pt-BR'):'Sem tentativa registrada neste navegador');
 function msg(s){status.textContent=s}
 const unlock=async()=>{
  await universalPromise;
  ref=guideSource(c);
  answer.hidden=false;answer.open=true;
  if(!answer.querySelector('.v037-guide')){
   const root=el('div','v037-guide');
   root.append(el('h3','','Correção metodológica do cartão'));
   para(root,'1 · Resposta mínima necessária (verso canônico)',ref.minimum);
   para(root,'2 · Resposta-guia aprofundada',memory.guide||ref.developed);
   para(root,'Critérios para conferir, não lacunas pessoais comprovadas',ref.rubric?'• '+ref.rubric:'Compare todos os elementos do verso original.');
   para(root,'Situação da elaboração didática',ref.quality);
   if(ref.historical)para(root,'Explicação histórica do Banco Mestre — preservada',ref.historical);
   para(root,'3 · Fundamento e literalidade',ref.source+(ref.legal?'\nVerifique o texto vigente, artigo, parágrafos, incisos, exceções e versão oficial. Não atribuir literalidade à paráfrase histórica.':''));
   para(root,'4 · PDF original e página',ref.pdf);
   para(root,'5 · Lacunas documentadas',ref.gaps);
   para(root,'6 · Condições, distinções e pegadinhas',ref.risks);
   para(root,'7 · Cobertura cruzada',ref.cross);
   if(c.mnemonic)para(root,'8 · Macete exclusivamente deste cartão',c.mnemonic);
   const edit=el('div','v037-edit');
   edit.append(el('h4','','Registro evolutivo da sua correção'));
   const gap=el('textarea');gap.rows=3;gap.placeholder='Lacunas que você realmente demonstrou na resposta';gap.value=memory.gaps||'';
   const guide=el('textarea');guide.rows=5;guide.placeholder='Cole ou escreva a resposta-guia completa após a correção';guide.value=memory.guide||'';
   const note=el('textarea');note.rows=3;note.placeholder='Exceções, comparações, exemplos, dúvidas e fundamentação';note.value=memory.notes||'';
   for(const [label,field] of [['Lacunas pessoais',gap],['Resposta-guia desenvolvida',guide],['Aprofundamento complementar',note]]){edit.append(el('label','v037-field-label',label),field)}
   edit.append(button('Salvar guia e lacunas',()=>{
    const r=val(c.id);r.gaps=gap.value;r.guide=guide.value;r.notes=note.value;keep(c.id,r);msg('Guia e lacunas salvos somente neste navegador; a base canônica não foi alterada.');
    const developed=root.querySelectorAll('.v037-guide-piece')[1]?.querySelector('p');if(developed)developed.textContent=r.guide||ref.developed;
   },'v037-primary'));
   root.append(edit);answer.append(root);
  }
 };
 actions.append(button('Registrar minha resposta e comparar',()=>{
  if(!textarea.value.trim()){msg('Escreva sua resposta antes de comparar ou use o botão de consulta sem tentativa.');textarea.focus();return}
  const r=val(c.id);r.answer=textarea.value;r.history=r.history||[];r.history.push({answer:textarea.value,at:new Date().toISOString(),type:'resposta_discursiva_nao_avaliada'});
  if(r.history.length>25)r.history=r.history.slice(-25);
  keep(c.id,r);memory.answer=r.answer;unlock();msg('Tentativa registrada localmente, SEM avaliação automática e SEM lançamento no SRS.');
 },'v037-primary'));
 actions.append(button('Consultar sem registrar tentativa',()=>{unlock();msg('Consulta liberada sem registrar avaliação, acerto ou evento SRS.')})); 
 actions.append(button('Copiar pedido de correção',()=>{
  const r=val(c.id),body=textarea.value||r.answer;
  if(!body.trim()){msg('Escreva primeiro sua resposta para solicitar avaliação.');return}
  const prompt='Corrija esta resposta discursiva conforme minha Metodologia Mestre do Banco Mestre. Não cadastre SRS sem minha avaliação. Diferencie núcleo mínimo, gabarito original literal, resposta-guia aprofundada, fundamento legal/normativo vigente quando comprovado, lacunas efetivamente demonstradas, condições e exceções, pegadinhas, macete, escrita e cobertura cruzada. Não crie novo cartão sem aprovação.\n\nCartão: '+c.id+'\nDisciplina: '+c.discipline+'\nAssunto: '+c.subject+'\nPergunta original: '+c.front+'\nMinha resposta: '+body+'\nVerso original para correção pós-tentativa: '+c.back+'\nExplicação histórica: '+(c.expl||'')+'\nReferência existente: '+ref.source;
  copyText(prompt,msg);
 }));
 panel.append(actions,status);
 answer.before(panel);
 // Se já havia resposta salva, permitir retorno sem transformar o registro em novo evento.
 if(memory.answer){const back=button('Reabrir a correção registrada',()=>{unlock();msg('Correção anterior aberta. Nenhum novo evento foi criado.');});panel.append(back)}
}
function update(){
 const lookup=new Map(cards.map(c=>[c.id,c]));
 for(const article of document.querySelectorAll('#cardRows article.card')){
  const id=article.querySelector(':scope > .tag')?.textContent?.trim();
  if(!id)continue;const c=lookup.get(id);if(c)makeWorkspace(article,c);
 }
}
const previous=cardRender;
cardRender=function(){previous();update()};
function backup(){
 const records=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(STORE)){try{records.push(JSON.parse(localStorage.getItem(k)))}catch(e){}}}
 const data={format:'BancoMestreRespostasDiscursivasV037',exportedAt:new Date().toISOString(),cards:records};
 const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=el('a');a.href=u;a.download='Banco_Mestre_Respostas_Discursivas_Local_'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
}
const bar=document.querySelector('#cartoes .controls');
if(bar){const b=button('Exportar respostas e guias locais',backup);b.title='Backup das anotações discursivas deste navegador, sem modificar Banco Mestre';bar.append(b)}
window.BancoMestreDiscursivasV037={backup,guideSource};
window.BancoMestreDiscursivasV038={backup,guideSource,get sourceCount(){return universal?.counts?.records||0},get documentedGuides(){return universal?.counts?.documented_guides||0}};
if(cards.length)cardRender();
})();

;
/* 11 assets/v263_media_core.js */
/* Banco Mestre V182 — verificador central de versões de mídia do Drive.
 * Guarda apenas token OAuth temporário em memória e metadados locais mínimos.
 * Não altera PDFs/imagens do Drive nem transfere marcações entre revisões. */
(function(){
'use strict';
if(window.BancoMestreMediaSyncV182)return;
const API='https://www.googleapis.com/drive/v3/files/';
const ID=/^[A-Za-z0-9_-]{15,}$/;
const TTL=45000,MAX_SCAN=90;
let access='',expires=0,queued=false,running=null,lastReport=null;
const pending=new Map();
const checked=new Map();
const $=id=>document.getElementById(id);
function token(){return access&&Date.now()<expires?access:''}
function publishToken(t,seconds){
 if(typeof t!=='string'||t.length<10)return false;
 access=t;expires=Date.now()+Math.max(10,Number(seconds||3600)-90)*1000;
 document.dispatchEvent(new CustomEvent('bm-media-drive-authorized'));
 if(queued){queued=false;void syncAll();}
 else{void refreshVisibleImages(false);}
 return true;
}
function status(s,error=false){
 for(const id of ['bm182-status-pdf','bm182-status-img']){
  const el=$(id);if(el){el.textContent=s;el.style.color=error?'#9b4238':'#436469'}
 }
}
async function metadata(fileId,force=false){
 if(!ID.test(String(fileId||'')))throw Error('ID de arquivo inválido');
 const auth=token();if(!auth)throw Error('Conecte o Google Drive');
 const cached=checked.get(fileId);
 if(!force&&cached)return cached.value; // V326: cache por sessão, consulta nova só no botão manual
 if(pending.has(fileId))return pending.get(fileId);
 const job=(async()=>{
  const fields='id,mimeType,name,size,version,modifiedTime,md5Checksum,trashed';
  const response=await fetch(API+encodeURIComponent(fileId)+'?fields='+fields+'&supportsAllDrives=true',{
   headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(response.status===401){access='';expires=0;throw Error('Autorização Google expirada')}
  if(response.status===403||response.status===404)throw Error('Arquivo inacessível nesta conta');
  if(!response.ok)throw Error('Google Drive HTTP '+response.status);
  const m=await response.json();
  if(m.id!==fileId||m.trashed===true)throw Error('Arquivo removido ou ID divergente');
  const out={id:fileId,mimeType:String(m.mimeType||''),size:String(m.size||''),version:String(m.version||''),
    modifiedTime:String(m.modifiedTime||''),md5Checksum:String(m.md5Checksum||'')};
  checked.set(fileId,{value:out,expires:Date.now()+TTL});
  return out;
 })().finally(()=>pending.delete(fileId));
 pending.set(fileId,job);return job;
}
function same(a,b){return !!a&&!!b&&a.id===b.id&&a.mimeType===b.mimeType&&a.size===b.size&&
 a.version===b.version&&a.modifiedTime===b.modifiedTime&&a.md5Checksum===b.md5Checksum}
function fileIdFromUrl(value){
 try{
  const u=new URL(value,location.href);
  if(u.hostname==='drive.google.com'&&(u.pathname==='/thumbnail'||u.pathname==='/uc'))return u.searchParams.get('id');
  if(u.hostname==='drive.google.com'){const m=u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{15,})\//);if(m)return m[1];}
  if(u.hostname==='lh3.googleusercontent.com'){const m=u.pathname.match(/^\/d\/([A-Za-z0-9_-]{15,})(?:\/|$)/);if(m)return m[1]}
 }catch(_){}
 return null;
}
function taggedUrl(value,revision){
 try{
  const u=new URL(value,location.href);
  if(!['drive.google.com','lh3.googleusercontent.com'].includes(u.hostname))return null;
  if(!/^https:$/.test(u.protocol))return null;
  if(u.searchParams.get('bmv')===revision)return null;
  u.searchParams.set('bmv',revision);
  return u.href;
 }catch(_){return null}
}
function revision(m){
 return (m.md5Checksum||m.version||m.modifiedTime||m.size).replace(/[^A-Za-z0-9_.:-]/g,'').slice(0,70);
}
function imageCandidates(force=false){
 const host=document.getElementById('imagens');
 if(!host)return [];
 const found=[],seen=new Set();
 for(const img of host.querySelectorAll('img[src]')){
  if(!img.isConnected||!img.getClientRects().length||img.src.startsWith('blob:'))continue;
  if(!force){const rect=img.getBoundingClientRect(),h=window.innerHeight||800;
   if(rect.bottom < -h||rect.top > h*2)continue; }
  const id=img.dataset.bmMediaId||fileIdFromUrl(img.src);
  if(!id||!ID.test(id)||seen.has(img))continue;
  seen.add(img);found.push({img,id});
  if(found.length>=MAX_SCAN)break;
 }
 return found;
}
async function refreshVisibleImages(force=false){
 if(!token())return {checked:0,updated:0,unavailable:0};
 const list=imageCandidates(force);let pos=0,done=0,updated=0,unavailable=0;
 const worker=async()=>{while(pos<list.length){
  const item=list[pos++],img=item.img;
  try{
   const m=await metadata(item.id,force);
   if(!m.mimeType.startsWith('image/')){unavailable++;continue}
   const rev=revision(m);
   if(!rev)continue;
   const next=taggedUrl(img.src,rev);
   if(next&&img.isConnected){img.dataset.bmMediaId=item.id;img.src=next;updated++}
   done++;
  }catch(_){unavailable++}
 }};
 await Promise.all(Array.from({length:Math.min(4,list.length)},worker));
 return {checked:done,updated,unavailable,limited:list.length===MAX_SCAN};
}
async function syncAll(){
 if(running)return running;
 if(!token()){
  queued=true;status('Conecte o Google Drive para verificar PDFs e imagens.');
  const rd=window.BancoMestreDriveV042;
  if(rd?.ready&&typeof rd.authorize==='function')rd.authorize();
  else{queued=false;status('Conexão Google ainda não pronta. Use Conectar Drive no leitor de PDFs.',true)}
  return null;
 }
 running=(async()=>{status('Conferindo os PDFs e as miniaturas disponíveis nesta sessão…');
 const results=await Promise.allSettled([
  window.BancoMestrePDFSyncV130?.refresh?.()??Promise.resolve(null),
  window.BancoMestreDriveImagesV182?.refresh?.()??Promise.resolve(null),
  refreshVisibleImages(true)
 ]);
 const pdf=results[0].status==='fulfilled'?results[0].value:null;
 const imgs=results[1].status==='fulfilled'?results[1].value:null;
 const vis=results[2].status==='fulfilled'?results[2].value:null;
 lastReport={pdf,img:imgs,visible:vis,at:new Date().toISOString()};
 const fails=results.filter(x=>x.status==='rejected').length;
 status('Conferência concluída: '+(pdf?.found??'—')+' PDFs localizados; '+(imgs?.found??'—')+
  ' imagens na pasta Atlas; '+(vis?.checked??0)+' miniaturas verificadas.'+
  (fails?' Algumas consultas não concluíram; originais preservados.':''));
 return lastReport;
 })();
 try{return await running}finally{running=null}
}
function addControl(host,id){
 if(!host||$(id))return;
 const bar=document.createElement('div');
 bar.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 0';
 const btn=document.createElement('button');btn.type='button';btn.textContent='Conferir atualizações no Drive';
 btn.onclick=()=>{void syncAll()};
 const txt=document.createElement('span');txt.id=id;txt.style.cssText='font-size:12px;color:#436469';
 txt.textContent='As versões são conferidas ao abrir PDFs; imagens visíveis, após conectar a conta.';
 bar.append(btn,txt);host.prepend(bar);
}
function init(){
 addControl(document.querySelector('#pdfs .panel'),'bm182-status-pdf');
 addControl(document.querySelector('#imagens .panel'),'bm182-status-img');
 const images=document.getElementById('imagens');
 if(images&&typeof MutationObserver!=='undefined'){
  let scheduled=0;
  const queue=()=>{if(!token()||scheduled)return;scheduled=setTimeout(()=>{
   scheduled=0;void refreshVisibleImages(false);
  },500);};
  const observer=new MutationObserver(records=>{
   if(records.some(r=>r.type==='childList'||r.attributeName==='src'||r.attributeName==='hidden'||r.attributeName==='class'))queue();
  });
  observer.observe(images,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class','hidden']});
  window.addEventListener('scroll',queue,{passive:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BancoMestreMediaSyncV182=Object.freeze({token,publishToken,metadata,same,refreshVisibleImages,syncAll,get lastReport(){return lastReport}});
})();


;
/* 12 assets/v215_drive_direct.js */
/* V215: Uma autorização compartilhada por visita, sem Firebase. */
/* V182 — Metadados e cache seguro para todos os PDFs do Google Drive.
 * Mantém ID estável e anotações locais separadas por hash da fonte.
 * V181 — Verificação dinâmica da revisão Drive e cache validado.
 * Sem hash fixo e sem transposição automática de grifos entre versões de PDF.
 * V154 — Correção de rede/CORS no download Drive, com rota alternativa e entrada local segura.
 * Base V048 preservada: sem transferir nem modificar PDFs, grifos, IDs ou autorizações.
 * V048 — Drive PDF direto com OAuth autorizado e reabertura guiada. Nenhum PDF privado é publicado.
 * O GitHub Pages não obtém cookies/bytes de iframes Google Drive por CORS;
 * quando configurado, GIS + Drive API lê os bytes para o PDF.js do navegador.
 */
(function(){
'use strict';
const API='https://www.googleapis.com/drive/v3/files/';
const API_FALLBACK='https://content.googleapis.com/drive/v3/files/';
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const VADE_ID='VADE-SENADO-2026-GUIA';
const MEDIA_CACHE_KEY='BM_MEDIA_PDF_META_V182:';
let token=null,expires=0,client=null,config=null,pending=null,ready=null,busy=false,waitingDoc=null;
// Uma autorização anterior pode ser lembrada, mas o access token expira; nunca gravar tokens.
const CONSENT_KEY='BM_DRIVE_READ_CONSENT_V048';
let consentRemembered=false;
try{consentRemembered=localStorage.getItem(CONSENT_KEY)==='1'}catch(_){}
function rememberConsent(){consentRemembered=true;try{localStorage.setItem(CONSENT_KEY,'1')}catch(_){}}
function hasLocalPDF(doc){try{return localStorage.getItem('BM_PDF_HAS_SOURCE_V037:'+doc.id)==='1'}catch(_){return false}}

const editBar=document.getElementById('pdfChooseLocal')?.parentElement;
const inlineButton=document.createElement('button');
inlineButton.id='driveConnectInPdfV042';inlineButton.type='button';inlineButton.className='primary';
inlineButton.hidden=true;inlineButton.style.display='none';inlineButton.textContent='Conectar Drive e editar esta lei';
inlineButton.title='Autorizar leitura do Drive para abrir a lei diretamente no editor';
if(editBar)editBar.insertBefore(inlineButton,document.getElementById('pdfChooseLocal'));
function showConnect(on){inlineButton.hidden=!on;inlineButton.style.display=on?'':'none';}
// Alternativa explícita, somente após falha; permite escolher uma cópia autorizada no
// computador, mantendo a mesma identidade de PDF e os mesmos grifos no leitor.
const localFallback=document.createElement('button');
localFallback.id='driveLocalFallbackV147';
localFallback.type='button';
localFallback.className='primary';
localFallback.textContent='Abrir cópia local do PDF';
localFallback.hidden=true;localFallback.style.display='none';
localFallback.style.cssText+=';background:#edf5fa;color:#1b5a79;border:1px solid #a8cadb;';
if(editBar)editBar.insertBefore(localFallback,document.getElementById('pdfChooseLocal').nextSibling);
function showFallback(on){localFallback.hidden=!on;localFallback.style.display=on?'':'none';}
localFallback.onclick=()=>{
 // O seletor local mantém o mesmo ID do documento aberto; não faz upload.
 const input=document.getElementById('pdfFileInput');
 if(!input){notify('Seletor de arquivo local indisponível nesta versão.');return;}
 notify('Selecione a cópia PDF deste documento que está no seu computador. Nenhum arquivo será enviado ao site.');
 input.click();
};
const $=id=>document.getElementById(id);
function notify(message){
 const el=$('driveDirectStatusV038');if(el)el.textContent=message;
 const p=$('pdfLocalStatus');if(p)p.textContent=message;
}
async function loadScript(url){
 if(window.google?.accounts?.oauth2)return;
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=url;script.async=true;script.onload=resolve;script.onerror=()=>reject(Error('Biblioteca Google Identity Services indisponível'));
  document.head.append(script);
 });
}
async function prepare(){
 if(ready)return ready;
 ready=(async()=>{
  const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!r.ok)throw Error('Configuração de conexão Google Drive não encontrada');
  config=await r.json();
  if(!config.client_id||!/\.apps\.googleusercontent\.com$/.test(config.client_id))return false;
  await loadScript('https://accounts.google.com/gsi/client');
  if(!window.google?.accounts?.oauth2?.initTokenClient)throw Error('Autorização Google indisponível');
  client=google.accounts.oauth2.initTokenClient({
   client_id:config.client_id,
   scope:SCOPE,
   callback:response=>{
    if(response.error||!response.access_token){
     token=null;expires=0;notify('Acesso Google Drive não autorizado: '+(response.error||'sem token'));return;
    }
    token=response.access_token;
    expires=Date.now()+Math.max(1,Number(response.expires_in||3600)-90)*1000;
    window.BancoMestreMediaSyncV182?.publishToken(token,Number(response.expires_in||3600));
    rememberConsent();
    notify('Drive autorizado nesta sessão. PDFs já abertos ficam guardados neste navegador para acesso posterior sem nova conexão.');
    const b=$('driveConnectV038');if(b)b.textContent='Google Drive conectado';
    if(waitingDoc){const request=waitingDoc;waitingDoc=null;showConnect(false);openAndEdit(request.doc,request.options)}
   },
   error_callback:e=>notify('Falha na autorização do Google Drive: '+(e?.type||'desconhecida'))
  });
  return true;
 })().catch(e=>{ready=null;notify('Conexão Google Drive indisponível: '+e.message);return false});
 return ready;
}
function activeToken(){return window.BancoMestreMediaSyncV182?.token?.()||(token&&expires>Date.now()?token:'');}
function authorize(){
 const shared=activeToken();
 if(shared){
  token=shared;expires=Date.now()+60000;rememberConsent();showConnect(false);
  notify('Google Drive conectado. Imagens e PDFs compartilham esta autorização.');
  if(waitingDoc){const request=waitingDoc;waitingDoc=null;void openAndEdit(request.doc,request.options);}
  return;
 }
 if(!client){notify('Google Drive ainda está inicializando. Tente novamente.');return;}
 // Uma autorização por visita: a API do Google decide se precisa exibir consentimento.
 client.requestAccessToken({prompt:''});
}
const ui=document.createElement('div');ui.id='driveDirectV038';ui.className='v038-drive-direct';
ui.innerHTML='<strong>PDFs do Drive no editor</strong><p>Conecte o Drive uma vez ao abrir o site. Imagens e PDFs compartilham esta autorização; se expirar ou o site for reaberto, conecte novamente.</p><button id="driveConnectV038" type="button">'+(consentRemembered?'Renovar acesso ao Drive':'Conectar Google Drive')+'</button><small id="driveDirectStatusV038" role="status">Verificando conexão…</small>';
const root=$('pdfAreaNavV036');
if(root)root.before(ui);
const button=$('driveConnectV038');if(button){button.onclick=authorize;button.disabled=true}
inlineButton.onclick=authorize;inlineButton.disabled=true;
// Na V042, "Editar PDF" deve usar o Drive, não abrir o seletor/baixar o original.
// O seletor local continua disponível para PDFs importados sem file_id.
const mainEdit=$('pdfChooseLocal'),localEdit=mainEdit?.onclick;
if(mainEdit){
 mainEdit.onclick=()=>{
  const doc=window.BancoMestrePDFV042?.currentDoc;
  if(doc?.file_id){
   if(window.BancoMestrePDFV042?.editing){
    notify('O PDF já está aberto para grifar nesta janela.');
    return;
   }
   if(hasLocalPDF(doc)){
    void openAndEdit(doc);
    return;
   }
   if(!client){
    waitingDoc=waitingDoc?.doc?.id===doc.id?waitingDoc:{doc,options:{}};
    notify('O Google Drive ainda está inicializando. Aguarde o botão Conectar Drive ficar disponível.');
    showConnect(true);
    return;
   }
   if(!activeToken()){
    waitingDoc=waitingDoc?.doc?.id===doc.id?waitingDoc:{doc,options:{}};
    notify('Autorizando leitura para editar o PDF diretamente neste site, sem download...');
    authorize(); // clique real: preserva gesto do usuário exigido pelo OAuth.
    return;
   }
   openAndEdit(doc);return;
  }
  if(typeof localEdit==='function')localEdit();
 };
}
document.addEventListener('bm-media-drive-authorized',()=>{
 const shared=window.BancoMestreMediaSyncV182?.token?.();
 if(!shared)return;
 token=shared;expires=Date.now()+60000;rememberConsent();
 const connect=$('driveConnectV038');if(connect)connect.textContent='Google Drive conectado';
 showConnect(false);
 notify('Google Drive conectado nesta visita. Imagens e PDFs reutilizam a autorização.');
 if(waitingDoc&&!busy){const request=waitingDoc;waitingDoc=null;void openAndEdit(request.doc,request.options);}
});
prepare().then(ok=>{
 if(!button)return;
 if(ok){button.disabled=false;inlineButton.disabled=false;notify(consentRemembered?'Acesso anterior reconhecido. PDFs armazenados abrem sem nova conexão; para arquivos novos, renove a autorização se necessário.':'Conexão Google pronta. Autorize a leitura para abrir PDFs do Drive.')}
 else{button.disabled=true;notify('Leitura direta dos PDFs privados ainda não está habilitada: falta cadastrar o client ID OAuth do aplicativo no portal. Os PDFs permanecem privados; nenhuma permissão foi alterada.')}
});
async function fetchPDF(doc){
 if(!doc?.file_id||!/^[A-Za-z0-9_-]{15,}$/.test(doc.file_id))
  throw Error('PDF sem ID válido no catálogo');
 const encoded=encodeURIComponent(doc.file_id);
 const hosts=[API,API_FALLBACK];
 let networkFailures=0;
 for(let i=0;i<hosts.length;i++){
  const uri=hosts[i]+encoded+'?alt=media&supportsAllDrives=true';
  let res;
  try{
   res=await fetch(uri,{
    method:'GET',mode:'cors',redirect:'follow',
    headers:{Authorization:'Bearer '+activeToken()},cache:'no-store'
   });
  }catch(e){
   // Erro de transporte: não veio resposta HTTP, portanto não é possível
   // diagnosticar permissão 403, validade do ID ou resposta CORS apenas pelo erro.
   networkFailures++;
   if(i===0)notify('O download pela rota principal falhou antes da resposta HTTP. Tentando a rota alternativa do Google Drive…');
   continue;
  }
  if(res.status===401){
   token=null;expires=0;
   throw Error('HTTP 401: sessão do Google expirada. Clique em Conectar Drive e autorize novamente.');
  }
  if(res.status===403)throw Error('HTTP 403: a conta Google autorizada não pode baixar este PDF ou há restrição de acesso.');
  if(res.status===404)throw Error('HTTP 404: arquivo não encontrado na conta Google autorizada.');
  if((res.status===429||res.status>=500)&&i===0){
   notify('Google Drive respondeu HTTP '+res.status+'. Tentando a rota alternativa…');continue;
  }
  if(!res.ok)throw Error('Download do Google Drive retornou HTTP '+res.status+'.');
  const blob=await res.blob();
  if(!blob.size)throw Error('Drive devolveu um arquivo vazio.');
  // Não confundir página de erro HTML (status 200) com bytes de PDF.
  const head=await blob.slice(0,1024).text();
  if(!head.includes('%PDF-')){
   throw Error('Google Drive retornou conteúdo que não começa como PDF. Abra o original no Drive para conferir o formato.');
  }
  return blob;
 }
 throw Error(networkFailures===hosts.length
  ? 'Falha de rede ao buscar o PDF nas duas rotas do Google Drive. Pode ser bloqueio de rede/CORS, extensão do navegador ou indisponibilidade do serviço. Use “Abrir cópia local do PDF” ou “Abrir no Drive”; seus grifos permanecem preservados.'
  : 'Google Drive indisponível nas duas rotas. Tente novamente ou use uma cópia local autorizada.');
}

/* Cache só é reutilizado após consulta autenticada ao Drive e SHA-256 local.
 * Alterações em número/ordem de páginas nunca deslocam os grifos entre edições. */
async function shaBlob(blob){
 if(!globalThis.crypto?.subtle)return '';
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
 return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
async function storedVerified(doc,expected){
 if(!expected?.sha256||!globalThis.indexedDB||!globalThis.crypto?.subtle)return false;
 let db;
 try{
  const blob=await new Promise((resolve,reject)=>{
   const req=indexedDB.open('BancoMestrePDFLocalV035',1);
   req.onsuccess=()=>{
    db=req.result;if(!db.objectStoreNames.contains('sources')){resolve(null);return;}
    const q=db.transaction('sources','readonly').objectStore('sources').get(doc.id);
    q.onsuccess=()=>resolve(q.result?.blob||null);
    q.onerror=()=>reject(q.error);
   };req.onerror=()=>reject(req.error);
  });
  return !!blob&&String(blob.size)===String(expected.size)&&await shaBlob(blob)===expected.sha256;
 }catch(_){return false}
 finally{try{db?.close()}catch(_){}}
}
async function openAndEdit(doc,options={}){
 if(!doc||busy)return false;
 // Um arquivo com file_id precisa de conferência no Drive antes de reaproveitar o cache.
 const managed=!!doc.file_id;
 if(doc.id===VADE_ID)options={...options,forceDrive:true,expectedSha256:undefined};
 busy=true;showFallback(false);
 try{
  if(!managed&&!options.forceDrive&&await window.BancoMestrePDFV038.openStored(doc)){
   waitingDoc=null;showConnect(false);notify('PDF local restaurado, sem alteração das marcações.');return true;
  }
  // O leitor e os outros catálogos compartilham a mesma autorização OAuth temporária.
  const shared=window.BancoMestreMediaSyncV182?.token?.();
  if(shared&&(!token||expires<=Date.now())){token=shared;expires=Date.now()+60000;}
  if(!client){
   window.BancoMestrePDFV038.openPreview(doc);
   waitingDoc={doc,options};showConnect(true);
   notify('Leitor Google inicializando. Clique em “Conectar Drive e editar esta lei”.');return false;
  }
  if(!activeToken()){
   window.BancoMestrePDFV038.openPreview(doc);
   waitingDoc={doc,options};showConnect(true);
   notify('Autorize a leitura do Drive. Seus PDFs e grifos permanecem privados.');return false;
  }
  const core=window.BancoMestreMediaSyncV182;
  const key=MEDIA_CACHE_KEY+doc.file_id;
  let remote=null;
  if(managed&&core?.metadata){
   try{
    remote=await core.metadata(doc.file_id,true);
    if(remote.mimeType!=='application/pdf'||!(Number(remote.size)>0))
     throw Error('Arquivo do Drive não é um PDF válido');
    let saved=null;try{saved=JSON.parse(localStorage.getItem(key)||'null')}catch(_){}
    if(!options.forceRefresh&&core.same(remote,saved)&&await storedVerified(doc,saved)){
     const opened=await window.BancoMestrePDFV038.openStored(doc);
     if(opened===true){
      waitingDoc=null;showConnect(false);showFallback(false);
      notify('PDF atualizado: cópia local verificada com o Drive; download dispensado. Grifos preservados.');
      return true;
     }
    }
   }catch(error){
    // Sem confirmação, nunca abrir uma cópia antiga alegando que está atual.
    notify('Conferência do PDF não concluída ('+error.message+'). Tentando obter o original no Drive…');
    remote=null;
   }
  }
  notify('Abrindo a versão atual do PDF diretamente do Google Drive…');
  const blob=await fetchPDF(doc);
  if(remote&&String(blob.size)!==remote.size)
   throw Error('O PDF foi alterado durante o download; a cópia local anterior foi preservada.');
  if(options.expectedSha256){
   const sha=await shaBlob(blob);
   if(!sha||sha!==options.expectedSha256)throw Error('SHA-256 do PDF não corresponde à versão requisitada.');
  }
  // A fonte só entra no editor após as checagens; openFromDrive mantém grifos por ID+hash.
  const opened=await window.BancoMestrePDFV038.openFromDrive(doc,blob);
  if(opened!==true)throw Error('Editor não confirmou a abertura do PDF.');
  if(remote&&hasLocalPDF(doc)){
   try{
    const sha256=await shaBlob(blob);
    if(sha256){
     const latest=await core.metadata(doc.file_id,true);
     if(core.same(remote,latest))localStorage.setItem(key,JSON.stringify({...remote,sha256}));
    }
   }catch(e){console.warn('Metadados do PDF não armazenados; será revalidado na próxima abertura:',e);}
  }
  if($('pdfChooseLocal'))$('pdfChooseLocal').textContent='✎ Edição ativa';
  waitingDoc=null;showConnect(false);showFallback(false);
  notify('PDF atual aberto. Grifos e vínculos permanecem separados por hash da edição; nenhum dado anterior foi apagado.');
  return true;
 }catch(e){
  if(!$('pdfDialog')?.open)window.BancoMestrePDFV038.openPreview(doc);
  showFallback(true);
  if(!activeToken())showConnect(true);
  notify('Não foi possível abrir a edição direta: '+e.message);
  return false;
 }finally{busy=false}
}
window.BancoMestreDriveV038={prepare,authorize,openAndEdit,get ready(){return !!client},get connected(){return !!activeToken()},get previouslyAuthorized(){return consentRemembered}};
window.BancoMestreDriveV042={prepare,authorize,openAndEdit,get ready(){return !!client},get connected(){return !!activeToken()},get previouslyAuthorized(){return consentRemembered}};
})();

;
/* 13 assets/v181_vade_current.js */
/* Banco Mestre V181 — Vade Mecum atualizado obtido exclusivamente do Google Drive.
   Este módulo não altera PDF original, cartões, SRS, IDs nem marcações existentes.
   Usa o mesmo ID da V040 para preservar o armazenamento local anterior. */
(function(){
'use strict';
const id='VADE-SENADO-2026-GUIA';
const markPrefix='BM030_STROKES_PDF:'+id+':';
const doc={id,title:'Vade Mecum — Senado Federal, 3ª edição (grifos e negritos)',filename:'Vade_Mecum_Senado_3ed_2026_ATUAL_GRIFOS_NEGRITOS_SEM_COMENTARIOS.pdf',url:'https://drive.google.com/file/d/1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI/view',file_id:'1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI'};
const anchor=document.getElementById('pdfAreaNavV036');
if(!anchor||document.getElementById('bmVade041'))return;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const panel=node('section',undefined,'bm-vade');panel.id='bmVade041';
panel.setAttribute('aria-label','Editor online do Vade Mecum');
const title=node('h3','Vade Mecum — editor online');
const info=node('p','PDF de estudo do Senado no Google Drive, com grifos e negritos sem comentários. Abra para estudar diretamente no Banco Mestre; o Drive solicitará autorização quando necessário. A integridade é verificada e o ID de estudo anterior é mantido para preservar os grifos locais.');
const actions=node('div',undefined,'bm-vade-actions');
const open=node('button','Abrir Vade Mecum (Drive)');open.type='button';
const sync=node('button','Sincronizar Vade do Drive','bm-vade-secondary');sync.type='button';
const view=node('a','Ver arquivo atual no Drive','bm-vade-secondary');view.href=doc.url;view.target='_blank';view.rel='noopener noreferrer';
const backup=node('button','Exportar backup dos grifos','bm-vade-secondary');
const restore=node('button','Importar backup dos grifos','bm-vade-secondary');
const input=node('input');input.type='file';input.accept='.json,application/json';input.hidden=true;input.setAttribute('aria-label','Selecionar backup JSON das marcações do Vade Mecum');
const status=node('p','Fonte: arquivo principal do Google Drive. Ao abrir, o site compara a versão atual e reutiliza o PDF local somente quando corresponde; caso contrário, carrega automaticamente a revisão mais recente. Os grifos locais permanecem armazenados por versão.','bm-vade-status');
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
actions.append(open,sync,view,backup,restore,input);panel.append(title,info,actions,status);anchor.before(panel);
const notify=s=>status.textContent=s;
let busy=false;
// PDF fonte obrigatório: Drive. A versão histórica em GitHub não é consultada.
function readMarks(){
 const items=[];
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key||!key.startsWith(markPrefix))continue;
   const value=JSON.parse(localStorage.getItem(key)||'null');
   if(Array.isArray(value))items.push({key,marks:value});
  }
 }catch(e){throw Error('Falha ao ler anotações locais: '+e.message)}
 return items.sort((a,b)=>a.key.localeCompare(b.key));
}
function makeDownload(blob,name){
 const u=URL.createObjectURL(blob),a=node('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),30000);
}
function exportMarks(){
 let items;
 try{items=readMarks()}catch(e){notify(e.message);return}
 const data={format:'BancoMestreVadeMarcacoesV041',pdf_id:id,exported_at:new Date().toISOString(),items};
 makeDownload(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'Banco_Mestre_Vade_Marcacoes_Backup_'+new Date().toISOString().slice(0,10)+'.json');
 notify('Backup gerado com '+items.length+' página(s) registrada(s). Nenhum dado foi removido.');
}
async function importMarks(file){
 if(!file)return;
 if(file.size>6000000){notify('Backup acima do limite de 6 MB; nenhum dado foi alterado.');return}
 try{
  const data=JSON.parse(await file.text());
  if(data.format!=='BancoMestreVadeMarcacoesV041'||data.pdf_id!==id||!Array.isArray(data.items)||data.items.length>10000)
   throw Error('Arquivo não corresponde ao formato de backup deste Vade Mecum.');
  const valid=/^BM030_STROKES_PDF:VADE-SENADO-2026-GUIA:[^:]{1,120}:P[1-9]\d{0,5}$/;
  const seen=new Set();
  for(const it of data.items){
   if(!it||typeof it.key!=='string'||!valid.test(it.key)||seen.has(it.key)||!Array.isArray(it.marks)||it.marks.length>10000)
    throw Error('Backup possui chaves repetidas ou marcações inválidas.');
   seen.add(it.key);
  }
  let added=0,already=0,conflicts=0;
  for(const it of data.items){
   const old=localStorage.getItem(it.key);
   if(old!==null){if(old===JSON.stringify(it.marks)||JSON.stringify(JSON.parse(old))===JSON.stringify(it.marks))already++;else conflicts++;continue}
   try{localStorage.setItem(it.key,JSON.stringify(it.marks));added++}
   catch{throw Error('Espaço local insuficiente: '+added+' páginas restauradas; exporte backup antes de continuar.')}
  }
  notify('Importação: '+added+' página(s) nova(s); '+already+' já presentes; '+conflicts+' conflito(s) preservado(s) sem sobrescrever. Feche e reabra o PDF para ver as marcações importadas.');
 }catch(e){notify('Importação interrompida: '+e.message)}
}
/* Conferência de versão e cache seguro são responsabilidades do leitor Drive V181. */
async function openLatest(action){
 if(busy)return;
 busy=true;open.disabled=true;sync.disabled=true;
 const beforeOpen=open.textContent,beforeSync=sync.textContent;
 if(action==='sync')sync.textContent='Sincronizando...';else open.textContent='Abrindo do Drive...';
 try{
  const reader=window.BancoMestreDriveV042||window.BancoMestreDriveV038;
  if(!reader?.openAndEdit)throw Error('Conector Google Drive indisponível nesta versão.');
  notify('Buscando o PDF atualizado diretamente do Google Drive; não será usada a cópia do GitHub nem a versão salva no navegador. Autorize o Drive, se solicitado.');
  const opened=await reader.openAndEdit(doc,{forceDrive:true,forceRefresh:false});
  if(opened===true){
   notify('Versão do PDF conferida no Google Drive. Arquivo atual aberto (cache validado ou leitura nova); marcações locais anteriores preservadas por versão.');
  }else{
   notify(reader.connected?'A abertura não foi concluída. Confira o aviso no editor de PDF; nenhum grifo foi apagado.':'Autorização necessária: no editor clique em “Conectar Drive e editar esta lei”. Depois da autorização, o PDF será baixado do Drive sem usar o GitHub.');
  }
 }catch(e){notify('Não foi possível sincronizar o Vade: '+e.message)}
 finally{busy=false;open.disabled=false;sync.disabled=false;open.textContent=beforeOpen;sync.textContent=beforeSync}
}
open.onclick=()=>{void openLatest('open')};
sync.onclick=()=>{void openLatest('sync')};

backup.onclick=exportMarks;
restore.onclick=()=>input.click();
input.onchange=async()=>{const file=input.files?.[0];input.value='';await importMarks(file)};
window.BancoMestreVadeV181={pdf_id:id,source:'google-drive',source_file_id:doc.file_id,readMarks};
})();

;
/* 14 assets/v048_drive_save.js */
/* Banco Mestre V048 — salvar cópia anotada no Google Drive (OAuth drive.file).
   O original NUNCA é destino de escrita. Uma cópia criada por este app pode ser atualizada
   somente depois de verificar ID e appProperties; tokens ficam apenas em memória. */
(function(){
'use strict';
const SCOPE='https://www.googleapis.com/auth/drive.file';
const API='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const STORE_PREFIX='BM042_DRIVE_COPIA_ANOTADA:';
const $=id=>document.getElementById(id);
const toolbar=$('pdfLocalTools')?.querySelector('.pdfGroup:last-of-type');
if(!toolbar||$('pdfSaveDriveV042'))return;
const button=document.createElement('button');
button.id='pdfSaveDriveV042';button.type='button';button.disabled=true;
button.textContent='☁ Salvar cópia no Drive';
button.title='Criar ou atualizar uma cópia anotada no seu Google Drive — nunca modifica o PDF original.';
const box=document.createElement('div');box.className='bm-drive-save-status';
const label=document.createElement('small');label.id='driveSaveStatusV042';label.setAttribute('role','status');label.setAttribute('aria-live','polite');
label.textContent='Preparando autorização de gravação (somente na cópia)...';
const link=document.createElement('a');link.id='driveSaveLinkV042';link.target='_blank';link.rel='noopener noreferrer';link.hidden=true;
link.textContent='Abrir cópia anotada no Google Drive';
box.append(label,link);
toolbar.append(button);$('pdfLocalTools').append(box);
const say=s=>{label.textContent=s};
const keyFor=doc=>STORE_PREFIX+doc.id+':'+doc.hash;
let client=null,writeToken='',expires=0,authPending=null,preparing=null,busy=false,everAuthorized=false;
const WRITE_CONSENT_KEY='BM_DRIVE_WRITE_CONSENT_V048';
try{everAuthorized=localStorage.getItem(WRITE_CONSENT_KEY)==='1'}catch(_){};
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{10,}$/.test(id);
async function prepare(){
 if(preparing)return preparing;
 preparing=(async()=>{
  const cfg=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>{
   if(!r.ok)throw Error('Configuração OAuth indisponível');return r.json();
  });
  if(!cfg.client_id||!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(cfg.client_id))
   throw Error('Client ID OAuth não configurado.');
  if(!window.google?.accounts?.oauth2?.initTokenClient){
   await new Promise((resolve,reject)=>{
    const sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';sc.async=true;
    sc.onload=resolve;sc.onerror=()=>reject(Error('Google Identity Services indisponível.'));
    document.head.append(sc);
   });
  }
  if(!window.google?.accounts?.oauth2?.initTokenClient)throw Error('Google Identity Services não inicializado.');
  client=google.accounts.oauth2.initTokenClient({
   client_id:cfg.client_id,
   scope:SCOPE,
   callback:response=>{
    const current=authPending;authPending=null;
    if(!response?.access_token||response.error){
     if(current)current.reject(Error('Autorização de gravação não concedida ('+(response?.error||'sem token')+').'));
     return;
    }
    if(response.scope&& !response.scope.split(/\s+/).includes(SCOPE)){
     if(current)current.reject(Error('O Google não concedeu a permissão drive.file.'));
     return;
    }
    writeToken=response.access_token;
    expires=Date.now()+Math.max(1,Number(response.expires_in||3600)-90)*1000;
    everAuthorized=true;
    try{localStorage.setItem(WRITE_CONSENT_KEY,'1')}catch(_){}
    if(current)current.resolve(writeToken);
   },
   error_callback:response=>{
    const current=authPending;authPending=null;
    if(current)current.reject(Error('Autorização Google cancelada ou bloqueada ('+(response?.type||'desconhecida')+').'));
   }
  });
  button.disabled=false;
  say(everAuthorized?'Pronto. A autorização anterior será reutilizada quando possível; o Google pode solicitar renovação.':'Pronto. Autorize a gravação quando salvar a primeira cópia.');
  return true;
 })().catch(err=>{button.disabled=true;say('Gravação indisponível: '+err.message);return false});
 return preparing;
}
function requestToken(){
 if(writeToken&&expires>Date.now())return Promise.resolve(writeToken);
 if(!client)throw Error('Permissão de gravação ainda não está pronta.');
 if(authPending)throw Error('Há uma autorização Google em andamento.');
 // OAuth é solicitado no clique, antes de qualquer operação demorada de exportação.
 return new Promise((resolve,reject)=>{
  authPending={resolve,reject};
  try{client.requestAccessToken({prompt:everAuthorized?'':'consent'})}
  catch(e){authPending=null;reject(Error('Não foi possível abrir autorização Google: '+e.message))}
 });
}
function safeMessage(response,msg){
 if(response.status===401)return Error('Sessão Google expirada. Tente salvar novamente e autorize a conta.');
 if(response.status===403)return Error('Sua conta não autorizou criação/edição de arquivos (drive.file), ou não possui espaço/permissão.');
 if(response.status===404)return Error('Cópia anotada não encontrada no Google Drive.');
 return Error(msg+' (HTTP '+response.status+').');
}
async function metadata(fileId,token){
 if(!validId(fileId))throw Error('ID da cópia anotada inválido.');
 const url=API+'/'+encodeURIComponent(fileId)+'?fields=id,name,mimeType,appProperties,webViewLink,trashed';
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
 if(!response.ok)throw safeMessage(response,'Não foi possível verificar o destino');
 const data=await response.json();
 if(data.id!==fileId)throw Error('A API retornou outro identificador de arquivo.');
 return data;
}
function mapping(doc){
 try{
  const item=JSON.parse(localStorage.getItem(keyFor(doc))||'null');
  if(item&&validId(item.id)&&item.source_id===doc.id&&item.source_hash===doc.hash)return item;
 }catch{}
 return null;
}
function saveMapping(doc,result){
 try{
  localStorage.setItem(keyFor(doc),JSON.stringify({
   id:result.id,name:result.name,source_id:doc.id,source_hash:doc.hash,
   updated_at:new Date().toISOString()
  }));
 }catch{say('Cópia criada no Drive; mapeamento local não pôde ser salvo. Guarde o link.')}
}
async function checkOwnedCopy(item,doc,token){
 if(item.id===doc.file_id)throw Error('Proteção acionada: ID da cópia coincide com o PDF original.');
 const remote=await metadata(item.id,token);
 if(remote.trashed||remote.mimeType!=='application/pdf')throw Error('Destino não é uma cópia PDF válida.');
 const p=remote.appProperties||{};
 if(p.bm_format!=='BancoMestreV042'||p.bm_source_id!==doc.id||p.bm_source_hash!==doc.hash)
  throw Error('A cópia remota não pertence a este documento. Nada foi alterado.');
 return remote;
}
function legalName(name){
 const safe=String(name||'PDF').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').slice(0,180);
 return safe.replace(/(?:_ANOTADO)?\.pdf$/i,'')+'_BANCO_MESTRE_ANOTADO.pdf';
}
function validateSession(url){
 const u=new URL(url);
 if(u.origin!=='https://www.googleapis.com'||!u.pathname.startsWith('/upload/drive/v3/files'))
  throw Error('Sessão de upload rejeitada: endereço não autorizado.');
 return u.href;
}
async function resumable({blob,token,existing,doc,name}){
 if(blob.type!=='application/pdf'||blob.size<100||blob.size>180000000)
  throw Error('Arquivo anotado inválido ou maior que 180 MB.');
 if(existing?.id&&existing.id===doc.file_id)throw Error('Não é permitido modificar o arquivo original.');
 const initUrl=existing?.id
  ?UPLOAD+'/'+encodeURIComponent(existing.id)+'?uploadType=resumable&fields=id,name,mimeType,webViewLink,appProperties'
  :UPLOAD+'?uploadType=resumable&fields=id,name,mimeType,webViewLink,appProperties';
 const props={bm_format:'BancoMestreV042',bm_source_id:doc.id,bm_source_hash:doc.hash};
 if(doc.file_id)props.bm_source_drive_id=doc.file_id;
 const meta=existing?.id?{}:{
  name, mimeType:'application/pdf',
  description:'Cópia PDF anotada no Banco Mestre. Arquivo original preservado.',
  appProperties:props
 };
 const initial=await fetch(initUrl,{
  method:existing?.id?'PATCH':'POST',
  headers:{Authorization:'Bearer '+token,'Content-Type':'application/json; charset=UTF-8',
   'X-Upload-Content-Type':'application/pdf','X-Upload-Content-Length':String(blob.size)},
  body:JSON.stringify(meta),cache:'no-store'
 });
 if(!initial.ok)throw safeMessage(initial,'Não foi possível iniciar o envio ao Drive');
 const location=initial.headers.get('Location');
 if(!location)throw Error('Drive não informou a sessão de upload; não é seguro repetir automaticamente.');
 const destination=validateSession(location);
 const uploaded=await fetch(destination,{
  method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/pdf'},
  body:blob,cache:'no-store'
 });
 if(!uploaded.ok)throw safeMessage(uploaded,'O envio não foi confirmado pelo Drive');
 const saved=await uploaded.json();
 if(!validId(saved.id)||saved.id===(doc.file_id||null))
  throw Error('O Drive não retornou um ID de cópia válido. Verifique seu Drive antes de reenviar.');
 if(existing?.id&&saved.id!==existing.id)throw Error('O Drive respondeu com ID diferente da cópia. Verifique seu Drive.');
 return saved;
}
async function save(){
 if(busy)return;
 const editor=window.BancoMestrePDFV042;
 if(!editor?.editing){say('Abra uma lei no editor antes de salvar a cópia no Drive.');return}
 busy=true;button.disabled=true;link.hidden=true;
 try{
  const token=await requestToken();
  say('Preparando todas as páginas marcadas do PDF...');
  const prepared=await editor.buildAnnotated();
  const doc=prepared.doc;
  if(prepared.pagesMarked===0)throw Error('Nenhuma página anotada. Faça pelo menos um grifo ou nota antes de salvar.');
  if(!doc?.id||!doc.hash)throw Error('Origem PDF não identificada.');
  const existing=mapping(doc);
  if(existing) {
   say('Conferindo a cópia existente antes de atualizar. O original não será modificado...');
   await checkOwnedCopy(existing,doc,token);
  }else{
   say('Criando nova cópia anotada no Meu Drive (arquivo original preservado)...');
  }
  const result=await resumable({
   blob:prepared.blob,token,existing,doc,name:existing?.name||legalName(prepared.name)
  });
  saveMapping(doc,result);
  const url='https://drive.google.com/file/d/'+encodeURIComponent(result.id)+'/view';
  link.href=url;link.hidden=false;
  say((existing?'Cópia atualizada':'Nova cópia criada')+' no Google Drive: '+(result.name||legalName(prepared.name))+
      ' · '+prepared.pagesMarked+' página(s) marcada(s). PDF original preservado.');
 }catch(e){say('Não foi possível confirmar o salvamento no Drive: '+e.message+
   ' O PDF original e as marcações locais permanecem intactos.');}
 finally{busy=false;button.disabled=false}
}
button.addEventListener('click',save);
prepare();
window.BancoMestreDriveSaveV042={
 get ready(){return !!client},
 get busy(){return busy}
};
})();

;
/* 15 assets/v043_pdf_compact.js */
/* V043 — apenas apresentação compacta dos controles PDF. 
   Reaproveita os elementos, IDs, listeners e permissões da V042 sem alterar SRS,
   armazenamento local ou as operações de edição e salvamento. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const tools=$('pdfLocalTools'),dialog=$('pdfDialog'),status=$('pdfLocalStatus');
 if(!tools||!dialog||tools.dataset.bmCompactV043==='1')return;
 tools.dataset.bmCompactV043='1';
 const groups=Array.from(tools.children).filter(e=>e.classList.contains('pdfGroup'));
 if(groups.length!==4)return;

 const advanced=document.createElement('div');
 advanced.id='pdfAdvancedV043';
 advanced.className='bm-v043-advanced';
 advanced.hidden=true;
 advanced.setAttribute('aria-label','Ferramentas adicionais do PDF');
 for(const id of ['pdfClearPage','pdfExportPNG','pdfChangeFile']){
  const element=$(id);
  if(element)advanced.appendChild(element);
 }
 const main=document.createElement('div');
 main.id='pdfMainV043';
 main.className='bm-v043-main';
 main.setAttribute('role','group');
 main.setAttribute('aria-label','Ferramentas do PDF. Em telas pequenas, deslize horizontalmente para ver todos os comandos.');
 tools.prepend(main);
 groups.forEach(g=>main.appendChild(g));

 // Troca apenas texto/apresentação; todas as ações continuam nos controles originais.
 const compact={
  pdfPrev:['‹','Página anterior',true],
  pdfNext:['›','Próxima página',true],
  pdfZoomOut:['−','Diminuir zoom',true],
  pdfZoomIn:['+','Aumentar zoom',true],
  pdfDraw:['✎','Caneta livre',true],
  pdfMarker:['▤','Grifar texto',true],
  pdfEraser:['⌫','Borracha',true],
  pdfPan:['✥','Mover página',true],
  pdfUndo:['↶','Desfazer marcação',true],
  pdfRedo:['↷','Refazer marcação',true],
  pdfNoteV037:['▣','Adicionar nota à página',true],
  pdfCardV037:['CARD','Vincular cartão à página',false],
  pdfStatusV037:['✓','Registrar cobertura da página',true],
  pdfExportPDF:['↓ PDF','Baixar cópia PDF anotada',false],
  pdfSaveDriveV042:['☁ Drive','Salvar cópia anotada no Google Drive',false],
  pdfClearPage:['Limpar página','Apagar todas as marcações da página',false],
  pdfExportPNG:['Salvar PNG','Baixar imagem da página anotada',false],
  pdfChangeFile:['Trocar PDF','Escolher outro arquivo PDF local',false]
 };
 for(const [id,[label,description,icon]] of Object.entries(compact)){
  const b=$(id);
  if(!b)continue;
  b.textContent=label;
  b.setAttribute('aria-label',description);
  b.title=description;
  if(icon)b.classList.add('bm-v043-icon');
  if(id==='pdfSaveDriveV042'||id==='pdfExportPDF')b.classList.add('bm-v043-save');
 }

 const more=document.createElement('button');
 more.id='pdfMoreV043';more.type='button';
 more.textContent='⋯';more.className='bm-v043-icon';
 more.title='Mostrar ou recolher ferramentas adicionais';
 more.setAttribute('aria-label','Mais ferramentas de edição');
 more.setAttribute('aria-controls','pdfAdvancedV043');
 more.setAttribute('aria-expanded','false');
 more.onclick=()=>{
  const opening=advanced.hidden;
  advanced.hidden=!opening;
  more.setAttribute('aria-expanded',String(opening));
  more.title=opening?'Recolher ferramentas adicionais':'Mostrar ferramentas adicionais';
 };
 main.appendChild(more);
 tools.appendChild(advanced);

 // A informação longa do nome já está no cabeçalho; o texto original permanece
 // no DOM para leitores de tela, evitando uma segunda linha visual de toolbar.
 const filename=$('pdfFileName');
 if(filename){filename.setAttribute('aria-live','polite')}

 const updateGeneralStatus=()=>{
  if(!status)return;
  const message=(status.textContent||'').trim();
  status.title=message;
  status.classList.toggle('bm-v043-error',/^(não foi possível|falha|erro|acesso google drive não autorizado)/i.test(message));
 };
 if(status){
  new MutationObserver(updateGeneralStatus).observe(status,{characterData:true,childList:true,subtree:true});
  updateGeneralStatus();
 }
 
 // Um sucesso ou falha da gravação deve ficar visível. Estado inicial neutro
 // permanece oculto, de modo que a área do PDF não perca uma linha à toa.
 const saveBox=tools.querySelector('.bm-drive-save-status');
 if(saveBox&&status){
  status.after(saveBox);
  const saveLabel=$('driveSaveStatusV042'),saveLink=$('driveSaveLinkV042');
  const updateSaveStatus=()=>{
   const message=(saveLabel?.textContent||'').trim();
   if(saveLabel)saveLabel.title=message;
   const idle=message===''||/^pronto\b/i.test(message)||/^preparando autorização/i.test(message);
   saveBox.classList.toggle('bm-v043-notice',!idle);
   saveBox.title=message;
  };
  if(saveLabel){
   new MutationObserver(updateSaveStatus).observe(saveLabel,{childList:true,characterData:true,subtree:true});
  }
  if(saveLink){
   new MutationObserver(updateSaveStatus).observe(saveLink,{attributes:true,attributeFilter:['hidden','href']});
  }
  updateSaveStatus();
 }
 window.BancoMestreCompactV043={
  get ready(){return !!$('pdfMainV043')},
  get expanded(){return !advanced.hidden},
  get toolbar(){return main},
  get mainCount(){return main.querySelectorAll('button').length}
 };
})();
