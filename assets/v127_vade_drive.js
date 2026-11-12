/* Banco Mestre V127 — Vade Mecum atualizado obtido exclusivamente do Google Drive.
   Este módulo não altera PDF original, cartões, SRS, IDs nem marcações existentes.
   Usa o mesmo ID da V040 para preservar o armazenamento local anterior. */
(function(){
'use strict';
const id='VADE-SENADO-2026-GUIA';
const markPrefix='BM030_STROKES_PDF:'+id+':';
const doc={id,title:'Vade Mecum — Senado Federal, 3ª edição (grifos e negritos)',filename:'Vade_Mecum_Senado_3ed_2026_ATUAL_GRIFOS_NEGRITOS_SEM_COMENTARIOS.pdf',url:'https://drive.google.com/file/d/1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI/view',file_id:'1Bl5q1QE-HKk_G3JSfcP2qQWdnFhckzHI'};
const anchor=document.getElementById('pdfAreaNavV036');
if(!anchor||document.getElementById('bmVade041'))return;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const panel=node('section',undefined,'bm-vade');panel.id='bmVade041';
panel.setAttribute('aria-label','Editor online do Vade Mecum');
const title=node('h3','Vade Mecum — editor online');
const info=node('p','PDF de estudo do Senado no Google Drive, com grifos e negritos sem comentários. Abra para estudar diretamente no Banco Mestre; o Drive solicitará autorização quando necessário. A integridade é verificada e o ID de estudo anterior é mantido para preservar os grifos locais.');
const actions=node('div',undefined,'bm-vade-actions');
const open=node('button','Abrir Vade Mecum (Drive)');open.type='button';
const sync=node('button','Sincronizar Vade do Drive','bm-vade-secondary');sync.type='button';
const view=node('a','Ver arquivo atual no Drive','bm-vade-secondary');view.href=doc.url;view.target='_blank';view.rel='noopener noreferrer';
const backup=node('button','Exportar backup dos grifos','bm-vade-secondary');
const restore=node('button','Importar backup dos grifos','bm-vade-secondary');
const input=node('input');input.type='file';input.accept='.json,application/json';input.hidden=true;input.setAttribute('aria-label','Selecionar backup JSON das marcações do Vade Mecum');
const status=node('p','Fonte: Google Drive (arquivo principal atualizado). Clique em Sincronizar para buscar os bytes atuais e substituir a cópia local, preservando os grifos por ID.','bm-vade-status');
status.setAttribute('role','status');status.setAttribute('aria-live','polite');
actions.append(open,sync,view,backup,restore,input);panel.append(title,info,actions,status);anchor.before(panel);
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
async function openLatest(action){
 if(busy)return;
 busy=true;open.disabled=true;sync.disabled=true;
 const beforeOpen=open.textContent,beforeSync=sync.textContent;
 if(action==='sync')sync.textContent='Sincronizando...';else open.textContent='Abrindo do Drive...';
 try{
  const reader=window.BancoMestreDriveV042||window.BancoMestreDriveV038;
  if(!reader?.openAndEdit)throw Error('Conector Google Drive indisponível nesta versão.');
  notify('Buscando o PDF atualizado diretamente do Google Drive; não será usada a cópia do GitHub nem a versão salva no navegador. Autorize o Drive, se solicitado.');
  const opened=await reader.openAndEdit(doc,{forceDrive:true,expectedSha256});
  if(opened===true){
   notify('Sincronização concluída: PDF carregado do Google Drive, hash SHA-256 conferido. Cópia local renovada e grifos anteriores preservados pelo ID de estudo.');
  }else{
   notify(reader.connected?'A abertura não foi concluída. Confira o aviso no editor de PDF; nenhum grifo foi apagado.':'Autorização necessária: no editor clique em “Conectar Drive e editar esta lei”. Depois da autorização, o PDF será baixado do Drive sem usar o GitHub.');
  }
 }catch(e){notify('Não foi possível sincronizar o Vade: '+e.message)}
 finally{busy=false;open.disabled=false;sync.disabled=false;open.textContent=beforeOpen;sync.textContent=beforeSync}
}
open.onclick=()=>{void openLatest('open')};
sync.onclick=()=>{void openLatest('sync')};

backup.onclick=exportMarks;
restore.onclick=()=>input.click();
input.onchange=async()=>{const file=input.files?.[0];input.value='';await importMarks(file)};
window.BancoMestreVadeV127={pdf_id:id,source:'google-drive',source_file_id:doc.file_id,readMarks};
})();