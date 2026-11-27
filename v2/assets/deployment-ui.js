import {inspectLiveDeployment} from './deployment.js';

const $=id=>document.getElementById(id);
const item=(tag,cls='',text='')=>{
  const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text;return e;
};
function row(title,body,severity='ok'){
  const e=item('div','check '+(severity==='ok'?'ok':severity==='error'?'error':'pending'));
  e.append(item('strong','',title),item('span','',body));
  return e;
}
function mount(){
  const host=$('view-sync');if(!host)return;
  const panel=item('section','panel');
  panel.id='v2DeploymentPanel';
  const heading=item('div','section-heading');
  heading.append(item('h3','','Versão publicada e caminhos'));
  const checkButton=item('button','audit-refresh','Conferir publicação');
  checkButton.type='button';
  heading.append(checkButton);
  const description=item('p','helper',
    'Compara o manifesto público, o redirecionamento da página inicial e a resposta HTTP do HTML indicado. Não modifica a produção.');
  const state=item('p','muted','Ainda não verificado');
  state.id='v2DeploymentStatus';state.setAttribute('role','status');state.setAttribute('aria-live','polite');
  const checks=item('div','checks');checks.id='v2DeploymentChecks';
  panel.append(heading,description,state,checks);
  const auditPanel=$('v2AuditPanel');
  if(auditPanel)host.insertBefore(panel,auditPanel);
  else host.append(panel);
  let request=null;
  async function check(){
    if(request)return request;
    checkButton.disabled=true;
    state.textContent='Conferindo manifesto e arquivo de entrada...';
    request=inspectLiveDeployment();
    try{
      const report=await request;
      state.textContent='Verificado em '+new Date(report.checkedAt).toLocaleString('pt-BR')+' · '+report.version;
      checks.replaceChildren(
        row('Manifesto publicado',report.version+' · arquivo de entrada: '+report.home,report.status==='error'?'error':'ok'),
        row('Navegação pela versão ativa',report.indexUsesManifest?
          'O index consulta assets/version.json.':'Não foi comprovado o redirecionamento via manifesto.',
          report.indexUsesManifest?'ok':'warning'),
        row('Fallback da página inicial','Versão de segurança do index: '+(report.fallbackVersion||'não identificada'),
          report.fallbackVersion===report.version?'ok':'warning'),
        row('Resposta do HTML ativo','HTTP '+(report.homeHttpStatus??'não verificado')+
          '. Isto não valida renderização, OAuth nem conteúdo privado.',
          report.homeHttpStatus===200?'ok':'warning')
      );
      for(const issue of report.issues){
        checks.append(row(issue.code,issue.message,issue.severity));
      }
      if(report.issues.length===0)checks.append(row('Caminhos consistentes','Nenhuma divergência estrutural detectada nesta consulta.'));
    }catch(error){
      state.textContent='Publicação não verificada';
      checks.replaceChildren(row('Erro ao conferir o site',error.message,'error'));
    }finally{checkButton.disabled=false;request=null}
  }
  checkButton.addEventListener('click',()=>{void check()});
  void check();
}
mount();
