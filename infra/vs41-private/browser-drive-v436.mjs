// Same Drive read-only scope as the existing GIS connection. No server or secret.
import {verifyRecords} from './records.mjs';
import {browserByteCache,verifiedCacheKey,cachedVerifiedBytes,rememberVerifiedBytes,hashBytes} from './verified-cache-v436.mjs?v=3';
export const scope='https://www.googleapis.com/auth/drive.readonly';
const base='https://www.googleapis.com/drive/v3/',limit=32*1024*1024;
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(id);
export function fileId(value){
 const s=String(value||'').trim();if(validId(s))return s;
 try{const u=new URL(s);if(u.protocol!=='https:'||u.hostname!=='drive.google.com')throw Error();
 const match=u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
 const id=match?.[1]||(u.pathname==='/open'?u.searchParams.get('id'):null);
 if(validId(id))return id;}catch{}
 throw Error('Informe o link de um arquivo JSON privado, não de uma pasta.');
}
export const currentPointerName='BANCO_MESTRE_ATUAL.json';
export function sourceSelection(value){
 const s=String(value||'').trim();
 try{const u=new URL(s);const m=u.pathname.match(/^\/drive\/(?:u\/\d+\/)?folders\/([A-Za-z0-9_-]+)(?:\/|$)/);
 if(u.protocol==='https:'&&u.hostname==='drive.google.com'&&validId(m?.[1]))return {kind:'folder',id:m[1]};}catch{}
 return {kind:'file',id:fileId(s)};
}
// A recovery checkpoint preserves the original private snapshot and a distinct published view.
// It never certifies a complete SRS or promotes provisional cards to private canonical identities.
// Editorial-only checkpoints may retain the last private snapshot. Prove the
// transition against the preceding hash-verified wrapper and editorial view.
const legacyPalette=Object.freeze({core:'#FDE68A',agent:'#BBF7D0',condition:'#BAE6FD',exception:'#FECDD3'});
function validLegacyHighlights(c){
 const marks=c?.editorial_highlights;
 if(c?.consolidation?.profile||!Array.isArray(marks)||!marks.length||marks.length>128)return false;
 const texts=[c.back,c.expl,c.mnemonic].filter(x=>typeof x==='string');
 const seen=new Set();
 return marks.every(m=>{
  if(!m||typeof m.text!=='string'||!m.text.trim()||m.text.length>240||seen.has(m.text)||!Object.hasOwn(legacyPalette,m.kind)||m.color!==legacyPalette[m.kind]||m.bold!==false||Object.keys(m).some(k=>!['text','kind','color','bold'].includes(k))||!texts.some(t=>t.includes(m.text)))return false;
  seen.add(m.text);return true;
 });
}
export function verifyEditorialOnlyUpdate(wrapper,view,previous,previousView){
 const r=wrapper?.recovery,pr=previous?.recovery,rb=r?.integrated_batches,vb=view?.integrated_batches;
 const last=rb?.at(-1),vl=vb?.at(-1),hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const omit=(o,...keys)=>Object.fromEntries(Object.entries(o||{}).filter(([k])=>!keys.includes(k)));
 const fail=()=>{throw Error('Recuperação privada: transição de grifos não comprovada')};
 if(previous?.format!=='BancoMestrePrivadoRecuperacaoV1'||previous.schema_version!==1||previous.status!=='RECUPERACAO_PARCIAL'||pr?.srs_complete!==false||!eq(r.previous_editorial_view,pr.editorial_view)||previousView?.version!==pr.editorial_view?.version||view?.source?.base_version!==previousView.version||view.version===previousView.version||wrapper.version===previous.version)fail();
 if(!eq(omit(wrapper,'version','updated','recovery'),omit(previous,'version','updated','recovery'))||!eq(omit(r,'editorial_view','previous_editorial_view','integrated_batches'),omit(pr,'editorial_view','previous_editorial_view','integrated_batches')))fail();
 const batchIds=last?.editorial_ids??last?.ids;
 if(last?.editorial_ids!==undefined&&last?.ids!==undefined&&!eq(last.editorial_ids,last.ids))fail();
 if(!Array.isArray(rb)||!Array.isArray(vb)||!eq(rb.slice(0,-1),pr.integrated_batches)||!eq(vb.slice(0,-1),previousView.integrated_batches)||!/^VD\d+-GRIFOS-/.test(last?.id||'')||last.id!==vl?.id||last.id.split('-')[0]!==view.version.split('_')[0]||last.srs_modified!==false||vl.srs_modified!==false||!validId(last.delta_file_id)||!hex(last.delta_sha256)||!Array.isArray(batchIds)||!eq(batchIds,vl.ids))fail();
 if(!eq(omit(view,'version','source','integrated_batches','cards'),omit(previousView,'version','source','integrated_batches','cards'))||!Array.isArray(view.cards)||!Array.isArray(previousView.cards)||view.cards.length!==previousView.cards.length)fail();
 const changed=[];
 const withoutHighlights=c=>({...c,consolidation:{...c.consolidation,profile:{...c.consolidation?.profile,editorial:omit(c.consolidation?.profile?.editorial,'highlights')}}});
 for(let i=0;i<view.cards.length;i++){
  const a=previousView.cards[i],b=view.cards[i];if(eq(a,b))continue;
  if(a?.consolidation?.profile?.editorial&&b?.consolidation?.profile?.editorial){if(!eq(withoutHighlights(a),withoutHighlights(b)))fail();}
  else if(a?.consolidation?.profile||b?.consolidation?.profile||!validLegacyHighlights(b)||!eq(omit(a,'editorial_highlights'),omit(b,'editorial_highlights')))fail();
  changed.push(b.id);
 }
 if(!changed.length||new Set(batchIds).size!==batchIds.length||!eq([...changed].sort(),[...batchIds].sort()))fail();
 return true;
}
export function verifyRecoverySnapshot(wrapper,view,editorialProof=false){
 const r=wrapper?.recovery,p=wrapper?.private_snapshot,n=wrapper?.counts,ref=r?.editorial_view;
 const ensure=(ok,message)=>{if(!ok)throw Error('Recuperação privada: '+message)};
 const hex=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
 const same=(a,b)=>['group','discipline','subject','sub'].every(k=>(a[k]??null)===(b[k]??null));
 const exact=(list,ids)=>Array.isArray(list)&&list.length===ids.size&&new Set(list).size===list.length&&list.every(id=>ids.has(id));
 ensure(wrapper?.format==='BancoMestrePrivadoRecuperacaoV1'&&wrapper.schema_version===1&&wrapper.status==='RECUPERACAO_PARCIAL'&&r?.srs_complete===false,'estado não autorizado');
 // Drive-first checkpoints retain the historical source but version the embedded
 // snapshot separately. Require explicit private-delta lineage, not a missing
 // git_blob comparison (undefined === undefined). Pointer and file hashes
 // are still checked by readBrowserSnapshot before this validation.
 const prev=r?.previous_editorial_view,src=view?.source,history=wrapper?.private_source;
 const deltaSource=validId(src?.delta_document_id)?Object.values(r?.sources||{}).filter(x=>x?.file_id===src.delta_document_id):[];
 const recordedHashes=deltaSource.flatMap(x=>[x.sha256_local_export,x.sha256_local_export_final]).filter(hex);
 const batchVersion=typeof view?.version==='string'?view.version.match(/^VD[0-9]+(?=_|$)/)?.[0]:null;
 const batchMatches=!!(batchVersion&&Array.isArray(r?.integrated_batches)&&r.integrated_batches.some(b=>typeof b?.id==='string'&&b.id.split('-').includes(batchVersion)&&b.private_checkpoint==='https://docs.google.com/document/d/'+src?.delta_document_id+'/edit'));
 // New checkpoints may store the delta hash only in the hash-verified private
 // wrapper. Accept the omitted duplicate only with matching source and batch.
 // An explicitly supplied conflicting hash must always be rejected.
 const deltaProof=recordedHashes.length>0&&(src?.delta_sha256===undefined?batchMatches:hex(src.delta_sha256)&&recordedHashes.includes(src.delta_sha256));
 const privateDelta=!!(validId(prev?.file_id)&&prev.file_id!==ref?.file_id&&hex(prev?.sha256)&&typeof prev.version==='string'&&prev.version===src?.base_version&&prev.version!==view?.version&&validId(src?.delta_document_id)&&deltaProof&&ref?.git_blob===undefined&&src?.git_blob===undefined);
 const gitLineage=typeof ref?.git_blob==='string'&&/^[a-f0-9]{40}$/.test(ref.git_blob)&&ref.git_blob===src?.git_blob;
 const originalVersion=typeof history?.version==='string'&&p?.version===history.version;
 const checkpointVersion=validId(history?.file_id)&&hex(p?.source_sha256)&&typeof wrapper.version==='string'&&((privateDelta&&p?.version===wrapper.version)||editorialProof===true);
 ensure(p?.format==='BancoMestrePrivadoV159'&&p.schema_version===1&&(originalVersion||checkpointVersion)&&hex(history?.sha256),'origem privada inválida');
 ensure(view?.format==='BM-DRIVE-EDITORIAL-SEED/1'&&view.migration_status==='editorial-candidate-only'&&ref?.version===view.version&&(gitLineage||privateDelta||editorialProof===true)&&hex(ref?.sha256),'projeção editorial divergente');
 const originals=verifyRecords(p.cards),visible=verifyRecords(view.cards),old=new Map(originals.map(x=>[x.id,x])),now=new Set(visible.map(x=>x.id)),matched=new Set(),outside=new Set(originals.filter(x=>!now.has(x.id)).map(x=>x.id));
 ensure(p.counts?.cards===originals.length&&n?.cards===originals.length&&n?.visible_active===visible.length&&ref.cards===visible.length&&view.counts?.cards===visible.length&&view.counts?.active===visible.length&&visible.every(x=>x.active===true),'contagem divergente');
 const entries=r.operational_identities;
 ensure(Array.isArray(entries)&&entries.length===n.operational_sources&&new Set(entries.map(x=>x.id)).size===entries.length,'registro operacional divergente');
 const operational=new Map(entries.map(x=>[x.id,x])),states=new Set(['PROPOSTA_OPERACIONAL_PROVISORIA','CARTAO_OPERACIONAL_IDENTIFICADO_SEM_MAPEAMENTO_CARD','NUCLEO_PUBLICADO_COM_FONTE_PRIVADA_CANDIDATA','ID_PUBLICADO_COM_RESERVA_PRIVADA_ESPECIFICA','ID_PUBLICADO_COM_MAPA_PRIVADO_DO_DELTA']);
 for(const card of visible){
  ensure(!Object.hasOwn(card,'private_legacy_layers'),'módulos históricos não podem vir da projeção');
  if(Object.hasOwn(card,'editorial_highlights'))ensure(validLegacyHighlights(card),'grifos legados inválidos');
  const prior=old.get(card.id);
  if(prior){ensure(prior.active&&same(prior,card)&&!operational.has(card.id),'identidade privada divergente');matched.add(card.id);
   // Read-only, account-local historical layers; never promote them to the current editorial profile.
   const layers=prior.evolutive?.layers;
   if(card.editorial_highlights&&Array.isArray(layers)&&layers.length===11&&layers.every((m,i)=>m.ord===i+1&&typeof m.titulo==='string'&&m.titulo.trim()&&typeof m.texto==='string'&&m.texto.trim()))card.private_legacy_layers=structuredClone(layers);
   continue;}
  const op=operational.get(card.id);
  ensure(op&&same(op,card)&&states.has(op.scope)&&op.srs_transfer===false&&op.source_key===card.id&&validId(op.source_file_id)&&hex(op.source_sha256_local_export),'identidade operacional sem fonte');
  if(op.scope==='PROPOSTA_OPERACIONAL_PROVISORIA')ensure(card.provisional===true&&card.canonical===false&&op.private_source_record?.Frente_proposta===card.front&&op.private_source_record?.Verso_proposto===card.back,'proposta provisória divergente');
 }
 ensure(matched.size===n.matched_private&&matched.size+operational.size===visible.length&&exact(r.matched_private_ids,matched),'identidades não conciliadas');
 const retired=new Set([...(Array.isArray(view.retired_ids)?view.retired_ids:[]),...Object.keys(view.redirects||{})]);
 ensure(outside.size===n.historical_outside_view&&exact(r.historical_outside_view_ids,outside)&&[...outside].every(id=>retired.has(id)),'retiradas não verificadas');
 ensure(Array.isArray(p.srs)&&p.srs.length===p.counts?.srs_records&&p.srs.length===n.historical_srs&&new Set(p.srs.map(x=>x.id)).size===p.srs.length&&p.srs.every(x=>old.has(x.id)),'histórico SRS inválido');
 const srs=p.srs.filter(x=>matched.has(x.id));
 ensure(srs.filter(x=>x.next_review).length===n.verified_historical_due,'vencimentos históricos divergentes');
 return {version:wrapper.version,viewVersion:view.version,privateVersion:p.version,records:visible,scope:'private-recovery',srs,srsComplete:false,updated:wrapper.updated||''};
}
// A published checkpoint is authorized by the current private pointer, not by
// a version number in the portal. Historical comparison remains mandatory for
// preflight (the default); ordinary reads validate only the published checkpoint.
export async function readBrowserSnapshot({token,source,fetcher=fetch,signal,editorialPreview=false,cache=browserByteCache,verifyHistory=true}){
 if(typeof token!=='string'||!token)throw Error('Conecte sua conta Google.');
 const get=async(path,params)=>{
  const r=await fetcher(base+path+'?'+new URLSearchParams(params),{method:'GET',headers:{Authorization:'Bearer '+token},credentials:'omit',redirect:'error',cache:'no-store',signal});
  if(!r.ok)throw Error('Drive HTTP '+r.status+' — confira a autorização e o arquivo.');
  return r;
 };
 const info=async id=>{
  if(!validId(id))throw Error('Arquivo inválido.');
  const r=await get('files/'+encodeURIComponent(id),{fields:'id,name,mimeType,ownedByMe,shared,trashed,parents,size,version,headRevisionId,sha256Checksum,md5Checksum'});
  const m=await r.json();
  if(m.id!==id||m.ownedByMe!==true||m.shared!==false||m.trashed!==false)throw Error('A origem deve ser privada e pertencer à conta Google conectada.');
  return m;
 };
 const selection=sourceSelection(source);
 const folderMime='application/vnd.google-apps.folder';
 let folderId=null;
 const resolveFolder=async id=>{
  const root=await info(id);
  if(root.mimeType!==folderMime)throw Error('Selecione uma pasta privada do Drive.');
  const listing=await (await get('files',{q:"'"+id+"' in parents and trashed = false and name = '"+currentPointerName+"'",fields:'nextPageToken,incompleteSearch,files(id,name,mimeType,parents)',pageSize:'100'})).json();
  if(listing.nextPageToken||listing.incompleteSearch||!Array.isArray(listing.files)||listing.files.length>1)throw Error('A pasta precisa conter um único ponteiro vigente BANCO_MESTRE_ATUAL.json. Origem ambígua ou consulta incompleta.');
  if(!listing.files.length){const e=Error('A pasta precisa conter um único ponteiro vigente BANCO_MESTRE_ATUAL.json. Nenhuma versão histórica foi selecionada.');e.code='CURRENT_POINTER_MISSING';throw e;}
  const f=listing.files[0];
  if(f.name!==currentPointerName||!validId(f.id)||f.mimeType!=='application/json'||f.parents?.length!==1||f.parents[0]!==id)throw Error('Ponteiro vigente inválido.');
  return f.id;
 };
 const resolveEditorial=async id=>{
  const root=await info(id);
  if(root.mimeType!==folderMime)throw Error('Selecione a pasta privada do Banco Mestre.');
  let parent=id;
  for(const [name,mime] of [['01 - Cartões',folderMime],['Dados privados',folderMime],['VC52_EDITORIAL_CANDIDATA.json','application/json']]){
   const listing=await (await get('files',{q:"'"+parent+"' in parents and trashed = false and name = '"+name+"'",fields:'nextPageToken,incompleteSearch,files(id,name,mimeType,parents)',pageSize:'100'})).json();
   if(listing.nextPageToken||listing.incompleteSearch||listing.files?.length!==1)throw Error('Prévia editorial: caminho ausente ou ambíguo em '+name+'. Use o link direto do arquivo verificado.');
   const f=listing.files[0];
   if(!validId(f.id)||f.name!==name||f.mimeType!==mime||f.parents?.length!==1||f.parents[0]!==parent)throw Error('Caminho editorial inválido.');
   const checked=await info(f.id);
   if(checked.name!==name||checked.mimeType!==mime||checked.parents?.length!==1||checked.parents[0]!==parent)throw Error('Caminho editorial alterado.');
   parent=f.id;
  }
  return parent;
 };
 const assertInside=async parentId=>{
  if(!folderId)return;
  const seen=new Set();
  for(let i=0;i<16;i++){
   if(!validId(parentId)||seen.has(parentId))break;
   seen.add(parentId);
   const p=await info(parentId);
   if(p.mimeType!==folderMime)break;
   if(p.id===folderId)return;
   if(p.parents?.length!==1)break;
   parentId=p.parents[0];
  }
  throw Error('Arquivo fora da pasta individual selecionada.');
 };
 const read=async(id,expectedHash,recoveryView=false)=>{
  const before=await info(id);
  if(!/^application\/json(?:\s*;.*)?$/i.test(before.mimeType||'')||!Number.isSafeInteger(Number(before.size))||Number(before.size)<1||Number(before.size)>limit||!before.version||before.parents?.length!==1)throw Error('Origem JSON inválida ou acima de 32 MB.');
  const parent=await info(before.parents[0]);
  if(parent.mimeType!=='application/vnd.google-apps.folder')throw Error('Pasta privada inválida.');
  await assertInside(parent.id);
  const hash=expectedHash||before.sha256Checksum;
  if(hash&&!/^[a-f0-9]{64}$/.test(hash))throw Error('Hash da origem inválido.');
  const key=verifiedCacheKey(account.user.permissionId,folderId||selection.id,before,hash);
  let bytes=await cachedVerifiedBytes(cache,key,Number(before.size),hash);
  const hit=!!bytes;
  if(!hit){
  const r=await get('files/'+encodeURIComponent(id),{alt:'media'});
  if(!r.body)throw Error('Arquivo vazio.');
  const reader=r.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('Arquivo acima de 32 MB.')}chunks.push(value);}}finally{reader.releaseLock()}
  if(size!==Number(before.size))throw Error('Tamanho da origem mudou.');
  const combined=new Uint8Array(size);let offset=0;for(const part of chunks){combined.set(part,offset);offset+=part.byteLength;}bytes=combined.buffer;
  }
  const after=await info(id);
  if(before.version!==after.version||before.size!==after.size||before.parents[0]!==after.parents?.[0]||['headRevisionId','sha256Checksum','md5Checksum'].some(k=>before[k]!==after[k]))throw Error('Origem alterada durante leitura; tente novamente.');
  await info(parent.id);
  await assertInside(parent.id);
  if(hash&&!hit&&await hashBytes(bytes)!==hash)throw Error('Hash da origem divergente.');
  const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  if(data?.format==='BM-DRIVE-EDITORIAL-SEED/1'&&!recoveryView){
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
   if(digest!=='040e7ebc12e0606870fb8dfa39ac43d8b93b906b7a3532af14557b0f8395f419')throw Error('Candidato editorial VC52 não corresponde à cópia verificada.');
  }
  if(!hit&&!signal?.aborted&&hash)await rememberVerifiedBytes(cache,key,bytes);
  return {data,meta:before,cacheHit:hit};
 };
 const account=await (await get('about',{fields:'user(permissionId)'})).json();
 if(!validId(account?.user?.permissionId))throw Error('Identidade Google não confirmada.');
 if(selection.kind==='folder')folderId=selection.id;
 if(editorialPreview&&!folderId)throw Error('Para o teste pela pasta, informe o link da pasta raiz do Banco Mestre.');
 const selectedId=folderId?await (editorialPreview?resolveEditorial(folderId):resolveFolder(folderId)):selection.id;
 let {data,meta,cacheHit}=await read(selectedId,editorialPreview?'040e7ebc12e0606870fb8dfa39ac43d8b93b906b7a3532af14557b0f8395f419':undefined);let pointer=null;
 if(editorialPreview&&(data?.format!=='BM-DRIVE-EDITORIAL-SEED/1'||await resolveEditorial(folderId)!==selectedId))throw Error('Prévia editorial não confirmada ou caminho alterado.');
 if(folderId&&!editorialPreview&&data?.schema!=='banco-mestre-operational-pointer/1')throw Error('A pasta deve apontar para um snapshot privado por meio do ponteiro vigente.');
 if(data?.schema==='banco-mestre-operational-pointer/1'){
  pointer=data.private_base;
  if(!validId(pointer?.file_id)||typeof pointer.version!=='string'||!/^[a-f0-9]{64}$/.test(pointer.sha256||''))throw Error('Ponteiro privado inválido.');
  const snapshot=await read(pointer.file_id,pointer.sha256);
  if(snapshot.data?.version!==pointer.version)throw Error('Versão do ponteiro divergente.');
  if(snapshot.data?.format==='BancoMestrePrivadoRecuperacaoV1'){
   if(!folderId||data.recovery_status!=='RECUPERACAO_PARCIAL'||pointer.cards!==snapshot.data.counts?.cards)throw Error('Ponteiro de recuperação não autorizado.');
   const ref=snapshot.data.recovery?.editorial_view;
   if(!validId(ref?.file_id)||!/^[a-f0-9]{64}$/.test(ref.sha256||'')||ref.file_id===pointer.file_id)throw Error('Projeção de recuperação inválida.');
   const view=await read(ref.file_id,ref.sha256,true);
   let editorialProof=false,previousReads=[];
   const latest=snapshot.data.recovery?.integrated_batches?.at(-1);
   if(/^VD\d+-GRIFOS-/.test(latest?.id||'')){
    const prev=data.previous_private_base,prevView=snapshot.data.recovery?.previous_editorial_view;
    const validRef=x=>validId(x?.file_id)&&typeof x.version==='string'&&/^[a-f0-9]{64}$/.test(x.sha256||'');
    if(!validRef(prev)||!validRef(prevView)||new Set([pointer.file_id,ref.file_id,prev.file_id,prevView.file_id]).size!==4)throw Error('Referências anteriores de grifos inválidas.');
    if(verifyHistory!==false){
     const [old,oldView]=await Promise.all([read(prev.file_id,prev.sha256),read(prevView.file_id,prevView.sha256,true)]);
     if(old.data?.version!==prev.version||oldView.data?.version!==prevView.version||prev.cards!==old.data?.counts?.cards||prevView.cards!==oldView.data?.counts?.cards)throw Error('Versões anteriores de grifos divergentes.');
     editorialProof=verifyEditorialOnlyUpdate(snapshot.data,view.data,old.data,oldView.data);
     previousReads=[old,oldView];
    }else{
     // Read-only portal: the authenticated owner has selected this checkpoint.
     // Verify the current hash-checked pair and its declared lineage; the full
     // before/after comparison belongs to the existing private preflight.
     const projected=view.data?.integrated_batches?.at(-1);
     const ids=latest.editorial_ids??latest.ids;
     const sameIds=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&JSON.stringify(a)===JSON.stringify(b);
     const currentIds=new Set(Array.isArray(view.data?.cards)?view.data.cards.map(c=>c?.id):[]);
     if(prev.version===pointer.version||prevView.version===ref.version||
      prev.cards!==snapshot.data.counts?.cards||prevView.cards!==ref.cards||
      view.data?.source?.base_version!==prevView.version||
      projected?.id!==latest.id||latest.id.split('-')[0]!==String(view.data.version).split('_')[0]||
      latest.srs_modified!==false||projected.srs_modified!==false||
      !validId(latest.delta_file_id)||!/^[a-f0-9]{64}$/.test(latest.delta_sha256||'')||
      !sameIds(ids,projected.ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!currentIds.has(id))||
      (latest.editorial_ids!==undefined&&latest.ids!==undefined&&!sameIds(latest.editorial_ids,latest.ids)))
      throw Error('Metadados do checkpoint de grifos divergentes.');
     editorialProof=true;
    }
   }
   const checked=verifyRecoverySnapshot(snapshot.data,view.data,editorialProof);
   const [again,privateAgain,viewAgain]=await Promise.all([info(meta.id),info(snapshot.meta.id),info(view.meta.id)]);
   if(again.version!==meta.version||privateAgain.version!==snapshot.meta.version||viewAgain.version!==view.meta.version||await resolveFolder(folderId)!==selectedId)throw Error('Ponteiro ou recuperação alterados durante leitura.');
   await assertInside(privateAgain.parents?.[0]);await assertInside(viewAgain.parents?.[0]);
   for(const prior of previousReads){const current=await info(prior.meta.id);if(current.version!==prior.meta.version)throw Error('Origem anterior alterada durante leitura.');await assertInside(current.parents?.[0]);}
   return {...checked,sourceName:snapshot.meta.name,cacheHit:snapshot.cacheHit&&view.cacheHit};
  }
  if(data.recovery_status)throw Error('Estado de recuperação incompatível com o snapshot.');
  const again=await info(meta.id);if(again.version!==meta.version)throw Error('Ponteiro alterado durante leitura.');
  if(folderId&&await resolveFolder(folderId)!==selectedId)throw Error('Ponteiro vigente mudou durante leitura.');
  ({data,meta,cacheHit}=snapshot);
 }
 if(data?.format==='BM-DRIVE-EDITORIAL-SEED/1'){
  if(pointer||(folderId&&!editorialPreview)||data.migration_status!=='editorial-candidate-only'||data.version!=='VC52'||data.source?.git_blob!=='f8ec08f96a17c990371b31f0db200863fccd1c6e')throw Error('Candidato editorial não pode ser usado como base vigente.');
  const records=verifyRecords(data.cards);
  if(records.length!==1460||records.some(c=>c.active!==true)||data.counts?.cards!==records.length||data.counts?.active!==records.length)throw Error('Contagem do candidato VC52 divergente.');
  return {version:data.version,records,scope:'editorial-candidate-only',sourceName:meta.name,cacheHit};
 }
 if(data?.format!=='BancoMestrePrivadoV159'||data.schema_version!==1||typeof data.version!=='string'||!data.version)throw Error('Formato privado ainda não homologado. Nenhum catálogo público será usado.');
 const records=verifyRecords(data.cards);
 if(data.counts?.cards!==records.length||pointer&&pointer.cards!==records.length)throw Error('Contagem de cartões divergente.');
 return {version:data.version,records,scope:'snapshot-only',sourceName:meta.name,cacheHit,srs:Array.isArray(data.srs)?data.srs:null,updated:typeof data.updated==='string'?data.updated:''};
}
