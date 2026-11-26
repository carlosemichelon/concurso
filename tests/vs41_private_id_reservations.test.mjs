import {test} from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {planReservation} from '../infra/vs41-private/id-reservations.mjs';
import {preparePromotion} from '../infra/vs41-private/promotion-plan.mjs';
import {createPromotionStaging} from '../infra/vs41-private/promotion-staging.mjs';
import {createActivation} from '../infra/vs41-private/activation.mjs';
import {reviewFixture} from './vs41_private_fixture.mjs';
import {destinationOf,catalogDigest} from '../infra/vs41-private/chat-proposals.mjs';
import {card,profiles} from './vs41_private_fixture.mjs';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function setup(s='A'){
 const session=profiles[s],records=[card(s)],c=records[0];c.consolidation.historical_ids.push('CARD-9900');
 const registry={schema:'BM-PRIVATE-ID-REGISTRY/1',destination:destinationOf(session),catalog_sha256:catalogDigest(records),revision:1,occupied_ids:['CARD-9900','CARD-9901','CARD-9902'],retired_ids:['CARD-9902'],allocatable_ids:['CARD-9904','CARD-9903'],reservations:[]};
 const front='Novo conteúdo',back='Resposta completa',p={key:'QUESTION-1',operation:'new',target_id:null,front,back,source:'Fonte',modules:c.consolidation.profile.modules.map((m,i)=>({...m,texto:i===0?front:i===1?back:m.texto})),related_card_ids:[],title:'Título',mnemonic:'Macete',classification:{discipline:c.discipline,group:c.group,subject:c.subject,sub:c.sub},editorial:{answer_paragraphs:[back],highlights:[],formulas:[],table:null}};
 const input={schema:'BM-CHAT-PROPOSALS/2',destination:destinationOf(session),base_sha256:catalogDigest(records),batch_id:'12345678-1234-4234-8234-000000000001',proposals:[p]};
 return {session,records,registry,input,expectedRegistrySha256:digest(registry)};
}
test('planeja pelo conjunto privado explícito, preserva IDs e repete mapa sem gravar',()=>{
 const f=setup(),before=JSON.stringify(f),r=planReservation(f);
 assert.equal(r.assignments[0].id,'CARD-9904');assert.equal(r.persisted,false);assert.equal(r.readyToPromote,false);assert.equal(r.registryCandidate.revision,2);assert.equal(JSON.stringify(f),before);
 const again=planReservation({...f,registry:r.registryCandidate,expectedRegistrySha256:r.proposed_registry_sha256});
 assert.deepEqual(again.assignments,r.assignments);assert.equal(again.registryCandidate.revision,2);
 const altered=structuredClone(f.input);altered.proposals[0].title='Outro';assert.throws(()=>planReservation({...f,input:altered,registry:r.registryCandidate,expectedRegistrySha256:r.proposed_registry_sha256}),e=>e.code==='conflict');
});
test('bloqueia registro público, histórico omitido, colisões, versão divergente e outro estudante',()=>{
 const f=setup();const mutate=(fn,code)=>{const r=structuredClone(f.registry);fn(r);assert.throws(()=>planReservation({...f,registry:r,expectedRegistrySha256:digest(r)}),e=>e.code===code)};
 mutate(r=>r.schema='PUBLIC_ONLY_NOT_PRIVATE_RESERVATION_REGISTRY','registry');
 mutate(r=>r.occupied_ids=r.occupied_ids.filter(x=>x!=='CARD-9900'),'coverage');
 mutate(r=>r.allocatable_ids.push('CARD-9902'),'registry');
 mutate(r=>r.allocatable_ids=[],'exhausted');
 assert.throws(()=>planReservation({...f,expectedRegistrySha256:'0'.repeat(64)}),e=>e.code==='registry');
 assert.throws(()=>planReservation({...f,session:profiles.B}),e=>e.code==='registry');
});
test('evolução mantém ID e não consome reserva',()=>{
 const f=setup(),p=f.input.proposals[0];p.operation='evolve';p.target_id='CARD-9901';
 const r=planReservation(f);assert.equal(r.assignments[0].id,p.target_id);assert.equal(r.registryCandidate.revision,1);assert.equal(r.registryCandidate.reservations.length,0);
});

