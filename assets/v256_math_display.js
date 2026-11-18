/* V256 — equações em MathML nativo. Mudança somente de apresentação. */
(function(){
'use strict';if(window.BM256MathDisplay)return;
const ns='http://www.w3.org/1998/Math/MathML',selector='.bm249-equation,.bm198-equation,[data-bm-math]';
const greek={alpha:'α',beta:'β',gamma:'γ',delta:'δ',Delta:'Δ',epsilon:'ε',theta:'θ',lambda:'λ',mu:'μ',pi:'π',rho:'ρ',sigma:'σ',Sigma:'Σ',tau:'τ',phi:'φ',omega:'ω',Omega:'Ω'};
const ops={cdot:'·',times:'×',leq:'≤',geq:'≥',neq:'≠',approx:'≈',pm:'±',to:'→',sum:'∑',int:'∫'};
const sub={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
const sup={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
const e=(tag,value)=>{const x=document.createElementNS(ns,tag);if(value!==undefined)x.textContent=String(value);return x};
const row=nodes=>{const x=e('mrow');nodes.forEach(n=>x.append(n));return x};
function asTex(raw){
 let s=String(raw||'').trim().replace(/^\s*(?:\\\[|\$\$)/,'').replace(/(?:\\\]|\$\$)\s*$/,'').replace(/^\\\(|\\\)$/g,'');
 s=s.replace(/([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z][A-Za-z0-9]*)?)\s*\/\s*([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z][A-Za-z0-9]*)?|\d+(?:[.,]\d+)?)/g,'\\frac{$1}{$2}');
 s=s.replace(/\b([A-Za-z][A-Za-z0-9]*)_([A-Za-z0-9]+)/g,'$1_{$2}');
 s=s.replace(/([A-Za-z0-9])\^([A-Za-z0-9]+)/g,'$1^{$2}');
 const chars={'α':'\\alpha ','β':'\\beta ','γ':'\\gamma ','δ':'\\delta ','ε':'\\epsilon ','θ':'\\theta ','λ':'\\lambda ','μ':'\\mu ','π':'\\pi ','ρ':'\\rho ','σ':'\\sigma ','τ':'\\tau ','φ':'\\phi ','ω':'\\omega ','Δ':'\\Delta ','Σ':'\\Sigma ','Ω':'\\Omega '};
 s=s.replace(/[αβγδεθλμπρστφωΔΣΩ]/g,c=>chars[c]);
 return s.replace(/·/g,'\\cdot ').replace(/×/g,'\\times ').replace(/≤/g,'\\leq ').replace(/≥/g,'\\geq ').replace(/≈/g,'\\approx ').replace(/≠/g,'\\neq ').replace(/²/g,'^{2}').replace(/³/g,'^{3}').replace(/⁴/g,'^{4}').replace(/−/g,'-').replace(/[.]$/,'');
}
function mathml(tex,source){
 const toks=String(tex).match(/\\[a-zA-Z]+|\d+(?:[.,]\d+)?|[a-zA-ZÀ-ÿ]+|[₀-₉⁰-⁹²³¹]|[^\s]/gu)||[];
 let i=0,steps=0;
 function group(){if(toks[i]==='{'){i++;return sequence('}')}return atom()}
 function atom(){
  if(++steps>1600)throw Error('Expressão muito longa');
  const t=toks[i++];if(!t)return e('mtext','');
  let n;
  if(t==='\\frac'){const a=group(),b=group();n=e('mfrac');n.append(a,b)}
  else if(t==='\\sqrt'){n=e('msqrt');n.append(group())}
  else if(t==='{'||t==='('||t==='['){const close=t==='{'?'}':t==='('?')':']',part=sequence(close);n=t==='{'?part:row([e('mo',t),part,e('mo',close)])}
  else if(t.startsWith('\\')){const k=t.slice(1);n=greek[k]?e('mi',greek[k]):e('mo',ops[k]||t)}
  else if(/^\d+(?:[,.]\d+)?$/.test(t))n=e('mn',t);
  else if(/[A-Za-zÀ-ÿα-ωΑ-Ω]/u.test(t))n=e('mi',t);
  else n=e('mo',t);
  let low=null,high=null;
  while(i<toks.length){
   const next=toks[i];
   if(next==='_'||next==='^'){i++;if(next==='_')low=group();else high=group()}
   else if(sub[next]||sup[next]){i++;if(sub[next])low=e('mn',sub[next]);else high=e('mn',sup[next])}
   else break;
  }
  if(low&&high){const x=e('msubsup');x.append(n,low,high);n=x}
  else if(low){const x=e('msub');x.append(n,low);n=x}
  else if(high){const x=e('msup');x.append(n,high);n=x}
  return n;
 }
 function sequence(stop){
  const nodes=[];
  while(i<toks.length&&(!stop||toks[i]!==stop)){
   if(toks[i]==='/'&&nodes.length){
    i++;const top=nodes.pop(),bottom=atom(),frac=e('mfrac');frac.append(top,bottom);nodes.push(frac);
   }else if(['}',')',']'].includes(toks[i])){i++;break}
   else nodes.push(atom());
  }
  if(stop&&toks[i]===stop)i++;
  return row(nodes);
 }
 const root=e('math');root.setAttribute('display','block');root.setAttribute('aria-label',source||tex);root.append(sequence());return root;
}
function convert(node){
 if(node.dataset.bm256Math)return;
 const original=node.textContent.trim();
 if(!original||original.length>240||/https?:\/\//i.test(original)||!/[=≈≤≥]|\\(?:frac|sqrt)/.test(original))return;
 try{
  const tex=asTex(original),visual=document.createElement('span'),raw=document.createElement('span');
  visual.className='bm256-math-visual';visual.setAttribute('role','img');visual.setAttribute('aria-label','Equação: '+original);visual.append(mathml(tex,original));
  raw.className='bm256-math-source';raw.textContent=original;
  node.replaceChildren(visual,raw);node.dataset.bm256Math='rendered';node.dataset.bm256Original=original;
 }catch(err){console.warn('V256: preservada a fórmula textual',err);node.dataset.bm256Math='fallback'}
}
let pending=false;
function scan(){pending=false;document.querySelectorAll(selector).forEach(convert)}
function schedule(){if(!pending){pending=true;queueMicrotask(scan)}}
function start(){
 schedule();
 const observer=new MutationObserver(ms=>{
  if(ms.some(m=>Array.from(m.addedNodes).some(n=>n.nodeType===1&&(n.matches?.(selector)||n.querySelector?.(selector)))))schedule();
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
window.BM256MathDisplay=Object.freeze({asTex,mathml,scan,version:'V256',sourcePreserved:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();