/* Smoke test end-to-end em Chromium: carregamento, grifo, persistência e exportações. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({acceptDownloads:true,viewport:{width:1440,height:950}});
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 try{
  await page.goto('http://127.0.0.1:8765/v041.html#pdfs',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#bmVade041').waitFor({state:'visible',timeout:30000});
  await page.getByRole('button',{name:'Abrir e marcar o PDF'}).click();
  await page.waitForFunction(()=>window.BancoMestrePDFV038?.editing===true&&/Página 1 de \d+/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:120000});
  assert.equal(await page.locator('#pdfDialog').evaluate(el=>el.open),true);
  await page.waitForFunction(()=>document.getElementById('pdfOriginal')?.hidden===true,null,{timeout:15000});
  assert.equal(await page.locator('#pdfOriginal').isVisible(),false,'Link do Drive não deveria aparecer no Vade hospedado');
  await page.locator('#pdfMarker').click();
  const ink=page.locator('#pdfInkCanvas');
  await ink.scrollIntoViewIfNeeded();
  const rect=await ink.boundingBox();assert.ok(rect?.width>100&&rect?.height>100,'Área de grifos indisponível');
  const x=rect.x+rect.width*.27,y=rect.y+rect.height*.34;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+Math.min(160,rect.width*.25),y,{steps:9});
  await page.mouse.up();
  const stored=await page.evaluate(()=>{
   const p='BM030_STROKES_PDF:VADE-SENADO-2026-GUIA:';
   const keys=Object.keys(localStorage).filter(k=>k.startsWith(p));
   return keys.map(key=>({key,marks:JSON.parse(localStorage.getItem(key)||'[]')}));
  });
  assert.ok(stored.some(x=>x.marks.some(m=>m.type==='highlighter')),'Marcação não gravada no navegador');
  await page.locator('#pdfClose').click();
  const exportBackup=page.waitForEvent('download',{timeout:30000});
  await page.getByRole('button',{name:'Exportar backup dos grifos'}).click();
  const file=await exportBackup;
  assert.match(file.suggestedFilename(),/Vade_Marcacoes_Backup_/);
  const backupFile=JSON.parse(fs.readFileSync(await file.path(),'utf8'));
  assert.equal(backupFile.pdf_id,'VADE-SENADO-2026-GUIA');
  assert.ok(backupFile.items.some(x=>x.marks.some(m=>m.type==='highlighter')),'Backup JSON não contém a marcação');
  await page.getByRole('button',{name:'Abrir e marcar o PDF'}).click();
  await page.waitForFunction(()=>window.BancoMestrePDFV038?.editing===true&&/Página 1 de \d+/.test(document.getElementById('pdfPager')?.textContent||''),null,{timeout:120000});
  const restored=await page.evaluate(()=>{
   const p='BM030_STROKES_PDF:VADE-SENADO-2026-GUIA:';
   return Object.keys(localStorage).filter(k=>k.startsWith(p)).flatMap(k=>JSON.parse(localStorage.getItem(k)||'[]')).filter(x=>x.type==='highlighter').length;
  });
  assert.ok(restored>=1,'Marcação não recuperada após reabrir');
  const exportPdf=page.waitForEvent('download',{timeout:120000});
  await page.locator('#pdfExportPDF').click();
  const annotated=await exportPdf;
  assert.match(annotated.suggestedFilename(),/_ANOTADO\.pdf$/);
  assert.ok(fs.statSync(await annotated.path()).size>100000,'PDF anotado com tamanho suspeito');
  assert.equal(errors.length,0,'Erro de JavaScript no navegador: '+errors.join('; '));
  console.log(JSON.stringify({result:'PASS',browser:'chromium',grifo:true,persistencia:true,backup_json:true,exportacao_pdf:true,marcações:restored}));
 }finally{await browser.close()}
})().catch(err=>{console.error('VADE_BROWSER_FAIL',err.stack||String(err));process.exitCode=1});
