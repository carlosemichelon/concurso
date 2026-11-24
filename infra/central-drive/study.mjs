import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {freshStudy,checkedStudyEnvelope} from '../../assets/multiaccount-study-v001.mjs';
export class StudyRejected extends Error {}
export class StudyUncertain extends Error {}
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
let corePromise;
async function core(){if(!corePromise)corePromise=(async()=>{const window={};vm.runInContext(await readFile(new URL('../../assets/v245_reconcile.js',import.meta.url),'utf8'),vm.createContext({window}));return window.BM240Reconcile})().catch(e=>{corePromise=null;throw e});return corePromise}
export const validStudyInput=x=>!!(x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===3&&typeof x.expected==='string'&&/^[a-f0-9]{64}$/.test(x.expected)&&x.base?.schema===1&&x.data?.schema===1);
export function createStudyService(){
 const busy=new Set();
 return async({provider,profile,operation,guard=()=>true})=>{
 const subject=profile.subject;if(busy.has(subject))throw new StudyRejected('Controle em sincronização');busy.add(subject);
 try{
  const reconciler=await core();
  function validate(data){try{const d=checkedStudyEnvelope({schema:'BM-PORTAL-STUDY/1',owner:subject,data},subject).data;const error=reconciler.validate(d);if(error)throw Error(error);return d}catch(e){throw new StudyRejected(e.message)}}
  if(!guard())throw new StudyRejected('Sessão encerrada');
  const remote=await provider.readStudyControl(subject);
  const seeds=(profile.privateData.study||[]).filter(x=>x?.format==='BancoMestreControleV238');
  if(seeds.length>1)throw new StudyRejected('Mais de um histórico de controle; conciliação necessária');
  const current=validate(remote?checkedStudyEnvelope(remote.payload,subject).data:seeds[0]?.data||freshStudy());
  // Hash includes the full content: no untrusted baseline can masquerade as current.
  const version=hash(current);
  if(operation.kind==='read')return {version,data:current};
  const input=operation.input;if(operation.kind!=='sync'||!validStudyInput(input))throw new StudyRejected('Controle inválido');
  const local=validate(input.data),baseline=validate(input.base);
  if(hash(baseline)!==input.expected)throw new StudyRejected('Base de conciliação inválida');
  // A stale client must re-read and reconcile explicitly; no overwrite.
  if(hash(local)===version)return {version,data:current,changed:false};
  if(input.expected!==version)throw new StudyRejected('Controle alterado em outro dispositivo. Exporte o backup local e concilie antes de sincronizar.');
  const plan=reconciler.reconcile(current,local,current);if(!plan.ok)throw new StudyRejected('Conflitos impeditivos: '+plan.conflicts.join('; '));
  const data=validate(plan.merged);
  if(!guard())throw new StudyRejected('Sessão encerrada');
  try{
   await provider.saveStudyControl(subject,remote?{id:remote.id,version:remote.version}:null,checkedStudyEnvelope({schema:'BM-PORTAL-STUDY/1',owner:subject,data},subject));
   const confirmed=await provider.readStudyControl(subject);if(!confirmed||hash(checkedStudyEnvelope(confirmed.payload,subject).data)!==hash(data))throw Error('Recibo divergente');
   return {version:hash(data),data,changed:true};
  }catch{throw new StudyUncertain('Gravação não confirmada. Preserve o backup e repita a sincronização.')}
 }finally{busy.delete(subject)}
 };
}
