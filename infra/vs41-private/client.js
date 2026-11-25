// Injected only by isolated authenticated test host; not enabled in production.
(function(){'use strict';
 let context='',monitor=null,checking=null,locked=false;
 const request=(path,headers={})=>fetch(path,{credentials:'same-origin',cache:'no-store',redirect:'error',headers});
 function invalidate(){
  if(locked)return;locked=true;
  if(monitor!==null)clearInterval(monitor);
  // Hide the old DOM and discard its JS realm with a fresh navigation.
  document.documentElement.style.visibility='hidden';location.reload();
 }
 async function check(){
  if(locked)throw Error('Sessão encerrada');
  if(checking)return checking;
  checking=(async()=>{
   try{const r=await request('/api/vs41/session');if(!r.ok)throw Error('Sessão encerrada');
    const p=await r.json();if(!/^[a-f0-9]{32}$/.test(p.context)||context&&context!==p.context)throw Error('Sessão alterada');
    const first=!context;context=p.context;if(first)document.dispatchEvent(new CustomEvent('bm-vs41-session-ready'));return context;
   }catch(e){if(context)invalidate();throw e}
  })();
  try{return await checking}finally{checking=null}
 }
 const checkVisible=()=>{if(context&&!document.hidden&&!locked)void check().catch(()=>{})};
 function start(){if(monitor!==null)return;monitor=setInterval(checkVisible,5000);
  document.addEventListener('visibilitychange',checkVisible);window.addEventListener('focus',checkVisible);
  window.addEventListener('pagehide',()=>{if(context)document.documentElement.style.visibility='hidden'});
  window.addEventListener('pageshow',e=>{if(e.persisted&&context)void check().then(()=>{if(!locked)document.documentElement.style.visibility=''}).catch(()=>{})});
 }
 async function reviewRequest(input){
  const expected=await check();start();
  const r=await fetch('/api/vs41/reviews',{credentials:'same-origin',cache:'no-store',redirect:'error',method:input?'POST':'GET',headers:{'X-BM-Context':expected,...(input?{'Content-Type':'application/json'}:{})},...(input?{body:JSON.stringify(input)}:{})});
  if(r.status===401){invalidate();throw Error('Sessão encerrada')}
  if(r.status===409){await check();throw Error('Conflito na avaliação')}
  if(!r.ok){const e=Error('Avaliação privada não confirmada (HTTP '+r.status+')');e.definite=r.status===400;throw e}
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  return p;
 }
 Object.defineProperty(window,'BMVS41PrivateReviews',{value:Object.freeze({
  available:()=>!!context&&!locked,
  sessionKey:()=>!locked?context:'',
  async read(){const p=await reviewRequest();if(!Array.isArray(p.events))throw Error('Histórico inválido');return p.events},
  async record(input){return (await reviewRequest(input)).event}
 })});
 Object.defineProperty(window,'BMVS41PrivatePdfs',{value:Object.freeze({async list(){
  const expected=await check();start();const r=await request('/api/vs41/pdfs',{'X-BM-Context':expected});
  if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
  if(!r.ok)throw Error('Biblioteca privada indisponível');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  if(!Array.isArray(p.documents))throw Error('Biblioteca inválida');return p.documents;
 }})});
 Object.defineProperty(window,'BMVS41PrivateMedia',{value:Object.freeze({
  async read(card,id){
   const expected=await check();start();
   const r=await request('/api/vs41/media/'+encodeURIComponent(card)+'/'+encodeURIComponent(id),{'X-BM-Context':expected});
   if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
   if(!r.ok||r.headers.get('X-BM-Context')!==expected)throw Error('Mídia privada indisponível');
   const blob=await r.blob();if(locked||context!==expected)throw Error('Sessão alterada');
   return blob;
  }
 })});
 Object.defineProperty(window,'BMVS41PrivateCards',{value:Object.freeze({async read(){
  const expected=await check();start();
  const r=await request('/api/vs41/private-cards',{'X-BM-Context':expected});
  if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
  if(!r.ok)throw Error('Catálogo privado indisponível (HTTP '+r.status+')');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  if(p.schema!=='BM-VS41-PRIVATE-CARDS/1'||!Array.isArray(p.records)||p.records.length>20000)throw Error('Resposta privada inválida');
  const ids=new Set();for(const c of p.records){if(!/^CARD-[0-9]{4,12}$/.test(c.id)||ids.has(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||typeof c.active!=='boolean')throw Error('Cartão privado inválido');ids.add(c.id)}
  return {base:p.records,ijui:[],meta:{card_files:[],image_files:[],groups:[],counts:{}},globals:{},guideData:{questoes:{},cobertura_leis:[],pendencias_pos_checkpoint:[]},generalGuide:{por_id:{}},auditF17:{historico_por_id:{},vinculos_indiretos:[],evolucoes_registradas:[]},answersF17:{por_id:{}},consolidation:{redirects:{}}};
 }})});
})();
