// Real original document, no intermediary or iframe. Google is simulated for repeatability.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fixture} from './vs41_browser_account_fixture.mjs';
const out=process.argv[2]||'/tmp/bm-original-account',base='https://carlosemichelon.github.io/concurso/';
const source=fs.readFileSync('index.html','utf8'),built=fs.readFileSync(path.join(out,'index.html'),'utf8');
const css=s=>[...s.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/g)].map(m=>m[0]);
assert.deepEqual(css(built),css(source),'As folhas de estilo originais devem permanecer idênticas');
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:900}}),page=await context.newPage();
 const errors=[],networkWrites=[],dataRequests=[];let account='A';
 page.on('pageerror',e=>errors.push(e.message));
 const fixtures={A:fixture('A'),B:fixture('B')};
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.href==='https://accounts.google.com/gsi/client')return route.fulfill({contentType:'application/javascript',body:'window.google={accounts:{oauth2:{hasGrantedAllScopes:()=>true,initTokenClient:c=>({requestAccessToken(o){window.__prompt=o.prompt;c.callback({access_token:'+JSON.stringify(account)+',expires_in:3600})}})}}};'});
  if(url.origin==='https://www.googleapis.com'){
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization','access-control-allow-methods':'GET,OPTIONS'}});
   if(req.method()!=='GET'){networkWrites.push(url.href);return route.fulfill({status:403});}
   const key=req.headers().authorization?.slice(7);assert.equal(key,account);
   const res=await fixtures[key](req.url(),{method:'GET',headers:{Authorization:'Bearer '+key}});
   return route.fulfill({status:res.status,contentType:'application/json',body:await res.text(),headers:{'access-control-allow-origin':'*'}});
  }
  if(url.href.startsWith(base)){
   const rel=url.pathname.slice(new URL(base).pathname.length)||'index.html';
   if(/(?:catalog_snapshot_|cards_drive_sync_|layers_public_).*\.json$/.test(rel)){dataRequests.push(rel);return route.abort();}
   const f=fs.existsSync(path.join(out,rel))?path.join(out,rel):path.join(process.cwd(),rel);
   if(!fs.existsSync(f)||!fs.statSync(f).isFile())return route.fulfill({status:404});
   const type=rel.endsWith('.css')?'text/css':/\.(?:mjs|js)$/.test(rel)?'application/javascript':rel.endsWith('.json')?'application/json':rel.endsWith('.svg')?'image/svg+xml':'text/html';
   return route.fulfill({contentType:type,body:fs.readFileSync(f)});
  }
  return route.abort();
 });
 for(const a of ['A','B']){
  account=a;
  await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
  const btn=page.locator('#bm239-drive-action');
  await page.waitForFunction(()=>document.getElementById('bm239-drive-action')?.textContent==='Selecionar conta Google'&&!document.getElementById('bm239-drive-action').disabled);
  assert.equal(await page.locator('#bm-vs41-chat-destination,#bm-vs41-logout,#full-portal').count(),0);
  await btn.click();
  await page.waitForFunction(()=>window.BMVS41Session?.available()===true,{},{timeout:30000});
  assert.equal(await page.evaluate(()=>window.__prompt),'select_account');
  await page.evaluate(()=>loadCards());
  assert.deepEqual(await page.evaluate(()=>cards.map(c=>c.front)),['Pergunta privada '+a]);
  console.log('Conta '+a+': cartões confirmados exclusivamente no Drive.');
  await page.locator('#bm240-study-tab').click();
  await page.locator('#bm240-native-host #bm252-main-nav').waitFor({state:'visible',timeout:30000});
  await page.waitForFunction(()=>window.BMVS41StudyControl?.confirmed===true);
  await page.locator('#bm240-native-host #bm252-main-nav button[data-group="relatorios"]').click();
  await page.locator('#bm240-native-host main #painel').waitFor({state:'visible',timeout:10000});
  assert.deepEqual(await page.evaluate(()=>window.BMVS41StudyControl.snapshot().subjects.map(s=>s.name).filter(x=>x.startsWith('Disciplina '))),['Disciplina '+a]);
  console.log('Conta '+a+': Controle de Estudos confirmado e relatórios visíveis.');
  assert.ok(await page.evaluate(()=>window.BancoMestreVisualizarCardV050.showId('CARD-9901')));
  await page.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
  await page.locator('#bmCardPeekV050 .bm349-reading').waitFor({state:'visible'});
  assert.equal(await page.locator('#bmCardPeekV050 .historic-module').count(),11);
  assert.ok((await page.locator('#bmCardPeekV050 .bm349-reading').innerText()).includes('Resposta privada '+a));
  await page.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  await page.setViewportSize({width:390,height:844});
  assert.ok(await btn.isVisible());
  await page.setViewportSize({width:1366,height:900});
  // Switching accounts destroys the entire prior realm, including the in-memory storage.
  await btn.click();
  await page.waitForFunction(()=>document.getElementById('bm239-drive-action')?.textContent==='Selecionar conta Google');
  assert.equal(await page.evaluate(()=>window.BMVS41Session.available()),false);
 }
 assert.deepEqual(dataRequests,[]);assert.deepEqual(networkWrites,[]);
 assert.deepEqual(errors,[]);
 console.log('Original portal: header Google account selection, cards and study control from two accounts, no iframe, no public catalogue, no writes.');
}catch(e){console.error('Falha no teste de interface:',e.message);throw e}finally{await browser.close()}
