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
  if(shard(id)<0){body.replaceChildren(el('p','bm195-pending','Este registro operacional não possui 11 seções publicadas. Consulte o conteúdo original abaixo.'));return}
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