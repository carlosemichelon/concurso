'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p));
const digest=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const cp=o=>JSON.parse(JSON.stringify(o));
const nonempty=s=>typeof s==='string'&&s.trim().length>0;
const unique=a=>[...new Set(a)];
function withoutRelations(c){const x=cp(c);delete x.related_card_ids;if(x.consolidation?.profile)delete x.consolidation.profile.related_card_ids;return x;}
function apply(p,contract){
 const sourceRaw=read(contract.source_path);assert.equal(blob(sourceRaw),contract.source_blob,'origem histórica divergente');
 const orig=JSON.parse(sourceRaw),historical=new Map(orig.base.map(c=>[c.id,c])),map=new Map(p.base.map(c=>[c.id,c]));
 const seen=new Set(),revisions=[],newMedia=new Set();
 for(const file of contract.packets){const raw=read(file.path);assert.equal(blob(raw),file.blob,file.path);const j=JSON.parse(raw);assert.equal(j.format,'BancoMestreEvolution1');assert.equal(j.private_content_exported,false);for(const r of j.revisions){
  assert.ok(!seen.has(r.id),'ID duplicado '+r.id);seen.add(r.id);
  const c=map.get(r.id),h=historical.get(r.id);assert.ok(c&&h&&c.active!==false&&!c.provisional,'ID inválido '+r.id);
  assert.equal(digest(h),r.expected_hash,'hash de origem '+r.id);
  assert.deepEqual(withoutRelations(c),withoutRelations(h),'conflito de conteúdo '+r.id);
  for(const k of ['title','front','back','source','mnemonic'])assert.ok(nonempty(r[k]),r.id+' '+k);
  assert.equal(r.modules.length,11,r.id);r.modules.forEach((m,i)=>assert.ok(m.ord===i+1&&nonempty(m.titulo)&&nonempty(m.texto),r.id+' módulo '+(i+1)));
  assert.equal(new Set(r.modules.map(m=>m.texto.trim())).size,11,r.id+' repetição de módulos');
  assert.equal(r.modules[0].texto,r.front,r.id+' frente');assert.equal(r.modules[1].texto,r.back,r.id+' verso');
  assert.ok(Array.isArray(r.editorial?.media)&&Array.isArray(r.editorial?.answer_paragraphs),r.id+' editorial');
  assert.equal(r.editorial.answer_paragraphs.join('\n\n'),r.back,r.id+' parágrafos');
  for(const m of r.editorial.media){assert.ok(nonempty(m.id)&&nonempty(m.role),r.id+' mídia');if(m.src){assert.match(m.src,/^assets\/[A-Za-z0-9_./-]+$/);assert.ok(!m.src.includes('..')&&fs.existsSync(path.join(root,m.src)),r.id+' arquivo '+m.src);if(!c.consolidation?.profile?.editorial?.media?.some(x=>x.id===m.id&&x.role===m.role))newMedia.add(m.src);}}
  assert.ok(r.editorial.highlights?.some(x=>nonempty(x.text)&&r.back.includes(x.text)),r.id+' grifo');
  for(const id of r.related_card_ids)assert.ok(id!==r.id&&map.has(id),r.id+' relação '+id);
  revisions.push(r);
 }}
 assert.equal(seen.size,contract.expected_count);
 const beforeIds=p.base.map(c=>c.id),counts=cp(p.counts);
 for(const r of revisions){const c=map.get(r.id),prev=c.consolidation,old=cp(c),profile=prev?.profile||{},e=profile.editorial||{};
  const media=[...(e.media||[])];for(const m of r.editorial.media){const x=media.find(q=>q.id===m.id&&q.role===m.role);if(x)assert.deepEqual(x,m,r.id+' mídia anterior alterada '+m.id);else media.push(m);}
  const rel=unique([...(c.related_card_ids||[]),...r.related_card_ids]);const hist=prev?.historical_ids||[c.id];
  const {expected_hash,...fresh}=r;
  const editor={...e,...r.editorial,media,history_collapsed:true,reveal_after_attempt:true};
  editor.highlights=editor.highlights.filter(x=>nonempty(x.text)&&r.back.includes(x.text));
  const modules=cp(r.modules);modules[7].texto=rel.join(', ')||modules[7].texto;
  c.front=r.front;c.back=r.back;c.expl=modules.slice(2).filter(x=>x.ord!==8).map(x=>x.titulo+'\n'+x.texto).join('\n\n');c.mnemonic=r.mnemonic;c.related_card_ids=rel;
  c.search_keywords=unique([...(c.search_keywords||[]),r.title]);
  c.consolidation={...prev,primary_id:c.id,historical_ids:hist,source_catalog_blob:contract.base_blob,original:prev?.original||{front:old.front,back:old.back,expl:old.expl,reference:old.reference,mnemonic:old.mnemonic},previous_version:{front:old.front,back:old.back,expl:old.expl,mnemonic:old.mnemonic,consolidation:prev||null},profile:{...profile,...fresh,modules,editorial:editor,satellites:profile.satellites||[],related_question_ids:unique([...(profile.related_question_ids||[]),...(c.related_question_ids||[])]),related_card_ids:rel,history_ref:{snapshot:contract.base_blob,ids:hist}}};
 }
 for(const r of revisions){const c=map.get(r.id);for(const id of c.related_card_ids){const t=map.get(id);if(!t)continue;t.related_card_ids=unique([...(t.related_card_ids||[]),c.id]);if(t.consolidation?.profile)t.consolidation.profile.related_card_ids=t.related_card_ids;}}
 for(const r of revisions){const c=map.get(r.id),f=c.consolidation.profile;f.modules[7].texto=c.related_card_ids.join(', ')||f.modules[7].texto;assert.equal(f.modules.length,11);for(const m of historical.get(r.id).consolidation?.profile?.editorial?.media||[])assert.ok(f.editorial.media.some(x=>JSON.stringify(x)===JSON.stringify(m)),r.id+' mídia perdida');}
 if(p.consolidation)for(const k of ['primary_ids','historical_ids'])p.consolidation[k]=unique([...(p.consolidation[k]||[]),...seen]);
 assert.deepEqual(p.base.map(c=>c.id),beforeIds);assert.deepEqual(p.counts,counts);
 p.evolution_release={source_blob:contract.source_blob,base_blob:contract.base_blob,ids:[...seen],modules:seen.size*11,new_media:[...newMedia].sort(),private_srs_changed:false};
 return p;
}
module.exports={apply};
