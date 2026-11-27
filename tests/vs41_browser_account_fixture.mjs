import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {card} from './vs41_private_fixture.mjs';
const fm='application/vnd.google-apps.folder',STUDY_KIND='bm_controle_estudos_v245',GAP_KIND='bm_lacunas_v242',GRIF_KIND='bm_grifos_sync_v104_master';
export function fixture(account,{foreign=false,duplicatePointer=false,writable=false,writes=[],historical=false,historicalPointer=false,badHistoricalHash=false,indexEdgeCases=false,legacyFolderNames=false,duplicateReviewFolder=false,recovery=false,recoveryInvalid=false,driveCheckpoint=false,badLineage=false}={}){
 const root='root'+account,snap='snapshot'+account,ptr='pointer'+account,study='study'+account,files=new Map(),content=new Map();let serial=0;
 function add(id,name,mimeType,parents,data,extra={}){
  const bytes=data===undefined?null:JSON.stringify(data);
  files.set(id,{id,name,mimeType,parents,ownedByMe:true,shared:false,trashed:false,version:'1',...(bytes?{size:String(Buffer.byteLength(bytes))}:{}),...extra});
  if(bytes)content.set(id,bytes);
 }
 add(root,'DataBase_Concurso',fm,[],undefined,{ownedByMe:!foreign});
 const reviewsFolder='reviewsFolder'+account;add(reviewsFolder,legacyFolderNames?'05_REVISOES_SRS':'05 - Revisões',fm,[root]);if(duplicateReviewFolder)add('duplicateReviews'+account,legacyFolderNames?'05 - Revisões':'05_REVISOES_SRS',fm,[root]);
 const pdf='pdf'+account;
 function makePdf(){
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R >>','<< /Length 19 >>\nstream\n0 0 100 100 re S\nendstream'];
  let s='%PDF-1.4\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(s));s+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n'}
  const start=Buffer.byteLength(s);return s+'xref\n0 5\n0000000000 65535 f \n'+offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';
 }
 const bytes=makePdf();files.set(pdf,{id:pdf,name:'Material.pdf',mimeType:'application/pdf',parents:[root],ownedByMe:true,shared:false,trashed:false,version:'1',size:String(Buffer.byteLength(bytes))});content.set(pdf,bytes);
 const atlasFolder='atlasFolder'+account,otherFolder='otherFolder'+account;add(atlasFolder,'07 – Atlas de Imagens (sincronização)',fm,[root]);add(otherFolder,'MIDIAS_OTIMIZADAS',fm,[root]);
 const img='img'+account,png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XK1sAAAAASUVORK5CYII=','base64');
 files.set(img,{id:img,name:'Imagem.png',mimeType:'image/png',parents:[atlasFolder],ownedByMe:true,shared:false,trashed:false,version:'1',size:String(png.length)});content.set(img,png);
 const copy='optimized'+account;files.set(copy,{...files.get(img),id:copy,name:'Copia.png',parents:[otherFolder]});content.set(copy,png);
 const derived='derived'+account;files.set(derived,{...files.get(img),id:derived,name:'Miniatura.png',appProperties:{origin:'MINIATURA'}});content.set(derived,png);
 const svg='svg'+account;add(svg,'Original.svg','image/svg+xml',[atlasFolder],undefined,{size:'100',properties:{origin:'ORIGINAL_USUARIO'}});
 // Out-of-bank, shared and excluded folders must not enter the derived index.
 if(indexEdgeCases){
 const excluded='excluded'+account,outside='outside'+account,shared='shared'+account;
 add(excluded,legacyFolderNames?'09_EXPORTACOES':'09 - Backups',fm,[root]);add(outside,'Outra pasta',fm,[]);add(shared,'Compartilhada',fm,[root],undefined,{shared:true});
 for(const [id,parent] of [['backupPdf',excluded],['outsidePdf',outside],['sharedPdf',shared]])add(id+account,id+'.pdf','application/pdf',[parent],undefined,{size:'10'});
 }
 const docType='application/vnd.google-apps.document';
 add('method'+account,'00_METODOLOGIA_MESTRE_VIGENTE_VM20 — teste',docType,[root]);content.set('method'+account,'Metodologia integral '+account);
 add('guide'+account,'00_GUIA_OPERACIONAL_DE_ESTUDO — VM20',docType,[root]);content.set('guide'+account,'Guia integral '+account);
 const snapshot={format:'BancoMestrePrivadoV159',schema_version:1,version:'TESTE-'+account,counts:{cards:1},cards:[card(account)],srs:[{id:'CARD-9901',rating:'Bom',last_review_at:'2026-11-01',next_review:'2026-11-17'}],updated:'2026-11-01'};
 const delta='delta'+account;add(delta,'Delta de estudo e cartões aprovados',docType,[reviewsFolder]);content.set(delta,JSON.stringify({format:'BancoMestrePrivateStudyAgenda1',records:[{event_id:'agenda-'+account,id:'CARD-9901',date_local:'2026-11-20',rating:'Difícil',kind:'avaliacao_explicita',interval_days:8,due:'2026-11-28',method:'v015'}]}));
 if(historical){delete snapshot.srs;const old={format:'BancoMestrePrivadoV159',schema_version:1,version:'V193',updated:'2026-11-23',counts:{cards:1,srs_records:1},cards:[card(account)],srs:[{id:'CARD-9901',last_date:'Bom',grade:'2026-11-21',next_review:'2026-12-07'}]};add('history'+account,'BANCO_MESTRE_PRIVADO_V193_TESTE.json','application/json',[root],old);}
 if(historicalPointer){
  const old={format:'BancoMestrePrivadoV159',schema_version:1,version:'V180',updated:'2026-11-23',counts:{cards:1,srs_records:1},cards:[card(account)],srs:[{id:'CARD-9901',last_date:'2026-11-22',grade:'Bom',next_review:'2026-12-08'}]};
  const historicalId='historyPointerSource'+account;
  add(historicalId,'BANCO_MESTRE_PRIVADO_V180_PORTAO_VISUAL.json','application/json',[root],old);
  add('historicalPointer'+account,'00_FONTE_ATUAL_POR_FAMILIA_V017_V180.json','application/json',[root],{schema:'banco-mestre-operational-pointer/1',pointer_version:'V017',private_base:{file_id:historicalId,version:'V180',cards:1,sha256:badHistoricalHash?'0'.repeat(64):createHash('sha256').update(JSON.stringify(old)).digest('hex')}});
 }
 let privateData=snapshot;
 if(recovery){
  snapshot.counts.srs_records=1;
  const added={id:'CARD-9902',front:'Pergunta operacional',back:'Resposta operacional',expl:'Explicação operacional',group:'OUTROS',discipline:'Teste',subject:'Teste',sub:'Teste',active:true,related_card_ids:[]};
  const view={format:'BM-DRIVE-EDITORIAL-SEED/1',migration_status:'editorial-candidate-only',version:'VC-TESTE',source:{git_blob:'a'.repeat(40)},counts:{cards:2,active:2},cards:[card(account),added],retired_ids:[],redirects:{}};
  const viewId='recoveryView'+account;add(viewId,'editorial.json','application/json',[root],view);
  privateData={format:'BancoMestrePrivadoRecuperacaoV1',schema_version:1,status:'RECUPERACAO_PARCIAL',version:'RECUPERACAO-'+account,updated:snapshot.updated,private_source:{version:snapshot.version,sha256:'a'.repeat(64)},private_snapshot:snapshot,counts:{cards:1,historical_srs:1,visible_active:2,matched_private:1,operational_sources:1,historical_outside_view:0,verified_historical_due:1},recovery:{srs_complete:false,editorial_view:{file_id:viewId,version:view.version,sha256:createHash('sha256').update(JSON.stringify(view)).digest('hex'),cards:2,git_blob:view.source.git_blob},matched_private_ids:['CARD-9901'],operational_identities:[{id:added.id,group:added.group,discipline:added.discipline,subject:added.subject,sub:added.sub,scope:'ID_PUBLICADO_COM_MAPA_PRIVADO_DO_DELTA',source_key:added.id,source_file_id:'source'+account,source_sha256_local_export:'b'.repeat(64),srs_transfer:recoveryInvalid}],historical_outside_view_ids:[]}};
  if(driveCheckpoint){
   privateData.private_source.file_id='historical'+account;
   snapshot.version=privateData.version;snapshot.source_sha256='c'.repeat(64);
   const ref=privateData.recovery.editorial_view;
   privateData.recovery.previous_editorial_view={file_id:'previous'+account,version:'VC-TESTE',sha256:'d'.repeat(64),cards:2};
   view.version='VD-TESTE';view.source={base_version:'VC-TESTE',delta_document_id:'delta'+account,delta_sha256:'e'.repeat(64)};
   privateData.recovery.sources={delta:{file_id:'delta'+account,sha256_local_export:(badLineage?'f':'e').repeat(64)}};
   delete ref.git_blob;ref.version=view.version;ref.sha256=createHash('sha256').update(JSON.stringify(view)).digest('hex');
   add(viewId,'editorial.json','application/json',[root],view);
  }
 }
 add(snap,'snapshot.json','application/json',[root],privateData);
 add(ptr,'BANCO_MESTRE_ATUAL.json','application/json',[root],{schema:'banco-mestre-operational-pointer/1',...(recovery?{recovery_status:'RECUPERACAO_PARCIAL'}:{}),private_base:{file_id:snap,version:privateData.version,sha256:createHash('sha256').update(JSON.stringify(privateData)).digest('hex'),cards:1}});
 add(study,'BancoMestre_Controle_Estudos_V245.json','application/json',[root],{format:'BancoMestreControleDriveV245',data:{schema:1,subjects:[{id:'disc'+account,name:'Disciplina '+account,color:'#123456'}],sessions:[],reviews:[],cycle:[],plans:[],audit:[],cycleIndex:0,availabilityWeek:15,availabilityMonth:60}},{appProperties:{bm_kind:'bm_controle_estudos_v245',bm_schema:'V245'}});
 return async(url,opt)=>{
  assert.equal(opt.headers.Authorization,'Bearer '+account);
  const u=new URL(url),q=u.searchParams.get('q')||'';
  if(opt.method!=='GET'){
   assert.ok(writable,'Escrita não autorizada no teste');
   if(opt.method==='POST'){
    const parts=String(opt.body).split('\r\n'),m=JSON.parse(parts[3]),data=JSON.parse(parts[7]),id='new'+account+(++serial);
    add(id,m.name,m.mimeType,m.parents||[],data,{appProperties:m.appProperties});writes.push({account,method:'POST',id,name:m.name});return Response.json({id});
   }
   if(opt.method==='PATCH'){
    const id=u.pathname.split('/').at(-1),old=files.get(id);assert.ok([STUDY_KIND,GAP_KIND,GRIF_KIND,'bm_redacao_v296'].includes(old.appProperties?.bm_kind));const data=JSON.parse(opt.body);
    add(id,old.name,old.mimeType,old.parents,data,{appProperties:old.appProperties,version:String(Number(old.version)+1)});writes.push({account,method:'PATCH',id});return Response.json({id});
   }
   throw Error('Unexpected write');
  }
  if(u.pathname.endsWith('/about'))return Response.json({user:{permissionId:'owner'+account,displayName:'Estudante '+account,emailAddress:account.toLowerCase()+'@example.invalid'}});
  if(u.pathname.endsWith('/files')){
   let result=[];
   if(q.includes("name = 'DataBase_Concurso'"))result=[files.get(root)];
   else if(q.includes("name = 'BANCO_MESTRE_ATUAL.json'"))result=duplicatePointer?[files.get(ptr),{...files.get(ptr),id:'duplicate'}]:[files.get(ptr)];
   else if(q.includes("name = '05 - Revisões'")||q.includes("name = '05_REVISOES_SRS'"))result=[...files.values()].filter(f=>f.mimeType===fm&&f.parents.includes(root)&&q.includes("name = '"+f.name+"'"));
   else if(q.includes('bm_redacao_v296'))result=[...files.values()].filter(f=>f.parents.includes(reviewsFolder)&&f.appProperties?.bm_kind==='bm_redacao_v296');
   else if(q.includes('00_FONTE_ATUAL_POR_FAMILIA_V'))result=[...files.values()].filter(f=>f.name.startsWith('00_FONTE_ATUAL_POR_FAMILIA_V'));
   else if(q.includes('BANCO_MESTRE_PRIVADO_V'))result=[...files.values()].filter(f=>f.name.startsWith('BANCO_MESTRE_PRIVADO_V'));
   else if(q.includes('Delta de estudo e cartões aprovados'))result=[files.get(delta)];
   else if(q.includes("'"+reviewsFolder+"' in parents"))result=[...files.values()].filter(f=>f.parents.includes(reviewsFolder));
   else if(q.includes('bm_controle_estudos_v245'))result=[files.get(study)];
   else if(q.includes('00_METODOLOGIA_MESTRE_VIGENTE'))result=[files.get('method'+account)];
   else if(q.includes('00_GUIA_OPERACIONAL_DE_ESTUDO'))result=[files.get('guide'+account)];
   else if(q.includes('bm_image_ink_v1'))result=[...files.values()].filter(x=>x.appProperties?.bm_kind==='bm_image_ink_v1'&&(!q.includes('bm_image_key')||q.includes(x.appProperties.bm_image_key)));
   else if(q.includes('bm_grifos_sync_v104_master'))result=[...files.values()].filter(x=>x.appProperties?.bm_kind===GRIF_KIND);
   else if(q.includes('bm_lacunas_v242'))result=[...files.values()].filter(x=>x.appProperties?.bm_kind===GAP_KIND);
   else if(q.includes('BM_SRS_EVENT_V001_'))result=[...files.values()].filter(x=>x.name.startsWith('BM_SRS_EVENT_V001_'));
   else if(q.includes("mimeType contains 'image/'")&&!q.includes(' in parents'))result=[...files.values()].filter(f=>f.mimeType===fm||f.mimeType==='application/pdf'||f.mimeType.startsWith('image/'));
   else if(q.includes("'"+root+"' in parents"))result=[...files.values()].filter(f=>f.parents.includes(root));
   else if(q.includes("'"+atlasFolder+"' in parents"))result=[...files.values()].filter(f=>f.parents.includes(atlasFolder));
   else if(q.includes("'"+otherFolder+"' in parents"))result=[...files.values()].filter(f=>f.parents.includes(otherFolder));
   return Response.json({files:result});
  }
  if(u.pathname.endsWith('/export')){const id=u.pathname.split('/').at(-2);return files.has(id)?new Response(content.get(id)||'') : new Response(null,{status:403})}
  const id=u.pathname.split('/').at(-1);
  if(!files.has(id))return new Response(null,{status:403});
  if(u.searchParams.has('alt'))return new Response(content.get(id),{headers:{'Content-Type':files.get(id).mimeType}});
  return Response.json(files.get(id));
 };
}
