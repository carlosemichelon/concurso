/* V342 — verificação visual de imagens por cartão.
 * Regra: SVG só é "carregado" após load real; Drive privado é apenas vínculo
 * até que o usuário abra a prévia autenticada. Não modifica frente/verso/SRS. */
(function(){
'use strict';
if(window.BM342MediaIntegrity)return;
const upstream=window.BM198Format;
if(!upstream||typeof upstream.render!=='function')throw Error('V342: renderizador anterior indisponível');
const index='assets/card_media_integrity_v342.json?v=342-1';
const observers=new WeakMap();
const states=new Map();
let registry=null,loading=null;
const el=(t,c,s)=>{const e=document.createElement(t);if(c)e.className=c;if(s!=null)e.textContent=s;return e;};
function load(){
 if(!loading)loading=fetch(index,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Registro de imagens indisponível');return r.json()})
  .then(d=>{
   if(d.schema!=='BancoMestreMediaIntegrityV342'||!Array.isArray(d.public_visuals)||!Array.isArray(d.private_originals))
     throw Error('Contrato de imagens incompatível');
   registry=d;return d;
  }).catch(e=>{loading=null;throw e});
 return loading;
}
function applicable(id){
 if(!registry)return{public:[],private:[]};
 return{public:registry.public_visuals.filter(x=>x.card_ids.includes(id)),
  private:registry.private_originals.filter(x=>x.card_ids.includes(id))};
}
function scopeFor(host){const pane=host.closest('.bm197-evolutive');return pane?.parentElement||host;}
function rootFor(scope,id){
 return [...scope.querySelectorAll('[data-bm337-id],[data-bm338-id],[data-bm340-id]')].reverse()
 .find(x=>x.dataset.bm337Id===id||x.dataset.bm338Id===id||x.dataset.bm340Id===id)||null;
}
function note(parent,key,cls,msg){
 let n=parent.querySelector('[data-bm342-status="'+key+'"]');
 if(!n){n=el('small','bm342-media-status '+cls,msg);n.dataset.bm342Status=key;parent.append(n);}
 if(n.textContent!==msg)n.textContent=msg;
 n.className='bm342-media-status '+cls;
 return n;
}
function previewFor(link,parent,mediaId){
 if(parent.querySelector('[data-bm342-preview="'+mediaId+'"]'))return;
 let dest;
 try{dest=new URL(link.href);if(dest.hostname!=='drive.google.com'||!/^\/file\/d\/[^/]+\/view\/?$/.test(dest.pathname))return;}
 catch{return;}
 const details=el('details','bm342-original-preview');
 details.dataset.bm342Preview=mediaId;
 details.append(el('summary','', 'Visualizar original no cartão (requer acesso ao Drive)'));
 details.addEventListener('toggle',()=>{
  if(!details.open||details.querySelector('iframe'))return;
  const frame=el('iframe','bm342-drive-iframe');
  frame.title='Prévia autenticada da imagem original '+mediaId;
  frame.loading='lazy';frame.referrerPolicy='no-referrer';
  frame.src=dest.origin+dest.pathname.replace(/\/view\/?$/,'/preview');
  details.append(frame,el('p','bm342-preview-note',
   'Se o navegador bloquear a prévia ou o Drive solicitar login, use o link para abrir o original em nova aba.'));
 });
 parent.append(details);
}
function audit(root,id){
 const media=applicable(id),observed=[];
 let ready=true;
 for(const m of media.public){
  const imgs=[...root.querySelectorAll('img')].filter(n=>n.getAttribute('src')===m.src);
  if(!imgs.length){
   ready=false;
   note(root,'missing-'+m.media_id,'bm342-warning',
     'Imagem vinculada '+m.media_id+': arquivo não localizado neste verso. Exibição pendente.');
   observed.push({id:m.media_id,status:'DOM_PENDENTE'});continue;
  }
  for(const img of imgs){
   const parent=img.closest('figure')||root;
   const marker='svg-'+m.media_id;
   const render=()=>{
    const loaded=img.complete&&img.naturalWidth>0;
    const failed=img.complete&&img.naturalWidth===0;
    note(parent,marker,loaded?'bm342-ok':failed?'bm342-error':'bm342-pending',
     loaded?'Imagem técnica carregada neste cartão':
      failed?'Falha ao carregar imagem técnica; abra o esquema original':'Carregando imagem técnica…');
    states.set(id+'|'+m.media_id,loaded?'CARREGADA':failed?'ERRO_CARREGAMENTO':'CARREGANDO');
   };
   if(img.dataset.bm342Wired!=='yes'){
    img.dataset.bm342Wired='yes';
    img.addEventListener('load',render);
    img.addEventListener('error',render);
   }
   render();
  }
  const previous=root.querySelector('[data-bm342-status="missing-'+m.media_id+'"]');
  if(previous)previous.remove();
  observed.push({id:m.media_id,status:states.get(id+'|'+m.media_id)});
 }
 for(const m of media.private){
  const direct=root.querySelector('.bm341-original-item[data-media-id="'+m.media_id+'"]');
  const section=direct||(m.source==='V340'?root.querySelector('.bm340-original-image:not(.bm341-original-image)'):null);
  const a=section?.querySelector('a.bm340-drive-original');
  if(!a){
   ready=false;
   note(root,'missing-'+m.media_id,'bm342-warning',
    'Original '+m.media_id+' catalogado; link ainda não carregado neste cartão.');
   observed.push({id:m.media_id,status:'VINCULO_SEM_LINK_VISIVEL'});continue;
  }
  note(section,'private-'+m.media_id,'bm342-private',
   'Original preservado no Drive. Este link não confirma que a imagem foi exibida no cartão.');
  previewFor(a,section,m.media_id);
  const old=root.querySelector('[data-bm342-status="missing-'+m.media_id+'"]');
  if(old)old.remove();
  states.set(id+'|'+m.media_id,'LINK_PRIVADO_APOS_RESPOSTA');
  observed.push({id:m.media_id,status:'LINK_PRIVADO_APOS_RESPOSTA'});
 }
 root.dataset.bm342MediaAudited='yes';
 return{ready,observed};
}
function watch(host,id){
 if(!host.isConnected)return;
 const old=observers.get(host);if(old){old.disconnect();observers.delete(host);}
 const scope=scopeFor(host);
 const once=()=>{
  if(!host.isConnected){const ob=observers.get(host);ob?.disconnect();return true;}
  if(host.closest('#bmCardPeekV050')&&window.BancoMestreVisualizarCardV050?.currentId!==id){
   const ob=observers.get(host);ob?.disconnect();return true;
  }
  const root=rootFor(scope,id);
  if(!root)return false;
  return audit(root,id).ready;
 };
 if(once())return;
 const observer=new MutationObserver(()=>{if(once()){observer.disconnect();observers.delete(host);}});
 observer.observe(scope,{subtree:true,childList:true});
 observers.set(host,observer);
}
function render(host,record,id){
 const result=upstream.render(host,record,id);
 load().then(()=>{if(applicable(id).public.length||applicable(id).private.length)watch(host,id);})
 .catch(e=>{
  console.error('V342: auditoria de mídia',e);
  if(host.isConnected)note(host,'registry-error','bm342-error','Auditoria visual indisponível: '+e.message);
 });
 return result;
}
window.BM198Format=Object.freeze({...upstream,render,version:'V342-MEDIA-INTEGRITY'});
window.BM342MediaIntegrity=Object.freeze({
 load,ids:()=>registry?[...new Set([...registry.public_visuals,...registry.private_originals].flatMap(x=>x.card_ids))]:[],
 inspect:(id)=>{const {public:pub,private:priv}=applicable(id);return [...pub,...priv].map(m=>({id:m.media_id,status:states.get(id+'|'+m.media_id)||'SEM_EVIDENCIA_DE_CARREGAMENTO'}));},
 contract:index,has_browser_visual_test:false,changes_srs:false});
load().catch(e=>console.error('V342: catálogo',e));
})();