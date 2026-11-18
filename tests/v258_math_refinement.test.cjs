/* V258 — teste isolado sem rede, sem Drive e sem SRS: node --test tests/v258_math_refinement.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.className='';this._text='';}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this._text='';this.children=nodes;}
 setAttribute(name,value){this.attrs[name]=String(value);}
}
function fixture(){
 let nodes=[];
 const document={readyState:'loading',addEventListener(){},createElement:tag=>new Element(tag),
  createElementNS:(_ns,tag)=>new Element(tag),querySelectorAll:()=>nodes};
 const window={};
 const sandbox={window,document,queueMicrotask(){},MutationObserver:class{},console};
 const run=name=>vm.runInNewContext(fs.readFileSync(path.join(root,'assets',name),'utf8'),sandbox,{filename:name});
 run('v256_math_display.js');run('v258_math_refinement.js');
 const traverse=node=>[node,...node.children.flatMap(traverse)];
 const render=source=>{
  const node=new Element('p');node.textContent=source;nodes=[node];
  window.BM256MathDisplay.scan();window.BM258MathRefinement.scan();
  return {node,nodes:traverse(node)};
 };
 return {window,render};
}
test('separa explicação da fórmula, sem transformar palavras em variáveis',()=>{
 const {render}=fixture();
 const text='Barra impedida sob variação térmica: σ_T = −E·α_T·ΔT; N_T = −E·A·α_T·ΔT.';
 const {node,nodes}=render(text);
 assert.equal(node.dataset.bm258Math,'composed');
 assert.equal(nodes.filter(x=>x.tag==='math').length,2);
 assert.ok(nodes.filter(x=>x.tag==='msub').length>=4);
 assert.equal(nodes.find(x=>x.className==='bm258-context')._text,'Barra impedida sob variação térmica:');
 assert.equal(node.dataset.bm258Original,text);
 assert.equal(nodes.find(x=>x.className==='bm258-original-source')._text,text);
});
test('mantém fração matemática do renderizador anterior',()=>{
 const {render}=fixture();
 const {node,nodes}=render('M_r = α·f_ct·I_c/y_t = α·f_ct·W_t.');
 assert.equal(node.dataset.bm258Math,'unchanged');
 assert.ok(nodes.some(n=>n.tag==='mfrac'));
 assert.ok(nodes.some(n=>n.tag==='msub'));
});
test('não elimina espaços de descrições matemáticas',()=>{
 const {render}=fixture();
 for(const line of ['M nos apoios = −PL/8','EI = rigidez à flexão','σ(y) = M·y/I para uma viga elástica.']){
  const {node,nodes}=render(line);
  assert.equal(node.dataset.bm258Math,'composed');
  assert.equal(nodes.filter(n=>n.tag==='math').length,0);
  assert.ok(nodes.some(n=>n.className==='bm258-prose'&&n._text===line));
 }
});
test('divide várias equações e preserva documento de origem intacto',()=>{
 const {render}=fixture();
 const text='Seção circular: A = π·d²/4; I = π·d⁴/64; W = I/y.';
 const {node,nodes}=render(text);
 assert.equal(nodes.filter(x=>x.tag==='math').length,3);
 assert.equal(nodes.filter(x=>x.tag==='mfrac').length,3);
 assert.equal(node.dataset.bm258Original,text);
});
test('unidades e condições em prosa não viram MathML',()=>{
 const {render}=fixture();
 const {nodes}=render('[N] = força; [Pa] = N/m²; [E] = rigidez do material.');
 assert.equal(nodes.filter(x=>x.tag==='math').length,0);
 assert.ok(nodes.filter(x=>x.className==='bm258-prose').length>=3);
});
test('sem efeitos colaterais em dados ou agenda SRS',()=>{
 const source=fs.readFileSync(path.join(root,'assets','v258_math_refinement.js'),'utf8');
 assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|drive\.google|googleapis|SRS\s*=|fetch\s*\(/i);
});