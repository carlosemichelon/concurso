/* Banco Mestre V084 — Worker privado para Claude.
 * NÃO deployar como proxy público. Exige ctx.access validado pelo Cloudflare Access
 * e e-mail permitido; senão devolve 403 antes de chamar a IA.
 * Nenhuma chave real aparece neste repositório.
 */
const SCHEMA={
 type:'object',additionalProperties:false,required:['segments'],
 properties:{segments:{type:'array',items:{
  type:'object',additionalProperties:false,required:['start','end','quote','kind','reason'],
  properties:{
   start:{type:'integer'},end:{type:'integer'},quote:{type:'string'},
   kind:{type:'string',enum:['proibicao','obrigacao','prazo_numero','excecao','banca','destaque']},
   reason:{type:'string'}
  }
 }}}
};
const SYSTEM=[
 'Você é assistente de estudo para concursos brasileiros.',
 'Analise SOMENTE o texto literal fornecido e proponha ATÉ 16 destaques relevantes.',
 'Use categorias: proibicao, obrigacao, prazo_numero, excecao, banca e destaque.',
 'destaque (laranja) = princípios, fundamentos, competências e ideias centrais realmente importantes.',
 'Não colore indicadores estruturais isolados como Art. 1º, Parágrafo único ou números de incisos sem relevância própria.',
 'Não destaque todos os parágrafos. Evite repetição e falso positivo.',
 'start e end são offsets EXATOS de JavaScript UTF-16 (substring(start,end)).',
 'quote DEVE ser idêntico à substring de entrada incluindo espaços e quebras de linha.',
 'Nunca interrompa uma palavra, não sobreponha sugestões e não invente texto.',
 'A resposta é proposta para revisão humana; não é parecer jurídico.',
 'Retorne segmentos em ordem crescente.'
].join('\n');
function json(value,status=200,origin=''){
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
 'Vary':'Origin','X-Content-Type-Options':'nosniff'};
 if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Credentials']='true'}
 return new Response(JSON.stringify(value),{status,headers});
}
export default {
 async fetch(request,env,ctx){
  const origin=request.headers.get('Origin')||'';
  const allowed=env.BM_ALLOWED_ORIGIN||'';
  if(!allowed||origin!==allowed)return json({error:'Origem não autorizada.'},403);
  const cors={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Credentials':'true',
   'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS',
   'Access-Control-Max-Age':'600','Vary':'Origin'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST'||new URL(request.url).pathname!=='/analyze')
   return json({error:'Rota não encontrada.'},404,allowed);
  // Proteção independente de CORS: sem Access REAL este Worker nunca consulta a API.
  if(!ctx?.access)return json({error:'Cloudflare Access obrigatório.'},403,allowed);
  let identity=null;
  try{identity=await ctx.access.getIdentity()}catch{}
  if(!identity?.email||!env.BM_ALLOWED_EMAIL||identity.email.toLowerCase()!==env.BM_ALLOWED_EMAIL.toLowerCase())
   return json({error:'Usuário não autorizado.'},403,allowed);
  if(!env.ANTHROPIC_API_KEY||!env.CLAUDE_MODEL)
   return json({error:'Backend privado ainda não configurado.'},503,allowed);
  const size=Number(request.headers.get('Content-Length')||0);
  if(size>16000)return json({error:'Texto excede limite.'},413,allowed);
  let body;
  try{body=await request.json()}catch{return json({error:'JSON inválido.'},400,allowed)}
  if(typeof body?.text!=='string'||body.text.length>10000||body.text.trim().length<12||
      Object.keys(body).some(k=>k!=='text'))
   return json({error:'Envie apenas texto selecionado (12–10000 caracteres).'},400,allowed);
  // Mensagem contém texto selecionado; nenhum PDF, anotação ou SRS é enviado.
  let upstream;
  try{
   upstream=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',headers:{
     'Authorization':'Bearer '+env.ANTHROPIC_API_KEY,
     'anthropic-version':'2026-10-21','Content-Type':'application/json'
    },
    body:JSON.stringify({
     model:env.CLAUDE_MODEL,max_tokens:2400,temperature:0,
     system:SYSTEM,
     messages:[{role:'user',content:'Analise o texto a seguir sem alterá-lo. Offsets UTF-16 exatos:\n\n'+body.text}],
     output_config:{format:{type:'json_schema',schema:SCHEMA}}
    })
   });
  }catch{return json({error:'Não foi possível acessar a API Claude.'},502,allowed)}
  if(!upstream.ok)return json({error:'A API Claude rejeitou a solicitação (HTTP '+upstream.status+').'},502,allowed);
  let payload,parsed;
  try{
   payload=await upstream.json();
   parsed=JSON.parse(payload.content?.find(x=>x.type==='text')?.text||'');
  }catch{return json({error:'Claude retornou formato inválido.'},502,allowed)}
  const list=parsed?.segments;
  if(!Array.isArray(list)||list.length>16)return json({error:'Sugestões excedem o limite.'},422,allowed);
  let previous=-1;
  for(const s of list){
   if(!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start<0||s.end<=s.start||
     s.end>body.text.length||s.start<previous||body.text.slice(s.start,s.end)!==s.quote||
     typeof s.reason!=='string'||s.reason.length>450||s.quote.length>1500){
    return json({error:'A IA devolveu deslocamento/trecho inválido; nada será aplicado.'},422,allowed);
   }
   previous=s.end;
  }
  return json({segments:list},200,allowed);
 }
};