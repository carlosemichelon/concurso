import {ownerToken} from './oauth.mjs';import {runDriveSmoke} from './drive-smoke.mjs';
try{const e=process.env,getToken=ownerToken({clientId:e.BM_GOOGLE_CLIENT_ID,clientSecret:e.BM_GOOGLE_CLIENT_SECRET,refreshToken:e.BM_GOOGLE_REFRESH_TOKEN});
 const result=await runDriveSmoke({getToken});console.log(JSON.stringify(result));if(!result.ok)process.exitCode=1;
}catch{console.error(JSON.stringify({ok:false,error:'OAuth próprio do aplicativo não configurado ou indisponível.'}));process.exitCode=1}
