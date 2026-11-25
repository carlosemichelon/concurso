import {test} from 'node:test';import assert from 'node:assert/strict';import {createMediaReader,createPdfLibrary} from '../infra/vs41-private/media.mjs';import {mediaFixture,profiles} from './vs41_private_fixture.mjs';
const setup=()=>{const f=mediaFixture();return {...f,read:createMediaReader({...f,resolveSession:async req=>profiles[req.session]})}};
test('PDF e imagem vinculados ao perfil autenticado; mesmo identificador, dados separados',async()=>{
 const f=setup(),a={session:'A'},b={session:'B'};
 const [x,y]=await Promise.all([f.read(a,'CARD-9901','PDF-TEST'),f.read(b,'CARD-9901','PDF-TEST')]);
 assert.match(x.bytes.toString(),/perfil A/);assert.match(y.bytes.toString(),/perfil B/);assert.notEqual(x.sha256,y.sha256);
 assert.equal((await f.read(a,'CARD-9901','IMG-TEST')).mimeType,'image/png');
 await assert.rejects(f.read(a,'CARD-9901','PDF-TEST-B'));await assert.rejects(f.read(a,'CARD-9999','PDF-TEST'));await assert.rejects(f.read({session:'X'},'CARD-9901','PDF-TEST'));
});
test('ID cruzado, hash alterado e compartilhamento bloqueiam leitura',async()=>{
 const f=setup(),a={session:'A'};
 const link=f.files.get('mediaA').payload.records[0];link.fileId='IMG-TEST-B';await assert.rejects(f.read(a,'CARD-9901','IMG-TEST'));assert.ok(!f.requests.some(x=>x.id==='IMG-TEST-B'&&x.media));
 link.fileId='IMG-TEST-A';link.sha256='0'.repeat(64);await assert.rejects(f.read(a,'CARD-9901','IMG-TEST'));
 f.files.get('PDF-TEST-A').meta.shared=true;await assert.rejects(f.read(a,'CARD-9901','PDF-TEST'));
});

test('biblioteca PDF omite IDs do Drive e não mistura títulos nem vínculos',async()=>{
 const f=mediaFixture(),list=createPdfLibrary({...f,resolveSession:async req=>profiles[req.session]});
 const [a,b]=await Promise.all([list({session:'A'}),list({session:'B'})]);
 assert.deepEqual(a,[{id:'PDF-TEST',title:'Material privado A',section:'Estudo',category:'PDF',card_ids:['CARD-9901']}]);
 assert.equal(b[0].title,'Material privado B');assert.ok(!JSON.stringify(a).includes('PDF-TEST-A'));
 await assert.rejects(list({session:'X'}));
 f.files.get('mediaA').payload.records[1].card_ids=['CARD-9999'];assert.deepEqual(await list({session:'A'}),[]);
});
