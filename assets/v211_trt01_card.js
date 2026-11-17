/* Banco Mestre V211 — cartão TRT01-C001 e 5 imagens originais vinculadas.
 * Não altera base pública V194, SRS, permissões do Drive ou bytes dos originais.
 * As prévias vêm de sessão OAuth já consentida e nunca ficam salvas no GitHub. */
(function(){
'use strict';
if(window.BM211TRTCard)return;
const ID='TRT01-C001';
const DATA='assets/trt01_c001_v211.json?v=211';
const API='https://www.googleapis.com/drive/v3/files/';
const originalUrls=[];
const $=id=>document.getElementById(id);
const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let cardData=null,main=null,details=null,loaded=false,inFlight=false;
const photoUrls=[];
function textLink(label,href){
 const a=element('a','bm211-link',label);
 a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function getToken(){
 try{return window.BancoMestreMediaSyncV182?.token?.()||'';}catch(_){return '';}
}
function validFile(file){return file&&/^[A-Za-z0-9_-]{15,}$/.test(file.file_id||'');}
function buildGallery(images){
 const zone=element('section','bm211-media');
 const head=element('div','bm211-mediahead');
 head.append(element('h4','', 'cinco imagens originais incorporadas ao cartão'));
 const button=element('button','bm211-fetch','carregar imagens do google drive');
 button.type='button';
 const status=element('p','bm211-status','as prévias privadas exigem conexão google drive; os links de cada original funcionam na conta proprietária.');
 head.append(button,status);zone.append(head);
 const grid=element('div','bm211-grid');
 const targets=[];
 images.forEach((item,i)=>{
  const figure=element('figure','bm211-figure');
  const frame=element('div','bm211-frame');
  const placeholder=element('div','bm211-placeholder','imagem '+(i+1)+' · clique em carregar imagens');
  const img=element('img','bm211-image');img.loading='lazy';img.alt='imagem original '+(i+1)+': '+item.title;img.hidden=true;
  frame.append(placeholder,img);
  const caption=element('figcaption','bm211-figcaption');
  caption.append(element('strong','',String(i+1).padStart(2,'0')+' — '+item.title));
  caption.append(element('small','',item.id+' · imagem de cartão · original preservado'));
  if(validFile(item)){
   caption.append(textLink('abrir original no drive',item.drive_url));
  }
  figure.append(frame,caption);grid.append(figure);targets.push({item,img,placeholder});
 });
 zone.append(grid);
 async function load(){
  const token=getToken();
  if(!token){status.textContent='conecte o google drive na aba imagens e clique novamente para exibir as cinco imagens aqui.';return;}
  if(inFlight)return;inFlight=true;button.disabled=true;status.textContent='carregando os originais privados sem modificar os arquivos...';
  const results=await Promise.all(targets.map(async ({item,img,placeholder})=>{
   if(!validFile(item))return false;
   if(img.dataset.loaded==='1')return true;
   try{
    const resp=await fetch(API+encodeURIComponent(item.file_id)+'?alt=media',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(!resp.ok)throw Error('http '+resp.status);
    const blob=await resp.blob();
    if(blob.size>10*1024*1024||!(blob.type==='image/png'||blob.type==='application/octet-stream'))throw Error('conteúdo não é imagem png válida');
    const url=URL.createObjectURL(new Blob([blob],{type:'image/png'}));
    photoUrls.push(url);img.src=url;img.hidden=false;img.dataset.loaded='1';placeholder.hidden=true;return true;
   }catch(e){placeholder.textContent='prévia indisponível ('+String(e.message||e)+'). abra o original pelo link.';return false;}
  }));
  const n=results.filter(Boolean).length;
  status.textContent=n===images.length?'cinco imagens carregadas do drive autorizado; originais e grifos preservados.':n+' de '+images.length+' imagens carregadas; verifique a conexão e os links dos originais.';
  button.disabled=false;inFlight=false;
 }
 button.addEventListener('click',()=>{void load();});
 zone.addEventListener('bm211-card-open',()=>{if(getToken())void load();});
 return zone;
}
function fallbackModules(host,layers){
 for(const item of layers){const section=element('section','bm211-module');
  section.append(element('h4','',String(item.ord).padStart(2,'0')+' — '+item.titulo));
  const txt=element('div','bm211-plain',item.texto);section.append(txt);host.append(section);
 }
}
function renderLayers(target,data){
 if(window.BM198Format?.render){
  try{window.BM198Format.render(target,{layers:data.layers},data.id);return;}
  catch(err){target.replaceChildren();console.warn('V211: módulo evolutivo indisponível; exibindo conteúdo original',err);}
 }
 fallbackModules(target,data.layers);
}
function draw(data){
 const panel=document.querySelector('#cartoes .panel');
 if(!panel)return;
 if($('bm211-trt-card'))return;
 cardData=data;
 main=element('section','bm211-card');main.id='bm211-trt-card';
 const bar=element('div','bm211-kicker','TRT · estudo operacional · '+data.id+' · '+data.images.length+' imagens vinculadas');
 details=element('details','bm211-details');details.id='bm211-trt-details';
 const summary=element('summary','bm211-summary');
 summary.append(element('strong','',data.front),element('small','', 'ver cartão completo — 11 módulos, lei seca e imagens originais'));
 details.append(summary);
 const body=element('div','bm211-body');
 const answer=element('div','bm211-answer');answer.append(
  element('div','bm211-meta','questão '+data.question_id+' · resposta do aluno: alternativa a · correta'),
  element('p','bm211-core',data.back),
  element('p','bm211-preserve','cartão operacional separado da base canônica; abrir este cartão não lança revisão srs.')
 );body.append(answer);
 const layers=element('div','bm211-layers');body.append(layers);details.append(body);
 details.addEventListener('toggle',()=>{
  if(!details.open)return;
  if(!loaded){
   renderLayers(layers,data);
   const gallery=buildGallery(data.images);
   const modules=layers.querySelectorAll('.bm198-module,.bm211-module');
   if(modules[5])modules[5].after(gallery);
   else layers.append(gallery);
   loaded=true;
  }
  const gallery=layers.querySelector('.bm211-media');
  if(gallery)gallery.dispatchEvent(new Event('bm211-card-open'));
 });
 main.append(bar,details);
 const before=$('cardRows')||panel.querySelector('.controls');
 panel.insertBefore(main,before);
 if(location.hash==='#trt01-c001'||new URLSearchParams(location.search).get('cartao')===ID){
  const btn=document.querySelector('nav button[data-page="cartoes"]');if(btn)btn.click();
  details.open=true;
  setTimeout(()=>main.scrollIntoView({behavior:'smooth',block:'start'}),500);
 }
}
function openCard(){
 if(!main)return false;
 const nav=document.querySelector('nav button[data-page="cartoes"]');
 if(nav)nav.click();else if($('cartoes'))$('cartoes').hidden=false;
 details.open=true;
 main.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
function attachReverse(){
 const grid=$('bm084-grid');if(!grid||!main)return;
 const cards=grid.querySelectorAll('article');
 for(const c of cards){
  const title=c.querySelector('h4')?.textContent||'';
  if(!/^TRT01-Q001-IMG0[1-5]-/.test(title))continue;
  if(c.querySelector('.bm211-to-card'))continue;
  const actions=[...c.querySelectorAll('div')].find(d=>d.querySelector('a[href*="drive.google.com"]'));
  if(!actions)continue;
  const b=element('button','bm211-to-card','mostrar cartão trt');
  b.type='button';b.addEventListener('click',openCard);actions.append(b);
 }
}
window.BM211TRTCard=Object.freeze({id:ID,get ready(){return Boolean(main)},open:openCard,get mediaCount(){return cardData?.images?.length||0},refresh:attachReverse});
document.addEventListener('bm209-drive-render',attachReverse);
window.addEventListener('beforeunload',()=>photoUrls.forEach(x=>URL.revokeObjectURL(x)),{once:true});
async function init(){
 try{
  const resp=await fetch(DATA,{cache:'no-store'});if(!resp.ok)throw Error('arquivo do cartão indisponível ('+resp.status+')');
  const obj=await resp.json();
  if(obj.id!==ID||!Array.isArray(obj.layers)||obj.layers.length!==11||!Array.isArray(obj.images)||obj.images.length!==5)throw Error('estrutura do cartão inválida');
  draw(obj);attachReverse();
 }catch(err){console.error('V211: cartão TRT não carregado',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init()},{once:true});else void init();
})();
