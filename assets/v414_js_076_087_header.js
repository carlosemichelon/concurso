/* V315 IIFE 76–87 order preserved */

;
/* 76 assets/v276_public_layers.js */
/* Banco Mestre V194: versos integrais públicos e didáticos, sem Drive.
 * Busca somente o lote do cartão aberto (7 arquivos públicos) após revelar o verso.
 * Não lê nem escreve dados SRS, localStorage, IndexedDB, avaliações, grifos ou Drive.
 */
(function(){
 'use strict';
 if(window.BM194VersosPublicos)return;
 const RESERVED=new Set(['CARD-0138','CARD-0194','CARD-0248','CARD-0286','CARD-0350','CARD-0424','CARD-0445','CARD-0502','CARD-0509','CARD-0510','CARD-0693']);
 const cache=new Map(); let modal,answer,observer,queued=false;
 const el=(type,text,cls)=>{const e=document.createElement(type); if(cls)e.className=cls; if(text!==undefined)e.textContent=String(text); return e;};
 const currentId=()=>window.BancoMestreVisualizarCardV050?.currentId||'';
 const shardFor=id=>{if(!/^CARD-\d{4}$/.test(id))return -1;const n=Number(id.slice(5));return n>=1&&n<=1519?Math.floor((n-1)/250):-1};
 const eligible=id=>/^CARD-\d{4}$/.test(id)&&!RESERVED.has(id);
 function appendText(host,source){
  // Conteúdo textual não é tratado como HTML: impede injeção de markup vindo do JSON.
  const lines=String(source||'').split(/\r?\n/);
  for(let i=0;i<lines.length;){
    if(lines[i].trim().startsWith('|') && i+1<lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i+1])){
      const tbl=el('table',undefined,'bm194-table');
      const heads=lines[i].trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim());
      const head=el('thead'),tr=el('tr');heads.forEach(h=>tr.append(el('th',h)));head.append(tr);tbl.append(head);
      const body=el('tbody');i+=2;
      while(i<lines.length && lines[i].trim().startsWith('|')){
        const tr=el('tr'),cells=lines[i].trim().replace(/^\||\|$/g,'').split('|');
        for(let n=0;n<heads.length;n++)tr.append(el('td',(cells[n]||'').trim()));
        body.append(tr);i++;
      }
      tbl.append(body);host.append(tbl);continue;
    }
    const chunk=[];
    while(i<lines.length && !(lines[i].trim().startsWith('|') && i+1<lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i+1]))){chunk.push(lines[i]);i++}
    if(chunk.join('').trim())host.append(el('p',chunk.join('\n'),'bm194-text'));
  }
 }
 async function shard(index){
  if(!cache.has(index)){
   // Apenas o lote do cartão consultado; mantém sete arquivos públicos estáticos e cache local de leitura.
   const filename='assets/layers_public_v194_'+String(index).padStart(3,'0')+'.json?v=194';
   const promise=(async()=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),30000);
    let response;
    try{response=await fetch(filename,{cache:'default',signal:controller.signal});}
    finally{clearTimeout(timeout)}
    if(!response.ok)throw Error('Arquivo de explicações não disponível (HTTP '+response.status+').');
    const rows=await response.json();
    const extResponse=await fetch('assets/estudos_incrementos_v267.json?v=267',{cache:'no-store'});
    if(!extResponse.ok)throw Error('Adendos V267 indisponíveis');
    const ext=await extResponse.json();
    if(ext.version!=='V267-PETRO17-PETRO20'||!Array.isArray(ext.cards))throw Error('Adendos V267 incompatíveis');
    const extMap=new Map(ext.cards.map(c=>[c.id,c]));
    for(const item of rows){const inc=extMap.get(item.id);if(!inc)continue;
      if(!Array.isArray(item.layers)||item.layers.length!==11)throw Error('11 módulos incompletos: '+item.id);
      for(const a of inc.layer_addenda||[]){const dest=item.layers.find(l=>l.ord===a.ord);if(!dest)throw Error('Módulo não encontrado: '+item.id);
        const marker='\n\nADENDO V267 — '+inc.origin+'\n';
        if(!String(dest.texto).includes('ADENDO V267 — '+inc.origin))dest.texto+=marker+a.texto;
      }
    }
    if(!Array.isArray(rows))throw Error('O arquivo não contém uma lista de cartões.');
    const map=new Map();
    for(const x of rows){
     if(!/^CARD-\d{4}$/.test(x.id)||!Array.isArray(x.layers)||x.layers.length!==11||map.has(x.id))
      throw Error('Lote técnico incompleto: '+String(x.id));
     if(x.layers.some((l,i)=>l.ord!==i+1||!String(l.titulo||'').trim()||!String(l.texto||'').trim()))
      throw Error('Uma das 11 seções está vazia ou fora de ordem: '+x.id);
     map.set(x.id,x);
    }
    return map;
   })();
   cache.set(index,promise);
   promise.catch(()=>{if(cache.get(index)===promise)cache.delete(index)});
  }
  return cache.get(index);
 }
 function render(id,box){
  if(!eligible(id))return;
  const target=box.querySelector('.bm194-detail');if(!target)return;
  const idx=shardFor(id),viaDelta=!!window.BM276LayerData?.has?.(id);if(idx<0&&!viaDelta)return;
  target.replaceChildren(el('p','Carregando as 11 seções do cartão '+id+'…','bm194-loading'));
  (viaDelta?window.BM276LayerData.get(id):shard(idx).then(rows=>rows.get(id))).then(card=>{
   // A leitura pode terminar depois que o estudante trocou de cartão.
   if(!box.isConnected||currentId()!==id)return;
   if(!card){
    const existing=(typeof cards!=='undefined'&&Array.isArray(cards))?cards.find(c=>c.id===id):null;
    const msg=existing?.active===false
      ?'Este registro histórico está inativo. A resposta original foi preservada e não há 11 camadas aprovadas para ele.'
      :'O lote foi carregado, mas não contém as 11 camadas deste cartão. A resposta original permanece preservada.';
    target.replaceChildren(el('p',msg,'bm194-error'));
    return;
   }
   const fragment=document.createDocumentFragment();
   for(const layer of card.layers){
    const section=el('section',undefined,'bm194-layer');
    const heading=String(layer.titulo||'').trim();
    section.append(el('h4',/^0?\d{1,2}\s*[-—–.:]/.test(heading)?heading:String(layer.ord).padStart(2,'0')+' · '+heading));
    appendText(section,layer.texto);
    fragment.append(section);
   }
   target.replaceChildren(fragment);
   box.dataset.loaded='true';
   const summary=box.querySelector('summary');
   if(summary)summary.textContent='Resposta evolutiva integral · 11 seções';
  }).catch(error=>{
   if(!box.isConnected||currentId()!==id)return;
   const msg=error?.name==='AbortError'
    ?'O carregamento excedeu 30 segundos. Confira a conexão e tente novamente.'
    :'Não foi possível carregar as 11 seções: '+String(error?.message||error);
   const retry=el('button','Tentar carregar os textos novamente','bm194-retry');
   retry.type='button';
   retry.addEventListener('click',()=>{cache.delete(idx);render(id,box)});
   target.replaceChildren(el('p',msg,'bm194-error'),retry);
  });
 }
 function sync(){
  if(!modal || !answer || modal.hidden || answer.hidden)return;
  // O leitor V197 já renderiza o corpo principal. Não criar uma cópia paralela.
  if(answer.querySelector('.bm197-evolutive'))return;
  const id=currentId();
  if(window.BM349?.has(id))return;
  if(!/^CARD-\d{4}$/.test(id))return;
  const existing=answer.querySelector('details.bm194-public-layers');
  if(existing?.dataset.cardId===id)return;
  if(existing)existing.remove();
  if(RESERVED.has(id)){
   const prior=answer.querySelector('.bm194-deferred');
   if(prior?.dataset.cardId===id)return;
   if(prior)prior.remove();
   const p=el('p','Este cartão permanece reservado para homologação. A resposta original está preservada.','bm194-deferred');
   p.dataset.cardId=id;answer.append(p);return;
  }
  if(answer.querySelector('.bm194-deferred'))answer.querySelector('.bm194-deferred').remove();
  const box=el('details',undefined,'bm194-public-layers');box.dataset.cardId=id;box.open=true;
  box.append(el('summary','Resposta evolutiva integral · 11 seções'));
  box.append(el('div','Carregando textos detalhados…','bm194-detail'));
  const essential=answer.querySelector(':scope > .bm163-essential, :scope > .bm165-essential');
  if(essential?.parentElement===answer)essential.after(box);else answer.prepend(box);
  render(id,box);
 }
 function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;sync()})}
 function init(){
  modal=document.getElementById('bmCardPeekV050');
  answer=modal?.querySelector('.bm-v050-peek-answer');
  if(!modal||!answer){
   const wait=new MutationObserver(()=>{modal=document.getElementById('bmCardPeekV050');answer=modal?.querySelector('.bm-v050-peek-answer');if(modal&&answer){wait.disconnect();init()}});
   wait.observe(document.body,{childList:true,subtree:true});return;
  }
  observer=new MutationObserver(schedule);
  observer.observe(answer,{childList:true,attributes:true,attributeFilter:['hidden']});
  observer.observe(modal,{attributes:true,attributeFilter:['hidden']});
  // Os arquivos são carregados somente quando a resposta é solicitada.
  schedule();
 }
 window.BM194VersosPublicos=Object.freeze({
  source:'Arquivos públicos V194, sem autorização Google',
  get reservado(){return [...RESERVED]},
  get ativo(){return !!observer},
  // Chamada direta do botão Revelar resposta; o observer é apenas alternativa.
  attachToModal:id=>{
   if(!modal||!answer){init();return false}
   if(modal.hidden||answer.hidden||currentId()!==id)return false;
   sync();
   return !!answer.querySelector('details.bm194-public-layers, .bm194-deferred');
  },
  load:async id=>{if(/^TRT0[12]-C\d{3}$/.test(id))return window.BM236TrtCardsGrid.loadRecord(id);const i=shardFor(id);return eligible(id)&&i>=0?(await shard(i)).get(id)||null:null;},
  abrirProximoCartao:()=>schedule()
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

;
/* 77 assets/v276_evolutive_cards.js */
/* V195: resposta evolutiva na grade, sem alterar a base, IDs ou SRS. */
(function(){
'use strict';
if(window.BM195EvolutiveInline)return;
const root=document.getElementById('cardRows');if(!root)return;
const hold=new Set(['CARD-0138','CARD-0194','CARD-0248','CARD-0286','CARD-0350','CARD-0424','CARD-0445','CARD-0502','CARD-0509','CARD-0510','CARD-0693']);
const cache=new Map(),ns='http://www.w3.org/2000/svg';
const shapes={
 book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
 target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
 sigma:'M18 6H6l7 6-7 6h12',
 light:'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7c.8.6 1 1.3 1 2.3h6c0-1 .2-1.7 1-2.3A7 7 0 0 0 12 2',
 alert:'M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
 link:'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
 check:'M20 6 9 17l-5-5',
 file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8'
};
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x}
function ico(name){const svg=document.createElementNS(ns,'svg'),p=document.createElementNS(ns,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('bm195-icon');p.setAttribute('d',shapes[name]||shapes.file);svg.append(p);return svg}
function kind(n){return n<=2?'target':n===5?'sigma':n===8?'alert':n===9?'light':n===10?'link':n===7?'check':n===3?'book':'file'}
function inline(host,value){const s=String(value||''),rg=/\*\*[^*\n]+\*\*/g;let off=0,m;while((m=rg.exec(s))){if(m.index>off)host.append(document.createTextNode(s.slice(off,m.index)));host.append(el('strong','',m[0].slice(2,-2)));off=m.index+m[0].length}if(off<s.length)host.append(document.createTextNode(s.slice(off)))}
function tableAt(lines,i){return i+1<lines.length&&lines[i].trim().startsWith('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])}
function content(host,value){
 const lines=String(value||'').split(/\r?\n/);let i=0;
 while(i<lines.length){
  if(!lines[i].trim()){i++;continue}
  if(tableAt(lines,i)){
   const tbl=el('table','bm195-table'),thead=el('thead'),tbody=el('tbody'),r=el('tr');
   const headers=lines[i].trim().replace(/^\||\|$/g,'').split('|');
   headers.forEach(h=>{const c=el('th');inline(c,h.trim());r.append(c)});thead.append(r);i+=2;
   while(i<lines.length&&lines[i].trim().startsWith('|')){
    const tr=el('tr'),cells=lines[i].trim().replace(/^\||\|$/g,'').split('|');
    headers.forEach((_,n)=>{const c=el('td');inline(c,(cells[n]||'').trim());tr.append(c)});tbody.append(tr);i++;
   }
   tbl.append(thead,tbody);const scroll=el('div','bm195-table-scroll');scroll.append(tbl);host.append(scroll);continue;
  }
  if(/^\s*[-*•]\s+/.test(lines[i])){
   const list=el('ul','bm195-list');
   while(i<lines.length&&/^\s*[-*•]\s+/.test(lines[i])){const li=el('li');inline(li,lines[i++].replace(/^\s*[-*•]\s+/,''));list.append(li)}
   host.append(list);continue;
  }
  const parts=[];
  while(i<lines.length&&lines[i].trim()&&!tableAt(lines,i)&&!/^\s*[-*•]\s+/.test(lines[i]))parts.push(lines[i++]);
  if(parts.length){const p=el('p','bm195-paragraph');inline(p,parts.join('\n'));host.append(p)}
 }
}
function shard(id){if(!/^CARD-\d{4}$/.test(id))return -1;const n=Number(id.slice(5));return n>=1&&n<=1519?Math.floor((n-1)/250):-1}
async function record(id){
 if(window.BM276LayerData?.has?.(id))return await window.BM276LayerData.get(id);
 if(typeof window.BM194VersosPublicos?.load==='function')return window.BM194VersosPublicos.load(id);
 const i=shard(id);if(i<0)return null;
 if(!cache.has(i)){
  const url='assets/layers_public_v194_'+String(i).padStart(3,'0')+'.json?v=194';
  const p=fetch(url,{cache:'default'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(rows=>{
   if(!Array.isArray(rows))throw Error('Arquivo sem lista de cartões');return new Map(rows.map(x=>[x.id,x]))
  });cache.set(i,p);p.catch(()=>{if(cache.get(i)===p)cache.delete(i)});
 }
 return (await cache.get(i)).get(id)||null;
}
function render(host,item){
 if(!Array.isArray(item?.layers)||item.layers.length!==11||item.layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))throw Error('11 seções incompletas');
 const frag=document.createDocumentFragment();
 for(const x of item.layers){
  const section=el('section','bm195-layer'),h=el('div','bm195-layer-head'),iconBox=el('span','bm195-layer-ico'),title=el('h4','bm195-layer-title');
  const label=String(x.titulo).trim();title.textContent=/^0?\d{1,2}\s*[-—–.:]/.test(label)?label:String(x.ord).padStart(2,'0')+' · '+label;
  iconBox.append(ico(kind(x.ord)));h.append(iconBox,title);const b=el('div','bm195-layer-body');content(b,x.texto);
  section.append(h,b);frag.append(section);
 }
 host.replaceChildren(frag);
}
function mount(details){
 if(!details?.open)return;const article=details.parentElement;
 if(!article?.matches('article.card'))return;const answer=details.querySelector(':scope > .answer');
 if(!answer||answer.querySelector(':scope > .bm195-evo'))return;
 const id=article.querySelector(':scope > .tag')?.textContent?.trim()||'';
 const original=answer.querySelector(':scope > .richSection');
 const panel=el('section','bm195-evo');panel.dataset.cardId=id;const bar=el('header','bm195-heading');
 const iconBox=el('span','bm195-heading-icon');iconBox.append(ico('book'));
 const heading=el('div','bm195-heading-text');heading.append(el('h3','','Resposta evolutiva integral'),el('p','','11 seções · verso original preservado acima'));
 bar.append(iconBox,heading);panel.append(bar);
 const body=el('div','bm195-body');panel.append(body);
 if(original)original.after(panel);else answer.prepend(panel);
 const extras=Array.from(answer.children).filter(n=>n!==original&&n!==panel);
 if(extras.length){
  const archive=el('details','bm195-archive'),summary=el('summary','bm195-archive-title');
  summary.append(ico('file'),document.createTextNode(' Conteúdo original complementar e histórico'));
  archive.append(summary,...extras);answer.append(archive);
 }
 async function load(){
  body.replaceChildren(el('p','bm195-status','Carregando os textos completos…'));
  if(hold.has(id)){body.replaceChildren(el('p','bm195-pending','Cartão reservado para homologação; o verso original foi preservado acima.'));return}
  if(shard(id)<0&&!window.BM276LayerData?.has?.(id)){body.replaceChildren(el('p','bm195-pending','Este registro operacional não possui 11 seções publicadas. Consulte o conteúdo original abaixo.'));return}
  try{
   const item=await record(id);
   if(!panel.isConnected)return;
   if(!item){body.replaceChildren(el('p','bm195-pending','A resposta evolutiva deste ID ainda não foi publicada; o verso original está preservado.'));return}
   const enriched=window.BM199Reauditoria?.enrich?await window.BM199Reauditoria.enrich(id,item):item;
   if(!panel.isConnected)return;
   if(window.BM198Format?.render)window.BM198Format.render(body,enriched,id);
   else render(body,enriched);
   if(enriched?.v199_warning)body.prepend(el('p','bm195-pending',enriched.v199_warning));
  }catch(e){
   if(!panel.isConnected)return;
   const retry=el('button','bm195-retry','Tentar novamente');retry.type='button';retry.addEventListener('click',load);
   body.replaceChildren(el('p','bm195-error','Erro ao carregar as 11 seções: '+String(e?.message||e)),retry);
  }
 }
 load();
}
root.addEventListener('toggle',e=>{
 const d=e.target;if(d?.tagName==='DETAILS'&&d.open&&d.parentElement?.matches?.('article.card'))mount(d);
},true);
root.addEventListener('click',e=>{
 const d=e.target.closest?.('summary')?.parentElement;
 if(d?.tagName==='DETAILS'&&d.parentElement?.matches?.('article.card'))queueMicrotask(()=>{if(d.open)mount(d)});
},true);
root.querySelectorAll('article.card > details[open]').forEach(mount);
window.BM195EvolutiveInline=Object.freeze({installed:true,mount,refresh(){root.querySelectorAll('article.card > details[open]').forEach(mount)}});
})();

;
/* 78 assets/v163_lei_seca_literal.js */
/* Banco Mestre V163 — lei seca literal por botão independente em cada cartão.
 * Fonte: JSON de dispositivos transcritos com referência, não os resumos da base.
 * Todos os versos originais/IDs/avaliações/SRS/Drive permanecem intactos.
 * O módulo V160 foi substituído, não acumulado, para impedir ocultação falsa. */
(function(){
'use strict';
if(window.BM163LeiSeca)return;
const root=document.getElementById('cardRows');
if(!root)return;
const sourceFiles=['lei_seca_literais_v161.json','lei_seca_ijui_v161.json','lei_seca_complementos_v162.json'];
const knownCanonical=new Set(['CARD-1495','CARD-1496','CARD-1497']);
const law15190='https://www2.camara.leg.br/legin/fed/lei/2025/lei-15190-8-agosto-2025-797833-normaatualizada-pl.html';
const legal=/legisla[cç][aã]o|direito|jur[ií]dic|constitucional/i;
const states=new Map(),verified=new Map();
let sourcesReady=false,sourceFailures=[];
const headStyle=document.createElement('style');headStyle.id='bm163-law-style';
headStyle.textContent=[
 '#cartoes .bm161-law-button{border:1px solid #b1c8c5;background:#f7fbfa;color:#1c5558;font-weight:700;padding:9px 12px;min-height:41px}',
 '#cartoes .bm161-law-button[aria-expanded="true"]{background:#e3f1ed;border-color:#6aaba1}',
 '#cartoes .bm161-law-panel{border:1px solid #c4d9d4;border-radius:10px;padding:14px;background:#fcfefd;margin:10px 0 14px;min-width:0}',
 '#cartoes .bm161-law-panel[hidden]{display:none!important}',
 '#cartoes #cardRows article.card.bm307-card > .bm161-law-panel{order:11!important;width:100%;max-width:100%;min-width:0;margin:0!important;overflow-wrap:anywhere;word-break:normal}',
 '#cartoes .bm161-law-panel p,#cartoes .bm161-law-panel a{overflow-wrap:anywhere;max-width:100%}',
 '#cartoes .bm161-law-heading{font-size:13px;font-weight:800;color:#1c4f53;margin:0 0 5px}',
 '#cartoes .bm161-law-meta{font-size:12px;color:#556e71;margin:0 0 10px}',
 '#cartoes .bm161-law-content{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;line-height:1.65;margin:0 0 9px;color:#18363b}',
 '#cartoes .bm161-law-footnote{font-size:12px;color:#5a7176;line-height:1.5;margin:8px 0 0}',
 '#cartoes .bm161-law-link{font-size:12px;color:#195a60;text-decoration:underline;display:inline-block;margin-top:7px}',
 '#cartoes .bm161-law-pending{font-size:13px;color:#685423;line-height:1.55}',
 '#cartoes .bm161-law-button:focus-visible{outline:3px solid #4b9eaa;outline-offset:2px}',
 '@media(max-width:600px){#cartoes .bm161-law-button{width:100%}#cartoes .bm161-law-panel{padding:11px}}'
].join('\n');document.head.append(headStyle);
const node=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x};
const getCards=()=>typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
const isLegal=c=>!!c&&(c.provisional===true||String(c.group||'').toUpperCase()==='LEGISLACAO'||legal.test(String(c.discipline||'')));
const validId=card=>String(card?.id||'');
function record(c){
 const id=validId(c);
 const entry=verified.get(id);
 if(entry&&entry.text&&/^https:\/\//.test(entry.source_url||''))return entry;
 if(knownCanonical.has(id)&&/LEI SECA/i.test(String(c.expl||''))&&typeof c.back==='string'&&c.back.trim()){
  return {id,law:'Lei 15.190/2025',article:c.front?.split(':')[0]||'dispositivo indicado',text:c.back,
   scope:'transcrição literal identificada no verso canônico',source_url:law15190,verification:'redação legal original registrada na base V024 H14'};
 }
 // Importações futuras devem declarar explicitamente verificação E fonte.
 const field=['texto_lei_seca','lei_seca_texto','lei_seca','legal_text','law_text'].find(k=>typeof c[k]==='string'&&c[k].trim());
 if(field&&c.lei_seca_verificada===true&&/^https:\/\//.test(String(c.lei_seca_fonte_url||''))){
  return {id,law:String(c.lei_seca_norma||'Dispositivo indicado'),article:String(c.lei_seca_dispositivo||'conferir referência'),
   text:c[field],scope:'transcrição verificada declarada na própria fonte',source_url:c.lei_seca_fonte_url};
 }
 return null;
}
function build(article,c){
 const id=validId(c);
 const controls=article.querySelector(':scope > .buttons');
 if(!controls)return;
 const button=node('button',undefined,'bm161-law-button');
 button.type='button';button.dataset.bm161LawFor=id;button.setAttribute('aria-expanded','false');
 button.title='Revelar ou ocultar exclusivamente o texto literal de legislação; a resposta original continua separada';
 const panel=node('div',undefined,'bm161-law-panel');
 panel.id='bm161-law-'+id.replace(/[^a-zA-Z0-9_-]/g,'-');
 panel.hidden=true;
 panel.setAttribute('role','region');panel.setAttribute('aria-label','Texto da lei seca de '+id);
 button.setAttribute('aria-controls',panel.id);
 controls.prepend(button);
 // O painel acompanha os controles; não ocupa a posição anterior ao enunciado.
 controls.after(panel);
 function paint(){
  const open=!!states.get(id);
  const rec=record(c);
  button.setAttribute('aria-expanded',String(open));
  button.textContent=rec?(open?'📜 Ocultar lei seca':'📜 Mostrar lei seca'):(open?'📜 Ocultar pendência':'📜 Lei seca a conferir');
  panel.hidden=!open;
  if(!open)return;
  panel.replaceChildren();
  if(rec){
   panel.append(
    node('p','LEI SECA — transcrição literal','bm161-law-heading'),
    node('p',rec.law+' · '+rec.article,'bm161-law-meta'),
    node('p',rec.text,'bm161-law-content'),
    node('p','Abrangência: '+(rec.scope||'trecho indicado')+'. '+(rec.notice||'')+(rec.verification?' · '+rec.verification:''),'bm161-law-footnote')
   );
   const link=node('a','Conferir dispositivo na fonte','bm161-law-link');
   link.href=rec.source_url;link.target='_blank';link.rel='noopener noreferrer';
   panel.append(link);
  }else{
   panel.append(node('p','Transcrição literal ainda não validada para este cartão.','bm161-law-heading'));
   const message=sourceFailures.length?'Algumas fontes não carregaram. Atualize a página para tentar novamente. ':'';
   panel.append(node('p',message+'A resposta original permanece disponível na seção de explicações, mas não será exibida como se fosse texto legal literal.','bm161-law-pending'));
   if(c.reference)panel.append(node('p','Referência cadastrada (a conferir): '+c.reference,'bm161-law-footnote'));
  }
 }
 button.addEventListener('click',()=>{
  states.set(id,!states.get(id));paint();
 });
 article.dataset.bm161Law='ready';
 paint();
}
function decorate(){
 if(!sourcesReady)return;
 const found=new Map(getCards().filter(isLegal).map(c=>[validId(c),c]));
 for(const article of root.querySelectorAll('article.card')){
  const id=article.querySelector(':scope > .tag')?.textContent?.trim()||'';
  const card=found.get(id);
  if(!card)continue;
  if(article.dataset.bm161Law==='ready')continue;
  build(article,card);
 }
}
let scheduled=false;
const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate();})};
const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});
async function load(){
 const results=await Promise.allSettled(sourceFiles.map(async file=>{
  const response=await fetch('assets/'+file+'?v=161',{cache:'no-store'});
  if(!response.ok)throw Error(file+' '+response.status);
  const data=await response.json();
  if(!Array.isArray(data.items)||data.version!=='V161'||!data.format?.startsWith('BancoMestreLeiSeca'))throw Error('Formato inválido: '+file);
  if(new Set(data.items.map(x=>x.id)).size!==data.items.length)throw Error('IDs duplicados: '+file);
  return data.items;
 }));
 for(let i=0;i<results.length;i++){
  const r=results[i];
  if(r.status==='rejected'){sourceFailures.push(sourceFiles[i]);console.warn('Lei seca V162: fonte indisponível',sourceFiles[i],r.reason);continue}
  for(const x of r.value){
   if(!x?.id||!x?.text||!/^https:\/\//.test(x.source_url||'')){
    console.warn('Lei seca V162: entrada inválida',x?.id);continue;
   }
   if(verified.has(x.id)){console.warn('Lei seca V162: ID duplicado entre arquivos',x.id);continue}
   verified.set(x.id,x);
  }
 }
 sourcesReady=true;schedule();
}
const loadPromise=load();
window.BM163LeiSeca=Object.freeze({
 version:'V163',refresh:schedule,
 get verifiedEntries(){return verified.size},
 get sourceFailures(){return sourceFailures.slice()},
 get legalCount(){return getCards().filter(isLegal).length},
 get literalCount(){return getCards().filter(isLegal).filter(c=>!!record(c)).length},
 getRecord(id){const c=getCards().find(x=>x.id===id);return c&&isLegal(c)?record(c):null},
 get ready(){return sourcesReady},
 get whenReady(){return loadPromise},
 get failures(){return sourceFailures.slice()}
});
})();

