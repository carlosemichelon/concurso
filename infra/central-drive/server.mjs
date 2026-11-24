import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {createAuth,parseUsers,sessionToken,sessionCookie} from './auth.mjs';
import {createOwnerLoader,ownerToken} from './owner-drive.mjs';
const htmlPath=new URL('./login.html',import.meta.url);
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
function send(res,status,value,extra={}){res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(value))}
async function body(req){if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw Error('Formato');let size=0,parts=[];for await(const chunk of req){size+=chunk.length;if(size>4096)throw Error('Limite');parts.push(chunk)}return JSON.parse(Buffer.concat(parts).toString('utf8'))}
export function createCentralHandler({auth,loadProfile,origin}){
 if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin))throw Error('Origem HTTPS obrigatória');
 return async(req,res)=>{
  try{
   const path=req.url,method=req.method,token=sessionToken(req.headers.cookie);
   if(method==='GET'&&(path==='/'||path==='/login.js')){
    const isHtml=path==='/';const bytes=await readFile(isHtml?htmlPath:new URL('./login.js',import.meta.url));res.writeHead(200,{...headers,'Content-Type':isHtml?'text/html; charset=utf-8':'text/javascript; charset=utf-8'});res.end(bytes);return;
   }
   if(method==='POST'&&req.headers.origin!==origin)return send(res,403,{error:'Origem não autorizada'});
   if(method==='POST'&&path==='/api/login'){
    let input;try{input=await body(req)}catch{return send(res,400,{error:'Solicitação inválida'})}
    if(!input||Object.keys(input).some(k=>!['username','password'].includes(k)))return send(res,400,{error:'Solicitação inválida'});
    const s=await auth.login(input.username,input.password,req.socket.remoteAddress||'unknown',token);
    if(!s)return send(res,401,{error:'Credenciais inválidas ou limite de tentativas atingido'});
    try{const summary=await loadProfile(s.user);if(!auth.read(s.token))throw Error('Sessão expirada');return send(res,200,{username:s.user.username,...summary},{'Set-Cookie':sessionCookie(s.token,Math.max(0,Math.floor((s.expires-Date.now())/1000)))})}
    catch{auth.revoke(s.token);return send(res,503,{error:'Perfil ainda não preparado ou indisponível'},{'Set-Cookie':sessionCookie('',0)})}
   }
   if(method==='POST'&&path==='/api/logout'){auth.revoke(token);return send(res,200,{ok:true},{'Set-Cookie':sessionCookie('',0)})}
   if(method==='GET'&&path==='/api/session'){const s=auth.read(token);return s?send(res,200,{username:s.user.username}):send(res,401,{error:'Sessão encerrada'});}
   if(method==='GET'&&(path==='/api/profile'||path==='/api/runtime')){
    const s=auth.read(token);if(!s)return send(res,401,{error:'Sessão encerrada'});
    const summary=await loadProfile(s.user,{runtime:path==='/api/runtime'});if(!auth.read(token))return send(res,401,{error:'Sessão encerrada'});
    return send(res,200,{username:s.user.username,...summary});
   }
   return send(res,404,{error:'Rota não disponível'});
  }catch{if(!res.headersSent)send(res,503,{error:'Serviço indisponível'});else res.end()}
 };
}
export function start(env=process.env){
 const users=parseUsers(env.BM_USERS_JSON);const auth=createAuth({users});
 const getToken=ownerToken({clientId:env.BM_GOOGLE_CLIENT_ID,clientSecret:env.BM_GOOGLE_CLIENT_SECRET,refreshToken:env.BM_GOOGLE_REFRESH_TOKEN});
 const handler=createCentralHandler({auth,loadProfile:createOwnerLoader({getToken}),origin:env.BM_ORIGIN});
 const server=createServer(handler);server.requestTimeout=30000;server.headersTimeout=15000;server.listen(Number(env.PORT||8080),'0.0.0.0');return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)start();
