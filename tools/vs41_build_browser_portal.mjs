// The original HTML/CSS remain the single visual source. Generated output is test-only.
import fs from 'node:fs';
import path from 'node:path';
import {privatePage} from '../infra/vs41-private/page.mjs';
import {adaptPortalAsset} from '../infra/vs41-private/host.mjs';
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
 const adapted=adaptPortalAsset('/'+file,source);
 if(adapted===source)return pre+'../../'+file+post;
 fs.writeFileSync(path.join(output,file),adapted);return pre+file+post;
});
const client=fs.readFileSync('infra/vs41-private/client.js','utf8').replace("location.reload();","window.BMPortalBridge.close();").replace("catch(()=>{location.reload()})","catch(()=>{window.BMPortalBridge.close()})");
fs.writeFileSync(path.join(output,'client.js'),client);
fs.copyFileSync('infra/vs41-private/browser-portal-bridge.js',path.join(output,'bridge.js'));
fs.writeFileSync(path.join(output,'index.html'),html);
console.log('Portal integral gerado a partir do HTML oficial, sem CSS novo.');
