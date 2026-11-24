/* Interface de adaptação do portal existente. Não carregada no index de produção.
 * Identidade deve vir de userinfo verificado na sessão OAuth, nunca de um seletor local.
 * Namespace local reduz colisões acidentais, não é fronteira de segurança entre scripts da mesma origem.
 * Não importa dados antigos automaticamente; arquivos privados continuam no Drive proprietário.
 */
const PREFIX='BM347_MULTI_V1:';
const validSubject=s=>typeof s==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(s);
const validKey=k=>typeof k==='string'&&k.length>0&&k.length<=500&&!k.includes('\0');
export function verifiedSubject(info){if(!validSubject(info?.sub)||info.email_verified!==true||typeof info.email!=='string'||!info.email.trim())throw Error('Identidade Google não verificada');return info.sub}
export function createAccountContext(info,storage,idb){const subject=verifiedSubject(info),prefix=PREFIX+subject+':';let active=true;const check=()=>{if(!active)throw Error('Sessão encerrada')};const key=k=>{check();if(!validKey(k))throw Error('Chave inválida');return prefix+k};return Object.freeze({subject,local:Object.freeze({getItem:k=>storage.getItem(key(k)),setItem:(k,v)=>storage.setItem(key(k),String(v)),removeItem:k=>storage.removeItem(key(k)),keys:()=>{check();return Array.from({length:storage.length},(_,i)=>storage.key(i)).filter(k=>typeof k==='string'&&k.startsWith(prefix)).map(k=>k.slice(prefix.length))},clear:()=>{check();for(let i=storage.length-1;i>=0;i--){const k=storage.key(i);if(k?.startsWith(prefix))storage.removeItem(k)}}}),databaseName:k=>key(k),openDatabase:(k,version)=>idb.open(key(k),version),deleteDatabase:k=>idb.deleteDatabase(key(k)),close:()=>{active=false}})}
export function privateDriveFile(file,subject,kind,{parent=null,project='bm-portal-multi-v1'}={}){if(!validSubject(subject)||!file||!validSubject(file.id)||file.ownedByMe!==true||file.shared!==false||file.trashed===true||file.appProperties?.bmProject!==project||file.appProperties?.bmOwner!==subject||file.appProperties?.bmKind!==kind||parent&&!file.parents?.includes(parent))throw Error('Arquivo não pertence ao ambiente privado da conta');return file}
export function assertSameAccount(readInfo,destination){if(verifiedSubject(readInfo)!==destination.subject)throw Error('A conta de origem não corresponde ao destino');return destination.subject}
