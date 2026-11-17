/* Banco Mestre V2 — carregador isolado da resposta evolutiva pública V194.
 * Os sete lotes são consultados apenas quando o estudante abre os aprofundamentos.
 * Não registra tentativas, SRS, preferências, avaliações, grifos ou token do Drive.
 */
export const DISPLAY_ORDER=Object.freeze([8,4,5,6,9,10,1,2,3,7,11]);
export const REQUIRED_LAYERS=11;
export const DEFERRED_IDS=Object.freeze([
 'CARD-0138','CARD-0194','CARD-0248','CARD-0286','CARD-0350',
 'CARD-0424','CARD-0445','CARD-0502','CARD-0509','CARD-0510','CARD-0693'
]);
const DEFERRED=new Set(DEFERRED_IDS);
const CARD_PATTERN=/^CARD-(\d{4})$/;
const FILE_PATTERN=/^layers_public_v194_\d{3}\.json$/;
const ASSET_BASE=new URL('../../assets/',import.meta.url);
export function shardIndex(id) {
 const match=CARD_PATTERN.exec(String(id||''));
 if(!match)return -1;
 const n=Number(match[1]);
 return Number.isInteger(n)&&n>=1&&n<=1519?Math.floor((n-1)/250):-1;
}
export function isDeferred(id){return DEFERRED.has(id)}
export function validateManifest(meta) {
 const cfg=meta?.evolutive_public;
 if(cfg?.release!=='V194'||cfg.layers_per_card!==REQUIRED_LAYERS||
    cfg.eligible!==1490||!Array.isArray(cfg.layers_files)||cfg.layers_files.length!==7||
    cfg.layers_files.some((name,i)=>!FILE_PATTERN.test(name)||
      name!=='layers_public_v194_'+String(i).padStart(3,'0')+'.json'))
   throw Error('Manifesto dos 11 módulos V194 inválido ou incompleto');
 if(!Array.isArray(cfg.deferred_ids)||cfg.deferred_ids.length!==DEFERRED_IDS.length||
    cfg.deferred_ids.some(x=>!DEFERRED.has(x)))throw Error('Lista de cartões reservados divergente');
 return cfg;
}
export function validateRecord(record,index=null) {
 if(!CARD_PATTERN.test(record?.id||'')||
   (index!==null&&shardIndex(record.id)!==index)||
   !Array.isArray(record.layers)||record.layers.length!==REQUIRED_LAYERS)
   throw Error('Registro evolutivo V194 inválido: '+String(record?.id||'sem ID'));
 for(let i=0;i<REQUIRED_LAYERS;i++){
   const layer=record.layers[i];
   if(layer?.ord!==i+1||typeof layer.titulo!=='string'||!layer.titulo.trim()||
      typeof layer.texto!=='string'||!layer.texto.trim())
      throw Error('Módulo evolutivo vazio ou fora de ordem: '+record.id+' / '+(i+1));
 }
 return true;
}
export function presentationLayers(record){
 validateRecord(record);
 return DISPLAY_ORDER.map((sourceOrd,position)=>{
   const layer=record.layers[sourceOrd-1];
   return Object.freeze({
     displayOrd:position+1,sourceOrd,title:layer.titulo,text:layer.texto
   });
 });
}
export class PublicEvolutiveReader {
 constructor(meta,{fetcher=fetch,timeoutMs=30000}={}){
   this.config=validateManifest(meta);
   // Chrome exige o receiver Window na chamada de fetch; sem bind ocorre Illegal invocation.
   this.fetcher=fetcher.bind(globalThis);
   this.timeoutMs=timeoutMs;
   this.cache=new Map();
 }
 async shard(index){
   if(!Number.isInteger(index)||index<0||index>=7)throw Error('Lote de aprofundamento inválido');
   if(!this.cache.has(index)){
     const file=this.config.layers_files[index];
     const promise=(async()=>{
       const controller=new AbortController();
       const timeout=setTimeout(()=>controller.abort(),this.timeoutMs);
       let response;
       try{response=await this.fetcher(new URL(file,ASSET_BASE),{signal:controller.signal,cache:'default'});}
       finally{clearTimeout(timeout)}
       if(!response.ok)throw Error('Não foi possível carregar '+file+' (HTTP '+response.status+')');
       const records=await response.json();
       if(!Array.isArray(records))throw Error('O lote '+file+' não é uma lista');
       const map=new Map();
       for(const record of records){
         validateRecord(record,index);
         if(map.has(record.id))throw Error('ID evolutivo duplicado: '+record.id);
         if(DEFERRED.has(record.id))throw Error('Lote contém cartão reservado: '+record.id);
         map.set(record.id,record);
       }
       return map;
     })();
     this.cache.set(index,promise);
     promise.catch(()=>{if(this.cache.get(index)===promise)this.cache.delete(index)});
   }
   return this.cache.get(index);
 }
 async load(id){
   if(isDeferred(id))return Object.freeze({id,deferred:true,record:null});
   const index=shardIndex(id);
   if(index<0)throw Error('Identificador de cartão inválido: '+id);
   const map=await this.shard(index);
   const record=map.get(id)||null;
   return Object.freeze({id,deferred:false,record});
 }
 retry(id){
   const i=shardIndex(id);
   if(i>=0)this.cache.delete(i);
 }
}
