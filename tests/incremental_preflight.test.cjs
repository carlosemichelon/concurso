'use strict';
// Teste de integração somente leitura. Nenhum cartão fictício é gravado.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {publicPreflight,blobHash,check}=require('../tools/catalog_snapshot.cjs');
const root=path.resolve(__dirname,'..');
const manifestBytes=fs.readFileSync(path.join(root,'assets/version.json'));
const m=JSON.parse(manifestBytes);
const bytes=fs.readFileSync(path.join(root,m.catalog.path));
const snapshot=JSON.parse(bytes);
const contract={...m.catalog,portal_version:m.version,manifest_git_blob:blobHash(manifestBytes)};
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const ids=new Set([...snapshot.base,...snapshot.ijui].map(c=>c.id));
const existing=snapshot.base.find(c=>c.active!==false&&/^CARD-\d{4,}$/.test(c.id));
assert.ok(existing,'Catálogo sem cartão ativo');
let n=999900;while(ids.has('CARD-'+n))n++;
const id='CARD-'+n;
const mk=(id,related=[])=>({id,discipline:'TESTE',subject:'TESTE',sub:'TESTE',front:'Pergunta fictícia',back:'Resposta fictícia',expl:'Explicação fictícia',reference:'Fonte fictícia',active:true,related_card_ids:related});
const profile=c=>({id:c.id,front:c.front,back:c.back,status:'CANONICO_ATIVO',related_card_ids:c.related_card_ids,layers:Array.from({length:11},(_,i)=>({ord:i+1,titulo:'Teste '+i,texto:'Texto fictício '+i}))});
function packet(){
 const c=mk(id,[existing.id]);
 return {format:'BancoMestrePublicIncrement1',catalog_git_blob:contract.git_blob,portal_version:contract.portal_version,manifest_git_blob:contract.manifest_git_blob,new_cards:[c],updated_cards:[],profiles:{[id]:profile(c)},relations:{[id]:[existing.id],[existing.id]:[id]},expected_card_hashes:{},private_content_exported:false};
}
test('snapshot real e contrato vigentes reproduzíveis',async()=>{const r=await check();assert.equal(r.ok,true);assert.equal(r.canonical,snapshot.base.length)});
test('preflight no catálogo real é somente leitura e determinístico',()=>{
 const p=packet(),before=digest(snapshot),r=publicPreflight(p,snapshot,contract);
 assert.deepEqual(r,publicPreflight(p,snapshot,contract));
 assert.equal(r.packet_sha256,digest(p));assert.equal(r.new_cards,1);
 assert.equal(r.private_sync,'not_verified');assert.equal(r.publication,'not_performed');
 assert.equal(digest(snapshot),before);assert.deepEqual(fs.readFileSync(path.join(root,m.catalog.path)),bytes);
 assert.deepEqual(fs.readFileSync(path.join(root,'assets/version.json')),manifestBytes);
});
for(const [name,mutate] of [
 ['ID existente',p=>p.new_cards[0].id=existing.id],
 ['ID repetido',p=>p.new_cards.push(p.new_cards[0])],
 ['manifesto obsoleto',p=>p.manifest_git_blob='0'.repeat(40)],
 ['catálogo obsoleto',p=>p.catalog_git_blob='0'.repeat(40)],
 ['módulo ausente',p=>p.profiles[id].layers.pop()],
 ['módulo repetido',p=>p.profiles[id].layers[1].texto=p.profiles[id].layers[0].texto],
 ['vínculo unilateral',p=>p.relations[existing.id]=[]],
 ['campo privado',p=>p.new_cards[0].srs={event:'TESTE'}],
 ['tentativa de exportação privada',p=>p.private_content_exported=true]
])test('bloqueia '+name,()=>{const p=packet();mutate(p);assert.throws(()=>publicPreflight(p,snapshot,contract))});
test('evolução exige hash do cartão de origem',()=>{
 const c=mk(existing.id),p={...packet(),new_cards:[],updated_cards:[c],profiles:{[c.id]:profile(c)},relations:{[c.id]:[]},expected_card_hashes:{[c.id]:digest(existing)}};
 assert.equal(publicPreflight(p,snapshot,contract).updated_cards,1);
 p.expected_card_hashes[c.id]='0'.repeat(64);
 assert.throws(()=>publicPreflight(p,snapshot,contract));
});

