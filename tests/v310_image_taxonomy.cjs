'use strict';
/* V310 — auditoria de taxonomia em runtime sem Drive/OAuth ou alterações de dados. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const loadJSON=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const original=loadJSON('assets/v211_published_images.json').records;
const taxonomy=loadJSON('assets/v310_image_taxonomy.json');
const v180=loadJSON('assets/v180_native_image_additions.json').records;
assert.equal(original.length,237);
assert.equal(original.filter(x=>x.topic).length,93);
assert.equal(taxonomy.records.length,144);
assert.equal(taxonomy.schema,'BancoMestreImageTaxonomyV310');
assert.equal(taxonomy.records.filter(x=>x.classificationBasis==='inspecao_visual_do_original_ou_previa').length,104);
assert.equal(taxonomy.records.filter(x=>x.classificationBasis==='nome_descritivo_e_pasta').length,40);
assert.equal(new Set(taxonomy.records.map(x=>x.driveFileId)).size,144);
assert.ok(taxonomy.records.every(x=>x.originalCardIds.length===0&&x.questionRefs.length===0));
const source=new Map(original.map(x=>[x.driveFileId,x]));
for(const x of taxonomy.records){
 const prev=source.get(x.driveFileId);
 assert.ok(prev&&!prev.topic&&!prev.group,'Imagem já classificada ou fora do catálogo: '+x.driveFileId);
 assert.ok(x.group&&x.topic&&x.subtopic&&x.title&&x.classificationBasis);
}
const icons={};
const injectedFetch=async url=>{
 const name=String(url).split('?')[0];
 return {ok:true,json:async()=>loadJSON(name)};
};
vm.runInNewContext(fs.readFileSync('assets/v218_image_metadata.js','utf8'),{window:icons,fetch:injectedFetch,console},{timeout:3000});
(async()=>{
 const index=icons.BM218ImageMetadata;
 assert.ok(index);
 const r=await index.load();
 assert.equal(r.count,237,'237 imagens únicas indexadas');
 assert.equal(r.classified,237,'Todos os registros do catálogo V211 com classificação');
 assert.equal(index.classifiedCount,237);
 for(const prior of original){
  const m=index.resolve({id:prior.driveFileId,name:prior.name});
  assert.ok(m.classified&&m.subject&&m.group&&m.displayTitle!=='Imagem sem título descritivo',
   'Classificação/title ausente '+prior.driveFileId);
  if(prior.topic){
   assert.equal(m.subject,prior.topic,'Classificação anterior foi substituída');
   assert.equal(m.group,prior.group,'Grupo anterior foi alterado');
   assert.equal(JSON.stringify(m.cards),JSON.stringify(prior.cardIds),
    'Vínculos documentados de cartão foram alterados');
  }else{
   const newMeta=taxonomy.records.find(x=>x.driveFileId===prior.driveFileId);
   assert.ok(newMeta&&m.subject===newMeta.topic&&m.subsubject===newMeta.subtopic,
    'Metadado V310 divergente: '+prior.driveFileId);
   assert.equal(m.cards.length,0,'Criado vínculo com cartão sem prova documental');
   assert.ok(m.origin.startsWith('V310'),'Origem da classificação não auditável');
  }
 }
 const variants=original.filter(x=>/PETRO14_.*_VETOR_PREVIA\.(?:png|svg)/.test(x.name));
 for(const item of variants){
  const hash=item.name.match(/PETRO14_([a-f0-9]+)_VETOR_PREVIA/)[1];
  const peer=original.find(x=>x!==item&&(x.name===hash+'.svg'||x.name===hash+'.png'));
  if(peer){
   const a=index.resolve({id:item.driveFileId,name:item.name});
   const b=index.resolve({id:peer.driveFileId,name:peer.name});
   assert.equal(a.subject,b.subject,'Variações vetorial/original com classificação diferente');
  }
 }
 assert.equal(v180.length,93);
 console.log('V310_TAXONOMY_RUNTIME_PASS: 237/237 classificados; 144 novos; 104 visuais, 40 por nomes; cartões intactos');
})().catch(e=>{console.error(e);process.exitCode=1});
