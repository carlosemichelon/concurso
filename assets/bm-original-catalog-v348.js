/* Extração literal do reconciliador público do index V348. Sem histórico pessoal.
 * O portal legado conserva a sua UI e renderizadores; somente o cálculo da base foi extraído.
 * O perfil multiusuário usa o mesmo reconciliador, sem F17, guias pessoais ou propostas de Ijuí.
 */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const assertPublicFiles=m=>{if(!m||!Array.isArray(m.card_files)||m.card_files.length!==7||new Set(m.card_files).size!==7||m.card_files.some(f=>!/^cards_public_v194_00[0-6]\.json$/.test(f)))throw Error('Índice público incompatível');return m};
async function reconcile(all,fetch,diagnostics={}){
 if(!Array.isArray(all)||all.length!==7||all.some(a=>!Array.isArray(a)))throw Error('Fragmentos públicos inválidos');
 const window=diagnostics;
const base=all.flat();if(base.length!==1518||new Set(base.map(c=>c.id)).size!==base.length)throw Error('Base pública V194 incompleta ou IDs duplicados');
const syncedRes=await fetch('assets/cards_drive_sync_v274.json?v=274-1',{cache:'no-store'});
if(!syncedRes.ok)throw Error('Sincronização pública V274 indisponível');
const synced=await syncedRes.json();
if(synced.format!=='BancoMestrePublicDriveSyncV274'||synced.source_version!=='V164'||synced.base_count!==1518||
 !Array.isArray(synced.new_cards)||synced.new_cards.length!==14||
 !Array.isArray(synced.updated_explanations)||synced.updated_explanations.length!==9)throw Error('Dados da sincronização V274 incompatíveis');
const currentMap=new Map(base.map(c=>[c.id,c])),changes=new Set();
for(const e of synced.updated_explanations){
 if(changes.has(e.id)||!currentMap.has(e.id)||typeof e.expl!=='string'||!e.expl.trim())throw Error('V274: atualização inconsistente '+e.id);
 changes.add(e.id);currentMap.get(e.id).expl=e.expl;
}
for(let j=0;j<synced.new_cards.length;j++){
 const c=synced.new_cards[j], expected='CARD-'+String(1520+j).padStart(4,'0');
 if(c.id!==expected||currentMap.has(c.id)||c.active!==true||!c.front||!c.back||!c.expl)throw Error('V274: novo cartão inválido '+(c.id||j));
 currentMap.set(c.id,c);base.push(c);
}
if(base.length!==1532||new Set(base.map(c=>c.id)).size!==1532)throw Error('V274: base pública não reconciliada');
const petro22Res=await fetch('assets/v276_petro22_public_cards.json?v=276-1',{cache:'no-store'});
if(!petro22Res.ok)throw Error('Delta Petrobras 22 V276 não encontrado');
const petro22=await petro22Res.json();
if(petro22.format!=='BancoMestrePublicPetro22DeltaV276'||petro22.source_private_version!=='V165'||petro22.base_public_version!=='V275'||
 !Array.isArray(petro22.new_cards)||petro22.new_cards.length!==1||!Array.isArray(petro22.updated_explanations)||petro22.updated_explanations.length!==1)throw Error('Delta V276 inválido');
for(const change of petro22.updated_explanations){
 const target=currentMap.get(change.id);
 if(!target||typeof change.expl_append!=='string'||!change.expl_append.trim())throw Error('V276: reforço de cartão inválido '+change.id);
 target.expl=String(target.expl||'')+'\n\n'+change.expl_append;
}
const extra=petro22.new_cards[0];
if(extra.id!=='CARD-1534'||currentMap.has(extra.id)||extra.active!==true||!extra.front||!extra.back||!extra.expl)throw Error('V276: cartão novo inválido');
base.push(extra);currentMap.set(extra.id,extra);
if(base.length!==1533||new Set(base.map(c=>c.id)).size!==1533)throw Error('V276: contagem ou IDs inconsistentes');
const addRes=await fetch('assets/estudos_incrementos_v267.json?v=267',{cache:'no-store'});if(!addRes.ok)throw Error('Incrementos de cartões V267 indisponíveis');const add=await addRes.json();if(add.version!=='V267-PETRO17-PETRO20'||!Array.isArray(add.cards)||add.cards.length!==19)throw Error('Incrementos V267 incompatíveis com o arquivo publicado');const addIDs=new Set();for(const inc of add.cards){if(addIDs.has(inc.id))throw Error('ID duplicado em incrementos '+inc.id);addIDs.add(inc.id);const alvo=base.find(c=>c.id===inc.id);if(!alvo||alvo.active!==true)throw Error('ID não encontrado na base V194: '+inc.id);alvo.expl=String(alvo.expl||'')+'\n\n'+inc.expl_append;alvo.search_keywords=String(inc.search_keywords||'');}const relatedRes=await fetch('assets/v277_petro22_relacionados_cards.json?v=277-1',{cache:'no-store'});
if(!relatedRes.ok)throw Error('V277: faltam os cartões relacionados Petrobras 22');
const related=await relatedRes.json();
if(related.format!=='BancoMestrePublicPetro22RelatedV277'||related.source_private_version!=='V166'||
 related.base_public_version!=='V276'||!Array.isArray(related.updated_explanations)||related.updated_explanations.length!==2)throw Error('V277: incremento incompatível');
const relatedExpected=new Set(['CARD-0578','CARD-0924']);
for(const rec of related.updated_explanations){
 const target=currentMap.get(rec.id);
 if(!relatedExpected.delete(rec.id)||!target||target.active!==true||typeof rec.expl_append!=='string'||!rec.expl_append.trim()||target.expl.includes(rec.expl_append))throw Error('V277: atualização duplicada, ausente ou inválida: '+rec.id);
 target.expl=String(target.expl||'')+'\n\n'+rec.expl_append;
}
if(relatedExpected.size||base.length!==1533||new Set(base.map(c=>c.id)).size!==1533)throw Error('V277: IDs ou catálogo não conciliados');
const res325=await fetch('assets/cards_public_v325_delta.json?v=325-1',{cache:'no-store'});
if(!res325.ok)throw Error('V325: faltam os cartões de sincronização');
const sync325=await res325.json();
if(sync325.format!=='BancoMestrePublicDeltaV325'||sync325.source_private_version!=='V173'||sync325.base_public_version!=='V324'||
sync325.new_cards?.length!==3||sync325.updated_explanations?.length!==35||sync325.updated_relations?.length!==40)throw Error('V325: incremento inválido');
const expected325=['CARD-1535','CARD-1536','CARD-1537'];
for(let j=0;j<3;j++){const c=sync325.new_cards[j];
if(c.id!==expected325[j]||currentMap.has(c.id)||c.active!==true||!c.front||!c.back||!c.expl)throw Error('V325: novo cartão inválido '+c.id);
base.push(c);currentMap.set(c.id,c);}
const seenExpl325=new Set(),seenRelated325=new Set();
for(const up of sync325.updated_explanations){
 if(seenExpl325.has(up.id)||!currentMap.has(up.id)||typeof up.expl!=='string'||typeof up.mnemonic!=='string')throw Error('V325: explicação inválida '+up.id);
 seenExpl325.add(up.id);const target=currentMap.get(up.id);target.expl=up.expl;target.mnemonic=up.mnemonic;
}
for(const up of sync325.updated_relations){
 if(seenRelated325.has(up.id)||!currentMap.has(up.id))throw Error('V325: vínculo inválido '+up.id);
 seenRelated325.add(up.id);const target=currentMap.get(up.id);
 for(const key of ['related_card_ids','related_question_ids','related_image_ids']){
  if(Object.prototype.hasOwnProperty.call(up,key)){
   if(!Array.isArray(up[key])||up[key].some(x=>typeof x!=='string'))throw Error('V325: metadado inválido '+up.id+'/'+key);
   target[key]=up[key].slice();
  }
 }
}
if(base.length!==1536||new Set(base.map(c=>c.id)).size!==1536)throw Error('V325: catálogo não alcançou 1.536 IDs');
const p25res=await fetch('assets/petro25_c001_card1538_v334.json?v=334-1',{cache:'no-store'});
if(!p25res.ok)throw Error('V334: registro PETRO25-C001 indisponível');
const p25=await p25res.json();
if(p25.format!=='BancoMestrePetro25IncrementV334'||p25.new_cards?.length!==1||
p25.new_cards[0].id!=='CARD-1538'||p25.related_updates?.length!==4||
p25.new_layers?.length!==11||currentMap.has('CARD-1538'))throw Error('V334: dados incompatíveis');
const ids334=new Set(['CARD-1155','CARD-0529','CARD-0697','CARD-1065']);
for(const change of p25.related_updates){
 if(!ids334.delete(change.id)||!currentMap.has(change.id)||!change.expl_append?.trim())
   throw Error('V334: relacionado inválido '+change.id);
 const card=currentMap.get(change.id);
 if(!card.expl.includes(change.expl_append))card.expl=String(card.expl||'')+'\n\n'+change.expl_append;
 card.related_card_ids=[...new Set([...(card.related_card_ids||[]),'CARD-1538'])];
 card.related_question_ids=[...new Set([...(card.related_question_ids||[]),'PETRO25-C001'])];
}
if(ids334.size)throw Error('V334: falta relacionado');
const fresh=p25.new_cards[0];
if(fresh.active!==true||!fresh.front||!fresh.back||!fresh.expl)throw Error('V334: cartão incompleto');
base.push(fresh);currentMap.set(fresh.id,fresh);

if(base.length!==1537||new Set(base.map(c=>c.id)).size!==1537)
 throw Error('V334: catálogo deve ter 1.537 cartões únicos');
const extraRes=await fetch('assets/petro25_conversation_delta_v335.json?v=335-1',{cache:'no-store'});
if(!extraRes.ok)throw Error('V335: conteúdo de Petrobras 25 indisponível');
const extra335=await extraRes.json();
if(extra335.format!=='BancoMestrePetro25ConversationDeltaV335'||
   extra335.new_cards?.length!==3||extra335.related_updates?.length!==11||
   extra335.new_layers?.length!==3)throw Error('V335: estrutura inválida');
const exNewIds=new Set(['CARD-1539','CARD-1540','CARD-1541']);
const exRelIds=new Set(['CARD-0230','CARD-0404','CARD-0521','CARD-0857','CARD-0858','CARD-0479','CARD-1212','CARD-1385','CARD-1432','CARD-1434','CARD-1435']);
const links335={
 'CARD-0479':['CARD-1435'], 'CARD-1212':['CARD-1541'], 'CARD-1385':['CARD-1539','CARD-1540'],
 'CARD-1432':['CARD-1434','CARD-1539','CARD-1540','CARD-1541'],
 'CARD-1434':['CARD-1432','CARD-1539','CARD-1541'],
 'CARD-1435':['CARD-0479']};
for(const change of extra335.related_updates){
 if(!exRelIds.delete(change.id)||!currentMap.has(change.id)||!change.expl_append?.trim())
  throw Error('V335: relacionado inválido '+change.id);
 const c=currentMap.get(change.id);
 if(!String(c.expl||'').includes(change.expl_append))c.expl=String(c.expl||'')+'\n\n'+change.expl_append;
 if(links335[change.id])c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...links335[change.id]])];
 if(change.id==='CARD-1432'||change.id==='CARD-1434')
  c.related_question_ids=[...new Set([...(c.related_question_ids||[]),'PETRO25-TRANSPETRO-2011-Q45'])];
}
if(exRelIds.size)throw Error('V335: cartões relacionados faltantes');
for(const id of ['CARD-1539','CARD-1540','CARD-1541']){
 const c=extra335.new_cards.find(c=>c.id===id);
 const item=extra335.new_layers.find(x=>x.id===id);
 if(!c||!c.active||!c.front||!c.back||!c.expl||!item||item.layers.length!==11||currentMap.has(id))
  throw Error('V335: novo cartão inconsistente '+id);
 base.push(c);currentMap.set(id,c);exNewIds.delete(id);
}
if(exNewIds.size||base.length!==1540||new Set(base.map(c=>c.id)).size!==1540)
 throw Error('V335: catálogo precisa ter 1.540 cartões únicos');
