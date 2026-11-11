/* V126 — validações de corpus BIO antes de utilizar qualquer amostra para treino.
 * A amostra é provisória e não pode alterar o modelo ativo.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const seed=JSON.parse(fs.readFileSync(path.join(root,'tests/v126_semente_bio_lei_seca.json'),'utf8'));
assert.equal(seed.schema,'BancoMestreLeiSecaBIOv1');
assert.equal(seed.status,'proposta_sem_homologacao_humana');
const ids=new Set(),allowed=new Set(['regra','agente','condicao','excecao']);
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let spans=0,words=0;
for(const entry of seed.examples){
 assert.ok(entry.id&&!ids.has(entry.id),'ID repetido');
 ids.add(entry.id);
 assert.ok(entry.source.startsWith('https://'),'Fonte oficial ausente');
 assert.ok(entry.law&&entry.device&&entry.text);
 const norm=normalize(entry.text),occupied=[];
 for(const span of entry.spans){
  assert.ok(allowed.has(span.kind),'Cor inexistente');
  const quote=normalize(span.quote);
  const first=norm.indexOf(quote);
  assert.ok(first>=0,'Citação não corresponde literalmente ao texto: '+entry.id+' / '+span.quote);
  assert.equal(norm.lastIndexOf(quote),first,'Citação ambígua repetida: '+entry.id);
  const last=first+quote.length;
  for(const prev of occupied)assert.ok(first>=prev.end||last<=prev.start,
   'Etiquetas se sobrepõem: '+entry.id);
  occupied.push({start:first,end:last,kind:span.kind});
  spans++;
 }
 words+=(entry.text.match(/\S+/gu)||[]).length;
}
assert.equal(seed.examples.length,7);
assert.equal(spans,13);
const labels=new Set(['O',...Array.from(allowed,x=>'B-'+x.toUpperCase()),
 ...Array.from(allowed,x=>'I-'+x.toUpperCase())]);
assert.equal(labels.size,9);
console.log(JSON.stringify({ok:true,documents:seed.examples.length,laws:new Set(seed.examples.map(x=>x.law)).size,
 spans,tokens_whitespace_approx:words,labels:labels.size,
 warning:'Amostra BIO é provisória e não foi usada para treinar nem avaliar o classificador publicado.'},null,2));
