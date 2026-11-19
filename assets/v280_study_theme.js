/* V280: paleta na interface isolada do Controle de Estudos, apenas CSS. */
(function(){'use strict';let count=0;
function add(){const root=document.getElementById('bm240-native-host')?.shadowRoot;
 if(!root)return false;if(root.getElementById('bm280-study-style'))return true;
 const style=document.createElement('style');style.id='bm280-study-style';
 style.textContent=`:host{--bg:#edf0f1;--paper:#fff;--ink:#344551;--accent:#1687d8;--line:#dfe5e8}
 header{background:#343d44!important;color:#eaf2f6!important}
 header h1{color:#eaf2f6!important}
 .panel{border-radius:5px!important;border-color:#e0e6ea!important;box-shadow:none!important}
 #bm252-main-nav button,#bm252-module-nav button{border-radius:4px!important}
 #bm252-main-nav button.active,#bm252-module-nav button.active{background:#1687d8!important;color:#fff!important}
 input,select{border-radius:4px!important;border-color:#cbd7de!important}
 `;root.append(style);return true}
function tick(){if(add()||count++>=45)return;setTimeout(tick,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick,{once:true});else tick();
})();
