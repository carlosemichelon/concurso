/* Banco Mestre V156 — filtros de imagens no padrão dos flashcards e catálogo ativo de 86 imagens.
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
const filters=document.createElement('div');filters.id='bm155ImageFilters';filters.className='bm155ImageFilters';
function field(id,labelText){
 const label=document.createElement('label');label.className='bm155Field';
 const title=document.createElement('span');title.textContent=labelText;
 const sel=document.createElement('select');sel.id=id;sel.setAttribute('aria-label',labelText);
 label.append(title,sel);filters.append(label);return sel;
}
const discSel=field('bm155DisciplinaImagem','1. Disciplina');
const generalSel=field('bm155AssuntoGeralImagem','2. Assunto geral');
const specificSel=field('bm155AssuntoEspecificoImagem','3. Assunto específico');
const subSel=field('bm155SubassuntoImagem','4. Subassunto');
const foot=document.createElement('div');foot.className='bm155Foot';
const summary155=document.createElement('span');summary155.id='bm155FilterSummary';summary155.setAttribute('role','status');summary155.setAttribute('aria-live','polite');
const reset155=document.createElement('button');reset155.id='bm155Reset';reset155.type='button';reset155.textContent='Limpar filtros';
foot.append(summary155,reset155);filters.append(foot);
directory.append(heading,filters,areaNav,toolbar,listing);
const results=document.createElement('div');results.id='bm153Results';
const controls=panel.querySelector('.controls');
const filterSummary=$('imageIndexV044');
if(filterSummary)filterSummary.after(directory);
else if(controls)controls.after(directory);
else rows.before(directory);
directory.after(results);
results.append(rows,more);
const sheet=document.createElement('style');
sheet.textContent=[
 '#imagens .bm155ImageFilters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:10px 0 12px}',
 '#imagens .bm155Field{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:12px;font-weight:700;color:#264d54}',
 '#imagens .bm155Field select{font:500 13px system-ui,Arial,sans-serif;box-sizing:border-box;width:100%;min-width:0;max-width:100%;border:1px solid #b8cdca;border-radius:8px;background:#fff;padding:9px;min-height:42px;color:#183d44}',
 '#imagens .bm155Field select:focus-visible{outline:3px solid #72b8b9;outline-offset:2px}',
 '#imagens .bm155Field select:disabled{opacity:.6;background:#eef2f2}',
 '#imagens .bm155Foot{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #dce9e7;padding-top:10px}',
 '#imagens #bm155FilterSummary{flex:1;min-width:180px;color:#576f75;font-size:12px;line-height:1.5}',
 '#imagens #bm155Reset{min-height:36px;font-size:12px;border-radius:8px;padding:8px 12px}',
 '#imagens .bm153AreaNav,#imagens .bm153Toolbar{display:none!important}',
 '#imagens #bm153GroupListing[hidden]{display:none!important}',
 '#imagens .bm155Help{font-size:12px;color:#61787d;margin:8px 0}',
 '@media(max-width:900px){#imagens .bm155ImageFilters{grid-template-columns:repeat(2,minmax(0,1fr))}}',
 '@media(max-width:560px){#imagens .bm155ImageFilters{grid-template-columns:1fr}#imagens #bm155Reset{width:100%}}',
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
const state={disc:'all',general:'all',specific:'all',sub:'all'};
let classification=null,classPromise=null,classById=new Map();
let config=null,promise=null,openTarget=null,browsing=false,degraded=false;
function loadConfig(){
 if(config)return Promise.resolve(config);
 if(promise)return promise;
 promise=fetch('assets/image_grupos_v156.json',{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('índice temático indisponível (HTTP '+r.status+')');
  const d=await r.json();
  if(d.format!=='BancoMestreImageGroupsV156'||d.source_count!==86||
    d.assigned?.length!==86||new Set(d.assigned.map(x=>x.id)).size!==86)
   throw Error('índice temático incompatível com as 270 imagens');
  config=d;return d;
 }).catch(err=>{promise=null;throw err});
 return promise;
}

function loadClassification(){
 if(classification)return Promise.resolve(classification);
 if(classPromise)return classPromise;
 classPromise=fetch('assets/image_classificacao_v156.json',{cache:'no-store'}).then(async response=>{
  if(!response.ok)throw Error('classificação de imagens indisponível (HTTP '+response.status+')');
  const data=await response.json();
  if(data.format!=='BancoMestreImageClassificationV156'||data.total!==86||data.records?.length!==86||data.generals?.length!==13||
     new Set(data.records.map(x=>x.id)).size!==86)
   throw Error('classificação de imagens V155 incompatível');
  classById=new Map(data.records.map(x=>[x.id,x]));
  classification=data;return data;
 }).catch(e=>{classPromise=null;throw e});
 return classPromise;
}
const classified=x=>classById.get(x.no)||null;
const byDiscipline=(c,d)=>d==='all'||c?.discipline===d||c?.extra_disciplines?.includes(d);
function groupOf(c,d){
 if(d==='leg'&&c?.extra_disciplines?.includes('leg')&&c.discipline!=='leg')return 'legislacao';
 return c?.general||'';
}
function matchesClass(x,override=false){
 if(override)return true;
 const c=classified(x);if(!c)return false;
 if(!byDiscipline(c,state.disc))return false;
 if(state.general!=='all'&&groupOf(c,state.disc)!==state.general&&!(state.disc==='all'&&c.extra_generals?.includes(state.general)))return false;
 if(state.specific!=='all'&&c.specific!==state.specific)return false;
 if(state.sub!=='all'&&(state.sub==='__none__'?Boolean(c.sub):c.sub!==state.sub))return false;
 return true;
}
function classifiedFilterActive(){return Object.values(state).some(x=>x!=='all')}
function optionsFrom(items,fn,labels){
 const map=new Map();
 for(const img of items){
  for(const key of fn(img)){
   if(key===undefined||key===null)continue;
   map.set(key,(map.get(key)||0)+1);
  }
 }
 return [...map].map(([value,count])=>({value,count,label:labels?.get(value)||value})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR'));
}
function fillSelect(sel,allLabel,choices,selected){
 sel.replaceChildren(new Option(allLabel,'all'));
 for(const choice of choices)sel.add(new Option(choice.label+' ('+choice.count+')',choice.value));
 sel.value=choices.some(x=>x.value===selected)?selected:'all';
 return sel.value;
}
function updateClassOptions(eligible){
 if(!classification)return;
 const discLabels=new Map(classification.disciplines.map(x=>[x.id,x.label]));
 const generalLabels=new Map(classification.generals.map(x=>[x.id,x.label]));
 const discOpts=optionsFrom(eligible,x=>{
  const c=classified(x);return c?[c.discipline,...(c.extra_disciplines||[])]:[];
 },discLabels);
 state.disc=fillSelect(discSel,'Todas as disciplinas ('+eligible.length+')',discOpts,state.disc);
 const a=eligible.filter(x=>byDiscipline(classified(x),state.disc));
 const generalOpts=optionsFrom(a,x=>{
  const c=classified(x);
  return c?[groupOf(c,state.disc),...(state.disc==='all'?(c.extra_generals||[]):[])]:[];
 },generalLabels);
 state.general=fillSelect(generalSel,'Todos os assuntos gerais ('+a.length+')',generalOpts,state.general);
 const b=a.filter(x=>{
  const c=classified(x);
  return state.general==='all'||groupOf(c,state.disc)===state.general||
    (state.disc==='all'&&c.extra_generals?.includes(state.general));
 });
 state.specific=fillSelect(specificSel,'Todos os assuntos específicos ('+b.length+')',
  optionsFrom(b,x=>[classified(x)?.specific]),state.specific);
 const c=b.filter(x=>state.specific==='all'||classified(x)?.specific===state.specific);
 if(state.specific==='all'){
  state.sub='all';subSel.replaceChildren(new Option('Selecione primeiro um assunto específico','all'));subSel.disabled=true;
 }else{
  const details=optionsFrom(c,x=>[classified(x)?.sub||'__none__'],new Map([['__none__','Sem subdivisão cadastrada']]));
  state.sub=fillSelect(subSel,'Todos os subassuntos ('+c.length+')',details,state.sub);
  subSel.disabled=details.length===1&&details[0].value==='__none__';
 }
 const lookup=sel=>sel.options?.[sel.selectedIndex]?.textContent||'';
 const labels=[discSel,generalSel,specificSel,subSel].map(lookup).filter(Boolean);
 const chosen=classifiedFilterActive()?
  [discSel,generalSel,specificSel,subSel].filter(s=>s.value!=='all').map(s=>s.selectedOptions?.[0]?.textContent?.replace(/\s*\(\d+\)$/,'')||s.value).join(' › '):
  'Todas as disciplinas e assuntos';
 summary155.textContent=chosen+' · '+eligible.length+' imagens disponíveis'+(eligible.length===86?'':' neste modo')+
   ' · auditoria visual de 86 imagens; 2 com ressalvas';
}
function filterChange(level,value){
 const order=['disc','general','specific','sub'];
 state[level]=value;for(const later of order.slice(order.indexOf(level)+1))state[later]='all';
 groupState.group='all';groupState.area='all';
 setDefaultAdvanced();
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
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
 if(degraded)return true;
 const q=$('imageSearch')?.value.trim()||'';
 const exact=/^IMG-(?:\d{3}|P10-\d{2})$/i.test(q);
 if(exact)return true;
 if(!matchesClass(x))return false;
 if(groupState.group!=='all'){
  const group=config?.assigned?.find(y=>y.id===x.no)?.group;
  return group===groupState.group;
 }
 return activeOtherFilters()||classifiedFilterActive();
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
  const [d]=await Promise.all([loadConfig(),loadClassification()]);degraded=false;
  const byId=new Map(d.assigned.map(x=>[x.id,x.group]));
  const groupDefs=new Map(d.groups.map(x=>[x.id,x]));
  const source=Array.isArray(imgs)?imgs:[];
  if(source.length!==86)throw Error('Atlas incompleto: '+source.length+' de 86 imagens');
  const eligible=source.filter(x=>mode==='all'||(hidden.get(x.no)==='hidden')===(mode==='hidden'));
  updateClassOptions(eligible);
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
  const advanced=activeOtherFilters()||classifiedFilterActive();
  browsing=groupState.group==='all'&&advanced;
  listing.hidden=browsing;
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
  if(classifiedFilterActive())summary155.textContent+=' · filtros encadeados ativos';
  const drive=$('bm084-sync');
  if(drive&&drive.parentNode===panel)panel.append(drive);
 }catch(err){
  degraded=true;
  console.warn('Biblioteca de imagens V153:',err);
  status.textContent='Organização indisponível: '+err.message;
  // Se o diretório falhar, a renderização original continua acessível.
  results.append(rows,more);rows.hidden=false;more.hidden=false;
  results.classList.add('bm153Browsing');
  browsing=true;
 }
}
function afterCards(selectedCount,visibleCount,scopeCount){
 if(classifiedFilterActive()||activeOtherFilters())summary155.textContent=selectedCount+' imagens encontradas · exibindo '+visibleCount+' · filtros: '+[state.disc,state.general,state.specific,state.sub].filter(x=>x!=='all').join(' › ');
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
discSel.onchange=()=>filterChange('disc',discSel.value);
generalSel.onchange=()=>filterChange('general',generalSel.value);
specificSel.onchange=()=>filterChange('specific',specificSel.value);
subSel.onchange=()=>filterChange('sub',subSel.value);
reset155.onclick=()=>{
 for(const key of ['disc','general','specific','sub'])state[key]='all';
 groupState.area='all';groupState.group='all';setDefaultAdvanced();
 if(typeof imgLimit!=='undefined')imgLimit=24;
 if(typeof imgRender==='function')void imgRender();
};
groupSel.onchange=()=>selectGroup(groupSel.value);
const oldSearch=$('imageSearch');
oldSearch?.addEventListener('input',()=>{
 if(oldSearch.value.trim()&&groupState.group!=='all')groupState.group='all';
 },true);
window.BM153ImageLibrary=Object.freeze({
 ready:async()=>Promise.all([loadConfig(),loadClassification()]),matches,beforeCards,afterCards,
 get filters(){return {...state}}, reset:()=>reset155.click(),
 get selection(){return {...groupState}},
 selectGroup,selectArea,
 preserved:['70 imagens históricas','16 Petrobras 10','favoritos','textos personalizados','originais','visibilidade','SRS']
});
if(Array.isArray(imgs)&&imgs.length)void imgRender();
})();