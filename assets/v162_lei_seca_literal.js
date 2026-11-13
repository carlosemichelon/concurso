/* Banco Mestre V162 — lei seca literal por botão independente em cada cartão.
 * Fonte: JSON de dispositivos transcritos com referência, não os resumos da base.
 * Todos os versos originais/IDs/avaliações/SRS/Drive permanecem intactos.
 * O módulo V160 foi substituído, não acumulado, para impedir ocultação falsa. */
(function(){
'use strict';
if(window.BM162LeiSeca)return;
const root=document.getElementById('cardRows');
if(!root)return;
const sourceFiles=['lei_seca_literais_v161.json','lei_seca_ijui_v161.json','lei_seca_complementos_v162.json'];
const knownCanonical=new Set(['CARD-1495','CARD-1496','CARD-1497']);
const law15190='https://www2.camara.leg.br/legin/fed/lei/2025/lei-15190-8-agosto-2025-797833-normaatualizada-pl.html';
const legal=/legisla[cç][aã]o|direito|jur[ií]dic|constitucional/i;
const states=new Map(),verified=new Map();
let sourcesReady=false,sourceFailures=[];
const headStyle=document.createElement('style');headStyle.id='bm161-law-style';
headStyle.textContent=[
 '#cartoes .bm161-law-button{border:1px solid #b1c8c5;background:#f7fbfa;color:#1c5558;font-weight:700;padding:9px 12px;min-height:41px}',
 '#cartoes .bm161-law-button[aria-expanded="true"]{background:#e3f1ed;border-color:#6aaba1}',
 '#cartoes .bm161-law-panel{border:1px solid #c4d9d4;border-radius:10px;padding:14px;background:#fcfefd;margin:10px 0 14px;min-width:0}',
 '#cartoes .bm161-law-panel[hidden]{display:none!important}',
 '#cartoes .bm161-law-heading{font-size:13px;font-weight:800;color:#1c4f53;margin:0 0 5px}',
 '#cartoes .bm161-law-meta{font-size:12px;color:#556e71;margin:0 0 10px}',
 '#cartoes .bm161-law-content{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;line-height:1.65;margin:0 0 9px;color:#18363b}',
 '#cartoes .bm161-law-footnote{font-size:12px;color:#5a7176;line-height:1.5;margin:8px 0 0}',
 '#cartoes .bm161-law-link{font-size:12px;color:#195a60;text-decoration:underline;display:inline-block;margin-top:7px}',
 '#cartoes .bm161-law-pending{font-size:13px;color:#685423;line-height:1.55}',
 '#cartoes .bm161-law-button:focus-visible{outline:3px solid #4b9eaa;outline-offset:2px}',
 '@media(max-width:600px){#cartoes .bm161-law-button{width:100%}#cartoes .bm161-law-panel{padding:11px}}'
].join('\n');document.head.append(headStyle);
const node=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x};
const getCards=()=>typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
const isLegal=c=>!!c&&(c.provisional===true||String(c.group||'').toUpperCase()==='LEGISLACAO'||legal.test(String(c.discipline||'')));
const validId=card=>String(card?.id||'');
function record(c){
 const id=validId(c);
 const entry=verified.get(id);
 if(entry&&entry.text&&/^https:\/\//.test(entry.source_url||''))return entry;
 if(knownCanonical.has(id)&&/LEI SECA/i.test(String(c.expl||''))&&typeof c.back==='string'&&c.back.trim()){
  return {id,law:'Lei 15.190/2025',article:c.front?.split(':')[0]||'dispositivo indicado',text:c.back,
   scope:'transcrição literal identificada no verso canônico',source_url:law15190,verification:'redação legal original registrada na base V024 H14'};
 }
 // Importações futuras devem declarar explicitamente verificação E fonte.
 const field=['texto_lei_seca','lei_seca_texto','lei_seca','legal_text','law_text'].find(k=>typeof c[k]==='string'&&c[k].trim());
 if(field&&c.lei_seca_verificada===true&&/^https:\/\//.test(String(c.lei_seca_fonte_url||''))){
  return {id,law:String(c.lei_seca_norma||'Dispositivo indicado'),article:String(c.lei_seca_dispositivo||'conferir referência'),
   text:c[field],scope:'transcrição verificada declarada na própria fonte',source_url:c.lei_seca_fonte_url};
 }
 return null;
}
function build(article,c){
 const id=validId(c);
 const controls=article.querySelector(':scope > .buttons');
 if(!controls)return;
 const button=node('button',undefined,'bm161-law-button');
 button.type='button';button.dataset.bm161LawFor=id;button.setAttribute('aria-expanded','false');
 button.title='Revelar ou ocultar exclusivamente o texto literal de legislação; a resposta original continua separada';
 const panel=node('div',undefined,'bm161-law-panel');
 panel.id='bm161-law-'+id.replace(/[^a-zA-Z0-9_-]/g,'-');
 panel.hidden=true;
 panel.setAttribute('role','region');panel.setAttribute('aria-label','Texto da lei seca de '+id);
 button.setAttribute('aria-controls',panel.id);
 controls.prepend(button);
 const answer=article.querySelector(':scope > details');
 if(answer)answer.before(panel);else controls.before(panel);
 function paint(){
  const open=!!states.get(id);
  const rec=record(c);
  button.setAttribute('aria-expanded',String(open));
  button.textContent=rec?(open?'📜 Ocultar lei seca':'📜 Mostrar lei seca'):(open?'📜 Ocultar pendência':'📜 Lei seca a conferir');
  panel.hidden=!open;
  if(!open)return;
  panel.replaceChildren();
  if(rec){
   panel.append(
    node('p','LEI SECA — transcrição literal','bm161-law-heading'),
    node('p',rec.law+' · '+rec.article,'bm161-law-meta'),
    node('p',rec.text,'bm161-law-content'),
    node('p','Abrangência: '+(rec.scope||'trecho indicado')+'. '+(rec.notice||'')+(rec.verification?' · '+rec.verification:''),'bm161-law-footnote')
   );
   const link=node('a','Conferir dispositivo na fonte','bm161-law-link');
   link.href=rec.source_url;link.target='_blank';link.rel='noopener noreferrer';
   panel.append(link);
  }else{
   panel.append(node('p','Transcrição literal ainda não validada para este cartão.','bm161-law-heading'));
   const message=sourceFailures.length?'Algumas fontes não carregaram. Atualize a página para tentar novamente. ':'';
   panel.append(node('p',message+'A resposta original permanece disponível na seção de explicações, mas não será exibida como se fosse texto legal literal.','bm161-law-pending'));
   if(c.reference)panel.append(node('p','Referência cadastrada (a conferir): '+c.reference,'bm161-law-footnote'));
  }
 }
 button.addEventListener('click',()=>{
  states.set(id,!states.get(id));paint();
 });
 article.dataset.bm161Law='ready';
 paint();
}
function decorate(){
 if(!sourcesReady)return;
 const found=new Map(getCards().filter(isLegal).map(c=>[validId(c),c]));
 for(const article of root.querySelectorAll('article.card')){
  const id=article.querySelector(':scope > .tag')?.textContent?.trim()||'';
  const card=found.get(id);
  if(!card)continue;
  if(article.dataset.bm161Law==='ready')continue;
  build(article,card);
 }
}
let scheduled=false;
const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate();})};
const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});
async function load(){
 const results=await Promise.allSettled(sourceFiles.map(async file=>{
  const response=await fetch('assets/'+file+'?v=161',{cache:'no-store'});
  if(!response.ok)throw Error(file+' '+response.status);
  const data=await response.json();
  if(!Array.isArray(data.items)||data.version!=='V161'||!data.format?.startsWith('BancoMestreLeiSeca'))throw Error('Formato inválido: '+file);
  if(new Set(data.items.map(x=>x.id)).size!==data.items.length)throw Error('IDs duplicados: '+file);
  return data.items;
 }));
 for(let i=0;i<results.length;i++){
  const r=results[i];
  if(r.status==='rejected'){sourceFailures.push(sourceFiles[i]);console.warn('Lei seca V162: fonte indisponível',sourceFiles[i],r.reason);continue}
  for(const x of r.value){
   if(!x?.id||!x?.text||!/^https:\/\//.test(x.source_url||'')){
    console.warn('Lei seca V162: entrada inválida',x?.id);continue;
   }
   if(verified.has(x.id)){console.warn('Lei seca V162: ID duplicado entre arquivos',x.id);continue}
   verified.set(x.id,x);
  }
 }
 sourcesReady=true;schedule();
}
window.BM162LeiSeca=Object.freeze({
 version:'V162',refresh:schedule,
 get verifiedEntries(){return verified.size},
 get sourceFailures(){return sourceFailures.slice()},
 get legalCount(){return getCards().filter(isLegal).length},
 get literalCount(){return getCards().filter(isLegal).filter(c=>!!record(c)).length}
});
void load();
})();