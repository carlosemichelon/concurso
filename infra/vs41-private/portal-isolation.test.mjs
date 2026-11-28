import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {connectAccount} from './browser-account-v436.mjs';

const root=new URL('../../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const folder='application/vnd.google-apps.folder';
function fakeDrive(version){
 const card={id:'CARD-0001',front:'Pergunta',back:'Resposta',expl:'Explicação',active:true,discipline:'Teste',group:'Teste',subject:'Teste'};
 const body=JSON.stringify({format:'BancoMestrePrivadoV159',schema_version:1,version,cards:[card],counts:{cards:1},srs:[]});
 const pointer=JSON.stringify({schema:'banco-mestre-operational-pointer/1',private_base:{file_id:'snapshot',version,sha256:hash(body),cards:1}});
 const privateMeta={ownedByMe:true,shared:false,trashed:false,version:'1'};
 const metadata={
  root:{...privateMeta,id:'root',name:'DataBase_Concurso',mimeType:folder,parents:[]},
  pointer:{...privateMeta,id:'pointer',name:'BANCO_MESTRE_ATUAL.json',mimeType:'application/json',parents:['root'],size:String(Buffer.byteLength(pointer)),sha256Checksum:hash(pointer)},
  snapshot:{...privateMeta,id:'snapshot',name:'snapshot.json',mimeType:'application/json',parents:['root'],size:String(Buffer.byteLength(body)),sha256Checksum:hash(body)}
 };
 let failing=true,reads=0;
 const fetcher=async input=>{
  const u=new URL(input);const p=u.pathname;const q=u.searchParams;
  if(p.endsWith('/about'))return Response.json({user:{permissionId:'test-account',displayName:'Teste',emailAddress:'test@example.invalid'}});
  if(p.endsWith('/files')){
   if(q.get('q')?.includes('BANCO_MESTRE_ATUAL.json'))return Response.json({files:[metadata.pointer]});
   return Response.json({files:[]});
  }
  const id=p.split('/').at(-1);if(!metadata[id])return new Response(null,{status:404});
  if(q.get('alt')==='media'){
   if(id==='snapshot'){reads++;if(failing)return new Response(null,{status:503});return new Response(body);}
   return new Response(pointer);
  }
  return Response.json(metadata[id]);
 };
 return {fetcher,enable:()=>{failing=false},reads:()=>reads};
}
test('login e PDFs não dependem do catálogo; falha e nova tentativa preservam a sessão',async()=>{
 for(const version of ['VD100','VD101']){
  const f=fakeDrive(version);
  const a=await connectAccount({token:'test-token',rootId:'root',fetcher:f.fetcher,deferCatalog:true,readEditorialIndex:async()=>null});
  assert.equal(a.identity.name,'Teste');assert.equal(a.snapshot,null);assert.equal(f.reads(),0);
  assert.deepEqual(await a.pdfs(),[]);assert.equal(f.reads(),0);
  await assert.rejects(a.loadCatalog());assert.equal(a.snapshot,null);assert.equal(a.identity.name,'Teste');
  f.enable();const snapshot=await a.loadCatalog();assert.equal(snapshot.version,version);assert.equal(snapshot.records.length,1);
  assert.equal((await a.loadCatalog()).version,version);
 }
});
test('manifesto e dependências da página inicial correspondem ao código',async()=>{
 const html=await read('index.html');const manifest=JSON.parse(await read('assets/version.json'));
 assert.equal(html.match(/data-bm-portal-version="([^"]+)"/)?.[1],manifest.version);
 assert.equal(html.match(/<title>Banco Mestre (VS\d+)/)?.[1],manifest.site_version);
 assert.equal(manifest.home,'index.html');
 const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)/g)].map(m=>m[1].split('?')[0]);
 assert.equal(scripts.length,manifest.portal_assets.js_count);
 assert.equal(new Set(scripts).size,scripts.length);
 for(const path of scripts)if(!/^https?:/.test(path))await access(new URL(path,root));
});
test('modo visitante não aguarda login nem recarrega por falha inicial',async()=>{
 const connection=await read('assets/bm-account/connection-v436.js');
 const client=await read('assets/bm-account/client-v436.js');
 assert.ok(!connection.includes('const p=await ready'));
 assert.ok(!client.includes('check().catch(()=>{location.reload()})'));
 assert.ok(connection.includes('deferCatalog:true'));
});
