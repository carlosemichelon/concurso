/* Banco Mestre V242 — leitor único V165 com cartão PETRO14-C014. */
/* Banco Mestre V165 — leitura integral com outros cartões no mesmo pop-up dos cartões, sem reescrever a base.
 * A leitura é local; não registra tentativa, domínio, avaliação ou evento SRS.
 * Preserva API V050 para integração com anotações V122 e outras interfaces. */
(function(){
'use strict';
if(window.BancoMestreVisualizarCardV050)return;
const root=document.getElementById('cardRows');
if(!root)return;
const idOf=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
const pattern=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Za-z0-9_-]+|TRT0[12]-C\d{3}|PETRO\d+-C\d{3})$/;
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
function getCard(id){const c=typeof cards!=='undefined'&&Array.isArray(cards)?cards.find(c=>c.id===id):null;return c||(/^TRT0[12]-C\d{3}$/.test(id)?window.BM236TrtCardsGrid?.getRecord?.(id):null)||window.BM242OperationalCards?.getRecord?.(id)||null}
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
let focusedBefore=null,currentId='',previousOverflow='',asideQuery='',asideAll=false;const trtUrls=[];function freeTrtUrls(){while(trtUrls.length)URL.revokeObjectURL(trtUrls.pop())}
function allCards(){return (typeof cards!=='undefined'&&Array.isArray(cards)?cards:[]).concat(window.BM225LegalTaxonomy?.all?.()||[])}
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
 freeTrtUrls();overlay.hidden=true;document.body.classList.remove('bm-v050-peek-open');
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
  piece('Situação editorial',c.provisional?'Cópia operacional de Ijuí, ainda não promovida à base canônica.':/^TRT0[12]-C\d{3}$/.test(c.id)?'Cartão TRT operacional preservado separadamente, sem promoção para a base canônica.':'Cartão original da base canônica.')
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

/* V197 — renderizador direto no leitor do gabarito.
 * O título aparece sincronicamente; dados e SRS nunca são modificados. */
const bm197Cache=new Map();
const bm197Reserved=new Set(['CARD-0138','CARD-0194','CARD-0248','CARD-0286','CARD-0350','CARD-0424','CARD-0445','CARD-0502','CARD-0509','CARD-0510','CARD-0693']);
function bm197Shard(id){
 if(!/^CARD-\d{4}$/.test(id))return -1;
 const n=Number(id.slice(5));return n>=1&&n<=1519?Math.floor((n-1)/250):-1;
}
/* V274 — Módulos didáticos publicados por ID a partir do snapshot privado V164.
 * O JSON público contém somente texto técnico, sem histórico pessoal ou SRS.
 * Arquivos V194/V199 permanecem intactos como histórico e fallback. */
