/* V312: comparação SOMENTE LEITURA com LOG LOCAL de execução, carimbo de hora e exportação .txt. SHA conferido quando previsto; sem SHA, não certificado.
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

/* O log é temporário na memória desta aba. Somente IDs, metadados e diagnósticos;
   nunca tokens OAuth, conteúdos dos cartões ou registros SRS pessoais. */
const LOG_LIMIT=10;let logRuns=[],logSerial=0,logCurrent=null,logSelected=null;
const localTimestamp=()=>new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',hour12:false});
function logText(run){
 if(!run)return 'Nenhuma execução registrada nesta aba.';
 const lines=[
  'BANCO MESTRE — LOG PRIVADO DE CONFERÊNCIA DRIVE × GITHUB',
  'Execução #'+run.id+' | Início: '+run.startLocal+' | Fim: '+(run.endLocal||'em andamento'),
  'Situação: '+run.status+' | Duração: '+(run.durationMs===null?'em andamento':(run.durationMs/1000).toFixed(2)+' s'),
  'Somente consulta. Nenhum dado foi sincronizado, importado ou publicado.',
  'Arquivo contém identificadores de cartões e informações de diagnóstico: não compartilhe publicamente.',
  ''
 ];
 for(const x of run.events)lines.push('['+x.at+'] ['+x.level+'] '+x.message);
 if(run.report){
  const r=run.report;
  lines.push('', '--- RESUMO VERIFICADO ---',
   'Drive: '+r.drive+' | GitHub: '+r.github+' | Integridade: '+r.integrity,
   'Cartões privados: '+r.privateCount+' | Cartões públicos: '+r.publicCount);
  for(const [title,ids] of Object.entries(r.categories)){
   lines.push(title+': '+ids.length);
   if(ids.length)lines.push('IDs: '+ids.join(', '));
  }
  if(r.gap){
   if(r.gap.error)lines.push('Lacunas: '+r.gap.error);
   else{
    lines.push('Lacunas: mestre='+r.gap.master+', incremento='+r.gap.delta+', pendentes no mestre='+r.gap.pending.length+', ausentes nesta sessão='+r.gap.localPending.length);
    if(r.gap.pending.length)lines.push('IDs de lacunas pendentes no mestre: '+r.gap.pending.join(', '));
   }
  }
 }
 return lines.join('\n')+'\n';
}
function displayLog(){
 const select=$('bm290-log-choose'),pre=$('bm290-log-output'),summary=$('bm290-log-summary');
 if(!select||!pre)return;
 const run=logRuns.find(x=>x.id===logSelected)||logRuns[0]||null;
 const value=logText(run);
 pre.textContent=value.length>50000?value.slice(0,50000)+'\n\n[Prévia limitada a 50.000 caracteres. Baixe o TXT para consultar o log completo.]':value;
 if(summary)summary.textContent=run?'Log da execução #'+run.id+' — '+run.status+' ('+run.events.length+' eventos)':'Log de verificação — nenhuma execução';
 for(const id of ['bm290-log-copy','bm290-log-save','bm290-log-clear']){
  const b=$(id);if(b)b.disabled=!run;
 }
}
function syncLogChooser(){
 const sel=$('bm290-log-choose');if(!sel)return;
 sel.replaceChildren();
 for(const run of logRuns){
  const opt=document.createElement('option');opt.value=String(run.id);
  opt.textContent='#'+run.id+' — '+run.startLocal+' — '+run.status;
  sel.append(opt);
 }
 sel.value=String(logSelected??'');
 displayLog();
}
function beginLog(){
 const run={id:++logSerial,startMs:Date.now(),startLocal:localTimestamp(),
  endLocal:null,durationMs:null,status:'Executando',events:[],report:null};
 logRuns.unshift(run);if(logRuns.length>LOG_LIMIT)logRuns.length=LOG_LIMIT;
 logCurrent=run;logSelected=run.id;syncLogChooser();
 trace('INÍCIO','Iniciada verificação somente de leitura. Origem: botão bm290-button.');
 const pane=$('bm290-log-panel');if(pane)pane.open=true;
 return run;
}
function trace(level,message){
 if(!logCurrent)return;
 logCurrent.events.push({at:localTimestamp(),level,message:String(message??'').slice(0,3000)});
 if(logSelected===logCurrent.id)displayLog();
}
function finishLog(status){
 if(!logCurrent)return;
 const run=logCurrent;run.status=status;run.endLocal=localTimestamp();
 run.durationMs=Math.max(0,Date.now()-run.startMs);
 trace('FIM','Execução '+status+' em '+(run.durationMs/1000).toFixed(2)+' segundos. Nenhuma escrita no Drive ou GitHub.');
 logCurrent=null;syncLogChooser();
}
function makeLogPanel(){
 const details=document.createElement('details');details.id='bm290-log-panel';
 details.style.cssText='margin-top:12px;border:1px solid #cbdce0;border-radius:8px;padding:10px;background:#f8fbfc';
 const summary=document.createElement('summary');summary.id='bm290-log-summary';
 summary.textContent='Log da verificação — nenhuma execução';
 summary.style.cssText='cursor:pointer;font-weight:650';
 details.append(summary);
 const note=document.createElement('p');note.style.cssText='font-size:12px;line-height:1.4';
 note.textContent='Histórico das últimas 10 execuções nesta aba. Não enviado ao Drive/GitHub; perdido ao recarregar, salvo se você baixar o TXT.';
 details.append(note);
 const bar=document.createElement('div');bar.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:8px 0';
 const select=document.createElement('select');select.id='bm290-log-choose';
 select.setAttribute('aria-label','Selecionar execução do log');
 select.addEventListener('change',()=>{logSelected=Number(select.value);displayLog()});
 bar.append(select);
 const button=(id,label,fn)=>{
  const b=document.createElement('button');b.type='button';b.id=id;
  b.textContent=label;b.addEventListener('click',fn);bar.append(b);return b;
 };
 button('bm290-log-copy','Copiar log',async()=>{
  const run=logRuns.find(x=>x.id===logSelected);if(!run)return;
  try{
   if(!navigator.clipboard?.writeText)throw Error('Área de transferência indisponível');
   await navigator.clipboard.writeText(logText(run));
   const b=$('bm290-log-copy');if(b)b.textContent='Copiado';
  }catch(e){const b=$('bm290-log-copy');if(b)b.textContent='Use Baixar TXT';}
 });
 button('bm290-log-save','Baixar TXT',()=>{
  const run=logRuns.find(x=>x.id===logSelected);if(!run)return;
  const blob=new Blob(['\ufeff'+logText(run)],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Banco_Mestre_Log_Comparacao_'+new Date(run.startMs).toISOString().slice(0,10)+'_exec-'+String(run.id).padStart(2,'0')+'.txt';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
 });
 button('bm290-log-clear','Limpar logs',()=>{
  if(busy)return;
  logRuns=[];logCurrent=null;logSelected=null;syncLogChooser();
 });
 details.append(bar);
 const pre=document.createElement('pre');pre.id='bm290-log-output';
 pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;overflow:auto;max-height:300px;border:1px solid #d6e4ea;background:white;padding:10px;font:12px/1.5 ui-monospace,Consolas,monospace';
 pre.setAttribute('aria-live','polite');
 details.append(pre);syncLogChooser();return details;
}

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
 beginLog();
 try{
  msg('Consultando o ponteiro vigente do Drive (somente leitura)…');
  const p=await pointer(),meta=(await read(p.id,80000)).value;
  trace('FONTE','Ponteiro encontrado: '+p.name+' (versão V'+String(p.n).padStart(3,'0')+').');
  if(meta.schema!=='banco-mestre-operational-pointer/1'||meta.pointer_version!=='V'+String(p.n).padStart(3,'0'))
   throw Error('Versão do ponteiro e seu arquivo não coincidem.');
  const source=meta.private_base||{};
  trace('FONTE','Origem privada indicada: '+String(source.version||'não informada')+'. Consultando bytes e esquema.');
  const r=await read(source.file_id);
  const expected=String(source.sha256||'').trim().toLowerCase();
  const withoutHash=expected==='';
  if(!withoutHash&&!/^[0-9a-f]{64}$/.test(expected))throw Error('Ponteiro contém SHA-256 malformado: comparação bloqueada.');
  // Sem SHA no ponteiro, NÃO declarar integridade certificada; permitir apenas relatório de leitura.
  const observed=await sha(r.rawBytes);
  trace('INTEGRIDADE',withoutHash?'Ponteiro sem assinatura SHA-256: relatório NÃO certificado. SHA calculado: '+observed:'Assinatura SHA-256 calculada sobre bytes recebidos; conferindo com ponteiro.');
  if(!withoutHash&&observed!==expected){
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
  trace('VALIDAÇÃO','Esquema validado: '+data.cards.length+' cartões, '+data.srs.length+' registros SRS na fonte '+data.version+'.');
  const priv=new Map();
  for(const c of data.cards){
   if(!ID.test(c?.id||'')||!norm(c.front)||!norm(c.back)||priv.has(c.id))throw Error('Cartão privado inválido ou duplicado: '+c?.id);
   priv.set(c.id,c);
  }
  msg((withoutHash?'Ponteiro sem SHA-256: fonte '+data.version+' lida, relatório NÃO certificado. ':'Fonte '+data.version+' conferida. ')+'Comparando cartões e módulos públicos…');
  if(typeof loadCards!=='function'||!Array.isArray(cards))throw Error('Biblioteca pública não foi carregada.');
  await loadCards();
  const pub=new Map(cards.filter(c=>ID.test(c?.id||'')).map(c=>[c.id,c]));
  trace('CATÁLOGO','Biblioteca pública carregada: '+pub.size+' cartões canônicos; '+priv.size+' cartões privados.');
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
   if(checked%125===0){msg('Comparando os 11 módulos: '+checked+' cartões conferidos…');trace('PROGRESSO',checked+' cartões com 11 módulos comparados.')}
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
   trace('LACUNAS','Mestre: '+gapReport.master+'; incremento: '+gapReport.delta+'; pendentes no mestre: '+gapReport.pending.length+'; ausentes nesta sessão: '+gapReport.localPending.length+'.');
  }catch(e){gapReport={error:'Não foi possível comparar o cadastro de lacunas: '+e.message};trace('AVISO',gapReport.error)}
  const site=await fetch('assets/version.json?compare=290',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
  const ver=site?.version||document.documentElement.dataset.bmPortalVersion||'não informada';
  trace('VERSÕES','Comparação: Drive '+data.version+' × GitHub '+ver+'.');
  msg((withoutHash?'Comparação de leitura concluída SEM certificação SHA-256 do ponteiro: ':'Conferência SHA-256 concluída: ')+'Drive '+data.version+' × GitHub '+ver+'. Nenhuma alteração realizada.');
  if(view){
   if(withoutHash){
    const warn=document.createElement('p');warn.style.cssText='font-size:12px;line-height:1.6;padding:8px;border-left:3px solid #aa7a25;background:#fffaf0;color:#684d20';
    warn.textContent='ATENÇÃO: o ponteiro '+p.name+' não possui SHA-256. O relatório abaixo compara dados lidos, mas NÃO certifica integridade da fonte. SHA-256 calculado dos bytes recebidos: '+observed+'. Corrija o ponteiro privado para uma verificação certificada.';
    view.append(warn);
   }
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
  previous={source:data.version,site:ver,integrity:withoutHash?'uncertified_missing_pointer_sha256':'sha256_confirmed',counts:Object.fromEntries(Object.entries(out).map(([k,a])=>[k,a.length])),gapReport,at:new Date().toISOString()};
  if(logCurrent)logCurrent.report={
   drive:data.version,github:ver,integrity:previous.integrity,
   privateCount:priv.size,publicCount:pub.size,
   categories:{
    'Cartões ausentes no GitHub':out.newIds,
    'IDs publicados ausentes da fonte privada':out.missingPrivate,
    'Frente ou verso diferentes':out.frontBack,
    'Explicações ou macetes diferentes':out.explanation,
    'Vínculos/metadados relacionados diferentes':out.relations,
    '11 módulos diferentes':out.modules,
    '11 módulos públicos não conferíveis':out.noPublicModule,
    '11 módulos incompletos na fonte privada':out.deferred
   },gap:gapReport
  };
  trace('RESULTADO',Object.entries(out).map(([k,v])=>k+': '+v.length).join(' | '));
  finishLog(withoutHash?'CONCLUÍDA SEM CERTIFICAÇÃO SHA-256':'CONCLUÍDA COM SHA-256 CONFIRMADO');
 }catch(e){
  trace('ERRO','Verificação interrompida: '+e.message);
  if(e.details)trace('INTEGRIDADE','SHA-256 esperado: '+e.details.expected+'; calculado: '+e.details.observed+'.');
  finishLog('FALHOU — '+e.message);
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
 finally{if(logCurrent)finishLog('INTERROMPIDA');busy=false;if(btn)btn.disabled=false;}
}
function mount(){
 const old=$('bm285-button');if(!old||$('bm290-button'))return;
 const b=old.cloneNode(true);b.id='bm290-button';b.textContent='Verificar diferenças Drive × GitHub';
 b.title='Somente consulta: não importa, sincroniza nem publica cartões ou lacunas.';
 old.replaceWith(b);
 const state=$('bm285-result');if(state){state.id='bm290-result';state.textContent='Comparador de leitura: nenhuma alteração será aplicada.';}
 const box=document.createElement('div');box.id='bm290-diff';box.style.cssText='margin-top:9px;max-height:340px;overflow:auto;border-top:1px solid #d8e2e8';box.setAttribute('aria-live','polite');
 const host=state?.parentElement||b.parentElement;
 if(host){host.append(box,makeLogPanel());}
 b.addEventListener('click',compare);
 window.BM285PrivateReconcile=Object.freeze({verify:compare,get lastResult(){return previous;},mode:'read-only',get logRuns(){return logRuns.length;}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
