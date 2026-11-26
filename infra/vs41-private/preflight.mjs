import {createReader} from './catalog.mjs';import {parseUsers} from './auth.mjs';import {accountTokens,verifyDriveIsolation} from './oauth.mjs';
// Read-only check: do not expose IDs, credentials, names or card text.
try{
 const env=process.env,users=parseUsers(env.BM_USERS_JSON||'[]');
 if(![1,2].includes(users.size))throw Error('Configure uma ou duas contas de teste');
 const getToken=accountTokens({users,grants:JSON.parse(env.BM_GOOGLE_GRANTS_JSON||'[]'),clientId:env.BM_GOOGLE_CLIENT_ID,clientSecret:env.BM_GOOGLE_CLIENT_SECRET});
 const read=createReader({getToken,resolveSession:async req=>req});
 const sessions=[...users.values()].map(u=>({subject:u.subject,rootId:u.rootId,profileId:u.profileId,sessionId:'preflight'}));
 const results=await Promise.all(sessions.map(async s=>(await read(s)).records.length));
 if(results.some(n=>n<1))throw Error('Cada perfil deve conter ao menos um cartão de teste');
 const isolation=sessions.length===2?await verifyDriveIsolation({sessions,getToken}):{crossAccessDenied:null,crossChecks:0};
 console.log(JSON.stringify({ready:true,profiles:results.length,cardCounts:results,...isolation,multiuserVerified:sessions.length===2&&isolation.crossAccessDenied===true,mode:'read-only'}));
}catch{console.error(JSON.stringify({ready:false,reason:'Confira configuração privada OAuth, raiz, manifesto e coleção de teste de cada conta autorizada.'}));process.exitCode=1}
