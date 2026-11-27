import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DriveReadonly} from '../assets/drive.js';
import {driveApiFileUrl,boundedMediaBytes,boundedPdfBytes,MAX_DRIVE_PDF_BYTES} from '../assets/drive-media.js';

assert.equal(driveApiFileUrl('https://www.googleapis.com/drive/v3/files?x=1'),true);
assert.equal(driveApiFileUrl('https://www.googleapis.com/drive/v3/files/private_file_12345?alt=media'),true);
for(const url of [
 'https://evil.test/drive/v3/files/private_file_12345',
 'http://www.googleapis.com/drive/v3/files/private_file_12345',
 'https://www.googleapis.com.evil.test/drive/v3/files/private_file_12345',
 'https://www.googleapis.com/other/v3/files/private_file_12345',
 'https://www.googleapis.com/drive/v3/files/private_file_12345/../../attack',
 'https://www.googleapis.com/drive/v3/files?alt=media#token'
])assert.equal(driveApiFileUrl(url),false,'destino bloqueado: '+url);
const pdf=new TextEncoder().encode('%PDF-1.4\n1 0 obj\n%%EOF\n');
const response=(bytes,headers={})=>new Response(bytes,{status:200,headers});
assert.deepEqual(new Uint8Array(await boundedPdfBytes(response(pdf,{'content-type':'application/pdf'}))),pdf);
await assert.rejects(()=>boundedPdfBytes(response(new TextEncoder().encode('<html/>'),{'content-type':'text/html'})),/não é PDF/);
await assert.rejects(()=>boundedPdfBytes(response(new TextEncoder().encode('<html/>'),{'content-type':'application/pdf'})),/assinatura PDF/);
await assert.rejects(()=>boundedMediaBytes(response(pdf,{'content-length':'1000'}),{maxBytes:10}),/limite/);
await assert.rejects(()=>boundedMediaBytes(response(pdf),{maxBytes:4}),/limite/);
await assert.rejects(()=>boundedMediaBytes(response(pdf),{maxBytes:MAX_DRIVE_PDF_BYTES+1}),/inválido/);
const cancelled=new AbortController();cancelled.abort();
await assert.rejects(()=>boundedMediaBytes(response(pdf),{maxBytes:100,signal:cancelled.signal}),{name:'AbortError'});
const stream=new ReadableStream({
 start(controller){controller.enqueue(pdf.slice(0,8));controller.enqueue(pdf.slice(8));controller.close()}
});
assert.deepEqual(new Uint8Array(await boundedPdfBytes(new Response(stream,{'headers':{'content-type':'application/pdf'}}))),pdf);

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const contract=JSON.parse(readFileSync(resolve(root,'assets/v202_storage_contract.json'),'utf8'));
const service=new DriveReadonly({contract});
const beforeFetch=globalThis.fetch;
let calls=0,authorization='';
const activate=()=>{service.accessToken='FAKE-MEMORY-TOKEN';service.expiresAt=Date.now()+3600000};
try{
 activate();
 globalThis.fetch=async (url,options)=>{
  calls++;authorization=options.headers.Authorization;
  assert.equal(options.method,'GET');
  assert.equal(options.credentials,'omit');
  assert.equal(options.referrerPolicy,'no-referrer');
  assert.ok(driveApiFileUrl(url));
  return response(pdf,{'content-type':'application/pdf'});
 };
 const fileId='private_pdf_12345678';
 const got=await service.downloadPdf(fileId);
 assert.equal(authorization,'Bearer FAKE-MEMORY-TOKEN');
 assert.deepEqual(new Uint8Array(got),pdf);
 assert.equal(calls,1);
 await assert.rejects(()=>service.authorized('https://evil.test/receive'),/bloqueado fora da API/);
 assert.equal(calls,1,'bloqueio deve impedir envio de token');
 let resume;
 globalThis.fetch=()=>new Promise(resolve=>{resume=resolve});
 const waiting=service.downloadPdf(fileId);
 service.disconnect();
 resume(response(pdf,{'content-type':'application/pdf'}));
 await assert.rejects(waiting,/Sessão Drive encerrada|Cancelado|AbortError/);
 assert.equal(service.accessToken,'');
 assert.equal(service.activeMedia.size,0);
 activate();
 const events=[];service.onChange(e=>events.push(e.type));
 globalThis.fetch=async()=>new Response('Unauthorized',{status:401});
 await assert.rejects(()=>service.downloadPdf(fileId),/expirou/);
 assert.equal(service.connected,false);
 assert.ok(events.includes('expired'));
 activate();
 const image='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20"/></svg>';
 globalThis.fetch=async()=>new Response(image,{headers:{'content-type':'image/svg+xml'}});
 const blob=await service.preview({
  id:'private_image_12345',mimeType:'image/svg+xml',previewAllowed:true
 });
 assert.equal(blob.type,'image/svg+xml');
 assert.equal(await blob.text(),image);
 globalThis.fetch=async()=>new Response('<html>Not an image</html>',{headers:{'content-type':'text/html'}});
 await assert.rejects(()=>service.preview({
  id:'private_image_12345',mimeType:'image/svg+xml',previewAllowed:true
 }),/Formato/);
}finally{globalThis.fetch=beforeFetch}
const files=['drive.js','drive-media.js','pdf-reader.js'].map(x=>
  readFileSync(resolve(root,'v2/assets',x),'utf8'));
assert.equal(files.every(x=>!/localStorage\.(?:setItem|removeItem|clear)/.test(x)),true);
assert.ok(files[2].includes('api.drive.downloadPdf('));
console.log('V2 Drive media security OK:',{
 allowedOrigin:true,limitBytes:MAX_DRIVE_PDF_BYTES,
 cancelledOnLogout:true,expired401:true,pdfSignature:true,
 privateSvgRead:true,tokenNotPersisted:true
});
