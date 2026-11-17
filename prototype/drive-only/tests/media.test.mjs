import assert from 'node:assert/strict';
import {DriveOnlyClient} from '../client.mjs';

const calls=[];
let next=async()=>new Response(JSON.stringify({source:'google-drive',authenticated:true}),{
 status:200,headers:{'content-type':'application/json'}
});
const mock=async(url,opts)=>{
  calls.push({url,opts});
  return next();
};
const client=new DriveOnlyClient({fetcher:mock});
assert.equal(client.signInPath(),'/api/banco-mestre/auth/google/start');
const session=await client.session();
assert.equal(session.authenticated,true);
assert.equal(calls.length,1,'O portal consulta a sessão uma vez no carregamento');

next=async()=>new Response(new Uint8Array([137,80,78,71]),{headers:{'content-type':'image/png'}});
const img=await client.media('IMG10000',{purpose:'image'});
assert.equal(img.size,4);
assert.equal(calls.length,2,'A imagem usa a sessão, sem nova autorização');
assert.equal(calls.at(-1).url,'/api/banco-mestre/media/IMG10000');
assert.equal(calls.at(-1).opts.credentials,'include');
assert.equal(calls.at(-1).opts.redirect,'error');
assert.equal(calls.at(-1).opts.cache,'no-store');
assert.ok(!('Authorization' in calls.at(-1).opts.headers),'Nunca enviar token OAuth via JS');

next=async()=>new Response(new TextEncoder().encode('%PDF-1.7'),{headers:{'content-type':'application/pdf'}});
const pdf=await client.media('PDF10000',{purpose:'pdf'});
assert.equal(pdf.type,'application/pdf');
assert.equal(calls.at(-1).opts.headers.Accept,'application/pdf');
assert.equal(calls.length,3,'PDF não solicita novo login');

next=async()=>new Response('',{status:401});
await assert.rejects(client.media('IMG10000'),err=>err.code==='LOGIN_REQUIRED');
next=async()=>new Response('',{status:403});
await assert.rejects(client.media('PDF10000',{purpose:'pdf'}),err=>err.code==='FORBIDDEN');
next=async()=>new Response('<script>alert(1)</script>',{headers:{'content-type':'image/svg+xml'}});
await assert.rejects(client.media('IMG10000'),err=>err.code==='INVALID_MEDIA');
next=async()=>new Response('not pdf',{headers:{'content-type':'text/html'}});
await assert.rejects(client.media('PDF10000',{purpose:'pdf'}),err=>err.code==='INVALID_MEDIA');
await assert.rejects(client.media('../../private'),err=>err.code==='INVALID_MEDIA');
await assert.rejects(client.media('IMG10000',{purpose:'exe'}),err=>err.code==='INVALID_MEDIA');
await assert.rejects(client.signOut(''),err=>err.code==='CSRF_REQUIRED');

next=async()=>new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json'}});
await client.signOut('1234567890123456');
assert.equal(calls.at(-1).url,'/api/banco-mestre/logout');
assert.equal(calls.at(-1).opts.method,'POST');
assert.equal(JSON.parse(calls.at(-1).opts.body).csrfToken,'1234567890123456');
assert.equal(calls.filter(x=>x.url.includes('/auth/google/start')).length,0,'Abertura de mídia jamais inicia fluxo OAuth');
console.log('Drive-only: login único + imagens/PDFs via cookie + MIME seguro + sem popups por arquivo OK');
