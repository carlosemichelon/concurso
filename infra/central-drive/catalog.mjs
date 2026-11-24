import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {CATALOGS,createCatalogLoader} from '../../assets/multiaccount-catalog-v001.mjs';
// Only versioned public JSON files, from the checked-out repository. No user path or remote URL.
export function createServerCatalogLoader(){
 let cache=null;
 const fetcher=async path=>{const clean=path.split('?')[0];if(!/^assets\/[a-zA-Z0-9_.-]+\.json$/.test(clean))throw Error('Caminho de catálogo não autorizado');const source=await readFile(new URL('../../'+clean,import.meta.url),'utf8');return {ok:true,json:async()=>JSON.parse(source)}};
 async function load(){const ctx=vm.createContext({fetch:fetcher});vm.runInContext(await readFile(new URL('../../assets/bm-original-catalog-v348.js',import.meta.url),'utf8'),ctx);return createCatalogLoader(ctx.BMOriginalCatalog,fetcher)(CATALOGS['civil-public-v348'])}
 return async descriptor=>{
  if(descriptor===CATALOGS['private-only'])return {cards:[],catalog:'private-only'};
  if(descriptor!==CATALOGS['civil-public-v348'])throw Error('Catálogo não autorizado');
  if(!cache)cache=load().catch(e=>{cache=null;throw e});
  return structuredClone(await cache);
 };
}
