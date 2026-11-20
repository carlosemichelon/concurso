/* V315 JS compacto · módulos IIFE originais em ordem · índices 100–111 */

;
/* 100 · assets/trt01_c006_loader.js */
/* Banco Mestre TRT01-C006 — cartão completo 11 módulos e 2 imagens originais vinculadas.
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BMTRT01C006)return;
const ID='TRT01-C006';
const DATA='assets/trt01_c006_v221.json?v=221-c006';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'uma imagem original incorporada ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as cinco imagens aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'imagem original carregada do drive autorizado; arquivo e grifos preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bmtrt01-c006'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bmtrt01-c006';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bmtrt01-c006-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · alternativa A correta · avaliação SRS ainda não atribuída'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional aprovado; a resposta A foi preservada, sem gerar evento SRS ou data de revisão.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt01-c006'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT01-Q006-IMG01-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BMTRT01C006=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==1)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('TRT C006: cartão não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();


;
/* 101 · assets/v236_trt_cards_grid.js */
/* V225 — TRT C001-C009 no filtro jurídico e grade sem títulos duplicados. */
/* V221 — cartões TRT01 C001–C009 na mesma grade dos cartões, sem alterar seus dados.
 * O SRS e o Banco Mestre canônico continuam separados. */
(function(){
'use strict';
if(window.BM236TrtCardsGrid)return;
const $=id=>document.getElementById(id);
const IDS=[
 ['TRT01-C001','bm211-trt-card'],
 ['TRT01-C002','bm212-trt-card'],
 ['TRT01-C003','bm215-trt-card'],
 ['TRT01-C004','bmtrt01-c004'],
 ['TRT01-C005','bmtrt01-c005'],
 ['TRT01-C006','bmtrt01-c006'],
 ['TRT01-C007','bmtrt01-c007'],
 ['TRT01-C008','bmtrt01-c008'],
 ['TRT01-C009','bmtrt01-c009'],
 ['TRT02-C001','bmtrt02-c001'],
 ['TRT02-C002','bmtrt02-c002'],
 ['TRT02-C004','bmtrt02-c004'],
 ['TRT02-C005','bmtrt02-c005'],
 ['TRT02-C006','bmtrt02-c006']
];
const wrappers=new Map(),records=new Map();
const FILES={
 'TRT01-C001':'assets/trt01_c001_v211.json','TRT01-C002':'assets/trt01_c002_v212.json',
 'TRT01-C003':'assets/trt01_c003_v215.json','TRT01-C004':'assets/trt01_c004_v217.json',
 'TRT01-C005':'assets/trt01_c005_v220.json','TRT01-C006':'assets/trt01_c006_v221.json',
 'TRT01-C007':'assets/trt01_c007_v222.json','TRT01-C008':'assets/trt01_c008_v224.json',
 'TRT01-C009':'assets/trt01_c009_v227.json','TRT02-C001':'assets/trt02_c001_v230.json',
 'TRT02-C002':'assets/trt02_c002_v237.json','TRT02-C004':'assets/trt02_c004_v232.json',
 'TRT02-C005':'assets/trt02_c005_v235.json','TRT02-C006':'assets/trt02_c006_v236.json'
};
let hiddenCards=new Set();
try{const value=JSON.parse(localStorage.getItem('BM236_TRT_HIDDEN')||'[]');if(Array.isArray(value))hiddenCards=new Set(value.filter(id=>Object.hasOwn(FILES,id)));}catch(_){}
function getRecord(id){
 if(!Object.hasOwn(FILES,id))return null;
 const w=wrappers.get(id);
 return records.get(id)||window.BM225LegalTaxonomy?.byId?.(id)||{id,group:'LEGISLACAO',discipline:id.startsWith('TRT02-')?'Direito Administrativo':'Direito Constitucional',operational:true,front:w?.querySelector(':scope > h3')?.textContent||'',back:w?.querySelector('.bm211-core')?.textContent||''};
}
async function loadRecord(id){
 if(!Object.hasOwn(FILES,id))throw Error('Cartão TRT desconhecido');
 if(records.has(id))return records.get(id);
 const response=await fetch(FILES[id]+'?bm=trt-v237-modal',{cache:'default'});
 if(!response.ok)throw Error('Arquivo TRT HTTP '+response.status);
 const data=await response.json();
 if(data.id!==id||!Array.isArray(data.layers)||data.layers.length!==11)throw Error('Registro TRT com módulos incompletos');
 records.set(id,data);return data;
}
function refreshRestore(){
 const b=$('bm236RestoreTrt');if(!b)return;
 b.hidden=hiddenCards.size===0;
 b.textContent=hiddenCards.size?'Restaurar '+hiddenCards.size+' cartão(ões) TRT ocultos':'';
}
let queued=false,muted=false;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function validFilters(article,id){
 const q=norm($('cardSearch')?.value).trim();
 const meta=window.BM225LegalTaxonomy?.byId?.(id);
 const words=norm([article.querySelector('h3')?.textContent,id,(id.startsWith('TRT02-')?'TRT Direito Administrativo Legislação':'TRT Direito Constitucional Legislação'),
  meta?.subject,meta?.sub,meta?.discipline].filter(Boolean).join(' '));
 if(q&&!words.includes(q))return false;
 if(meta&&window.BM152FlashFilters?.matches?.(meta)===false)return false;
 const disc=$('cardFilter')?.value||'all';
 if(disc!=='all'&&!/legisl|constit|direito/i.test(disc))return false;
 const topic=$('cardTopicFilter')?.value||'all';
 if(topic!=='all'&&!/constit|admin|trt|legisl/i.test(topic))return false;
 if(!meta){
  const sel=window.BM152FlashFilters?.selection;
  if(sel&&Object.values(sel).some(x=>x!=='all'))return false;
 }
 return true;
}
function counterStatus(visibleIds){
 const root=$('cardRows');if(!root)return;
 const extra=visibleIds.length;
 root.dataset.bm225TrtVisible=extra?'true':'false';
 for(const p of root.children){
  if(p.tagName==='P'&&/Nenhum cartão|Nenhum cartao|não corresponde/i.test(p.textContent||''))p.hidden=Boolean(extra);
 }
 const stat=$('bm221TrtCount');
 if(stat)stat.textContent=extra
  ?extra+' cartão(ões) TRT nesta busca · históricos operacionais preservados'
  :'TRT: use Legislação › Direito Constitucional ou Administrativo';
 if(extra){
  const count=$('cardCount');
  if(count&&/\b0\s+cart/i.test(count.textContent||''))count.textContent=extra+' cartões TRT';
  const all=$('bm191CardCount');
  if(all&&/\b0\s+cart/i.test(all.textContent||''))all.textContent=extra+' cartão(ões) TRT na grade';
  const label=$('bm152FilterStatus');
  if(label&&/\b0\s+cart/i.test(label.textContent||''))label.textContent=extra+' cartão(ões) TRT encontrados · '+(visibleIds.some(id=>id.startsWith('TRT02-'))?'Direito Administrativo / Constitucional':'Direito Constitucional');
 }
}
function foldSource(){
 const panel=$('cartoes')?.querySelector('.panel');
 if(!panel)return;
 const source=$('bm119PublicSource');
 if(!source)return;
 let d=$('bm221CardInformation');
 if(!d){
  d=document.createElement('details');
  d.id='bm221CardInformation';d.className='bm221-card-info';
  const summary=document.createElement('summary');summary.textContent='Informações da base e dos cartões';
  d.append(summary,source);
  panel.append(d);
 }else{
  if(source.parentElement!==d)d.append(source);
  if(d.parentElement===panel&&d!==panel.lastElementChild)panel.append(d);
  // A caixa inicia recolhida, mas respeita a abertura voluntária do estudante.
 }
}
function wrapperFor(id,main){
 let wrap=wrappers.get(id);
 if(wrap){if(main.parentElement!==wrap)wrap.append(main);return wrap;}
 wrap=document.createElement('article');wrap.className='card bm221-trt-card';wrap.dataset.bm221Id=id;wrap.dataset.bm163HeadingReady='yes';
 const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const ribbon=node('div','bm163-card-ribbon');
 ribbon.append(node('span','bm163-card-badge bm163-area','⚖ Legislação Geral'),node('span','bm163-card-badge bm163-provisional','Cópia operacional TRT'));
 const h=node('h3','',main.querySelector('.bm211-summary strong')?.textContent||id);
 const read=node('button','bm-v050-peek-button bm221-trt-open','Abrir leitura');read.type='button';
 const tag=node('span','tag',id);
 const subjects=node('div','v036-card-path bm221-trt-references');
 const reference=node('p','bm163-card-ref');
 reference.append(node('span','bm163-ref-icon','§'),node('span','bm221-reference-text','Referências normativas da questão TRT'));
 const controls=node('div','buttons');
 const law=node('button','bm161-law-button','📜 Mostrar lei seca');law.type='button';
 const guide=node('button','bm-open-card','Abrir guia do assunto');guide.type='button';
 const remove=node('button','danger','Excluir da visualização');remove.type='button';
 controls.append(law,guide,remove);
 const lawPanel=node('div','bm161-law-panel');lawPanel.hidden=true;
 const details=main.querySelector('.bm211-details');
 const summary=main.querySelector('.bm211-summary');
 if(summary)summary.setAttribute('aria-label','Abrir as 11 seções do cartão '+id);
 const sync=()=>{const open=!!details?.open;const icon=document.querySelector('#cardRows article.card:not(.bm221-trt-card)>.bm-v050-peek-button .bm163-ic');
  read.replaceChildren();
  if(icon)read.append(icon.cloneNode(true));
  read.append(document.createTextNode(open?'Fechar leitura':'Abrir leitura'));read.setAttribute('aria-expanded',String(open));main.hidden=!open;};
 read.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  const reader=window.BancoMestreVisualizarCardV050;
  if(reader?.showId){reader.showId(id,read);return;}
  // Apenas contingência se o leitor comum ainda não tiver inicializado.
  if(details)details.open=!details.open;sync();
 });
 details?.addEventListener('toggle',sync);
 guide.addEventListener('click',()=>{
  const reader=window.BancoMestreVisualizarCardV050;
  if(reader?.showId){reader.showId(id,guide);return;}
  if(details)details.open=true;sync();
 });
 law.addEventListener('click',async()=>{
  lawPanel.hidden=!lawPanel.hidden;
  law.textContent=lawPanel.hidden?'📜 Mostrar lei seca':'📜 Ocultar lei seca';
  law.setAttribute('aria-expanded',String(!lawPanel.hidden));
  if(lawPanel.hidden)return;
  lawPanel.replaceChildren(node('p','bm161-law-heading','Consultando fontes normativas…'));
  const f=FILES[id];if(!f)return;
  try{
   let data=records.get(id);
   if(!data){const r=await fetch(f+'?bm=trt-face-1',{cache:'default'});if(!r.ok)throw Error('HTTP '+r.status);data=await r.json();records.set(id,data);}
   if(lawPanel.hidden)return;
   lawPanel.replaceChildren(node('p','bm161-law-heading','LEI SECA — fontes normativas'),
    node('p','bm161-law-pending','A transcrição literal integral não foi validada neste cartão. Consulte o texto dos dispositivos em fonte oficial.'));
   for(const l of (Array.isArray(data.laws)?data.laws:[])){
    if(!/^https:\/\//.test(l.source_url||''))continue;
    const link=node('a','bm161-law-link',(l.norm||'Norma')+' · '+(l.article||'dispositivo'));
    link.href=l.source_url;link.target='_blank';link.rel='noopener noreferrer';
    lawPanel.append(link,node('div',''));
   }
  }catch(e){lawPanel.replaceChildren(node('p','bm161-law-pending','Referências não carregadas: '+String(e.message||e)));}
 });
 remove.addEventListener('click',()=>{
  wrap.hidden=true;hiddenCards.add(id);
  try{localStorage.setItem('BM236_TRT_HIDDEN',JSON.stringify([...hiddenCards]));}catch(_){}
  refreshRestore();schedule();
 });
 wrap.append(ribbon,h,read,tag,subjects,reference,controls,lawPanel,main);
 wrappers.set(id,wrap);sync();
 // Preencher só com informações encontradas no JSON original.
 const path=FILES[id];
 if(path)void fetch(path+'?bm=trt-face-1',{cache:'default'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
  if(data.id!==id)return;records.set(id,data);
  subjects.replaceChildren();
  for(const label of [data.discipline,data.subject,data.sub].filter(Boolean).slice(0,3))subjects.append(node('span','',label));
  const norms=(data.laws||[]).map(l=>(l.norm||'')+(l.article?' · '+l.article:'')).filter(Boolean);
  reference.querySelector('.bm221-reference-text').textContent='Referência cadastrada: '+(norms.join(' | ')||data.question_id||id);
 }).catch(()=>subjects.append(node('span','','TRT · fonte a conferir')));
 const answer=main.querySelector('.bm211-answer');
 if(answer){
  const meta=[...answer.querySelectorAll('.bm211-meta,.bm211-preserve')];
  if(meta.length){
   const info=node('details','bm221-trt-info'),title=node('summary','','Informações do cartão e histórico operacional');
   info.append(title,...meta,node('small','','Consulta sem lançamento automático no SRS.'));
   main.querySelector('.bm211-details .bm211-body')?.append(info);
   const relocate=()=>{if(!details?.open)return;const ov=main.querySelector('.bm198-overview');if(ov&&info.parentElement!==ov)ov.append(info);};
   details?.addEventListener('toggle',relocate);relocate();
  }
 }
 return wrap;
}
function arrange(){
 const panel=$('cartoes')?.querySelector('.panel'),rows=$('cardRows');
 if(!panel||!rows)return;
 muted=true;
 try{
  const visibleIds=[];
  for(const [id,domId] of IDS){
   let main=document.getElementById(domId),wrap=wrappers.get(id);
   if(!main&&wrap)main=wrap.querySelector('.bm211-card');
   if(!main&&!wrap)continue;
   wrap=wrapperFor(id,main);
   if(validFilters(wrap,id)){
    wrap.hidden=hiddenCards.has(id);if(!wrap.hidden)visibleIds.push(id);
    if(wrap.parentElement!==rows)rows.append(wrap);
   }else if(wrap.parentElement===rows)wrap.remove();
  }
  counterStatus(visibleIds);
  foldSource();
 }finally{muted=false;}
}
function schedule(){
 if(muted||queued)return;
 queued=true;requestAnimationFrame(()=>{queued=false;arrange();});
}
function init(){
 const panel=$('cartoes')?.querySelector('.panel'),rows=$('cardRows');
 if(!panel||!rows)return;
 const restore=document.createElement('button');restore.id='bm236RestoreTrt';restore.type='button';restore.className='bm221-restore';
 restore.addEventListener('click',()=>{hiddenCards.clear();try{localStorage.setItem('BM236_TRT_HIDDEN','[]')}catch(_){}refreshRestore();schedule();});
 rows.before(restore);refreshRestore();
 const css=document.createElement('style');css.id='bm221-trt-grid-style';
 css.textContent=[
 '#cardRows>.bm221-trt-card{min-width:0;box-sizing:border-box;display:flex;flex-direction:column;gap:7px;overflow:hidden}',
 '#cardRows[data-bm225-trt-visible="true"]>p[hidden]{display:none!important}',
 '#cardRows>.bm221-trt-card>h3{font-size:14px;line-height:1.45;margin:2px 0 4px;overflow-wrap:anywhere;white-space:normal}',
 '#cardRows>.bm221-trt-card>.tag{align-self:flex-start}',
 '#cardRows>.bm221-trt-card .bm221-trt-open{cursor:pointer}',
 '#cardRows>.bm221-trt-card .bm221-trt-open:hover{background:#e4f4f0!important}',
 '#cardRows>.bm221-trt-card .bm221-trt-open:focus-visible{outline:2px solid #287c7c;outline-offset:2px}',
 '#cardRows>.bm221-trt-card[hidden]{display:none}',
 '.bm221-trt-card>.bm211-card{display:block!important;visibility:visible!important;width:100%;max-width:100%;min-width:0;margin:0;padding:0;border:0;box-shadow:none;background:transparent}',
 '#cardRows>.bm221-trt-card .bm211-media,#cardRows>.bm221-trt-card .bm211-module,#cardRows>.bm221-trt-card .bm198-overview,#cardRows>.bm221-trt-card .bm198-module{display:block!important;visibility:visible!important}',
 '#cardRows>.bm221-trt-card .bm198-modules{display:flex;flex-direction:column;gap:12px}',
 '#cardRows>.bm221-trt-card .bm198-module{border:1px solid #dce7e2;border-radius:9px;overflow:hidden;background:#fff}',
 '#cardRows>.bm221-trt-card .bm198-module-head{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#f3f8f6}',
 '#cardRows>.bm221-trt-card .bm198-module-body{padding:12px;font-size:13px;line-height:1.6}',
 '#cardRows>.bm221-trt-card .bm198-paragraph{white-space:pre-wrap;overflow-wrap:anywhere}',
 '#cardRows>.bm221-trt-card .bm198-table-scroll{overflow:auto;max-width:100%}',
 '#cardRows>.bm221-trt-card .bm211-body{padding:12px 0 2px}',
 '#cardRows>.bm221-trt-card .bm211-answer{padding:10px 12px;border:1px solid #dae8e4;background:#f7faf9;border-radius:8px;margin-bottom:12px}',
 '#cardRows>.bm221-trt-card .bm211-core{font-size:13px;font-weight:650;line-height:1.5}',
 '#cardRows>.bm221-trt-card .bm211-media{border:1px solid #c6d8d2;background:#fbfdfc;padding:12px;border-radius:10px;margin:14px 0}',
 '#cardRows>.bm221-trt-card .bm211-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}',
 '#cardRows>.bm221-trt-card .bm211-frame{display:flex;align-items:center;justify-content:center;min-height:120px;max-height:460px;overflow:auto}',
 '#cardRows>.bm221-trt-card .bm211-image{max-width:100%;max-height:440px;object-fit:contain}',
 '#cardRows>.bm221-trt-card .bm211-image[hidden],#cardRows>.bm221-trt-card .bm211-placeholder[hidden]{display:none!important}',
 '#cardRows>.bm221-trt-card .bm211-plain{white-space:pre-wrap;font-size:13px;line-height:1.55}',
 '#cardRows>.bm221-trt-card .bm211-figcaption{font-size:12px;line-height:1.5}',
 '#cardRows>.bm221-trt-card .bm211-link{color:#17646c;text-decoration:underline}',
 '@media(max-width:650px){#cardRows>.bm221-trt-card .bm211-grid{grid-template-columns:1fr}}',
 '.bm221-trt-card>.bm211-card .bm211-kicker{display:none}',
 '.bm221-trt-card>.bm211-card>.bm211-details{width:100%;max-width:100%;margin:0}',
 '.bm221-trt-card>.bm211-card .bm211-summary{display:none!important}',
 '.bm221-operational-label{font-size:11px;color:#557276}',
 '.bm221-trt-info{margin:14px 0 0;border-top:1px solid #dce7e6;padding:10px}',
 '.bm221-trt-info>summary{font-size:12px;color:#557276;cursor:pointer}',
 '#bm221CardInformation{margin:20px 0 0;border:1px solid #d8e4e2;border-radius:9px;padding:10px;color:#526f72;font-size:12px}',
 '#bm221CardInformation>summary{cursor:pointer;font-weight:600;color:#385c61}',
 '#bm221CardInformation #bm119PublicSource{border:0;background:transparent;margin:10px 0 0}',
 '#cardRows.bm191-all-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}',
 '#cardRows>.bm221-trt-card .bm211-body{min-width:0;overflow-wrap:anywhere}',
 '#cardRows>.bm221-trt-card>.bm211-card[hidden]{display:none!important}',
 '#cardRows>.bm221-trt-card>.bm-v050-peek-button{position:absolute!important;top:53px!important;right:13px!important;width:auto!important;min-height:37px!important;padding:7px 10px!important;font-size:11px!important;display:inline-flex!important;z-index:1}',
 '#cardRows>.bm221-trt-card>h3{padding-right:110px!important;line-height:1.5!important;font-size:clamp(14px,1.15vw,16px)!important;margin:2px 0 5px!important}',
 '#cardRows>.bm221-trt-card>.bm221-trt-references{display:flex;gap:5px;flex-wrap:wrap;margin:1px 0 2px}',
 '#cardRows>.bm221-trt-card>.bm221-trt-references span{border:1px solid #d2e0e6;background:#f9fbfd;border-radius:5px;padding:3px 6px;font-size:10px;line-height:1.35;color:#486777;max-width:100%;overflow-wrap:anywhere}',
 '#cardRows>.bm221-trt-card>.bm163-card-ref{margin:1px 0 3px!important}',
 '#cardRows>.bm221-trt-card>.buttons{display:flex!important;flex-wrap:wrap;gap:7px!important;margin-top:auto!important;padding-top:10px!important;border-top:1px solid #e4ecea}',
 '#cardRows>.bm221-trt-card>.buttons button{min-height:35px!important;font-size:11px!important;line-height:1.3!important;padding:7px 10px!important;border-radius:7px!important}',
 '#cardRows>.bm221-trt-card>.bm211-card{margin-top:2px!important}',
 '#cardRows>.bm221-trt-card .bm161-law-panel[hidden],#bm236RestoreTrt[hidden]{display:none!important}',
 '#cardRows>.bm221-trt-card .bm161-law-link{display:inline-block;margin:3px 0}',
 '@media(max-width:650px){#cardRows>.bm221-trt-card>.bm-v050-peek-button{position:static!important;align-self:flex-start;order:0;margin:3px 0!important;font-size:12px!important;min-height:40px!important}#cardRows>.bm221-trt-card>h3{padding-right:0!important}#cardRows>.bm221-trt-card>.buttons{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))}}'
 ].join('\n');
 document.head.append(css);
 const label=document.createElement('small');label.id='bm221TrtCount';
 label.setAttribute('role','status');label.style.cssText='font-size:11px;color:#557174;display:block;margin:7px 0';
 rows.before(label);
 new MutationObserver(schedule).observe(rows,{childList:true});
 new MutationObserver(schedule).observe(panel,{childList:true,subtree:false});
 for(const id of ['cardSearch','cardFilter','cardTopicFilter','bm128CardGeneral']) {
  const x=$(id);if(x){x.addEventListener('input',schedule);x.addEventListener('change',schedule);}
 }
 document.addEventListener('bm-v185-cards-synced',schedule);
 document.addEventListener('bm225-legal-records',schedule);
 document.addEventListener('bm221-card-rendered',schedule);
 document.addEventListener('bm-media-drive-authorized',()=>{
  // Cartão TRT já aberto passa a buscar as imagens sem fechar/abrir novamente.
  for(const card of wrappers.values()){
   const details=card.querySelector('.bm211-details');
   if(details?.open)details.dispatchEvent(new Event('toggle'));
  }
 });
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM236TrtCardsGrid=Object.freeze({refresh:schedule,getRecord,loadRecord,isHidden:id=>hiddenCards.has(id),get loaded(){return wrappers.size},ids:IDS.map(x=>x[0])});
})();

