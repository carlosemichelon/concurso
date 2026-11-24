/* Private image adjustments, not original files. Three-way merge per legacy key.
 * The base is retained locally until the normal Drive write is confirmed.
 * A divergent edit to the same key is never silently overwritten. */
export const IMAGE_STATE_KIND='image-adjustments';
export const IMAGE_LINK_KEY='BM197_IMAGENS_TIPO_VINCULOS_V1';
export const IMAGE_INFO_KEY='BM228_DRIVE_IMAGE_INFO_V1';
const BASE='BM_PROFILE_IMAGE_BASE_V1',PENDING='BM_PROFILE_IMAGE_PENDING_V1';
const own=(o,k)=>Object.hasOwn(o,k);
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const clone=x=>JSON.parse(JSON.stringify(x));
const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const basicKey=k=>k===IMAGE_LINK_KEY||k===IMAGE_INFO_KEY||/^BM030_STROKES_DRIVE-IMG-[A-Za-z0-9_-]{1,160}$/.test(k);
const val=(o,k)=>own(o,k)?o[k]:null;
export function checkedImageState(payload,owner){
 if(!plain(payload)||payload.schema!=='BM-PORTAL-IMAGE-STATE/1'||payload.owner!==owner||!plain(payload.records)||Object.keys(payload.records).length>1502||JSON.stringify(payload).length>12000000)throw Error('Estado de imagens inválido');
 for(const [k,v] of Object.entries(payload.records)){if(!basicKey(k)||typeof v!=='string'||v.length>4000000)throw Error('Chave de imagem não autorizada');const x=JSON.parse(v);if(k.startsWith('BM030_STROKES_')?!Array.isArray(x):!plain(x))throw Error('Formato de ajuste inválido')}
 return clone(payload)
}
export function createImageValidator(images,cardIds){
 const ids=new Set(images.map(x=>x.id)),cards=new Set(cardIds),fields={title:160,area:120,subject:180,subsubject:180,detail:180,description:4000,note:2500};
 return (key,value)=>{
  if(!basicKey(key)||typeof value!=='string'||value.length>4000000)throw Error('Ajuste de imagem inválido');
  const data=JSON.parse(value);
  if(key===IMAGE_LINK_KEY){
   if(!plain(data))throw Error('Vínculos inválidos');
   for(const [id,v] of Object.entries(data))if(!id.startsWith('DRIVE-IMG-')||!ids.has(id.slice(10))||!plain(v)||!['cartao','conteudo'].includes(v.type)||!['','enunciado','figura','explicacao'].includes(v.subtype||'')||!Array.isArray(v.cardIds)||v.cardIds.length>40||v.cardIds.some(c=>!cards.has(c)))throw Error('Vínculo fora do perfil');
  }else if(key===IMAGE_INFO_KEY){
   if(!plain(data))throw Error('Metadados inválidos');
   for(const [id,v] of Object.entries(data))if(!ids.has(id)||!plain(v)||Object.entries(fields).some(([f,n])=>own(v,f)&&(typeof v[f]!=='string'||v[f].length>n)))throw Error('Metadado fora do perfil');
  }else{
   const id=key.slice('BM030_STROKES_DRIVE-IMG-'.length);
   if(!ids.has(id)||!Array.isArray(data)||data.length>2000||data.some(m=>!plain(m)||!['pen','highlighter','rect'].includes(m.type)||!(m.type==='rect'?Array.isArray(m.box)&&m.box.length===4&&m.box.every(Number.isFinite):Array.isArray(m.points)&&m.points.length>0&&m.points.length<20000&&m.points.every(p=>Array.isArray(p)&&p.length>=2&&p.length<=3&&p.every(Number.isFinite)))))throw Error('Marcações inválidas ou fora do perfil');
  }
  return value
 }
}
export function mergeImageState(base,local,remote){
 const merged={...remote},conflicts=[];
 for(const key of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])){
  const a=val(base,key),l=val(local,key),r=val(remote,key);
  if(l!==a&&r!==a&&l!==r){conflicts.push(key);continue}
  const next=l!==a?l:r;if(next===null)delete merged[key];else merged[key]=next
 }
 return {merged,conflicts}
}
export function createImageStateSync({owner,storage,session,images,cardIds,check=()=>{}}){
 const validate=createImageValidator(images,cardIds);
 const available=typeof session.readImageState==='function'&&typeof session.saveImageState==='function';
 let busy=false,loaded=false;
 const get=k=>{const v=JSON.parse(storage.getItem(k)||'{}');if(!plain(v))throw Error('Estado local inválido');for(const [key,value] of Object.entries(v))validate(key,value);return v};
 const capture=()=>{const out={};for(const key of storage.keys())if(basicKey(key)){const value=storage.getItem(key);validate(key,value);out[key]=value}return out};
 const apply=(before,after)=>{for(const key of new Set([...Object.keys(before),...Object.keys(after)])){if(val(before,key)===val(after,key))continue;if(own(after,key))storage.setItem(key,after[key]);else storage.removeItem(key)}};
 const equal=(a,b)=>{const keys=new Set([...Object.keys(a),...Object.keys(b)]);return [...keys].every(k=>val(a,k)===val(b,k))};
 async function reconcile(write){
  check();if(!available||busy)throw Error('Sincronização individual indisponível ou ocupada');busy=true;
  try{
   const remote=await session.readImageState();check();
   const current=remote?checkedImageState(remote.payload,owner).records:{};
   for(const [k,v] of Object.entries(current))validate(k,v);
   const base=get(BASE),local=capture(),pending=get(PENDING);
   // A confirmed remote copy of a pending request may be recovered after a lost response.
   const effectiveBase={...base};for(const [k,v] of Object.entries(pending))if(current[k]===v)effectiveBase[k]=v;
   const plan=mergeImageState(effectiveBase,local,current);
   if(plan.conflicts.length)throw Error('Edições concorrentes em '+plan.conflicts.length+' registro(s); cópia local preservada.');
   const changed=!equal(plan.merged,current);
   if(write&&changed){
    const payload=checkedImageState({schema:'BM-PORTAL-IMAGE-STATE/1',owner,records:plan.merged},owner);
    storage.setItem(PENDING,JSON.stringify(plan.merged));
    await session.saveImageState(remote?{id:remote.id,version:remote.version}:null,payload);check();
   }
   // Edits during upload are not overwritten. They remain pending relative to the confirmed base.
   const latest=capture(),confirmed=write?plan.merged:current;
   const later=mergeImageState(local,latest,plan.merged);
   if(later.conflicts.length)throw Error('Alteração local durante sincronização; reabra para conciliar.');
   apply(latest,later.merged);
   storage.setItem(BASE,JSON.stringify(confirmed));storage.removeItem(PENDING);
   loaded=true;return {changed:write&&changed,pending:!equal(later.merged,confirmed),records:Object.keys(confirmed).length}
  }finally{busy=false}
 }
 return Object.freeze({get loaded(){return loaded},get available(){return available},get busy(){return busy},hydrate:()=>reconcile(false),sync:()=>reconcile(true),write(key,value){check();validate(key,value);storage.setItem(key,value)}})
}
