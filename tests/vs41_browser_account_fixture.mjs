import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {card} from './vs41_private_fixture.mjs';
const fm='application/vnd.google-apps.folder';
export function fixture(account,{foreign=false,duplicatePointer=false}={}){
 const root='root'+account,snap='snapshot'+account,ptr='pointer'+account,study='study'+account,files=new Map(),content=new Map();
 function add(id,name,mimeType,parents,data,extra={}){
  const bytes=data===undefined?null:JSON.stringify(data);
  files.set(id,{id,name,mimeType,parents,ownedByMe:true,shared:false,trashed:false,version:'1',...(bytes?{size:String(Buffer.byteLength(bytes))}:{}),...extra});
  if(bytes)content.set(id,bytes);
 }
 add(root,'DataBase_Concurso',fm,[],undefined,{ownedByMe:!foreign});
 const snapshot={format:'BancoMestrePrivadoV159',schema_version:1,version:'TESTE-'+account,counts:{cards:1},cards:[card(account)]};
 add(snap,'snapshot.json','application/json',[root],snapshot);
 add(ptr,'BANCO_MESTRE_ATUAL.json','application/json',[root],{schema:'banco-mestre-operational-pointer/1',private_base:{file_id:snap,version:snapshot.version,sha256:createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'),cards:1}});
 add(study,'BancoMestre_Controle_Estudos_V245.json','application/json',[root],{format:'BancoMestreControleDriveV245',data:{schema:1,subjects:[{id:'disc'+account,name:'Disciplina '+account,color:'#123456'}],sessions:[],reviews:[],cycle:[],plans:[],audit:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60}});
 return async(url,opt)=>{
  assert.equal(opt.method,'GET');assert.equal(opt.headers.Authorization,'Bearer '+account);
  const u=new URL(url),q=u.searchParams.get('q')||'';
  if(u.pathname.endsWith('/about'))return Response.json({user:{permissionId:'owner'+account}});
  if(u.pathname.endsWith('/files')){
   let result=[];
   if(q.includes("name = 'DataBase_Concurso'"))result=[files.get(root)];
   else if(q.includes("name = 'BANCO_MESTRE_ATUAL.json'"))result=duplicatePointer?[files.get(ptr),{...files.get(ptr),id:'duplicate'}]:[files.get(ptr)];
   else if(q.includes('bm_controle_estudos_v245'))result=[files.get(study)];
   else if(q.includes("'"+root+"' in parents"))result=[...files.values()].filter(f=>f.parents.includes(root));
   return Response.json({files:result});
  }
  const id=u.pathname.split('/').at(-1);
  if(!files.has(id))return new Response(null,{status:403});
  if(u.searchParams.has('alt'))return new Response(content.get(id));
  return Response.json(files.get(id));
 };
}
