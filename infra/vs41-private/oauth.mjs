// Server-only OAuth. The administrator authorizes the application outside the chat.
export function ownerToken({clientId,clientSecret,refreshToken,fetcher=fetch,now=Date.now}){
 if(![clientId,clientSecret,refreshToken].every(x=>typeof x==='string'&&x.trim()))throw Error('Autorização OAuth própria do aplicativo ausente');
 let cache=null,pending=null;
 return async()=>{if(cache&&now()+60000<cache.expiresAt)return cache;if(pending)return pending;
 pending=(async()=>{const r=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',redirect:'error',cache:'no-store',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:'refresh_token'})});
 if(!r.ok)throw Error('Autorização central indisponível');const data=await r.json();
 if(typeof data.access_token!=='string'||!data.access_token||!Number.isFinite(data.expires_in)||data.expires_in<60)throw Error('Token central inválido');
 return cache={token:data.access_token,expiresAt:now()+data.expires_in*1000}})();
 try{return await pending}finally{pending=null}
 };
}

// One OAuth client, one independent Google account grant per Banco Mestre subject.
// No administrator fallback. Google Drive permissionId is pinned server-side.
export function accountTokens({users,grants,clientId,clientSecret,fetcher=fetch,now=Date.now}){
 if(!(users instanceof Map)||!Array.isArray(grants)||grants.length!==users.size)throw Error('Autorizações individuais incompletas');
 const subjects=new Map([...users.values()].map(u=>[u.subject,u])),providers=new Map(),accounts=new Set(),refreshes=new Set();
 for(const g of grants){
  if(!g||!subjects.has(g.subject)||providers.has(g.subject)||typeof g.permissionId!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(g.permissionId)||accounts.has(g.permissionId)||typeof g.refreshToken!=='string'||!g.refreshToken.trim()||refreshes.has(g.refreshToken))throw Error('Conta Google duplicada ou autorização individual inválida');
  accounts.add(g.permissionId);refreshes.add(g.refreshToken);
  const user=subjects.get(g.subject),permissionId=g.permissionId,refresh=ownerToken({clientId,clientSecret,refreshToken:g.refreshToken,fetcher,now});
  let verified=null,pending=null;
  const verifiedToken=async()=>{
   const t=await refresh();
   if(verified===t)return t;
   if(pending?.token===t)return pending.promise;
   const promise=(async()=>{
    const r=await fetcher('https://www.googleapis.com/drive/v3/about?fields=user(permissionId)',{headers:{Authorization:'Bearer '+t.token},cache:'no-store',redirect:'error'});
    if(!r.ok)throw Error('Identidade Google indisponível');
    const data=await r.json();
    if(data.user?.permissionId!==permissionId)throw Error('Autorização pertence a outra conta Google');
    verified=t;return t;
   })();
   pending={token:t,promise};
   try{return await promise}finally{if(pending?.promise===promise)pending=null}
  };
  providers.set(g.subject,{user,verifiedToken});
 }
 return async session=>{
  const p=session&&providers.get(session.subject);
  if(!p||session.rootId!==p.user.rootId||session.profileId!==p.user.profileId||typeof session.sessionId!=='string'||!session.sessionId)throw Error('Sessão sem autorização individual');
  return p.verifiedToken();
 };
}

// Read-only cross-account permission check, using only configured private destinations.
// A transient network/authentication error is not evidence of isolation.
export async function verifyDriveIsolation({sessions,getToken,fetcher=fetch}){
 if(!Array.isArray(sessions)||sessions.length!==2||sessions[0].subject===sessions[1].subject)throw Error('Dois perfis distintos são necessários');
 const ids=sessions.flatMap(s=>[s.rootId,s.profileId]);
 if(new Set(ids).size!==4||ids.some(id=>typeof id!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(id)))throw Error('Destinos de teste inválidos');
 let denied=0;
 for(let i=0;i<2;i++){
  const {token}=await getToken(sessions[i]);
  if(typeof token!=='string'||!token)throw Error('Autorização individual ausente');
  for(const id of [sessions[1-i].rootId,sessions[1-i].profileId]){
   const r=await fetcher('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?fields=id',{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error'});
   if(r.status!==403&&r.status!==404)throw Error('Negação cruzada não confirmada');
   denied++;
  }
 }
 return {crossAccessDenied:denied===4,crossChecks:denied};
}
