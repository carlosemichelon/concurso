import {scope,readBrowserSnapshot} from '../infra/vs41-private/browser-drive.mjs';
const $=id=>document.getElementById(id);
const clientId='920889480620-iio6tlgputade7qnd6qaoh1og399jiqa.apps.googleusercontent.com';
let token='',expires=0,timer,client,records=[],epoch=0,abort,pending=false;window.cards=[];
const say=s=>{$('status').textContent=s};
let frameNonce='',frameSent=false;const frame=$('full-portal');
function closePortal(){frameNonce='';frameSent=false;frame.hidden=true;frame.removeAttribute('src');}
const clear=()=>{closePortal();records=[];window.cards=[];$('list').replaceChildren();window.BancoMestreVisualizarCardV050?.reset();$('summary').textContent='';$('search').value='';$('results').hidden=true;};
function disconnect(message='Desconectado. Conecte novamente quando desejar.'){
 epoch++;abort?.abort();clearTimeout(timer);token='';expires=0;pending=false;clear();$('source').value='';$('editorial-preview').checked=false;$('connect').disabled=!client;$('disconnect').disabled=true;$('load').disabled=true;say(message);
}
const current=()=>!!token&&Date.now()<expires;
window.BMPrivateReadSession=Object.freeze({active:current});
function show(c){if(!current()){disconnect('Autorização expirada.');return;}window.BancoMestreVisualizarCardV050.showId(c.id);}
window.BM317RelatedNavigator=Object.freeze({openReferenced(id){const c=records.find(c=>c.id===id&&c.active);if(c)show(c);}});
function render(){if(!current()){disconnect('Autorização expirada.');return;}const q=$('search').value.toLocaleLowerCase('pt-BR');const list=$('list');list.replaceChildren();window.BancoMestreVisualizarCardV050?.close();for(const c of records.filter(c=>c.active&&[c.id,c.front,c.subject].some(v=>String(v).toLocaleLowerCase('pt-BR').includes(q))).slice(0,50)){const li=document.createElement('li'),b=document.createElement('button');b.textContent=c.id+' — '+c.front;b.onclick=()=>show(c);li.append(b);list.append(li);}}
$('search').oninput=render;
// Reuse the original V245 master file of the authenticated account. Read only.
async function readStudy(signal){
 const base='https://www.googleapis.com/drive/v3/files',headers={Authorization:'Bearer '+token};
 const get=async(path,params)=>{const r=await fetch(base+path+'?'+new URLSearchParams(params),{headers,signal,cache:'no-store',credentials:'omit',redirect:'error'});if(!r.ok)throw Error('Controle: HTTP '+r.status);return r};
 const fields='id,mimeType,ownedByMe,shared,trashed,size,version,headRevisionId,sha256Checksum,md5Checksum,appProperties';
 const q="trashed = false and 'me' in owners and appProperties has { key='bm_kind' and value='bm_controle_estudos_v245' }";
 const listing=await (await get('',{q,fields:'nextPageToken,incompleteSearch,files('+fields+')',pageSize:'100'})).json();
 if(listing.incompleteSearch||listing.nextPageToken||!Array.isArray(listing.files)||listing.files.length>1)throw Error('Controle: arquivo mestre não identificado de forma única');
 if(!listing.files.length)return {data:{schema:1,subjects:[],sessions:[],reviews:[],plans:[],audit:[],cycle:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60,activeTimer:null},revision:null,source:'verified-empty'};
 const f=listing.files[0];
 const valid=m=>m?.id===f.id&&m.ownedByMe===true&&m.shared===false&&m.trashed===false&&m.appProperties?.bm_kind==='bm_controle_estudos_v245'&&/^application\\/json(?:\\s*;.*)?$/.test(m.mimeType||'')&&Number.isSafeInteger(Number(m.size))&&Number(m.size)>0&&Number(m.size)<=10000000&&typeof m.version==='string';
 if(!/^[A-Za-z0-9_-]{1,160}$/.test(f.id)||!valid(f))throw Error('Controle: origem privada não confirmada');
 const before=await (await get('/'+f.id,{fields})).json();if(!valid(before))throw Error('Controle: metadados inválidos');
 const response=await get('/'+f.id,{alt:'media'}),raw=await response.arrayBuffer();
 const after=await (await get('/'+f.id,{fields})).json();
 if(!valid(after)||Number(before.size)!==raw.byteLength||['version','size','headRevisionId','sha256Checksum','md5Checksum'].some(k=>before[k]!==after[k]))throw Error('Controle: arquivo alterado durante leitura');
 const doc=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)),d=doc.data;
 if(doc.format!=='BancoMestreControleDriveV245'||d?.schema!==1||!['subjects','sessions','reviews','cycle'].every(k=>Array.isArray(d[k]))||['plans','audit'].some(k=>d[k]!==undefined&&!Array.isArray(d[k])))throw Error('Controle: formato inválido');
 return {data:{...d,plans:d.plans||[],audit:d.audit||[]},revision:before.version,source:'verified-drive'};
}
$('open-original').onclick=()=>{if(!current()||!records.length)return;closePortal();frameNonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');frame.src='./portal/index.html?bmSession='+frameNonce;frame.hidden=false;};
window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||e.origin!=='null'||!frameNonce||e.data?.nonce!==frameNonce)return;if(e.data.type==='bm-portal-ready'&&!frameSent&&current()){frameSent=true;const nonce=frameNonce,serial=epoch,source=e.source;void (async()=>{let study=null;try{study=await readStudy(abort?.signal)}catch(err){console.warn('Controle individual indisponível:',err.message)}if(serial!==epoch||nonce!==frameNonce||!current())return;source.postMessage({type:'bm-portal-data',nonce,records,study},'*')})();}else if(e.data.type==='bm-portal-close'){disconnect();}});

