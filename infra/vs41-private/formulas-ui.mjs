// Preserve the original formula renderer; replace only the data source.
export function privateFormulas(source){
 const i=source.indexOf('/* 130 assets/v250_formulas_drive.js */'),j=source.indexOf('/* 131 assets/v255_study_three_groups.js */',i);
 if(i<0||j<0)throw Error('Contrato fórmulas divergente');
 let s=source.slice(i,j);
 const replace=(x,y)=>{if(s.split(x).length!==2)throw Error('Contrato fórmulas divergente: '+x.slice(0,100));s=s.replace(x,y)};
 const block=(x,y,v)=>{const a=s.indexOf(x),b=s.indexOf(y,a+x.length);if(a<0||b<0)throw Error('Contrato fórmulas divergente: '+x);s=s.slice(0,a)+v+'\n'+s.slice(b)};
 block("const DOC_ID=","let sections=",`let rawSource='';`);
 block("function token(){","function navActive(){",`function token(){return window.BMVS41Session?.available()?'authenticated':''}
 async function load(force){
  if(inflight)return inflight;
  if(!force&&loaded&&token()){render();return {state:'unchanged'}}
  status('Consultando o guia individual no Drive…','loading');
  inflight=(async()=>{
   await window.BMVS41Session.check();
   const f=await window.BMVS41PrivateFormulas.read();
   if(!f){
    closeFormula();sections=[];rawSource='';loaded=false;loadedAuth='';revision='';sourceVersion='';setFilterOptions();setJumpOptions();render();status('Nenhum guia de fórmulas vinculado a esta conta.','pending');return {state:'empty'};
   }
   if(loaded&&sourceVersion===f.version&&revision===f.modifiedTime&&rawSource===f.text){status('Guia individual atualizado · sem alterações','ok');return {state:'unchanged'}}
   closeFormula();rawSource=f.text;sections=parseDocument(f.text);loadedAuth=token();loaded=true;revision=f.modifiedTime;sourceVersion=f.version;loadedAt=new Date().toLocaleString('pt-BR');
   setFilterOptions();setJumpOptions();render();
   const preview=$('bm246FormulaFrame');if(preview)preview.textContent=rawSource;
   status('Guia individual conferido no Drive · '+new Date(revision).toLocaleString('pt-BR'),'ok');return {state:'downloaded'};
  })().catch(e=>{
   closeFormula();sections=[];rawSource='';loaded=false;loadedAuth='';revision='';sourceVersion='';setFilterOptions();setJumpOptions();render();const p=$('bm246FormulaFrame');if(p)p.textContent='';status('Leitura não confirmada: '+e.message,'error');return {state:'error'};
  }).finally(()=>{inflight=null});return inflight;
 }`);
 replace("O conteúdo é carregado do documento privado somente após autorização Google.","O conteúdo depende do guia vinculado à conta autenticada.");
 replace("Conecte novamente o Drive para abrir a fórmula.","Guia individual ainda não confirmado.");
 replace("source=make('a','action','Documento original');source.href=DOC_URL;source.target='_blank';source.rel='noopener noreferrer';","source=make('button','action','Texto original');source.type='button';source.onclick=()=>{closeFormula();$('bm246ShowPreview').click()};");
 replace("const src=FORMULA_FIGURES[item.number];","const src=null; // Figures from the administrator guide cannot be presumed applicable to another document.");

 replace("'<a id=\"bm246Source\" class=\"action\" target=\"_blank\" rel=\"noopener noreferrer\">Abrir no Drive</a>',","'<span id=\"bm246Source\" class=\"small muted\">Fonte privada da conta</span>',");
 replace("'<div id=\"bm246FormulaPreview\" hidden><p class=\"small muted\">Prévia do Google Docs. Se o navegador bloquear a visualização autenticada, use Abrir no Drive.</p><iframe id=\"bm246FormulaFrame\" title=\"Guia de Fórmulas original no Google Drive\" referrerpolicy=\"no-referrer\" loading=\"lazy\"></iframe></div>',","'<div id=\"bm246FormulaPreview\" hidden><p class=\"small muted\">Texto integral exportado do documento privado, sem alteração.</p><pre id=\"bm246FormulaFrame\" style=\"white-space:pre-wrap;overflow-wrap:anywhere\"></pre></div>',");
 replace(" $('bm246Source').href=DOC_URL;"," $('bm246Connect').hidden=true;");
 replace("  if(!holder.hidden&&!frame.getAttribute('src'))frame.src=DOC_PREVIEW;","  if(!holder.hidden)frame.textContent=rawSource;");
 replace("else status('A conexão Google ainda não está disponível. Use Abrir no Drive.','pending');","else void load(true);");
 replace("const connect=$('bm246Connect');if(connect)connect.hidden=Boolean(token());","const connect=$('bm246Connect');if(connect)connect.hidden=true;");
 replace("Aguardando consulta autorizada ao Drive.","Aguardando consulta ao guia individual.");
 replace("Consulta da versão atual em elaboração no Google Drive","Consulta do documento vinculado ao perfil");
 s=s.replaceAll("Ver original nesta página","Ver texto original");
 // The button text update and initial markup both use the same phrase.

 return source.slice(0,i)+s+source.slice(j);
}