const editorialV336Res=await fetch('assets/petro25_editorial_v336.json?v=336-2',{cache:'no-store'});
if(!editorialV336Res.ok)throw Error('V336: evolução dos cartões relacionada indisponível');
const editorialV336=await editorialV336Res.json();
if(editorialV336.format!=='BancoMestreV333CompliantEditorialV336'||
   Object.keys(editorialV336.items||{}).length!==14)
 throw Error('V336: corpus metodológico de 14 cartões inválido');
for(const [id,profile] of Object.entries(editorialV336.items)){
 const c=currentMap.get(id);
 if(!c||!Array.isArray(profile.related_card_ids)||profile.paragraphs.length<2)
  throw Error('V336: registro ou vínculos incorretos '+id);
 for(const related of profile.related_card_ids){
  if(!currentMap.has(related)||!editorialV336.items[related]?.related_card_ids?.includes(id))
   throw Error('V336: vínculo não recíproco '+id+' ↔ '+related);
 }
 c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...profile.related_card_ids])];
 if(profile.front_override){if(!profile.front_history_v335||!profile.front_override.trim())throw Error('V336: frente sem histórico');c.front=profile.front_override;}
 c.last_relationship_at=profile.relationship_event_date;
 c.last_editorial_modified_at=profile.editorial_last_modified;
}



