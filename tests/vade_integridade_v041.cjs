/* Validação não destrutiva: PDF publicado do Senado/Vade em 21 partes.
 * Executa em Node após instalar pdfjs-dist@3.11.174 e pdf-lib@1.17.1. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {PDFDocument,rgb}=require('pdf-lib');
const pdfjs=require('pdfjs-dist/legacy/build/pdf.js');
(async()=>{
 const pieces=[],lengths=[];
 for(let n=1;n<=21;n++){
  const name='vade_senado_2026_'+String(n).padStart(2,'0')+'.b64';
  const file=path.join(__dirname,'..','assets','pdf',name);
  const encoded=fs.readFileSync(file,'utf8').replace(/\s+/g,'');
  const expected=n===21?449636:524288;
  assert.equal(encoded.length,expected,name+' comprimento diferente do previsto');
  assert.match(encoded,/^[A-Za-z0-9+/]*={0,2}$/,name+' base64 inválido');
  const bytes=Buffer.from(encoded,'base64');
  assert.ok(bytes.length>300000,name+' bytes incompletos');
  pieces.push(bytes);lengths.push(bytes.length);
 }
 const raw=Buffer.concat(pieces);
 assert.equal(raw.toString('latin1',0,5),'%PDF-','Cabeçalho ausente');
 const end=raw.toString('latin1',Math.max(0,raw.length-2048));
 const matched=end.match(/startxref\s+(\d+)\s*%%EOF\s*$/);
 assert.ok(matched,'Marcador startxref/EOF inválido');
 assert.ok(Number(matched[1])>0&&Number(matched[1])<raw.length,'startxref fora do documento');
 const digest=crypto.createHash('sha256').update(raw).digest('hex');
 const task=pdfjs.getDocument({data:new Uint8Array(raw),useSystemFonts:true,disableFontFace:true});
 const original=await task.promise;
 assert.ok(original.numPages>=2,'PDF sem páginas');
 const first=await original.getPage(1),view=first.getViewport({scale:1});
 assert.ok(view.width>100&&view.height>100,'Geometria da página inválida');
 const lib=await PDFDocument.load(raw);
 assert.equal(lib.getPageCount(),original.numPages,'Divergência entre leitores PDF');
 const firstPage=lib.getPage(0),w=firstPage.getWidth(),h=firstPage.getHeight();
 firstPage.drawLine({start:{x:Math.max(5,w*.2),y:Math.max(5,h*.7)},end:{x:Math.max(10,w*.4),y:Math.max(10,h*.7)},thickness:3,color:rgb(.5,.7,.2)});
 const annotated=await lib.save({useObjectStreams:true});
 const reopened=await PDFDocument.load(annotated);
 assert.equal(reopened.getPageCount(),original.numPages,'Exportação perdeu páginas');
 assert.ok(annotated.length>200000,'PDF exportado muito pequeno');
 console.log(JSON.stringify({result:'PASS',parts:pieces.length,raw_bytes:raw.length,pages:original.numPages,sha256:digest,exported_bytes:annotated.length,first_page:{width:view.width,height:view.height}}));
 await original.destroy();
})().catch(err=>{console.error('VADE_TEST_FAIL',err.stack||String(err));process.exitCode=1});
