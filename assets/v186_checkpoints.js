/* Banco Mestre V186 — Registro rastreável dos checkpoints das conversas.
 * É um índice privado do Drive: não lê conversas ChatGPT, não aprova cartões,
 * não publica no GitHub, não altera ZIPs, SRS ou arquivos canônicos.
 * Leitura: drive.readonly existente; registro explícito: drive.file (somente criação).
 */
(function(){
'use strict';
if(window.BM186Checkpoints)return;
const ROOTS=[
 {id:'1348cILBcxFG9p2cfPJ3WubmHswPRbD24',name:'Checkpoints Banco Mestre'},
 {id:'1ziAHgnvKfroZ8meSAjdtJ_M0BNGYQi0S',name:'Backups / checkpoints históricos'}
];
const TARGET=ROOTS[0].id;
const API='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const READ_SCOPE='https://www.googleapis.com/auth/drive.readonly';
const WRITE_SCOPE='https://www.googleapis.com/auth/drive.file';
const FOLDER='application/vnd.google-apps.folder';
const MANIFEST=/^BM_CHECKPOINT_MANIFEST_V1__(CP-[A-Z0-9_-]{6,100})\.json$/i;
const LEGACY=/(?:CHECKPOINT|BACKUP|CONSOLIDADO|SINCRONIZACAO_INCREMENTAL|TRANSFERENCIA|PACOTE|AUDITORIA).*\.(?:zip|json|md|txt|xlsx)$/i;
const ID=/^[A-Za-z0-9_-]{15,}$/;
const $=id=>document.getElementById(id);
let reader=null,writer=null,readToken='',writeToken='',readExpiry=0,writeExpiry=0;
let scanning=false,writing=false,pendingUpload=false,selected=null,entries=[],visible=30,knownIds=new Map(),lastScan=null,scanAt=0;
const el=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined&&txt!==null)e.textContent=txt;if(cls)e.className=cls;return e;};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function authRead(){return (readToken&&Date.now()<readExpiry?readToken:'')||window.BancoMestreMediaSyncV182?.token?.()||'';}
function authWrite(){return writeToken&&Date.now()<writeExpiry?writeToken:'';}
function report(message,isError=false){
 const node=$('bm186Status');if(node){node.textContent=message;node.style.color=isError?'#993b34':'#486669';}
}
function isIsoWithZone(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v));}
function valid(manifest){
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest)||manifest.schema!=='BancoMestreCheckpointManifestV1')
  throw Error('O manifesto deve utilizar o schema BancoMestreCheckpointManifestV1.');
 const id=manifest.checkpoint_id;
 if(typeof id!=='string'||!/^CP-[A-Z0-9_-]{6,100}$/.test(id))throw Error('checkpoint_id inválido; use CP-... com ID estável.');
 if(!isIsoWithZone(manifest.created_at))throw Error('created_at precisa incluir data, hora e fuso (ex.: -03:00).');
 if(!manifest.source||typeof manifest.source.chat_title!=='string'||manifest.source.chat_title.trim().length<3||manifest.source.chat_title.length>200)
  throw Error('Informe source.chat_title da conversa de origem.');
 if(!manifest.state||typeof manifest.state!=='object'||Array.isArray(manifest.state))
  throw Error('Declare state separando arquivo, classificação, base, site e SRS.');
 const state=manifest.state;
 for(const field of ['archive','classification','canonical','site','srs']){
  if(typeof state[field]!=='string'||state[field].length<2||state[field].length>90)
   throw Error('Informe state.'+field+' sem presumir sincronização concluída.');
 }
 if(!manifest.counts||typeof manifest.counts!=='object'||Array.isArray(manifest.counts))
  throw Error('Informe counts, mesmo quando as quantidades ainda não forem comprováveis.');
 for(const [k,v] of Object.entries(manifest.counts)){
  if(k.length>60||!(v===null||Number.isSafeInteger(v)&&v>=0))throw Error('Contagem inválida: '+k);
 }
 if(manifest.items!==undefined){
  if(!Array.isArray(manifest.items)||manifest.items.length>10000)throw Error('items deve conter até 10.000 objetos rastreáveis.');
  for(const x of manifest.items){
   if(!x||typeof x!=='object'||typeof x.id!=='string'||x.id.length>120||!x.id.trim()||
    !['card','question','image','pdf','srs','note','source','other'].includes(x.type))
     throw Error('Item sem ID e tipo reconhecidos. Não invente vínculos.');
  }
 }
 if(manifest.attachments!==undefined){
  if(!Array.isArray(manifest.attachments)||manifest.attachments.length>5000)throw Error('attachments deve ser uma lista limitada.');
  for(const x of manifest.attachments){
   if(!x||typeof x!=='object'||!ID.test(x.drive_file_id||'')||typeof x.name!=='string'||x.name.length>300)
    throw Error('Anexo exige nome original e ID verificável do Drive.');
   if(x.sha256!==undefined&&x.sha256!==null&&!/^[a-f0-9]{64}$/i.test(x.sha256))throw Error('SHA-256 inválido; não preencha sem confirmação.');
  }
 }
 const encoded=JSON.stringify(manifest);
 if(encoded.length>1024*1024)throw Error('Manifesto maior que 1 MB. Deixe arquivos originais separados no Drive.');
 return {id,manifest,serialized:encoded};
}
function makeUI(){
 const host=$('cartoes')?.querySelector('.panel');
 if(!host||$('bm186CheckpointPanel'))return false;
 const details=el('details');details.id='bm186CheckpointPanel';details.style.cssText='margin:12px 0;padding:12px;border:1px solid #d0dfdc;border-radius:10px;background:#fafdfc';
 const summary=el('summary','Checkpoints das conversas · consultar e registrar');summary.style.cssText='cursor:pointer;font-weight:700';
 const help=el('p','O site localiza checkpoints e manifestos já salvos no Drive. Apenas registrar um arquivo não aprova cartões, não altera SRS e não comprova integração no site. O ChatGPT deve preparar e salvar o checkpoint no Drive conforme a metodologia.');
 help.style.cssText='font-size:12px;color:#52696c;margin:9px 0';
 const actions=el('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:7px;align-items:center';
 const connect=el('button','Conectar Drive / consultar');connect.type='button';connect.id='bm186Connect';connect.onclick=()=>{if(authRead())void scan();else authorizeRead();};
 const reload=el('button','Atualizar registros');reload.type='button';reload.id='bm186Reload';reload.onclick=()=>{void scan();};
 const open=el('a','Abrir pasta dos checkpoints');open.href='https://drive.google.com/drive/folders/'+TARGET;open.target='_blank';open.rel='noopener noreferrer';open.style.cssText='font-size:12px';
 actions.append(connect,reload,open);
 const count=el('p','Conecte o Drive para conferir os checkpoints existentes.');count.id='bm186Counts';count.style.cssText='font-size:12px;font-weight:600';
 const search=el('input');search.type='search';search.id='bm186Search';search.placeholder='Localizar por conversa, arquivo ou ID';search.setAttribute('aria-label','Buscar checkpoints');search.style.cssText='max-width:100%;width:330px';search.oninput=()=>{visible=30;render()};
 const records=el('div');records.id='bm186Records';records.style.cssText='max-height:340px;overflow:auto;margin:10px 0';
 const more=el('button','Mostrar mais checkpoints');more.type='button';more.id='bm186More';more.hidden=true;more.onclick=()=>{visible+=30;render()};
 const edit=el('details');edit.style.cssText='border-top:1px solid #d0dfdc;padding-top:9px;margin-top:12px';
 const editSummary=el('summary','Registrar manifesto de checkpoint JSON no Drive');editSummary.style.cssText='font-size:12px';
 const note=el('p','Use o manifesto produzido no checkpoint do ChatGPT. Ao registrar, será criado um arquivo novo na pasta de checkpoints; o ZIP e os cartões originais NÃO serão modificados. A autorização de escrita é separada e limitada a arquivos usados pelo site.');
 note.style.cssText='font-size:12px;color:#516e72';
 const file=el('input');file.id='bm186File';file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','Selecionar manifesto JSON');file.onchange=()=>{void choose(file.files?.[0])};
 const preview=el('p','Nenhum manifesto selecionado.');preview.id='bm186Preview';preview.style.cssText='font-size:12px';
 const save=el('button','Registrar no Drive e verificar');save.type='button';save.id='bm186Save';save.disabled=true;save.onclick=()=>{void submit()};
 const exportButton=el('button','Salvar cópia do manifesto');exportButton.type='button';exportButton.id='bm186Export';exportButton.disabled=true;exportButton.onclick=downloadCopy;
 const row=el('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:8px';row.append(save,exportButton);
 edit.append(editSummary,note,file,preview,row);
 const status=el('p');status.id='bm186Status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.cssText='font-size:12px;margin-top:8px';status.textContent='Nenhum arquivo foi gravado.';
 details.append(summary,help,actions,count,search,records,more,edit,status);
 host.insertBefore(details,host.querySelector('.controls')||host.firstChild);
 return true;
}
async function gis(){
 if(window.google?.accounts?.oauth2?.initTokenClient)return;
 await new Promise((resolve,reject)=>{
  const existing=document.querySelector('script[data-bm186-gis]');
  if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(Error('Serviço Google indisponível')),{once:true});return}
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.dataset.bm186Gis='1';script.addEventListener('load',resolve,{once:true});script.addEventListener('error',()=>reject(Error('Serviço Google indisponível')),{once:true});document.head.append(script);
 });
}
async function prepareOauth(){
 const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
 if(!response.ok)throw Error('Configuração OAuth do site indisponível.');
 const cfg=await response.json();
 if(!/\.apps\.googleusercontent\.com$/.test(cfg.client_id||''))throw Error('Configuração OAuth inválida.');
 await gis();
 reader=google.accounts.oauth2.initTokenClient({client_id:cfg.client_id,scope:READ_SCOPE,
  callback:r=>{if(r.error||!r.access_token){report('Leitura do Drive não autorizada.',true);return}
   readToken=r.access_token;readExpiry=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
   window.BancoMestreMediaSyncV182?.publishToken(readToken,Number(r.expires_in||3600));
   void scan();
  },error_callback:()=>report('A autorização de leitura foi cancelada.',true)});
 writer=google.accounts.oauth2.initTokenClient({client_id:cfg.client_id,scope:WRITE_SCOPE,
  callback:r=>{if(r.error||!r.access_token){pendingUpload=false;report('Permissão de registro não concedida; nada foi enviado.',true);return}
   writeToken=r.access_token;writeExpiry=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
   if(pendingUpload){pendingUpload=false;void upload();}
  },error_callback:()=>{pendingUpload=false;report('Autorização de escrita interrompida.',true)}});
 if(authRead())void scan();
}
function authorizeRead(){if(!reader){report('A autenticação Google ainda não está pronta.',true);return}reader.requestAccessToken({prompt:''})}
async function request(url,access){
 const token=access||authRead();if(!token)throw Error('Conecte o Drive.');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
 if(r.status===401)throw Error('A sessão Google expirou. Reconecte o Drive.');
 if(r.status===403)throw Error('Sem autorização de leitura nesta pasta.');
 if(!r.ok)throw Error('Consulta Google Drive: HTTP '+r.status);
 return r;
}
async function children(id){
 const all=[];let next='',pages=0;
 do{
  if(++pages>40)throw Error('Pasta com páginas demais; consulta interrompida.');
  const q=new URLSearchParams({q:"'"+id+"' in parents and trashed = false",fields:'nextPageToken,files(id,name,mimeType,modifiedTime,size,parents)',pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'});
  if(next)q.set('pageToken',next);
  const d=await (await request(API+'?'+q.toString())).json();
  all.push(...(Array.isArray(d.files)?d.files:[]));
  next=d.nextPageToken||'';
 }while(next);
 return all;
}
async function fetchManifest(file){
 const url=file.mimeType==='application/vnd.google-apps.document'?
  API+'/'+encodeURIComponent(file.id)+'/export?mimeType=text%2Fplain':
  API+'/'+encodeURIComponent(file.id)+'?alt=media';
 const response=await request(url);
 const text=await response.text();
 if(text.length>1050000)throw Error('Manifesto demasiado grande.');
 const m=valid(JSON.parse(text.replace(/^\uFEFF/,'')));
 if(MANIFEST.test(file.name)&&m.id!==file.name.match(MANIFEST)[1])throw Error('ID do arquivo diverge do manifesto.');
 return m.manifest;
}
async function scan(){
 if(scanning)return;
 if(!authRead()){report('Autorize a leitura do Drive para consultar checkpoints.',true);return}
 scanning=true;const reload=$('bm186Reload');if(reload)reload.disabled=true;
 try{
  report('Localizando checkpoints e manifestos nas pastas do Drive…');
  const queue=ROOTS.map(r=>({...r,path:r.name})),visited=new Set(),files=new Map();
  for(let pos=0;pos<queue.length;pos++){
   const folder=queue[pos];
   if(visited.has(folder.id))continue;
   visited.add(folder.id);
   if(visited.size>380)throw Error('Mais de 380 pastas; consulta interrompida, sem alterar registros.');
   const list=await children(folder.id);
   for(const f of list){
    if(!ID.test(f.id)||!f.name)continue;
    if(f.mimeType===FOLDER){
     if(!visited.has(f.id))queue.push({id:f.id,name:f.name,path:folder.path+' / '+f.name});
    }else if(MANIFEST.test(f.name)||LEGACY.test(f.name)){
     if(!files.has(f.id))files.set(f.id,{...f,path:folder.path});
    }
    if(files.size>2500)throw Error('Mais de 2.500 registros; consulta interrompida sem alterar índice.');
   }
  }
  const raw=[...files.values()],allManifests=raw.filter(f=>MANIFEST.test(f.name));
  if(allManifests.length>250)throw Error('Mais de 250 manifestos; consulta parcial bloqueada para não registrar checkpoints duplicados.');
  const manifests=allManifests;
  const parsed=new Map();
  for(let i=0;i<manifests.length;i+=4){
   await Promise.all(manifests.slice(i,i+4).map(async file=>{
    try{parsed.set(file.id,{manifest:await fetchManifest(file)})}
    catch(e){parsed.set(file.id,{error:e.message})}
   }));
  }
  const prior=entries;
  entries=raw.map(f=>({
   ...f,kind:MANIFEST.test(f.name)?'manifest':'archive',
   ...parsed.get(f.id)
  })).sort((a,b)=>String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||''))||a.name.localeCompare(b.name));
  knownIds=new Map();
  for(const e of entries)if(e.manifest){
   const id=e.manifest.checkpoint_id;
   if(!knownIds.has(id))knownIds.set(id,e);
  }
  lastScan={folders:visited.size,files:raw.length,manifests:manifests.length,verified:entries.filter(x=>x.manifest).length,bad:entries.filter(x=>x.error).length,at:new Date().toISOString()};
  scanAt=Date.now();render();
  report('Consulta concluída: '+lastScan.files+' arquivo(s) localizados em '+lastScan.folders+' pasta(s), '+lastScan.verified+' manifesto(s) lidos, '+lastScan.bad+' com problema. Arquivos históricos NÃO foram auditados apenas pela listagem.');
  if(selected)preview();
 }catch(e){
  report('Consulta incompleta: '+e.message+'. Registros anteriores preservados.',true);
 }finally{scanning=false;if(reload)reload.disabled=false}
}
function driveLink(f){return f.mimeType==='application/vnd.google-apps.document'?'https://docs.google.com/document/d/'+encodeURIComponent(f.id)+'/edit':'https://drive.google.com/file/d/'+encodeURIComponent(f.id)+'/view'}
function render(){
 const host=$('bm186Records');if(!host)return;host.replaceChildren();
 const search=normalize($('bm186Search')?.value);
 const shown=entries.filter(x=>normalize(x.name+' '+x.path+' '+(x.manifest?.checkpoint_id||'')+' '+(x.manifest?.source?.chat_title||'')).includes(search));
 const count=$('bm186Counts');
 if(count){
  const archives=entries.filter(x=>x.kind==='archive').length;
  count.textContent=entries.length+' registro(s) encontrados: '+knownIds.size+' checkpoint(s) com manifesto válido; '+archives+' arquivo(s) históricos sem manifesto lido. Registro em Drive ≠ integração no site.';
 }
 for(const file of shown.slice(0,visible)){
  const line=el('div');line.style.cssText='border-bottom:1px solid #e2e9e7;padding:7px 0;font-size:12px';
  const a=el('a',file.name);a.href=driveLink(file);a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='overflow-wrap:anywhere';
  const desc=el('div');desc.style.cssText='color:#657778;line-height:1.5';
  const m=file.manifest;
  if(m)desc.textContent='Manifesto lido do Drive · '+m.checkpoint_id+' · '+m.source.chat_title+' · Base: '+m.state.canonical+' · Site: '+m.state.site+' · SRS: '+m.state.srs+' (estados declarados no documento, não homologados pela listagem).';
  else if(file.error)desc.textContent='Manifesto inválido ou inacessível: '+file.error+' · NÃO integrado.';
  else desc.textContent='Arquivo encontrado · '+file.path+' · '+String(file.modifiedTime||'').slice(0,10)+' · conteúdo e vínculos ainda não validados.';
  line.append(a,desc);host.append(line);
 }
 if(!shown.length)host.append(el('p',entries.length?'Nenhum checkpoint corresponde à busca.':'Nenhum registro carregado nesta sessão.'));
 const more=$('bm186More');if(more)more.hidden=shown.length<=visible;
}
async function choose(file){
 selected=null;const save=$('bm186Save'),exp=$('bm186Export');if(save)save.disabled=true;if(exp)exp.disabled=true;
 if(!file){preview();return}
 try{
  if(file.size>1024*1024)throw Error('Manifesto maior que 1 MB.');
  selected=valid(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));
  if(exp)exp.disabled=false;
  if(save)save.disabled=!!knownIds.has(selected.id);
  preview();
 }catch(e){selected=null;preview();report('Arquivo rejeitado: '+e.message,true)}
}
function preview(){
 const output=$('bm186Preview');if(!output)return;
 if(!selected){output.textContent='Nenhum manifesto válido selecionado.';return}
 const found=knownIds.has(selected.id);
 output.textContent=selected.id+' · '+selected.manifest.source.chat_title+' · '+selected.manifest.created_at+
  (found?' · ID já registrado nesta pasta; não será duplicado.':' · pronto para registro, ainda NÃO salvo no Drive.');
 if($('bm186Save'))$('bm186Save').disabled=found;
}
function downloadCopy(){
 if(!selected)return;
 const blob=new Blob([selected.serialized+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='BM_CHECKPOINT_MANIFEST_V1__'+selected.id+'.json';a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function submit(){
 if(!selected)return Promise.resolve(null);
 if(knownIds.has(selected.id)){report('Esse checkpoint já está registrado; não haverá duplicação.',true);return Promise.resolve(null)}
 if(writing)return Promise.resolve(null);
 if(!authWrite()){
  if(!writer){report('O serviço de registro do Google ainda está inicializando.',true);return Promise.resolve(null)}
  pendingUpload=true;writer.requestAccessToken({prompt:'consent'});return Promise.resolve(null);
 }
 return upload();
}
async function upload(){
 if(!selected||writing)return;
 writing=true;const save=$('bm186Save');if(save)save.disabled=true;
 try{
  const source=selected;const name='BM_CHECKPOINT_MANIFEST_V1__'+source.id+'.json';
  if(!authRead())throw Error('Autorize a leitura do Drive antes de registrar; não é seguro duplicar sem verificar os IDs.');
  if(!lastScan||Date.now()-scanAt>120000)await scan();
  if(!lastScan||Date.now()-scanAt>120000)throw Error('Não foi possível conferir os IDs existentes no Drive. Registro bloqueado.');
  if(knownIds.has(source.id))throw Error('Checkpoint já existente; registre uma nova versão com novo ID.');
  const access=authWrite();if(!access)throw Error('A autorização de escrita expirou.');
  const boundary='bmcheckpoint_'+Date.now()+'_'+Math.floor(Math.random()*1000000);
  const metadata=JSON.stringify({name,mimeType:'application/json',parents:[TARGET]});
  const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+metadata+
   '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+source.serialized+
   '\r\n--'+boundary+'--';
  report('Criando um NOVO registro no Drive. Nenhuma base de cartões será alterada…');
  const response=await fetch(UPLOAD+'?uploadType=multipart&fields=id%2Cname%2CmimeType%2Cparents',{
   method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'multipart/related; boundary='+boundary},
   body,cache:'no-store'
  });
  if(response.status===403)throw Error('Drive negou criação na pasta. A permissão drive.file é restrita; use a cópia JSON com a conexão do ChatGPT, sem conceder acesso amplo ao site.');
  if(!response.ok)throw Error('Upload HTTP '+response.status+'. Nada foi marcado como integrado.');
  const created=await response.json();
  if(!ID.test(created.id)||created.name!==name||!Array.isArray(created.parents)||!created.parents.includes(TARGET))
   throw Error('Drive recebeu o upload, mas a pasta/identidade não pôde ser confirmada. Verifique o registro manualmente; NÃO envie de novo até conferir duplicatas.');
  const check=await fetch(API+'/'+encodeURIComponent(created.id)+'?alt=media',{headers:{Authorization:'Bearer '+access},cache:'no-store'});
  if(!check.ok)throw Error('Arquivo criado, porém sem leitura de volta ('+check.status+'). Não alegar registro verificado; confira antes de reenviar.');
  const persisted=valid(JSON.parse(await check.text()));
  if(persisted.id!==source.id||persisted.serialized!==source.serialized)
   throw Error('Arquivo criado, mas leitura de volta divergiu; não declarar verificado.');
  const rec={id:created.id,name,path:'Checkpoints Banco Mestre',mimeType:'application/json',modifiedTime:new Date().toISOString(),kind:'manifest',manifest:persisted.manifest};
  entries.unshift(rec);knownIds.set(source.id,rec);entries.sort((a,b)=>String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||'')));
  selected=null;if($('bm186File'))$('bm186File').value='';
  render();preview();
  report('REGISTRO VERIFICADO NO DRIVE: '+persisted.id+' · leitura de volta igual ao manifesto enviado. Conteúdo canônico, SRS e publicação no site permanecem independentes.');
 }catch(e){report('Registro não homologado: '+e.message+' O manifesto original continua disponível para exportação.',true)}
 finally{writing=false;if(save)save.disabled=!selected||knownIds.has(selected.id)}
}
async function init(){
 if(!makeUI())return;
 try{
  document.addEventListener('bm-media-drive-authorized',()=>{if(authRead()&&!scanning&&Date.now()-scanAt>10000)void scan()});
  await prepareOauth();
  window.setInterval(()=>{if(authRead()&&!scanning&&Date.now()-scanAt>120000)void scan()},120000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&authRead()&&!scanning&&Date.now()-scanAt>120000)void scan()});
  if(!authRead())report('Conector preparado. Autorize a leitura para conferir checkpoints no Drive. O site não lê mensagens privadas do ChatGPT.');
 }catch(e){report('Registro de checkpoints indisponível: '+e.message,true)}
}
window.BM186Checkpoints=Object.freeze({
 validate:valid,refresh:scan,get lastResult(){return lastScan},get count(){return knownIds.size},
 get connected(){return !!authRead()},get writeConnected(){return !!authWrite()}
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();