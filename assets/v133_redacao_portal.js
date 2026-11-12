/* V133 — a oficina preserva Temas, Treino e Exercícios de Redação. */
(function(){
'use strict';
const root=document.getElementById('redacao'),tabBar=root?.querySelector('.wr-tabs'),mainNav=document.querySelector('header nav');
if(!root||!tabBar||!mainNav)return;
const tab=document.createElement('button');
tab.type='button';tab.dataset.wrtab='completa';tab.textContent='Redação · Temas e Treino';tab.setAttribute('aria-controls','wr-completa');
tabBar.insertBefore(tab,tabBar.firstChild);
['red','method'].forEach(k=>{const b=tabBar.querySelector('[data-wrtab="'+k+'"]');if(b)b.hidden=true});
const pane=document.createElement('div');pane.id='wr-completa';pane.className='wr-sub';
pane.innerHTML='<div class="wr-full-head"><div><strong>Redação: Temas e Treino</strong><p>Selecione um tema, desenvolva sua redação por etapas FTTD/TEEC ou pratique nos Exercícios de Redação dentro da aba Treino.</p><small>Os exercícios de redação são independentes do SRS. As discursivas técnicas e o histórico do Banco Mestre permanecem separados.</small></div><a href="./redacao_temas_treino_v133.html" target="_blank" rel="noopener">Abrir em tela inteira</a></div><iframe id="bm133-redacao-frame" title="Redação: Temas e Treino com Exercícios de Redação" src="./redacao_temas_treino_v133.html?versao=133" loading="lazy" allow="clipboard-read; clipboard-write" sandbox="allow-forms allow-scripts allow-same-origin allow-downloads allow-modals" referrerpolicy="same-origin"></iframe>';
const first=root.querySelector('#wr-red');if(first)first.parentNode.insertBefore(pane,first);
const style=document.createElement('style');
style.textContent='#redacao #wr-completa[hidden],#redacao .wr-tabs button[hidden]{display:none!important}#redacao .wr-full-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;background:#eff8f6;border:1px solid #d6e7e2;border-radius:10px;padding:12px 14px;margin:12px 0}#redacao .wr-full-head p{margin:3px 0;color:#345960}#redacao .wr-full-head small{color:#536c70}#redacao .wr-full-head a{color:#075e63;font-weight:700;font-size:13px}#redacao #bm133-redacao-frame{width:100%;height:min(78vh,940px);min-height:560px;border:1px solid #c9dcd8;border-radius:10px;background:#f5f8f7;display:block}@media(max-width:680px){#redacao #bm133-redacao-frame{height:77vh;min-height:440px}#redacao .wr-full-head{padding:10px}}';
document.head.append(style);
function openWriting(){
 root.querySelectorAll('.wr-sub').forEach(s=>s.hidden=s!==pane);
 root.querySelectorAll('[data-wrtab]').forEach(b=>{const selected=b===tab;b.classList.toggle('selected',selected);b.setAttribute('aria-selected',String(selected))});
}
tab.addEventListener('click',openWriting);
tabBar.addEventListener('click',ev=>{const b=ev.target.closest('button[data-wrtab]');if(b&&b!==tab)pane.hidden=true},true);
const entry=mainNav.querySelector('button[data-page="redacao"]');
if(entry){const previous=entry.onclick;entry.onclick=function(e){if(previous)previous.call(this,e);openWriting()}}
openWriting();
window.BancoMestreRedacaoV133={open:openWriting,frame:()=>document.getElementById('bm133-redacao-frame')};
})();
