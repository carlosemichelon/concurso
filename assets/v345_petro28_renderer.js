/* V345: evolução aditiva, dois cartões autorizados, propostas separadas. */
(()=>{'use strict';
const old=window.BM276LayerData, oldFormat=window.BM198Format;
if(!old?.get||!oldFormat?.render)return;
const all=new Set(["CARD-0731","CARD-1380","CARD-1096","CARD-0728","CARD-0185","CARD-1087","CARD-1089","CARD-0732","CARD-1141","CARD-0570","CARD-1140","CARD-1546","CARD-1557","CARD-0567","CARD-1547","CARD-1399","CARD-1560","CARD-1561","CARD-1562","CARD-1563","CARD-1564","CARD-1565","CARD-1566","CARD-1567","CARD-1568"]);
const created=new Set(["CARD-1560","CARD-1561","CARD-1562","CARD-1563","CARD-1564","CARD-1565","CARD-1566","CARD-1567","CARD-1568"]);
let data;const load=()=>data?Promise.resolve(data):fetch('assets/petro28_sync_v345.json?v=345-1',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('V345 indisponível');return r.json()}).then(p=>{for(const x of Object.values({...p.profiles,...p.approved,...p.proposals}))if(x.layers.length!==11||x.layers.some((m,i)=>m.ord!==i+1||!m.texto))throw Error('V345 módulos inválidos');data=p;return p;});
const getOld=old.get.bind(old);
window.BM276LayerData=Object.freeze({...old,has:id=>all.has(id)||old.has?.(id)===true,async get(id){
 if(!all.has(id))return getOld(id);const d=await load();const p=d.approved[id]||d.profiles[id];
 if(created.has(id))return {id,layers:p.layers,updated:'2026-11-23'};
 const prior=await getOld(id);const oldLayers=prior?.layers;
 const ls=Array.isArray(oldLayers)&&oldLayers.length===11?oldLayers.map((m,i)=>({...m,texto:m.texto+'\n\nPetrobras 28: '+p.layers[i].texto})):p.layers;
 return {...prior,id,layers:ls,prior_layers:oldLayers||[],petro28:p,updated:'2026-11-23'};
}});
const el=(tag,cls,txt)=>{let e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;};
function mediaFor(box,p){
 for(const m of data.media||[]){
  if(!m.card_ids.includes(p.id))continue;
  const fig=el('figure','bm343-figure');fig.dataset.mediaId=m.media_id;
  if(m.kind==='DERIVADA_AUTORAL'){
   const img=el('img');img.src=m.src;img.alt=m.caption;img.loading='lazy';img.style.maxWidth='100%';fig.append(img);
   const status=el('small','','Carregando SVG…');const check=()=>{status.textContent=img.complete?(img.naturalWidth?'SVG carregado no leitor':'Falha de carregamento do SVG'):'Carregando SVG…';};
   img.addEventListener('load',check);img.addEventListener('error',check);fig.append(el('figcaption','',m.caption),status);check();
  }else{
   const a=el('a','','Abrir original no Drive — '+m.caption);a.href=m.url;a.target='_blank';a.rel='noopener noreferrer';fig.append(a);
   const d=el('details');d.append(el('summary','','Prévia autenticada do original'));
   d.addEventListener('toggle',()=>{if(!d.open||d.querySelector('iframe'))return;let f=el('iframe');f.src=m.url.replace(/\/view$/,'/preview');f.title=m.caption;f.referrerPolicy='no-referrer';f.loading='lazy';f.style.cssText='width:100%;height:420px;border:0';d.append(f,el('small','','Se a prévia não abrir, acesse o link com sua conta autorizada.'));});fig.append(d);
   fig.append(el('small','','Link privado; exibição depende de acesso ao Drive.'));
  }
  box.append(fig);
 }
}

function highlight(main,p){const raw=p.back;const spans=(p.marks||[]).map(m=>({...m,start:raw.indexOf(m.text)})).filter(m=>m.start>=0).sort((a,b)=>a.start-b.start);if(!spans.length)return;const frag=document.createDocumentFragment();let pos=0;const colors={core:'#FDE68A',agent:'#BBF7D0',condition:'#BAE6FD',exception:'#FECDD3'};for(const m of spans){if(m.start<pos)continue;frag.append(document.createTextNode(raw.slice(pos,m.start)));const mark=el('mark','bm339-highlight bm339-'+m.kind,m.text);mark.style.backgroundColor=colors[m.kind];mark.style.color='#26374b';mark.dataset.category=m.kind;frag.append(mark);pos=m.start+m.text.length;}frag.append(document.createTextNode(raw.slice(pos)));main.replaceChildren(frag);}
function supplement(p,full){
 const box=el('section','bm330-learning bm344-supplement');box.dataset.bm344Id=p.id;
 box.append(el('div','bm330-caption','PETROBRAS 28 · '+p.id),el('h3','',p.title));
 const main=el('p','bm330-para',p.back);main.style.whiteSpace='pre-line';highlight(main,p);box.append(main);
 box.append(el('p','bm330-note',p.source));
 if(p.related_card_ids.length){let row=el('div','bm343-proposal-controls');for(const target of p.related_card_ids){let b=el('button','',target);b.type='button';b.addEventListener('click',()=>window.BM317RelatedNavigator?.openReferenced?.(target));row.append(b)}box.append(row)}
 let details=el('details','bm330-evolution');details.append(el('summary','','11 módulos didáticos · Petrobras 28'));
 for(const m of p.layers){const sec=el('section','bm343-module');sec.append(el('h4','',m.ord+'. '+m.titulo),el('p','',m.texto));details.append(sec)}
 mediaFor(box,p);box.append(details);return box;
}
const observers=new WeakMap();
function render(host,record,id){
 observers.get(host)?.disconnect();observers.delete(host);
 host.querySelectorAll('[data-bm344-id]').forEach(x=>x.remove());
 if(!all.has(id))return oldFormat.render(host,record,id);
 if(created.has(id)){
   host.replaceChildren(el('p','','Carregando cartão…'));
   load().then(d=>{if(host.isConnected&&(!host.closest('#bmCardPeekV050')||window.BancoMestreVisualizarCardV050?.currentId===id))host.replaceChildren(supplement(d.approved[id],true));}).catch(e=>{if(host.isConnected)host.replaceChildren(el('p','',e.message));});
   return {modules:11,srsChanged:false,version:'V345'};
 }
 const result=oldFormat.render(host,record,id);
 load().then(d=>{
   if(!host.isConnected)return;
   const valid=()=>host.isConnected&&(!host.closest('#bmCardPeekV050')||window.BancoMestreVisualizarCardV050?.currentId===id);
   const append=()=>{if(valid()&&!host.querySelector('[data-bm344-id="'+id+'"]'))host.append(supplement(d.profiles[id],false));};
   append();
   const obs=new MutationObserver(()=>{if(!valid()){obs.disconnect();return;}append();});obs.observe(host,{childList:true});observers.set(host,obs);
 }).catch(e=>console.warn('V345',e));
 return result;
}
window.BM198Format=Object.freeze({...oldFormat,render,version:'V345-PETRO28'});
function mount(){let where=document.querySelector('header .head nav')||document.querySelector('header .head');if(!where||document.querySelector('[data-petro28-link]'))return;let a=el('a','bm343-launch','Petrobras 28 · estudo');a.href='petro28_v345.html';a.dataset.petro28Link='1';where.append(a);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.BM345Petro28=window.BM344Petro28=Object.freeze({load,ids:[...all],srs_changed:false,private_originals_published:false});
})();