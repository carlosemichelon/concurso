import {test} from 'node:test';import assert from 'node:assert/strict';import {runDriveSmoke} from '../infra/vs41-private/drive-smoke.mjs';
function mock({failCreate=0}={}){
 const files=new Map([['original',{meta:{id:'original',ownedByMe:true,shared:false,trashed:false},payload:{untouched:true}}]]);let n=0,writes=[];
 const fetcher=async(url,opts={})=>{const u=new URL(url),method=opts.method||'GET',id=u.pathname.split('/').at(-1);
 if(method==='POST'){
  if(++n===failCreate)return new Response(null,{status:503});let m,payload;
  if(u.pathname.includes('/upload/')){const parts=opts.body.split('\r\n');m=JSON.parse(parts[3]);payload=JSON.parse(parts[7]);}else m=JSON.parse(opts.body);
  const key='new'+n;files.set(key,{meta:{...m,id:key,ownedByMe:true,shared:false,trashed:false,version:'1',headRevisionId:'rev-'+key,md5Checksum:'0123456789abcdef0123456789abcdef',size:'300'},payload});writes.push(key);return Response.json({id:key});
 }
 const f=files.get(id);if(!f)return new Response(null,{status:404});
 if(method==='PATCH'){assert.equal(JSON.parse(opts.body).trashed,true);f.meta.trashed=true;writes.push(id);return Response.json({id,trashed:true})}
 if(u.searchParams.get('alt')!=='media')f.meta.version=String(Number(f.meta.version)+1);return Response.json(u.searchParams.get('alt')==='media'?f.payload:f.meta);
 };
 return {files,writes,fetcher,getToken:async()=>({token:'fixture'})};
}
test('cria dois catálogos, lê por perfil, impede cruzamento, limpa somente testes',async()=>{const m=mock();const r=await runDriveSmoke({...m,runId:'test-run-123'});assert.deepEqual(r,{ok:true,profiles:2,cardCounts:[1,1],crossAccessDenied:true,temporaryCreated:6,temporaryTrashed:6,cleanupPending:0});assert.ok(!m.writes.includes('original'));assert.equal(m.files.get('original').meta.trashed,false)});
test('falha parcial limpa apenas arquivos novos confirmados',async()=>{const m=mock({failCreate:4});const r=await runDriveSmoke({...m,runId:'test-run-456'});assert.equal(r.ok,false);assert.equal(r.temporaryCreated,3);assert.equal(r.temporaryTrashed,3);assert.ok(!m.writes.includes('original'))});
