'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
class MockEl {
 constructor(tag='div',id=''){
  this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.parentElement=null;
  this.style={};this.dataset={};this.hidden=false;this.disabled=false;this.textContent='';
  this._classes=new Set();this.classList={add:(...names)=>names.forEach(n=>this._classes.add(n)),contains:n=>this._classes.has(n)};
  this.handlers={};
 }
 get isConnected(){return !!this.parentElement;}
 append(...nodes){for(const n of nodes){n.remove();this.children.push(n);n.parentElement=this;}}
 after(node){const parent=this.parentElement;if(!parent)return;
  node.remove();const idx=parent.children.indexOf(this);parent.children.splice(idx+1,0,node);node.parentElement=parent;
 }
 prepend(node){node.remove();this.children.unshift(node);node.parentElement=this;}
 remove(){if(this.parentElement){const a=this.parentElement.children;a.splice(a.indexOf(this),1)}this.parentElement=null;}
 querySelector(s){if(this.tagName==='SECTION'&&s==='.panel')return panel;
  if(this===panel){if(s==='.controls')return controls;if(s==='h2')return heading;if(s==='p.intro')return intro;}
  if(this.tagName==='ARTICLE'&&s==='h4')return this.heading||null;
  if(this.tagName==='ARTICLE'&&s==='img')return this.preview||null;
  return null;
 }
 setAttribute(k,v){this[k]=v;}
 addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);}
 click(){if(this.disabled)return;this.onclick?.();for(const cb of this.handlers.click||[])cb();}
}
const registry=[];
function add(tag,id){const node=new MockEl(tag,id);registry.push(node);return node;}
const section=add('section','imagens'),panel=add('div'),controls=add('div'),heading=add('h2'),intro=add('p');
section.append(panel);panel.append(heading,intro,controls);
const privatePanel=add('details','bm084-sync');panel.append(privatePanel);
const connect=add('button','bm084-connect'),refresh=add('button','bm084-refresh');
privatePanel.append(connect,refresh);
const driveCount=add('span','bm205-drive-count'),syncTime=add('span','bm207-sync-time'),status=add('p','bm084-status');
privatePanel.append(driveCount,syncTime,status);
const rows=add('div','imageRows'),results=add('div','bm153Results'),originalMore=add('button','moreImages'),driveMore=add('button','bm084-more');
const sourceCard=add('article');sourceCard.dataset.native='true';
results.append(rows,originalMore);rows.append(sourceCard);panel.append(results);
privatePanel.append(driveMore);
const driveGrid=add('div','bm084-grid');privatePanel.append(driveGrid);
const search=add('input','imageSearch');
panel.append(search);
const events={};
const document={
 readyState:'complete',head:{append(){}},
 getElementById(id){return registry.find(x=>x.id===id)||null},
 createElement(tag){return add(tag)},
 addEventListener(name,fn){(events[name]??=[]).push(fn)},
 querySelector(){return null}
};
const window={BM209SingleImageViewer:null};
const globals={
 window,document,
 MutationObserver:class{observe(){}},
 queueMicrotask(fn){fn()},
 CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail}},
 console
};
vm.runInNewContext(fs.readFileSync('assets/v209_single_image_viewer.js','utf8'),globals);
assert.equal(window.BM209SingleImageViewer.ready,true);
assert.equal(privatePanel.hidden,true);
assert.equal(privatePanel.style.display,'none');
assert.equal(heading.textContent,'Biblioteca de imagens');
assert.ok(registry.some(x=>x.id==='bm209SyncBar'));
assert.equal(rows.children.length,1);
assert.equal(rows.children[0],sourceCard);
function driveCard(name){
 const card=add('article'),title=add('h4'),picture=add('img');
 title.textContent=name;card.heading=title;card.preview=picture;
 return card;
}
const a=driveCard('Concreto'),b=driveCard('Estruturas');
driveGrid.append(a,b);
for(const callback of events['bm209-drive-render']||[])callback({type:'bm209-drive-render',detail:{shown:2,matching:2,available:2}});
assert.equal(rows.children.length,3);
assert.equal(rows.children[0],sourceCard);
assert.equal(rows.children[1],a);
assert.equal(rows.children[2],b);
assert.equal(driveGrid.children.length,0,'cartões Drive devem estar na MESMA grade');
assert.equal(a.dataset.bm209ImageOrigin,'drive');
assert.equal(b.dataset.bm209ImageOrigin,'drive');
for(const callback of events['bm209-drive-render']||[])callback({type:'bm209-drive-render',detail:{shown:0,matching:0,available:2}});
assert.deepEqual(rows.children,[sourceCard]);
assert.equal(sourceCard.parentElement,rows,'cartão público deve permanecer preservado');
console.log('V209 OK: uma grade, duas origens, busca sem resultados remove apenas privados, cartão histórico preservado');
