/* Banco Mestre V153 — diretório temático do Atlas com 270 imagens.
 * O renderizador V060 mantém favoritos, textos editáveis, originais e o leitor.
 * Este módulo apenas filtra por grupo e posiciona os cartões gerados pelo motor original.
 */
(function(){
'use strict';
if(window.BM153ImageLibrary)return;
const $=id=>document.getElementById(id);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const section=$('imagens'),panel=section?.querySelector('.panel');
const rows=$('imageRows'),more=$('moreImages');
if(!panel||!rows||!more)return;
const originalParent=rows.parentNode;
const directory=document.createElement('div');
directory.id='bm153Directory';directory.className='bm153Directory';
const heading=document.createElement('div');heading.className='bm153Heading';
const h=document.createElement('strong');h.textContent='Imagens organizadas por assunto';
const help=document.createElement('span');help.textContent='Abra um grupo para consultar suas imagens, editar cartões ou continuar grifos.';
heading.append(h,help);
const areaNav=document.createElement('div');areaNav.className='bm153AreaNav';areaNav.id='bm153AreaNav';
const toolbar=document.createElement('div');toolbar.className='bm153Toolbar';
const groupLabel=document.createElement('label');groupLabel.textContent='Grupo temático';
const groupSel=document.createElement('select');groupSel.id='bm153GroupSelect';groupSel.setAttribute('aria-label','Selecionar grupo de imagens');
groupLabel.append(groupSel);
const status=document.createElement('span');status.id='bm153Status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
toolbar.append(groupLabel,status);
const listing=document.createElement('div');listing.id='bm153GroupListing';
directory.append(heading,areaNav,toolbar,listing);
const results=document.createElement('div');results.id='bm153Results';
const controls=panel.querySelector('.controls');
if(controls)controls.before(directory);else rows.before(directory);
directory.after(results);
results.append(rows,more);
const sheet=document.createElement('style');
sheet.textContent=[
 '#imagens .bm153Directory{border:1px solid #d4e2df;border-radius:12px;background:#f8fbfa;margin:12px 0;padding:13px}',
 '#imagens .bm153Heading{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px 14px;margin-bottom:11px}',
 '#imagens .bm153Heading strong{font-size:15px;color:#22484d}',
 '#imagens .bm153Heading span{font-size:12px;color:#607a7d}',
 '#imagens .bm153AreaNav{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:11px}',
 '#imagens .bm153AreaNav button{min-height:36px;border-radius:19px;border:1px solid #bad0ce;background:#fff;color:#26545b;padding:8px 11px;font-size:12px}',
 '#imagens .bm153AreaNav button[aria-pressed="true"]{background:#1d666c;border-color:#1d666c;color:#fff;font-weight:700}',
 '#imagens .bm153Toolbar{display:flex;align-items:end;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #e1eae8;padding:10px 0 0}',
 '#imagens .bm153Toolbar label{display:flex;flex-direction:column;gap:5px;flex:1;max-width:420px;min-width:min(100%,240px);font-size:12px;font-weight:700}',
 '#imagens .bm153Toolbar select{width:100%;box-sizing:border-box;border-radius:7px;border:1px solid #b9cfcc;min-height:40px;padding:8px;background:#fff;color:#254751;font-size:13px}',
 '#imagens .bm153Toolbar #bm153Status{font-size:12px;color:#536f71;flex:1;min-width:195px}',
 '#imagens .bm153AreaBlock{margin:13px 0 18px}',
 '#imagens .bm153AreaHeader{display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;align-items:center;padding:5px 1px 9px;border-bottom:1px solid #d3e2e0}',
 '#imagens .bm153AreaHeader strong{font-size:15px;color:#234d53}',
 '#imagens .bm153AreaHeader span{font-size:12px;color:#587377}',
 '#imagens .bm153AreaBlock>p{font-size:12px;margin:7px 0;color:#698084}',
 '#imagens details.bm153Group{border:1px solid #d2e1df;background:#fff;border-radius:9px;margin:8px 0;overflow:hidden}',
 '#imagens details.bm153Group>summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:11px 12px;min-height:42px}',
 '#imagens details.bm153Group>summary strong{font-size:13px;color:#264a50}',
 '#imagens details.bm153Group>summary small{font-size:11px;color:#6c8183;display:block;margin-top:4px;font-weight:400}',
 '#imagens details.bm153Group[open]>summary{border-bottom:1px solid #e2eeeb;background:#f2f8f6}',
 '#imagens .bm153GroupBody{padding:12px}',
 '#imagens .bm153GroupBody #imageRows{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:10px}',
 '#imagens .bm153GroupBody #imageRows>article.card{min-width:0;margin:0}',
 '#imagens #bm153Results{margin-top:10px}',
 '#imagens #bm153Results:not(.bm153Browsing){display:none!important}',
 '#imagens #imageRows[hidden],#imagens #moreImages[hidden]{display:none!important}',
 '#imagens .bm153Guide{font-size:12px;color:#657e81;line-height:1.5;margin:9px 0 0}',
 '#imagens #bm084-sync{margin-top:24px!important}',
 '@media(max-width:680px){#imagens .bm153Directory{padding:10px}#imagens details.bm153Group>summary{padding:10px}#imagens .bm153GroupBody{padding:9px}#imagens .bm153GroupBody #imageRows{grid-template-columns:1fr}}'
].join('\n');document.head.append(sheet);
const groupState={area:'all',group:'all'};
let config=null,promise=null,openTarget=null,browsing=false;
function loadConfig(){
 if(config)return Promise.resolve(config);
 if(promise)return promise;
 promise=fetch('assets/image_grupos_v153.json',{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('índice temático indisponível (HTTP '+r.status+')');
  const d=await r.json();
  if(d.format!=='BancoMestreImageGroupsV153'||d.source_count!==270||
    d.assigned?.length!==270||new Set(d.assigned.map(x=>x.id)).size!==270)
   throw Error('índice temático incompatível com as 270 imagens');
  config=d;return d;
 }).catch(err=>{promise=null;throw err});
 return promise;
}
const make=(tag,cls,text)=>{
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!==undefined)e.textContent=String(text);
 return e;
};
function labelFor(x){return window.BancoMestreAtlasV060?.textFor?.(x)||{title:x.title,area:x.category,subject:x.category}}
function activeOtherFilters(){
 const search=$('imageSearch')?.value.trim()||'';
 const area=$('imageAreaV044')?.value||'all';
 const category=$('imageFilter')?.value||'all';
 const fav=$('imageFavoriteV055')?.value||'all';
 return Boolean(search)||area!=='all'||category!=='all'||fav==='favorites';
}
function matches(x){
 if(groupState.group!=='all'){
  const group=config?.assigned?.find(y=>y.id===x.no)?.group;
  return group===groupState.group;
 }
 return activeOtherFilters();
}
function setDefaultAdvanced(){
 const e=$('imageSearch');if(e)e.value='';
 for(const id of ['imageAreaV044','imageFilter','imageFavoriteV055']){
  const sel=$(id);if(sel)sel.value='all';
 }
}
function selectGroup(id){
 groupState.group=id;
 setDefaultAdvanced();
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
}
function selectArea(id){
 groupState.area=id;groupState.group='all';setDefaultAdvanced();
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
}
async function beforeCards(hidden,mode){
 try{
  const d=await loadConfig();
  const byId=new Map(d.assigned.map(x=>[x.id,x.group]));
  const groupDefs=new Map(d.groups.map(x=>[x.id,x]));
  const source=Array.isArray(imgs)?imgs:[];
  if(source.length!==270)throw Error('Atlas incompleto: '+source.length+' de 270 imagens');
  const eligible=source.filter(x=>mode==='all'||(hidden.get(x.no)==='hidden')===(mode==='hidden'));
  const counts=new Map();
  for(const img of eligible){
   const id=byId.get(img.no);
   if(!id||!groupDefs.has(id))throw Error('Imagem sem grupo: '+img.no);
   counts.set(id,(counts.get(id)||0)+1);
  }
  const areas=d.areas.filter(a=>[...counts].some(([id,n])=>n>0&&groupDefs.get(id)?.area===a.id));
  const validGroups=d.groups.filter(g=>counts.has(g.id)&&(groupState.area==='all'||g.area===groupState.area));
  if(groupState.group!=='all'&&!validGroups.some(x=>x.id===groupState.group))groupState.group='all';
  groupSel.replaceChildren(new Option('Escolha um grupo temático','all'));
  for(const g of validGroups)groupSel.add(new Option(g.label+' ('+counts.get(g.id)+')',g.id));
  groupSel.value=groupState.group;
  areaNav.replaceChildren();
  const entries=[{id:'all',label:'Todas as áreas',count:eligible.length},...areas.map(a=>({id:a.id,label:a.label,count:eligible.filter(x=>groupDefs.get(byId.get(x.no))?.area===a.id).length}))];
  for(const item of entries){
   const b=make('button','',item.label+' ('+item.count+')');
   b.type='button';b.setAttribute('aria-pressed',String(item.id===groupState.area));
   b.onclick=()=>selectArea(item.id);
   areaNav.append(b);
  }
  const listingAnchor=listing;
  listing.replaceChildren();openTarget=null;
  for(const area of areas){
   if(groupState.area!=='all'&&area.id!==groupState.area)continue;
   const members=validGroups.filter(g=>g.area===area.id).sort((a,b)=>a.order-b.order);
   if(!members.length)continue;
   const block=make('div','bm153AreaBlock');
   const header=make('div','bm153AreaHeader');
   header.append(make('strong','',area.label),make('span','',members.reduce((n,g)=>n+(counts.get(g.id)||0),0)+' imagens'));
   block.append(header,make('p','',area.description));
   for(const g of members){
    const details=make('details','bm153Group');details.dataset.group=g.id;
    const summaryEl=make('summary','');
    const caption=make('span','');
    caption.append(make('strong','',g.label),make('small','',g.subtitle));
    summaryEl.append(caption,make('span','',counts.get(g.id)+' imagens'));
    summaryEl.onclick=e=>{e.preventDefault();selectGroup(groupState.group===g.id?'all':g.id)};
    details.append(summaryEl);
    const body=make('div','bm153GroupBody');details.append(body);
    details.open=groupState.group===g.id;
    if(details.open)openTarget=body;
    block.append(details);
   }
   listing.append(block);
  }
  const advanced=activeOtherFilters();
  browsing=groupState.group==='all'&&advanced;
  if(groupState.group!=='all'&&openTarget){
   openTarget.append(rows,more);rows.hidden=false;more.hidden=false;
   results.classList.remove('bm153Browsing');
  }else if(browsing){
   results.append(rows,more);rows.hidden=false;more.hidden=false;
   results.classList.add('bm153Browsing');
  }else{
   results.append(rows,more);rows.hidden=true;more.hidden=true;
   results.classList.remove('bm153Browsing');
  }
  status.textContent=eligible.length+' imagens '+(mode==='hidden'?'excluídas':mode==='all'?'no catálogo':'visíveis')+' em '+validGroups.length+' grupos';
  const drive=$('bm084-sync');
  if(drive&&drive.parentNode===panel)panel.append(drive);
 }catch(err){
  console.warn('Biblioteca de imagens V153:',err);
  status.textContent='Organização indisponível: '+err.message;
  // Se o diretório falhar, a renderização original continua acessível.
  results.append(rows,more);rows.hidden=false;more.hidden=false;
  results.classList.add('bm153Browsing');
  browsing=true;
 }
}
function afterCards(selectedCount,visibleCount,scopeCount){
 if(groupState.group==='all'&&!browsing){
  $('imageCount').textContent=scopeCount+' imagens em grupos temáticos';
  const info=$('imageIndexV044');
  if(info)info.textContent='Selecione um grupo para abrir as imagens. Favoritos, título, descrição e observações pessoais permanecem disponíveis no cartão; o acervo original não é alterado.';
 }else{
  const info=$('imageIndexV044');
  if(info&&groupState.group!=='all')info.textContent='Grupo selecionado · exibindo '+visibleCount+' de '+selectedCount+' imagem(ns) · use Mostrar mais para avançar. Favoritos e edição de cartões preservados.';
 }
 if(groupState.group==='all'&&!browsing)more.hidden=true;
}
groupSel.onchange=()=>selectGroup(groupSel.value);
const oldSearch=$('imageSearch');
oldSearch?.addEventListener('input',()=>{
 if(oldSearch.value.trim()&&groupState.group!=='all')groupState.group='all';
 },true);
window.BM153ImageLibrary=Object.freeze({
 ready:loadConfig,matches,beforeCards,afterCards,
 get selection(){return {...groupState}},
 selectGroup,selectArea,
 preserved:['254 imagens históricas','16 Petrobras 10','favoritos','textos personalizados','originais','visibilidade','SRS']
});
if(Array.isArray(imgs)&&imgs.length)void imgRender();
})();