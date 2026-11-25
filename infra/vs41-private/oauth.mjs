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