test('monta catálogo candidato com ID planejado e reciprocidade sem mutar a base',()=>{
 const f=setup(),p=f.input.proposals[0];p.related_card_ids=['CARD-9901'];
 const before=JSON.stringify(f),r=preparePromotion(f),b=r.bundle,n=b.records.find(c=>c.id==='CARD-9904'),old=b.records.find(c=>c.id==='CARD-9901');
 assert.equal(n.consolidation.primary_id,n.id);assert.equal(n.consolidation.profile.id,n.id);assert.deepEqual(n.consolidation.historical_ids,[n.id]);
 assert.deepEqual(n.related_card_ids,['CARD-9901']);assert.deepEqual(old.related_card_ids,[n.id]);assert.deepEqual(old.consolidation.profile.related_card_ids,[n.id]);
 assert.equal(b.history.length,1);assert.deepEqual(b.history[0].record,f.records[0]);assert.equal(b.history[0].operation,'reciprocal-link');
 assert.equal(b.registry.catalog_sha256,catalogDigest(b.records));assert.equal(b.registry.revision,2);assert.equal(r.receipt.newCards,1);assert.equal(r.receipt.persisted,false);assert.equal(r.receipt.srsModified,false);assert.equal(JSON.stringify(f),before);assert.equal(preparePromotion(f).receipt.candidate_sha256,r.receipt.candidate_sha256);
});
test('evolução mantém ID, mídia, versão integral anterior e não consome reserva',()=>{
 const f=setup(),p=f.input.proposals[0],c=f.records[0];c.consolidation.original={back:'original'};c.consolidation.profile.editorial.media=[{id:'IMG-1',private_original:true}];
 f.input.base_sha256=catalogDigest(f.records);f.registry.catalog_sha256=f.input.base_sha256;f.expectedRegistrySha256=digest(f.registry);p.operation='evolve';p.target_id=c.id;
 const r=preparePromotion(f),n=r.bundle.records[0];assert.equal(n.id,c.id);assert.equal(n.back,p.back);assert.deepEqual(n.consolidation.original,c.consolidation.original);assert.deepEqual(n.consolidation.profile.editorial.media,c.consolidation.profile.editorial.media);
 assert.deepEqual(r.bundle.history[0].record,c);assert.equal(r.bundle.registry.reservations.length,0);assert.equal(r.bundle.registry.revision,2);assert.equal(r.receipt.newCards,0);
 p.related_card_ids=[c.id];assert.throws(()=>preparePromotion(f),e=>e.code==='self-link');
});

test('grava pacote candidato em arquivo único, confirma bytes e repete ticket sem duplicar',async()=>{
 const f=setup(),mock=reviewFixture(),files=mock.files;files.get('cardsA').payload.records=f.records;
 let writes=0,lost=true;const fetcher=async(url,opts={})=>{
  const u=new URL(url);
  if(u.pathname.endsWith('/generateIds'))return Response.json({ids:['generated-candidate-A']});
  if(u.hostname==='www.googleapis.com'&&u.pathname.startsWith('/upload/')){
   const parts=opts.body.split('\r\n'),m=JSON.parse(parts[3]),payload=JSON.parse(parts[7]);
   assert.equal(m.parents[0],'rootA');assert.equal(m.id,'generated-candidate-A');assert.equal(m.appProperties.bmKind,'promotion-candidate');
   if(files.has(m.id))return new Response(null,{status:409});
   writes++;files.set(m.id,{meta:{...m,ownedByMe:true,shared:false,trashed:false,size:String(Buffer.byteLength(JSON.stringify(payload))),version:'1'},payload});
   if(lost){lost=false;throw Error('resposta perdida')}return Response.json({id:m.id});
  }
  return mock.fetcher(url,opts);
 };
 const create=()=>createPromotionStaging({...mock,fetcher,resolveSession:async req=>profiles[req.session]});
 const req={session:'A'},ticket=await create().generate(req),expectedCandidateSha256=preparePromotion(f).receipt.candidate_sha256,arg={...f,ticket,expectedCandidateSha256},before=JSON.stringify(f.records);
 await assert.rejects(create().stage(req,arg),e=>e.code==='uncertain-retry-same-ticket');
 const r=await create().stage(req,arg);assert.equal(r.mode,'staged-not-active');assert.equal(r.persisted,true);assert.equal(r.readyToPromote,false);assert.equal(writes,1);
 assert.equal(JSON.stringify(files.get('cardsA').payload.records),before);assert.equal(files.get('profileA').payload.collections.cards,'cardsA');
 await assert.rejects(create().stage({session:'B'},arg),e=>e.code==='ticket');
 files.get(ticket.fileId).meta.shared=true;await assert.rejects(create().stage(req,arg),e=>e.code==='ownership');
 assert.equal(writes,1);
});

