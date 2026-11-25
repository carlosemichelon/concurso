// Experimental adapter: retain library group layout and filters. Preview only until annotations are isolated.
export function privatePdfLibrary(source){
 const a=source.indexOf('/* 8 assets/v271_pdfs_progressive.js */'),b=source.indexOf('/* PDFs locais:',a);
 if(a<0||b<0)throw Error('Contrato biblioteca divergente');
 let s=source.slice(a,b);
 const replace=(x,y)=>{if(s.split(x).length!==2)throw Error('Contrato biblioteca divergente: '+x.slice(0,80));s=s.replace(x,y)};
 function block(x,y,v){const i=s.indexOf(x),j=s.indexOf(y,i+x.length);if(i<0||j<0)throw Error('Contrato biblioteca divergente: '+x);s=s.slice(0,i)+v+'\n'+s.slice(j)}
 block('function driveValid(){','function accessGate(){',`function driveValid(){return window.BMVS41PrivateReviews?.available()===true;}`);
 block('async function ready(){','function updateFilters(){',`let lastDocs=null;
 async function ready(){
  if(lastDocs===docs&&data)return data;
  lastDocs=docs;const sections=[...new Set(docs.map(d=>d.section))];
  data={areas:[{id:'private',label:'Materiais privados',description:'Documentos do perfil autenticado'}],groups:sections.map((label,i)=>({id:'private-'+i,area:'private',label,subtitle:'Materiais vinculados',order:i})),assigned:[]};
  groups=new Map(data.groups.map(g=>[g.id,g]));areas=new Map(data.areas.map(a=>[a.id,a]));
  lookup=new Map(docs.map(p=>[p.id,groups.get('private-'+sections.indexOf(p.section))]));delete byId('pdfFilter').dataset.bm036;return data;
 }`);
 replace("const read=()=>window.BancoMestreDriveV038.openAndEdit(view,p._driveSynced?{forceDrive:true}:{});","const read=()=>window.BMVS41PrivatePdfs.preview(view).catch(e=>{byId('pdfCount').textContent=e.message;});");
 replace("actions.append(button('Ler e editar no site',read,'v036-primary'));","actions.append(button('Ler PDF',read,'v036-primary'));");
 block(" const link=node('a','v036-pdf-link','Abrir no Drive');"," if(p._driveDynamic&&p.filename){"," // O acesso direto ao Drive e o arquivamento ficam desativados neste teste.");
 replace("const off=hidden('PDF'),show=byId('pdfHidden').checked;","const off=new Set(),show=byId('pdfHidden').checked;");
 replace("  oldPdfRender();","  byId('pdfRows').replaceChildren();");
 replace("if(p.id.startsWith('BMPDF-20261112-'))","if(p.card_ids)return 'PDF privado';\n if(p.id.startsWith('BMPDF-20261112-'))");
 return source.slice(0,a)+s+source.slice(b);
}
export function privatePdfSync(source){
 const a=source.indexOf('/* 41 assets/v269_drive_pdf_sync.js */'),b=source.indexOf('/* 42 assets/v218_image_metadata.js */',a);
 if(a<0||b<0)throw Error('Contrato sincronização PDF divergente');
 const old=source.slice(a,b),i=old.indexOf('function ui(){'),j=old.indexOf('function activeToken(){',i);
 if(i<0||j<0)throw Error('Contrato controles PDF divergente');
 const ui=old.slice(i,j);
 const replacement=`/* Experimental private PDF list, no global folder scans. */
 (function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let pending=null,scanning=false,lastResult=null;
 const authorized=()=>window.BMVS41PrivateReviews?.available()===true;
 const status=(message)=>{const e=$('bm-pdf-sync-status');if(e)e.textContent=message;};
 const authorize=()=>void refresh();
 `+ui+`
 async function refresh(){
  if(pending)return pending;scanning=true;
  pending=(async()=>{
   document.documentElement.dataset.bm217PdfVerified='false';
   try{
    const result=await window.BMVS41PrivatePdfs.list();
    docs=result;document.documentElement.dataset.bm217PdfVerified='true';$('pdfStat').textContent=docs.length;
    status('Biblioteca privada confirmada: '+docs.length+' PDFs vinculados.');
    lastResult={count:docs.length};pdfRender();return lastResult;
   }catch(e){docs=[];pdfRender();status(e.message);return null}
   finally{scanning=false;pending=null}
  })();return pending;
 }
 function initialize(){ui();$('bm-pdf-sync-connect').disabled=false;$('bm-pdf-sync-refresh').disabled=false;status('Consulte os PDFs do perfil autenticado.');if(location.hash==='#pdfs')void refresh();}
 window.BancoMestrePDFSyncV130={refresh,get connected(){return authorized()},get lastResult(){return lastResult},topicRecords(){return authorized()&&document.documentElement.dataset.bm217PdfVerified==='true'?docs.slice():null}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
 })();
 ;
 `;
 return source.slice(0,a)+replacement+source.slice(b);
}
