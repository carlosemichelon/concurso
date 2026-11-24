import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
const output='test-artifacts/central-chrome',base='http://127.0.0.1:8765/preview-multiusuario/';
const executable=process.env.CHROME_BIN;
if(!executable)throw Error('CHROME_BIN não configurado');
await mkdir(output,{recursive:true});
const dir=await mkdtemp(join(tmpdir(),'bm-chrome-'));
const child=spawn(executable,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--no-first-run','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='';child.stderr.on('data',b=>{stderr=(stderr+b).slice(-10000)});
async function wait(fn,label,ms=15000){const end=Date.now()+ms;let last;while(Date.now()<end){try{const x=await fn();if(x)return x}catch(e){last=e}await delay(120)}throw Error(label+(last?': '+last.message:''))}
async function connect(url){
 const ws=new WebSocket(url),pending=new Map(),errors=[];let seq=0;
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 ws.addEventListener('message',e=>{const x=JSON.parse(e.data);if(x.id&&pending.has(x.id)){const p=pending.get(x.id);pending.delete(x.id);clearTimeout(p.timer);if(x.error)p.reject(Error(x.error.message));else p.resolve(x.result)}else if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);else if(x.method==='Runtime.consoleAPICalled'&&x.params.type==='error')errors.push(x.params.args.map(a=>a.value??a.description).join(' '))});
 function cmd(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method))},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}))})}
 async function evaluate(expression){const r=await cmd('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
 await cmd('Runtime.enable');await cmd('Page.enable');await cmd('Network.enable');
 await cmd('Network.setBlockedURLs',{urls:['https://accounts.google.com/*','https://www.googleapis.com/*','https://drive.google.com/*']});
 return {cmd,evaluate,errors,close:()=>ws.close()};
}
const results=[];
try{
 const port=await wait(async()=>Number((await readFile(join(dir,'DevToolsActivePort'),'utf8')).split('\n')[0]),'Chrome não iniciou');
 const endpoint='http://127.0.0.1:'+port;
 async function page(profile,width=1366){
  const t=await fetch(endpoint+'/json/new?about:blank',{method:'PUT'}).then(r=>r.json()),p=await connect(t.webSocketDebuggerUrl);
  await p.cmd('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
  await p.cmd('Page.navigate',{url:base+'portal.html?perfil='+profile});
  await wait(()=>p.evaluate("document.readyState==='complete'&&!document.body.hidden"),'Inicialização');
  const status=await p.evaluate("document.getElementById('bm239-sync-details')?.textContent||document.body.innerText.slice(0,500)");
  assert.ok(status.includes('Perfil '+profile),'Perfil não abriu: '+status+' / '+p.errors.join('; '));
  return p;
 }
 async function run(name,fn,profile='A',width=1366){
  let p;try{p=await page(profile,width);await fn(p);assert.deepEqual(p.errors,[],'Erros no navegador');results.push({name,ok:true})}
  catch(e){results.push({name,ok:false,error:String(e.stack||e),browserErrors:p?.errors||[]})}
  finally{if(p){try{const r=await p.cmd('Page.captureScreenshot',{format:'png'});await writeFile(join(output,name+'.png'),Buffer.from(r.data,'base64'))}catch{}p.close()}}
  console.log('CHROME '+JSON.stringify(results.at(-1)));
 }
 const click=async(p,sel)=>{await wait(()=>p.evaluate('!!document.querySelector('+JSON.stringify(sel)+')'),'Elemento '+sel);await p.evaluate('document.querySelector('+JSON.stringify(sel)+').click();true')};
 const tab=async(p,id)=>{await click(p,'header nav [data-page="'+id+'"]');await wait(()=>p.evaluate('document.getElementById('+JSON.stringify(id)+')?.classList.contains("active")'),'Aba '+id)};
 await run('boot-navigation',async p=>{for(const id of ['assuntos','cartoes','imagens','pdfs','lacunas','calendario','controle-estudos'])await tab(p,id);await wait(()=>p.evaluate('!!window.BM240ControlApp'),'Controle de estudos')});
 await run('reader-and-review',async p=>{await tab(p,'cartoes');await click(p,'#cardRows .bm-v050-peek-button');assert.equal(await p.evaluate('document.querySelector(".bm-v050-peek-answer").hidden'),true);await click(p,'.bm-v050-peek-reveal');await wait(()=>p.evaluate('document.querySelector(".bm197-evolutive")?.textContent.includes("Rastreabilidade")'),'11 módulos');await click(p,'#bm316-srs-panel [data-grade="Fácil"]');await wait(()=>p.evaluate('document.getElementById("bm316-srs-state")?.textContent.includes("24 dias")'),'Recibo SRS');await click(p,'.bm-v050-peek-reveal');await click(p,'.bm-v050-peek-reveal');assert.equal(await p.evaluate('document.querySelector("#bm316-srs-panel [data-grade=Bom]").disabled'),true)});
 await run('discursive',async p=>{await tab(p,'cartoes');await click(p,'#cardRows .bm-v050-peek-button');const before=await p.evaluate('JSON.stringify(window.BMAccountRuntime.srs())');await click(p,'.bm195-open');await p.evaluate('(()=>{const el=document.querySelector("[data-bm195-answer]");el.value="Resposta fictícia";el.dispatchEvent(new Event("input",{bubbles:true}));return true})()');await click(p,'[data-bm195-rate="Bom"]');await click(p,'[data-bm195-save]');await wait(()=>p.evaluate('window.BMAccountRuntime.attempts().length===1'),'Recibo discursivo');assert.equal(await p.evaluate('JSON.stringify(window.BMAccountRuntime.srs())'),before)});
 await run('image-open',async p=>{await tab(p,'imagens');await wait(()=>p.evaluate('!!document.querySelector("#imageRows button.primary")'),'Imagem');await click(p,'#imageRows button.primary');await wait(()=>p.evaluate('document.getElementById("imageDialog").open&&document.getElementById("base").width>1'),'Editor de imagens')});
 await run('pdf-open',async p=>{await tab(p,'pdfs');await click(p,'#pdfRows button.primary');await wait(()=>p.evaluate('window.BancoMestrePDFV042?.editing&&window.BancoMestrePDFV042.totalPages===1'),'Editor de PDF',25000)});
 await run('profile-B-mobile',async p=>{const card=await p.evaluate('window.BMAccountRuntime.catalog().find(c=>c.id==="CARD-9001").front');assert.match(card,/20% de 150/);assert.equal(await p.evaluate('window.BMAccountRuntime.srs().records.length'),2);assert.equal(await p.evaluate('localStorage.length'),0);await tab(p,'cartoes');await click(p,'#cardRows .bm-v050-peek-button')},'B',390);
 async function clickText(p,label){const result=await p.evaluate('(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==='+JSON.stringify(label)+'&&x.getClientRects().length);if(!b)return false;b.click();return true})()');assert.ok(result,'Botão '+label)}
 async function snapshot(p,path){return p.evaluate('window.BMPreviewApi.fetch('+JSON.stringify(path)+').then(r=>r.json())')}
 await run('image-edit-sync-reopen',async p=>{
  await p.cmd('Page.bringToFront');await tab(p,'imagens');await click(p,'#imageRows button.primary');
  await wait(()=>p.evaluate('document.getElementById("imageDialog").open&&document.getElementById("grifo").width>1'),'Editor');
  await click(p,'#imageDialog [data-ink-tool="pen"]');
  const box=await p.evaluate('(()=>{const r=document.getElementById("grifo").getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}})()');
  assert.ok(box.w>20&&box.h>20);const x=Math.round(box.x+box.w*.25),y=Math.round(box.y+box.h*.25);
  await p.cmd('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});
  for(let i=1;i<=8;i++)await p.cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+i*5,y:y+i*3,button:'left',buttons:1});
  await p.cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+40,y:y+24,button:'left',buttons:0,clickCount:1});
  await wait(()=>p.evaluate('!document.getElementById("bmCentralImageSync").disabled'),'Traço pronto');
  await click(p,'#bmCentralImageSync');
  await wait(()=>p.evaluate('document.getElementById("imgMessage").textContent.includes("Simulação confirmada")'),'Confirmação imagem');
  const id=await p.evaluate('window.BMAccountRuntime.imageCatalog()[0].id'),path='/api/image-annotations/'+id,saved=await snapshot(p,path);
  assert.equal(saved.strokes.length,1);assert.equal(saved.strokes[0].type,'pen');
  await click(p,'#imgClose');await wait(()=>p.evaluate('!document.getElementById("imageDialog").open'),'Fechamento');
  await click(p,'#imageRows button.primary');await wait(()=>p.evaluate('document.getElementById("imageDialog").open'),'Reabrir');
  assert.deepEqual(await p.evaluate('JSON.parse(window.BMAccountRuntime.local.getItem('+JSON.stringify('BM030_STROKES_'+id)+'))'),saved.strokes);
  await click(p,'#imgClose');
 });
 await run('pdf-grifos-sync-copy-reopen',async p=>{
  await tab(p,'pdfs');await click(p,'#pdfRows button.primary');
  await wait(()=>p.evaluate('window.BancoMestrePDFV042?.editing&&window.BancoMestrePDFV042.totalPages===1'),'PDF',25000);
  const mark=await wait(()=>p.evaluate('(()=>{const a=window.BancoMestrePDFV042;a.selectTextMode();return a.addTextHighlight({documentId:a.currentId,sourceHash:a.sourceHash,page:a.currentPage,text:"Banco Mestre",rects:[[.08,.08,.35,.13]],color:"#ffd400",classification_status:"confirmada"})})()'),'Grifo textual');
  assert.equal(mark.text,'Banco Mestre');assert.ok(await p.evaluate('window.BancoMestrePDFV042.updateTextHighlight('+JSON.stringify(mark.id)+',{note:"Observação fictícia"})'));
  await clickText(p,'Sincronizar grifos');await wait(()=>p.evaluate('document.getElementById("pdfLocalStatus").textContent.includes("Grifos simulados")'),'Recibo grifos');
  const master=await snapshot(p,'/api/marks');assert.ok(JSON.stringify(master.master.records).includes('Observação fictícia'));
  const built=await p.evaluate('window.BancoMestrePDFV042.buildAnnotated().then(async x=>({pages:x.pagesMarked,type:x.blob.type,header:new TextDecoder().decode(await x.blob.slice(0,5).arrayBuffer())}))');
  assert.equal(built.pages,1);assert.equal(built.type,'application/pdf');assert.equal(built.header,'%PDF-');
  await clickText(p,'Simular cópia no Drive');await wait(()=>p.evaluate('document.getElementById("pdfLocalStatus").textContent.includes("Cópia fictícia confirmada")'),'Recibo cópia');
  await click(p,'#pdfClose');await wait(()=>p.evaluate('!document.getElementById("pdfDialog").open'),'Fechamento PDF');
  await click(p,'#pdfRows button.primary');await wait(()=>p.evaluate('window.BancoMestrePDFV042?.editing&&window.BancoMestrePDFV042.currentMarks.some(x=>x.note==="Observação fictícia")'),'Reabrir grifo');
 });
 await run('gaps-create-sync',async p=>{
  await tab(p,'lacunas');
  const before=(await snapshot(p,'/api/gaps')).data.records.length;
  await p.evaluate('(()=>{document.getElementById("bm242-new").open=true;const f=document.getElementById("bm242-form");f.elements.descricao.value="Lacuna fictícia de homologação";f.elements.cardIds.value="CARD-9001";f.elements.relatoEstudante.value="Relato literal de teste";f.requestSubmit();return true})()');
  await wait(()=>p.evaluate('window.BM242Lacunas.data.records.length==='+String(before+1)),'Registro lacuna');
  await click(p,'#bm242-sync');await wait(()=>p.evaluate('document.getElementById("bm242-state").textContent.includes("fictícias sincronizadas")'),'Recibo lacunas');
  const after=await snapshot(p,'/api/gaps');assert.equal(after.data.records.length,before+1);assert.ok(after.data.records.some(r=>r.relatoEstudante==='Relato literal de teste'&&r.cardIds.includes('CARD-9001')));
 });
 await run('study-save',async p=>{
  await tab(p,'controle-estudos');await wait(()=>p.evaluate('!!window.BM240ControlApp'),'Controle');
  const id=await p.evaluate('window.BM240ControlApp.createSubject("Disciplina fictícia 024D")');assert.ok(id);
  await p.evaluate('(()=>{const r=document.getElementById("bm240-native-host").shadowRoot;r.querySelector("[data-tab=backup]").click();r.getElementById("bm-profile-study-sync").click();return true})()');
  await wait(()=>p.evaluate('document.getElementById("bm240-native-host").shadowRoot.getElementById("backupStatus").textContent.includes("fictício sincronizado")'),'Recibo controle');
  assert.ok((await snapshot(p,'/api/study')).data.subjects.some(x=>x.id===id&&x.name==='Disciplina fictícia 024D'));
 });
 await run('simultaneous-profiles',async p=>{
  const q=await page('B');try{
   const before=await q.evaluate('JSON.stringify(window.BMAccountRuntime.srs())');
   assert.notEqual(await p.evaluate('window.BMAccountRuntime.catalog().find(c=>c.id==="CARD-9001").front'),await q.evaluate('window.BMAccountRuntime.catalog().find(c=>c.id==="CARD-9001").front'));
   await tab(p,'cartoes');await click(p,'#cardRows .bm-v050-peek-button');await click(p,'.bm-v050-peek-reveal');await click(p,'#bm316-srs-panel [data-grade="Bom"]');
   await wait(()=>p.evaluate('document.getElementById("bm316-srs-state").textContent.includes("16 dias")'),'Revisão perfil A');
   assert.equal(await q.evaluate('JSON.stringify(window.BMAccountRuntime.srs())'),before);
   assert.equal(await p.evaluate('window.BMAccountRuntime.loadLayers("CARD-9004").then(()=>false,()=>true)'),true);
   assert.equal(await q.evaluate('window.BMAccountRuntime.loadLayers("CARD-9002").then(()=>false,()=>true)'),true);
   assert.equal(await p.evaluate('localStorage.length'),0);assert.equal(await q.evaluate('localStorage.length'),0);
   assert.deepEqual(q.errors,[]);
  }finally{q.close()}
 });
 await writeFile(join(output,'results.json'),JSON.stringify(results,null,2));
 assert.ok(results.every(r=>r.ok),results.filter(r=>!r.ok).map(r=>r.name+': '+r.error).join('\n'));
}finally{child.kill();await delay(350);await rm(dir,{recursive:true,force:true}).catch(()=>{});if(!results.length)console.error(stderr)}
