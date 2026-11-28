import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectAccount} from '../infra/vs41-private/browser-account-v436.mjs';
import {fixture} from './vs41_browser_account_fixture.mjs';
test('one selected account provides its own cards and study master; two profiles remain isolated',async()=>{
 const a=await connectAccount({token:'A',fetcher:fixture('A')});
 const b=await connectAccount({token:'B',fetcher:fixture('B')});
 assert.equal(a.snapshot.version,'TESTE-A');assert.equal(b.snapshot.version,'TESTE-B');
 assert.equal((await a.study()).data.subjects[0].name,'Disciplina A');
 assert.equal((await b.study()).data.subjects[0].name,'Disciplina B');
 assert.deepEqual(await a.reviews(),[]);assert.equal((await b.pdfs())[0].id,'pdfB');
 await assert.rejects(a.readMedia('foreignB'));
 await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{foreign:true})}));
});

test('ambiguous Drive pointer never activates editorial fallback',async()=>{
 let called=0;
 await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{duplicatePointer:true}),allowEditorial:()=>{called++;return true}}),/ambígua/);
 assert.equal(called,0);
});

test('explicit writes retain the original V245 master and V001 SRS events, only in selected account',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true,actor:'actorA'}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const old=await a.study(),data=structuredClone(old.data);
 data.sessions.push({id:'sessionA',subjectId:'discA',date:'2026-11-26',minutes:30,questions:10,correct:8});
 const first=await a.saveStudy({event_id:'12345678-1234-1234-1234-123456789001',previous:old.revision,data});
 assert.deepEqual(first.data,data);assert.deepEqual((await a.study()).data,data);assert.equal((await b.study()).data.sessions.length,0);
 await assert.rejects(a.saveStudy({event_id:'12345678-1234-1234-1234-123456789002',previous:old.revision,data}),/alterado/);
 const input={event_id:'12345678-1234-1234-1234-123456789003',id:'CARD-9901',rating:'Bom'};
 const ev=await a.recordReview(input);assert.equal(ev.interval_days,16);assert.deepEqual(await a.recordReview(input),ev);assert.equal((await a.reviews()).length,1);assert.equal((await b.reviews()).length,0);
 assert.equal(writes.filter(x=>x.method==='PATCH').length,1);
 assert.equal(writes.filter(x=>x.name?.startsWith('BM_SRS_EVENT_V001_')).length,1);
 assert.ok(writes.every(x=>x.account==='A'));
 await assert.rejects(b.saveStudy({event_id:'12345678-1234-1234-1234-123456789004',previous:'1',data}));
});

test('gaps use the existing V242 master, preserve history and never cross accounts',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true,actor:'actorA'}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const rec={id:'LAC-TEST-A',cardIds:['CARD-9901'],relatoEstudante:'Dúvida',diagnosticoAssistente:'',cobertura:'Direta',etapa:'Identificada',historico:[]};
 const first=await a.saveGap({event_id:'12345678-1234-1234-1234-123456789011',previous:null,event:'lacuna_criada',record:rec});
 assert.equal((await a.gaps()).revisions[rec.id],first.revision);
 const second=await a.saveGap({event_id:'12345678-1234-1234-1234-123456789012',previous:first.revision,event:'etapa_atualizada',record:{...rec,etapa:'Explicada'}});
 const d=await a.gaps();assert.equal(d.revisions[rec.id],second.revision);assert.equal(d.data.records[0].etapa,'Explicada');assert.equal(d.data.log.length,2);
 assert.deepEqual((await b.gaps()).data.records,[]);
 await assert.rejects(a.saveGap({event_id:'12345678-1234-1234-1234-123456789013',previous:first.revision,event:'etapa_atualizada',record:rec}),/alterada/);
 assert.ok(writes.every(x=>x.account==='A'));
});

test('PDF annotations reuse V104 master, retain deletions and isolate original files',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true,actor:'actorA'}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const original=await a.readAnnotations('pdfA',1);assert.deepEqual(original.marks,[]);
 const mark={id:'mark-test-A',type:'highlight',color:'#ffee00',rects:[[0,0,0.5,0.1]]};
 const first=await a.saveAnnotations('pdfA',1,{event_id:'12345678-1234-1234-1234-123456789021',previous:original.revision,hash:original.hash,marks:[mark]});
 assert.deepEqual((await a.readAnnotations('pdfA',1)).marks,[mark]);assert.deepEqual((await b.readAnnotations('pdfB',1)).marks,[]);
 const second=await a.saveAnnotations('pdfA',1,{event_id:'12345678-1234-1234-1234-123456789022',previous:first.revision,hash:original.hash,marks:[]});
 assert.deepEqual(second.marks,[]);assert.deepEqual((await a.readAnnotations('pdfA',1)).marks,[]);
 await assert.rejects(a.saveAnnotations('pdfA',1,{event_id:'12345678-1234-1234-1234-123456789023',previous:second.revision,hash:original.hash,marks:[mark]}));
 await assert.rejects(a.readAnnotations('pdfB',1));
 assert.ok(writes.every(x=>x.account==='A'&&x.id!=='pdfA'));
});

