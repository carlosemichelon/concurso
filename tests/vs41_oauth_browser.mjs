import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const base='https://carlosemichelon.github.io/concurso/',scope='https://www.googleapis.com/auth/drive.file';
const browser=await chromium.launch({headless:true});const files=new Map();let serial=0,created=0,trashed=0,consent=false;
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url()),method=req.method(),headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,PATCH,OPTIONS','access-control-allow-headers':'authorization,content-type'};
  const json=(obj,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(obj)});
  if(url.href.startsWith(base)){
   const rel=url.href.slice(base.length);if(!/^(?:teste-drive-vs41\/(?:index\.html|diagnostico\.js|catalog\.js|drive-smoke\.js)|assets\/drive_auth_v038\.json)$/.test(rel))return route.abort();
   return route.fulfill({contentType:rel.endsWith('.js')?'application/javascript':rel.endsWith('.json')?'application/json':'text/html',body:fs.readFileSync(rel,'utf8')});
  }
  if(url.href==='https://accounts.google.com/gsi/client')return route.fulfill({contentType:'application/javascript',body:`window.google={accounts:{oauth2:{hasGrantedAllScopes:(r,s)=>r.scope===s,initTokenClient:c=>({requestAccessToken(){if(c.scope!==${JSON.stringify(scope)}||c.include_granted_scopes!==false)throw Error('scope');c.callback(window.__testConsent?{access_token:'fixture',scope:c.scope}:{error:'access_denied'})}})}}};`});
  if(url.origin!=='https://www.googleapis.com')return route.abort();
  if(method==='OPTIONS')return route.fulfill({status:204,headers});
  assert.equal(req.headers()['authorization'],'Bearer fixture');
  if(method==='POST'){
   let meta,payload;if(url.pathname.includes('/upload/')){const p=req.postData().split('\r\n');meta=JSON.parse(p[3]);payload=JSON.parse(p[7])}else meta=JSON.parse(req.postData());
   const id='test'+(++serial);files.set(id,{meta:{...meta,id,ownedByMe:true,shared:false,trashed:false,version:'1',size:'300'},payload});created++;return json({id});
  }
  const id=url.pathname.split('/').at(-1),f=files.get(id);if(!f)return json({},404);
  if(method==='PATCH'){assert.deepEqual(JSON.parse(req.postData()),{trashed:true});f.meta.trashed=true;trashed++;return json({id,trashed:true})}
  return json(url.searchParams.get('alt')==='media'?f.payload:f.meta);
 });
 await page.goto(base+'teste-drive-vs41/index.html');
 await page.locator('#run').waitFor();await page.waitForFunction(()=>!document.querySelector('#run').disabled);
 await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Autorização não concedida'));assert.equal(created,0);
 await page.evaluate(()=>window.__testConsent=true);
 await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Teste real aprovado'));
 assert.equal(created,6);assert.equal(trashed,6);assert.equal(await page.evaluate(()=>localStorage.length),0);
 assert.equal(await page.evaluate(()=>sessionStorage.length),0);
 assert.deepEqual(errors,[]);
 console.log('Diagnóstico OAuth no navegador: recusa sem escrita, consentimento simulado, leitura e limpeza de seis arquivos aprovados.');
}finally{await browser.close()}
