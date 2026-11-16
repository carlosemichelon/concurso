/* Banco Mestre V184 — cabeçalho fiel ao catálogo e às bibliotecas carregadas.
 * Estatísticas estáticas verificadas em 16/11/2026 e correção após carregamento.
 * Não modifica dados canônicos, grifos, histórico nem avaliações SRS. */
(function(){
'use strict';
if(window.BM184Header)return;
const defaults=Object.freeze({publicCards:1499,publicActive:1482,ijui:22,staticPdfs:78,historicalImages:86,recoveredImages:93});
const nf=n=>Number(n||0).toLocaleString('pt-BR');
const $=id=>document.getElementById(id);
const state={...defaults,listedPdfs:78,loadedCards:false,loadedImages:false,imageCount:179};
let observer=null;
function setStat(index,value,label,title){
 const stats=document.querySelector('header .bm-v046-header-stats')||document.querySelector('header .stats')||document.querySelector('main > .stats');
 const el=stats?.querySelectorAll(':scope > .stat')?.[index];
 if(!el)return false;
 const number=el.querySelector('b'),caption=el.querySelector('span');
 if(number&&number.textContent!==nf(value))number.textContent=nf(value);
 if(caption&&caption.textContent!==label)caption.textContent=label;
 if(title)el.title=title;
 return true;
}
function render(){
 const version=document.querySelector('header .brand > .version');
 if(version&&version.textContent!=='V184 · base V024 H14 pública')version.textContent='V184 · base V024 H14 pública';
 const footer=document.querySelector('main > footer');
 if(footer&&/^V\d{3}\s*[·-]/.test(footer.textContent))footer.textContent=footer.textContent.replace(/^V\d{3}/,'V184');
 const pdf=Number($('pdfStat')?.textContent.replace(/\D/g,''));
 if(Number.isFinite(pdf)&&pdf>=defaults.staticPdfs)state.listedPdfs=pdf;
 setStat(0,state.listedPdfs,'PDFs disponíveis na biblioteca',
  '78 PDFs no catálogo principal; outros aparecem após a sincronização autorizada com Google Drive. Não inclui os arquivos que ainda não foram encontrados.');
 const cardTotal=state.publicCards+state.ijui;
 setStat(1,cardTotal,'registros: base pública + Ijuí',
  nf(state.publicCards)+' IDs públicos ('+nf(defaults.publicActive)+' ativos na V024 H14) + '+
  nf(state.ijui)+' cartões operacionais de Ijuí separados. Não significa '+nf(cardTotal)+' cartões públicos ativos.');
 const imageLabel=state.loadedImages&&state.imageCount===86
  ? 'imagens carregadas · recuperação pendente'
  : 'imagens no Atlas integrado';
 setStat(2,state.imageCount,imageLabel,
  state.loadedImages&&state.imageCount===86
   ? '86 históricas carregadas; 93 recuperadas não disponíveis nesta sessão. Nenhuma imagem foi apagada.'
   : nf(state.imageCount)+' registros: 86 históricas + 93 recuperadas/cópias de referência. Não somar novamente as coleções privadas do Drive nem as 270 referências históricas.');
}
function updateCards(base,ijui,records){
 if(!Number.isInteger(base)||!Number.isInteger(ijui)||base<0||ijui<0)return;
 if(!Array.isArray(records)||records.length!==base+ijui)return;
 const ids=records.map(c=>String(c?.id||''));
 if(ids.some(id=>!id)||new Set(ids).size!==ids.length)return;
 state.publicCards=base;state.ijui=ijui;state.loadedCards=true;render();
}
function updateImages(items){
 if(!Array.isArray(items)||![86,179].includes(items.length))return;
 const ids=items.map(x=>String(x?.no||''));
 if(ids.some(id=>!id)||new Set(ids).size!==ids.length)return;
 state.loadedImages=true;state.imageCount=items.length;render();
}
function init(){
 render();
 const pdf=$('pdfStat');
 if(pdf&&typeof MutationObserver!=='undefined'){
  observer=new MutationObserver(()=>render());
  observer.observe(pdf,{childList:true,characterData:true,subtree:true});
 }
 // Os módulos antigos podem terminar de carregar em qualquer ordem.
 try{if(typeof cards!=='undefined'&&Array.isArray(cards)&&cards.length){
  const op=cards.filter(c=>/^PROP-IJUI-/.test(String(c?.id||''))).length;
  updateCards(cards.length-op,op,cards);
 }}catch(_){}
 try{if(typeof imgs!=='undefined'&&Array.isArray(imgs)&&imgs.length)updateImages(imgs)}catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM184Header=Object.freeze({updateCards,updateImages,render,get counts(){return {...state}}});
})();
