// Replace only the data boundaries of the current calendar bundle in the isolated test host.
export function privateCalendar(source){
 const start='/* 86 assets/v313_srs_fila_completa.js */',end='/* 87 assets/v206_discursive.js */';
 const i=source.indexOf(start),j=source.indexOf(end,i);
 if(i<0||j<0)throw Error('Contrato calendário divergente');
 let s=source.slice(i,j);
 const replace=(a,b)=>{if(s.split(a).length!==2)throw Error('Contrato calendário divergente: '+a.slice(0,90));s=s.replace(a,b)};
 function block(a,b,v){const x=s.indexOf(a),y=s.indexOf(b,x+a.length);if(x<0||y<0||s.indexOf(a,x+a.length)>=0)throw Error('Contrato calendário divergente: '+a);s=s.slice(0,x)+v+'\n'+s.slice(y)}
 replace("const authNow=()=>window.BancoMestreMediaSyncV182?.token?.()||window.BM239DriveGlobal?.writeToken?.()||'';","const authNow=()=>window.BMVS41PrivateReviews?.sessionKey()||'';");
 // Do not reuse global browser imports/preferences from the administrator or previous profile.
 block("try{imported=JSON.parse(localStorage.getItem(importKey)","async function json(path)","// Local planning preferences and imports remain in this page only until profile storage is integrated.");
 block("async function readStudyAgenda(){","let privateRefresh=null;","// Historical study deltas require explicit per-profile migration; no administrator Drive query.");
 block("async function refreshPrivateOnce(){","driveAction.onclick=",`async function refreshPrivateOnce(){
 const auth=authNow();if(!auth){locked();return false;}locked('Conferindo registros privados do Drive…');driveBusy=true;driveAction.disabled=true;
 try{
  await window.BM316SrsJournal.refresh();
  if(auth!==authNow()||!window.BM316SrsJournal.loaded)throw Error('Histórico privado não confirmado');
  privateRecords=[];privateInfo={version:'SRS individual',updated:new Date().toISOString().slice(0,10),count:window.BM316SrsJournal.count};verifiedAuth=auth;root.dataset.bm411Ready='true';
  driveNote.textContent='Avaliações privadas confirmadas: '+window.BM316SrsJournal.count+'.';calculate();return true;
 }catch(e){locked('Fila não confirmada: '+e.message);return false}
 finally{driveBusy=false;driveAction.disabled=false}
 }`);
 replace("driveAction.onclick=async()=>{if(!authNow()){$('bm239-drive-action')?.click();return;}await open();};","driveAction.onclick=async()=>{await open();};");
 replace("document.addEventListener('bm-media-drive-authorized',()=>{if(root.classList.contains('active')||location.hash==='#calendario')void open();});","document.addEventListener('bm-vs41-session-ready',()=>{if(location.hash==='#calendario')void open();});");
 block("async function loadCatalog(){","function records(){",`async function loadCatalog(){
 const p=await window.BMVS41PrivateCards.read();
 cards=p.base.filter(c=>c&&c.active!==false&&c.id);map=new Map(cards.map(c=>[c.id,c]));history=[];loaded=true;
 }`);
 block(" // Importações locais são preservadas, mas não integram a fila oficial do Drive."," // Eventos formais confirmados no Drive", "");
 replace("try{localStorage.setItem(prefKey,JSON.stringify({minutes:minute,addNew}))}catch{}","// Preferências somente na aba, nesta etapa.");
 replace("imported=[...update.values()];localStorage.setItem(importKey,JSON.stringify(imported));","imported=[...update.values()];");
 replace("imported=[];localStorage.removeItem(importKey);","imported=[];");
 replace("if(!authNow()){locked();return;}\n if(loading)return;","if(!authNow()){try{await window.BMVS41PrivateCards.read()}catch{locked();return;}}\n if(loading)return;");
 return source.slice(0,i)+s+source.slice(j);
}
export function privateStudyQueue(source){
 const a="const token=()=>window.BM239DriveGlobal?.writeToken?.()||'';";
 if(source.split(a).length!==2)throw Error('Contrato fila divergente');
 return source.replace(a,"const token=()=>window.BMVS41PrivateReviews?.sessionKey()||'';").replace("$('bm239-drive-action')?.focus();","");
}
