/* Banco Mestre V116 — fonte privada V024 H14 (1499 IDs; 1482 ativos). Baseado na leitura privada de XLSX via OAuth Drive, sem publicar dados no GitHub.
   O titular conecta a conta; durante a sessão autorizada, consulta a versão no Drive
   ao abrir e a cada 120s. A base estática e o SRS permanecem intactos se a consulta falhar. */
(function(){
'use strict';
const SOURCE_FILE_ID='14PUxPDRE7Up_kMG3-Z2jlH0fWAo_VFRM';
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const API='https://www.googleapis.com/drive/v3/files/';
const CHECK_MS=120000;
const CACHE_DB='BancoMestreBaseTecnicaPrivada';
const CACHE_STORE='snapshots';
const CACHE_KEY=SOURCE_FILE_ID;
let loadedLocalSnapshot=false;
const NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const RNS='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
let token='',expires=0,oauth=null,config=null,lastModified='',lastCount=0,busy=false,checkHandle=null;
const $=id=>document.getElementById(id);
function status(msg,isError){
 for(const id of ['bm-v075-status','bm-v116-home-status']){const s=$(id);if(s){s.textContent=msg;s.style.color=isError?'#9e342f':'#355960';}}
}
function ui(){
 const container=document.querySelector('#cartoes .panel');if(!container||$('bm-v075-sync'))return;
 const panel=document.createElement('div');panel.id='bm-v075-sync';panel.style.cssText='padding:12px 14px;margin:12px 0 17px;background:#edf5f3;border:1px solid #bed2cd;border-radius:10px;display:flex;gap:11px;flex-wrap:wrap;align-items:center';
 const title=document.createElement('strong');title.textContent='Sincronização privada do Banco Mestre';title.style.cssText='font-size:13px';
 const btn=document.createElement('button');btn.id='bm-v075-connect';btn.type='button';btn.textContent='Conectar Drive e atualizar cartões';btn.disabled=true;
 const refresh=document.createElement('button');refresh.id='bm-v075-refresh';refresh.type='button';refresh.textContent='Verificar atualizações';refresh.disabled=true;
 const info=document.createElement('span');info.id='bm-v075-status';info.style.cssText='font-size:12px;flex-basis:100%';info.setAttribute('role','status');info.textContent='Preparando conexão. Nenhuma informação privada é publicada no GitHub.';
 panel.append(title,btn,refresh,info);container.insertBefore(panel,container.querySelector('.controls')||container.firstChild);
 const home=document.querySelector('#assuntos .panel');
 if(home&&!$('bm-v116-home-sync')){
  const bar=document.createElement('div');bar.id='bm-v116-home-sync';bar.style.cssText='padding:12px 14px;margin:10px 0 18px;border:1px solid #bed2cd;border-radius:10px;background:#edf5f3;display:flex;gap:9px;flex-wrap:wrap;align-items:center';
  const h=document.createElement('strong');h.textContent='Base Técnica • V024 com carregamento automático';h.style.cssText='font-size:13px';
  const connect=document.createElement('button');connect.type='button';connect.id='bm-v116-home-connect';connect.textContent='Conectar Drive e verificar V024';connect.disabled=true;connect.onclick=()=>{if(oauth)oauth.requestAccessToken({prompt:''});};
  const infoHome=document.createElement('span');infoHome.id='bm-v116-home-status';infoHome.style.cssText='font-size:12px;flex-basis:100%';infoHome.setAttribute('role','status');
  infoHome.textContent='Primeiro acesso neste navegador: conecte o Drive uma vez para guardar sua cópia privada. Depois ela abrirá automaticamente.';
  const forget=document.createElement('button');forget.type='button';forget.id='bm-v116-home-forget';forget.textContent='Apagar cópia local';forget.hidden=true;
  forget.onclick=async()=>{
   if(!confirm('Apagar apenas a cópia privada de cartões deste navegador? A planilha do Drive, o SRS, os grifos e os PDFs não serão alterados.'))return;
   try{await cacheDelete();location.reload();}catch(e){status('Não foi possível apagar a cópia local: '+e.message,true);}
  };
  bar.append(h,connect,forget,infoHome);home.insertBefore(bar,home.firstChild);
 }
 btn.onclick=()=>{if(oauth)oauth.requestAccessToken({prompt:''});};
 refresh.onclick=()=>{void refreshFromDrive(true);};
}

/* A cópia persistente contém SOMENTE os cartões validados, metadados de versão e data.
   Não guarda token Google, eventos SRS, grifos, PDFs ou dados de autenticação. */
function openCache(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(Error('IndexedDB indisponível'));return;}
  const request=indexedDB.open(CACHE_DB,1);
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(CACHE_STORE))db.createObjectStore(CACHE_STORE);
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||Error('Falha ao abrir armazenamento privado'));
  request.onblocked=()=>reject(Error('Armazenamento em uso por outra aba'));
 });
}
async function cacheTransaction(mode,operation,value){
 const db=await openCache();
 return new Promise((resolve,reject)=>{
  let done=false;
  const finish=(error,result)=>{
   if(done)return;done=true;db.close();
   if(error)reject(error);else resolve(result);
  };
  try{
   const tx=db.transaction(CACHE_STORE,mode);
   const store=tx.objectStore(CACHE_STORE);
   const request=operation==='get'?store.get(CACHE_KEY):
    operation==='put'?store.put(value,CACHE_KEY):store.delete(CACHE_KEY);
   let result=null;
   request.onsuccess=()=>{result=request.result;};
   tx.oncomplete=()=>finish(null,result);
   tx.onerror=()=>finish(tx.error||Error('Falha ao salvar cópia local'));
   tx.onabort=()=>finish(tx.error||Error('Operação de armazenamento cancelada'));
  }catch(e){finish(e);}
 });
}
function cacheRead(){return cacheTransaction('readonly','get');}
function cacheWrite(snapshot){return cacheTransaction('readwrite','put',snapshot);}
function cacheDelete(){return cacheTransaction('readwrite','delete');}
function validateCached(snapshot){
 if(!snapshot||snapshot.source!==SOURCE_FILE_ID||snapshot.version!=='V024 H14'||
    typeof snapshot.modifiedTime!=='string'||!Number.isFinite(Date.parse(snapshot.modifiedTime))||
    !Array.isArray(snapshot.cards)||snapshot.cards.length!==1499)
  throw Error('Cópia local ausente, de outra versão ou incompleta');
 const ids=new Set();let active=0;
 for(const c of snapshot.cards){
  if(!c||typeof c.id!=='string'||!/^CARD-\d{4,5}$/.test(c.id)||ids.has(c.id)||
    typeof c.front!=='string'||typeof c.back!=='string'||typeof c.active!=='boolean')
    throw Error('Cópia privada com IDs ou campos inválidos');
  ids.add(c.id);if(c.active)active++;
 }
 for(const id of ['CARD-1495','CARD-1496','CARD-1497','CARD-1498'])if(!ids.has(id))throw Error('Cópia sem cartões de referência');
 for(const id of ['CARD-0128','CARD-0544','CARD-0550']){
  if(snapshot.cards.find(c=>c.id===id)?.active!==false)throw Error('Cópia sem registro de fusão');
 }
 if(active!==1482)throw Error('Cópia com quantidade de ativos divergente');
 return snapshot;
}
async function restoreCache(){
 status('Procurando Base Técnica V024 salva neste navegador…');
 try{
  const snapshot=await cacheRead();
  if(!snapshot){
   status('Usando V015 pública. Conecte o Google Drive uma vez para guardar a V024 automaticamente.');
   return;
  }
  validateCached(snapshot);
  await applyCards(snapshot.cards,snapshot.modifiedTime);
  loadedLocalSnapshot=true;
  const forget=$('bm-v116-home-forget');if(forget)forget.hidden=false;
  status('V024 carregada automaticamente: 1.482 ativos / 1.499 IDs, guardada neste navegador em '+
   new Date(snapshot.savedAt||0).toLocaleString('pt-BR')+
   '. Para buscar alterações posteriores no Drive, conecte sua conta Google.');
 }catch(e){
  status('Cópia automática indisponível ('+e.message+'). A V015 pública continua disponível.',true);
 }
}

