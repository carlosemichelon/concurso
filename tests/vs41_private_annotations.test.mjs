import {test} from 'node:test';import assert from 'node:assert/strict';
import {createAnnotationStore} from '../infra/vs41-private/annotations.mjs';
import {mediaFixture,profiles} from './vs41_private_fixture.mjs';
const uid=n=>'12345678-1234-4234-8234-'+String(n).padStart(12,'0');
function setup(){
 const f=mediaFixture();let writes=0;const original=f.fetcher;
 const fetcher=async(url,opts)=>{
  const u=new URL(url);
  if(opts.method==='POST'){const p=opts.body.split('\r\n'),m=JSON.parse(p[3]),payload=JSON.parse(p[7]),id='annot'+(++writes);f.files.set(id,{meta:{...m,id,ownedByMe:true,shared:false,trashed:false,size:'1000',version:'1'},payload});return Response.json({id})}
  if(u.pathname==='/drive/v3/files'){const q=u.searchParams.get('q'),parent=q.match(/^'([^']+)' in parents/)[1],key=q.match(/key='bmPage' and value='([^']+)'/)[1];return Response.json({files:[...f.files.values()].filter(x=>x.meta.parents?.includes(parent)&&x.meta.appProperties?.bmKind==='pdf-annotation'&&x.meta.appProperties.bmPage===key).map(x=>({id:x.meta.id}))})}
  return original(url,opts);
 };
 const store=createAnnotationStore({...f,fetcher,resolveSession:async req=>profiles[req.session]});
 return {...f,store,writes:()=>writes};
}
test('grifos isolados por usuário, versão do PDF e página; revisão anterior preservada',async()=>{
 const f=setup(),a={session:'A'},b={session:'B'},p='PDF-TEST';
 const [x,y]=await Promise.all([f.store.get(a,p,1),f.store.get(b,p,1)]);
 assert.notEqual(x.hash,y.hash);assert.deepEqual(x.marks,[]);assert.equal(x.revision,null);
 const mark=t=>({type:'text_highlight',text:t,rects:[[.1,.2,.3,.4]]});
 const input={event_id:uid(1),hash:x.hash,previous:null,marks:[mark('A')]};
 await f.store.save(a,p,1,input);
 await f.store.save(b,p,1,{...input,hash:y.hash,marks:[mark('B')]});
 assert.equal((await f.store.get(a,p,1)).marks[0].text,'A');assert.equal((await f.store.get(b,p,1)).marks[0].text,'B');
 assert.deepEqual((await f.store.get(a,p,2)).marks,[]);
 await f.store.save(a,p,1,input);assert.equal(f.writes(),2);
 await assert.rejects(f.store.save(a,p,1,{...input,event_id:uid(2)}),e=>e.code==='conflict');
 const updated=await f.store.save(a,p,1,{...input,event_id:uid(2),previous:uid(1),marks:[]});assert.equal(updated.revision,uid(2));assert.deepEqual(updated.marks,[]);
 assert.equal(f.files.get('annot1').payload.marks[0].text,'A');
});
test('nega hash de outro usuário, raiz alheia, documento sem vínculo, e sessão ausente',async()=>{
 const f=setup(),a={session:'A'},b={session:'B'},p='PDF-TEST',x=await f.store.get(b,p,1);
 await assert.rejects(f.store.save(a,p,1,{event_id:uid(1),hash:x.hash,previous:null,marks:[]}),e=>e.code==='conflict');
 await assert.rejects(f.store.get({session:'X'},p,1));await assert.rejects(f.store.get(a,'PDF-TEST-B',1));
 f.files.get('PDF-TEST-A').meta.parents=['rootB'];await assert.rejects(f.store.get(a,p,1),e=>e.code==='owner');assert.equal(f.writes(),0);
});