test('image marks persist only in the selected Drive; original image never changed',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true}),b=await connectAccount({token:'B',fetcher:fixture('B')});
 const before=await a.readInk('imgA'),other=await b.readInk('imgB');
 assert.equal(before.revision,null);assert.equal(other.revision,null);
 const mark={id:'ink-a',type:'pen',color:'#ff0000',size:3,points:[[0.1,0.2,0.5],[0.3,0.4,0.5]]};
 const input={event_id:'12345678-1234-1234-1234-123456789031',previous:null,hash:before.hash,marks:[mark]};
 const saved=await a.saveInk('imgA',input);assert.deepEqual(saved.marks,[mark]);assert.deepEqual(await a.readInk('imgA'),saved);assert.deepEqual(await a.saveInk('imgA',input),saved);
 assert.deepEqual((await b.readInk('imgB')).marks,[]);assert.equal(writes.length,1);assert.ok(writes[0].account==='A'&&writes[0].id!=='imgA');
 await assert.rejects(a.readInk('imgB'));await assert.rejects(a.saveInk('imgA',{...input,event_id:'12345678-1234-1234-1234-123456789032'}),/outro dispositivo/);
});

test('manual root uses the selected account and rejects another account or a non-folder',async()=>{
 const a=await connectAccount({token:'A',fetcher:fixture('A'),rootId:'rootA'});
 assert.equal(a.rootUrl,'https://drive.google.com/drive/folders/rootA');
 assert.equal(a.snapshot.version,'TESTE-A');
 await assert.rejects(connectAccount({token:'B',fetcher:fixture('B'),rootId:'rootA'}));
 await assert.rejects(connectAccount({token:'A',fetcher:fixture('A'),rootId:'pdfA'}),/pasta privada/);
 await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{foreign:true}),rootId:'rootA'}));
});

test('complete ChatGPT export includes account, purpose, source links and current rules, with no writes',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true});
 const e=await a.exportStudy('Hidráulica e solos');
 assert.equal(e.account.email,'a@example.invalid');
 assert.equal(e.drive.root_url,'https://drive.google.com/drive/folders/rootA');
 assert.equal(e.study_objective,'Hidráulica e solos');
 assert.equal(e.data.methodology.text,'Metodologia integral A');
 assert.equal(e.data.operational_guide.text,'Guia integral A');
 assert.equal(e.data.cards[0].front,'Pergunta privada A');
 assert.equal(e.data.study.data.subjects[0].name,'Disciplina A');
 assert.equal(e.complete,true);assert.equal(writes.length,0);
 assert.ok(e.data.media.every(x=>x.url.startsWith('https://drive.google.com/open?id=')));
 const direct=await a.exportStudy();assert.equal(direct.study_objective,null);assert.equal(direct.complete,true);assert.equal(writes.length,0);
});

