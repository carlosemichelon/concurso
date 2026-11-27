import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
function read(path) { return JSON.parse(readFileSync(resolve(root,'assets',path),'utf8')); }
function unique(items,label) {
  assert.equal(new Set(items).size,items.length,label+' duplicados');
  assert.ok(items.every(Boolean),label+' vazios');
}
const meta=read('meta_public_v194.json');
assert.equal(meta.counts.cards,1518);
assert.equal(meta.counts.active,1501);
assert.equal(meta.card_files.length,7);
const cards=meta.card_files.flatMap(file=>read(file));
assert.equal(cards.length,1518,'total da base pública');
unique(cards.map(x=>x.id),'IDs de cartões');
assert.equal(cards.filter(x=>x.active!==false).length,1501,'cartões ativos');
assert.equal(cards.filter(x=>x.active===false).length,17,'históricos inativos');

const images=read('v198_editorial_images_catalog.json');
assert.equal(images.schema,'BancoMestreImageEditorialCatalogV198');
assert.equal(images.records.length,179);
unique(images.records.map(x=>x.imageId),'IDs de imagens');
assert.equal(images.records.filter(x=>x.type==='cartao').length,85);
assert.equal(images.records.filter(x=>x.type==='conteudo').length,94);
const allCardIds=new Set(cards.map(c=>c.id));
let historicLinks=0,links=0;
for(const image of images.records) {
  assert.ok(Array.isArray(image.cardIds),'cardIds deve ser lista');
  for(const id of image.cardIds) {
    links++;
    if(!allCardIds.has(id)) {
      historicLinks++;
      assert.equal(id,'PETRO14-C017','único vínculo histórico sem cartão navegável');
    }
  }
}
assert.equal(historicLinks,1,'referência histórica destacada');

const pdf=read('pdf_catalog_v149.json');
assert.equal(pdf.documents.length,78);
unique(pdf.documents.map(d=>d.id),'IDs de documentos');
unique(pdf.documents.map(d=>d.file_id),'IDs do Drive por PDF');

const recovered=read('v180_native_image_additions.json');
assert.equal(recovered.records.length,93);
unique(recovered.records.map(x=>x.no),'IDs das imagens recuperadas');

const contract=read('v202_storage_contract.json');
assert.equal(contract.canonical_write_destinations.images.folder_id,'1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6');
assert.equal(contract.canonical_write_destinations.checkpoints.folder_id,'1348cILBcxFG9p2cfPJ3WubmHswPRbD24');

const home=readFileSync(resolve(root,'v2/index.html'),'utf8');
const scriptPaths=[...home.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map(x=>x[1]);
for(const path of scriptPaths) assert.ok(existsSync(resolve(root,'v2',path)),'asset V2 ausente: '+path);
assert.match(home,/\.\.\/index\.html/,'rollback explícito para V1');
const source=readFileSync(resolve(root,'v2/assets/app.js'),'utf8');
assert.doesNotMatch(source,/localStorage\.setItem|indexedDB\.open|drive\.files\.create/,'V2 não pode escrever dados privados');
console.log('Site V2 smoke OK:',{cards:cards.length,active:1501,images:images.records.length,pdfs:pdf.documents.length,
  recovered:recovered.records.length,links,historicLinks,assets:scriptPaths.length});
