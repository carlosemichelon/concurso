#!/usr/bin/env node
'use strict';
// Journal privado de um lote: executar somente em arquivos fora do repositório.
// Nenhuma operação de rede. Recibos são fornecidos após a confirmação real de cada destino.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const STAGES=['drive','github','pages','browser'];
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const canonical=x=>JSON.stringify(stable(x));
const hash=x=>crypto.createHash('sha256').update(canonical(x)).digest('hex');
const same=(a,b)=>canonical(a)===canonical(b);
const nonempty=x=>typeof x==='string'&&!!x.trim();
const clone=x=>JSON.parse(JSON.stringify(x));
function validateDraft(d){
 assert.ok(d&&nonempty(d.batch_id)&&nonempty(d.source_version),'Lote e versão de origem obrigatórios');
 assert.ok(Array.isArray(d.operations)&&d.operations.length,'Operações completas obrigatórias');
 assert.ok(Array.isArray(d.targets)&&d.targets.includes('drive')&&new Set(d.targets).size===d.targets.length&&d.targets.every(s=>STAGES.includes(s)),'Destinos inválidos');
 if(d.targets.includes('pages'))assert.ok(d.targets.includes('github'),'Pages exige GitHub');
 if(d.targets.includes('browser'))assert.ok(d.targets.includes('pages'),'Navegador exige Pages');
 const keys=new Set(),events=new Set();
 for(const op of d.operations){
  assert.ok(nonempty(op.key)&&nonempty(op.kind)&&op.payload!==undefined&&!keys.has(op.key),'Chave duplicada ou operação incompleta');
  keys.add(op.key);
  if(op.kind==='srs'){assert.ok(nonempty(op.event_id)&&!events.has(op.event_id),'Evento SRS sem chave única');events.add(op.event_id);}
 }
 assert.ok(d.id_map&&typeof d.id_map==='object'&&!Array.isArray(d.id_map),'Mapa de IDs obrigatório');
 const ids=Object.values(d.id_map);assert.ok(ids.every(x=>/^CARD-\d{4,}$/.test(x))&&new Set(ids).size===ids.length,'IDs novos inválidos ou repetidos');
 return d;
}
function verify(j){
 assert.equal(j.format,'BancoMestreStudyBatch1');validateDraft(j.delta);
 assert.equal(j.digest,hash(j.delta),'Hash do lote divergente');
 assert.ok(j.receipts&&typeof j.receipts==='object'&&!Array.isArray(j.receipts));
 assert.ok(j.sealed===true||j.sealed===false);
 if(!j.sealed)assert.equal(Object.keys(j.receipts).length,0,'Lote aberto não tem recibos de publicação');
 for(const [s,r] of Object.entries(j.receipts)){
  assert.ok(j.delta.targets.includes(s)&&r.digest===j.digest&&nonempty(r.ref)&&nonempty(r.at),'Recibo inválido');
 }
 if(j.receipts.pages)assert.ok(j.receipts.github,'Pages exige recibo GitHub');
 if(j.receipts.browser)assert.ok(j.receipts.pages,'Navegador exige recibo Pages');
 return j;
}
function checkpoint(existing,d){
 validateDraft(d);
 if(!existing)return {format:'BancoMestreStudyBatch1',delta:clone(d),digest:hash(d),sealed:false,receipts:{}};
 verify(existing);
 if(same(existing.delta,d))return existing;
 assert.ok(!existing.sealed,'Lote congelado: iniciar outro lote');
 const before=existing.delta;
 assert.equal(before.batch_id,d.batch_id);assert.equal(before.source_version,d.source_version);
 assert.ok(same(before.targets,d.targets),'Destinos do lote já definidos');
 const next=new Map(d.operations.map(x=>[x.key,x]));
 for(const op of before.operations)assert.ok(next.has(op.key)&&same(next.get(op.key),op),'Operação anterior removida ou alterada: '+op.key);
 for(const [k,id] of Object.entries(before.id_map))assert.equal(d.id_map[k],id,'ID anteriormente reservado mudou');
 return {...existing,delta:clone(d),digest:hash(d)};
}
function seal(j){verify(j);return j.sealed?j:{...j,sealed:true}}
function acknowledge(j,stage,receipt){
 verify(j);assert.ok(j.sealed,'Congelar o lote antes de registrar recibos');
 assert.ok(j.delta.targets.includes(stage),'Destino não aplicável');
 assert.ok(receipt&&receipt.digest===j.digest&&nonempty(receipt.ref)&&nonempty(receipt.at),'Recibo não corresponde ao lote ou não contém evidência');
 if(j.receipts[stage]){assert.ok(same(j.receipts[stage],receipt),'Recibo já existe: não repetir a operação');return j;}
 if(stage==='pages')assert.ok(j.receipts.github,'GitHub ainda não confirmado');
 if(stage==='browser')assert.ok(j.receipts.pages,'Pages ainda não confirmado');
 return verify({...j,receipts:{...j.receipts,[stage]:clone(receipt)}});
}
function status(j){
 verify(j);
 const confirmed=j.delta.targets.filter(s=>!!j.receipts[s]);
 const pending=j.delta.targets.filter(s=>!j.receipts[s]);
 // Apenas destinos ainda não confirmados e com pré-requisitos satisfeitos.
 // O Drive é independente; lote privado não exige publicação nem navegador.
 const ready=j.sealed?pending.filter(s=>s!=='pages'&&s!=='browser'||s==='pages'&&!!j.receipts.github||s==='browser'&&!!j.receipts.pages):[];
 return {batch_id:j.delta.batch_id,sealed:j.sealed,digest:j.digest,operations:j.delta.operations.length,confirmed,pending,ready};
}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function outsideRepo(p){
 const root=path.resolve(__dirname,'..'),dir=fs.realpathSync(path.dirname(path.resolve(p)));
 assert.ok(dir!==root&&!dir.startsWith(root+path.sep),'Arquivo privado deve ficar fora do repositório GitHub');
 return path.join(dir,path.basename(p));
}
function update(file,fn){
 file=outsideRepo(file);const lock=file+'.lock';
 const fd=fs.openSync(lock,'wx',0o600);
 let tmp;
 try{
  const prev=fs.existsSync(file)?read(file):null,next=fn(prev);
  if(next===prev)return status(next);
  tmp=file+'.tmp-'+crypto.randomUUID();fs.writeFileSync(tmp,JSON.stringify(next,null,2)+'\n',{flag:'wx',mode:0o600});
  const sync=fs.openSync(tmp,'r');try{fs.fsyncSync(sync)}finally{fs.closeSync(sync)}
  fs.renameSync(tmp,file);tmp=null;return status(next);
 }finally{if(tmp&&fs.existsSync(tmp))fs.unlinkSync(tmp);fs.closeSync(fd);fs.unlinkSync(lock)}
}
function main(){
 const [cmd,file,arg,receipt]=process.argv.slice(2);
 assert.ok(file,'Uso: checkpoint ARQUIVO DELTA.json | seal ARQUIVO | ack ARQUIVO ETAPA RECIBO.json | status ARQUIVO');
 let result;
 if(cmd==='checkpoint')result=update(file,j=>checkpoint(j,read(outsideRepo(arg))));
 else if(cmd==='seal')result=update(file,seal);
 else if(cmd==='ack')result=update(file,j=>acknowledge(j,arg,read(outsideRepo(receipt))));
 else if(cmd==='status')result=status(read(outsideRepo(file)));
 else throw Error('Comando inválido');
 console.log(JSON.stringify(result,null,2));
}
if(require.main===module)try{main()}catch(e){console.error(e.message);process.exitCode=1}
module.exports={checkpoint,seal,acknowledge,status,verify,hash};
