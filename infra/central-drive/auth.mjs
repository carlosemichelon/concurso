import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt), id=/^[A-Za-z0-9_-]{1,160}$/;
const cookie='__Host-bm_session';
const validId=x=>typeof x==='string'&&id.test(x);
const opts={N:32768,r:8,p:1,maxmem:64*1024*1024};
export async function passwordHash(password,salt=randomBytes(16).toString('hex')){
 if(typeof password!=='string'||password.length<12||password.length>256||!/^[a-f0-9]{32}$/.test(salt))throw Error('Senha deve ter 12 a 256 caracteres.');
 return salt+':'+(await derive(password,salt,32,opts)).toString('hex');
}
export function parseUsers(raw){
 const rows=JSON.parse(raw);if(!Array.isArray(rows)||rows.length<1||rows.length>50)throw Error('Configuração de usuários inválida.');
 const users=new Map(),subjects=new Set(),roots=new Set();
 for(const u of rows){
  if(!u||!validId(u.username)||!validId(u.subject)||!validId(u.rootId)||typeof u.passwordHash!=='string'||!/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(u.passwordHash)||subjects.has(u.subject)||roots.has(u.rootId)||users.has(u.username))throw Error('Usuário, credencial ou destino duplicado/inválido.');
  users.set(u.username,Object.freeze({...u}));subjects.add(u.subject);roots.add(u.rootId);
 }return users;
}
export function createAuth({users,now=Date.now,ttl=8*3600000,maxAttempts=8}){
 const sessions=new Map(),limits=new Map();const dummy='0'.repeat(32)+':'+'0'.repeat(64);let inFlight=0;
 function clean(){const t=now();for(const [k,v] of sessions)if(v.expires<=t)sessions.delete(k);for(const [k,v] of limits)if(v.expires<=t)limits.delete(k)}
 function revoke(token){if(token)sessions.delete(token)}
 function read(token){clean();return sessions.get(token)||null}
 function checkLimit(key){const v=limits.get(key)||{count:0,expires:now()+15*60000};if(v.count>=maxAttempts)return false;v.count++;limits.set(key,v);return true}
 async function login(username,password,ip,oldToken){
  clean();if(typeof username!=='string'||typeof password!=='string'||username.length>160||password.length>256)return null;
  if(limits.size>10000||inFlight>=4||!checkLimit('ip:'+ip)||!checkLimit('user:'+username))return null;
  const user=users.get(username),[salt,hash]=(user?.passwordHash||dummy).split(':');let ok=false;inFlight++;
  try{const actual=await derive(password,salt,32,opts);ok=timingSafeEqual(actual,Buffer.from(hash,'hex'))}finally{inFlight--}
  if(!user||!ok)return null;
  if(sessions.size>=1000)return null;
  revoke(oldToken);const token=randomBytes(32).toString('hex');const expires=now()+ttl;sessions.set(token,{user,expires});return {token,user,expires};
 }
 return {login,read,revoke};
}
export function sessionToken(header=''){const entries=header.split(';').map(x=>x.trim()).filter(x=>x.startsWith(cookie+'='));if(entries.length!==1)return '';const t=entries[0].slice(cookie.length+1);return /^[a-f0-9]{64}$/.test(t)?t:''}
export function sessionCookie(token,seconds){return cookie+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+seconds}
