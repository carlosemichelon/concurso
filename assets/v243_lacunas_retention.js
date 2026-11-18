/* Banco Mestre V243 — rotacao verificada de backups diarios e mensais no Drive. */
(function(){
'use strict';
if(window.BM243LacunasRetention)return;
const previous=window.BM242LacunasDrive;
if(!previous?.sync){console.error('V243 backups: sincronizador de lacunas não está carregado');return}
const API='https://www.googleapis.com/drive/v3/files',UPLOAD='https://www.googleapis.com/upload/drive/v3/files',
 FOLDER='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD',KIND='bm_lacunas_periodic_v242',
 KEY='BM_LACUNAS_V242',BASE='BM242_LACUNAS_REMOTE_SHA256',MAX=5000000;
let active=null,latest=null;
function copy(v){return JSON.parse(JSON.stringify(v))}
async function digest(d){const b=new TextEncoder().encode(JSON.stringify(d));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function req(token,url,options={}){
 if(!token)throw Error('OAuth Drive indisponível');
 const r=await fetch(url,{...options,cache:'no-store',headers:{Authorization:'Bearer '+token,...options.headers}});
 if(!r.ok)throw Error('Drive HTTP '+r.status+' ao auditar backup');return r;
}
function keys(){
 const t=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const m=Object.fromEntries(t.map(x=>[x.type,x.value]));
 if(!/^\d{4}$/.test(m.year)||!/^\d{2}$/.test(m.month)||!/^\d{2}$/.test(m.day))throw Error('Data local inconsistente');
 return {daily:m.year+'-'+m.month+'-'+m.day,monthly:m.year+'-'+m.month};
}
function validKey(period,key){
 if(period==='monthly'){
  if(!/^\d{4}-\d{2}$/.test(key||''))return false;
  const [year,month]=key.split('-').map(Number);
  return year>=2000&&year<=9999&&month>=1&&month<=12;
 }
 if(period==='daily'){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key||''))return false;
  const [year,month,day]=key.split('-').map(Number);
  if(year<2000||year>9999||month<1||month>12||day<1||day>31)return false;
  const date=new Date(Date.UTC(year,month-1,day));
  return date.getUTCFullYear()===year&&date.getUTCMonth()+1===month&&date.getUTCDate()===day;
 }
 return false;
}
async function list(token){
 const url=new URL(API);
 url.searchParams.set('q',"trashed = false and '"+FOLDER+"' in parents and appProperties has { key='bm_kind' and value='"+KIND+"' }");
 url.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,name,parents,appProperties,createdTime)');
 url.searchParams.set('pageSize','1000');
 const d=await(await req(token,url.href)).json();
 if(d.incompleteSearch||d.nextPageToken)throw Error('Listagem de backups incompleta');
 const files=(d.files||[]).filter(x=>x.parents?.includes(FOLDER)&&x.appProperties?.bm_kind===KIND);
 if(files.some(x=>!x.id||!validKey(x.appProperties?.bm_period,x.appProperties?.bm_period_key)))
  throw Error('Metadados de backup inesperados: retenção bloqueada');
 return files;
}
async function create(token,data,period,key,hash){
 const payload=JSON.stringify({format:'BancoMestreLacunasV242',backupReason:'backup_rotativo_'+period,backupAt:new Date().toISOString(),data},null,2);
 if(payload.length>MAX)throw Error('Backup ultrapassa 5 MB');
 const boundary='bm243-backup-'+crypto.randomUUID();
 const meta={name:'BancoMestre_Lacunas_Backup_'+period+'_'+key+'_'+crypto.randomUUID().slice(0,8)+'.json',
  mimeType:'application/json',parents:[FOLDER],appProperties:{bm_kind:KIND,bm_schema:'V242',bm_period:period,bm_period_key:key}};
 const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
  '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+payload+'\r\n--'+boundary+'--';
 const res=await req(token,UPLOAD+'?uploadType=multipart&fields=id,parents,appProperties',{
  method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 const o=await res.json();
 if(!o.id||!o.parents?.includes(FOLDER)||o.appProperties?.bm_kind!==KIND||o.appProperties?.bm_period_key!==key)
  throw Error('Gravação de backup não confirmada na pasta privada');
 const raw=await(await req(token,API+'/'+encodeURIComponent(o.id)+'?alt=media')).text();
 if(raw.length>MAX)throw Error('Cópia de backup excede limite');
 const got=JSON.parse(raw);
 if(got.format!=='BancoMestreLacunasV242')throw Error('Backup não é importável pela biblioteca');
 window.BM242Lacunas.validate(got.data);
 if(await digest(got.data)!==hash)throw Error('Leitura de backup não corresponde ao arquivo mestre');
 return o.id;
}
async function deleteOld(token,f,current){
 const p=f.appProperties||{},period=p.bm_period,key=p.bm_period_key;
 if(key===current[period])throw Error('Não excluir backup corrente');
 const v=await(await req(token,API+'/'+encodeURIComponent(f.id)+'?fields=id,parents,appProperties,trashed')).json();
 if(v.id!==f.id||v.trashed||!v.parents?.includes(FOLDER)||v.appProperties?.bm_kind!==KIND||
  v.appProperties?.bm_period!==period||v.appProperties?.bm_period_key!==key)
  throw Error('Backup modificado externamente: exclusão cancelada');
 await req(token,API+'/'+encodeURIComponent(f.id),{method:'DELETE'});
}
async function keepPeriods(token,data,hash){
 const current=keys(),before=await list(token);
 for(const p of ['daily','monthly']){
  if(!before.some(x=>x.appProperties.bm_period===p&&x.appProperties.bm_period_key===current[p]))
   await create(token,data,p,current[p],hash);
 }
 const existing=await list(token);
 for(const p of ['daily','monthly'])if(!existing.some(x=>x.appProperties.bm_period===p&&x.appProperties.bm_period_key===current[p]))
  throw Error('O backup corrente '+p+' não consta na conferência do Drive');
 let pruned=0;
 for(const [period,limit] of [['daily',30],['monthly',12]]){
  const group=existing.filter(x=>x.appProperties.bm_period===period);
  const distinct=[...new Set(group.map(x=>x.appProperties.bm_period_key))].sort().reverse();
  const keep=new Set(distinct.slice(0,limit));
  for(const file of group){
   if(keep.has(file.appProperties.bm_period_key))continue;
   await deleteOld(token,file,current);pruned++;
  }
 }
 const verified=await list(token);
 for(const [period,limit] of [['daily',30],['monthly',12]]){
  const group=verified.filter(x=>x.appProperties.bm_period===period);
  const keep=new Set([...new Set(group.map(x=>x.appProperties.bm_period_key))].sort().reverse().slice(0,limit));
  if(group.some(x=>!keep.has(x.appProperties.bm_period_key)))throw Error('Retenção de backups '+period+' não concluída');
 }
 const count=p=>new Set(verified.filter(x=>x.appProperties.bm_period===p).map(x=>x.appProperties.bm_period_key)).size;
 return {daily:count('daily'),monthly:count('monthly'),pruned};
}
async function confirmMasterCurrent(token,expected){
 const u=new URL(API);
 u.searchParams.set('q',"trashed = false and appProperties has { key='bm_kind' and value='bm_lacunas_v242' }");
 u.searchParams.set('fields','nextPageToken,incompleteSearch,files(id,appProperties)');
 u.searchParams.set('pageSize','100');
 const listing=await(await req(token,u.href)).json();
 if(listing.incompleteSearch||listing.nextPageToken)throw Error('Busca do mestre após backups incompleta');
 const masters=(listing.files||[]).filter(x=>x.appProperties?.bm_kind==='bm_lacunas_v242');
 if(masters.length!==1||!masters[0].id)throw Error('Mestre privado duplicado ou ausente após backups');
 const raw=await(await req(token,API+'/'+encodeURIComponent(masters[0].id)+'?alt=media')).text();
 if(raw.length>MAX)throw Error('Mestre remoto excede limite');
 const body=JSON.parse(raw);
 if(body.format!=='BancoMestreLacunasDriveV242')throw Error('Mestre remoto com formato inválido');
 window.BM242Lacunas.validate(body.data);
 if(await digest(body.data)!==expected)throw Error('Mestre modificado por outro dispositivo durante o backup');
}
function state(r){latest=r;document.dispatchEvent(new CustomEvent('bm242-lacunas-drive-status',{detail:r}));return r}
async function sync(token){
 if(active)return active;
 active=(async()=>{
  const r=await previous.sync(token);
  if(!['uploaded','downloaded','unchanged'].includes(r?.state))return state(r);
  try{
   const raw=localStorage.getItem(KEY),d=raw?JSON.parse(raw):{schema:1,records:[],log:[],updatedAt:null};
   window.BM242Lacunas.validate(d);
   const expected=await digest(d);
   if(localStorage.getItem(BASE)!==expected)throw Error('Dados locais diferem da última confirmação do mestre');
   const result=await keepPeriods(token,d,expected);
   const finalRaw=localStorage.getItem(KEY);
   if(!finalRaw||await digest(JSON.parse(finalRaw))!==expected)
    throw Error('Cadastro local modificado enquanto backups eram verificados');
   await confirmMasterCurrent(token,expected);
   return state({...r,message:r.message+' · backups verificados: '+result.daily+' datas diárias e '+result.monthly+' meses'+(result.pruned?' · '+result.pruned+' cópias antigas depuradas':'')});
  }catch(e){return state({state:'partial',message:r.message+' · backup rotativo pendente: '+e.message})}
 })().finally(()=>{active=null});return active;
}
window.BM242LacunasDrive=Object.freeze({sync,get lastResult(){return latest||previous.lastResult}});
window.BM243LacunasRetention=Object.freeze({get ready(){return true},get lastResult(){return latest}});
})();
