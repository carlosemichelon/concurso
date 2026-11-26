import {test} from 'node:test';import assert from 'node:assert/strict';
import {createReader} from '../infra/vs41-private/catalog.mjs';import {formulaFixture,profiles} from './vs41_private_fixture.mjs';
const setup=()=>{const f=formulaFixture();return {...f,read:createReader({...f,includeFormula:true,resolveSession:async req=>profiles[req.session]})}};
test('guia privado de cada perfil, sem ID físico e sem fallback',async()=>{
 const f=setup(),a={session:'A'},b={session:'B'};
 const x=await f.read(a),y=await f.read(b);
 assert.ok(x.formula.text.includes('Exemplo exclusivo A'));assert.ok(y.formula.text.includes('Exemplo exclusivo B'));assert.deepEqual(Object.keys(x.formula).sort(),['modifiedTime','text','version']);
 delete f.files.get('profileA').payload.collections.formulas;assert.equal((await f.read(a)).formula,null);
 f.files.get('profileA').payload.collections.formulas='formulasB';await assert.rejects(f.read(a),e=>e.code==='formula-owner');
 await assert.rejects(f.read({session:'X'}));
});
test('bloqueia documento compartilhado e alteração durante exportação',async()=>{
 const f=setup(),a={session:'A'};
 f.files.get('formulasA').meta.shared=true;await assert.rejects(f.read(a));f.files.get('formulasA').meta.shared=false;
 const read=createReader({...f,includeFormula:true,resolveSession:async req=>profiles[req.session],fetcher:async(url,opts)=>{const r=await f.fetcher(url,opts);if(url.includes('/export?'))f.files.get('formulasA').meta.version='2';return r}});
 await assert.rejects(read(a),e=>e.code==='formula-revision');
});
