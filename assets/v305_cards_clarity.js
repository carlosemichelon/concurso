/* Portal V305: frente didática com vínculos comprovados, contagens transparentes e fila de imagens pendentes.
 * Dados públicos e fonte autenticada já disponível no navegador, sem publicar origem privada.
 * Não altera IDs, SRS, 11 módulos, imagens ou cartão de lei seca. */
(function(){
'use strict';
if(window.BM305CardClarity)return;
const $=id=>document.getElementById(id);
const ID=/^CARD-\d{4,}$/;
let cardSet=null,cardArray=null,observer=null,io=null,scheduled=false;
const processed=new WeakSet(),requests=new Map();
function lookup(){
 const records=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
 if(records!==cardArray||!cardSet){
  cardArray=records;cardSet=new Map(records.filter(x=>x&&typeof x.id==='string').map(x=>[x.id,x]));
 }
 return cardSet;
}
function extract(record,extra){
 const found=[],add=id=>{
  if(typeof id==='string'&&ID.test(id)&&id!==record.id&&!found.includes(id)&&lookup().has(id))found.push(id);
 };
 for(const list of [record.related_card_ids,record.related_cards,record.relatedCardIds,extra?.related_card_ids]){
  if(Array.isArray(list))for(const item of list)add(typeof item==='string'?item:item?.id||item?.cartao);
 }
 const layers=[record?.evolutive?.layers,record?.layers,extra?.layers,extra?.evolutive?.layers];
 for(const items of layers){
  if(!Array.isArray(items))continue;
  const layer=items.find(x=>Number(x?.ord)===8);
  if(!layer)continue;
  const body=String(layer.texto||layer.text||'');
  for(const line of body.split(/\r?\n/)){
   if(!/CARD-\d{4,}/.test(line))continue;
   for(const m of line.matchAll(/CARD-\d{4,}/g))add(m[0]);
  }
 }
 return found;
}
async function enrichment(id){
 if(requests.has(id))return requests.get(id);
 const work=(async()=>{
  if(window.BM276LayerData?.has?.(id))return await window.BM276LayerData.get(id);
  const publicRead=window.BM194VersosPublicos?.load;
  if(typeof publicRead==='function')return await publicRead(id);
  return null;
 })().catch(()=>null);
 requests.set(id,work);return work;
}
function label(c){
 const subject=String(c.sub||c.subject||'').trim();
 return subject.length>46?subject.slice(0,45)+'…':subject||'Abrir cartão';
}
function insertLinks(host,record,ids){
 if(!host?.isConnected||!ids.length)return;
 let footer=host.querySelector(':scope > .bm305-relations');
 if(!footer){footer=document.createElement('div');footer.className='bm305-relations';footer.setAttribute('aria-label','Cartões diretamente relacionados');}
 const title=document.createElement('strong');title.textContent='Cartões relacionados';
 const row=document.createElement('div');row.className='bm305-relations-row';
 ids.forEach((id,index)=>{
  const dest=lookup().get(id);if(!dest)return;
  const b=document.createElement('button');b.type='button';b.className='bm305-relation-link';
  b.textContent=id+' · '+label(dest);
  b.title='Abrir '+id+': '+String(dest.front||'').slice(0,140);
  if(index>=4)b.hidden=true;
  b.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   if(window.BancoMestreVisualizarCardV050?.showId?.(id,b))return;
   const search=$('cardSearch');
   if(search){search.value=id;search.dispatchEvent(new Event('input',{bubbles:true}));}
  });
  row.append(b);
 });
 if(!row.children.length)return;
 footer.replaceChildren(title,row);
 if(row.children.length>4){
  const more=document.createElement('button');more.type='button';more.className='bm305-more-links';
  more.textContent='Ver mais ('+(row.children.length-4)+')';more.setAttribute('aria-expanded','false');
  more.addEventListener('click',()=>{
   const open=more.getAttribute('aria-expanded')!=='true';
   [...row.children].slice(4).forEach(b=>{b.hidden=!open});
   more.setAttribute('aria-expanded',String(open));more.textContent=open?'Ver menos':'Ver mais ('+(row.children.length-4)+')';
  });
  footer.append(more);
 }
 const details=host.querySelector(':scope > details');
 const buttons=host.querySelector(':scope > .buttons');
 // A faixa permanece na frente, antes de revelar o verso e os 11 módulos.
 if(details)details.before(footer);else if(buttons)buttons.before(footer);else host.append(footer);
}
async function decorateRecord(host,id){
 const rec=lookup().get(id);if(!rec||!host?.isConnected)return;
 const explicit=extract(rec,null);
 if(explicit.length)insertLinks(host,rec,explicit);
 const enriched=await enrichment(id);
 if(!host?.isConnected||lookup().get(id)!==rec)return;
 insertLinks(host,rec,extract(rec,enriched));
}
function decorateCard(article){
 if(processed.has(article))return;
 const tag=article.querySelector(':scope > .tag');
 const id=String(tag?.textContent||'').trim();
 if(!ID.test(id))return;
 const c=lookup().get(id);
 if(!c)return;
 processed.add(article);
 article.dataset.bm305Id=id;
 if(c.sub&&c.sub!==c.subject&&!article.querySelector('.bm305-card-sub')){
  const sub=document.createElement('p');sub.className='bm305-card-sub';sub.textContent='Subassunto: '+c.sub;
  const subtitle=article.querySelector(':scope > p');if(subtitle)subtitle.after(sub);else article.append(sub);
 }
 if(io)io.observe(article);else void decorateRecord(article,id);
}

