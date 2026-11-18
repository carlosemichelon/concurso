/* Testes sintéticos e estáticos V240. NUNCA lê Google Drive, SRS ou cartões reais. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const at=relative=>fs.readFileSync(path.join(__dirname,'..',relative),'utf8');
const sources=[
 'assets/v240_controle_app.js','assets/v240_controle_native.js','assets/v240_reconcile.js','assets/v240_controle_drive_sync.js',
 'assets/v240_backup_drive.js','assets/v240_global_drive.js','assets/v240_offline.js','sw-v240.js','homologacao-v240/sw.js'
];
test('Todos os scripts V240 compilam',()=>{
 for(const p of sources)assert.doesNotThrow(()=>new vm.Script(at(p),{filename:p}),p);
});
test('Template tem IDs únicos e todas as referências do app',()=>{
 const html=at('controle-estudos-v240.html'),js=at('assets/v240_controle_app.js');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,'IDs duplicados');
 for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),'Elemento ausente: '+m[1]);
 assert.ok(html.includes('id="calGrid"'));
 assert.ok(!html.includes('Após 1, 7 e 30 dias'));
});
test('Criar sessão, auditoria, exclusão recuperável e agenda não alteram o SRS',()=>{
 const html=at('controle-estudos-v240.html'),code=at('assets/v240_controle_app.js');
 const elements=new Map(),get=id=>{
  if(elements.has(id))return elements.get(id);
  const el={id,value:'',textContent:'',innerHTML:'',style:{},dataset:{},disabled:false,options:[],listeners:{},classList:{add(){},remove(){},toggle(){}},
   addEventListener(type,fn){this.listeners[type]=fn},replaceChildren(){this.options=[]},add(opt){this.options.push(opt);if(!this.value)this.value=opt.value},
   setAttribute(){},reset(){},scrollIntoView(){}};
  elements.set(id,el);return el;
 };
 for(const m of html.matchAll(/\bid="([^"]+)"/g))get(m[1]);
 const store=new Map(),localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 let count=0;const crypto={randomUUID:()=>String(++count)};
 const root={getElementById:get,querySelectorAll(){return []},querySelector(){return get('main')}};
 const window={crypto,addEventListener(){},dispatchEvent(){}};
 const sandbox={window,localStorage,crypto,root,document:{createElement:()=>get('created'),addEventListener(){}},Option:class{constructor(text,value){this.text=text;this.value=value}},ResizeObserver:undefined,
  setInterval:()=>0,alert(){},confirm:()=>true,CustomEvent:class{},structuredClone};
 vm.runInNewContext(code,sandbox,{timeout:1500});
 window.BM240ControlInit(root);
 const send=(id,type,target)=>{
  const fn=get(id).listeners[type];assert.equal(typeof fn,'function','handler '+id);
  fn({preventDefault(){},target:{closest:()=>target||null,dataset:target?.dataset||{}}});
 };
 for(const [k,v] of Object.entries({subjectName:'Engenharia Civil',subjectDiff:'3',subjectWeight:'1',subjectExam:'0',subjectWeekly:'5',subjectDaily:'1',subjectColor:'#277f79'}))get(k).value=v;
 send('subjectForm','submit');
 let d=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE'));
 const sid=d.subjects[0].id;assert.equal(d.subjects.length,1);
 for(const [k,v] of Object.entries({sessionDate:'2026-11-18',sessionTime:'09:00',sessionMinutes:'75',sessionSubject:sid,sessionType:'Questões',sessionTopic:'Vigas',sessionQuestions:'20',sessionCorrect:'15',sessionNotes:''}))get(k).value=v;
 send('sessionForm','submit');d=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE'));
 assert.equal(d.sessions.length,1);assert.equal(d.sessions[0].correct,15);
 assert.equal(d.audit.filter(e=>e.kind==='sessions'&&e.event==='criacao').length,1);
 const id=d.sessions[0].id;
 send('historyRows','click',{dataset:{deleteSession:id}});
 d=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE'));assert.ok(d.sessions[0].deletedAt);
 send('bm240-audit','click',{dataset:{restoreSession:id}});
 d=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE'));assert.equal(d.sessions[0].deletedAt,undefined);
 assert.ok(d.audit.some(e=>e.event==='restauracao'));
 for(const [k,v] of Object.entries({planDate:'2026-11-19',planSubject:sid,planTopic:'Topografia',planMinutes:'50'}))get(k).value=v;
 send('planForm','submit');d=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE'));
 assert.equal(d.plans.length,1);assert.ok(d.audit.some(e=>e.kind==='plans'));
 assert.equal(localStorage.getItem('BM184_PRACTICE_EVENTS_V1'),null,'SRS local não modificado');
 const production={schema:1,subjects:[{id:'prod-subject',name:'Português'}],sessions:[
  {id:'prod-session',subjectId:'prod-subject',date:'2026-11-18',minutes:50,
   questions:10,correct:8,type:'Questões',topic:'Sintaxe',notes:''}
 ],reviews:[],cycle:[]};
 const original=JSON.stringify(production);
 localStorage.setItem('BM_CONTROLE_ESTUDOS_V238',original);
 send('bm240-import-active','click');
 assert.equal(localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'),original,'Histórico da V239 não pode ser modificado');
 d=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE'));
 assert.ok(d.sessions.some(s=>s.id==='V239:prod-session'),'Histórico verificado da V239 não importado no staging');
 // Pausa comum não libera a posse para outro aparelho.
 get('timerSubject').value=sid;get('timerType').value='Teoria';get('timerTopic').value='Mecânica dos Solos';
 send('timerStart','click');
 let clock=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_TIMER'));
 assert.equal(clock.running,true);
 send('timerPause','click');
 clock=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_TIMER'));
 assert.equal(clock.running,false);
 assert.equal(clock.availableForTransfer,false,'Pausa local não é uma transferência');
 clock.elapsed=60000;clock.running=false;clock.ownerId=localStorage.getItem('BM240_HOMOLOGACAO_DEVICE');
 localStorage.setItem('BM240_HOMOLOGACAO_TIMER',JSON.stringify(clock));
 window.BM240ControlApp.reload();
 send('timerRelease','click');
 clock=JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_TIMER'));
 assert.equal(clock.availableForTransfer,true);
 send('timerStart','click');
 assert.equal(JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_TIMER')).running,false,'Transferência liberada não pode ser retomada sem Drive');
 const staged=localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE');
 const divergent=JSON.parse(staged);divergent.availabilityWeek=987;
 localStorage.setItem('BM240_HOMOLOGACAO_CONTROLE',JSON.stringify(divergent));
 get('subjectName').value='Matemática';
 send('subjectForm','submit');
 assert.equal(JSON.parse(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE')).availabilityWeek,987,
  'Uma aba desatualizada jamais deve sobrescrever alterações concorrentes');
 localStorage.setItem('BM240_HOMOLOGACAO_CONTROLE','{json-corrompido');
 assert.throws(()=>window.BM240ControlInit(root),/corrompido/,
  'Histórico inválido não pode virar base vazia');
 assert.equal(localStorage.getItem('BM240_HOMOLOGACAO_CONTROLE'),'{json-corrompido');

});
test('Deploy principal é separado da versão de homologação',()=>{
 const html=at('v240.html');
 assert.ok(html.includes('v240_controle_native.js'));
 assert.ok(html.includes('v240_global_drive.js'));
 assert.ok(html.includes('v240_backup_drive.js'));
 assert.ok(!html.includes('v239_controle_tab.js?v=239'));
 assert.ok(!html.includes("tag('v239_grifos_drive.js?v=239')"),'Grifos canônicos não devem ser gravados no teste');
 const stage=at('homologacao-v240/index.html'),offline=at('assets/v240_offline.js');
 assert.ok(stage.includes('<base href="../">'));
 assert.ok(offline.includes('/homologacao-v240/'));
 assert.ok(offline.includes('homologacao-v240/sw.js'));
 const backup=at('assets/v240_backup_drive.js'),sync=at('assets/v240_controle_drive_sync.js');
 assert.ok(sync.includes("BM240_HOMOLOGACAO_CONTROLE"));
 assert.ok(sync.includes("bm_controle_estudos_v240_homologacao"));
 assert.ok(backup.includes("bm_controle_estudos_v240_homologacao_backup"));
});


test('Backups privados isolados: hash, consulta e recuperação local sem alterar a V239',async()=>{
 const source=at('assets/v240_backup_drive.js');
 const crypto=require('node:crypto').webcrypto;
 const documents=new Map(),mem=new Map();
 const original={schema:1,subjects:[{id:'d',name:'Engenharia Civil'}],
  sessions:[{id:'a',date:'2026-11-18',subjectId:'d',minutes:42,questions:4,correct:3}],
  reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60};
 mem.set('BM240_HOMOLOGACAO_CONTROLE',JSON.stringify(original));
 mem.set('BM_CONTROLE_ESTUDOS_V238','PRODUCAO_INTACTA');
 const storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
 const okay=data=>({ok:true,json:async()=>data,text:async()=>JSON.stringify(data)});
 let sequence=0;
 async function fetch(url,options={}){
  const u=new URL(url),method=options.method||'GET';
  if(method==='GET'&&u.pathname==='/drive/v3/files')
   return okay({files:[...documents.values()].map(x=>({id:x.id,name:x.name,createdTime:x.createdTime,appProperties:x.appProperties}))});
  if(method==='POST'&&u.pathname==='/upload/drive/v3/files'){
   const parts=String(options.body).split('\r\n\r\n'),
    meta=JSON.parse(parts[1].split('\r\n--')[0]),
    doc=JSON.parse(parts[2].split('\r\n--')[0]),id='backup-'+(++sequence);
   const record={id,name:meta.name,appProperties:meta.appProperties,doc,createdTime:new Date().toISOString()};
   documents.set(id,record);return okay({id,name:record.name,appProperties:record.appProperties});
  }
  if(method==='GET'&&u.pathname.startsWith('/drive/v3/files/')){
   const record=documents.get(u.pathname.split('/').at(-1));
   if(!record)return {ok:false,status:404};
   return okay(u.searchParams.get('alt')==='media'?record.doc:{id:record.id});
  }
  if(method==='DELETE'&&u.pathname.startsWith('/drive/v3/files/')){
   documents.delete(u.pathname.split('/').at(-1));return okay({});
  }
  throw Error('Chamada mock não esperada: '+method+' '+url);
 }
 const window={BM240ControlApp:{reload(){}}};
 vm.runInNewContext(source,{window,fetch,localStorage:storage,crypto,TextEncoder,URL,Date,JSON,
  setTimeout}, {timeout:1500});
 const first=await window.BM240StudyBackups.afterSync('token-test');
 assert.equal(first.state,'verified');
 const list=await window.BM240StudyBackups.listAvailable('token-test');
 assert.equal(list.length,2);
 const changed=structuredClone(original);
 changed.sessions.push({id:'b',date:'2026-11-18',subjectId:'d',minutes:20,questions:0,correct:0});
 storage.setItem('BM240_HOMOLOGACAO_CONTROLE',JSON.stringify(changed));
 const result=await window.BM240StudyBackups.restoreToLocal('token-test',list[0].id);
 assert.equal(result.state,'restored-local-only');
 assert.equal(JSON.parse(storage.getItem('BM240_HOMOLOGACAO_CONTROLE')).sessions.length,1);
 assert.equal(storage.getItem('BM240_HOMOLOGACAO_DRIVE_BASE_SHA256'),'RESTORE_REQUIRES_RECONCILIATION');
 assert.equal(storage.getItem('BM_CONTROLE_ESTUDOS_V238'),'PRODUCAO_INTACTA');
});


test('Conciliação de alterações offline: união de IDs distintos, sem alterar a base',()=>{
 const global={};
 vm.runInNewContext(at('assets/v240_reconcile.js'),{window:global},{timeout:1500});
 const base={schema:1,subjects:[{id:'s1',name:'Engenharia Civil'}],
  sessions:[{id:'a',subjectId:'s1',date:'2026-11-18',minutes:40,questions:0,correct:0}],
  reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60};
 const local=structuredClone(base),remote=structuredClone(base);
 local.sessions.push({id:'b',subjectId:'s1',date:'2026-11-18',minutes:20,questions:0,correct:0});
 remote.sessions.push({id:'c',subjectId:'s1',date:'2026-11-18',minutes:35,questions:0,correct:0});
 remote.audit.push({id:'remote-log',kind:'sessions',event:'criacao',entityId:'c'});
 const r=global.BM240Reconcile.reconcile(base,local,remote);
 assert.equal(r.ok,true);
 assert.deepEqual([...r.merged.sessions.map(x=>x.id)].sort(),['a','b','c']);
 assert.deepEqual(base.sessions.map(x=>x.id),['a'],'base histórica não pode ser alterada');
 assert.equal(r.merged.audit.length,1);
 const other=structuredClone(remote);other.sessions[0].minutes=99;
 local.sessions[0].minutes=44;
 const conflict=global.BM240Reconcile.reconcile(base,local,other);
 assert.equal(conflict.ok,false);
 assert.ok(conflict.conflicts.some(x=>x.includes('sessions/a')));
 assert.equal(conflict.merged,null);
 const erased=structuredClone(base);erased.sessions=[];
 const edited=structuredClone(base);edited.sessions[0].minutes=101;
 assert.equal(global.BM240Reconcile.reconcile(base,erased,edited).ok,false,
  'Exclusão concorrente com edição deve bloquear escrita');
 const invalid=structuredClone(base);invalid.sessions.push({...invalid.sessions[0]});
 assert.equal(global.BM240Reconcile.validate(invalid),'ID duplicado ou inválido em sessions');
});
test('Conciliação do Controle V240 não usa chave de produção ou SRS',()=>{
 const rec=at('assets/v240_reconcile.js'),drive=at('assets/v240_controle_drive_sync.js'),
       backup=at('assets/v240_backup_drive.js'),html=at('controle-estudos-v240.html');
 assert.ok(drive.includes('BM240_HOMOLOGACAO_VERIFIED_BASE_DOC'));
 assert.ok(drive.includes('preservePremerge'));
 assert.ok(backup.includes("period")&&backup.includes("premerge"));
 assert.ok(html.includes('id="bm240-merge-safe"'));
 assert.ok(!rec.includes('fetch(')&&!rec.includes('localStorage')&&!rec.includes('BM184_PRACTICE_EVENTS_V1'));
});
