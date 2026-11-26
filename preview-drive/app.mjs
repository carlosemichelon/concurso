import {scope,readBrowserSnapshot} from './browser-drive.mjs?v=vc52-test-2';
const $=id=>document.getElementById(id);
const clientId='920889480620-iio6tlgputade7qnd6qaoh1og399jiqa.apps.googleusercontent.com';
let token='',expires=0,timer,client,records=[],epoch=0,abort,pending=false;
const say=s=>{$('status').textContent=s};
const clear=()=>{records=[];$('list').replaceChildren();$('card').replaceChildren();$('summary').textContent='';$('search').value='';$('results').hidden=true;};
function disconnect(message='Desconectado. Conecte novamente quando desejar.'){
 epoch++;abort?.abort();clearTimeout(timer);token='';expires=0;pending=false;clear();$('source').value='';$('connect').disabled=!client;$('disconnect').disabled=true;$('load').disabled=true;say(message);
}
const current=()=>!!token&&Date.now()<expires;
function show(c){
 const a=$('card');a.replaceChildren();
 const h=document.createElement('h3');h.textContent=c.id+' — '+c.front;a.append(h);
 const b=document.createElement('button');b.textContent='Revelar resposta';a.append(b);
 b.onclick=()=>{if(!current()){disconnect('Autorização expirada.');return;}b.remove();const p=document.createElement('p');p.textContent=c.back+'\n\n'+(c.expl||'');a.append(p);
 const mods=c.consolidation?.profile?.modules;
 if(Array.isArray(mods))for(const m of mods){const heading=document.createElement('h3');heading.textContent=String(m.titulo||'Módulo');const t=document.createElement('p');t.textContent=String(m.texto||'');a.append(heading,t);}
 };
}
function render(){if(!current()){disconnect('Autorização expirada.');return;}const q=$('search').value.toLocaleLowerCase('pt-BR');const list=$('list');list.replaceChildren();$('card').replaceChildren();for(const c of records.filter(c=>c.active&&[c.id,c.front,c.subject].some(v=>String(v).toLocaleLowerCase('pt-BR').includes(q))).slice(0,50)){const li=document.createElement('li'),b=document.createElement('button');b.textContent=c.id+' — '+c.front;b.onclick=()=>show(c);li.append(b);list.append(li);}}
$('search').oninput=render;
$('load').onclick=async()=>{if(!current()){disconnect('Autorização expirada.');return;}const source=$('source').value;const serial=++epoch;abort?.abort();abort=new AbortController();clear();$('load').disabled=true;say('Localizando base privada…');try{const p=await readBrowserSnapshot({token,source,signal:abort.signal});if(serial!==epoch||!current())return;records=p.records;$('summary').textContent=p.version+' · '+records.filter(c=>c.active).length+' cartões ativos '+(p.scope==='editorial-candidate-only'?'(candidato editorial — sem histórico/SRS)':'(snapshot somente)');$('results').hidden=false;say('Leitura privada confirmada. Nenhuma gravação realizada.');render();}catch(e){if(serial!==epoch)return;if(String(e.message).includes('HTTP 401')){disconnect('Autorização expirada.');return;}say(e.message||'Leitura não confirmada.');}finally{if(serial===epoch)$('load').disabled=!current();}};
$('disconnect').onclick=()=>disconnect();
$('connect').onclick=()=>{if(!client||pending)return;disconnect('Escolha sua conta Google.');pending=true;$('connect').disabled=true;$('disconnect').disabled=false;const serial=epoch;const callback=response=>{if(serial!==epoch)return;pending=false;if(response.error||!response.access_token||!google.accounts.oauth2.hasGrantedAllScopes(response,scope)){disconnect('Permissão de leitura não concedida.');return;}token=response.access_token;expires=Date.now()+Math.max(1,Number(response.expires_in||3600)-60)*1000;timer=setTimeout(()=>disconnect('Autorização expirada. Conecte novamente.'),expires-Date.now());$('disconnect').disabled=false;$('load').disabled=false;say('Google conectado. Informe o link da sua pasta privada ou arquivo JSON.');};try{const attempt=google.accounts.oauth2.initTokenClient({client_id:clientId,scope,callback,error_callback:()=>{if(serial===epoch&&pending)disconnect('Autorização interrompida. Tente novamente.')}});attempt.requestAccessToken({prompt:'select_account'});}catch{disconnect('Não foi possível abrir o consentimento Google.');}};
window.addEventListener('pagehide',()=>disconnect());
const gis=document.createElement('script');gis.src='https://accounts.google.com/gsi/client';gis.async=true;gis.onload=()=>{try{client=typeof google.accounts.oauth2.initTokenClient==='function';if(!client)throw Error('GIS');$('connect').disabled=false;say('Pronto para conectar sua conta.');}catch{say('Google Identity Services indisponível.');}};gis.onerror=()=>say('Não foi possível carregar Google Identity Services.');document.head.append(gis);
