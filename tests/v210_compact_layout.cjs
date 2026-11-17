'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const named=new Map();
const docListeners={};
class El {
 constructor(tag,id){
  this.tagName=tag.toUpperCase();this.id=id||'';this.parentNode=null;this.children=[];
  this.textContent='';this.title='';this.value='all';this.handlers={};this._class=new Set();
  this.classList={add:(...values)=>values.forEach(v=>this._class.add(v)),
   contains:v=>this._class.has(v)};
  if(id)named.set(id,this);
 }
 append(...nodes){for(const node of nodes){
  if(node.parentNode)node.remove();
  this.children.push(node);node.parentNode=this;
 }}
 prepend(node){if(node.parentNode)node.remove();this.children.unshift(node);node.parentNode=this;}
 after(node){const p=this.parentNode;if(!p)return;if(node.parentNode)node.remove();const i=p.children.indexOf(this);p.children.splice(i+1,0,node);node.parentNode=p;}
 insertBefore(node,anchor){if(node.parentNode)node.remove();const i=this.children.indexOf(anchor);this.children.splice(i<0?this.children.length:i,0,node);node.parentNode=this;}
 remove(){if(!this.parentNode)return;const a=this.parentNode.children;a.splice(a.indexOf(this),1);this.parentNode=null;}
 setAttribute(name,value){this[name]=value;}
 addEventListener(name,cb){(this.handlers[name]??=[]).push(cb);}
 dispatchEvent(event){for(const cb of this.handlers[event.type]||[])cb(event);}
 closest(tag){for(let x=this;x;x=x.parentNode)if(x.tagName===tag.toUpperCase())return x;return null;}
 querySelector(selector){
  if(selector.startsWith('#'))return named.get(selector.slice(1))||null;
  if(selector===':scope > .controls')return this.children.find(n=>n._class.has('controls'))||null;
  if(selector==='.panel')return this.children.find(n=>n._class.has('panel'))||null;
  const tag=selector==='p.intro'?'P':selector==='p.notice'?'P':
    selector==='.originalHelp'?null:selector==='.bm197-toolbar'?null:
    selector==='.bm152FilterFooter'?null:selector;
  const className=selector.startsWith('.')?selector.slice(1):selector.includes('.')?selector.split('.')[1]:null;
  const matches=n=>className?n._class.has(className):n.tagName===String(tag).toUpperCase();
  const stack=[...this.children];while(stack.length){const n=stack.shift();if(matches(n))return n;stack.unshift(...n.children)}
  return null;
 }
}
function make(tag,id,cls){const el=new El(tag,id);if(cls)el.classList.add(cls);return el;}
function labeled(root,tag,id){const label=make('label');const input=make(tag,id);label.append(input);root.append(label);return input;}
const pdf=make('section','pdfs'),pdfpanel=make('div',null,'panel');pdf.append(pdfpanel);
pdfpanel.append(make('h2'),make('p',null,'intro'));
const pdfControls=make('div',null,'controls');pdfpanel.append(pdfControls);
const pdfAreas=make('div','pdfAreaNavV036');pdfpanel.append(pdfAreas);
pdfControls.append(make('input','pdfSearch'),make('select','pdfFilter'));
const globalPdf=make('div');const gpdfButton=make('button');gpdfButton.onclick=()=>{gpdfButton.touched=true};
globalPdf.append(gpdfButton,make('span','bm182-status-pdf'));pdfpanel.prepend(globalPdf);
const pdfSync=make('div','bm-pdf-sync');pdfpanel.append(pdfSync);
pdfSync.append(make('button','bm-pdf-sync-connect'),make('button','bm-pdf-sync-refresh'),make('span','bm-pdf-sync-status'));
const check=make('div','bm151-pdf-check');check.append(make('span'),make('button'));pdfpanel.append(check);
const direct=make('div','driveDirectV038');direct.append(make('button','driveConnectV038'),make('span','driveDirectStatusV038'));pdfpanel.append(direct);
pdfpanel.append(make('div','bmVade041'));
const img=make('section','imagens'),imgpanel=make('div',null,'panel');img.append(imgpanel);
imgpanel.append(make('h2'),make('p',null,'intro'),make('p',null,'notice'));
const imgControls=make('div',null,'controls');imgpanel.append(imgControls);
imgControls.append(make('input','imageSearch'),make('select','imageFilter'),make('span','imageCount'));
const syncBar=make('div','bm209SyncBar');imgpanel.append(syncBar);
const hierarchy=make('div','bm155ImageFilters');imgpanel.append(hierarchy);
for(const id of ['bm155DisciplinaImagem','bm155AssuntoGeralImagem','bm155AssuntoEspecificoImagem','bm155SubassuntoImagem'])labeled(hierarchy,'select',id);
const footer=make('div');footer.append(make('button','bm155Reset'),make('span','bm155FilterSummary'));hierarchy.append(footer);
const editorial=make('div','bm197-classification-controls');const editToolbar=make('div',null,'bm197-toolbar');
editorial.append(editToolbar,make('p','bm197-message'));imgpanel.append(editorial);
labeled(editToolbar,'select','bm197-type-filter');editToolbar.append(make('button'));
imgpanel.append(make('p',null,'originalHelp'),make('details','bm159AtlasOptions'));
const globalImg=make('div');globalImg.append(make('button'),make('span','bm182-status-img'));imgpanel.prepend(globalImg);
const cards=make('section','cartoes'),cardpanel=make('div',null,'panel');cards.append(cardpanel);
const filters=make('div','bm152Filters');cardpanel.append(filters);
for(const id of ['bm152Discipline','bm152General','bm152Subject','bm152Sub'])labeled(filters,'select',id);
const cfooter=make('div',null,'bm152FilterFooter');cfooter.append(make('span','bm152FilterStatus'),make('button','bm152Reset'));filters.append(cfooter);
const cardControls=make('div',null,'controls');cardpanel.append(cardControls);cardControls.append(make('input','cardSearch'));
for(const id of ['cardHidden','cardReviewedOnly','cardRecoveredOnly'])labeled(cardControls,'input',id);
cardControls.append(make('span','cardCount'),make('span','bm191CardCount'),make('label','bm119InactiveLabel'));
const doc={readyState:'complete',
 querySelector:s=>s==='#pdfs .panel'?pdfpanel:s==='#imagens .panel'?imgpanel:s==='#cartoes .panel'?cardpanel:null,
 getElementById:id=>{
  if(named.has(id))return named.get(id);
  const queue=[pdf,img,cards];
  while(queue.length){const x=queue.shift();if(x.id===id)return x;queue.push(...x.children);}
  return null;
 },
 createElement:tag=>make(tag),
 addEventListener:(event,cb)=>{(docListeners[event]??=[]).push(cb)}
};
vm.runInNewContext(fs.readFileSync('assets/v210_compact_sections.js','utf8'),{
 document:doc,window:{matchMedia:()=>({matches:false})},setTimeout:()=>{},
 Event:class{constructor(type){this.type=type}},console
});
const toolbar=named.get('bm210PdfToolbar'),bar=named.get('bm209SyncBar'),quick=named.get('bm210CardQuick');
assert.ok(toolbar&&bar&&quick);
assert.equal(toolbar.contains,undefined);
assert.equal(named.get('pdfSearch').parentNode,pdfControls);
assert.equal(pdfControls.parentNode,named.get('bm210PdfFilters'));
assert.equal(named.get('bm-pdf-sync-refresh').parentNode,named.get('bm210PdfActions'));
assert.equal(gpdfButton.parentNode,named.get('bm210PdfActions'));
gpdfButton.onclick();assert.equal(gpdfButton.touched,true);
assert.equal(named.get('imageSearch').parentNode,bar);
assert.equal(named.get('bm155DisciplinaImagem').closest('label').parentNode,bar);
assert.equal(named.get('bm197-type-filter').closest('label').parentNode,bar);
assert.equal(named.get('bm155Reset').parentNode,bar);
assert.equal(named.get('cardSearch').parentNode,quick);
assert.equal(named.get('cardReviewedOnly').closest('label').parentNode,quick);
assert.equal(named.get('cardCount').parentNode,cfooter);
assert.equal(named.get('bm210ImageInfo').parentNode,bar);
console.log('V210 layout OK: barras PDF, Imagens e Flashcards, IDs e handlers preservados');
