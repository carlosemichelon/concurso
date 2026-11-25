import {createHash} from 'node:crypto';
export const project='bm-portal-multi-v1';
export const card=label=>{
 const front='Pergunta privada '+label,back='Resposta privada '+label,expl='Explicação privada '+label;
 const titles=['Recuperação ativa','Resposta-modelo','Fundamento e fontes','Mecanismo','Fórmulas e unidades','Comparação','Aplicação e transferência','Cobertura cruzada','Condições e exceções','Pegadinhas','Macete e histórico'];
 const modules=titles.map((titulo,i)=>({ord:i+1,titulo,texto:i===0?front:i===1?back:'Módulo experimental '+(i+1)+' do perfil '+label}));
 const profile={id:'CARD-9901',title:'Cartão experimental '+label,front,back,source:'Fonte fictícia '+label,mnemonic:'Macete experimental '+label,satellites:[],modules,related_card_ids:[],related_question_ids:[],editorial:{status:'TESTE',answer_paragraphs:[back],highlights:[],formulas:[],media:[],table:null,history_collapsed:true,reveal_after_attempt:true}};
 return {id:'CARD-9901',front,back,expl,active:true,discipline:'Teste',group:'OUTROS',subject:'Teste',sub:'Teste',related_card_ids:[],consolidation:{primary_id:'CARD-9901',historical_ids:['CARD-9901'],profile}};
};
export const profiles=Object.fromEntries(['A','B'].map(s=>[s,{subject:s,rootId:'root'+s,profileId:'profile'+s,sessionId:'s'+s}]));
export function fixture(){const files=new Map(),requests=[];for(const s of ['A','B'])for(const kind of ['root','profile','cards']){
 const id=kind+s;files.set(id,{meta:{id,mimeType:kind==='root'?'application/vnd.google-apps.folder':'application/json',ownedByMe:true,shared:false,trashed:false,parents:kind==='root'?[]:['root'+s],appProperties:{bmProject:project,bmOwner:s,bmKind:kind},size:'200',version:'1'},payload:kind==='profile'?{schema:'BM-PORTAL-PROFILE/1',project,owner:s,catalog:'private-only',collections:{cards:'cards'+s}}:{schema:'BM-PORTAL-COLLECTION/1',project,owner:s,kind:'cards',records:[card(s)]}})}
 return {files,requests,getToken:async()=>({token:'fixture'}),fetcher:async(url,opts)=>{const u=new URL(url),id=u.pathname.split('/').pop(),f=files.get(id);requests.push({id,media:u.searchParams.has('alt')});if(opts.headers.Authorization!=='Bearer fixture'||opts.redirect!=='error')throw Error('Credencial de teste inválida');return f?Response.json(u.searchParams.has('alt')?f.payload:f.meta):new Response(null,{status:404})}};
}

export function reviewFixture(){
 const f=fixture();let serial=0;const writes=[];
 const fetcher=async(url,opts)=>{
  const u=new URL(url),method=opts.method||'GET';
  if(opts.headers.Authorization!=='Bearer fixture'||opts.redirect!=='error')throw Error('Credencial de teste inválida');
  if(method==='POST'){const parts=opts.body.split('\r\n'),m=JSON.parse(parts[3]),payload=JSON.parse(parts[7]),id='event'+(++serial);writes.push({id,parent:m.parents[0],payload});f.files.set(id,{meta:{...m,id,ownedByMe:true,shared:false,trashed:false,size:'1000',version:'1'},payload});return Response.json({id})}
  if(u.pathname==='/drive/v3/files'){const q=u.searchParams.get('q'),parent=q.match(/^'([^']+)' in parents/)[1],event=q.match(/key='bmEvent' and value='([^']+)'/)?.[1];return Response.json({files:[...f.files.values()].filter(x=>x.meta.parents?.includes(parent)&&x.meta.appProperties?.bmKind==='srs-event'&&(!event||x.meta.appProperties.bmEvent===event)).map(x=>({id:x.meta.id}))})}
  return f.fetcher(url,opts);
 };
 return {...f,fetcher,writes};
}

export function mediaFixture(base){
 const f=base||reviewFixture(),original=f.fetcher;
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOioAAAAASUVORK5CYII=','base64');
 for(const s of ['A','B']){
  const root='root'+s,manifest='media'+s,records=[];
  f.files.get('profile'+s).payload.collections.media=manifest;
  f.files.get('cards'+s).payload.records[0].consolidation.profile.editorial.media.push({id:'IMG-TEST',role:'VERSO_APOS_TENTATIVA',caption:'Imagem privada '+s,private_original:true});
  for(const [id,mimeType,bytes] of [['IMG-TEST','image/png',png],['PDF-TEST','application/pdf',Buffer.from('%PDF-1.4\n% perfil '+s+'\n%%EOF')]]){
   const fileId=id+'-'+s,sha256=createHash('sha256').update(bytes).digest('hex');
   records.push({id,fileId,mimeType,sha256,title:'Material privado '+s,section:'Estudo',category:'PDF',card_ids:['CARD-9901']});
   f.files.set(fileId,{meta:{id:fileId,mimeType,ownedByMe:true,shared:false,trashed:false,parents:[root],size:String(bytes.length),appProperties:{bmProject:project,bmOwner:s,bmKind:'media-file',bmMedia:id}},bytes});
  }
  f.files.set(manifest,{meta:{id:manifest,mimeType:'application/json',ownedByMe:true,shared:false,trashed:false,parents:[root],size:'1000',version:'1',appProperties:{bmProject:project,bmOwner:s,bmKind:'media'}},payload:{schema:'BM-PORTAL-COLLECTION/1',project,owner:s,kind:'media',records}});
 }
 return {...f,fetcher:async(url,opts)=>{const u=new URL(url),id=u.pathname.split('/').pop(),file=f.files.get(id);if(file?.bytes&&u.searchParams.has('alt')){f.requests.push({id,media:true});return new Response(file.bytes,{headers:{'Content-Type':file.meta.mimeType}})}return original(url,opts)}};
}