;
/* 102 · assets/v222_images_live.js */
/* V221 — Biblioteca de imagens sempre visível, sem recarga de página.
 * Mantém o Drive como única fonte visual e preserva grifos, IDs e buscas existentes. */
(function(){
'use strict';
if(window.BM221ImagesLive)return;
const $=id=>document.getElementById(id);
let mounted=false,refreshStarted=0,pending=false,observer=null,loginWasSeen=false;
function sourceReady(){return Boolean(window.BancoMestreDriveImagesV182?.connected);}
function node(){
 const root=$('imagens')?.querySelector('.panel'),rows=$('imageRows');
 if(!root||!rows)return null;
 let vp=$('bm221DriveViewport');
 if(!vp){
  vp=document.createElement('div');vp.id='bm221DriveViewport';
  vp.setAttribute('aria-label','Imagens originais do Google Drive');
  const anchor=$('bm153Directory')||$('bm209SyncBar')||root.querySelector('.controls');
  if(anchor&&anchor.parentElement===root)anchor.after(vp);
  else root.append(vp);
 }
 if(rows.parentElement!==vp)vp.append(rows);
 rows.hidden=false;vp.hidden=false;
 // O renderizador de grupos legado pode tornar a grade invisível. Esta fonte é única.
 rows.style.setProperty('display','grid','important');
 return {root,rows,vp};
}
function sync(){
 const place=node();if(!place)return false;
 const {rows,vp}=place,source=$('bm084-grid');
 if(source&&source.children.length){
  const fresh=[...source.children].filter(x=>x.tagName==='ARTICLE');
  if(fresh.length){
   for(const old of rows.querySelectorAll(':scope > article.bm209ImageFromDrive'))old.remove();
   for(const card of fresh){
    card.classList.add('card','bm209ImageFromDrive');
    card.dataset.bm209ImageOrigin='drive';
    rows.append(card);
   }
  }
 }
 const known=[...rows.querySelectorAll(':scope > article.bm209ImageFromDrive')];
 for(const other of rows.querySelectorAll(':scope > article:not(.bm209ImageFromDrive)'))other.hidden=true;
 vp.dataset.bm221Count=String(known.length);
 const status=$('bm221ImageVisible');
 if(status){
  if(!sourceReady())status.textContent='Conecte o Google Drive para visualizar os originais.';
  else if(known.length)status.textContent=known.length+' imagens exibidas nesta página · atualizadas sem recarregar o site.';
  else status.textContent='Drive conectado. A consulta de imagens está sendo concluída ou não há resultados para os filtros.';
 }
 return known.length>0;
}
function queue(){
 if(pending)return;
 pending=true;requestAnimationFrame(()=>{pending=false;sync();});
}
function css(){
 if($('bm221-images-style'))return;
 const style=document.createElement('style');style.id='bm221-images-style';
 style.textContent=[
 '#imagens #bm221DriveViewport{display:block!important;visibility:visible!important;min-height:60px;margin:10px 0 18px}',
 '#imagens #bm221DriveViewport[hidden]{display:block!important}',
 '#imagens #bm221DriveViewport #imageRows{display:grid!important;visibility:visible!important;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:10px}',
 '#imagens #bm221DriveViewport #imageRows[hidden]{display:grid!important}',
 '#imagens #bm221DriveViewport article.bm209ImageFromDrive{display:block!important;visibility:visible!important;min-width:0}',
 '#imagens #bm221ImageVisible{font-size:12px;color:#516a6d;padding:5px 0}'
 ].join('\n');
 document.head.append(style);
}
function refresh(reason){
 if(!sourceReady())return false;
 const now=Date.now();
 if(now-refreshStarted<25000)return false;
 refreshStarted=now;
 const provider=window.BancoMestreDriveImagesV182;
 if(!provider?.refresh)return false;
 Promise.resolve(provider.refresh()).then(()=>queue()).catch(err=>{
  const state=$('bm221ImageVisible');
  if(state)state.textContent='Atualização do Drive indisponível: '+String(err?.message||err);
 });
 return true;
}
function initialise(){
 if(mounted)return;
 const root=$('imagens')?.querySelector('.panel');
 if(!root||!$('imageRows'))return;
 mounted=true;css();
 const info=document.createElement('p');info.id='bm221ImageVisible';info.setAttribute('role','status');
 const anchor=$('bm153Directory')||$('bm209SyncBar')||root.querySelector('.controls');
 if(anchor?.parentElement===root)anchor.after(info);else root.append(info);
 sync();
 const source=$('bm084-grid');
 if(source&&!observer){
  observer=new MutationObserver(queue);
  observer.observe(source,{childList:true});
 }
 document.addEventListener('bm209-drive-render',queue);
 document.addEventListener('bm218-image-filter-change',queue);
 document.addEventListener('bm-media-drive-authorized',()=>{
  loginWasSeen=true;queue();
  // O sincronizador Drive já recebe este evento. Não iniciar outra varredura concorrente.
 });
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){queue();refresh('visible');}
 });
 window.addEventListener('focus',()=>{queue();refresh('focus');});
 window.addEventListener('online',()=>{queue();refresh('online');});
 document.querySelector('nav button[data-page="imagens"]')?.addEventListener('click',()=>{
  queue();refresh('images-tab');
 });
 const viewport=$('bm221DriveViewport');
 if(viewport)new MutationObserver(queue).observe(viewport,{childList:true});
 if(sourceReady()){loginWasSeen=true;queue();}
}
document.readyState==='loading'
 ?document.addEventListener('DOMContentLoaded',initialise,{once:true})
 :initialise();
