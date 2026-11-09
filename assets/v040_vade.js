/* Banco Mestre V040 — Vade Mecum em 21 fragmentos já públicos, leitura sem upload manual.
   Original inalterado; anotações persistem no navegador por ID estável. */
(function(){
'use strict';
const anchor=document.getElementById('pdfAreaNavV036');
if(!anchor||document.getElementById('bmVade040'))return;
const doc={id:'VADE-SENADO-2026-GUIA',title:'Vade Mecum — arquivo Senado 2026',filename:'vade_senado_2026_original.pdf',url:'https://github.com/carlosemichelon/concurso/tree/gh-pages/assets/pdf',file_id:''};
const panel=document.createElement('div');panel.id='bmVade040';panel.className='bm-vade';
const h=document.createElement('h3');h.textContent='Vade Mecum · PDF-guia permanente';
const desc=document.createElement('p');desc.textContent='Arquivo de referência já armazenado no GitHub em 21 partes. Abrir diretamente no editor: grifar, escrever, apagar e guardar marcações na mesma paginação, sem escolher arquivo ou baixar manualmente.';
const button=document.createElement('button');button.type='button';button.textContent='Abrir e marcar Vade Mecum';
const status=document.createElement('small');status.setAttribute('role','status');status.textContent='As marcações permanecem neste navegador; o PDF original não será substituído.';
panel.append(h,desc,button,status);anchor.before(panel);
let busy=false;
const statusSet=s=>status.textContent=s;
async function original(){
 const pieces=[];
 for(let start=1;start<=21;start+=4){
  const batch=Array.from({length:Math.min(4,22-start)},(_,i)=>start+i);
  const loaded=await Promise.all(batch.map(async idx=>{
   const n=String(idx).padStart(2,'0');
   const res=await fetch('assets/pdf/vade_senado_2026_'+n+'.b64',{cache:'force-cache'});
   if(!res.ok)throw Error('Trecho '+n+' não encontrado (HTTP '+res.status+')');
   const base64=(await res.text()).replace(/\s+/g,'');
   const length=idx===21?449636:524288;
   if(base64.length!==length)throw Error('Tamanho inesperado no trecho '+n+'. Nenhum arquivo foi alterado.');
   let bytes;
   try{const s=atob(base64);bytes=new Uint8Array(s.length);for(let i=0;i<s.length;i++)bytes[i]=s.charCodeAt(i)}
   catch{throw Error('Trecho '+n+' não pôde ser decodificado')}
   return bytes;
  }));
  pieces.push(...loaded);
  statusSet('Carregados '+Math.min(start+3,21)+' de 21 trechos · montando a cópia de leitura...');
 }
 if(String.fromCharCode(...pieces[0].subarray(0,5))!=='%PDF-')throw Error('Assinatura do PDF inválida; não abrir documento corrompido');
 const total=pieces.reduce((n,b)=>n+b.byteLength,0);
 if(total<7000000||total>15000000)throw Error('Tamanho final fora do intervalo esperado');
 const last=pieces[pieces.length-1],tail=String.fromCharCode(...last.subarray(Math.max(0,last.length-64)));
 if(!tail.includes('%%EOF'))throw Error('Final do PDF não foi validado');
 return new Blob(pieces,{type:'application/pdf'});
}
button.addEventListener('click',async()=>{
 if(busy)return;
 busy=true;button.disabled=true;button.textContent='Carregando Vade Mecum...';
 try{
  if(!window.BancoMestrePDFV038)throw Error('Editor PDF não disponível');
  if(await window.BancoMestrePDFV038.openStored(doc)){
   statusSet('PDF-guia reaberto com as marcações locais preservadas.');return;
  }
  statusSet('Buscando arquivo de referência existente; sem enviar dados ao GitHub...');
  const blob=await original();
  await window.BancoMestrePDFV038.openFromDrive(doc,blob);
  statusSet('PDF aberto no editor. Marcações automáticas locais; exporte uma cópia anotada para backup.');
 }catch(e){statusSet('Não foi possível abrir o Vade Mecum: '+e.message)}
 finally{busy=false;button.disabled=false;button.textContent='Abrir e marcar Vade Mecum'}
});
window.BancoMestreVadeV040={partes:21,documento:doc.id};
})();