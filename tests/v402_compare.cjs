'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const source=fs.readFileSync('assets/v402_js_136_147_compare.js','utf8');
const start=source.indexOf('/* 144 Comparador de snapshots VS13'),end=source.indexOf('/* 145 assets/v291_study_square.js */',start);
assert.ok(start>=0&&end>start);
const manifest=JSON.parse(fs.readFileSync('assets/version.json','utf8')),raw=fs.readFileSync(manifest.catalog.path),snapshot=JSON.parse(raw);
const sample=snapshot.base.find(x=>x.id==='CARD-0047'),prof=sample.consolidation.profile;
const cards=[{...sample,front:prof.front,back:prof.back,evolutive:{layers:prof.modules}},{id:'CARD-999999',front:'Teste privado',back:'Resposta fictícia',active:true}];
const privateBytes=Buffer.from(JSON.stringify({format:'BancoMestrePrivadoV999',version:'V999',counts:{cards:cards.length},cards}));
const pointerId='mock_pointer_id_00001',sourceId='mock_source_id_000001',root='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD';
let mode='ok',publicReads=0,requests=[],nodes=new Map();
class Node{constructor(tag){this.tag=tag;this.children=[];this.style={};this.textContent='';this.parentElement=null;}set id(v){this._id=v;nodes.set(v,this)}get id(){return this._id}append(...xs){for(const x of xs){if(x&&typeof x==='object')x.parentElement=this;this.children.push(x)}}replaceChildren(...xs){this.children=[];this.append(...xs)}cloneNode(){return new Node(this.tag)}replaceWith(n){const a=this.parentElement;if(a){a.children[a.children.indexOf(this)]=n;n.parentElement=a}}setAttribute(){}addEventListener(){}}
const parent=new Node('div'),old=new Node('button'),state=new Node('p');old.id='bm285-button';state.id='bm285-result';parent.append(old,state);
const document={readyState:'complete',getElementById:id=>nodes.get(id)||null,createElement:t=>new Node(t),createTextNode:t=>t};
const answer=(body)=>new Response(body);
const window={BM239DriveGlobal:{writeToken:()=> 'mock-token'}};
const ctx=vm.createContext({window,document,console,URLSearchParams,TextDecoder,TextEncoder,Uint8Array,crypto:crypto.webcrypto,BM_CATALOG:manifest.catalog,fetch:async(url,opt={})=>{
 requests.push([url,opt.method||'GET']);assert.equal(opt.method||'GET','GET');
 if(url==='assets/version.json')return answer(JSON.stringify(manifest));
 if(url.startsWith(manifest.catalog.path+'?')){publicReads++;return answer(raw)}
 if(url.startsWith('https://www.googleapis.com/drive/v3/files?'))return answer(JSON.stringify({files:mode==='missing'?[]:[{id:pointerId,name:'00_FONTE_ATUAL_POR_FAMILIA_V999_TEST.json',parents:[root],mimeType:'application/json'}]}));
 if(url.includes('/'+pointerId+'?'))return answer(JSON.stringify({schema:'banco-mestre-operational-pointer/1',pointer_version:'V999',private_base:{file_id:sourceId,version:'V999',cards:cards.length,sha256:mode==='mismatch'?'0'.repeat(64):crypto.createHash('sha256').update(privateBytes).digest('hex')}}));
 if(url.includes('/'+sourceId+'?'))return answer(privateBytes);
 throw Error('Consulta inesperada: '+url);
}});
(async()=>{vm.runInContext(source.slice(start,end),ctx);const api=window.BM285PrivateReconcile;assert.equal(api.mode,'read-only');assert.ok(nodes.get('bm290-button'));
 await api.verify();let r=api.lastResult;assert.ok(r, nodes.get('bm290-result').textContent);assert.equal(r.coverage.matched,1);assert.equal(r.coverage.modules,1);assert.equal(r.counts.newIds,1);assert.equal(r.counts.modules,0);assert.equal(r.integrity,'sha256_confirmed');assert.equal(publicReads,1);
 await api.verify();assert.equal(api.lastResult.reused,true);assert.equal(publicReads,1);
 mode='missing';await api.verify();assert.equal(api.lastResult,null);assert.match(nodes.get('bm290-result').textContent,/Nenhum ponteiro/);
 mode='mismatch';await api.verify();assert.equal(api.lastResult,null);assert.match(nodes.get('bm290-result').textContent,/SHA-256.*diverge/);
 assert.ok(requests.every(x=>x[1]==='GET'));assert.ok(!requests.some(x=>/PETRO22|Lacunas_Mestre|versos/i.test(x[0])));
 console.log(JSON.stringify({ok:true,publicReads,requests:requests.length,cases:['comparação','cache','ponteiro ausente','SHA divergente','somente GET']}));})().catch(e=>{console.error(e);process.exitCode=1});
