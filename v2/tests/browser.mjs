/* Site V2 — teste funcional de navegador isolado, sem login e sem escrita no Drive.
 * Rodar em runner com playwright instalado: node v2/tests/browser.mjs
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const mime={
 '.html':'text/html; charset=utf-8',
 '.css':'text/css; charset=utf-8',
 '.js':'text/javascript; charset=utf-8',
 '.json':'application/json; charset=utf-8',
 '.svg':'image/svg+xml',
 '.png':'image/png',
 '.jpg':'image/jpeg'
};
function examplePdf(){
 const content='BT /F1 16 Tf 72 720 Td (Banco Mestre V2 - PDF de teste) Tj ET';
 const objects=[
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Length '+Buffer.byteLength(content)+' >>\nstream\n'+content+'\nendstream'
 ];
 let result='%PDF-1.4\n';const offsets=[0];
 for(let i=0;i<objects.length;i++){
  offsets.push(Buffer.byteLength(result,'utf8'));
  result+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n';
 }
 const startxref=Buffer.byteLength(result,'utf8');
 result+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
 for(const offset of offsets.slice(1))result+=String(offset).padStart(10,'0')+' 00000 n \n';
 result+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+startxref+'\n%%EOF\n';
 return Buffer.from(result,'utf8');
}

const server=createServer(async (request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const path=resolve(root,'.'+pathname);
    if(!(path===root||path.startsWith(root+sep))){response.writeHead(403);response.end();return}
    const info=await stat(path);
    if(!info.isFile()){response.writeHead(404);response.end();return}
    const bytes=await readFile(path);
    response.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream',
      'Cache-Control':'no-store'});
    if(request.method==='HEAD')response.end();else response.end(bytes);
  }catch(error){response.writeHead(404);response.end('Não encontrado')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/v2/index.html';
const browser=await chromium.launch({headless:true});
let page;
try{
 page=await browser.newPage({viewport:{width:1280,height:900}});
 page.on('pageerror',error=>console.error('BROWSER PAGE ERROR:',error.message));
 page.on('console',msg=>{if(msg.type()==='error')console.error('BROWSER CONSOLE ERROR:',msg.text())});
 // Evita autenticação externa. O fluxo de acervos públicos deve continuar operando.
 await page.route('https://accounts.google.com/**',route=>route.abort());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('#overviewStats .stat').first().waitFor({timeout:30000});
 assert.equal(await page.locator('#overviewStats .stat').count(),3);
 assert.match(await page.locator('#notice').textContent(),/1\.518 cartões/);
 assert.equal(await page.locator('#v2DriveConnect').count(),1,'barra de Drive única');
 // Imagens adicionais privadas não alteram 179 IDs editoriais já publicados.
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('v2-drive-images-updated',{detail:{newFiles:12}})));
 assert.equal((await page.locator('#overviewStats .stat').nth(1).locator('strong').textContent()).trim(),'179');
 assert.match(await page.locator('#overviewStats .stat').nth(1).textContent(),/\+12 arquivo\(s\) Drive/);
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('v2-drive-images-updated',{detail:null})));
 assert.equal(await page.locator('#overviewStats .stat').count(),3);
 await page.locator('[data-view="cards"]').click();
 await page.locator('#cardsList .item').first().waitFor();
 await page.locator('#cardQuery').fill('CARD-1502');
 await page.waitForFunction(()=>document.querySelectorAll('#cardsList .item').length===1);
 let card=page.locator('#cardsList .item').first();
 assert.equal(await card.locator('.answer').isVisible(),false,'gabarito começa oculto');
 await card.getByRole('button',{name:'Mostrar resposta'}).click();
 assert.equal(await card.locator('.answer').isVisible(),true);
 assert.equal(await card.locator('.v2-evo-panel').evaluate(e=>e.open),false,'11 módulos iniciam recolhidos');
 await card.locator('.v2-evo-panel > summary').click();
 try{await card.locator('.v2-evo-module').first().waitFor({timeout:12000});}
 catch(error){
   console.error('DIAGNÓSTICO EVOLUTIVO:',await card.locator('.v2-evo-host').textContent());
   throw error;
 }
 assert.equal(await card.locator('.v2-evo-module').count(),11);
 const origins=await card.locator('.v2-evo-source').allTextContents();
 assert.deepEqual(origins.map(x=>Number(x.replace(/\D/g,''))),[8,4,5,6,9,10,1,2,3,7,11]);
 assert.equal(await card.locator('.v2-evo-module[open]').count(),0,'módulos individuais recolhidos');
 await card.locator('.v2-evo-module').nth(7).locator('summary').click();
 assert.ok((await card.locator('.v2-evo-module').nth(7).locator('table').count())>=1,
   'quadro normativo deve formar tabela nativa sem HTML arbitrário');
 await page.locator('#cardQuery').fill('CARD-0138');
 await page.waitForFunction(()=>document.querySelectorAll('#cardsList .item').length===1);
 card=page.locator('#cardsList .item').first();
 await card.getByRole('button',{name:'Mostrar resposta'}).click();
 await card.locator('.v2-evo-panel > summary').click();
 await card.locator('.v2-evo-help').waitFor();
 assert.match(await card.locator('.v2-evo-help').textContent(),/reservado/);
 await page.locator('[data-view="images"]').click();
 assert.equal(await page.locator('#v2PrivateImages').count(),1);
 const extraBeforeCatalog=await page.evaluate(()=>{
   const extras=document.querySelector('#v2PrivateImages'),catalog=document.querySelector('#imagesList');
   return !!(extras.compareDocumentPosition(catalog)&Node.DOCUMENT_POSITION_FOLLOWING);
 });
 assert.equal(extraBeforeCatalog,true,'imagens adicionais devem aparecer antes do catálogo longo');
 await page.locator('#imageType').selectOption('cartao');
 await page.locator('#imageQuery').fill('IMG-C12-025');
 await page.waitForFunction(()=>document.querySelectorAll('#imagesList .item').length===1);
 await page.getByRole('button',{name:'Ver CARD-1504'}).click();
 await page.waitForFunction(()=>document.querySelector('#cardQuery')?.value==='CARD-1504');
 assert.equal(await page.locator('#cardsList .item').count(),1);
 await page.locator('#cardsList .item').first().getByRole('button',{name:'Mostrar resposta'}).click();
 assert.ok((await page.locator('.v2-related-images summary').textContent()).includes('Imagens relacionadas'));
 await page.locator('.v2-related-images > summary').click();
 await page.locator('.v2-related-item button').first().click();
 await page.waitForFunction(()=>document.querySelector('#imageQuery')?.value.startsWith('IMG-'));
 // A V2 lê um PDF local em memória, reconhece hash/chave V122 e não regrava grifos.
 await page.locator('[data-view="pdfs"]').click();
 await page.locator('#pdfQuery').fill('IJUI-PDF-05');
 await page.waitForFunction(()=>document.querySelectorAll('#pdfsList .item').length===1);
 await page.locator('#pdfsList .item').first().getByRole('button',{name:'Ler PDF na V2'}).click();
 assert.equal(await page.locator('#v2PdfDialog').evaluate(x=>x.open),true);
 assert.equal(await page.locator('#v2PdfExportHighlights').isDisabled(),true);
 const pdfBytes=examplePdf();
 const pdfHash=createHash('sha256').update(pdfBytes).digest('hex').slice(0,24);
 await page.locator('#v2PdfInput').setInputFiles({name:'teste-v2.pdf',mimeType:'application/pdf',buffer:pdfBytes});
 await page.waitForFunction(()=>document.querySelector('#v2PdfReaderIdentity')?.textContent.includes('SHA-256'));
 assert.ok((await page.locator('#v2PdfReaderIdentity').textContent()).includes(pdfHash));
 assert.ok((await page.locator('#v2PdfReaderFrame').getAttribute('src')).startsWith('blob:'));
 const storageKey='BM030_STROKES_PDF:IJUI-PDF-05:'+pdfHash+':P1';
 const otherKey='BM030_STROKES_PDF:IJUI-PDF-05:aaaaaaaaaaaaaaaaaaaaaaaa:P2';
 const seed=[
  {id:'mark_test_123',type:'text_highlight',text:'Trecho de prova',rects:[[.12,.20,.38,.27]],color:'#FDE68A',opacity:.40},
  {id:'mark_test_234',type:'text_highlight',text:'Marca removida',rects:[[.60,.40,.80,.50]],color:'#FF0000'}
 ];
 await page.evaluate(({storageKey,otherKey,seed})=>{
   localStorage.setItem(storageKey,JSON.stringify(seed));
   localStorage.setItem(otherKey,'[{"id":"legacy_diff","type":"text_highlight"}]');
   localStorage.setItem('BM122_DELETED_HIGHLIGHT_IDS',
     JSON.stringify({[storageKey]:{'id:mark_test_234':'2026-11-17T12:00:00Z'}}));
 },{storageKey,otherKey,seed});
 const storageBefore=await page.evaluate(key=>localStorage.getItem(key),storageKey);
 await page.locator('#v2PdfInspect').click();
 await page.waitForFunction(()=>document.querySelector('#v2PdfReaderMarks')?.textContent.includes('Grifos nesta revisão'));
 assert.match(await page.locator('#v2PdfReaderMarks').textContent(),/Grifos nesta revisão \(estimativa\): 1/);
 assert.match(await page.locator('#v2PdfReaderMarks').textContent(),/outra\(s\) versão/);
 assert.equal(await page.locator('#v2PdfExportHighlights').isEnabled(),true);
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),storageKey),storageBefore,
   'leitor não pode alterar dados históricos da V1');

 // O PDF.js é servido localmente no runner; nunca exige bytes de um PDF privado.
 await page.addScriptTag({url:'/node_modules/pdfjs-dist/build/pdf.min.js'});
 await page.evaluate(()=>{
   window.pdfjsLib.GlobalWorkerOptions.workerSrc='/node_modules/pdfjs-dist/build/pdf.worker.min.js';
 });
 assert.equal(await page.locator('#v2PdfOverlayShow').isEnabled(),true);
 await page.locator('#v2PdfOverlayShow').click();
 await page.locator('#v2PdfOverlayView').waitFor({state:'visible'});
 try{
  await page.waitForFunction(()=>{
   const c=document.querySelector('#v2PdfOverlayBase');
   return !!c&&c.width>0&&c.height>0&&document.querySelector('#v2PdfReaderNote')?.textContent.includes('exibido(s)');
  },null,{timeout:12000});
 }catch(error){
  console.error('DIAGNÓSTICO SOBREPOSIÇÃO:',await page.evaluate(()=>({
   note:document.querySelector('#v2PdfReaderNote')?.textContent,
   canvasWidth:document.querySelector('#v2PdfOverlayBase')?.width,
   canvasHeight:document.querySelector('#v2PdfOverlayBase')?.height,
   viewerVisible:!document.querySelector('#v2PdfOverlayView')?.hidden,
   pdfjs:typeof window.pdfjsLib?.getDocument,
   nav:document.querySelector('#v2PdfOverlayNav')?.textContent
  })));
  throw error;
 }
 assert.equal(await page.locator('#v2PdfOverlayPage').inputValue(),'1');
 assert.equal(await page.locator('#v2PdfOverlayPrev').isDisabled(),true);
 const pixels=await page.evaluate(()=>{
   const canvas=document.querySelector('#v2PdfOverlayBase'),context=canvas.getContext('2d');
   const at=(x,y)=>[...context.getImageData(Math.floor(x*canvas.width),Math.floor(y*canvas.height),1,1).data].slice(0,3);
   return {present:at(.2,.235),deletedArea:at(.7,.45),blank:at(.9,.9)};
 });
 assert.ok(pixels.present[2]<pixels.blank[2],'grifo autorizado aparece sobre raster PDF');
 assert.deepEqual(pixels.deletedArea,pixels.blank,'grifo tombstone não reaparece');
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),storageKey),storageBefore,
   'renderização sobre PDF não modifica localStorage');
 await page.locator('#v2PdfOverlayOriginal').click();
 assert.equal(await page.locator('#v2PdfReaderFrame').isVisible(),true);

 await page.locator('.v2-pdf-close').click();
 assert.equal(await page.locator('#v2PdfDialog').evaluate(x=>x.open),false);
 assert.equal(await page.locator('#v2PdfReaderFrame').getAttribute('src'),null);

 await page.locator('[data-view="sync"]').click();
 await page.locator('#v2AuditPanel').waitFor();
 assert.equal(await page.locator('#v2AuditPanel .audit-export button:disabled').count(),2,
   'sem OAuth não habilitar exportação privada');
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 assert.ok(overflow<=12,'interface não deve exceder a largura do celular: '+overflow);
 console.log('V2 browser smoke OK:',{
   cards:'verso oculto e módulos on-demand',
   modules:11,priority:'08→04→05→06→09→10→01→02→03→07→11',
   atlas:'bidirecional',pdf:'PDF.js real + grifos V1 e exclusões sem escrita',drive:'sem exportação privada anônima',mobileWidth:390
 });
}finally{
 await page?.close();
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