$('load').onclick=async()=>{if(!current()){disconnect('Autorização expirada.');return;}const source=$('source').value;const editorialPreview=$('editorial-preview').checked;const serial=++epoch;abort?.abort();abort=new AbortController();clear();$('load').disabled=true;say('Localizando base privada…');try{const p=await readBrowserSnapshot({token,source,signal:abort.signal,editorialPreview});if(serial!==epoch||!current())return;records=p.records;window.cards=records;$('summary').textContent=p.version+' · '+records.filter(c=>c.active).length+' cartões ativos '+(p.scope==='editorial-candidate-only'?'(candidato editorial — sem histórico/SRS)':'(snapshot somente)');$('results').hidden=false;say('Leitura privada confirmada. Nenhuma gravação realizada.');render();}catch(e){if(serial!==epoch)return;if(String(e.message).includes('HTTP 401')){disconnect('Autorização expirada.');return;}say((e.message||'Leitura não confirmada.')+(!editorialPreview&&String(e.message).includes('único ponteiro vigente')?' Para testar a VC52 pela pasta raiz, marque a opção de prévia editorial e carregue novamente.':''));}finally{if(serial===epoch)$('load').disabled=!current();}};
$('disconnect').onclick=()=>disconnect();
$('connect').onclick=()=>{if(!client||pending)return;disconnect('Escolha sua conta Google.');pending=true;$('connect').disabled=true;$('disconnect').disabled=false;const serial=epoch;const callback=response=>{if(serial!==epoch)return;pending=false;if(response.error||!response.access_token||!google.accounts.oauth2.hasGrantedAllScopes(response,scope)){disconnect('Permissão de leitura não concedida.');return;}token=response.access_token;expires=Date.now()+Math.max(1,Number(response.expires_in||3600)-60)*1000;timer=setTimeout(()=>disconnect('Autorização expirada. Conecte novamente.'),expires-Date.now());$('disconnect').disabled=false;$('load').disabled=false;say('Google conectado. Informe o link da sua pasta privada ou arquivo JSON.');};try{const attempt=google.accounts.oauth2.initTokenClient({client_id:clientId,scope,callback,error_callback:()=>{if(serial===epoch&&pending)disconnect('Autorização interrompida. Tente novamente.')}});attempt.requestAccessToken({prompt:'select_account'});}catch{disconnect('Não foi possível abrir o consentimento Google.');}};
window.addEventListener('pagehide',()=>disconnect());
const gis=document.createElement('script');gis.src='https://accounts.google.com/gsi/client';gis.async=true;gis.onload=()=>{try{client=typeof google.accounts.oauth2.initTokenClient==='function';if(!client)throw Error('GIS');$('connect').disabled=false;say('Pronto para conectar sua conta.');}catch{say('Google Identity Services indisponível.');}};gis.onerror=()=>say('Não foi possível carregar Google Identity Services.');document.head.append(gis);