// V337 · Petrobras 26: 13 cartões existentes + 6 novos, sem tocar na base privada/SRS.
const r337=await fetch('assets/petro26_delta_v337.json?v=337-1',{cache:'no-store'});
if(!r337.ok)throw Error('V337: conteúdo dos cartões não carregado');
const data337=await r337.json();
if(data337.format!=='BancoMestrePetro26UpdateV337'||data337.counts?.new_cards!==6||
 data337.counts?.updated!==13||Object.keys(data337.profiles||{}).length!==19)
 throw Error('V337: contagem de cartões inválida');
const original337={},changed337=new Set();
for(const p of data337.updates){
 const c=currentMap.get(p.id);
 if(!c||!c.active||changed337.has(p.id)||!p.front?.trim()||!p.back?.trim()||
  p.paragraphs?.length!==3||data337.profiles[p.id]?.layers?.length!==11)
  throw Error('V337: evolução inválida '+p.id);
 original337[p.id]={front:c.front,back:c.back,expl:c.expl,
  mnemonic:c.mnemonic,reference:c.reference,related_card_ids:[...(c.related_card_ids||[])],
  related_question_ids:[...(c.related_question_ids||[])]};
 c.front=p.front;c.back=p.back;c.expl=p.paragraphs.join(String.fromCharCode(10,10));c.mnemonic=p.mnemonic;
 c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...p.related_card_ids])];
 c.related_question_ids=[...new Set([...(c.related_question_ids||[]),...p.related_question_ids])];
 c.search_keywords=[c.search_keywords||'',p.front,data337.profiles[p.id].compare].join(' ');
 c.last_relationship_at=p.relationship_event_date;
 c.last_editorial_modified_at=p.editorial_last_modified;
 c.legacy_snapshot_v336=original337[p.id];changed337.add(p.id);
}
if(changed337.size!==13)throw Error('V337: atualizações ausentes');
const expectedNew337=['CARD-1542','CARD-1543','CARD-1544','CARD-1545','CARD-1546','CARD-1547'];
for(let i=0;i<expectedNew337.length;i++){
 const c=data337.new_cards[i];
 if(!c||c.id!==expectedNew337[i]||currentMap.has(c.id)||c.active!==true||
  !c.front?.trim()||!c.back?.trim()||!c.expl?.trim()||
  data337.profiles[c.id]?.layers?.length!==11)throw Error('V337: cartão novo inválido '+(c?.id||i));
 base.push(c);currentMap.set(c.id,c);
}
for(const [id,p] of Object.entries(data337.profiles)){
 const c=currentMap.get(id);
 if(!c||p.layers.length!==11)throw Error('V337: ficha sem 11 módulos '+id);
 for(const target of p.related_card_ids||[]){
  const linked=currentMap.get(target);
  if(!linked||!data337.profiles[target]?.related_card_ids?.includes(id))
   throw Error('V337: vínculo não recíproco '+id+' / '+target);
  linked.related_card_ids=[...new Set([...(linked.related_card_ids||[]),id])];
 }
}
if(base.length!==1546||new Set(base.map(c=>c.id)).size!==1546)
 throw Error('V337: esperados 1.546 cartões únicos');
