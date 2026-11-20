/* Banco Mestre V319 — Consulta de referências na lateral e abertura principal por ícone.
 * Não modifica cartões, versões, referências, avaliações nem SRS.
 * Usa exclusivamente cartões carregados nesta sessão; favoritos são temporários.
 */
(function(){
 'use strict';
 if(window.BM317RelatedNavigator)return;
 const CARD_ID=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Z0-9_-]+|TRT0[12]-C\d{3}|PETRO\d+-C\d{3})$/i;
 const TOKENS=/\b(?:CARD-\d{4,}|PROP-IJUI-\d+|IJUI-[A-Z0-9_-]+|TRT0[12]-C\d{3}|PETRO\d+-C\d{3})\b/gi;
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const make=(t,cls,txt)=>{
  const e=document.createElement(t);if(cls)e.className=cls;
  if(txt!==undefined)e.textContent=String(txt);return e;
 };
 let overlay=null,aside=null,panel=null,title=null,answer=null,toolbar=null,search=null,list=null,preview=null,count=null,more=null,back=null,original=null,originalName=null,headerReturn=null;
 let active='',rootId='',stack=[],selection='',scope='near',limit=35,lastIndexCount=0,refCache=new Map(),cardsIndex=new Map(),favorites=new Set(),observer=null,refreshPending=false;
 const api=()=>window.BancoMestreVisualizarCardV050;
 const card=id=>cardsIndex.get(id)||null;
 function loadIndex(){
  const loaded=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
  const legal=window.BM225LegalTaxonomy?.all?.()||[];
  if(cardsIndex.size&&lastIndexCount===loaded.length+legal.length)return;
  cardsIndex=new Map([...loaded,...legal].filter(c=>CARD_ID.test(c?.id||'')).map(c=>[c.id,c]));
  lastIndexCount=loaded.length+legal.length;refCache.clear();
 }
 function relatedIds(id){
  if(refCache.has(id))return refCache.get(id);
  const c=card(id);if(!c)return [];
  const ids=new Set();
  const explicit=[c.related_card_ids,c.relatedCardIds,c.related_ids,c.card_relations,c.links,c.related];
  for(const x of explicit){
   if(Array.isArray(x))for(const v of x){
    const s=typeof v==='string'?v:v?.id||v?.cardId||v?.target_id||'';
    if(CARD_ID.test(s)&&s!==id&&card(s))ids.add(s);
   }
  }
  // Apenas menções de IDs exatos presentes no conteúdo do cartão, sem inferir vínculo técnico.
  const texts=[c.front,c.back,c.expl,c.mnemonic,c.reference].filter(x=>typeof x==='string');
  for(const t of texts){
   if(t.length>30000)continue;
   for(const match of t.matchAll(TOKENS)){
    const v=match[0].toUpperCase();
    if(v!==id&&card(v))ids.add(v);
   }
  }
  const result=[...ids].sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true}));
  refCache.set(id,result);return result;
 }
 function available(){
  loadIndex();
  const c=card(active),all=[...cardsIndex.values()],mentioned=new Set(relatedIds(active));
  const sameSubject=x=>!!(c&&x.subject&&c.subject&&norm(x.subject)===norm(c.subject));
  const sameDiscipline=x=>!!(c&&x.discipline&&c.discipline&&norm(x.discipline)===norm(c.discipline));
  let source;
  if(scope==='refs')source=all.filter(x=>mentioned.has(x.id));
  else if(scope==='near')source=all.filter(x=>x.id!==active&&(sameSubject(x)||mentioned.has(x.id)));
  else if(scope==='discipline')source=all.filter(x=>sameDiscipline(x));
  else if(scope==='fav')source=all.filter(x=>favorites.has(x.id));
  else source=all;
  const q=norm(search?.value||'').trim();
  if(q){const pool=scope==='fav'?source:all;
   source=pool.filter(x=>norm([x.id,x.front,x.subject,x.sub,x.discipline].join(' ')).includes(q));
  }
  const preferred=x=>norm(x.id)===q?-150:x.id===active?-100:mentioned.has(x.id)?-30:sameSubject(x)?-20:sameDiscipline(x)?-10:0;
  source.sort((a,b)=>preferred(a)-preferred(b)||a.id.localeCompare(b.id,'pt-BR',{numeric:true}));
  return source;
 }
 function updateButtons(){
  if(back)back.disabled=!stack.length;
  if(original){original.disabled=!rootId||active===rootId;original.title=rootId?'Voltar ao cartão '+rootId:'Nenhum cartão original nesta janela';}
  if(headerReturn){headerReturn.hidden=!rootId||active===rootId;headerReturn.disabled=!rootId||active===rootId;
   headerReturn.title=rootId?'Voltar ao cartão original '+rootId:'Nenhum cartão original';}
  if(originalName)originalName.textContent=rootId?'Origem: '+rootId+(active!==rootId?' · Atual: '+active:''):'Selecione um cartão';
 }
 function showPreview(id,{reveal=false}={}){
  loadIndex();const c=card(id);
  if(!preview)return false;
  selection=c?id:'';preview.replaceChildren();
  if(!c){
   preview.append(make('p','bm317-empty-preview','Escolha um cartão da lista para ler a pergunta e consultar seu verso na lateral.'));
   renderList();return false;
  }
  const header=make('div','bm317-preview-header');
  header.append(make('strong','',c.id));
  const fav=make('button','bm317-favorite',favorites.has(id)?'★ Favorito':'☆ Favoritar');
  fav.type='button';fav.title='Favorito temporário nesta aba';
  fav.setAttribute('aria-pressed',String(favorites.has(id)));
  fav.addEventListener('click',()=>{
   if(favorites.has(id))favorites.delete(id);else favorites.add(id);
   showPreview(id,{reveal});
  });
  header.append(fav);preview.append(header);
  preview.append(make('p','bm317-preview-meta',[c.discipline,c.subject,c.sub].filter(Boolean).join(' › ')||'Assunto não informado'));
  preview.append(make('p','bm317-preview-question',c.front||'Pergunta não cadastrada'));
  const fold=make('details','bm317-preview-answer');
  fold.open=reveal;
  const summ=make('summary','','Verso do cartão · consultar sem registrar revisão');
  const text=make('div','bm317-preview-answer-text',c.back||'Verso não disponível nesta prévia.');
  fold.append(summ,text);
  for(const [label,value] of [['Explicação registrada',c.expl],['Macete registrado',c.mnemonic],['Referência original',c.reference]]){
   if(typeof value!=='string'||!value.trim())continue;
   const entry=make('section','bm319-preview-info');
   entry.append(make('strong','',label),make('p','',value));fold.append(entry);
  }
  preview.append(fold);
  // Aprofundamento por demanda: o cartão da direita e o SRS não são alterados.
  if(/^CARD-\d{4,}$/.test(id)){
   const deep=make('details','bm319-layers');
   const head=make('summary','','Consultar os 11 módulos completos nesta lateral');
   const host=make('div','bm319-layers-body');
   deep.append(head,host);preview.append(deep);
   let started=false;
   const load=async()=>{
    host.replaceChildren(make('p','bm319-layers-state','Carregando módulos do cartão…'));
    try{
     let record=await window.BM276LayerData?.get?.(id);
     if(!record){
      record=await window.BM194VersosPublicos?.load?.(id);
      if(record&&window.BM199Reauditoria?.enrich)record=await window.BM199Reauditoria.enrich(id,record);
     }
     if(!deep.isConnected||selection!==id)return;
     const layers=record?.layers;
     if(!Array.isArray(layers)||layers.length!==11||
        layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))
      throw Error('Os 11 módulos não estão disponíveis para este ID na fonte pública.');
     host.replaceChildren();
     for(const layer of layers){
      const block=make('section','bm319-layer');
      block.append(make('h5','',String(layer.ord).padStart(2,'0')+' · '+layer.titulo),
                   make('p','',layer.texto));
      host.append(block);
     }
    }catch(error){
     if(!deep.isConnected||selection!==id)return;
     const err=make('p','bm319-layers-state','Não foi possível carregar o aprofundamento: '+String(error?.message||error));
     const retry=make('button','bm319-layers-retry','Tentar novamente');
     retry.type='button';retry.addEventListener('click',load);
     host.replaceChildren(err,retry);
    }
   };
   deep.addEventListener('toggle',()=>{if(deep.open&&!started){started=true;void load();}});
  }
  const actions=make('div','bm317-preview-actions');
  const open=make('button','bm317-primary','↗ Abrir na janela principal');
  open.type='button';open.addEventListener('click',()=>navigate(id,'forward'));
  const copy=make('button','bm317-copy','Copiar ID');
  copy.type='button';copy.addEventListener('click',async()=>{
   try{await navigator.clipboard.writeText(id);copy.textContent='ID copiado'}
   catch{copy.textContent='Selecione o ID para copiar'}
  });
  actions.append(open,copy);preview.append(actions);
  preview.append(make('small','bm317-preview-note','Leitura lateral independente: não substitui o cartão principal nem registra avaliação SRS.'));
  const scrollArea=preview.closest('.bm317-preview');
  if(scrollArea)scrollArea.scrollTop=0;
  renderList();return true;
 }
 function renderList(){
  if(!list)return;
  const data=available();count.textContent=data.length+' cartão'+(data.length===1?'':'ões')+' encontrado'+(data.length===1?'':'s');
  list.replaceChildren();
  for(const c of data.slice(0,limit)){
   // Botões irmãos: ler na lateral OU abrir na janela principal, sem botão dentro de botão.
   const item=make('div','bm319-result-item');
   item.setAttribute('role','listitem');
   const b=make('button','bm317-result');
   b.type='button';b.dataset.cardId=c.id;
   b.setAttribute('aria-label','Ler '+c.id+' na lateral sem alterar o cartão principal');
   if(c.id===selection)b.setAttribute('aria-current','true');
   const row=make('span','bm317-result-row');
   row.append(make('strong','bm317-result-id',c.id));
   if(favorites.has(c.id))row.append(make('span','bm317-result-star','★'));
   if(c.id===active)row.append(make('small','bm317-result-active','Aberto'));
   row.append(make('small','bm317-result-topic',c.sub||c.subject||''));
   b.append(row,make('span','bm317-result-question',c.front||'Pergunta indisponível'));
   b.addEventListener('click',()=>showPreview(c.id));
   const open=make('button','bm319-result-open','↗');
   open.type='button';
   open.title='Abrir '+c.id+' na janela principal';
   open.setAttribute('aria-label','Abrir '+c.id+' na janela principal');
   open.addEventListener('click',()=>navigate(c.id,'forward'));
   item.append(b,open);list.append(item);
  }
  if(!data.length)list.append(make('p','bm317-empty','Nenhum cartão para este filtro. Experimente Todos ou pesquise o ID exato.'));
  if(more){
   more.hidden=data.length<=limit;
   more.textContent='Mostrar mais ('+Math.min(35,Math.max(0,data.length-limit))+' próximos)';
  }
 }
 function reopenSidebar(){
  if(!panel)return;
  panel.classList.remove('bm165-sidebar-hidden');
  const toggle=overlay.querySelector('.bm165-toggle-sidebar');
  if(toggle){toggle.setAttribute('aria-expanded','true');toggle.title='Ocultar pesquisa e prévia de cartões';}
 }
 function update(){
  if(!api()?.visible){active='';rootId='';stack=[];selection='';updateButtons();return}
  const id=api()?.currentId||'';
  if(!CARD_ID.test(id)||id===active)return;
  if(!rootId)rootId=id;
  else if(active&&active!==id&&stack.at(-1)!==active)stack.push(active);
  active=id;selection='';limit=35;updateButtons();renderList();
 }
 function navigate(id,mode='forward'){
  if(!CARD_ID.test(id))return false;
  loadIndex();if(!card(id)||!api()?.showId)return false;
  const from=api().currentId;
  if(id===from)return true;
  const before={active,rootId,stack:[...stack]};
  if(mode==='root'){stack=[];}
  else if(mode==='back'){stack.pop();}
  else if(from&&stack.at(-1)!==from)stack.push(from);
  if(!rootId)rootId=from||id;
  const ok=api().showId(id);
  if(!ok){active=before.active;rootId=before.rootId;stack=before.stack;return false}
  active=id;selection='';limit=35;updateButtons();renderList();reopenSidebar();
  return true;
 }
 function backOne(){return stack.length?navigate(stack.at(-1),'back'):false}
 function toOriginal(){return rootId&&rootId!==api()?.currentId?navigate(rootId,'root'):false}
 function createSidebar(){
  aside=overlay.querySelector('.bm165-related');
  panel=overlay.querySelector('.bm165-panel');
  if(!aside||!panel)return false;
  const headNav=overlay.querySelector('.bm165-header-nav');
  if(headNav&&!headNav.querySelector('.bm317-header-return')){
   headerReturn=make('button','bm317-header-return','↶ Original');headerReturn.type='button';
   headerReturn.setAttribute('aria-label','Voltar diretamente ao cartão original');
   headerReturn.addEventListener('click',toOriginal);
   const closer=headNav.querySelector('.bm-v050-peek-close');
   headNav.insertBefore(headerReturn,closer||headNav.firstChild);
  }
  const toggle=overlay.querySelector('.bm165-toggle-sidebar');
  if(toggle){const text=[...toggle.childNodes].find(n=>n.nodeType===3);if(text)text.textContent=' Pesquisa / prévia';
   toggle.title='Mostrar pesquisa e prévia de cartões';}
  aside.setAttribute('aria-label','Pesquisar e pré-visualizar cartões relacionados');
  const head=make('div','bm317-side-header');
  head.append(make('h3','bm317-side-title','Pesquisar cartões'));
  const tools=make('div','bm317-side-nav');
  back=make('button','bm317-back','← Anterior');back.type='button';
  original=make('button','bm317-original','↶ Original');original.type='button';
  back.addEventListener('click',backOne);original.addEventListener('click',toOriginal);
  tools.append(back,original);
  originalName=make('p','bm317-origin');
  const field=make('label','bm317-search-label');field.append(make('span','', 'Pesquisar por ID, assunto ou pergunta'));
  search=make('input','bm317-search');search.type='search';search.placeholder='Buscar em todos os cartões · ID ou conceito';
  search.autocomplete='off';search.setAttribute('aria-label','Buscar cartão na lateral');
  search.addEventListener('input',()=>{limit=35;renderList()});
  search.addEventListener('keydown',e=>{
   if(e.key==='Enter'){
    const matches=available();
    if(matches.length){e.preventDefault();showPreview(matches[0].id)}
   }
  });
  field.append(search);
  const tabs=make('div','bm317-filters');
  const filters=[['near','Assunto'],['refs','Mencionados'],['discipline','Disciplina'],['all','Todos'],['fav','★']];
  const buttons=[];
  for(const [value,name] of filters){
   const b=make('button','bm317-filter',name);b.type='button';b.dataset.scope=value;
   b.setAttribute('aria-pressed',String(value===scope));
   b.addEventListener('click',()=>{
    scope=value;limit=35;
    for(const x of buttons)x.setAttribute('aria-pressed',String(x.dataset.scope===scope));
    renderList();
   });
   buttons.push(b);tabs.append(b);
  }
  count=make('small','bm317-count');
  list=make('div','bm317-list');list.setAttribute('role','list');
  more=make('button','bm317-more','Mostrar mais');more.type='button';more.hidden=true;
  more.addEventListener('click',()=>{limit+=35;renderList()});
  const bottom=make('section','bm317-preview');bottom.setAttribute('aria-label','Leitura lateral do cartão referenciado');
  bottom.append(make('h4','bm317-preview-label','Cartão na lateral'));
  preview=make('div','bm317-preview-content');
  bottom.append(preview);
  const top=make('div','bm317-top');top.append(head,tools,originalName,field,tabs,count);
  aside.replaceChildren(top,list,more,bottom);
  updateButtons();showPreview('');return true;
 }
 function schedule(){if(refreshPending)return;refreshPending=true;queueMicrotask(()=>{refreshPending=false;update()})}
 function boot(){
  overlay=document.getElementById('bmCardPeekV050');
  if(!overlay||!createSidebar())return false;
  title=overlay.querySelector('#bmCardPeekTitleV050');
  answer=overlay.querySelector('.bm-v050-peek-answer');
  // Handler em captura: permite voltar ao original mesmo após navegar por referências em módulos.
  if(answer)answer.addEventListener('click',e=>{
   const b=e.target.closest?.('button.media-ref,[data-reference-card-id],a[data-card-ref],a[href^="#cartao="]');
   if(!b||!answer.contains(b))return;
   const raw=b.dataset.referenceCardId||b.dataset.cardRef||
    (b.getAttribute('href')||'').replace(/^#cartao=/,'')||b.textContent.trim();
   const id=String(raw).trim().toUpperCase();
   if(!CARD_ID.test(id))return;
   loadIndex();if(!card(id))return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
   reopenSidebar();
   showPreview(id,{reveal:true});
  },true);
  observer=new MutationObserver(schedule);
  observer.observe(overlay,{attributes:true,attributeFilter:['hidden']});
  if(title)observer.observe(title,{childList:true,subtree:true});
  update();
  return true;
 }
 let started=false;
 function init(){
  if(started)return;
  if(boot()){started=true;return}
  const ob=new MutationObserver(()=>{if(boot()){started=true;ob.disconnect()}});
  ob.observe(document.body,{childList:true,subtree:true});
 }
 window.BM317RelatedNavigator=Object.freeze({
  get originId(){return rootId},get activeId(){return api()?.currentId||''},
  get history(){return [...stack]},get favorites(){return [...favorites]},
  preview:id=>showPreview(id),openReferenced:id=>{reopenSidebar();return showPreview(id,{reveal:true})},openInMain:id=>navigate(id,'forward'),
  goBack:backOne,goOriginal:toOriginal,showSidebar:reopenSidebar,
  get mounted(){return started}
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();