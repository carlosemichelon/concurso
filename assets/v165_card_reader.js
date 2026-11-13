/* Banco Mestre V165 — leitura integral com outros cartões no mesmo pop-up dos cartões, sem reescrever a base.
 * A leitura é local; não registra tentativa, domínio, avaliação ou evento SRS.
 * Preserva API V050 para integração com anotações V122 e outras interfaces. */
(function(){
'use strict';
if(window.BancoMestreVisualizarCardV050)return;
const root=document.getElementById('cardRows');
if(!root)return;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const pattern=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+)$/;
const create=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const svgPaths={
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
 pen:'<path d="m16 5 3 3M4 20l4-.8L20 7a2.1 2.1 0 0 0-3-3L4.8 16z"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 link:'<path d="M7 17 17 7M7 7h10v10"/>',
 alert:'<path d="M12 3 2 21h20L12 3zM12 9v4M12 17h.01"/>',
 scroll:'<path d="M8 21h12a2 2 0 0 0 2-2V7h-7V3H5a2 2 0 0 0-2 2v12a4 4 0 0 0 4 4Z"/><path d="M7 17h8M7 12h8"/>',
 layers:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 check:'<path d="m20 6-11 11-5-5"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
};
function icon(name){
 const i=create('span','bm163-ic');i.setAttribute('aria-hidden','true');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('width','17');svg.setAttribute('height','17');svg.setAttribute('viewBox','0 0 24 24');
 svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');
 svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 svg.innerHTML=svgPaths[name]||svgPaths.file;i.append(svg);return i;
}
function btn(label,ic,cls){
 const b=create('button',cls||'');
 b.type='button';b.append(icon(ic),document.createTextNode(label));return b;
}
function getCard(id){return typeof cards!=='undefined'&&Array.isArray(cards)?cards.find(c=>c.id===id):null}
function getGuide(c){return c?.origin_question_id&&typeof guideData!=='undefined'?guideData?.questoes?.[c.origin_question_id]:null}
function getAudit(id){return typeof auditF17!=='undefined'?auditF17?.historico_por_id?.[id]:null}
const overlay=create('div','bm-v050-peek bm163-peek');overlay.id='bmCardPeekV050';overlay.hidden=true;overlay.setAttribute('role','presentation');
const backdrop=create('div','bm-v050-peek-backdrop');
const panel=create('div','bm-v050-peek-panel bm163-panel');
panel.classList.add('bm165-panel');
panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','bmCardPeekTitleV050');panel.tabIndex=-1;
const header=create('div','bm-v050-peek-header bm163-header');
const headerLeft=create('div','bm163-header-title');
const kicker=create('small','bm163-kicker','REVISÃO DO CARTÃO');
const title=create('strong');title.id='bmCardPeekTitleV050';title.textContent='Consulta do cartão';
headerLeft.append(kicker,title);
const close=btn('Fechar','x','bm-v050-peek-close bm163-close');
close.setAttribute('aria-label','Fechar visualização do flashcard');close.title='Fechar (Esc)';
const previous=btn('Anterior','layers','bm165-prev'),next=btn('Próximo','layers','bm165-next');
const sidebarToggle=btn('Outros cartões','layers','bm165-toggle-sidebar');
sidebarToggle.setAttribute('aria-expanded','true');sidebarToggle.title='Mostrar ou ocultar lista de cartões relacionados';
const navHeader=create('div','bm165-header-nav');navHeader.append(sidebarToggle,previous,next,close);
header.append(headerLeft,navHeader);
const scroll=create('div','bm163-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Conteúdo do cartão: role para ler todas as seções');
const questionBlock=create('div','bm163-question');
const frontLabel=create('small','bm163-section-overline','PERGUNTA');
const front=create('h2','bm-v050-peek-front');
const meta=create('p','bm-v050-peek-meta');
const provenance=create('p','bm-v050-provenance');
const guidance=create('p','bm-v050-peek-guidance','Tente responder antes de consultar o verso. A consulta não altera seu SRS.');
questionBlock.append(frontLabel,front,meta,provenance,guidance);
const controls=create('div','bm163-preview-controls');
const reveal=btn('Revelar resposta','eye','bm-v050-peek-reveal');reveal.setAttribute('aria-expanded','false');
const lawButton=btn('Mostrar lei seca','book','bm163-legal-button');
lawButton.setAttribute('aria-expanded','false');lawButton.hidden=true;
controls.append(reveal,lawButton);
const lawPanel=create('section','bm163-legal-panel');lawPanel.hidden=true;lawPanel.setAttribute('aria-label','Texto literal da legislação');
const answer=create('div','bm-v050-peek-answer bm163-answer');answer.hidden=true;
const status=create('div','bm163-reader-status');status.setAttribute('role','status');status.textContent='Rolar para ler todo o material, inclusive macetes e histórico.';
const aside=create('aside','bm165-related');aside.setAttribute('aria-label','Outros cartões');
const asideTitle=create('h3','bm165-related-title','Outros cartões');
const asideCount=create('small','bm165-related-count','');
const asideSearch=create('input','bm165-related-search');asideSearch.type='search';
asideSearch.placeholder='Buscar cartão por ID ou assunto';asideSearch.setAttribute('aria-label','Buscar nos cartões');
const allLabel=create('label','bm165-all-label');
const allCheck=create('input');allCheck.type='checkbox';
allLabel.append(allCheck,document.createTextNode('Pesquisar toda a base'));
const asideList=create('nav','bm165-related-list');asideList.setAttribute('aria-label','Escolher outro cartão');
aside.append(asideTitle,asideCount,asideSearch,allLabel,asideList);
const layout=create('div','bm165-layout');layout.append(aside,scroll);
const footer=create('div','bm163-footer bm165-footer');
const note=create('small','bm-v050-peek-note','Consulta sem avaliação · não registra revisão nem altera intervalos SRS.');
const footerClose=btn('Voltar aos cartões','x','bm165-footer-close');
footer.append(note,footerClose);
scroll.append(questionBlock,controls,lawPanel,answer,status);
panel.append(header,layout,footer);overlay.append(backdrop,panel);document.body.append(overlay);
let focusedBefore=null,currentId='',previousOverflow='',asideQuery='',asideAll=false;
function allCards(){return typeof cards!=='undefined'&&Array.isArray(cards)?cards:[]}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function sameArea(a,b){if(a.provisional||b.provisional)return !!(a.provisional&&b.provisional);
 return !!(a.group&&a.group===b.group)||(a.discipline&&a.discipline===b.discipline)}
function related(){
 const c=getCard(currentId),all=allCards(),query=norm(asideQuery.trim());
 if(query)return all.filter(x=>norm([x.id,x.front,x.subject,x.discipline,x.sub].join(' ')).includes(query));
 if(asideAll||!c)return all;
 const nearby=all.filter(x=>sameArea(x,c));
 return nearby.length?nearby:all;
}
function renderRelated(){
 const all=related(),index=all.findIndex(c=>c.id===currentId);
 const start=all.length>60&&index>=0?Math.max(0,Math.min(all.length-60,index-12)):0;
 const visible=all.slice(start,start+60);
 asideCount.textContent=all.length+' cartões'+(all.length>60?' · exibindo '+visible.length:'');
 asideList.replaceChildren();
 for(const c of visible){
  const b=create('button','bm165-related-item');b.type='button';
  b.append(create('span','bm165-related-id',c.id),create('span','bm165-related-front',c.front));
  if(c.id===currentId){b.classList.add('bm165-active');b.setAttribute('aria-current','true')}
  b.addEventListener('click',()=>show(c.id,b));
  asideList.append(b);
 }
 if(!visible.length)asideList.append(create('p','bm165-empty','Nenhum cartão encontrado'));
 previous.disabled=index<=0;next.disabled=index<0||index>=all.length-1;
}
function moveCard(delta){
 const a=related(),i=a.findIndex(c=>c.id===currentId),c=a[i+delta];
 if(c)show(c.id);
}
asideSearch.addEventListener('input',()=>{asideQuery=asideSearch.value;renderRelated()});
allCheck.addEventListener('change',()=>{asideAll=allCheck.checked;renderRelated()});
previous.addEventListener('click',()=>moveCard(-1));next.addEventListener('click',()=>moveCard(1));
footerClose.addEventListener('click',()=>hide());
sidebarToggle.addEventListener('click',()=>{
 const hidden=panel.classList.toggle('bm165-sidebar-hidden');
 sidebarToggle.setAttribute('aria-expanded',String(!hidden));
 sidebarToggle.title=hidden?'Mostrar outros cartões':'Ocultar outros cartões';
});
function visibleElement(el){return el&&!(el.closest('[hidden]'))&&!el.disabled}
function hide(){
 if(overlay.hidden)return;
 overlay.hidden=true;document.body.classList.remove('bm-v050-peek-open');
 document.body.style.overflow=previousOverflow;
 const restore=focusedBefore;focusedBefore=null;currentId='';
 restore?.focus?.({preventScroll:true});
}
function piece(title,text,cls){
 if(text===undefined||text===null||String(text).trim()==='')return null;
 const box=create('section','bm163-piece'+(cls?' '+cls:''));
 box.append(create('h3','bm163-piece-title',title),create('p','bm163-piece-text',text));
 return box;
}
function listPiece(title,items,format){
 if(!Array.isArray(items)||!items.length)return null;
 const box=create('section','bm163-piece');
 box.append(create('h3','bm163-piece-title',title));
 const ul=create('ul','bm163-rich-list');
 for(const item of items){const li=create('li','',format(item));ul.append(li)}
 box.append(ul);return box;
}
function group(title,ic,sections,open=false){
 const children=sections.filter(Boolean);
 if(!children.length)return null;
 const d=create('details','bm163-deep-group');d.open=open;
 const summary=create('summary');summary.append(icon(ic),document.createTextNode(title),create('span','bm163-group-count',String(children.length)));
 d.append(summary);
 const inside=create('div','bm163-group-body');inside.append(...children);d.append(inside);return d;
}
function appendAnswer(c){
 const original=[...root.querySelectorAll('article.card')].find(a=>idOf(a)===c.id)?.querySelector(':scope > details > .answer');
 if(original&&original.querySelector(':scope > .richSection')){
  answer.replaceChildren();
  const chunks={study:[],fix:[],sources:[],history:[],related:[],other:[]};
  let direct=null;
  for(const child of Array.from(original.children)){
   if(child.matches('.richSection')){
    const title=child.querySelector('h4')?.textContent?.trim()||'';
    const copy=child.cloneNode(true);copy.classList.add('bm165-source-piece');
    if(/^(resposta registrada|resposta exata do cartão)/i.test(title)&&!direct){copy.classList.add('bm165-essential');direct=copy;continue}
    const k=/(conhecimento mínimo|resposta-modelo|explicação da base|evoluções complementares)/i.test(title)?'study':
     /(macete|pegadinha|lacuna|pontos a corrigir|já foi compreendido|erros corrigidos)/i.test(title)?'fix':
     /(fundamento|fonte|pdf original|referência|situação editorial|prioridade histórica|subassunto)/i.test(title)?'sources':
     /(histórico|tentativa|revisão|conhecimentos demonstrados|conhecimentos parciais|resposta discursiva arquivada|precisão|observações|classificação histórica)/i.test(title)?'history':
     /(interconex|cobertura|vínculo)/i.test(title)?'related':'other';
    chunks[k].push(copy);
   }else if(child.matches('details.answerFold')){
    const copy=child.cloneNode(true);copy.classList.add('bm165-original-fold');
    const label=child.querySelector('summary')?.textContent||'';
    chunks[/(histórico|correç)/i.test(label)?'history':'sources'].push(copy);
   }else if(child.matches('a[href]'))chunks.sources.push(child.cloneNode(true));
  }
  answer.append(direct||piece('Resposta original preservada',c.back,'bm163-essential'));
  for(const [k,title,ic,open] of [
   ['study','Conhecimento mínimo e resposta-modelo','file',true],
   ['fix','Macetes, pegadinhas e lacunas','check',false],
   ['sources','Fundamentos, fontes e rastreabilidade','book',false],
   ['history','Histórico de tentativas e correções','clock',false],
   ['related','Interconexões e cobertura cruzada','layers',false],
   ['other','Outras informações da base','file',false]]){
   const fold=group(title,ic,chunks[k],open);if(fold)answer.append(fold);
  }
  return;
 }

 answer.replaceChildren();
 const g=getGuide(c);
 const direct=piece('Verso original — resposta exata preservada',c.back||'Sem resposta cadastrada','bm163-essential');
 if(direct)answer.append(direct);
 const summary=group('Resposta aprofundada e compreensão','file',[
  piece('Conhecimento mínimo para acertar',g?.resposta_minima),
  piece('Resposta-modelo após correção',g?.resposta_modelo),
  piece('Explicação da base',c.expl),
  piece('Aprofundamento da base geral',typeof generalGuide!=='undefined'?
    generalGuide?.por_id?.[c.id]?.ref:null)
 ],true);
 if(summary)answer.append(summary);
 const mn=group('Macetes, pegadinhas e lacunas','check',[
  piece('Macete original',c.mnemonic),
  listPiece('Macetes associados à questão',g?.macetes,m=>m.id+' — '+m.frase+' · '+m.interpretacao+(m.alerta?' · Atenção: '+m.alerta:'')),
  piece('Pegadinhas e exceções',g?.pegadinhas),
  listPiece('Lacunas de fixação',g?.lacunas,l=>l.id+' ('+l.prioridade+'; '+l.estado+') — '+l.fixar),
  piece('Pontos a corrigir da resposta anterior',g?.lacunas_do_estudo),
  piece('O que já foi compreendido',g?.acertos_do_estudo)
 ]);
 if(mn)answer.append(mn);
 const refs=group('Fundamentação e referências','book',[
  piece('Referência original cadastrada',c.reference),
  piece('Fundamento detalhado registrado na correção',g?.dispositivo),
  piece('Origem da questão',c.origin_question_id),
  piece('PDF original e páginas',g?.fonte),
  piece('Situação editorial',c.provisional?'Cópia operacional de Ijuí, ainda não promovida à base canônica.':'Cartão original da base canônica.')
 ]);
 if(refs)answer.append(refs);
 const rel=group('Relações e histórico de estudo','layers',[
  listPiece('Interconexões com outros cartões',g?.vinculos_cartoes,v=>v.cartao+' — '+v.tema+' ('+v.tratamento+')'),
  piece('Cobertura metodológica',g?.aviso_srs),
  piece('Tentativa anterior da questão — não é revisão do cartão',
   g?.tentativa_registrada?('Data: '+(g.tentativa_data||'não informada')+' · avaliação registrada: '+(g.avaliacao_informada||'não informada')+' · previsão no checkpoint: '+(g.revisao_prevista_no_checkpoint||'não informada')):null),
  piece('Histórico formal do cartão (F17)',getAudit(c.id)?
   ('Tentativa '+getAudit(c.id).tentativa+' · '+getAudit(c.id).avaliacao+' · '+getAudit(c.id).data_local+' · próxima revisão registrada: '+(getAudit(c.id).proxima_revisao_existente_v015||'não informada')):null),
  piece('Observações da correção formal F17',getAudit(c.id)?.observacoes_da_correcao)
 ]);
 if(rel)answer.append(rel);
 const recovered=typeof answersF17!=='undefined'?answersF17?.por_id?.[c.id]:null;
 if(recovered){
  const archive=group('Resposta discursiva e correções F17','clock',[
   piece('Resposta discursiva arquivada',recovered.resposta_original_arquivada),
   piece('Conhecimentos demonstrados',recovered.conhecimentos_demonstrados),
   piece('Conhecimentos parciais',recovered.conhecimentos_parciais),
   piece('Erros corrigidos',recovered.erros_corrigidos),
   piece('Lacunas identificadas',recovered.lacunas_em_relacao_ao_enunciado),
   piece('Complementações da correção',recovered.informacoes_novas_de_complementacao),
   piece('Macete da revisão',recovered.macete),
   piece('Cobertura cruzada informada',recovered.cobertura_cruzada_ids_informados),
   piece('Referência PDF registrada',recovered.referencia_pdf_confirmada_no_csv),
   piece('Classificação histórica (não SRS)',recovered.classificacao_historica_csv),
   piece('Rastreabilidade',recovered.observacao_de_rastreabilidade)
  ]);
  if(archive)answer.append(archive);
 }
 const gg=typeof generalGuide!=='undefined'?generalGuide?.por_id?.[c.id]:null;
 if(gg?.evolucoes?.length){
  const old=group('Evoluções complementares da base','layers',[
    listPiece('Evoluções P08',gg.evolucoes,e=>e.id+' — '+e.pergunta+' | '+e.resposta_complementar+' · '+e.origem)
  ]);if(old)answer.append(old);
 }
 if(c.provisional&&typeof guideData!=='undefined'&&/^https:\/\//.test(String(guideData?.link_fonte_privada||''))){
  const a=create('a','bm165-source-link','Consultar planilha original da resposta discursiva');
  a.href=guideData.link_fonte_privada;a.target='_blank';a.rel='noopener noreferrer';answer.append(a);
 }
 if(!summary&&!mn&&!refs&&!rel)answer.append(create('p','bm163-missing-guide','Não há guia complementar auditado para este ID; o verso original permanece disponível.'));
}
function renderLaw(rec,c){
 lawPanel.replaceChildren();
 if(rec){
  lawPanel.append(
   create('h3','bm163-piece-title','Lei seca — transcrição do dispositivo'),
   create('p','bm163-law-meta',rec.law+' · '+rec.article),
   create('p','bm163-law-text',rec.text)
  );
  if(rec.notice)lawPanel.append(create('p','bm163-law-warning','Referência a conferir: '+rec.notice));
  if(rec.scope)lawPanel.append(create('p','bm163-law-scope','Trecho apresentado: '+rec.scope));
  if(/^https:\/\//.test(rec.source_url||'')){
   const a=create('a','bm163-law-source','Consultar norma na fonte');a.href=rec.source_url;a.target='_blank';a.rel='noopener noreferrer';
   a.append(icon('link'));lawPanel.append(a);
  }
 }else{
  lawPanel.append(create('h3','bm163-piece-title','Lei seca ainda não conferida'));
  lawPanel.append(create('p','bm163-law-warning','A resposta conceitual não será apresentada como se fosse a redação literal da lei. Confira a norma correspondente antes de memorizar.'));
  if(c.reference)lawPanel.append(create('p','bm163-law-scope','Referência original: '+c.reference));
 }
}
function isLegal(c){return !!c&&(c.provisional||String(c.group||'')==='LEGISLACAO'||/legisla|direito|jur[ií]dic|constitucional/i.test(String(c.discipline||'')))}
function show(id,origin){
 const c=getCard(id);if(!c)return false;
 if(overlay.hidden){
  focusedBefore=origin||document.activeElement;
  previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  overlay.hidden=false;document.body.classList.add('bm-v050-peek-open');
  panel.focus({preventScroll:true});
 }
 currentId=id;title.textContent='Cartão '+id;
 front.textContent=c.front||'Pergunta não cadastrada';
 meta.textContent=[c.discipline,c.subject,c.sub].filter(Boolean).join(' › ');
 provenance.textContent=c.provisional?'Cópia operacional de Ijuí · sem promoção canônica':'Cartão da base original · ID preservado';
 if(window.BM163LeiSeca?.getRecord(id)?.notice)provenance.textContent+=' · referência normativa divergente';
 reveal.setAttribute('aria-expanded','false');
 reveal.replaceChildren(icon('eye'),document.createTextNode('Revelar resposta'));
 answer.hidden=true;answer.replaceChildren();
 lawButton.hidden=!isLegal(c);lawButton.setAttribute('aria-expanded','false');
 lawButton.replaceChildren(icon('book'),document.createTextNode('Mostrar lei seca'));
 lawPanel.hidden=true;lawPanel.replaceChildren();
 status.textContent='Resposta e lei seca iniciam ocultas. Escolha outros cartões na lista lateral.';
 scroll.scrollTop=0;renderRelated();return true;
}
reveal.addEventListener('click',()=>{
 const c=getCard(currentId);if(!c)return;
 answer.hidden=!answer.hidden;
 if(!answer.hidden)appendAnswer(c);
 reveal.setAttribute('aria-expanded',String(!answer.hidden));
 reveal.replaceChildren(icon('eye'),document.createTextNode(answer.hidden?'Revelar resposta':'Ocultar resposta'));
 status.textContent=answer.hidden?'Resposta ocultada novamente.':'Resposta e materiais complementares disponíveis abaixo, com seções recolhíveis.';
});
lawButton.addEventListener('click',()=>{
 const c=getCard(currentId);if(!c)return;
 lawPanel.hidden=!lawPanel.hidden;
 lawButton.setAttribute('aria-expanded',String(!lawPanel.hidden));
 lawButton.replaceChildren(icon('book'),document.createTextNode(lawPanel.hidden?'Mostrar lei seca':'Ocultar lei seca'));
 if(!lawPanel.hidden){
  renderLaw(window.BM163LeiSeca?.getRecord(currentId),c);
  const wanted=currentId;
  const ready=window.BM163LeiSeca?.whenReady;
  if(ready&&typeof ready.then==='function')void ready.then(()=>{
   if(currentId===wanted&&!lawPanel.hidden)renderLaw(window.BM163LeiSeca?.getRecord(wanted),c);
  }).catch(()=>{});
 }
});
answer.addEventListener('click',e=>{
 const b=e.target.closest('button.media-ref');if(!b)return;
 const id=b.textContent.trim();
 if(pattern.test(id)&&getCard(id)){e.preventDefault();show(id,b)}
});
close.addEventListener('click',hide);backdrop.addEventListener('click',hide);
document.addEventListener('keydown',e=>{
 if(overlay.hidden)return;
 if(e.key==='Escape'){e.preventDefault();hide();return}
 if((e.altKey||e.ctrlKey)&&e.key==='ArrowRight'){e.preventDefault();moveCard(1);return}
 if((e.altKey||e.ctrlKey)&&e.key==='ArrowLeft'){e.preventDefault();moveCard(-1);return}
 if(e.key!=='Tab')return;
 const focusable=Array.from(panel.querySelectorAll('a[href],button,summary,[tabindex="0"]')).filter(visibleElement);
 if(!focusable.length)return;
 const first=focusable[0],last=focusable[focusable.length-1];
 if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
function decorate(){
 for(const article of root.querySelectorAll('article.card')){
  const heading=article.querySelector(':scope > h3');
  if(heading&&!article.dataset.bm163HeadingReady){article.insertBefore(heading,article.firstElementChild);article.dataset.bm163HeadingReady='yes';}
  const train=article.querySelector(':scope > .v037-train');
  if(train&&!article.querySelector(':scope > details.bm-v055-trainfold')){
   const fold=create('details','bm-v055-trainfold');
   const s=create('summary','', 'Responder discursiva');s.title='Abrir espaço de resposta deste cartão';
   fold.append(s,train);article.insertBefore(fold,article.querySelector(':scope > .buttons'));
  }
  if(article.querySelector(':scope > .bm-v050-peek-button'))continue;
  const id=idOf(article);if(!pattern.test(id))continue;
  const b=btn('Abrir leitura','eye','bm-v050-peek-button');
  b.title='Abrir leitura detalhada de '+id+' na mesma página, sem registrar revisão';
  b.setAttribute('aria-label','Ler '+id+' em janela com rolagem');
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(id,b)});
  if(heading)heading.after(b);else article.prepend(b);
 }
}
let scheduled=false;
const observer=new MutationObserver(()=>{
 if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()});
});
observer.observe(root,{childList:true,subtree:true});decorate();
window.BancoMestreVisualizarCardV050={
 get ready(){return !!document.getElementById('bmCardPeekV050')},
 get visible(){return !overlay.hidden},
 get currentId(){return currentId},
 get relatedCount(){return related().length},
 next(){moveCard(1)},previous(){moveCard(-1)},
 showId(id,from){const article=[...root.querySelectorAll('article.card')].find(a=>idOf(a)===id);
  return show(id,from||article||document.activeElement)},
 close:hide
};
})();