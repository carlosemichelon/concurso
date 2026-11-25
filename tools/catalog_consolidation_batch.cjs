'use strict';
// Generic, deterministic public consolidation. No Drive or SRS writes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),json=p=>JSON.parse(read(p)),write=(p,b)=>fs.writeFileSync(path.join(root,p),b);
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const cp=x=>JSON.parse(JSON.stringify(x)),uniq=a=>[...new Set(a.filter(Boolean))],nonempty=s=>typeof s==='string'&&s.trim().length>0;
const list=x=>Array.isArray(x)?x:x?[x]:[];
function apply(p,contract){
 assert.equal(contract.format,'BancoMestreConsolidationRelease1');
 assert.equal(blob(read(contract.source_path)),contract.source_blob,'Source snapshot changed');
 assert.equal(blob(Buffer.from(JSON.stringify(p))),contract.source_blob,'Reconstructed source differs');
 const map=new Map(p.base.map(c=>[c.id,c])), revisions=[], alias={}, seen=new Set();
 for(const f of contract.packets){
  const raw=read(f.path);assert.equal(blob(raw),f.git_blob,f.path);const q=JSON.parse(raw);
  assert.equal(q.format,'BancoMestreConsolidationCandidate1');assert.equal(q.source_catalog_blob,contract.source_blob);assert.equal(q.private_content_exported,false);assert.equal(q.private_srs_changed,false);
  for(const r of q.revisions){
   const ids=[r.id,...r.satellites];for(const id of ids){assert.ok(!seen.has(id),id+' reused');seen.add(id);const c=map.get(id);assert.ok(c&&c.active!==false&&!c.provisional,id+' inactive/missing');assert.equal(digest(c),r.source_hashes[id],id+' source changed');assert.deepEqual(c,r.source_material.find(x=>x.id===id),id+' source material mismatch');}
   assert.equal(r.modules.length,11,r.id);r.modules.forEach((m,i)=>assert.ok(m.ord===i+1&&nonempty(m.titulo)&&nonempty(m.texto),r.id+' module '+i));
   assert.equal(r.modules[0].texto,r.front);assert.equal(r.modules[1].texto,r.back);assert.equal(r.editorial.answer_paragraphs.join('\n\n'),r.back);
   assert.ok(r.editorial.highlights.some(h=>nonempty(h.text)&&r.back.includes(h.text)),r.id+' highlight');
   for(const m of r.editorial.media){if(m.src){assert.match(m.src,/^assets\/[A-Za-z0-9_./-]+$/);assert.ok(!m.src.includes('..')&&fs.existsSync(path.join(root,m.src)),m.src);}}
   for(const id of ids)for(const m of map.get(id).consolidation?.profile?.editorial?.media||[])assert.ok(r.editorial.media.some(n=>JSON.stringify(n)===JSON.stringify(m)),id+' media missing');
   for(const s of r.satellites){assert.equal(q.redirects[s],r.id);alias[s]=r.id;}
   revisions.push({...r,packet_path:f.path});
  }
 }
 assert.equal(revisions.length,contract.expected_groups);assert.equal(Object.keys(alias).length,contract.expected_absorbed);
 const prior=p.consolidation?.redirects||{},resolve=id=>{let x=id,visited=new Set();while(alias[x]||prior[x]){assert.ok(!visited.has(x),'redirect cycle '+id);visited.add(x);x=alias[x]||prior[x];}return x;};
 const valid=id=>map.has(id)&&!alias[id]&&map.get(id).active!==false;
 const links=(xs,self)=>uniq(xs.map(resolve)).filter(id=>id!==self&&valid(id));
 for(const r of revisions){
  const c=map.get(r.id),src=[r.id,...r.satellites].map(id=>map.get(id)),prev=c.consolidation,old=cp(c);
  const hist=uniq(src.flatMap(x=>[x.id,...(x.consolidation?.historical_ids||[])]));
  const rel=links([...src.flatMap(x=>x.related_card_ids||[]),...r.related_card_ids],r.id);
  const questions=uniq([...src.flatMap(x=>[...(x.related_question_ids||[]),...(x.consolidation?.profile?.related_question_ids||[])]),...r.related_question_ids]);
  const {source_material,source_hashes,media_reconciliation,packet_path,...fresh}=r;
  const profile={...fresh,satellites:uniq(hist.filter(x=>x!==r.id)),history_ref:{snapshot:contract.source_blob,ids:hist},related_card_ids:rel,related_question_ids:questions,editorial:{...r.editorial,status:'PUBLICACAO_AUTORIZADA_CONSOLIDACAO',history_collapsed:true,reveal_after_attempt:true}};
  c.front=r.front;c.back=r.back;c.expl=r.modules.slice(2).filter(m=>m.ord!==8).map(m=>m.titulo+'\n'+m.texto).join('\n\n');c.mnemonic=r.mnemonic;
  c.related_card_ids=rel;c.related_question_ids=questions;c.search_keywords=uniq([...src.flatMap(x=>list(x.search_keywords)),...hist,r.title]);
  c.consolidation={...prev,primary_id:r.id,historical_ids:hist,source_catalog_blob:contract.source_blob,original:prev?.original||{front:old.front,back:old.back,expl:old.expl,reference:old.reference,mnemonic:old.mnemonic},previous_version:{front:old.front,back:old.back,expl:old.expl,mnemonic:old.mnemonic,consolidation:prev||null},profile,source_packet:packet_path};
 }
 for(const c of p.base){if(alias[c.id])continue;if(Array.isArray(c.related_card_ids))c.related_card_ids=links(c.related_card_ids,c.id);}
 for(const r of revisions){const c=map.get(r.id);for(const id of c.related_card_ids){const n=map.get(id);n.related_card_ids=links([...(n.related_card_ids||[]),c.id],id);}}
 for(const c of p.base){if(alias[c.id])continue;const f=c.consolidation?.profile;if(f&&Array.isArray(c.related_card_ids)){f.related_card_ids=c.related_card_ids;if(revisions.some(r=>r.id===c.id))f.modules[7].texto='Origens preservadas: '+c.consolidation.historical_ids.join(', ')+'.'+(c.related_card_ids.length?' Relacionados: '+c.related_card_ids.join(', ')+'.':'');}}
 p.base=p.base.filter(c=>!alias[c.id]);p.retired_ids=uniq([...(p.retired_ids||[]),...Object.keys(alias)]).sort();
 p.counts={canonical:p.base.length,active:p.base.length,ijui:p.ijui.length};
 p.consolidation={...p.consolidation,primary_ids:uniq([...(p.consolidation?.primary_ids||[]).map(resolve),...revisions.map(r=>r.id)]),historical_ids:uniq([...(p.consolidation?.historical_ids||[]),...revisions.flatMap(r=>map.get(r.id).consolidation.historical_ids)]),redirects:Object.fromEntries([...Object.keys(prior),...Object.keys(alias)].map(id=>[id,resolve(id)])),private_srs_changed:false,latest_consolidation:{source:contract.source_blob,primary:revisions.length,satellites:Object.keys(alias).length,private_sync:'not_verified'}};
 assert.equal(p.base.length,contract.expected_active);assert.equal(new Set(p.base.map(c=>c.id)).size,p.base.length);
 for(const [id,target] of Object.entries(p.consolidation.redirects))if(alias[id]||alias[prior[id]])assert.ok(valid(target),'bad redirect '+id);
 return p;
}
function materialize(contractPath){
 const raw=read(contractPath),q=JSON.parse(raw),m=json('assets/version.json');
 assert.equal(m.catalog.path,q.source_path);assert.equal(m.catalog.git_blob,q.source_blob);assert.equal(m.catalog.display_version,q.source_version);
 const p=apply(json(q.source_path),q),out=Buffer.from(JSON.stringify(p)),snapshot='assets/catalog_snapshot_'+q.target_version.toLowerCase()+'.json';
 write(snapshot,out);const c=m.catalog,oldVersion=m.version;
 c.path=snapshot;c.git_blob=blob(out);c.display_version=q.target_version;c.counts=p.counts;c.private_sync='not_verified';c.consolidation_batches=[...(c.consolidation_batches||[]),{path:contractPath,git_blob:blob(raw)}];
 for(const k of ['cards','active','card_entries_combined','cards_public_active','cards_public_current','catalog_entries_unified','catalog_canonical_cards'])m.counts[k]=p.counts.active;
 m.previous_version=oldVersion;m.version=q.target_portal;m.home=q.target_portal.toLowerCase()+'.html';
 Object.assign(m.current_versions.portal,{version:m.version,home:m.home,previous:oldVersion});Object.assign(m.component_versions.site,{technical_version:m.version,home:m.home});m.component_versions.cards={version:q.target_version,technical_source:m.version,path:snapshot,counts:p.counts};
 m['release_'+q.target_version.toLowerCase()]={scope:'Consolidação autorizada de '+q.expected_groups+' grupos',updated_ids:q.packets.flatMap(f=>json(f.path).revisions.map(r=>r.id)),retired_ids:q.packets.flatMap(f=>Object.keys(json(f.path).redirects)),new_ids:0,private_sync:'not_verified',srs_modified:false,private_content_exported:false,rollback:q.source_version};
 write('assets/version.json',JSON.stringify(m,null,2)+'\n');
 let html=read('index.html').toString();const tags=[...html.matchAll(/data-bm-portal-version="(V\d+)"/g)];assert.equal(tags.length,1,'Expected single portal marker');const oldMarker=tags[0][1];assert.ok([oldVersion,'V'+(Number(oldVersion.slice(1))-1)].includes(oldMarker),'Unexpected portal marker');assert.ok(html===read(oldVersion.toLowerCase()+'.html').toString(),'Latest versioned home differs from index');assert.ok(/const BM_CATALOG=Object\.freeze\([^\n]+\);/.test(html));
 html=html.replaceAll('data-bm-portal-version="'+oldMarker+'"','data-bm-portal-version="'+m.version+'"').replace(/const BM_CATALOG=Object\.freeze\([^\n]+\);/,'const BM_CATALOG=Object.freeze('+JSON.stringify(c)+');').replace(new RegExp('(Cartões|Catálogo) '+q.source_version,'g'),'$1 '+q.target_version);
 write('index.html',html);write(m.home,html);console.log(JSON.stringify({version:q.target_version,counts:p.counts,blob:c.git_blob}));
}
module.exports={apply,materialize};
if(require.main===module)materialize(process.argv[2]||'assets/catalog_consolidation_request.json');
