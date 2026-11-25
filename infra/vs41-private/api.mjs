import {createAuth,sessionToken,sessionCookie} from './auth.mjs';
import {createReader} from './catalog.mjs';
import {createReviewStore} from './srs.mjs';
const json=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin',...headers});res.end(JSON.stringify(data));return true};
async function body(req){
 if(req.headers['content-type']?.split(';')[0]!=='application/json')throw Error('Formato inválido');
 let size=0,parts=[];for await(const b of req){size+=b.length;if(size>4096)throw Error('Limite excedido');parts.push(b)}return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
export function createApi({users,origin,getToken,fetcher=fetch,now=Date.now}){
 if(new URL(origin).origin!==origin||(!origin.startsWith('https://')&&!/^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin)))throw Error('Origem inválida');
 const auth=createAuth({users,now});
 const resolveSession=async req=>{const token=sessionToken(req.headers.cookie),s=auth.read(token);return s?{subject:s.user.subject,rootId:s.user.rootId,profileId:s.user.profileId,sessionId:token}:null};
 const read=createReader({resolveSession,getToken,fetcher});
 const reviews=createReviewStore({resolveSession,getToken,fetcher,now});
 return async(req,res)=>{
  const u=new URL(req.url,origin);if(!u.pathname.startsWith('/api/vs41/'))return false;
  if(u.origin!==origin||u.search||req.headers['sec-fetch-site']==='cross-site'||req.headers.origin&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
  try{
   const token=sessionToken(req.headers.cookie);
   if(req.method==='POST'&&u.pathname==='/api/vs41/login'){
    if(req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    let data;try{data=await body(req)}catch{return json(res,400,{error:'Solicitação inválida'})}
    const s=await auth.login(data?.username,data?.password,req.socket.remoteAddress||'unknown',token);
    if(!s)return json(res,401,{error:'Acesso não autorizado'});
    return json(res,200,{ok:true},{'Set-Cookie':sessionCookie(s.token,Math.max(0,Math.floor((s.expires-now())/1000)))});
   }
   if(req.method==='POST'&&u.pathname==='/api/vs41/logout'){
    if(req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    auth.revoke(token);return json(res,200,{ok:true},{'Set-Cookie':sessionCookie('',0),'Clear-Site-Data':'"cache", "storage"'});
   }
   if(req.method==='GET'&&u.pathname==='/api/vs41/session'){
    const s=auth.read(token);return s?json(res,200,{context:s.context}):json(res,401,{error:'Sessão encerrada'});
   }
   if(req.method==='GET'&&u.pathname==='/api/vs41/private-cards'){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    try{const data=await read(req);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{...data,context:s.context})}catch{return json(res,503,{error:'Catálogo privado indisponível'})}
   }
   if(u.pathname==='/api/vs41/reviews'&&['GET','POST'].includes(req.method)){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    if(req.method==='POST'&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    let input;if(req.method==='POST'){try{input=await body(req)}catch{return json(res,400,{error:'Solicitação inválida'})}}
    try{const data=req.method==='GET'?{events:await reviews.read(req)}:{event:await reviews.record(req,input)};
     if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{...data,context:s.context})}
    catch(e){return json(res,['input','card','prerequisite'].includes(e.code)?400:e.code==='conflict'?409:503,{error:'Revisão privada não confirmada'})}
   }
   return json(res,404,{error:'Rota indisponível'});
  }catch{return json(res,500,{error:'Operação indisponível'})}
 };
}
