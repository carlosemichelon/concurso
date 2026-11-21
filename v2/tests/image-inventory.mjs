import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildAtlasInventory,filterAtlasInventory} from '../assets/image-inventory.js';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const editorial=JSON.parse(readFileSync(resolve(root,'assets/v198_editorial_images_catalog.json'),'utf8')).records;
const recovered=JSON.parse(readFileSync(resolve(root,'assets/v180_native_image_additions.json'),'utf8')).records;
const recoveredMap=new Map(recovered.map(x=>[x.no,x]));
assert.equal(editorial.length,179);
assert.equal(editorial.filter(x=>x.type==='cartao').length,85);
assert.equal(editorial.filter(x=>x.type==='conteudo').length,94);
assert.equal(recoveredMap.size,93);
const known=recovered.find(x=>editorial.some(y=>y.imageId===x.no));
assert.ok(known,'catálogo deve conter ao menos um original Drive conhecido');
const extras=Array.from({length:60},(_,i)=>{
 const id='new_image_sample_'+String(i).padStart(4,'0');
 return {id,name:'Diagrama extra '+String(i),mimeType:'image/png',
   path:'Atlas / Parte '+(i+1),webUrl:'https://drive.google.com/file/d/'+id+'/view',
   previewAllowed:true,modifiedTime:'2026-11-17T16:00:00Z'};
});
const knownFile={id:known.driveFileId,name:known.name,
 mimeType:'image/png',previewAllowed:true,path:'Atlas / Original',
 webUrl:known.source_url};
const summary=buildAtlasInventory(editorial,recoveredMap,[knownFile,knownFile,...extras,extras[4]]);
assert.equal(summary.editorialCount,179);
assert.equal(summary.additionalCount,60,'somente itens novos, conhecidos devem deduplicar');
assert.equal(summary.records.length,239);
assert.equal(summary.observedCount,61);
assert.equal(summary.matchedDriveCount,1);
const attached=summary.records.find(x=>x.imageId===known.no);
assert.equal(attached.kind,'editorial');
assert.equal(attached.driveId,known.driveFileId);
assert.equal(attached.driveFile.id,known.driveFileId,'prévia do conhecido deve estar disponível no mesmo cartão editorial');
assert.equal(summary.records.filter(x=>x.driveId===known.driveFileId).length,1,
 'mesmo arquivo Drive aparece uma única vez no Atlas');
assert.equal(summary.records[0].kind,'drive','imagens novas aparecem antes das editoriais');
assert.equal(summary.records[0].type,'conteudo','imagem sem associação comprovada vira conteúdo provisório');
assert.equal(summary.records[0].provisional,true);
const content=filterAtlasInventory(summary.records,{type:'conteudo'});
assert.equal(content.length,154,'94 imagens de conteúdo editorial + 60 conteúdos provisórios');
assert.equal(content.filter(x=>x.provisional).length,60);
assert.equal(filterAtlasInventory(summary.records,{type:'cartao'}).length,85);
assert.equal(filterAtlasInventory(summary.records,{query:'Diagrama extra 52'}).length,1);
assert.equal(filterAtlasInventory(summary.records,{query:known.no}).length,1);
assert.equal(filterAtlasInventory(summary.records,{query:known.driveFileId}).length,1);
assert.deepEqual(filterAtlasInventory(summary.records,{type:'all'}).slice(0,40).length,40,
 'mesmo limite único de paginação para catálogo e Drive');
assert.equal(summary.records.filter(x=>x.provisional).length,60);
assert.ok(summary.records.every(x=>!('accessToken' in x)&&!('token' in x)));
const publicOnly=buildAtlasInventory(editorial,recoveredMap);
assert.equal(publicOnly.records.length,179);
assert.equal(publicOnly.additionalCount,0);
assert.equal(publicOnly.matchedDriveCount,0);
assert.throws(()=>buildAtlasInventory([editorial[0],editorial[0]],recoveredMap,[]),/duplicada/);
assert.throws(()=>filterAtlasInventory(summary.records,{type:'desconhecido'}),/inválido/);
console.log('V2 unified Atlas inventory OK:',{
  editorial:summary.editorialCount,additional:summary.additionalCount,
  deduplicated:1,cardImages:85,contentImages:154,
  provisionalWithoutCard:60,previewOnKnown:true
});
