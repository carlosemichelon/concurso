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
   const filename='assets/layers_public_v194_'+String(index).padStart(3,'0')+'.json?v=194';
   const promise=fetch(filename,{cache:'force-cache'}).then(r=>{
    if(!r.ok)throw Error('Arquivo de explicações indisponível (HTTP '+r.status+').');return r.json();
   }).then(rows=>{
    if(!Array.isArray(rows))throw Error('Formato das explicações inválido.');
    const map=new Map();for(const x of rows){if(!/^CARD-\d{4}$/.test(x.id)||!Array.isArray(x.layers)||x.layers.length!==11||map.has(x.id))throw Error('Lote técnico incompleto: '+x.id);map.set(x.id,x)}return map;
   });
   cache.set(index,promise);promise.catch(()=>{if(cache.get(index)===promise)cache.delete(index)});
  }
  return cache.get(index);
 }
 function render(id,box){
  if(!eligible(id))return;
  const target=box.querySelector('.bm194-detail');if(!target)return;
  const idx=shardFor(id);if(idx<0)return;
  shard(idx).then(rows=>{
   if(!box.isConnected || currentId()!==id || !answer || answer.hidden || modal.hidden)return;
   const card=rows.get(id);target.replaceChildren();
   if(!card){target.append(el('p','Aprofundamento público não disponível para este cartão. A resposta original continua preservada.'));return}
   for(const layer of card.layers){
    const section=el('section',undefined,'bm194-layer');
    section.append(el('h4',String(layer.ord).padStart(2,'0')+' · '+layer.titulo));
    appendText(section,layer.texto);
    target.append(section);
   }
  }).catch(error=>{
   if(!box.isConnected||currentId()!==id)return;
   target.replaceChildren(el('p','Não foi possível carregar o texto integral: '+error.message));
  });
 }
 function sync(){
  if(!modal || !answer || modal.hidden || answer.hidden)return;
  const id=currentId();
  if(!/^CARD-\d{4}$/.test(id))return;
  const existing=answer.querySelector('details.bm194-public-layers');
  if(existing?.dataset.cardId===id)return;
  if(existing)existing.remove();
  if(RESERVED.has(id)){
   const p=el('p','Este cartão permanece reservado para homologação. A resposta original está preservada.','bm194-deferred');
   p.dataset.cardId=id;answer.append(p);return;
  }
  if(answer.querySelector('.bm194-deferred'))answer.querySelector('.bm194-deferred').remove();
  const box=el('details',undefined,'bm194-public-layers');box.dataset.cardId=id;box.open=true;
  box.append(el('summary','Aprofundamento integral · 11 camadas (sem Drive)'));
  box.append(el('p','Material didático evolutivo; pontos normativos e documentais ainda podem exigir cotejo.','bm194-note'));
  box.append(el('div','Carregando as 11 camadas…','bm194-detail'));
  answer.append(box);
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
  schedule();
 }
 window.BM194VersosPublicos=Object.freeze({
  source:'Arquivos públicos V194, sem autorização Google',
  get reservado(){return [...RESERVED]},
  get ativo(){return !!observer},
  abrirProximoCartao:()=>schedule()
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();