window.BM337Originals=Object.freeze(original337);
window.BM337CatalogStatus=Object.freeze({version:'V337',cards:base.length,
 updated:13,created:6,srs_changed:false,originals_preserved:true});

// V338 · sincronização de conteúdo Petrobras 26: 11 novos + 7 evoluções, preservando V337 e SRS.
const r338=await fetch('assets/petro26_study_sync_v338.json?v=338-1',{cache:'no-store'});
if(!r338.ok)throw Error('V338: incremento de estudo indisponível');
const data338=await r338.json();
if(data338.format!=='BancoMestrePetro26StudySyncV338'||
 data338.counts?.new_cards!==11||data338.counts?.updated!==7||data338.counts?.total!==18||
 Object.keys(data338.profiles||{}).length!==18)throw Error('V338: pacote inconsistente');
const originals338={},changed338=new Set();
for(const p of data338.updates){
 const c=currentMap.get(p.id);
 if(!c||c.active!==true||changed338.has(p.id)||!p.front?.trim()||!p.back?.trim()||
 p.paragraphs?.length!==3||data338.profiles[p.id]?.layers?.length!==11)
 throw Error('V338: evolução incompleta '+p.id);
 originals338[p.id]={front:c.front,back:c.back,expl:c.expl,
  mnemonic:c.mnemonic,reference:c.reference,related_card_ids:[...(c.related_card_ids||[])],
  related_question_ids:[...(c.related_question_ids||[])]};
 c.front=p.front;c.back=p.back;c.expl=p.paragraphs.join(String.fromCharCode(10,10));c.mnemonic=p.mnemonic;
 c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...p.related_card_ids])];
 c.related_question_ids=[...new Set([...(c.related_question_ids||[]),...p.related_question_ids])];
 c.search_keywords=[c.search_keywords||'',p.front,data338.profiles[p.id].compare].join(' ');
 c.last_relationship_at=p.relationship_event_date;c.last_editorial_modified_at=p.editorial_last_modified;
 c.legacy_snapshot_v337=originals338[p.id];changed338.add(p.id);
}
if(changed338.size!==7)throw Error('V338: sete evoluções esperadas');
for(let i=0;i<data338.new_cards.length;i++){
 const c=data338.new_cards[i],id='CARD-'+String(1548+i).padStart(4,'0');
 if(!c||c.id!==id||currentMap.has(c.id)||c.active!==true||!c.front?.trim()||
 !c.back?.trim()||!c.expl?.trim()||data338.profiles[id]?.layers?.length!==11)
 throw Error('V338: cartão novo inválido '+id);
 base.push(c);currentMap.set(c.id,c);
}
for(const [id,p] of Object.entries(data338.profiles)){
 if(!currentMap.has(id)||p.layers.length!==11||p.paragraphs.length!==3)
 throw Error('V338: perfil ausente '+id);
 for(const rel of p.related_card_ids||[]){
  const c=currentMap.get(rel);
  if(!c||!data338.profiles[rel]?.related_card_ids?.includes(id))
   throw Error('V338: relação não recíproca '+id+'/'+rel);
  c.related_card_ids=[...new Set([...(c.related_card_ids||[]),id])];
 }
}
if(base.length!==1557||new Set(base.map(c=>c.id)).size!==1557)
 throw Error('V338: total de cartões inválido');
