/* V243 / Homologação local de interface. Não altera cartões, SRS ou Drive. */
(function(){
'use strict';
if(window.BM243LacunasSmoke)return;
const $=id=>document.getElementById(id), checks=[];
function add(name,ok,reason=''){checks.push({name,ok:!!ok,reason:String(reason||'')})}
function show(){
 const list=$('bm243-smoke-list'),summary=$('bm243-smoke-summary');if(!list||!summary)return;
 list.replaceChildren();
 for(const c of checks){
  const li=document.createElement('li');li.className=c.ok?'bm243-smoke-ok':'bm243-smoke-fail';
  li.textContent=(c.ok?'PASSOU: ':'FALHOU: ')+c.name+(c.reason?' — '+c.reason:'');list.append(li);
 }
 const failed=checks.filter(x=>!x.ok).length;
 summary.textContent=checks.length+' verificações locais: '+(checks.length-failed)+' aprovadas e '+failed+' com falha. '+(failed?'Não liberar em produção.':'Resultado local favorável; OAuth/segundo dispositivo ainda precisam de teste real.');
}
async function runUI(){
 checks.length=0;
 const api=window.BM242Lacunas,source=window.BM242OperationalCards,reader=window.BancoMestreVisualizarCardV050;
 add('Biblioteca de lacunas está montada',!!$('lacunas')&&!!$('bm242-nav'));
 add('Quatro filtros hierárquicos presentes',['bm242-discipline','bm242-general','bm242-specific','bm242-sub'].every(x=>!!$(x)));
 add('Formulário e campos autorais separados',!!$('bm242-form')&&!!$('bm242-form')?.elements?.relatoEstudante&&!!$('bm242-form')?.elements?.descricao);
 add('Controle de Estudos disponível',!!$('bm238-study-tab')&&!!$('bm238-study-frame'));
 add('Fonte do iframe de estudos preservada',($('bm238-study-frame')?.getAttribute('src')||'').includes('controle-estudos-v242.html'));
 add('Validador de dados de lacunas carregado',typeof api?.validate==='function');
 add('Sincronizador Drive carregado (sem executar)',typeof window.BM242LacunasDrive?.sync==='function');
 add('Rotação de backups diária/mensal conectada ao botão Drive',window.BM243LacunasRetention?.ready===true);
 add('Leitor único com API de consulta carregado',typeof reader?.showId==='function');
 add('Formatador dos 11 módulos carregado',typeof window.BM198Format?.render==='function');
 try{api.validate(api.data);add('Dados locais passam na validação',true)}
 catch(e){add('Dados locais passam na validação',false,e.message)}
 let card=null;
 try{
  card=await source.loadRecord('PETRO14-C014');
  add('Arquivo original PETRO14-C014 carregado',card.id==='PETRO14-C014');
  add('11 módulos completos e em ordem',card.layers.length===11&&card.layers.every((m,i)=>m.ord===i+1&&m.titulo&&m.texto));
  add('Fonte original mantida',card.original_full_source.includes('1lV1VrH_1E5B1SEssNX6dcA102lesL4BI'));
 }catch(e){add('Arquivo original PETRO14-C014 carregado',false,e.message)}
 if(reader?.visible){add('Leitor disponível para testar revelação',false,'Feche o cartão já aberto e execute novamente');show();return}
 if(card&&reader?.showId&&window.BM198Format?.render){
  let opened=false;
  try{
   opened=reader.showId('PETRO14-C014');
   const overlay=$('bmCardPeekV050');
   add('Cartão abre no leitor original',opened&&overlay&&!overlay.hidden&&reader.currentId==='PETRO14-C014');
   const answer=overlay?.querySelector('.bm-v050-peek-answer');
   add('Resposta começa oculta',!!answer&&answer.hidden===true);
   const reveal=overlay?.querySelector('.bm-v050-peek-reveal');
   if(!reveal)throw Error('Controle de revelação não localizado');
   reveal.click();
   for(let attempt=0;attempt<40;attempt++){
    if((answer?.querySelectorAll('.bm198-module').length||0)===11||answer?.querySelector('.bm197-error'))break;
    await new Promise(resolve=>setTimeout(resolve,200));
   }
   const modules=answer?.querySelectorAll('.bm198-module')||[];
   add('Revelação mostra 11 módulos',modules.length===11);
   const last=answer?.querySelector('.bm198-module:last-child');
   const gallery=answer?.querySelector('.bm242-gallery'),admin=answer?.querySelector('.bm198-overview');
   add('Galeria e quadro administrativo aparecem ao final',!!gallery&&!!admin&&
    modules.length===11&&last.compareDocumentPosition(gallery)&Node.DOCUMENT_POSITION_FOLLOWING&&
    gallery.compareDocumentPosition(admin)&Node.DOCUMENT_POSITION_FOLLOWING);
   add('Link para original presente',!!gallery?.querySelector('a[href*="drive.google.com/file/d/1lV1VrH"]'));
  }catch(e){add('Navegação e revelação do cartão',false,e.message)}
  finally{if(opened)reader.close?.()}
 }
 add('Nenhuma gravação/SRS solicitada pelo teste',true,'Teste apenas de consulta; não executou sincronização');
 show();
}
function install(){
 if($('bm243-smoke'))return;
 const target=$('lacunas')?.querySelector('.bm242-shell')||$('lacunas')||document.querySelector('main');
 if(!target)return;
 const panel=document.createElement('details');panel.id='bm243-smoke';panel.className='bm243-smoke';
 const head=document.createElement('summary');head.textContent='Homologação técnica da biblioteca (teste de leitura)';
 const summary=document.createElement('p');summary.id='bm243-smoke-summary';summary.textContent='Execute os testes locais. Não serão gravadas avaliações SRS nem feitas alterações no Drive.';
 const button=document.createElement('button');button.type='button';button.textContent='Executar verificação funcional local';
 button.addEventListener('click',()=>void runUI());
 const list=document.createElement('ol');list.id='bm243-smoke-list';
 const foot=document.createElement('p');foot.textContent='Este diagnóstico não substitui testes autenticados do Google Drive nem a conferência visual em computador e celular.';
 panel.append(head,summary,button,list,foot);target.append(panel);
}
window.BM243LacunasSmoke=Object.freeze({run:runUI,get results(){return checks.slice()}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();