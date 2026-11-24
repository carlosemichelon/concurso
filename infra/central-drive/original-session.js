'use strict';
(async()=>{
 const by=id=>document.getElementById(id),resp=await fetch('/api/runtime',{credentials:'same-origin',cache:'no-store'});if(!resp.ok){location.replace('/');return}
 const data=await resp.json();let active=true,checking=false;const memory=new Map(),urls=new Set();
 const check=()=>{if(!active)throw Error('Sessão encerrada')};
 const lock=()=>{if(!active)return;active=false;memory.clear();for(const u of urls)URL.revokeObjectURL(u);urls.clear();document.body.replaceChildren();location.replace('/')};
 const verify=async()=>{check();const r=await fetch('/api/session',{credentials:'same-origin',cache:'no-store'});const s=await r.json();if(!r.ok||s.context!==data.context){lock();throw Error('Sessão alterada')}check()};
 await verify();
 async function read(kind,id){await verify();const r=await fetch('/api/media/'+kind+'/'+encodeURIComponent(id),{credentials:'same-origin',cache:'no-store',headers:{'X-BM-Context':data.context}});if(!r.ok)throw Error('Arquivo não disponível');const blob=await r.blob();await verify();return blob}
 function url(blob){check();const u=URL.createObjectURL(blob);urls.add(u);return u}
 const release=u=>{URL.revokeObjectURL(u);urls.delete(u)};
 const local=Object.freeze({getItem:k=>{check();return memory.get(k)??null},setItem:(k,v)=>{check();memory.set(k,String(v))},removeItem:k=>{check();memory.delete(k)}});
 const copy=x=>{check();return structuredClone(x)};
 function element(tag,text){const node=document.createElement(tag);node.textContent=text;return node}
 async function downloadPdf(id,title){const blob=await read('pdf',id),u=url(blob),a=document.createElement('a');a.href=u;a.download=title.replace(/[\\/]/g,'_').slice(0,160)+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>release(u),1000)}
 async function openImage(id,title){
  const blob=await read('image',id),u=url(blob);
  try{const im=new Image();await new Promise((ok,fail)=>{im.onload=ok;im.onerror=()=>fail(Error('Imagem inválida'));im.src=u});check();const canvas=by('base'),ink=by('grifo');const scale=Math.min(1,Math.sqrt(16000000/(im.naturalWidth*im.naturalHeight)));canvas.width=Math.max(1,Math.round(im.naturalWidth*scale));canvas.height=Math.max(1,Math.round(im.naturalHeight*scale));canvas.style.maxWidth='100%';canvas.style.height='auto';ink.hidden=true;canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);by('imgTitle').textContent=title;by('imagePixels').textContent=im.naturalWidth+' × '+im.naturalHeight+' px';by('imgMessage').textContent='Consulta do original. Editor ainda não homologado.';by('imageDialog').showModal()}finally{release(u)}
 }
 function renderCardExtras(c,ans){
  check();const record=data.srs.records.find(x=>x.id===c.id);ans.append(element('p',record?'Próxima revisão: '+record.due:'Sem vencimento cadastrado.'));
  for(const id of c.relatedCardIds||[]){const other=data.cards.find(x=>x.id===id);if(!other)continue;const b=element('button',id+' — '+other.front);b.type='button';b.onclick=()=>{check();by('cardSearch').value=id;by('cardSearch').dispatchEvent(new Event('input'));};ans.append(b)}
  for(const media of data.media.images.filter(m=>m.cardIds.includes(c.id))){const b=element('button','Ver imagem: '+media.title);b.type='button';b.onclick=()=>openImage(media.id,media.title).catch(e=>alert(e.message));ans.append(b)}
 }
 const runtime=Object.freeze({mode:'central',local,catalog:()=>copy(data.cards),pdfCatalog:()=>copy(data.media.pdf.map(p=>({...p,section:p.section||'Drive individual',category:p.category||'PDF'}))),imageCatalog:()=>copy(data.media.images),srs:()=>copy(data.srs),downloadPdf,openImage,renderCardExtras});
 Object.defineProperty(window,'BMAccountRuntime',{value:runtime,writable:false,configurable:false});
 // Use the original page DOM and core. No browser OAuth or persistent legacy storage.
 const script=document.createElement('script');script.src='/original-core.js';await new Promise((ok,fail)=>{script.onload=ok;script.onerror=fail;document.head.append(script)});
 await verify();
 const stats=document.querySelectorAll('.stats .stat b'),counts=[data.counts.pdf,data.counts.cards,data.counts.images,data.counts.study,data.counts.annotations];stats.forEach((e,i)=>e.textContent=String(counts[i]??'—'));
 document.querySelectorAll('.bm241-verification').forEach(e=>e.textContent='Perfil individual');
 const exit=by('bm239-drive-action');exit.disabled=false;exit.setAttribute('aria-label','Encerrar sessão');exit.onclick=async()=>{try{await fetch('/api/logout',{method:'POST',credentials:'same-origin',headers:{'X-BM-Context':data.context}})}finally{lock()}};
 by('bm239-sync-details').textContent='Perfil autenticado: '+data.username+' · homologação';
 by('imgClose').onclick=()=>by('imageDialog').close();
 by('imageDialog').addEventListener('close',()=>{const c=by('base');c.width=1;c.height=1});
 by('imageDialog').querySelector('.editor-tools').hidden=true;
 for(const id of ['v034SelectOriginal','originalDriveLink','hideOpened','zoomOutImage','zoomWidthImage','zoomFitImage','zoomActualImage','zoomInImage']){const x=by(id);if(x)x.hidden=true}
 by('pdfChooseLocal').disabled=false;
 const note=element('p','Ambiente original em homologação. Para revisões formais, envios e sincronização, use a interface de validação já integrada.');
 note.className='notice';const a=element('a','Abrir funções homologadas');a.href='/';note.append(' ',a);document.querySelector('main').prepend(note);
 document.body.hidden=false;
 window.addEventListener('pagehide',()=>{active=false;memory.clear();for(const u of urls)URL.revokeObjectURL(u);urls.clear();document.body.replaceChildren()});
 window.addEventListener('pageshow',e=>{if(e.persisted)location.replace('/')});
 setInterval(async()=>{if(!active||checking)return;checking=true;try{await verify()}catch{lock()}finally{checking=false}},5000);
})().catch(()=>{document.body.replaceChildren();location.replace('/')});
