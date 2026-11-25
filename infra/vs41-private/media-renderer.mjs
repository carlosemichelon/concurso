// Keep the figure layout, replace the original Drive fetch only in the experimental reader.
export function privateMediaRenderer(source){
 const start='function privateFigure(f,m){',end='\nfunction figure(m){';
 const i=source.indexOf(start),j=source.indexOf(end,i);
 if(i<0||j<0)throw Error('Contrato mídia divergente');
 const body=`function privateFigure(f,m){
 const b=el('button','Exibir original do Drive','secondary zoom');b.type='button';const status=el('small',' Acesso restrito à conta autorizada.');status.dataset.privateState='PENDENTE';f.append(b,status);
 const cardId=m.private_card_id;
 b.onclick=async()=>{let obj;b.disabled=true;status.dataset.privateState='CARREGANDO';status.textContent='Consultando o arquivo privado…';
  try{const blob=await window.BMVS41PrivateMedia.read(cardId,m.id);if(!/^image\\/(png|jpeg|webp|gif)$/.test(blob.type))throw Error('Formato inválido');
   if(!f.isConnected)return;obj=URL.createObjectURL(blob);const im=el('img');im.alt=m.alt||m.caption;im.src=obj;await im.decode();
   if(!f.isConnected){URL.revokeObjectURL(obj);return;}revokePrivate(f);privateURLs.set(f,obj);mapToken=currentToken();f.querySelector('.bm349-private-preview')?.remove();
   const wrap=el('div',undefined,'diagram bm349-private-preview');wrap.append(im);status.before(wrap);status.dataset.privateState='CARREGADA';status.textContent='Original carregado nesta sessão autorizada.';b.textContent='Recarregar original';obj=null;
  }catch(e){if(obj)URL.revokeObjectURL(obj);status.dataset.privateState='BLOQUEADO';status.textContent=e.message}finally{b.disabled=false}
 };
 }`;
 let s=source.slice(0,i)+body+source.slice(j);
 const replace=(a,b)=>{if(s.split(a).length!==2)throw Error('Contrato leitor divergente: '+a.slice(0,80));s=s.replace(a,b)};
 replace("const currentToken=()=>window.BancoMestreMediaSyncV182?.token?.()||window.BM239DriveGlobal?.writeToken?.()||'';","const currentToken=()=>window.BMVS41PrivateReviews?.sessionKey()||'';");
 replace("a.append(figure({...x,id:x.id,role:x.role,caption:x.caption||x.id,src}));","a.append(figure({...x,id:x.id,role:x.role,caption:x.caption||x.id,src,private_card_id:id}));");
 replace("host.append(figure({...m,src}));","host.append(figure({...m,src,private_card_id:id}));");
 return s;
}
