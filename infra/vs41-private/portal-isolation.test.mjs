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

test('catálogo inválido recupera apenas predecessor selado e suspende agenda e avaliações',async()=>{
 const card={id:'CARD-0001',front:'Pergunta',back:'Resposta',expl:'Explicação',active:true,discipline:'Teste',group:'Teste',subject:'Teste'};
 const snapshot=version=>JSON.stringify({format:'BancoMestrePrivadoV159',schema_version:1,version,cards:[card],counts:{cards:1},srs:[]});
 for(const mode of ['normal','fallback','foreign','bad-hash','no-seal','network']){
  const current=snapshot('VD2'),prior=snapshot('VD1'),ref={file_id:'previous',version:'VD1',sha256:mode==='bad-hash'?'0'.repeat(64):hash(prior),cards:1};
  const ptr=JSON.stringify({schema:'banco-mestre-operational-pointer/1',private_base:{file_id:'current',version:mode==='normal'?'VD2':'bad',sha256:hash(current),cards:1},previous_private_base:ref,...(mode==='no-seal'?{}:{rollback_checkpoint:{schema:'banco-mestre-operational-pointer/1',private_base:ref}})});
  const common={ownedByMe:true,shared:false,trashed:false,version:'1'},files={pointer:ptr,current,previous:prior};
  const metadata=id=>({...common,id,name:id==='pointer'?'BANCO_MESTRE_ATUAL.json':id+'.json',mimeType:'application/json',parents:['root'],size:String(Buffer.byteLength(files[id])),sha256Checksum:hash(files[id]),...(mode==='foreign'&&id==='previous'?{ownedByMe:false}:{})});
  let writes=0;const fetcher=async(url,options={})=>{
   const u=new URL(url),id=u.pathname.split('/').at(-1);
   if(options.method&&options.method!=='GET'){writes++;return new Response(null,{status:500})}
   if(id==='about')return Response.json({user:{permissionId:'test-account',displayName:'Teste'}});
   if(id==='root')return Response.json({...common,id,name:'DataBase_Concurso',mimeType:folder,parents:[]});
   if(id==='files')return Response.json({files:u.searchParams.get('q')?.includes('BANCO_MESTRE_ATUAL.json')?[metadata('pointer')]:[]});
   if(id==='current'&&mode==='network')return new Response(null,{status:503});
   if(!Object.hasOwn(files,id))return new Response(null,{status:404});
   return u.searchParams.get('alt')==='media'?new Response(files[id]):Response.json(metadata(id));
  };
  const p=await connectAccount({token:'test-token',rootId:'root',fetcher,deferCatalog:true,write:true});
  if(mode==='normal')assert.equal((await p.loadCatalog()).version,'VD2');
  else if(mode==='fallback'){const result=await p.loadCatalog();assert.equal(result.scope,'private-fallback');assert.equal(result.version,'VD1');assert.equal(result.srs,null);await assert.rejects(p.schedule(),/Agenda suspensa/);await assert.rejects(p.recordReview({id:'CARD-0001',event_id:'12345678-1234-1234-1234-123456789abc',rating:'Bom'}),/avaliações suspensas/);}
  else await assert.rejects(p.loadCatalog());
  assert.equal(writes,0);
 }
});

test('lacunas: ordenação documentada, busca exata e quantidade sem modificar registros',async()=>{
 const script=await read('assets/bm-account/v430_js_112_123_control.js');
 const begin=script.indexOf('// BM242: filtros e ordenação exclusivamente de leitura.');
 const end=script.indexOf('// Fim BM242 filtros de leitura.',begin);
 assert.ok(begin>=0&&end>begin);
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const select=new Function('norm',script.slice(begin,end)+';return gapSelection;')(norm);
 const fixtures=[
  {id:'LAC-10',cardIds:['CARD-0010'],questaoId:'PETRO1-Q01',disciplina:'Solos',descricao:'Compactação',createdAt:'2026-01-01',updatedAt:'2026-01-03T12:00:00Z'},
  {id:'LAC-2',cardIds:['CARD-0011'],questaoId:'PETRO1-Q02',disciplina:'Água',descricao:'Vazão',createdAt:'2026-01-02',updatedAt:'2026-01-04T09:00:00Z'},
  {id:'LAC-3',cardIds:[],disciplina:'Solos',createdAt:'2026-02-30',updatedAt:'inválida'}
 ];
 const before=JSON.stringify(fixtures),ids=r=>r.rows.map(x=>x.id);
 assert.deepEqual(ids(select(fixtures,{})),['LAC-2','LAC-10','LAC-3']);
 assert.deepEqual(ids(select(fixtures,{order:'asc'})),['LAC-2','LAC-3','LAC-10']);
 assert.deepEqual(ids(select(fixtures,{order:'desc'})),['LAC-10','LAC-3','LAC-2']);
 assert.deepEqual(ids(select(fixtures,{order:'oldest'})),['LAC-10','LAC-2','LAC-3']);
 assert.deepEqual(ids(select(fixtures,{order:'created'})),['LAC-2','LAC-10','LAC-3']);
 assert.deepEqual(ids(select(fixtures,{q:'LAC-2',d:'Solos'})),['LAC-2']);
 assert.deepEqual(ids(select(fixtures,{q:'card-0010',d:'Água'})),['LAC-10']);
 assert.deepEqual(ids(select(fixtures,{q:'0010'})),['LAC-10']);
 assert.deepEqual(ids(select(fixtures,{q:'PETRO1-Q02',d:'Solos'})),['LAC-2']);
 assert.deepEqual(ids(select(fixtures,{q:'compactacao',d:'Solos'})),['LAC-10']);
 assert.deepEqual(ids(select(fixtures,{q:'CARD-9999'})),[]);
 const many=Array.from({length:30},(_,i)=>({id:'LAC-'+(i+1),cardIds:['CARD-0010'],createdAt:'2026-01-01'}));
 assert.equal(select(many,{limit:'10'}).rows.length,10);
 assert.equal(select(many,{limit:'10'}).total,30);
 assert.equal(select(many,{limit:'10',q:'CARD-0010'}).rows.length,30);
 assert.equal(JSON.stringify(fixtures),before);
});
