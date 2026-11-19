/* V276 — mesclagem PRIVADA de incrementos de lacunas com proteção contra regressão.
 * Nenhum dado de lacuna é publicado no GitHub ou gravado no Drive sem ação do usuário.
 * Não altera cartões ou SRS. Falhas mantêm a base local intacta.
 */
(function(){
'use strict';
if(window.BM276LacunasImport)return;
const KEY='BM_LACUNAS_V242';
const note='Mescla as lacunas privadas ao cadastro local sem substituir as existentes. Salvar no Drive exige usar Sincronizar com OAuth após conferir.';
function normalize(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function signature(r){return [normalize(r.questaoId),normalize(r.descricao),[...r.cardIds].sort().join(',')].join('|');}
function mount(){
 const root=document.getElementById('lacunas');if(!root||document.getElementById('bm276-import-delta'))return;
 const top=root.querySelector('.bm242-shell')||root;
 const box=document.createElement('div');box.id='bm276-import-delta';box.className='notice';
 const label=document.createElement('label');label.textContent='Mesclar incremento privado de lacunas (arquivo JSON): ';
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','Selecionar incremento privado de lacunas');
 const desc=document.createElement('p');desc.style.fontSize='12px';desc.textContent=note;
 const status=document.createElement('p');status.setAttribute('role','status');status.style.fontSize='12px';
 label.append(input);box.append(label,desc,status);
 top.insertBefore(box,top.firstChild?.nextSibling||null);
 input.addEventListener('change',async()=>{
  const file=input.files?.[0];if(!file)return;status.textContent='Conferindo IDs e histórico…';
  try{
   if(file.size>2_000_000)throw Error('Incremento excede 2 MB.');
   const obj=JSON.parse(await file.text());
   if(obj.format!=='BancoMestreLacunasIncrementalPrivadoV001'||obj.private!==true||!obj.data?.records||!Array.isArray(obj.data.records))throw Error('Arquivo não é incremento privado reconhecido.');
   const api=window.BM242Lacunas;if(!api?.data||!api?.applyRemote||!api?.validate)throw Error('Cadastro Lacunas ainda não inicializado.');
   const before=api.data;api.validate(before);api.validate(obj.data);
   const byId=new Map(before.records.map(r=>[r.id,r]));
   const keys=new Set(before.records.map(signature));const merged=structuredClone(before);let added=0,skipped=0;
   for(const r of obj.data.records){
    const old=byId.get(r.id);
    if(old){if(JSON.stringify(old)!==JSON.stringify(r))throw Error('Conflito no mesmo ID '+r.id+': nenhuma gravação feita.');skipped++;continue}
    if(keys.has(signature(r)))throw Error('Lacuna equivalente já existe sob outro ID: '+r.questaoId+'; conferir manualmente.');
    merged.records.push(structuredClone(r));byId.set(r.id,r);keys.add(signature(r));added++;
   }
   if(!added){status.textContent='Nenhum registro novo; '+skipped+' já presente(s).';return}
   const approval=window.confirm('Mesclar '+added+' lacuna(s) ao cadastro LOCAL? A cópia anterior será preservada. A sincronização com Drive permanece separada.');
   if(!approval){status.textContent='Mesclagem cancelada; nada alterado.';return}
   merged.updatedAt=new Date().toISOString();merged.log.push({id:'BM276-IMPORT-'+Date.now(),at:merged.updatedAt,event:'mesclagem_incremental_privada_por_id',added,skipped,source:'arquivo selecionado pelo usuário'});
   api.validate(merged);api.applyRemote(merged);
   status.textContent=added+' lacuna(s) incorporada(s) localmente; '+skipped+' já presente(s). Use Sincronizar para verificar gravação privada no Drive.';
  }catch(error){status.textContent='Mesclagem bloqueada sem sobrescrita: '+String(error?.message||error)}
  finally{input.value=''}
 });
}
window.BM276LacunasImport=Object.freeze({mount});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();