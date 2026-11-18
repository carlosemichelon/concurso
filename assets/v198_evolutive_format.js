/* Banco Mestre V198: quadro informativo para os 1490 cartões e tipografia dos 11 módulos.
 * APENAS apresentação; JSON, verso original, ID e SRS permanecem intactos. */
(function(){
'use strict';if(window.BM198Format)return;
const roles=[
 ['Resposta essencial',/resposta.m[ií]nim|resposta exig[ií]vel|n[uú]cleo/i,1,'check'],
 ['Fundamento e fonte',/fundament|fonte|norma seca|edi[cç][ãa]o/i,2,'book'],
 ['Fórmulas e unidades',/f[oó]rmul|equa[cç]|vari[aá]ve|unidade/i,4,'sigma'],
 ['Aplicação prática',/aplica[cç][ãa]o|transfer[eê]ncia|resolu[cç][ãa]o|exemplo/i,6,'layers'],
 ['Condições e exceções',/exce[cç]|condi[cç]|limite|hip[oó]tese/i,8,'shield'],
 ['Pegadinhas e erros',/pegadinha|erro|risco|diverg[eê]ncia/i,9,'alert'],
 ['Macete de memória',/macete|memoriza[cç]/i,10,'light']
];
const icons={
 book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
 check:'M20 6 9 17l-5-5',sigma:'M18 6H6l7 6-7 6h12',
 layers:'m12 2 9 5-9 5-9-5 9-5 M3 12l9 5 9-5 M3 17l9 5 9-5',
 shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
 alert:'M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
 light:'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7c.8.6 1 1.3 1 2.3h6c0-1 .2-1.7 1-2.3A7 7 0 0 0 12 2',
 target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
 file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8'
};
const e=(tag,cls,text)=>{const v=document.createElement(tag);if(cls)v.className=cls;if(text!==undefined)v.textContent=String(text);return v};
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),p=document.createElementNS('http://www.w3.org/2000/svg','path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('bm198-icon');p.setAttribute('d',icons[name]||icons.file);svg.append(p);return svg}
function clean(s){return String(s||'').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\\\|/g,'|').replace(/\s+/g,' ').trim()}
function pipeCells(line){
 const result=[];let current='',escaped=false;
 for(const ch of String(line)){
  if(escaped){current+=ch==='|'?'|':'\\'+ch;escaped=false;continue}
  if(ch==='\\'){escaped=true;continue}
  if(ch==='|'){result.push(current.trim());current='';continue}
  current+=ch;
 }
 if(escaped)current+='\\';result.push(current.trim());
 if(result[0]==='')result.shift();if(result[result.length-1]==='')result.pop();
 return result;
}
function isSep(line){const c=pipeCells(line);return c.length>=2&&c.every(x=>/^:?-{3,}:?$/.test(x))}
function isTable(lines,i){return i+1<lines.length&&lines[i].trim().startsWith('|')&&isSep(lines[i+1].trim())}
function inline(parent,value){
 const s=String(value||''),re=/\*\*([^*\n]+)\*\*|https?:\/\/[^\s<>()]+/g;
 let last=0,m;
 while((m=re.exec(s))){
  if(m.index>last)parent.append(document.createTextNode(s.slice(last,m.index).replace(/\\\|/g,'|')));
  if(m[1])parent.append(e('strong','',m[1]));
  else {
   const url=m[0].replace(/[.,;]+$/,'');const a=e('a','bm198-url',url);
   a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
   if(url!==m[0])parent.append(document.createTextNode(m[0].slice(url.length)));
  }
  last=m.index+m[0].length;
 }
 if(last<s.length)parent.append(document.createTextNode(s.slice(last).replace(/\\\|/g,'|')));
}
function nativeTable(host,lines,i){
 const headers=pipeCells(lines[i]),t=e('table','bm198-native-table'),thead=e('thead'),tr=e('tr'),body=e('tbody');
 headers.forEach(x=>{const th=e('th');inline(th,x);tr.append(th)});thead.append(tr);
 i+=2;while(i<lines.length&&lines[i].trim().startsWith('|')){
  const values=pipeCells(lines[i]),row=e('tr');
  headers.forEach((_,n)=>{const td=e('td');inline(td,values[n]||'');row.append(td)});body.append(row);i++;
 }
 t.append(thead,body);const wrap=e('div','bm198-table-scroll');wrap.append(t);host.append(wrap);return i;
}
function isLabel(s){
 if(s.length<5||s.length>110||!s.endsWith(':'))return false;
 const x=s.replace(/[^A-Za-zÀ-ÿ]/g,'');return x.length>3&&x===x.toLocaleUpperCase('pt-BR');
}
function drawText(host,raw){
 const lines=String(raw||'').replace(/\r/g,'').split('\n');let i=0,buffer=[];
 function flush(){
  if(!buffer.length)return;
  const value=buffer.join('\n'),para=e('p','bm198-paragraph');
  if(buffer.length===1&&value.length<155&&/[=≤≥≈≠]/.test(value)&&!value.includes('http'))para.classList.add('bm198-equation');
  inline(para,value);host.append(para);buffer=[];
 }
 while(i<lines.length){
  const line=lines[i],t=line.trim();
  if(!t){flush();i++;continue}
  if(isTable(lines,i)){flush();i=nativeTable(host,lines,i);continue}
  if(isLabel(t)){flush();host.append(e('p','bm198-label',t.slice(0,-1)));i++;continue}
  if(/^\s*(?:[-*•]|\d+[.)])\s+\S/.test(line)){
   flush();const numbered=/^\s*\d+[.)]\s+/.test(line),list=e(numbered?'ol':'ul','bm198-list');
   while(i<lines.length&&(numbered?/^\s*\d+[.)]\s+\S/.test(lines[i]):/^\s*[-*•]\s+\S/.test(lines[i]))){
    const li=e('li');inline(li,lines[i].replace(numbered?/^\s*\d+[.)]\s+/:/^\s*[-*•]\s+/,''));list.append(li);i++;
   }host.append(list);continue;
  }
  if(/^#{2,5}\s+\S/.test(t)){flush();host.append(e('h5','bm198-subheading',t.replace(/^#{2,5}\s+/,'')));i++;continue}
  buffer.push(line);i++;
 }
 flush();
}
function sectionName(layer,index){
 return String(layer.titulo||'Módulo').trim().replace(/^\s*\d{1,2}\s*(?:[—–.:\-·])\s*/,'')||'Módulo '+(index+1);
}
function sectionIcon(t){
 const s=String(t||'').toLocaleLowerCase('pt-BR');
 if(/pergunta|recupera|frente/.test(s))return 'target';
 if(/resposta|verso/.test(s))return 'check';
 if(/fundament|fonte|norma/.test(s))return 'book';
 if(/f[oó]rmul|equa[cç]|vari[aá]ve/.test(s))return 'sigma';
 if(/pegadinha|erro/.test(s))return 'alert';
 if(/macete/.test(s))return 'light';
 if(/exce[cç]|condi[cç]|limite/.test(s))return 'shield';
 if(/cobertura|transfer|aplica|distin[cç]/.test(s))return 'layers';
 return 'file';
}
function excerpt(text,role){
 const lines=String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const tableLine=lines[0]?.startsWith('|')&&isTable(lines,0)?lines[2]:null;
 let chosen=tableLine?pipeCells(tableLine).filter(Boolean).join(' · '):'';
 if(!chosen){
  const good=lines.filter(x=>!x.startsWith('|')&&!/^#{1,4}\s/.test(x)&&
   !/^(?:VERSO(?: ORIGINAL| HIST[ÓO]RICO)|RESPOSTA M[ÍI]NIMA|F[ÓO]RMULAS?, VARI[ÁA]VEIS|MACETE(?: ORIGINAL| HIST[ÓO]RICO)|FONTE HIST[ÓO]RICA|PARECER(?: FINAL)?|FUNDAMENTO E EDI[ÇC][ÃA]O)[^:]{0,90}:\s*$/i.test(x)&&
   !/^(?:CON-\d[\w-]*|H\d{2}-[\w-]*|CARD-\d{4}|V0?\d{2,3})$/i.test(x));
  // Não usar apenas códigos internos de rastreabilidade como se fossem o fundamento.
  if(role==='Fundamento e fonte')
   chosen=good.find(x=>/ABNT|NBR|NR[-– ]\d|Lei\s+\d|Resolu[cç][ãa]o|[Mm]atem[aá]tica|[Ee]quil[ií]brio|[Mm]ec[aâ]nica|[Ff]undament|[Ff]onte\/editoria/i.test(x))||good[0]||'';
  else chosen=good[0]||'';
  if(!chosen)chosen=lines[0]||'';
 }
 const v=clean(chosen);
 if(v.length<=260)return v;
 const chunk=v.slice(0,250),lastSpace=chunk.lastIndexOf(' ');
 return chunk.slice(0,lastSpace>160?lastSpace:250)+'…';
}
function render(host,record,id){
 const layers=record?.layers;
 if(!Array.isArray(layers)||layers.length!==11||layers.some((x,i)=>x.ord!==i+1||!String(x.titulo||'').trim()||!String(x.texto||'').trim()))throw Error('Cartão '+id+' sem 11 módulos íntegros');
 const frag=document.createDocumentFragment(),overview=e('section','bm198-overview');
 const top=e('div','bm198-overview-top'),ic=e('span','bm198-overview-icon');ic.append(icon('book'));
 const labels=e('div');labels.append(e('h4','','Quadro informativo do cartão'),e('p','','Resumo consultivo dos 11 módulos apresentados acima'));
 top.append(ic,labels);overview.append(top);
 const scroll=e('div','bm198-table-scroll'),table=e('table','bm198-overview-table'),thead=e('thead'),tr=e('tr');
 ['Ponto de revisão','Informação do cartão','Seção'].forEach(x=>tr.append(e('th','',x)));
 thead.append(tr);const tbody=e('tbody'),jump=[];
 for(const [role,re,fallback,symbol] of roles){
  let idx=layers.findIndex(x=>re.test(x.titulo));if(idx<0)idx=fallback;
  const row=e('tr'),head=e('th','bm198-topic'),cell=e('td'),link=e('td');
  head.append(icon(symbol),document.createTextNode(role));cell.textContent=excerpt(layers[idx].texto,role);
  const b=e('button','bm198-jump','Mód. '+String(idx+1).padStart(2,'0'));b.type='button';
  b.setAttribute('aria-label','Ir para '+sectionName(layers[idx],idx));
  link.append(b);row.append(head,cell,link);tbody.append(row);jump.push({idx,b});
 }
 table.append(thead,tbody);scroll.append(table);overview.append(scroll);
 overview.append(e('p','bm198-note','Trechos dos módulos, sem substituir a explicação integral ou a consulta às fontes.'));
 const sections=[],moduleGroup=e('div','bm198-modules');
 for(const [i,layer] of layers.entries()){
  const n=e('section','bm198-module'),bar=e('div','bm198-module-head'),num=e('span','bm198-number',String(i+1).padStart(2,'0'));
  const ico=e('span','bm198-section-icon'),name=sectionName(layer,i);ico.append(icon(sectionIcon(name)));
  bar.append(num,ico,e('h4','bm198-module-title',name));const body=e('div','bm198-module-body');
  drawText(body,layer.texto);n.append(bar,body);moduleGroup.append(n);sections.push(n);
 }
 // Regra permanente: onze módulos primeiro; quadro informativo somente no final.
 frag.append(moduleGroup,overview);host.replaceChildren(frag);
 jump.forEach(({idx,b})=>b.addEventListener('click',()=>sections[idx]?.scrollIntoView?.({behavior:'smooth',block:'start'})));
 return {modules:sections.length,tableRows:roles.length};
}
window.BM198Format=Object.freeze({render,version:'V198',source:'Quadro por excertos literais; textos completos preservados'});
})();