function gis(){return new Promise((resolve,reject)=>{
 if(window.google&&google.accounts&&google.accounts.oauth2){resolve();return;}
 const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=resolve;s.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(s);
});}
async function init(){ui();await restoreCache();try{
 const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});if(!r.ok)throw Error('Configuração OAuth não localizada');
 config=await r.json();if(!config.client_id||!config.client_id.endsWith('.apps.googleusercontent.com'))throw Error('Client ID OAuth inválido');
 await gis();
 oauth=google.accounts.oauth2.initTokenClient({client_id:config.client_id,scope:SCOPE,callback:result=>{
  if(result.error||!result.access_token){status('A conexão Google não foi autorizada. '+(loadedLocalSnapshot?'Sua V024 local permanece disponível.':'A V015 pública permanece disponível.'),true);return;}
  token=result.access_token;expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
  $('bm-v075-refresh').disabled=false;status('Conta conectada. Conferindo a planilha privada…');void refreshFromDrive(true);
 },error_callback:()=>status('Autorização não concluída. '+(loadedLocalSnapshot?'A V024 guardada permanece disponível.':'A V015 pública permanece disponível.'),true)});
 $('bm-v075-connect').disabled=false;if($('bm-v116-home-connect'))$('bm-v116-home-connect').disabled=false;
 if(loadedLocalSnapshot)status('V024 carregada automaticamente deste navegador (1.482 ativos). Conecte o Drive apenas para verificar atualizações mais recentes.');
 else status('V015 pública em uso. Conecte o Drive uma vez para salvar a V024 e carregá-la automaticamente nas próximas visitas.');
 checkHandle=setInterval(()=>{
  if(!token||Date.now()>=expires){if(token){token='';$('bm-v075-refresh').disabled=true;status('Sessão Google expirada. A Base Técnica local continua disponível; reconecte apenas para buscar alterações.');}return;}
  void refreshFromDrive(false);
 },CHECK_MS);
 }catch(e){status('Google Drive temporariamente indisponível: '+e.message+'. '+(loadedLocalSnapshot?'A Base Técnica V024 local permanece disponível.':'A base V015 pública permanece disponível.'),true);}}
