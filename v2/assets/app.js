import {loadSnapshot,loadPublicCards,approvedDocumentUrl} from './data.js';

const $ = id => document.getElementById(id);
const state = {snapshot:null,cards:null,cardLoading:null,view:'overview',
  cardsLimit:40,imagesLimit:40,errors:[]};
const sections = Object.freeze({
  overview:'Visão geral',cards:'Cartões',images:'Atlas de imagens',
  pdfs:'Biblioteca PDF',sync:'Sincronização'
});
function node(tag, className='', content='') {
  const n=document.createElement(tag);
  if(className) n.className=className;
  if(content!==undefined && content!==null) n.textContent=String(content);
  return n;
}
function append(parent,...children){parent.append(...children);return parent}
function empty(parent,message) {
  parent.replaceChildren(node('div','empty',message));
}
function status(message,warning=false) {
  const box=$('notice');box.textContent=message;
  box.classList.toggle('is-warning',warning);
}
function fmt(n){return Number(n).toLocaleString('pt-BR')}
function check(title,detail,kind='ok') {
  const outer=node('div','check '+kind);
  append(outer,node('strong','',title),node('span','',detail));return outer;
}
function setView(view) {
  if(!sections[view])return;
  state.view=view;
  document.querySelectorAll('.view').forEach(section=>{
    const visible=section.id==='view-'+view;
    section.hidden=!visible;section.classList.toggle('is-visible',visible);
  });
  document.querySelectorAll('.nav-button').forEach(button=>{
    const active=button.dataset.view===view;
    button.classList.toggle('is-active',active);
    if(active)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
  $('pageTitle').textContent=sections[view];
  if(view==='cards') void showCards();
  if(view==='images')showImages();
  if(view==='pdfs')showPdfs();
  if(view==='sync')showSync();
}
function renderOverview() {
  const s=state.snapshot;if(!s)return;
  const entries=[
    [s.cardCount,'Cartões públicos V194','1.501 ativos · 17 históricos inativos'],
    [s.imageCount,'Imagens editoriais V198','85 de cartão · 94 de conteúdo'],
    [s.pdfCount,'Documentos PDF V149','Referências por ID aos originais do Drive']
  ];
  const target=$('overviewStats');target.replaceChildren();
  for(const [value,label,detail] of entries){
    const box=node('div','stat');
    append(box,node('strong','',fmt(value)),node('span','',label),node('p','muted',detail));target.append(box);
  }
  const checks=$('checks');checks.replaceChildren(
    check('GitHub — catálogos consistentes','V194 (1.518 cartões), V198 (179 imagens) e V149 (78 PDFs): estrutura e contagem conferidas.'),
    check('IDs editoriais sem duplicação','IDs de imagens e documentos conferidos nos catálogos públicos.'),
    check('Pastas canônicas V202 verificadas no contrato','Destino de imagens e destino de checkpoints conferidos por folder_id.'),
    check('Acesso aos arquivos no Drive não homologado','OAuth, permissões, miniaturas e abertura real de cada documento exigem teste autenticado.','pending'),
    check('Dados pessoais preservados','Esta prévia não lê nem grava SRS, grifos, respostas discursivas ou preferências locais.','pending')
  );
}
async function ensureCards() {
  if(state.cards)return state.cards;
  if(!state.snapshot) return [];
  if(state.cardLoading)return state.cardLoading;
  state.cardLoading=loadPublicCards(state.snapshot.meta).then(cards=>{
    state.cards=cards;return cards;
  }).finally(()=>{state.cardLoading=null});
  return state.cardLoading;
}
async function showCards() {
  if(!state.snapshot){empty($('cardsList'),'Os catálogos ainda não estão disponíveis.');return}
  if(!state.cards){
    empty($('cardsList'),'Carregando e validando os sete lotes públicos de cartões...');
    try{await ensureCards()}catch(error){
      empty($('cardsList'),'Não foi possível validar a base de cartões: '+error.message);
      status('Falha na leitura pública dos cartões. Nenhum dado foi modificado.',true);return;
    }
  }
  renderCards();
}
function renderCards() {
  if(!state.cards)return;
  const query=$('cardQuery').value.trim().toLocaleLowerCase('pt-BR');
  const showInactive=$('showInactive').checked;
  const matches=state.cards.filter(c=>
    (showInactive || c.active!==false) &&
    (!query || [c.id,c.front,c.discipline,c.subject,c.sub,c.reference].some(x=>String(x||'').toLocaleLowerCase('pt-BR').includes(query)))
  );
  $('cardsCounter').textContent=fmt(matches.length)+' encontrados';
  const list=$('cardsList');list.replaceChildren();
  if(!matches.length){empty(list,'Nenhum cartão encontrado para os filtros atuais.');$('moreCards').hidden=true;return}
  for(const card of matches.slice(0,state.cardsLimit)) {
    const item=node('article','item');
    const header=node('div','item-header');
    append(header,node('div','meta',card.id+' · '+(card.discipline||'Disciplina não informada')+' / '+(card.subject||'')),
      node('span','tag '+(card.active!==false?'card':''),card.active!==false?'Ativo':'Histórico inativo'));
    append(item,header,node('h3','item-title',card.front||'Pergunta não informada'));
    const actions=node('div','item-actions');
    const reveal=node('button','','Mostrar resposta');reveal.type='button';
    reveal.setAttribute('aria-expanded','false');
    const answer=node('div','answer');answer.hidden=true;
    append(answer,node('h4','','Verso original'),node('p','',card.back||'Sem verso publicado'));
    if(card.expl)append(answer,node('h4','','Explicação'),node('p','',card.expl));
    if(card.mnemonic)append(answer,node('h4','','Macete'),node('p','',card.mnemonic));
    reveal.addEventListener('click',()=>{
      answer.hidden=!answer.hidden;
      reveal.textContent=answer.hidden?'Mostrar resposta':'Ocultar resposta';
      reveal.setAttribute('aria-expanded',String(!answer.hidden));
    });
    append(actions,reveal);append(item,actions,answer);list.append(item);
  }
  const more=$('moreCards');more.hidden=matches.length<=state.cardsLimit;
  if(!more.hidden)more.textContent='Mostrar mais ('+fmt(matches.length-state.cardsLimit)+' restantes)';
}
function evidenceLabel(basis) {
  if(basis==='associacao_documental_existente')return 'Vínculo documental';
  if(basis==='questao_documentada_conciliada_com_cartao')return 'Questão conciliada';
  if(basis==='correspondencia_didatica_especifica')return 'Associação didática';
  if(basis==='sem_cartao_correspondente')return 'Sem vínculo identificado';
  return 'Origem editorial: '+(basis||'não informada');
}
function openCard(id) {
  $('cardQuery').value=id;state.cardsLimit=40;setView('cards');
  $('cardQuery').focus();
}
function showImages() {
  const s=state.snapshot;
  if(!s){empty($('imagesList'),'Catálogo ainda não disponível.');return}
  const query=$('imageQuery').value.trim().toLocaleLowerCase('pt-BR');
  const type=$('imageType').value;
  const matches=s.editorial.records.filter(x=>
    (type==='all'||x.type===type) &&
    (!query||[x.imageId,x.title,x.subtype,...(x.cardIds||[])].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(query)))
  );
  $('imagesCounter').textContent=fmt(matches.length)+' de '+fmt(s.imageCount);
  const list=$('imagesList');list.replaceChildren();
  if(!matches.length){empty(list,'Nenhuma imagem correspondente.');$('moreImages').hidden=true;return}
  for(const image of matches.slice(0,state.imagesLimit)){
    const item=node('article','item');
    const header=node('div','item-header');
    append(header,node('div','meta',image.imageId+' · '+evidenceLabel(image.basis)),
      node('span','tag '+(image.type==='cartao'?'card':''),image.type==='cartao'?'Imagem de cartão':'Imagem de conteúdo'));
    append(item,header,node('h3','item-title',image.title||image.imageId));
    if(image.subtype)append(item,node('p','muted','Função: '+image.subtype));
    const links=(image.cardIds||[]).filter(Boolean);
    const actions=node('div','item-actions');
    for(const cardId of links.slice(0,5)){
      if(/^CARD-\d+$/.test(cardId)){
        const button=node('button','','Ver '+cardId);button.type='button';
        button.addEventListener('click',()=>openCard(cardId));actions.append(button);
      }else{
        actions.append(node('span','meta','Referência histórica: '+cardId));
      }
    }
    const file=s.recoveredByImageId.get(image.imageId);
    const source=approvedDocumentUrl(file?.source_url);
    if(source){const a=node('a','','Abrir original no Drive');a.href=source;a.target='_blank';a.rel='noopener noreferrer';actions.append(a)}
    if(!source && !links.length)actions.append(node('span','meta','Consulta visual completa disponível na V1'));
    append(item,actions);list.append(item);
  }
  const more=$('moreImages');more.hidden=matches.length<=state.imagesLimit;
  if(!more.hidden)more.textContent='Mostrar mais ('+fmt(matches.length-state.imagesLimit)+' restantes)';
}
function showPdfs() {
  const s=state.snapshot;if(!s){empty($('pdfsList'),'Catálogo ainda não disponível.');return}
  const query=$('pdfQuery').value.trim().toLocaleLowerCase('pt-BR');
  const matches=s.pdf.documents.filter(d=>!query||[d.id,d.title,d.category,d.section,d.filename].some(v=>String(v||'').toLocaleLowerCase('pt-BR').includes(query)));
  $('pdfCounter').textContent=fmt(matches.length)+' de '+fmt(s.pdfCount);
  const list=$('pdfsList');list.replaceChildren();
  if(!matches.length){empty(list,'Nenhum PDF corresponde à pesquisa.');return}
  for(const doc of matches){
    const item=node('article','item');
    append(item,node('div','meta',doc.id+' · '+(doc.category||doc.section||'Biblioteca')),
      node('h3','item-title',doc.title||doc.filename||doc.id));
    if(doc.section)append(item,node('p','muted',doc.section));
    const actions=node('div','item-actions');
    const safeUrl=approvedDocumentUrl(doc.url);
    if(safeUrl){const link=node('a','','Abrir original no Drive');link.href=safeUrl;link.target='_blank';link.rel='noopener noreferrer';actions.append(link)}
    else actions.append(node('span','meta','Endereço do original não validado'));
    append(item,actions);list.append(item);
  }
}
function showSync() {
  const target=$('syncStatus');target.replaceChildren();
  if(!state.snapshot){
    target.append(check('Catálogos indisponíveis','Sem prova de integridade do snapshot da V2.','error'));return;
  }
  target.append(
    check('Catálogos públicos lidos','Cartões V194, imagens V198, PDFs V149 e pastas V202 passaram pelas verificações estruturais.'),
    check('Drive → sessão privada','Não implementado nesta prévia: requer OAuth legítimo e leitura autenticada.','pending'),
    check('Drive → GitHub Pages','Não há publicação automática de novos cartões, imagens ou PDFs. Exige revisão, geração de catálogo e deploy.','pending'),
    check('Checkpoint ZIP + manifesto no Drive','Não criado pela V2. A pasta de destino está apenas identificada e seu ID foi validado no contrato.','pending'),
    check('Renderização e abertura dos originais','Não verificadas no navegador do titular: requer testes funcionais com arquivos reais.','pending')
  );
}
function bindControls() {
  document.querySelectorAll('.nav-button').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  $('cardQuery').addEventListener('input',()=>{state.cardsLimit=40;renderCards()});
  $('showInactive').addEventListener('change',()=>{state.cardsLimit=40;renderCards()});
  $('imageQuery').addEventListener('input',()=>{state.imagesLimit=40;showImages()});
  $('imageType').addEventListener('change',()=>{state.imagesLimit=40;showImages()});
  $('pdfQuery').addEventListener('input',showPdfs);
  $('moreCards').addEventListener('click',()=>{state.cardsLimit+=40;renderCards()});
  $('moreImages').addEventListener('click',()=>{state.imagesLimit+=40;showImages()});
}
async function bootstrap() {
  bindControls();
  try {
    state.snapshot=await loadSnapshot();
    renderOverview();
    status('Catálogos GitHub verificados: 1.518 cartões (V194), 179 imagens (V198), 78 PDFs (V149). Acesso privado ao Drive não foi testado.');
    if(state.view==='cards')void showCards();
    if(state.view==='images')showImages();
    if(state.view==='pdfs')showPdfs();
    if(state.view==='sync')showSync();
  } catch (error) {
    state.errors.push(String(error));
    status('Falha de integridade: '+error.message+'. A V1 segue preservada. Nenhum dado foi alterado.',true);
    $('checks').replaceChildren(check('Carregamento da V2 interrompido',String(error),'error'));
    for(const id of ['imagesList','pdfsList','cardsList'])empty($(id),'Prévia indisponível até validação dos catálogos.');
  }
}
void bootstrap();
