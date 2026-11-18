const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const page=read('v216.html'), prev=read('v215.html');
const direct=read('assets/v215_drive_direct.js');
const pdf=read('assets/v215_drive_pdf_sync.js');
const gallery=read('assets/v215_drive_gallery_feed.js');

for(const [name,file] of [
 ['Leitor PDF','v215_drive_direct.js'],
 ['Biblioteca de PDFs','v215_drive_pdf_sync.js'],
 ['Biblioteca de imagens','v215_drive_gallery_feed.js']
]){
 assert.equal(page.split(file).length-1,1,name+' instalado uma vez');
 assert.ok(!prev.includes(file),name+' não altera V215');
}
assert.ok(page.includes('v215_trt01_c003.js'),'cartão TRT V215 preservado');
assert.ok(page.includes('v214_public_gallery_fallback.js'),'alternativa V214 preservada');
assert.ok(direct.includes('function activeToken()'));
assert.ok(direct.includes('client.requestAccessToken({prompt:\'\'})'),'somente o leitor autoriza explicitamente');
assert.equal((direct.match(/client\.requestAccessToken\(/g)||[]).length,1,'um ponto único de solicitação OAuth');
assert.ok(direct.includes('bm-media-drive-authorized'));
assert.ok(direct.includes('BancoMestreMediaSyncV182?.token?.()'));
const pAuthorize=pdf.slice(pdf.indexOf('function authorize(){'),pdf.indexOf('function gis(){'));
assert.ok(pAuthorize.includes('BancoMestreDriveV042.authorize()'));
assert.ok(!pAuthorize.includes('requestAccessToken'));
const gConnect=gallery.slice(gallery.indexOf('connect.onclick='),gallery.indexOf('refresh.onclick='));
assert.ok(gConnect.includes('BancoMestreDriveV042.authorize()'));
assert.ok(!gConnect.includes('requestAccessToken'));
assert.ok(gallery.includes('function currentToken()'));
assert.ok(pdf.includes('function activeToken()'));
assert.ok(page.includes('v215_trt01_c003.js'),'cartão C003 preservado');
assert.ok(!page.includes('v182_drive_direct.js?v=182'));
assert.ok(!page.includes('v213_drive_gallery_feed.js?v=213'));
assert.ok(!page.includes('v201_drive_pdf_sync.js?v=201'));
const manifest=JSON.parse(read('assets/version.json'));
const index=read('index.html');
assert.match(manifest.version,/^V\d{3}$/);assert.ok(Number(manifest.version.slice(1))>=216);
assert.equal(manifest.home,'v'+manifest.version.slice(1)+'.html');
assert.ok(Number(manifest.previous_version.slice(1))<Number(manifest.version.slice(1)));
assert.equal(manifest.current_versions.portal.home,manifest.home);
assert.ok(index.includes('data-bm-portal-version="'+manifest.version+'"'));
assert.ok(page.includes('v215_trt01_c003.js?v=215'),'Módulo TRT C003 preservado no arquivo histórico V216');
console.log('V216: 1 ponto OAuth, sessão compartilhada para imagem/PDF, layout e cartão TRT preservados.');
