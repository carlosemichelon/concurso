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
 await writeFile(join(output,'results.json'),JSON.stringify(results,null,2));
 assert.ok(results.every(r=>r.ok),results.filter(r=>!r.ok).map(r=>r.name+': '+r.error).join('\n'));
}finally{child.kill();await delay(350);await rm(dir,{recursive:true,force:true}).catch(()=>{});if(!results.length)console.error(stderr)}
