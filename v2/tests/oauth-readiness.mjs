import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessOAuthReadiness,friendlyOauthError,manualOAuthChecklist,EXPECTED_SCOPE}
 from '../assets/oauth-readiness.js';
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const config=JSON.parse(readFileSync(resolve(root,'assets/drive_auth_v038.json'),'utf8'));
assert.equal(config.scope,EXPECTED_SCOPE);
const hosted=assessOAuthReadiness(config,{
 origin:'https://carlosemichelon.github.io',secureContext:true,identityApi:true,
 connected:false
});
assert.equal(hosted.clientValid,true);
assert.equal(hosted.scopeValid,true);
assert.equal(hosted.originMatches,true);
assert.equal(hosted.appReady,true);
assert.equal(hosted.googleCloudOriginVerified,false,
 'o arquivo de configuração não comprova aprovação no Google Cloud');
const local=assessOAuthReadiness(config,{
 origin:'http://127.0.0.1:5000',secureContext:true,identityApi:true
});
assert.equal(local.isLoopback,true);
assert.equal(local.originMatches,false);
assert.equal(local.appReady,false);
assert.match(local.notes.join(' '),/localhost/);
const wrongOrigin=assessOAuthReadiness(config,{
 origin:'https://outra-origem.github.io',secureContext:true,identityApi:true
});
assert.equal(wrongOrigin.appReady,false);
assert.match(wrongOrigin.notes.join(' '),/origem atual difere/i);
const insecure=assessOAuthReadiness(config,{
 origin:'http://inseguro.example',secureContext:false,identityApi:true
});
assert.equal(insecure.secure,false);
assert.equal(insecure.appReady,false);
assert.equal(assessOAuthReadiness({...config,scope:'https://www.googleapis.com/auth/drive'},{
 origin:'https://carlosemichelon.github.io',secureContext:true,identityApi:true
}).scopeValid,false);
assert.equal(assessOAuthReadiness({...config,client_id:'secret'},{
 origin:'https://carlosemichelon.github.io',secureContext:true,identityApi:true
}).clientValid,false);
assert.match(friendlyOauthError({type:'popup_failed_to_open'}),/pop-ups/);
assert.match(friendlyOauthError({type:'origin_mismatch'}),/origem/i);
assert.match(friendlyOauthError({error:'access_denied'}),/recusada/i);
assert.match(friendlyOauthError({type:'popup_closed'}),/fechada/i);
const checklist=manualOAuthChecklist(hosted);
assert.ok(checklist.includes('https://carlosemichelon.github.io'));
assert.ok(checklist.includes('Testar acesso a 1 PDF'));
assert.equal(checklist.includes(config.client_id),false,'não exportar Client ID para checklist');
assert.equal(checklist.includes('TEST_ONLY_NOT_REAL'),false,'nenhum token em checklist');
assert.ok(!checklist.includes('1ffxfVoJ52WB1u4rr96zt0z0X7PnXpPKL'),'sem IDs de arquivo');
console.log('V2 OAuth preflight OK:',{
 hostedOriginMatches:hosted.originMatches,hostedAppReady:hosted.appReady,
 localWarning:local.isLoopback,cloudApprovalUnverified:!hosted.googleCloudOriginVerified,
 invalidScopeBlocked:true,errorsTranslated:true,checklistWithoutTokens:true
});