test('dois candidatos concorrentes disputam o mesmo slot; somente um registro é criado',async()=>{
 const f=setup(),mock=reviewFixture(),files=mock.files;files.get('cardsA').payload.records=f.records;
 const alt=structuredClone(f.input);alt.proposals[0].title='Segundo candidato';
 const a=preparePromotion(f),b=preparePromotion({...f,input:alt});
 const put=(id,kind,payload)=>files.set(id,{meta:{id,mimeType:'application/json',ownedByMe:true,shared:false,trashed:false,parents:['rootA'],appProperties:{bmProject:'bm-portal-multi-v1',bmOwner:'A',bmKind:kind,bmDigest:digest(payload)},size:String(Buffer.byteLength(JSON.stringify(payload))),version:'1'},payload});
 put('candidateA','promotion-candidate',a.bundle);put('candidateB','promotion-candidate',b.bundle);
 let writes=0,serial=0,allow=true;
 const fetcher=async(url,opts={})=>{
  const u=new URL(url);if(u.pathname.endsWith('/generateIds'))return Response.json({ids:['next-'+(++serial)]});
  if(u.pathname.startsWith('/upload/')){
   const parts=opts.body.split('\r\n'),m=JSON.parse(parts[3]),p=JSON.parse(parts[7]);assert.equal(m.id,'generation-slot');if(files.has(m.id))return new Response(null,{status:409});
   writes++;put(m.id,'activation-record',p);return Response.json({id:m.id});
  }return mock.fetcher(url,opts);
 };
 const generation={destination:destinationOf(profiles.A),generation:1,slotId:'generation-slot',catalog_sha256:catalogDigest(f.records),registry_sha256:f.expectedRegistrySha256};
 const make=()=>createActivation({...mock,fetcher,resolveSession:async req=>profiles[req.session],loadGeneration:async()=>generation,authorize:async(s,x)=>allow&&s.subject==='A'&&x.approvalId==='approved-'+x.fileId});
 const req={session:'A'},args=[{fileId:'candidateA',candidateSha256:a.receipt.candidate_sha256,approvalId:'approved-candidateA'},{fileId:'candidateB',candidateSha256:b.receipt.candidate_sha256,approvalId:'approved-candidateB'}];
 await assert.rejects(make().activate(req,{...args[0],approvalId:'no-approval'}),e=>e.code==='approval');
 const settled=await Promise.allSettled(args.map(x=>make().activate(req,x)));assert.equal(settled.filter(x=>x.status==='fulfilled').length,1);assert.equal(settled.filter(x=>x.status==='rejected')[0].reason.code,'conflict');assert.equal(writes,1);
 const winner=settled.findIndex(x=>x.status==='fulfilled');assert.equal((await make().activate(req,args[winner])).activeReaderUpdated,false);assert.equal(writes,1);
 assert.equal(files.get('profileA').payload.collections.cards,'cardsA');assert.equal(catalogDigest(files.get('cardsA').payload.records),generation.catalog_sha256);
 await assert.rejects(make().activate({session:'B'},args[winner]),e=>e.code==='generation');allow=false;await assert.rejects(make().activate(req,args[winner]),e=>e.code==='approval');
});
