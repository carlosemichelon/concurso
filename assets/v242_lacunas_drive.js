/* V242 | Sincronização privada de lacunas com Google Drive drive.file.
   Protege contra sobrescrita concorrente. Nao modifica cartoes ou SRS. */
(function(){
'use strict';
if(window.BM242LacunasDrive)return;
const KEY='BM_LACUNAS_V242',BASE='BM242_LACUNAS_REMOTE_SHA256',
 KIND='bm_lacunas_v242',PRIVATE_PARENT='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD',
 API='https://www.googleapis.com/drive/v3/files',
 UPLOAD='https://www.googleapis.com/upload/drive/v3/files',MAX=5000000;
let running=null,lastResult=null;
function local(){
 const raw=localStorage.getItem(KEY);
 const obj=raw?JSON.parse(raw):{schema:1,records:[],log:[],updatedAt:null};
 window.BM242Lacunas?.validate?.(obj);return obj;
}
async function hash(obj){
 const bytes=new TextEncoder().encode(JSON.stringify(obj));
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function req(token,url,opt={}){
 if(!token)throw Error('OAuth de gravação indisponível');
 const res=await fetch(url,{...opt,cache:'no-store',headers:{Authorization:'Bearer '+token,...opt.headers}});
 if(!res.ok)throw Error('Drive HTTP '+res.status);
 return res;
}
async function locate(token){
 const url=new URL(API);
 url.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,version,appProperties)');
 url.searchParams.set('pageSize','100');
 const d=await(await req(token,url.href)).json();
 if(d.incompleteSearch||d.nextPageToken)throw Error('Busca de lacunas no Drive incompleta');
 const files=(d.files||[]).filter(x=>x.appProperties?.bm_kind===KIND);
 if(files.length>1)throw Error('Foram encontrados dois cadastros mestres; nenhum será substituído');
 return files[0]||null;
}

/* O registro histórico de PETRO16 foi preparado no Drive pelo chat.
   A localização é read-only, exclusiva para inicialização de um mestre vazio;
   o arquivo original jamais será alterado. */
async function locateSeed(token){
 const url=new URL(API);
 const parent=PRIVATE_PARENT;
 const name='PROPOSTA_LACUNA_PETRO14_C014_2026-11-18.json';
 url.searchParams.set('q',"trashed = false and name = '"+name+"' and '"+parent+"' in parents");
 url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,mimeType,parents)');
 url.searchParams.set('pageSize','100');
 const listing=await(await req(token,url.href)).json();
 if(listing.incompleteSearch||listing.nextPageToken)throw Error('Busca inicial de fichas incompleta');
 const found=(listing.files||[]).filter(x=>x.name===name&&x.mimeType==='application/json'&&x.parents?.includes(parent));
 if(found.length>1)throw Error('Fichas históricas duplicadas: importação automática bloqueada');
 return found[0]||null;
}
async function seedData(token,source){
 const text=await(await req(token,API+'/'+encodeURIComponent(source.id)+'?alt=media')).text();
 if(text.length>MAX)throw Error('Ficha de lacuna inicial excede 5 MB');
 const obj=JSON.parse(text);
 if(obj.format!=='BancoMestreLacunasV242')throw Error('Ficha histórica não possui formato de importação esperado');
 window.BM242Lacunas.validate(obj.data);
 if(obj.data.records.length!==1||obj.data.records[0].id!=='LAC-PETRO16-FLUENCIA-20261118-01')
  throw Error('Registro inicial diferente da ficha auditada, importação bloqueada');
 return obj.data;
}
async function fetchData(token,id){
 const s=await(await req(token,API+'/'+encodeURIComponent(id)+'?alt=media')).text();
 if(s.length>MAX)throw Error('Cadastro remoto excede limite');
 const d=JSON.parse(s);
 if(d.format!=='BancoMestreLacunasDriveV242')throw Error('Formato remoto desconhecido');
 window.BM242Lacunas?.validate?.(d.data);
 return d.data;
}
async function confirmed(token,id,expected){
 const d=await fetchData(token,id);
 if(await hash(d)!==expected)throw Error('Leitura pós-gravação divergente');
}
// Escrita antecipada e imutável para permitir recuperação após corrida de atualização.
// A versão de backup é importável pela própria interface, sem alterar o mestre.
async function archive(token,d,reason,expected){
 const payload=JSON.stringify({format:'BancoMestreLacunasV242',backupAt:new Date().toISOString(),backupReason:reason,data:d},null,2);
 if(payload.length>MAX)throw Error('Backup privado excede limite');
 const boundary='bm242-backup-'+crypto.randomUUID();
 const meta={name:'BancoMestre_Lacunas_Recuperacao_'+new Date().toISOString().replace(/[:.]/g,'-')+'_'+crypto.randomUUID().slice(0,8)+'.json',
   mimeType:'application/json',parents:[PRIVATE_PARENT],
   appProperties:{bm_kind:'bm_lacunas_recovery_v242',bm_schema:'V242',bm_reason:reason}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
  '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+
  '\r\n--'+boundary+'--';
 const res=await req(token,UPLOAD+'?uploadType=multipart&fields=id,parents,appProperties',{
  method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await res.json();
 if(!out.id||!out.parents?.includes(PRIVATE_PARENT)||out.appProperties?.bm_kind!=='bm_lacunas_recovery_v242')
  throw Error('Cópia de recuperação não foi confirmada na pasta privada');
 const raw=await(await req(token,API+'/'+encodeURIComponent(out.id)+'?alt=media')).text();
 if(raw.length>MAX)throw Error('Cópia de recuperação ultrapassou o limite');
 const back=JSON.parse(raw);
 if(back.format!=='BancoMestreLacunasV242')throw Error('Formato de recuperação incorreto');
 window.BM242Lacunas.validate(back.data);
 if(await hash(back.data)!==expected)throw Error('Cópia de recuperação não corresponde aos dados originais');
 return out.id;
}
async function create(token,d,expected){
 const check=await locate(token);if(check)throw Error('Outro cadastro surgiu no Drive durante a sincronização');
 const payload=JSON.stringify({format:'BancoMestreLacunasDriveV242',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Cadastro muito grande');
 await archive(token,d,'antes_criacao_mestre',expected);
 if(await locate(token))throw Error('Outro mestre apareceu após o snapshot; nenhuma criação duplicada será tentada');
 const boundary='bm242-'+crypto.randomUUID(),meta={name:'BancoMestre_Lacunas_Mestre_V242.json',mimeType:'application/json',
  parents:[PRIVATE_PARENT],appProperties:{bm_kind:KIND,bm_schema:'V242'}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
  '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+
  '\r\n--'+boundary+'--';
 const res=await req(token,UPLOAD+'?uploadType=multipart&fields=id,appProperties,parents',
  {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await res.json();
 if(!out.id||out.appProperties?.bm_kind!==KIND||!out.parents?.includes(PRIVATE_PARENT))throw Error('Gravação no diretório privado não confirmada');
 await confirmed(token,out.id,expected);return out;
}
async function update(token,file,d,expected,remote,remoteHash){
 await archive(token,remote,'antes_atualizacao_remoto',remoteHash);
 await archive(token,d,'candidato_local_pre_envio',expected);
 const latest=await(await req(token,API+'/'+encodeURIComponent(file.id)+'?fields=id,version,appProperties')).json();
 if(latest.id!==file.id||String(latest.version)!==String(file.version)||latest.appProperties?.bm_kind!==KIND)
  throw Error('Alteração concorrente do cadastro remoto; original preservado');
 const payload=JSON.stringify({format:'BancoMestreLacunasDriveV242',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Cadastro muito grande');
 const res=await req(token,UPLOAD+'/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,version',
  {method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:payload});
 const out=await res.json();
 if(out.id!==file.id)throw Error('Resposta remota sem ID válido');
 await confirmed(token,file.id,expected);return out;
}
function status(r){
 lastResult=r;document.dispatchEvent(new CustomEvent('bm242-lacunas-drive-status',{detail:r}));return r;
}
async function work(token){
 if(!crypto?.subtle||!window.BM242Lacunas?.validate)throw Error('Módulo de integridade de lacunas indisponível');
 const d=local(),localHash=await hash(d),baseline=localStorage.getItem(BASE),file=await locate(token);
 if(!file){
  if(!d.records.length){
   const seed=await locateSeed(token);
   if(!seed)return status({state:'empty',message:'Lacunas: nenhum registro privado encontrado para sincronizar'});
   const initial=await seedData(token,seed),seedHash=await hash(initial);
   if(await hash(local())!==localHash)throw Error('Cadastro local alterado durante busca do histórico');
   await create(token,initial,seedHash);
   window.BM242Lacunas.applyRemote(initial);
   localStorage.setItem(BASE,seedHash);
   return status({state:'uploaded',message:'Lacunas: ficha PETRO16 auditada importada e mestre Drive criado e conferido'});
  }
  if(await hash(local())!==localHash)throw Error('Dados locais alterados durante consulta');
  await create(token,d,localHash);
  localStorage.setItem(BASE,localHash);
  return status({state:'uploaded',message:'Lacunas: cadastro privado criado e conferido no Drive'});
 }
 const remote=await fetchData(token,file.id),remoteHash=await hash(remote);
 if(localHash===remoteHash){
  localStorage.setItem(BASE,localHash);
  return status({state:'unchanged',message:'Lacunas: cadastro local e Drive idênticos e conferidos'});
 }
 if((baseline&&baseline===localHash)||(!baseline&&!d.records.length)){
  if(await hash(local())!==localHash)throw Error('Dados locais foram alterados durante leitura');
  window.BM242Lacunas.applyRemote(remote);
  localStorage.setItem(BASE,remoteHash);
  return status({state:'downloaded',message:'Lacunas: dados remotos importados e cópia anterior preservada'});
 }
 if(baseline&&baseline===remoteHash){
  if(await hash(local())!==localHash)throw Error('Dados locais alterados durante envio');
  await update(token,file,d,localHash,remote,remoteHash);
  localStorage.setItem(BASE,localHash);
  return status({state:'uploaded',message:'Lacunas: alterações gravadas e verificadas no Drive'});
 }
 return status({state:'conflict',message:'Lacunas: conflito entre dispositivos; dados locais e Drive preservados sem sobrescrita'});
}
async function sync(token){
 if(running)return running;
 running=work(token).catch(e=>status({state:'error',message:'Lacunas: '+e.message})).finally(()=>{running=null});
 return running;
}
window.BM242LacunasDrive=Object.freeze({sync,get lastResult(){return lastResult}});
})();