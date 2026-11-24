/* V368 — single reader-scoped observer and lazy supplement packages.
   Existing historical packages are unchanged. No private data or SRS writes. */
(()=>{'use strict';
if(window.BM368Supplements)return;
const specs=[{"version":"353","url":"assets/petro10_11_complementos_v353.json?v=353-1","key":"cards","schema":"BM353_DIDACTIC_SUPPLEMENTS","ids":["CARD-1415","CARD-1331","CARD-1332","CARD-1334","CARD-1336","CARD-1500","CARD-1324","CARD-1501","CARD-1507","CARD-1504"],"mediaIds":[]},{"version":"354","url":"assets/petro12_13_incremento_v354.json?v=354-1","key":"supplements","schema":"BM354_MEDIA_PUBLIC_INDEX","ids":["CARD-1506","CARD-1504","CARD-1507","CARD-1517","CARD-1510","CARD-1305","CARD-1511"],"mediaIds":[]},{"version":"355","url":"assets/petro12_13_complementos_v355.json?v=355-1","key":"cards","schema":"BM355_DIDACTIC_SUPPLEMENTS","ids":["CARD-1505","CARD-1504","CARD-1509","CARD-1500"],"mediaIds":[]},{"version":"366","url":"assets/petro15_16_incremento_v366.json?v=366-1","key":"cards","schema":"BM366_DIDACTIC_SUPPLEMENTS","ids":["CARD-1311","CARD-1444","CARD-1587","CARD-1578","CARD-1034","CARD-1116","CARD-1304","CARD-1553","CARD-1595","CARD-1202","CARD-0744","CARD-1052","CARD-1413","CARD-1054","CARD-0758","CARD-1314","CARD-0600","CARD-1136","CARD-1388","CARD-1124","CARD-1057","CARD-1062","CARD-1370","CARD-0211","CARD-1526","CARD-1527","CARD-1528","CARD-0527","CARD-1536","CARD-0999","CARD-1525","CARD-0605","CARD-0679","CARD-0603","CARD-1049","CARD-0333","CARD-1523","CARD-1520","CARD-1522","CARD-1529","CARD-0432","CARD-1020","CARD-0123","CARD-0919","CARD-0082"],"mediaIds":["CARD-1334","CARD-1335","CARD-1336","CARD-1415","CARD-1500","CARD-1503","CARD-1398","CARD-1382","CARD-1506","CARD-1504","CARD-1416","CARD-1509","CARD-1518","CARD-1517","CARD-1370","CARD-1057","CARD-1124","CARD-1595","CARD-1062","CARD-1530","CARD-1527"]}];
const cache=new Map(),failed=new Map();
const el=(tag,t)=>{const x=document.createElement(tag);if(t!==undefined)x.textContent=t;return x};
const byId=new Map();
for(const spec of specs)for(const id of spec.ids){if(!byId.has(id))byId.set(id,[]);byId.get(id).push(spec);}
function load(version){
 const spec=specs.find(s=>s.version===version);if(!spec)return Promise.reject(Error('Pacote desconhecido'));
 if(cache.has(version))return cache.get(version);
 const p=fetch(spec.url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Complementos indisponíveis: HTTP '+r.status);return r.json()}).then(d=>{
  if(d.schema!==spec.schema||!d[spec.key]||!spec.ids.every(id=>Array.isArray(d[spec.key][id])))throw Error('Manifesto incompatível');
  failed.delete(version);return d;
 }).catch(e=>{cache.delete(version);failed.set(version,e);throw e});
 cache.set(version,p);return p;
}
function visible(host){
 return !!host&&host.isConnected&&!host.closest('[hidden]')&&(!host.matches('details')||host.open)&&host.getClientRects().length>0;
}
function active(host,id){
 return visible(host)&&(host.matches('.bm-v050-peek-answer')?window.BancoMestreVisualizarCardV050?.currentId:window.BM317RelatedNavigator?.selectedId)===id;
}
const inflight=new WeakMap();
function render(host,id,spec,data){
 if(!active(host,id))return;
 const attr='data-bm'+spec.version+'-card',selector=':scope > details['+attr+']';
 const prior=host.querySelector(selector);
 if(prior?.getAttribute(attr)===id)return;
 if(prior)prior.remove();
 const items=data[spec.key][id];if(!items)return;
 const box=el('details');box.setAttribute(attr,id);box.style.cssText='display:block;margin:14px 0;padding:12px;border:1px solid #d7e2e1;border-radius:8px;background:#fff;white-space:normal';
 box.append(el('summary','Complementos de estudo — questões relacionadas (referências históricas)'));
 let built=false;
 const build=()=>{if(!box.open||built)return;built=true;
  for(const item of items){const a=el('article');a.style.cssText='margin:14px 0;border-top:1px solid #e5e7eb;padding-top:10px';a.append(el('h4',item.title),el('p',item.explanation));
   for(const [label,key] of [['Aplicação','example'],['Atenção','caution'],['Macete','mnemonic'],['Referência histórica','reference']]){const p=el('p');p.append(el('strong',label+': '),document.createTextNode(item[key]));a.append(p)}
   a.append(el('p','Relacionados: '+item.related_card_ids.join(', ')));box.append(a);
  }
 };
 box.addEventListener('toggle',build);host.append(box);
}
function attach(host,id){
 if(!active(host,id))return;
 for(const spec of specs){const attr='data-bm'+spec.version+'-card',prior=host.querySelector(':scope > details['+attr+']');if(prior&&prior.getAttribute(attr)!==id)prior.remove();}
 for(const retry of host.querySelectorAll(':scope > [data-bm368-retry]'))if(retry.dataset.cardId!==id)retry.remove();
 const wanted=byId.get(id);if(!wanted)return;
 function retryButton(spec,error){if(host.querySelector('[data-bm368-retry="'+spec.version+'"]'))return;const retry=el('button','Tentar carregar complementos');retry.type='button';retry.dataset.bm368Retry=spec.version;retry.dataset.cardId=id;retry.title=error.message;retry.onclick=()=>{retry.remove();failed.delete(spec.version);schedule()};host.append(retry);}
 let state=inflight.get(host);if(!state||state.id!==id){state={id,pending:new Set()};inflight.set(host,state);}
 for(const spec of wanted){
  if(host.querySelector(':scope > details[data-bm'+spec.version+'-card]')||state.pending.has(spec.version))continue;
  if(failed.has(spec.version)){retryButton(spec,failed.get(spec.version));continue;}
  state.pending.add(spec.version);
  load(spec.version).then(d=>{if(inflight.get(host)===state)render(host,id,spec,d)}).catch(e=>{if(active(host,id))retryButton(spec,e)}).finally(()=>state.pending.delete(spec.version));
 }
}
let pending=false,observer=null;
function refresh(){pending=false;attach(document.querySelector('#bmCardPeekV050 .bm-v050-peek-answer'),window.BancoMestreVisualizarCardV050?.currentId);attach(document.querySelector('#bmCardPeekV050 .bm317-preview-answer'),window.BM317RelatedNavigator?.selectedId);}
function schedule(){if(!pending){pending=true;requestAnimationFrame(refresh)}}
function bind(){const modal=document.getElementById('bmCardPeekV050');if(!modal)return false;
 observer=new MutationObserver(schedule);observer.observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open','class']});modal.addEventListener('toggle',schedule,true);schedule();return true;
}
function init(){if(bind())return;const watch=new MutationObserver(()=>{if(bind())watch.disconnect()});watch.observe(document.body,{subtree:true,childList:true});}
window.BM368Supplements=Object.freeze({load,hasMedia:id=>specs.some(s=>s.version==='366'&&s.mediaIds.includes(id)),srsChanged:false,originalsChanged:false});
for(const spec of specs)window['BM'+spec.version+'Supplements']=Object.freeze({srsChanged:false,originalsChanged:false});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
