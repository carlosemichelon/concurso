/* V295: apenas conferência Drive × catálogo público do GitHub, SHA exato em bytes e diagnóstico.
 * Sem escrita, importação, SRS, localStorage ou publicação.
 * A V285 mantém seu legado para rollback, mas o botão visível é substituído. */
(function(){
'use strict';
const ROOT='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD',API='https://www.googleapis.com/drive/v3/files';
const GAP='LACUNAS_PETRO22_INCREMENTO_PRIVADO_V001_2026-11-19.json';
const MASTER='BancoMestre_Lacunas_Mestre_V242.json';
const ID=/^CARD-\d{4,}$/,FILE=/^00_FONTE_ATUAL_POR_FAMILIA_V(\d{3})_[\w-]+\.json$/;
let busy=false,previous=null;
const $=id=>document.getElementById(id);
const norm=s=>String(s??'').replace(/\r\n?/g,'\n').trim();
const array=v=>Array.isArray(v)?v:[];
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const token=()=>window.BM239DriveGlobal?.writeToken?.()||window.BancoMestreMediaSyncV182?.token?.()||'';
async function drive(url){
 const t=token();if(!t)throw Error('Conecte o Google Drive no cabeçalho para consultar a base privada.');
 const r=await fetch(url,{headers:{Authorization:'Bearer '+t},cache:'no-store'});
 if(r.status===401)throw Error('Autorização Google expirada; reconecte o Drive.');
 if(r.status===403)throw Error('Permissão de leitura insuficiente para o Drive.');
 if(!r.ok)throw Error('Falha de leitura do Drive: HTTP '+r.status);
 return r;
}
async function files(q){
 let out=[],page='',n=0;
 do{
  if(++n>15)throw Error('Listagem incompleta: páginas demais.');
  const s=new URLSearchParams({q,fields:'nextPageToken,incompleteSearch,files(id,name,parents,mimeType)',pageSize:'100',supportsAllDrives:'true',includeItemsFromAllDrives:'true'});
  if(page)s.set('pageToken',page);
  const j=await(await drive(API+'?'+s)).json();
  if(j.incompleteSearch)throw Error('Listagem do Drive incompleta; não concluir a comparação.');
  out.push(...array(j.files));page=j.nextPageToken||'';
 }while(page);
 return out.filter(f=>f.parents?.includes(ROOT)&&f.mimeType==='application/json');
}
async function exact(name){
 const x=(await files("trashed=false and name = '"+name+"' and '"+ROOT+"' in parents")).filter(f=>f.name===name);
 if(x.length!==1)throw Error('Arquivo ausente ou duplicado no Drive: '+name);
 return x[0];
}
async function pointer(){
 const x=(await files("trashed=false and name contains '00_FONTE_ATUAL_POR_FAMILIA_V' and '"+ROOT+"' in parents"))
  .map(f=>({...f,n:+(f.name.match(FILE)||[])[1]})).filter(f=>Number.isInteger(f.n)).sort((a,b)=>b.n-a.n);
 if(!x.length||(x[1]&&x[0].n===x[1].n))throw Error('Ponteiro canônico não encontrado ou ambíguo.');
 return x[0];
}
async function read(id,max=35000000){
 if(!/^[\w-]{15,}$/.test(id))throw Error('ID inválido na fonte privada.');
 const r=await drive(API+'/'+encodeURIComponent(id)+'?alt=media&supportsAllDrives=true');
 if(Number(r.headers.get('Content-Length')||0)>max)throw Error('Arquivo excede o limite de conferência.');
 const rawBytes=await r.arrayBuffer();
 if(rawBytes.byteLength>max)throw Error('Arquivo excede o limite de conferência.');
 const raw=new TextDecoder('utf-8',{fatal:true}).decode(rawBytes);
 return {value:JSON.parse(raw),raw,rawBytes};
}
async function sha(rawBytes){
 const d=await crypto.subtle.digest('SHA-256',rawBytes);
 return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function valid11(c){return array(c?.evolutive?.layers).length===11&&c.evolutive.layers.every((m,i)=>m.ord===i+1&&norm(m.titulo)&&norm(m.texto));}
function layerSignature(c){return array(c?.layers).map(x=>[x.ord,norm(x.titulo),norm(x.texto)]);}
async function publicLayer(id){
 if(window.BM276LayerData?.has?.(id))return await window.BM276LayerData.get(id);
 return await window.BM194VersosPublicos?.load?.(id)||null;
}
const push=(a,id)=>{if(!a.includes(id))a.push(id)};
const msg=(str,isError=false)=>{const x=$('bm290-result');if(x){x.textContent=str;x.style.color=isError?'#9c3636':'#355b68';}};
function putList(host,title,items,max=100){
 const details=document.createElement('details');details.style.cssText='padding:8px 0;border-top:1px solid #d8e2e8';
 const sum=document.createElement('summary');sum.textContent=title+' ('+items.length+')';sum.style.cssText='cursor:pointer;font-weight:650';
 details.append(sum);
 const content=document.createElement('p');content.style.cssText='font-size:12px;line-height:1.65;overflow-wrap:anywhere;margin:6px 0';
 content.textContent=items.length?(items.slice(0,max).join(' · ')+(items.length>max?' · … (mais '+(items.length-max)+')':'')):'Nenhuma diferença detectada';
 details.append(content);host.append(details);
}
async function compare(){
 if(busy)return;
 const btn=$('bm290-button');busy=true;if(btn)btn.disabled=true;
 const view=$('bm290-diff');if(view)view.replaceChildren();previous=null;
 try{
  msg('Consultando o ponteiro vigente do Drive (somente leitura)…');
  const p=await pointer(),meta=(await read(p.id,80000)).value;
  if(meta.schema!=='banco-mestre-operational-pointer/1'||meta.pointer_version!=='V'+String(p.n).padStart(3,'0'))
   throw Error('Versão do ponteiro e seu arquivo não coincidem.');
  const source=meta.private_base||{},r=await read(source.file_id);
  const expected=String(source.sha256||'').trim().toLowerCase();
  if(!/^[0-9a-f]{64}$/.test(expected))throw Error('Ponteiro sem SHA-256 válido para a fonte privada.');
  // V295: o SHA é calculado sobre os bytes reais, não sobre texto reencodificado.
  const observed=await sha(r.rawBytes);
  if(observed!==expected){
   const integrity=new Error('SHA-256 da fonte privada diverge; comparação cancelada.');
   integrity.details={
    pointerName:p.name,pointerId:p.id,sourceId:source.file_id,
    version:source.version||'não informada',expected,observed
   };
   throw integrity;
  }
  const data=r.value;
  if(!/^BancoMestrePrivadoV\d+$/.test(data.format)||data.version!==source.version||
   !Array.isArray(data.cards)||data.cards.length!==source.cards||data.counts?.cards!==source.cards||
   !Array.isArray(data.srs)||data.srs.length!==source.srs_records)throw Error('Contagens/esquema do Banco Mestre divergentes.');
  const priv=new Map();
  for(const c of data.cards){
   if(!ID.test(c?.id||'')||!norm(c.front)||!norm(c.back)||priv.has(c.id))throw Error('Cartão privado inválido ou duplicado: '+c?.id);
   priv.set(c.id,c);
  }
  msg('Fonte '+data.version+' conferida. Comparando cartões e módulos públicos…');
  if(typeof loadCards!=='function'||!Array.isArray(cards))throw Error('Biblioteca pública não foi carregada.');
  await loadCards();
  const pub=new Map(cards.filter(c=>ID.test(c?.id||'')).map(c=>[c.id,c]));
  const out={newIds:[],missingPrivate:[],frontBack:[],explanation:[],relations:[],modules:[],noPublicModule:[],deferred:[]};
  for(const [id,c] of pub)if(!priv.has(id))push(out.missingPrivate,id);
  let checked=0;
  for(const [id,c] of priv){
   const old=pub.get(id);
   if(!old){push(out.newIds,id);continue;}
   if(norm(c.front)!==norm(old.front)||norm(c.back)!==norm(old.back))push(out.frontBack,id);
   if(norm(c.expl)!==norm(old.expl)||norm(c.mnemonic)!==norm(old.mnemonic))push(out.explanation,id);
   for(const key of ['related_card_ids','related_question_ids','related_image_ids']){
    if(c[key]!==undefined && !eq(array(c[key]).map(String).sort(),array(old[key]).map(String).sort())){push(out.relations,id);break;}
   }
   if(!valid11(c)){push(out.deferred,id);continue;}
   const oldLayers=await publicLayer(id);
   if(!oldLayers||array(oldLayers.layers).length!==11){push(out.noPublicModule,id);continue;}
   if(!eq(layerSignature({layers:c.evolutive.layers}),layerSignature(oldLayers)))push(out.modules,id);
   checked++;
   if(checked%125===0)msg('Comparando os 11 módulos: '+checked+' cartões conferidos…');
  }
  let gapReport=null;
  try{
   const [master,delta]=await Promise.all([exact(MASTER),exact(GAP)]);
   const [m,d]=await Promise.all([read(master.id,4000000),read(delta.id,4000000)]);
   const masterRecords=array(m.value?.data?.records),deltaRecords=array(d.value?.data?.records);
   if(!masterRecords.length||!deltaRecords.length)throw Error('cadastro sem registros válidos');
   const known=new Set(masterRecords.map(x=>x.id));
   const localIds=new Set(array(window.BM242Lacunas?.data?.records).map(x=>x.id));
   gapReport={master:masterRecords.length,delta:deltaRecords.length,
     pending:deltaRecords.map(x=>x.id).filter(id=>!known.has(id)),
     localPending:deltaRecords.map(x=>x.id).filter(id=>!localIds.has(id))};
  }catch(e){gapReport={error:'Não foi possível comparar o cadastro de lacunas: '+e.message};}
  const site=await fetch('assets/version.json?compare=290',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
  const ver=site?.version||document.documentElement.dataset.bmPortalVersion||'não informada';
  msg('Conferência concluída: Drive '+data.version+' × GitHub '+ver+'. Nenhuma alteração realizada.');
  if(view){
   const head=document.createElement('p');head.style.cssText='margin:6px 0 9px;font-size:12px;line-height:1.5';
   head.textContent='Drive '+data.version+': '+priv.size+' cartões · GitHub '+ver+': '+pub.size+' cartões canônicos. Diferenças não significam autorização automática de publicação.';
   view.append(head);
   putList(view,'Cartões ausentes no GitHub',out.newIds);
   putList(view,'Frente ou verso diferentes',out.frontBack);
   putList(view,'Explicações ou macetes diferentes',out.explanation);
   putList(view,'Vínculos/metadados relacionados diferentes',out.relations);
   putList(view,'11 módulos diferentes',out.modules);
   putList(view,'11 módulos públicos não conferíveis',out.noPublicModule);
   putList(view,'Cartões sem 11 módulos completos na fonte',out.deferred);
   if(out.missingPrivate.length)putList(view,'IDs publicados ausentes da fonte privada (bloqueio)',out.missingPrivate);
   if(gapReport.error){
    const w=document.createElement('p');w.textContent=gapReport.error;w.style.color='#9c3636';view.append(w);
   }else{
    const l=document.createElement('p');l.style.cssText='font-size:12px;margin:8px 0';
    l.textContent='Lacunas privadas: '+gapReport.master+' no mestre do Drive; '+gapReport.delta+' no incremento Petrobras 22; '+gapReport.pending.length+' IDs do incremento ausentes no mestre; '+gapReport.localPending.length+' não encontrados na biblioteca desta sessão. Sem gravar nenhum registro.';
    view.append(l);if(gapReport.pending.length)putList(view,'Lacunas pendentes no mestre',gapReport.pending);
   }
   const note=document.createElement('p');note.style.cssText='font-size:12px;color:#566a77;margin:8px 0 0';
   note.textContent='Verificação exclusivamente de leitura. Para integrar alterações aprovadas ao GitHub, solicite no ChatGPT. SRS e histórico privado não são publicados.';
   view.append(note);
  }
  previous={source:data.version,site:ver,counts:Object.fromEntries(Object.entries(out).map(([k,a])=>[k,a.length])),gapReport,at:new Date().toISOString()};
 }catch(e){
  msg('Verificação não concluída: '+e.message,true);
  if(view&&e.details){
   const info=e.details;
   const heading=document.createElement('h4');heading.textContent='Diagnóstico de integridade (somente leitura)';
   heading.style.cssText='font-size:13px;margin:10px 0 6px;color:#253e50';
   const explanation=document.createElement('p');
   explanation.style.cssText='font-size:12px;line-height:1.65;margin:0 0 8px;color:#334d60';
   explanation.textContent='O ponteiro vigente indica uma assinatura diferente dos bytes efetivamente recebidos do Drive. Isso pode ocorrer por fonte substituída, ponteiro desatualizado ou mudança de bytes do arquivo. Nenhuma comparação, integração ou alteração de SRS foi realizada.';
   const versions=document.createElement('p');
   versions.style.cssText='font-size:12px;line-height:1.5;margin:0 0 7px';
   versions.textContent='Ponteiro: '+info.pointerName+' · Fonte: '+info.version+' · ID da fonte: '+info.sourceId;
   const detail=document.createElement('details');
   const summary=document.createElement('summary');summary.textContent='Ver assinaturas SHA-256 para auditoria';
   detail.append(summary);
   const raw=document.createElement('pre');
   raw.style.cssText='font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f8fa;border:1px solid #d6e4ea;padding:8px';
   raw.textContent='Esperado no ponteiro: '+info.expected+'\nCalculado sobre os bytes: '+info.observed;
   detail.append(raw);
   const links=document.createElement('p');links.style.cssText='font-size:12px;margin:8px 0';
   const sourceLink=document.createElement('a');sourceLink.textContent='Abrir fonte no Drive';
   sourceLink.href='https://drive.google.com/file/d/'+encodeURIComponent(info.sourceId)+'/view';
   sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
   const pointerLink=document.createElement('a');pointerLink.textContent='Abrir ponteiro no Drive';
   pointerLink.href='https://drive.google.com/file/d/'+encodeURIComponent(info.pointerId)+'/view';
   pointerLink.target='_blank';pointerLink.rel='noopener noreferrer';
   links.append(sourceLink,document.createTextNode(' · '),pointerLink);
   const note=document.createElement('p');note.style.cssText='font-size:12px;color:#955050';
   note.textContent='Não atualize o SHA automaticamente para fazer a verificação passar. Confira o arquivo correto e o histórico de versões do Drive antes de corrigir o ponteiro.';
   view.append(heading,explanation,versions,detail,links,note);
  }
 }
 finally{busy=false;if(btn)btn.disabled=false;}
}
function mount(){
 const old=$('bm285-button');if(!old||$('bm290-button'))return;
 const b=old.cloneNode(true);b.id='bm290-button';b.textContent='Verificar diferenças Drive × GitHub';
 b.title='Somente consulta: não importa, sincroniza nem publica cartões ou lacunas.';
 old.replaceWith(b);
 const state=$('bm285-result');if(state){state.id='bm290-result';state.textContent='Comparador de leitura: nenhuma alteração será aplicada.';}
 const box=document.createElement('div');box.id='bm290-diff';box.style.cssText='margin-top:9px;max-height:340px;overflow:auto;border-top:1px solid #d8e2e8';box.setAttribute('aria-live','polite');
 state?.parentElement?.append(box);
 b.addEventListener('click',compare);
 window.BM285PrivateReconcile=Object.freeze({verify:compare,get lastResult(){return previous;},mode:'read-only'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
