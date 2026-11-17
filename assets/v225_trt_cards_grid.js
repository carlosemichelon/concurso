/* V225 — TRT C001-C008 no filtro jurídico e grade sem títulos duplicados. */
/* V221 — cartões TRT01 C001–C008 na mesma grade dos cartões, sem alterar seus dados.
 * O SRS e o Banco Mestre canônico continuam separados. */
(function(){
'use strict';
if(window.BM224TrtCardsGrid)return;
const $=id=>document.getElementById(id);
const IDS=[
 ['TRT01-C001','bm211-trt-card'],
 ['TRT01-C002','bm212-trt-card'],
 ['TRT01-C003','bm215-trt-card'],
 ['TRT01-C004','bmtrt01-c004'],
 ['TRT01-C005','bmtrt01-c005'],
 ['TRT01-C006','bmtrt01-c006'],
 ['TRT01-C007','bmtrt01-c007'],
 ['TRT01-C008','bmtrt01-c008']
];
const wrappers=new Map();
let queued=false,muted=false;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function validFilters(article,id){
 const q=norm($('cardSearch')?.value).trim();
 const meta=window.BM225LegalTaxonomy?.byId?.(id);
 const words=norm([article.querySelector('h3')?.textContent,id,'TRT Direito Constitucional Legislação',
  meta?.subject,meta?.sub,meta?.discipline].filter(Boolean).join(' '));
 if(q&&!words.includes(q))return false;
 if(meta&&window.BM152FlashFilters?.matches?.(meta)===false)return false;
 const disc=$('cardFilter')?.value||'all';
 if(disc!=='all'&&!/legisl|constit|direito/i.test(disc))return false;
 const topic=$('cardTopicFilter')?.value||'all';
 if(topic!=='all'&&!/constit|trt|legisl/i.test(topic))return false;
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
  :'TRT: use Legislação › Direito Constitucional';
 if(extra){
  const count=$('cardCount');
  if(count&&/\b0\s+cart/i.test(count.textContent||''))count.textContent=extra+' cartões TRT';
  const all=$('bm191CardCount');
  if(all&&/\b0\s+cart/i.test(all.textContent||''))all.textContent=extra+' cartão(ões) TRT na grade';
  const label=$('bm152FilterStatus');
  if(label&&/\b0\s+cart/i.test(label.textContent||''))label.textContent=extra+' cartão(ões) TRT encontrados · Direito Constitucional';
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
 if(!wrap){
  wrap=document.createElement('article');wrap.className='card bm221-trt-card';wrap.dataset.bm221Id=id;
  const tag=document.createElement('span');tag.className='tag';tag.textContent=id;
  const heading=document.createElement('h3');heading.textContent=main.querySelector('.bm211-summary strong')?.textContent||id;
  wrap.append(tag,heading);
  const summary=main.querySelector('.bm211-summary');
  if(summary){summary.setAttribute('aria-label','Abrir resposta e explicações do '+id);
   const small=summary.querySelector('small');if(small)small.textContent='Abrir resposta, 11 módulos e imagens';}
  const status=document.createElement('small');status.className='bm221-operational-label';
  status.textContent='Legislação · TRT · cartão operacional · sem lançar SRS automaticamente';
  wrap.append(status,main);wrappers.set(id,wrap);
  const answer=main.querySelector('.bm211-answer');
  if(answer){
   const metainfo=[...answer.querySelectorAll('.bm211-meta,.bm211-preserve')];
   if(metainfo.length){
    const info=document.createElement('details');info.className='bm221-trt-info';
    const sum=document.createElement('summary');sum.textContent='Informações do cartão e histórico operacional';
    info.append(sum,...metainfo);
    main.querySelector('.bm211-details .bm211-body')?.append(info);
   }
  }
 }else if(main.parentElement!==wrap)wrap.append(main);
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
    wrap.hidden=false;visibleIds.push(id);
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
 const css=document.createElement('style');css.id='bm221-trt-grid-style';
 css.textContent=[
 '#cardRows>.bm221-trt-card{min-width:0;box-sizing:border-box;display:flex;flex-direction:column;gap:7px;overflow:hidden}',
 '#cardRows[data-bm225-trt-visible="true"]>p[hidden]{display:none!important}',
 '#cardRows>.bm221-trt-card>h3{font-size:14px;line-height:1.45;margin:2px 0 4px;overflow-wrap:anywhere;white-space:normal}',
 '#cardRows>.bm221-trt-card>.tag{align-self:flex-start}',
 '#cardRows>.bm221-trt-card[hidden]{display:none}',
 '.bm221-trt-card>.bm211-card{width:100%;max-width:100%;min-width:0;margin:0;padding:0;border:0;box-shadow:none;background:transparent}',
 '.bm221-trt-card>.bm211-card .bm211-kicker{display:none}',
 '.bm221-trt-card>.bm211-card>.bm211-details{width:100%;max-width:100%;margin:0}',
 '.bm221-trt-card>.bm211-card .bm211-summary strong{display:none!important}',
 '.bm221-trt-card>.bm211-card .bm211-summary{box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;max-width:100%;overflow-wrap:anywhere;white-space:normal;font-size:12px;line-height:1.4;padding:10px;border-radius:8px}',
 '.bm221-trt-card>.bm211-card .bm211-summary small{font-size:12px;line-height:1.4;white-space:normal;overflow-wrap:anywhere}',
 '.bm221-operational-label{font-size:11px;color:#557276}',
 '.bm221-trt-info{margin:14px 0 0;border-top:1px solid #dce7e6;padding:10px}',
 '.bm221-trt-info>summary{font-size:12px;color:#557276;cursor:pointer}',
 '#bm221CardInformation{margin:20px 0 0;border:1px solid #d8e4e2;border-radius:9px;padding:10px;color:#526f72;font-size:12px}',
 '#bm221CardInformation>summary{cursor:pointer;font-weight:600;color:#385c61}',
 '#bm221CardInformation #bm119PublicSource{border:0;background:transparent;margin:10px 0 0}',
 '#cardRows.bm191-all-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}',
 '#cardRows>.bm221-trt-card .bm211-body{min-width:0;overflow-wrap:anywhere}'
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
window.BM225TrtCardsGrid=Object.freeze({refresh:schedule,get loaded(){return wrappers.size},ids:IDS.map(x=>x[0])});
})();