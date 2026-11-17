/* Site V2 — teste funcional de navegador isolado, sem login e sem escrita no Drive.
 * Rodar em runner com playwright instalado: node v2/tests/browser.mjs
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
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
   atlas:'bidirecional',drive:'sem exportação privada anônima',mobileWidth:390
 });
}finally{
 await page?.close();
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
