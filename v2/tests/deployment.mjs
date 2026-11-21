import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectDeployment} from '../assets/deployment.js';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const version=JSON.parse(readFileSync(resolve(root,'assets/version.json'),'utf8'));
const index=readFileSync(resolve(root,'index.html'),'utf8');
const current=inspectDeployment(version,index,{homeHttpStatus:200});
assert.match(current.version,/^V\d{3,}$/);
assert.equal(current.home,'v'+current.version.slice(1)+'.html');
assert.equal(current.status,'ok');
assert.equal(current.indexUsesManifest,true);
assert.equal(current.fallbackVersion,current.version);
assert.ok(existsSync(resolve(root,current.home)),'arquivo da versão pública deve existir no repositório');
assert.equal(current.publicCounts.cards,1518);
assert.equal(current.publicCounts.images,179);
assert.equal(current.publicCounts.pdfs,78);

const wrongHome=inspectDeployment({...version,home:'v123.html'},index,{homeHttpStatus:200});
assert.equal(wrongHome.status,'error');
assert.ok(wrongHome.issues.some(x=>x.code==='manifest_home_mismatch'));
const missingFile=inspectDeployment(version,index,{homeHttpStatus:404});
assert.equal(missingFile.status,'error');
assert.ok(missingFile.issues.some(x=>x.code==='home_http_error'));
const staleFallback=inspectDeployment(version,index.replace(
  'var fallback=\''+version.version+'\'',
  'var fallback=\'V000\''
),{homeHttpStatus:200});
assert.equal(staleFallback.status,'warning');
assert.ok(staleFallback.issues.some(x=>x.code==='stale_fallback'));
const indexWithoutManifest=inspectDeployment(version,'<html>sem redirecionamento</html>',{homeHttpStatus:200});
assert.ok(indexWithoutManifest.issues.some(x=>x.code==='index_not_using_manifest'));
const changedCounts=inspectDeployment({...version,counts:{...version.counts,cards:1519}},index);
assert.ok(changedCounts.issues.some(x=>x.code==='public_count_changed'));
console.log('V2 deployment tests OK:',{version:current.version,home:current.home,checks:6});
