/* Banco Mestre V130 — sincronização abrangente de PDFs do acervo do Drive.
 * Consulta os dois repositórios principais, incluindo subpastas, e os dois acervos
 * especializados. Nunca publica bytes ou links privados no GitHub.
 * Somente metadados são adicionados à lista na sessão autenticada.
 * Arquivos e grifos originais, IDs canônicos, SRS e cartões não são alterados.
 */
(function(){
'use strict';
if(window.BancoMestrePDFSyncV130)return;
const ROOTS=[
 {id:'1yvwhb-W-vMUMu5DmikE3hR-i01cnrWdK',name:'DataBase_Concurso',group:''},
 {id:'1squNqRXuxfT1YRjT3i4nw8TRnFtLOcuE',name:'CONCURSOS – ENGENHARIA CIVIL',group:''},
 {id:'1_IgIlki_2ZlMmOaKmYuzhiMSjyLa-cnV',name:'Normas Regulamentadoras',group:'eng_seguranca'},
 {id:'18MsuWSayX7xpBhNmGjSvFmiiv1hF6YZk',name:'Licenciamento ambiental',group:'eng_ambiental'}
];
const API='https://www.googleapis.com/drive/v3/files';
const SCOPE='https://www.googleapis.com/auth/drive.readonly';
const FOLDER='application/vnd.google-apps.folder';
const MAX_FOLDERS=1500,MAX_PDFS=30000,CONCURRENCY=5;
let token='',expires=0,client=null,scanning=false,lastResult=null;
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const label=s=>String(s||'Documento PDF').replace(/\.pdf$/i,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim().slice(0,180);
function status(message,error){
 const e=$('bm-pdf-sync-status');if(!e)return;
 e.textContent=message;e.style.color=error?'#993b32':'#355960';
}
function ui(){
 const panel=$('pdfs')?.querySelector('.panel');if(!panel||$('bm-pdf-sync'))return;
 const bar=document.createElement('div');bar.id='bm-pdf-sync';
 bar.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px;margin:10px 0;border:1px solid #c7d8d5;border-radius:9px;background:#f0f6f4';
 const heading=document.createElement('strong');heading.textContent='PDFs do Google Drive';heading.style.fontSize='13px';
 const connect=document.createElement('button');connect.id='bm-pdf-sync-connect';connect.type='button';connect.disabled=true;connect.textContent='Conectar Drive';
 const sync=document.createElement('button');sync.id='bm-pdf-sync-refresh';sync.type='button';sync.disabled=true;sync.textContent='Sincronizar todos os PDFs';
 const state=document.createElement('span');state.id='bm-pdf-sync-status';state.setAttribute('role','status');state.setAttribute('aria-live','polite');
 state.style.cssText='flex-basis:100%;font-size:12px';
 state.textContent='Aguardando conexão para localizar PDFs em todas as subpastas do acervo.';
 bar.append(heading,connect,sync,state);
 panel.insertBefore(bar,$('pdfAreaNavV036')||panel.firstChild);
 connect.onclick=()=>authorize();
 sync.onclick=()=>{if(scanning)return;if(authorized())void refresh();else authorize();};
}
function authorized(){return !!token&&Date.now()<expires;}
function authorize(){
 if(!client){status('A conexão com o Google ainda não está pronta.',true);return;}
 status('Autorização necessária para consultar os PDFs do Drive.');
 client.requestAccessToken({prompt:authorized()?'':'consent'});
}
function gis(){
 if(window.google?.accounts?.oauth2?.initTokenClient)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const el=document.createElement('script');el.src='https://accounts.google.com/gsi/client';el.async=true;
  el.onload=resolve;el.onerror=()=>reject(new Error('Serviço de autenticação Google indisponível'));
  document.head.append(el);
 });
}
async function initialize(){
 ui();
 try{
  const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!response.ok)throw Error('Configuração Google não encontrada');
  const conf=await response.json();
  if(!/\.apps\.googleusercontent\.com$/.test(conf.client_id||''))throw Error('Client ID OAuth inválido');
  await gis();
  client=google.accounts.oauth2.initTokenClient({
   client_id:conf.client_id,scope:SCOPE,
   callback:r=>{
    if(r.error||!r.access_token){status('Drive não autorizado. O catálogo anterior foi preservado.',true);return;}
    token=r.access_token;
    expires=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
    void refresh();
   },
   error_callback:()=>status('Falha na autorização Google. Nenhum PDF foi alterado.',true)
  });
  $('bm-pdf-sync-connect').disabled=false;
  $('bm-pdf-sync-refresh').disabled=false;
  status('Pronto: clique em Sincronizar todos os PDFs. Busca em DataBase_Concurso, CONCURSOS – ENGENHARIA CIVIL e acervos complementares.');
 }catch(e){status('Sincronização indisponível: '+e.message+'. PDFs anteriores preservados.',true);}
}
async function fetchPage(url){
 for(let attempt=0;attempt<3;attempt++){
  const r=await fetch(url,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(r.status===401){token='';expires=0;throw Error('sessão Google expirada; reconecte o Drive');}
  if(r.status===403)throw Error('acesso negado a uma pasta do acervo');
  if(r.status===429||r.status>=500){
   if(attempt===2)throw Error('Drive temporariamente indisponível (HTTP '+r.status+')');
   await new Promise(ok=>setTimeout(ok,450*(attempt+1)));
   continue;
  }
  if(!r.ok)throw Error('Drive HTTP '+r.status);
  return r.json();
 }
 throw Error('Falha ao consultar o Drive');
}
async function children(id){
 let next='',all=[],pages=0;
 do{
  if(++pages>80)throw Error('pasta com excesso de páginas; auditoria necessária');
  const q=new URLSearchParams({
   q:"'"+id+"' in parents and trashed = false",
   fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents)',
   pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'
  });
  if(next)q.set('pageToken',next);
  const data=await fetchPage(API+'?'+q.toString());
  all.push(...(Array.isArray(data.files)?data.files:[]));
  next=data.nextPageToken||'';
 }while(next);
 return all;
}
async function crawl(){
 const queue=ROOTS.map(r=>({...r,path:r.name}));
 const visited=new Set(),found=new Map();
 let checked=0;
 while(queue.length){
  const batch=[];
  while(queue.length&&batch.length<CONCURRENCY){
   const folder=queue.shift();
   if(visited.has(folder.id))continue;
   visited.add(folder.id);
   if(visited.size>MAX_FOLDERS)throw Error('mais de '+MAX_FOLDERS+' pastas; a consulta foi interrompida sem alterar o catálogo');
   batch.push(folder);
  }
  if(!batch.length)continue;
  const pages=await Promise.all(batch.map(async f=>({folder:f,items:await children(f.id)})));
  for(const {folder,items} of pages){
   checked++;
   for(const file of items){
    if(!file||!file.id||!file.name)continue;
    if(file.mimeType===FOLDER){
     if(!visited.has(file.id))queue.push({id:file.id,name:file.name,path:folder.path+' / '+file.name,group:folder.group});
    }else if(file.mimeType==='application/pdf'&&/^[A-Za-z0-9_-]{15,}$/.test(file.id)){
     if(!found.has(file.id))found.set(file.id,{file,path:folder.path,rootGroup:folder.group});
     if(found.size>MAX_PDFS)throw Error('mais de '+MAX_PDFS+' PDFs; a consulta foi interrompida sem alterar o catálogo');
    }
   }
  }
  if(checked===ROOTS.length||checked%10===0)
   status('Lendo Drive: '+checked+' pasta(s), '+found.size+' PDF(s) localizados…');
 }
 return {found,checked};
}
function inferGroup(rec){
 if(rec.rootGroup)return rec.rootGroup;
 const file=norm(rec.file.name), path=norm(rec.path), all=file+' '+path;
 // Regras específicas têm precedência sobre a área principal da pasta.
 if(/ijui|iju[ií]/.test(all)&&/lei|estatuto|codigo|plano diretor|tribut|servidor|municip/.test(all))return 'leg_ijui';
 if(/(?:edital|prova|gabarito|questoes|concurso anterior)/.test(file)||
    /(?:editais e provas|03_questoes_provas|05.*editais.*provas|questoes provas e gabaritos)/.test(path))return 'apoio_provas';
 if(/(?:vade.?mecum|constitui[cç][aã]o|codigo (?:civil|penal|eleitoral|tributario)|lei (?:seca|federal)|licitac|improbidade|legislacao geral|lei 1[045]\.|lgpd|estatuto da cidade|lrf)/.test(all))return 'leg_geral';
 if(/(?:legislacao municipal|lei organica|plano diretor municipal|codigo de obras|municipal)/.test(all))return 'leg_outros';
 if(/(?:\bnr[-_ ]?0?[15789]\b|\bnr[-_ ]?1[078]\b|cipa|pcms[oó]|seguranca|sst|epi|ergonomia|acessibilidade)/.test(all))return 'eng_seguranca';
 if(/(?:conama|licenciamento|ambiental|eia.?rima|residuos|aterro sanitario)/.test(all))return 'eng_ambiental';
 if(/(?:geotecn|mecanica dos solos|fundac|sondagem|sapata|estacas|taludes|aterros)/.test(all))return 'eng_geotecnia';
 if(/(?:estrutur|resistencia dos materiais|concreto armado|nbr.?6118|nbr.?8800|trelica|metalica)/.test(all))return 'eng_estruturas';
 if(/(?:cimento|agregados|argamass|alvenaria|tecnologia do concreto|materiais de construcao)/.test(all))return 'eng_materiais';
 if(/(?:instalac.*eletric|nbr.?5410|fator de potencia)/.test(all))return 'eng_instalacoes';
 if(/(?:hidraulic|saneamento|agua fria|esgoto|drenagem|tratamento de agua|estacao de tratamento|eta ete|nbr.?8160|nbr.?5626)/.test(all))return 'eng_hidraulica';
 if(/(?:rodovia|paviment|pontes|trafego|transporte viario)/.test(all))return 'eng_rodovias';
 if(/(?:topograf|poligonal|cartografia|geodesia)/.test(all))return 'eng_topografia';
 if(/(?:patolog|manutencao predial|inspecao predial)/.test(all))return 'eng_patologias';
 if(/(?:desempenho|nbr.?15575)/.test(all))return 'eng_desempenho';
 if(/(?:orcament|planejamento|curva.?s|bdi|cronograma|avaliacao de bens|nbr.?14653)/.test(all))return 'eng_planejamento';
 if(/(?:portugues|gramatica|sintaxe|morfologia|redacao|ortografia|concordancia|crase)/.test(all))return 'lang_port';
 if(/(?:matemat|raciocinio logico|tabela verdade|algebra|geometria|probabilidade|estatistica)/.test(all))return 'lang_math';
 if(/(?:obras completas|manuscrito completo|engenharia civil completo)/.test(all))return 'completo';
 if(/(?:legislacao|normas legais|direito)/.test(all))return 'leg_outros';
 if(/(?:engenharia civil|_eng_|estruturas|construcao)/.test(all))return 'eng_outros';
 if(/(?:matematica|portugues)/.test(all))return 'lang_outros';
 return 'apoio_drive';
}
function driveUrl(id){return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view';}
async function refresh(){
 if(scanning)return lastResult;
 if(!authorized()){status('Conecte o Google Drive para sincronizar todos os PDFs.',true);return null;}
 scanning=true;
 const sync=$('bm-pdf-sync-refresh'),connect=$('bm-pdf-sync-connect');
 if(sync)sync.disabled=true;
 if(connect)connect.disabled=true;
 try{
  if(typeof pdfInit!=='function'||typeof pdfRender!=='function'||!Array.isArray(docs))
   throw Error('biblioteca PDF não carregada');
  if(!docs.length)await pdfInit();
  const api=window.BancoMestrePDFGruposV036;
  if(!api?.ready||!api?.registerExternal)throw Error('grupos da biblioteca indisponíveis');
  await api.ready();
  status('Consultando as pastas e subpastas dos acervos no Drive…');
  const {found,checked}=await crawl();
  const previousDynamic=new Set(docs.filter(p=>p._driveDynamic).map(p=>p.id));
  const staticDocs=docs.filter(p=>!p._driveDynamic).map(p=>({...p}));
  const known=new Map(staticDocs.filter(p=>p.file_id).map(p=>[p.file_id,p]));
  const extra=[];
  let refreshed=0;
  for(const rec of found.values()){
   const f=rec.file;
   const knownStatic=known.get(f.id);
   if(knownStatic){
    knownStatic._driveSynced=true;
    knownStatic.modifiedTime=f.modifiedTime||'';
    refreshed++;
    continue;
   }
   extra.push({
    id:'DRIVE-PDF-'+f.id,title:label(f.name),filename:f.name,file_id:f.id,
    url:driveUrl(f.id),section:rec.path,drivePath:rec.path,
    category:'PDF_DE_ESTUDO',source:'Google Drive (OAuth)',
    size:Number(f.size||0),modifiedTime:f.modifiedTime||'',group:inferGroup(rec),
    _driveDynamic:true,_driveSynced:true,
    origin:'PDF identificado no Drive; original e anotações não foram alterados'
   });
  }
  extra.sort((x,y)=>x.title.localeCompare(y.title,'pt-BR'));
  api.registerExternal(extra);
  // Commit atômico após conferência total. Nenhum ID estático é removido.
  docs.splice(0,docs.length,...staticDocs,...extra);
  if($('pdfStat'))$('pdfStat').textContent=String(docs.length);
  const newlyAdded=extra.filter(p=>!previousDynamic.has(p.id)).length;
  if(newlyAdded&&$('pdfSearch')&&$('pdfFilter')){
   $('pdfSearch').value='';$('pdfFilter').value='all';
  }
  pdfRender();
  const summary=checked+' pastas consultadas; '+found.size+' PDFs do Drive encontrados; '+
    newlyAdded+' novo(s) nesta sessão; '+extra.length+' além dos '+staticDocs.length+
    ' do catálogo principal. Clique novamente após adicionar documentos. Nenhum arquivo ou grifo foi apagado.';
  status('Sincronização concluída: '+summary);
  lastResult={folders:checked,found:found.size,added:newlyAdded,dynamic:extra.length,static:staticDocs.length,matchedStatic:refreshed};
  return lastResult;
 }catch(e){
  status('Sincronização incompleta: '+e.message+'. Lista anterior preservada; tente novamente.',true);
  return null;
 }finally{
  scanning=false;
  if(sync)sync.disabled=!client;
  if(connect)connect.disabled=!client;
 }
}
window.BancoMestrePDFSyncV130={refresh,get lastResult(){return lastResult},roots:ROOTS.map(r=>r.name)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
else void initialize();
})();