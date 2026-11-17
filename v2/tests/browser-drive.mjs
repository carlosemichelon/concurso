/* V2 — OAuth e Google Drive API simulados. Nenhuma conta Google real.
 * Exercita GET autenticado, PDF/Atlas e descarte de mídias no logout.
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const path=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!(path===root||path.startsWith(root+sep)))throw Error('fora do projeto');
  if(!(await stat(path)).isFile())throw Error('diretório');
  const data=await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch(_){res.writeHead(404);res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
let page;
const imageId='test_private_image_2026_v2',pdfId='test_private_pdf_2026_v2';
const canonicalImageRoot='1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6';
const canonicalPdfRoot='1yvwhb-W-vMUMu5DmikE3hR-i01cnrWdK';
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="#345678"/></svg>';
function examplePdf(){
 const content='BT /F1 16 Tf 72 720 Td (PDF V2 de teste) Tj ET';
 const objects=[
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Length '+Buffer.byteLength(content)+' >>\nstream\n'+content+'\nendstream'
 ];
 let body='%PDF-1.4\n';const offsets=[0];
 for(let i=0;i<objects.length;i++){
  offsets.push(Buffer.byteLength(body));
  body+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n';
 }
 const start=Buffer.byteLength(body);
 body+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
 for(const x of offsets.slice(1))body+=String(x).padStart(10,'0')+' 00000 n \n';
 body+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';
 return Buffer.from(body);
}
const pdf=examplePdf();
const fakeGIS='window.google={accounts:{oauth2:{initTokenClient:({callback})=>({requestAccessToken:()=>callback({access_token:"TEST_ONLY_NOT_REAL",expires_in:3600})}),revoke:(_token,done)=>done?.()}}};';
const cors={'access-control-allow-origin':'*',
 'access-control-allow-methods':'GET,OPTIONS',
 'access-control-allow-headers':'authorization,content-type'};
const calls=[];
try{
 page=await browser.newPage({viewport:{width:1280,height:900}});
 page.on('pageerror',e=>console.error('MOCK DRIVE PAGE ERROR',e.message));
 await page.route('https://accounts.google.com/gsi/client',route=>route.fulfill({
  status:200,contentType:'text/javascript',body:fakeGIS,
  headers:{'access-control-allow-origin':'*'}
 }));
 await page.route('https://www.googleapis.com/**',async route=>{
  const req=route.request(),method=req.method(),parsed=new URL(req.url());
  calls.push({method,url:parsed.pathname,authorization:req.headers()['authorization']||''});
  if(method==='OPTIONS'){await route.fulfill({status:204,headers:cors});return}
  assert.equal(method,'GET','Drive é somente leitura');
  assert.ok(parsed.pathname.startsWith('/drive/v3/files'));
  assert.equal(req.headers()['authorization'],'Bearer TEST_ONLY_NOT_REAL');
  if(parsed.searchParams.get('alt')==='media'){
   if(parsed.pathname.endsWith('/'+imageId)){
    await route.fulfill({status:200,body:svg,contentType:'image/svg+xml',headers:cors});return;
   }
   if(parsed.pathname.endsWith('/'+pdfId)){
    await route.fulfill({status:200,body:pdf,contentType:'application/pdf',headers:cors});return;
   }
   await route.fulfill({status:404,body:'não encontrado',headers:cors});return;
  }
  const query=parsed.searchParams.get('q')||'';
  const folder=query.match(/^'([^']+)' in parents/)?.[1]||'';
  const files=folder===canonicalImageRoot?
   [{id:imageId,name:'Diagrama privado.svg',mimeType:'image/svg+xml',
     size:String(Buffer.byteLength(svg)),parents:[folder],modifiedTime:'2026-11-17T14:00:00Z'}]:
   folder===canonicalPdfRoot?
   [{id:pdfId,name:'Apostila privada.pdf',mimeType:'application/pdf',
     size:String(pdf.length),parents:[folder],modifiedTime:'2026-11-17T14:10:00Z'}]:[];
  await route.fulfill({status:200,contentType:'application/json',
   headers:cors,body:JSON.stringify({files})});
 });
 const url='http://127.0.0.1:'+server.address().port+'/v2/index.html';
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.querySelector('#v2DriveConnect')?.disabled,
  null,{timeout:20000});
 assert.equal((await page.locator('#overviewStats .stat').nth(1).locator('strong').textContent()).trim(),'179');
 await page.locator('#v2DriveConnect').click();
 await page.waitForFunction(()=>document.querySelectorAll('#v2DriveImagesList .drive-private-item').length===1&&
  document.querySelectorAll('#v2DrivePdfsList .drive-private-item').length===1,null,{timeout:25000});
 assert.equal(await page.locator('#v2DriveState').textContent(),'Conectado · leitura');
 assert.match(await page.locator('#overviewStats .stat').nth(1).textContent(),/\+1 arquivo\(s\) Drive/);
 assert.equal((await page.locator('#overviewStats .stat').nth(1).locator('strong').textContent()).trim(),'179');
 await page.locator('[data-view="images"]').click();
 await page.locator('#v2DriveImagesList').getByRole('button',{name:'Ver prévia'}).click();
 await page.waitForFunction(()=>document.querySelector('#v2DriveImagesList .bm-v2-drive-preview')?.naturalWidth>0,
  null,{timeout:15000});
 await page.locator('[data-view="pdfs"]').click();
 await page.locator('#v2DrivePdfsList').getByRole('button',{name:'Ler PDF na V2'}).click();
 await page.locator('#v2PdfRemote').click();
 await page.waitForFunction(()=>document.querySelector('#v2PdfReaderIdentity')?.textContent.includes('SHA-256'),
  null,{timeout:15000});
 assert.match(await page.locator('#v2PdfReaderIdentity').textContent(),/DRIVE-PDF-test_private_pdf_2026_v2/);
 assert.ok((await page.locator('#v2PdfReaderFrame').getAttribute('src')).startsWith('blob:'));
 // Testar o botão Sair da própria barra, por trás do modal.
 await page.evaluate(()=>document.querySelector('#v2DriveDisconnect').click());
 await page.waitForFunction(()=>!document.querySelector('#v2PdfDialog')?.open,
  null,{timeout:10000});
 assert.equal(await page.locator('#v2DriveImagesList .drive-private-item').count(),0);
 assert.equal(await page.locator('#v2DrivePdfsList .drive-private-item').count(),0);
 assert.equal((await page.locator('#overviewStats .stat').nth(1).locator('strong').textContent()).trim(),'179');
 assert.equal(await page.evaluate(()=>localStorage.length),0,'nenhum token ou anotação persistido');
 assert.ok(calls.length>=8);
 assert.equal(calls.some(x=>!['GET','OPTIONS'].includes(x.method)),false);
 console.log('V2 simulated Drive browser OK:',{
   image:'SVG privado simulado',pdf:'PDF por OAuth simulado',
   logout:'PDF e imagens descartados',publishedAtlas:179,writeRequests:0
 });
}finally{
 await page?.close();await browser.close();await new Promise(r=>server.close(r));
}
