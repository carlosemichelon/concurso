
/* Banco Mestre V031: apresentação, conteúdos de assuntos e referências por ID.
   Dados originais, notas SRS e histórico não são modificados. */
(function(){
'use strict';
const byId=id=>document.getElementById(id);
const plain=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim();
function findTopic(c){return topicRows.find(x=>x.group===(c.provisional?'LEGISLACAO':c.group)&&x.subject===(c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros'))}
function gotoCard(id){focusGroup='';byId('cardSearch').value=id;cardLimit=24;section('cartoes');cardRender();byId('cardRows').scrollIntoView({block:'start',behavior:'smooth'})}
function chip(text,click){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=click;return b}
function addTitle(target,title){const h=document.createElement('h3');h.className='sectionTitle';h.textContent=title;target.append(h)}
function addPara(target,text,cls='contextNote'){const p=document.createElement('p');p.className=cls;p.textContent=text;target.append(p)}
function tokenButton(token){
 const b=document.createElement('button');b.type='button';b.className='media-ref';b.textContent=token;
 b.title='Abrir '+token+' no leitor em tela cheia';
 b.onclick=async()=>{
  const normalized=token.toUpperCase().replace(/\s+/g,'-');
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
 const re=/\b(?:IMG-(?:P10-)?\d{1,4}|IJUI-PDF-\d{1,4}|PETRO10-CONAMA-\d{1,4}|MANUSCRITO-252|CAP-\d{1,3}|GUIA-[A-Z0-9-]+)\b/gi;
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
 const ev=(auditF17?.vinculos_indiretos||[]).filter(x=>x.cartao===id||x.origem===id);
 const record=answersF17?.por_id?.[id];
 const remembered=[...new Set([...(String(record?.cobertura_cruzada_ids_informados||'').match(/CARD-\d{4}/g)||[]),...ev.flatMap(x=>[x.cartao,x.origem])])].filter(k=>k!==id&&cards.some(q=>q.id===k));
 const confirmed=remembered.map(k=>({id:k,label:k+' · '+(cards.find(x=>x.id===k)?.subject||'outro assunto')}));
 const same=cards.filter(x=>x.id!==id&&x.group===c.group&&x.subject===c.subject&&!remembered.includes(x.id)).slice(0,6).map(x=>({id:x.id,label:x.id+' · '+(x.sub||x.front.slice(0,25))}));
 relationGroup(ans,'Cobertura cruzada documentada na base',confirmed,'IDs registrados em auditoria F17 ou no CSV histórico. Associação não significa nova tentativa nem domínio completo.');
 relationGroup(ans,'Cartões do mesmo assunto (para consultar)',same,'Proximidade temática. Não é cobertura demonstrada; não registrar como acerto no SRS.');
 if(!confirmed.length)addPara(ans,'Sem vínculo cruzado documentado para este ID nos registros F17/F14-F16 disponíveis. Isso não significa ausência de relação conceitual.');
 const buttons=article.querySelector('.buttons');
 const t=findTopic(c);if(t&&buttons)buttons.prepend(chip('Abrir guia do assunto',()=>openTopic(t)));
 linkReferences(ans);linkReferences(article.querySelector('h3'));foldAnswer(ans);
}
const priorCardRender=cardRender;
cardRender=function(){priorCardRender();byId('coverageSummary').replaceChildren();
 const header=document.createElement('p');header.className='notice';header.textContent='Cobertura cruzada = relações entre conhecimentos da base. Vínculos comprovados aparecem por ID; cartões semelhantes são apenas sugestões de consulta. Nenhum evento novo é lançado no SRS.';
 byId('coverageSummary').append(header);
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
 try{await loadCards();await loadMeta();if(!docs.length)await pdfInit();
  const subset=cards.filter(c=>(c.provisional?'LEGISLACAO':c.group)===t.group&&(c.provisional?'Ijuí — legislação FUNDATEC':c.subject||'Outros')===t.subject);
  section('tema');byId('topicHeading').textContent=t.subject;byId('topicGroupCaption').textContent=t.area+' · '+t.label+' · '+subset.length+' cartões da base';
  const summary=byId('topicOverview');summary.replaceChildren();
  const subparts=[...new Set(subset.map(x=>x.sub).filter(Boolean))];
  const sub=document.createElement('div');sub.className='studyNote';const h=document.createElement('h3');h.textContent='Roteiro de estudo por subassunto';sub.append(h);
  addPara(sub,subparts.length?subparts.join(' • '):'Há registros de cartões, sem divisão adicional de subassuntos.','');
  summary.append(sub);
  const guide=byId('topicStudyBlocks');guide.replaceChildren();
  const seen=new Set();
  for(const c of subset){const value=(c.expl||'').trim();const norm=plain(value);if(!value||seen.has(norm))continue;seen.add(norm);
   guide.append(makeTopicNote(c.sub||'Conceito da base',c.id,value));
   if(guide.children.length>=12)break;
  }
  if(!guide.children.length)guide.append(makeTopicNote('Informação disponível','Base de dados','Este assunto possui perguntas e respostas, mas ainda não tem explicações consolidadas no cadastro.'));
  const tips=[...new Set(subset.map(x=>x.mnemonic).filter(Boolean))].slice(0,9);
  const tipbox=byId('topicMacetes');tipbox.replaceChildren();
  for(const x of tips)tipbox.append(makeTopicNote('Macete', 'Arquivo original',x));
  if(!tips.length)addPara(tipbox,'Nenhum macete registrado para este tema.');
  showTopicImages(t);
  const rel=byId('topicRelated');rel.replaceChildren();
  addTitle(rel,'Conexões dentro do Banco Mestre');
  const cross=(auditF17?.vinculos_indiretos||[]).filter(x=>subset.some(c=>x.origem===c.id||x.cartao===c.id));
  addPara(rel,cross.length?cross.length+' vínculo(s) auditado(s) envolvendo cartões deste assunto. Não equivalem a tentativas adicionais.':'Não há vínculo F17 auditado específico para os cartões deste assunto. A cobertura deve ser avaliada pelas respostas discursivas, não pela simples presença de cartões.');
  const line=document.createElement('div');line.className='chipLinks';
  for(const x of cross){const other=subset.some(c=>c.id===x.cartao)?x.origem:x.cartao;if(cards.some(c=>c.id===other))line.append(chip(other+' · '+x.status,()=>gotoCard(other)))}
  rel.append(line);
  const bt=byId('topicGoCards');bt.onclick=()=>{focusGroup=t.group;byId('cardSearch').value=t.subject==='Ijuí — legislação FUNDATEC'?'':t.subject;byId('cardFilter').value='all';cardLimit=24;section('cartoes');cardRender()};
  byId('topicBack').onclick=()=>section('assuntos');
  scrollTo({top:0,behavior:'smooth'});
 }catch(e){alert('Não foi possível abrir o assunto: '+e.message)}
}
const priorTopicRender=topicRender;
topicRender=function(){priorTopicRender();
 const q=plain(byId('topicSearch').value),area=byId('topicArea').value;
 const list=topicRows.filter(x=>(area==='all'||x.area===area)&&plain(x.subject+' '+x.label+' '+x.area).includes(q)).slice(0,180);
 [...byId('topicRows').querySelectorAll('button.topicCard')].forEach((node,i)=>{if(list[i])node.onclick=()=>openTopic(list[i])});
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
window.BancoMestreV032={openTopic,gotoCard};
})();