test('recupera datas originais de snapshot e delta privado, sem criar avaliações',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes}),write:true});
 const schedule=await a.schedule();
 assert.equal(schedule.complete,true);assert.equal(schedule.events,1);assert.equal(schedule.documents,1);
 assert.equal(schedule.records.length,1);assert.equal(schedule.records[0].due,'2026-11-28');
 assert.equal(schedule.records[0].rating,'Difícil');assert.equal(schedule.records[0].eventId,'agenda-A');
 assert.deepEqual(await a.reviews(),[]);assert.equal(writes.length,0);
});
test('redação: grava explicitamente, conserva histórico, rejeita chaves e contas divergentes',async()=>{
 const writes=[],fetcher=fixture('A',{writable:true,writes}),a=await connectAccount({token:'A',fetcher,write:true});
 const b=await connectAccount({token:'B',fetcher:fixture('B')});
 assert.deepEqual(await a.writing(),{revision:null,data:{}});
 const draft={treino_indice:'["treino_tema"]',treino_tema:'{"resposta":"Texto A"}'};
 await assert.rejects(a.saveWriting({event_id:crypto.randomUUID(),previous:null,data:{pe_anthropic_key:'"secret"'}}));
 const first=await a.saveWriting({event_id:crypto.randomUUID(),previous:null,data:draft});
 assert.deepEqual(first.data,draft);assert.deepEqual((await a.writing()).data,draft);
 assert.deepEqual(await b.writing(),{revision:null,data:{}});
 await assert.rejects(a.saveWriting({event_id:crypto.randomUUID(),previous:null,data:draft}));
 const next={...draft,treino_tema:'{"resposta":"Texto A revisado"}'};
 const saved=await a.saveWriting({event_id:crypto.randomUUID(),previous:first.revision,data:next});
 assert.deepEqual(saved.data,next);
 assert.deepEqual((await a.writing()).data,next);
 assert.ok(writes.some(x=>x.name?.startsWith('BancoMestre_Redacao_Recuperacao_')));
 assert.ok(writes.every(x=>x.account==='A'));
});
test('índices antigos classificam apenas arquivos pertencentes ao banco individual',async()=>{
 const source=async path=>path.includes('v211')?{schema:'BancoMestrePublishedDriveImagesV211',records:[{driveFileId:'imgA',imageId:'IMG-TESTE',title:'Imagem de estudo',group:'eng_geotecnia',topic:'Solos',cardIds:['CARD-9901','CARD-9999']},{driveFileId:'imgB',imageId:'IMG-B',title:'Imagem alheia',topic:'Outro'}]}:null;
 const a=await connectAccount({token:'A',fetcher:fixture('A'),readEditorialIndex:source});
 const imgs=await a.images();assert.equal(imgs.length,2);const original=imgs.find(x=>x.id==='imgA');assert.ok(original);assert.ok(imgs.some(x=>x.id==='svgA'));
 assert.equal(original.subject,'Solos');assert.deepEqual(original.card_ids,['CARD-9901']);
 assert.ok(!imgs.some(x=>x.id==='optimizedA'||x.id==='derivedA'));assert.equal((await a.readMedia('optimizedA')).type,'image/png');
 await assert.rejects(a.readMedia('imgB'));
});

test('SRS histórico recupera datas exatas sem promover catálogo anterior e sem escrita',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes,historical:true}),write:true});
 const agenda=await a.schedule();
 assert.equal(a.snapshot.version,'TESTE-A');assert.equal(agenda.historical,'V193');assert.equal(agenda.complete,false);
 assert.equal(agenda.records.length,1);assert.equal(agenda.records[0].due,'2026-12-07');assert.equal(agenda.records[0].rating,'Bom');
 assert.match(agenda.records[0].source,/V193/);assert.equal(writes.length,0);
});

test('Imagens e PDFs têm varreduras independentes, cache por biblioteca e atualização explícita',async()=>{
 const delegate=fixture('A'),scans={pdf:0,image:0};
 const fetcher=(url,opts)=>{const q=new URL(url).searchParams.get('q')||'';
  const pdf=q.includes("mimeType = 'application/pdf'"),image=q.includes("mimeType contains 'image/'");
  if(pdf||image){assert.ok(!q.includes(' in parents'),'Não consultar pasta por pasta');assert.notEqual(pdf,image,'Consultas de mídia devem ser independentes');scans[pdf?'pdf':'image']++;}
  return delegate(url,opts);
 };
 const a=await connectAccount({token:'A',fetcher});
 assert.deepEqual((await a.images()).map(x=>x.id),['imgA','svgA']);
 assert.deepEqual(scans,{pdf:0,image:1});
 assert.deepEqual((await a.pdfs()).map(x=>x.id),['pdfA']);
 assert.deepEqual(scans,{pdf:1,image:1});
 await Promise.all([a.images(),a.pdfs()]);assert.deepEqual(scans,{pdf:1,image:1});
 await Promise.all([a.images(true),a.pdfs(true)]);assert.deepEqual(scans,{pdf:2,image:2});
});

test('índice exclui pastas de backup, externas e compartilhadas; não grava nem baixa originais durante a consulta',async()=>{
 const writes=[],delegate=fixture('A',{writable:true,writes,indexEdgeCases:true});let indexCalls=0,downloads=0;const fetcher=(url,opt)=>{const u=new URL(url);if(u.searchParams.get('q')?.includes("mimeType contains 'image/'"))indexCalls++;if(u.searchParams.has('alt')&&/\/(?:pdf|img|svg)A$/.test(u.pathname))downloads++;return delegate(url,opt)};
 const a=await connectAccount({token:'A',fetcher,write:true});const [p,i]=await Promise.all([a.pdfs(),a.images()]);assert.deepEqual(p.map(x=>x.id),['pdfA']);assert.deepEqual(i.map(x=>x.id),['imgA','svgA']);assert.equal(indexCalls,1);assert.equal(downloads,0);assert.equal(writes.length,0);await a.pdfs();assert.equal(indexCalls,1);await assert.rejects(a.readMedia('outsidePdfA'));
});

