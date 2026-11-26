import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base='https://carlosemichelon.github.io/concurso/';
const original=fs.readFileSync(process.argv[2],'utf8');
const fixture=JSON.stringify({format:'BancoMestrePrivadoV159',schema_version:1,version:'TESTE-B',counts:{cards:1},cards:[{id:'CARD-0001',front:'Pergunta exclusiva B',back:'Resposta exclusiva B',expl:'Explicação B',active:true,discipline:'Teste',subject:'Teste',group:'OUTROS',related_card_ids:[]}]});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();const errors=[],calls=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  const headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS','access-control-allow-headers':'authorization'};
  const json=(obj,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(obj)});
  if(url.href.startsWith(base)){
   const rel=url.pathname.slice(new URL(base).pathname.length);
   if(!/^(?:preview-drive\/(?:index\.html|app\.mjs)|infra\/vs41-private\/(?:browser-drive|records)\.mjs)$/.test(rel))return route.abort();
   return route.fulfill({contentType:rel.endsWith('.mjs')?'application/javascript':'text/html',body:fs.readFileSync(rel,'utf8')});
  }
  if(url.href==='https://accounts.google.com/gsi/client')return route.fulfill({contentType:'application/javascript',body:'window.google={accounts:{oauth2:{hasGrantedAllScopes:()=>true,initTokenClient:c=>({requestAccessToken(){c.callback({access_token:window.__account||"A",expires_in:3600})}})}}};'});
  if(url.origin!=='https://www.googleapis.com')return route.abort();
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
  assert.equal(req.method(),'GET');
  const account=req.headers()['authorization']?.slice(7);assert.ok(['A','B'].includes(account));calls.push(account);
  const id=url.pathname.split('/').at(-1);
  if(id==='about')return json({user:{permissionId:'owner'+account}});
  if(id==='root'+account)return json({id,mimeType:'application/vnd.google-apps.folder',ownedByMe:true,shared:false,trashed:false,parents:[]});
  const owner=id==='candidate'||id==='tampered'?'A':id==='other'?'B':null;
  if(owner!==account)return json({},403);
  const bytes=id==='candidate'?original:id==='tampered'?original+' ':fixture;
  if(url.searchParams.has('alt'))return route.fulfill({headers,contentType:'application/json',body:bytes});
  return json({id,name:id+'.json',mimeType:'application/json',ownedByMe:true,shared:false,trashed:false,parents:['root'+account],version:'1',size:String(Buffer.byteLength(bytes))});
 });
 await page.goto(base+'preview-drive/index.html');
 await page.waitForFunction(()=>!document.querySelector('#connect').disabled);
 await page.locator('#connect').click();
 await page.locator('#source').fill('candidate');await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#summary').textContent.includes('1460 cartões ativos'),{},{timeout:30000});
 assert.match(await page.locator('#summary').innerText(),/candidato editorial/);
 await page.locator('#list button').first().click();await page.getByRole('button',{name:'Revelar resposta'}).click();
 assert.ok((await page.locator('#card').innerText()).length>20);
 await page.locator('#source').fill('tampered');await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('não corresponde'));
 assert.equal(await page.locator('#results').isVisible(),false);
 await page.locator('#disconnect').click();assert.equal(await page.locator('#card').innerText(),'');
 await page.evaluate(()=>window.__account='B');await page.locator('#connect').click();
 await page.locator('#source').fill('candidate');await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('HTTP 403'));
 assert.equal(await page.locator('#results').isVisible(),false);
 await page.locator('#source').fill('other');await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#summary').textContent.includes('TESTE-B'));
 assert.match(await page.locator('#list').innerText(),/Pergunta exclusiva B/);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 await page.locator('#disconnect').click();assert.equal(await page.locator('#list').innerText(),'');assert.deepEqual(errors,[]);
 assert.ok(calls.includes('A')&&calls.includes('B'));
 console.log('Prévia: VC52 integral, alteração de bytes rejeitada, duas contas simuladas, acesso cruzado negado e logout sem persistência.');
}finally{await browser.close();}
