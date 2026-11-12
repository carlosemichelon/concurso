/* Banco Mestre V044 — Vade Mecum lido do Google Drive (sem usar as 21 partes do GitHub).
   Este módulo não altera PDF original, cartões, SRS, IDs nem marcações existentes.
   Usa o mesmo ID da V040 para preservar o armazenamento local anterior. */
(function(){
'use strict';
const id='VADE-SENADO-2026-GUIA';
const markPrefix='BM030_STROKES_PDF:'+id+':';
const doc={id,title:'Vade Mecum — Senado Federal, 3ª edição (grifos e negritos)',filename:'Vade_Mecum_Senado_3ed_2026_GRIFOS_NEGRITOS_SEM_COMENTARIOS.pdf',url:'https://drive.google.com/file/d/15rnaSCmGCHvA8dSVklEYbpMQ-HMt_h5_/view',file_id:'15rnaSCmGCHvA8dSVklEYbpMQ-HMt_h5_'};
const anchor=document.getElementById('pdfAreaNavV036');
if(!anchor||document.getElementById('bmVade041'))return;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const panel=node('section',undefined,'bm-vade');panel.id='bmVade041';
panel.setAttribute('aria-label','Editor online do Vade Mecum');
const title=node('h3','Vade Mecum — editor online');
const info=node('p','PDF de estudo do Senado no Google Drive, com grifos e negritos sem comentários. Abra para estudar diretamente no Banco Mestre; o Drive solicitará autorização quando necessário. A integridade é verificada e o ID de estudo anterior é mantido para preservar os grifos locais.');
const actions=node('div',undefined,'bm-vade-actions');
const open=node('button','Abrir e marcar o PDF');
const backup=node('button','Exportar backup dos grifos','bm-vade-secondary');
const restore=node('button','Importar backup dos grifos','bm-vade-secondary');
const input=node('input');input.type='file';input.accept='.json,application/json';input.hidden=true;input.setAttribute('aria-label','Selecionar backup JSON das marcações do Vade Mecum');
const status=node('p','A versão original permanece no Drive. Marcações locais preservadas; exporte backups regularmente.','bm-vade-status');
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
actions.append(open,backup,restore,input);panel.append(title,info,actions,status);anchor.before(panel);
const notify=s=>status.textContent=s;
let busy=false;
// PDF fonte obrigatório: Drive. A versão histórica em GitHub não é consultada.
const expectedSha256='2c836a11dcdae84e62e3e4cac8e449de760f82d9acd13278da50c5634f296a90';
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
 busy=true;open.disabled=true;open.textContent='Abrindo no Google Drive...';
 try{
  const reader=window.BancoMestreDriveV042||window.BancoMestreDriveV038;
  if(!reader?.openAndEdit)throw Error('Conector Google Drive indisponível nesta versão.');
  notify('Abertura exclusiva pelo Google Drive. Autorize a leitura se o navegador solicitar.');
  const opened=await reader.openAndEdit(doc,{forceDrive:true,expectedSha256});
  if(opened===true){
   notify('Vade aberto a partir do Google Drive; integridade verificada. Marcações antigas preservadas pelo ID original.');
  }else{
   notify('Se o PDF estiver em pré-visualização, clique em “Conectar Drive e editar esta lei” para autorizar a abertura. O arquivo do GitHub não será utilizado.');
  }
 }catch(e){notify('Não foi possível abrir do Drive: '+e.message)}
 finally{busy=false;open.disabled=false;open.textContent='Abrir e marcar o PDF'}
};

backup.onclick=exportMarks;
restore.onclick=()=>input.click();
input.onchange=async()=>{const file=input.files?.[0];input.value='';await importMarks(file)};
window.BancoMestreVadeV044={pdf_id:id,source:'google-drive',source_file_id:doc.file_id,readMarks};
})();