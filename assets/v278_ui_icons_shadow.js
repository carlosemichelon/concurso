/* V278 — mesma folha CSS no Controle isolado; sem alterar dados. */
(function(){'use strict';const id='bm278-light-icons-shadow';let n=0;
function apply(){const root=document.getElementById('bm240-native-host')?.shadowRoot;if(!root)return false;
if(!root.getElementById(id)){const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href='assets/v278_ui_icons.css?v=278-1';root.appendChild(link)}return true}
function retry(){if(apply()||n++>=36)return;setTimeout(retry,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});else retry()})();
