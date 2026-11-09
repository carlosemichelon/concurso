/* Banco Mestre V041 — editor do Vade Mecum já publicado em 21 partes.
   Este módulo não altera PDF original, cartões, SRS, IDs nem marcações existentes.
   Usa o mesmo ID da V040 para preservar o armazenamento local anterior. */
(function(){
'use strict';
const id='VADE-SENADO-2026-GUIA';
const markPrefix='BM030_STROKES_PDF:'+id+':';
const doc={id,title:'Vade Mecum — arquivo Senado 2026',filename:'vade_senado_2026_original.pdf',url:'https://github.com/carlosemichelon/concurso/tree/gh-pages/assets/pdf',file_id:''};
const anchor=document.getElementById('pdfAreaNavV036');
if(!anchor||document.getElementById('bmVade041'))return;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const panel=node('section',undefined,'bm-vade');panel.id='bmVade041';
panel.setAttribute('aria-label','Editor online do Vade Mecum');
const title=node('h3','Vade Mecum — editor online');
const info=node('p','Abra o PDF que já está no GitHub, marque diretamente nas páginas e volte às mesmas marcações neste navegador. Não é necessário enviar outro arquivo ou configurar OAuth para este documento.');
const actions=node('div',undefined,'bm-vade-actions');
const open=node('button','Abrir e marcar o PDF');
const backup=node('button','Exportar backup dos grifos','bm-vade-secondary');
const restore=node('button','Importar backup dos grifos','bm-vade-secondary');
const input=node('input');input.type='file';input.accept='.json,application/json';input.hidden=true;input.setAttribute('aria-label','Selecionar backup JSON das marcações do Vade Mecum');
const status=node('p','PDF original preservado. Marcações armazenadas apenas neste navegador; exporte backups regularmente.','bm-vade-status');
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
actions.append(open,backup,restore,input);panel.append(title,info,actions,status);anchor.before(panel);
const notify=s=>status.textContent=s;
let busy=false;
const expectedCount=21;
const chunkLength=524288;
const finalLength=449636;
const fileName=n=>'assets/pdf/vade_senado_2026_'+String(n).padStart(2,'0')+'.b64';
function readMarks(){
 const items=[];
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key||!key.startsWith(markPrefix))continue;
   const value=JSON.parse(localStorage.getItem(key)||'null');
   if(Array.isArray(value))items.push({key,marks:value});
  }
 }catch(e){throw Error('Falha ao ler anotações locais: '+e.message)}
 return items.sort((a,b)=>a.key.localeCompare(b.key));
}
async function fetchOriginal(){
 let loaded=0,rawTotal=0;const parts=[];
 for(let start=1;start<=expectedCount;start+=4){
  const batch=Array.from({length:Math.min(4,expectedCount+1-start)},(_,i)=>start+i);
  const block=await Promise.all(batch.map(async index=>{
   const res=await fetch(fileName(index),{cache:'no-store'});
   if(!res.ok)throw Error('Parte '+index+' não disponível (HTTP '+res.status+').');
   const encoded=(await res.text()).replace(/\s+/g,'');
   if(encoded.length!==(index===expectedCount?finalLength:chunkLength))
    throw Error('Parte '+index+' incompleta: tamanho inesperado.');
   if(!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))
    throw Error('Parte '+index+' não está em Base64 válido.');
   let decoded;
   try{decoded=atob(encoded)}catch{throw Error('Parte '+index+' não pôde ser decodificada.')}
   const bytes=new Uint8Array(decoded.length);
   for(let k=0;k<decoded.length;k++)bytes[k]=decoded.charCodeAt(k);
   return bytes;
  }));
  for(const bytes of block){parts.push(bytes);rawTotal+=bytes.byteLength;loaded++}
  notify('Verificando arquivo original: '+loaded+' de '+expectedCount+' partes...');
 }
 if(rawTotal<7000000||rawTotal>15000000)throw Error('Tamanho inesperado do PDF: '+rawTotal+' bytes.');
 if(String.fromCharCode(...parts[0].subarray(0,8)).slice(0,5)!=='%PDF-')
  throw Error('Cabeçalho do PDF inválido.');
 const last=parts[parts.length-1],tail=String.fromCharCode(...last.subarray(Math.max(0,last.length-2048)));
 if(!/startxref\s*\d+\s*%%EOF\s*$/.test(tail))throw Error('Final do PDF ou tabela de referências inválida.');
 const blob=new Blob(parts,{type:'application/pdf'});
 if(blob.size!==rawTotal)throw Error('Não foi possível reconstruir o PDF completo.');
 if(!crypto?.subtle)throw Error('Validação de integridade exige HTTPS ou navegador seguro.');
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()));
 const actual=[...hash].map(x=>x.toString(16).padStart(2,'0')).join('');
 const expected='6eeac7822562b6944ea9c7587b6ecb28a575830a89eeb03861f9e1e7ebed7a39';
 if(actual!==expected)throw Error('SHA-256 do arquivo diverge do PDF original validado; nada será carregado.');
 return blob;
}
function makeDownload(blob,name){
 const u=URL.createObjectURL(blob),a=node('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),30000);
}
function exportMarks(){
 let items;
 try{items=readMarks()}catch(e){notify(e.message);return}
 const data={format:'BancoMestreVadeMarcacoesV041',pdf_id:id,exported_at:new Date().toISOString(),items};
 makeDownload(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'Banco_Mestre_Vade_Marcacoes_Backup_'+new Date().toISOString().slice(0,10)+'.json');
 notify('Backup gerado com '+items.length+' página(s) registrada(s). Nenhum dado foi removido.');
}
async function importMarks(file){
 if(!file)return;
 if(file.size>6000000){notify('Backup acima do limite de 6 MB; nenhum dado foi alterado.');return}
 try{
  const data=JSON.parse(await file.text());
  if(data.format!=='BancoMestreVadeMarcacoesV041'||data.pdf_id!==id||!Array.isArray(data.items)||data.items.length>10000)
   throw Error('Arquivo não corresponde ao formato de backup deste Vade Mecum.');
  const valid=/^BM030_STROKES_PDF:VADE-SENADO-2026-GUIA:[^:]{1,120}:P[1-9]\d{0,5}$/;
  const seen=new Set();
  for(const it of data.items){
   if(!it||typeof it.key!=='string'||!valid.test(it.key)||seen.has(it.key)||!Array.isArray(it.marks)||it.marks.length>10000)
    throw Error('Backup possui chaves repetidas ou marcações inválidas.');
   seen.add(it.key);
  }
  let added=0,already=0,conflicts=0;
  for(const it of data.items){
   const old=localStorage.getItem(it.key);
   if(old!==null){if(old===JSON.stringify(it.marks)||JSON.stringify(JSON.parse(old))===JSON.stringify(it.marks))already++;else conflicts++;continue}
   try{localStorage.setItem(it.key,JSON.stringify(it.marks));added++}
   catch{throw Error('Espaço local insuficiente: '+added+' páginas restauradas; exporte backup antes de continuar.')}
  }
  notify('Importação: '+added+' página(s) nova(s); '+already+' já presentes; '+conflicts+' conflito(s) preservado(s) sem sobrescrever. Feche e reabra o PDF para ver as marcações importadas.');
 }catch(e){notify('Importação interrompida: '+e.message)}
}
open.onclick=async()=>{
 if(busy)return;
 busy=true;open.disabled=true;open.textContent='Abrindo PDF...';
 try{
  const editor=window.BancoMestrePDFV038;
  if(!editor?.openStored||!editor?.openFromDrive)throw Error('O editor de PDF não foi carregado.');
  notify('Verificando se a cópia já está salva no navegador...');
  const recovered=await editor.openStored(doc);
  if(recovered){
   const frame=document.getElementById('pdfFrame');if(frame)frame.src='about:blank';
   const originalLink=document.getElementById('pdfOriginal');if(originalLink)originalLink.hidden=true;
   notify('PDF reaberto a partir da cópia local, com '+readMarks().length+' registro(s) de página(s).');
   return;
  }
  notify('Buscando e conferindo o PDF original no GitHub...');
  const blob=await fetchOriginal();
  await editor.openFromDrive(doc,blob);
  const frame=document.getElementById('pdfFrame');if(frame)frame.src='about:blank';
  const originalLink=document.getElementById('pdfOriginal');if(originalLink)originalLink.hidden=true;
  notify('PDF aberto e renderizado no editor ('+(blob.size/1048576).toFixed(2)+' MB). Desenhe e exporte o PDF anotado; confira se o navegador permite persistência local.');
 }catch(e){notify('Falha ao abrir ou validar PDF: '+e.message)}
 finally{busy=false;open.disabled=false;open.textContent='Abrir e marcar o PDF'}
};
backup.onclick=exportMarks;
restore.onclick=()=>input.click();
input.onchange=async()=>{const file=input.files?.[0];input.value='';await importMarks(file)};
window.BancoMestreVadeV041={pdf_id:id,parts:21,readMarks,fetchOriginal};
})();