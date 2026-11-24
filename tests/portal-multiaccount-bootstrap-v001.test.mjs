import assert from 'node:assert/strict';
import {createBootstrap,PROFILE_KINDS} from '../assets/multiaccount-bootstrap-v001.mjs';
const project='bm-portal-multi-v1',catalogs={civil:{id:'civil'},residencia:{id:'residencia'},shared:{id:'shared'}};
const info=sub=>({sub,email:sub+'@example.test',email_verified:true});
const file=(owner,kind,id,parent)=>({id,ownedByMe:true,shared:false,parents:parent?[parent]:[],appProperties:{bmProject:project,bmOwner:owner,bmKind:kind}});
const profiles={A:'civil',B:'residencia'};
const provider={
 async findRoot(owner){return file(owner,'root','root'+owner)},
 async findProfile(root,owner){return {file:file(owner,'profile','profile'+owner,root),payload:{schema:'BM-PORTAL-PROFILE/1',project,owner,catalog:profiles[owner],collections:Object.fromEntries(PROFILE_KINDS.map(k=>[k,owner+'_'+k]))}}},
 async loadCatalog(c){return {cards:[{id:c.id}]}},
 async readCollection(id,owner,kind){return {file:file(owner,kind,id,'root'+owner),payload:{schema:'BM-PORTAL-COLLECTION/1',project,owner,kind,records:[{id:owner+'_'+kind}]}}}
};
const a=createBootstrap({catalogs,provider}),b=createBootstrap({catalogs,provider});
assert.equal(a.phase,'locked');assert.equal(a.current,null);
const [ra,rb]=await Promise.all([a.open(info('A')),b.open(info('B'))]);
assert.equal(a.phase,'ready');assert.equal(b.phase,'ready');assert.equal(ra.publicCards[0].id,'civil');assert.equal(rb.publicCards[0].id,'residencia');assert.equal(ra.privateData.srs[0].id,'A_srs');assert.equal(rb.privateData.srs[0].id,'B_srs');assert.notEqual(ra.rootId,rb.rootId);assert.equal(Object.keys(ra.privateData).length,7);
ra.privateData.srs[0].id='modified';assert.equal(a.current.privateData.srs[0].id,'A_srs');
a.lock();assert.equal(a.current,null);assert.equal(a.phase,'locked');assert.equal(b.current.subject,'B');
profiles.A='shared';profiles.B='shared';const both=await Promise.all([a.open(info('A')),b.open(info('B'))]);assert.deepEqual(both[0].publicCards,both[1].publicCards);assert.notEqual(both[0].privateData.cards[0].id,both[1].privateData.cards[0].id);
const wrong=createBootstrap({catalogs,provider:{...provider,readCollection:async(id,owner,k)=>provider.readCollection(id,'B',k)}});await assert.rejects(()=>wrong.open(info('A')));assert.equal(wrong.phase,'blocked');assert.equal(wrong.current,null);
const missing=createBootstrap({catalogs,provider:{...provider,findProfile:async()=>{throw Error('Perfil não provisionado')}}});await assert.rejects(()=>missing.open(info('A')));assert.equal(missing.current,null);assert.equal(missing.phase,'blocked');
const late=createBootstrap({catalogs,provider});const waiting=late.open(info('A'));late.lock();await assert.rejects(()=>waiting);assert.equal(late.current,null);assert.equal(late.phase,'locked');
await assert.rejects(()=>a.open({...info('A'),email_verified:false}));assert.equal(a.current,null);
console.log('PASS bootstrap de contas, catálogos e carregamento completo');
