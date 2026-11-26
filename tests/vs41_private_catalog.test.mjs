import {test} from 'node:test';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {createReader,previewNativeDelta} from '../infra/vs41-private/catalog.mjs';import {fixture,profiles,card} from './vs41_private_fixture.mjs';
function setup(){const f=fixture();return {...f,read:createReader({...f,resolveSession:async req=>profiles[req.session]})}}
test('duas contas simultâneas, mesmo ID e conteúdos distintos',async()=>{const {read}=setup();const [a,b]=await Promise.all([read({session:'A'}),read({session:'B'})]);assert.equal(a.records[0].back,'Resposta privada A');assert.equal(b.records[0].back,'Resposta privada B')});
test('sem sessão: nenhuma leitura',async()=>{const {read,requests}=setup();await assert.rejects(read({session:'X'}));assert.equal(requests.length,0)});
test('referência cruzada bloqueada antes dos bytes',async()=>{const {read,files,requests}=setup();files.get('profileA').payload.collections.cards='cardsB';await assert.rejects(read({session:'A'}));assert.ok(!requests.some(x=>x.id==='cardsB'&&x.media))});
test('pasta compartilhada, proprietário errado, pai divergente',async()=>{for(const [id,k,v] of [['rootA','shared',true],['cardsA','ownedByMe',false],['cardsA','parents',['rootB']]]){const {read,files}=setup();files.get(id).meta[k]=v;await assert.rejects(read({session:'A'}))}});
test('conteúdo cruzado, IDs duplicados, catálogo público, vínculo órfão',async()=>{for(const change of [f=>f.get('cardsA').payload.owner='B',f=>f.get('cardsA').payload.records.push(card('B')),f=>f.get('profileA').payload.catalog='public',f=>f.get('cardsA').payload.records[0].related_card_ids=['CARD-9999']]){const {read,files}=setup();change(files);await assert.rejects(read({session:'A'}))}});
test('revogação durante leitura',async()=>{let n=0;const f=fixture(),read=createReader({...f,resolveSession:async()=>++n===1?profiles.A:null});await assert.rejects(read({}))});

test('MIME JSON com charset UTF-8 e rejeição de MIME incompatível',async()=>{const {read,files}=setup();files.get('profileA').meta.mimeType='application/json; charset=UTF-8';assert.equal((await read({session:'A'})).records.length,1);files.get('profileA').meta.mimeType='text/html';await assert.rejects(read({session:'A'}),e=>e.code==='profile-mime')});
test('diagnóstico distingue falha de mídia e bloqueio de proprietário',async()=>{const f=fixture(),read=createReader({...f,resolveSession:async()=>profiles.A,fetcher:async(url,opts)=>url.includes('profileA?alt=media')?new Response(null,{status:403}):f.fetcher(url,opts)});await assert.rejects(read({}),e=>e.code==='profile-media-http-403');const t=setup();t.files.get('profileA').meta.appProperties.bmOwner='B';await assert.rejects(t.read({session:'A'}),e=>e.code==='profile-owner')});

test('Drive real: versão global pode mudar ao ler, mas revisão e checksum do conteúdo ficam estáveis',async()=>{
 const f=fixture();let v=0;
 for(const kind of ['profile','cards'])Object.assign(f.files.get(kind+'A').meta,{headRevisionId:'rev-'+kind,md5Checksum:'0123456789abcdef0123456789abcdef'});
 const read=createReader({...f,resolveSession:async()=>profiles.A,fetcher:async(url,opts)=>{const id=new URL(url).pathname.split('/').pop();if(f.files.get(id)&&!url.includes('alt=media'))f.files.get(id).meta.version=String(++v);return f.fetcher(url,opts)}});
 assert.equal((await read({})).records[0].back,'Resposta privada A');
});
test('revisão de conteúdo divergente não pode ser aceita, mesmo com versão global igual',async()=>{
 const f=fixture();let n=0;const read=createReader({...f,resolveSession:async()=>profiles.A,fetcher:async(url,opts)=>{if(url.includes('profileA?fields='))f.files.get('profileA').meta.headRevisionId='rev-'+(++n);return f.fetcher(url,opts)}});
 await assert.rejects(read({}),e=>e.code==='profile-content-changed');assert.equal(n,6);
});
test('ausência de qualquer evidência de revisão bloqueia leitura',async()=>{const {read,files}=setup();delete files.get('profileA').meta.version;await assert.rejects(read({session:'A'}),e=>e.code==='profile-revision-unavailable')});

test('IDs legados reconhecidos e explicação ausente preservada, sem inventar campos',async()=>{
 const {read,files}=setup(),first={...card('A'),id:'PROP-IJUI-001',provisional:true,canonical:false},second={...card('A'),id:'TRT01-C001'};
 for(const c of [first,second]){delete c.expl;delete c.consolidation;}
 first.related_card_ids=[second.id];second.related_card_ids=[first.id];
 files.get('cardsA').payload.records=[first,second];
 assert.deepEqual((await read({session:'A'})).records,[first,second]);
 second.id='UNRECOGNIZED-001';first.related_card_ids=[second.id];await assert.rejects(read({session:'A'}),e=>e.code==='records-schema');
 second.id='CARD-9901';first.related_card_ids=[second.id];await assert.rejects(read({session:'A'}),e=>e.code==='records-schema');
});

