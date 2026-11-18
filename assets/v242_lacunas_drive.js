/* V242 | Sincronização privada de lacunas com Google Drive drive.file.
   Protege contra sobrescrita concorrente. Nao modifica cartoes ou SRS. */
(function(){
'use strict';
if(window.BM242LacunasDrive)return;
const KEY='BM_LACUNAS_V242',BASE='BM242_LACUNAS_REMOTE_SHA256',
 KIND='bm_lacunas_v242',API='https://www.googleapis.com/drive/v3/files',
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
async function create(token,d,expected){
 const check=await locate(token);if(check)throw Error('Outro cadastro surgiu no Drive durante a sincronização');
 const payload=JSON.stringify({format:'BancoMestreLacunasDriveV242',updatedAt:new Date().toISOString(),data:d});
 if(payload.length>MAX)throw Error('Cadastro muito grande');
 const boundary='bm242-'+crypto.randomUUID(),meta={name:'BancoMestre_Lacunas_Mestre_V242.json',mimeType:'application/json',
  appProperties:{bm_kind:KIND,bm_schema:'V242'}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
  '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+
  '\r\n--'+boundary+'--';
 const res=await req(token,UPLOAD+'?uploadType=multipart&fields=id,appProperties',
  {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const out=await res.json();
 if(!out.id||out.appProperties?.bm_kind!==KIND)throw Error('ID do arquivo criado não confirmado');
 await confirmed(token,out.id,expected);return out;
}
async function update(token,file,d,expected){
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
  if(!d.records.length)return status({state:'empty',message:'Lacunas: sem registros para enviar ao Drive'});
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
  await update(token,file,d,localHash);
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