/* Banco Mestre V122 — caneta, marca-texto, borracha e escrita por cartão.
   Camada pessoal do navegador: não altera perguntas, respostas, IDs, nem SRS. */
(function(){
 'use strict';
 if(window.BancoMestreCardInkV122)return;
 const root=document.getElementById('cardRows');
 if(!root)return;
 const KEY='BM122_CARD_INK:';
 const cardId=article=>article?.querySelector(':scope > .tag')?.textContent?.trim()||'';
 const valid=id=>/^(?:CARD-\d{4,5}|PROP-IJUI-[A-Za-z0-9_-]+)$/.test(id);
 const node=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x};
 const button=(text,fn,cls)=>{const b=node('button',text,cls);b.type='button';b.addEventListener('click',fn);return b};
 const overlay=node('div',undefined,'bm122-ink-overlay');overlay.id='bm122CardInk';overlay.hidden=true;
 const backdrop=node('div',undefined,'bm122-ink-backdrop');
 const dialog=node('section',undefined,'bm122-ink-dialog');
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Anotar flashcard');dialog.tabIndex=-1;
 const top=node('div',undefined,'bm122-ink-head');
 const name=node('strong','Anotações do cartão');
 const close=button('✕ Fechar',()=>hide());
 top.append(name,close);
 const guide=node('p','Grife, risque ou escreva sobre a frente ou o verso. Os traços e a nota ficam salvos neste navegador; a base original e o SRS não mudam.','bm122-ink-hint');
 const sides=node('div',undefined,'bm122-ink-sides');
 const frontButton=button('Frente',()=>sideChange('front'),'bm122-ink-side');
 const backButton=button('Verso',()=>sideChange('back'),'bm122-ink-side');
 sides.append(frontButton,backButton);
 const tools=node('div',undefined,'bm122-ink-tools');
 const modes=[['read','Ler / selecionar'],['pen','Caneta'],['highlight','Marca-texto'],['erase','Borracha']];
 let mode='pen',side='front',id='',data=null,working=null,returnFocus=null,persistDelay=null;
 const toolButtons=new Map();
 for(const [value,label] of modes){
  const control=button(label,()=>modeChange(value),'bm122-ink-tool');
  control.dataset.tool=value;toolButtons.set(value,control);tools.append(control);
 }
 const colorLabel=node('label','Cor: ');
 const color=document.createElement('input');color.type='color';color.value='#FFE066';color.setAttribute('aria-label','Cor do traço');
 colorLabel.append(color);
 const sizeLabel=node('label','Espessura: ');
 const size=document.createElement('input');size.type='range';size.min='2';size.max='28';size.value='7';size.step='1';
 size.setAttribute('aria-label','Espessura do traço');sizeLabel.append(size);
 const undo=button('↶ Desfazer traço',()=>{
  if(!data)return;
  if(data[side].length){data[side].pop();save();paint()}
 });
 const clear=button('Limpar este lado',()=>{
  if(!data||!data[side].length)return;
  if(!confirm('Apagar apenas os traços da '+(side==='front'?'frente':'resposta')+' deste cartão? A nota escrita será preservada.'))return;
  data[side]=[];save();paint();
 });
 tools.append(colorLabel,sizeLabel,undo,clear);
 const sheet=node('div',undefined,'bm122-ink-sheet');
 const sheetText=node('div',undefined,'bm122-ink-sheet-text');
 const sheetCaption=node('small',undefined,'bm122-ink-sheet-caption');
 const question=node('p',undefined,'bm122-ink-question');
 sheetText.append(sheetCaption,question);
 const canvas=document.createElement('canvas');canvas.className='bm122-ink-canvas';canvas.setAttribute('aria-label','Área de desenho do flashcard');
 sheet.append(sheetText,canvas);
 const notesLabel=node('label','Anotações escritas (salvas neste cartão)','bm122-ink-notes-label');
 const notes=document.createElement('textarea');notes.rows=4;notes.maxLength=18000;notes.placeholder='Digite sua resposta, dúvida, macete ou observações sobre este cartão.';
 notesLabel.append(notes);
 const bottom=node('div',undefined,'bm122-ink-bottom');
 const saveState=node('span','As alterações são salvas automaticamente.');saveState.setAttribute('role','status');
 const saveBtn=button('Salvar agora',()=>save());
 bottom.append(saveState,saveBtn);
 dialog.append(top,guide,sides,tools,sheet,notesLabel,bottom);overlay.append(backdrop,dialog);document.body.append(overlay);
 let previousBodyOverflow='';
 function fresh(){return {version:1,front:[],back:[],note:'',updated_at:''}}
 function read(id){
  try{
   const x=JSON.parse(localStorage.getItem(KEY+id)||'null');
   if(!x||x.version!==1||!Array.isArray(x.front)||!Array.isArray(x.back)||typeof x.note!=='string')return fresh();
   const filter=arr=>arr.filter(s=>s&&['pen','highlight'].includes(s.kind)&&
    /^#[0-9a-f]{6}$/i.test(s.color||'')&&Array.isArray(s.points)&&s.points.length<=2500)
    .slice(-600);
   return {...x,front:filter(x.front),back:filter(x.back),note:x.note.slice(0,18000)};
  }catch{return fresh()}
 }
 function save(){
  if(!data||!id)return;
  if(persistDelay){clearTimeout(persistDelay);persistDelay=null}
  data.note=notes.value.slice(0,18000);data.updated_at=new Date().toISOString();
  try{localStorage.setItem(KEY+id,JSON.stringify(data));saveState.textContent='Salvo neste navegador · '+new Date().toLocaleTimeString('pt-BR')}
  catch(e){saveState.textContent='Não foi possível salvar: '+e.message}
 }
 function scheduleSave(){if(persistDelay)clearTimeout(persistDelay);persistDelay=setTimeout(save,450)}
 function rect(){return canvas.getBoundingClientRect()}
 function dimensions(){return {w:Math.max(1,canvas.clientWidth),h:Math.max(1,canvas.clientHeight)}}
 function point(e){const r=rect();return [
  Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),
  Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)))
 ]}
 function drawStroke(ctx,stroke,w,h){
  const pts=stroke.points||[];if(!pts.length)return;
  ctx.save();ctx.globalAlpha=stroke.kind==='highlight'?.27:1;
  ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;
  ctx.lineWidth=Math.max(1,Number(stroke.width)||5)*(w/650);
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(pts[0][0]*w,pts[0][1]*h);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]*w,pts[i][1]*h);
  if(pts.length===1)ctx.lineTo(pts[0][0]*w+.1,pts[0][1]*h+.1);
  ctx.stroke();ctx.restore();
 }
 function paint(){
  const {w,h}=dimensions(),dpr=Math.min(3,window.devicePixelRatio||1);
  const width=Math.ceil(w*dpr),height=Math.ceil(h*dpr);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  for(const s of data?.[side]||[])drawStroke(ctx,s,w,h);
 }
 function modeChange(next){
  mode=next;
  for(const [k,b] of toolButtons)b.setAttribute('aria-pressed',String(k===mode));
  canvas.style.pointerEvents=mode==='read'?'none':'auto';
  canvas.style.touchAction=mode==='read'?'auto':'none';
  canvas.style.cursor=mode==='erase'?'cell':mode==='read'?'auto':'crosshair';
  guide.textContent=mode==='read'?'Modo leitura: selecione o texto do cartão sem desenhar.':'Use mouse, dedo ou caneta digital para '+(mode==='erase'?'apagar um traço':'grifar ou escrever')+'. As alterações são salvas automaticamente.';
 }
 function sideChange(next){
  if(!data)return;
  if(working){working=null;save()}
  side=next;sheetCaption.textContent=next==='front'?'FRENTE — PERGUNTA':'VERSO — RESPOSTA';
  const c=(typeof cards!=='undefined'&&Array.isArray(cards))?cards.find(x=>x.id===id):null;
  question.textContent=next==='front'?(c?.front||'Sem pergunta'):(c?.back||'Sem resposta cadastrada');
  frontButton.setAttribute('aria-pressed',String(next==='front'));
  backButton.setAttribute('aria-pressed',String(next==='back'));
  requestAnimationFrame(paint);
 }
 function eraseAt(p){
  const {w,h}=dimensions();
  let best=-1,distance=22*22;
  const strokes=data[side];
  for(let i=0;i<strokes.length;i++){
   const s=strokes[i],pts=s.points||[];
   for(let j=0;j<pts.length;j++){
    const dx=(pts[j][0]-p[0])*w,dy=(pts[j][1]-p[1])*h;
    const d=dx*dx+dy*dy;
    if(d<distance){distance=d;best=i}
   }
  }
  if(best>=0){strokes.splice(best,1);paint();save()}
 }
 canvas.addEventListener('pointerdown',e=>{
  if(!data||mode==='read')return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();
  const p=point(e);
  if(mode==='erase'){eraseAt(p);return}
  const stroke={kind:mode,color:color.value,width:Math.max(2,Number(size.value))*(mode==='highlight'?2.2:1),points:[p]};
  if(data[side].length>=600){saveState.textContent='Limite de traços atingido: apague alguns traços antes de continuar.';return}
  data[side].push(stroke);working=stroke;
  canvas.setPointerCapture?.(e.pointerId);paint();
 });
 canvas.addEventListener('pointermove',e=>{
  if(!working)return;e.preventDefault();const p=point(e),last=working.points[working.points.length-1];
  if(Math.hypot(p[0]-last[0],p[1]-last[1])<.0015)return;
  if(working.points.length<2500)working.points.push(p);
  paint();
 });
 function stopStroke(e){
  if(!working)return;
  working=null;
  if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  save();paint();
 }
 canvas.addEventListener('pointerup',stopStroke);canvas.addEventListener('pointercancel',stopStroke);
 notes.addEventListener('input',scheduleSave);
 function open(cardId,focus){
  if(!valid(cardId))return;
  const collection=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
  if(!collection.some(c=>c.id===cardId))return;
  if(!overlay.hidden)hide();
  id=cardId;data=read(cardId);returnFocus=focus||document.activeElement;
  name.textContent='✎ Anotar flashcard '+cardId;notes.value=data.note||'';
  previousBodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  overlay.hidden=false;sideChange('front');modeChange('pen');
  saveState.textContent=data.updated_at?'Anotações recuperadas · '+new Date(data.updated_at).toLocaleString('pt-BR'):'Novo cartão de anotações';
  dialog.focus({preventScroll:true});requestAnimationFrame(paint);
 }
 function hide(){
  if(overlay.hidden)return;
  save();overlay.hidden=true;document.body.style.overflow=previousBodyOverflow;
  id='';data=null;working=null;returnFocus?.focus?.({preventScroll:true});returnFocus=null;
 }
 close.addEventListener('click',hide);backdrop.addEventListener('click',hide);
 document.addEventListener('keydown',e=>{
  if(overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();hide()}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}
 });
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(!overlay.hidden)paint()}).observe(sheet);
 window.addEventListener('resize',()=>{if(!overlay.hidden)paint()});
 function decorate(){
  for(const article of root.querySelectorAll('article.card')){
   if(article.querySelector('.bm122-ink-launch'))continue;
   const c=cardId(article);if(!valid(c))continue;
   const launch=button('✎ Grifar / escrever',()=>open(c,launch),'bm122-ink-launch');
   launch.title='Anotar e grifar a frente ou o verso de '+c+' sem alterar a resposta';
   const actions=article.querySelector(':scope > .buttons');
   if(actions)actions.prepend(launch);
   else article.append(launch);
  }
 }
 let scheduled=false;
 const observer=new MutationObserver(()=>{
  if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()});
 });
 observer.observe(root,{childList:true,subtree:true});decorate();
 const peek=document.querySelector('#bmCardPeekV050 .bm-v050-peek-header');
 if(peek&&!peek.querySelector('.bm122-ink-peek-btn')){
  const launch=button('✎ Anotar',()=>{
   const found=document.querySelector('#bmCardPeekTitleV050')?.textContent?.match(/(?:CARD-\d{4,5}|PROP-IJUI-[\w-]+)/)?.[0];
   if(found)open(found,launch);
  },'bm122-ink-peek-btn');
  peek.append(launch);
 }
 window.BancoMestreCardInkV122=Object.freeze({openId:id=>open(id),close:hide,get active(){return !overlay.hidden}});
})();