const {prepare,resumePlan,batchHash}=require('../tools/incremental_resume.cjs');
function batch(auth=true){
 const p=packet(),d={format:'BancoMestrePrivateBatch1',batch_id:'SYNTHETIC-TEST',state:'FROZEN',content:{srs:[{id:'synthetic-private-event'}]},publication:{approval:'APPROVED',approved_sha256:digest(p),packet:p},requires_authenticated:auth,receipts:{}};
 d.content_sha256=batchHash(d);return d;
}
function receipt(d,stage){return {batch_id:d.batch_id,content_sha256:d.content_sha256,stage,reference:'synthetic:'+stage}}
test('projeção autorizada exclui conteúdo privado',()=>{
 const d=batch(),p=prepare(d,snapshot,contract);
 assert.deepEqual(p.packet,d.publication.packet);assert.ok(!JSON.stringify(p.packet).includes('synthetic-private-event'));
 d.publication.packet.new_cards[0].front='changed';
 assert.throws(()=>prepare(d,snapshot,contract));
 d.content_sha256=batchHash(d);
 assert.throws(()=>prepare(d,snapshot,contract));
});
test('retomada confere destino antes de repetir escrita',async()=>{
 const d=batch(),called=[];
 const p=await resumePlan(d,async ({stage})=>{called.push(stage);return stage==='drive'?'MATCH':'ABSENT'});
 assert.deepEqual(called,['drive','github']);assert.equal(p.next,'github');
 assert.equal(p.states.drive,'VERIFIED');assert.equal(p.states.pages,'WAITING_UPSTREAM');assert.equal(p.complete,false);
});
test('recibo de outro lote bloqueia avanço',async()=>{
 const d=batch();d.receipts.drive={...receipt(d,'drive'),batch_id:'wrong'};
 const p=await resumePlan(d,async()=>{assert.fail('não deve consultar com recibo inválido')});
 assert.equal(p.states.drive,'CONFLICT');assert.equal(p.next,null);
});
test('resposta incerta não autoriza nova escrita',async()=>{
 const d=batch(),p=await resumePlan(d,async()=>{throw Error('offline')});
 assert.equal(p.states.drive,'UNKNOWN');assert.equal(p.next,null);
});
test('recibo existente mas destino ausente é conflito',async()=>{
 const d=batch();d.receipts.drive=receipt(d,'drive');
 const p=await resumePlan(d,async()=> 'ABSENT');assert.equal(p.states.drive,'CONFLICT');assert.equal(p.next,null);
});
test('conclusão exige verificação de todas as etapas aplicáveis',async()=>{
 const d=batch(),p=await resumePlan(d,async()=> 'MATCH');assert.equal(p.complete,true);
 const other=batch(false),q=await resumePlan(other,async()=> 'MATCH');assert.equal(q.complete,true);assert.equal(q.states.authenticated,'NOT_APPLICABLE');
});
test('alteração após congelamento bloqueia retomada',async()=>{
 const d=batch();d.content.srs.push({id:'another'});await assert.rejects(()=>resumePlan(d,async()=> 'MATCH'));
});