window.BM338Originals=Object.freeze(originals338);
window.BM338CatalogStatus=Object.freeze({version:'V338',cards:base.length,
 updated:7,created:11,srs_changed:false,originals_preserved:true});

// V340 · a questão original de peneiras (10+6) e a escala NBR6502, com imagem privada vinculada.
const r340=await fetch('assets/petro26_granulometry_delta_v340.json?v=340-1',{cache:'no-store'});
if(!r340.ok)throw Error('V340: conteúdo de granulometria indisponível');
const data340=await r340.json();
if(data340.format!=='BancoMestrePetro26GranulometryV340'||
 data340.counts?.new_cards!==1||data340.counts?.updated!==3||
 Object.keys(data340.profiles||{}).length!==4)
 throw Error('V340: pacote incompleto');
const originals340={},changed340=new Set();
for(const change of data340.updates){
 const c=currentMap.get(change.id);
 if(!c||c.active!==true||changed340.has(change.id)||!change.front?.trim()||
 !change.back?.trim()||change.paragraphs?.length!==3||
 data340.profiles[change.id]?.layers?.length!==11)
 throw Error('V340: cartão existente incompatível '+change.id);
 originals340[change.id]={front:c.front,back:c.back,expl:c.expl,
  mnemonic:c.mnemonic,reference:c.reference,
  related_card_ids:[...(c.related_card_ids||[])],
  related_question_ids:[...(c.related_question_ids||[])]};
 c.front=change.front;c.back=change.back;
 c.expl=change.paragraphs.join(String.fromCharCode(10,10));c.mnemonic=change.mnemonic;
 c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...change.related_card_ids])];
 c.related_question_ids=[...new Set([...(c.related_question_ids||[]),...change.related_question_ids])];
 c.media_ids=[...new Set([...(c.media_ids||[]),...change.media_ids])];
 c.last_relationship_at=change.relationship_event_date;
 c.last_editorial_modified_at=change.editorial_last_modified;
 c.legacy_snapshot_v339=originals340[change.id];changed340.add(change.id);
}
if(changed340.size!==3)throw Error('V340: esperado aprimoramento em 3 IDs');
const fresh340=data340.new_cards[0];
if(fresh340.id!=='CARD-1559'||currentMap.has(fresh340.id)||fresh340.active!==true||
 !fresh340.front||!fresh340.back||data340.profiles[fresh340.id]?.layers?.length!==11)
 throw Error('V340: cartão NBR6502 inválido');
