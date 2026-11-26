import {test} from 'node:test';import assert from 'node:assert/strict';import {fixture,profiles} from './vs41_private_fixture.mjs';import {createReviewStore} from '../infra/vs41-private/srs.mjs';
const eid=n=>'12345678-1234-4234-8234-'+String(n).padStart(12,'0');
function setup(){
 const f=fixture();let serial=0,posts=0;const queries=[];
 const fetcher=async(url,opts)=>{
  const u=new URL(url),method=opts.method||'GET';
  if(method==='POST'){posts++;const p=opts.body.split('\r\n'),m=JSON.parse(p[3]),payload=JSON.parse(p[7]),id='event'+(++serial);f.files.set(id,{meta:{...m,id,ownedByMe:true,shared:false,trashed:false,size:'1000',version:'1'},payload});return Response.json({id})}
  if(u.pathname==='/drive/v3/files'){const q=u.searchParams.get('q');queries.push(q);const parent=q.match(/^'([^']+)' in parents/)[1],event=q.match(/key='bmEvent' and value='([^']+)'/)?.[1];return Response.json({files:[...f.files.values()].filter(x=>x.meta.parents?.includes(parent)&&x.meta.appProperties?.bmKind==='srs-event'&&(!event||x.meta.appProperties.bmEvent===event)).map(x=>({id:x.meta.id}))})}
  return f.fetcher(url,opts);
 };
 const store=createReviewStore({...f,fetcher,resolveSession:async req=>profiles[req.session],now:()=>Date.parse('2026-11-25T22:00:00Z')});
 return {...f,store,queries,posts:()=>posts};
}
test('mesmo cartão, revisões separadas, regras do journal original, repetição segura',async()=>{
 const s=setup(),a={session:'A'},b={session:'B'},input={id:'CARD-9901',event_id:eid(1),rating:'Fácil',owner:'B',rootId:'rootB',interval_days:999};
 const [x,y]=await Promise.all([s.store.record(a,input),s.store.record(b,{...input,rating:'Bom'})]);
 assert.equal(x.owner,'A');assert.equal(y.owner,'B');assert.equal(x.interval_days,24);assert.equal(y.interval_days,16);assert.equal(x.due,'2026-12-19');assert.equal(s.posts(),2);
 assert.deepEqual(await s.store.record(a,input),x);assert.equal(s.posts(),2);
 assert.deepEqual(await s.store.read(a),[x]);assert.deepEqual(await s.store.read(b),[y]);assert.ok(s.queries.every(q=>/^'root[AB]' in parents/.test(q)));
 await assert.rejects(s.store.record(a,{...input,rating:'Bom'}),e=>e.code==='conflict');
});
test('sem sessão, cartão inexistente, aquisição exige duas Fácil, raiz compartilhada',async()=>{
 const s=setup(),a={session:'A'},input={id:'CARD-9901',event_id:eid(1),rating:'Conhecimento adquirido'};
 await assert.rejects(s.store.record({session:'X'},input));await assert.rejects(s.store.record(a,input),e=>e.code==='prerequisite');
 await assert.rejects(s.store.record(a,{...input,id:'CARD-9999',rating:'Bom'}),e=>e.code==='card');
 assert.equal(s.posts(),0);
 await s.store.record(a,{...input,rating:'Fácil'});await s.store.record(a,{...input,event_id:eid(2),rating:'Fácil'});
 const e=await s.store.record(a,{...input,event_id:eid(3)});assert.equal(e.interval_days,64);
 await assert.rejects(s.store.record({session:'B'},{...input,event_id:eid(4)}),e=>e.code==='prerequisite');
 s.files.get('rootA').meta.shared=true;await assert.rejects(s.store.read(a),e=>e.code==='owner');
});
test('evento com proprietário divergente bloqueado',async()=>{
 const s=setup(),a={session:'A'};await s.store.record(a,{id:'CARD-9901',event_id:eid(1),rating:'Bom'});
 s.files.get('event1').meta.appProperties.bmOwner='B';await assert.rejects(s.store.read(a),e=>e.code==='owner');
});

test('revisões de IDs Ijuí e TRT preservam o identificador e a regra SRS original',async()=>{
 const s=setup(),a={session:'A'},b={session:'B'};
 for(const [label,id] of [['A','PROP-IJUI-001'],['B','TRT01-C001']]){const c=s.files.get('cards'+label).payload.records[0];c.id=id;delete c.expl;delete c.consolidation;}
 const [x,y]=await Promise.all([s.store.record(a,{id:'PROP-IJUI-001',event_id:eid(1),rating:'Bom'}),s.store.record(b,{id:'TRT01-C001',event_id:eid(1),rating:'Fácil'})]);
 assert.equal(x.id,'PROP-IJUI-001');assert.equal(y.id,'TRT01-C001');assert.equal(x.interval_days,16);assert.equal(y.interval_days,24);
 assert.deepEqual(await s.store.read(a),[x]);assert.deepEqual(await s.store.read(b),[y]);
 await assert.rejects(s.store.record(a,{id:'TRT01-C001',event_id:eid(2),rating:'Bom'}),e=>e.code==='card');
});
