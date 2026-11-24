import test from 'node:test';import assert from 'node:assert/strict';import {createImageAnnotationService,ImageAnnotationRejected,ImageAnnotationUncertain} from '../infra/central-drive/image-annotations.mjs';
const profile=subject=>({subject,publicCards:[],privateData:{cards:[{id:'CARD-1',front:'Q',back:'A',active:true}],images:[{file_id:'source'+subject,imageId:'IMG-1',name:'figure.svg',mimeType:'image/svg+xml',cardIds:['CARD-1']}] }});
test('marcações por imagem, isolamento, conflito e preservação do original',async()=>{
 const store=new Map();let fail=false,writes=0;const provider={readUploadedImages:async()=>[],readImageState:async s=>store.has(s)?structuredClone(store.get(s)):null,saveImageState:async(s,expected,payload)=>{assert.equal(payload.owner,s);assert.equal(expected?.version??null,store.get(s)?.version??null);store.set(s,{id:'state'+s,version:String(++writes),payload:structuredClone(payload)});if(fail){fail=false;throw Error('lost receipt')}}};
 const service=createImageAnnotationService(),op=(s,kind,input=null,id='IMG-1')=>service({provider,profile:profile(s),operation:{kind,id,input}});
 const a=await op('A','read'),b=await op('B','read');assert.deepEqual(a.strokes,[]);const strokes=[{type:'rect',box:[.1,.2,.4,.5],color:'#ffd400',size:16}];
 fail=true;await assert.rejects(op('A','save',{expected:a.version,strokes}),ImageAnnotationUncertain);
 const confirmed=await op('A','save',{expected:a.version,strokes});assert.equal(writes,1);assert.deepEqual(confirmed.strokes,strokes);assert.deepEqual((await op('B','read')).strokes,b.strokes);
 await assert.rejects(op('A','save',{expected:a.version,strokes:[]}),ImageAnnotationRejected);
 await assert.rejects(op('A','read',null,'sourceB'),ImageAnnotationRejected);
 await assert.rejects(op('A','save',{expected:confirmed.version,strokes:[{...strokes[0],box:[0,0,3,3]}]}),ImageAnnotationRejected);
 await op('A','save',{expected:confirmed.version,strokes:[]});assert.deepEqual((await op('A','read')).strokes,[]);
});
