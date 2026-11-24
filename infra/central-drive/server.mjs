import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {MediaNotFound} from './media.mjs';
import {DiscursiveRejected,DiscursiveUncertain,validDiscursiveInput,validDiscursiveCommit} from './discursive.mjs';
import {ReviewRejected,ReviewUncertain,validReviewInput,validCommitInput} from './reviews.mjs';
import {IMAGE_MIMES,IMAGE_LIMIT} from '../../assets/multiaccount-images-v001.mjs';
import {PDF_LIMIT} from './media.mjs';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {createAuth,parseUsers,sessionToken,sessionCookie} from './auth.mjs';
import {createOwnerLoader,ownerToken} from './owner-drive.mjs';
const htmlPath=new URL('./login.html',import.meta.url);
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src blob:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const context=token=>createHash('sha256').update('bm-context-v1:'+token).digest('hex');
function send(res,status,value,extra={}){res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(value))}
async function body(req,limit=4096){if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw Error('Formato');let size=0,parts=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw Error('Limite');parts.push(chunk)}return JSON.parse(Buffer.concat(parts).toString('utf8'))}
export function createCentralHandler({auth,loadProfile,origin}){
 if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin))throw Error('Origem HTTPS obrigatória');
 let mediaBusy=0;
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
   if(method==='POST'&&(path==='/api/review/prepare'||path==='/api/review/commit')){
    const s=auth.read(token);if(!s)return send(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==context(token))return send(res,403,{error:'Contexto de sessão divergente'});
    let input;try{input=await body(req)}catch{return send(res,400,{error:'Solicitação inválida'})}
    const kind=path.endsWith('/prepare')?'prepare':'commit';if(!(kind==='prepare'?validReviewInput(input):validCommitInput(input)))return send(res,400,{error:'Avaliação inválida'});
    try{const result=await loadProfile(s.user,{review:{kind,input},guard:()=>!!auth.read(token)});if(!auth.read(token))return send(res,401,{error:'Sessão encerrada'});return send(res,200,result)}catch(e){if(e instanceof ReviewRejected)return send(res,409,{error:e.message});if(e instanceof ReviewUncertain)return send(res,503,{error:e.message});throw e}
   }
   if((method==='POST'&&(path==='/api/discursive/prepare'||path==='/api/discursive/commit'))||(method==='GET'&&path==='/api/discursive/pending')){
    const s=auth.read(token);if(!s)return send(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==context(token))return send(res,403,{error:'Contexto de sessão divergente'});
    const kind=path.split('/').pop();let input=null;
    if(kind!=='pending'){try{input=await body(req,512000)}catch{return send(res,400,{error:'Solicitação inválida'})}if(!(kind==='prepare'?validDiscursiveInput(input):validDiscursiveCommit(input)))return send(res,400,{error:'Tentativa inválida'})}
    try{const result=await loadProfile(s.user,{attempt:{kind,input},guard:()=>!!auth.read(token)});if(!auth.read(token))return send(res,401,{error:'Sessão encerrada'});return send(res,200,result)}catch(e){if(e instanceof DiscursiveRejected)return send(res,409,{error:e.message});if(e instanceof DiscursiveUncertain)return send(res,503,{error:e.message});throw e}
   }
   const match=method==='GET'&&path.match(/^\/api\/media\/(image|pdf)\/([A-Za-z0-9_-]{1,160})$/);
   if(match){
    const s=auth.read(token);if(!s)return send(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==context(token))return send(res,403,{error:'Contexto de sessão divergente'});
    if(mediaBusy>=3)return send(res,429,{error:'Leituras ocupadas'});mediaBusy++;
    try{
     const {blob,filename}=await loadProfile(s.user,{media:{kind:match[1],id:match[2]}});
     const allowed=match[1]==='pdf'?blob?.type==='application/pdf'&&blob.size<=PDF_LIMIT:IMAGE_MIMES.includes(blob?.type)&&blob.size<=IMAGE_LIMIT;
     if(!allowed||!blob.size)throw Error('Arquivo inválido');const bytes=Buffer.from(await blob.arrayBuffer());
     if(!auth.read(token))return send(res,401,{error:'Sessão encerrada'});
     const name=String(filename||'arquivo').replace(/[\\/\x00-\x1f\x7f]/g,'_').slice(0,180);let encoded;try{encoded=encodeURIComponent(name).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16))}catch{encoded='arquivo'}
     res.writeHead(200,{...headers,'Content-Security-Policy':"sandbox; default-src 'none'; frame-ancestors 'none'",'Content-Type':blob.type,'Content-Disposition':"attachment; filename=arquivo; filename*=UTF-8''"+encoded,'Content-Length':bytes.length});
     res.end(bytes);return;
    }catch(e){if(e instanceof MediaNotFound)return send(res,404,{error:'Arquivo não disponível no perfil'});throw e}finally{mediaBusy--}
   }
   if(method==='GET'&&path==='/api/session'){const s=auth.read(token);return s?send(res,200,{username:s.user.username,context:context(token)}):send(res,401,{error:'Sessão encerrada'});}
   if(method==='GET'&&(path==='/api/profile'||path==='/api/runtime')){
    const s=auth.read(token);if(!s)return send(res,401,{error:'Sessão encerrada'});
    const summary=await loadProfile(s.user,{runtime:path==='/api/runtime'});if(!auth.read(token))return send(res,401,{error:'Sessão encerrada'});
    return send(res,200,{username:s.user.username,...summary,context:context(token)});
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
