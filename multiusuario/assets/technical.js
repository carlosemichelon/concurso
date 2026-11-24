/* Native MathML without HTML injection, evaluation or remote services. */
const MAX_EXPR=1200, FUNCTIONS=Object.freeze({frac:['mfrac',2],sub:['msub',2],sup:['msup',2],subsup:['msubsup',3],sqrt:['msqrt',1],root:['mroot',2],abs:['abs',1]});
const row=children=>({tag:'mrow',children});
const leaf=(tag,text)=>({tag,text});
export function mathTree(input){if(typeof input!=='string'||!input.trim()||input.length>MAX_EXPR||/[<>{}\x00-\x1F]/.test(input))throw Error('Expressão matemática inválida ou longa demais.');let i=0,count=0;
function whitespace(){while(i<input.length&&/\s/.test(input[i]))i++}
function seq(depth,stops){if(depth>12)throw Error('Expressão matemática muito aninhada');const children=[];while(i<input.length){whitespace();if(i>=input.length||stops.includes(input[i]))break;if(++count>450)throw Error('Expressão com muitos elementos');const rest=input.slice(i);
 const fn=/^(frac|subsup|sub|sup|sqrt|root|abs)\s*\(/.exec(rest);
 if(fn){const [tag,arity]=FUNCTIONS[fn[1]];i+=fn[0].length;const args=[];for(let a=0;a<arity;a++){const arg=seq(depth+1,[';',')']);if(!arg.children.length)throw Error('Argumento matemático vazio');args.push(arg);whitespace();const delimiter=a===arity-1?')':';';if(input[i]!==delimiter)throw Error('Use '+delimiter+' na função '+fn[1]);i++}children.push(tag==='abs'?row([leaf('mo','|'),args[0],leaf('mo','|')]):{tag,children:args});continue}
 if(input[i]==='('){i++;const inside=seq(depth+1,[')']);if(input[i]!==')')throw Error('Parêntese não fechado');i++;children.push(row([leaf('mo','('),inside,leaf('mo',')')]));continue}
 const numeric=/^(?:\d+(?:[.,]\d+)?|[.,]\d+)/.exec(rest);if(numeric){children.push(leaf('mn',numeric[0]));i+=numeric[0].length;continue}
 const identifier=/^[\p{L}µ°][\p{L}\p{M}\d_µ°]*/u.exec(rest);if(identifier){children.push(leaf('mi',identifier[0]));i+=identifier[0].length;continue}
 const ch=input[i];if('+-−×·÷=*/^≤≥≠≈±∓∑∏∫∞%[]|:!,→←⇒∝√'.includes(ch)){children.push(leaf('mo',ch));i++;continue}
 throw Error('Símbolo matemático não aceito: '+ch);
 }return row(children)}
 const result=seq(0,[]);whitespace();if(i!==input.length||!result.children.length)throw Error('Expressão incompleta');return result}
const text=(x,name,max=1000,optional=false)=>{if(typeof x!=='string'||x.length>max||(!optional&&!x.trim()))throw Error(name+' inválido');return x};
const array=(x,max,name)=>{if(!Array.isArray(x)||x.length>max)throw Error(name+' inválido');return x};
export function checkedTechnical(card){const list=card.technical??[];array(list,40,'Blocos técnicos');const ids=new Set();for(const b of list){if(!b||typeof b!=='object'||!['formula','table','example'].includes(b.kind)||typeof b.id!=='string'||!b.id||ids.has(b.id))throw Error('Bloco técnico inválido ou duplicado');ids.add(b.id);text(b.title,'Título',180);text(b.source??'','Fonte',1000,true);
 if(b.kind==='formula'){mathTree(b.expression);text(b.explanation??'','Explicação',4000,true);for(const v of array(b.variables??[],40,'Símbolos')){text(v.symbol,'Símbolo',80);text(v.meaning,'Significado',500);text(v.unit??'','Unidade',80,true)}for(const s of array(b.steps??[],30,'Etapas')){mathTree(s.expression);text(s.explanation??'','Justificativa',2000,true)}}
 if(b.kind==='table'){const cols=array(b.headers,12,'Cabeçalhos');if(cols.length<2)throw Error('Tabela precisa de ao menos duas colunas');cols.forEach(c=>text(c,'Cabeçalho',200));const rows=array(b.rows,80,'Linhas');if(!rows.length)throw Error('Tabela vazia');for(const r of rows){if(!Array.isArray(r)||r.length!==cols.length)throw Error('Número de células não coincide com cabeçalhos');r.forEach(c=>text(c,'Célula',2000,true))}}
 if(b.kind==='example'){text(b.prompt,'Exemplo proposto',4000);text(b.solution,'Resolução',6000);text(b.hint??'','Pista',2000,true)}
 }return list}
export function parseTable(input){if(typeof input!=='string'||input.length>60000)throw Error('Tabela inválida');const rows=input.trim().split(/\r?\n/).filter(s=>s.trim()).map(line=>line.split('\t').map(s=>s.trim()));if(rows.length<2)throw Error('Cole cabeçalho e linhas separados por tabulação');const [headers,...data]=rows;return {headers,rows:data}}
export function parseLines(input,kind){if(typeof input!=='string'||input.length>20000)throw Error('Linhas inválidas');return input.split(/\r?\n/).filter(s=>s.trim()).map(line=>{const p=line.split(' | ').map(s=>s.trim());if(kind==='variables'){if(p.length<2||p.length>3)throw Error('Símbolos: símbolo | significado | unidade');return {symbol:p[0],meaning:p[1],unit:p[2]||''}}if(p.length>2)throw Error('Etapas: expressão | justificativa');return {expression:p[0],explanation:p[1]||''}})}
export function technicalSearch(card){return (card.technical||[]).flatMap(b=>[b.title,b.source,b.expression,b.explanation,...(b.variables||[]).flatMap(v=>[v.symbol,v.meaning,v.unit]),...(b.steps||[]).flatMap(s=>[s.expression,s.explanation]),...(b.headers||[]),...(b.rows||[]).flat(),b.prompt,b.hint,b.solution]).filter(Boolean).join(' ')}
