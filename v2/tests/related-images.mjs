import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const read=file=>JSON.parse(readFileSync(resolve(root,'assets',file),'utf8'));
const meta=read('meta_public_v194.json');
const cards=meta.card_files.flatMap(read);
const knownCards=new Set(cards.map(x=>x.id));
const editorial=read('v198_editorial_images_catalog.json');
const ids=new Set(editorial.records.map(x=>x.imageId));
assert.equal(ids.size,179);
assert.equal(editorial.records.every(x=>/^IMG-[A-Z0-9-]+$/.test(x.imageId)),true);
const pairs=editorial.records.flatMap(x=>
  (x.cardIds||[]).map(id=>({image:x.imageId,card:id,basis:x.basis})));
assert.equal(pairs.length,101);
assert.equal(new Set(pairs.map(x=>x.image+'|'+x.card)).size,101);
assert.equal(pairs.filter(x=>knownCards.has(x.card)).length,100);
assert.deepEqual(pairs.filter(x=>!knownCards.has(x.card)).map(x=>x.card),['PETRO14-C017']);
const matches=pairs.filter(x=>x.card==='CARD-1504').map(x=>x.image);
assert.ok(matches.includes('IMG-C12-025'));
assert.ok(matches.includes('IMG-C12-026'));

const app=readFileSync(resolve(root,'v2/assets/app.js'),'utf8');
assert.ok(app.includes('attachRelatedImages(answer,card.id)'));
assert.ok(app.includes("img.basis==='correspondencia_didatica_especifica'"));
assert.ok(app.includes('openImageFromCard(img.imageId)'));
assert.ok(app.includes("state.imagesLimit=40"));
assert.ok(app.includes("setView('images')"));
assert.ok(!app.includes('localStorage.setItem'),'visualização não pode regravar dados locais');
console.log('V2 linked images OK:',{images:ids.size,pairs:pairs.length,navigable:100,historic:1,card1504:matches.length});
