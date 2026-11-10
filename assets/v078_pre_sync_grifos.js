/* Banco Mestre: etapa de pré-sincronização de grifos V078, somente leitura.
   Backup remoto V066 e grifos locais são comparados em memória após autorização.
   Não há escrita local, importação, mescla, exclusão ou upload.
*/
(function(){
'use strict';
var COLORS=[
 ['proibicao','#FF8F96','Proibições e vedações','É vedado executar a obra'],
 ['obrigacao','#86DCAA','Obrigações e deveres','Deverá apresentar'],
 ['prazo_numero','#FFEA70','Prazos e números','Em até 30 dias'],
 ['excecao','#89C7FF','Exceções e ressalvas','Salvo disposição em contrário'],
 ['banca','#CCA7FF','Palavras-chave da banca','Exclusivamente'],
 ['destaque','#FFB86B','Conteúdo importante a destacar',null]
];
var PREFIX='BM030_STROKES_PDF:',META='BM062_GRIFOS_META',MAX=60*1024*1024;
function colorAudit(){
 var cls=window.BancoMestreClassificadorV075,an=window.BancoMestreAnaliseSelecaoV075,rows=[];
 function add(label,ok){rows.push({label:label,passed:!!ok})}
 add('Seis categorias fixas',Object.keys(cls?.COLORS||{}).length===6);
 for(var color of COLORS){
  add('Cor '+color[2],cls?.COLORS?.[color[0]]?.color===color[1]&&cls?.COLORS?.[color[0]]?.label===color[2]);
  if(color[3]){
   var got=an?.analyze([],color[3]);
   add('Reconhecer '+color[3],got?.status==='clara'&&got.kind===color[0]&&got.color===color[1]);
  }
 }
 add('Não grifar frase neutra em laranja',an?.analyze([],'O licenciamento ambiental compreende três etapas.')?.status==='indefinida');
 var ambiguous=an?.analyze([],'Deverá entregar em 30 dias');
 add('Obrigação + prazo = ambiguidade',ambiguous?.status==='ambigua');
 var sample={text:'Deverá entregar em 30 dias',rects:[[.1,.1,.3,.2],[.1,.3,.4,.4]],page:1,documentId:'teste',sourceHash:'hash'};
 add('Ambiguidade não grava automaticamente',an?.planOneHighlight(sample,ambiguous,null)?.status==='review');
 var manual=an?.planOneHighlight(sample,ambiguous,{kind:'destaque',color:'#FFB86B',label:'Conteúdo importante a destacar'});
 add('Duas linhas, um grifo manual',manual?.status==='ready'&&manual.mark.segment_total===1&&manual.mark.rects.length===2);
 return {total:rows.length,passed:rows.filter(x=>x.passed).length,rows:rows};
}
function readLocal(store){
 var entries=[],seen=new Set();
 for(var i=0;i<store.length;i++){
  var k=store.key(i);if(typeof k!=='string'||!k.startsWith(PREFIX))continue;
  if(seen.has(k))throw Error('Chave local duplicada');
  seen.add(k);entries.push({key:k,value:store.getItem(k)});
 }
 return {annotation_keys:entries,metadata_raw:store.getItem(META)};
}
function validateBackup(backup){
 if(!backup||backup.format!=='BancoMestreBackupGrifosV066'||backup.schema_version!==1||
  backup.metadata_key!==META||!Array.isArray(backup.annotation_keys)||backup.annotation_keys.length>100000||
  backup.count_keys!==backup.annotation_keys.length||
  backup.contains_pdfs!==false||backup.contains_srs!==false||backup.contains_oauth_tokens!==false||
  (backup.metadata_raw!==null&&typeof backup.metadata_raw!=='string'))
  throw Error('Backup com formato ou escopo inesperado');
 var seen=new Set();
 for(var item of backup.annotation_keys){
  if(!item||typeof item.key!=='string'||!item.key.startsWith(PREFIX)||
    typeof item.value!=='string'||seen.has(item.key))throw Error('Chave inválida ou duplicada no backup');
  seen.add(item.key);
  var value;try{value=JSON.parse(item.value)}catch(_){throw Error('Backup contém anotações ilegíveis')}
  if(!Array.isArray(value))throw Error('Backup contém anotações ilegíveis');
 }
 return {annotation_keys:backup.annotation_keys,metadata_raw:backup.metadata_raw};
}
function compareSnapshots(local,remote){
 function toMap(x){var map=new Map();for(var item of x.annotation_keys){if(map.has(item.key))throw Error('Chave duplicada');map.set(item.key,item.value)}return map}
 var a=toMap(local),b=toMap(remote),identical=0,onlyLocal=0,onlyRemote=0,conflict=0;
 for(var item of a){if(!b.has(item[0]))onlyLocal++;else if(b.get(item[0])===item[1])identical++;else conflict++}
 for(var key of b.keys())if(!a.has(key))onlyRemote++;
 return {identical:identical,only_local:onlyLocal,only_remote:onlyRemote,conflict:conflict,
  metadata_equal:local.metadata_raw===remote.metadata_raw};
}
window.BancoMestrePreSyncGrifos=Object.freeze({colorAudit:colorAudit,readLocal:readLocal,validateBackup:validateBackup,compareSnapshots:compareSnapshots});
var lib=document.getElementById('grifos'),host=lib?.querySelector('.bm062-panel');
if(!host||document.getElementById('bmPreSyncGrifos'))return;
var area=document.createElement('section');area.id='bmPreSyncGrifos';
area.innerHTML='<h3>Conferência de grifos: seis cores e Drive</h3>'+
 '<p>Teste as seis cores ou compare, com sua autorização, as anotações deste navegador com o backup V066 mais recente do Drive. <strong>Somente leitura — não importa, apaga, combina ou sobrescreve dados.</strong></p>'+
 '<div class="bmps-controls"><button id="bmpsColors" type="button">Testar cores</button><button id="bmpsDrive" type="button" disabled>Comparar backup Drive</button></div>'+
 '<p id="bmpsStatus" role="status" aria-live="polite">Pronto para testar as cores.</p>'+
 '<div id="bmpsResults"></div><small>O teste lógico não substitui validação visual no PDF. A autorização Google não importa nem altera grifos.</small>';
var backupPanel=document.getElementById('bm066DriveBackup');
if(backupPanel)backupPanel.after(area);else host.prepend(area);
var $=id=>document.getElementById(id),out=$('bmpsResults'),stat=$('bmpsStatus'),drive=$('bmpsDrive'),busy=false,ready=false,client=null,pending=null;
function status(s){stat.textContent=s}
function line(s,type){var p=document.createElement('p');p.textContent=s;p.dataset.kind=type||'info';out.append(p)}
$('bmpsColors').addEventListener('click',function(){
 out.replaceChildren();var r=colorAudit();status(r.passed+' de '+r.total+' testes aprovados');
 for(var item of r.rows)line((item.passed?'✓ ':'✗ ')+item.label,item.passed?'ok':'error');
});
async function initOAuth(){
 try{
  var configResponse=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
  if(!configResponse.ok)throw Error('Configuração Google indisponível');
  var config=await configResponse.json();
  if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(config.client_id||''))throw Error('Cliente OAuth inválido');
  if(!window.google?.accounts?.oauth2?.initTokenClient)
   await new Promise(function(resolve,reject){var s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=resolve;s.onerror=function(){reject(Error('Google Identity Services indisponível'))};document.head.append(s)});
  if(!window.google?.accounts?.oauth2?.initTokenClient)throw Error('OAuth indisponível');
  client=window.google.accounts.oauth2.initTokenClient({client_id:config.client_id,scope:'https://www.googleapis.com/auth/drive.file',
   callback:function(r){var p=pending;pending=null;if(!p)return;
    if(!r?.access_token||r.error||(r.scope&&!r.scope.split(/\s+/).includes('https://www.googleapis.com/auth/drive.file')))
     p.reject(Error('Permissão drive.file não concedida'));
    else p.resolve(r.access_token);
   },error_callback:function(){var p=pending;pending=null;if(p)p.reject(Error('Autorização Google cancelada'))}
  });ready=true;drive.disabled=false;
 }catch(error){status('Comparação Drive indisponível: '+error.message+'. O teste local continua disponível.')}
}
function authorize(){
 if(!client||pending)throw Error('OAuth ainda não disponível');
 return new Promise(function(resolve,reject){
  pending={resolve:resolve,reject:reject};
  try{client.requestAccessToken({prompt:'consent'})}catch(e){pending=null;reject(e)}
 });
}
async function fetchBackup(token){
 var query="trashed = false and mimeType = 'application/json' and appProperties has { key = 'bm_kind' and value = 'grifos_backup_manual' }";
 var params=new URLSearchParams({q:query,fields:'nextPageToken,files(id,size,modifiedTime,mimeType,appProperties,trashed)',pageSize:'100',orderBy:'modifiedTime desc'});
 var headers={Authorization:'Bearer '+token};
 var list=await fetch('https://www.googleapis.com/drive/v3/files?'+params.toString(),{headers:headers,cache:'no-store'});
 if(!list.ok)throw Error('Consulta de backups falhou (HTTP '+list.status+')');
 var result=await list.json();
 var files=(Array.isArray(result.files)?result.files:[]).filter(function(f){
  return !f.trashed&&f.mimeType==='application/json'&&f.appProperties?.bm_format==='BancoMestreBackupGrifosV066'&&/^[A-Za-z0-9_-]{12,}$/.test(f.id||'');
 });
 if(!files.length)throw Error('Não foi localizado backup V066 acessível à conta autorizada');
 files.sort(function(a,b){return String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||''))});
 var item=files[0],size=Number(item.size);
 if(!Number.isSafeInteger(size)||size<1||size>MAX)throw Error('Tamanho de arquivo inválido');
 var response=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(item.id)+'?alt=media',{headers:headers,cache:'no-store'});
 if(!response.ok)throw Error('Leitura da cópia privada falhou (HTTP '+response.status+')');
 var data=await response.arrayBuffer();
 if(data.byteLength!==size||data.byteLength>MAX)throw Error('Tamanho remoto divergente');
 var sha=item.appProperties?.bm_sha256;
 if(!/^[a-f0-9]{64}$/i.test(sha||'')||!globalThis.crypto?.subtle)throw Error('SHA-256 obrigatório indisponível');
 var hash=await crypto.subtle.digest('SHA-256',data);
 var actual=Array.from(new Uint8Array(hash)).map(function(n){return n.toString(16).padStart(2,'0')}).join('');
 if(actual.toLowerCase()!==sha.toLowerCase())throw Error('SHA-256 divergente — comparação interrompida');
 return validateBackup(JSON.parse(new TextDecoder().decode(data)));
}
drive.addEventListener('click',async function(){
 if(busy||!ready)return;busy=true;drive.disabled=true;out.replaceChildren();
 try{
  // Solicitação OAuth inicia imediatamente no clique do titular.
  var authorization=authorize();status('Aguardando autorização Google...');
  var token=await authorization;status('Lendo a cópia privada e verificando SHA-256...');
  var remote=await fetchBackup(token),local=readLocal(localStorage);
  var r=compareSnapshots(local,remote);
  status('Comparação concluída. Nenhum dado foi modificado.');
  line('Páginas de anotação idênticas: '+r.identical,'ok');
  line('Apenas no navegador: '+r.only_local,'info');
  line('Apenas no Drive: '+r.only_remote,'info');
  line('Páginas divergentes: '+r.conflict,r.conflict?'warning':'ok');
  line('Metadados: '+(r.metadata_equal?'iguais':'diferentes'),r.metadata_equal?'ok':'warning');
  line(r.conflict||r.only_local||r.only_remote||!r.metadata_equal?
    'Há diferenças. Preserve ambas as cópias até uma restauração assistida expressamente aprovada.':
    'Dados comparados são iguais. Não foi ativada sincronização automática.','info');
 }catch(error){status('Comparação interrompida: '+error.message+'. Nada foi alterado.')}
 finally{busy=false;drive.disabled=!ready}
});
initOAuth();
})();