window.BM221ImagesLive=Object.freeze({refresh,render:queue,get ready(){return mounted},get loginSeen(){return loginWasSeen}});
})();

;
/* 103 · assets/v222_pdf_editor_route.js */
/* V221 — clique da biblioteca abre PDFs diretamente no editor, sem passagem obrigatória
 * pelo iframe Google Drive; atualizar a lista após reconectar/voltar à aba. */
(function(){
'use strict';
if(window.BM221PdfEditorRoute)return;
const $=id=>document.getElementById(id);
const ID=/^[A-Za-z0-9_-]{15,}$/;
// Não sobrescrever pdfOpen: o próprio renderizador PDF usa esta função internamente.
let refreshAt=0;
function source(doc){
 if(!doc||typeof doc!=='object')return null;
 const fileId=String(doc.file_id||'');
 if(ID.test(fileId))return doc;
 const url=String(doc.url||'');
 const hit=url.match(/^https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{15,})\/(?:view|preview)(?:[?#].*)?$/);
 if(hit)return {...doc,file_id:hit[1]};
 return null;
}
function reader(){return window.BancoMestreDriveV042||window.BancoMestreDriveV038;}
function open(doc){
 const managed=source(doc);
 const connect=reader();
 if(!managed||!connect?.openAndEdit)return false;
 // Se o PDF já está aberto com anotações, não perder os grifos ao pressionar novamente.
 if(window.BancoMestrePDFV042?.editing&&
    window.BancoMestrePDFV042?.currentDoc?.id===managed.id)return true;
 const response=connect.openAndEdit(managed);
 if(!connect.connected&&connect.ready)connect.authorize();
 Promise.resolve(response).then(ok=>{
  const status=$('bm-pdf-sync-status');
  if(ok===true&&status)status.textContent='PDF aberto no editor: grifos, notas e anotações disponíveis nesta página.';
 }).catch(error=>{
  const status=$('bm-pdf-sync-status');
  if(status)status.textContent='Não foi possível abrir o PDF no editor: '+String(error?.message||error);
 });
 return response;
}
function update(force=false){
 const provider=window.BancoMestrePDFSyncV130,connected=!!window.BancoMestreMediaSyncV182?.token?.();
 if(!connected||!provider?.refresh)return false;
 const now=Date.now();
 if(!force&&now-refreshAt<120000)return false;
 refreshAt=now;
 Promise.resolve(provider.refresh()).catch(error=>{
  const box=$('bm-pdf-sync-status');
  if(box)box.textContent='Consulta de PDFs indisponível: '+String(error?.message||error);
 });
 return true;
}
function init(){
 const list=$('pdfRows');
 // Captura apenas o gesto "Ler / editar PDF" na biblioteca.
 // Deixa pdfOpen intocado para o próprio PDF.js inicializar a tela sem recursão.
 list?.addEventListener('click',event=>{
  const button=event.target.closest?.('button');
  if(!button||!/^Ler\s*\/\s*editar\s+PDF$/i.test(button.textContent?.trim()||''))return;
  const article=button.closest('article.card'),id=article?.querySelector(':scope > .tag')?.textContent?.trim();
  if(!id||typeof docs==='undefined'||!Array.isArray(docs))return;
  const record=docs.find(x=>x.id===id);
  if(!source(record)||!reader()?.openAndEdit)return;
  event.preventDefault();event.stopImmediatePropagation();
  void open(record);
 },true);
 document.addEventListener('bm-media-drive-authorized',()=>{
  // O módulo de PDF já programou a varredura inicial após a autorização.
  const status=$('bm-pdf-sync-status');
  if(status)status.textContent='Drive conectado. Conferindo PDFs para edição nesta página…';
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
 window.addEventListener('focus',()=>update());
 window.addEventListener('online',()=>update());
 const nav=document.querySelector('nav button[data-page="pdfs"]');
 nav?.addEventListener('click',()=>update());
 // Abrir PDF é uma operação de leitura: o original do Drive não é sobrescrito.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.BM221PdfEditorRoute=Object.freeze({open,source,update,get installed(){return Boolean($('pdfRows'))}});
})();

;
/* 104 · assets/v259_site_version.js */
/* V259 — leitura da versao real inclusive no index.html estatico. */
/* V232 — versão efetiva da página no cabeçalho e no rodapé.
   A versão vem da URL versionada; módulos históricos não podem mascará-la.
   Reutilizável em próximas edições sem modificar V206 nem a base canônica. */
(function(){
'use strict';
if(window.BM232SiteVersion)return;
const match=location.pathname.match(/\/v(\d{3})\.html$/i);
const current=match?'V'+match[1]:(document.documentElement.getAttribute('data-bm-portal-version')||'V259');
let ready=false;
function refresh(){
 const badge=document.querySelector('header .brand > .version');
 const counts=window.BM206Header?.counts;
 const privateSource=counts?.origin==='privada';
 const source=privateSource?'cartões privados autorizados':'cartões V194';
 const header='Portal '+current+' · '+source+' · Atlas V198';
 if(badge && badge.textContent!==header)badge.textContent=header;
 const footer=document.querySelector('main > footer');
 const caption='Portal '+current+' · cartões e formatação no GitHub · originais no Google Drive · histórico pessoal privado';
 if(footer && footer.textContent!==caption)footer.textContent=caption;
}
function init(){
 if(ready)return;ready=true;
 refresh();
 const badge=document.querySelector('header .brand > .version');
 const footer=document.querySelector('main > footer');
 if(typeof MutationObserver!=='undefined'){
  for(const el of [badge,footer]){
   if(el)new MutationObserver(refresh).observe(el,{childList:true,characterData:true,subtree:true});
  }
 }
 document.addEventListener('bm-v185-cards-synced',refresh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM232SiteVersion=Object.freeze({refresh,get version(){return current}});
})();

;
/* 105 · assets/v232_grid_persist.js */
/* V232 — preservar a grade dos flashcards em qualquer busca ou filtro.
   Muda só os nós de apresentação; não altera filtros, IDs, conteúdo, SRS ou paginação. */
(function(){
'use strict';
if(window.BM232GridPersist || typeof cardRender!=='function')return;
const rows=()=>document.getElementById('cardRows');
function normalize(){
 const root=rows();
 if(!root)return 0;
 const groups=root.querySelectorAll(':scope > .bm128CardsGroup');
 if(groups.length){
   // Os cartões já filtrados foram criados pelo renderizador original.
   // Retirá-los dos agrupamentos não altera o conteúdo nem seus listeners.
   const items=Array.from(root.querySelectorAll('article.card'));
   if(items.length)root.replaceChildren(...items);
 }
 root.classList.add('bm191-all-grid');
 return root.querySelectorAll(':scope > article.card').length;
}
const original=cardRender;
cardRender=function(...args){
 const result=original.apply(this,args);
 normalize();
 return result;
};
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',normalize,{once:true});
}else normalize();
document.addEventListener('bm-v185-cards-synced',normalize);
window.BM232GridPersist=Object.freeze({refresh:normalize});
})();

;
/* 106 · assets/trt01_c007_loader.js */
/* Banco Mestre TRT01-C007 — cartão completo 11 módulos e 2 imagens originais vinculadas.
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BMTRT01C007)return;
const ID='TRT01-C007';
const DATA='assets/trt01_c007_v222.json?v=222-c007';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'uma imagem original incorporada ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as cinco imagens aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'imagem original carregada do drive autorizado; arquivo e grifos preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bmtrt01-c007'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bmtrt01-c007';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bmtrt01-c007-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · alternativa B correta · avaliação SRS ainda não atribuída'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional aprovado; a resposta B foi preservada, sem gerar evento SRS ou data de revisão.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt01-c007'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT01-Q007-IMG01-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BMTRT01C007=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==1)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('TRT C007: cartão não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();


;
/* 107 · assets/trt01_c008_loader.js */
/* Banco Mestre TRT01-C008 — cartão completo 11 módulos e 3 imagens originais vinculadas.
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BMTRT01C008)return;
const ID='TRT01-C008';
const DATA='assets/trt01_c008_v224.json?v=224-c008';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'três imagens originais incorporadas ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as cinco imagens aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'três imagens carregadas do drive autorizado; originais e anotações preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bmtrt01-c008'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bmtrt01-c008';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bmtrt01-c008-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · alternativa C correta · avaliação SRS ainda não atribuída'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional aprovado; a resposta C foi preservada, sem gerar evento SRS ou data de revisão.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt01-c008'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT01-Q008-IMG0[1-3]-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BMTRT01C008=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==3)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('TRT C008: cartão não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();


;
/* 108 · assets/trt01_c009_loader.js */
/* Banco Mestre TRT01-C009 — cartão completo 11 módulos e 3 imagens originais vinculadas.
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BMTRT01C009)return;
const ID='TRT01-C009';
const DATA='assets/trt01_c009_v227.json?v=227-c009';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'duas imagens originais incorporadas ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as cinco imagens aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'duas imagens carregadas do drive autorizado; originais e anotações preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bmtrt01-c009'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bmtrt01-c009';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bmtrt01-c009-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · resposta original A incorreta · gabarito B · SRS ainda não avaliado'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional aprovado; o erro A e gabarito B foram preservados, sem gerar evento SRS ou data de revisão.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt01-c009'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT01-Q009-IMG0[1-2]-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BMTRT01C009=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==2)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('TRT C009: cartão não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();


;
/* 109 · assets/trt02_c001_loader.js */
/* Banco Mestre TRT02-C001 — cartão completo 11 módulos e 1 imagem original vinculadas.
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BMTRT02C001)return;
const ID='TRT02-C001';
const DATA='assets/trt02_c001_v230.json?v=230-c001';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'uma imagem original incorporada ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as uma imagem aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'uma imagem carregada do drive autorizado; originais e anotações preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bmtrt02-c001'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bmtrt02-c001';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bmtrt02-c001-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · resposta original D correta por chute · gabarito D · SRS ainda não avaliado'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional aprovado; a resposta D por chute e o gabarito D foram preservados, sem gerar evento SRS ou data de revisão.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt02-c001'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT02-Q001-IMG01-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BMTRT02C001=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==1)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('TRT C001: cartão não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();


;
/* 110 · assets/trt02_c002_loader_v237.js */
/* Banco Mestre TRT02-C002 — cartão evolutivo 11 módulos e 6 imagens de duas questões (Q002/Q003).
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BMTRT02C002)return;
const ID='TRT02-C002';
const DATA='assets/trt02_c002_v237.json?v=237-c002';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'seis imagens originais vinculadas ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as seis imagens aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'seis imagens carregadas do drive autorizado; originais e anotações preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bmtrt02-c002'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bmtrt02-c002';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bmtrt02-c002-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · resposta original B incorreta · gabarito D · SRS ainda não avaliado'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional aprovado; a resposta B e o gabarito D foram preservados, sem gerar evento SRS ou data de revisão.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt02-c002'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT02-Q00(?:2-IMG0[1-4]|3-IMG0[1-2])-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BMTRT02C002=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==6)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('TRT C002: cartão não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();


;
/* 111 · assets/trt02_c004_loader.js */
/* Banco Mestre TRT02-C004 — cartão completo 11 módulos e 4 imagens originais vinculadas.
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BMTRT02C004)return;
const ID='TRT02-C004';
const DATA='assets/trt02_c004_v232.json?v=232-c004';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'quatro imagens originais incorporadas ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as quatro imagens aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'quatro imagens carregadas do drive autorizado; originais e anotações preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bmtrt02-c004'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bmtrt02-c004';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bmtrt02-c004-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · resposta original E incorreta · gabarito B · SRS ainda não avaliado'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional aprovado; a resposta E e o gabarito B foram preservados, sem gerar evento SRS ou data de revisão.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt02-c004'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT02-Q004-IMG0[1-4]-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BMTRT02C004=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==4)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('TRT C004: cartão não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();

