// Build the SAME original entrypoint, not a preview, modal or iframe. Test output stays outside publication.
import fs from 'node:fs';
import path from 'node:path';
import {privatePage} from '../infra/vs41-private/page.mjs';
import {adaptPortalAsset} from '../infra/vs41-private/host.mjs';
import {privateStudyApp} from '../infra/vs41-private/study-ui.mjs';
const out=process.argv[2]||'/tmp/bm-original-account';
const put=(p,s)=>{const f=path.join(out,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
const original=fs.readFileSync('index.html','utf8');
const policy="default-src 'none'; script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; connect-src 'self' https://www.googleapis.com https://accounts.google.com/gsi/; img-src 'self' data: blob:; font-src 'self' data:; frame-src https://accounts.google.com/gsi/ blob:; worker-src 'self' blob: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/; object-src 'none'; base-uri 'none'; form-action 'none'";
let html=privatePage(original).replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="'+policy+'"><script src="assets/bm-account/connection.js"></script>').replace('src="/infra/vs41-private/client.js"','src="assets/bm-account/client.js"');
html=html.replace(/(<script\b[^>]+src=["'])(assets\/[A-Za-z0-9_.-]+\.js)((?:\?[^"']*)?["'])/g,(all,pre,file,post)=>{
 if(file.startsWith('assets/bm-account/'))return all;
 const source=fs.readFileSync(file,'utf8');
 let adapted=adaptPortalAsset('/'+file,source);
 if(file==='assets/v432_js_124_135_formulas.js'){
  // The original header button and style remain. Its only authority is the selected session.
  const i=adapted.indexOf("(function(){\n 'use strict';\n let running=null,lastReport=null;"),j=adapted.indexOf('/* 125 assets/v266_sync_truth.js */',i);
  if(i<0||j<0)throw Error('Contrato cabeçalho divergente');
  adapted=adapted.slice(0,i)+"window.BM239DriveGlobal=Object.freeze({get connected(){return !!window.BMVS41Session?.available()},get writeAuthorized(){return false},writeToken:()=>'',get connectionStatus(){return {ready:true,initialized:true,connected:!!window.BMVS41Session?.available(),writeAuthorized:false,state:'private'}},sync:async()=>({complete:false,summary:'Consulta individual; gravação não habilitada'})});\n;\n"+adapted.slice(j);
 }
 if(file==='assets/v417_shared_reader.js'){
  // Static editorial SVGs from the authenticated card retain their original inline display.
  adapted=adapted.replace("if(typeof m.src==='string'&&m.src.startsWith('data:image/svg+xml;charset=utf-8,')){im.src=m.src;","if(typeof m.src==='string'&&(m.src.startsWith('data:image/svg+xml;charset=utf-8,')||/^assets\\/(?:[A-Za-z0-9_-]+\\/)*[A-Za-z0-9_.-]+\\.svg$/.test(m.src))){im.src=m.src;");
  adapted=adapted.replace("else if(typeof m.src==='string'&&m.src.startsWith('assets/'))privateFigure(f,{...m,editorialStatic:true});","");
 }
 if(adapted===source)return all;
 put('assets/bm-account/'+path.basename(file),adapted);return pre+'assets/bm-account/'+path.basename(file)+post;
});
let client=fs.readFileSync('infra/vs41-private/client.js','utf8').replace("location.reload();","window.BMPortalBridge.close();");
const a=client.indexOf("  const anchor=document.getElementById('bm239-drive-action');"),b=client.indexOf(' void window.BMVS41Session.check()',a);
if(a<0||b<0)throw Error('Contrato cabeçalho divergente');
client=client.slice(0,a)+client.slice(b);
client=client.replace("if(!doc||!Array.isArray(doc.card_ids)||!doc.card_ids.length)","if(!doc||!Array.isArray(doc.card_ids))");
put('assets/bm-account/client.js',client);
put('assets/bm-account/connection.js','window.BMStudyTemplate='+JSON.stringify(fs.readFileSync('controle-estudos-v415.html','utf8'))+';\n'+fs.readFileSync('infra/vs41-private/browser-account-connection.js','utf8'));
put('assets/v415_controle_app.js',privateStudyApp(fs.readFileSync('assets/v415_controle_app.js','utf8')));
for(const f of ['browser-account.mjs','browser-drive.mjs','records.mjs'])put('infra/vs41-private/'+f,fs.readFileSync('infra/vs41-private/'+f,'utf8'));
put('index.html',html);
console.log('Original entrypoint prepared: same HTML, same CSS, same header button, no iframe.');