const {START,END,inspectDriveDocument,readGoogleDoc,driveVerifier}=require('../tools/incremental_drive_readback.cjs');
function fakeDoc(d,docId='synthetic-doc'){
 const s=START+'\n'+JSON.stringify(d)+'\n'+END;
 return {documentId:docId,revisionId:'synthetic-revision',body:{content:[{paragraph:{elements:[{textRun:{content:s.slice(0,50)}},{textRun:{content:s.slice(50)}}]}}]}};
}
test('Drive: confirma conteúdo congelado mesmo com texto repartido em runs',()=>{
 const d=batch();assert.equal(inspectDriveDocument(fakeDoc(d),d.batch_id,d.content_sha256),'MATCH');
 d.content.srs.push({id:'alterado'});assert.equal(inspectDriveDocument(fakeDoc(d),d.batch_id,d.content_sha256),'CONFLICT');
});
test('Drive: documento narrativo ou sem revisão não confirma nem autoriza regravação',()=>{
 const d=batch(),doc=fakeDoc(d);doc.body.content[0].paragraph.elements=[{textRun:{content:'checkpoint narrativo'}}];
 assert.equal(inspectDriveDocument(doc,d.batch_id,d.content_sha256),'UNKNOWN');
 assert.equal(inspectDriveDocument({...fakeDoc(d),revisionId:null},d.batch_id,d.content_sha256),'UNKNOWN');
});
test('Drive: marcador duplicado, truncado e outro lote bloqueiam',()=>{
 const d=batch(),doc=fakeDoc(d);doc.body.content[0].paragraph.elements.push({textRun:{content:START}});
 assert.equal(inspectDriveDocument(doc,d.batch_id,d.content_sha256),'CONFLICT');
 assert.equal(inspectDriveDocument(fakeDoc(d),'other',d.content_sha256),'CONFLICT');
});
test('Drive: leitura OAuth restrita ao endpoint oficial e somente GET',async()=>{
 const d=batch(),doc=fakeDoc(d);
 const response=await readGoogleDoc({documentId:doc.documentId,accessToken:'synthetic-token',fetchImpl:async(url,options)=>{
 assert.equal(url,'https://docs.googleapis.com/v1/documents/synthetic-doc?includeTabsContent=true');
 assert.equal(options.method,undefined);assert.equal(options.headers.Authorization,'Bearer synthetic-token');assert.equal(options.redirect,'error');
 return {ok:true,json:async()=>doc};
 }});
 assert.equal(response.documentId,doc.documentId);
});
test('Drive: recibo real exige documento correto e conteúdo correspondente',async()=>{
 const d=batch(),doc=fakeDoc(d),verify=driveVerifier({documentId:doc.documentId,readDocument:async()=>doc});
 const p=await resumePlan(d,verify);
 assert.equal(p.states.drive,'VERIFIED');assert.equal(p.states.github,'UNKNOWN');assert.equal(p.next,null);
 d.receipts.drive={...receipt(d,'drive'),reference:'wrong-doc'};
 assert.equal((await resumePlan(d,verify)).states.drive,'CONFLICT');
});

const {stagePublicIncrement}=require('../tools/catalog_snapshot.cjs');
test('integra novo cartão na coleção existente sem alterar os demais registros',()=>{
 const p=packet(),before=digest(snapshot),a=stagePublicIncrement(p,snapshot,contract);
 assert.equal(a.counts.canonical,snapshot.base.length+1);
 assert.equal(a.base.filter(c=>c.id===id).length,1);
 assert.ok(a.base.find(c=>c.id===existing.id).related_card_ids.includes(id));
 assert.deepEqual(a.base.filter(c=>c.id!==id&&c.id!==existing.id),snapshot.base.filter(c=>c.id!==existing.id));
 assert.equal(digest(snapshot),before);
});
test('evolução conserva ID, original, campos e vínculos históricos',()=>{
 const other=snapshot.base.find(c=>c.active!==false&&c.id!==existing.id&&/^CARD-\d{4,}$/.test(c.id));
 const s=JSON.parse(JSON.stringify(snapshot));const old=s.base.find(c=>c.id===existing.id);old.related_card_ids=[other.id];
 const c={...mk(existing.id),front:'Nova frente fictícia'};
 const p={...packet(),new_cards:[],updated_cards:[c],profiles:{[c.id]:profile(c)},relations:{[c.id]:[]},expected_card_hashes:{[c.id]:digest(old)}};
 const a=stagePublicIncrement(p,s,contract),after=a.base.find(x=>x.id===existing.id);
 assert.equal(a.counts.canonical,s.base.length);assert.equal(after.front,c.front);
 assert.deepEqual(a.originals[c.id],old);assert.ok(after.related_card_ids.includes(other.id));
 assert.ok(a.profiles[c.id].related_card_ids.includes(other.id));assert.equal(old.front,existing.front);
});
