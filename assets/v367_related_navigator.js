/* Banco Mestre V331 — Consulta de referências na lateral e abertura principal por ícone.
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
 let active='',rootId='',stack=[],selection='',scope='near',limit=35,lastCards=null,lastLegal=[],lastLoadedCount=-1,cardsIndex=new Map(),favorites=new Set(),observer=null,refreshPending=false;
 let sidebarMode='search',returnSearch=null,searchScrollTop=0;
 const api=()=>window.BancoMestreVisualizarCardV050;
 const card=id=>cardsIndex.get(id)||null;
 function loadIndex(){
  const loaded=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
  const legal=window.BM225LegalTaxonomy?.all?.()||[];
  if(lastCards===loaded&&lastLoadedCount===loaded.length&&lastLegal.length===legal.length&&legal.every((c,i)=>c===lastLegal[i]))return;
  cardsIndex=new Map([...loaded,...legal].filter(c=>CARD_ID.test(c?.id||'')).map(c=>[c.id,c]));
  lastCards=loaded;lastLoadedCount=loaded.length;lastLegal=legal.slice();
 }
 function relatedIds(id){
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
  return result;
 }
 const searchCache=new WeakMap(),collator=new Intl.Collator('pt-BR',{numeric:true});
 function searchRecord(c){
  const fields=[c.id,c.front,c.subject,c.sub,c.discipline],cached=searchCache.get(c);
  if(cached&&fields.every((x,i)=>x===cached.fields[i]))return cached;
  const data={fields,id:norm(c.id),subject:norm(c.subject),discipline:norm(c.discipline),text:norm(fields.join(' '))};
  searchCache.set(c,data);return data;
 }
 function available(){
  loadIndex();
  const current=card(active),currentData=current?searchRecord(current):null,mentioned=new Set(relatedIds(active));
  const q=norm(search?.value||'').trim(),ranked=[];
  for(const x of cardsIndex.values()){
   const d=searchRecord(x),sameSubject=!!(currentData?.subject&&d.subject===currentData.subject),sameDiscipline=!!(currentData?.discipline&&d.discipline===currentData.discipline),isMentioned=mentioned.has(x.id);
   if(q){if((scope==='fav'&&!favorites.has(x.id))||!d.text.includes(q))continue;}
   else if(scope==='refs'&&!isMentioned||scope==='near'&&(x.id===active||!sameSubject&&!isMentioned)||scope==='discipline'&&!sameDiscipline||scope==='fav'&&!favorites.has(x.id))continue;
   const rank=d.id===q?-150:x.id===active?-100:isMentioned?-30:sameSubject?-20:sameDiscipline?-10:0;
   ranked.push({x,rank});
  }
  ranked.sort((a,b)=>a.rank-b.rank||collator.compare(a.x.id,b.x.id));return ranked.map(e=>e.x);
 }
 function updateButtons(){
  if(back)back.disabled=!stack.length;
  if(original){original.disabled=!rootId||active===rootId;original.title=rootId?'Voltar ao cartão '+rootId:'Nenhum cartão original nesta janela';}
  if(headerReturn){headerReturn.hidden=!rootId||active===rootId;headerReturn.disabled=!rootId||active===rootId;
   headerReturn.title=rootId?'Voltar ao cartão original '+rootId:'Nenhum cartão original';}
  if(originalName)originalName.textContent=rootId?'Origem: '+rootId+(active!==rootId?' · Atual: '+active:''):'Selecione um cartão';
 }
 // V324: apenas uma superfície lateral, alternando lista e leitura sem duplicar regiões.
 function switchSidebarView(mode,{focus=false}={}){
  if(!aside)return;
  const reading=mode==='card';
  if(reading&&sidebarMode!=='card'&&list)searchScrollTop=list.scrollTop;
  sidebarMode=reading?'card':'search';
  aside.classList.toggle('bm324-card-view',reading);
  aside.classList.toggle('bm324-search-view',!reading);
  if(returnSearch)returnSearch.hidden=!reading;
  const heading=aside.querySelector('.bm317-side-title');
  if(heading)heading.textContent=reading?'Cartão '+(selection||''):'Pesquisar cartões';
  if(!reading){
   if(list)list.scrollTop=searchScrollTop;
   if(focus&&search)search.focus({preventScroll:true});
  }
 }
 function showPreview(id,{reveal=false}={}){
  loadIndex();const c=card(id);
  if(!preview)return false;
  selection=c?id:'';preview.replaceChildren();
  if(!c){
   switchSidebarView('search');
   preview.append(make('p','bm317-empty-preview','Escolha um cartão da lista para ler a pergunta e consultar seu verso na lateral.'));
   syncSelection();return false;
  }
  switchSidebarView('card');
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
  preview.append(make('p','bm317-preview-meta',(window.BM349?.has(id)?[c.discipline,c.subject]:[c.discipline,c.subject,c.sub]).filter(Boolean).join(' › ')||'Assunto não informado'));
  preview.append(make('p','bm317-preview-question',c.front||'Pergunta não cadastrada'));
  const fold=make('details','bm317-preview-answer');
  fold.open=reveal;
  const summ=make('summary','','Verso do cartão · consultar sem registrar revisão');
  fold.append(summ);
  if(!window.BM349?.has(id)){
   let built=false;
   const revealOriginal=()=>{if(built||!fold.open)return;built=true;
    fold.append(make('div','bm317-preview-answer-text',c.back||'Verso não disponível nesta prévia.'));
    for(const [label,value] of [['Explicação registrada',c.expl],['Macete registrado',c.mnemonic],['Referência original',c.reference]]){
     if(typeof value!=='string'||!value.trim())continue;
     const entry=make('div','bm319-preview-info');entry.append(make('strong','',label),make('p','',value));fold.append(entry);
    }
   };
   fold.addEventListener('toggle',revealOriginal);if(reveal)revealOriginal();
  }
  if(window.BM349?.has(id)){const q=preview.querySelector('.bm317-preview-question');const f=make('div','bm349-front-media');q?.after(f);void window.BM349.load().then(()=>{if(selection!==id||!f.isConnected)return;q.textContent=window.BM349.get(id).front;void window.BM349.renderFront(f,id);}).catch(console.warn);const read=make('div','bm349-side-answer');fold.replaceChildren(summ,read);const load=()=>{if(fold.open&&selection===id&&!read.querySelector('[data-bm349-card]'))void window.BM349.renderAnswer(read,id);};fold.addEventListener('toggle',load);if(reveal)queueMicrotask(load);}
  preview.append(fold);
  // V322: também permite seguir os vínculos documentados a partir da própria prévia.
  // Esses cliques nunca promovem o cartão para a janela principal.
  const linked=relatedIds(id).filter(x=>x!==id&&card(x));
  let relatedBox=null;
  if(linked.length){
   relatedBox=make('details','bm322-preview-related');
   relatedBox.append(make('summary','','Cartões relacionados a '+id+' ('+linked.length+')'));
   const links=make('div','bm322-related-list');
   for(const nextId of linked){
    const next=card(nextId);
    const b=make('button','bm322-related-link',
     nextId+' · '+String(next?.sub||next?.subject||next?.front||'Consultar').slice(0,76));
    b.type='button';b.dataset.cardId=nextId;
    b.setAttribute('aria-label','Ler '+nextId+' nesta lateral');
    b.addEventListener('click',e=>{
     e.preventDefault();e.stopPropagation();
     showPreview(nextId,{reveal:false});
    });
    links.append(b);
   }
   relatedBox.append(links);
  }
  // Aprofundamento por demanda: o cartão da direita e o SRS não são alterados.
  if(/^CARD-\d{4,}$/.test(id)&&!window.BM349?.has(id)){
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
      const block=make('div','bm319-layer');
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
  // V331: vínculos recolhíveis aparecem após o bloco dos 11 módulos.
  if(relatedBox)preview.append(relatedBox);
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
  // Sem reconstruir a lista: o segundo, terceiro e demais cliques continuam
  // apontando aos mesmos botões e a rolagem permanece estável.
  syncSelection();return true;
 }
 function syncSelection(){
  if(!list)return;
  for(const button of list.querySelectorAll('button.bm317-result[data-card-id]')){
   const selected=button.dataset.cardId===selection;
   if(selected)button.setAttribute('aria-current','true');
   else button.removeAttribute('aria-current');
  }
 }
 function renderList(){
  if(!list)return;
  const data=available();count.textContent=data.length+' cartão'+(data.length===1?'':'ões')+' encontrado'+(data.length===1?'':'s');
  const scrollTop=list.scrollTop,scrollLeft=list.scrollLeft;
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
  list.scrollTop=scrollTop;list.scrollLeft=scrollLeft;
  syncSelection();
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
  active=id;selection='';limit=35;updateButtons();renderList();switchSidebarView('search');
 }
 function navigate(id,mode='forward'){
  if(!CARD_ID.test(id))return false;
  loadIndex();if(!card(id)||!api()?.showId)return false;
  const from=api().currentId;
  if(id===from){reopenSidebar();showPreview(id);return true;}
  const before={active,rootId,stack:[...stack]};
  if(mode==='root'){stack=[];}
  else if(mode==='back'){stack.pop();}
  else if(from&&stack.at(-1)!==from)stack.push(from);
  if(!rootId)rootId=from||id;
  const ok=api().showId(id);
  if(!ok){active=before.active;rootId=before.rootId;stack=before.stack;return false}
  active=id;selection='';limit=35;updateButtons();renderList();reopenSidebar();switchSidebarView('search');
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
  returnSearch=make('button','bm324-back-search','← Pesquisa');returnSearch.type='button';returnSearch.hidden=true;
  returnSearch.setAttribute('aria-label','Voltar aos resultados de pesquisa preservando busca e filtros');
  returnSearch.addEventListener('click',()=>switchSidebarView('search',{focus:true}));
  head.append(returnSearch);
  const tools=make('div','bm317-side-nav');
  back=make('button','bm317-back','← Anterior');back.type='button';
  original=make('button','bm317-original','↶ Original');original.type='button';
  back.addEventListener('click',backOne);original.addEventListener('click',toOriginal);
  tools.append(back,original);
  originalName=make('p','bm317-origin');
  const field=make('label','bm317-search-label');field.append(make('span','', 'Pesquisar por ID, assunto ou pergunta'));
  search=make('input','bm317-search');search.type='search';search.placeholder='Buscar em todos os cartões · ID ou conceito';
  search.autocomplete='off';search.setAttribute('aria-label','Buscar cartão na lateral');
  let searchFrame=0;search.addEventListener('input',()=>{limit=35;if(searchFrame)return;searchFrame=requestAnimationFrame(()=>{searchFrame=0;renderList()})});
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
  const bottom=make('div','bm317-preview');bottom.setAttribute('aria-label','Leitura lateral do cartão referenciado');
  bottom.append(make('h4','bm317-preview-label','Cartão na lateral'));
  preview=make('div','bm317-preview-content');
  bottom.append(preview);
  const top=make('div','bm317-top');top.append(head,tools,originalName,field,tabs,count);
  aside.replaceChildren(top,list,more,bottom);
  updateButtons();showPreview('');return true;
 }
 function schedule(){if(refreshPending)return;refreshPending=true;queueMicrotask(()=>{refreshPending=false;update()})}
 
 // V321 — Links da seção Cartões relacionados devem abrir prévia lateral.
 // A seta ↗ é a única ação explícita para substituir o cartão principal.
 function relatedClickCapture(event){
  const target=event.target;
  const link=target?.closest?.('button.bm305-relation-link');
  if(!link||!link.closest('.bm305-relations'))return;
  const id=String(link.textContent||'').split('·')[0].trim().toUpperCase();
  if(!CARD_ID.test(id))return;
  loadIndex();
  if(!card(id))return;
  const reader=api();
  if(!reader?.showId)return;
  if(!reader.visible){
   const source=link.closest('#cardRows article.card');
   if(!source)return;
   const sourceId=String(source.dataset.bm305Id||
    source.querySelector(':scope > .tag')?.textContent||'').trim().toUpperCase();
   if(!CARD_ID.test(sourceId))return;
   // O original abre no leitor principal; o cartão clicado ocupa a lateral.
   rootId='';active='';stack=[];selection='';
   if(!reader.showId(sourceId,link))return;
  }
  update();
  reopenSidebar();
  if(!showPreview(id,{reveal:false}))return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
 }

 function boot(){
  overlay=document.getElementById('bmCardPeekV050');
  if(!overlay||!createSidebar())return false;
  document.addEventListener('click',relatedClickCapture,true);
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
   showPreview(id,{reveal:false});
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
  preview:id=>showPreview(id),openReferenced:id=>{reopenSidebar();return showPreview(id,{reveal:false})},get selectedId(){return selection},openInMain:id=>navigate(id,'forward'),
  goBack:backOne,goOriginal:toOriginal,showSidebar:reopenSidebar,
  get mounted(){return started}
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();