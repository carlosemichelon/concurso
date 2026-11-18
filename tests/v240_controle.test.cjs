/* Testes sintéticos e estáticos V240. NUNCA lê Google Drive, SRS ou cartões reais. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const at=relative=>fs.readFileSync(path.join(__dirname,'..',relative),'utf8');
const sources=[
 'assets/v240_controle_app.js','assets/v240_controle_native.js','assets/v240_controle_drive_sync.js',
 'assets/v240_backup_drive.js','assets/v240_global_drive.js','assets/v240_offline.js','sw-v240.js'
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
 let d=JSON.parse(localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'));
 const sid=d.subjects[0].id;assert.equal(d.subjects.length,1);
 for(const [k,v] of Object.entries({sessionDate:'2026-11-18',sessionTime:'09:00',sessionMinutes:'75',sessionSubject:sid,sessionType:'Questões',sessionTopic:'Vigas',sessionQuestions:'20',sessionCorrect:'15',sessionNotes:''}))get(k).value=v;
 send('sessionForm','submit');d=JSON.parse(localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'));
 assert.equal(d.sessions.length,1);assert.equal(d.sessions[0].correct,15);
 assert.equal(d.audit.filter(e=>e.kind==='sessions'&&e.event==='criacao').length,1);
 const id=d.sessions[0].id;
 send('historyRows','click',{dataset:{deleteSession:id}});
 d=JSON.parse(localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'));assert.ok(d.sessions[0].deletedAt);
 send('bm240-audit','click',{dataset:{restoreSession:id}});
 d=JSON.parse(localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'));assert.equal(d.sessions[0].deletedAt,undefined);
 assert.ok(d.audit.some(e=>e.event==='restauracao'));
 for(const [k,v] of Object.entries({planDate:'2026-11-19',planSubject:sid,planTopic:'Topografia',planMinutes:'50'}))get(k).value=v;
 send('planForm','submit');d=JSON.parse(localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'));
 assert.equal(d.plans.length,1);assert.ok(d.audit.some(e=>e.kind==='plans'));
 assert.equal(localStorage.getItem('BM184_PRACTICE_EVENTS_V1'),null,'SRS local não modificado');
});
test('Deploy principal é separado da versão de homologação',()=>{
 const html=at('v240.html');
 assert.ok(html.includes('v240_controle_native.js'));
 assert.ok(html.includes('v240_global_drive.js'));
 assert.ok(html.includes('v240_backup_drive.js'));
 assert.ok(!html.includes('v239_controle_tab.js?v=239'));
});
