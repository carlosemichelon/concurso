/* Experimento isolado, somente leitura. Não é integrado à produção. */
const API='https://www.googleapis.com/drive/v3/files/';
export const PROJECT='banco-mestre-drive-catalogo-teste-v1';
const FORMAT='BancoMestreCatalogSnapshotV362';
export function validateEnvelope(raw,owner){
 if(raw?.project!==PROJECT||raw?.owner!==owner)throw Error('Catálogo de outra conta ou projeto');
 const c=raw.catalog;
 if(c?.format!==FORMAT||!Array.isArray(c.base)||!Array.isArray(c.ijui)||!c.counts)throw Error('Formato do catálogo inválido');
 const all=[...c.base,...c.ijui],ids=new Set();
 for(const x of all){if(typeof x?.id!=='string'||!x.id||ids.has(x.id)||typeof x.front!=='string'||typeof x.back!=='string')throw Error('Identidade ou conteúdo inválido');ids.add(x.id)}
 if(c.base.length!==c.counts.canonical||c.ijui.length!==c.counts.ijui||c.base.filter(x=>x.active!==false).length!==c.counts.active)throw Error('Contagem divergente');
 return c;
}
export class DriveCatalogReader{
 #session=null;#cache=null;#pending=null;#generation=0;
 constructor({fetcher=globalThis.fetch}={}){this.fetcher=fetcher}
 connect({owner,token,fileId}){if(typeof owner!=='string'||!owner||typeof token!=='string'||!token||typeof fileId!=='string'||!/^[A-Za-z0-9_-]+$/.test(fileId))throw Error('Sessão inválida');this.disconnect();this.#session={owner,token,fileId}}
 disconnect(){this.#generation++;this.#session=null;this.#cache=null;this.#pending=null}
 async read(){if(!this.#session)throw Error('Login necessário');if(this.#pending)return this.#pending;const generation=this.#generation,session=this.#session;
 const job=this.#load(session,generation);this.#pending=job;try{return await job}finally{if(this.#pending===job)this.#pending=null}}
 async #load(s,g){
  const check=()=>{if(this.#generation!==g||this.#session!==s)throw Error('Sessão alterada')};
  const get=async suffix=>{check();const r=await this.fetcher(API+encodeURIComponent(s.fileId)+suffix,{method:'GET',cache:'no-store',headers:{Authorization:'Bearer '+s.token}});check();if(!r.ok)throw Error('Drive HTTP '+r.status);const value=await r.json();check();return value};
  const meta=async()=>{const m=await get('?fields=id,version,trashed,mimeType,appProperties');if(m.id!==s.fileId||m.trashed!==false||m.mimeType!=='application/json'||!/^\d+$/.test(String(m.version))||m.appProperties?.bmProject!==PROJECT||m.appProperties?.bmOwner!==s.owner||m.appProperties?.bmKind!=='catalog')throw Error('Metadados de catálogo incompatíveis');return String(m.version)};
  const version=await meta();
  if(this.#cache?.version===version)return structuredClone(this.#cache.catalog);
  const raw=await get('?alt=media'),catalog=validateEnvelope(raw,s.owner);
  if(await meta()!==version)throw Error('Catálogo mudou durante leitura; repita a consulta');
  check();this.#cache={version,catalog:structuredClone(catalog)};return structuredClone(catalog)
 }
}
