import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {DriveReadonly,verifyScanContract,summarize,imageKind,originalUrl} from '../assets/drive.js';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const contract=JSON.parse(readFileSync(resolve(root,'assets/v202_storage_contract.json'),'utf8'));
const roots=verifyScanContract(contract);
assert.equal(roots.length,2);
assert.equal(roots[0].id,'1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6');
assert.equal(roots[1].id,'1pp1CL9oMYVFHPPzv117DZpy1kA-wyJQo');
assert.throws(()=>verifyScanContract({...contract,runtime_scan_roots:{images:[]}}),/Pastas canônicas/);
assert.equal(imageKind('image/svg+xml'),true);
assert.equal(imageKind('text/html'),false);
assert.equal(originalUrl('evil/path'),'');
assert.ok(originalUrl('1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6').startsWith('https://drive.google.com/file/d/'));

const images=[
 {id:'1kt3Grj5oHSNHH5U0nu4BWAyEAPIMfPek',name:'recuperada.png',mimeType:'image/png',size:'50'},
 {id:'test_image_1234567890',name:'diagrama.svg',mimeType:'image/svg+xml',size:'62000',modifiedTime:'2026-11-17T13:00:00Z'},
 {id:'test_image_1234567890',name:'diagrama.svg',mimeType:'image/svg+xml'},
 {id:'test_unsafe_123456789',name:'ataque.html',mimeType:'text/html'},
 {id:'test_large_1234567890',name:'grande.png',mimeType:'image/png',size:'15000001'}
];
const sum=summarize(images,['1kt3Grj5oHSNHH5U0nu4BWAyEAPIMfPek'],'image');
assert.equal(sum.found,3);
assert.equal(sum.alreadyCataloged,1);
assert.equal(sum.newFiles,2);
assert.equal(sum.duplicates,1);
assert.equal(sum.ignored,1);
assert.equal(sum.oversized,1);
assert.equal(sum.files.find(f=>f.id==='test_large_1234567890').previewAllowed,false);

const reader=new DriveReadonly({contract,publicImageIds:['1kt3Grj5oHSNHH5U0nu4BWAyEAPIMfPek'],publicPdfIds:['known_pdf_123456789']});
const rootsById=new Map([
 [roots[0].id,[{id:'subfolder_123456789',name:'Subpasta',mimeType:'application/vnd.google-apps.folder'},
   {id:'test_image_1234567890',name:'Diagrama',mimeType:'image/svg+xml',size:'1000'}]],
 ['subfolder_123456789',[{id:'1kt3Grj5oHSNHH5U0nu4BWAyEAPIMfPek',name:'Original',mimeType:'image/png',size:'500'}]],
 [roots[1].id,[{id:'test_image_1234567890',name:'Diagrama duplicado',mimeType:'image/svg+xml'}]]
]);
reader.listFolder=async id=>({items:rootsById.get(id)||[],pages:1});
const scanned=await reader.walk(reader.imageRoots,'image',new AbortController().signal);
assert.equal(scanned.found,2,'imagens deduplicadas entre raízes e subpastas');
assert.equal(scanned.newFiles,1);
assert.equal(scanned.alreadyCataloged,1);
assert.equal(scanned.folderCount,3);
assert.equal(scanned.pages,3);
assert.equal(scanned.scope,'authorized_browser_session_only');
assert.equal(reader.lastImages,null,'walk isolado não escreve estado de sessão');
assert.equal(reader.accessToken,'','nenhum token persistido');
console.log('V2 Drive tests OK:',{roots:roots.length,found:scanned.found,new:scanned.newFiles,known:scanned.alreadyCataloged,folderCount:scanned.folderCount});
