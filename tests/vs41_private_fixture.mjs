export const project='bm-portal-multi-v1';
export const card=label=>{
 const front='Pergunta privada '+label,back='Resposta privada '+label,expl='Explicação privada '+label;
 const titles=['Recuperação ativa','Resposta-modelo','Fundamento e fontes','Mecanismo','Fórmulas e unidades','Comparação','Aplicação e transferência','Cobertura cruzada','Condições e exceções','Pegadinhas','Macete e histórico'];
 const modules=titles.map((titulo,i)=>({ord:i+1,titulo,texto:i===0?front:i===1?back:'Módulo experimental '+(i+1)+' do perfil '+label}));
 const profile={id:'CARD-9901',title:'Cartão experimental '+label,front,back,source:'Fonte fictícia '+label,mnemonic:'Macete experimental '+label,satellites:[],modules,related_card_ids:[],related_question_ids:[],editorial:{status:'TESTE',answer_paragraphs:[back],highlights:[],formulas:[],media:[],table:null,history_collapsed:true,reveal_after_attempt:true}};
 return {id:'CARD-9901',front,back,expl,active:true,discipline:'Teste',group:'OUTROS',subject:'Teste',sub:'Teste',related_card_ids:[],consolidation:{primary_id:'CARD-9901',historical_ids:['CARD-9901'],profile}};
};
export const profiles=Object.fromEntries(['A','B'].map(s=>[s,{subject:s,rootId:'root'+s,profileId:'profile'+s,sessionId:'s'+s}]));
export function fixture(){const files=new Map(),requests=[];for(const s of ['A','B'])for(const kind of ['root','profile','cards']){
 const id=kind+s;files.set(id,{meta:{id,mimeType:kind==='root'?'application/vnd.google-apps.folder':'application/json',ownedByMe:true,shared:false,trashed:false,parents:kind==='root'?[]:['root'+s],appProperties:{bmProject:project,bmOwner:s,bmKind:kind},size:'200',version:'1'},payload:kind==='profile'?{schema:'BM-PORTAL-PROFILE/1',project,owner:s,catalog:'private-only',collections:{cards:'cards'+s}}:{schema:'BM-PORTAL-COLLECTION/1',project,owner:s,kind:'cards',records:[card(s)]}})}
 return {files,requests,getToken:async()=>({token:'fixture'}),fetcher:async(url,opts)=>{const u=new URL(url),id=u.pathname.split('/').pop(),f=files.get(id);requests.push({id,media:u.searchParams.has('alt')});if(opts.headers.Authorization!=='Bearer fixture'||opts.redirect!=='error')throw Error('Credencial de teste inválida');return f?Response.json(u.searchParams.has('alt')?f.payload:f.meta):new Response(null,{status:404})}};
}
