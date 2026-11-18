/* Drive API mock of offline three-way reconciliation, production untouched. */
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),
 {webcrypto}=require('node:crypto');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const prodKey='BM_CONTROLE_ESTUDOS_V238',testKey='BM245_CONTROLE_ESTUDOS';
const clone=x=>JSON.parse(JSON.stringify(x));
test('Concilia sessões independentes após 2 backups privados verificados',async()=>{
 const records=new Map(),storage=new Map(),events=[];
 let seq=0,patches=0;
 const store={getItem:k=>storage.has(k)?storage.get(k):null,
  setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const base={schema:1,subjects:[{id:'civil',name:'Engenharia Civil'}],
  sessions:[{id:'first',subjectId:'civil',date:'2026-11-18',minutes:40,questions:2,correct:2}],
  reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60};
 store.setItem(testKey,JSON.stringify(base));store.setItem(prodKey,'PROD_STILL_INTACT');
 const good=v=>({ok:true,status:200,json:async()=>v,text:async()=>JSON.stringify(v)});
 async function fetch(url,opt={}){
  const u=new URL(url),method=opt.method||'GET',pathname=u.pathname;
  if(pathname==='/drive/v3/files'&&method==='GET'){
   const match=String(u.searchParams.get('q')||'').match(/value='([^']+)'/);
   const kind=match?.[1];
   return good({files:[...records.values()].filter(x=>x.appProperties?.bm_kind===kind)
    .map(x=>({id:x.id,name:x.name,version:x.version,createdTime:x.createdTime,size:100,appProperties:x.appProperties}))});
  }
  const id=pathname.split('/').at(-1);
  if(pathname.startsWith('/drive/v3/files/')&&method==='GET'){
   const item=records.get(id);
   if(!item)return {ok:false,status:404};
   return good(u.searchParams.get('alt')==='media'?item.doc:{id:item.id,version:item.version,appProperties:item.appProperties});
  }
  if(pathname==='/upload/drive/v3/files'&&method==='POST'){
   const parts=String(opt.body).split('\r\n\r\n');
   const meta=JSON.parse(parts[1].split('\r\n--')[0]),doc=JSON.parse(parts[2].split('\r\n--')[0]);
   const item={id:'f'+(++seq),version:1,name:meta.name,appProperties:meta.appProperties,doc,createdTime:new Date().toISOString()};
   records.set(item.id,item);return good({id:item.id,version:1,name:item.name,appProperties:item.appProperties});
  }
  if(pathname.startsWith('/upload/drive/v3/files/')&&method==='PATCH'){
   const item=records.get(id);
   if(!item)throw Error('Missing patch item');
   item.doc=JSON.parse(opt.body);item.version++;patches++;
   return good({id:item.id,version:item.version});
  }
  if(pathname.startsWith('/drive/v3/files/')&&method==='DELETE'){
   records.delete(id);return good({});
  }
  throw Error('Unexpected '+method+' '+pathname);
 }
 const browser={BM240ControlApp:{reload(){events.push('reload')}},crypto:webcrypto},
  document={getElementById:()=>null,dispatchEvent:e=>events.push(e.type)};
 const ctx={window:browser,localStorage:store,crypto:webcrypto,document,fetch,URL,TextEncoder,
  Date,JSON,CustomEvent:class{constructor(type){this.type=type}},console};
 for(const file of ['assets/v245_reconcile.js','assets/v245_backup_drive.js','assets/v245_controle_drive_sync.js'])
  vm.runInNewContext(read(file),ctx,{filename:file});
 const sync=browser.BM240ControlDrive,backup=browser.BM240StudyBackups;
 const initial=await sync.sync('token');assert.equal(initial.state,'uploaded');
 const master=[...records.values()].find(x=>x.appProperties.bm_kind==='bm_controle_estudos_v245');
 assert.ok(master);
 const local=clone(base);local.sessions.push({id:'local',subjectId:'civil',date:'2026-11-18',minutes:20,questions:0,correct:0});
 store.setItem(testKey,JSON.stringify(local));
 const remote=clone(base);remote.sessions.push({id:'remote',subjectId:'civil',date:'2026-11-18',minutes:35,questions:0,correct:0});
 master.doc.data=remote;master.version++;
 const preview=await sync.sync('token');
 assert.equal(preview.state,'merge_ready','Mudanças independentes não devem gravar automaticamente');
 assert.equal(patches,0);
 const merged=await sync.mergeSafe('token');
 assert.equal(merged.state,'merged');
 assert.equal(patches,1);
 const ids=Array.from(master.doc.data.sessions,s=>s.id).sort();
 assert.deepEqual(ids,['first','local','remote']);
 assert.deepEqual(Array.from(JSON.parse(store.getItem(testKey)).sessions,s=>s.id).sort(),ids);
 assert.equal(store.getItem(prodKey),'PROD_STILL_INTACT');
 const copies=[...records.values()].filter(x=>x.appProperties.bm_period==='premerge');
 assert.equal(copies.length,2,'Guardar originais antes de regravar o mestre');
 assert.deepEqual(copies.map(x=>x.name).sort().map(x=>x.includes('_local')?'local':'remote'),['local','remote']);
 assert.ok(events.includes('reload'));
 assert.ok(events.includes('bm240-control-verified'));
 const same=await sync.sync('token');assert.equal(same.state,'unchanged');
});
test('Conflito no mesmo registro nunca executa PATCH remoto',async()=>{
 const win={};vm.runInNewContext(read('assets/v245_reconcile.js'),{window:win});
 const base={schema:1,subjects:[{id:'s1',name:'Civil'}],sessions:[{id:'a',subjectId:'s1',minutes:30}],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60};
 const local=clone(base),remote=clone(base);
 local.sessions[0].minutes=40;remote.sessions[0].minutes=50;
 const result=win.BM240Reconcile.reconcile(base,local,remote);
 assert.equal(result.ok,false);assert.ok(result.conflicts.some(x=>x.includes('sessions/a')));
});
