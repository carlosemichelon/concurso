import assert from 'node:assert/strict';
import {createDriveProvider,PORTAL_PROJECT} from '../assets/multiaccount-drive-v001.mjs';
import {checkedPdfCopy,matchingPdfCopy,uploadDestination} from '../assets/multiaccount-pdf-copy-v001.mjs';
import {profilePdfAccess} from '../assets/multiaccount-pdf-v001.mjs';
const file=(owner,kind,id,parent,props={},size='100')=>({id,name:id,mimeType:kind==='root'?'application/vnd.google-apps.folder':'application/pdf',ownedByMe:true,shared:false,trashed:false,parents:parent?[parent]:[],appProperties:{bmProject:PORTAL_PROJECT,bmOwner:owner,bmKind:kind,...props},version:'1',size});
const db=new Map(),calls=[],pending=new Map();let n=0;
for(const owner of ['A','B']){db.set('root'+owner,file(owner,'root','root'+owner));db.set('source'+owner,file(owner,'pdf-source','source'+owner,'root'+owner))}
const response=(obj,status=200,headers={})=>({ok:status===200,status,json:async()=>JSON.parse(JSON.stringify(obj)),headers:{get:k=>headers[k]||null}});
const fetcher=async(url,o)=>{const u=new URL(url),owner=o.headers.Authorization.slice('Bearer token-'.length),id=u.pathname.split('/').at(-1);calls.push({url,method:o.method||'GET',owner});
 if(o.method==='PUT'){const p=pending.get(u.searchParams.get('upload_id'));if(!p||p.owner!==owner)return response({},403);let f=p.existing?{...db.get(p.existing),version:String(Number(db.get(p.existing).version)+1),size:String(o.body.size)}:file(owner,'pdf-annotated','copy'+(++n),'root'+owner,p.meta.appProperties,String(o.body.size));f.name=p.meta.name||f.name;db.set(f.id,f);return response(f)}
 if(o.method==='POST'||o.method==='PATCH'){assert.ok(u.pathname.startsWith('/upload/drive/v3/files'));const meta=JSON.parse(o.body),existing=o.method==='PATCH'?id:null;if(existing)assert.equal(db.get(existing).appProperties.bmKind,'pdf-annotated');else assert.deepEqual(meta.parents,['root'+owner]);const upload='u'+(calls.length);pending.set(upload,{owner,meta,existing});return response({},200,{Location:'https://www.googleapis.com/upload/drive/v3/files?upload_id='+upload})}
 if(id==='files'){const q=u.searchParams.get('q'),kind=q.match(/key='bmKind' and value='([^']+)'/)?.[1];return response({files:[...db.values()].filter(f=>f.appProperties.bmOwner===owner&&f.appProperties.bmKind===kind)})}
 const f=db.get(id);return f?.appProperties.bmOwner===owner?response(f):response({},403)
};
const provider=owner=>createDriveProvider({fetcher,token:'token-'+owner,info:{sub:owner,email:owner+'@example.test',email_verified:true},expiresAt:Date.now()+600000,loadCatalog:async()=>({cards:[]})});
const blob={type:'application/pdf',size:2000},prepared=owner=>({doc:{id:'PDF-001',file_id:'source'+owner,hash:'a'.repeat(64)},blob,pagesMarked:1,name:'Teste_ANOTADO.pdf'});
assert.equal(checkedPdfCopy(prepared('A')).name,'Teste_BANCO_MESTRE_ANOTADO.pdf');assert.throws(()=>checkedPdfCopy({...prepared('A'),pagesMarked:0}));assert.throws(()=>checkedPdfCopy({...prepared('A'),blob:{type:'image/png',size:2000}}));assert.throws(()=>uploadDestination('https://evil.invalid/upload/drive/v3/files'));assert.throws(()=>uploadDestination('https://www.googleapis.com/drive/v3/files'));assert.equal(matchingPdfCopy(db.get('sourceA'),prepared('A').doc),false);
const a=provider('A'),b=provider('B');await a.findRoot('A');await b.findRoot('B');
const saved=await a.saveAnnotatedPdf('A',prepared('A'));assert.equal(saved.updated,false);assert.notEqual(saved.id,'sourceA');assert.equal(db.get(saved.id).appProperties.bmOwner,'A');assert.equal(db.get('sourceA').version,'1');
const again=await a.saveAnnotatedPdf('A',prepared('A'));assert.equal(again.updated,true);assert.equal(again.id,saved.id);assert.equal(db.get(saved.id).version,'2');
const other=await b.saveAnnotatedPdf('B',prepared('B'));assert.notEqual(other.id,saved.id);assert.equal(db.get(other.id).appProperties.bmOwner,'B');await assert.rejects(()=>a.saveAnnotatedPdf('A',prepared('B')));await assert.rejects(()=>a.saveAnnotatedPdf('B',prepared('B')));
const different={...prepared('A'),doc:{...prepared('A').doc,hash:'b'.repeat(64)}};const newer=await a.saveAnnotatedPdf('A',different);assert.notEqual(newer.id,saved.id);assert.equal(db.get('sourceA').version,'1');
const local=profilePdfAccess({profile:{privateData:{pdf:[{id:'PDF-001',file_id:'sourceA',title:'PDF'}]}},allowedGroups:[],session:{saveAnnotatedPdf:p=>a.saveAnnotatedPdf('A',p)}});await assert.rejects(()=>local.saveCopy(prepared('B')));assert.equal(local.copyReady,true);
const broken=profilePdfAccess({profile:{privateData:{pdf:[{id:'PDF-001',file_id:'sourceA',title:'PDF'}]}},allowedGroups:[],session:{saveAnnotatedPdf:async()=>{throw Error('rede')}}});await assert.rejects(()=>broken.saveCopy(prepared('A')));assert.equal(broken.copyReady,false);await assert.rejects(()=>broken.saveCopy(prepared('A')));
a.close();await assert.rejects(()=>a.saveAnnotatedPdf('A',prepared('A')));
console.log('PASS cópia PDF por titular, origem e edição, atualização de cópia, falhas e sessão');
