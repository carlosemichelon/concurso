// Adapt only the IO boundaries of the original journal; the reader UI and row calculation stay intact.
export function privateJournal(source){
 let s=source;const replace=(a,b)=>{if(s.split(a).length!==2)throw Error('Contrato journal divergente: '+a.slice(0,80));s=s.replace(a,b)};
 function block(start,end,next){const i=s.indexOf(start),j=s.indexOf(end,i+start.length);if(i<0||j<0||s.indexOf(start,i+start.length)>=0)throw Error('Contrato journal divergente');s=s.slice(0,i)+next+'\n'+s.slice(j)}
 replace("const token=()=>window.BM239DriveGlobal?.writeToken?.()||'';","const token=()=>window.BMVS41PrivateReviews?.available()||false;");
 block('async function getFile(id,auth){','async function refresh(){',`async function load(){
 const gathered=await window.BMVS41PrivateReviews.read(),seen=new Set();
 for(const e of gathered){if(!checkEvent(e)||seen.has(e.event_id))throw Error('Evento privado inválido');seen.add(e.event_id)}
 events=gathered;loaded=true;lastError='';
 document.dispatchEvent(new CustomEvent('bm316-srs-journal-updated',{detail:{records:rows().length,events:events.length}}));
 return {events:events.length,cards:rows().length};
 }`);
 block('async function record(id,rating){','function build(){',`async function record(id,rating){
 if(working||uncertain)throw Error('Há outra operação em andamento ou pendente de conferência.');
 if(!validId(id)||!validRating(rating)||rating==='Errei')throw Error('ID ou avaliação inválidos');
 if(!token())throw Error('Sessão privada indisponível');
 working=true;updateStatus();let sent=false;
 try{
  if(!loaded)await refresh();
  const event_id=crypto.randomUUID();sent=true;
  const confirmed=await window.BMVS41PrivateReviews.record({id,rating,event_id});
  if(!checkEvent(confirmed)||confirmed.id!==id||confirmed.rating!==rating||confirmed.event_id!==event_id)throw Error('Confirmação divergente');
  events.push(confirmed);loaded=true;lastError='';
  document.dispatchEvent(new CustomEvent('bm316-srs-journal-updated',{detail:{id,rating,due:confirmed.due}}));return confirmed;
 }catch(e){if(sent&&!e.definite){uncertain=true;uncertainIds.add(id)}lastError=e.message;throw e}
 finally{working=false;updateStatus()}
 }`);
 replace("document.addEventListener('bm-media-drive-authorized',()=>{void refresh().catch(()=>{});updateStatus()});","document.addEventListener('bm-vs41-session-ready',updateStatus);");
 replace("const main=$('bm239-drive-action');\n  if(!main){const el=$('bm316-srs-state');if(el)el.textContent='Conector do Drive indisponível nesta página.';return}\n  main.click();","const el=$('bm316-srs-state');if(el)el.textContent='Entre na sessão privada para classificar.';");
 return s;
}
