/* Banco Mestre V153 — Atlas de imagens organizado como a biblioteca de PDFs.
 * Apresentação temática: preserva imagens, IDs, fontes, visibilidade, originais e grifos.
 * Os 254 registros do catálogo são associados a grupos; imagens externas continuam separadas.
 */
(function(){
'use strict';
if(window.BM153ImageLibrary)return;
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const root=$('imageRows'),panel=$('imagens')?.querySelector('.panel');
if(!root||!panel||typeof imgRender!=='function')return;
const previousRender=imgRender;
const nav=document.createElement('div');nav.id='bm153ImageNav';nav.className='bm153ImageNav';
nav.setAttribute('aria-label','Navegação por áreas e grupos de imagens');
const heading=document.createElement('div');heading.className='bm153NavHeading';
const title=document.createElement('strong');title.textContent='Biblioteca de imagens por assunto';
const descr=document.createElement('span');descr.textContent='Selecione uma área ou um grupo e expanda para ver as pranchas.';
heading.append(title,descr);
const areaButtons=document.createElement('div');areaButtons.id='bm153AreaButtons';areaButtons.className='bm153AreaButtons';
const filterRow=document.createElement('div');filterRow.className='bm153FilterRow';
const groupLabel=document.createElement('label');groupLabel.textContent='Grupo temático';
const groupSel=document.createElement('select');groupSel.id='bm153GroupSelect';groupSel.setAttribute('aria-label','Filtrar imagens por grupo temático');
groupLabel.append(groupSel);
const summary=document.createElement('span');summary.id='bm153ImageStatus';summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
filterRow.append(groupLabel,summary);nav.append(heading,areaButtons,filterRow);
const controls=panel.querySelector('.controls');
if(controls)controls.before(nav);else root.before(nav);
const style=document.createElement('style');
style.textContent=[
 '#imagens #imageRows.bm153ImageLibrary{display:block!important;margin:14px 0!important;max-width:100%}',
 '#imagens .bm153ImageNav{border:1px solid #d1e0df;background:#f8fbfa;border-radius:12px;padding:14px;margin:12px 0}',
 '#imagens .bm153NavHeading{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 12px;margin-bottom:12px}',
 '#imagens .bm153NavHeading strong{font-size:15px;color:#20494e}',
 '#imagens .bm153NavHeading span{font-size:12px;color:#5b7679}',
 '#imagens .bm153AreaButtons{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0 12px}',
 '#imagens .bm153AreaButtons button{border:1px solid #b6cfca;border-radius:20px;background:#fff;color:#29545a;font-size:12px;padding:8px 12px;min-height:36px}',
 '#imagens .bm153AreaButtons button[aria-pressed="true"]{background:#1c646a;color:#fff;border-color:#1c646a;font-weight:700}',
 '#imagens .bm153FilterRow{display:flex;flex-wrap:wrap;align-items:end;gap:12px;justify-content:space-between}',
 '#imagens .bm153FilterRow label{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:700;min-width:min(100%,260px);flex:1}',
 '#imagens .bm153FilterRow select{box-sizing:border-box;width:100%;max-width:420px;min-height:40px;padding:8px;border:1px solid #bdcdca;border-radius:7px;background:#fff;color:#24464b;font-size:13px}',
 '#imagens #bm153ImageStatus{color:#526c71;font-size:12px;line-height:1.5;flex:1;min-width:200px}',
 '#imagens #imageFilter{display:none!important}',
 '#imagens #moreImages{display:none!important}',
 '#imagens .bm153AreaBlock{margin:15px 0 22px;min-width:0}',
 '#imagens .bm153AreaHead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid #cbdcda;padding:8px 1px}',
 '#imagens .bm153AreaHead h3{font-size:17px;margin:0;color:#214b51}',
 '#imagens .bm153Count{font-size:12px;color:#557176;font-weight:650}',
 '#imagens .bm153AreaDesc{font-size:12px;color:#6b7e7e;margin:6px 0 12px}',
 '#imagens details.bm153Group{margin:9px 0;border:1px solid #d2e1df;background:#fff;border-radius:10px;overflow:hidden}',
 '#imagens .bm153Group>summary{display:flex;align-items:center;flex-wrap:wrap;justify-content:space-between;gap:8px;cursor:pointer;padding:13px 14px;min-height:42px}',
 '#imagens .bm153Group>summary strong{font-size:13px;color:#214a50}',
 '#imagens .bm153Group>summary small{font-size:11px;color:#657e82;display:block;font-weight:400;margin-top:4px}',
 '#imagens .bm153Group[open]>summary{border-bottom:1px solid #e2ebea;background:#f6f9f8}',
 '#imagens .bm153GroupBody{padding:10px 12px 14px}',
 '#imagens .bm153TopicHeading{font-size:12px;font-weight:700;color:#34545b;margin:12px 0 7px;border-bottom:1px solid #e4eded;padding-bottom:6px}',
 '#imagens .bm153ImageGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,245px),1fr));gap:10px;min-width:0}',
 '#imagens .bm153ImageGrid article.card{box-sizing:border-box;min-width:0;margin:0}',
 '#imagens .bm153ImageGrid article.card h3{font-size:13px;overflow-wrap:anywhere}',
 '#imagens .bm153ImageGrid article.card .bm153ImageStatus{display:block;margin:4px 0 8px;color:#6d6a51;font-size:11px;line-height:1.35}',
 '#imagens .bm153Empty{font-size:13px;color:#647c7d;padding:16px 8px}',
 '#imagens #bm084-sync{margin-top:22px!important}',
 '@media(max-width:680px){#imagens .bm153ImageNav{padding:11px}#imagens .bm153AreaButtons button{font-size:11px}#imagens .bm153Group>summary{padding:11px}#imagens .bm153GroupBody{padding:9px}#imagens .bm153ImageGrid{grid-template-columns:1fr}}'
].join('\n');document.head.append(style);
const state={area:'all',group:'all'};
let config=null,configPromise=null,seq=0;
const make=(tag,cls,text)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=String(text);
 return el;
};
function ready(){
 if(config)return Promise.resolve(config);
 if(configPromise)return configPromise;
 configPromise=fetch('assets/image_grupos_v153.json',{cache:'no-store'}).then(async r=>{
  if(!r.ok)throw Error('índice de grupos de imagens indisponível (HTTP '+r.status+')');
  const d=await r.json();
  if(d.format!=='BancoMestreImageGroupsV153'||d.source_count!==254||d.assigned?.length!==254||
    new Set(d.assigned.map(x=>x.id)).size!==254)throw Error('índice de imagens incompatível');
  config=d;return d;
 }).catch(e=>{configPromise=null;throw e});
 return configPromise;
}
function previewCard(x,off){
 const item=card(x.title,x.no,x.category+(off?' · oculta':'')),
       preview=make('img','thumb');
 preview.loading='lazy';preview.alt='Abrir '+x.no+' em tela cheia';
 preview.title='Clique para abrir '+x.no+', ampliar e grifar';
 preview.tabIndex=0;preview.setAttribute('role','button');
 preview.style.cursor='zoom-in';
 preview.onclick=()=>imgOpen(x);
 preview.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();imgOpen(x)}};
 item.c.insertBefore(preview,item.c.querySelector('h3'));
 const candidate=origMap[x.no]?.verified===true?origMap[x.no]:null;
 const fallback=()=>thumb(x).then(src=>{
  if(!preview.isConnected)return;
  if(src)preview.src=src;else preview.replaceWith(make('p','muted','Prévia indisponível. Consulte o arquivo original.'));
 }).catch(()=>{
  if(preview.isConnected)preview.replaceWith(make('p','muted','Não foi possível carregar a prévia.'));
 });
 if(candidate){preview.onerror=fallback;preview.src=candidate.preview_url;preview.title='Original candidato do Drive; validação técnica pendente';}
 else void fallback();
 if(x.status){
  const warning=make('small','bm153ImageStatus',x.status);
  item.c.insertBefore(warning,item.c.querySelector('.buttons'));
 }
 if(x.shard!==undefined||origMap[x.no]){
  item.buttons.append(action('Abrir em tela cheia',()=>imgOpen(x),'primary'));
 }
 item.buttons.append(action(off?'Restaurar':'Excluir',async()=>{
  try{await api.setStatus(x.no,off?'visible':'hidden');await imgRender()}
  catch(e){alert('Não foi possível atualizar a visibilidade de '+x.no+': '+e.message)}
 },off?'':'danger'));
 return item.c;
}
function fillGroup(details,items,hiddenStatuses){
 const body=make('div','bm153GroupBody');
 const buckets=new Map();
 for(const x of items){
  const key=String(x.category||'Outros temas').split(' / ').pop().trim();
  if(!buckets.has(key))buckets.set(key,[]);
  buckets.get(key).push(x);
 }
 for(const [topic,images] of buckets){
  body.append(make('div','bm153TopicHeading',topic));
  const grid=make('div','bm153ImageGrid');
  for(const img of images)grid.append(previewCard(img,hiddenStatuses.has(img.no)));
  body.append(grid);
 }
 details.append(body);
}
async function render(){
 const turn=++seq;
 if(!Array.isArray(imgs)||!imgs.length){
  $('imageCount').textContent='Aguardando o catálogo de imagens…';
  return;
 }
 try{
  const [d,statuses]=await Promise.all([ready(),api.all()]);
  if(turn!==seq)return;
  if(!Array.isArray(statuses))throw Error('estados de visibilidade indisponíveis');
  const assigned=new Map(d.assigned.map(x=>[x.id,x.group]));
  const groupDefs=new Map(d.groups.map(x=>[x.id,x]));
  const backup={id:'outros_atlas',label:'Imagens adicionais e recortes',subtitle:'Registros de fontes complementares, sem classificação temática confirmada',area:'eng',order:999};
  groupDefs.set(backup.id,backup);
  const hide=new Set(statuses.filter(x=>x?.status==='hidden').map(x=>String(x.id)));
  const show=$('imageHidden').checked;
  const q=norm($('imageSearch')?.value.trim());
  const all=imgs.filter(x=>show||!hide.has(x.no)).map(x=>({image:x,group:assigned.get(x.no)||backup.id}));
  // Nunca excluir novos registros que tenham sido acrescentados ao Atlas em tempo de execução.
  const availableAreas=new Set(all.map(x=>groupDefs.get(x.group)?.area||'eng'));
  const areas=d.areas.filter(x=>availableAreas.has(x.id));
  const counts=new Map();
  for(const x of all)counts.set(x.group,(counts.get(x.group)||0)+1);
  if(state.area!=='all'&&!availableAreas.has(state.area)){state.area='all';state.group='all'}
  const options=[{id:'all',label:'Todos os grupos'}];
  for(const g of [...groupDefs.values()].filter(x=>(state.area==='all'||x.area===state.area)&&counts.has(x.id)).sort((a,b)=>a.order-b.order))
   options.push({id:g.id,label:g.label+' ('+counts.get(g.id)+')'});
  if(state.group!=='all'&&!options.some(x=>x.id===state.group))state.group='all';
  groupSel.replaceChildren(...options.map(x=>new Option(x.label,x.id)));
  groupSel.value=state.group;
  areaButtons.replaceChildren();
  const areaOptions=[{id:'all',label:'Todas as áreas',n:all.length},...areas.map(a=>({
   id:a.id,label:a.label,n:all.filter(x=>groupDefs.get(x.group)?.area===a.id).length
  }))];
  for(const a of areaOptions){
   const b=make('button','',a.label+' ('+a.n+')');
   b.type='button';b.setAttribute('aria-pressed',String(state.area===a.id));
   b.onclick=()=>{state.area=a.id;state.group='all';void imgRender()};
   areaButtons.append(b);
  }
  const matched=all.filter(({image:x,group:id})=>
   (state.area==='all'||groupDefs.get(id)?.area===state.area)&&
   (state.group==='all'||id===state.group)&&
   (!q||norm([x.no,x.title,x.category,x.group,x.status,groupDefs.get(id)?.label].join(' ')).includes(q))
  );
  const open=new Set([...root.querySelectorAll('details.bm153Group[open]')].map(x=>x.dataset.group));
  root.classList.add('bm153ImageLibrary');
  root.replaceChildren();
  $('imageCount').textContent=matched.length+' imagens'+(show?' (incluindo ocultas)':' visíveis');
  summary.textContent=matched.length+' resultados de '+all.length+' imagens acessíveis'+(show?' · arquivo histórico incluído':' · ocultas preservadas');
  if(!matched.length){
   root.append(make('p','bm153Empty','Nenhuma imagem corresponde aos filtros. Use Todas as áreas, limpe a busca ou ative Mostrar ocultas para consultar o arquivo histórico.'));
   return;
  }
  for(const area of d.areas){
   const own=matched.filter(x=>groupDefs.get(x.group)?.area===area.id);
   if(!own.length)continue;
   const block=make('div','bm153AreaBlock');
   const head=make('div','bm153AreaHead');
   head.append(make('h3','',area.label),make('span','bm153Count',own.length+' imagens'));
   block.append(head,make('p','bm153AreaDesc',area.description));
   const groups=[...groupDefs.values()].filter(g=>g.area===area.id).sort((a,b)=>a.order-b.order);
   for(const group of groups){
    const items=own.filter(x=>x.group===group.id).map(x=>x.image);
    if(!items.length)continue;
    const detail=make('details','bm153Group');detail.dataset.group=group.id;
    const sum=make('summary','');
    const label=make('span','');
    label.append(make('strong','',group.label),make('small','',group.subtitle));
    sum.append(label,make('span','bm153Count',items.length+' imagem'+(items.length===1?'':'s')));
    detail.append(sum);
    let mounted=false;
    const populate=()=>{if(!mounted){mounted=true;fillGroup(detail,items,hide)}};
    detail.addEventListener('toggle',()=>{if(detail.open)populate()});
    detail.open=!!q||state.group!=='all'||open.has(group.id);
    if(detail.open)populate();
    block.append(detail);
   }
   root.append(block);
  }
  // O Drive privado mantém seu painel e autenticação independentes após o catálogo.
  const privatePanel=$('bm084-sync');
  if(privatePanel&&privatePanel.parentNode===panel)panel.append(privatePanel);
 }catch(error){
  if(turn!==seq)return;
  console.warn('Atlas V153:',error);
  $('imageCount').textContent='Falha no índice de imagens';
  summary.textContent='Não foi possível organizar a biblioteca: '+error.message;
  root.replaceChildren(make('p','bm153Empty','Falha na organização das imagens: '+error.message+'. Atualize a página ou tente novamente.'));
 }
}
imgRender=render;
groupSel.onchange=()=>{state.group=groupSel.value;void imgRender()};
$('imageSearch').oninput=()=>{void imgRender()};
$('imageHidden').onchange=()=>{void imgRender()};
window.BM153ImageLibrary=Object.freeze({
 version:'V153',ready,
 get state(){return {...state}},
 refresh:()=>imgRender(),
 source:'meta_public_v024.json',
 preserved:['IDs','originais','grifos','estados de visibilidade','recortes externos']
});
if(Array.isArray(imgs)&&imgs.length)void imgRender();
})();