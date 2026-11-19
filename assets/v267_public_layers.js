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
  const idx=shardFor(id);if(idx<0)return;
  target.replaceChildren(el('p','Carregando as 11 seções do cartão '+id+'…','bm194-loading'));
  shard(idx).then(rows=>{
   // A leitura pode terminar depois que o estudante trocou de cartão.
   if(!box.isConnected||currentId()!==id)return;
   const card=rows.get(id);
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
  load:async id=>{const i=shardFor(id);return eligible(id)&&i>=0?(await shard(i)).get(id)||null:null;},
  abrirProximoCartao:()=>schedule()
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();