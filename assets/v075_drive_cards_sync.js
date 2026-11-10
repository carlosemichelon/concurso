/* Banco Mestre V075 — leitura privada de XLSX via OAuth Drive, sem publicar dados no GitHub.
   O titular conecta a conta; durante a sessão autorizada, consulta a versão no Drive
   ao abrir e a cada 120s. A base estática e o SRS permanecem intactos se a consulta falhar. */
(function(){
'use strict';
const SOURCE_FILE_ID='1SA-PKBrlaovuNLFMPBx7BByH3BH0Tcsr';
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const API='https://www.googleapis.com/drive/v3/files/';
const CHECK_MS=120000;
const NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const RNS='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
let token='',expires=0,oauth=null,config=null,lastModified='',lastCount=0,busy=false,checkHandle=null;
const $=id=>document.getElementById(id);
function status(msg,isError){const s=$('bm-v075-status');if(s){s.textContent=msg;s.style.color=isError?'#9e342f':'#355960';} }
function ui(){
 const container=document.querySelector('#cartoes .panel');if(!container||$('bm-v075-sync'))return;
 const panel=document.createElement('div');panel.id='bm-v075-sync';panel.style.cssText='padding:12px 14px;margin:12px 0 17px;background:#edf5f3;border:1px solid #bed2cd;border-radius:10px;display:flex;gap:11px;flex-wrap:wrap;align-items:center';
 const title=document.createElement('strong');title.textContent='Sincronização privada do Banco Mestre';title.style.cssText='font-size:13px';
 const btn=document.createElement('button');btn.id='bm-v075-connect';btn.type='button';btn.textContent='Conectar Drive e atualizar cartões';btn.disabled=true;
 const refresh=document.createElement('button');refresh.id='bm-v075-refresh';refresh.type='button';refresh.textContent='Verificar atualizações';refresh.disabled=true;
 const info=document.createElement('span');info.id='bm-v075-status';info.style.cssText='font-size:12px;flex-basis:100%';info.setAttribute('role','status');info.textContent='Preparando conexão. Nenhuma informação privada é publicada no GitHub.';
 panel.append(title,btn,refresh,info);container.insertBefore(panel,container.querySelector('.controls')||container.firstChild);
 btn.onclick=()=>{if(oauth)oauth.requestAccessToken({prompt:token?'':'consent'});};
 refresh.onclick=()=>{void refreshFromDrive(true);};
}
function gis(){return new Promise((resolve,reject)=>{
 if(window.google&&google.accounts&&google.accounts.oauth2){resolve();return;}
 const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=resolve;s.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(s);
});}
async function init(){ui();try{
 const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});if(!r.ok)throw Error('Configuração OAuth não localizada');
 config=await r.json();if(!config.client_id||!config.client_id.endsWith('.apps.googleusercontent.com'))throw Error('Client ID OAuth inválido');
 await gis();
 oauth=google.accounts.oauth2.initTokenClient({client_id:config.client_id,scope:SCOPE,callback:result=>{
  if(result.error||!result.access_token){status('A conta Google não autorizou a leitura. A base publicada permanece disponível.',true);return;}
  token=result.access_token;expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
  $('bm-v075-refresh').disabled=false;status('Conta conectada. Conferindo a planilha privada…');void refreshFromDrive(true);
 },error_callback:()=>status('Autorização não concluída. Nenhuma alteração foi aplicada.',true)});
 $('bm-v075-connect').disabled=false;status('Para sincronizar sua planilha privada, autorize a leitura do Drive. Depois a atualização será automática nesta sessão.');
 checkHandle=setInterval(()=>{
  if(!token||Date.now()>=expires){if(token){token='';$('bm-v075-refresh').disabled=true;status('Sessão expirada. Reconecte o Drive para continuar a atualização automática.',true);}return;}
  void refreshFromDrive(false);
 },CHECK_MS);
 }catch(e){status('Conexão não disponível: '+e.message+'. Cartões originais preservados.',true);}}
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
 for(const id of ['CARD-1495','CARD-1496','CARD-1497'])if(!ids.has(id))throw Error('Checkpoint V016-R1 incompleto: '+id);
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
 const total=document.querySelector('.stats .stat:nth-child(2) b');if(total)total.textContent=merged.length+' + '+provisional.length;
 const opts=$('cardFilter');if(opts){const used=new Set(Array.from(opts.options).map(o=>o.value));for(const d of new Set(merged.map(c=>c.discipline))){if(d&&!used.has(d)){opts.add(new Option(d,d));used.add(d);}}}
 if(typeof loadTopics==='function')await loadTopics();if(typeof cardRender==='function')cardRender();
 lastModified=modified;lastCount=merged.length;
 status('Sincronizado com Drive: '+merged.length+' cartões • última alteração no arquivo: '+new Date(modified).toLocaleString('pt-BR')+'. Atualização automática a cada 2 minutos enquanto conectado.');
}
async function refreshFromDrive(force){
 if(busy)return;if(!token||Date.now()>=expires){status('Reconecte o Drive para atualizar a planilha.',true);return;}
 busy=true;const b=$('bm-v075-refresh');if(b)b.disabled=true;
 try{
  const m=await (await authorized('?fields=id,name,mimeType,modifiedTime,size')).json();
  if(!/spreadsheetml.sheet/.test(m.mimeType||''))throw Error('A origem deixou de ser um arquivo XLSX');
  if(!force&&m.modifiedTime===lastModified)return;
  if(m.modifiedTime===lastModified&&lastCount){status('Planilha conferida: '+lastCount+' cartões. Nenhuma mudança desde '+new Date(lastModified).toLocaleString('pt-BR')+'.');return;}
  status('Atualização detectada. Lendo e validando os cartões…');
  const binary=await (await authorized('?alt=media')).arrayBuffer();
  const fresh=await parseWorkbook(binary);
  await applyCards(fresh,m.modifiedTime);
 }catch(e){status('Não foi possível sincronizar: '+e.message+'. Cartões e SRS anteriores preservados.',true);}
 finally{busy=false;if(b&&token&&Date.now()<expires)b.disabled=false;}
}
function start(){void init();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();