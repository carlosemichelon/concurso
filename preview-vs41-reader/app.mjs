import {scope,readBrowserSnapshot} from '../infra/vs41-private/browser-drive.mjs';
const $=id=>document.getElementById(id);
const clientId='920889480620-iio6tlgputade7qnd6qaoh1og399jiqa.apps.googleusercontent.com';
let token='',expires=0,timer,client,records=[],epoch=0,abort,pending=false;window.cards=[];
let filtered=[],page=0,selectedId=null;const pageSize=30;const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
const say=s=>{$('status').textContent=s};
const options=(id,values,label)=>{const select=$(id);select.replaceChildren(new Option(label,''));for(const v of [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')))select.add(new Option(v,v));};
const clearReader=()=>{selectedId=null;$('card').replaceChildren();$('empty-reader').hidden=false;$('position').textContent='';$('prev-card').disabled=true;$('next-card').disabled=true;};
const clear=()=>{records=[];window.cards=[];filtered=[];page=0;clearReader();$('list').replaceChildren();$('summary').textContent='';$('search').value='';options('group-filter',[],'Todos os grupos');options('subject-filter',[],'Todos os assuntos');$('result-count').textContent='';$('page-info').textContent='';$('prev-page').disabled=true;$('next-page').disabled=true;$('results').hidden=true;};
function disconnect(message='Desconectado. Conecte novamente quando desejar.'){
 epoch++;abort?.abort();clearTimeout(timer);token='';expires=0;pending=false;clear();$('source').value='';$('editorial-preview').checked=false;$('connect').disabled=!client;$('disconnect').disabled=true;$('load').disabled=true;say(message);
}
const current=()=>!!token&&Date.now()<expires;
function show(c){
 if(!current()){disconnect('Autorização expirada.');return;}
 selectedId=c.id;$('empty-reader').hidden=true;const i=filtered.findIndex(x=>x.id===c.id);if(i>=0)page=Math.floor(i/pageSize);renderList();updateNav();const a=$('card');a.replaceChildren();
 const h=document.createElement('h3');h.textContent=c.id+' — '+c.front;a.append(h);
 const front=document.createElement('div');front.className='bm349-front-media';a.append(front);
 window.BM349.renderFront(front,c.id);
 const b=document.createElement('button');b.textContent='Revelar resposta';a.append(b);
 const answer=document.createElement('div');answer.className='bm-v050-peek-answer';answer.hidden=true;a.append(answer);
 b.onclick=()=>{if(!current()){disconnect('Autorização expirada.');return;}b.remove();answer.hidden=false;
  if(window.BM349.has(c.id)){try{window.BM349.renderAnswer(answer,c.id);return;}catch{}}
  const p=document.createElement('p');p.textContent=c.back+'\n\n'+(c.expl||'');answer.append(p);
  const note=document.createElement('small');note.textContent='Formato legado: texto disponível no snapshot; módulos editoriais não confirmados.';answer.append(note);
 };
}
window.BM317RelatedNavigator=Object.freeze({openReferenced(id){const c=records.find(c=>c.id===id&&c.active);if(c)show(c);}});
function updateNav(){const i=filtered.findIndex(c=>c.id===selectedId);$('position').textContent=selectedId?(i<0?'Cartão relacionado · fora do filtro atual':(i+1)+' de '+filtered.length):'';$('prev-card').disabled=i<=0;$('next-card').disabled=i<0||i>=filtered.length-1;}
function renderList(){const list=$('list');list.replaceChildren();const pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(page,pages-1);$('result-count').textContent=filtered.length+' cartões encontrados';$('page-info').textContent=(page+1)+' / '+pages;$('prev-page').disabled=page===0;$('next-page').disabled=page>=pages-1;for(const c of filtered.slice(page*pageSize,(page+1)*pageSize)){const li=document.createElement('li'),b=document.createElement('button');b.textContent=c.id+' — '+c.front;b.setAttribute('aria-current',String(c.id===selectedId));b.onclick=()=>show(c);li.append(b);list.append(li);}}
function subjects(){const g=$('group-filter').value;options('subject-filter',records.filter(c=>c.active&&(!g||c.group===g)).map(c=>c.subject),'Todos os assuntos');}
function render(){if(!current()){disconnect('Autorização expirada.');return;}const q=fold($('search').value.trim()),g=$('group-filter').value,s=$('subject-filter').value;filtered=records.filter(c=>c.active&&(!g||c.group===g)&&(!s||c.subject===s)&&[c.id,c.front,c.subject,c.discipline,c.group].some(v=>fold(v).includes(q)));page=0;clearReader();renderList();}
$('search').oninput=render;
$('group-filter').onchange=()=>{subjects();render();};
$('subject-filter').onchange=render;
$('reset-filters').onclick=()=>{$('search').value='';$('group-filter').value='';subjects();render();};
$('prev-page').onclick=()=>{if(current()&&page>0){page--;renderList();}};
$('next-page').onclick=()=>{if(current()&&(page+1)*pageSize<filtered.length){page++;renderList();}};
$('prev-card').onclick=()=>{const i=filtered.findIndex(c=>c.id===selectedId);if(i>0)show(filtered[i-1]);};
$('next-card').onclick=()=>{const i=filtered.findIndex(c=>c.id===selectedId);if(i>=0&&i+1<filtered.length)show(filtered[i+1]);};
$('load').onclick=async()=>{if(!current()){disconnect('Autorização expirada.');return;}const source=$('source').value;const editorialPreview=$('editorial-preview').checked;const serial=++epoch;abort?.abort();abort=new AbortController();clear();$('load').disabled=true;say('Localizando base privada…');try{const p=await readBrowserSnapshot({token,source,signal:abort.signal,editorialPreview});if(serial!==epoch||!current())return;records=p.records;window.cards=records;options('group-filter',records.filter(c=>c.active).map(c=>c.group),'Todos os grupos');subjects();$('summary').textContent=p.version+' · '+records.filter(c=>c.active).length+' cartões ativos '+(p.scope==='editorial-candidate-only'?'(candidato editorial — sem histórico/SRS)':'(snapshot somente)');$('results').hidden=false;say('Leitura privada confirmada. Nenhuma gravação realizada.');render();}catch(e){if(serial!==epoch)return;if(String(e.message).includes('HTTP 401')){disconnect('Autorização expirada.');return;}say((e.message||'Leitura não confirmada.')+(!editorialPreview&&String(e.message).includes('único ponteiro vigente')?' Para testar a VC52 pela pasta raiz, marque a opção de prévia editorial e carregue novamente.':''));}finally{if(serial===epoch)$('load').disabled=!current();}};
$('disconnect').onclick=()=>disconnect();
$('connect').onclick=()=>{if(!client||pending)return;disconnect('Escolha sua conta Google.');pending=true;$('connect').disabled=true;$('disconnect').disabled=false;const serial=epoch;const callback=response=>{if(serial!==epoch)return;pending=false;if(response.error||!response.access_token||!google.accounts.oauth2.hasGrantedAllScopes(response,scope)){disconnect('Permissão de leitura não concedida.');return;}token=response.access_token;expires=Date.now()+Math.max(1,Number(response.expires_in||3600)-60)*1000;timer=setTimeout(()=>disconnect('Autorização expirada. Conecte novamente.'),expires-Date.now());$('disconnect').disabled=false;$('load').disabled=false;say('Google conectado. Informe o link da sua pasta privada ou arquivo JSON.');};try{const attempt=google.accounts.oauth2.initTokenClient({client_id:clientId,scope,callback,error_callback:()=>{if(serial===epoch&&pending)disconnect('Autorização interrompida. Tente novamente.')}});attempt.requestAccessToken({prompt:'select_account'});}catch{disconnect('Não foi possível abrir o consentimento Google.');}};
window.addEventListener('pagehide',()=>disconnect());
const gis=document.createElement('script');gis.src='https://accounts.google.com/gsi/client';gis.async=true;gis.onload=()=>{try{client=typeof google.accounts.oauth2.initTokenClient==='function';if(!client)throw Error('GIS');$('connect').disabled=false;say('Pronto para conectar sua conta.');}catch{say('Google Identity Services indisponível.');}};gis.onerror=()=>say('Não foi possível carregar Google Identity Services.');document.head.append(gis);
