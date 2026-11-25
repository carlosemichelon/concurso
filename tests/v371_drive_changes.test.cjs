'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const bundles=[...html.matchAll(/<script\b[^>]*src="(assets\/v\d+_js_040_051[^"?]*\.js)(?:\?[^\"]*)?"/g)].map(m=>m[1]);
assert.equal(bundles.length,1,'Pacote vigente de listagem Drive');
const source=fs.readFileSync(bundles[0],'utf8');
const end=source.indexOf('/* V315 IIFE modules');assert.ok(end>0);
const ctx={URLSearchParams,Date};vm.createContext(ctx);vm.runInContext(source.slice(0,end)+'\nthis.make=BM371FolderCache;',ctx);
const F='application/vnd.google-apps.folder',P='application/pdf',file=(id,parents,mimeType=P)=>({id,name:id,parents,mimeType});
function fixture(){
 let token='A',time=1000,delta=[],bad=false,shared=false,changeCalls=0;
 const tree=new Map([['root',[file('a',['root'],F),file('b',['root'],F)]],['a',[file('p',['a'])]],['b',[]]]);
 let loads=[];
 const cache=ctx.make({roots:['root'],token:()=>token,now:()=>time,request:async(url)=>{
  if(url.includes('/files/'))return {id:'root',mimeType:F,...(shared?{driveId:'shared'}:{})};
  if(url.includes('startPageToken'))return {startPageToken:'start'};
  changeCalls++;if(bad)throw Error('offline');return {changes:delta,newStartPageToken:'next'};
 }});
 async function scan(get){const queue=['root'],found=[];while(queue.length){const id=queue.shift();for(const f of await get(id)){if(f.mimeType===F)queue.push(f.id);else found.push(f.id)}}return {found:found.sort()}}
 async function run(){loads=[];const result=await cache.run(scan,async id=>{loads.push(id);return tree.get(id)});return {result,loads:[...loads]}}
 return {run,tree,change:x=>{delta=x},bad:()=>{bad=true},shared:()=>{shared=true},token:x=>{token=x},advance:()=>{time+=600001},calls:()=>changeCalls};
}
const change=f=>({changeType:'file',fileId:f.id,file:f});
test('consulta inicial completa e depois nenhuma pasta relida sem mudanças',async()=>{const f=fixture();assert.equal((await f.run()).loads.length,3);const n=await f.run();assert.equal(n.loads.length,0);assert.equal(n.result.foldersReused,3);assert.equal(n.result.scanMode,'incremental')});
test('arquivo novo, alterado ou movido invalida somente origem e destino',async()=>{const f=fixture();await f.run();const x=file('p',['b']);f.tree.set('a',[]);f.tree.set('b',[x,file('q',['b'])]);f.change([change(x),change(file('q',['b']))]);const n=await f.run();assert.deepEqual(n.loads,['a','b']);assert.equal(n.result.found.join(','),'p,q')});
test('remoção conhecida relê pasta de origem',async()=>{const f=fixture();await f.run();f.tree.set('a',[]);f.change([{changeType:'file',fileId:'p',removed:true}]);const n=await f.run();assert.deepEqual(n.loads,['a']);assert.equal(n.result.found.length,0)});
test('pasta alterada, remoção desconhecida e feed indisponível exigem varredura integral',async()=>{const f=fixture();await f.run();f.change([change(file('a',['root'],F))]);assert.equal((await f.run()).loads.length,3);f.change([{changeType:'file',fileId:'unknown',removed:true}]);assert.equal((await f.run()).loads.length,3);f.bad();assert.equal((await f.run()).loads.length,3)});
test('troca de sessão ou prazo máximo impede reaproveitamento',async()=>{const f=fixture();await f.run();f.token('B');assert.equal((await f.run()).loads.length,3);f.advance();assert.equal((await f.run()).loads.length,3)});
test('drive compartilhado exige leitura completa sem confiar no log de usuário',async()=>{const f=fixture();f.shared();await f.run();assert.equal((await f.run()).loads.length,3);assert.equal(f.calls(),0)});
test('paginação incompleta ou cursor repetido não confirma cache',async()=>{let calls=0;const c=ctx.make({roots:['root'],token:()=> 'A',request:async u=>u.includes('/files/')?{id:'root',mimeType:F}:u.includes('startPageToken')?{startPageToken:'s'}:{changes:[],nextPageToken:'s'}});const run=()=>c.run(async get=>({n:(await get('root')).length}),async()=>{calls++;return []});await run();await run();assert.equal(calls,2)});
test('bundle vigente carrega o helper e integra as duas bibliotecas',()=>{new vm.Script(source);assert.match(source,/pdfIncremental.run\(crawlWith,children\)/);assert.match(source,/atlasIncremental.run\(listImagesWith,imageChildren\)/);assert.match(source,/function BM371FolderCache\(/);});
