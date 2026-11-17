/* Banco Mestre V2 — smoke do endereço HTTPS da prévia publicada.
 * Não faz OAuth real, não acessa dados privados, não modifica a V1.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base='https://carlosemichelon.github.io/concurso/';
const preview=base+'v2-preview/';
const browser=await chromium.launch({headless:true});
let page;
try{
  page=await browser.newPage({viewport:{width:1280,height:900}});
  // A prévia pública deve carregar sem exigir login; não dialogar com contas privadas.
  await page.route('https://accounts.google.com/**',route=>route.abort());
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const pageResponse=await page.goto(preview,{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(pageResponse?.status(),200,'prévia deve responder HTTP 200');
  await page.locator('#overviewStats .stat').first().waitFor({timeout:45000});
  const stats=await page.locator('#overviewStats .stat').allTextContents();
  assert.equal(stats.length,3,'painel de visão geral precisa de 3 estatísticas');
  assert.match(stats.join(' '),/1[.,]518/,'catálogo público de 1518 cartões');
  assert.match(stats.join(' '),/179/,'catálogo de 179 imagens');
  assert.match(stats.join(' '),/78/,'biblioteca de 78 PDFs');
  assert.match(await page.title(),/V2.*homologação isolada/);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),
    'noindex,nofollow,noarchive');
  assert.ok(await page.locator('a[href="../index.html"]').count()>0,
    'retorno ao portal V1 deve permanecer evidente');
  await page.locator('[data-view="cards"]').click();
  await page.locator('#cardsList .item').first().waitFor({timeout:20000});
  await page.locator('[data-view="images"]').click();
  await page.locator('#imagesList .item').first().waitFor({timeout:20000});
  assert.equal(await page.locator('#v2PrivateImages').count(),0,
    'não deve existir segunda galeria de imagens');
  assert.equal(await page.locator('#imagesList .item').count(),40,
    'lista única deve iniciar com 40 imagens');
  await page.locator('#moreImages').click();
  assert.equal(await page.locator('#imagesList .item').count(),80,
    'único botão Mostrar mais deve carregar as próximas 40');
  await page.locator('[data-view="pdfs"]').click();
  await page.locator('#pdfsList .item').first().waitFor({timeout:20000});
  await page.locator('[data-view="sync"]').click();
  await page.locator('#v2OAuthReadiness').waitFor({timeout:10000});
  assert.equal(await page.locator('#v2OAuthTestPdf').isDisabled(),true,
    'acesso real a PDF não pode estar habilitado sem autorização Google');
  const manifestResponse=await page.request.get(preview+'preview-manifest.json');
  assert.equal(manifestResponse.status(),200);
  const manifest=await manifestResponse.json();
  assert.equal(manifest.publishScope,'v2-preview/ only');
  assert.equal(manifest.containsPrivateFiles,false);
  assert.match(manifest.sourceCommit,/^[a-f0-9]{40}$/,'manifesto deve guardar um SHA de origem verificável');
  assert.equal(manifest.atlasMode,'single_viewer_editorial_plus_live_drive');
  const original=await page.request.get(base+'index.html');
  assert.equal(original.status(),200,'entrada original V1 deve continuar publicada');
  assert.equal(await page.evaluate(()=>localStorage.length),0,
    'prévia pública não deve criar registros pessoais ou tokens');
  assert.deepEqual(errors,[],'site não deve provocar exceções JavaScript não tratadas');
  console.log('V2 HTTPS preview smoke OK:',{
    preview,sections:['cards','images','pdfs','sync'],
    stats:'1518 cartões / 179 imagens / 78 PDFs',
    privateLogin:false,unchangedV1Entry:true,manifestVerified:true
  });
}finally{
  await page?.close();
  await browser.close();
}