test('nomes históricos de pastas: Redação usa a pasta original e o índice exclui backups; ambiguidade impede gravação',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes,indexEdgeCases:true,legacyFolderNames:true}),write:true});
 assert.deepEqual(await a.writing(),{revision:null,data:{}});
 const draft={treino_indice:'[]'};await a.saveWriting({event_id:crypto.randomUUID(),previous:null,data:draft});assert.deepEqual((await a.writing()).data,draft);
 assert.deepEqual((await a.pdfs()).map(x=>x.id),['pdfA']);assert.deepEqual((await a.images()).map(x=>x.id),['imgA','svgA']);
 const n=writes.length,duplicate=await connectAccount({token:'A',fetcher:fixture('A',{writable:true,writes,legacyFolderNames:true,duplicateReviewFolder:true}),write:true});
 await assert.rejects(duplicate.writing(),/ausente ou duplicado/);await assert.rejects(duplicate.saveWriting({event_id:crypto.randomUUID(),previous:null,data:draft}),/ausente ou duplicado/);assert.equal(writes.length,n);
});

test('ponteiro de recuperação separa catálogo editorial e histórico privado; SRS permanece parcial',async()=>{
 const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{recovery:true,writable:true,writes}),write:true});
 assert.equal(a.snapshot.scope,'private-recovery');assert.equal(a.snapshot.privateVersion,'TESTE-A');assert.equal(a.snapshot.viewVersion,'VC-TESTE');assert.equal(a.snapshot.records.length,2);
 const agenda=await a.schedule();assert.equal(agenda.complete,false);assert.equal(agenda.historical,'TESTE-A');assert.deepEqual(agenda.records.map(x=>x.id),['CARD-9901']);assert.equal(agenda.records[0].due,'2026-11-28');assert.equal(writes.length,0);
});
test('recuperação com transferência SRS indevida é rejeitada sem fallback',async()=>{let calls=0;await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{recovery:true,recoveryInvalid:true}),allowEditorial:()=>{calls++;return true}}),/identidade operacional sem fonte/);assert.equal(calls,0)});

test('agenda privada reutiliza leitura na sessão e atualiza somente por pedido explícito',async()=>{const delegate=fixture('A');let scans=0;const fetcher=(url,opts)=>{if(new URL(url).searchParams.get('q')?.includes('Delta de estudo e cartões aprovados'))scans++;return delegate(url,opts)};const a=await connectAccount({token:'A',fetcher});const first=await a.schedule();assert.equal(scans,1);assert.deepEqual(await a.schedule(),first);assert.equal(scans,1);await a.schedule(true);assert.equal(scans,2)});


test('checkpoint privado versionado no Drive continua acessível sem alterar SRS',async()=>{const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{recovery:true,driveCheckpoint:true,writes}),write:true});assert.equal(a.snapshot.scope,'private-recovery');assert.equal(a.snapshot.privateVersion,'RECUPERACAO-A');assert.equal(a.snapshot.viewVersion,'VD-TESTE');assert.equal(a.snapshot.records.length,2);assert.equal(a.snapshot.srsComplete,false);assert.deepEqual(writes,[])});
test('checkpoint privado com linhagem divergente é rejeitado',async()=>{await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{recovery:true,driveCheckpoint:true,badLineage:true})}),/origem privada inválida|projeção editorial divergente/)});


test('checkpoint Drive com hash registrado somente no invólucro e lote correspondente é legível',async()=>{const writes=[],a=await connectAccount({token:'A',fetcher:fixture('A',{recovery:true,driveCheckpoint:true,checkpointHashOmitted:true,writes}),write:true});assert.equal(a.snapshot.viewVersion,'VD56_TESTE');assert.equal(a.snapshot.records.length,2);assert.equal(a.snapshot.srsComplete,false);assert.deepEqual(writes,[])});
test('checkpoint sem hash duplicado exige lote correspondente; hash explícito divergente continua bloqueado',async()=>{for(const options of [{checkpointBatchMissing:true},{checkpointHashConflict:true}])await assert.rejects(connectAccount({token:'A',fetcher:fixture('A',{recovery:true,driveCheckpoint:true,checkpointHashOmitted:true,...options})}),/origem privada inválida|projeção editorial divergente/)});


test('imagem da conta: miniatura, editor e grifos reaproveitam uma única transferência verificada',async()=>{const delegate=fixture('A');let downloads=0;const fetcher=(url,opts)=>{const u=new URL(url);if(u.pathname.endsWith('/imgA')&&u.searchParams.get('alt')==='media')downloads++;return delegate(url,opts)};const a=await connectAccount({token:'A',fetcher});const [first,second]=await Promise.all([a.readMedia('imgA'),a.readMedia('imgA')]);assert.equal(first.size,second.size);await a.readInk('imgA');await a.readMedia('imgA');assert.equal(downloads,1);await assert.rejects(a.readMedia('imgB'))});
