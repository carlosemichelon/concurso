import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {legacyMarkId,readLegacyPage,renderLegacyAnnotations} from '../assets/pdf-overlay.js';
import {pageStorageKey,sourceHash,LEGACY_DELETIONS_KEY} from '../assets/pdf-compat.js';
const doc='IJUI-PDF-05',bytes=new TextEncoder().encode('%PDF-1.4\n%%EOF\n').buffer;
const hash=await sourceHash(bytes,webcrypto);
assert.equal(hash,createHash('sha256').update(Buffer.from(bytes)).digest('hex').slice(0,24));
const legacy={type:'marker',points:[[.1,.2,.5],[.7,.2,.5]],created_at:'2026-11-17T12:00:00Z'};
assert.equal(legacyMarkId(legacy),'g:58d977e2cec7ed17','identidade geométrica V122 exata');
assert.equal(legacyMarkId({type:'unknown',value:5}),'l:8a9118b7188de31d');
assert.equal(legacyMarkId({id:'valid_mark_123'}),'id:valid_mark_123');
const erased={id:'erased_123',type:'text_highlight',rects:[[.11,.2,.31,.25]],color:'#FF00FF'};
const included={id:'present_123',type:'text_highlight',rects:[[.1,.2,.3,.25]],color:'#FDE68A'};
const under={id:'underline_123',type:'text_highlight',rects:[[.2,.4,.5,.48]],style:'underline',color:'#BAE6FD'};
const conceal={id:'conceal_123',type:'text_highlight',rects:[[.3,.5,.9,.6]],style:'conceal',color:'#BAE6FD'};
const pen={id:'pen_mark_123',type:'pen',points:[[.1,.1,.3],[.8,.8,.8]],size:4,color:'#174059'};
const note={id:'note_mark_123',type:'note',pos:[.3,.8],text:'Comentário de teste',color:'#174059'};
const page=pageStorageKey(doc,hash,1),old=pageStorageKey(doc,'aaaaaaaaaaaaaaaaaaaaaaaa',1);
class Storage{
 constructor(values){this.items=new Map(Object.entries(values));this.writeCount=0}
 get length(){return this.items.size}
 key(index){return [...this.items.keys()][index]??null}
 getItem(key){return this.items.get(key)??null}
 setItem(){this.writeCount++;throw Error('Sem escrita')}
 removeItem(){this.writeCount++;throw Error('Sem exclusão')}
 clear(){this.writeCount++;throw Error('Sem limpeza')}
}
const store=new Storage({
 [page]:JSON.stringify([included,under,conceal,pen,legacy,note,erased,
  {id:'soft_deleted_123',type:'rect',box:[.1,.1,.8,.8],bm108_deleted_at:'2026-11-17T12:30:00Z'}]),
 [old]:JSON.stringify([{id:'other_revision',type:'pen',points:[[0,0],[1,1]]}]),
 [LEGACY_DELETIONS_KEY]:JSON.stringify({[page]:{
  'id:erased_123':'2026-11-17T12:30:00Z',
  'g:58d977e2cec7ed17':'2026-11-17T12:30:00Z'
 }})
});
const result=readLegacyPage(store,doc,hash,1);
assert.equal(result.active,5);
assert.equal(result.removed,3);
assert.equal(result.marks.some(x=>x.id==='erased_123'),false);
assert.equal(result.marks.some(x=>x===legacy),false);
assert.equal(result.marks.some(x=>x.id==='present_123'),true);
assert.equal(store.writeCount,0);
const calls=[];
const ctx={
 save(){calls.push(['save'])},restore(){calls.push(['restore'])},
 beginPath(){calls.push(['begin'])},moveTo(...p){calls.push(['move',...p])},
 lineTo(...p){calls.push(['line',...p])},stroke(){calls.push(['stroke'])},
 fill(){calls.push(['fill'])},fillRect(...a){calls.push(['fillRect',...a])},
 fillText(...a){calls.push(['fillText',...a])},
 arc(...a){calls.push(['arc',...a])},
 set globalAlpha(v){calls.push(['alpha',v])},set globalCompositeOperation(v){calls.push(['blend',v])},
 set strokeStyle(v){calls.push(['strokeStyle',v])},set fillStyle(v){calls.push(['fillStyle',v])},
 set lineWidth(v){calls.push(['lineWidth',v])},
 set font(v){calls.push(['font',v])},
 set lineCap(v){calls.push(['lineCap',v])},set lineJoin(v){calls.push(['lineJoin',v])}
};
const drawn=renderLegacyAnnotations(ctx,result.marks,600,800);
assert.equal(drawn.drawn,5);
assert.equal(drawn.skipped,0);
assert.ok(calls.some(x=>x[0]==='fillRect'&&x[1]===60&&x[2]===160),'retângulo normalizado -> pixel real');
assert.ok(calls.some(x=>x[0]==='blend'&&x[1]==='multiply'),'grifo V1 preserva legibilidade');
assert.ok(calls.some(x=>x[0]==='fillText'&&x[1]==='⋯'),'conceal preservado');
assert.ok(calls.some(x=>x[0]==='fillText'&&x[1]==='Comentário de teste'));
assert.ok(calls.some(x=>x[0]==='stroke'),'pen e underline visíveis');
assert.equal(store.writeCount,0);
assert.throws(()=>renderLegacyAnnotations(ctx,[],0,800),/Canvas/);
const empty=readLegacyPage(store,doc,hash,2);
assert.equal(empty.active,0);
console.log('V2 PDF overlay OK:',{active:result.active,deleted:result.removed,drawn:drawn.drawn,
 legacyIdentity:true,normalizedGeometry:true,oldHashExcluded:true,storageWrites:store.writeCount});