base.push(fresh340);currentMap.set(fresh340.id,fresh340);
const targets340=new Set(['CARD-1559','CARD-0751','CARD-0752','CARD-0753']);
for(const [id,profile] of Object.entries(data340.profiles)){
 if(!targets340.has(id)||!profile.visuals?.[0]?.src||
 !currentMap.get(id))throw Error('V340: perfil/mídia não encontrado '+id);
 for(const rel of profile.related_card_ids||[]){
  const linked=currentMap.get(rel);
  if(!linked)throw Error('V340: vínculo sem cartão '+id+'/'+rel);
  if(targets340.has(rel)&&!data340.profiles[rel].related_card_ids.includes(id))
   throw Error('V340: vínculo sem reciprocidade '+id+'/'+rel);
  linked.related_card_ids=[...new Set([...(linked.related_card_ids||[]),id])];
 }
}
if(base.length!==1558||new Set(base.map(c=>c.id)).size!==1558)
 throw Error('V340: total esperado 1.558');
window.BM340Originals=Object.freeze(originals340);
window.BM340CatalogStatus=Object.freeze({version:'V340',cards:base.length,
 updated:3,created:1,original_question_image_preserved:true,
 original_image_id:'IMG-PETRO26-NM248-TAB1-01',srs_changed:false});

