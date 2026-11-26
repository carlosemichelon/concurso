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
   if(!/^(?:preview-vs41-reader\/(?:index\.html|app\.mjs|reader\.js)|infra\/vs41-private\/(?:browser-drive|records)\.mjs)$/.test(rel))if(!/^assets\/(?:v349_shared_reader\.css|v417_math_engine\.js|(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.svg)$/.test(rel))return route.abort();
   const mime=rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':/\.(?:mjs|js)$/.test(rel)?'application/javascript':'text/html';
   if(!fs.existsSync(rel))return route.fulfill({status:404});
   return route.fulfill({contentType:mime,body:fs.readFileSync(rel,'utf8')});
  }
  if(url.href==='https://accounts.google.com/gsi/client')return route.fulfill({contentType:'application/javascript',body:'window.google={accounts:{oauth2:{hasGrantedAllScopes:()=>true,initTokenClient:c=>({requestAccessToken(){c.callback({access_token:window.__account||"A",expires_in:3600})}})}}};'});
  if(url.origin!=='https://www.googleapis.com')return route.abort();
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
  assert.equal(req.method(),'GET');
  const account=req.headers()['authorization']?.slice(7);assert.ok(['A','B'].includes(account));calls.push(account);
  const id=url.pathname.split('/').at(-1);
  if(id==='about')return json({user:{permissionId:'owner'+account}});
  const fm='application/vnd.google-apps.folder';
  const dirs={rootA:{id:'rootA',name:'DataBase_Concurso',mimeType:fm,parents:[]},cardsA:{id:'cardsA',name:'01 - Cartões',mimeType:fm,parents:['rootA']},privateA:{id:'privateA',name:'Dados privados',mimeType:fm,parents:['cardsA']}};
  if(id==='files'){
   const q=url.searchParams.get('q')||'';
   if(account!=='A')return json({files:[]});
   if(q.includes("name = 'BANCO_MESTRE_ATUAL.json'"))return json({files:[]});
   const f=q.includes("'rootA'")&&q.includes("'01 - Cartões'")?dirs.cardsA:q.includes("'cardsA'")&&q.includes("'Dados privados'")?dirs.privateA:q.includes("'privateA'")&&q.includes("'VC52_EDITORIAL_CANDIDATA.json'")?{id:'candidate',name:'VC52_EDITORIAL_CANDIDATA.json',mimeType:'application/json',parents:['privateA']}:null;
   return json({files:f?[f]:[]});
  }
  if(dirs[id])return account==='A'?json({...dirs[id],ownedByMe:true,shared:false,trashed:false}):json({},403);
  if(id==='root'+account)return json({id,mimeType:fm,ownedByMe:true,shared:false,trashed:false,parents:[]});
  const owner=id==='candidate'||id==='tampered'?'A':id==='other'?'B':null;
  if(owner!==account)return json({},403);
  const bytes=id==='candidate'?original:id==='tampered'?original+' ':fixture;
  if(url.searchParams.has('alt'))return route.fulfill({headers,contentType:'application/json',body:bytes});
  return json({id,name:id==='candidate'?'VC52_EDITORIAL_CANDIDATA.json':id+'.json',mimeType:'application/json',ownedByMe:true,shared:false,trashed:false,parents:[id==='candidate'?'privateA':'root'+account],version:'1',size:String(Buffer.byteLength(bytes))});
 });
 await page.goto(base+'preview-vs41-reader/index.html');
 await page.waitForFunction(()=>!document.querySelector('#connect').disabled);
 await page.locator('#connect').click();
 await page.locator('#source').fill('candidate');await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#summary').textContent.includes('1460 cartões ativos'),{},{timeout:30000});
 assert.match(await page.locator('#summary').innerText(),/candidato editorial/);
 await page.locator('#list button').first().click();await page.getByRole('button',{name:'Revelar resposta'}).click();
 assert.ok((await page.locator('#card').innerText()).length>20);
 for(const width of [1366,390]){
 await page.setViewportSize({width,height:900});
 for(const id of ['CARD-0047','CARD-0690','CARD-0709','CARD-8917']){
  await page.locator('#search').fill(id);
  await page.locator('#list button').first().click();
  assert.equal(await page.locator('#card .bm-v050-peek-answer').isVisible(),false);
  await page.getByRole('button',{name:'Revelar resposta'}).click();
  const article=page.locator('#card .bm349-reading');await article.waitFor({state:'visible'});
  assert.equal(await article.locator('.historic-module').count(),11);
  assert.equal(await article.locator('p[data-bm-answer-paragraph]').count(),JSON.parse(original).cards.find(c=>c.id===id).consolidation.profile.editorial.answer_paragraphs.length);
  const box=await article.boundingBox();assert.ok(box.width<=width);
  assert.equal(await article.locator('figure').count(),JSON.parse(original).cards.find(c=>c.id===id).consolidation.profile.editorial.media.filter(m=>m.role==='VERSO_APOS_TENTATIVA'&&(m.src||m.inline_svg||m.private_original)).length);
 }
}
 await page.locator('#source').fill('https://drive.google.com/drive/folders/rootA');await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('único ponteiro vigente'));
 assert.equal(await page.locator('#results').isVisible(),false);
 await page.locator('#editorial-preview').check();await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#summary').textContent.includes('1460 cartões ativos'));
 assert.match(await page.locator('#summary').innerText(),/candidato editorial/);
 await page.locator('#editorial-preview').uncheck();
 await page.locator('#source').fill('tampered');await page.locator('#load').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('não corresponde'));
 assert.equal(await page.locator('#results').isVisible(),false);
 await page.locator('#disconnect').click();assert.equal(await page.locator('#card').innerText(),'');assert.equal(await page.evaluate(()=>window.cards.length),0);
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
