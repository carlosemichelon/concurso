import {createLoginGate} from './multiaccount-login-gate-v001.mjs';
import {createPortalSession} from './multiaccount-drive-v001.mjs';
import {CATALOGS,createCatalogLoader} from './multiaccount-catalog-v001.mjs';
import {prepareAccountRuntime} from './multiaccount-srs-v001.mjs';
const by=id=>document.getElementById(id),status=by('status'),login=by('login'),logout=by('logout'),result=by('result');
function render(v){
 login.disabled=v.state==='loading';logout.hidden=!['loading','verified'].includes(v.state);result.replaceChildren();
 status.textContent=v.state==='loading'?'Confirmando identidade, perfil e coleções individuais…':v.state==='verified'?'Perfil autenticado e validado. Abertura do portal completo bloqueada até homologação dos módulos restantes.':v.state==='blocked'?'Acesso não liberado: '+v.message:'Selecione a conta Google para validar seu ambiente.';
 if(v.state==='verified'){
  const identity=document.createElement('p');identity.textContent=v.email;result.append(identity);
  const labels={cards:'Cartões',pdf:'PDFs',images:'Imagens',srs:'Vencimentos',discursive:'Respostas discursivas'},list=document.createElement('dl');
  for(const [key,n] of Object.entries(v.counts)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=labels[key];dd.textContent=n.toLocaleString('pt-BR');list.append(dt,dd)}
  result.append(list);login.textContent='Selecionar outra conta';
 }else login.textContent='Entrar com Google';
}
async function init(){
 const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});if(!r.ok)throw Error('Configuração OAuth indisponível');
 const conf=await r.json();if(location.origin!==conf.authorized_javascript_origin&&!['localhost','127.0.0.1'].includes(location.hostname))throw Error('Origem Google não autorizada');
 if(!conf.client_id?.endsWith('.apps.googleusercontent.com'))throw Error('Client ID inválido');
 await new Promise((resolve,reject)=>{if(window.google?.accounts?.oauth2)return resolve();const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.onload=resolve;script.onerror=()=>reject(Error('Google Identity indisponível'));document.head.append(script)});
 const session=createPortalSession({clientId:conf.client_id,gis:window.google.accounts.oauth2,catalogs:CATALOGS,loadCatalog:createCatalogLoader(window.BMOriginalCatalog)});
 const gate=createLoginGate({session,prepare:s=>prepareAccountRuntime({session:s,storage:localStorage,idb:indexedDB}),render});
 login.onclick=()=>void gate.login();logout.onclick=()=>gate.lock();window.addEventListener('pagehide',()=>gate.lock());window.addEventListener('pageshow',()=>gate.check());document.addEventListener('visibilitychange',()=>gate.check());setInterval(()=>gate.check(),1000);gate.lock();
}
init().catch(e=>{status.textContent='Acesso indisponível: '+e.message;login.disabled=true});