;
/* 79 assets/v163_card_polish.js */
/* Banco Mestre V163 — metadados de estudo e ícones discretos nos cartões.
   Apenas apresentação, sem tocar em IDs, textos, registros e SRS. */
(function(){
'use strict';
if(window.BM163CardPolish)return;
const root=document.getElementById('cardRows');if(!root)return;
const titleIcons={
 'LEGISLACAO':'⚖','PORTUGUES':'✎','MATEMATICA':'∑','INFORMATICA':'⌘'
};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const idOf=a=>a.querySelector(':scope > .tag')?.textContent?.trim()||'';
const lookup=()=>new Map((typeof cards!=='undefined'&&Array.isArray(cards)?cards:[]).map(c=>[c.id,c]));
function badge(text,type){const n=el('span','bm163-card-badge '+(type||''),text);return n}
function decorate(){
 const byId=lookup();
 for(const article of root.querySelectorAll('article.card')){
  if(article.dataset.bm163Polish==='ready')continue;
  const c=byId.get(idOf(article));if(!c)continue;
  const heading=article.querySelector(':scope > h3');
  if(!heading)continue;
  const ribbon=el('div','bm163-card-ribbon');
  const code=c.provisional?'LEGISLACAO':String(c.group||'');
  const area=c.provisional?'Legislação de Ijuí':(c.discipline||'Outros');
  const symbol=code.startsWith('ENG_')?'▤':titleIcons[code]||'▦';
  ribbon.append(badge(symbol+'  '+area,'bm163-area'),badge(c.provisional?'Cópia operacional':'Base original',c.provisional?'bm163-provisional':'bm163-canonical'));
  heading.before(ribbon);
  const line=el('div','bm163-card-info');
  if(c.subject)line.append(badge(c.subject,'bm163-topic'));
  if(c.sub)line.append(badge(c.sub,'bm163-sub'));
  const guide=c.origin_question_id&&typeof guideData!=='undefined'?guideData?.questoes?.[c.origin_question_id]:null;
  if(guide)line.append(badge('Guia aprofundado','bm163-guide'));
  const path=article.querySelector(':scope > .v036-card-path');
  if(path)path.after(line);else heading.after(line);
  if(c.reference){
   const ref=el('p','bm163-card-ref');
   const icon=el('span','bm163-ref-icon','§');icon.setAttribute('aria-hidden','true');
   const tag=el('span','', 'Referência cadastrada: '+c.reference);
   ref.append(icon,tag);line.after(ref);
  }
  const peek=article.querySelector(':scope > .bm-v050-peek-button');
  if(peek)peek.title='Abrir leitura aprofundada com rolagem nesta página';
  article.dataset.bm163Polish='ready';
 }
}
let queued=false;const run=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})};
new MutationObserver(run).observe(root,{childList:true,subtree:true});run();
window.BM163CardPolish=Object.freeze({refresh:run});
})();

;
/* 80 assets/v168_mobile_related.js */
/* Banco Mestre V168 — gaveta móvel de Outros cartões para o leitor V165.
 * Camada de apresentação: não lê nem grava SRS/localStorage/IndexedDB. */
