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
// Explicit public releases; do not expose raw packets, URLs, or proposals.
const packets=[
 ['V334','petro25_c001_card1538_v334.json','BancoMestrePetro25IncrementV334'],
 ['V335','petro25_conversation_delta_v335.json','BancoMestrePetro25ConversationDeltaV335'],
 ['V336','petro25_editorial_v336.json','BancoMestreV333CompliantEditorialV336'],
 ['V337','petro26_delta_v337.json','BancoMestrePetro26UpdateV337'],
 ['V338','petro26_study_sync_v338.json','BancoMestrePetro26StudySyncV338'],
 ['V340','petro26_granulometry_delta_v340.json','BancoMestrePetro26GranulometryV340'],
 ['V343','petro27_sync_v343.json','BancoMestrePetro27SyncV343'],
 ['V345','petro28_sync_v345.json','BancoMestrePetro28V345'],
 ['V346','petro24_regularizacao_v346.json','BancoMestrePetro24RegularizacaoV346'],
 ['V347','petro20_29_delta_v347.json','BancoMestreRetroV347']
];
let packetsPromise;
async function publicPackets(){if(!packetsPromise)packetsPromise=Promise.all(packets.map(async([release,name,format])=>{const data=await json(name);if(data.format!==format)throw Error('Fonte '+release+' incompatível');return {release,data}})).catch(e=>{packetsPromise=null;throw e});return packetsPromise}
const cleanLayers=ls=>ls.map(({ord,titulo,texto})=>({ord,titulo,texto}));
async function publicEvolution(id){
 const resolver=await bridge(),initial=await base(id),bridged=resolver.has(id)?await resolver.get(id):null;
 let current=valid(initial?.layers)?cleanLayers(initial.layers):null,source=current?'V194':null;
 const history=[],supplements=[];
 const put=(release,ls)=>{if(!valid(ls))throw new LayerNotFound('11 módulos incompletos em '+release+' / '+id);const next=cleanLayers(ls);if(current&&JSON.stringify(current)!==JSON.stringify(next))history.push({version:source,layers:current});current=next;source=release};
 if(bridged)put('V276/V325/V327/V329',bridged.layers);
 const append=(release,add)=>{if(!add)return;if(!current){supplements.push({version:release,text:Object.entries(add).map(([n,v])=>'Módulo '+n+': '+v).join('\n')});return}const next=current.map(x=>({...x,texto:typeof add[x.ord]==='string'&&add[x.ord].trim()?x.texto+'\n\n['+release+'] '+add[x.ord]:x.texto}));put(release,next)};
 for(const {release,data:d} of await publicPackets()){
  if(release==='V334'){if(d.new_cards?.some(c=>c.id===id))put(release,d.new_layers);append(release,d.related_updates?.find(c=>c.id===id)?.layers_add)}
  else if(release==='V335'){const p=d.new_layers?.find(x=>x.id===id);if(p)put(release,p.layers);append(release,d.related_updates?.find(c=>c.id===id)?.layers_add)}
  else if(release==='V336'){const p=d.items?.[id];if(p){const text=[...(p.paragraphs||[]),p.note].filter(x=>typeof x==='string'&&x.trim()).join('\n\n');if(text)supplements.push({version:release,text})}}
  else if(['V337','V338','V340','V347'].includes(release)){if(d.profiles?.[id])put(release,d.profiles[id].layers);if(release==='V347')for(const item of d.notes?.[id]||[])if(typeof item.note==='string')supplements.push({version:release,text:item.note})}
  else if(release==='V343'){if(d.existing?.[id])put(release,d.existing[id].layers)}
  else if(release==='V345'){if(d.approved?.[id])put(release,d.approved[id].layers);else if(d.profiles?.[id]){const ls=d.profiles[id].layers;if(!valid(ls))throw new LayerNotFound('11 módulos incompletos V345');if(current)append(release,Object.fromEntries(ls.map(x=>[x.ord,x.texto])));else put(release,ls)}}
  else if(release==='V346'){if(d.profiles?.[id])put(release,d.profiles[id].layers);const u=d.existing_updates?.find(x=>x.id===id);if(u)append(release,{4:u.note,8:'Vínculos: '+(u.related_card_ids||[]).join(', ')})}
 }
 if(!current)throw new LayerNotFound('11 módulos não disponíveis na fonte integrada');
 return {...project(id,current),version:source,history,supplements,scope:'Conteúdo didático público por ID; versões anteriores preservadas'};
}
export async function readProfileLayers(profile,id){
 const card=profileCatalog(profile).find(x=>x.id===id);if(!card)throw new LayerNotFound('Cartão fora do perfil');
 const own=profile.privateData.cards.find(x=>x.id===id);
 if(own){if(!valid(own.layers))throw new LayerNotFound('11 módulos privados indisponíveis');return project(id,own.layers)}
 // A matching ID in a private-only catalog never permits a public fallback.
 if(profile.catalog!=='civil-public-v348'||!profile.publicCards.some(x=>x.id===id))throw new LayerNotFound('Módulos indisponíveis');
 return publicEvolution(id);
}
