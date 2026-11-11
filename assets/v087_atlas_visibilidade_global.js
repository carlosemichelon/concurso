/* Banco Mestre V087 — visibilidade global do Atlas, snapshot aprovado de 184 exclusões.
 * Fonte do cálculo: exportação V046 do titular auditada por ID.
 * Este módulo NÃO contém a lista privada completa, nomes ou links do Drive:
 * publica somente os 70 IDs que permanecem ativos dentre IMG-001..IMG-254.
 * Mantém 16 recortes Petrobras 10, estados locais explícitos, originais e grifos. */
(function(){
'use strict';
const ALLOWED_LEGACY=new Set(('001,002,004,005,007,008,010,015,017,024,037,038,039,040,043,044,045,046,047,049,052,053,054,055,056,066,069,070,072,073,075,079,080,085,087,088,089,092,094,095,096,097,098,101,103,104,105,106,107,108,110,111,112,113,114,118,119,130,132,133,135,137,142,143,144,146,147,151,152,155').split(',').map(n=>'IMG-'+n));
if(ALLOWED_LEGACY.size!==70)throw Error('Lista de ativos V087 inválida');
const api=window.BancoMestreImagens;
if(!api||typeof api.all!=='function'||typeof api.setStatus!=='function')throw Error('Motor de visibilidade indisponível');
const allPrevious=api.all.bind(api);
api.all=async function(){
  let stored;
  try{stored=await allPrevious();}catch(e){
    console.warn('V087: não foi possível ler estados locais; usando padrão de visibilidade sem sobrescrever dados',e);
    stored=[];
  }
  const known=new Set(stored.filter(x=>x&&typeof x.id==='string').map(x=>x.id));
  const output=stored.slice();
  for(let n=1;n<=254;n++){
    const id='IMG-'+String(n).padStart(3,'0');
    if(!ALLOWED_LEGACY.has(id)&&!known.has(id))
      output.push({id,status:'hidden',source:'v087-default',temporary:true});
  }
  return output;
};
function notice(){
 const anchor=document.querySelector('#imagens .notice');
 if(!anchor||document.getElementById('bm087-visibility-info'))return;
 const p=document.createElement('p');
 p.id='bm087-visibility-info';
 p.style.cssText='margin:9px 0;padding:9px 12px;border-left:3px solid #748f89;background:#eef5f2;color:#244b45;font-size:13px';
 p.textContent='Visibilidade sincronizada no portal: 184 imagens anteriores ocultas por padrão; 70 imagens legadas e 16 recortes Petrobras 10 preservados. Use “Imagens excluídas” para restaurar qualquer imagem neste navegador. Os originais continuam no Drive.';
 anchor.after(p);
}
window.BancoMestreVisibilityV087=Object.freeze({legacyTotal:254,defaultHidden:184,defaultVisibleLegacy:70,petrobrasPreserved:16,mode:'snapshot-publico-reversivel',changesDrive:false});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',notice,{once:true});else notice();
})();