const bm274Audited=new Set(["CARD-0118","CARD-0175","CARD-0333","CARD-0468","CARD-0480","CARD-0543","CARD-0547","CARD-0548","CARD-0549","CARD-0551","CARD-0552","CARD-0553","CARD-0579","CARD-0621","CARD-0623","CARD-0624","CARD-0625","CARD-0626","CARD-0629","CARD-0631","CARD-0632","CARD-0642","CARD-1033","CARD-1034","CARD-1386","CARD-1520","CARD-1521","CARD-1522","CARD-1523","CARD-1524","CARD-1525","CARD-1526","CARD-1527","CARD-1528","CARD-1529","CARD-1530","CARD-1531","CARD-1532","CARD-1533"]);
let bm274RecordsPromise=null;
async function bm274Record(id){
 if(!bm274Audited.has(id))return null;
 if(!bm274RecordsPromise){
  bm274RecordsPromise=fetch('assets/layers_public_v274_sync.json?v=274-1',{cache:'no-store'})
   .then(r=>{if(!r.ok)throw Error('V274: módulos ausentes (HTTP '+r.status+')');return r.json()})
   .then(data=>{
    if(data.format!=='BancoMestrePublic11ModulesV274'||data.source_version!=='V164'||!Array.isArray(data.records)||data.records.length!==39)throw Error('V274: módulos incompatíveis');
    const m=new Map();
    for(const row of data.records){
     if(m.has(row.id)||!bm274Audited.has(row.id)||!Array.isArray(row.layers)||row.layers.length!==11||
         row.layers.some((l,i)=>l.ord!==i+1||!String(l.titulo||'').trim()||!String(l.texto||'').trim()))throw Error('V274: integridade dos 11 módulos inválida');
     m.set(row.id,row);
    }
    if(m.size!==39)throw Error('V274: faltam módulos aprovados');
    return m;
   });
  bm274RecordsPromise.catch(()=>{bm274RecordsPromise=null});
 }
 return (await bm274RecordsPromise).get(id)||null;
}
async function bm197Record(id){
 if(id==='CARD-0578'||id==='CARD-0924'){
  const related=await window.BM276LayerData?.get?.(id);
  if(related)return related;
  throw Error('V277: módulos relacionados não carregados para '+id);
 }
 const revised=await bm274Record(id);
 if(revised)return revised;
 const batch=bm197Shard(id);
 if(batch<0)return null;
 if(!bm197Cache.has(batch)){
  const uri='assets/layers_public_v194_'+String(batch).padStart(3,'0')+'.json?v=197-direct';
  const pending=(async()=>{
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),30000);
   let response;
   try{response=await fetch(uri,{cache:'no-store',signal:controller.signal})}
   finally{clearTimeout(timer)}
   if(!response.ok)throw Error('HTTP '+response.status+' ao abrir '+uri);
   const parsed=await response.json();
   if(!Array.isArray(parsed))throw Error('Formato inválido do arquivo de aprofundamento');
   return new Map(parsed.map(row=>[row.id,row]));
  })();
  bm197Cache.set(batch,pending);
  pending.catch(()=>{if(bm197Cache.get(batch)===pending)bm197Cache.delete(batch)});
 }
 const original=(await bm197Cache.get(batch)).get(id)||null;
 if(!original)return null;
 // V199: adendos auditados só para IDs cotejados. Histórico original permanece literal.
 return await bm199Enrich(id,original);
}
/* V199 — enriquecimentos documentados, sem alterar o JSON histórico. */
const bm199Audited=new Set(['CARD-0751','CARD-0752','CARD-0753','CARD-0754','CARD-1001']);
let bm199OverlayPromise=null;
async function bm199Enrich(id,original){
 if(!bm199Audited.has(id))return original;
 try{
  if(!bm199OverlayPromise){
   bm199OverlayPromise=fetch('assets/v199_reauditoria_adenda_5_cartoes.json?v=199-01',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('Adendo V199: HTTP '+r.status);return r.json()})
    .then(data=>{
     if(data?.schema!=='BancoMestreReauditoriaAdendaV199'||!Array.isArray(data.records))
      throw Error('Adendo V199 incompatível');
     const m=new Map();
     for(const card of data.records){
      if(!bm199Audited.has(card.id)||m.has(card.id)||!card.addenda||typeof card.addenda!=='object')
       throw Error('ID repetido ou não homologado no adendo');
      for(const [num,val] of Object.entries(card.addenda))
       if(!/^(?:[1-9]|10|11)$/.test(num)||!String(val||'').trim())throw Error('Seção inválida no adendo: '+card.id);
      m.set(card.id,card);
     }
     return m;
    });
   bm199OverlayPromise.catch(()=>{bm199OverlayPromise=null});
  }
  const map=await bm199OverlayPromise,adendo=map.get(id);
  if(!adendo)throw Error('Adendo não contém '+id);
  if(!Array.isArray(original.layers)||original.layers.length!==11)throw Error('11 módulos originais indisponíveis');
  const layers=original.layers.map((x,i)=>{
   const addition=adendo.addenda[String(i+1)];
   return addition?{...x,texto:x.texto+'\n\nREANÁLISE DOCUMENTADA V199 — COMPLEMENTO NÃO SUBSTITUTIVO:\n'+addition}:x;
  });
  return {...original,layers,v199_status:adendo.status};
 }catch(error){
  console.warn('Reauditoria complementar indisponível:',id,error);
  return {...original,v199_warning:'Complemento V199 não foi carregado ('+String(error?.message||error)+'). Os 11 módulos históricos continuam disponíveis.'};
 }
}
window.BM199Reauditoria=Object.freeze({enrich:bm199Enrich,ids:[...bm199Audited],status:'Adendos técnicos com cotejo pontual; originais preservados'});
function bm197RenderText(host,raw){
 const lines=String(raw||'').split(/\r?\n/);
 for(let i=0;i<lines.length;){
  if(!lines[i].trim()){i++;continue}
  if(lines[i].trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])){
   const table=create('table','bm197-table'),thead=create('thead'),tbody=create('tbody');
   const labels=lines[i].trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
   const row=create('tr');labels.forEach(x=>row.append(create('th','',x)));thead.append(row);
   i+=2;
   while(i<lines.length&&lines[i].trim().startsWith('|')){
    const cells=lines[i].trim().replace(/^\||\|$/g,'').split('|'),tr=create('tr');
    labels.forEach((_,k)=>tr.append(create('td','',(cells[k]||'').trim())));tbody.append(tr);i++;
   }
   table.append(thead,tbody);const scroll=create('div','bm197-table-scroll');scroll.append(table);host.append(scroll);continue;
  }
  let chunk=[];
  while(i<lines.length&&lines[i].trim()&&!(lines[i].trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])))chunk.push(lines[i++]);
  if(chunk.length)host.append(create('p','bm197-paragraph',chunk.join('\n')));
 }
}
function bm197ShowEvolution(c){
 if(!c||!/^CARD-\d{4}$/.test(c.id)||answer.hidden)return;
 if(answer.querySelector('.bm197-evolutive'))return;
 const pane=create('section','bm197-evolutive'),heading=create('h3','bm197-title','📖 Resposta evolutiva integral · 11 seções');
 const state=create('div','bm197-state','Carregando os textos completos do cartão '+c.id+'…');
 pane.dataset.cardId=c.id;pane.append(heading,state);
 const primary=answer.querySelector(':scope > .bm163-essential, :scope > .bm165-essential');
 if(primary)primary.after(pane);else answer.prepend(pane);
 if(bm197Reserved.has(c.id)){
  state.replaceChildren(create('p','bm197-pending','Cartão reservado para homologação. O verso original continua disponível acima.'));
  return;
 }
 const load=async()=>{
  state.replaceChildren(create('p','bm197-loading','Carregando 11 seções do '+c.id+'…'));
  try{
   const record=await bm197Record(c.id);
   if(!pane.isConnected||pane.dataset.cardId!==currentId)return;
   if(!record)throw Error('ID '+c.id+' não encontrado no lote público.');
   if(!Array.isArray(record.layers)||record.layers.length!==11||
      record.layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))
    throw Error('Registro sem as 11 seções completas.');
   if(window.BM198Format?.render){
    // Mesmo renderizador para modal e grade: quadro informativo + 11 módulos por extenso.
    window.BM198Format.render(state,record,c.id);
   }else{
    // Fallback fiel: manter conteúdo visível mesmo se o estilo opcional falhar.
    const fragment=document.createDocumentFragment();
    record.layers.forEach((layer,i)=>{
     const item=create('section','bm197-layer');
     const title=String(layer.titulo).trim();
     item.append(create('h4','bm197-layer-title',/^\d{1,2}\s*[-—–.:]/.test(title)?title:String(i+1).padStart(2,'0')+' · '+title));
     bm197RenderText(item,layer.texto);fragment.append(item);
    });
    state.replaceChildren(create('p','bm197-pending','O quadro informativo não carregou; exibindo os 11 textos originais.'),fragment);
   }
   if(record.v199_status)heading.textContent='📖 Resposta evolutiva integral · 11 seções · '+c.id+' · reauditoria V199';
   else heading.textContent='📖 Resposta evolutiva integral · 11 seções · '+c.id;
   if(record.v199_warning)state.prepend(create('p','bm197-pending',record.v199_warning));
  }catch(e){
   if(!pane.isConnected||pane.dataset.cardId!==currentId)return;
   const err=create('p','bm197-error','Não foi possível mostrar a resposta evolutiva: '+String(e?.message||e));
   const retry=create('button','bm197-retry','Tentar carregar novamente');retry.type='button';retry.addEventListener('click',load);
   state.replaceChildren(err,retry);
  }
 };
 void load();
}

