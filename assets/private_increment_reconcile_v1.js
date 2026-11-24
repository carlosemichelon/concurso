/* Candidate: reconcile private study increments without mutating canonical cards or formal SRS. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BMPrivateIncrementV1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const idOK=id=>typeof id==='string'&&/^CARD-\d{4,}$/.test(id);
 const front=s=>String(s||'').normalize('NFC').replace(/\s+/g,' ').trim();
 const iso=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s};
 const originDate=o=>{const m=String(o||'').match(/^AGENDA-PETRO(\d+)-[A-Z0-9_-]+-(\d{4})(\d{2})(\d{2})$/);return m?{session:Number(m[1]),date:m[2]+'-'+m[3]+'-'+m[4]}:null};
 const days=(a,b)=>(Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000;
 const eventKey=e=>[e.id,e.origin,e.due].join('|');
 function reconcile(payload,entry,catalog){
  const map=new Map();
  for(const c of catalog){if(!c?.id||map.has(c.id))throw Error('Catálogo canônico contém ID ausente ou duplicado.');map.set(c.id,c)}
  const classify=(id,question)=>{
   if(!idOK(id))return 'ID_INVALIDO';
   const c=map.get(id);
   if(!c)return 'ID_AUSENTE';
   if(c.active===false||c.provisional)return 'INATIVO_OU_PROVISORIO';
   if(!front(question)||front(c.front)!==front(question))return 'CONFLITO_DE_IDENTIDADE';
   return 'CORRESPONDENCIA_EXATA';
  };
  const items=(payload.items||[]).map(x=>{
   if(x.type==='Proposta — estudo provisório')return {key:x.key,status:'PROPOSTA_PENDENTE'};
   const id=String(x.key||'').replace(/^BM-PRIVADO:/,'');
   return {key:x.key,id,status:classify(id,x.front),missing:Array.isArray(x.missing)?x.missing.length:0};
  });
  const candidates=[],blocked=[],seen=new Set();
  for(const a of payload.agenda||[]){
   const id=a.historical_id;
   const identity=a.key==='BM-PRIVADO:'+id?classify(id,a.front):'CHAVE_INCONSISTENTE';
   if(identity!=='CORRESPONDENCIA_EXATA'){blocked.push({id,key:a.key,reason:identity});continue}
   for(const source of a.sources||[]){
    const o=originDate(source.origin);
    if(!o){continue} // historical projection is not a new question event
    const interval=iso(o.date)&&iso(source.date)?days(o.date,source.date):NaN;
    if(o.session!==entry.session||![8,16].includes(interval)){blocked.push({id,reason:'ORIGEM_OU_INTERVALO_NAO_VALIDADO',origin:source.origin});continue}
    const e={id,origin:source.origin,due:source.date,eventDate:o.date,intervalDays:interval,kind:'agendamento_por_questao',source:'Drive privado — agendamento por questão',rating:''};
    const k=eventKey(e);if(seen.has(k))continue;seen.add(k);candidates.push(e);
   }
  }
  // Approval must be stored in the authorized manifest, never inferred from correspondence.
  const approvedKeys=new Set((entry.approvedAgenda||[]).map(eventKey));
  const approved=candidates.filter(e=>approvedKeys.has(eventKey(e)));
  const unknownApprovals=[...approvedKeys].filter(k=>!seen.has(k));
  if(unknownApprovals.length)throw Error('Aprovação de agenda sem evento correspondente; incremento bloqueado.');
  return {items,candidates,approved,blocked,counts:{exact:items.filter(x=>x.status==='CORRESPONDENCIA_EXATA').length,conflicts:items.filter(x=>!['CORRESPONDENCIA_EXATA','PROPOSTA_PENDENTE'].includes(x.status)).length,proposals:items.filter(x=>x.status==='PROPOSTA_PENDENTE').length,missingMedia:items.filter(x=>x.missing>0).length,agendaCandidates:candidates.length,agendaApproved:approved.length,agendaBlocked:blocked.length}};
 }
 function mergePlanning(existing,approved){
  const all=new Map(existing.map(x=>[x.id,x]));
  for(const e of approved){
   const prior=all.get(e.id);
   // Never postpone an earlier deadline or override a dated formal review.
   if(prior&&(prior.lastReview||prior.kind==='revisao_formal'||prior.due<=e.due))continue;
   all.set(e.id,{...e});
  }
  return [...all.values()];
 }
 let state=null;
 const currentToken=()=>typeof window==='undefined'?'':(window.BancoMestreMediaSyncV182?.token?.()||window.BM239DriveGlobal?.writeToken?.()||'');
 function notify(){if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('bm-private-increment-changed'))}
 function clear(){if(state){state=null;notify()}}
 function checked(auth){if(!auth||auth!==currentToken())throw Error('Conta Drive alterada durante a conciliação.')}
 function stage(payload,entry,catalog,auth){
  checked(auth);const plan=reconcile(payload,entry,catalog);checked(auth);
  const plans=state?.auth===auth?new Map(state.plans):new Map();
  plans.set(entry.session,{plan,version:entry.version});
  state={auth,plans,last:entry.session};notify();return plan;
 }
 // Load approved sessions one at a time; retain only validated plans, never raw private HTML.
 async function stageBatch(entries,catalog,auth,loadOne,isCurrent=()=>true){
  checked(auth);const plans=new Map(),failed=[];
  for(const entry of entries){
   checked(auth);if(!isCurrent())return null;
   if(!Array.isArray(entry.approvedAgenda)||!entry.approvedAgenda.length)continue;
   try{
    const payload=await loadOne(entry);checked(auth);if(!isCurrent())return null;
    const plan=reconcile(payload,entry,catalog);plans.set(entry.session,{plan,version:entry.version});
   }catch(e){checked(auth);if(!isCurrent())return null;failed.push(entry.session)}
  }
  checked(auth);if(!isCurrent())return null;
  state={auth,plans,last:[...plans.keys()].at(-1)};notify();
  return {loaded:plans.size,failed,events:approvedAgenda().length};
 }
 function current(){if(state&&state.auth!==currentToken())clear();return state}
 function get(){const s=current();return s?.plans.get(s.last)?.plan||null}
 function approvedAgenda(){
  const all=new Map();for(const x of current()?.plans.values()||[])for(const e of x.plan.approved)all.set(eventKey(e),e);
  return [...all.values()];
 }
 if(typeof window!=='undefined'){window.addEventListener('pagehide',clear);window.setInterval(()=>{if(state&&state.auth!==currentToken())clear()},1000)}
 return Object.freeze({reconcile,mergePlanning,stage,stageBatch,get,clear,approvedAgenda});
});
