import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {profileCatalog} from '../../assets/multiaccount-srs-v001.mjs';
export class LayerNotFound extends Error {}
const valid=layers=>Array.isArray(layers)&&layers.length===11&&layers.every((x,i)=>x?.ord===i+1&&typeof x.titulo==='string'&&x.titulo.trim()&&typeof x.texto==='string'&&x.texto.trim());
const project=(id,layers)=>({id,layers:layers.map(x=>({ord:x.ord,titulo:x.titulo,texto:x.texto}))});
const scripts=['v276_layers_bridge.js','v325_public_layers_bridge.js','v327_deferred_10_bridge.js','v329_minerals_bridge.js'];
const allowed=new Set(['v277_petro22_relacionados_layers.json','v276_petro22_public_layers.json','layers_public_v274_sync.json','layers_public_v327_deferred_10.json','layers_public_v329_0693.json',...Array.from({length:8},(_,i)=>'layers_public_v325_'+String(i).padStart(2,'0')+'.json')]);
const json=async name=>JSON.parse(await readFile(new URL('../../assets/'+name,import.meta.url),'utf8'));
let bridgePromise;
async function bridge(){if(!bridgePromise)bridgePromise=(async()=>{const window={},fetch=async path=>{const name=path.split('?')[0].replace(/^assets\//,'');if(!allowed.has(name))throw Error('Fonte não autorizada');return {ok:true,json:()=>json(name)}};const ctx=vm.createContext({window,fetch,Map,Set,Array,Object,JSON,String,Error});for(const name of scripts)vm.runInContext(await readFile(new URL('../../assets/'+name,import.meta.url),'utf8'),ctx);return window.BM276LayerData})().catch(e=>{bridgePromise=null;throw e});return bridgePromise}
const shardCache=new Map();
async function base(id){if(!/^CARD-\d{4}$/.test(id))return null;const n=Number(id.slice(5));if(n<1||n>1519)return null;const shard=Math.floor((n-1)/250);if(!shardCache.has(shard))shardCache.set(shard,json('layers_public_v194_'+String(shard).padStart(3,'0')+'.json').catch(e=>{shardCache.delete(shard);throw e}));const rows=await shardCache.get(shard);return rows.find(x=>x.id===id)||null}
export async function readProfileLayers(profile,id){
 const card=profileCatalog(profile).find(x=>x.id===id);if(!card)throw new LayerNotFound('Cartão fora do perfil');
 const own=profile.privateData.cards.find(x=>x.id===id);
 if(own){if(!valid(own.layers))throw new LayerNotFound('11 módulos privados indisponíveis');return project(id,own.layers)}
 // A matching ID in a private-only catalog never permits a public fallback.
 if(profile.catalog!=='civil-public-v348'||!profile.publicCards.some(x=>x.id===id))throw new LayerNotFound('Módulos indisponíveis');
 const resolver=await bridge(),record=resolver.has(id)?await resolver.get(id):await base(id);
 if(!valid(record?.layers))throw new LayerNotFound('11 módulos não disponíveis na fonte integrada');
 return {...project(id,record.layers),scope:'fontes V194/V276/V325/V327/V329; complementos posteriores ainda em integração'};
}
