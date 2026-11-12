/* Banco Mestre V132: restauração integral da oficina de redação original */
(function(){
'use strict';
const root=document.getElementById('redacao');
const tabBar=root?.querySelector('.wr-tabs');
const mainNav=document.querySelector('header nav');
if(!root||!tabBar||!mainNav)return;
const tab=document.createElement('button');
tab.type='button';tab.dataset.wrtab='completa';tab.textContent='Oficina completa · 10 ferramentas';tab.setAttribute('aria-controls','wr-completa');
tabBar.insertBefore(tab,tabBar.firstChild);
const pane=document.createElement('div');pane.id='wr-completa';pane.className='wr-sub';pane.hidden=false;
pane.innerHTML='<div class="wr-full-head"><div><strong>Treinador original restaurado</strong><p>FTTD · Argumentos · Raio-X · Cirurgia · Checklist · Temas · Treino guiado · Tutor IA · Flashcards de redação · Mapa mental e conectivos.</p><small>A oficina mantém o acervo histórico e usa dados próprios; não altera o SRS ou as discursivas do Banco Mestre.</small></div><a href="./redacao_completa_v132.html" target="_blank" rel="noopener">Abrir oficina em tela inteira</a></div><iframe id="bm132-redacao-frame" title="Treinador completo de Redação — dez ferramentas" src="./redacao_completa_v132.html?versao=132" loading="lazy" allow="clipboard-read; clipboard-write" sandbox="allow-forms allow-scripts allow-same-origin allow-downloads allow-modals" referrerpolicy="same-origin"></iframe>';
const first=root.querySelector('#wr-red');first?.parentNode.insertBefore(pane,first);
const style=document.createElement('style');
style.textContent='#redacao #wr-completa[hidden]{display:none!important}#redacao .wr-full-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;background:#eff8f6;border:1px solid #d6e7e2;border-radius:10px;padding:12px 14px;margin:12px 0}#redacao .wr-full-head p{margin:3px 0;color:#345960}#redacao .wr-full-head small{color:#536c70}#redacao .wr-full-head a{color:#075e63;font-weight:700;font-size:13px}#redacao #bm132-redacao-frame{width:100%;height:min(78vh,940px);min-height:560px;border:1px solid #c9dcd8;border-radius:10px;background:#f5f8f7;display:block}@media(max-width:680px){#redacao #bm132-redacao-frame{height:77vh;min-height:440px}#redacao .wr-full-head{padding:10px}}';
document.head.append(style);
function setFull(){
root.querySelectorAll('.wr-sub').forEach(s=>s.hidden=s!==pane);
root.querySelectorAll('[data-wrtab]').forEach(b=>{const on=b===tab;b.classList.toggle('selected',on);b.setAttribute('aria-selected',String(on))});
}
tab.addEventListener('click',setFull);
tabBar.addEventListener('click',ev=>{const btn=ev.target.closest('button[data-wrtab]');if(btn&&btn!==tab)pane.hidden=true},true);
const entry=mainNav.querySelector('button[data-page="redacao"]');
if(entry){const previous=entry.onclick;entry.onclick=function(e){if(previous)previous.call(this,e);setFull()}}
if(location.hash==='#redacao')setFull();
setFull();
window.BancoMestreRedacaoCompletaV132={open:setFull,frame:()=>document.getElementById('bm132-redacao-frame')};
})();
