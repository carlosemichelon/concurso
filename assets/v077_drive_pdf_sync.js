/* Banco Mestre V077: indexação autenticada de PDFs do Drive em duas pastas explícitas.
 * A lista é consultada na conta do titular após OAuth, sem publicar PDFs privados.
 * Não altera os PDF originais, anotações, flashcards ou SRS. */
(function(){
'use strict';
const FOLDERS=[
 {id:'1_IgIlki_2ZlMmOaKmYuzhiMSjyLa-cnV',group:'eng_seguranca',section:'Normas Regulamentadoras — SST',category:'ENG_SEGURANCA'},
 {id:'18MsuWSayX7xpBhNmGjSvFmiiv1hF6YZk',group:'eng_ambiental',section:'Petrobras 10 — Licenciamento ambiental',category:'ENG_AMBIENTAL'}
];
const API='https://www.googleapis.com/drive/v3/files';
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const INTERVAL=120000;
let token='',expiry=0,oauth=null,checking=false,staticCount=72;
const $=id=>document.getElementById(id);
function message(t,err){const e=$('bm-pdf-sync-status');if(e){e.textContent=t;e.style.color=err?'#993b32':'#355960';}}
function insertControls(){
 const panel=$('pdfs')?.querySelector('.panel');if(!panel||$('bm-pdf-sync'))return;
 const bar=document.createElement('div');bar.id='bm-pdf-sync';bar.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:9px;padding:12px;margin:13px 0;border:1px solid #c7d8d5;border-radius:9px;background:#f0f6f4';
 const label=document.createElement('strong');label.textContent='PDFs do Google Drive';label.style.cssText='font-size:13px';
 const connect=document.createElement('button');connect.id='bm-pdf-sync-connect';connect.type='button';connect.disabled=true;connect.textContent='Conectar e sincronizar PDFs';
 const refresh=document.createElement('button');refresh.id='bm-pdf-sync-refresh';refresh.type='button';refresh.disabled=true;refresh.textContent='Verificar agora';
 const status=document.createElement('span');status.id='bm-pdf-sync-status';status.style.cssText='flex-basis:100%;font-size:12px';status.setAttribute('role','status');status.textContent='O catálogo publicado tem 72 PDFs. Para buscar novos arquivos nas duas pastas do Drive, autorize a leitura.';
 bar.append(label,connect,refresh,status);
 panel.insertBefore(bar,$('pdfAreaNavV036')||panel.querySelector('.controls')||panel.firstChild);
 connect.onclick=()=>{if(oauth)oauth.requestAccessToken({prompt:token?'':'consent'});};
 refresh.onclick=()=>{void refreshFolders();};
}
function loadGIS(){return new Promise((resolve,reject)=>{
 if(window.google?.accounts?.oauth2){resolve();return;}
 const el=document.createElement('script');el.src='https://accounts.google.com/gsi/client';el.async=true;
 el.onload=resolve;el.onerror=()=>reject(new Error('Google Identity Services indisponível'));
 document.head.append(el);
});}
async function setup(){
 insertControls();
 try{
  const conf=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!conf.ok)throw new Error('configuração de acesso Google não localizada');
  const client=(await conf.json()).client_id;
  if(!client||!client.endsWith('.apps.googleusercontent.com'))throw new Error('Client ID OAuth inválido');
  await loadGIS();
  oauth=google.accounts.oauth2.initTokenClient({client_id:client,scope:SCOPE,callback:r=>{
   if(r.error||!r.access_token){message('Acesso não autorizado. Catálogo anterior preservado.',true);return;}
   token=r.access_token;expiry=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
   $('bm-pdf-sync-refresh').disabled=false;
   void refreshFolders();
  },error_callback:()=>message('Falha na autorização Google. Catálogo anterior preservado.',true)});
  $('bm-pdf-sync-connect').disabled=false;
  message('Pronto para consultar as pastas NRs e Licenciamento no seu Drive. Autorize uma vez nesta sessão.');
  setInterval(()=>{
   if(token&&Date.now()<expiry){void refreshFolders();return;}
   if(token){token='';$('bm-pdf-sync-refresh').disabled=true;message('Autorização expirada. Reconecte para verificar PDFs novos.',true);}
  },INTERVAL);
 }catch(e){message('Sincronização de PDFs indisponível: '+e.message+'. Catálogo publicado preservado.',true);}
}
async function requestFolder(folder){
 let next='',items=[],loops=0;
 do{
  if(++loops>20)throw new Error('Paginação excessiva da pasta de PDFs');
  const query=new URLSearchParams({q:"'"+folder.id+"' in parents and mimeType = 'application/pdf' and trashed = false",fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime)',pageSize:'1000'});
  if(next)query.set('pageToken',next);
  const r=await fetch(API+'?'+query,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(r.status===401)throw new Error('sessão Google expirada');
  if(r.status===403)throw new Error('sem permissão para ler a pasta '+folder.section);
  if(!r.ok)throw new Error('Drive HTTP '+r.status);
  const json=await r.json();items.push(...(json.files||[]));next=json.nextPageToken||'';
 }while(next);
 return items.filter(f=>f.mimeType==='application/pdf'&&/^[A-Za-z0-9_-]{15,}$/.test(f.id)).map(f=>({file:f,folder}));
}
function labelFromName(name){return String(name||'Documento PDF').replace(/\.pdf$/i,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim().slice(0,180);}
async function refreshFolders(){
 if(checking)return;
 if(!token||Date.now()>=expiry){message('Conecte sua conta Google para verificar os PDFs.',true);return;}
 checking=true;
 const b=$('bm-pdf-sync-refresh');if(b)b.disabled=true;
 try{
  if(typeof pdfInit!=='function'||typeof pdfRender!=='function')throw new Error('biblioteca de PDFs do portal indisponível');
  if(!Array.isArray(docs)||!docs.length)await pdfInit();
  const groupAPI=window.BancoMestrePDFGruposV036;
  if(!groupAPI?.ready||!groupAPI?.registerExternal)throw new Error('módulo de grupos PDF V077 indisponível');
  await groupAPI.ready();
  message('Conferindo pastas NRs e Licenciamento no Drive...');
  const groups=await Promise.all(FOLDERS.map(requestFolder));
  const files=groups.flat();if(files.length>500)throw new Error('mais de 500 PDFs nas duas pastas; revise a organização');
  const existing=docs.filter(x=>!x._driveDynamic);
  const seen=new Set(existing.map(x=>x.file_id));
  const staticNames=new Set(existing.map(x=>String(x.filename||'').toLowerCase()).filter(Boolean));
  const extra=[];
  for(const {file,folder} of files){
   if(seen.has(file.id)||staticNames.has(file.name.toLowerCase()))continue;
   if(extra.some(x=>x.file_id===file.id))continue;
   extra.push({id:'DRIVE-PDF-'+file.id,title:labelFromName(file.name),filename:file.name,file_id:file.id,
    category:folder.category,section:folder.section,source:'Google Drive (OAuth)',
    url:'https://drive.google.com/file/d/'+encodeURIComponent(file.id)+'/view',
    size:Number(file.size||0),modifiedTime:file.modifiedTime||'',group:folder.group,
    _driveDynamic:true,origin:'PDF detectado no Drive sem modificar arquivo ou grifos'});
  }
  groupAPI.registerExternal(extra);
  // Substituição SOMENTE em memória: preserva PDF e grifos locais, IDs e 72 entradas estáticas.
  docs.splice(0,docs.length,...existing,...extra);
  const stat=$('pdfStat');if(stat)stat.textContent=String(docs.length);
  staticCount=existing.length;
  pdfRender();
  message('Drive conferido: '+staticCount+' PDFs catalogados + '+extra.length+' novo(s) nesta sessão. Verificação a cada 2 minutos enquanto conectado. Nenhum PDF privado foi publicado no GitHub.');
 }catch(e){message('Não foi possível conferir o Drive: '+e.message+'. PDFs e grifos anteriores preservados.',true);}
 finally{checking=false;if(b&&token&&Date.now()<expiry)b.disabled=false;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else void setup();
})();