// V345 — dois cartões aprovados e evoluções aditivas Petrobras 28.
const r344=await fetch('assets/petro28_sync_v345.json?v=345-1',{cache:'no-store'});
if(!r344.ok)throw Error('V345: incremento indisponível');
const data344=await r344.json();
if(data344.format!=='BancoMestrePetro28V345'||data344.new_cards.length!==9||Object.keys(data344.profiles).length!==16||Object.keys(data344.proposals).length!==0)throw Error('V345: pacote incompleto');
for(const [cardId,p] of Object.entries(data344.profiles)){
 const c=currentMap.get(cardId);
 if(!c||p.layers.length!==11)throw Error('V345: cartão relacionado ausente '+cardId);
 c.legacy_snapshot_v343_p28={front:c.front,back:c.back,expl:c.expl,mnemonic:c.mnemonic,related_card_ids:[...(c.related_card_ids||[])]};
 if(p.front_override===true){c.front=p.front;c.back=p.back;}
 c.expl=[c.expl||'', 'Petrobras 28 — '+p.back, p.layers[9].texto].filter(Boolean).join('\n\n');
 c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...p.related_card_ids])];
 c.related_question_ids=[...new Set([...(c.related_question_ids||[]),p.question])];
 c.search_keywords=[c.search_keywords||'',p.title,p.front,p.back].join(' ');
}
for(const fresh of data344.new_cards){
 if(currentMap.has(fresh.id)||!data344.approved[fresh.id]||data344.approved[fresh.id].layers.length!==11||fresh.active!==true)throw Error('V345: conflito '+fresh.id);
 base.push(fresh);currentMap.set(fresh.id,fresh);
}
for(const p of [...Object.values(data344.profiles),...Object.values(data344.approved)])for(const rel of p.related_card_ids){
 const c=currentMap.get(rel);if(!c)throw Error('V345: relação sem destino '+rel);
 c.related_card_ids=[...new Set([...(c.related_card_ids||[]),p.id])];
}
for(const m of data344.media){for(const id of m.card_ids){const c=currentMap.get(id);if(!c)throw Error('V345: mídia sem cartão '+id);c.media_ids=[...new Set([...(c.media_ids||[]),m.media_id])];}}
if(base.length!==1567||new Set(base.map(c=>c.id)).size!==1567||base.filter(c=>c.active!==false).length!==1550)throw Error('V345: total esperado 1567/1550');
window.BM345CatalogStatus=window.BM344CatalogStatus=Object.freeze({version:'V345',cards:base.length,created:9,updated:16,srs_changed:false});


