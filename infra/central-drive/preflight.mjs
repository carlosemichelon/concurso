import {access,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {parseUsers} from './auth.mjs';
import {ownerToken,createOwnerLoader} from './owner-drive.mjs';
import {originalPage} from './original-page.mjs';
import {loadMarksCores} from './marks.mjs';
const vendors=Object.freeze({
 'pdf.min.js':'c31b6ab62a57edd79441ca939bb7e18fc1b09c63',
 'pdf.worker.min.js':'12242260905b0f82831f735be91e231d17a1a57d',
 'pdf-lib.min.js':'edb12c72cdaa11b608eb5967cf1531892b7f3b31'
});
export async function checkLocalAssets(){
 const {styles}=await originalPage();
 for(const name of styles)await access(new URL('../../assets/'+name,import.meta.url));
 for(const [name,sha] of Object.entries(vendors)){
  const data=await readFile(new URL('./vendor/'+name,import.meta.url));
  const got=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
  if(got!==sha)throw Error('Biblioteca PDF divergente: '+name);
 }
 await loadMarksCores();
 return {styles:styles.size,vendorFiles:Object.keys(vendors).length}
}
export function deploymentConfig(env){
 const users=parseUsers(env.BM_USERS_JSON);
 if(users.size<2)throw Error('Homologação exige pelo menos dois usuários distintos');
 if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(env.BM_ORIGIN||''))throw Error('BM_ORIGIN HTTPS inválida');
 const port=Number(env.PORT||8080);if(!Number.isSafeInteger(port)||port<1||port>65535)throw Error('PORT inválida');
 for(const key of ['BM_GOOGLE_CLIENT_ID','BM_GOOGLE_CLIENT_SECRET','BM_GOOGLE_REFRESH_TOKEN'])if(typeof env[key]!=='string'||!env[key].trim())throw Error('Configuração ausente: '+key);
 return {users,port,origin:env.BM_ORIGIN}
}
export async function preflight(env=process.env,{checkAssets=checkLocalAssets,createLoader,fetcher=fetch}={}){
 const {users}=deploymentConfig(env),assets=await checkAssets();
 // Only token exchange and read-only profile loading. Never create, share, move,
 // migrate, or rewrite Drive files during preflight.
 const load=createLoader?createLoader():createOwnerLoader({getToken:ownerToken({clientId:env.BM_GOOGLE_CLIENT_ID,clientSecret:env.BM_GOOGLE_CLIENT_SECRET,refreshToken:env.BM_GOOGLE_REFRESH_TOKEN,fetcher}),fetcher});
 const profiles=[];let n=0;
 for(const user of users.values()){
  n++;
  try{
   const summary=await load(user);
   if(!summary||!summary.counts||!Number.isSafeInteger(summary.counts.cards)||!Number.isSafeInteger(summary.counts.srs))throw Error('Resumo inválido');
   profiles.push({profile:n,ready:true,cards:summary.counts.cards,srs:summary.counts.srs,pdf:summary.counts.pdf,images:summary.counts.images});
  }catch{profiles.push({profile:n,ready:false,reason:'Raiz, manifesto, coleções ou autorização Drive não confirmados'})}
 }
 return {ready:profiles.every(x=>x.ready),assets,profiles}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  if(process.argv.includes('--local'))console.log(JSON.stringify({ready:true,assets:await checkLocalAssets()},null,2));
  else{const result=await preflight();console.log(JSON.stringify(result,null,2));if(!result.ready)process.exitCode=1}
 }catch{console.error('Pré-verificação bloqueada: confirme a configuração privada e os arquivos de implantação. Nenhuma credencial foi exibida.');process.exitCode=1}
}
