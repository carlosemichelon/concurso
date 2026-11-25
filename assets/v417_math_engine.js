/* VS26 — renderização matemática conservadora, sem dados privados. */
(()=>{ 'use strict'; const engine=(function mathEngine(doc){
 const ns="http://www.w3.org/1998/Math/MathML", palette={core:"#FDE68A",agent:"#BBF7D0",condition:"#BAE6FD",exception:"#FECDD3"};
 const el=(tag,t)=>{const n=doc.createElementNS(ns,tag);if(t!==undefined)n.textContent=t;return n};
 const row=(...nodes)=>{const n=el("mrow");n.append(...nodes);return n};
 const aliases={δmax:["δ","max"],δmáx:["δ","máx"],δponta:["δ","ponta"],δcentro:["δ","centro"],Mmax:["M","max"],Mmáx:["M","máx"],Meng:["M","eng"],Mmin:["M","min"],Mr:["M","r"],Ic:["I","c"],Ix:["I","x"],Iy:["I","y"],IG:["I","G"],Imin:["I","min"],Imax:["I","max"],Wt:["W","t"],Wx:["W","x"],Wy:["W","y"],yt:["y","t"],ymax:["y","max"],ymáx:["y","máx"],Pcr:["P","cr"],Ncr:["N","cr"],Le:["L","e"],RA:["R","A"],RB:["R","B"],σ1:["σ","1"],σ2:["σ","2"],σ3:["σ","3"],σmáx:["σ","máx"],εT:["ε","T"],εtotal:["ε","total"],σT:["σ","T"],αT:["α","T"],αc:["α","c"],αs:["α","s"],fck:["f","ck"],fct:["f","ct"],"fct,m":["f","ct,m"],"fctk,inf":["f","ctk,inf"],"fctk,sup":["f","ctk,sup"],fyk:["f","yk"],fyd:["f","yd"],fcd:["f","cd"],Es:["E","s"],Ec:["E","c"],Ecs:["E","cs"],Eci:["E","ci"],As:["A","s"],Md:["M","d"],Msd:["M","sd"],Nsd:["N","sd"],Vsd:["V","sd"],γc:["γ","c"],γs:["γ","s"],δWext:["δW","ext"],δWint:["δW","int"]};
 const supers={"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁻":"−","⁺":"+","ⁿ":"n","ⁱ":"i"}, subs={"₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","₋":"−","₊":"+","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₖ":"k","ₘ":"m","ₙ":"n","ₚ":"p","ₛ":"s","ₜ":"t","ₓ":"x"};
 const units=new Set(["MPa","GPa","kPa","kN","MN","Pa","mm","cm","kg","rad","sen","sin","cos","tan","min","max","ln","log","inf","sup","dx","dy","dA","dV","dM"]);
 const index=(s)=>/^[0-9]+$/.test(s)?el("mn",s):el("mi",s);
 const symbol=s=>{const a=aliases[s];if(a){const n=el("msub");n.append(el("mi",a[0]),index(a[1]));return n}return /^\d+(?:[.,]\d+)?$/.test(s)?el("mn",s):el("mi",s)};
 const pairs={"(":")","[":"]","{":"}"};
 function matching(t,i){const stack=[];for(let j=i;j<t.length;j++){const c=t[j];if(pairs[c])stack.push(pairs[c]);else if(")]}".includes(c)){if(stack.pop()!==c)return -1;if(!stack.length)return j}}return -1}
 function top(t,chars){const hits=[];let dep=0;for(let i=0;i<t.length;i++){const c=t[i];if("([{".includes(c))dep++;else if(")]}".includes(c))dep--;else if(dep===0&&chars.includes(c))hits.push(i)}return hits}
 function scriptValue(t,i,kind){const map=kind==="sub"?subs:supers;let j=i,raw="";while(j<t.length&&map[t[j]])raw+=map[t[j++]];if(j>i)return [raw,j];if(t[i]==="{"){const end=matching(t,i);if(end>i)return [t.slice(i+1,end),end+1]}const m=t.slice(i).match(kind==="sub"?/^[A-Za-zÀ-ÖØ-öø-ÿΑ-Ωα-ω0-9]+(?:[,_][A-Za-zÀ-ÖØ-öø-ÿΑ-Ωα-ω0-9]+)*/u:/^[+\-−]?\d+|^[a-zA-Zα-ω]/u);return m?[m[0],i+m[0].length]:null}
 function attach(n,t,i){let low=null,high=null;while(i<t.length){const c=t[i],kind=c==="_"||subs[c]?"sub":c==="^"||supers[c]?"sup":null;if(!kind)break;const v=scriptValue(t,i+(c==="_"||c==="^"?1:0),kind);if(!v)break;if(kind==="sub")low=index(v[0].replace(/_/g," "));else high=/^[−+\-]?\d+$/.test(v[0])?el("mn",v[0]):inline(v[0]);i=v[1]}if(low||high){const k=el(low&&high?"msubsup":low?"msub":"msup");k.append(n,...(low?[low]:[]),...(high?[high]:[]));n=k}return [n,i]}
 function inline(t){let i=0,ns=[];while(i<t.length){const ch=t[i];if(/\s/u.test(ch)){i++;continue}let n,j=i+1;
  if(ch==="√"){const k=i+1;while(j<t.length&&/\s/u.test(t[j]))j++;if(pairs[t[j]]){const end=matching(t,j);if(end>j){n=el("msqrt");n.append(part(t.slice(j+1,end)));j=end+1}}if(!n){n=el("mo",ch);j=k}}
  else if(ch==="Σ"||ch==="∑"||ch==="∫"){n=el("mo",ch)}
  else if(pairs[ch]){const end=matching(t,i);if(end>i){n=row(el("mo",ch),part(t.slice(i+1,end)),el("mo",t[end]));j=end+1}else n=el("mo",ch)}
  else {const num=t.slice(i).match(/^\d+(?:[.,]\d+)?/u);const word=t.slice(i).match(/^[\p{L}]+(?:\d+)?/u);if(num){n=el("mn",num[0]);j=i+num[0].length}else if(word&&!supers[ch]&&!subs[ch]){let w=word[0]; // A known comma-qualified identifier is indivisible.
    const extra=t.slice(i).match(/^fctk,(?:inf|sup)|^fct,m/u);if(extra)w=extra[0];
    // Unicode script characters are separate from the base, even when classified as letters.
    const cut=[...w].findIndex(c=>supers[c]||subs[c]);if(cut>0)w=[...w].slice(0,cut).join("");
    j=i+w.length;
    if(aliases[w]||units.has(w)||t[j]==="_"||w.length===1)n=symbol(w);
    else if(/^[A-Z]{2,4}$/.test(w)||/^[a-zα-ω][A-Z]{1,3}$/.test(w)||/^[A-Z][a-zα-ω]$/.test(w)||/^(?:bh|hb|bd|db|cs|sc|xy|yx|πd|πD|πr|πR|αL|αE|qL|PL|My|Mx|Nx|Eε)$/.test(w)){
      const a=[...w].map(c=>el("mi",c));let last=a.pop();const attached=attach(last,t,j);a.push(attached[0]);ns.push(...a);i=attached[1];continue;
    }else {if(supers[t[j]]||subs[t[j]]){while(supers[t[j]]||subs[t[j]])w+=t[j++];}n=el("mtext",w);}
   }else n=el("mo",ch)}
  const a=attach(n,t,j);ns.push(a[0]);i=a[1];
 }return row(...ns)}
 function part(raw){const t=raw.trim().replace(/[.]$/u,"");if(!t)return row();const add=top(t,"+−-±").filter(i=>i>0&&!"/^·×*".includes(t[i-1])&&!(/[eE]/.test(t[i-1])&&/\d/.test(t[i-2]||"")&&/\d/.test(t[i+1]||""))&&!/[⁻⁺]/u.test(t[i]));if(add.length){let last=0;const a=[];for(const i of add){a.push(part(t.slice(last,i)),el("mo",t[i]));last=i+1}a.push(part(t.slice(last)));return row(...a)}
  const sl=top(t,"/");if(sl.length===1){const i=sl[0],left=t.slice(0,i).trim(),right=t.slice(i+1).trim();const end=pairs[right[0]]?matching(right,0):-1;const tail=end>=0?right.slice(end+1):"";const bracketed=end>=0&&(tail===""||/^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]+|\^\{?\d+\}?)$/u.test(tail));const simple=/^(?:\d+(?:[.,]\d+)?|[\p{L}](?:_[\p{L}\p{N},]+|[₀-₉]+)?(?:[²³⁴⁵⁶⁷⁸⁹]+|\^\d+)?|[A-Za-z]+_[\p{L}\p{N},]+)$/u.test(right)||Object.hasOwn(aliases,right);
   if(left&&(bracketed||simple)&&!/[∫Σ∑]/u.test(left)&&!top(left,"=≤≥≈<>").length){const f=el("mfrac");f.append(inline(left),bracketed&&!tail?part(right.slice(1,-1)):inline(right));return f}}
  return inline(t)}
 function decorate(math,marks=[]){if(!math||math.getAttribute("data-bm417")!==null)return math;math.setAttribute("data-bm417","1");const root=math.firstElementChild;if(!root)return math;const children=Array.from(root.localName==="mrow"?root.children:math.children);const rel=children.findIndex(n=>n.localName==="mo"&&/^[=≤≥≈<>]$/.test(n.textContent.trim()));
  const pure=n=>["mi","msub","msubsup","msup","mn"].includes(n.localName)||n.localName==="mrow"&&n.children.length===1&&pure(n.firstElementChild);
  function color(n,kind){if(palette[kind]&&!n.getAttribute("mathbackground")){n.setAttribute("mathbackground",palette[kind]);n.setAttribute("data-bm-semantic",kind)}}
  if(rel===1&&pure(children[0]))color(children[0],"core");
  if(rel>=0&&children[rel].textContent.trim()!=="="&&children.length===rel+2&&/^\d+(?:[.,]\d+)?$/.test(children[rel+1].textContent.trim()))color(children[rel+1],"condition");
  const norm=s=>String(s||"").replace(/[_{}\s]/g,"");const available=Array.from(math.querySelectorAll("msub,msubsup,msup,mi,mn"));for(const mark of marks||[]){if(!palette[mark.kind]||!mark.text)continue;const m=norm(mark.text);if(!m)continue;const hits=available.filter(n=>norm(n.textContent)===m);if(hits.length===1)color(hits[0],mark.kind)}
  return math}
 function screen(t){return String(t).replace(/fctk,(?:inf|sup)|fct,m|[\p{L}\p{N}]+/gu,w=>Object.hasOwn(aliases,w)?"x":w)}
 return {part,inline,decorate,screen};
})(document); window.BM417Math=Object.freeze(engine); })();
