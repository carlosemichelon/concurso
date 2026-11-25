'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8'),s=fs.readFileSync('assets/v430_js_002_015_topic_media.js','utf8'),editor=fs.readFileSync('assets/v430_js_000_001_editor.js','utf8'),archive=fs.readFileSync('assets/v422_media_archive.js','utf8');
assert.ok(!html.includes('id="v034SelectOriginal"'));
assert.match(editor,/function deleteSelected\(\)\{if\(!selected.size\)return;if\(!confirm\(/);
assert.match(editor,/if\(!imageId\|\|!onExclude\)return;if\(!confirm\(/);
assert.match(archive,/function request\(doc,b,kind='pdf'\).*?if\(!confirm\(/);
const start=s.indexOf('(function(){',s.indexOf('/* V035 — segurança de exclusões')),end=s.indexOf('})();',start)+5;
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();await page.setContent('<button id="local">Excluir da visualização</button><button id="restore">Restaurar</button><button id="drive" data-bm-archive-action="true">Excluir imagem</button><button id="icon" aria-label="Remover registro">×</button>');
 await page.addScriptTag({content:s.slice(start,end)});
 await page.evaluate(()=>{window.counts={};for(const b of document.querySelectorAll('button'))b.onclick=()=>{counts[b.id]=(counts[b.id]||0)+1};window.prompts=0;window.confirm=()=>{prompts++;return false}});
 await page.locator('#local').click();await page.locator('#icon').click();await page.locator('#restore').click();await page.locator('#drive').click();
 assert.deepEqual(await page.evaluate(()=>counts),{restore:1,drive:1});assert.equal(await page.evaluate(()=>prompts),2);
 await page.evaluate(()=>window.confirm=()=>{prompts++;return true});await page.locator('#local').click();assert.equal(await page.evaluate(()=>counts.local),1);
 console.log('Cancelar bloqueia exclusão, confirmar permite; restaurar não pede; Drive mantém confirmação própria.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
