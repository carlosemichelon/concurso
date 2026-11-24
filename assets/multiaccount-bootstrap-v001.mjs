/* Bootstrap por identidade; adaptador a integrar ao portal original.
 * O provedor deve consultar somente o Drive autenticado, sem defaults legados.
 * Nenhum estado pessoal fica disponível antes de concluir a carga.
 */
import {verifiedSubject,privateDriveFile} from './multiaccount-storage-v001.mjs';
const PROJECT='bm-portal-multi-v1';
export const PROFILE_KINDS=Object.freeze(['cards','srs','questions','pdf','images','annotations','study']);
const validId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const validCatalog=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(x);
const clone=x=>JSON.parse(JSON.stringify(x));
export function checkedProfile(profile,subject,catalogs){
 if(!profile||profile.schema!=='BM-PORTAL-PROFILE/1'||profile.project!==PROJECT||profile.owner!==subject||!validCatalog(profile.catalog)||!Object.hasOwn(catalogs,profile.catalog)||!profile.collections||typeof profile.collections!=='object'||Array.isArray(profile.collections))throw Error('Perfil não confirmado para a conta autenticada.');
 const values=PROFILE_KINDS.map(k=>profile.collections[k]);if(values.some(x=>!validId(x))||new Set(values).size!==values.length||Object.keys(profile.collections).length!==PROFILE_KINDS.length)throw Error('Perfil incompleto ou destinos duplicados.');
 return clone(profile);
}
export function checkedCollection(payload,kind,subject){
 if(!payload||payload.schema!=='BM-PORTAL-COLLECTION/1'||payload.project!==PROJECT||payload.owner!==subject||payload.kind!==kind||!Array.isArray(payload.records))throw Error('Coleção inválida ou de outra conta: '+kind);
 return clone(payload.records);
}
export function createBootstrap({catalogs,provider}){
 let sequence=0,active=null,phase='locked';
 const lock=()=>{sequence++;active=null;phase='locked'};
 const check=(epoch)=>{if(epoch!==sequence)throw Error('Sessão alterada durante a carga.')};
 return Object.freeze({get phase(){return phase},get current(){return active?clone(active):null},lock,
 async open(info){
  lock();const epoch=sequence,subject=verifiedSubject(info);phase='loading';
  try{
   const root=privateDriveFile(await provider.findRoot(subject),subject,'root',{project:PROJECT});check(epoch);
   const descriptor=await provider.findProfile(root.id,subject);check(epoch);
   const file=privateDriveFile(descriptor.file,subject,'profile',{parent:root.id,project:PROJECT});
   const profile=checkedProfile(descriptor.payload,subject,catalogs);
   const catalog=await provider.loadCatalog(catalogs[profile.catalog]);check(epoch);
   if(!catalog||!Array.isArray(catalog.cards))throw Error('Catálogo didático indisponível.');
   const entries=await Promise.all(PROFILE_KINDS.map(async kind=>{
     const result=await provider.readCollection(profile.collections[kind],subject,kind);check(epoch);
     const f=privateDriveFile(result.file,subject,kind,{parent:root.id,project:PROJECT});
     if(f.id!==profile.collections[kind])throw Error('Destino de coleção divergente: '+kind);
     return [kind,checkedCollection(result.payload,kind,subject)];
   }));check(epoch);
   active={subject,catalog:profile.catalog,rootId:root.id,profileId:file.id,publicCards:clone(catalog.cards),privateData:Object.fromEntries(entries)};
   phase='ready';return clone(active);
  }catch(error){if(epoch===sequence){active=null;phase='blocked'}throw error}
 }});
}
