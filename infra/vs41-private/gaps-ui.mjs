// Preserve the original gap registration, filters and study reader; swap storage and sync only.
export function privateGaps(source){
 const a=source.indexOf('/* 120 assets/v242_lacunas.js */'),b=source.indexOf('/* 121 assets/v276_lacunas_delta_import.js */',a);
 if(a<0||b<0)throw Error('Contrato lacunas divergente');
 let s=source.slice(a,b);
 const replace=(x,y)=>{if(s.split(x).length!==2)throw Error('Contrato lacunas divergente: '+x.slice(0,100));s=s.replace(x,y)};
 function block(x,y,v){const i=s.indexOf(x),j=s.indexOf(y,i+x.length);if(i<0||j<0)throw Error('Contrato lacunas divergente: '+x);s=s.slice(0,i)+v+'\n'+s.slice(j)}
 block('function load(){','function cards(raw){',`let data=null,persisted=null,revisions=Object.create(null),syncState='Consultando cadastro privado',busy=false,refreshing=null,lastResult=null;
 function accept(p){
  validate(p.data);if(!p.revisions||p.data.records.some(r=>!Object.hasOwn(p.revisions,r.id)||typeof p.revisions[r.id]!=='string'))throw Error('Revisões inválidas');
  data=structuredClone(p.data);persisted=JSON.stringify(data);revisions={...p.revisions};bm430GapVerified=true;
  syncState='Lacunas privadas conferidas no Drive';lastResult={state:'downloaded',message:syncState};render();
 }
 async function sync(){
  if(busy)return {state:'busy',message:'Aguarde a gravação'};
  if(refreshing)return refreshing;
  refreshing=(async()=>{try{accept(await window.BMVS41PrivateGaps.read());return lastResult}
   catch(e){data=null;persisted=null;revisions=Object.create(null);bm430GapVerified=false;lastResult={state:'error',message:e.message};syncState=e.message;render();return lastResult}
   finally{refreshing=null}})();return refreshing;
 }
 async function write(event,r){
  if(!data||!persisted||busy||refreshing||!bm430GapVerified){if(persisted)data=JSON.parse(persisted);throw Error('Cadastro privado não confirmado ou ocupado')}
  const record=structuredClone(r),previous=revisions[r.id]||null,event_id=crypto.randomUUID();
  // Keep the visible list on the last confirmed revision until the server acknowledges the write.
  data=JSON.parse(persisted);busy=true;syncState='Gravando lacuna privada…';render();
  try{
   const p=await window.BMVS41PrivateGaps.save({event_id,previous,event,record});
   if(p.revision!==event_id||p.record?.id!==record.id||!p.at)throw Error('Confirmação divergente');
   const idx=data.records.findIndex(x=>x.id===record.id);
   if(idx<0)data.records.push(p.record);else data.records[idx]=p.record;
   data.log.push({id:event_id,at:p.at,event,lacunaId:record.id});data.updatedAt=p.at;revisions[record.id]=p.revision;
   validate(data);persisted=JSON.stringify(data);syncState='Lacunas privadas conferidas no Drive';
   document.dispatchEvent(new CustomEvent('bm-vs41-gap-confirmed',{detail:{id:record.id,event}}));
  }catch(e){data=JSON.parse(persisted);bm430GapVerified=false;lastResult={state:'error',message:e.message};syncState='Gravação não confirmada: '+e.message;throw e}
  finally{busy=false;render()}
 }
 function applyRemote(){throw Error('Importação histórica ainda não homologada para perfis privados')}
 window.BM242LacunasDrive=Object.freeze({sync,get lastResult(){return lastResult}});
 `);
 replace("Salvar lacuna localmente","Salvar lacuna");
 replace("Sincronização privada somente após autorização e confirmação pelo botão único do Drive. Dados pessoais não vão ao GitHub.","Dados privados gravados na conta autenticada. Dados pessoais não vão ao GitHub.");
 replace("button.onclick=()=>{if(typeof window.section","button.onclick=()=>{void sync();if(typeof window.section");
 replace("$('bm242-form').addEventListener('submit',e=>{","$('bm242-form').addEventListener('submit',async e=>{");
 replace("if(!data)throw Error('Cadastro indisponível');","if(!data||busy||refreshing||!bm430GapVerified)throw Error('Cadastro indisponível ou ocupado');");
 replace("data.records.push(r);write('lacuna_criada',r);","data.records.push(r);await write('lacuna_criada',r);");
 replace(" gravada no navegador; sincronização Drive não presumida"," gravada e conferida no Drive");
 replace("$('bm242-list').addEventListener('click',e=>{","$('bm242-list').addEventListener('click',async e=>{\n if(busy||refreshing||!bm430GapVerified)return;\n try{");
 replace("write('relato_ou_complemento_adicionado',r);return;","await write('relato_ou_complemento_adicionado',r);return;");
 replace("write('complemento_adicionado',r);return;","await write('complemento_adicionado',r);return;");
 replace("write('etapa_atualizada',r);\n });","await write('etapa_atualizada',r);\n }catch(err){$('bm242-form-msg').textContent=err.message}\n });");
 block(" $('bm242-import').onchange=async e=>{"," document.addEventListener('bm242-open-lacuna'",` $('bm242-import').disabled=true;$('bm242-import').title='Importação histórica ainda não homologada para perfis privados';
 new MutationObserver(()=>{if(section.classList.contains('active')){if(!bm430GapVerified&&!refreshing&&!busy)void sync();render()}}).observe(section,{attributes:true,attributeFilter:['class']});
 `);
 replace("const ready=bm430GapVerified||['uploaded','downloaded','unchanged','empty'].includes(window.BM242LacunasDrive?.lastResult?.state);","const ready=bm430GapVerified&&!!data;");
 replace("$('bm242-state').textContent='Sincronize o Drive para consultar as lacunas.';","$('bm242-state').textContent=syncState;");
 replace(" $('bm242-state').textContent=data?syncState:"," $('bm242-form').querySelector('button[type=submit]').disabled=busy||refreshing!==null;\n $('bm242-state').textContent=data?syncState:");
 // Drop only the legacy global import/sync/retention blocks in the isolated bundle.
 return source.slice(0,a)+s;
}
