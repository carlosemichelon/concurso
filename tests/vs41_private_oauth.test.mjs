import {test} from 'node:test';import assert from 'node:assert/strict';import {ownerToken} from '../infra/vs41-private/oauth.mjs';
test('OAuth central: credenciais ausentes bloqueiam, requisições paralelas compartilham renovação',async()=>{
 assert.throws(()=>ownerToken({}));let requests=0,t=0;
 const get=ownerToken({clientId:'fake-id',clientSecret:'fake-secret',refreshToken:'fake-refresh',now:()=>t,fetcher:async(url,opts)=>{requests++;assert.equal(url,'https://oauth2.googleapis.com/token');assert.equal(opts.redirect,'error');assert.equal(opts.body.get('grant_type'),'refresh_token');return Response.json({access_token:'fake-access-'+requests,expires_in:3600})}});
 const [a,b]=await Promise.all([get(),get()]);assert.equal(a.token,b.token);assert.equal(requests,1);t=3550000;await get();assert.equal(requests,2);
});
