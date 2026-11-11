/* V119 — a V024 H14 é carregada dos JSON públicos do GitHub.
   Sem Google OAuth para cartões. PDFs e grifos mantêm suas próprias conexões.
   Dados SRS e histórico pessoal não fazem parte dos JSON públicos. */
(function(){
 'use strict';
 if(window.BancoMestreStaticCardsV119)return;
 const $=id=>document.getElementById(id);
 function init(){
  const cards=$('cartoes')?.querySelector('.panel');
  const home=$('assuntos')?.querySelector('.panel');
  if(!cards||!home)return;
  const old=cards.querySelector('#bm-v075-sync');
  if(old)old.remove(); // não inicializado na V119; proteção contra módulo legado
  const oldHome=home.querySelector('#bm-v116-home-sync, #bm-v114-home-sync');
  if(oldHome)oldHome.remove();
  if(!$('bm119PublicSource')){
    const info=document.createElement('div');
    info.id='bm119PublicSource';
    info.setAttribute('role','status');
    info.textContent='Base V024 H14 no GitHub · 1.482 ativos / 1.499 IDs · consulta sem conectar o Drive';
    cards.insertBefore(info,cards.querySelector('.controls')||cards.firstChild);
  }
  if(!$('bm119HomeSource')){
    const info=document.createElement('div');
    info.id='bm119HomeSource';
    info.setAttribute('role','status');
    info.textContent='Base Técnica V024 H14 publicada · 1.482 cartões ativos · carregamento automático';
    home.insertBefore(info,home.querySelector('#areaRows')||home.firstChild);
  }
  const controls=cards.querySelector('.controls');
  if(controls&&!$('bm119ShowInactive')){
    const label=document.createElement('label');
    label.className='checkbox';label.id='bm119InactiveLabel';
    const input=document.createElement('input');input.type='checkbox';input.id='bm119ShowInactive';
    label.append(input,document.createTextNode('Mostrar 17 inativos (arquivo)'));
    controls.append(label);
    input.addEventListener('change',()=>{if(typeof cardRender==='function')cardRender();});
  }
  const counter=document.querySelector('.stats .stat:nth-child(2) b');
  if(counter)counter.textContent='1.482 ativos / 1.499 IDs + 22 Ijuí';
  if(typeof cardRender==='function')cardRender();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.BancoMestreStaticCardsV119=Object.freeze({refresh:init,version:'V024 H14',total:1499,active:1482,inactive:17});
})();