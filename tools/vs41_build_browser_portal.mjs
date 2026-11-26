// The original HTML/CSS remain the single visual source. Generated output is test-only.
import fs from 'node:fs';
import path from 'node:path';
import {privatePage} from '../infra/vs41-private/page.mjs';
import {adaptPortalAsset} from '../infra/vs41-private/host.mjs';
import {privateStudyApp} from '../infra/vs41-private/study-ui.mjs';
const output='preview-vs41-reader/portal';
fs.mkdirSync(path.join(output,'assets'),{recursive:true});
const original=fs.readFileSync('index.html','utf8');
const origin=process.env.BM_PORTAL_ORIGIN||'https://carlosemichelon.github.io';
if(new URL(origin).origin!==origin)throw Error('Invalid origin');
const policy="default-src 'none'; script-src 'unsafe-inline' "+origin+"; style-src 'unsafe-inline' "+origin+"; img-src "+origin+" data: blob:; font-src "+origin+" data:; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'";
let html=privatePage(original).replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="'+policy+'"><meta name="referrer" content="no-referrer"><script src="./bridge.js"></script>').replace('src="/infra/vs41-private/client.js"','src="./client.js"');
html=html.replace(/(<(?:script|link)\b[^>]+(?:src|href)=["'])(assets\/[A-Za-z0-9_.-]+\.(?:js|css))((?:\?[^"']*)?["'])/g,(all,pre,file,post)=>{
 const source=fs.readFileSync(file,'utf8');
 if(file.endsWith('.css'))return pre+'../../'+file+post;
 let adapted=adaptPortalAsset('/'+file,source);
 if(file==='assets/v432_js_124_135_formulas.js'){
  adapted=adapted.replace("b.onclick=()=>void sync();b.setAttribute('aria-label','Conferir dados privados no Drive')","b.onclick=()=>void window.BMVS41Session.logout();b.setAttribute('aria-label','Desconectar Drive')");
  adapted=adapted.replace("b.textContent=running?'Verificando…':'Sincronizar Drive'","b.textContent='Sair do Drive'");
 }
 if(adapted===source)return pre+'../../'+file+post;
 fs.writeFileSync(path.join(output,file),adapted);return pre+file+post;
});
let client=fs.readFileSync('infra/vs41-private/client.js','utf8').replace("location.reload();","window.BMPortalBridge.close();").replace("catch(()=>{location.reload()})","catch(()=>{window.BMPortalBridge.close()})");
// The browser already has a single Drive connection button. Do not add server-only header buttons.
const start=client.indexOf("  const anchor=document.getElementById('bm239-drive-action');"),end=client.indexOf('  void window.BMVS41Session.check()',start);
if(start<0||end<0)throw Error('Contrato cabeçalho divergente');
client=client.slice(0,start)+client.slice(end);
fs.writeFileSync(path.join(output,'client.js'),client);
const studyHTML=fs.readFileSync('controle-estudos-v415.html','utf8');
const bridge=fs.readFileSync('infra/vs41-private/browser-portal-bridge.js','utf8');
fs.writeFileSync(path.join(output,'bridge.js'),'window.BMStudyTemplate='+JSON.stringify(studyHTML)+';\n'+bridge);
fs.writeFileSync(path.join(output,'assets/v415_controle_app.js'),privateStudyApp(fs.readFileSync('assets/v415_controle_app.js','utf8')));

fs.writeFileSync(path.join(output,'index.html'),html);
console.log('Portal integral gerado a partir do HTML oficial, sem CSS novo.');
