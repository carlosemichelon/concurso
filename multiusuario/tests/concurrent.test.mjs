import {strict as assert} from 'node:assert';
import {PrivateDrive} from '../assets/drive.js';
import {empty} from '../assets/model.js';
let serial=0;
const files=new Map(),subjects={tokenA:'accountA',tokenB:'accountB'},writes=[];
const clone=x=>JSON.parse(JSON.stringify(x));
globalThis.fetch=async (url,options={})=>{
 const [path,query='']=url.split('?'), params=Object.fromEntries(query.split('&').filter(Boolean).map(x=>{const i=x.indexOf('=');return [decodeURIComponent(x.slice(0,i)),decodeURIComponent(x.slice(i+1))]}));
 const owner=subjects[options.headers?.Authorization?.replace('Bearer ','')],ok=data=>({ok:true,json:async()=>clone(data)}),err={ok:false,status:403};
 if(!owner)return err;
 if(path==='https://www.googleapis.com/drive/v3/files'){
  if(options.method==='POST'){
   const meta=JSON.parse(options.body),id='id'+(++serial),file={...meta,id,ownedByMe:true,shared:false,owner};
   if(meta.parents?.some(p=>files.get(p)?.owner!==owner))return err;
   files.set(id,file);return ok(file);
  }
  const q=params.q||'',kind=q.match(/key='bmKind' and value='([^']+)'/)?.[1],subject=q.match(/key='bmOwner' and value='([^']+)'/)?.[1],parent=q.match(/and '([^']+)' in parents/)?.[1];
  return ok({files:[...files.values()].filter(f=>f.owner===owner&&f.appProperties?.bmOwner===subject&&f.appProperties?.bmKind===kind&&(!parent||f.parents?.includes(parent)))});
 }
 if(path==='https://www.googleapis.com/upload/drive/v3/files'){
  const body=typeof options.body==='string'?options.body:await options.body.text(),pieces=body.split('\r\n\r\n'),meta=JSON.parse(pieces[1].split('\r\n--')[0]);
  const p=files.get(meta.parents[0]);if(!p||p.owner!==owner||p.shared)return err;
  const raw=pieces[2].split('\r\n--')[0],id='id'+(++serial);
  const file={...meta,id,ownedByMe:true,shared:false,owner,size:String(raw.length),data:meta.mimeType==='application/json'?JSON.parse(raw):raw};
  files.set(id,file);writes.push({owner,parent:meta.parents[0]});return ok(file);
 }
 const f=files.get(path.split('/').at(-1));if(!f||f.owner!==owner)return err;
 if(params.alt==='media'&&f.mimeType!=='application/json')return {ok:true,blob:async()=>new Blob([f.data],{type:f.mimeType})};
 return ok(params.alt==='media'?f.data:f);
};
function session(token){const d=new PrivateDrive();d.token=token;d.expiry=Date.now()+100000;d.identity={id:subjects[token],email:subjects[token]+'@example.com'};return d}
const a=session('tokenA'),b=session('tokenB');
await Promise.all([a.openRoot(),b.openRoot()]);
assert.notEqual(a.root.id,b.root.id);
assert.deepEqual(await a.read(),empty());assert.deepEqual(await b.read(),empty());
const da=empty(),db=empty();
da.questions.push({id:'A',question:'Conta A',at:'2026-11-23T12:00:00Z'});
db.questions.push({id:'B',question:'Conta B',at:'2026-11-23T12:00:00Z'});
await Promise.all([a.save(da),b.save(db)]);
assert.deepEqual(await a.read(),da);assert.deepEqual(await b.read(),db);
await assert.rejects(()=>a.request('https://www.googleapis.com/drive/v3/files/'+b.head+'?alt=media'));
const pdf=Object.assign(new Blob(['%PDF-1.4'],{type:'application/pdf'}),{name:'teste.pdf'});
const [fa,fb]=await Promise.all([a.uploadAttachment(pdf,'pdf'),b.uploadAttachment(pdf,'pdf')]);
assert.notEqual(fa.fileId,fb.fileId);
assert.equal((await a.attachmentBytes(fa.fileId,'pdf')).bytes.size,pdf.size);
await assert.rejects(()=>a.attachmentBytes(fb.fileId,'pdf'));
assert.ok(writes.every(r=>files.get(r.parent).owner===r.owner));
const a2=session('tokenA');await a2.openRoot();await a2.read();
da.questions.push({id:'A2',question:'Novo estudo',at:'2026-11-23T13:00:00Z'});
await a.save(da);await assert.rejects(()=>a2.save(empty()),/Outra sessão/);assert.deepEqual(await a.read(),da);
files.get(a.root.id).shared=true;await assert.rejects(()=>a.save(da),/ambiente privado/);files.get(a.root.id).shared=false;
a.clear();await assert.rejects(()=>a.read());assert.deepEqual(await b.read(),db);
console.log('PASS: duas contas simultâneas, arquivos separados, bloqueio cruzado, conflito, compartilhamento e logout (Drive simulado).');
