import {test} from 'node:test';import assert from 'node:assert/strict';
import {readBrowserSnapshot,fileId,sourceSelection} from '../infra/vs41-private/browser-drive.mjs';import {card} from './vs41_private_fixture.mjs';
const make=({shared=false,owned=true,change=false,format='BancoMestrePrivadoV159',deny=false}={})=>{const data={format,schema_version:1,version:'TESTE',counts:{cards:1},cards:[card('A')]};const bytes=JSON.stringify(data);let calls=0;return async(url,opt)=>{assert.equal(opt.method,'GET');assert.equal(opt.headers.Authorization,'Bearer mock');assert.equal(opt.credentials,'omit');assert.equal(opt.redirect,'error');const u=new URL(url);if(u.pathname.endsWith('/about'))return Response.json({user:{permissionId:'userA'}});if(deny)return new Response(null,{status:403});const id=u.pathname.split('/').pop();if(id==='root')return Response.json({id,mimeType:'application/vnd.google-apps.folder',ownedByMe:true,shared:false,trashed:false});if(u.searchParams.has('alt'))return new Response(bytes);return Response.json({id,name:'TESTE.json',mimeType:'application/json',ownedByMe:owned,shared,trashed:false,parents:['root'],version:change?String(++calls):'1',size:String(Buffer.byteLength(bytes))});};};
test('validates explicit private source and retains 11 modules',async()=>{const p=await readBrowserSnapshot({token:'mock',source:'https://drive.google.com/file/d/test/view',fetcher:make()});assert.equal(p.records[0].consolidation.profile.modules.length,11);assert.equal(p.scope,'snapshot-only');assert.equal(p.version,'TESTE');});
test('rejects shared, foreign, denied, changed and unsupported sources',async()=>{for(const options of [{shared:true},{owned:false},{change:true},{deny:true},{format:'public'}])await assert.rejects(readBrowserSnapshot({token:'mock',source:'test',fetcher:make(options)}));});
test('does not accept a folder or arbitrary URL',()=>{assert.throws(()=>fileId('https://drive.google.com/drive/folders/abc'));assert.throws(()=>fileId('https://example.org/file/d/abc'));assert.equal(fileId('https://drive.google.com/open?id=abc'),'abc');});

import {createHash} from 'node:crypto';
const folderFixture=({rootShared=false,rootOwned=true,duplicates=false,missing=false,outside=false,changePointer=false}={})=>{
 const snapshot=JSON.stringify({format:'BancoMestrePrivadoV159',schema_version:1,version:'TESTE',counts:{cards:1},cards:[card('A')]});
 const pointer=JSON.stringify({schema:'banco-mestre-operational-pointer/1',private_base:{file_id:'snapshot',version:'TESTE',sha256:createHash('sha256').update(snapshot).digest('hex'),cards:1}});
 const meta=(id,mimeType,parents,extra={})=>({id,name:id,mimeType,parents,ownedByMe:true,shared:false,trashed:false,version:'1',...extra});
 const fm='application/vnd.google-apps.folder';
 const files={root:meta('root',fm,[],{shared:rootShared,ownedByMe:rootOwned}),sub:meta('sub',fm,['root']),other:meta('other',fm,[]),pointer:meta('pointer','application/json',['root'],{name:'BANCO_MESTRE_ATUAL.json',size:String(Buffer.byteLength(pointer))}),snapshot:meta('snapshot','application/json',[outside?'other':'sub'],{size:String(Buffer.byteLength(snapshot))})};
 let lists=0;
 return async(url,opt)=>{
  assert.equal(opt.method,'GET');assert.equal(opt.headers.Authorization,'Bearer mock');
  const u=new URL(url);
  if(u.pathname.endsWith('/about'))return Response.json({user:{permissionId:'userA'}});
  if(u.pathname.endsWith('/files')){assert.equal(u.searchParams.get('q'),"'root' in parents and trashed = false and name = 'BANCO_MESTRE_ATUAL.json'");lists++;const f=files.pointer;return Response.json({files:missing?[]:duplicates?[f,{...f,id:'another'}]:[{...f,id:changePointer&&lists>1?'another':'pointer'}]});}
  const id=u.pathname.split('/').pop();
  if(!files[id])return new Response(null,{status:404});
  if(u.searchParams.has('alt'))return new Response(id==='pointer'?pointer:snapshot);
  return Response.json(files[id]);
 };
};
test('folder URL resolves only designated private current pointer and contained snapshot',async()=>{
 assert.deepEqual(sourceSelection('https://drive.google.com/drive/u/0/folders/root?usp=sharing'),{kind:'folder',id:'root'});
 const p=await readBrowserSnapshot({token:'mock',source:'https://drive.google.com/drive/folders/root',fetcher:folderFixture()});assert.equal(p.version,'TESTE');assert.equal(p.records.length,1);
});
test('folder fails closed on shared, foreign, missing, ambiguous, external or changed pointer',async()=>{
 for(const options of [{rootShared:true},{rootOwned:false},{missing:true},{duplicates:true},{outside:true},{changePointer:true}])await assert.rejects(readBrowserSnapshot({token:'mock',source:'https://drive.google.com/drive/folders/root',fetcher:folderFixture(options)}));
});
