// Injected only by isolated authenticated test host; not enabled in production.
(function(){'use strict';
 let context='',monitor=null,checking=null,locked=false;
 const request=(path,headers={})=>fetch(path,{credentials:'same-origin',cache:'no-store',redirect:'error',headers});
 function invalidate(){
  if(locked)return;locked=true;
  if(monitor!==null)clearInterval(monitor);
  // Hide the old DOM and discard its JS realm with a fresh navigation.
  releasePdf();document.documentElement.style.visibility='hidden';window.BMPortalBridge.close();
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
 Object.defineProperty(window,'BMVS41Session',{value:Object.freeze({
  available:()=>!!context&&!locked,contextKey:async()=>{const value=await check();start();return value},check:async()=>{await check();start();return true},
  async logout(){
   const r=await fetch('/api/vs41/logout',{method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error'});
   if(!r.ok)throw Error('Saída não confirmada');
   invalidate();
  }
 })});
 Object.defineProperty(window,'BMVS41ChatDestination',{value:Object.freeze({async read(){
  const expected=await check();start();const r=await request('/api/vs41/chat-destination',{'X-BM-Context':expected});
  if(r.status===401||r.status===409){invalidate();throw Error('Sessão alterada')}
  if(!r.ok)throw Error('Banco de destino não verificado');
  const p=await r.json();
  if(locked||context!==expected||p.context!==expected||p.verified!==true||p.writeAuthorized!==false||p.descriptor?.schema!=='BM-CHAT-DESTINATION/1'||!/^[a-f0-9]{64}$/.test(p.descriptor.destination)||typeof p.descriptor.account!=='string')throw Error('Identificação inválida');
  return p.descriptor;
 }})});
 document.addEventListener('DOMContentLoaded',()=>{
 void window.BMVS41Session.check().catch(()=>{location.reload()});
 },{once:true});
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
  async record(input){return (await reviewRequest(input)).event},
  async schedule(){const expected=await check();start();const r=await request('/api/vs41/review-schedule',{'X-BM-Context':expected});if(!r.ok)throw Error('Agenda privada não confirmada (HTTP '+r.status+')');const p=await r.json();if(locked||context!==expected||p.context!==expected){invalidate();throw Error('Sessão alterada')}if(!Array.isArray(p.records)||typeof p.complete!=='boolean'||!Array.isArray(p.warnings))throw Error('Agenda inválida');return p;}
 })});
 let pdfUrl='',pdfSerial=0;
 function releasePdf(){pdfSerial++;if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl='';}
 document.addEventListener('click',e=>{if(e.target.closest?.('#pdfClose,#bmV056ClosePDF'))releasePdf()},true);
 window.addEventListener('pagehide',releasePdf);
 Object.defineProperty(window,'BMVS41PrivatePdfs',{value:Object.freeze({
 async preview(doc){
  if(!doc||!Array.isArray(doc.card_ids))throw Error('Vínculo PDF indisponível');
  const dialog=document.getElementById('pdfDialog'),frame=document.getElementById('pdfFrame'),status=document.getElementById('pdfLocalStatus');
  if(!dialog||!frame||!status)throw Error('Leitor indisponível');
  releasePdf();const serial=pdfSerial;
  const expected=await check();const blob=await window.BMVS41PrivateMedia.read(doc.card_ids[0]||'biblioteca',doc.id);
  if(serial!==pdfSerial||context!==expected||locked||blob.type!=='application/pdf')throw Error('Sessão ou arquivo alterado');
  pdfUrl=URL.createObjectURL(blob);document.getElementById('docTitle').textContent=doc.title;
  document.getElementById('pdfOriginal').removeAttribute('href');document.getElementById('pdfOriginal').hidden=true;
  document.getElementById('pdfChooseLocal').hidden=false;document.getElementById('pdfChooseLocal').onclick=()=>{if(serial!==pdfSerial||locked)return;void window.BMVS41PrivatePdfEditor.open(doc,blob).catch(e=>{status.textContent=e.message})};document.getElementById('pdfLocalTools').hidden=true;
  document.getElementById('pdfLocalMode').classList.remove('active');document.getElementById('pdfIntro').hidden=true;
  frame.classList.remove('localHidden');frame.src=pdfUrl;status.textContent='Leitura privada confirmada. Abra Editar PDF para usar as ferramentas.';
  dialog.addEventListener('close',()=>{if(!dialog.open)releasePdf()},{once:true});if(!dialog.open)dialog.showModal();return true;
 },async list(force=false){
  const expected=await check();start();const r=await request('/api/vs41/pdfs'+(force===true?'?refresh=1':''),{'X-BM-Context':expected});
  if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
  if(!r.ok)throw Error('Biblioteca privada indisponível');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  if(!Array.isArray(p.documents))throw Error('Biblioteca inválida');return p.documents;
 }})});
 async function annotationRequest(pdfId,page,input,image=false){
  if(!/^[A-Za-z0-9_-]{1,160}$/.test(pdfId)||!Number.isInteger(page)||page<1||page>100000)throw Error('Página ou PDF inválido');
  const expected=await check();start();
  const r=await fetch(image?'/api/vs41/image-ink/'+encodeURIComponent(pdfId):'/api/vs41/annotations/'+encodeURIComponent(pdfId)+'/'+page,{credentials:'same-origin',cache:'no-store',redirect:'error',method:input?'POST':'GET',headers:{'X-BM-Context':expected,...(input?{'Content-Type':'application/json'}:{})},...(input?{body:JSON.stringify(input)}:{})});
  if(r.status===401){invalidate();throw Error('Sessão encerrada')}
  if(r.status===409){await check();throw Error('Conflito de revisão. Recarregue os grifos antes de editar.')}
  if(!r.ok)throw Error('Grifos privados não confirmados (HTTP '+r.status+')');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  if(p.pdfId!==pdfId||p.page!==page||!/^[a-f0-9]{64}$/.test(p.hash)||!Array.isArray(p.marks))throw Error('Grifos inválidos');
  return {pdfId:p.pdfId,page:p.page,hash:p.hash,revision:p.revision,marks:p.marks};
 }
 Object.defineProperty(window,'BMVS41PrivateAnnotations',{value:Object.freeze({
  get:(pdfId,page)=>annotationRequest(pdfId,page),
  save:(pdfId,page,input)=>annotationRequest(pdfId,page,input)
 })});
 Object.defineProperty(window,'BMVS41PrivateImageInk',{value:Object.freeze({
  get:id=>annotationRequest(id,1,null,true),save:(id,input)=>annotationRequest(id,1,input,true)
 })});
 async function studyRequest(input){
  const expected=await check();start();
  const r=await fetch('/api/vs41/study',{credentials:'same-origin',cache:'no-store',redirect:'error',method:input?'POST':'GET',headers:{'X-BM-Context':expected,...(input?{'Content-Type':'application/json'}:{})},...(input?{body:JSON.stringify(input)}:{})});
  if(r.status===401){invalidate();throw Error('Sessão encerrada')}
  if(r.status===409){await check();throw Error('Conflito: consulte a versão privada antes de gravar')}
  if(!r.ok)throw Error('Controle privado não confirmado (HTTP '+r.status+')');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  return p;
 }
 Object.defineProperty(window,'BMVS41PrivateStudy',{value:Object.freeze({read:()=>studyRequest(),save:input=>studyRequest(input)})});
 async function gapRequest(input){
  const expected=await check();start();
  const r=await fetch('/api/vs41/gaps',{credentials:'same-origin',cache:'no-store',redirect:'error',method:input?'POST':'GET',headers:{'X-BM-Context':expected,...(input?{'Content-Type':'application/json'}:{})},...(input?{body:JSON.stringify(input)}:{})});
  if(r.status===401){invalidate();throw Error('Sessão encerrada')}
  if(r.status===409){await check();throw Error('Conflito de revisão das lacunas')}
  if(!r.ok)throw Error('Lacunas privadas não confirmadas (HTTP '+r.status+')');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  return p;
 }
 Object.defineProperty(window,'BMVS41PrivateGaps',{value:Object.freeze({read:()=>gapRequest(),save:input=>gapRequest(input)})});
 Object.defineProperty(window,'BMVS41PrivateFormulas',{value:Object.freeze({async read(){
  const expected=await check();start();const r=await request('/api/vs41/formulas',{'X-BM-Context':expected});
  if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
  if(!r.ok)throw Error('Guia privado indisponível');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  if(p.formula!==null&&(!p.formula||typeof p.formula.text!=='string'||!p.formula.text.trim()||p.formula.text.length>400000||typeof p.formula.version!=='string'))throw Error('Guia inválido');
  return p.formula;
 }})});
 Object.defineProperty(window,'BMVS41PrivateImages',{value:Object.freeze({async list(force=false){
  const expected=await check();start();const r=await request('/api/vs41/images'+(force===true?'?refresh=1':''),{'X-BM-Context':expected});
  if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
  if(!r.ok)throw Error('Galeria privada indisponível');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  if(!Array.isArray(p.images))throw Error('Galeria inválida');return p.images;
 }})});
 Object.defineProperty(window,'BMVS41PrivateMedia',{value:Object.freeze({
  async read(card,id,editorialStatic=false){
   const expected=await check();start();
   const r=await request('/api/vs41/'+(editorialStatic?'static-media':'media')+'/'+encodeURIComponent(card)+'/'+encodeURIComponent(id),{'X-BM-Context':expected});
   if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
   if(!r.ok){let detail='';try{const info=await r.json();if(typeof info.error==='string')detail=info.error.slice(0,240)}catch(_){}throw Error('Mídia privada indisponível (HTTP '+r.status+')'+(detail?' · '+detail:''))}if(r.headers.get('X-BM-Context')!==expected)throw Error('Sessão da mídia não confirmada');
   const blob=await r.blob();if(locked||context!==expected)throw Error('Sessão alterada');
   return blob;
  }
 })});
 // Resolve only the current authenticated card modules; no external data or cache.
 function layerMap(){
  const out=new Map();if(locked||!context)return out;
  let source;try{source=cards}catch{return out}
  if(!Array.isArray(source))return out;
  for(const row of source){const layers=row.consolidation?.profile?.modules;if(row.active&&Array.isArray(layers)&&layers.length===11&&layers.every((m,i)=>m.ord===i+1&&typeof m.titulo==='string'&&m.titulo.trim()&&typeof m.texto==='string'&&m.texto.trim()))out.set(row.id,{id:row.id,layers:structuredClone(layers)});}
  return out;
 }
 Object.defineProperty(window,'BMVS41PrivateLayers',{value:Object.freeze({map:layerMap,get:id=>layerMap().get(id)||null})});
 Object.defineProperty(window,'BMVS41PrivateCards',{value:Object.freeze({async read(){
  const expected=await check();start();
  const r=await request('/api/vs41/private-cards',{'X-BM-Context':expected});
  if(r.status===401||r.status===409){invalidate();throw Error('Sessão encerrada')}
  if(!r.ok)throw Error('Catálogo privado indisponível (HTTP '+r.status+')');
  const p=await r.json();if(locked||p.context!==expected){invalidate();throw Error('Sessão alterada')}
  if(p.schema!=='BM-VS41-PRIVATE-CARDS/1'||!Array.isArray(p.records)||p.records.length>20000)throw Error('Resposta privada inválida');
  const ids=new Set();for(const c of p.records){if(!/^(?:CARD-[0-9]{4,12}|PROP-IJUI-[0-9]{3}|TRT0[12]-C[0-9]{3})$/.test(c.id)||ids.has(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||typeof c.active!=='boolean')throw Error('Cartão privado inválido');ids.add(c.id)}
  return {base:p.records,ijui:[],meta:{card_files:[],image_files:[],groups:[],counts:{}},globals:{},guideData:{questoes:{},cobertura_leis:[],pendencias_pos_checkpoint:[]},generalGuide:{por_id:{}},auditF17:{historico_por_id:{},vinculos_indiretos:[],evolucoes_registradas:[]},answersF17:{por_id:{}},consolidation:{redirects:{}}};
 }})});
})();