function keepIdOrder(){
 const root=$('cardRows'),sorting=window.BM281CardSort;
 if(!root||!sorting||!['asc','desc'].includes(sorting.order))return;
 const items=[...root.querySelectorAll('article.card')];
 if(items.length<2)return;
 // Ordenar TODOS os cartões renderizados, mesmo quando o compositor legado já
 // achatou os grupos em ordem temática: isso causava 1529 → 1524 → 1523.
 const numeric=a=>{
  const m=/^CARD-(\d+)$/.exec(a.querySelector(':scope > .tag')?.textContent?.trim()||'');
  return m?Number(m[1]):null;
 };
 const sign=sorting.order==='asc'?1:-1;
 const ordered=items.slice().sort((a,b)=>{
  const x=numeric(a),y=numeric(b);
  if(x===null)return y===null?0:1;
  if(y===null)return -1;
  return sign*(x-y);
 });
 // A igualdade é obrigatória: impede loop MutationObserver e movimentação inútil.
 const flat=root.children.length===items.length&&items.every((node,i)=>root.children[i]===node);
 if(flat&&items.every((node,i)=>node===ordered[i]))return;
 root.replaceChildren(...ordered);
 root.classList.add('bm191-all-grid');
}

function decorateCards(){
 const root=$('cardRows');if(!root)return;
 keepIdOrder();
 for(const node of root.querySelectorAll('article.card'))decorateCard(node);
 refreshCounts();
}
function refreshCounts(){
 const root=$('cartoes'),count=$('cardCount'),data=lookup();
 if(!root||!count||!data.size)return;
 let result=$('bm305-count-detail');
 if(!result){result=document.createElement('small');result.id='bm305-count-detail';result.className='bm305-count-detail';count.after(result);}
 const all=[...data.values()];
 const canonical=all.filter(c=>ID.test(c.id)&&!c.provisional);
 const provisional=all.filter(c=>c.provisional);
 const inactive=canonical.filter(c=>c.active===false).length;
 let locallyHidden=0;
 try{
  const hidden=new Set(JSON.parse(localStorage.getItem('BM026_EXCLUDE_CARD')||'[]'));
  locallyHidden=all.filter(c=>hidden.has(c.id)).length;
 }catch(_){}
 const rendered=$('cardRows')?.querySelectorAll('article.card').length||0;
 const match=String(count.textContent||'').match(/^(\d[\d.]*)\s+cart/);
 const selected=match?Number(match[1].replace(/\./g,'')):null;
 result.textContent=(selected!==null?'Exibidos '+rendered.toLocaleString('pt-BR')+' de '+selected.toLocaleString('pt-BR')+' na lista · ':'')+'Base: '+canonical.length.toLocaleString('pt-BR')+' canônicos + '+provisional.length.toLocaleString('pt-BR')+' operacionais · '+inactive+' inativos'+(locallyHidden?' · '+locallyHidden+' ocultos no navegador':'')+' · filtros podem reduzir a seleção';
}
function reader(){
 const root=$('bmCardPeekV050'),title=$('bmCardPeekTitleV050');
 if(!root||!title)return;
 const run=()=>{
  if(root.hidden)return;
  const id=window.BancoMestreVisualizarCardV050?.currentId;
  if(!id||!ID.test(id))return;
  const question=root.querySelector('.bm163-question');
  if(!question)return;
  let holder=question.querySelector(':scope > .bm305-modal-links');
  if(!holder){holder=document.createElement('div');holder.className='bm305-modal-links';question.append(holder);}
  if(holder.dataset.cardId===id)return;
  holder.dataset.cardId=id;holder.replaceChildren();
  const c=lookup().get(id);if(!c)return;
  const fill=async()=>{
   const e=await enrichment(id);
   if(root.hidden||holder.dataset.cardId!==id)return;
   const rel=extract(c,e);
   if(rel.length)insertLinks(holder,c,rel);
  };
  void fill();
 };
 const monitor=new MutationObserver(run);monitor.observe(title,{childList:true,subtree:true});run();
}
function mountImageQueue(){
 const root=$('imagens'),top=$('bm303-image-toolbar');
 if(!root||!top||$('bm305-image-pending'))return;
 const actions=top.querySelector('.bm303-actions')||top;
 const button=document.createElement('button');
 button.type='button';button.id='bm305-image-pending';button.className='bm305-pending-button';
 button.textContent='Ver imagens sem assunto';
 button.title='Filtra somente imagens sem assunto geral cadastrado; outras classificações incompletas continuam nos filtros existentes. Não atribui cartões automaticamente.';
 button.onclick=()=>{
  const general=$('bm155AssuntoGeralImagem'),disc=$('bm155DisciplinaImagem');
  const reset=$('bm155Reset');
  if(!general||!disc){button.title='Os filtros de imagens ainda não terminaram de carregar';return;}
  if(reset)reset.click();
  const option=[...general.options].find(x=>x.value==='__pendente__');
  if(!option){
   button.textContent='Conecte o Drive para consultar pendentes';
   button.title='Autorize o Drive e atualize o Atlas; nenhuma classificação é inferida sem os arquivos';
   return;
  }
  general.value='__pendente__';general.dispatchEvent(new Event('change',{bubbles:true}));
  const place=$('imageRows')||$('bm153Directory');
  place?.scrollIntoView?.({behavior:'smooth',block:'start'});
 };
 actions.append(button);
 const status=$('bm155FilterSummary');
 if(status&&typeof MutationObserver==='function'){
  const refresh=()=>{
   const m=String(status.textContent||'').match(/(\d+)\s+sem classificação completa/i);
   if(m)button.title='Há '+m[1]+' imagens com algum campo incompleto no acervo. Este atalho filtra apenas as que não têm assunto geral cadastrado.';
  };
  new MutationObserver(refresh).observe(status,{childList:true,subtree:true,characterData:true});refresh();
 }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorateCards();mountImageQueue();});}
function init(){
 io=typeof IntersectionObserver==='function'?new IntersectionObserver(items=>{
  for(const item of items)if(item.isIntersecting){
   io.unobserve(item.target);void decorateRecord(item.target,item.target.dataset.bm305Id);
  }
 },{rootMargin:'280px'}):null;
 const root=$('cardRows');
 if(root){observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});}
 reader();schedule();
 document.addEventListener('bm239-sync-finished',schedule);
 document.querySelector('header nav')?.addEventListener('click',schedule);
}
window.BM305CardClarity=Object.freeze({refresh:schedule,get ready(){return Boolean(observer)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();