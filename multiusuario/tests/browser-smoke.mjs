import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve,extname,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),path=resolve(root,'.'+pathname);if(!path.startsWith(resolve(root,'multiusuario')+sep)&&![resolve(root,'assets/v315_styles_core.css'),resolve(root,'assets/v315_styles_polish.css')].includes(path))throw Error('path');const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const origin='http://127.0.0.1:'+server.address().port,project='banco-mestre-multiusuario-v001';
const browser=await chromium.launch({headless:true});
const clone=x=>JSON.parse(JSON.stringify(x));
const database=owner=>({schema:project,cards:[{id:'CARD-0001',state:'active',topic:'Engenharia / Estruturas',question:'Pergunta exclusiva '+owner,answer:'Resposta exclusiva '+owner,createdAt:'2020-01-01T12:00:00Z',approvedAt:'2020-01-01T12:00:00Z',history:[],related:[],modules:[]}],events:[],questions:[],media:[],pdf:[],sessions:[]});
const make=async(owner,width=1280)=>{
 const context=await browser.newContext({viewport:{width,height:800}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const folder={id:'root'+owner,name:'Privado',mimeType:'application/vnd.google-apps.folder',ownedByMe:true,shared:false,appProperties:{bmProject:project,bmOwner:owner,bmKind:'root'}};
 const snap={id:'snap'+owner+'0',mimeType:'application/json',ownedByMe:true,shared:false,parents:[folder.id],appProperties:{bmProject:project,bmOwner:owner,bmKind:'snapshot',bmPrev:'root'},payload:{project,owner,previous:'root',data:database(owner)}};
 const files=new Map([[folder.id,folder],[snap.id,snap]]);
 let serial=0;
 await context.route('**/*',route=>{const u=new URL(route.request().url());return u.origin===origin?route.continue():route.abort('blockedbyclient')});
 const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,OPTIONS'};
 await context.route('https://accounts.google.com/gsi/client',route=>route.fulfill({contentType:'application/javascript',body:'window.google={accounts:{oauth2:{initTokenClient:(o)=>({requestAccessToken:()=>o.callback({access_token:"token-'+owner+'",expires_in:3600})})}}}'}));
 await context.route('https://openidconnect.googleapis.com/**',route=>route.request().method()==='OPTIONS'?route.fulfill({status:204,headers}):route.fulfill({headers,json:{sub:owner,email:owner+'@example.test',email_verified:true}}));
 await context.route('https://www.googleapis.com/**',async route=>{
  const req=route.request(),url=new URL(req.url()),reply=(json,status=200)=>route.fulfill({status,headers,json});
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
  if(req.headers().authorization!=='Bearer token-'+owner)return reply({error:'owner'},403);
  if(url.pathname==='/drive/v3/files'&&req.method()==='GET'){const q=url.searchParams.get('q')||'',kind=q.match(/key='bmKind' and value='([^']+)'/)?.[1],subject=q.match(/key='bmOwner' and value='([^']+)'/)?.[1];return reply({files:[...files.values()].filter(f=>f.appProperties.bmKind===kind&&f.appProperties.bmOwner===subject)})}
  if(url.pathname==='/upload/drive/v3/files'&&req.method()==='POST'){const parts=req.postData().split('\r\n\r\n'),meta=JSON.parse(parts[1].split('\r\n--')[0]),payload=JSON.parse(parts[2].split('\r\n--')[0]);if(meta.appProperties.bmOwner!==owner||payload.owner!==owner||meta.parents[0]!==folder.id)return reply({error:'cross owner'},403);const f={...meta,id:'snap'+owner+(++serial),ownedByMe:true,shared:false,payload};files.set(f.id,f);return reply(f)}
  const f=files.get(url.pathname.split('/').at(-1));if(!f)return reply({error:'missing'},404);return reply(url.searchParams.get('alt')==='media'?f.payload:f);
 });
 // No unmocked network, no real account or Drive.
 await page.goto(origin+'/multiusuario/index.html');
 await page.waitForFunction(()=>!!window.google?.accounts?.oauth2);await page.locator('#login').click();await page.locator('#nav').waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('#account').textContent.includes('@example.test'));
 return {context,page,errors,files};
};
try{
 const a=await make('A'),b=await make('B',390);
 for(const [x,owner] of [[a,'A'],[b,'B']]){
  await x.page.locator('[data-view="cards"]').click();
  await x.page.getByText('Pergunta exclusiva '+owner,{exact:true}).waitFor();
  assert.equal(await x.page.getByText('Pergunta exclusiva '+(owner==='A'?'B':'A'),{exact:true}).count(),0);
  await x.page.getByRole('button',{name:'Ver cartão',exact:true}).click();
  assert.equal(await x.page.getByText('Resposta exclusiva '+owner,{exact:true}).count(),0);
  await x.page.getByRole('button',{name:'Mostrar resposta',exact:true}).click();
  await x.page.getByText('Resposta exclusiva '+owner,{exact:true}).waitFor();
 }
 assert.equal(await b.page.getByRole('button',{name:'Cartões relacionados',exact:true}).count(),1);
 await b.page.getByRole('button',{name:'Cartões relacionados',exact:true}).click();
 await b.page.getByRole('button',{name:'Ocultar relacionados',exact:true}).waitFor();
 await a.page.locator('[data-view="review"]').click();
 await a.page.getByRole('button',{name:'Próximo cartão',exact:true}).click();
 await a.page.getByRole('button',{name:'Revelar resposta',exact:true}).click();
 assert.equal(await a.page.getByRole('button',{name:/^Errei/}).count(),0);
 await a.page.getByRole('button',{name:'Difícil · 8d',exact:true}).click();
 await a.page.waitForFunction(()=>document.querySelector('#cloudStatus').textContent==='Drive privado conectado');
 const last=[...a.files.values()].at(-1).payload;assert.equal(last.data.events.length,1);assert.equal(last.data.events[0].rating,'Difícil');assert.equal([...b.files.values()].at(-1).payload.data.events.length,0);
 await a.page.locator('#logout').click();await a.page.locator('#login').waitFor({state:'visible'});
 assert.equal(await a.page.getByText('Resposta exclusiva A',{exact:true}).count(),0);
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 await a.context.close();await b.context.close();console.log('PASS browser smoke: two synthetic accounts, mobile sidebar, reveal, SRS, save, logout');
}catch(error){for(const context of browser.contexts())for(const page of context.pages()){console.error('Diagnóstico de interface (dados fictícios):',await page.locator('body').innerText().catch(()=>''));}throw error}finally{await browser.close();server.close()}
