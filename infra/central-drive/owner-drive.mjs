import {createDriveProvider} from '../../assets/multiaccount-drive-v001.mjs';
import {createBootstrap} from '../../assets/multiaccount-bootstrap-v001.mjs';
import {CATALOGS} from '../../assets/multiaccount-catalog-v001.mjs';
import {createServerCatalogLoader} from './catalog.mjs';
import {projectRuntime} from './runtime.mjs';
// The OAuth token is exclusively server-side. bmOwner is an application account
// subject, not the Google account owner. The provider additionally checks physical
// Drive ownership, no sharing, project tag, kind and exact parent.
export function ownerToken({clientId,clientSecret,refreshToken,fetcher=fetch}){
 if(!clientId||!clientSecret||!refreshToken)throw Error('Configuração OAuth ausente.');
 let cache=null,pending=null;
 return async()=>{if(cache&&Date.now()+60000<cache.expiresAt)return cache;if(pending)return pending;
 pending=(async()=>{const r=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',redirect:'error',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:'refresh_token'})});if(!r.ok)throw Error('Autorização central indisponível');const data=await r.json();if(typeof data.access_token!=='string'||!Number.isFinite(data.expires_in)||data.expires_in<60)throw Error('Token central inválido');return cache={token:data.access_token,expiresAt:Date.now()+data.expires_in*1000}})();
 try{return await pending}finally{pending=null}
 };
}
export function createOwnerLoader({getToken,fetcher=fetch,loadCatalog=createServerCatalogLoader()}){
 return async (user,{runtime=false}={})=>{
  const {token,expiresAt}=await getToken();
  // Identity is derived ONLY from the authenticated server account, never request input.
  const info={sub:user.subject,email:user.username+'@central.invalid',email_verified:true};
  const provider=createDriveProvider({fetcher,token,expiresAt,info,loadCatalog});
  // Verify administrator-configured root before reading ANY profile or collection.
  let boot;
  try{
  const root=await provider.findRoot(user.subject);
  if(root.id!==user.rootId){provider.close();throw Error('Raiz divergente');}
  const scoped={...provider,findRoot:async subject=>{if(subject!==user.subject)throw Error('Conta divergente');return root}};
  boot=createBootstrap({catalogs:CATALOGS,provider:scoped});
   const profile=await boot.open(info);
   const [events,discursive,uploadedImages]=await Promise.all([provider.readReviewEvents(user.subject),provider.readDiscursive(user.subject),provider.readUploadedImages(user.subject)]);
   const view=projectRuntime({info,profile,events,discursive,uploadedImages});
   return runtime?view:{catalog:view.catalog,counts:view.counts};
  }finally{boot?.lock();provider.close()}
 };
}
