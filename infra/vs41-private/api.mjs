import {destinationOf,catalogDigest} from './chat-proposals.mjs';
import {createAuth,sessionToken,sessionCookie} from './auth.mjs';
import {createReader} from './catalog.mjs';
import {createStaticMediaReader} from './migration.mjs';
import {createReviewStore} from './srs.mjs';
import {createMediaReader,createPdfLibrary,createImageLibrary} from './media.mjs';
import {createStudyStore} from './study.mjs';
import {createGapStore} from './gaps.mjs';
import {createAnnotationStore} from './annotations.mjs';
const json=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin',...headers});res.end(JSON.stringify(data));return true};
async function body(req,max=4096){
 if(req.headers['content-type']?.split(';')[0]!=='application/json')throw Error('Formato inválido');
 let size=0,parts=[];for await(const b of req){size+=b.length;if(size>max)throw Error('Limite excedido');parts.push(b)}return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
export function createApi({users,origin,getToken,fetcher=fetch,now=Date.now}){
 if(new URL(origin).origin!==origin||(!origin.startsWith('https://')&&!/^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin)))throw Error('Origem inválida');
 const auth=createAuth({users,now});
 const resolveSession=async req=>{const token=sessionToken(req.headers.cookie),s=auth.read(token);return s?{subject:s.user.subject,rootId:s.user.rootId,profileId:s.user.profileId,sessionId:token,context:s.context}:null};
 const read=createReader({resolveSession,getToken,fetcher});
 const formulaRead=createReader({resolveSession,getToken,fetcher,includeFormula:true});
 const reviews=createReviewStore({resolveSession,getToken,fetcher,now});
 const readMedia=createMediaReader({resolveSession,getToken,fetcher});
 const readStaticMedia=createStaticMediaReader({resolveSession,getToken,fetcher});
 const pdfLibrary=createPdfLibrary({resolveSession,getToken,fetcher});
 const imageLibrary=createImageLibrary({resolveSession,getToken,fetcher});
 const annotations=createAnnotationStore({resolveSession,getToken,fetcher,now});
 const imageInk=createAnnotationStore({resolveSession,getToken,fetcher,now,mode:'image'});
 const gaps=createGapStore({resolveSession,getToken,fetcher,now});
 const study=createStudyStore({resolveSession,getToken,fetcher,now});
 const handler=async(req,res)=>{
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
   // Read-only target descriptor. It is not a credential and grants no write permission.
   if(u.pathname==='/api/vs41/chat-destination'&&['GET','POST'].includes(req.method)){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    if(req.method==='POST'&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    let input;if(req.method==='POST'){try{input=await body(req)}catch{return json(res,400,{error:'Identificação inválida'})}}
    try{
     // Recheck Drive authorization, ownership, root, profile and collection using this student's token.
     const {records}=await read(req);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});
     const destination=destinationOf(s.user);
     if(req.method==='POST'&&(!input||input.schema!=='BM-CHAT-DESTINATION/1'||input.destination!==destination||Object.keys(input).some(k=>!['schema','destination','account'].includes(k))||input.account!==s.user.username))return json(res,409,{error:'Banco de destino divergente'});
     return json(res,200,{descriptor:{schema:'BM-CHAT-DESTINATION/1',destination,account:s.user.username},verified:true,writeAuthorized:false,base_sha256:catalogDigest(records),context:s.context});
    }catch{return json(res,503,{error:'Não foi possível verificar o banco de destino'})}
   }
   if(req.method==='GET'&&u.pathname==='/api/vs41/formulas'){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    try{const data=await formulaRead(req);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{formula:data.formula,context:s.context})}catch{return json(res,503,{error:'Guia privado indisponível'})}
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
   if(req.method==='GET'&&u.pathname==='/api/vs41/images'){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    try{const images=await imageLibrary(req);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{images,context:s.context})}
    catch{return json(res,503,{error:'Galeria privada indisponível'})}
   }
   if(req.method==='GET'&&u.pathname==='/api/vs41/pdfs'){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    try{const documents=await pdfLibrary(req);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{documents,context:s.context})}
    catch{return json(res,503,{error:'Biblioteca privada indisponível'})}
   }
   if(u.pathname==='/api/vs41/study'&&['GET','POST'].includes(req.method)){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    if(req.method==='POST'&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    let input;if(req.method==='POST'){try{input=await body(req,262144)}catch{return json(res,400,{error:'Solicitação inválida'})}}
    try{const data=req.method==='GET'?await study.get(req):await study.save(req,input);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{...data,context:s.context})}
    catch(e){return json(res,e.code==='conflict'?409:e.code==='input'?400:503,{error:'Controle privado não confirmado'})}
   }
   if(u.pathname==='/api/vs41/gaps'&&['GET','POST'].includes(req.method)){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    if(req.method==='POST'&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    let input;if(req.method==='POST'){try{input=await body(req,262144)}catch{return json(res,400,{error:'Solicitação inválida'})}}
    try{const data=req.method==='GET'?await gaps.get(req):await gaps.save(req,input);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{...data,context:s.context})}
    catch(e){return json(res,e.code==='conflict'?409:e.code==='input'?400:503,{error:'Lacunas privadas não confirmadas'})}
   }
   const imagePath=u.pathname.match(/^\/api\/vs41\/image-ink\/([A-Za-z0-9_-]{1,160})$/);
   if(imagePath&&['GET','POST'].includes(req.method)){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    if(req.method==='POST'&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    let input;if(req.method==='POST'){try{input=await body(req,262144)}catch{return json(res,400,{error:'Solicitação inválida'})}}
    try{const args=[req,imagePath[1],1],data=req.method==='GET'?await imageInk.get(...args):await imageInk.save(...args,input);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{...data,context:s.context})}
    catch(e){return json(res,e.code==='conflict'?409:e.code==='input'?400:503,{error:'Marcações privadas não confirmadas'})}
   }
   const annotationPath=u.pathname.match(/^\/api\/vs41\/annotations\/([A-Za-z0-9_-]{1,160})\/([1-9][0-9]{0,5})$/);
   if(annotationPath&&['GET','POST'].includes(req.method)){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    if(req.method==='POST'&&req.headers.origin!==origin)return json(res,403,{error:'Origem não autorizada'});
    let input;if(req.method==='POST'){try{input=await body(req,262144)}catch{return json(res,400,{error:'Solicitação inválida'})}}
    try{const args=[req,annotationPath[1],Number(annotationPath[2])],data=req.method==='GET'?await annotations.get(...args):await annotations.save(...args,input);
     if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});return json(res,200,{...data,context:s.context})}
    catch(e){return json(res,e.code==='conflict'?409:e.code==='input'?400:503,{error:'Grifos privados não confirmados'})}
   }
   const mediaPath=u.pathname.match(/^\/api\/vs41\/(media|static-media)\/((?:CARD-\d{4,12}|PROP-IJUI-\d{3}|TRT0[12]-C\d{3}))\/([A-Za-z0-9_-]{1,160})$/);
   if(req.method==='GET'&&mediaPath){
    const s=auth.read(token);if(!s)return json(res,401,{error:'Sessão encerrada'});
    if(req.headers['x-bm-context']!==s.context)return json(res,409,{error:'Sessão alterada'});
    try{const m=await (mediaPath[1]==='static-media'?readStaticMedia:readMedia)(req,mediaPath[2],mediaPath[3]);if(auth.read(token)!==s)return json(res,401,{error:'Sessão encerrada'});
     res.writeHead(200,{'Content-Type':m.mimeType,'Content-Length':m.bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','Content-Disposition':['application/pdf','image/svg+xml'].includes(m.mimeType)?'attachment':'inline','Content-Security-Policy':"default-src 'none'; sandbox",'X-BM-Context':s.context,'X-BM-SHA256':m.sha256});res.end(m.bytes);return true;
    }catch{return json(res,404,{error:'Mídia privada indisponível'})}
   }
   return json(res,404,{error:'Rota indisponível'});
  }catch{return json(res,500,{error:'Operação indisponível'})}
 }; Object.defineProperty(handler,'authenticated',{value:req=>!!auth.read(sessionToken(req.headers.cookie))});
 return handler;
}
