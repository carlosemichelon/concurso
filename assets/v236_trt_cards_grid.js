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