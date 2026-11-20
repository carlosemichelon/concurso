/* V316 — progresso de leituras do Drive no cabeçalho; não lê nem armazena tokens. */
(function(){
'use strict';
if(window.BM316DriveProgress)return;
const fetchOriginal=window.fetch,live=new Map();let counter=0,mounted=false,bar=null,fill=null,label=null,hold=0;
const api=/^https:\/\/(?:www\.)?googleapis\.com\/(?:upload\/)?drive\/v3\/files(?:[/?]|$)/i;
function draw(){
 if(!bar)return;
 const n=live.size;
 if(n>0){
  clearTimeout(hold);
  bar.hidden=false;
  const kind=String(live.values().next().value||'arquivo').slice(0,62);
  label.textContent='Drive · carregando '+kind+' · '+n+' '+(n===1?'operação':'operações');
  fill.classList.add('bm316-moving');
 }else{
  label.textContent='Google Drive · consultas concluídas';
  fill.classList.remove('bm316-moving');
  clearTimeout(hold);
  hold=setTimeout(()=>{if(!live.size&&bar)bar.hidden=true},900);
 }
}
function begin(detail){
 const id=++counter;live.set(id,String(detail||'arquivo Drive'));mount();draw();return id;
}
function end(id){live.delete(id);draw()}
function track(promise,detail){
 const id=begin(detail);
 return Promise.resolve(promise).finally(()=>end(id));
}
function mount(){
 if(mounted)return;
 const header=document.querySelector('header .head')||document.querySelector('header');
 if(!header)return;
 mounted=true;
 const css=document.createElement('style');
 css.textContent='#bm316-drive-progress{width:100%;margin:3px 0 0;padding:0 1px;order:999;box-sizing:border-box}#bm316-drive-progress[hidden]{display:none!important}#bm316-drive-progress .bm316-caption{font:11px/1.4 system-ui,Arial;color:#3d6068;margin:0 0 3px}#bm316-drive-progress .bm316-track{height:3px;background:#dce9e7;border-radius:5px;overflow:hidden}#bm316-drive-progress .bm316-fill{height:100%;width:32%;background:#237a81;border-radius:5px}#bm316-drive-progress .bm316-moving{animation:bm316-loading 1.4s ease-in-out infinite alternate}@keyframes bm316-loading{from{transform:translateX(-100%)}to{transform:translateX(310%)}}@media(prefers-reduced-motion:reduce){#bm316-drive-progress .bm316-moving{animation:none;width:100%}}';
 document.head.append(css);
 bar=document.createElement('div');bar.id='bm316-drive-progress';bar.hidden=true;
 bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');
 label=document.createElement('p');label.className='bm316-caption';
 const rail=document.createElement('div');rail.className='bm316-track';
 fill=document.createElement('div');fill.className='bm316-fill';
 rail.append(fill);bar.append(label,rail);header.append(bar);draw();
}
if(typeof fetchOriginal==='function'){
 const wrapped=function(input,init){
  const url=typeof input==='string'?input:input?.url||'';
  if(!api.test(url))return fetchOriginal.apply(this,arguments);
  return track(fetchOriginal.apply(this,arguments),'leitura ou gravação no Drive');
 };
 wrapped.__bm316=true;
 window.fetch=wrapped;
}
window.BM316DriveProgress=Object.freeze({track,get pending(){return live.size}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();