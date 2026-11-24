/* Login preflight. No legacy scripts are launched from this entry.
 * A separate release gate is required before mounting the original portal. */
export function createLoginGate({session,prepare,render}){
 let epoch=0,runtime=null,phase='locked';
 const show=(state,details={})=>{phase=state;render({state,...details})};
 function lock(){epoch++;runtime?.close();runtime=null;session.logout();show('locked')}
 async function login(){
  if(phase==='loading')return;
  lock();const n=epoch;show('loading');
  let prepared=null;
  try{
   await session.login();if(n!==epoch)return;
   prepared=await prepare(session);
   if(n!==epoch){prepared.close();return}
   const info=session.identity,profile=session.current;
   if(!info||!profile||prepared.subject!==info.sub||profile.subject!==info.sub)throw Error('Identidade e ambiente divergentes');
   const counts={cards:prepared.catalog().length,pdf:prepared.pdfCatalog().length,images:prepared.imageCatalog().length,srs:prepared.srs().records.length,discursive:prepared.discursive().length};
   runtime=prepared;show('verified',{email:info.email,catalog:profile.catalog,counts});
  }catch(e){prepared?.close();if(n===epoch){runtime?.close();runtime=null;session.logout();show('blocked',{message:String(e?.message||e)})}}
 }
 function check(){if(phase==='verified'&&session.phase!=='ready')lock()}
 return Object.freeze({login,lock,check,get phase(){return phase}})
}