// TRT shares the original reader and its V198 renderer. No SRS writes.
async function trtLaw(id){
 lawPanel.replaceChildren(create('p','bm163-law-warning','Carregando referências…'));
 try{
  const data=await window.BM236TrtCardsGrid.loadRecord(id);
  if(currentId!==id||lawPanel.hidden)return;
  lawPanel.replaceChildren(create('h3','bm163-piece-title','Fontes normativas do cartão'),
   create('p','bm163-law-warning','A íntegra literal não foi certificada: consulte os dispositivos diretamente nas fontes oficiais.'));
  for(const item of data.laws||[]){
   if(!/^https:\/\//.test(item.source_url||''))continue;
   const a=create('a','bm163-law-source',(item.norm||'Norma')+' · '+(item.article||'dispositivo'));
   a.href=item.source_url;a.target='_blank';a.rel='noopener noreferrer';lawPanel.append(a);
  }
 }catch(e){if(currentId===id&&!lawPanel.hidden)lawPanel.replaceChildren(create('p','bm163-law-warning','Fonte indisponível: '+String(e.message||e)));}
}
function trtMedia(images){
 const zone=create('section','bm211-media bm165-trt-media');
 const title=create('h3','','Imagens originais vinculadas');
 const button=btn('Carregar prévias do Drive','file','bm211-fetch');
 const status=create('p','bm211-status','As prévias exigem autorização na aba Imagens. Links originais disponíveis abaixo.');
 const grid=create('div','bm211-grid');zone.append(title,button,status,grid);
 const list=[];
 for(const [i,item] of images.entries()){
  const fig=create('figure','bm211-figure'),frame=create('div','bm211-frame');
  const placeholder=create('div','bm211-placeholder','Prévia privada');
  const pic=create('img','bm211-image');pic.hidden=true;pic.loading='lazy';pic.alt=item.title||'Imagem original';
  frame.append(placeholder,pic);
  const caption=create('figcaption','bm211-figcaption');
  caption.append(create('strong','',(i+1)+' — '+(item.title||'Imagem original')));
  if(/^https:\/\//.test(item.drive_url||'')){
   const link=create('a','bm211-link','Abrir original no Drive');link.href=item.drive_url;link.target='_blank';link.rel='noopener noreferrer';caption.append(link);
  }
  fig.append(frame,caption);grid.append(fig);list.push({item,placeholder,pic});
 }
 button.addEventListener('click',async()=>{
  const token=window.BancoMestreMediaSyncV182?.token?.()||'';
  if(!token){status.textContent='Conecte o Google Drive na aba Imagens antes de carregar as prévias.';return;}
  button.disabled=true;status.textContent='Carregando prévias autorizadas…';
  let ok=0;
  await Promise.all(list.map(async ({item,pic,placeholder})=>{
   if(pic.dataset.loaded==='1'){ok++;return;}
   if(!/^[A-Za-z0-9_-]{15,}$/.test(item.file_id||''))return;
   try{
    const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!r.ok)throw Error('HTTP '+r.status);
    const blob=await r.blob();
    if(blob.size>15000000||!/^image\/(png|jpeg|webp|gif)$/.test(blob.type))throw Error('tipo/tamanho inválido');
    const url=URL.createObjectURL(blob);trtUrls.push(url);pic.src=url;pic.hidden=false;pic.dataset.loaded='1';placeholder.hidden=true;ok++;
   }catch(e){placeholder.textContent='Prévia indisponível ('+String(e.message||e)+')';}
  }));
  if(zone.isConnected)status.textContent=ok+' de '+images.length+' imagens carregadas.';
  button.disabled=false;
 });
 return zone;
}
async function trtStudy(id){
 const pane=create('section','bm197-evolutive bm165-trt-study');
 const heading=create('h3','bm197-title','Conteúdo TRT · 11 seções');
 const state=create('div','bm197-state','Carregando conteúdo…');pane.append(heading,state);answer.append(pane);
 try{
  const data=await window.BM236TrtCardsGrid.loadRecord(id);
  if(currentId!==id||!pane.isConnected||answer.hidden)return;
  if(data.layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))throw Error('Módulos incompletos');
  if(!window.BM198Format?.render)throw Error('Leitor aprofundado indisponível');
  window.BM198Format.render(state,data,id);
  if(data.images?.length){
   const mods=state.querySelectorAll('.bm198-module'),gallery=trtMedia(data.images);
   if(mods[5])mods[5].after(gallery);else state.querySelector('.bm198-overview')?.before(gallery);
  }
  const info=create('details','bm221-trt-info');
  info.append(create('summary','','Informações do cartão e histórico operacional'),
    create('p','','Questão: '+(data.question_id||id)),
    create('p','','Tentativa: '+(data.student_answer||'não registrada')),
    create('p','','Abertura de leitura: não cria evento SRS.'));
  (state.querySelector('.bm198-overview')||state).append(info);
  heading.textContent='Resposta aprofundada TRT · '+id+' · 11 seções';
 }catch(e){
  if(currentId!==id||!pane.isConnected)return;
  const retry=btn('Tentar novamente','file','bm197-retry');
  retry.addEventListener('click',()=>{pane.remove();void trtStudy(id);});
  state.replaceChildren(create('p','bm197-error','Falha ao carregar o cartão: '+String(e.message||e)),retry);
 }
}
async function bm242OperationalStudy(id){
 const pane=create('section','bm197-evolutive bm165-trt-study');
 const heading=create('h3','bm197-title','Conteúdo original de '+id+' · 11 módulos');
 const state=create('div','bm197-state','Carregando material…');
 pane.append(heading,state);answer.append(pane);
 try{
  const rec=await window.BM242OperationalCards.loadRecord(id);
  if(currentId!==id||!pane.isConnected||answer.hidden)return;
  if(!window.BM198Format?.render)throw Error('Formatador de 11 módulos indisponível');
  window.BM198Format.render(state,rec,id);
  const sections=state.querySelectorAll('.bm198-module');
  if(sections.length!==11)throw Error('O leitor não exibiu 11 módulos');
  const gallery=create('section','bm242-gallery');
  gallery.append(create('h4','','Galeria de imagens'),
   create('p','','Nenhum arquivo original de imagem vinculado com verificação a este cartão. O arquivo de origem cita um SVG ainda não localizado; nenhuma imagem foi inventada.'));
  const source=create('a','','Consultar cartão original no Drive');
  source.href=rec.original_full_source;source.target='_blank';source.rel='noopener noreferrer';
  gallery.append(source);
  const overview=state.querySelector('.bm198-overview');
  if(!overview)throw Error('Quadro informativo final não localizado');
  overview.before(gallery);
  const history=create('details','bm221-trt-info');
  history.append(create('summary','','Rastreabilidade e situação administrativa'),
   create('p','','ID original: '+id+' · Origem: '+(rec.question_id||'não informada')),
   create('p','','Arquivo fonte do Google Drive preservado. Publicação operacional não corresponde a alteração do Banco Mestre canônico.'),
   create('p','','Abertura de leitura não registra avaliação ou evento SRS.'));
  const linked=(window.BM242Lacunas?.data?.records||[]).filter(x=>x.cardIds?.includes(id));
  history.append(create('p','',linked.length+' lacuna(s) relacionada(s) no cadastro privado.'));
  const see=btn('Ver lacunas vinculadas','link','bm242-related-gaps');
  see.addEventListener('click',()=>{
   hide();document.getElementById('bm242-nav')?.click();
   const query=document.getElementById('bm242-search');
   if(query){query.value=id;window.BM242Lacunas?.render?.();query.focus();}
  });
  history.append(see);
  overview.append(history);
  heading.textContent='Material original '+id+' · 11 módulos';
 }catch(e){
  if(currentId!==id||!pane.isConnected)return;
  const retry=btn('Tentar novamente','file','bm197-retry');
  retry.addEventListener('click',()=>{pane.remove();void bm242OperationalStudy(id)});
  state.replaceChildren(create('p','bm197-error','Falha ao carregar cartão: '+String(e.message||e)),retry);
 }
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
 freeTrtUrls();currentId=id;title.textContent='Cartão '+id;
 front.textContent=c.front||'Pergunta não cadastrada';
 meta.textContent=[c.discipline,c.subject,c.sub].filter(Boolean).join(' › ');
 provenance.textContent=/^TRT0[12]-C\d{3}$/.test(id)?'TRT · registro operacional · não modifica SRS':c.provisional?'Cópia operacional de Ijuí · sem promoção canônica':'Cartão da base original · ID preservado';
 if(window.BM163LeiSeca?.getRecord(id)?.notice)provenance.textContent+=' · referência normativa divergente';
 reveal.setAttribute('aria-expanded','false');
 reveal.replaceChildren(icon('eye'),document.createTextNode('Revelar resposta'));
 answer.hidden=true;answer.replaceChildren();
 lawButton.hidden=!isLegal(c);lawButton.setAttribute('aria-expanded','false');
 lawButton.replaceChildren(icon('book'),document.createTextNode('Mostrar lei seca'));
 lawPanel.hidden=true;lawPanel.replaceChildren();
 status.textContent='Resposta e lei seca iniciam ocultas. Escolha outros cartões na lista lateral.';
 if(window.BM242OperationalCards?.has?.(id)){
  void window.BM242OperationalCards.loadRecord(id).then(rec=>{
   if(currentId!==id||overlay.hidden)return;
   front.textContent=rec.front;
   meta.textContent=[rec.discipline,rec.subject,rec.sub].filter(Boolean).join(' › ');
   provenance.textContent='Cartão operacional de origem PETRO14 · ID original preservado · sem evento SRS';
  }).catch(e=>{if(currentId===id)provenance.textContent='Falha ao consultar cartão original: '+e.message});
 }
 scroll.scrollTop=0;renderRelated();return true;
}
reveal.addEventListener('click',()=>{
 const c=getCard(currentId);if(!c)return;
 answer.hidden=!answer.hidden;
 if(!answer.hidden){
  appendAnswer(c);
  // A seção nasce no próprio leitor, antes da requisição remota.
  if(/^TRT0[12]-C\d{3}$/.test(c.id))void trtStudy(c.id);else if(window.BM242OperationalCards?.has?.(c.id))void bm242OperationalStudy(c.id);else bm197ShowEvolution(c);
 }
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
  if(/^TRT0[12]-C\d{3}$/.test(c.id))void trtLaw(c.id);else renderLaw(window.BM163LeiSeca?.getRecord(currentId),c);
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