// V346: recuperação retroativa das propostas e evoluções Petrobras 24.
const p24r=await fetch('assets/petro24_regularizacao_v346.json?v=346-1',{cache:'no-store'});
if(!p24r.ok)throw Error('V346: Petrobras 24 indisponível');
const p24=await p24r.json();
if(p24.format!=='BancoMestrePetro24RegularizacaoV346'||p24.new_cards.length!==19||p24.existing_updates.length!==19||Object.keys(p24.profiles).length!==19)throw Error('V346: pacote inválido');
for(const x of p24.new_cards){if(currentMap.has(x.id)||!x.active||!x.front||!x.back||p24.profiles[x.id].layers.length!==11)throw Error('V346: cartão inválido '+x.id);base.push(x);currentMap.set(x.id,x);}
for(const u of p24.existing_updates){const c=currentMap.get(u.id);if(!c||!u.note)throw Error('V346: evolução inválida '+u.id);if(!String(c.expl||'').includes(u.note))c.expl=String(c.expl||'')+'\n\nPetrobras 24 — '+u.note;}
for(const u of p24.relations){const c=currentMap.get(u.id);if(!c)throw Error('V346: origem de vínculo ausente '+u.id);for(const rid of u.related_card_ids){if(!currentMap.has(rid))throw Error('V346: destino ausente '+rid);}c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...u.related_card_ids])];c.related_question_ids=[...new Set([...(c.related_question_ids||[]),...u.related_question_ids])];}
for(const x of p24.new_cards){for(const rid of x.related_card_ids){const c=currentMap.get(rid);if(!c)throw Error('V346: relação não resolvida '+rid);c.related_card_ids=[...new Set([...(c.related_card_ids||[]),x.id])];}}
if(base.length!==1586||new Set(base.map(c=>c.id)).size!==1586||base.filter(c=>c.active!==false).length!==1569)throw Error('V346: esperado catálogo 1586/1569');
window.BM346CatalogStatus=Object.freeze({version:'V346',cards:base.length,created:19,updated:19,srs_changed:false});

/* V347 — conciliação editorial PETRO20–29; somente conteúdo técnico público. */
const retro347=await fetch('assets/petro20_29_delta_v347.json?v=347-1').then(r=>{if(!r.ok)throw Error('V347 indisponível');return r.json()});
if(retro347.format!=='BancoMestreRetroV347'||retro347.new_cards.length!==15)throw Error('V347 inválida');
for(const c of retro347.new_cards){if(currentMap.has(c.id))throw Error('V347 ID duplicado '+c.id);base.push(c);currentMap.set(c.id,c);}
for(const [id,notes] of Object.entries(retro347.notes)){const c=currentMap.get(id);if(!c)throw Error('V347 falta '+id);for(const n of notes){if(!String(c.expl||'').includes(n.note))c.expl=(c.expl||'')+'\n\n'+n.note;}}
for(const [id,ids] of Object.entries(retro347.relations)){const c=currentMap.get(id);if(!c||ids.some(x=>!currentMap.has(x)))throw Error('V347 relação inválida '+id);c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...ids])];}
if(base.length!==1601||currentMap.size!==1601||base.filter(c=>c.active!==false).length!==1584)throw Error('V347 catálogo divergente');
window.BM347CatalogStatus={version:'V347',total:base.length,active:1584,new:15,proposalsResolved:11};

/* V348 — reparos recíprocos e camada visual sem dados privados. */
const vis348=await fetch('assets/visual_integrity_v348.json?v=348-1').then(r=>{if(!r.ok)throw Error('V348 indisponível');return r.json()});
for(const x of vis348.reciprocal_repairs){const c=currentMap.get(x.from);if(!c||!currentMap.has(x.to))throw Error('V348 vínculo inválido');c.related_card_ids=[...new Set([...(c.related_card_ids||[]),x.to])];}

 return base;
}
async function loadCivil(fetcher=fetch){
 const m=assertPublicFiles(await read('assets/meta_public_v194.json?v=194',fetcher));
 const all=await Promise.all(m.card_files.map(f=>read('assets/'+f+'?bm=194-fast1',fetcher)));
 const cards=await reconcile(all,fetcher,{});
 return {cards,version:'V348',catalog:'civil-public-v348'};
}
async function read(path,fetcher){const r=await fetcher(path,{cache:'no-store'});if(!r.ok)throw Error('Fonte pública indisponível: '+path);return r.json()}
root.BMOriginalCatalog=Object.freeze({reconcile,loadCivil});
})(globalThis);