test('leitura experimental do formato privado original pelo ponteiro existente, sem expor SRS ou questões',async()=>{
 const f=fixture(),{files}=f;
 for(const s of ['A','B']){
  const c=card(s);c.evolutive={layers:c.consolidation.profile.modules};delete c.consolidation;
  const payload={format:'BancoMestrePrivadoV159',schema_version:1,version:'VTEST_'+s,counts:{cards:1,questions:1,images:0,srs_records:1},cards:[c],questions:[{private:'questão '+s}],images:[],srs:[{private:'SRS '+s}]};
  files.get('cards'+s).payload=payload;
  files.get('profile'+s).payload.collections.pointer='pointer'+s;
  files.set('pointer'+s,{meta:{...files.get('cards'+s).meta,id:'pointer'+s,appProperties:{bmProject:'bm-portal-multi-v1',bmOwner:s,bmKind:'pointer'}},payload:{schema:'banco-mestre-operational-pointer/1',private_base:{version:payload.version,file_id:'cards'+s,sha256:createHash('sha256').update(JSON.stringify(payload)).digest('hex'),...payload.counts}}});
 }
 const read=createReader({...f,resolveSession:async req=>profiles[req.session],nativeSnapshotOnly:true});
 const [a,b]=await Promise.all([read({session:'A'}),read({session:'B'})]);assert.equal(a.records[0].back,'Resposta privada A');assert.equal(b.records[0].back,'Resposta privada B');assert.equal(a.scope,'snapshot-only');assert.equal(a.version,'VTEST_A');assert.equal(a.records[0].evolutive.layers.length,11);assert.ok(!('srs' in a)&&!('questions' in a));
 await assert.rejects(createReader({...f,resolveSession:async()=>profiles.A})({}),e=>e.code==='cards-schema');
 files.get('cardsA').payload.cards[0].back='mudança sem ponteiro';await assert.rejects(read({session:'A'}),e=>e.code==='cards-media-sha256');
 files.get('profileA').payload.collections.pointer='pointerB';await assert.rejects(read({session:'A'}),e=>e.code==='pointer-owner'||e.code==='pointer-parent');
});

test('delta histórico existente: só projeta vínculos, não reescreve questões, mídia ou SRS',()=>{
 const c=card('A'),snapshot={format:'BancoMestrePrivadoV159',schema_version:1,version:'VTEST',cards:[c],questions:[],images:[],srs:[{id:c.id,due:'2026-12-01'}],reserved_card_ids:['CARD-9902']},sha='a'.repeat(64);
 const pointer={private_base:{version:snapshot.version,file_id:'snapshot-A',sha256:sha}};
 const record={qid:'Q-1',srs_question:null,srs_scope:'HISTORICO',cards:[c.id]},event={...record,qid:'E-1',historical_event_id:'E-1'},media={id:'IMG-1',candidate_card_ids:[c.id]};
 const delta={format:'BancoMestreDeltaPrivadoRetomavel',version:'TEST',base:{private_version:snapshot.version,private_drive_file_id:'snapshot-A',sha256:sha},operations:[{op:'upsert_question_if_absent',key:'Q-1',record},{op:'record_historical_restudy_event_if_absent',key:'E-1',record:event},{op:'catalog_private_auxiliary_media_if_absent',key:'IMG-1',record:media},...['Q-1','E-1'].map(question_id=>({op:'append_question_link_if_absent',key:c.id+':'+question_id,card_id:c.id,question_id,relation:'DIRETA',base_front_sha256:createHash('sha256').update(c.front).digest('hex')}))]};
 const before=JSON.stringify(snapshot),r=previewNativeDelta(snapshot,pointer,delta);assert.deepEqual(r.records[0].related_question_ids,['Q-1','E-1']);assert.deepEqual(r.counts,{questions:1,historicalRestudies:1,mediaReferences:1,questionLinks:2});assert.equal(JSON.stringify(snapshot),before);assert.equal(r.srsModified,false);
 assert.throws(()=>previewNativeDelta(snapshot,pointer,{...delta,base:{...delta.base,private_drive_file_id:'snapshot-B'}}),e=>e.code==='native-delta-base');
 const bad=structuredClone(delta);bad.operations[3].base_front_sha256='0'.repeat(64);assert.throws(()=>previewNativeDelta(snapshot,pointer,bad),e=>e.code==='native-delta-link');
 assert.throws(()=>previewNativeDelta(snapshot,pointer,{...delta,operations:[...delta.operations,{op:'update_srs',key:'S-1'}]}),e=>e.code==='native-delta-operation');
});
