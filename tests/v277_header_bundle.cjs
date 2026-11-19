'use strict';
/* V277: testa equivalência do bundle histórico sem congelar o index atual.
 * V297: orçamento CSS/JS auditado; o portal corrente deve respeitar o manifesto. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const historicalFiles=[
  "v263_compact_header.css","v264_header_balance.css",
  "v265_header_readable.css","v266_header_medium.css",
  "v270_header_two_actions.css"
];
const compiled=read('assets/v277_header_compiled.css');
const intro='/* Bundle estrutural do cabeçalho V277 — preserva a cascata V263/V264/V265/V266/V270.\n * Nenhuma regra foi reescrita. Fontes individuais permanecem para rollback. */\n';
const expected=intro+historicalFiles.map(f=>
  '/* INICIO '+f+' */\n'+read('assets/'+f).trimEnd()+'\n/* FIM '+f+' */\n'
).join('\n');
assert.equal(compiled,expected,'O cabeçalho compilado divergiu das cinco fontes históricas');
const styles=html=>[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
const scripts=html=>[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
const legacy=read('v277.html');
assert.match(legacy,/assets\/v277_header_compiled\.css\?v=277-1/);
for(const f of historicalFiles)assert.ok(!legacy.includes('href="assets/'+f),'Legado V277 carregou CSS individual: '+f);
assert.equal(styles(legacy).length,14,'A versão histórica V277 teve CSS modificados');
assert.equal(scripts(legacy).length,135,'A versão histórica V277 teve scripts modificados');
assert.match(legacy,/data-bm-portal-version="V277"/);

const manifest=JSON.parse(read('assets/version.json'));
const home=manifest.home;
const live=read('index.html');
assert.match(home,/^v\d{3}\.html$/);
assert.equal(live,read(home),'A entrada não corresponde ao arquivo canônico do manifesto');
assert.ok(live.includes('data-bm-portal-version="'+manifest.version+'"'));
assert.equal(manifest.current_versions.portal.version,manifest.version);
assert.equal(manifest.current_versions.portal.home,home);
assert.match(live,/assets\/v277_header_compiled\.css\?v=277-1/);
for(const f of historicalFiles)assert.ok(!live.includes('href="assets/'+f),'Cabeçalho duplicado no portal: '+f);

/* Revisar estes valores sempre que a versão visual mudar. Não mascarar camadas. */
const approved={
  V297:{css:29,js:149,last:'assets/v297_visual_audit.css?v=297-1'}
};
const budget=approved[manifest.version];
assert.ok(budget,'Versão '+manifest.version+' ainda não auditada neste teste');
const css=styles(live),js=scripts(live);
assert.equal(css.length,budget.css,'Número de CSS externos mudou sem auditoria');
assert.equal(js.length,budget.js,'Número de scripts mudou sem auditoria');
assert.equal(css.at(-1),budget.last,'A última camada visual não corresponde à aprovada');
for(const [type,links] of [['CSS',css],['JS',js]]){
  const files=links.map(x=>x.split('?')[0]);
  assert.equal(new Set(files).size,files.length,'Links locais de '+type+' repetidos');
  for(const path of files){
    assert.ok(path.startsWith('assets/'),'Recurso '+type+' fora do diretório: '+path);
    assert.ok(fs.existsSync(path),'Recurso local '+type+' ausente: '+path);
  }
}
console.log('V277_ARCHIVE_PASS + V297_CURRENT_PASS: bundle histórico, 29 CSS, 149 JS, ordem e arquivos válidos.');
