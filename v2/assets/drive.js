/* Banco Mestre V2: consulta privada em sessão autenticada, sem publicação no GitHub.
   OAuth token exclusivo em memória. Não registra chaves no localStorage nem envia telemetria. */
import {driveApiFileUrl,boundedMediaBytes,boundedPdfBytes,MAX_DRIVE_IMAGE_BYTES} from './drive-media.js';
export const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.readonly';
export const DRIVE_API='https://www.googleapis.com/drive/v3/files';
export const GIS_SCRIPT='https://accounts.google.com/gsi/client';
export const PDF_ROOTS=Object.freeze([
  Object.freeze({id:'1yvwhb-W-vMUMu5DmikE3hR-i01cnrWdK',name:'DataBase_Concurso'}),
  Object.freeze({id:'1squNqRXuxfT1YRjT3i4nw8TRnFtLOcuE',name:'CONCURSOS – ENGENHARIA CIVIL'}),
  Object.freeze({id:'1_IgIlki_2ZlMmOaKmYuzhiMSjyLa-cnV',name:'Normas Regulamentadoras'}),
  Object.freeze({id:'18MsuWSayX7xpBhNmGjSvFmiiv1hF6YZk',name:'Licenciamento Ambiental'})
]);
const FOLDER_MIME='application/vnd.google-apps.folder';
const IMAGE_MIME=new Set(['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']);
const MAX_PREVIEW_BYTES=15_000_000;
const MAX_FOLDERS=1500;
const MAX_FILES=30000;
const MAX_PAGES=5000;
const rootUrl=new URL('../../assets/',import.meta.url);
const isDriveId=value=>/^[A-Za-z0-9_-]{10,200}$/.test(String(value||''));
export function imageKind(mime){return IMAGE_MIME.has(mime)}
export function originalUrl(fileId){
  if(!isDriveId(fileId))return '';
  return 'https://drive.google.com/file/d/'+encodeURIComponent(fileId)+'/view';
}
export function summarize(files,knownIds,kind){
  const known=new Set(knownIds||[]), seen=new Map();
  let duplicates=0,ignored=0,oversized=0;
  for(const f of files||[]){
    if(!f||!isDriveId(f.id)){ignored++;continue}
    if(f.mimeType===FOLDER_MIME)continue;
    if(kind==='image'?!imageKind(f.mimeType):f.mimeType!=='application/pdf'){ignored++;continue}
    if(seen.has(f.id)){duplicates++;continue}
    const tooLarge=Number(f.size||0)>MAX_PREVIEW_BYTES;
    if(tooLarge)oversized++;
    seen.set(f.id,Object.freeze({
      id:f.id,name:String(f.name||'Arquivo sem nome').slice(0,240),
      mimeType:f.mimeType,modifiedTime:String(f.modifiedTime||''),
      size:Number(f.size||0),parentId:Array.isArray(f.parents)?String(f.parents[0]||''):'',
      path:String(f.drivePath||'').slice(0,550),isInPublicCatalog:known.has(f.id),
      previewAllowed:kind==='image'&&!tooLarge,webUrl:originalUrl(f.id)
    }));
  }
  const list=[...seen.values()].sort((a,b)=>b.modifiedTime.localeCompare(a.modifiedTime)||a.name.localeCompare(b.name,'pt-BR'));
  return Object.freeze({files:list,found:list.length,alreadyCataloged:list.filter(x=>x.isInPublicCatalog).length,
    newFiles:list.filter(x=>!x.isInPublicCatalog).length,duplicates,ignored,oversized});
}
function verifyConfig(contract){
  if(contract?.schema!=='BancoMestreStorageContractV202')throw Error('Contrato Drive V202 não reconhecido');
  const roots=contract.runtime_scan_roots?.images;
  if(!Array.isArray(roots)||roots.length!==2||
    roots[0]!=='1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6'||
    roots[1]!=='1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo'||
    contract.canonical_write_destinations?.images?.folder_id!==roots[0]||
    contract.canonical_write_destinations?.checkpoints?.folder_id!=='1348cILBcxFG9p2cfPJ3WubmHswPRbD24')
    throw Error('Pastas canônicas do Drive divergentes. Sincronização privada bloqueada');
  return roots.map((id,i)=>({id,name:i===0?'Atlas oficial':'Originais históricos P11–P14'}));
}
export function verifyScanContract(contract){return verifyConfig(contract)}
const humanError=e=>{
  if(e?.name==='AbortError')return 'Consulta cancelada';
  return String(e?.message||'Falha na consulta').slice(0,300);
};
export class DriveReadonly {
  constructor({contract,publicImageIds=[],publicPdfIds=[]}={}){
    this.imageRoots=verifyConfig(contract);
    this.knownImages=new Set(publicImageIds);
    this.knownPdfs=new Set(publicPdfIds);
    this.accessToken='';
    this.expiresAt=0;
    this.oauth=null;
    this.scanning=false;
    this.abort=null;
    this.lastImages=null;
    this.lastPdfs=null;
    this.listeners=new Set();
    this.sessionEpoch=0;
    this.activeMedia=new Set();
  }
  onChange(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener)}
  emit(type,details={}){for(const callback of this.listeners)callback({type,...details})}
  get connected(){
    if(this.accessToken&&Date.now()>=this.expiresAt){this.clear('expired')}
    return Boolean(this.accessToken);
  }
  clear(reason='disconnected'){
    this.sessionEpoch++;
    this.abort?.abort();
    for(const pending of this.activeMedia)pending.abort();
    this.activeMedia.clear();
    this.accessToken='';this.expiresAt=0;
    this.lastImages=null;this.lastPdfs=null;
    this.emit(reason);
  }
  disconnect(){
    const token=this.accessToken;
    this.clear('disconnected');
    if(token&&globalThis.google?.accounts?.oauth2?.revoke){
      globalThis.google.accounts.oauth2.revoke(token,()=>{});
    }
  }
  async prepare(){
    if(this.oauth)return true;
    const configResponse=await fetch(new URL('drive_auth_v038.json',rootUrl),{cache:'no-store'});
    if(!configResponse.ok)throw Error('Configuração pública de login Google indisponível');
    const config=await configResponse.json();
    if(!/^[0-9A-Za-z_-]+\.apps\.googleusercontent\.com$/.test(config.client_id||''))
      throw Error('Identificador público OAuth inválido');
    if(!globalThis.google?.accounts?.oauth2?.initTokenClient){
      await new Promise((resolve,reject)=>{
        const existing=document.querySelector('script[data-bm-v2-gis]');
        if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(Error('Google Identity Services indisponível')),{once:true});return;}
        const script=document.createElement('script');
        script.src=GIS_SCRIPT;script.async=true;script.dataset.bmV2Gis='1';
        script.referrerPolicy='no-referrer';
        script.addEventListener('load',resolve,{once:true});
        script.addEventListener('error',()=>reject(Error('Google Identity Services indisponível')),{once:true});
        document.head.appendChild(script);
      });
    }
    if(!globalThis.google?.accounts?.oauth2?.initTokenClient)throw Error('API de autenticação Google não disponível');
    this.oauth=globalThis.google.accounts.oauth2.initTokenClient({
      client_id:config.client_id,scope:DRIVE_SCOPE,
      callback:result=>{
        if(result?.error||!result?.access_token){this.emit('auth-error',{message:'Autorização recusada ou cancelada'});return}
        const seconds=Number(result.expires_in);
        if(!Number.isFinite(seconds)||seconds<=90){this.emit('auth-error',{message:'Prazo do token Google não confirmado'});return}
        // Substituir credencial revoga todos os downloads da sessão anterior.
        this.sessionEpoch++;
        for(const pending of this.activeMedia)pending.abort();
        this.activeMedia.clear();
        this.lastImages=null;this.lastPdfs=null;
        this.accessToken=result.access_token;
        this.expiresAt=Date.now()+Math.max(1,seconds-60)*1000;
        this.emit('connected');
      }
    });
    this.emit('ready');return true;
  }
  /** Chamar somente dentro do clique real; nunca de setInterval/effect. */
  connect(){
    if(!this.oauth)throw Error('Autenticação ainda não preparada');
    this.oauth.requestAccessToken({prompt:this.connected?'':'consent'});
  }
  async authorized(url,{signal}={}){
    if(!driveApiFileUrl(url))throw Error('Acesso com token bloqueado fora da API oficial do Google Drive');
    if(!this.connected)throw Error('Sessão Drive expirada; reconecte');
    const response=await fetch(url,{method:'GET',
      headers:{Authorization:'Bearer '+this.accessToken},cache:'no-store',
      credentials:'omit',referrerPolicy:'no-referrer',signal});
    if(response.status===401){this.clear('expired');throw Error('Google Drive expirou a autorização; reconecte')}
    if(!response.ok)throw Error('Consulta Google Drive: HTTP '+response.status);
    return response;
  }
  /** Consulta só de metadados dos PDFs editoriais, por ID exato conhecido.
   *  Um 403/404 significa não confirmado para esta conta, não arquivo excluído.
   *  Cancela consulta no logout, expiração ou troca de token.
   */
  async probePdfFileMetadata(fileId,{signal}={}){
    if(!isDriveId(fileId)||!this.knownPdfs.has(fileId))
      throw Error('ID de PDF fora do catálogo público V149');
    if(!this.connected)throw Error('Conecte o Drive para consulta de metadados');
    const epoch=this.sessionEpoch;
    const controller=new AbortController();
    const cancel=()=>controller.abort();
    if(signal?.aborted)controller.abort();
    else signal?.addEventListener('abort',cancel,{once:true});
    this.activeMedia.add(controller);
    try{
      const fields='id,name,mimeType,size,parents,trashed,modifiedTime';
      const url=DRIVE_API+'/'+encodeURIComponent(fileId)+'?'+
        new URLSearchParams({fields,supportsAllDrives:'true'});
      const response=await this.authorized(url,{signal:controller.signal});
      const json=await response.json();
      if(controller.signal.aborted||this.sessionEpoch!==epoch||!this.connected)
        throw Error('Consulta de metadados descartada: sessão encerrada');
      if(!json||json.id!==fileId)throw Error('Drive respondeu metadados com ID divergente');
      return json;
    }finally{
      this.activeMedia.delete(controller);
      signal?.removeEventListener('abort',cancel);
    }
  }
  async listFolder(parentId,signal){
    if(!isDriveId(parentId))throw Error('ID de pasta inválido');
    let pageToken='',pages=0;
    const items=[];
    do{
      if(++pages>100)throw Error('Limite de paginação por pasta atingido');
      const params=new URLSearchParams({
        q:"'"+parentId+"' in parents and trashed = false",
        fields:'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents)',
        pageSize:'1000',orderBy:'name',spaces:'drive',supportsAllDrives:'true',includeItemsFromAllDrives:'true'
      });
      if(pageToken)params.set('pageToken',pageToken);
      const response=await this.authorized(DRIVE_API+'?'+params,{signal});
      const json=await response.json();
      if(!Array.isArray(json.files))throw Error('Resposta inesperada da lista do Drive');
      items.push(...json.files);
      pageToken=String(json.nextPageToken||'');
    }while(pageToken);
    return {items,pages};
  }
  async walk(roots,kind,signal){
    const queue=roots.map(x=>({...x,path:x.name})),visited=new Set();
    const found=[],seen=new Set();
    let pages=0,folderCount=0;
    for(let offset=0;offset<queue.length;offset++){
      if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
      const folder=queue[offset];
      if(visited.has(folder.id))continue;
      visited.add(folder.id);
      if(++folderCount>MAX_FOLDERS)throw Error('Varredura excedeu '+MAX_FOLDERS+' pastas; dados anteriores preservados');
      const result=await this.listFolder(folder.id,signal);pages+=result.pages;
      if(pages>MAX_PAGES)throw Error('Limite de páginas do Drive excedido');
      for(const entry of result.items){
        if(entry.mimeType===FOLDER_MIME){
          if(!visited.has(entry.id))queue.push({id:entry.id,name:entry.name,path:folder.path+' / '+entry.name});
        }else if(kind==='image'?imageKind(entry.mimeType):entry.mimeType==='application/pdf'){
          if(!seen.has(entry.id)){seen.add(entry.id);found.push({...entry,drivePath:folder.path})}
          if(found.length>MAX_FILES)throw Error('Varredura excedeu '+MAX_FILES+' arquivos');
        }
      }
    }
    const summary=summarize(found,kind==='image'?this.knownImages:this.knownPdfs,kind);
    return Object.freeze({...summary,folderCount,pages,kind,checkedAt:new Date().toISOString(),scope:'authorized_browser_session_only'});
  }
  async scan(kind){
    if(!['image','pdf'].includes(kind))throw Error('Tipo de acervo inválido');
    if(!this.connected)throw Error('Conecte o Google Drive primeiro');
    if(this.scanning)throw Error('Já existe uma consulta Drive em andamento');
    this.scanning=true;this.abort=new AbortController();
    const signal=this.abort.signal;
    this.emit('scan-start',{kind});
    try{
      const result=await this.walk(kind==='image'?this.imageRoots:PDF_ROOTS,kind,signal);
      // Uma resposta que chegou após logout ou expiração não deve ficar na interface.
      if(!this.connected||signal.aborted)throw new Error('Sessão encerrada durante a consulta');
      if(kind==='image')this.lastImages=result;else this.lastPdfs=result;
      this.emit('scan-done',{kind,result});return result;
    }catch(error){
      this.emit('scan-error',{kind,message:humanError(error)});
      throw error;
    }finally{this.scanning=false;this.abort=null}
  }
  async readPrivateMedia(fileId,{signal,kind='pdf'}={}){
    if(!isDriveId(fileId))throw Error('ID do arquivo privado inválido');
    if(!['pdf','image'].includes(kind))throw Error('Formato de download não permitido');
    if(!this.connected)throw Error('Sessão Drive expirada; reconecte');
    const epoch=this.sessionEpoch;
    const controller=new AbortController();
    const cancel=()=>controller.abort();
    if(signal?.aborted)controller.abort();
    else signal?.addEventListener('abort',cancel,{once:true});
    this.activeMedia.add(controller);
    try{
      if(controller.signal.aborted)throw new DOMException('Cancelado','AbortError');
      const url=DRIVE_API+'/'+encodeURIComponent(fileId)+'?alt=media';
      const response=await fetch(url,{
        method:'GET',headers:{Authorization:'Bearer '+this.accessToken},
        cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',
        signal:controller.signal
      });
      if(response.status===401){
        this.clear('expired');throw Error('Autorização Google expirou; reconecte');
      }
      if(!response.ok)throw Error('Download Google Drive HTTP '+response.status);
      const contentType=String(response.headers?.get?.('content-type')||'').split(';')[0].trim().toLowerCase();
      const buffer=kind==='pdf'?
        await boundedPdfBytes(response,{signal:controller.signal}):
        await boundedMediaBytes(response,{maxBytes:MAX_DRIVE_IMAGE_BYTES,signal:controller.signal});
      if(controller.signal.aborted||!this.connected||this.sessionEpoch!==epoch)
        throw Error('Sessão Drive encerrada durante o download. Dados descartados.');
      return Object.freeze({buffer,contentType});
    }finally{
      this.activeMedia.delete(controller);
      signal?.removeEventListener('abort',cancel);
    }
  }
  /** PDF privado: bytes apenas em memória, verificação por assinatura e até 120 MB. */
  async downloadPdf(fileId,{signal}={}){
    const result=await this.readPrivateMedia(fileId,{signal,kind:'pdf'});
    return result.buffer;
  }
  async preview(file,signal){
    if(!file?.previewAllowed||!imageKind(file.mimeType))
      throw Error('Prévia não permitida para este formato/tamanho');
    const result=await this.readPrivateMedia(file.id,{signal,kind:'image'});
    if(result.contentType&&!imageKind(result.contentType))
      throw Error('Formato da prévia diferente do catálogo autorizado');
    return new Blob([result.buffer],{type:result.contentType||file.mimeType});
  }
}
