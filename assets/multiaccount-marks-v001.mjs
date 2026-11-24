/* Reuse V103/V104 exactly; a single active private master, not a log of deleted marks.
 * Drive version comparison is optimistic, not atomic CAS. A conflict preserves local marks.
 */
export const MARKS_KIND='marks-master';
const copyMarks=x=>JSON.parse(JSON.stringify(x));
export function checkedMarksEnvelope(payload,owner){
 if(!payload||payload.schema!=='BM-PORTAL-MARKS/1'||payload.owner!==owner||payload.master?.schema!=='BancoMestreGrifosMasterV104'||!Number.isSafeInteger(payload.master.revision)||payload.master.revision<0||JSON.stringify(payload).length>12000000)throw Error('Mestre individual incompatível');
 return copyMarks(payload)
}
export function createMarksSync({owner,storage,session,core,masterCore,history=[],check=()=>{},device}){
 if(!core||!masterCore||typeof session.readMarksMaster!=='function'||typeof session.saveMarksMaster!=='function')throw Error('Sincronização individual indisponível');
 let busy=false,loaded=false;
 const sources=history.filter(x=>x?.schema===core.SCHEMA||x?.schema===masterCore.SCHEMA);
 const snapshot=master=>({schema:core.SCHEMA,device:'MASTER-V104-0000',generated_at:master.updated_at,records:master.records});
 const apply=master=>{const plan=core.plan(storage,[snapshot(master)]);core.apply(storage,plan);return plan};
 async function read(){check();const current=await session.readMarksMaster();check();if(current){checkedMarksEnvelope(current.payload,owner);masterCore.validate(current.payload.master)}return current}
 return Object.freeze({
  get busy(){return busy},get loaded(){return loaded},
  async hydrate(){if(busy)throw Error('Sincronização em andamento');busy=true;try{const current=await read();const build=masterCore.merge(current?.payload.master||null,sources);check();const result=apply(build.master);loaded=true;return {additions:result.additions,conflicts:build.conflicts}}finally{busy=false}},
  async sync(){if(busy||!loaded)throw Error('Mestre individual ainda não carregado ou ocupado');busy=true;try{
   const current=await read();const own=core.capture(storage,device),build=masterCore.merge(current?.payload.master||null,[...sources,own]);
   let master=build.master;
   if(build.changed||!current){master=masterCore.final(master);const payload=checkedMarksEnvelope({schema:'BM-PORTAL-MARKS/1',owner,master},owner);await session.saveMarksMaster(current?{id:current.id,version:current.version}:null,payload);check()}
   const additions=apply(master);
   return {changed:build.changed||!current,additions:additions.additions,conflicts:master.conflicts.length,records:Object.keys(master.records).length}
  }finally{busy=false}}
 })
}
