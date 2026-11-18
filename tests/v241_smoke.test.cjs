/* Testes estáticos e de contrato da V241. Não acessam nem alteram Drive/SRS. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('fonte V241 montada com dependências estáticas existentes',()=>{
 const page=read('v241.html');
 assert.match(page,/v241_controle_tab\.js/);
 assert.match(page,/v241_sync_truth\.js/);
 assert.match(page,/v241_global_drive\.js/);
 assert.match(page,/v241_timer_header\.js/);
 assert.match(page,/v241_timer_header\.css/);
 const assetPaths=new Set([...page.matchAll(/assets\/([a-zA-Z0-9_.-]+\.(?:json|css|js)(?![A-Za-z0-9]))/g)].map(m=>m[1]));
 for(const match of page.matchAll(/tag\('([^']+)'\)/g))assetPaths.add(match[1].split('?')[0]);
 assert.ok(assetPaths.size>120,'Módulos históricos não deveriam desaparecer');
 for(const file of assetPaths)assert.ok(fs.existsSync(path.join(root,'assets',file)),file+' ausente');
 const inline=page.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(inline,'Script principal V241 não encontrado');
 new vm.Script(inline[1],{filename:'v241.inline.js'});
});

test('Controle V241 mantém sessão original e ponte de sincronização de cabeçalho',()=>{
 const control=read('controle-estudos-v241.html');
 assert.match(control,/BM_CONTROLE_TIMER_V238/);
 assert.match(control,/BM_CONTROLE_ESTUDOS_V238/);
 assert.match(control,/const ms=runTime\(\)/);
 assert.match(control,/window\.addEventListener\('storage'/);
 assert.match(control,/bm241-timer-state/);
 assert.match(control,/bm241-timer-command/);
 assert.match(control,/setInterval\(showTimer,1000\)/);
 assert.doesNotMatch(control,/if\(clock\.running\)storeClock\(\)/);
 const inline=control.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(inline);
 new vm.Script(inline[1],{filename:'controle.v241.inline.js'});
});

test('cronômetro de cabeçalho, aba e favicon calculados a partir da sessão original',()=>{
 const code=read('assets/v241_timer_header.js');
 new vm.Script(code);
 for(const cmd of ['start','pause','resume','save','discard-confirmed','new-subject'])
  assert.ok(read('controle-estudos-v241.html').includes(cmd));
 assert.match(code,/document\.title=title/);
 assert.match(code,/bm241-clock-favicon/);
 assert.match(code,/Date\.now\(\)-Number\(state\.sentAt/);
 assert.match(code,/window\.confirm\('Descartar/);
});

test('página principal Controle, respeitando links profundos',()=>{
 const nav=read('assets/v241_controle_tab.js');
 assert.match(nav,/nav\.insertBefore\(button,nav\.firstElementChild\)/);
 assert.match(nav,/!explicitSection&&!deepLink/);
 assert.match(nav,/frame\.loading='eager'/);
 assert.match(nav,/controle-estudos-v241\.html/);
});

test('somente evidências reais habilitam indicação de sincronização',()=>{
 const drive=read('assets/v241_global_drive.js');
 const states=read('assets/v241_sync_truth.js');
 new vm.Script(drive);new vm.Script(states);
 assert.match(drive,/foundPdf===78/);
 assert.match(drive,/const fresh=/);
 assert.match(drive,/result\?\.pdf/);
 assert.match(drive,/result\?\.img/);
 assert.match(drive,/Sem divergências detectadas/);
 assert.match(drive,/\['uploaded','downloaded','unchanged'\]/);
 assert.match(states,/SRS não enviado/);
 for(const key of ['pdfs','cards','atlas','control','grifos'])assert.match(states,new RegExp("key:'"+key+"'"));
 assert.match(states,/dataset\.syncStatus=state/);
 assert.match(states,/Não verificado/);
});

test('indicadores e cronômetro compactos para telas móveis',()=>{
 const css=read('assets/v241_timer_header.css');
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/bm241-timer-bar/);
 assert.match(css,/grid-template-areas/);
 assert.match(css,/bm241-verification/);
});
