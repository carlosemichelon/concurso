/* Petrobras 26 closure V341 — link 3 imagens originais privadas ao VERSO de 10 cartões.
   Pequena camada derivada: não altera conteúdo técnico, original, SRS nem imagens do Atlas. */
(function(){
"use strict";
if(window.BM341OriginalMedia)return;
const prev=window.BM198Format;if(!prev?.render)throw Error("V341: renderer anterior indisponível");
const INDEX="assets/petro26_closure_media_v341.json?v=341-1";
let dataset=null,promise=null;
const allow=new Set(["CARD-1557","CARD-0567","CARD-0186","CARD-1546","CARD-1555","CARD-1122","CARD-0052","CARD-0168","CARD-1542","CARD-0190"]);
function load(){
 if(!promise)promise=fetch(INDEX,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("V341: índice de mídia indisponível");return r.json()})
 .then(d=>{
  if(d.format!=="Petrobras26ClosingOriginalMediaV341"||d.originals?.length!==3||Object.keys(d.card_to_original||{}).length!==10)
   throw Error("V341: manifesto de mídia inválido");
  const originalIds=new Set(d.originals.map(m=>m.image_id));
  for(const [id,images] of Object.entries(d.card_to_original)){
   if(!allow.has(id)||images.some(x=>!originalIds.has(x)))throw Error("V341: vínculo inválido "+id);
  }
  for(const m of d.originals){
   if(m.type!=="ORIGINAL_USUARIO"||!m.sha256||!m.url?.startsWith("https://drive.google.com/file/d/")||!m.caption)
    throw Error("V341: fonte sem rastreabilidade");
  }
  dataset=d;return d;
 }).catch(err=>{promise=null;throw err});
 return promise;
}
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x;};
function rootFor(host,id){
 const pane=host.closest(".bm197-evolutive"),scope=pane?.parentElement||host;
 const items=scope.querySelectorAll("article[data-bm337-id],article[data-bm338-id],article[data-bm340-id]");
 return [...items].reverse().find(x=>[x.dataset.bm337Id,x.dataset.bm338Id,x.dataset.bm340Id].includes(id))||null;
}
function append(host,id){
 if(!dataset||!host.isConnected)return false;
 const pane=host.closest(".bm197-evolutive");
 if(host.closest("#bmCardPeekV050")&&window.BancoMestreVisualizarCardV050?.currentId!==id)return false;
 const root=rootFor(host,id);if(!root)return false;if(root.dataset.bm341Media==="yes")return true;
 const imageIds=dataset.card_to_original[id];if(!imageIds)return false;
 const section=el("section","bm340-original-image bm341-original-image");
 section.dataset.bm341For=id;
 section.append(el("h4","","Imagens originais vinculadas ao cartão"));
 for(const imageId of imageIds){
  const media=dataset.originals.find(m=>m.image_id===imageId);
  const item=el("div","bm341-original-item");
  item.dataset.mediaId=imageId;item.dataset.mediaRole="IMAGEM_DO_CARTAO_VERSO";
  const a=el("a","bm340-drive-original","Abrir original preservado no Drive");
  a.href=media.url;a.target="_blank";a.rel="noopener noreferrer";
  const note=el("p","bm339-caption",media.caption);
  const risk=el("p","bm339-caption bm341-media-caveat",media.warning+" Imagem privada; acesso condicionado às permissões do Drive.");
  item.append(a,note,risk);section.append(item);
 }
 root.append(section);root.dataset.bm341Media="yes";return true;
}
function watch(host,id){
 const pane=host.closest(".bm197-evolutive"),scope=pane?.parentElement||host;
 if(append(host,id))return;
 const observer=new MutationObserver(()=>{
  if(!host.isConnected||host.closest("#bmCardPeekV050")&&window.BancoMestreVisualizarCardV050?.currentId!==id){
   observer.disconnect();return;
  }
  if(append(host,id))observer.disconnect();
 });
 observer.observe(scope,{childList:true,subtree:true});
}
function render(host,record,id){
 const output=prev.render(host,record,id);
 if(!allow.has(id))return output;
 if(dataset&&output?.loading!==true){watch(host,id);return output;}
 load().then(()=>watch(host,id)).catch(e=>console.warn("V341: imagens",e));
 return output;
}
window.BM198Format=Object.freeze({...prev,render,version:"V341-PETRO26-FECHAMENTO"});
window.BM341OriginalMedia=Object.freeze({ids:[...allow],load,index:INDEX,srs_changed:false,original_private:true});
load().catch(e=>console.warn("V341: índice",e));
})();