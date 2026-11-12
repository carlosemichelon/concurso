
/* V134 — área Redação sem cabeçalhos ou abas duplicadas. */
(function(){
'use strict';
const section=document.getElementById('redacao'),nav=document.querySelector('header nav');
if(!section||!nav)return;
const title=section.querySelector('h2');if(title)title.textContent='Redação';
const tag=section.querySelector('.tag');if(tag)tag.textContent='OFICINA DE REDAÇÃO';
const intro=section.querySelector('.intro');if(intro)intro.textContent='Banco de temas, escrita guiada e exercícios de redação.';
const bar=section.querySelector('.wr-tabs');if(bar)bar.hidden=true;
const status=section.querySelector('#wr-status');if(status)status.hidden=true;
const pane=document.createElement('div');pane.id='bm134-pane';
const top=document.createElement('div');top.className='bm134-top';
const caption=document.createElement('span');caption.textContent='Temas e Treino';
const open=document.createElement('a');open.href='./redacao_temas_treino_v134.html';open.target='_blank';open.rel='noopener';open.textContent='Abrir em tela inteira';
top.append(caption,open);
const frame=document.createElement('iframe');frame.id='bm134-frame';frame.title='Redação: Temas e Treino';frame.src='./redacao_temas_treino_v134.html?versao=134&embed=1';frame.loading='lazy';
frame.setAttribute('sandbox','allow-forms allow-scripts allow-same-origin allow-downloads allow-modals');frame.setAttribute('allow','clipboard-read; clipboard-write');frame.referrerPolicy='same-origin';
pane.append(top,frame);section.append(pane);
const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='assets/v134_redacao_portal.css?v=134';document.head.append(stylesheet);
function present(){section.querySelectorAll('.wr-sub').forEach(x=>x.hidden=true);if(bar)bar.hidden=true;pane.hidden=false}
const navbutton=nav.querySelector('button[data-page="redacao"]');
if(navbutton){navbutton.textContent='Redação';const previous=navbutton.onclick;navbutton.onclick=function(ev){if(previous)previous.call(this,ev);present()}}
present();window.BancoMestreRedacaoV134={open:present,iframe:frame};
})();
