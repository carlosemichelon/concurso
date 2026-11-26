import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountTokens} from '../infra/vs41-private/oauth.mjs';
const users=new Map(['A','B'].map(s=>[s,{subject:s,rootId:'root'+s,profileId:'profile'+s}]));
const grants=['A','B'].map(s=>({subject:s,permissionId:'google'+s,refreshToken:'refresh'+s}));
const session=s=>({...users.get(s),sessionId:'session'+s});
function setup(overrides={}){
 let time=0,counts={refresh:0,about:0};
 const provider=accountTokens({users,grants,clientId:'fixture',clientSecret:'fixture',now:()=>time,fetcher:async(url,opts)=>{
  if(url==='https://oauth2.googleapis.com/token'){counts.refresh++;const s=opts.body.get('refresh_token').slice(-1);return Response.json({access_token:'access'+s,expires_in:120});}
  counts.about++;const s=opts.headers.Authorization.slice(-1);return Response.json({user:{permissionId:'google'+s}});
 },...overrides});
 return {provider,counts,advance:ms=>{time+=ms}};
}
test('credencial distinta e cache individual, renovação e identidade verificadas',async()=>{
 const f=setup(),{provider}=f;
 const [a,b]=await Promise.all([provider(session('A')),provider(session('B'))]);assert.equal(a.token,'accessA');assert.equal(b.token,'accessB');
 await provider(session('A'));assert.deepEqual(f.counts,{refresh:2,about:2});
 f.advance(61000);await provider(session('B'));assert.deepEqual(f.counts,{refresh:3,about:3});
 await assert.rejects(provider());await assert.rejects(provider({...session('A'),rootId:'rootB'}));await assert.rejects(provider({...session('A'),profileId:'profileB'}));
});
test('recusa duplicatas, conta trocada, revogação e ausência de autorização',async()=>{
 assert.throws(()=>setup({grants:[grants[0],{...grants[1],permissionId:grants[0].permissionId}]}));
 assert.throws(()=>setup({grants:[grants[0],{...grants[1],refreshToken:grants[0].refreshToken}]}));
 assert.throws(()=>setup({grants:[grants[0]]}));
 const f=setup({fetcher:async(url)=>url.includes('/token')?Response.json({access_token:'wrong',expires_in:120}):Response.json({user:{permissionId:'googleB'}})});
 await assert.rejects(f.provider(session('A')),/outra conta/);
 const revoked=setup({fetcher:async()=>new Response(null,{status:401})});
 await assert.rejects(revoked.provider(session('A')),/indisponível/);
});
