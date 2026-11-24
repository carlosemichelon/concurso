import {createHash} from 'node:crypto';
import {profileCatalog} from '../../assets/multiaccount-srs-v001.mjs';
import {profileImageAccess} from '../../assets/multiaccount-images-v001.mjs';
import {checkedImageState,createImageValidator} from '../../assets/multiaccount-image-state-v001.mjs';
export class ImageAnnotationRejected extends Error {}
export class ImageAnnotationUncertain extends Error {}
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(id);
const validVersion=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export const validImageAnnotationInput=x=>!!(x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===2&&validVersion(x.expected)&&Array.isArray(x.strokes)&&x.strokes.length<=2000);
const inRange=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
function validStroke(m){if(!m||!['pen','highlighter','rect'].includes(m.type)||!/^#[a-f0-9]{6}$/i.test(m.color||'')||!inRange(m.size,1,40))return false;
 return m.type==='rect'?Array.isArray(m.box)&&m.box.length===4&&m.box.every(x=>inRange(x,0,1)):Array.isArray(m.points)&&m.points.length>0&&m.points.length<20000&&m.points.every(p=>Array.isArray(p)&&p.length>=2&&p.length<=3&&p.every(x=>inRange(x,0,1)));
}
export function createImageAnnotationService(){
 const busy=new Set();
 return async({provider,profile,operation,guard=()=>true})=>{
  const subject=profile.subject;if(busy.has(subject))throw new ImageAnnotationRejected('Sincronização em andamento');busy.add(subject);
  try{
   if(!guard()||!validId(operation.id))throw new ImageAnnotationRejected('Imagem indisponível');
   const ids=profileCatalog(profile).map(c=>c.id),access=profileImageAccess({session:{},profile,cardIds:ids});access.add(await provider.readUploadedImages(subject));
   const images=access.catalog(),row=images.find(x=>x.imageId===operation.id);if(!row)throw new ImageAnnotationRejected('Imagem fora do perfil');
   const key='BM030_STROKES_DRIVE-IMG-'+row.id,remote=await provider.readImageState(subject),records=remote?checkedImageState(remote.payload,subject).records:{};
   const previous=records[key]??null,version=hash(previous),strokes=previous===null?[]:JSON.parse(previous);
   if(operation.kind==='read')return {version,strokes};
   const input=operation.input;if(operation.kind!=='save'||!validImageAnnotationInput(input)||!input.strokes.every(validStroke))throw new ImageAnnotationRejected('Marcações inválidas');
   const next=JSON.stringify(input.strokes);
   try{createImageValidator(images,ids)(key,next)}catch(e){throw new ImageAnnotationRejected(e.message)}
   // Retry after a lost receipt is safe if exact content is already present.
   if(next===previous)return {version,strokes:input.strokes};
   if(input.expected!==version)throw new ImageAnnotationRejected('Marcações alteradas em outro dispositivo. Edição local preservada; concilie antes de gravar.');
   if(!guard())throw new ImageAnnotationRejected('Sessão encerrada');
   const payload=checkedImageState({schema:'BM-PORTAL-IMAGE-STATE/1',owner:subject,records:{...records,[key]:next}},subject);
   try{await provider.saveImageState(subject,remote?{id:remote.id,version:remote.version}:null,payload);
    const confirmed=await provider.readImageState(subject);if(!confirmed||checkedImageState(confirmed.payload,subject).records[key]!==next)throw Error('Recibo divergente');
    return {version:hash(next),strokes:input.strokes};
   }catch{throw new ImageAnnotationUncertain('Gravação não confirmada. Repita a mesma sincronização; marcações locais preservadas.')}
  }finally{busy.delete(subject)}
 };
}
