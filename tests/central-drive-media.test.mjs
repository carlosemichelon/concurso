import test from 'node:test';
import assert from 'node:assert/strict';
import {readProfileMedia,MediaNotFound,mediaCatalog} from '../infra/central-drive/media.mjs';
import {createCentralHandler} from '../infra/central-drive/server.mjs';
import {createAuth,parseUsers,passwordHash} from '../infra/central-drive/auth.mjs';
import {createServer} from 'node:http';
function profile(sub){return {subject:sub,publicCards:[],privateData:{cards:[{id:'CARD-0001',front:'Q',back:'A',active:true}],images:[{file_id:'drive'+sub,imageId:'IMG-1',name:'original.svg',mimeType:'image/svg+xml',cardIds:['CARD-0001']}],pdf:[{id:'PDF-1',file_id:'pdf'+sub,title:'PDF'}]}}}
test('resolução editorial isolada; nunca aceitar fileId arbitrário',async()=>{
 const seen=[];const provider={readImage:async(sub,id,mime)=>{seen.push([sub,id]);return new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'],{type:mime})},readPdf:async(sub,id)=>{seen.push([sub,id]);return new Blob(['%PDF-1.7'],{type:'application/pdf'})}};
 for(const sub of ['A','B'])for(const [kind,id] of [['image','IMG-1'],['pdf','PDF-1']])await readProfileMedia({provider,profile:profile(sub),uploadedImages:[],media:{kind,id}});
 assert.deepEqual(seen,[['A','driveA'],['A','pdfA'],['B','driveB'],['B','pdfB']]);
 await assert.rejects(readProfileMedia({provider,profile:profile('A'),uploadedImages:[],media:{kind:'image',id:'driveB'}}),MediaNotFound);
 await assert.rejects(readProfileMedia({provider,profile:profile('A'),uploadedImages:[],media:{kind:'pdf',id:'pdfB'}}),MediaNotFound);
 assert.equal(seen.length,4);
});
test('somente enunciado explicitamente autorizado aparece na frente; metadados projetados',()=>{
 const r={imageCatalog:()=>[{id:'privateDrive',imageId:'IMG-1',metadata:{displayTitle:'Figura'},mimeType:'image/svg+xml',cardIds:['CARD-0001'],subtype:'enunciado',provenance:{display:'verso',caption:'Legenda'}},{id:'privateDrive2',imageId:'IMG-2',metadata:{displayTitle:'Croqui'},mimeType:'image/png',cardIds:['CARD-0001'],subtype:'enunciado',provenance:{display:'frente'}}],pdfCatalog:()=>[{id:'PDF-1',title:'PDF',file_id:'privatePdf'}]};
 const out=mediaCatalog(r);assert.deepEqual(out.images.map(x=>x.phase),['verso','frente']);assert.ok(!JSON.stringify(out).includes('private'));
});
test('API de mídia exige cookie e contexto correto, baixa SVG original sem execução, revoga durante leitura',async()=>{
 const pw='test only password 123',hash=await passwordHash(pw);
 const auth=createAuth({users:parseUsers(JSON.stringify(['A','B'].map(subject=>({username:subject,subject,rootId:'root'+subject,passwordHash:hash}))))});
 const origin='https://study.example';let release,started;const blocked=new Promise(r=>{started=r}),wait=new Promise(r=>{release=r});
 const server=createServer(createCentralHandler({auth,origin,loadProfile:async(u,{media}={})=>{if(!media)return {counts:{}};if(media.id==='other')throw new MediaNotFound();if(media.id==='slow'){started();await wait}return {blob:new Blob(['<svg>'+u.subject+'</svg>'],{type:'image/svg+xml'}),filename:'original.svg'}}}));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const login=async username=>{const r=await fetch(base+'/api/login',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({username,password:pw})});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];const c=await fetch(base+'/api/session',{headers:{cookie}}).then(r=>r.json());return {cookie,ctx:c.context}};
 const read=(a,id='IMG-1',ctx=a.ctx)=>fetch(base+'/api/media/image/'+id,{headers:{cookie:a.cookie,'X-BM-Context':ctx}});
 try{
  assert.equal((await fetch(base+'/api/media/image/IMG-1')).status,401);
  const [a,b]=await Promise.all([login('A'),login('B')]);
  assert.equal((await read(a,'IMG-1',b.ctx)).status,403);assert.equal((await read(a,'other')).status,404);
  const av=await read(a),bv=await read(b);assert.equal(await av.text(),'<svg>A</svg>');assert.equal(await bv.text(),'<svg>B</svg>');
  assert.match(av.headers.get('content-disposition'),/^attachment/);assert.match(av.headers.get('content-security-policy'),/sandbox/);assert.equal(av.headers.get('cache-control'),'no-store');
  const pending=read(a,'slow');await blocked;await fetch(base+'/api/logout',{method:'POST',headers:{origin,cookie:a.cookie}});release();assert.equal((await pending).status,401);assert.equal((await read(b)).status,200);
 }finally{release();server.closeAllConnections();await new Promise(r=>server.close(r))}
});
