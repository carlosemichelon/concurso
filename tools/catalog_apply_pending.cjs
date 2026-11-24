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
if((m.catalog.evolution_batches||[]).some(b=>b.path===request.packet)){console.log('Lote já integrado');process.exit(0)}
assert.equal(blobHash(read('assets/version.json')),request.source_manifest_blob,'Manifesto alterado');
assert.equal(m.catalog.git_blob,request.source_catalog_blob,'Catálogo alterado');
assert.equal(Number(request.target_version.slice(2)),Number(m.catalog.display_version.slice(2))+1,'Versão inválida');
const oldRaw=read(m.catalog.path);assert.equal(blobHash(oldRaw),m.catalog.git_blob);
const old=JSON.parse(oldRaw);validate(old,m.catalog);
const packetRaw=read(request.packet),packet=JSON.parse(packetRaw);
const result=applyEvolutionBatch(old,packet);
const raw=Buffer.from(JSON.stringify(result),'utf8');
const nextPath='assets/catalog_snapshot_'+request.target_version.toLowerCase()+'.json';
assert.ok(!fs.existsSync(path.join(root,nextPath)),'Destino já existe');
const c={...m.catalog,path:nextPath,git_blob:blobHash(raw),display_version:request.target_version,evolution_batches:[...(m.catalog.evolution_batches||[]),{path:request.packet,git_blob:blobHash(packetRaw)}],private_sync:'not_verified'};
validate(result,c);
const html=read(m.home).toString('utf8');assert.equal(read('index.html').toString('utf8'),html);
const re=/const BM_CATALOG=Object\.freeze\(([^\n]+)\);/;
assert.ok(re.test(html));assert.deepEqual(JSON.parse(html.match(re)[1]),m.catalog);
const nextHtml=html.replace(re,()=>`const BM_CATALOG=Object.freeze(${JSON.stringify(c)});`);
m.catalog=c;m.component_versions.cards={...m.component_versions.cards,version:request.target_version,path:nextPath,counts:c.counts};
m['release_'+request.target_version.toLowerCase()]={scope:request.scope,updated_ids:packet.revisions.map(x=>x.id),new_ids:0,private_sync:'not_verified',srs_modified:false,private_content_exported:false,rollback:request.source_version};
m.notes=(m.notes||'')+'\n'+request.target_version+': '+request.scope;
write(nextPath,raw);write(m.home,nextHtml);write('index.html',nextHtml);write('assets/version.json',JSON.stringify(m,null,2)+'\n');
console.log(JSON.stringify({catalog:c.path,git_blob:c.git_blob,updated_ids:packet.revisions.map(x=>x.id),counts:c.counts}));
