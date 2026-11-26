import {test} from 'node:test';import assert from 'node:assert/strict';import {createReader} from '../infra/vs41-private/catalog.mjs';import {fixture,profiles,card} from './vs41_private_fixture.mjs';
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
