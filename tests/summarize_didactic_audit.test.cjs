'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {summarize}=require('../tools/summarize_didactic_audit.cjs');
const data={total:3,approved:1,blocked:2,results:[{id:'A',part:'P',faults:['x','x','y']},{id:'B',part:'P',faults:['x']},{id:'C',part:'Q',faults:[]}]};
test('counts and distinct failures retained',()=>{const s=summarize(data);assert.equal(s.blocked,2);assert.deepEqual(s.byPart,[['P',2]]);assert.deepEqual(s.topFaults,[['x',2],['y',1]])});
test('invalid or truncated report fails closed',()=>{for(const r of [null,{...data,blocked:0},{...data,results:[]},{...data,results:[...data.results.slice(0,2),{id:'C',part:'Q',faults:['z']}]}])assert.throws(()=>summarize(r))});
test('approved report remains approved',()=>assert.equal(summarize({total:1,approved:1,blocked:0,results:[{id:'C',part:'Q',faults:[]}]}).blocked,0));
