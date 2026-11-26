// Single-origin authenticated portal. Never serve the repository directory.
import fs from 'node:fs';
import path from 'node:path';
import {privatePage} from './page.mjs';
import {privateImageEditor} from './image-editor.mjs';
import {privateGallery} from './gallery.mjs';
import {privateStudyBundle,privateStudyApp} from './study-ui.mjs';
import {privateFormulas} from './formulas-ui.mjs';
import {privateGaps} from './gaps-ui.mjs';
import {privatePdfEditor} from './pdf-editor.mjs';
import {privatePdfLibrary,privatePdfSync} from './pdf-library.mjs';
import {privateMediaRenderer} from './media-renderer.mjs';
import {privateCalendar,privateStudyQueue} from './calendar.mjs';
import {privateJournal} from './journal.mjs';
import {privateGlobalDrive,privateCheckpoints,privateReconcile,privateTimerHeader,privateStudyCalendarStatus,privateReaderLayers,privateHeaderLayers,privateLayerBridge,disabledPublicScripts} from './legacy.mjs';
const adapters=new Map([
 ['/assets/v383_js_016_027_vc23.js',privateReaderLayers],
 ['/assets/v382_js_064_075_countsfix3_vc23.js',privateLayerBridge],
 ['/assets/v430_js_000_001_editor.js',privateImageEditor],
 ['/assets/v382_srs_journal_vc23.js',privateJournal],
 ['/assets/v414_js_076_087_header.js',s=>privateHeaderLayers(privateCheckpoints(privateCalendar(s)))],
 ['/assets/v383_study_queue.js',privateStudyQueue],
 ['/assets/v417_shared_reader.js',privateMediaRenderer],
 ['/assets/v432_js_002_015_topic_media.js',s=>privatePdfLibrary(privatePdfEditor(s))],
 ['/assets/v432_js_040_051_atlas.js',s=>privateGallery(privatePdfSync(s))],
 ['/assets/v430_js_112_123_control.js',s=>privateGaps(privateStudyBundle(s))],
 ['/assets/v432_js_124_135_formulas.js',s=>privateFormulas(privateTimerHeader(privateGlobalDrive(s)))],
 ['/assets/v402_js_136_147_compare.js',privateReconcile],
 ['/assets/v413_js_148_159_gaps.js',privateStudyCalendarStatus]
]);
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cross-Origin-Resource-Policy':'same-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' data: blob:; font-src 'self' data:; worker-src 'self' blob:; frame-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
const send=(res,status,body='',type='text/plain; charset=utf-8')=>{res.writeHead(status,{...headers,'Content-Type':type});res.end(body)};
const loginPage='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Banco Mestre — Entrar</title><style>body{font:16px system-ui;background:#f5f7f9;color:#203a49;display:grid;place-items:center;min-height:95vh}main{background:white;border:1px solid #dce3e8;padding:2rem;border-radius:12px;width:min(340px,85vw)}label,input,button{display:block;width:100%;box-sizing:border-box}input,button{font:inherit;padding:.65rem;margin:.4rem 0 1rem}button{background:#205e5b;color:white;border:0;border-radius:6px}p{min-height:1.5em}</style></head><body><main><h1>Banco Mestre</h1><form id="login"><label>Usuário<input name="username" autocomplete="username" required></label><label>Senha<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">Entrar</button><p id="state" role="status"></p></form></main><script>document.getElementById("login").onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector("button"),s=document.getElementById("state");b.disabled=true;try{const r=await fetch("/api/vs41/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({username:f.username.value,password:f.password.value})});if(!r.ok)throw Error("Usuário ou senha não conferidos.");location.replace("/index.html")}catch(e){s.textContent=e.message;b.disabled=false;f.password.value=""}};</script></body></html>';
export function createPortalHost({root,api}){
 if(typeof api?.authenticated!=='function')throw Error('Autenticação obrigatória');
 const base=fs.realpathSync(root),original=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const page=privatePage(original);
 const assets=new Map();
 // Only the exact script and stylesheet dependencies declared in the original entrypoint.
 for(const match of original.matchAll(/<(?:script|link)\b[^>]+(?:src|href)=["'](assets\/[A-Za-z0-9_.-]+\.(?:js|css))(?:\?[^"']*)?["']/g)){
  const file='/'+match[1];if(assets.has(file))continue;
  const physical=fs.realpathSync(path.join(base,match[1]));
  if(!physical.startsWith(base+path.sep+'assets'+path.sep))throw Error('Recurso fora do diretório');
  const content=fs.readFileSync(physical);
  assets.set(file,{body:disabledPublicScripts.has(file)?'/* Conteúdo fornecido somente pelo perfil autenticado. */':adapters.has(file)?adapters.get(file)(content.toString('utf8')):content,type:file.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8'});
 }
 for(const key of adapters.keys())if(!assets.has(key))throw Error('Adaptador sem recurso original: '+key);
 assets.set('/controle-estudos-v415.html',{body:fs.readFileSync(path.join(base,'controle-estudos-v415.html'),'utf8').replace('Classificação verificada dos cartões públicos V194.','Classificação dos cartões do perfil autenticado.').replace('Cinco disciplinas principais conforme os filtros do Banco Mestre; matérias, assuntos específicos e subassuntos vêm dos 1.518 cartões.','Disciplinas, matérias e assuntos específicos são derivados dos cartões da conta.'),type:'text/html; charset=utf-8'});
 assets.set('/assets/v415_controle_app.js',{body:privateStudyApp(fs.readFileSync(path.join(base,'assets/v415_controle_app.js'),'utf8')),type:'application/javascript; charset=utf-8'});
 assets.set('/infra/vs41-private/client.js',{body:fs.readFileSync(path.join(base,'infra/vs41-private/client.js')),type:'application/javascript; charset=utf-8'});
 for(const file of ['pdf.min.js','pdf.worker.min.js'])assets.set('/test-pdfjs/'+file,{body:fs.readFileSync(path.join(base,'node_modules/pdfjs-dist/build',file)),type:'application/javascript; charset=utf-8'});
 return async(req,res)=>{
  try{
   const u=new URL(req.url,'http://localhost');
   if(!req.url.startsWith('/')||req.url.startsWith('//')||u.origin!=='http://localhost')return send(res,400);
   if(await api(req,res))return;
   if(req.method!=='GET')return send(res,405);
   if(u.pathname==='/'||u.pathname==='/index.html')return send(res,200,api.authenticated(req)?page:loginPage,'text/html; charset=utf-8');
   const resource=assets.get(u.pathname);
   if(!resource)return send(res,404);
   if(!api.authenticated(req))return send(res,401);
   return send(res,200,resource.body,resource.type);
  }catch{if(!res.headersSent)return send(res,500);res.end()}
 };
}
