'use strict';
// Materializa um lote de evoluções de IDs existentes no catálogo oficial em uma branch candidata.
// Não escreve Drive/SRS, não publica em produção e não modifica o renderizador.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {blobHash,validate}=require('./catalog_snapshot.cjs');
const {applyEvolutionBatch}=require('./catalog_evolution_batch.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),json=p=>JSON.parse(read(p)),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const request=json('assets/catalog_evolution_request.json'),m=json('assets/version.json');
assert.match(request.packet,/^assets\/[a-zA-Z0-9_.-]+\.json$/);
assert.match(request.target_version,/^VC[0-9]+$/);
if([...(m.catalog.evolution_batches||[]),...(m.catalog.post_evolution_batches||[]),...(m.catalog.new_card_batches||[]),...(m.catalog.final_evolution_batches||[]),...(m.catalog.incremental_batches||[])].some(b=>b.path===request.packet)){console.log('Lote já integrado');process.exit(0)}
assert.equal(blobHash(read('assets/version.json')),request.source_manifest_blob,'Manifesto alterado');
assert.equal(m.catalog.git_blob,request.source_catalog_blob,'Catálogo alterado');
assert.equal(Number(request.target_version.slice(2)),Number(m.catalog.display_version.slice(2))+1,'Versão inválida');
const oldRaw=read(m.catalog.path);assert.equal(blobHash(oldRaw),m.catalog.git_blob);
const old=JSON.parse(oldRaw);validate(old,m.catalog);
if(request.recipe){const recipe=json(request.recipe),map=new Map(old.base.map(c=>[c.id,c]));const revisions=recipe.changes.map(x=>{const c=map.get(x.id);assert.ok(c&&c.active!==false);assert.equal(c.front,x.expected_front,x.id+' frente alterada');assert.equal(c.back,x.expected_back,x.id+' verso alterado');const rev=x.revision;const e=c.consolidation?.profile?.editorial||{};rev.editorial.media=[...(e.media||[]),...rev.editorial.media.filter(m=>!(e.media||[]).some(n=>n.id===m.id&&n.role===m.role))];rev.related_card_ids=[...new Set([...(c.related_card_ids||[]),...rev.related_card_ids])];return {...rev,expected_hash:require('./catalog_evolution_batch.cjs').digest(c)}});write(request.packet,JSON.stringify({format:'BancoMestreEvolution1',private_content_exported:false,revisions},null,2));}
const packetRaw=read(request.packet),packet=JSON.parse(packetRaw);
const adding=packet.format==='BancoMestreNewCards1';
const result=adding?require('./catalog_new_cards.cjs').applyNewCards(old,packet):applyEvolutionBatch(old,packet);
const raw=Buffer.from(JSON.stringify(result),'utf8');
const nextPath='assets/catalog_snapshot_'+request.target_version.toLowerCase()+'.json';
assert.ok(!fs.existsSync(path.join(root,nextPath)),'Destino já existe');
const c={...m.catalog,path:nextPath,git_blob:blobHash(raw),display_version:request.target_version,counts:result.counts,incremental_batches:[...(m.catalog.incremental_batches||[]),{path:request.packet,git_blob:blobHash(packetRaw),kind:adding?'new':'evolution'}],private_sync:'not_verified'};
validate(result,c);
const html=read(m.home).toString('utf8');assert.equal(read('index.html').toString('utf8'),html);
const re=/const BM_CATALOG=Object\.freeze\(([^\n]+)\);/;
assert.ok(re.test(html));assert.deepEqual(JSON.parse(html.match(re)[1]),m.catalog);
let nextHtml=html.replace(re,()=>`const BM_CATALOG=Object.freeze(${JSON.stringify(c)});`);
if(adding){for(const k of ['cards','active','cards_public_current','catalog_canonical_cards','card_entries_combined','catalog_entries_unified','cards_public_active'])m.counts[k]=result.counts.active; m.counts.card_operational_ijui=result.counts.ijui;}
m.catalog=c;m.component_versions.cards={...m.component_versions.cards,version:request.target_version,path:nextPath,counts:c.counts};
m['release_'+request.target_version.toLowerCase()]={scope:request.scope,updated_ids:adding?[]:packet.revisions.map(x=>x.id),new_ids:adding?packet.new_cards.length:0,added_ids:adding?packet.new_cards.map(x=>x.id):[],private_sync:'not_verified',srs_modified:false,private_content_exported:false,rollback:request.source_version};
if(request.reader_release){const q=request.reader_release;assert.equal(m.home,q.base_home);assert.ok(nextHtml.includes(q.old_script));nextHtml=nextHtml.replace(q.old_script,q.new_script).replace('data-bm-portal-version="'+m.version+'"','data-bm-portal-version="'+q.version+'"').replace('Banco Mestre '+m.component_versions.site.version+' —','Banco Mestre '+q.site_version+' —');m.previous_version=m.version;m.version=q.version;m.home=q.home;m.current_versions.portal={...m.current_versions.portal,version:q.version,home:q.home,previous:m.previous_version,display_version:q.site_version};m.component_versions.site={version:q.site_version,technical_version:q.version,home:q.home};m.component_versions.method={version:'VM9',previous:'VM8',scope:'Português e legibilidade; checkpoint de 50 IDs preservado'};}
m.notes=(m.notes||'')+'\n'+request.target_version+': '+request.scope;
write(nextPath,raw);write(m.home,nextHtml);write('index.html',nextHtml);write('assets/version.json',JSON.stringify(m,null,2)+'\n');
console.log(JSON.stringify({catalog:c.path,git_blob:c.git_blob,updated_ids:adding?[]:packet.revisions.map(x=>x.id),added_ids:adding?packet.new_cards.map(x=>x.id):[],counts:c.counts}));
