'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('assets/v208_atlas_unified_counter.js','utf8');
const node=()=>({textContent:'',title:'',dataset:{}});
const num=node(),subtitle=node(),count=node(),summary=node(),badge=node(),group=node();
summary.textContent='Todas as disciplinas · 179 imagens disponíveis';
const stat={querySelector(k){return k==='b'?num:k==='span'?subtitle:null}};
const lookup={imageCount:count,bm155FilterSummary:summary,'bm205-drive-count':badge,'bm084-sync':group};
const doc={readyState:'complete',hidden:false,
  getElementById(id){return lookup[id]||null},
  querySelector(sel){return sel==='.stats .stat:nth-child(3)'?stat:null},
  addEventListener(){}};
const win={addEventListener(){},BancoMestreDriveImagesV182:null};
const context={window:win,document:doc,
  MutationObserver:class{observe(){}},
  setInterval(){return 1},
  Date,Number,String,Boolean,Object,Array};
vm.runInNewContext(code,context);
assert.equal(num.textContent,'179');
assert.match(count.textContent,/Drive/);
win.BancoMestreDriveImagesV182={
  connected:true,lastSuccess:'2026-11-17T15:00:00Z',
  lastCount:38,lastError:''
};
win.BM208AtlasUnified.refresh();
assert.equal(num.textContent,'217');
assert.match(subtitle.textContent,/179 publicadas \+ 38 do Drive/);
assert.match(count.textContent,/217 imagens no Atlas/);
assert.match(summary.textContent,/Atlas total: 217 imagens/);
assert.equal(group.dataset.bmUnifiedAtlasTotal,'217');
win.BancoMestreDriveImagesV182.lastCount=39;
win.BM208AtlasUnified.refresh();
assert.equal(num.textContent,'218');
assert.equal((summary.textContent.match(/Atlas total:/g)||[]).length,1);
win.BancoMestreDriveImagesV182.connected=false;
win.BM208AtlasUnified.refresh();
assert.equal(num.textContent,'179');
assert.match(count.textContent,/conecte o Drive/i);
assert.doesNotMatch(summary.textContent,/Atlas total:/);
console.log('V208 OK: 179 base, soma 38/39 autorizadas, deduplicação de rótulos e sessão desconectada');
