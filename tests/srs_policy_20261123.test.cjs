'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const bundle=fs.readFileSync(path.join(__dirname,'..','assets','v349_js_076_087.js'),'utf8');
const journal=fs.readFileSync(path.join(__dirname,'..','assets','v316_srs_journal.js'),'utf8');
const match=bundle.match(/\/\* 85 assets\/v311_srs_engine\.js \*\/([\s\S]*?)\}\)\(window\);/);
const w={};new Function('window',match[0])(w);
const e=w.BMSRSV311;
const row=(rating,more={})=>({id:'CARD-0001',rating,last_review_at:'2026-11-24',attempts:1,srs_policy:e.policy,...more});
test('syntax of calendar and journal',()=>{assert.doesNotThrow(()=>new Function(bundle));assert.doesNotThrow(()=>new Function(journal))});
for(const [rating,days] of Object.entries({'Difícil':8,Bom:16,'Fácil':24,'Conhecimento preservado':32,'Conhecimento adquirido':64})){
 test('prospective '+rating,()=>{const r=e.fromSrs(row(rating,{events:[{rating:'Fácil',date:'2026-11-22'},{rating:'Fácil',date:'2026-11-23'}]}));assert.equal(r.intervalDays,days);assert.equal(r.due,e.addDays('2026-11-24',days));assert.equal(r.rating,rating)});
}
test('historical Errei and Fácil deadlines unchanged',()=>{for(const [rating,due] of [['Errei','2026-11-25'],['Fácil','2026-12-20']]){const r=e.fromSrs(row(rating,{srs_policy:undefined,last_review_at:'2026-11-20',next_review:due}));assert.equal(r.due,due);assert.equal(r.rating,rating)}});
const references=()=>Array.from({length:10},(_,i)=>({event_id:'r'+i,date:'2026-11-'+(14+i),srs_policy:e.policy}));
test('tenth explicit modern reference schedules 24 days',()=>assert.equal(e.byReferences(references(),'Bom').intervalDays,24));
test('difficult milestone takes precedence',()=>{const r=references();r[9].difficult=true;assert.equal(e.byReferences(r,'Bom').intervalDays,8)});
test('two formal Fácil events never auto-promote modern review',()=>assert.equal(e.fromSrs(row('Fácil',{attempts:2,events:[{rating:'Fácil',date:'2026-11-22'},{rating:'Fácil',date:'2026-11-24'}]})).consolidated,false));
