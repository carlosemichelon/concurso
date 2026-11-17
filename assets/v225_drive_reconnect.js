/* V225 — uma ação clara para renovar Google Drive.
 * Token OAuth permanece apenas em memória: nunca copiar para localStorage/cookie/GitHub. */
(function(){
'use strict';
if(window.BM225DriveConnection)return;
const $=id=>document.getElementById(id);
let mounted=false;
const core=()=>window.BancoMestreMediaSyncV182;
const driver=()=>window.BancoMestreDriveV042||window.BancoMestreDriveV038;
const connected=()=>Boolean(core()?.token?.());
function update(){
 for(const x of document.querySelectorAll('.bm225-drive-auth')){
  const span=x.querySelector('[data-state]'),button=x.querySelector('button');
  if(!span||!button)continue;
  const yes=connected();
  x.dataset.connected=yes?'yes':'no';
  span.textContent=yes
   ?'Google Drive conectado nesta visita · imagens e PDFs compartilham o acesso'
   :'Google Drive desconectado · os arquivos privados exigem autorização';
  button.hidden=yes;button.disabled=yes;
  button.textContent='Conectar / renovar Drive';
 }
}
function promptForDrive(){
 const d=driver();
 if(d?.ready&&typeof d.authorize==='function'){
  d.authorize();update();return true;
 }
 if(d?.prepare){
  const p=d.prepare();
  Promise.resolve(p).finally(()=>{
   for(const box of document.querySelectorAll('.bm225-drive-auth [data-state]'))
    if(!connected())box.textContent='Google pronto. Clique novamente em Conectar / renovar Drive.';
  });
 }
 return false;
}
function mountTo(panel,position){
 if(!panel||panel.querySelector('.bm225-drive-auth'))return;
 const wrap=document.createElement('div');wrap.className='bm225-drive-auth';
 wrap.setAttribute('aria-label','Conexão de imagens e PDFs');
 const text=document.createElement('span');text.dataset.state='1';text.setAttribute('role','status');
 const button=document.createElement('button');button.type='button';
 button.textContent='Conectar / renovar Drive';button.onclick=promptForDrive;
 wrap.append(text,button);
 const anchor=panel.querySelector(position);
 if(anchor)anchor.before(wrap);else panel.prepend(wrap);
}
function init(){
 if(mounted)return;mounted=true;
 const style=document.createElement('style');
 style.textContent=[
 '.bm225-drive-auth{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;border:1px solid #cadbd9;border-radius:8px;background:#f7faf9;padding:8px 10px;margin:8px 0;font-size:12px;color:#405d61}',
 '.bm225-drive-auth[data-connected="no"]{background:#fffdf9}',
 '.bm225-drive-auth button{font-size:12px;padding:6px 10px;border-radius:7px;min-height:32px}',
 '.bm225-drive-auth button[hidden]{display:none!important}'
 ].join('\n');document.head.append(style);
 mountTo($('cartoes')?.querySelector('.panel'),'.controls');
 mountTo($('imagens')?.querySelector('.panel'),'.controls');
 mountTo($('pdfs')?.querySelector('.panel'),'.controls');
 document.addEventListener('bm-media-drive-authorized',update);
 window.addEventListener('focus',update);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
 setInterval(update,30000);
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BM225DriveConnection=Object.freeze({update,promptForDrive,get connected(){return connected()}});
})();