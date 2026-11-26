import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {card} from './vs41_private_fixture.mjs';
const fm='application/vnd.google-apps.folder',STUDY_KIND='bm_controle_estudos_v245',GAP_KIND='bm_lacunas_v242',GRIF_KIND='bm_grifos_sync_v104_master';
export function fixture(account,{foreign=false,duplicatePointer=false,writable=false,writes=[]}={}){
 const root='root'+account,snap='snapshot'+account,ptr='pointer'+account,study='study'+account,files=new Map(),content=new Map();let serial=0;
 function add(id,name,mimeType,parents,data,extra={}){
  const bytes=data===undefined?null:JSON.stringify(data);
  files.set(id,{id,name,mimeType,parents,ownedByMe:true,shared:false,trashed:false,version:'1',...(bytes?{size:String(Buffer.byteLength(bytes))}:{}),...extra});
  if(bytes)content.set(id,bytes);
 }
 add(root,'DataBase_Concurso',fm,[],undefined,{ownedByMe:!foreign});
 const pdf='pdf'+account;
 function makePdf(){
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R >>','<< /Length 19 >>\nstream\n0 0 100 100 re S\nendstream'];
  let s='%PDF-1.4\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(s));s+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n'}
  const start=Buffer.byteLength(s);return s+'xref\n0 5\n0000000000 65535 f \n'+offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';
 }
 const bytes=makePdf();files.set(pdf,{id:pdf,name:'Material.pdf',mimeType:'application/pdf',parents:[root],ownedByMe:true,shared:false,trashed:false,version:'1',size:String(Buffer.byteLength(bytes))});content.set(pdf,bytes);
 const img='img'+account,png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XK1sAAAAASUVORK5CYII=','base64');
 files.set(img,{id:img,name:'Imagem.png',mimeType:'image/png',parents:[root],ownedByMe:true,shared:false,trashed:false,version:'1',size:String(png.length)});content.set(img,png);
 const snapshot={format:'BancoMestrePrivadoV159',schema_version:1,version:'TESTE-'+account,counts:{cards:1},cards:[card(account)]};
 add(snap,'snapshot.json','application/json',[root],snapshot);
 add(ptr,'BANCO_MESTRE_ATUAL.json','application/json',[root],{schema:'banco-mestre-operational-pointer/1',private_base:{file_id:snap,version:snapshot.version,sha256:createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'),cards:1}});
 add(study,'BancoMestre_Controle_Estudos_V245.json','application/json',[root],{format:'BancoMestreControleDriveV245',data:{schema:1,subjects:[{id:'disc'+account,name:'Disciplina '+account,color:'#123456'}],sessions:[],reviews:[],cycle:[],plans:[],audit:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60}},{appProperties:{bm_kind:'bm_controle_estudos_v245',bm_schema:'V245'}});
 return async(url,opt)=>{
  assert.equal(opt.headers.Authorization,'Bearer '+account);
  const u=new URL(url),q=u.searchParams.get('q')||'';
  if(opt.method!=='GET'){
   assert.ok(writable,'Escrita não autorizada no teste');
   if(opt.method==='POST'){
    const parts=String(opt.body).split('\r\n'),m=JSON.parse(parts[3]),data=JSON.parse(parts[7]),id='new'+account+(++serial);
    add(id,m.name,m.mimeType,[],data,{appProperties:m.appProperties});writes.push({account,method:'POST',id,name:m.name});return Response.json({id});
   }
   if(opt.method==='PATCH'){
    const id=u.pathname.split('/').at(-1),old=files.get(id);assert.ok([STUDY_KIND,GAP_KIND,GRIF_KIND].includes(old.appProperties?.bm_kind));const data=JSON.parse(opt.body);
    add(id,old.name,old.mimeType,old.parents,data,{appProperties:old.appProperties,version:String(Number(old.version)+1)});writes.push({account,method:'PATCH',id});return Response.json({id});
   }
   throw Error('Unexpected write');
  }
  if(u.pathname.endsWith('/about'))return Response.json({user:{permissionId:'owner'+account,displayName:'Estudante '+account,emailAddress:account.toLowerCase()+'@example.invalid'}});
  if(u.pathname.endsWith('/files')){
   let result=[];
   if(q.includes("name = 'DataBase_Concurso'"))result=[files.get(root)];
   else if(q.includes("name = 'BANCO_MESTRE_ATUAL.json'"))result=duplicatePointer?[files.get(ptr),{...files.get(ptr),id:'duplicate'}]:[files.get(ptr)];
   else if(q.includes('bm_controle_estudos_v245'))result=[files.get(study)];
   else if(q.includes('bm_image_ink_v1'))result=[...files.values()].filter(x=>x.appProperties?.bm_kind==='bm_image_ink_v1'&&q.includes(x.appProperties.bm_image_key));
   else if(q.includes('bm_grifos_sync_v104_master'))result=[...files.values()].filter(x=>x.appProperties?.bm_kind===GRIF_KIND);
   else if(q.includes('bm_lacunas_v242'))result=[...files.values()].filter(x=>x.appProperties?.bm_kind===GAP_KIND);
   else if(q.includes('BM_SRS_EVENT_V001_'))result=[...files.values()].filter(x=>x.name.startsWith('BM_SRS_EVENT_V001_'));
   else if(q.includes("'"+root+"' in parents"))result=[...files.values()].filter(f=>f.parents.includes(root));
   return Response.json({files:result});
  }
  const id=u.pathname.split('/').at(-1);
  if(!files.has(id))return new Response(null,{status:403});
  if(u.searchParams.has('alt'))return new Response(content.get(id),{headers:{'Content-Type':files.get(id).mimeType}});
  return Response.json(files.get(id));
 };
}
