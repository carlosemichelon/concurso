/* Adaptation of original V245 control, using its V240 three-way reconciler.
 * The current device's local stopwatch is never replaced by another device.
 */
export const STUDY_KIND='study-control';
export const STUDY_KEY='BM245_CONTROLE_ESTUDOS';
const BASE='BM_PROFILE_STUDY_BASE_V1';
const clone=x=>JSON.parse(JSON.stringify(x));
export const freshStudy=()=>({schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60});
export function checkedStudyEnvelope(x,owner){
 if(!x||x.schema!=='BM-PORTAL-STUDY/1'||x.owner!==owner||x.data?.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(x.data[k]))||JSON.stringify(x).length>10000000)throw Error('Controle individual inválido');
 return clone(x)
}
export function studySeed(records,storage){
 const rows=records.filter(x=>x?.format==='BancoMestreControleV238'&&x.data?.schema===1);
 if(rows.length>1)throw Error('Mais de um histórico de controle; conciliação necessária');
 if(rows.length&&storage.getItem(STUDY_KEY)===null)storage.setItem(STUDY_KEY,JSON.stringify(rows[0].data));
 const diaries=records.filter(x=>x?.format==='BancoMestreDiarioV184');
 if(diaries.length>1)throw Error('Mais de um diário histórico; conciliação necessária');
 if(diaries.length){for(const [key,field] of [['BM184_STUDY_SESSIONS_V1','sessions'],['BM184_PRACTICE_EVENTS_V1','reviews']]){const arr=diaries[0][field];if(!Array.isArray(arr))throw Error('Diário importado inválido');if(storage.getItem(key)===null)storage.setItem(key,JSON.stringify(arr))}}
}
export function createStudySync({owner,storage,session,core,history=[],check=()=>{}}){
 if(!core?.reconcile||!core?.validate)throw Error('Conciliador original indisponível');
 let busy=false,loaded=false;
 const validate=d=>{const error=core.validate(d);if(error)throw Error(error);return d};
 const raw=()=>storage.getItem(STUDY_KEY);
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const readLocal=()=>validate(raw()===null?freshStudy():JSON.parse(raw()));
 async function work(write){
  check();if(busy)throw Error('Controle em sincronização');busy=true;
  try{
   if(!loaded){for(const row of history.filter(x=>x?.format==='BancoMestreControleV238'))validate(row.data);studySeed(history,storage)}
   const remote=await session.readStudyControl();check();
   const current=remote?validate(checkedStudyEnvelope(remote.payload,owner).data):freshStudy(),before=raw(),local=readLocal();
   const baseRaw=storage.getItem(BASE),base=baseRaw===null?freshStudy():validate(JSON.parse(baseRaw));
   // No implicit reset of an established remote history. A previously confirmed missing remote is an incident.
   if(!remote&&baseRaw!==null&&!equal(base,freshStudy()))throw Error('Controle remoto ausente; restauração explícita necessária.');
   const result=equal(local,current)?{ok:true,merged:local}:core.reconcile(base,local,current);
   if(!result.ok)throw Error('Conflito de controle: '+result.conflicts.join('; '));
   const merged=validate(result.merged),changed=!equal(merged,current);
   if(write&&changed){await session.saveStudyControl(remote?{id:remote.id,version:remote.version}:null,checkedStudyEnvelope({schema:'BM-PORTAL-STUDY/1',owner,data:merged},owner));check()}
   const latest=readLocal(),after=raw()===before?merged:core.reconcile(local,latest,merged);
   if(raw()!==before&&!after.ok)throw Error('Controle local mudou durante sincronização; preservado para conciliação.');
   const next=raw()===before?merged:after.merged;
   if(!equal(next,latest))storage.setItem(STUDY_KEY,JSON.stringify(next));
   storage.setItem(BASE,JSON.stringify(write?merged:current));
   loaded=true;
   return {state:write&&changed?'uploaded':!equal(next,local)?'downloaded':'unchanged',pending:!equal(next,write?merged:current),message:'Controle individual conciliado; histórico preservado.'}
  }finally{busy=false}
 }
 return Object.freeze({get loaded(){return loaded},get busy(){return busy},hydrate:()=>work(false),sync:()=>work(true)})
}
