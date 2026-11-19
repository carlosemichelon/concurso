/* V271 — testes de apresentação: não acessam Drive e não alteram arquivos/IDs. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../assets/v271_pdfs_progressive.js'),'utf8');
const begin=source.indexOf('function prettyPdfTitle(p){');
const end=source.indexOf('function pdfCard(p,off){');
assert.ok(begin>=0&&end>begin,'localizar função de nomenclatura');
const pretty=vm.runInNewContext('('+source.slice(begin,end).trim()+')');
const samples=[
 ['controle_tecnologico_em_edificacoes.pdf','Controle Tecnológico em Edificações'],
 ['Resumao_DNIT_50_paginas_concursos_v2_completo_260926_102936.pdf','Resumão DNIT 50 páginas Concursos V2 Completo'],
 ['NR-18_SEGURANCA_CONSTRUCAO_arquivo_fornecido_2025.pdf','NR-18 Segurança Construção 2025'],
 ['questoes eng civil informatica_261022_143453.pdf','Questões Eng Civil Informática'],
 ['BACKUP_Vade_Mecum_Senado_3ed_2026_GRIFOS.pdf','Backup — Vade Mecum Senado 3ed 2026 Grifos']
];
for(const [filename,expected] of samples){
 const input=Object.freeze({_driveDynamic:true,id:'DRIVE-PDF-fixture',url:'https://drive.google.com/file/d/fixture/view',filename,title:'legado'});
 assert.equal(pretty(input),expected,filename);
 assert.equal(input.filename,filename);
 assert.equal(input.id,'DRIVE-PDF-fixture');
 assert.equal(input.title,'legado');
}
const staticDoc=Object.freeze({_driveDynamic:false,title:'Cimento Portland',filename:'MAN-01_Cimento_Portland_V002.pdf'});
assert.equal(pretty(staticDoc),'Cimento Portland','nome catalogado não pode ser modificado');
console.log('V271: 6 testes de títulos e preservação aprovados');