(function(){
 'use strict';
 function init(){
  const overlay=document.getElementById('bmCardPeekV050');
  const panel=overlay?.querySelector('.bm165-panel');
  const layout=panel?.querySelector('.bm165-layout');
  const aside=panel?.querySelector('.bm165-related');
  const list=aside?.querySelector('.bm165-related-list');
  const toggle=panel?.querySelector('.bm165-toggle-sidebar');
  const title=aside?.querySelector('.bm165-related-title');
  const count=aside?.querySelector('.bm165-related-count');
  if(!overlay||!panel||!layout||!aside||!list||!toggle||!title||!count)return;
  if(panel.dataset.bm168Ready==='true')return;
  panel.dataset.bm168Ready='true';
  const mobile=window.matchMedia('(max-width:760px)');
  const drawerId='bm168-mobile-related';
  aside.id=aside.id||drawerId;
  toggle.setAttribute('aria-controls',aside.id);
  const head=document.createElement('div');head.className='bm168-drawer-head';
  const titleWrap=document.createElement('div');titleWrap.className='bm168-drawer-heading';
  titleWrap.append(title,count);
  const closeButton=document.createElement('button');closeButton.type='button';
  closeButton.className='bm168-drawer-close';closeButton.textContent='Fechar';
  closeButton.setAttribute('aria-label','Fechar lista de outros cartões');
  head.append(titleWrap,closeButton);aside.prepend(head);
  const scrim=document.createElement('button');scrim.type='button';
  scrim.className='bm168-drawer-scrim';scrim.hidden=true;
  scrim.setAttribute('aria-label','Fechar lista de outros cartões');
  layout.insertBefore(scrim,aside);
  function sync(){
   const hidden=panel.classList.contains('bm165-sidebar-hidden');
   const open=mobile.matches&&!hidden&&!overlay.hidden;
   panel.classList.toggle('bm168-drawer-open',open);
   scrim.hidden=!open;
   closeButton.hidden=!mobile.matches;
   toggle.setAttribute('aria-expanded',String(!hidden));
   toggle.title=hidden?'Mostrar outros cartões':'Ocultar outros cartões';
  }
  function hideDrawer(restoreFocus){
   panel.classList.add('bm165-sidebar-hidden');
   sync();
   if(restoreFocus&&mobile.matches)toggle.focus({preventScroll:true});
  }
  if(mobile.matches)hideDrawer(false);else sync();
  toggle.addEventListener('click',sync);
  closeButton.addEventListener('click',()=>hideDrawer(true));
  scrim.addEventListener('click',()=>hideDrawer(true));
  list.addEventListener('click',event=>{
   if(!mobile.matches||!event.target.closest('button.bm165-related-item'))return;
   // O leitor V165 abre o cartão no botão antes de este evento chegar à lista.
   hideDrawer(false);
   panel.querySelector('.bm163-scroll')?.focus({preventScroll:true});
  });
  const nav=panel.querySelector('.bm165-header-nav');
  nav?.addEventListener('click',event=>{
   if(!mobile.matches)return;
   if(event.target.closest('.bm165-prev,.bm165-next'))hideDrawer(false);
  });
  new MutationObserver(()=>{
   if(overlay.hidden&&mobile.matches)hideDrawer(false);
   else sync();
  }).observe(overlay,{attributes:true,attributeFilter:['hidden']});
  const resized=()=>{
   panel.classList.toggle('bm165-sidebar-hidden',mobile.matches);
   sync();
  };
  if(mobile.addEventListener)mobile.addEventListener('change',resized);
  else mobile.addListener(resized);
  document.addEventListener('keydown',event=>{
   if(event.key!=='Escape'||!panel.classList.contains('bm168-drawer-open'))return;
   event.preventDefault();event.stopImmediatePropagation();hideDrawer(true);
  },true);
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();


;
/* 81 assets/v206_site_info.js */
/* Banco Mestre V206 — versão de portal, versão de cartões e catálogo de imagens separados.
 * Fonte pública: base de cartões V194; catálogo editorial de imagens V198; portal V202.
 * Nenhuma escrita em dados, SRS, grifos, PDFs, cartões ou no Drive. */
(function(){
'use strict';
if(window.BM206Header)return;
// Captura o título da própria página antes que o cronômetro o modifique.
const siteVersion=document.title.match(/\bVS\d+\b/)?.[0]||document.documentElement.dataset.bmPortalVersion||'—';
const defaults=Object.freeze({publicBase:BM_CATALOG.counts.canonical,publicActive:BM_CATALOG.counts.active,ijui:BM_CATALOG.counts.ijui,pdfBase:78,historicalImages:86,recoveredImages:93});
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
const $=id=>document.getElementById(id);
const state={base:defaults.publicBase,active:defaults.publicActive,ijui:defaults.ijui,origin:'publica',privateVersion:'',pdfs:defaults.pdfBase,images:179,imagesLoaded:false,cardsLoaded:false};
function stat(index,count,caption,help){
 const wrapper=document.querySelector('header .bm-v046-header-stats')||document.querySelector('header .stats')||document.querySelector('main > .stats');
 const el=wrapper?.querySelectorAll(':scope > .stat')?.[index];if(!el)return;
 const b=el.querySelector('b'),span=el.querySelector('span');
 if(b&&b.textContent!==fmt(count))b.textContent=fmt(count);
 if(span&&span.textContent!==caption)span.textContent=caption;
 el.title=help;el.setAttribute('aria-label',fmt(count)+' — '+caption+'. '+help);
}
function render(){
 const version=document.querySelector('header .brand > .version');
 const vc=BM_CATALOG.display_version;
 const versionText='Site '+siteVersion+' · Cartões '+vc;
 if(version&&version.textContent!==versionText)version.textContent=versionText;
 const tagline=document.querySelector('header .head > div:first-child > .version');
 if(tagline&&tagline.textContent!=='Estudo, recuperação ativa e revisão espaçada')tagline.textContent='Estudo, recuperação ativa e revisão espaçada';
 const footer=document.querySelector('main > footer');
 const footerText='Banco Mestre · Site '+siteVersion+' · Catálogo '+vc;
 if(footer&&footer.textContent!==footerText)footer.textContent=footerText;
 const total=defaults.publicBase+defaults.ijui;
 const phase=window.BMCatalogLoadState?.state||'idle';
 const confirmed=state.cardsLoaded&&phase==='ready';
 const detail=confirmed?'Carregado e conferido nesta sessão.':phase==='error'?'Falha ao carregar: '+(window.BMCatalogLoadState.message||'tente novamente'):'Contagem da publicação; carregamento ainda não confirmado.';
 stat(1,confirmed?state.active:defaults.publicActive,'Cartões ativos','Catálogo oficial '+vc+' · '+fmt(total)+' IDs únicos. '+detail);
 const info=$('bm382CatalogInfo');if(info)info.textContent='Catálogo oficial '+vc+': '+fmt(defaults.publicActive)+' cartões ativos de '+fmt(total)+' IDs. '+detail;
 // PDFs e Atlas: seus próprios módulos autenticados são as fontes de contagem.
 const privateBanner=$('bm119PublicSource');if(state.origin==='privada'&&privateBanner)privateBanner.textContent='Fonte privada carregada. A contagem acima refere-se ao catálogo oficial.';
}
function updateCards(base,ijui,items){
 if(!Number.isInteger(base)||!Number.isInteger(ijui)||base<=0||ijui<0||!Array.isArray(items)||items.length!==base+ijui)return false;
 const ids=items.map(c=>String(c?.id||''));
 if(ids.some(x=>!x)||new Set(ids).size!==ids.length)return false;
 const active=items.filter(c=>c.active!==false).length;
 if(items.length!==defaults.publicBase+defaults.ijui||active!==defaults.publicActive)return false;
 state.base=items.length;state.active=active;state.ijui=ijui;
 state.cardsLoaded=true;render();return true;
}
function updateImages(items){
 if(!Array.isArray(items)||![86,179].includes(items.length))return false;
 const ids=items.map(c=>String(c?.no||''));
 if(ids.some(id=>!id)||new Set(ids).size!==ids.length)return false;
 state.images=items.length;state.imagesLoaded=true;render();return true;
}
function init(){
 render();
 const pdf=$('pdfStat');
 if(pdf&&typeof MutationObserver!=='undefined')new MutationObserver(render).observe(pdf,{childList:true,characterData:true,subtree:true});
 try{if(typeof cards!=='undefined'&&Array.isArray(cards)&&cards.length){
  updateCards(cards.filter(x=>!x.provisional).length,cards.filter(x=>x.provisional).length,cards);
 }}catch(_){}
 try{if(typeof imgs!=='undefined'&&Array.isArray(imgs)&&imgs.length)updateImages(imgs)}catch(_){}
}
document.addEventListener('bm-v185-cards-synced',e=>{
 state.privateVersion=String(e?.detail?.version||'').slice(0,48);state.origin='privada';
 render(); // A fonte privada não substitui a contagem pública validada.
});
document.addEventListener('bm-catalog-load-state',render);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
const api=Object.freeze({updateCards,updateImages,render,get counts(){return {...state}}});
window.BM184Header=api;window.BM193Header=api;window.BM199Header=api;window.BM200Header=api;window.BM201Header=api;window.BM202Header=api;window.BM203Header=api;window.BM204Header=api;window.BM205Header=api;window.BM206Header=api;
})();

;
/* 82 assets/v202_checkpoints_paths.js */
/* Banco Mestre V202 — checkpoints com verificação do destino canônico e preservação dos históricos.
 * É um índice privado do Drive: não lê conversas ChatGPT, não aprova cartões,
 * não publica no GitHub, não altera ZIPs, SRS ou arquivos canônicos.
 * Leitura: drive.readonly existente; registro explícito: drive.file (somente criação).
 */
(function(){
'use strict';
if(window.BM186Checkpoints)return;
const ROOTS=[
 {id:'1348cILBcxFG9p2cfPJ3WubmHswPRbD24',name:'Checkpoints Banco Mestre'},
 {id:'1ziAHgnvKfroZ8meSAjdtJ_M0BNGYQi0S',name:'Backups / checkpoints históricos'}
];
const TARGET=ROOTS[0].id;
const STORAGE_CONTRACT='assets/v202_storage_contract.json?v=202';
async function assertStorageContract(){
 const r=await fetch(STORAGE_CONTRACT,{cache:'no-store'});
 if(!r.ok)throw Error('Contrato dos checkpoints indisponível; novo registro bloqueado');
 const c=await r.json();
 const images=c.canonical_write_destinations?.images?.folder_id;
 const checkpoints=c.canonical_write_destinations?.checkpoints?.folder_id;
 const roots=c.runtime_scan_roots?.checkpoints;
 if(c.schema!=='BancoMestreStorageContractV202'||images!=='1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6'||
 checkpoints!==TARGET||!Array.isArray(roots)||ROOTS.length!==roots.length||ROOTS.some((p,i)=>p.id!==roots[i]))
 throw Error('Destino do checkpoint divergente do contrato: upload interrompido para proteger os arquivos');
 return c;
}
const API='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const READ_SCOPE='https://www.googleapis.com/auth/drive.readonly';
const WRITE_SCOPE='https://www.googleapis.com/auth/drive.file';
const FOLDER='application/vnd.google-apps.folder';
const MANIFEST=/^BM_CHECKPOINT_MANIFEST_V1__(CP-[A-Z0-9_-]{6,100})\.json$/i;
const LEGACY=/(?:CHECKPOINT|BACKUP|CONSOLIDADO|SINCRONIZACAO_INCREMENTAL|TRANSFERENCIA|PACOTE|AUDITORIA).*\.(?:zip|json|md|txt|xlsx)$/i;
const ID=/^[A-Za-z0-9_-]{15,}$/;
const $=id=>document.getElementById(id);
let reader=null,writer=null,readToken='',writeToken='',readExpiry=0,writeExpiry=0;
let scanning=false,writing=false,pendingUpload=false,selected=null,entries=[],visible=30,knownIds=new Map(),lastScan=null,scanAt=0;
const el=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined&&txt!==null)e.textContent=txt;if(cls)e.className=cls;return e;};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function authRead(){return (readToken&&Date.now()<readExpiry?readToken:'')||window.BancoMestreMediaSyncV182?.token?.()||'';}
function authWrite(){return writeToken&&Date.now()<writeExpiry?writeToken:'';}
function report(message,isError=false){
 const node=$('bm186Status');if(node){node.textContent=message;node.style.color=isError?'#993b34':'#486669';}
}
function isIsoWithZone(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v));}
function valid(manifest){
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest)||manifest.schema!=='BancoMestreCheckpointManifestV1')
  throw Error('O manifesto deve utilizar o schema BancoMestreCheckpointManifestV1.');
 const id=manifest.checkpoint_id;
 if(typeof id!=='string'||!/^CP-[A-Z0-9_-]{6,100}$/.test(id))throw Error('checkpoint_id inválido; use CP-... com ID estável.');
 if(!isIsoWithZone(manifest.created_at))throw Error('created_at precisa incluir data, hora e fuso (ex.: -03:00).');
 if(!manifest.source||typeof manifest.source.chat_title!=='string'||manifest.source.chat_title.trim().length<3||manifest.source.chat_title.length>200)
  throw Error('Informe source.chat_title da conversa de origem.');
 if(!manifest.state||typeof manifest.state!=='object'||Array.isArray(manifest.state))
  throw Error('Declare state separando arquivo, classificação, base, site e SRS.');
 const state=manifest.state;
 for(const field of ['archive','classification','canonical','site','srs']){
  if(typeof state[field]!=='string'||state[field].length<2||state[field].length>90)
   throw Error('Informe state.'+field+' sem presumir sincronização concluída.');
 }
 if(!manifest.counts||typeof manifest.counts!=='object'||Array.isArray(manifest.counts))
  throw Error('Informe counts, mesmo quando as quantidades ainda não forem comprováveis.');
 for(const [k,v] of Object.entries(manifest.counts)){
  if(k.length>60||!(v===null||Number.isSafeInteger(v)&&v>=0))throw Error('Contagem inválida: '+k);
 }
 if(manifest.items!==undefined){
  if(!Array.isArray(manifest.items)||manifest.items.length>10000)throw Error('items deve conter até 10.000 objetos rastreáveis.');
  for(const x of manifest.items){
   if(!x||typeof x!=='object'||typeof x.id!=='string'||x.id.length>120||!x.id.trim()||
    !['card','question','image','pdf','srs','note','source','other'].includes(x.type))
     throw Error('Item sem ID e tipo reconhecidos. Não invente vínculos.');
  }
 }
 if(manifest.attachments!==undefined){
  if(!Array.isArray(manifest.attachments)||manifest.attachments.length>5000)throw Error('attachments deve ser uma lista limitada.');
  for(const x of manifest.attachments){
   if(!x||typeof x!=='object'||!ID.test(x.drive_file_id||'')||typeof x.name!=='string'||x.name.length>300)
    throw Error('Anexo exige nome original e ID verificável do Drive.');
   if(x.sha256!==undefined&&x.sha256!==null&&!/^[a-f0-9]{64}$/i.test(x.sha256))throw Error('SHA-256 inválido; não preencha sem confirmação.');
  }
 }
 const encoded=JSON.stringify(manifest);
 if(encoded.length>1024*1024)throw Error('Manifesto maior que 1 MB. Deixe arquivos originais separados no Drive.');
 return {id,manifest,serialized:encoded};
}
function makeUI(){
 const host=$('cartoes')?.querySelector('.panel');
 if(!host||$('bm186CheckpointPanel'))return false;
 const details=el('details');details.id='bm186CheckpointPanel';details.style.cssText='margin:12px 0;padding:12px;border:1px solid #d0dfdc;border-radius:10px;background:#fafdfc';
 const summary=el('summary','Checkpoints das conversas · consultar e registrar');summary.style.cssText='cursor:pointer;font-weight:700';
 const help=el('p','Novos checkpoints: salvar ZIP, índices e manifesto SEMPRE na pasta fixa Checkpoints Banco Mestre. O site lê também pastas históricas, mas nunca as usa como destinos alternativos. Localizar um ZIP não comprova integração no site ou alteração do SRS.');
 help.style.cssText='font-size:12px;color:#52696c;margin:9px 0';
 const actions=el('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:7px;align-items:center';
 const connect=el('button','Conectar Drive / consultar');connect.type='button';connect.id='bm186Connect';connect.onclick=()=>{if(authRead())void scan();else authorizeRead();};
 const reload=el('button','Atualizar registros');reload.type='button';reload.id='bm186Reload';reload.onclick=()=>{void scan();};
 const open=el('a','Abrir pasta dos checkpoints');open.href='https://drive.google.com/drive/folders/'+TARGET;open.target='_blank';open.rel='noopener noreferrer';open.style.cssText='font-size:12px';
 actions.append(connect,reload,open);
 const count=el('p','Conecte o Drive para conferir os checkpoints existentes.');count.id='bm186Counts';count.style.cssText='font-size:12px;font-weight:600';
 const search=el('input');search.type='search';search.id='bm186Search';search.placeholder='Localizar por conversa, arquivo ou ID';search.setAttribute('aria-label','Buscar checkpoints');search.style.cssText='max-width:100%;width:330px';search.oninput=()=>{visible=30;render()};
 const records=el('div');records.id='bm186Records';records.style.cssText='max-height:340px;overflow:auto;margin:10px 0';
 const more=el('button','Mostrar mais checkpoints');more.type='button';more.id='bm186More';more.hidden=true;more.onclick=()=>{visible+=30;render()};
 const edit=el('details');edit.style.cssText='border-top:1px solid #d0dfdc;padding-top:9px;margin-top:12px';
 const editSummary=el('summary','Registrar manifesto de checkpoint JSON no Drive');editSummary.style.cssText='font-size:12px';
 const note=el('p','Destino fixo dos novos ZIPs e manifestos: Checkpoints Banco Mestre, pelo mesmo ID de pasta. Este botão registra apenas manifesto JSON; o ZIP deve ser salvo pelo ChatGPT nessa pasta. O site confere o ID antes de gravar.');
 note.style.cssText='font-size:12px;color:#516e72';
 const file=el('input');file.id='bm186File';file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','Selecionar manifesto JSON');file.onchange=()=>{void choose(file.files?.[0])};
 const preview=el('p','Nenhum manifesto selecionado.');preview.id='bm186Preview';preview.style.cssText='font-size:12px';
 const save=el('button','Registrar no Drive e verificar');save.type='button';save.id='bm186Save';save.disabled=true;save.onclick=()=>{void submit()};
 const exportButton=el('button','Salvar cópia do manifesto');exportButton.type='button';exportButton.id='bm186Export';exportButton.disabled=true;exportButton.onclick=downloadCopy;
 const row=el('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:8px';row.append(save,exportButton);
 edit.append(editSummary,note,file,preview,row);
 const status=el('p');status.id='bm186Status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.cssText='font-size:12px;margin-top:8px';status.textContent='Nenhum arquivo foi gravado.';
 details.append(summary,help,actions,count,search,records,more,edit,status);
 host.insertBefore(details,host.querySelector('.controls')||host.firstChild);
 return true;
}
async function gis(){
 if(window.google?.accounts?.oauth2?.initTokenClient)return;
 await new Promise((resolve,reject)=>{
  const existing=document.querySelector('script[data-bm186-gis]');
  if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(Error('Serviço Google indisponível')),{once:true});return}
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.dataset.bm186Gis='1';script.addEventListener('load',resolve,{once:true});script.addEventListener('error',()=>reject(Error('Serviço Google indisponível')),{once:true});document.head.append(script);
 });
}
async function prepareOauth(){
 const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
 if(!response.ok)throw Error('Configuração OAuth do site indisponível.');
 const cfg=await response.json();
 if(!/\.apps\.googleusercontent\.com$/.test(cfg.client_id||''))throw Error('Configuração OAuth inválida.');
 await gis();
 reader=google.accounts.oauth2.initTokenClient({client_id:cfg.client_id,scope:READ_SCOPE,
  callback:r=>{if(r.error||!r.access_token){report('Leitura do Drive não autorizada.',true);return}
   readToken=r.access_token;readExpiry=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
   window.BancoMestreMediaSyncV182?.publishToken(readToken,Number(r.expires_in||3600));
   void scan();
  },error_callback:()=>report('A autorização de leitura foi cancelada.',true)});
 writer=google.accounts.oauth2.initTokenClient({client_id:cfg.client_id,scope:WRITE_SCOPE,
  callback:r=>{if(r.error||!r.access_token){pendingUpload=false;report('Permissão de registro não concedida; nada foi enviado.',true);return}
   writeToken=r.access_token;writeExpiry=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
   if(pendingUpload){pendingUpload=false;void upload();}
  },error_callback:()=>{pendingUpload=false;report('Autorização de escrita interrompida.',true)}});
 if(authRead())void scan();
}
function authorizeRead(){if(!reader){report('A autenticação Google ainda não está pronta.',true);return}reader.requestAccessToken({prompt:''})}
async function request(url,access){
 const token=access||authRead();if(!token)throw Error('Conecte o Drive.');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
 if(r.status===401)throw Error('A sessão Google expirou. Reconecte o Drive.');
 if(r.status===403)throw Error('Sem autorização de leitura nesta pasta.');
 if(!r.ok)throw Error('Consulta Google Drive: HTTP '+r.status);
 return r;
}
async function children(id){
 const all=[];let next='',pages=0;
 do{
  if(++pages>40)throw Error('Pasta com páginas demais; consulta interrompida.');
  const q=new URLSearchParams({q:"'"+id+"' in parents and trashed = false",fields:'nextPageToken,files(id,name,mimeType,modifiedTime,size,parents)',pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'});
  if(next)q.set('pageToken',next);
  const d=await (await request(API+'?'+q.toString())).json();
  all.push(...(Array.isArray(d.files)?d.files:[]));
  next=d.nextPageToken||'';
 }while(next);
 return all;
}
async function fetchManifest(file){
 const url=file.mimeType==='application/vnd.google-apps.document'?
  API+'/'+encodeURIComponent(file.id)+'/export?mimeType=text%2Fplain':
  API+'/'+encodeURIComponent(file.id)+'?alt=media';
 const response=await request(url);
 const text=await response.text();
 if(text.length>1050000)throw Error('Manifesto demasiado grande.');
 const m=valid(JSON.parse(text.replace(/^\uFEFF/,'')));
 if(MANIFEST.test(file.name)&&m.id!==file.name.match(MANIFEST)[1])throw Error('ID do arquivo diverge do manifesto.');
 return m.manifest;
}
async function scan(){
 if(scanning)return;
 if(!authRead()){report('Autorize a leitura do Drive para consultar checkpoints.',true);return}
 scanning=true;const reload=$('bm186Reload');if(reload)reload.disabled=true;
 try{
  report('Localizando checkpoints e manifestos nas pastas do Drive…');
  const queue=ROOTS.map(r=>({...r,path:r.name})),visited=new Set(),files=new Map();
  for(let pos=0;pos<queue.length;pos++){
   const folder=queue[pos];
   if(visited.has(folder.id))continue;
   visited.add(folder.id);
   if(visited.size>380)throw Error('Mais de 380 pastas; consulta interrompida, sem alterar registros.');
   const list=await children(folder.id);
   for(const f of list){
    if(!ID.test(f.id)||!f.name)continue;
    if(f.mimeType===FOLDER){
     if(!visited.has(f.id))queue.push({id:f.id,name:f.name,path:folder.path+' / '+f.name});
    }else if(MANIFEST.test(f.name)||LEGACY.test(f.name)){
     if(!files.has(f.id))files.set(f.id,{...f,path:folder.path});
    }
    if(files.size>2500)throw Error('Mais de 2.500 registros; consulta interrompida sem alterar índice.');
   }
  }
  const raw=[...files.values()],allManifests=raw.filter(f=>MANIFEST.test(f.name));
  if(allManifests.length>250)throw Error('Mais de 250 manifestos; consulta parcial bloqueada para não registrar checkpoints duplicados.');
  const manifests=allManifests;
  const parsed=new Map();
  for(let i=0;i<manifests.length;i+=4){
   await Promise.all(manifests.slice(i,i+4).map(async file=>{
    try{parsed.set(file.id,{manifest:await fetchManifest(file)})}
    catch(e){parsed.set(file.id,{error:e.message})}
   }));
  }
  const prior=entries;
  entries=raw.map(f=>({
   ...f,kind:MANIFEST.test(f.name)?'manifest':'archive',
   ...parsed.get(f.id)
  })).sort((a,b)=>String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||''))||a.name.localeCompare(b.name));
  knownIds=new Map();
  for(const e of entries)if(e.manifest){
   const id=e.manifest.checkpoint_id;
   if(!knownIds.has(id))knownIds.set(id,e);
  }
  lastScan={folders:visited.size,files:raw.length,manifests:manifests.length,verified:entries.filter(x=>x.manifest).length,bad:entries.filter(x=>x.error).length,at:new Date().toISOString()};
  scanAt=Date.now();render();
  report('Consulta concluída: '+lastScan.files+' arquivo(s) localizados em '+lastScan.folders+' pasta(s), '+lastScan.verified+' manifesto(s) lidos, '+lastScan.bad+' com problema. Arquivos históricos NÃO foram auditados apenas pela listagem.');
  if(selected)preview();
 }catch(e){
  report('Consulta incompleta: '+e.message+'. Registros anteriores preservados.',true);
 }finally{scanning=false;if(reload)reload.disabled=false}
}
function driveLink(f){return f.mimeType==='application/vnd.google-apps.document'?'https://docs.google.com/document/d/'+encodeURIComponent(f.id)+'/edit':'https://drive.google.com/file/d/'+encodeURIComponent(f.id)+'/view'}
function render(){
 const host=$('bm186Records');if(!host)return;host.replaceChildren();
 const search=normalize($('bm186Search')?.value);
 const shown=entries.filter(x=>normalize(x.name+' '+x.path+' '+(x.manifest?.checkpoint_id||'')+' '+(x.manifest?.source?.chat_title||'')).includes(search));
 const count=$('bm186Counts');
 if(count){
  const archives=entries.filter(x=>x.kind==='archive').length;
  count.textContent=entries.length+' registro(s) encontrados: '+knownIds.size+' checkpoint(s) com manifesto válido; '+archives+' arquivo(s) históricos sem manifesto lido. Registro em Drive ≠ integração no site.';
 }
 for(const file of shown.slice(0,visible)){
  const line=el('div');line.style.cssText='border-bottom:1px solid #e2e9e7;padding:7px 0;font-size:12px';
  const a=el('a',file.name);a.href=driveLink(file);a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='overflow-wrap:anywhere';
  const desc=el('div');desc.style.cssText='color:#657778;line-height:1.5';
  const m=file.manifest;
  if(m)desc.textContent='Manifesto lido do Drive · '+m.checkpoint_id+' · '+m.source.chat_title+' · Base: '+m.state.canonical+' · Site: '+m.state.site+' · SRS: '+m.state.srs+' (estados declarados no documento, não homologados pela listagem).';
  else if(file.error)desc.textContent='Manifesto inválido ou inacessível: '+file.error+' · NÃO integrado.';
  else desc.textContent='Arquivo encontrado · '+file.path+' · '+String(file.modifiedTime||'').slice(0,10)+' · conteúdo e vínculos ainda não validados.';
  line.append(a,desc);host.append(line);
 }
 if(!shown.length)host.append(el('p',entries.length?'Nenhum checkpoint corresponde à busca.':'Nenhum registro carregado nesta sessão.'));
 const more=$('bm186More');if(more)more.hidden=shown.length<=visible;
}
async function choose(file){
 selected=null;const save=$('bm186Save'),exp=$('bm186Export');if(save)save.disabled=true;if(exp)exp.disabled=true;
 if(!file){preview();return}
 try{
  if(file.size>1024*1024)throw Error('Manifesto maior que 1 MB.');
  selected=valid(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));
  if(exp)exp.disabled=false;
  if(save)save.disabled=!!knownIds.has(selected.id);
  preview();
 }catch(e){selected=null;preview();report('Arquivo rejeitado: '+e.message,true)}
}
function preview(){
 const output=$('bm186Preview');if(!output)return;
 if(!selected){output.textContent='Nenhum manifesto válido selecionado.';return}
 const found=knownIds.has(selected.id);
 output.textContent=selected.id+' · '+selected.manifest.source.chat_title+' · '+selected.manifest.created_at+
  (found?' · ID já registrado nesta pasta; não será duplicado.':' · pronto para registro, ainda NÃO salvo no Drive.');
 if($('bm186Save'))$('bm186Save').disabled=found;
}
function downloadCopy(){
 if(!selected)return;
 const blob=new Blob([selected.serialized+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='BM_CHECKPOINT_MANIFEST_V1__'+selected.id+'.json';a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function submit(){
 if(!selected)return Promise.resolve(null);
 if(knownIds.has(selected.id)){report('Esse checkpoint já está registrado; não haverá duplicação.',true);return Promise.resolve(null)}
 if(writing)return Promise.resolve(null);
 if(!authWrite()){
  if(!writer){report('O serviço de registro do Google ainda está inicializando.',true);return Promise.resolve(null)}
  pendingUpload=true;writer.requestAccessToken({prompt:'consent'});return Promise.resolve(null);
 }
 return upload();
}
async function upload(){
 if(!selected||writing)return;
 writing=true;const save=$('bm186Save');if(save)save.disabled=true;
 try{
  const source=selected;const name='BM_CHECKPOINT_MANIFEST_V1__'+source.id+'.json';
  await assertStorageContract();
  if(!authRead())throw Error('Autorize a leitura do Drive antes de registrar; não é seguro duplicar sem verificar os IDs.');
  if(!lastScan||Date.now()-scanAt>120000)await scan();
  if(!lastScan||Date.now()-scanAt>120000)throw Error('Não foi possível conferir os IDs existentes no Drive. Registro bloqueado.');
  if(knownIds.has(source.id))throw Error('Checkpoint já existente; registre uma nova versão com novo ID.');
  const access=authWrite();if(!access)throw Error('A autorização de escrita expirou.');
  const targetInfo=await (await request(API+'/'+encodeURIComponent(TARGET)+'?fields=id%2Cname%2CmimeType%2Ctrashed')).json();
  if(targetInfo.id!==TARGET||targetInfo.mimeType!==FOLDER||targetInfo.trashed===true)
   throw Error('Pasta oficial de checkpoints inacessível ou inválida; upload bloqueado');
  const boundary='bmcheckpoint_'+Date.now()+'_'+Math.floor(Math.random()*1000000);
  const metadata=JSON.stringify({name,mimeType:'application/json',parents:[TARGET]});
  const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+metadata+
   '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+source.serialized+
   '\r\n--'+boundary+'--';
  report('Criando um NOVO registro no Drive. Nenhuma base de cartões será alterada…');
  const response=await fetch(UPLOAD+'?uploadType=multipart&fields=id%2Cname%2CmimeType%2Cparents',{
   method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'multipart/related; boundary='+boundary},
   body,cache:'no-store'
  });
  if(response.status===403)throw Error('Drive negou criação na pasta. A permissão drive.file é restrita; use a cópia JSON com a conexão do ChatGPT, sem conceder acesso amplo ao site.');
  if(!response.ok)throw Error('Upload HTTP '+response.status+'. Nada foi marcado como integrado.');
  const created=await response.json();
  if(!ID.test(created.id)||created.name!==name||!Array.isArray(created.parents)||!created.parents.includes(TARGET))
   throw Error('Drive recebeu o upload, mas a pasta/identidade não pôde ser confirmada. Verifique o registro manualmente; NÃO envie de novo até conferir duplicatas.');
  const check=await fetch(API+'/'+encodeURIComponent(created.id)+'?alt=media',{headers:{Authorization:'Bearer '+access},cache:'no-store'});
  if(!check.ok)throw Error('Arquivo criado, porém sem leitura de volta ('+check.status+'). Não alegar registro verificado; confira antes de reenviar.');
  const persisted=valid(JSON.parse(await check.text()));
  if(persisted.id!==source.id||persisted.serialized!==source.serialized)
   throw Error('Arquivo criado, mas leitura de volta divergiu; não declarar verificado.');
  const rec={id:created.id,name,path:'Checkpoints Banco Mestre',mimeType:'application/json',modifiedTime:new Date().toISOString(),kind:'manifest',manifest:persisted.manifest};
  entries.unshift(rec);knownIds.set(source.id,rec);entries.sort((a,b)=>String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||'')));
  selected=null;if($('bm186File'))$('bm186File').value='';
  render();preview();
  report('REGISTRO VERIFICADO NO DRIVE: '+persisted.id+' · leitura de volta igual ao manifesto enviado. Conteúdo canônico, SRS e publicação no site permanecem independentes.');
 }catch(e){report('Registro não homologado: '+e.message+' O manifesto original continua disponível para exportação.',true)}
 finally{writing=false;if(save)save.disabled=!selected||knownIds.has(selected.id)}
}
async function init(){
 if(!makeUI())return;
 try{
  document.addEventListener('bm-media-drive-authorized',()=>{if(authRead()&&!scanning&&Date.now()-scanAt>10000)void scan()});
  await prepareOauth();
  // V326: checkpoints consultados na autorização inicial, por ação manual ou antes de um novo registro.
  if(!authRead())report('Conector preparado. Autorize a leitura para conferir checkpoints no Drive. O site não lê mensagens privadas do ChatGPT.');
 }catch(e){report('Registro de checkpoints indisponível: '+e.message,true)}
}
window.BM186Checkpoints=Object.freeze({
  version:'V202',canonicalFolderId:TARGET,storageContract:STORAGE_CONTRACT,
 validate:valid,refresh:scan,get lastResult(){return lastScan},get count(){return knownIds.size},
 get connected(){return !!authRead()},get writeConnected(){return !!authWrite()}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();

;
/* 83 assets/v281_card_sort.js */
/* V281 — ordenação explícita por ID e seleção de últimos cartões.
 * Leitura apenas. Não altera registros, IDs, versões, eventos SRS ou Drive. */
(function(){
'use strict';
if(window.BM281CardSort)return;
const toolbar=document.querySelector('#cartoes .controls');
if(!toolbar)return;
function field(id,title,choices,selected){
 const wrap=document.createElement('label');
 wrap.className='bm279-recent-label bm281-toolbar-field';
 wrap.htmlFor=id;
 const caption=document.createElement('span');caption.textContent=title;wrap.append(caption);
 const select=document.createElement('select');select.id=id;select.setAttribute('aria-label',title);
 for(const [value,label] of choices)select.add(new Option(label,value));
 select.value=selected;wrap.append(select);
 return {wrap,select};
}
const ordering=field('bm281IdOrder','Ordenar por ID',[
 ['desc','ID decrescente (novos primeiro)'],
 ['asc','ID crescente (antigos primeiro)'],
 ['original','Ordem original do catálogo']
],'desc');
const recent=field('bm281LastCards','Últimos cartões',[
 ['all','Mostrar todos'],
 ['last10','Últimos 10'],
 ['last25','Últimos 25'],
 ['last50','Últimos 50'],
 ['last100','Últimos 100'],
 ['v274v276','15 novos confirmados (V274/V276)'],
 ['v276','1 novo da V276'],
 ['v274','14 novos da V274']
],'all');
const search=document.getElementById('cardSearch');
if(search&&search.parentElement===toolbar)search.after(ordering.wrap,recent.wrap);
else toolbar.prepend(ordering.wrap,recent.wrap);
const hint=document.createElement('small');hint.id='bm281ChronologyHint';
hint.className='bm279-recent-note';
hint.textContent='Os IDs numéricos indicam a ordem de numeração, não comprovam a data real de criação de cada cartão. As inclusões V274 e V276 estão documentadas; cartões antigos apenas atualizados não entram como novos.';
toolbar.append(hint);
const num=id=>{const m=/^CARD-(\d+)$/.exec(String(id||''));return m?Number(m[1]):null};
const numberFor=c=>num(c?.id);
const isCanonical=c=>numberFor(c)!==null&&!c.provisional;
const release=c=>c?.id==='CARD-1534'?'v276':(numberFor(c)>=1520&&numberFor(c)<=1533?'v274':'legacy');
const limitFor=()=>({last10:10,last25:25,last50:50,last100:100})[recent.select.value]||0;
function byId(a,b){
 const an=numberFor(a),bn=numberFor(b);
 if(an!==null&&bn!==null)return ordering.select.value==='asc'?an-bn:bn-an;
 if(an!==null)return -1;
 if(bn!==null)return 1;
 return String(a.id||'').localeCompare(String(b.id||''),'pt-BR',{numeric:true});
}
function filterAndSort(input){
 const mode=recent.select.value;
 let rows=Array.isArray(input)?input.slice():[];
 if(mode!=='all'){
  rows=rows.filter(isCanonical);
  if(mode==='v276'||mode==='v274')rows=rows.filter(c=>release(c)===mode);
  if(mode==='v274v276')rows=rows.filter(c=>release(c)!=='legacy');
  // Seleção dos últimos N considera primeiramente os IDs mais altos
  // dentro do resultado dos filtros de busca/assunto, independentemente
  // da ordenação escolhida para exibição.
  const n=limitFor();
  if(n)rows.sort((a,b)=>numberFor(b)-numberFor(a)).splice(n);
 }
 if(ordering.select.value!=='original'||mode!=='all'){
  if(ordering.select.value==='original'){
   // Para últimas seleções, ainda é importante mostrar primeiro os mais novos.
   rows.sort((a,b)=>byNewest(a,b));
  }else rows.sort(byId);
 }
 return rows;
}
function byNewest(a,b){
 const an=numberFor(a),bn=numberFor(b);
 if(an!==null&&bn!==null)return bn-an;
 if(an!==null)return -1;
 if(bn!==null)return 1;
 return String(a.id||'').localeCompare(String(b.id||''),'pt-BR',{numeric:true});
}
function redraw(){
 if(typeof focusGroup!=='undefined')focusGroup='';
 if(typeof cardLimit!=='undefined')cardLimit=24;
 if(typeof cardRender==='function')cardRender();
}
ordering.select.addEventListener('change',redraw);
recent.select.addEventListener('change',redraw);
const api=Object.freeze({
 filterAndSort,
 get active(){return ordering.select.value!=='original'||recent.select.value!=='all'},
 get limited(){return recent.select.value!=='all'},
 get limit(){return limitFor()||15},
 get order(){return ordering.select.value},
 get recent(){return recent.select.value},
 get orderControl(){return ordering.select},
 get recentControl(){return recent.select}
});
window.BM281CardSort=api;
if(typeof cards!=='undefined'&&Array.isArray(cards)&&cards.length&&typeof cardRender==='function')cardRender();
})();


;
/* 84 assets/v281_all_cards_grid.js */
/* Banco Mestre V191 — "Todos" realmente mostra TODOS os cartões disponíveis na grade.
 * Causa: cardRender legado limita a 24 e V128 embrulha cada categoria em <details>.
 * Esta camada atua SÓ na apresentação; não altera IDs, back, frente, SRS, Drive nem registros.
 * Cartões inativos continuam sob checkbox próprio; ocultados só sob toggle explícito.
 */
(function(){
 'use strict';
 if(window.BM191AllCardsGrid)return;
 if(typeof cardRender!=='function')return;
 const $=id=>document.getElementById(id);
 const ALL='all';
 let wasAll=false, renderCount=0, busy=false;
 const selection=()=>window.BM152FlashFilters?.selection||null;
 function allSelected(){
   if(window.BM281CardSort?.active)return false;
   const s=selection();
   if(s && [s.disc,s.general,s.subject,s.sub].some(v=>v!==undefined&&v!==ALL))return false;
   for(const id of ['cardFilter','cardTopicFilter','bm128CardGeneral']){
     const el=$(id);if(el&&el.value!==ALL)return false;
   }
   try{if(typeof focusGroup!=='undefined'&&focusGroup)return false;}catch(_){ }
   return true;
 }
 function statusNode(){
   let n=$('bm191CardCount');if(n)return n;
   const anchor=$('cardCount');if(!anchor)return null;
   n=document.createElement('small');n.id='bm191CardCount';n.className='bm191-card-count';
   n.setAttribute('role','status');
   anchor.insertAdjacentElement('afterend',n);
   return n;
 }
 function flatten(){
   const root=$('cardRows');if(!root)return 0;
   const articles=[...root.querySelectorAll('article.card')];
   if(articles.length){
     // Mover os nós preserva todos os listeners, atributos e históricos anexos à ficha.
     root.replaceChildren(...articles);
   }
   root.classList.add('bm191-all-grid');
   return articles.length;
 }
 function detailStyle(all){
   const b=$('moreCards');
   if(b){b.hidden=!!all;b.setAttribute('aria-hidden',String(!!all));}
   if(!all)$('cardRows')?.classList.remove('bm191-all-grid');
 }
 const previousRender=cardRender;
 cardRender=function(){
   if(busy)return previousRender();
   busy=true;
   try{
     const all=allSelected();
     if(all && typeof cards!=='undefined' && Array.isArray(cards)){
       // Renderizar todas as fichas na grade, não somente os primeiros 24.
       if(typeof cardLimit!=='undefined')cardLimit=Math.max(cardLimit,cards.length);
     }else if(wasAll && typeof cardLimit!=='undefined'){
       cardLimit=24; // Retornar à paginação para filtros específicos.
     }
     previousRender();
     const count=all?flatten():$('cardRows')?.querySelectorAll('article.card').length||0;
     detailStyle(all);
     const note=statusNode();
     if(note){
       const catalog=typeof cards!=='undefined'&&Array.isArray(cards)?cards.length:0;
       note.hidden=true; // O resumo único usa a grade final, após complementos TRT.
     }
     wasAll=all;renderCount++;
   }finally{busy=false;}
 };
 // O botão legado de ocultar guarda o callback antigo; redirecionar ao novo wrapper.
 const hidden=$('cardHidden');if(hidden)hidden.onchange=()=>cardRender();
 window.BM191AllCardsGrid=Object.freeze({
   get allSelected(){return allSelected()},
   get visible(){return $('cardRows')?.querySelectorAll('article.card').length||0},
   get rendered(){return renderCount},
   redraw(){return cardRender()}
 });
 // A base poderá chegar mais tarde (OAuth do Drive). O sincronizador chama cardRender.
 if(typeof cards!=='undefined'&&Array.isArray(cards)&&cards.length)cardRender();
})();

;
/* 85 assets/v311_srs_engine.js */
/* Banco Mestre V311 — motor SRS público, dados SRS privados.
 * Intervalos: Errei 4, Difícil 8, Bom 16, Fácil 32; Consolidado 64 somente
 * depois de duas avaliações formais Fácil do mesmo cartão, comprovadas por eventos.
 * Não escreve no SRS canônico nem publica histórico pessoal no GitHub.
 */
(function(root){
 'use strict';
 if(root.BMSRSV311)return;
 const INTERVALS=Object.freeze({Errei:4,'Difícil':8,Bom:16,'Fácil':32,Consolidado:64});
 const PRIVATE_FALLBACK_ID='1UmHRLkQ27RNxL9wwC7Sy0oOAEGUSN8-w';
 const API='https://www.googleapis.com/drive/v3/files/';
 const clean=v=>String(v==null?'':v).trim();
 const rating=v=>{
  const x=clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return ({errei:'Errei',dificil:'Difícil',bom:'Bom',facil:'Fácil'})[x]||'';
 };
 const date=v=>{
  const s=clean(v);
  let iso=/^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(0,10):null;
  if(!iso){
   const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
   if(m)iso=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
  }
  if(!iso)return null;
  const d=new Date(iso+'T12:00:00Z');
  return !isNaN(d)&&d.toISOString().slice(0,10)===iso?iso:null;
 };
 const addDays=(v,n)=>{
  const iso=date(v);
  if(!iso||!Number.isInteger(n)||n<0)return null;
  const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);
  return d.toISOString().slice(0,10);
 };
 function formalEasyHistory(rec,lastRating){
  const arr=Array.isArray(rec.events)?rec.events:
    Array.isArray(rec.review_events)?rec.review_events:
    Array.isArray(rec.historico)?rec.historico:[];
  const distinct=new Set();
  for(const e of arr){
   const k=clean(e.kind||e.tipo||e.type||'revisao').toLowerCase();
   if(/recorr|refer|import|edicao|editorial/.test(k))continue;
   if(rating(e.rating||e.avaliacao||e.grade||e.classificacao)!=='Fácil')continue;
   const stamp=clean(e.timestamp||e.data_hora||e.date||e.data_local);
   const key=clean(e.event_id||e.id)||stamp;
   if(!key||!date(stamp))continue;
   distinct.add(key);
  }
  // Registros antigos agregados não comprovam duas tentativas Fácil.
  return Math.max(distinct.size,distinct.size?0:(lastRating==='Fácil'?1:0));
 }
 function fromSrs(rec){
  if(!rec||!/^CARD-\d{4,}$/.test(clean(rec.id)))return null;
  const id=clean(rec.id);
  // V163 tem os campos legados invertidos: last_date guarda a nota;
  // grade guarda a data. Suporta também futuras estruturas corrigidas.
  const lastRating=rating(rec.last_date)||rating(rec.rating)||rating(rec.grade)||rating(rec.avaliacao);
  const lastDate=date(rec.grade)||date(rec.last_date)||date(rec.last_review_at)||date(rec.review_date);
  const attempts=Math.max(0,Number(rec.attempts||rec.tentativas||0)||0);
  const originalDue=date(rec.next_review||rec.proxima_revisao);
  const references=Array.isArray(rec.reference_events)?rec.reference_events:
   Array.isArray(rec.references)?rec.references:[];
  const auto=byReferences(references,lastRating);
  // Um marco de referência documentado posterior à última revisão real
  // produz classificação automática separada, nunca duas avaliações Fácil formais.
  if(auto.count>=5&&(!lastDate||auto.at>lastDate)){
   return {id,due:auto.due,rating:auto.rating,intervalDays:auto.intervalDays,
    easyFormalCount:formalEasyHistory(rec,lastRating),consolidated:false,
    source:'Drive privado — recorrência SRS documentada',originalDue,
    lastReview:lastDate,attempts,referenceCount:auto.count,kind:auto.kind};
  }
  if(!lastRating||!lastDate||attempts===0){
   if(!originalDue)return null;
   return {id,due:originalDue,rating:'',intervalDays:null,easyFormalCount:0,
    consolidated:false,source:'Drive privado — agendamento sem avaliação',originalDue,kind:'agendamento'};
  }
  const easyFormalCount=formalEasyHistory(rec,lastRating);
  const consolidated=lastRating==='Fácil'&&easyFormalCount>=2;
  const intervalDays=consolidated?64:INTERVALS[lastRating];
  return {id,due:addDays(lastDate,intervalDays),rating:lastRating,
   intervalDays,easyFormalCount,consolidated,source:'Drive privado — regra V311',
   originalDue,lastReview:lastDate,attempts,kind:'revisao'};
 }
 function fromSnapshot(snapshot){
  if(!snapshot||!Array.isArray(snapshot.srs)||snapshot.srs.length<20||
      !Array.isArray(snapshot.cards)||snapshot.cards.length<1000)
   throw Error('Formato do Banco Mestre privado incompatível; fila anterior preservada');
  const available=new Set(snapshot.cards.map(x=>x.id));
  const items=new Map();
  for(const r of snapshot.srs){
   const v=fromSrs(r);
   if(v&&available.has(v.id))items.set(v.id,v);
  }
  return {records:[...items.values()],cards:available.size,
   srsRecords:snapshot.srs.length,version:clean(snapshot.version),
   updated:clean(snapshot.updated),source:'Snapshot privado do Google Drive'};
 }
 function byReferences(references,currentRating){
  const events=new Map();
  for(const e of Array.isArray(references)?references:[]){
   if(!e||!date(e.date||e.at||e.timestamp))continue;
   const key=clean(e.eventId||e.event_id||e.sourceId||e.source_id);
   if(!key||events.has(key))continue;
   if(e.valid===false||e.passive===true||e.kind==='auditoria'||e.kind==='importacao')continue;
   events.set(key,date(e.date||e.at||e.timestamp));
  }
  const total=events.size;
  const sorted=[...events.values()].sort();
  if(total>=10)return {count:total,rating:'Fácil',intervalDays:32,
   due:addDays(sorted[9],32),at:sorted[9],consolidated:false,kind:'classificacao_por_recorrencia'};
  if(total>=5)return {count:total,rating:'Bom',intervalDays:16,
   due:addDays(sorted[4],16),at:sorted[4],consolidated:false,kind:'classificacao_por_recorrencia'};
  return {count:total,rating:rating(currentRating),intervalDays:null,due:null,
   consolidated:false,kind:'sem_limiar'};
 }
 function token(){return root.BancoMestreMediaSyncV182?.token?.()||''}
 async function fetchDriveJson(id,auth){
  const response=await fetch(API+encodeURIComponent(id)+'?alt=media&supportsAllDrives=true',{
   headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(!response.ok)throw Error('Drive HTTP '+response.status+' — SRS privado indisponível');
  return response.json();
 }
 async function latestPrivate(){
  const auth=token();
  if(!auth)throw Error('Conecte o Google Drive no cabeçalho para carregar a fila privada');
  // A busca não persiste nem expõe o token. Se a listagem não estiver autorizada,
  // a fonte fixa V163 continua disponível como fallback explicitamente identificado.
  let candidates=[];
  try{
   const u=new URL('https://www.googleapis.com/drive/v3/files');
   u.searchParams.set('q', "trashed=false and name contains 'BANCO_MESTRE_PRIVADO_V'");
   u.searchParams.set('fields','nextPageToken,files(id,name,mimeType,modifiedTime)');
   u.searchParams.set('pageSize','100');
   u.searchParams.set('orderBy','modifiedTime desc');
   const resp=await fetch(u.href,{headers:{Authorization:'Bearer '+auth},cache:'no-store'});
   if(resp.ok){
    const d=await resp.json();
    candidates=(d.files||[]).filter(x=>/^BANCO_MESTRE_PRIVADO_V\d+.*\.json$/i.test(x.name||''))
      .sort((a,b)=>(b.name.match(/_V(\d+)/i)?.[1]||0)-(a.name.match(/_V(\d+)/i)?.[1]||0))
      .slice(0,5);
   }
  }catch(_){}
  if(!candidates.some(x=>x.id===PRIVATE_FALLBACK_ID))
   candidates.push({id:PRIVATE_FALLBACK_ID,name:'BANCO_MESTRE_PRIVADO_V163.json'});
  let lastError='';
  for(const item of candidates){
   try{
    const snapshot=await fetchDriveJson(item.id,auth);
    const out=fromSnapshot(snapshot);
    if(Number(out.version.replace(/\D/g,''))<163)continue;
    return {...out,driveFileId:item.id,fileName:item.name};
   }catch(e){lastError=String(e.message||e)}
  }
  throw Error('Nenhuma fonte privada íntegra disponível. '+lastError);
 }
 root.BMSRSV311=Object.freeze({intervals:INTERVALS,date,addDays,rating,fromSrs,
  fromSnapshot,byReferences,latestPrivate,privateFallbackId:PRIVATE_FALLBACK_ID});
})(window);


;
/* 86 assets/v313_srs_fila_completa.js */

/* V313 — Fila completa de cartões e vencimentos SRS com filtros, atraso e fonte explícita.
 * Calendário derivado e reversível. Histórico canônico intocado; fallback F17 identificado. */
(function(){
'use strict';
const nav=document.querySelector('header nav'),main=document.querySelector('main');
if(!nav||!main||document.getElementById('calendario'))return;
const root=document.createElement('section');root.id='calendario';
root.innerHTML=[
'<div class="c141-wrap">',
'<div class="c141-title"><div><span class="c141-kicker">BANCO MESTRE · ORGANIZAÇÃO SRS</span><h2>Planejamento de revisões SRS</h2><p>Planejamento estimado e fila real de vencimentos. Inicie o estudo para responder um cartão por vez, comparar a resposta e classificar no leitor.</p></div><div class="c141-limit">Até 60 min/dia estimados</div></div>',
'<div class="c141-stats"><div class="c141-stat"><strong id="c141-known">—</strong><span>Cartões com vencimento conhecido</span></div><div class="c141-stat"><strong id="c141-overdue">—</strong><span>Atrasados (antes de hoje)</span></div><div class="c141-stat"><strong id="c141-unplanned">—</strong><span>Ativos sem data SRS disponível</span></div><div class="c141-stat"><strong id="c141-today">—</strong><span>Vencem hoje</span></div></div>',
'<div id="c313-panel" style="margin:14px 0 20px;border:1px solid #cfdddf;border-radius:10px;padding:14px;background:#fff">',
'<h3 style="font-size:17px;margin:0 0 6px">Fila de cartões e prazos de revisão</h3>',
'<p id="c313-source" role="status" style="font-size:12px;line-height:1.6;color:#576b73;margin:4px 0 12px">Aguardando leitura dos registros SRS.</p>',
'<div style="display:flex;flex-wrap:wrap;gap:9px;align-items:end;margin-bottom:10px">',
'<label for="c313-filter">Situação <select id="c313-filter" style="display:block;margin-top:3px;padding:8px"><option value="overdue">Atrasados</option><option value="today">Vencem hoje</option><option value="upcoming">Próximos vencimentos</option><option value="undated">Sem data SRS</option><option value="all">Todos os cartões</option></select></label>',
'<label for="c313-search">Pesquisar cartão <input id="c313-search" type="search" placeholder="ID, assunto ou pergunta" style="display:block;width:min(340px,78vw);margin-top:3px;padding:8px"></label>',
'<button id="c313-export" type="button">Exportar lista CSV</button>',
'</div>',
'<p style="font-size:12px;margin:6px 0" id="c313-count">Carregando...</p>',
'<div class="c141-scroll" style="max-height:440px;overflow:auto"><table style="min-width:850px"><thead><tr><th>Cartão</th><th>Assunto / pergunta</th><th>Classificação</th><th>Vencimento</th><th>Situação</th><th>Origem</th><th>Abrir</th></tr></thead><tbody id="c313-body"><tr><td colspan="7">Aguardando dados...</td></tr></tbody></table></div>',
'<button id="c313-more" type="button" style="display:none;margin-top:9px">Mostrar mais 50 cartões</button>',
'<p style="font-size:12px;color:#576b73;margin:9px 0 0">O calendário não registra revisões: somente respostas avaliadas e eventos SRS documentados podem alterar vencimentos. Sem data não significa atrasado. Dados privados permanecem no navegador.</p>',
'</div>',
'<div class="c141-settings"><label for="c141-min">Tempo por cartão</label><select id="c141-min"><option value="1.5">1,5 min — até 40/dia</option><option value="2" selected>2 min — até 30/dia</option><option value="3">3 min — até 20/dia</option><option value="4">4 min — até 15/dia</option></select><label class="c141-check"><input id="c141-new" type="checkbox">Preencher tempo livre com cartões novos, sem data SRS</label><button class="c141-primary" id="c141-export">Exportar CSV</button></div>',
'<p class="c141-note">Escala atual: <strong>Difícil 8d · Bom 16d · Fácil 24d · Conhecimento preservado 32d · Conhecimento adquirido 64d</strong>. Avaliações históricas permanecem preservadas. Fonte preferencial: SRS privado autorizado no Drive. Sem conexão e conferência do Drive, a fila fica bloqueada. Importações locais anteriores ficam preservadas, fora da fila oficial. Cartões sem data não são considerados atrasados.</p>',
'<p id="c141-status" class="c141-status" role="status">Selecione Planejamento de revisões SRS para carregar os registros históricos disponíveis.</p>',
'<div class="c141-board"><div class="c141-boardhead"><h3 id="c141-range">Próximos 14 dias</h3><div class="c141-actions"><button id="c141-prev">← Antes</button><button id="c141-reset">Hoje</button><button id="c141-next">Depois →</button></div></div><div class="c141-scroll"><table><thead><tr><th>Data</th><th>Vencem / atrasados</th><th>Previstos</th><th>Tempo</th><th>Disponível</th><th>Cartões</th></tr></thead><tbody id="c141-body"><tr><td colspan="6">Carregando...</td></tr></tbody></table></div></div>',
'<div class="c141-import"><h3>Importar datas SRS para esta simulação local</h3><p>Importe CSV ou JSON com as colunas <code>id;proxima_revisao;avaliacao</code> (por exemplo <code>CARD-0001;18/11/2026;Errei</code>). Os dados ficam <strong>somente neste navegador</strong>. Não são enviados ao GitHub ou Drive e não substituem o histórico canônico de revisões do ChatGPT.</p><input id="c141-file" type="file" accept=".csv,.json" hidden><button id="c141-pick">Importar SRS (CSV/JSON)</button> <button id="c141-clear">Limpar importação local</button><p id="c141-result" class="c141-result" role="status"></p></div>',
'</div>'].join('');
const footer=main.querySelector('footer');if(footer)footer.before(root);else main.append(root);
const navBtn=document.createElement('button');navBtn.type='button';navBtn.textContent='Planejamento de revisões SRS';navBtn.dataset.page='calendario';
const cardBtn=nav.querySelector('[data-page="cartoes"]');if(cardBtn)cardBtn.after(navBtn);else nav.append(navBtn);
const $=id=>document.getElementById(id);
const importKey='BM141_CALENDAR_IMPORT_V1',prefKey='BM141_CALENDAR_PREF_V1';
let cards=[],map=new Map(),history=[],imported=[],privateRecords=[],privateInfo=null,schedule=[],page=0,loaded=false,loading=false,driveBusy=false,queueShown=50,verifiedAuth='';
const authNow=()=>window.BancoMestreMediaSyncV182?.token?.()||window.BM239DriveGlobal?.writeToken?.()||'';
const ready=()=>!!authNow()&&verifiedAuth===authNow()&&!!privateInfo;
function locked(message='Conecte o Google Drive para carregar a fila de revisões.'){
 verifiedAuth='';privateInfo=null;privateRecords=[];studyAgenda=[];studyAgendaToken='';schedule=[];root.dataset.bm411Ready='false';
 for(const id of ['c141-known','c141-overdue','c141-unplanned','c141-today'])$(id).textContent='—';
 for(const [id,n] of [['c141-body',6],['c313-body',7]]){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=n;td.textContent=message;tr.append(td);$(id).replaceChildren(tr);}
 $('c141-status').textContent=message;$('c313-source').textContent=message;$('c313-count').textContent='';$('c313-more').style.display='none';driveNote.textContent=message;
}
function syncVisible(){if(!authNow()||verifiedAuth&&verifiedAuth!==authNow())locked();}
const today=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day};
const shift=(base,n)=>{const d=new Date(base+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const due=v=>{const t=String(v||'').trim();let d=null;if(/^\d{4}-\d{2}-\d{2}/.test(t))d=t.slice(0,10);else{const m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)d=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')}if(!d||! /^\d{4}-\d{2}-\d{2}$/.test(d))return null;const test=new Date(d+'T12:00:00');return !isNaN(test)&&shift(d,0)===d?d:null};
const rank=v=>({errei:0,dificil:1,bom:2,facil:3,conhecimentopreservado:4,conhecimentoadquirido:5})[norm(v)]??6;
const dayText=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
const weekday=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'});
const timeLabel=n=>(Number.isInteger(n)?String(n):String(n).replace('.',','))+' min';
const create=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==null)node.textContent=text;if(cls)node.className=cls;return node};
try{imported=JSON.parse(localStorage.getItem(importKey)||'[]').filter(x=>x&&x.id&&due(x.due))}catch{}
try{const p=JSON.parse(localStorage.getItem(prefKey)||'{}');if([1.5,2,3,4].includes(Number(p.minutes)))$('c141-min').value=String(p.minutes);$('c141-new').checked=p.addNew===true}catch{}
async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('Fonte indisponível: '+path);return r.json()}
const source=document.createElement('div');source.className='c141-private-source';source.style.cssText='margin:10px 0;padding:11px;border:1px solid #cad9dd;border-radius:8px';
const queueStart=document.createElement('button');queueStart.type='button';queueStart.className='c141-primary';queueStart.id='bm382CalendarStart';queueStart.textContent='Iniciar estudo · atrasados e hoje';root.querySelector('.c141-title')?.after(queueStart);
const driveAction=document.createElement('button');driveAction.type='button';driveAction.className='c141-primary';driveAction.textContent='Atualizar fila pelo SRS privado do Drive';
const driveNote=document.createElement('span');driveNote.style.cssText='display:block;font-size:12px;margin-top:7px';driveNote.textContent='Conecte o Google Drive para carregar a fila privada. Nenhuma data histórica será usada sem confirmação.';
source.append(driveAction,driveNote);root.querySelector('.c141-import').before(source);

let studyAgenda=[],studyAgendaToken='';
async function readStudyAgenda(){
 const auth=window.BancoMestreMediaSyncV182?.token?.()||window.BM239DriveGlobal?.writeToken?.()||'';
 if(!auth){studyAgenda=[];studyAgendaToken='';return 0}
 if(auth!==studyAgendaToken){studyAgenda=[];studyAgendaToken=auth}
 const headers={Authorization:'Bearer '+auth},base='https://www.googleapis.com/drive/v3/files';
 const q="trashed = false and mimeType = 'application/vnd.google-apps.document' and name contains 'Delta de estudo e cartões aprovados'";
 let page='',files=[];
 do{const u=base+'?'+new URLSearchParams({q,fields:'nextPageToken,incompleteSearch,files(id)',pageSize:'100',...(page?{pageToken:page}:{})});const r=await fetch(u,{headers,cache:'no-store'});if(!r.ok)throw Error('Drive: HTTP '+r.status+' ao consultar deltas');const a=await r.json();if(a.incompleteSearch)throw Error('Listagem incompleta');files.push(...(a.files||[]));page=a.nextPageToken||'';}while(page);
 const seen=new Map();
 for(const f of files){
  const res=await fetch(base+'/'+encodeURIComponent(f.id)+'/export?mimeType=text%2Fplain',{headers,cache:'no-store'});
  if(!res.ok)throw Error('Drive: HTTP '+res.status+' ao ler delta');
  const raw=await res.text();
  for(const block of raw.matchAll(/\{\s*"format"\s*:\s*"BancoMestrePrivateStudyAgenda1"[\s\S]*?\n\}/g)){
   const data=JSON.parse(block[0]);
   for(const e of data.records||[]){
    if(!map.has(e.id)||!e.event_id||!due(e.due)||!due(e.date_local)||e.method!=='v015')continue;
    if(!['questao_distinta','avaliacao_explicita'].includes(e.kind)||![8,16,24,32,64].includes(e.interval_days)||shift(e.date_local,e.interval_days)!==e.due)continue;
    if(e.rating!=null&&!['Difícil','Bom','Fácil','Conhecimento preservado','Conhecimento adquirido'].includes(e.rating))continue;
    if(seen.has(e.event_id)&&JSON.stringify(seen.get(e.event_id))!==JSON.stringify(e))throw Error('Evento de estudo divergente');
    seen.set(e.event_id,e);
   }
  }
 }
 if(auth!==(window.BancoMestreMediaSyncV182?.token?.()||window.BM239DriveGlobal?.writeToken?.()||''))return 0;
 studyAgenda=[...seen.values()].sort((a,b)=>a.date_local.localeCompare(b.date_local)||Number(a.kind==='avaliacao_explicita')-Number(b.kind==='avaliacao_explicita')||a.event_id.localeCompare(b.event_id));
 return studyAgenda.length;
}
let privateRefresh=null;
async function refreshPrivate(){
 if(!loaded)return false;
 if(privateRefresh)return privateRefresh;
 privateRefresh=refreshPrivateOnce().finally(()=>{privateRefresh=null});return privateRefresh;
}
async function refreshPrivateOnce(){
 
 const auth=authNow();if(!auth){locked();return false;}locked('Conferindo registros privados do Drive…');driveBusy=true;driveAction.disabled=true;
 try{
  const count=await readStudyAgenda();
  if(!window.BMSRSV311?.latestPrivate)throw Error('Fonte privada indisponível');
  const remote=await window.BMSRSV311.latestPrivate();
  const next=remote.records.filter(x=>map.has(x.id)&&due(x.due));
  if(next.length<20)throw Error('Poucos IDs reconhecidos; a fila anterior foi preservada.');
  if(auth!==authNow())throw Error('Sessão do Drive alterada');
  await window.BM316SrsJournal?.refresh?.();
  if(auth!==authNow()||!window.BM316SrsJournal?.loaded)throw Error('Histórico de avaliações não confirmado');
  privateRecords=next;privateInfo={version:remote.version,updated:remote.updated,count:next.length,sourceId:remote.driveFileId};verifiedAuth=auth;root.dataset.bm411Ready='true';
  driveNote.textContent='SRS privado '+remote.version+' ('+(remote.updated||'data não informada')+'): '+next.length+' vencimentos derivados, incluindo os agendamentos iniciais. Histórico anterior preservado. Não é leitura de avaliações posteriores à data do arquivo.';
  driveNote.textContent+=' · '+count+' agendamentos de estudo lidos.';calculate();return true;
 }catch(e){
  locked('Fila não confirmada: '+e.message+'. Atualize pelo Drive para continuar.');return false;
 }finally{driveBusy=false;driveAction.disabled=false}
}
driveAction.onclick=async()=>{if(!authNow()){$('bm239-drive-action')?.click();return;}await open();};
document.addEventListener('bm-media-drive-authorized',()=>{if(root.classList.contains('active')||location.hash==='#calendario')void open();});
window.addEventListener('focus',syncVisible);document.addEventListener('visibilitychange',syncVisible);
document.addEventListener('bm316-srs-journal-updated',()=>{if(loaded)calculate()});

let agendaLoad=null;
async function load(){
 if(!authNow())throw Error('Conecte o Google Drive para consultar a agenda.');
 if(loaded)return;
 if(agendaLoad)return agendaLoad;
 agendaLoad=loadCatalog().finally(()=>{agendaLoad=null});return agendaLoad;
}
async function loadCatalog(){
 const manifest={catalog:BM_CATALOG},p=await json(manifest.catalog.path);
 const n=manifest.catalog.counts;
 if(p.format!==manifest.catalog.format||p.base?.length!==n.canonical||p.ijui?.length!==n.ijui||p.base.filter(c=>c.active!==false).length!==n.active)throw Error('Catálogo vigente inválido');
 cards=[...p.base,...p.ijui].filter(c=>c&&c.active!==false&&c.id);
 map=new Map(cards.map(c=>[c.id,c]));
 history=Object.entries(p.auditF17?.historico_por_id||{}).map(([id,e])=>({id,due:due(e.proxima_revisao_existente_v015),rating:e.avaliacao||'',source:'F17/V015'})).filter(x=>x.due&&map.has(x.id));
 loaded=true;
}
function records(){
 if(!ready())return [];
 const all=new Map();
 for(const x of privateRecords)if(map.has(x.id))all.set(x.id,x);
 // Importações locais são preservadas, mas não integram a fila oficial do Drive.
 const currentAuth=window.BancoMestreMediaSyncV182?.token?.()||window.BM239DriveGlobal?.writeToken?.()||'';
 if(currentAuth&&currentAuth===studyAgendaToken)for(const e of studyAgenda){
  const prior=all.get(e.id);
  if(prior?.lastReview&&prior.lastReview>e.date_local)continue;
  if(prior?.lastReview===e.date_local&&prior.rating&&e.kind!=='avaliacao_explicita')continue;
  all.set(e.id,{id:e.id,due:e.due,rating:e.rating||prior?.rating||'',lastReview:e.date_local,intervalDays:e.interval_days,source:e.kind==='avaliacao_explicita'?'Drive privado — avaliação de estudo':'Drive privado — agenda por questão',eventId:e.event_id});
 }
 // Eventos formais confirmados no Drive têm prioridade sobre fonte antiga e importações.
 for(const x of window.BM316SrsJournal?.records?.()||[]){
  if(!map.has(x.id)||!due(x.due))continue;
  const prior=all.get(x.id);
  // Uma revisão posterior no snapshot canônico prevalece sobre evento antigo do portal.
  if(prior?.lastReview&&x.lastReview&&x.lastReview<prior.lastReview)continue;
  all.set(x.id,x);
 }
 return [...all.values()].filter(x=>due(x.due));
}
function calculate(){
 if(!loaded||!ready())return;
 const all=records(),start=today(),last=shift(start,179),known=new Set(all.map(x=>x.id));
 const candidates=all.filter(x=>x.due<=last).sort((a,b)=>a.due.localeCompare(b.due)||rank(a.rating)-rank(b.rating)||a.id.localeCompare(b.id));
 const minute=Number($('c141-min').value)||2,capacity=Math.floor(60/minute),addNew=$('c141-new').checked;
 const newCards=addNew?cards.filter(c=>!known.has(c.id)).sort((a,b)=>String(a.prior||'P9').localeCompare(String(b.prior||'P9'))||a.id.localeCompare(b.id)):[];
 let position=0,newPosition=0,pending=[];
 schedule=[];
 for(let i=0;i<180;i++){
  const date=shift(start,i);let deadlineCount=0;
  while(position<candidates.length&&candidates[position].due<=date){
   if(candidates[position].due===date)deadlineCount++;
   pending.push(candidates[position++]);
  }
  pending.sort((a,b)=>rank(a.rating)-rank(b.rating)||a.due.localeCompare(b.due)||a.id.localeCompare(b.id));
  const items=pending.splice(0,capacity).map(x=>Object.assign({},x,{kind:'revisao'}));
  while(addNew&&items.length<capacity&&newPosition<newCards.length)items.push({id:newCards[newPosition++].id,due:'',rating:'',source:'Sem data SRS',kind:'novo'});
  schedule.push({date,items,dueToday:deadlineCount,minutes:Math.round(items.length*minute*10)/10});
 }
 $('c141-known').textContent=all.length.toLocaleString('pt-BR');
 $('c141-overdue').textContent=all.filter(x=>x.due<start).length;
 $('c141-unplanned').textContent=Math.max(0,cards.length-all.length).toLocaleString('pt-BR');
 $('c141-today').textContent=all.filter(x=>x.due===start).length;
 $('c141-status').textContent=all.length+' datas SRS conhecidas ('+(privateInfo?'privado '+privateInfo.version:'somente F17 histórico')+'), '+imported.length+' importações locais. Ordenação por vencimento e dificuldade; avaliações históricas preservadas. Nenhuma revisão é lançada automaticamente.';
 try{localStorage.setItem(prefKey,JSON.stringify({minutes:minute,addNew}))}catch{}
 render();
 renderQueue();
}
let cardOpenRequest=0;
async function openCard(id,origin){
 const request=++cardOpenRequest;
 const sourceButton=origin||document.activeElement;
 const status=$('c141-status');
 if(origin)origin.disabled=true;
 try{
  let reader=window.BancoMestreVisualizarCardV050;
  if(!reader||typeof reader.showId!=='function')throw Error('Leitor do popup indisponível.');
  let opened=reader.showId(id,sourceButton);
  if(!opened){
   if(typeof window.loadCards!=='function')throw Error('Carregador de cartões indisponível.');
   await window.loadCards();
   if(request!==cardOpenRequest)return;
   reader=window.BancoMestreVisualizarCardV050;
   opened=!!reader?.showId?.(id,sourceButton);
  }
  if(!opened)throw Error('ID '+id+' não encontrado na biblioteca carregada.');
  // O popup é aberto SOBRE o planejamento; fechar retorna à tabela sem alterar filtros.
  const modal=$('bmCardPeekV050'),back=modal?.querySelector('.bm165-footer-close');
  const label=back&&Array.from(back.childNodes).find(n=>n.nodeType===3);
  if(label){
   if(typeof modal.bmSrsBackCleanup==='function')modal.bmSrsBackCleanup();
   const previous=label.textContent;
   label.textContent='Voltar ao planejamento SRS';
   const watcher=new MutationObserver(()=>{if(modal.hidden)restore()});
   function restore(){
    watcher.disconnect();label.textContent=previous;delete modal.bmSrsBackCleanup;
   }
   modal.bmSrsBackCleanup=restore;
   watcher.observe(modal,{attributes:true,attributeFilter:['hidden']});
  }
 }catch(error){
  console.warn('Falha ao abrir cartão no Planejamento SRS:',id,error);
  if(status)status.textContent='Não foi possível abrir '+id+': '+error.message;
 }finally{
  if(origin)origin.disabled=false;
 }
}
function render(){
 if(!loaded||!ready()||!schedule.length)return;
 const from=page*14,to=Math.min(from+14,schedule.length),start=today();
 $('c141-prev').disabled=page===0;$('c141-next').disabled=to>=schedule.length;
 $('c141-range').textContent=dayText(schedule[from].date)+' a '+dayText(schedule[to-1].date)+' · até 60 min por dia';
 const tbody=$('c141-body');tbody.replaceChildren();
 const overdue=records().filter(x=>x.due<start).length;
 for(let i=from;i<to;i++){
  const d=schedule[i],tr=create('tr');if(d.date===start)tr.className='c141-today';
  const date=create('td');const dateInner=create('span',dayText(d.date),'c141-date');dateInner.append(create('small',weekday(d.date)+(d.date===start?' · hoje':'')));date.append(dateInner);tr.append(date);
  const n=d.dueToday+(i===0?overdue:0);const cell=create('td');cell.append(create('span',n?n+' cartão(ões)':'Nenhum',n?(i===0?'c141-tag late':'c141-tag'):'c141-muted'));tr.append(cell);
  tr.append(create('td',String(d.items.length)+(d.items.some(x=>x.kind==='novo')?' (incl. novos)':'')));
  tr.append(create('td',timeLabel(d.minutes),'c141-planned'));
  tr.append(create('td',timeLabel(Math.max(0,60-d.minutes)),'c141-muted'));
  const detailCell=create('td');
  if(!d.items.length)detailCell.append(create('span','Sem cartões agendados','c141-muted'));
  else{
   const det=create('details'),sum=create('summary','Ver '+d.items.length+' cartões'),ul=create('ul',null,'c141-items');
   for(const item of d.items){
    const card=map.get(item.id);if(!card)continue;
    const li=create('li'),info=create('div');
    info.append(create('b',item.id+' · '+(item.consolidated?'Consolidado (2× Fácil)':item.kind==='novo'?'Novo':item.kind==='agendamento'?'Agendamento':(item.rating||'Revisão'))));
    info.append(create('p',card.front||'Pergunta'));
    info.append(create('small',(card.discipline||'')+' · '+(card.subject||'')+(item.due?' · Venc.: '+dayText(item.due):'')+(item.intervalDays?' · Intervalo '+item.intervalDays+'d':'')+(item.rating==='Fácil'&&!item.consolidated?' · Fácil, ainda não consolidado':'')+' · '+item.source));
    const button=create('button','Ver cartão');button.type='button';button.onclick=()=>void openCard(item.id,button);
  li.append(info,button);ul.append(li);
   }
   det.append(sum,ul);detailCell.append(det);
  }
  tr.append(detailCell);tbody.append(tr);
 }
}

/* V313: tabela SRS completa. Não consulta Drive por conta própria; reutiliza
   a fonte privada autorizada do motor V311. Nunca grava notas nem avaliações. */
const DAY_MS=86400000;
const diffDays=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/DAY_MS);
const queuedStatus=(entry,now)=>{
 if(!entry?.due)return {key:'undated',text:'Sem data SRS',days:null};
 const delta=diffDays(entry.due,now);
 if(delta>0)return {key:'overdue',text:delta+' dia'+(delta===1?'':'s')+' em atraso',days:delta};
 if(delta===0)return {key:'today',text:'Vence hoje',days:0};
 return {key:'upcoming',text:'Em '+(-delta)+' dia'+(delta===-1?'':'s'),days:delta};
};
function queueData(){
 if(!ready())return [];
 const dated=new Map(records().map(x=>[x.id,x])),now=today();
 const order={overdue:0,today:1,upcoming:2,undated:3};
 return cards.map(card=>{
  const rec=dated.get(card.id)||null,status=queuedStatus(rec,now);
  return {id:card.id,card,rec,status};
 }).sort((a,b)=>order[a.status.key]-order[b.status.key]||
  (a.rec?.due||'9999-12-31').localeCompare(b.rec?.due||'9999-12-31')||
  rank(a.rec?.rating)-rank(b.rec?.rating)||a.id.localeCompare(b.id));
}
function filteredQueue(){
 const value=$('c313-filter')?.value||'overdue',q=norm($('c313-search')?.value||'');
 return queueData().filter(x=>(value==='all'||x.status.key===value)&&
  (!q||norm([x.id,x.card.discipline,x.card.subject,x.card.sub,x.card.front].join(' ')).includes(q)));
}
function renderQueue(){
 if(!loaded||!ready())return;
 const source=$('c313-source'),rows=filteredQueue(),start=today();
 if(source){
  source.textContent=(privateInfo?
   'Fonte SRS privada '+privateInfo.version+' de '+(privateInfo.updated||'data não informada')+' (leitura OAuth nesta sessão).':
   'Fonte parcial e histórica F17/V015; conecte o Drive e clique em Atualizar fila pelo SRS privado do Drive.')+
   (window.BM316SrsJournal?.loaded?' Eventos formais do site conferidos no Drive: '+window.BM316SrsJournal.count+'.':'')+
   ' Referência dos cálculos: '+dayText(start)+
   '. As datas só refletem revisões documentadas na fonte consultada; respostas posteriores não confirmadas não foram consideradas.';
 }
 $('c313-count').textContent=rows.length.toLocaleString('pt-BR')+
  ' cartões no filtro · '+Math.min(queueShown,rows.length)+' exibidos · '+cards.length.toLocaleString('pt-BR')+
  ' ativos no catálogo. Intervalos vigentes: Difícil 8 / Bom 16 / Fácil 24 / Conhecimento preservado 32 / Conhecimento adquirido 64 dias.';
 const body=$('c313-body');if(!body)return;body.replaceChildren();
 if(!rows.length){
  const tr=create('tr'),td=create('td','Nenhum cartão nesta situação.','c141-muted');td.colSpan=7;tr.append(td);body.append(tr);
 }
 for(const x of rows.slice(0,queueShown)){
  const tr=create('tr');
  if(x.status.key==='overdue')tr.className='c141-today';
  const id=create('td',x.id);tr.append(id);
  const concept=create('td');
  concept.append(create('strong',x.card.subject||x.card.discipline||'Assunto não informado'));
  concept.append(create('small',x.card.front||'Pergunta sem texto'));
  tr.append(concept);
  const label=x.rec?.consolidated?'Consolidado — 2× Fácil':x.rec?.rating||(x.rec?.kind==='agendamento'?'Agendado sem revisão formal':'Não iniciado');
  tr.append(create('td',label));
  tr.append(create('td',x.rec?.due?dayText(x.rec.due):'—'));
  tr.append(create('td',x.status.text,x.status.key==='overdue'?'c141-tag late':''));
  tr.append(create('td',x.rec?.source||'Sem registro SRS'));
  const action=create('td'),btn=create('button','Abrir cartão');btn.type='button';
  btn.onclick=()=>void openCard(x.id,btn);action.append(btn);tr.append(action);
  body.append(tr);
 }
 const more=$('c313-more');if(more){more.style.display=rows.length>queueShown?'inline-block':'none';
  more.textContent='Mostrar mais 50 ('+(rows.length-queueShown)+' restantes)';}
}
function exportQueue(){
 if(!loaded||!ready())return;
 const rows=[['id','disciplina','assunto','pergunta','classificacao','proxima_revisao','situacao','dias_em_atraso','intervalo_dias','origem_srs','consolidado']];
 for(const x of filteredQueue()){
  rows.push([x.id,x.card.discipline,x.card.subject,x.card.front,
   x.rec?.consolidated?'Consolidado':x.rec?.rating||'',x.rec?.due||'',x.status.text,
   x.status.days>0?x.status.days:0,x.rec?.intervalDays||'',x.rec?.source||'',x.rec?.consolidated?'Sim':'Não']);
 }
 const safe=x=>{
  let v=String(x??'');
  if(/^[\s]*[=+\-@\t\r]/.test(v))v="'"+v; // protege contra fórmulas CSV
  return '"'+v.replace(/"/g,'""')+'"';
 };
 const csv='\ufeff'+rows.map(r=>r.map(safe).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;
 a.download='Banco_Mestre_Fila_SRS_'+($('c313-filter').value||'todos')+'_'+today()+'.csv';
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
$('c313-filter').onchange=()=>{queueShown=50;renderQueue()};
$('c313-search').oninput=()=>{queueShown=50;renderQueue()};
$('c313-more').onclick=()=>{queueShown+=50;renderQueue()};
$('c313-export').onclick=exportQueue;

function parseCSV(input){
 const header=(input.split(/\r?\n/)[0]||'');const delim=[';',',','\t'].sort((a,b)=>header.split(b).length-header.split(a).length)[0];
 const rows=[];let data='',cell='',row=[],quoted=false;
 for(let i=0;i<input.length;i++){
  const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(c===delim&&!quoted){row.push(cell);cell=''}
  else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(cell);cell='';if(row.some(x=>x.trim()))rows.push(row);row=[]}
  else cell+=c;
 }
 row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 if(rows.length<2)throw Error('CSV vazio ou sem cabeçalho');
 const keys=rows.shift().map(norm);
 const find=names=>keys.findIndex(k=>names.includes(k));
 const a=find(['id','cardid','cartao','idcartao','cartaoid']),b=find(['proximarevisao','dataproximarevisao','proximarevisaoexistentev015','nextreview','duedate','due']),c=find(['avaliacao','classificacao','rating','dificuldade']);
 if(a<0||b<0)throw Error('CSV precisa de id e proxima_revisao');
 return rows.map(r=>({id:r[a],due:r[b],rating:c<0?'':r[c]}));
}
function parseJSON(obj){
 let arr;
 if(Array.isArray(obj))arr=obj;
 else if(Array.isArray(obj.cards))arr=obj.cards;
 else if(Array.isArray(obj.registros))arr=obj.registros;
 else if(Array.isArray(obj.revisoes))arr=obj.revisoes;
 else if(Array.isArray(obj.srs))arr=obj.srs.map(x=>{const v=window.BMSRSV311?.fromSrs?.(x);return v?{...v,__verifiedSrs:true}:{id:x.id,due:x.next_review,rating:''}});
 else{const map=obj.por_id||obj.historico_por_id||obj.srs||obj;arr=Object.entries(map).map(([key,val])=>Object.assign({},val&&typeof val==='object'?val:{},{id:(val&&val.id)||key}))}
 const pick=(x,names)=>Object.entries(x||{}).find(([k])=>names.includes(norm(k)))?.[1];
 return arr.map(x=>({id:pick(x,['id','cardid','cartaoid','idcartao']),due:pick(x,['proximarevisao','dataproximarevisao','proximarevisaoexistentev015','nextreview','duedate','due']),rating:pick(x,['avaliacao','classificacao','rating','dificuldade']),verifiedSrs:x.__verifiedSrs===true,consolidated:x.__verifiedSrs===true&&x.consolidated===true&&Number(x.easyFormalCount)>=2,intervalDays:x.__verifiedSrs===true?Number(x.intervalDays)||null:null,easyFormalCount:x.__verifiedSrs===true?Number(x.easyFormalCount)||0:0}));
}
async function upload(file){
 if(!file||file.size>15*1024*1024)throw Error('Arquivo ausente ou maior que 15MB');
 const content=await file.text();
 const rows=content.trim().startsWith('{')||content.trim().startsWith('[')?parseJSON(JSON.parse(content)):parseCSV(content);
 const valid=new Map();let ignored=0;
 for(const row of rows){const id=String(row.id||'').trim(),date=due(row.due);if(!map.has(id)||!date){ignored++;continue}valid.set(id,{id,due:date,rating:String(row.rating||'').trim(),consolidated:row.verifiedSrs===true&&row.consolidated===true,easyFormalCount:row.verifiedSrs===true?row.easyFormalCount:0,intervalDays:row.verifiedSrs===true?row.intervalDays:null})}
 if(!valid.size)throw Error('Nenhuma linha com ID ativo e data válida. Formato: CARD-0001;18/11/2026;Errei');
 const update=new Map(imported.map(x=>[x.id,x]));for(const [id,val]of valid)update.set(id,val);
 imported=[...update.values()];localStorage.setItem(importKey,JSON.stringify(imported));
 $('c141-result').className='c141-result';$('c141-result').textContent=valid.size+' cartões importados; '+ignored+' linhas ignoradas. Somente o planejamento local foi atualizado.';calculate();
}
function exportCSV(){
 if(!loaded||!ready())return;
 const rows=[['data_planejada','cartao_id','tipo','vencimento_original','avaliacao','disciplina','tempo_min','origem']];
 for(const day of schedule)for(const x of day.items){const c=map.get(x.id)||{};rows.push([day.date,x.id,x.kind,x.due,x.rating,c.discipline,Number($('c141-min').value),x.source])}
 const csv='\ufeff'+rows.map(row=>row.map(x=>'"'+String(x||'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='Planejamento_SRS_Estimado_'+today()+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function open(){
 if(typeof window.section==='function')window.section('calendario');
 if(!authNow()){locked();return;}
 if(loading)return;loading=true;locked('Carregando agenda privada do Drive…');
 try{await load();await refreshPrivate();}catch(e){locked('Fila não confirmada: '+e.message)}finally{loading=false}
}
navBtn.onclick=open;
$('c141-min').onchange=()=>loaded&&calculate();
$('c141-new').onchange=()=>loaded&&calculate();
$('c141-prev').onclick=()=>{page=Math.max(0,page-1);render()};
$('c141-next').onclick=()=>{page=Math.min(12,page+1);render()};
$('c141-reset').onclick=()=>{page=0;render()};
$('c141-export').onclick=()=>loaded?exportCSV():open();
$('c141-pick').onclick=()=>loaded?$('c141-file').click():open();
$('c141-file').onchange=async function(){const file=this.files?.[0];this.value='';if(!file)return;try{await upload(file)}catch(e){$('c141-result').className='c141-result error';$('c141-result').textContent=e.message}};
$('c141-clear').onclick=()=>{if(!imported.length)return;if(!confirm('Limpar apenas as datas importadas para este calendário? O SRS original não será alterado.'))return;imported=[];localStorage.removeItem(importKey);$('c141-result').textContent='Importação local limpa, histórico F17 mantido.';if(loaded)calculate()};
window.BM141Calendar={open,refreshPrivate,ensureLoaded:load,plan:()=>ready()?schedule.slice():[],rows:queueData,records:()=>records().map(x=>({...x})),counts:()=>ready()?({active:cards.length,verified:records().length,overdue:records().filter(x=>x.due<today()).length,today:records().filter(x=>x.due===today()).length,undated:cards.length-records().length,imported:imported.length,private:privateRecords.length,privateInfo}):({active:0,verified:0,overdue:0,today:0,undated:0,imported:0,private:0,privateInfo:null,locked:true})};
locked();
if(location.hash==='#calendario')void open();
})();

;
/* 87 assets/v206_discursive.js */
/* Banco Mestre V206 (formato histórico V195): resposta discursiva opcional no leitor de cartões.
 * IndexedDB local + envio EXPLÍCITO ao Drive do titular. Não altera o SRS canônico.
 * O destino oficial é localizado após OAuth; o ID privado não é publicado.
 */
(function(){
 'use strict';
 if(window.BM195Discursivas)return;
 const ID_RE=/^(?:CARD-\d{4,}|PROP-IJUI-\d+|TRT0[12]-C\d{3}|IJUI-[A-Za-z0-9_-]+)$/;
 const FILE_ID=/^[A-Za-z0-9_-]{10,}$/;
 const DB_NAME='BancoMestreDiscursivasV195';
 const FOLDER_NAME='RESPOSTAS_DISCURSIVAS';
 const FOLDER_HASH='23ea4060a22da2592c3076f871051d17f5a1a579ffbcc4867cadb2767ed2b715';
 let resolvedFolder='',syncRequested=false;
 const DRAFT_PREFIX='BM195_DISCURSIVA_RASCUNHO:';
 const SCOPE='https://www.googleapis.com/auth/drive';
 const API='https://www.googleapis.com/drive/v3/files';
 const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
 const FORMAT='BancoMestreRespostaDiscursivaV195';
 let dbP=null,client=null,token='',expires=0,oauthPending=false,connected=false,syncing=false;
 let cardId='',rating='',writing=false,lastUploaded='';
 const el=(type,cls,text)=>{const n=document.createElement(type);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
 function openDb(){
  if(dbP)return dbP;
  dbP=new Promise((resolve,reject)=>{
   if(!window.indexedDB){reject(Error('IndexedDB indisponível neste navegador.'));return;}
   const req=indexedDB.open(DB_NAME,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('attempts'))req.result.createObjectStore('attempts',{keyPath:'id'});};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Não foi possível abrir o histórico.'));
   req.onblocked=()=>reject(Error('O histórico está bloqueado por outra aba.'));
  });
  return dbP;
 }
 async function all(){
  const d=await openDb();
  return new Promise((resolve,reject)=>{
   const t=d.transaction('attempts','readonly'),r=t.objectStore('attempts').getAll();
   r.onsuccess=()=>resolve(r.result.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))));
   r.onerror=()=>reject(r.error||Error('Falha na leitura.'));
  });
 }
 async function put(row){
  const d=await openDb();
  return new Promise((resolve,reject)=>{
   const t=d.transaction('attempts','readwrite');
   t.objectStore('attempts').put(row);
   t.oncomplete=()=>resolve(row);
   t.onerror=()=>reject(t.error||Error('Não foi possível gravar a tentativa.'));
   t.onabort=()=>reject(t.error||Error('Tentativa não gravada.'));
  });
 }
 function configuredFolder(){return resolvedFolder;}
 async function resolveFolder(){
  if(resolvedFolder)return resolvedFolder;
  const q="name = '"+FOLDER_NAME+"' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  let pageToken='',matches=[];
  do{
   const params=new URLSearchParams({q,fields:'nextPageToken,files(id,name,capabilities(canAddChildren))',pageSize:'100'});
   if(pageToken)params.set('pageToken',pageToken);
   const page=await apiGet(API+'?'+params.toString());
   for(const folder of page.files||[]){
    if(!FILE_ID.test(folder.id)||folder.name!==FOLDER_NAME)continue;
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(folder.id));
    const hash=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
    if(hash===FOLDER_HASH)matches.push(folder);
   }
   pageToken=page.nextPageToken||'';
  }while(pageToken);
  if(matches.length!==1)throw Error('Pasta oficial não localizada nesta conta Google. Conecte a conta correta; respostas locais preservadas.');
  if(matches[0].capabilities?.canAddChildren!==true)throw Error('Sem permissão de gravação na pasta oficial.');
  resolvedFolder=matches[0].id;
  return resolvedFolder;
 }
 function draftKey(){return DRAFT_PREFIX+cardId;}
 function getCard(){
  try{return typeof cards!=='undefined'&&Array.isArray(cards)?cards.find(c=>c.id===cardId):null;}catch{return null}
 }
 let modal,controlButton,editor,area,observedTitle;
 function say(text,isError){
  if(!editor)return;
  const s=editor.querySelector('[data-bm195-status]');if(!s)return;
  s.textContent=String(text||'');s.dataset.error=isError?'yes':'no';
 }
 let historyRequest=0;
 async function history(){
  if(!editor||editor.hidden||!ID_RE.test(cardId))return;
  const out=editor.querySelector('[data-bm195-history]');if(!out||out.hidden)return;
  const requestedId=cardId,request=++historyRequest;
  const isCurrent=()=>request===historyRequest&&requestedId===cardId&&!editor.hidden&&!out.hidden&&!modal.hidden;
  out.replaceChildren(el('p','','Carregando tentativas…'));
  try{
   const rows=(await all()).filter(r=>r.card_id===requestedId);
   if(!isCurrent())return;
   out.replaceChildren();
   out.append(el('p','','Tentativas registradas neste cartão: '+rows.length));
   for(const r of rows.slice(0,30)){
    const details=el('details','bm195-entry');
    const date=new Date(r.created_at).toLocaleString('pt-BR');
    const tag=r.sync_status==='synced'?' · Drive confirmado':' · pendente de Drive';
    details.append(el('summary','',date+' · '+r.rating+tag));
    details.append(el('pre','',r.answer||'(Sem resposta escrita: Errei)'));
    if(r.note)details.append(el('p','','Observações: '+r.note));
    if(r.drive_file_id&&FILE_ID.test(r.drive_file_id)){
     const link=el('a','','Abrir registro no Drive');link.href='https://drive.google.com/file/d/'+encodeURIComponent(r.drive_file_id)+'/view';link.target='_blank';link.rel='noopener noreferrer';details.append(link);
    }
    out.append(details);
   }
   if(rows.length>30)out.append(el('small','','Exibindo as 30 tentativas mais recentes; a exportação inclui todas.'));
  }catch(error){if(isCurrent())out.replaceChildren(el('p','','Não foi possível ler o histórico: '+error.message));}
 }
 async function exportJson(){
  try{
   const rows=await all();
   const payload={format:'BancoMestreRespostasDiscursivasBackupV195',exported_at:new Date().toISOString(),count:rows.length,attempts:rows};
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob),a=el('a');
   a.href=url;a.download='BancoMestre_Respostas_Discursivas_'+new Date().toISOString().slice(0,10)+'.json';
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
   say('Backup exportado: '+rows.length+' tentativas. Guarde o arquivo em segurança.');
  }catch(e){say('Falha ao exportar: '+e.message,true)}
 }
 function selectedRate(v){
  rating=v;editor.querySelectorAll('[data-bm195-rate]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bm195Rate===v)));
 }
 function setCard(){
  const next=window.BancoMestreVisualizarCardV050?.currentId||'';
  if(!ID_RE.test(next)){
   if(editor)editor.hidden=true;
   if(controlButton){controlButton.textContent='Responder discursivamente';controlButton.setAttribute('aria-expanded','false');}
   return;
  }
  if(next===cardId)return;
  cardId=next;rating='';selectedRate('');
  ++historyRequest;
  if(editor){
   editor.hidden=true;
   const out=editor.querySelector('[data-bm195-history]');
   out.hidden=false;out.replaceChildren();
   const toggle=editor.querySelector('[data-bm195-history-toggle]');
   toggle.textContent='Ocultar histórico deste cartão';toggle.setAttribute('aria-expanded','true');
  }
  if(controlButton){controlButton.textContent='Responder discursivamente';controlButton.setAttribute('aria-expanded','false');}
  if(area){
   let saved='';try{saved=localStorage.getItem(draftKey())||''}catch{}
   area.value=saved;
  }
 }
 async function save(){
  if(writing||!ID_RE.test(cardId))return;
  const text=area.value;
  if(!['Difícil','Bom','Fácil','Conhecimento preservado','Conhecimento adquirido'].includes(rating)){say('Escolha uma classificação vigente para a tentativa escrita.',true);return}
  if(!text.trim()&&rating!=='Difícil'){say('Escreva a resposta ou marque Difícil se não conseguiu responder.',true);return}
  const c=getCard();if(!c){say('ID não encontrado na base carregada. Nenhum registro foi criado.',true);return}
  writing=true;
  const button=editor.querySelector('[data-bm195-save]');button.disabled=true;
  try{
   const now=new Date(),rid='BM195-'+(window.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
   const row={
    format:FORMAT,id:rid,card_id:cardId,front:String(c.front||''),
    discipline:String(c.discipline||''),subject:String(c.subject||''),sub:String(c.sub||''),
    answer:text,rating,note:String(editor.querySelector('[data-bm195-note]').value||''),
    created_at:now.toISOString(),timezone_offset_min:now.getTimezoneOffset(),
    site_version:'V206',base_version:'V194',mode:'resposta_discursiva',
    audit_status:'pendente_de_confronto_com_base',srs_status:'nao_integrado_ao_srs_canonico',
    sync_status:'pending',drive_file_id:null
   };
   await put(row);
   try{localStorage.removeItem(draftKey())}catch{}
   const authorized=connected&&token&&expires>Date.now();
   say('Tentativa salva neste navegador. '+(authorized?'Sincronização automática iniciada.':'Pendente de Drive; conecte sua conta Google.'));
   if(authorized)void syncPending();
   await history();
  }catch(e){say('A tentativa NÃO foi salva: '+e.message,true)}
  finally{writing=false;button.disabled=false}
 }
 async function readyGoogle(){
  const cfg=await fetch('assets/drive_auth_v038.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Configuração OAuth indisponível');return r.json()});
  if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(cfg.client_id||''))throw Error('Client ID OAuth inválido');
  if(!window.google?.accounts?.oauth2?.initTokenClient){
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=resolve;script.onerror=()=>reject(Error('Biblioteca de login Google indisponível'));document.head.append(script)});
  }
  client=google.accounts.oauth2.initTokenClient({
   client_id:cfg.client_id,scope:SCOPE,
   callback:resp=>{
    oauthPending=false;
    if(!resp?.access_token||resp.error){say('Autorização Google não concedida: '+(resp?.error||'sem token'),true);return}
    if(resp.scope&&!resp.scope.split(/\s+/).includes(SCOPE)){say('O Google não concedeu a permissão de gravação necessária.',true);return}
    token=resp.access_token;resolvedFolder='';expires=Date.now()+Math.max(60,Number(resp.expires_in||3600)-90)*1000;connected=true;
    say('Google Drive conectado. Sincronizando as tentativas pendentes…');
    void syncPending();
   },
   error_callback:err=>{oauthPending=false;say('Conexão Google cancelada ou indisponível: '+String(err?.type||''),true)}
  });
  editor.querySelector('[data-bm195-connect]').disabled=false;
  say('Pronto para registrar respostas. A primeira conexão ao Drive exige autorização Google.');
 }
 function connect(){
  if(!client){say('A autorização Google ainda não está pronta.',true);return}
  if(oauthPending)return;
  if(connected&&token&&expires>Date.now()){void syncPending();return}
  oauthPending=true;
  try{client.requestAccessToken({prompt:''});}catch(e){oauthPending=false;say('Não foi possível solicitar autorização: '+e.message,true)}
 }
 async function responseJson(resp,label){
  if(!resp.ok){
   if(resp.status===401){token='';connected=false;resolvedFolder=''}
   let detail='';try{const d=await resp.json();detail=d.error?.message||''}catch{}
   throw Error(label+' (HTTP '+resp.status+')'+(detail?': '+detail.slice(0,300):''));
  }
  return resp.json();
 }
 async function apiGet(url){
  const r=await fetch(url,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  return responseJson(r,'Falha ao consultar o Drive');
 }
 function fileName(row){return 'BM195_'+row.card_id+'_'+row.id+'.json';}
 async function existingFile(folder,row){
  const q="'"+folder+"' in parents and name = '"+fileName(row)+"' and trashed = false";
  const url=API+'?'+new URLSearchParams({q,fields:'files(id,name,parents,appProperties),nextPageToken',pageSize:'20'}).toString();
  const found=(await apiGet(url)).files||[];
  if(found.length>1)throw Error('Há cópias duplicadas deste evento no Drive; auditoria manual necessária.');
  if(!found.length)return null;
  const file=found[0];
  if(file.appProperties?.bm_attempt_id!==row.id||file.appProperties?.bm_format!==FORMAT)
   throw Error('Arquivo homônimo encontrado sem vínculo válido; não será sobrescrito.');
  return file;
 }
 async function uploadOne(folder,row){
  let remote=await existingFile(folder,row);
  if(!remote){
   const document={format:FORMAT,id:row.id,card_id:row.card_id,front:row.front,
    discipline:row.discipline,subject:row.subject,sub:row.sub,
    answer:row.answer,rating:row.rating,note:row.note,
    created_at:row.created_at,timezone_offset_min:row.timezone_offset_min,
    site_version:row.site_version,base_version:row.base_version,
    audit_status:row.audit_status,srs_status:row.srs_status};
   const blob=new Blob([JSON.stringify(document,null,2)],{type:'application/json'});
   const meta={name:fileName(row),mimeType:'application/json',parents:[folder],
    description:'Resposta discursiva e autoavaliação do cartão '+row.card_id,
    appProperties:{bm_format:FORMAT,bm_attempt_id:row.id,bm_card_id:row.card_id}};
   const init=await fetch(UPLOAD+'?uploadType=resumable&fields=id,name,parents,appProperties',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json; charset=UTF-8',
     'X-Upload-Content-Type':'application/json','X-Upload-Content-Length':String(blob.size)},
    body:JSON.stringify(meta),cache:'no-store'});
   if(!init.ok)await responseJson(init,'Não foi possível iniciar envio ao Drive');
   const loc=init.headers.get('Location');if(!loc)throw Error('O Drive não confirmou a sessão de upload.');
   const dest=new URL(loc);
   if(dest.origin!=='https://www.googleapis.com'||!dest.pathname.startsWith('/upload/drive/v3/files'))
    throw Error('Destino da sessão de upload inesperado; envio interrompido.');
   const sent=await fetch(dest.href,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:blob,cache:'no-store'});
   remote=await responseJson(sent,'O Drive não confirmou o arquivo enviado');
  }
  if(!FILE_ID.test(remote.id))throw Error('ID de arquivo inválido recebido do Drive.');
  const check=await apiGet(API+'/'+encodeURIComponent(remote.id)+'?fields=id,name,parents,appProperties,trashed');
  if(check.id!==remote.id||check.trashed||(check.parents||[]).indexOf(folder)<0||
    check.appProperties?.bm_format!==FORMAT||check.appProperties?.bm_attempt_id!==row.id)
   throw Error('A conferência do arquivo salvo no Drive falhou.');
  await put({...row,sync_status:'synced',drive_file_id:check.id,synced_at:new Date().toISOString()});
  lastUploaded=check.id;
 }
 async function syncPending(){
  if(syncing){syncRequested=true;return}
  if(!token||expires<=Date.now()){connected=false;resolvedFolder='';say('Respostas preservadas no navegador. Conecte o Google Drive para sincronizar.',true);return}
  syncing=true;syncRequested=false;
  let completed=false;
  try{
   say('Verificando acesso à pasta oficial do Drive…');
   const folder=await resolveFolder();
   const rows=(await all()).filter(r=>r.sync_status!=='synced');
   if(!rows.length){say('Nenhuma tentativa pendente. Todas as respostas deste navegador já foram confirmadas no Drive.');completed=true;await history();return}
   let sent=0;
   for(const row of rows){
    say('Enviando '+(sent+1)+' de '+rows.length+' tentativas…');
    try{await uploadOne(folder,row);sent++}
    catch(e){say('Sincronização interrompida após '+sent+' arquivos: '+e.message+'. As tentativas locais foram preservadas.',true);return}
   }
   say('Drive confirmado: '+sent+' tentativa(s) sincronizada(s). O SRS oficial não foi alterado.');
   completed=true;await history();
  }catch(e){say('Falha na sincronização: '+e.message+' As tentativas locais foram preservadas.',true)}
  finally{syncing=false;const retry=syncRequested;syncRequested=false;if(completed&&retry)void syncPending()}
 }
 function mount(){
  modal=document.getElementById('bmCardPeekV050');if(!modal)return false;
  const controls=modal.querySelector('.bm163-preview-controls');
  if(!controls)return false;
  if(document.getElementById('bm195Discursive'))return true;
  controlButton=el('button','bm195-open','Responder discursivamente');controlButton.type='button';controlButton.setAttribute('aria-controls','bm195Discursive');controlButton.setAttribute('aria-expanded','false');controls.append(controlButton);
  editor=el('div','bm195-editor');editor.id='bm195Discursive';editor.hidden=true;
  editor.innerHTML=[
   '<h3>Resposta discursiva · <span data-bm195-card></span></h3>',
   '<p>Responda antes de revelar o verso. A tentativa original e sua classificação são preservadas sem substituir o cartão.</p>',
   '<label class="bm195-label">Sua resposta completa<textarea data-bm195-answer rows="7" placeholder="Explique com suas palavras; fórmulas, normas, exemplos e exceções quando necessários."></textarea></label>',
   '<label class="bm195-label">Observações (opcional)<textarea data-bm195-note rows="2" placeholder="Dificuldades, pegadinhas ou pontos para revisar."></textarea></label>',
   '<div class="bm195-label">Autoavaliação da tentativa escrita (não altera o SRS)</div>',
   '<div class="bm195-rates" role="group" aria-label="Autoavaliação">',
   '<button type="button" data-bm195-rate="Difícil" aria-pressed="false">Difícil</button>',
   '<button type="button" data-bm195-rate="Bom" aria-pressed="false">Bom</button>',
   '<button type="button" data-bm195-rate="Fácil" aria-pressed="false">Fácil</button>',
   '<button type="button" data-bm195-rate="Conhecimento preservado" aria-pressed="false">Conhecimento preservado</button>',
   '<button type="button" data-bm195-rate="Conhecimento adquirido" aria-pressed="false">Conhecimento adquirido</button></div>',
   '<div class="bm195-actions"><button type="button" data-bm195-save class="bm195-primary">Salvar tentativa escrita</button>',
   '<button type="button" data-bm195-reveal>Conferir verso original</button></div>',
   '<details class="bm195-drive"><summary>Google Drive · sincronização automática</summary>',
   '<p>Destino automático: RESPOSTAS_DISCURSIVAS. As respostas são salvas primeiro no navegador e copiadas para o Drive assim que a conta estiver autorizada. Nada é publicado no GitHub.</p>',
   '<div class="bm195-actions">',
   '<button type="button" data-bm195-connect disabled>Conectar Google Drive</button>',
   '<button type="button" data-bm195-sync>Sincronizar pendentes</button></div>',
   '<small>A conexão pode solicitar permissão ampla de arquivos do Drive para gravar na pasta existente; nunca armazena o token de acesso.</small></details>',
   '<div class="bm195-actions"><button type="button" data-bm195-export>Exportar todas as tentativas (.json)</button>',
   '<button type="button" data-bm195-history-toggle aria-expanded="true" aria-controls="bm195History">Ocultar histórico deste cartão</button></div>',
   '<p data-bm195-status role="status" aria-live="polite">Preparando armazenamento local…</p>',
   '<div id="bm195History" data-bm195-history></div>',
   '<small>Para agendar a revisão oficial, use a classificação SRS abaixo do verso revelado. Salvar a tentativa escrita não cria outro evento SRS.</small>'
  ].join('');
  controls.insertAdjacentElement('afterend',editor);
  area=editor.querySelector('[data-bm195-answer]');
  controlButton.addEventListener('click',()=>{
   setCard();
   editor.hidden=!editor.hidden;
   controlButton.textContent=editor.hidden?'Responder discursivamente':'Fechar resposta discursiva';controlButton.setAttribute('aria-expanded',String(!editor.hidden));
   if(!editor.hidden){editor.querySelector('[data-bm195-card]').textContent=cardId;area.focus();void history();}
  });
  area.addEventListener('input',()=>{try{localStorage.setItem(draftKey(),area.value)}catch{}});
  editor.querySelectorAll('[data-bm195-rate]').forEach(b=>b.addEventListener('click',()=>selectedRate(b.dataset.bm195Rate)));
  editor.querySelector('[data-bm195-save]').addEventListener('click',save);
  editor.querySelector('[data-bm195-reveal]').addEventListener('click',()=>modal.querySelector('.bm-v050-peek-reveal')?.click());
  editor.querySelector('[data-bm195-connect]').addEventListener('click',connect);
  editor.querySelector('[data-bm195-sync]').addEventListener('click',syncPending);
  editor.querySelector('[data-bm195-export]').addEventListener('click',exportJson);
  editor.querySelector('[data-bm195-history-toggle]').addEventListener('click',()=>{
   const target=editor.querySelector('[data-bm195-history]');target.hidden=!target.hidden;
   const toggle=editor.querySelector('[data-bm195-history-toggle]');
   toggle.textContent=target.hidden?'Mostrar histórico deste cartão':'Ocultar histórico deste cartão';
   toggle.setAttribute('aria-expanded',String(!target.hidden));
   if(!target.hidden)void history();else ++historyRequest;
  });
  observedTitle=modal.querySelector('#bmCardPeekTitleV050');
  const obs=new MutationObserver(setCard);
  if(observedTitle)obs.observe(observedTitle,{childList:true,characterData:true,subtree:true});
  obs.observe(modal,{attributes:true,attributeFilter:['hidden']});
  void openDb().then(()=>say('Armazenamento de respostas pronto. Conecte o Drive para criar cópias na pasta.')).catch(e=>say('Não foi possível habilitar o armazenamento: '+e.message,true));
  void readyGoogle().catch(e=>say('A conexão ao Drive está indisponível: '+e.message+'. Exportação local ainda disponível.',true));
  setCard();
  return true;
 }
 window.BM195Discursivas=Object.freeze({version:'V403',get modalReady(){return !!editor},get linkedFolder(){return !!configuredFolder()},exportar:exportJson,sincronizar:syncPending});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(!mount()){const m=new MutationObserver(()=>{if(mount())m.disconnect()});m.observe(document.body,{childList:true,subtree:true})}},{once:true});
 else if(!mount()){const m=new MutationObserver(()=>{if(mount())m.disconnect()});m.observe(document.body,{childList:true,subtree:true})}
})();
