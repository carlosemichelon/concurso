import assert from 'node:assert/strict';
import {DriveOnlyViewer} from '../viewer.mjs';

const metrics={session:0,media:[],signOut:0,created:[],revoked:[]};
let authenticated=true;
let onMedia=async(purpose)=>new Blob([purpose],{type:purpose==='pdf'?'application/pdf':'image/png'});
const client={
 signInPath:()=>'/api/banco-mestre/auth/google/start',
 session:async()=>{metrics.session++;return {source:'google-drive',authenticated}},
 media:async(key,{purpose})=>{metrics.media.push({key,purpose});return onMedia(purpose)},
 signOut:async()=>{metrics.signOut++;return {ok:true}}
};
const urls={
 createObjectURL:b=>{const uri='blob:private/'+(metrics.created.length+1);metrics.created.push({uri,mime:b.type});return uri},
 revokeObjectURL:u=>metrics.revoked.push(u)
};
const viewer=new DriveOnlyViewer({client,urlApi:urls});
assert.equal(viewer.state,'unknown');
assert.equal(viewer.loginPath,'/api/banco-mestre/auth/google/start');
await Promise.all([viewer.boot(),viewer.boot(),viewer.boot()]);
assert.equal(metrics.session,1,'inicialização consulta sessão apenas uma vez');
assert.equal(viewer.state,'authenticated');

const image=await viewer.image('IMG00001');
const pdf=await viewer.pdf('PDF00001');
assert.equal(image,'blob:private/1');
assert.equal(pdf,'blob:private/2');
assert.deepEqual(metrics.media,[{key:'IMG00001',purpose:'image'},{key:'PDF00001',purpose:'pdf'}]);
assert.equal(metrics.session,1,'imagem e PDF NÃO solicitam nova autenticação');
viewer.release(image);
assert.deepEqual(metrics.revoked,[image]);
await viewer.logout('1234567890123456');
assert.equal(metrics.signOut,1);
assert.equal(viewer.state,'login-required');
assert.deepEqual(metrics.revoked,[image,pdf],'não manter imagem e PDF no navegador após logout');
authenticated=false;
await assert.rejects(viewer.image('IMG00001'),e=>e.code==='LOGIN_REQUIRED');
assert.equal(metrics.session,2,'apenas uma consulta de sessão após logout');
assert.equal(metrics.media.length,2,'não consultar mídia desautorizada');

const another=new DriveOnlyViewer({client,urlApi:urls});
authenticated=true;
onMedia=async()=>{const err=Error('401');err.code='LOGIN_REQUIRED';throw err};
await assert.rejects(another.pdf('PDF00001'),e=>e.code==='LOGIN_REQUIRED');
assert.equal(another.state,'login-required','401 sinaliza login em vez de lançar prompt em cada mídia');
console.log('V1 media viewer OK: único login por sessão, duas mídias sem popup e limpeza segura');
