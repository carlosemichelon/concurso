import assert from 'node:assert/strict';
import {DriveOnlyClient,DriveOnlyError,DATASETS} from '../client.mjs';

const routeCalls=[];
const response=(data,status=200,type='application/json')=>({
 status,ok:status>=200&&status<300,
 headers:{get:key=>key==='content-type'?type:null},
 json:async()=>data
});
let next=()=>response({source:'google-drive',authenticated:true,lastSync:'2026-11-17T15:00:00Z'});
const fetcher=async (url,opt)=>{routeCalls.push({url,opt});return next(url,opt)};
const gateway=new DriveOnlyClient({fetcher});
const session=await gateway.session();
assert.equal(session.authenticated,true);
assert.equal(session.source,'google-drive');
assert.equal(routeCalls[0].url,'/api/banco-mestre/session');
assert.equal(routeCalls[0].opt.credentials,'include');
assert.equal(routeCalls[0].opt.cache,'no-store');
assert.equal(routeCalls[0].opt.redirect,'error');

next=()=>response({source:'google-drive',revision:'drive-rev1',count:2,records:[{id:'CARD-0001'},{id:'CARD-0002'}]});
const data=await gateway.dataset('cards');
assert.equal(data.records.length,2);
assert.equal(routeCalls.at(-1).url,'/api/banco-mestre/data/cards');
assert.equal(data.revision,'drive-rev1');
assert.ok(DATASETS.includes('srs'));

next=()=>response({source:'github',revision:'wrong',count:2,records:[{},{}]});
await assert.rejects(gateway.dataset('cards'),e=>e.code==='INVALID_DATASET');
next=()=>response({source:'google-drive',revision:'rev',count:3,records:[{},{}]});
await assert.rejects(gateway.dataset('cards'),e=>e.code==='INVALID_DATASET');
await assert.rejects(gateway.dataset('../version.json'),e=>e.code==='INVALID_KIND');

next=()=>response({error:'authentication required'},401);
assert.equal((await gateway.session()).authenticated,false);
await assert.rejects(gateway.dataset('srs'),e=>e.code==='LOGIN_REQUIRED');
next=()=>response({error:'forbidden'},403);
await assert.rejects(gateway.dataset('images'),e=>e.code==='FORBIDDEN');
next=()=>{throw Error('offline')};
await assert.rejects(gateway.dataset('pdfs'),e=>e.code==='UNAVAILABLE');

assert.equal(gateway.mediaPath('DRIVEIMAGE_ABCDEF'),'/api/banco-mestre/media/DRIVEIMAGE_ABCDEF');
assert.throws(()=>gateway.mediaPath('../image'),e=>e.code==='INVALID_MEDIA');
assert.throws(()=>new DriveOnlyClient({fetcher,base:'https://drive.google.com'}));
assert.throws(()=>new DriveOnlyClient({fetcher,base:'//external-host'}));
assert.equal(routeCalls.every(x=>!x.url.includes('github.com')&&!x.url.includes('githubusercontent.com')),true,'nunca usar base GitHub');

console.log('Drive-only client: sessão, origem, 401/403, integridade, sem fallback GitHub OK');
