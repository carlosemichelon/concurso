'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {build,validate,blobHash,check}=require('./catalog_snapshot.cjs');
(async()=>{
 await check();
 const m=JSON.parse(fs.readFileSync('assets/version.json','utf8')),old=fs.readFileSync(m.home,'utf8'),original=JSON.parse(fs.readFileSync(m.catalog.path,'utf8'));
 assert.equal(m.catalog.git_blob,'fcc47722446725c3fa4f35420beae2741b94216b');assert.equal(m.version,'V396');
 const batch=JSON.parse(fs.readFileSync('tools/estudos_29_38_contract.json','utf8'));
 const c={...m.catalog,path:'assets/catalog_snapshot_vc31.json',display_version:'VC31',evolution_batch:batch};
 delete c.git_blob;
 const p=await build(old,c);validate(p,c);assert.equal(p.evolution_release.ids.length,67);assert.equal(p.counts.active,1573); const oldMap=new Map(original.base.map(x=>[x.id,x])),newMap=new Map(p.base.map(x=>[x.id,x])); for(const id of m.release_vc30.updated_ids){assert.equal(newMap.get(id).front,oldMap.get(id).front,id);assert.equal(newMap.get(id).back,oldMap.get(id).back,id);}
 const raw=Buffer.from(JSON.stringify(p));c.git_blob=blobHash(raw);fs.writeFileSync(c.path,raw,{flag:'wx'});
 m.catalog=c;m.previous_version=m.version;m.version='V397';m.home='v397.html';m.updated_utc='2026-11-24';
 m.current_versions.portal={...m.current_versions.portal,version:m.version,home:m.home,previous:m.previous_version};
 m.component_versions.site={...m.component_versions.site,technical_version:m.version,home:m.home};
 m.component_versions.cards={version:'VC31',technical_source:m.version,path:c.path,counts:c.counts};
 m.component_versions.images={version:'VI9',scope:'SVGs autorais associados às evoluções publicadas; originais privados não exportados.'};
 m.release_vc31={scope:'Estudos 29–38, evoluções de IDs existentes',updated_ids:p.evolution_release.ids,modules:737,new_cards:0,media:{new_svg:p.evolution_release.new_media.length},private_sync:'not_verified',srs_modified:false,private_content_exported:false,rollback:'VC30'};
 m.notes='VC31/VI9: integração de 67 evoluções dos estudos 29–38, 737 módulos, sem novos IDs ou alteração SRS. VS9 preservada.\n'+m.notes;
 const html=old.replace('data-bm-portal-version="V396"','data-bm-portal-version="V397"').replace(/const BM_CATALOG=Object\.freeze\(([^\n]+)\);/,'const BM_CATALOG=Object.freeze('+JSON.stringify(c)+');');
 assert.notEqual(html,old);fs.writeFileSync(m.home,html,{flag:'wx'});fs.writeFileSync('index.html',html);fs.writeFileSync('assets/version.json',JSON.stringify(m,null,2)+'\n');
 console.log(JSON.stringify(await check()));console.log(JSON.stringify(p.evolution_release));
})().catch(e=>{console.error(e);process.exitCode=1});
