// Isolated, read-only browser transport for the original portal. No Google token enters this frame.
(function(){'use strict';
 const nonce=new URLSearchParams(location.search).get('bmSession');
 const parentOrigin=new URL(document.referrer||location.href).origin;
 let resolve,session=null,closed=false;
 const ready=new Promise(r=>{resolve=r});
 const memory=()=>{const m=new Map();return Object.freeze({getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear(),key:i=>[...m.keys()][i]??null,get length(){return m.size}})};
 for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{value:memory()});
 const close=()=>{if(closed)return;closed=true;session=null;resolve(null);localStorage.clear();sessionStorage.clear();document.documentElement.style.visibility='hidden';parent.postMessage({type:'bm-portal-close',nonce},parentOrigin)};
 Object.defineProperty(window,'BMPortalBridge',{value:Object.freeze({close})});
 if(parent===window||!nonce||!/^[a-f0-9]{32}$/.test(nonce)){close();return;}
 addEventListener('message',e=>{if(e.source!==parent||e.origin!==parentOrigin||closed||session||e.data?.type!=='bm-portal-data'||e.data.nonce!==nonce)return;
  if(!Array.isArray(e.data.records)||e.data.records.length>20000)return close();
  session={records:e.data.records,context:nonce,study:e.data.study||null};resolve(session);
 });
 const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
 window.fetch=async(input,opts={})=>{
  const u=new URL(typeof input==='string'?input:input.url||String(input),location.href);
  const method=String(opts.method||input?.method||'GET').toUpperCase();
  // Only the embedded, immutable original interface. Never enable general network fetch.
  if(method==='GET'&&u.origin===location.origin&&u.pathname===new URL('./controle-estudos-v415.html',location.href).pathname)return new Response(window.BMStudyTemplate,{status:200,headers:{'Content-Type':'text/html'}});
  if(u.origin!==location.origin||!u.pathname.startsWith('/api/vs41/'))return json({error:'Fonte não autorizada'},403);
  const data=await ready;if(closed||!session||!data)return json({error:'Sessão encerrada'},401);
  if(u.pathname==='/api/vs41/logout'&&method==='POST'){queueMicrotask(close);return json({ok:true});}
  if(method!=='GET')return json({error:'Somente leitura'},403);
  if(u.pathname==='/api/vs41/session')return json({context:nonce});
  if(new Headers(opts.headers).get('X-BM-Context')!==nonce)return json({error:'Sessão divergente'},409);
  if(u.pathname==='/api/vs41/study'){
   if(!session.study?.data)return json({error:'Controle individual não confirmado'},503);
   return json({...session.study,context:nonce});
  }
  if(u.pathname==='/api/vs41/private-cards')return json({schema:'BM-VS41-PRIVATE-CARDS/1',records:session.records,context:nonce});
  return json({error:'Dados privados ainda não integrados'},503);
 };
 addEventListener('pagehide',()=>{session=null;closed=true;resolve(null);localStorage.clear();sessionStorage.clear()});
 parent.postMessage({type:'bm-portal-ready',nonce},parentOrigin);
 setTimeout(()=>{if(!session&&!closed)close()},15000);
})();
