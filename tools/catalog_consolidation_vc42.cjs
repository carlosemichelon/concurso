'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const unique=a=>[...new Set(a.filter(Boolean))];
function applyConsolidation42(p,q){
 const block=new Set(["CARD-1005","CARD-0703","CARD-0872"]),rs=q.revisions.filter(r=>!block.has(r.id)),alias=Object.fromEntries(rs.flatMap(r=>r.satellites.map(id=>[id,r.id]))),map=new Map(p.base.map(c=>[c.id,c])),origRedirect=p.consolidation?.redirects||{},canon=id=>alias[id]||id;
 assert.equal(p.base.length,1582);assert.equal(rs.length,32);assert.equal(Object.keys(alias).length,56);
 // Validate the entire input before altering any shared object.
 for(const r of rs){const ids=[r.id,...r.satellites];assert.ok(ids.every(id=>map.has(id)&&map.get(id).active!==false),r.id);assert.equal(r.modules.length,11);assert.ok(r.modules.every((m,i)=>m.ord===i+1&&m.texto.trim()));for(const s of r.source_material){const t=map.get(s.id);assert.ok(t&&["front","back","expl","mnemonic","reference"].every(k=>s[k]===t[k]),s.id)}}
 for(const r of rs){
  const ids=[r.id,...r.satellites],c=map.get(r.id),src=ids.map(id=>map.get(id)),prev=c.consolidation,original={front:c.front,back:c.back,expl:c.expl,mnemonic:c.mnemonic,reference:c.reference};
  const links=unique([...src.flatMap(t=>t.related_card_ids||[]),...r.related_card_ids].map(canon)).filter(id=>id!==r.id&&map.has(id)&&!alias[id]);
  const questions=unique([...src.flatMap(t=>t.related_question_ids||[]),...r.related_question_ids]),keywords=unique([...src.flatMap(t=>Array.isArray(t.search_keywords)?t.search_keywords:[t.search_keywords]),...r.satellites,r.title]);
  const media=r.editorial.media.map(m=>({...m,role:m.role==="FRONT_ENUNCIADO"?m.role:"VERSO_APOS_TENTATIVA"}));
  const {source_material,media_reconciliation,editorial_status,...rest}=r;
  const profile={...rest,source:r.modules[2].texto,related_card_ids:links,related_question_ids:questions,editorial:{...r.editorial,media,status:"PUBLICACAO_AUTORIZADA_CONSOLIDACAO_VC42",history_collapsed:true,reveal_after_attempt:true}};
  c.front=r.front;c.back=r.back;c.expl=r.modules.slice(2).filter(m=>m.ord!==8).map(m=>m.titulo+"\n"+m.texto).join("\n\n");c.mnemonic=r.mnemonic;c.related_card_ids=links;c.related_question_ids=questions;c.search_keywords=keywords;
  c.consolidation={...prev,primary_id:r.id,historical_ids:unique([...src.flatMap(t=>t.consolidation?.historical_ids||[t.id]),...ids]),source_catalog_blob:q.source_catalog_blob,original:prev?.original||original,profile,source_packet:"increments/consolidacao-vc41-candidata-20261124.json"};
 }
 for(const c of p.base){if(alias[c.id])continue;if(Array.isArray(c.related_card_ids))c.related_card_ids=unique(c.related_card_ids.map(canon)).filter(id=>id!==c.id&&map.has(id)&&!alias[id]);}
 for(const r of rs){const c=map.get(r.id);for(const id of c.related_card_ids){const t=map.get(id);t.related_card_ids=unique([...(t.related_card_ids||[]),c.id]);}}
 for(const c of p.base){if(alias[c.id])continue;if(c.consolidation?.profile&&Array.isArray(c.related_card_ids))c.consolidation.profile.related_card_ids=c.related_card_ids;}
 p.base=p.base.filter(c=>!alias[c.id]);p.retired_ids=unique([...(p.retired_ids||[]),...Object.keys(alias)]).sort();p.counts={canonical:p.base.length,active:p.base.length,ijui:p.ijui.length};
 p.consolidation={...p.consolidation,primary_ids:unique([...(p.consolidation.primary_ids||[]).map(canon),...rs.map(r=>r.id)]),historical_ids:unique([...(p.consolidation.historical_ids||[]),...rs.flatMap(r=>[r.id,...r.satellites])]),redirects:{...Object.fromEntries(Object.entries(origRedirect).map(([id,v])=>[id,canon(v)])),...alias},private_srs_changed:false,latest_consolidation:{source:q.source_catalog_blob,primary:32,satellites:56,deferred:[...block],private_sync:"not_verified"}};
 assert.equal(p.base.length,1526);assert.equal(new Set(p.base.map(c=>c.id)).size,1526);return p;
}
module.exports={applyConsolidation42};
if(require.main===module){
 const path='increments/consolidacao-vc41-candidata-20261124.json',raw=fs.readFileSync(path),q=JSON.parse(raw),version=JSON.parse(fs.readFileSync('assets/version.json')),old=fs.readFileSync(version.catalog.path),hash=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
 assert.equal(version.catalog.display_version,'VC41');assert.equal(hash(old),q.source_catalog_blob);assert.equal(version.catalog.git_blob,q.source_catalog_blob);
 const p=applyConsolidation42(JSON.parse(old),q),out=Buffer.from(JSON.stringify(p)),snapshot='assets/catalog_snapshot_vc42.json',oldVersion=version.version;
 fs.writeFileSync(snapshot,out);
 const c=version.catalog;c.path=snapshot;c.git_blob=hash(out);c.display_version='VC42';c.counts=p.counts;c.private_sync='not_verified';c.consolidation_vc42={path,git_blob:hash(raw),scope:'32 principais / 56 remissões; 3 grupos mantidos'};
 const counts=version.counts;for(const k of ['cards','active','card_entries_combined','cards_public_active','cards_public_current','catalog_entries_unified','catalog_canonical_cards'])counts[k]=1526;
 version.previous_version=oldVersion;version.version='V404';version.home='v404.html';Object.assign(version.current_versions.portal,{version:'V404',home:'v404.html',previous:oldVersion});Object.assign(version.component_versions.site,{technical_version:'V404',home:'v404.html'});version.component_versions.cards={version:'VC42',technical_source:'V404',path:snapshot,counts:p.counts};version.release_vc42={scope:'Consolidação autorizada: 32 cartões principais, 56 remissões; 3 grupos com figuras pendentes preservados ativos.',updated_ids:q.revisions.filter(r=>!['CARD-1005','CARD-0703','CARD-0872'].includes(r.id)).map(r=>r.id),retired_ids:Object.keys(q.redirects).filter(id=>p.retired_ids.includes(id)),new_ids:0,private_sync:'not_verified',srs_modified:false,private_content_exported:false,rollback:'VC41'};
 fs.writeFileSync('assets/version.json',JSON.stringify(version,null,2)+'\n');
 let html=fs.readFileSync('index.html','utf8');html=html.replace(/data-bm-portal-version="V403"/g,'data-bm-portal-version="V404"').replace(/const BM_CATALOG=Object\.freeze\([^\n]+\);/,'const BM_CATALOG=Object.freeze('+JSON.stringify(c)+');').replace(/(Cartões|Catálogo) VC41/g,'$1 VC42');
 fs.writeFileSync('index.html',html);fs.writeFileSync('v404.html',html);
 let gen=fs.readFileSync('tools/catalog_snapshot.cjs','utf8');const target='validate(evolved,c);return evolved;';assert.ok(gen.includes(target));gen=gen.replace(target,"if(c.consolidation_vc42){const raw=fs.readFileSync(path.join(root,c.consolidation_vc42.path));assert.equal(blobHash(raw),c.consolidation_vc42.git_blob);evolved=require('./catalog_consolidation_vc42.cjs').applyConsolidation42(evolved,JSON.parse(raw));}"+target);fs.writeFileSync('tools/catalog_snapshot.cjs',gen);
 console.log(JSON.stringify({version:'VC42',counts:p.counts,source:q.source_catalog_blob,blob:c.git_blob,private_sync:'not_verified'}));
}
