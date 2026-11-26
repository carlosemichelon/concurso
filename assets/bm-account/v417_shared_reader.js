(()=>{'use strict';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n};
const ids=new Set(Array.from({length:43},(_,i)=>'CARD-'+(1560+i)));let records=null,loading;const legacyIds=new Set(["CARD-0052","CARD-0082","CARD-0097","CARD-0123","CARD-0152","CARD-0163","CARD-0168","CARD-0185","CARD-0186","CARD-0188","CARD-0190","CARD-0199","CARD-0203","CARD-0208","CARD-0213","CARD-0230","CARD-0267","CARD-0308","CARD-0381","CARD-0388","CARD-0404","CARD-0424","CARD-0432","CARD-0445","CARD-0449","CARD-0450","CARD-0454","CARD-0457","CARD-0479","CARD-0482","CARD-0500","CARD-0518","CARD-0521","CARD-0529","CARD-0543","CARD-0547","CARD-0548","CARD-0549","CARD-0551","CARD-0552","CARD-0553","CARD-0567","CARD-0570","CARD-0578","CARD-0587","CARD-0603","CARD-0606","CARD-0610","CARD-0611","CARD-0622","CARD-0623","CARD-0625","CARD-0626","CARD-0628","CARD-0629","CARD-0631","CARD-0632","CARD-0633","CARD-0637","CARD-0638","CARD-0641","CARD-0642","CARD-0643","CARD-0645","CARD-0683","CARD-0688","CARD-0690","CARD-0694","CARD-0697","CARD-0700","CARD-0709","CARD-0720","CARD-0728","CARD-0731","CARD-0732","CARD-0751","CARD-0752","CARD-0753","CARD-0755","CARD-0806","CARD-0857","CARD-0858","CARD-0924","CARD-0949","CARD-0976","CARD-0999","CARD-1000","CARD-1002","CARD-1003","CARD-1027","CARD-1028","CARD-1033","CARD-1034","CARD-1053","CARD-1062","CARD-1064","CARD-1065","CARD-1066","CARD-1071","CARD-1072","CARD-1087","CARD-1089","CARD-1093","CARD-1096","CARD-1122","CARD-1140","CARD-1141","CARD-1142","CARD-1143","CARD-1155","CARD-1212","CARD-1304","CARD-1306","CARD-1319","CARD-1320","CARD-1364","CARD-1378","CARD-1379","CARD-1380","CARD-1381","CARD-1385","CARD-1386","CARD-1399","CARD-1413","CARD-1432","CARD-1434","CARD-1435","CARD-1487","CARD-1521","CARD-1523","CARD-1526","CARD-1527","CARD-1528","CARD-1529","CARD-1530","CARD-1531","CARD-1532","CARD-1533","CARD-1534","CARD-1535","CARD-1536","CARD-1537","CARD-1538","CARD-1539","CARD-1540","CARD-1541","CARD-1542","CARD-1543","CARD-1544","CARD-1545","CARD-1546","CARD-1547","CARD-1548","CARD-1549","CARD-1550","CARD-1551","CARD-1552","CARD-1553","CARD-1554","CARD-1555","CARD-1556","CARD-1557","CARD-1558","CARD-1559"]);for(const id of legacyIds)ids.add(id);const previousLayers=window.BM276LayerData;
const packets=[['assets/petro28_sync_v345.json','approved'],['assets/petro24_regularizacao_v346.json','profiles'],['assets/petro20_29_delta_v347.json','profiles']];let history={};
function load(){return loading||(loading=Promise.all([fetch('assets/restauracao_didatica_v349.json').then(r=>{if(!r.ok)throw Error('Conteúdo restaurado indisponível');return r.json()}),fetch('assets/restauracao_legados_v349.json').then(r=>{if(!r.ok)throw Error('Cartões antigos restaurados indisponíveis');return r.json()}),...packets.map(([p])=>fetch(p).then(r=>{if(!r.ok)throw Error('Histórico indisponível');return r.json()}))]).then(([d,l,...old])=>{records={...d.cards,...l.cards};for(let i=0;i<old.length;i++){const p=old[i];for(const [id,r] of Object.entries(p[packets[i][1]]||{}))if(ids.has(id)){history[id]={card:p.new_cards.find(x=>x.id===id),profile:r};}}if(Object.keys(records).length!==ids.size||[...ids].some(id=>!records[id])||Object.keys(history).length!==43)throw Error('Pacote incompleto');return records}).catch(e=>{loading=null;throw e}));}
function marked(text,marks){const p=el('p');const s=String(text);let i=0;const choices=(marks||[]).slice().sort((a,b)=>b.text.length-a.text.length);const used=new Set();while(i<s.length){let found=null,at=s.length;for(const m of choices){if(used.has(m.text))continue;const j=s.indexOf(m.text,i);if(j>=0&&j<at){found=m;at=j}}if(!found){p.append(document.createTextNode(s.slice(i)));break}if(at>i)p.append(document.createTextNode(s.slice(i,at)));const mark=el('mark',s.slice(at,at+found.text.length),found.kind+(found.bold&&found.error_evidence?' error':''));mark.dataset.category=found.kind;p.append(mark);used.add(found.text);i=at+found.text.length}return p}
function mathNode(xml){const doc=new DOMParser().parseFromString(xml,'application/xml'),n=doc.documentElement;const allowed=new Set(['math','mrow','mi','mn','mo','mtext','msub','msup','mfrac','msqrt','mspace','msubsup','mover']);if(n.localName!=='math'||n.namespaceURI!=='http://www.w3.org/1998/Math/MathML'||[n,...n.querySelectorAll('*')].some(x=>!allowed.has(x.localName)||[...x.attributes].some(a=>!['xmlns','display','mathvariant','width'].includes(a.name))))throw Error('MathML inválido');return document.importNode(n,true)}
// Convert only an exact, unambiguous match to an already authored MathML formula.
function inlineMathText(n){
 const children=[...n.children],parts=()=>children.map(inlineMathText);
 const sub={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
 const sup={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
 if(['mi','mn','mo'].includes(n.localName))return n.textContent.trim();
 if(n.localName==='math'||n.localName==='mrow'){const a=parts();return a.every(x=>x!==null)?a.join(''):null;}
 if(n.localName==='msub'||n.localName==='msup'){
  if(children.length!==2)return null;const a=parts();if(!a[0]||!/^[0-9]+$/.test(a[1]||''))return null;
  const map=n.localName==='msub'?sub:sup;return a[0]+[...a[1]].map(x=>map[x]).join('');
 }
 if(n.localName==='mfrac'){
  const a=parts();if(a.length!==2||a.some(x=>!x||!/^[\p{L}\p{N}.,₀-₉⁰¹²³⁴⁵⁶⁷⁸⁹]+$/u.test(x)))return null;
  return a[0]+'/'+a[1];
 }
 return null;
}
function renderExactInlineMath(p,formulas,marks){
 const matches=[];
 for(const f of formulas||[]){try{
  const math=mathNode(f.mathml),literal=inlineMathText(math);
  if(literal&&literal.length>=5&&literal.includes('='))matches.push({math,literal});
 }catch{}}
 if(!matches.length)return p;
 // Keep all existing highlight elements; replace text only within a single text node.
 const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 matches.sort((a,b)=>b.literal.length-a.literal.length);
 for(const n of nodes){
  const text=n.nodeValue||'';let at=0,changed=false;const fragment=document.createDocumentFragment();
  while(at<text.length){
   let best=null,pos=text.length;
   for(const m of matches){const k=text.indexOf(m.literal,at);if(k>=0&&k<pos){best=m;pos=k}}
   if(!best){fragment.append(document.createTextNode(text.slice(at)));break;}
   changed=true;fragment.append(document.createTextNode(text.slice(at,pos)));
   const math=best.math.cloneNode(true);math.setAttribute('display','inline');math.setAttribute('aria-label',best.literal);math.style.verticalAlign='middle';
   window.BM417Math?.decorate(math,marks||[]);fragment.append(math);at=pos+best.literal.length;
  }
  if(changed)n.replaceWith(fragment);
 }
 return p;
}
function formula(f,marks){const b=el('div',undefined,'formula');if(f.title)b.append(el('div',f.title,'formula-label'));const equation=el('div',undefined,'formula-equation');const math=mathNode(f.mathml);window.BM417Math?.decorate(math,marks||[]);equation.append(math);b.append(equation);if(f.units)b.append(el('small',f.units,'formula-units'));return b}
function table(t){const s=el('section');s.append(el('h2',t.title));const w=el('div',undefined,'table-wrap');w.tabIndex=0;w.setAttribute('aria-label',t.title);const tb=el('table'),head=el('thead'),hr=el('tr');for(const h of t.headers){const th=el('th',h);th.scope='col';hr.append(th)}head.append(hr);tb.append(head);const b=el('tbody');for(const row of t.rows){const tr=el('tr');row.forEach((v,i)=>{const cell=el(i===0?'th':'td');if(i===0)cell.scope='row';if(v&&typeof v==='object'&&v.mathml)cell.append(mathNode(v.mathml));else cell.textContent=v;tr.append(cell)});b.append(tr)}tb.append(b);w.append(tb);s.append(w);return s}
function safeLink(url){try{const u=new URL(url);return u.protocol==='https:'||u.protocol==='http:'}catch{return false}}

// Private map is looked up by name inside the authenticated user's own Drive.
// No private IDs or bytes are embedded in the public data.
const mediaMapName='CAND_V349_MAPA_PRIVADO_DE_MIDIAS_43_CARTOES.json';
let mapToken='',mapPromise=null;
const currentToken=()=>window.BMVS41PrivateReviews?.sessionKey()||'';
function privateMap(token){if(!token)throw Error('Conecte o Google Drive pelo cabeçalho.');if(token!==mapToken){mapToken=token;mapPromise=null;}return mapPromise||(mapPromise=(async()=>{const headers={Authorization:'Bearer '+token};const q="name = '"+mediaMapName+"' and trashed = false";const u='https://www.googleapis.com/drive/v3/files?'+new URLSearchParams({q,fields:'files(id,name,modifiedTime),nextPageToken',orderBy:'modifiedTime desc',pageSize:'100'});const res=await fetch(u,{headers,cache:'no-store'});if(!res.ok)throw Error('Consulta do índice privado: HTTP '+res.status);const list=await res.json();if(list.files?.length!==1||list.nextPageToken)throw Error(list.files?.length?'Mais de um índice privado encontrado; escolha uma fonte única no Drive.':'Índice privado não localizado nesta conta.');const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(list.files[0].id)+'?alt=media',{headers,cache:'no-store'});if(!r.ok)throw Error('Índice privado indisponível: HTTP '+r.status);const d=await r.json();if(!d.cards||typeof d.cards!=='object')throw Error('Índice privado inválido.');return d.cards})().catch(e=>{mapPromise=null;throw e}));}
const privateURLs=new Map();function revokePrivate(node){const url=privateURLs.get(node);if(url){URL.revokeObjectURL(url);privateURLs.delete(node);}}
const privateCleanup=new MutationObserver(()=>{for(const n of privateURLs.keys())if(!n.isConnected||!currentToken()||currentToken()!==mapToken){revokePrivate(n);n.querySelector('.bm349-private-preview')?.remove();const st=n.querySelector('[data-private-state]');if(st){st.dataset.privateState='PENDENTE';st.textContent='Acesso privado encerrado. Conecte novamente o Drive.';}}});
privateCleanup.observe(document.body,{childList:true,subtree:true});
function privateFigure(f,m){
 const b=el('button',m.editorialStatic?'Exibir figura':'Exibir original do Drive','secondary zoom');b.type='button';const status=el('small',' Acesso restrito à conta autorizada.');status.dataset.privateState='PENDENTE';f.append(b,status);
 const cardId=m.private_card_id;
 b.onclick=async()=>{let obj;b.disabled=true;status.dataset.privateState='CARREGANDO';status.textContent='Consultando o arquivo privado…';
  try{const blob=await window.BMVS41PrivateMedia.read(cardId,m.id,!!m.editorialStatic);if(!(/^image\/(png|jpeg|webp|gif)$/.test(blob.type)||(m.editorialStatic&&blob.type==='image/svg+xml')))throw Error('Formato inválido');
   if(!f.isConnected)return;obj=URL.createObjectURL(blob);const im=el('img');im.alt=m.alt||m.caption;im.src=obj;await im.decode();
   if(!f.isConnected){URL.revokeObjectURL(obj);return;}revokePrivate(f);privateURLs.set(f,obj);mapToken=currentToken();f.querySelector('.bm349-private-preview')?.remove();
   const wrap=el('div',undefined,'diagram bm349-private-preview');wrap.append(im);status.before(wrap);status.dataset.privateState='CARREGADA';status.textContent='Original carregado nesta sessão autorizada.';b.textContent=m.editorialStatic?'Recarregar figura':'Recarregar original';obj=null;
  }catch(e){if(obj)URL.revokeObjectURL(obj);status.dataset.privateState='BLOQUEADO';status.textContent=e.message}finally{b.disabled=false}
 };
 }
function figure(m){const f=el('figure');f.dataset.mediaId=m.id;f.dataset.role=m.role;const im=el('img'),wrap=el('div',undefined,'diagram'),zoom=el('button','Ampliar figura','secondary zoom');if(typeof m.src==='string'&&(m.src.startsWith('data:image/svg+xml;charset=utf-8,')||/^assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.svg$/.test(m.src))){im.src=m.src;im.alt=m.alt||m.caption;wrap.append(im);zoom.type='button';zoom.setAttribute('aria-expanded','false');zoom.onclick=()=>{const expanded=wrap.classList.toggle('expanded');zoom.setAttribute('aria-expanded',String(expanded));zoom.textContent=expanded?'Reduzir figura':'Ampliar figura'};f.append(wrap,el('figcaption',m.caption),zoom)}else{f.append(el('figcaption',m.caption+' — original preservado no acervo privado; a exibição requer acesso autorizado.'))}if(m.private_original)privateFigure(f,m);if(false&&safeLink(m.url)){const a=el('a','Arquivo de origem no Drive');a.href=m.url;a.target='_blank';a.rel='noopener noreferrer';a.className='origin';f.append(a)}return f}
function details(title,content,cls=''){const det=el('details',undefined,cls),box=el('div');det.append(el('summary',title));if(typeof content==='string')box.append(el('p',content));else box.append(content);det.append(box);return det}
// Histórico: preserve o texto original no JSON e renderize tabelas Markdown em células reais sem injetar HTML.
function historic(text){const root=el('div',undefined,'historic-content');const lines=String(text||'').split('\n');for(let i=0;i<lines.length;){const l=lines[i].trim();if(l.startsWith('|')&&i+1<lines.length&&/^\s*\|[\s:|\-]+\|\s*$/.test(lines[i+1])){const cells=s=>s.trim().replace(/^\||\|$/g,'').split('|').map(t=>t.trim().replaceAll('**',''));const headers=cells(l);let rows=[];i+=2;while(i<lines.length&&lines[i].trim().startsWith('|')){const r=cells(lines[i++]);if(r.length===headers.length)rows.push(r);else root.append(el('p',r.join(' | ')))}if(rows.length)root.append(table({title:'Quadro histórico',headers,rows}));continue}i++;if(!l)continue;const stripped=l.replace(/^#{1,6}\s*/,'').replaceAll('**','');root.append(el(l.startsWith('### ')?'h3':'p',stripped))}return root}

async function ensureHistory(id){if(history[id]?.card&&history[id]?.profile)return;if(!legacyIds.has(id))throw Error('Histórico público ausente para '+id);const c=(typeof cards!=='undefined'&&Array.isArray(cards)?cards:[]).find(x=>x.id===id);if(!c)throw Error('Cartão original indisponível no catálogo: '+id);let p=null;try{p=await previousLayers?.get?.(id)}catch(e){console.warn('Ponte de histórico indisponível',id,e)}if(!p||p.layers?.length!==11)p=await window.BM194VersosPublicos?.load?.(id);if(!p||p.layers?.length!==11)throw Error('Onze módulos históricos indisponíveis: '+id);history[id]={card:c,profile:{...p,source:c.reference}};}
function build(id){const r=records[id],m=r.learning_model,h=history[id];const a=el('article',undefined,'bm349-reading');a.dataset.bm349Card=id;a.append(el('h3',r.title));if(m.literal_text){const b=el('section',undefined,'literal');b.append(el('div','Texto legal literal','formula-label'));for(const p of m.literal_text.split('\n'))b.append(marked(p,m.literal_marks));a.append(b)}for(const b of m.sequence){const k=b.index;if(b.type==='paragraph')a.append(marked(m.paragraphs[k],m.marks));else if(b.type==='formula')a.append(formula(m.formula.items[k],m.marks));else if(b.type==='table')a.append(table(m.table.items[k]));else if(b.type==='media')a.append(figure(m.media.items[k]));}a.append(details('Macete',m.mnemonic),details('Recuperação adicional — sem gabarito',m.transfer_question));const source=el('div');source.append(el('p',m.source_note));for(const s of m.sources||[]){if(!safeLink(s.url))continue;const link=el('a',s.label||s.url);link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';const p=el('p');p.append(link);source.append(p)}source.append(el('p',h.profile.source||h.card.reference));a.append(details('Fundamento e fontes',source));const hist=el('div');hist.append(el('h4','Frente e verso anteriores'),historic(h.card.front),historic(h.card.back),el('h4','Explicação anterior'),historic(h.card.expl),el('h4','Onze módulos históricos'));for(const l of h.profile.layers){const section=el('section',undefined,'historic-module');section.dataset.ord=l.ord;section.append(el('h4',l.titulo),historic(l.texto));hist.append(section)}a.append(details('Resposta evolutiva integral',hist,'evolution'));const rel=el('div');for(const next of r.related_card_ids){const b=el('button',next+' · consultar na lateral','bm349-related');b.type='button';b.dataset.cardId=next;b.onclick=()=>window.BM317RelatedNavigator?.openReferenced?.(next);rel.append(b)}if(rel.children.length)a.append(details('Cartões relacionados',rel));return a;}

// Consolidated profiles are compiled into the existing immutable catalog.
// No observer, extra request, SRS write or second catalog in the browser.
let consolidatedIndex=null,consolidatedSource=null;
function consolidated(id){
 const list=typeof cards!=='undefined'&&Array.isArray(cards)?cards:null;
 if(!list)return null;
 if(list!==consolidatedSource){consolidatedSource=list;consolidatedIndex=new Map(list.filter(c=>c.consolidation?.profile).map(c=>[c.id,c]));}
 return consolidatedIndex.get(id)||null;
}
function consolidatedProfile(id){return consolidated(id)?.consolidation?.profile||null;}
function buildConsolidated(id){
 const c=consolidated(id),r=c.consolidation.profile,m=r.editorial;
 const a=el('article',undefined,'bm349-reading');a.dataset.bm349Card=id;a.dataset.bmConsolidated=id;
 a.append(el('h3',r.title));
 const addParagraphs=(text,paragraphs,tag=false)=>{const blocks=Array.isArray(paragraphs)&&paragraphs.join('\n\n')===text?paragraphs:String(text||'').split(/\r?\n(?:[ \t]*\r?\n)*/);for(const block of blocks){if(!block.trim())continue;const p=marked(block,m.highlights);if(tag){p.dataset.bmAnswerParagraph='true';renderExactInlineMath(p,m.formulas,m.highlights);}a.append(p,document.createTextNode('\n\n'));}};
 addParagraphs(r.back,m.answer_paragraphs,true);
 if(c.group==='PORTUGUES')a.append(el('h2','Como aplicar'));
 addParagraphs(r.modules[3].texto);
 for(const x of m.media||[]){
  if(x.role!=='VERSO_APOS_TENTATIVA')continue;
  // Inline SVG is used as an inert image, never inserted as executable DOM.
  const src=x.inline_svg?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x.inline_svg):x.src;
  if(src||x.private_original)a.append(figure({...x,id:x.id,role:x.role,caption:x.caption||x.id,src,private_card_id:id}));
 }
 if(m.table&&Array.isArray(m.table.headers)&&Array.isArray(m.table.rows)){
  try{a.append(table({...m.table,title:m.table.title||'Quadro comparativo'}));}catch(e){a.append(details('Quadro comparativo — texto',r.modules[5].texto));}
 }else if(r.modules[5]?.texto){a.append(el('h2','Comparação'),marked(r.modules[5].texto,m.highlights));}
 for(const f of m.formulas||[]){try{a.append(formula(f,m.highlights));}catch(e){const fallback=el('div',undefined,'formula');fallback.append(el('div',f.title||'Fórmula','formula-label'),el('p',r.modules[4].texto),el('small',f.units||'','formula-units'));a.append(fallback);}}
 a.append(details('Critérios e unidades',r.modules[4].texto),el('h2','Aplicação e transferência'));addParagraphs(r.modules[6].texto);
 a.append(details('Condições e exceções',r.modules[8].texto),details('Pegadinhas',r.modules[9].texto),details('Macete',r.mnemonic));
 a.append(details('Fundamento e fontes',r.source));
 const hist=el('div');
 for(const layer of r.modules){const block=el('section',undefined,'historic-module');block.dataset.ord=layer.ord;block.append(el('h4',layer.ord+' · '+layer.titulo),historic(layer.texto));hist.append(block);}
 const original=c.consolidation.original;
 if(original){hist.append(el('h4','Versão anterior do núcleo'),historic(original.front),historic(original.back),historic(original.expl));}
 hist.append(el('p','IDs históricos preservados: '+c.consolidation.historical_ids.join(', ')));
 a.append(details('Resposta evolutiva integral — 11 módulos e histórico',hist,'evolution'));
 const related=el('div');
 for(const next of c.related_card_ids||[]){const b=el('button',next+' · consultar na lateral','bm349-related');b.type='button';b.dataset.cardId=next;b.onclick=()=>window.BM317RelatedNavigator?.openReferenced?.(next);related.append(b);}
 if(related.children.length)a.append(details('Cartões relacionados',related));
 return a;
}

const stamp=new WeakMap();async function renderAnswer(host,id){const token={};stamp.set(host,token);if(consolidated(id)){if(host.isConnected&&!host.closest('[hidden]')){try{host.replaceChildren(buildConsolidated(id));}catch(e){const c=consolidated(id),p=c.consolidation.profile,fallback=el('article',undefined,'bm349-reading');fallback.dataset.bm349Card=id;fallback.dataset.bmConsolidated=id;fallback.dataset.renderFallback='true';fallback.append(el('h3',p.title),el('p',p.back));for(const layer of p.modules||[]){if(layer.ord===1||layer.ord===2)continue;fallback.append(details(layer.titulo,layer.texto));}fallback.append(el('small','Parte da apresentação gráfica não pôde ser exibida; conteúdo textual preservado.'));host.replaceChildren(fallback);console.warn('Falha de apresentação consolidada',id,e);}}return;}host.replaceChildren(el('p','Cartão não disponível no perfil.'));return;try{await load();await ensureHistory(id);if(host.isConnected&&stamp.get(host)===token&&!host.closest('[hidden]')&&(!host.matches('.bm-v050-peek-answer')||window.BancoMestreVisualizarCardV050?.currentId===id))host.replaceChildren(build(id));}catch(e){if(host.isConnected&&stamp.get(host)===token)host.replaceChildren(el('p','Falha ao carregar: '+e.message));}}
async function renderFront(host,id){const token={};stamp.set(host,token);host.replaceChildren();if(consolidated(id)){for(const m of consolidatedProfile(id).editorial.media||[])if(m.role==='FRONT_ENUNCIADO'){const src=m.inline_svg?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(m.inline_svg):m.src;if(src||m.private_original)host.append(figure({...m,src,private_card_id:id}));}return;}return;try{await load();if(!host.isConnected||stamp.get(host)!==token)return;const r=records[id];for(const m of r.learning_model.media.items||[])if(m.role==='FRONT_ENUNCIADO')host.append(figure(m))}catch(e){if(host.isConnected&&stamp.get(host)===token)host.append(el('p','Dados gráficos indisponíveis: '+e.message))}}
const prev=window.BM198Format;if(prev?.render){window.BM198Format=Object.freeze({...prev,render(host,rec,id,...rest){if(!consolidated(id))return prev.render(host,rec,id,...rest);void renderAnswer(host,id);return {modules:11,srsChanged:false,version:'V349-CANDIDATO'};}})}
window.BM349=Object.freeze({has:id=>!!consolidated(id),get:id=>consolidatedProfile(id),load:id=>consolidated(id)?Promise.resolve(consolidatedProfile(id)):Promise.reject(Error('Cartão fora do perfil')),renderAnswer,renderFront});
// Pacotes de restauração carregados somente quando um cartão correspondente é aberto.
})();
