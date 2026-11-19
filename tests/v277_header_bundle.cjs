'use strict';
/* Consolidação estrutural: equivalência da cascata, sem alterar SRS, OAuth ou conteúdos. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const files=["v263_compact_header.css","v264_header_balance.css","v265_header_readable.css","v266_header_medium.css","v270_header_two_actions.css"];
const compiled=read('assets/v277_header_compiled.css');
const intro='/* Bundle estrutural do cabeçalho V277 — preserva a cascata V263/V264/V265/V266/V270.\n * Nenhuma regra foi reescrita. Fontes individuais permanecem para rollback. */\n';
const expected=intro+files.map(f=>'/* INICIO '+f+' */\n'+read('assets/'+f).trimEnd()+'\n/* FIM '+f+' */\n').join('\n');
assert.equal(compiled,expected,'A cascata consolidada divergiu das cinco fontes históricas');
for(const path of ['index.html','v277.html']){
 const html=read(path);
 assert.match(html,/assets\/v277_header_compiled\.css\?v=277-1/);
 for(const f of files)assert.ok(!html.includes('href="assets/'+f),'CSS legado ainda carregado: '+f);
 const cssLinks=(html.match(/<link\b[^>]*rel="stylesheet"/g)||[]).length;
 assert.equal(cssLinks,14,'Número de CSS externos mudou sem auditoria');
 const scripts=(html.match(/<script\b[^>]*\bsrc=/g)||[]).length;
 assert.equal(scripts,135,'Scripts JS foram alterados nesta etapa visual');
 assert.match(html,/data-bm-portal-version="V277"/);
}
console.log('V277_HEADER_BUNDLE_PASS: 5 CSS -> 1, 18 -> 14 links, 135 scripts intactos.');
