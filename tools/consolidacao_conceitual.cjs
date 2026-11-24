'use strict';
// Compilação offline: sem escrita no SRS ou publicação.
const fs=require('node:fs'),crypto=require('node:crypto');
function applyConsolidation(catalog,delta){
 const copy=JSON.parse(JSON.stringify(catalog)),cards=copy.base,old=new Map(cards.map(c=>[c.id,c])),revisions=delta.revisions,all=revisions.flatMap(r=>[r.id,...r.satellites]);if(cards.length!==new Set(cards.map(c=>c.id)).size||revisions.length!==25||all.length!==81||new Set(all).size!==81)throw Error('Identidades divergentes');
 const packetRevision=crypto.createHash('sha256').update(JSON.stringify(delta)).digest('hex');
 if(copy.consolidation){if(copy.consolidation.packet_signature===packetRevision)return copy;throw Error('Catálogo já consolidado com lote distinto');}
 if(all.some(id=>!old.has(id)||old.get(id).active===false))throw Error('ID ausente/inativo: revalidar fonte antes da consolidação');
 const alias=new Map(revisions.flatMap(r=>r.satellites.map(s=>[s,r.id]))),canonical=id=>alias.get(id)||id,unique=xs=>[...new Set(xs)],rewrite=(links,self)=>unique((links||[]).map(canonical)).filter(x=>x!==self);
 for(const r of revisions){const c=old.get(r.id),sources=[c,...r.satellites.map(s=>old.get(s))];if(r.modules.length!==11||r.modules.some((m,i)=>m.ord!==i+1||!m.texto.trim()))throw Error('Módulos inválidos '+r.id);c.front=r.front;c.back=r.back;c.expl=r.modules.slice(2).filter(m=>m.ord!==8).map(m=>m.titulo+'\n'+m.texto).join('\n\n');c.mnemonic=r.mnemonic;c.related_card_ids=rewrite(sources.flatMap(x=>x.related_card_ids||[]).concat(r.related_card_ids||[]),c.id);c.related_question_ids=unique(sources.flatMap(x=>x.related_question_ids||[]).concat(r.related_question_ids||[]));c.search_keywords=unique([...(c.search_keywords||[]),...r.satellites,r.title]);c.consolidation={primary_id:r.id,historical_ids:[r.id,...r.satellites],source_catalog_blob:delta.source_catalog_blob,profile:r};}
 for(const [id,primary] of alias){const c=old.get(id);c.active=false;c.consolidated_into=primary;c.consolidation_status='REDUNDANCIA_HISTORICO_PRESERVADO';}
 for(const c of [...cards,...copy.ijui]){if(c.consolidated_into)continue;if(Array.isArray(c.related_card_ids))c.related_card_ids=rewrite(c.related_card_ids,c.id);}
 copy.counts={...copy.counts,active:cards.filter(c=>c.active!==false).length};
 copy.consolidation={source_catalog_blob:delta.source_catalog_blob,packet_signature:packetRevision,primary_ids:revisions.map(r=>r.id),redirects:Object.fromEntries(alias),historical_ids:all,private_srs_changed:false,publication_status:'CANDIDATO_NAO_PUBLICADO'};
 return copy;
}
module.exports={applyConsolidation};
if(require.main===module){const [input,deltaPath,output]=process.argv.slice(2);if(!input||!deltaPath||!output||input===output)throw Error('Uso: node tools/consolidacao_conceitual.cjs snapshot.json delta.json snapshot_candidato.json');const raw=fs.readFileSync(input),delta=JSON.parse(fs.readFileSync(deltaPath,'utf8'));const sha=crypto.createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex');if(sha!==delta.source_catalog_blob)throw Error('Snapshot diferente do revisado: interromper e reconciliar');const result=applyConsolidation(JSON.parse(raw),delta);fs.writeFileSync(output,JSON.stringify(result),{flag:'wx'});console.log(JSON.stringify(result.counts));}
