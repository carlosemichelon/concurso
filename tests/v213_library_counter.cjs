'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const node=()=>({textContent:'',title:'',dataset:{}});
const num=node(),subtitle=node(),count=node(),summary=node(),badge=node(),group=node(),images=node();
summary.textContent='Todas as disciplinas · 179 imagens disponíveis';
const stat={querySelector(k){return k==='b'?num:k==='span'?subtitle:null}};
const lookup={imagens:images,imageCount:count,bm155FilterSummary:summary,'bm205-drive-count':badge,'bm084-sync':group};
const events={};
const doc={readyState:'complete',hidden:false,
 getElementById(id){return lookup[id]||null},
 querySelector(sel){return sel==='.stats .stat:nth-child(3)'?stat:null},
 addEventListener(name,fn){(events[name]??=[]).push(fn)}
};
const win={addEventListener(){},BancoMestreDriveImagesV182:null};
const context={window:win,document:doc,
 MutationObserver:class{observe(){}},
 setInterval(){return 1},
 Date,Number,String,Boolean,Object,Array};
vm.runInNewContext(fs.readFileSync('assets/v213_library_counter.js','utf8'),context);
assert.equal(num.textContent,'179');
assert.match(count.textContent,/catálogo salvo/);
win.BancoMestreDriveImagesV182={
 connected:true,lastSuccess:'2026-11-17T15:00:00Z',lastCount:237,lastError:''
};
images.dataset.bm213Source='drive';
win.BM208AtlasUnified.refresh();
assert.equal(num.textContent,'237','Drive não deve ser somado às 179 do catálogo');
assert.match(count.textContent,/237 originais no Drive/);
assert.equal(group.dataset.bmUnifiedAtlasTotal,'237');
images.dataset.bm213Source='catalog';
for(const cb of events['bm213-source-change']||[])cb();
assert.equal(num.textContent,'179','alternar mostra somente os arquivos do catálogo salvo');
images.dataset.bm213Source='drive';
win.BancoMestreDriveImagesV182.lastCount=238;
for(const cb of events['bm209-drive-render']||[])cb();
assert.equal(num.textContent,'238','consulta posterior atualiza contador de Drive');
win.BancoMestreDriveImagesV182.connected=false;
win.BM208AtlasUnified.refresh();
assert.equal(num.textContent,'179','autorização expirada preserva catálogo');
console.log('V213 contador OK: 179 catálogo, 237/238 Drive, sem soma duplicada e fallback');
