// Full-catalog regression: the private transport must not replace the original VS41 reader or CSS.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createPortalHost} from '../infra/vs41-private/host.mjs';
import {privatePage} from '../infra/vs41-private/page.mjs';
import {createApi} from '../infra/vs41-private/api.mjs';
import {parseUsers,passwordHash} from '../infra/vs41-private/auth.mjs';
import {fixture,profiles} from './vs41_private_fixture.mjs';
const root=process.cwd(),html=fs.readFileSync('index.html','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/version.json','utf8'));
const seed=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
assert.equal(seed.version,'VC52');assert.equal(seed.cards.length,1460);
assert.equal(manifest.catalog.display_version,'VC52');
const css=s=>[...s.matchAll(/<link\b[^>]*href=["'](assets\/[^"']+\.css)(?:\?[^"']*)?["']/g)].map(m=>m[1]);
const styles=css(html);assert.ok(styles.length>0);assert.deepEqual(css(privatePage(html)),styles);
const f=fixture(),payload=f.files.get('cardsA').payload;
payload.records=seed.cards;
f.files.get('cardsA').meta.size=String(Buffer.byteLength(JSON.stringify(payload)));
const password='fixture-A-layout-only';
const users=parseUsers(JSON.stringify([{username:'A',...profiles.A,passwordHash:await passwordHash(password)}]));
let handler;const server=http.createServer((req,res)=>handler(req,res));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const api=createApi({users,origin,getToken:async s=>{assert.equal(s.subject,'A');return {token:'fixture'}},fetcher:f.fetcher});
handler=createPortalHost({root,api});
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:900}});
 const login=await context.request.post(origin+'/api/vs41/login',{headers:{Origin:origin},data:{username:'A',password}});assert.equal(login.status(),200);
 for(const file of styles){const r=await context.request.get(origin+'/'+file);assert.equal(r.status(),200);assert.ok((await r.body()).equals(fs.readFileSync(file)),'CSS must be byte-identical: '+file);}
 const page=await context.newPage();let publicReads=0;const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin){if(u.hostname==='cdnjs.cloudflare.com'&&/\/pdf\.js\/3\.11\.174\/pdf(?:\.worker)?\.min\.js$/.test(u.pathname))return r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'node_modules/pdfjs-dist/build',u.pathname.split('/').pop()))});return r.abort();}if(u.pathname.includes(manifest.catalog.path)||/\/assets\/catalog_snapshot_|\/assets\/cards_drive_sync_/.test(u.pathname)){publicReads++;return r.abort()}return r.continue()});
 await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>typeof loadCards==='function'&&window.BancoMestreVisualizarCardV050);
 await page.evaluate(()=>loadCards());
 assert.equal(await page.evaluate(()=>cards.length),1460);
 const ids=['CARD-0047','CARD-0690','CARD-0709','CARD-8917'];
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:900});
  for(const id of ids){
   const expected=seed.cards.find(c=>c.id===id);
   const profile=expected.consolidation.profile;
   assert.equal(profile.modules.length,11);
   assert.ok(await page.evaluate(id=>window.BancoMestreVisualizarCardV050.showId(id),id));
   const answer=page.locator('#bmCardPeekV050 .bm-v050-peek-answer');
   assert.equal(await answer.isVisible(),false);
   await page.locator('#bmCardPeekV050 .bm-v050-peek-reveal').click();
   const article=answer.locator('.bm349-reading');await article.waitFor({state:'visible'});
   assert.equal(await article.getAttribute('data-render-fallback'),null);
   assert.equal(await article.locator('.historic-module').count(),11);
   const paragraphs=await article.locator('p[data-bm-answer-paragraph]').allTextContents();
   assert.deepEqual(paragraphs,profile.editorial.answer_paragraphs.map(p=>typeof p==='string'?p:p.text||p.texto),'Answer paragraphs '+id);
   for(const media of profile.editorial.media||[]){assert.equal(await page.locator('#bmCardPeekV050 figure[data-media-id="'+media.id+'"]').count()>0,true,'Media slot '+media.id);}
   const rect=await article.boundingBox();assert.ok(rect&&rect.width>0&&rect.width<=width,'reader must fit viewport');
   await page.evaluate(()=>window.BancoMestreVisualizarCardV050.close());
  }
 }
 assert.equal(publicReads,0,'No public catalog fallback');
 console.log('VC52: 1460 cartões pela fonte simulada, CSS original byte a byte, 4 cartões com 11 módulos, parágrafos e figuras em desktop e celular; nenhum fallback público.');
}finally{await browser.close();server.close();}
