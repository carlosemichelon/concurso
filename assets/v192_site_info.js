/* Banco Mestre V192 — indicadores de versão e origem auditáveis.
 * Dados públicos verificados em 16/11/2026; carregamento privado independente.
 * Nenhuma escrita em dados, SRS, grifos, PDFs, cartões ou no Drive. */
(function(){
'use strict';
if(window.BM192Header)return;
const defaults=Object.freeze({publicBase:1499,publicActive:1482,ijui:22,pdfBase:78,historicalImages:86,recoveredImages:93});
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
 const source=state.origin==='privada'?'pacote privado '+(state.privateVersion||'carregado'):'base pública V024 H14';
 if(version)version.textContent='V192 · '+source;
 const tagline=document.querySelector('header .head > div:first-child > .version');
 if(tagline)tagline.textContent='Biblioteca e consulta · prática, correções e avaliações SRS no ChatGPT';
 const footer=document.querySelector('main > footer');
 if(footer)footer.textContent='V192 · Catálogo e histórico preservados · arquivos privados somente após autorização Google · estudo dos cartões no ChatGPT.';
 const n=Number($('pdfStat')?.textContent?.replace(/\D/g,''));
 if(Number.isFinite(n)&&n>=defaults.pdfBase)state.pdfs=n;
 stat(0,state.pdfs,'PDFs na biblioteca',
  '78 registros no catálogo público inicial; documentos extras das pastas monitoradas só aparecem após autenticação e varredura do Google Drive.');
 const total=state.base+state.ijui;
 const label=state.origin==='privada'?'registros da base privada + Ijuí':'registros públicos + Ijuí';
 const detail=state.origin==='privada'?
  fmt(state.base)+' cartões no pacote privado ('+fmt(state.active)+' ativos), e '+fmt(state.ijui)+' operacionais de Ijuí. Conferência estrutural não equivale a auditoria normativa.':
  '1.499 IDs na base pública V024 H14 (1.482 ativos e 17 inativos), mais 22 cartões operacionais de Ijuí separados. Não são 1.521 cartões públicos ativos.';
 stat(1,total,label,detail+' Prática e avaliações SRS ocorrem no ChatGPT.');
 const imageLoaded=state.imagesLoaded&&state.images===86;
 stat(2,state.images,imageLoaded?'imagens históricas carregadas':'registros do Atlas integrado',
  imageLoaded?'Somente 86 imagens históricas foram carregadas nesta sessão; as 93 classificadas não estão disponíveis neste carregamento.':
  '179 registros catalogados: 86 históricos e 93 recuperados/classificados, dos quais 84 originais e 9 cópias de referência. Imagens privadas adicionais não entram nesta contagem.');
 const publicBanner=$('bm119PublicSource'),homeBanner=$('bm119HomeSource');
 if(state.origin==='privada'){
  const notice='Pacote privado '+(state.privateVersion||'do Drive')+' carregado · '+fmt(state.base)+
   ' cartões ('+fmt(state.active)+' ativos). Cartões de Ijuí separados; conteúdo não publicado no GitHub e SRS canônico não modificado.';
  if(publicBanner)publicBanner.textContent=notice;
  if(homeBanner)homeBanner.textContent=notice;
 }
}
function updateCards(base,ijui,items){
 if(!Number.isInteger(base)||!Number.isInteger(ijui)||base<=0||ijui<0||!Array.isArray(items)||items.length!==base+ijui)return false;
 const ids=items.map(c=>String(c?.id||''));
 if(ids.some(x=>!x)||new Set(ids).size!==ids.length)return false;
 const originals=items.filter(c=>!c.provisional),ops=items.filter(c=>c.provisional);
 if(originals.length!==base||ops.length!==ijui)return false;
 state.base=base;state.active=originals.filter(c=>c.active!==false).length;state.ijui=ijui;
 state.origin=base===defaults.publicBase?'publica':'privada';state.cardsLoaded=true;render();return true;
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
 state.privateVersion=String(e?.detail?.version||'').slice(0,48);
 try{if(typeof cards!=='undefined'&&Array.isArray(cards))
  updateCards(cards.filter(c=>!c.provisional).length,cards.filter(c=>c.provisional).length,cards);
 }catch(_){render()}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
const api=Object.freeze({updateCards,updateImages,render,get counts(){return {...state}}});
window.BM184Header=api;window.BM192Header=api;
})();