async function authorized(path,options={}){
 if(!token||Date.now()>=expires)throw Error('Autorização expirada; reconecte o Drive');
 const r=await fetch(API+encodeURIComponent(SOURCE_FILE_ID)+path,Object.assign({headers:{Authorization:'Bearer '+token},cache:'no-store'},options));
 if(r.status===401)throw Error('Sessão expirada');if(r.status===403)throw Error('A conta conectada não pode ler a planilha');
 if(r.status===404)throw Error('Planilha não encontrada');if(!r.ok)throw Error('Google Drive retornou HTTP '+r.status);
 return r;
}
function zipEntries(buf){
 const bytes=new Uint8Array(buf),view=new DataView(buf),len=bytes.length,dec=new TextDecoder();let eocd=-1;
 for(let i=len-22;i>=Math.max(0,len-65557);i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}
 if(eocd<0)throw Error('ZIP inválido: diretório não encontrado');
 const n=view.getUint16(eocd+10,true),offset=view.getUint32(eocd+16,true);const map=new Map();let p=offset;
 for(let i=0;i<n;i++){
  if(view.getUint32(p,true)!==0x02014b50)throw Error('Cabeçalho ZIP inválido');
  const method=view.getUint16(p+10,true),size=view.getUint32(p+20,true),nl=view.getUint16(p+28,true),el=view.getUint16(p+30,true),cl=view.getUint16(p+32,true),loc=view.getUint32(p+42,true);
  const name=dec.decode(bytes.subarray(p+46,p+46+nl));map.set(name,{method,size,loc});p+=46+nl+el+cl;
 }
 async function read(name){
  const v=map.get(name);if(!v)throw Error('Parte XLSX ausente: '+name);
  const l=v.loc;if(view.getUint32(l,true)!==0x04034b50)throw Error('Entrada ZIP inválida');
  const start=l+30+view.getUint16(l+26,true)+view.getUint16(l+28,true);const data=bytes.slice(start,start+v.size);
  if(v.method===0)return dec.decode(data);
  if(v.method!==8||typeof DecompressionStream==='undefined')throw Error('O navegador não suporta a compactação XLSX');
  const raw=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return dec.decode(await new Response(raw).arrayBuffer());
 }
 return {read};
}
function xml(s){const d=new DOMParser().parseFromString(s,'application/xml');if(d.querySelector('parsererror'))throw Error('XML de planilha inválido');return d;}
function elements(node,name){return Array.from(node.getElementsByTagNameNS(NS,name));}
function value(cell,shared){const typ=cell.getAttribute('t');if(typ==='inlineStr')return elements(cell,'t').map(n=>n.textContent).join('');const raw=elements(cell,'v')[0]?.textContent||'';return typ==='s'?shared[Number(raw)]||'':raw;}
function colNumber(s){let x=0;for(const ch of s)x=x*26+ch.charCodeAt(0)-64;return x-1;}
async function parseWorkbook(buf){
 const z=zipEntries(buf);const wb=xml(await z.read('xl/workbook.xml'));const rel=xml(await z.read('xl/_rels/workbook.xml.rels'));
 const tab=elements(wb,'sheet').find(x=>x.getAttribute('name')==='Cartoes_V015');if(!tab)throw Error('A aba Cartoes_V015 não existe');
 const rid=tab.getAttributeNS(RNS,'id');const relationship=Array.from(rel.getElementsByTagName('*')).find(x=>x.localName==='Relationship'&&x.getAttribute('Id')===rid);
 if(!relationship)throw Error('Não foi possível localizar a aba de cartões');
 let path=relationship.getAttribute('Target').replace(/^\//,'');if(!path.startsWith('xl/'))path='xl/'+path;
 const stack=[];for(const x of path.split('/')){if(x==='..')stack.pop();else if(x!=='.')stack.push(x);}path=stack.join('/');
 let shared=[];try{const ss=xml(await z.read('xl/sharedStrings.xml'));shared=elements(ss,'si').map(si=>elements(si,'t').map(x=>x.textContent).join(''));}catch(e){if(!e.message.startsWith('Parte XLSX ausente'))throw e;}
 const data=xml(await z.read(path));const rows=elements(data,'sheetData')[0];if(!rows)throw Error('Aba sem linhas');const table=[];
 for(const row of elements(rows,'row')){
  const line=[];for(const c of elements(row,'c')){const ref=c.getAttribute('r');const letters=ref.match(/^[A-Z]+/)?.[0];if(!letters)continue;line[colNumber(letters)]=value(c,shared);}
  if(line.some(x=>x!==undefined&&x!==''))table.push(line);
 }
 if(table.length<1495)throw Error('Planilha incompleta: '+(table.length-1)+' cartões');
 const header=table.shift().map(x=>String(x||'').trim());const ix=name=>{const n=header.indexOf(name);if(n<0)throw Error('Coluna ausente: '+name);return n;};
 const I={id:ix('ID'),disc:ix('Disciplina'),subj:ix('Assunto'),sub:ix('Subassunto'),front:ix('Pergunta'),back:ix('Resposta'),expl:ix('Explicação / evolução'),mnem:ix('Macete'),source:ix('Fonte / referência'),active:ix('Ativo')};
 const output=[];const ids=new Set();for(const row of table){const id=String(row[I.id]||'').trim();if(!/^CARD-\d{4,5}$/.test(id))throw Error('ID inválido: '+id);if(ids.has(id))throw Error('ID duplicado: '+id);ids.add(id);
  const d=String(row[I.disc]||'');const group=/Legisla|Direito/i.test(d)?'LEGISLACAO':/Portugu/i.test(d)?'PORTUGUES':/Matem|Estat|Financ/i.test(d)?'MATEMATICA':/Inform|AutoCAD/i.test(d)?'INFORMATICA':'ENG_GERAL';
  output.push({id,group,discipline:d,subject:String(row[I.subj]||''),sub:String(row[I.sub]||''),front:String(row[I.front]||''),back:String(row[I.back]||''),expl:String(row[I.expl]||''),mnemonic:String(row[I.mnem]||''),reference:String(row[I.source]||''),active:String(row[I.active])!=='0'});
 }
 for(const id of ['CARD-1495','CARD-1496','CARD-1497','CARD-1498'])if(!ids.has(id))throw Error('Cartão de lei seca ausente: '+id);
 if(output.length!==1499)throw Error('V024 incompleta: esperado 1499 cartões, encontrados '+output.length);
 const byId=new Map(output.map(c=>[c.id,c]));
 for(const id of ['CARD-0128','CARD-0544','CARD-0550'])if(byId.get(id)?.active!==false)throw Error('Fusão H14 ausente: '+id);
 if(output.filter(c=>c.active).length!==1482)throw Error('Total de cartões ativos divergente da V024 H14');
 return output;
}
async function waitCards(){
 if(typeof loadCards!=='function')throw Error('Leitor de flashcards indisponível');await loadCards();
 for(let i=0;i<40;i++){if(typeof cards!=='undefined'&&cards.filter(c=>!c.provisional).length>=1494)return;await new Promise(resolve=>setTimeout(resolve,250));}
 throw Error('Base de cartões do portal ainda não terminou de carregar');
}
async function applyCards(fresh,modified){
 await waitCards();const old=new Map(cards.filter(c=>!c.provisional).map(c=>[c.id,c]));
 const merged=fresh.map(c=>{
  const o=old.get(c.id);if(o)return Object.assign({},o,c,{group:o.group||c.group});return c;
 });
 const provisional=cards.filter(c=>c.provisional);cards.splice(0,cards.length,...provisional,...merged);
 const total=document.querySelector('.stats .stat:nth-child(2) b');if(total)total.textContent=merged.filter(c=>c.active).length+' ativos / '+merged.length+' IDs + '+provisional.length+' Ijuí';
 document.querySelectorAll('header span').forEach(s=>{if(s.textContent.includes('V114 · base V015'))s.textContent=s.textContent.replace('V114 · base V015','V114 · base V024 privada');});
 const opts=$('cardFilter');if(opts){const used=new Set(Array.from(opts.options).map(o=>o.value));for(const d of new Set(merged.map(c=>c.discipline))){if(d&&!used.has(d)){opts.add(new Option(d,d));used.add(d);}}}
 if(typeof loadTopics==='function')await loadTopics();if(typeof cardRender==='function')cardRender();
 lastModified=modified;lastCount=merged.length;
 status('V024 carregada: '+merged.length+' IDs, '+merged.filter(c=>c.active).length+' ativos, '+merged.filter(c=>!c.active).length+' inativos preservados • atualizado em '+new Date(modified).toLocaleString('pt-BR')+'. Verificação a cada 2 minutos enquanto conectado.');
}
async function refreshFromDrive(force){
 if(busy)return;if(!token||Date.now()>=expires){status('Reconecte o Drive para atualizar a planilha.',true);return;}
 busy=true;const b=$('bm-v075-refresh');if(b)b.disabled=true;
 try{
  const m=await (await authorized('?fields=id,name,mimeType,modifiedTime,size')).json();
  if(!/spreadsheetml.sheet/.test(m.mimeType||''))throw Error('A origem deixou de ser um arquivo XLSX');
  if(!force&&m.modifiedTime===lastModified)return;
  if(m.modifiedTime===lastModified&&lastCount){status('Drive conferido: V024 com '+lastCount+' IDs. Sem mudanças desde '+new Date(lastModified).toLocaleString('pt-BR')+'. Cópia automática mantida.');return;}
  status('Atualização detectada. Lendo e validando os cartões…');
  const binary=await (await authorized('?alt=media')).arrayBuffer();
  const fresh=await parseWorkbook(binary);
  await applyCards(fresh,m.modifiedTime);
  try{
   await cacheWrite({source:SOURCE_FILE_ID,version:'V024 H14',modifiedTime:m.modifiedTime,
    savedAt:Date.now(),cards:fresh});
   loadedLocalSnapshot=true;
   const forget=$('bm-v116-home-forget');if(forget)forget.hidden=false;
   status('V024 sincronizada e salva neste navegador: 1.482 ativos / 1.499 IDs. Abrirá automaticamente nas próximas visitas. Verificação do Drive a cada 2 minutos nesta sessão.');
  }catch(storageError){
   status('V024 atualizada nesta sessão (1.482 ativos), mas o navegador não permitiu guardar a cópia: '+storageError.message+'. Na próxima visita será necessária nova conexão.',true);
  }
 }catch(e){status('Não foi possível consultar o Drive: '+e.message+'. '+(loadedLocalSnapshot?'A V024 local permanece disponível.':'A V015 pública permanece disponível.')+' O SRS não foi alterado.',true);}
 finally{busy=false;if(b&&token&&Date.now()<expires)b.disabled=false;}
}
function start(){void init();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();