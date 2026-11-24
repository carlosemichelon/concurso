'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const {applyConsolidation}=require('../tools/consolidacao_conceitual.cjs');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=fs.readFileSync(path.join(root,'assets/catalog_snapshot_v362.json')),catalog=JSON.parse(raw);
const packet=JSON.parse(read('candidatos/consolidacao_conceitual_25_v1.json'));
const out=applyConsolidation(catalog,packet),old=new Map(catalog.base.map(c=>[c.id,c])),current=new Map(out.base.map(c=>[c.id,c])),aliases=out.consolidation.redirects;
test('fonte imutável e 81 IDs distintos',()=>{assert.equal(crypto.createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex'),packet.source_catalog_blob);assert.equal(new Set(packet.revisions.flatMap(r=>[r.id,...r.satellites])).size,81);assert.equal(out.base.length,catalog.base.length);assert.deepEqual(out.base.map(c=>c.id),catalog.base.map(c=>c.id));assert.equal(out.counts.active,catalog.counts.active-56)});
test('remissões não apagam registros nem transferem avaliações',()=>{assert.equal(Object.keys(aliases).length,56);for(const [id,target] of Object.entries(aliases)){const c=current.get(id),b=old.get(id);assert.equal(c.active,false);assert.equal(c.consolidated_into,target);for(const k of ['front','back','expl','reference'])assert.equal(c[k],b[k])}assert.deepEqual(out.globals,catalog.globals);assert.deepEqual(out.meta,catalog.meta);assert.equal(out.consolidation.private_srs_changed,false)});
test('aplicação idempotente e nenhuma alteração não relacionada de frente/verso',()=>{assert.deepEqual(applyConsolidation(out,packet),out);for(const c of catalog.base){if(!out.consolidation.historical_ids.includes(c.id)){const after=current.get(c.id);for(const k of ['front','back','expl','active'])assert.equal(after[k],c[k])}}});
test('toda relação ativa aponta para o núcleo, sem autorreferência',()=>{for(const c of out.base.filter(c=>c.active!==false))for(const id of c.related_card_ids||[]){assert.notEqual(id,c.id);assert.equal(aliases[id],undefined)}});
test('perfil completo: 11 módulos distintos, grifos localizados, tabela real',()=>{for(const r of packet.revisions){assert.equal(r.modules.length,11);assert.equal(new Set(r.modules.map(m=>m.texto)).size,11);assert.ok(r.modules.every((m,i)=>m.ord===i+1&&m.texto.trim()));assert.ok(r.editorial.highlights.length);for(const h of r.editorial.highlights)assert.equal(r.back.slice(h.start,h.end),h.text);assert.ok(r.editorial.table.rows.every(row=>row.length===r.editorial.table.headers.length));}});
test('leitor autônomo: contagens, respostas recolhidas, nenhum canal de SRS',()=>{const h=read('candidatos/leitor_consolidado_25.html');for(const [regex,n] of [[/<article class="card"/g,25],[/<table>/g,25],[/<math /g,17],[/<figure data-media-id=/g,26],[/<img loading="lazy"/g,17],[/data-private-original="true"/g,9],[/<details class="reveal">/g,25]])assert.equal((h.match(regex)||[]).length,n);assert.doesNotMatch(h,/(localStorage|sessionStorage|fetch\(|XMLHttpRequest|indexedDB)/);for(const id of Object.keys(aliases))assert.ok(h.includes(id));for(const r of packet.revisions)for(const m of r.editorial.media)assert.ok(h.includes('data-media-id="'+m.id+'"'),m.id);});

test('v015 — união de mídias por origem, inclusive satélites e originais privados',()=>{
 const readJson=p=>JSON.parse(read(p));
 const owner=new Map(packet.revisions.flatMap(c=>[c.id,...c.satellites].map(id=>[id,c])));
 const expected=[];
 const put=(id,m,privateMedia,role)=>{if(owner.has(id))expected.push({id,m,privateMedia,role})};
 for(const file of ['assets/restauracao_didatica_v349.json','assets/restauracao_legados_v349.json']){
  for(const [id,r] of Object.entries(readJson(file).cards))
   for(const m of r.learning_model?.media?.items||[])put(id,m.id,!!m.private_original,m.role);
 }
 const legacy=readJson('assets/card_media_integrity_v342.json');
 for(const m of legacy.public_visuals)for(const id of m.card_ids)put(id,m.media_id,false,'VERSO_APOS_TENTATIVA');
 for(const m of legacy.private_originals)for(const id of m.card_ids)put(id,m.media_id,true,'VERSO_APOS_TENTATIVA');
 for(const [id,items] of Object.entries(readJson('assets/petro15_16_incremento_v366.json').media_cards))
  for(const m of items)put(id,m.id,true,'VERSO_APOS_TENTATIVA');
 assert.ok(expected.length>0,'Fontes históricas vazias ou não lidas');
 const omissions=[];
 for(const x of expected){
  const primary=owner.get(x.id), media=primary.editorial.media||[];
  const found=media.find(m=>m.id===x.m&&m.original_card_ids?.includes(x.id)&&
   !!m.private_original===x.privateMedia&&m.role===x.role&&
   (x.privateMedia||m.src||m.inline_svg));
  if(!found)omissions.push(primary.id+' <- '+x.id+' / '+x.m+' / '+x.role);
 }
 assert.deepEqual(omissions,[],'Perda de mídia, origem, privacidade ou papel pedagógico');
 for(const c of packet.revisions){
  const media=c.editorial.media||[];
  assert.equal(new Set(media.map(m=>m.id)).size,media.length,'Duplicata '+c.id);
  for(const m of media){
   assert.ok(!m.private_original||(!m.src&&!m.inline_svg),'Original privado exposto: '+m.id);
   if(m.src){assert.ok(m.src.startsWith('assets/'));assert.ok(fs.existsSync(path.join(root,m.src)),'Arquivo ausente: '+m.id)}
  }
 }
});
