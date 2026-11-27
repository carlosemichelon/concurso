import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DISPLAY_ORDER,REQUIRED_LAYERS,DEFERRED_IDS,shardIndex,isDeferred,
  validateManifest,validateRecord,presentationLayers,PublicEvolutiveReader} from '../assets/evolutive.js';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const read=name=>JSON.parse(readFileSync(resolve(root,'assets',name),'utf8'));
const meta=read('meta_public_v194.json');
const config=validateManifest(meta);
assert.equal(config.eligible,1490);
assert.equal(config.layers_per_card,11);
assert.equal(config.layers_files.length,7);
assert.equal(DISPLAY_ORDER.join(','),'8,4,5,6,9,10,1,2,3,7,11');
assert.equal(new Set(DISPLAY_ORDER).size,REQUIRED_LAYERS);
assert.equal(new Set(DEFERRED_IDS).size,11);
assert.equal(shardIndex('CARD-0001'),0);
assert.equal(shardIndex('CARD-0250'),0);
assert.equal(shardIndex('CARD-0251'),1);
assert.equal(shardIndex('CARD-1501'),6);
assert.equal(shardIndex('CARD-1519'),6);
assert.equal(shardIndex('CARD-1520'),-1);
assert.equal(shardIndex('INVALID'),-1);
assert.equal(isDeferred('CARD-0138'),true);
assert.equal(isDeferred('CARD-1501'),false);

const seen=new Set();
let rows=0;
for(const [index,name] of config.layers_files.entries()){
  const records=read(name);
  assert.ok(Array.isArray(records),'lote deve ser lista');
  for(const record of records){
    validateRecord(record,index);
    assert.equal(seen.has(record.id),false,'ID duplicado em arquivos evolutivos');
    assert.equal(isDeferred(record.id),false,'ID reservado encontrado como homologado');
    seen.add(record.id);rows++;
    const digest=JSON.stringify(record);
    const presented=presentationLayers(record);
    assert.equal(presented.length,11);
    assert.deepEqual(presented.map(x=>x.sourceOrd),DISPLAY_ORDER);
    assert.deepEqual(presented.map(x=>x.displayOrd),[1,2,3,4,5,6,7,8,9,10,11]);
    assert.equal(presented[0].title,record.layers[7].titulo);
    assert.equal(presented[0].text,record.layers[7].texto);
    assert.equal(presented[10].text,record.layers[10].texto);
    assert.equal(JSON.stringify(record),digest,'visualização não pode alterar camada canônica');
  }
}
assert.equal(rows,1490,'1.490 registros evolutivos públicos íntegros');

const example=read(config.layers_files[6]).find(x=>x.id==='CARD-1501');
assert.ok(example);
const broken=structuredClone(example);
broken.layers[3].texto='';
assert.throws(()=>validateRecord(broken),/vazio ou fora de ordem/);
const badOrder=structuredClone(example);
badOrder.layers[0].ord=2;
assert.throws(()=>validateRecord(badOrder),/vazio ou fora de ordem/);
assert.throws(()=>validateManifest({...meta,evolutive_public:{...config,layers_files:['bad.json']}}),/Manifesto/);

let calls=0;
const loader=new PublicEvolutiveReader(meta,{fetcher:async url=>{
  calls++;
  const name=url.pathname.split('/').at(-1);
  return {ok:true,json:async()=>read(name)};
}});
const reserved=await loader.load('CARD-0138');
assert.equal(reserved.deferred,true);
assert.equal(reserved.record,null);
assert.equal(calls,0,'cartão reservado não deve buscar dados');
const found=await loader.load('CARD-1501');
assert.equal(found.record.id,'CARD-1501');
assert.equal(calls,1);
await loader.load('CARD-1502');
assert.equal(calls,1,'lote deve ser cacheado');
loader.retry('CARD-1501');
await loader.load('CARD-1501');
assert.equal(calls,2,'tentativa explícita recarrega o lote');

const ui=readFileSync(resolve(root,'v2/assets/evolutive-ui.js'),'utf8');
assert.ok(ui.includes("details.addEventListener('toggle'"),'camadas carregadas depois de abrir');
assert.ok(ui.includes("el('details','v2-evo-module'"),'11 módulos usam detalhes recolhidos');
assert.ok(!ui.includes('.innerHTML='),'não injetar HTML no leitor');
assert.ok(!ui.includes('localStorage.setItem'),'não regravar dados privados');
const app=readFileSync(resolve(root,'v2/assets/app.js'),'utf8');
assert.ok(app.includes('attachEvolutive(answer,card.id,state.snapshot.meta)'));
console.log('V2 evolutive reader OK:',{shards:config.layers_files.length,records:rows,modules:11,
  deferred:DEFERRED_IDS.length,firstSource:DISPLAY_ORDER[0],lastSource:DISPLAY_ORDER.at(-1),cacheValidated:true});
