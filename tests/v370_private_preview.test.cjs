'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){
 const s=fs.readFileSync('assets/v370_js_040_051.js','utf8');
 const a=s.indexOf('// V370: single-flight'),b=s.indexOf('async function openImage(file){',a);
 assert.ok(a>=0&&b>a);
 let auth='fixture-A',requests=[],created=0,revoked=[];
 const ctx={blobs:new Map(),currentToken:()=>auth,PREVIEW_MIME:new Set(['image/png','image/svg+xml']),SVG:'image/svg+xml',API:'https://example.invalid/files',MAX_BYTES:15000000,Blob,URL:{createObjectURL:()=> 'blob:fixture-'+(++created),revokeObjectURL:u=>revoked.push(u)},safeSvgPreview:async b=>b,authorized:()=>new Promise((resolve,reject)=>requests.push({resolve,reject}))};
 vm.createContext(ctx);vm.runInContext(s.slice(a,b)+'\nthis.get=getImageUrl;',ctx);
 return {get:ctx.get,requests,revoked,change:x=>{auth=x},file:{id:'fixture-123',mimeType:'image/png',modifiedTime:'rev1'},resolve:i=>requests[i].resolve({blob:async()=>new Blob(['x'],{type:'image/png'})})};
}
test('miniatura e leitor compartilham um download e cache na mesma sessão',async()=>{const f=fixture(),a=f.get(f.file),b=f.get(f.file);assert.equal(f.requests.length,1);f.resolve(0);assert.equal(await a,await b);assert.equal(await f.get(f.file),'blob:fixture-1');assert.equal(f.requests.length,1)});
test('nova revisão impede resposta antiga de substituir a nova',async()=>{const f=fixture(),a=f.get(f.file),old=assert.rejects(a,/revisão/),b=f.get({...f.file,modifiedTime:'rev2'});assert.equal(f.requests.length,2);f.resolve(1);assert.equal(await b,'blob:fixture-1');f.resolve(0);await old});
test('falha não envenena nova tentativa',async()=>{const f=fixture(),a=f.get(f.file),b=f.get(f.file),checks=Promise.all([assert.rejects(a,/offline/),assert.rejects(b,/offline/)]);f.requests[0].reject(Error('offline'));await checks;const c=f.get(f.file);assert.equal(f.requests.length,2);f.resolve(1);await c});
test('token alterado não reutiliza cache nem aceita resposta da sessão anterior',async()=>{const f=fixture(),a=f.get(f.file),old=assert.rejects(a,/Sessão/);f.change('fixture-B');const b=f.get(f.file);assert.equal(f.requests.length,2);f.resolve(0);await old;f.resolve(1);await b;f.change('fixture-C');const c=f.get(f.file);assert.equal(f.requests.length,3);f.resolve(2);await c;assert.equal(f.revoked.length,1)});
test('sem autorização nenhuma requisição é iniciada',async()=>{const f=fixture();f.change('');await assert.rejects(f.get(f.file),/Reconecte/);assert.equal(f.requests.length,0)});
