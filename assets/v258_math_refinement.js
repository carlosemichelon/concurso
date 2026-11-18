/* V258 — Corrige linhas mistas (prosa + fórmulas) sem modificar a fonte Drive. */
(function(){
'use strict';
if(window.BM258MathRefinement)return;
const selector='.bm249-equation,.bm198-equation,[data-bm-math]';
const el=(name,cls,value)=>{
 const n=document.createElement(name);
 if(cls)n.className=cls;
 if(value!==undefined)n.textContent=String(value);
 return n;
};
function isNarrative(fragment){
 const s=String(fragment||'').trim();
 const idx=s.indexOf('=');
 if(idx<0)return true;
 const lhs=s.slice(0,idx).trim(),rhs=s.slice(idx+1).trim();
 if(/^\[.*\]$/.test(lhs))return true;
 if(/^[\p{L}À-ÿ]{5,}(?:\b|$)/u.test(rhs)&&!/[·×*+−-]/.test(rhs.slice(0,15)))return true;
 if(/[\p{L}]{4,}\s+(?:[\p{L}]{1,3}\s+)?[\p{L}]{4,}/u.test(rhs))return true;
 // A left-hand description ("M nos engastes") is not an algebraic symbol.
 const lhsWords=lhs.split(/\s+/).filter(Boolean);
 if(/^[\p{L}À-ÿ]{6,}(?:-[\p{L}À-ÿ]{3,})*$/u.test(lhs)&&lhs===lhs.toLocaleLowerCase('pt-BR'))return true;
 if(lhsWords.length>=2&&lhsWords.some(x=>/^[\p{L}À-ÿ]{3,}$/u.test(x)))return true;
 // Explanatory clauses or units must never become invisible-spaced MathML identifiers.
 if(/(?:^|[\s,;])(?:para|quando|onde|conforme|com|sendo|então|depois|somente|sinais|definida|definido|dependem|depende|inclusive|exceto|porque|aquecimento|resfriamento|impedida|considerando|respectivamente|sob|medido|extremidade|oposta|engastada|articulada|equilíbrio|convenção|definição|nos|nas|aplicáveis|compatíveis)\b/iu.test(rhs))return true;
 if(/(?:[.!?]\s+[\p{L}]{3,})/u.test(rhs))return true;
 if(/\[[^\]]*(?:\s+[\p{L}]{2,}){2,}[^\]]*\]/u.test(rhs))return true;
 return false;
}
function separate(raw){
 const source=String(raw||'').trim();
 if(!source||!source.includes('=')||source.length>1600||/https?:\/\//i.test(source))return null;
 let remainder=source,context='';
 const firstEq=source.indexOf('='),colon=source.indexOf(':');
 if(colon>0&&colon<firstEq){
  const candidate=source.slice(0,colon).trim();
  // Colon before equality divides explanation from equations.
  if(candidate.length>2&&/[\p{L}]/u.test(candidate)){
   context=source.slice(0,colon+1).trim();
   remainder=source.slice(colon+1).trim();
  }
 }
 const fields=remainder.split(/\s*;\s*/).filter(Boolean);
 const unitGlossary=/^\s*\[[^\]]+\]\s*=/.test(remainder);
 const parts=fields.map(value=>({value,kind:unitGlossary||isNarrative(value)?'text':'math'}));
 const needsRepair=Boolean(context)||parts.length>1||parts.some(x=>x.kind==='text');
 if(!needsRepair)return null;  // A simple, pure formula stays with the established V256 renderer.
 return {source,context,parts};
}
function render(node){
 if(node.dataset.bm258Math)return;
 const original=node.dataset.bm256Original||node.textContent||'';
 const plan=separate(original);
 if(!plan){node.dataset.bm258Math='unchanged';return;}
 const wrapper=el('div','bm258-composed-math');
 if(plan.context)wrapper.append(el('p','bm258-context',plan.context));
 const core=window.BM256MathDisplay;
 for(const part of plan.parts){
  if(part.kind==='math'&&core?.asTex&&core?.mathml){
   try{
    const m=core.mathml(core.asTex(part.value),part.value);
    const equation=el('div','bm258-equation');
    equation.setAttribute('role','group');
    equation.setAttribute('aria-label','Expressão matemática: '+part.value);
    equation.append(m);wrapper.append(equation);
   }catch(err){
    console.warn('V258: expressão textual preservada',err);
    wrapper.append(el('p','bm258-prose',part.value));
   }
  }else wrapper.append(el('p','bm258-prose',part.value));
 }
 // Retain the entire literal source in accessible DOM without changing stored records.
 const source=el('span','bm258-original-source',plan.source);
 source.setAttribute('aria-hidden','true');
 node.replaceChildren(wrapper,source);
 node.dataset.bm258Math='composed';
 node.dataset.bm258Original=plan.source;
}
let pending=false;
function scan(){
 pending=false;
 document.querySelectorAll(selector).forEach(render);
}
function schedule(){if(!pending){pending=true;queueMicrotask(scan);}}
function start(){
 schedule();
 const mo=new MutationObserver(ms=>{
  if(ms.some(m=>Array.from(m.addedNodes).some(n=>
   n.nodeType===1&&(n.matches?.(selector)||n.querySelector?.(selector)))))schedule();
 });
 mo.observe(document.body,{childList:true,subtree:true});
}
window.BM258MathRefinement=Object.freeze({separate,scan,version:'V258',writesStudyData:false});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();