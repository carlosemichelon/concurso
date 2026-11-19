/* V285: reconciliação privada e aditiva. OAuth do titular obrigatório.
 * Não publica conteúdo do Drive, histórico SRS nem lacunas no GitHub.
 * Não sobrescreve frente/verso ou versões didáticas públicas. */
(function(){
'use strict';
if(window.BM285PrivateReconcile)return;
const ROOT='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD';
const API='https://www.googleapis.com/drive/v3/files';
const GAP='LACUNAS_PETRO22_INCREMENTO_PRIVADO_V001_2026-11-19.json';
const ENRICH=new Set(['CARD-0578','CARD-1028','CARD-1528','CARD-1532','CARD-0610']);
const $=id=>document.getElementById(id);
const token=()=>window.BM239DriveGlobal?.writeToken?.()||'';
let busy=false,last=null;
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const sig=r=>[fold(r.questaoId),fold(r.descricao),[...(r.cardIds||[])].sort().join(',')].join('|');
function status(msg,error){const x=$('bm285-result');if(x){x.textContent=msg;x.style.color=error?'#a33d39':'#42646a';}}
async function request(url){
 const t=token();if(!t)throw Error('Conecte o Google Drive pelo cabeçalho antes de sincronizar.');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+t},cache:'no-store'});
 if(r.status===401)throw Error('A sessão Google expirou. Reconecte o Drive.');
 if(r.status===403)throw Error('Sem acesso ao arquivo privado do Google Drive.');
 if(!r.ok)throw Error('Drive HTTP '+r.status);
 return r;
}
async function list(query){
 let page='',out=[],count=0;
 do{
  if(++count>12)throw Error('A listagem de fontes privadas não terminou; operação cancelada.');
  const qs=new URLSearchParams({q:query,fields:'nextPageToken,incompleteSearch,files(id,name,mimeType,parents)',pageSize:'100'});
  if(page)qs.set('pageToken',page);
  const d=await(await request(API+'?'+qs)).json();
  if(d.incompleteSearch)throw Error('Listagem privada incompleta.');
  out.push(...(d.files||[]));page=d.nextPageToken||'';
 }while(page);
 return out.filter(x=>x.parents?.includes(ROOT)&&x.mimeType==='application/json');
}
async function named(name){
 const files=await list("trashed=false and name = '"+name+"' and '"+ROOT+"' in parents");
 const found=files.filter(f=>f.name===name);
 if(found.length!==1)throw Error('Arquivo privado ausente ou duplicado: '+name);
 return found[0];
}
async function current(){
 const found=(await list("trashed=false and name contains '00_FONTE_ATUAL_POR_FAMILIA_V' and '"+ROOT+"' in parents"))
  .filter(f=>/^00_FONTE_ATUAL_POR_FAMILIA_V\d{3}_[\w-]+\.json$/.test(f.name))
  .map(f=>({...f,n:+f.name.match(/_V(\d{3})_/)[1]})).sort((a,b)=>b.n-a.n);
 if(!found.length||(found[1]&&found[0].n===found[1].n))throw Error('Ponteiro atual do Banco Mestre não é único.');
 return found[0];
}
async function json(id,max=35000000){
 if(!/^[\w-]{15,}$/.test(id))throw Error('ID de arquivo privado inválido.');
 const r=await request(API+'/'+encodeURIComponent(id)+'?alt=media&supportsAllDrives=true');
 if(+r.headers.get('Content-Length')>max)throw Error('Pacote privado excede o limite de leitura.');
 const text=await r.text();
 if(text.length>max)throw Error('Pacote privado excede o limite de leitura.');
 return {data:JSON.parse(text),text};
}
async function digest(text){
 const bytes=new TextEncoder().encode(text);
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
}
const valid11=c=>Array.isArray(c?.evolutive?.layers)&&c.evolutive.layers.length===11&&c.evolutive.layers.every((l,i)=>l.ord===i+1&&typeof l.titulo==='string'&&l.titulo.trim()&&typeof l.texto==='string'&&l.texto.trim());
async function cardsSync(){
 const pointer=await current(),p=(await json(pointer.id,60000)).data;
 if(p.schema!=='banco-mestre-operational-pointer/1'||p.pointer_version!=='V'+String(pointer.n).padStart(3,'0'))
  throw Error('O ponteiro da fonte canônica não corresponde ao arquivo.');
 const info=p.private_base||{},source=await json(info.file_id);
 if(await digest(source.text)!==info.sha256)throw Error('O SHA-256 do arquivo privado não confere.');
 const data=source.data;
 if(!/^BancoMestrePrivadoV\d+$/.test(data.format)||data.version!==info.version||
    !Array.isArray(data.cards)||data.cards.length!==info.cards||data.counts?.cards!==info.cards||
    !Array.isArray(data.srs)||data.srs.length!==info.srs_records)throw Error('Base privada com esquema ou contagem divergente.');
 const byId=new Map();
 for(const c of data.cards){
  if(!/^CARD-\d{4,}$/.test(c?.id)||typeof c.front!=='string'||!c.front.trim()||
     typeof c.back!=='string'||!c.back.trim()||byId.has(c.id))throw Error('ID inválido ou repetido: '+c?.id);
  byId.set(c.id,c);
 }
 if(data.srs.some(e=>!byId.has(e.id)))throw Error('Referência SRS inválida; nenhuma alteração aplicada.');
 if(typeof loadCards!=='function'||typeof cardRender!=='function'||!Array.isArray(cards))throw Error('Biblioteca pública ainda indisponível.');
 await loadCards();
 const publicCards=cards.filter(c=>/^CARD-\d{4,}$/.test(c.id));
 const absent=publicCards.filter(c=>!byId.has(c.id));
 if(absent.length)throw Error(absent.length+' IDs já publicados ausentes da fonte; bloqueado para não regredir.');
 const known=new Set(cards.map(c=>c.id)),extra=data.cards.filter(c=>!known.has(c.id));
 const targetIds=new Set([...ENRICH,...extra.map(c=>c.id)]);
 const approved=new Map();
 for(const id of targetIds){
  const c=byId.get(id);
  if(c&&valid11(c))approved.set(id,{id,layers:c.evolutive.layers});
  else if(c)throw Error('Cartão '+id+' sem os 11 módulos completos.');
 }
 // Sobreposição limitada aos IDs explicitamente afetados; demais módulos públicos intactos.
 const prior=window.BM276LayerData;
 window.BM276LayerData=Object.freeze({
  has:id=>approved.has(id)||!!prior?.has?.(id),
  get:id=>approved.get(id)||prior?.get?.(id)||null
 });
 const upgraded=cards.map(c=>{
  const r=byId.get(c.id);
  if(!r||!ENRICH.has(c.id))return c;
  return {...c,related_card_ids:r.related_card_ids||c.related_card_ids,
   related_image_ids:r.related_image_ids||c.related_image_ids,media_links:r.media_links||c.media_links,
   related_question_ids:r.related_question_ids||c.related_question_ids};
 });
 cards=[...upgraded,...extra];
 cardRender();
 document.dispatchEvent(new CustomEvent('bm-v185-cards-synced',{detail:{version:data.version,count:data.cards.length,source:'Drive private V285',srsApplied:false}}));
 return {version:data.version,added:extra.map(c=>c.id),modules:approved.size,images:data.images?.length||0,cardCount:data.cards.length};
}
async function gapsSync(){
 const ui=window.BM242Lacunas,api=window.BM242LacunasDrive;
 if(!ui?.validate||!ui?.applyRemote||!api?.sync)throw Error('Sincronizador das lacunas indisponível.');
 // Primeiro concilia a base local com o Drive sem apagar alterações concorrentes.
 const state=await api.sync(token());
 if(!['unchanged','downloaded','uploaded'].includes(state?.state))throw Error('Cadastro mestre não conciliado: '+(state?.message||'conflito'));
 const delta=(await json((await named(GAP)).id,2000000)).data;
 if(delta.format!=='BancoMestreLacunasIncrementalPrivadoV001'||delta.private!==true||delta.data?.schema!==1)
  throw Error('Incremento privado de lacunas em formato inesperado.');
 ui.validate(delta.data);
 const base=ui.data;ui.validate(base);
 const byId=new Map(base.records.map(r=>[r.id,r])),bySig=new Map(base.records.map(r=>[sig(r),r.id]));
 const merged=structuredClone(base);
 let added=0;
 for(const r of delta.data.records){
  const old=byId.get(r.id);
  if(old){if(JSON.stringify(old)!==JSON.stringify(r))throw Error('Conflito no ID '+r.id);continue;}
  const key=sig(r);if(bySig.has(key))throw Error('Lacuna equivalente já cadastrada sob '+bySig.get(key));
  merged.records.push(structuredClone(r));byId.set(r.id,r);bySig.set(key,r.id);added++;
 }
 if(added){
  for(const e of delta.data.log||[])if(e?.id&&!merged.log.some(x=>x.id===e.id))merged.log.push(structuredClone(e));
  const now=new Date().toISOString();
  merged.updatedAt=now;merged.log.push({id:'BM285-INCREMENTO-'+now,at:now,event:'mesclagem_privada_petro22_por_id',added});
  ui.validate(merged);ui.applyRemote(merged); // preserva cópia de recuperação local
  const finish=await api.sync(token());
  if(!['uploaded','unchanged'].includes(finish?.state))
   throw Error('Mesclagem local feita, mas Drive não confirmou a gravação: '+(finish?.message||'pendente'));
 }
 return {added,total:merged.records.length,verified:true};
}
async function execute(){
 if(busy)return;busy=true;const button=$('bm285-button');if(button)button.disabled=true;
 let result=null;
 try{
  if(!token())throw Error('Conecte o Drive no cabeçalho e tente novamente.');
  status('Verificando a fonte canônica mais recente e a integridade dos cartões…');
  result=await cardsSync();
  status(result.version+' conferida; conciliando lacunas privadas…');
  const gaps=await gapsSync();
  last={cards:result,gaps,at:new Date().toISOString()};
  status(result.cardCount+' cartões da '+result.version+' disponíveis nesta sessão; '+result.added.length+
   ' novo(s), '+result.modules+' módulos atualizados por ID; '+gaps.added+' lacuna(s) integradas e verificadas no Drive. SRS intacto.');
 }catch(e){
  status((result?'Cartões carregados, mas lacunas pendentes: ':'Não sincronizado: ')+e.message,true);
 }finally{busy=false;if(button)button.disabled=false;}
}
function mount(){
 const panel=$('cartoes')?.querySelector('.panel');if(!panel||$('bm285-button'))return;
 const host=document.createElement('div');host.className='notice';host.style.cssText='margin:10px 0;padding:10px 12px';
 const button=document.createElement('button');button.id='bm285-button';button.type='button';
 button.textContent='Sincronizar cartões e lacunas do Drive';button.addEventListener('click',execute);
 const line=document.createElement('p');line.id='bm285-result';line.style.cssText='font-size:12px;margin:6px 0 0';
 line.setAttribute('role','status');line.textContent='Autorização Google necessária. Dados privados não são publicados no GitHub.';
 host.append(button,line);panel.insertBefore(host,panel.querySelector('.controls')||panel.firstChild);
}
window.BM285PrivateReconcile=Object.freeze({sync:execute,get lastResult(){return last;}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();