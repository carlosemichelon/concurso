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

test('imagens e PDFs consultam índices independentes e toleram classificação inválida',async()=>{
 const folderType='application/vnd.google-apps.folder';
 const common={ownedByMe:true,shared:false,trashed:false,version:'1'};
 const root={...common,id:'root',name:'DataBase_Concurso',mimeType:folderType,parents:[]};
 const atlas={...common,id:'atlas',name:'Atlas de Imagens',mimeType:folderType,parents:['root']};
 const pdf={...common,id:'pdf1',name:'Estruturas.pdf',mimeType:'application/pdf',parents:['root'],size:'20'};
 const image={...common,id:'image1',name:'Viga.png',mimeType:'image/png',parents:['atlas'],size:'20'};
 const pdf2={...pdf,id:'pdf2',name:'Solos.pdf'};
 let brokenImages=true,added=false;
 const fetcher=async input=>{
  const u=new URL(input);
  if(u.pathname.endsWith('/about'))return Response.json({user:{permissionId:'test-account',displayName:'Teste'}});
  if(u.pathname.endsWith('/files/root'))return Response.json(root);
  if(u.pathname.endsWith('/files')){
   const q=u.searchParams.get('q')||'';
   if(q.includes("mimeType = 'application/pdf'"))return Response.json({files:[root,pdf,...(added?[pdf2]:[])]});
   if(q.includes("mimeType contains 'image/'"))return brokenImages?new Response(null,{status:503}):Response.json({files:[root,atlas,image]});
  }
  return new Response(null,{status:404});
 };
 const readEditorialIndex=async path=>{
  if(path.includes('pdf_catalog'))return {format:'BancoMestrePDFCatalogV140',documents:[null,{file_id:'pdf1',title:'Estruturas'}]};
  if(path.includes('pdf_grupos'))return {format:'BancoMestrePDFGroupsV140',groups:{malformed:true},areas:[null],assigned:'invalid'};
  if(path.includes('v211'))return {schema:'BancoMestrePublishedDriveImagesV211',records:[null,{driveFileId:'image1',title:'Viga'}]};
  return null;
 };
 const p=await connectAccount({token:'test-token',rootId:'root',fetcher,deferCatalog:true,readEditorialIndex});
 const results=await Promise.allSettled([p.pdfs(),p.images()]);
 assert.equal(results[0].status,'fulfilled');assert.equal(results[0].value[0].id,'pdf1');
 assert.equal(results[1].status,'rejected');assert.equal(p.snapshot,null);
 added=true;assert.equal((await p.pdfs(true)).length,2);
 brokenImages=false;assert.equal((await p.images(true))[0].id,'image1');
 assert.equal(p.snapshot,null);
});

test('leitura normal usa somente a base vigente; preflight continua exigindo o histórico',async()=>{
 const version='VD100_RECUPERACAO',viewVersion='VD100_EDITORIAL',card={id:'CARD-0001',front:'Pergunta',back:'Resposta',expl:'Explicação',active:true,discipline:'Teste',group:'Teste',subject:'Teste'};
 const previous={file_id:'old-snapshot',version:'VD99_RECUPERACAO',sha256:'a'.repeat(64),cards:1};
 const previousView={file_id:'old-view',version:'VD99_EDITORIAL',sha256:'b'.repeat(64),cards:1};
 const batch={id:'VD100-GRIFOS-TESTE',ids:[card.id],srs_modified:false};
 const view={format:'BM-DRIVE-EDITORIAL-SEED/1',migration_status:'editorial-candidate-only',version:viewVersion,source:{base_version:previousView.version},counts:{cards:1,active:1},cards:[card],integrated_batches:[batch]};
 const viewBody=JSON.stringify(view);
 const snapshot={format:'BancoMestrePrivadoRecuperacaoV1',schema_version:1,status:'RECUPERACAO_PARCIAL',version,counts:{cards:1,visible_active:1,matched_private:1,operational_sources:0,historical_outside_view:0,historical_srs:0,verified_historical_due:0},private_source:{version:'V1',file_id:'original',sha256:'c'.repeat(64)},private_snapshot:{format:'BancoMestrePrivadoV159',schema_version:1,version:'V1',counts:{cards:1,srs_records:0},cards:[card],srs:[]},recovery:{srs_complete:false,editorial_view:{file_id:'view',version:viewVersion,sha256:hash(viewBody),cards:1},previous_editorial_view:previousView,integrated_batches:[{...batch,delta_file_id:'delta',delta_sha256:'d'.repeat(64)}],operational_identities:[],matched_private_ids:[card.id],historical_outside_view_ids:[]}};
 const snapshotBody=JSON.stringify(snapshot);
 const pointerBody=JSON.stringify({schema:'banco-mestre-operational-pointer/1',recovery_status:'RECUPERACAO_PARCIAL',private_base:{file_id:'snapshot',version,sha256:hash(snapshotBody),cards:1},previous_private_base:previous});
 const contents={pointer:pointerBody,snapshot:snapshotBody,view:viewBody};
 const common={ownedByMe:true,shared:false,trashed:false,version:'1'};
 const metadata={root:{...common,id:'root',name:'DataBase_Concurso',mimeType:'application/vnd.google-apps.folder',parents:[]}};
 for(const [id,body] of Object.entries(contents))metadata[id]={...common,id,name:id==='pointer'?'BANCO_MESTRE_ATUAL.json':id+'.json',mimeType:'application/json',parents:['root'],size:String(Buffer.byteLength(body)),sha256Checksum:hash(body)};
 const requests=[];
 const fetcher=async input=>{
  const u=new URL(input);const id=u.pathname.split('/').at(-1);requests.push(id);
  if(id==='about')return Response.json({user:{permissionId:'account'}});
  if(id==='files')return Response.json({files:[metadata.pointer]});
  if(!metadata[id])return new Response(null,{status:404});
  return u.searchParams.get('alt')==='media'?new Response(contents[id]):Response.json(metadata[id]);
 };
 const {readBrowserSnapshot}=await import('./browser-drive-v436.mjs');
 const options={token:'test-token',source:'https://drive.google.com/drive/folders/root',fetcher,cache:null};
 const result=await readBrowserSnapshot({...options,verifyHistory:false});
 assert.equal(result.version,version);assert.equal(result.records.length,1);
 assert.ok(!requests.includes('old-snapshot')&&!requests.includes('old-view'));
 await assert.rejects(readBrowserSnapshot(options),/Drive HTTP 404/);
 assert.ok(requests.includes('old-snapshot')||requests.includes('old-view'));
});
