'use strict';
(async()=>{
 const by=id=>document.getElementById(id),resp=await fetch('/api/runtime',{credentials:'same-origin',cache:'no-store'});if(!resp.ok){location.replace('/');return}
 const data=await resp.json();let active=true,checking=false,reviewBusy=false,reviewPending=null;const memory=new Map(),urls=new Set(),imageEdits=new Map();let currentImage=null,imageBusy=false,pdfBusy=false,pdfDirty=false,pdfHydrating=false,pdfDocument=null,pdfVersion=null;const pdfKey=k=>k.startsWith('BM030_STROKES_PDF:')||k.startsWith('BM102_PDF_HIGHLIGHT_JOINS:')||k==='BM062_GRIFOS_META'||k==='BM122_DELETED_HIGHLIGHT_IDS';
 const check=()=>{if(!active)throw Error('Sessão encerrada')};
 const lock=()=>{if(!active)return;active=false;memory.clear();imageEdits.clear();for(const u of urls)URL.revokeObjectURL(u);urls.clear();document.body.replaceChildren();location.replace('/')};
 const verify=async()=>{check();const r=await fetch('/api/session',{credentials:'same-origin',cache:'no-store'});const s=await r.json();if(!r.ok||s.context!==data.context){lock();throw Error('Sessão alterada')}check()};
 await verify();
 async function read(kind,id){await verify();const r=await fetch('/api/media/'+kind+'/'+encodeURIComponent(id),{credentials:'same-origin',cache:'no-store',headers:{'X-BM-Context':data.context}});if(!r.ok)throw Error('Arquivo não disponível');const blob=await r.blob();await verify();return blob}
 function url(blob){check();const u=URL.createObjectURL(blob);urls.add(u);return u}
 const release=u=>{URL.revokeObjectURL(u);urls.delete(u)};
 const local=Object.freeze({get length(){check();return memory.size},key:i=>{check();return [...memory.keys()][i]??null},getItem:k=>{check();return memory.get(k)??null},setItem:(k,v)=>{check();const raw=String(v);if(pdfKey(k)&&!pdfHydrating&&memory.get(k)!==raw)pdfDirty=true;memory.set(k,raw)},removeItem:k=>{check();if(pdfKey(k)&&!pdfHydrating&&memory.has(k))pdfDirty=true;memory.delete(k)}});
 const copy=x=>{check();return structuredClone(x)};
 function element(tag,text){const node=document.createElement(tag);node.textContent=text;return node}
 async function downloadPdf(id,title){const blob=await read('pdf',id),u=url(blob),a=document.createElement('a');a.href=u;a.download=title.replace(/[\\/]/g,'_').slice(0,160)+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>release(u),1000)}

 function imageKey(id){return 'BM030_STROKES_'+id}
 function writeImageSetting(key,value){check();if(!currentImage||key!==imageKey(currentImage)||!imageEdits.has(currentImage))throw Error('Imagem fora da sessão');memory.set(key,value);const edit=imageEdits.get(currentImage);edit.dirty=value!==edit.confirmed;updateImageSync()}
 function updateImageSync(){const b=by('bmCentralImageSync');if(b)b.disabled=imageBusy||!currentImage||!imageEdits.get(currentImage)?.dirty}
 async function syncImage(){const id=currentImage,edit=imageEdits.get(id);if(!edit?.dirty||imageBusy)return;const raw=memory.get(imageKey(id));imageBusy=true;updateImageSync();try{const saved=await api('/api/image-annotations/'+encodeURIComponent(id),{expected:edit.version,strokes:JSON.parse(raw)});if(JSON.stringify(saved.strokes)!==raw)throw Error('Recibo divergente');edit.version=saved.version;edit.confirmed=raw;edit.dirty=memory.get(imageKey(id))!==raw;by('imgMessage').textContent=edit.dirty?'Alterações posteriores ainda pendentes.':'Marcações sincronizadas e conferidas. Original preservado.'}catch(e){by('imgMessage').textContent=e.message}finally{imageBusy=false;updateImageSync()}}
 async function openImage(id,title){
  if(imageBusy||by('imageDialog').open)return;
  if(!data.media.images.some(m=>m.id===id))throw Error('Imagem fora do perfil');
  const blob=await read('image',id),u=url(blob);
  try{if(!imageEdits.get(id)?.dirty){const remote=await api('/api/image-annotations/'+encodeURIComponent(id));const raw=JSON.stringify(remote.strokes);imageEdits.set(id,{version:remote.version,confirmed:raw,dirty:false});memory.set(imageKey(id),raw)}
   const im=new Image();await new Promise((ok,fail)=>{im.onload=ok;im.onerror=()=>fail(Error('Imagem inválida'));im.src=u});check();currentImage=id;await window.BancoMestreEditorV030.open({image:im,imageId:id,title,quality:'original consultado',warning:'Marcações separadas do original. Sincronize antes de sair.',sourceUrl:'',onExclude:null});updateImageSync()
  }finally{release(u)}
 }
 function renderCardExtras(c,ans){
  check();const record=data.srs.records.find(x=>x.id===c.id);ans.append(element('p',record?'Próxima revisão: '+record.due:'Sem vencimento cadastrado.'));
  for(const id of c.relatedCardIds||[]){const other=data.cards.find(x=>x.id===id);if(!other)continue;const b=element('button',id+' — '+other.front);b.type='button';b.onclick=()=>{check();window.BancoMestreVisualizarCardV050?.showId(id,b)};ans.append(b)}
  for(const media of data.media.images.filter(m=>m.cardIds.includes(c.id))){const b=element('button','Ver imagem: '+media.title);b.type='button';b.onclick=()=>openImage(media.id,media.title).catch(e=>alert(e.message));ans.append(b)}
 }
 async function api(path,payload){await verify();const r=await fetch(path,{credentials:'same-origin',cache:'no-store',headers:{'X-BM-Context':data.context,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{method:'POST',body:JSON.stringify(payload)}:{})});const result=await r.json();await verify();if(!r.ok)throw Error(result.error||'Operação indisponível');return result}
 async function recordReview(id,rating){check();if(reviewBusy||!data.cards.some(c=>c.id===id&&c.active)||!Object.hasOwn(data.ratings,rating))throw Error('Avaliação inválida');if(reviewPending&&(reviewPending.id!==id||reviewPending.rating!==rating))throw Error('Conclua a mesma avaliação pendente antes de iniciar outra');reviewBusy=true;try{if(!reviewPending)reviewPending={id,rating,intent:null};if(!reviewPending.intent){const p=await api('/api/review/prepare',{cardId:id,rating});reviewPending.intent=p.intent}const saved=await api('/api/review/commit',{intent:reviewPending.intent});if(saved.id!==id||saved.rating!==rating||!saved.eventId)throw Error('Recibo divergente');data.srs.records=[...data.srs.records.filter(x=>x.id!==id),saved];reviewPending=null;return {...saved,interval_days:saved.intervalDays}}finally{reviewBusy=false}}

 function filteredMarks(records,doc){const prefix=doc.id+':'+doc.hash.slice(0,24),out={},core=window.BancoMestreGrifosSyncCoreV103;
  for(const [key,raw] of Object.entries(records||{})){if(key.startsWith('BM030_STROKES_PDF:'+prefix+':P')||key==='BM102_PDF_HIGHLIGHT_JOINS:'+prefix)out[key]=raw;
   else if(key===core.META||key===core.DELETIONS){const x=core.parse(key,raw),selected=Object.fromEntries(Object.entries(x).filter(([k])=>key===core.META?k.startsWith('TXT:'+prefix+':'):k.startsWith('BM030_STROKES_PDF:'+prefix+':P')));if(Object.keys(selected).length)out[key]=JSON.stringify(selected)}}
  return out}
 function hydratePdf(master,doc){pdfHydrating=true;try{for(const key of [...memory.keys()])if(pdfKey(key))memory.delete(key);for(const [k,v] of Object.entries(filteredMarks(master.records,doc)))memory.set(k,v)}finally{pdfHydrating=false}}
 function pdfNotice(message){by('pdfLocalStatus').textContent=message}
 async function openPdf(doc){if(pdfBusy||by('pdfDialog').open)return;if(!doc.hash||!/^[a-f0-9]{64}$/.test(doc.hash))throw Error('PDF sem hash integral cadastrado. Consulte o original pelo download na interface de homologação.');if(pdfDirty&&pdfDocument?.id!==doc.id)throw Error('Sincronize as marcações do PDF anterior antes de abrir outro.');pdfBusy=true;
  try{const blob=await read('pdf',doc.id);const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('');if(digest!==doc.hash)throw Error('Original divergente da edição cadastrada');
   if(!pdfDirty){const remote=await api('/api/marks');hydratePdf(remote.master,doc);pdfVersion=remote.version;pdfDocument=doc}
   await window.BancoMestrePDFV038.openFromDrive(doc,blob);check();pdfNotice('PDF aberto. Grifos permanecem em memória até sincronizar.');
  }finally{pdfBusy=false}}
 async function syncPdf(){if(pdfBusy||!pdfDocument||!pdfDirty)return;pdfBusy=true;const controls=by('pdfLocalTools'),wrap=by('pdfLocalMode');controls.inert=wrap.inert=true;try{const core=window.BancoMestreGrifosSyncCoreV103,snapshot=core.capture(local,'CENTRAL-PORTAL-V348');snapshot.records=filteredMarks(snapshot.records,pdfDocument);const saved=await api('/api/marks/sync',{expected:pdfVersion,snapshot});pdfVersion=saved.version;
   if(Object.keys(snapshot.records).some(k=>local.getItem(k)!==snapshot.records[k]&&k!==core.META&&k!==core.DELETIONS)){pdfNotice('Alterações posteriores pendentes; sincronize novamente.');return}
   const confirmed=filteredMarks(saved.master.records,pdfDocument);if(Object.keys(snapshot.records).some(k=>snapshot.records[k]!==confirmed[k])){pdfNotice('O mestre contém diferenças ou conflitos. Exporte o backup antes de conciliar; edição local preservada.');return}
   pdfDirty=false;pdfNotice('Grifos sincronizados e conferidos. Original preservado.');
  }catch(e){pdfNotice(e.message+' — edição local preservada.')}finally{controls.inert=wrap.inert=false;pdfBusy=false}}
 async function copyPdf(){if(pdfBusy||!pdfDocument||!window.BancoMestrePDFV042.editing)return;pdfBusy=true;try{const result=await window.BancoMestrePDFV042.buildAnnotated();if(result.pagesMarked<1)throw Error('Nenhuma página marcada');await verify();const response=await fetch('/api/pdf/copy',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/pdf','X-BM-Context':data.context,'X-BM-Document':pdfDocument.id,'X-BM-Pages':String(result.pagesMarked)},body:result.blob});const receipt=await response.json();await verify();if(!response.ok)throw Error(receipt.error||'Cópia não confirmada');pdfNotice('Cópia anotada confirmada: '+receipt.name+'. Original preservado.')}catch(e){pdfNotice(e.message)}finally{pdfBusy=false}}
 function exportMarks(){if(!pdfDocument)return;try{const snapshot=window.BancoMestreGrifosSyncCoreV103.capture(local,'CENTRAL-PORTAL-V348');snapshot.records=filteredMarks(snapshot.records,pdfDocument);const u=url(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='grifos-'+pdfDocument.id+'.json';a.click();setTimeout(()=>release(u),1000)}catch(e){pdfNotice(e.message)}}
 const studyKey='BM245_CONTROLE_ESTUDOS';let studyBase=null,studyBusy=false;
 async function studyInit(){const remote=await api('/api/study');studyBase=remote;local.setItem(studyKey,JSON.stringify(remote.data))}
 const studyDirty=()=>!!studyBase&&local.getItem(studyKey)!==JSON.stringify(studyBase.data);
 async function syncStudy(){if(!studyBase||studyBusy)return;studyBusy=true;const report=message=>window.dispatchEvent(new CustomEvent('bm-profile-study-sync-result',{detail:{message}}));try{const raw=local.getItem(studyKey),result=await api('/api/study/sync',{expected:studyBase.version,base:studyBase.data,data:JSON.parse(raw)});studyBase={version:result.version,data:result.data};if(raw===local.getItem(studyKey)){local.setItem(studyKey,JSON.stringify(result.data));window.BM240ControlApp?.reloadProfileStudy();report('Controle individual sincronizado e conferido.')}else report('Alterações posteriores continuam pendentes.')}catch(e){report(e.message+' — backup local preservado.')}finally{studyBusy=false}}
 window.BM240ControlDrive=Object.freeze({sync:syncStudy});

 const gapsKey='BM_LACUNAS_V242';let gapsBase=null,gapsBusy=false;
 async function gapsInit(){const remote=await api('/api/gaps');gapsBase=remote;local.setItem(gapsKey,JSON.stringify(remote.data))}
 const gapsDirty=()=>!!gapsBase&&local.getItem(gapsKey)!==JSON.stringify(gapsBase.data);
 async function syncGaps(){if(!gapsBase||gapsBusy)return;gapsBusy=true;const button=by('bm242-sync');if(button)button.disabled=true;
 const report=message=>document.dispatchEvent(new CustomEvent('bm242-lacunas-drive-status',{detail:{message}}));
 try{const raw=local.getItem(gapsKey),saved=await api('/api/gaps/sync',{expected:gapsBase.version,data:JSON.parse(raw)});gapsBase=saved;if(raw===local.getItem(gapsKey)){if(JSON.stringify(saved.data)!==raw)window.BM242Lacunas.applyRemote(saved.data);report('Lacunas sincronizadas e conferidas; histórico preservado.')}else report('Alterações posteriores continuam pendentes.')}
 catch(e){report(e.message+' — mantenha ou exporte a edição local.')}finally{gapsBusy=false;if(button)button.disabled=false}}
 const runtime=Object.freeze({syncGaps,studyHtml:async()=>{const r=await api('/original-study.html');return r.html},studyScript:'/original-study-app.js',openPdf,ratings:copy(data.ratings),get reviewBusy(){return reviewBusy},get reviewReady(){return active&&!reviewBusy},canAcquire:id=>active&&(data.acquirable||[]).includes(id),recordReview,loadLayers:id=>api('/api/layers/'+encodeURIComponent(id)),mode:'central',local,writeImageSetting,catalog:()=>copy(data.cards),pdfCatalog:()=>copy(data.media.pdf.map(p=>({...p,section:p.section||'Drive individual',category:p.category||'PDF'}))),imageCatalog:()=>copy(data.media.images),srs:()=>copy(data.srs),downloadPdf,openImage,renderCardExtras});
 Object.defineProperty(window,'BMAccountRuntime',{value:runtime,writable:false,configurable:false});
 // Use the original page DOM and core. No browser OAuth or persistent legacy storage.
 for(const path of ['/original-core.js','/original-reader.js','/original-review.js','/original-image-editor.js','/original-pdf-sync-core.js','/original-pdf-editor.js','/original-pdf-grifador.js']){const script=document.createElement('script');script.src=path;await new Promise((ok,fail)=>{script.onload=ok;script.onerror=fail;document.head.append(script)})}
 await verify();
 try{await studyInit();for(const path of ['/original-calendar.js','/original-study-native.js']){const script=document.createElement('script');script.src=path;await new Promise((ok,fail)=>{script.onload=ok;script.onerror=fail;document.head.append(script)})}}catch(e){const p=element('p','Controle de estudos indisponível: '+e.message);document.querySelector('main').prepend(p)}
 try{await gapsInit();for(const path of ['/original-gaps.js','/original-gaps-ui.js']){const script=document.createElement('script');script.src=path;await new Promise((ok,fail)=>{script.onload=ok;script.onerror=fail;document.head.append(script)})}}catch(e){document.querySelector('main').prepend(element('p','Painel de lacunas indisponível: '+e.message))}
 const stats=document.querySelectorAll('.stats .stat b'),counts=[data.counts.pdf,data.counts.cards,data.counts.images,data.counts.study,data.counts.annotations];stats.forEach((e,i)=>e.textContent=String(counts[i]??'—'));
 document.querySelectorAll('.bm241-verification').forEach(e=>e.textContent='Perfil individual');
 const exit=by('bm239-drive-action');exit.disabled=false;exit.setAttribute('aria-label','Encerrar sessão');exit.onclick=async()=>{if(imageBusy||pdfBusy||studyBusy||gapsBusy)return;if((pdfDirty||studyDirty()||gapsDirty()||[...imageEdits.values()].some(x=>x.dirty))&&!confirm('Há alterações não sincronizadas. Sair e descartar essas alterações?'))return;try{await fetch('/api/logout',{method:'POST',credentials:'same-origin',headers:{'X-BM-Context':data.context}})}finally{lock()}};
 by('bm239-sync-details').textContent='Perfil autenticado: '+data.username+' · homologação';
 const syncButton=element('button','Sincronizar marcações');syncButton.id='bmCentralImageSync';syncButton.type='button';syncButton.disabled=true;syncButton.onclick=()=>void syncImage();by('imageDialog').querySelector('.editor-tools').append(syncButton);
 by('imgClose').onclick=()=>{if(imageBusy)return;if(imageEdits.get(currentImage)?.dirty&&!confirm('Marcações não sincronizadas. Fechar mantendo a edição nesta sessão?'))return;by('imageDialog').close()};
 by('imageDialog').addEventListener('cancel',e=>{if(imageBusy||imageEdits.get(currentImage)?.dirty)e.preventDefault()});
 by('imageDialog').addEventListener('close',()=>{currentImage=null;by('base').width=by('grifo').width=1;by('base').height=by('grifo').height=1;updateImageSync()});
 by('originalDriveLink').hidden=true;by('hideOpened').hidden=true;
 window.addEventListener('beforeunload',e=>{if(pdfDirty||studyDirty()||gapsDirty()||[...imageEdits.values()].some(x=>x.dirty)){e.preventDefault();e.returnValue=''}});

 const pdfTools=by('pdfLocalTools'),group=document.createElement('div');group.className='pdfGroup';
 for(const [label,fn] of [['Sincronizar grifos',syncPdf],['Salvar cópia no Drive',copyPdf],['Exportar backup de grifos',exportMarks]]){const button=element('button',label);button.type='button';button.onclick=()=>void fn();group.append(button)}pdfTools.append(group);
 by('pdfClose').onclick=()=>{if(pdfBusy)return;if(pdfDirty&&!confirm('Grifos pendentes. Fechar mantendo as marcações nesta sessão?'))return;by('pdfDialog').close()};
 by('pdfDialog').addEventListener('cancel',e=>{if(pdfBusy||pdfDirty)e.preventDefault()});

 const note=element('p','Ambiente original em homologação. Leitor original, avaliação formal e editor de imagens integrados; Editor PDF e sincronização em homologação. Controle, calendário e lacunas integrados; homologação em andamento.');
 note.className='notice';const a=element('a','Abrir funções homologadas');a.href='/';note.append(' ',a);document.querySelector('main').prepend(note);
 document.body.hidden=false;
 window.addEventListener('pagehide',()=>{active=false;memory.clear();for(const u of urls)URL.revokeObjectURL(u);urls.clear();document.body.replaceChildren()});
 window.addEventListener('pageshow',e=>{if(e.persisted)location.replace('/')});
 setInterval(async()=>{if(!active||checking)return;checking=true;try{await verify()}catch{lock()}finally{checking=false}},5000);
})().catch(()=>{document.body.replaceChildren();location.replace('/')});
