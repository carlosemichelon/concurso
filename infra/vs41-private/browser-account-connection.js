// Starts before legacy scripts in the original document. The existing header button is the login.
(function(){'use strict';
 const nativeFetch=window.fetch.bind(window),base=new URL('.',location.href),accountModule=new URL('infra/vs41-private/browser-account.mjs',base);
 const memory=()=>{const m=new Map();return Object.freeze({getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear(),key:i=>[...m.keys()][i]??null,get length(){return m.size}})};
 // Never read, overwrite or transfer the prior single-user local browser state.
 for(const k of ['localStorage','sessionStorage'])Object.defineProperty(window,k,{value:memory()});
 let resolve,session=null,closed=false,opening=false,client=null,abort=null,timer=null;
 const ready=new Promise(r=>{resolve=r}),nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
 const status=s=>{const e=document.getElementById('bm239-sync-details');if(e){e.textContent=s;e.title=s}};
 function close(){if(closed)return;closed=true;clearTimeout(timer);abort?.abort();session=null;resolve(null);localStorage.clear();sessionStorage.clear();document.documentElement.style.visibility='hidden';location.reload();}
 Object.defineProperty(window,'BMPortalBridge',{value:Object.freeze({close})});
 const button=()=>document.getElementById('bm239-drive-action');
 function refreshButton(){const b=button();if(!b)return;b.textContent=opening?'Carregando Drive…':session?'Trocar conta Google':'Selecionar conta Google';b.disabled=opening||!client;b.setAttribute('aria-busy',String(opening));b.title='Selecionar a conta individual do Drive';b.setAttribute('aria-label',b.title);}
 async function prepare(){
  try{
   const config=await (await nativeFetch(new URL('assets/drive_auth_v038.json',base),{cache:'no-store'})).json();
   const mod=await import(accountModule.href);
   if(!window.google?.accounts?.oauth2){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=res;s.onerror=()=>rej(Error('Google indisponível'));document.head.append(s)})}
   client=google.accounts.oauth2.initTokenClient({client_id:config.client_id,scope:mod.scope,callback:async r=>{
    if(closed)return;if(r.error||!r.access_token||!google.accounts.oauth2.hasGrantedAllScopes(r,mod.scope)){opening=false;status('Autorização não concedida');refreshButton();return;}
    try{abort=new AbortController();status('Carregando seu Banco Mestre no Drive…');
     const p=await mod.connectAccount({token:r.access_token,fetcher:nativeFetch,signal:abort.signal,allowEditorial:()=>true});
     if(closed)return;session=p;resolve(p);timer=setTimeout(close,Math.max(1000,(Number(r.expires_in||3600)-60)*1000));
     status(p.snapshot.version+' · '+p.snapshot.records.length+' cartões · '+(p.snapshot.scope==='editorial-candidate-only'?'espelho editorial conferido do site · somente leitura':'Drive individual · somente leitura'));
     document.dispatchEvent(new CustomEvent('bm-account-connected'));
     if(typeof loadCards==='function')void loadCards().catch(e=>status(e.message));
    }catch(e){status(e.message||'Banco individual indisponível')}finally{opening=false;refreshButton()}
   },error_callback:()=>{opening=false;status('Seleção cancelada');refreshButton()}});
   refreshButton();status('Selecione sua conta Google');
  }catch(e){status('Conexão indisponível: '+e.message);refreshButton()}
 }
 function select(){if(session){close();return;}if(!client||opening)return;opening=true;refreshButton();try{client.requestAccessToken({prompt:'select_account'})}catch(e){opening=false;status('Conexão não iniciada: '+e.message);refreshButton()}}
 document.addEventListener('DOMContentLoaded',()=>{const b=button();if(b){b.onclick=select;refreshButton()}void prepare()},{once:true});
 const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
 window.fetch=async(input,opts={})=>{
  const u=new URL(typeof input==='string'?input:input.url||String(input),location.href),method=String(opts.method||input?.method||'GET').toUpperCase();
  if(method==='GET'&&u.origin===location.origin&&u.pathname===new URL('controle-estudos-v415.html',base).pathname)return new Response(window.BMStudyTemplate,{status:200,headers:{'Content-Type':'text/html'}});
  // Legacy/public data and network mutations remain blocked in this mode.
  if(u.origin!==location.origin||!u.pathname.startsWith('/api/vs41/'))return json({error:'Fonte não autorizada'},403);
  const p=await ready;if(closed||!session||!p)return json({error:'Sessão encerrada'},401);
  if(u.pathname==='/api/vs41/logout'&&method==='POST'){queueMicrotask(close);return json({ok:true});}
  if(method!=='GET')return json({error:'Somente leitura'},403);
  if(u.pathname==='/api/vs41/session')return json({context:nonce});
  if(new Headers(opts.headers).get('X-BM-Context')!==nonce)return json({error:'Sessão divergente'},409);
  try{
   const key=u.pathname.slice('/api/vs41/'.length);
   if(key==='private-cards')return json({schema:'BM-VS41-PRIVATE-CARDS/1',records:p.snapshot.records,context:nonce});
   if(key==='study')return json({...await p.study(),context:nonce});
   if(key==='gaps')return json({...await p.gaps(),context:nonce});
   if(key==='reviews')return json({events:await p.reviews(),context:nonce});
   if(key==='formulas')return json({formula:await p.formulas(),context:nonce});
   if(key==='images')return json({images:await p.images(),context:nonce});
   if(key==='pdfs')return json({documents:await p.pdfs(),context:nonce});
   if(key.startsWith('media/')){const id=decodeURIComponent(key.split('/').at(-1)),blob=await p.readMedia(id);if(closed)return json({error:'Sessão encerrada'},401);return new Response(blob,{headers:{'Content-Type':blob.type,'X-BM-Context':nonce}})}
   return json({error:'Operação privada não disponível'},503);
  }catch(e){return json({error:e.message},503)}
 };
 addEventListener('pagehide',()=>{closed=true;abort?.abort();clearTimeout(timer);session=null;resolve(null);localStorage.clear();sessionStorage.clear()});
})();
