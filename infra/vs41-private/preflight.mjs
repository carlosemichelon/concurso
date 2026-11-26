import {createReader} from './catalog.mjs';import {parseUsers} from './auth.mjs';import {accountTokens,verifyDriveIsolation} from './oauth.mjs';
// Read-only check: do not expose IDs, credentials, names or card text.
try{
 const env=process.env,users=parseUsers(env.BM_USERS_JSON||'[]');
 if(users.size!==2)throw Error('Dois perfis de teste são necessários');
 const getToken=accountTokens({users,grants:JSON.parse(env.BM_GOOGLE_GRANTS_JSON||'[]'),clientId:env.BM_GOOGLE_CLIENT_ID,clientSecret:env.BM_GOOGLE_CLIENT_SECRET});
 const read=createReader({getToken,resolveSession:async req=>req});
 const sessions=[...users.values()].map(u=>({subject:u.subject,rootId:u.rootId,profileId:u.profileId,sessionId:'preflight'}));
 const results=await Promise.all(sessions.map(async s=>(await read(s)).records.length));
 if(results.some(n=>n<1))throw Error('Cada perfil deve conter ao menos um cartão de teste');
 const isolation=await verifyDriveIsolation({sessions,getToken});
 console.log(JSON.stringify({ready:true,profiles:results.length,cardCounts:results,...isolation,mode:'read-only'}));
}catch{console.error(JSON.stringify({ready:false,reason:'Confira configuração privada OAuth, duas raízes, manifestos e coleções de teste autorizadas.'}));process.exitCode=1}
