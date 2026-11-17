const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const v220=read('v221.html'),v221=read('v222.html');
const cards=read('assets/v222_trt_cards_grid.js');
const imgs=read('assets/v222_images_live.js');
const pdf=read('assets/v222_pdf_editor_route.js');
const footer=read('assets/v222_footer_version.js');
for(const name of ['v222_trt_cards_grid','v222_images_live','v222_pdf_editor_route','v222_footer_version'])
 assert.equal(v221.split(name+'.js').length-1,1,name+' presente apenas uma vez');
for(const name of ['trt01_c004_loader.js','trt01_c005_loader.js','v194_public_layers.js','v195_evolutive_cards.js',
 'v218_drive_gallery_feed.js','v218_single_image_viewer.js','v217_drive_pdf_sync.js'])
 assert.ok(v221.includes(name),'módulo preexistente preservado: '+name);
assert.ok(v220.includes('trt01_c006_loader.js'),'versão anterior V221 com C006 disponível para retorno');
assert.ok(v221.includes('trt01_c005_loader.js'),'C005 TRT preservado');
assert.ok(v221.includes('trt01_c006_loader.js'),'C006 TRT preservado');
for(const id of ['TRT01-C001','TRT01-C002','TRT01-C003','TRT01-C004','TRT01-C005','TRT01-C006'])
 assert.ok(cards.includes(id),'cartão TRT incluído: '+id);
assert.ok(cards.includes("wrap.className='card bm221-trt-card'"),'TRT entra como artigo card da grade');
assert.ok(cards.includes('rows.append(wrap)'),'TRT na grade');
assert.ok(cards.includes("document.addEventListener('bm-media-drive-authorized'"),'TRT aberto consulta imagem após autenticar');
assert.ok(cards.includes("d.id='bm221CardInformation'"),'quadro de fonte informado no fim');
assert.ok(cards.includes("panel.append(d)"),'quadro de fonte no final');
assert.ok(cards.includes("const info=document.createElement('details')"),'informações TRT recolhidas em details');
assert.ok(imgs.includes("observer.observe(source,{childList:true})"),'observar novas imagens sem refresh');
assert.ok(imgs.includes("vp.append(rows)"),'forçar grade original visível');
assert.ok(imgs.includes("rows.hidden=false"),'grade sem hidden residual');
assert.ok(imgs.includes("visibilitychange"),'atualização ao voltar à aba');
assert.ok(imgs.includes("images-tab"),'atualização ao acessar biblioteca');
assert.ok(pdf.includes("Deixa pdfOpen intocado"),'não haver recursão no leitor PDF.js');
assert.ok(!pdf.includes("pdfOpen=open"),'não sobrescrever o inicializador interno');
assert.ok(pdf.includes("list?.addEventListener('click',event=>{"),'interceptação só na biblioteca');
assert.ok(pdf.includes("connect.openAndEdit(managed)"),'usa leitor com anotações');
assert.ok(pdf.includes("if(!connect.connected&&connect.ready)connect.authorize()"),'reutiliza OAuth da sessão');
assert.ok(footer.includes("V222"),'rodapé identifica versão nova');
const events={};let openCount=0,authorizedCount=0,defaultCount=0;
const button={textContent:'Ler / editar PDF',closest:selector=>selector==='button'?button:selector==='article.card'?article:null};
const article={querySelector:()=>({textContent:'DRIVE-PDF-x'})};
const list={addEventListener:(name,cb,capture)=>{events[name]=cb;assert.equal(capture,true)}};
const window={BancoMestreDriveV042:{connected:true,ready:true,openAndEdit:async doc=>{openCount++;assert.equal(doc.file_id,'1234567890abcDEF');return true;},authorize:()=>authorizedCount++},
 BancoMestreMediaSyncV182:{token:()=> 'opaque'}};
const document={readyState:'complete',getElementById:id=>id==='pdfRows'?list:null,
 querySelector:()=>null,addEventListener:()=>{}};
window.addEventListener=()=>{};
let originalCalls=0;
const originalPdfOpen=()=>{originalCalls++};
const context={window,document,pdfOpen:originalPdfOpen,docs:[{id:'DRIVE-PDF-x',file_id:'1234567890abcDEF',title:'Lei'}],console,Promise,Date,String,RegExp};
vm.runInNewContext(pdf,context,{filename:'v222_pdf_editor_route.js'});
assert.strictEqual(context.pdfOpen,originalPdfOpen,'leitor PDF.js mantido');
assert.ok(events.click,'delegação de clique instalada');
let prevented=0,stopped=0;
events.click({target:button,preventDefault:()=>prevented++,stopImmediatePropagation:()=>stopped++});
assert.equal(openCount,1,'lei abre no editor');
assert.equal(originalCalls,0,'não abrir somente preview');
assert.equal(prevented,1);assert.equal(stopped,1);assert.equal(authorizedCount,0,'sessão Drive reaproveitada');
assert.equal(context.window.BM221PdfEditorRoute.source({id:'X',url:'https://drive.google.com/file/d/1234567890abcDEF/view'}).file_id,'1234567890abcDEF');
const manifest=JSON.parse(read('assets/version.json'));
assert.equal(manifest.version,'V222');
assert.equal(manifest.home,'v222.html');
assert.equal(manifest.previous_version,'V221');
assert.ok(read('index.html').includes("var fallback='V222'"));
assert.ok(read('index.html').includes('TRT01-C00[123456]'));
console.log('V222: TRT C001-C006 na grade; imagens visíveis sem recarga; leis direto no editor; versão V221 preservada.');
