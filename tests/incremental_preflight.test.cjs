'use strict';
// Teste de integração somente leitura. Nenhum cartão fictício é gravado.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {publicPreflight,blobHash,check}=require('../tools/catalog_snapshot.cjs');
const root=path.resolve(__dirname,'..');
const manifestBytes=fs.readFileSync(path.join(root,'assets/version.json'));
const m=JSON.parse(manifestBytes);
const bytes=fs.readFileSync(path.join(root,m.catalog.path));
const snapshot=JSON.parse(bytes);
const contract={...m.catalog,portal_version:m.version,manifest_git_blob:blobHash(manifestBytes)};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const ids=new Set([...snapshot.base,...snapshot.ijui].map(c=>c.id));
const existing=snapshot.base.find(c=>c.active!==false&&/^CARD-\d{4,}$/.test(c.id));
assert.ok(existing,'Catálogo sem cartão ativo');
let n=999900;while(ids.has('CARD-'+n))n++;
const id='CARD-'+n;
const mk=(id,related=[])=>({id,discipline:'TESTE',subject:'TESTE',sub:'TESTE',front:'Pergunta fictícia',back:'Resposta fictícia',expl:'Explicação fictícia',reference:'Fonte fictícia',active:true,related_card_ids:related});
const profile=c=>({id:c.id,front:c.front,back:c.back,status:'CANONICO_ATIVO',related_card_ids:c.related_card_ids,layers:Array.from({length:11},(_,i)=>({ord:i+1,titulo:'Teste '+i,texto:'Texto fictício '+i}))});
function packet(){
 const c=mk(id,[existing.id]);
 return {format:'BancoMestrePublicIncrement1',catalog_git_blob:contract.git_blob,portal_version:contract.portal_version,manifest_git_blob:contract.manifest_git_blob,new_cards:[c],updated_cards:[],profiles:{[id]:profile(c)},relations:{[id]:[existing.id],[existing.id]:[id]},expected_card_hashes:{},private_content_exported:false};
}
test('snapshot real e contrato vigentes reproduzíveis',async()=>{const r=await check();assert.equal(r.ok,true);assert.equal(r.canonical,snapshot.base.length)});
test('preflight no catálogo real é somente leitura e determinístico',()=>{
 const p=packet(),before=digest(snapshot),r=publicPreflight(p,snapshot,contract);
 assert.deepEqual(r,publicPreflight(p,snapshot,contract));
 assert.equal(r.packet_sha256,digest(p));assert.equal(r.new_cards,1);
 assert.equal(r.private_sync,'not_verified');assert.equal(r.publication,'not_performed');
 assert.equal(digest(snapshot),before);assert.deepEqual(fs.readFileSync(path.join(root,m.catalog.path)),bytes);
 assert.deepEqual(fs.readFileSync(path.join(root,'assets/version.json')),manifestBytes);
});
for(const [name,mutate] of [
 ['ID existente',p=>p.new_cards[0].id=existing.id],
 ['ID repetido',p=>p.new_cards.push(p.new_cards[0])],
 ['manifesto obsoleto',p=>p.manifest_git_blob='0'.repeat(40)],
 ['catálogo obsoleto',p=>p.catalog_git_blob='0'.repeat(40)],
 ['módulo ausente',p=>p.profiles[id].layers.pop()],
 ['módulo repetido',p=>p.profiles[id].layers[1].texto=p.profiles[id].layers[0].texto],
 ['vínculo unilateral',p=>p.relations[existing.id]=[]],
 ['campo privado',p=>p.new_cards[0].srs={event:'TESTE'}],
 ['tentativa de exportação privada',p=>p.private_content_exported=true]
])test('bloqueia '+name,()=>{const p=packet();mutate(p);assert.throws(()=>publicPreflight(p,snapshot,contract))});
test('evolução exige hash do cartão de origem',()=>{
 const c=mk(existing.id),p={...packet(),new_cards:[],updated_cards:[c],profiles:{[c.id]:profile(c)},relations:{[c.id]:[]},expected_card_hashes:{[c.id]:digest(existing)}};
 assert.equal(publicPreflight(p,snapshot,contract).updated_cards,1);
 p.expected_card_hashes[c.id]='0'.repeat(64);
 assert.throws(()=>publicPreflight(p,snapshot,contract));
});
