import {PublicEvolutiveReader,presentationLayers,isDeferred,DISPLAY_ORDER} from './evolutive.js';

/* Apresentação técnica V2, independente dos módulos legados.
 * As 11 seções começam recolhidas e são consultadas só por solicitação do estudante.
 * Ordem visual 08,04,05,06,09,10,01,02,03,07,11; a ordem canônica é preservada.
 */
const el=(tag,cls='',content)=>{
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(content!==undefined)n.textContent=String(content);
  return n;
};
const readers=new WeakMap();
function readerFor(meta) {
  if(!readers.has(meta))readers.set(meta,new PublicEvolutiveReader(meta));
  return readers.get(meta);
}
function appendInline(target,content){
  const value=String(content||''),pattern=/\*\*([^*\n]+)\*\*/g;
  let previous=0,match;
  while((match=pattern.exec(value))){
    if(match.index>previous)target.append(document.createTextNode(value.slice(previous,match.index)));
    target.append(el('strong','',match[1]));
    previous=match.index+match[0].length;
  }
  if(previous<value.length)target.append(document.createTextNode(value.slice(previous)));
}
function splitPipes(value){
  const cells=[];
  let buffer='',escaped=false;
  for(const char of String(value)){
    if(escaped){buffer+=char==='|'?'|':'\\'+char;escaped=false;continue}
    if(char==='\\'){escaped=true;continue}
    if(char==='|'){cells.push(buffer.trim());buffer='';continue}
    buffer+=char;
  }
  if(escaped)buffer+='\\';
  cells.push(buffer.trim());
  if(cells[0]==='')cells.shift();
  if(cells[cells.length-1]==='')cells.pop();
  return cells;
}
function isSeparator(line){
  const values=splitPipes(line);
  return values.length>1 && values.every(x=>/^:?-{3,}:?$/.test(x));
}
function isTable(lines,index){
  return index+1<lines.length &&
    lines[index].trim().startsWith('|') &&
    isSeparator(lines[index+1].trim());
}
function listKind(line){
  if(/^\s*(?:[-*•])\s+\S/.test(line))return 'ul';
  if(/^\s*\d+[.)]\s+\S/.test(line))return 'ol';
  return '';
}
function renderBody(host,source){
  const lines=String(source||'').replace(/\r/g,'').split('\n');
  let offset=0,paragraph=[];
  function flush(){
    if(!paragraph.length)return;
    const body=el('p','v2-evo-paragraph');
    appendInline(body,paragraph.join('\n'));
    host.append(body);paragraph=[];
  }
  while(offset<lines.length){
    const line=lines[offset],trim=line.trim();
    if(!trim){flush();offset++;continue}
    if(isTable(lines,offset)){
      flush();
      const headers=splitPipes(line);
      const wrap=el('div','v2-evo-table-scroll');
      const table=el('table','v2-evo-table');
      const thead=el('thead'),tr=el('tr');
      for(const heading of headers){const th=el('th');appendInline(th,heading);tr.append(th)}
      thead.append(tr);table.append(thead);
      const tbody=el('tbody');offset+=2;
      while(offset<lines.length&&lines[offset].trim().startsWith('|')){
        const row=el('tr'),values=splitPipes(lines[offset]);
        for(let i=0;i<headers.length;i++){
          const td=el('td');appendInline(td,values[i]||'');row.append(td);
        }
        tbody.append(row);offset++;
      }
      table.append(tbody);wrap.append(table);host.append(wrap);continue;
    }
    if(/^#{2,5}\s+\S/.test(trim)){
      flush();host.append(el('h5','v2-evo-subtitle',trim.replace(/^#{2,5}\s+/,'')));offset++;continue;
    }
    const kind=listKind(line);
    if(kind){
      flush();const list=el(kind,'v2-evo-list');
      while(offset<lines.length&&listKind(lines[offset])===kind){
        const li=el('li');
        appendInline(li,lines[offset].replace(kind==='ol'?/^\s*\d+[.)]\s+/:/^\s*[-*•]\s+/,''));
        list.append(li);offset++;
      }
      host.append(list);continue;
    }
    if(trim.endsWith(':')&&trim.length<130&&trim===trim.toLocaleUpperCase('pt-BR')&&
       /[A-ZÀ-Ý]{4,}/.test(trim)){
      flush();host.append(el('h5','v2-evo-subtitle',trim.slice(0,-1)));offset++;continue;
    }
    paragraph.push(line);offset++;
  }
  flush();
}
function cleanTitle(label){
  return String(label||'').trim().replace(/^\d{1,2}\s*[-—–.:·]\s*/,'').trim();
}
function renderRecord(host,record){
  const ordered=presentationLayers(record),fragment=document.createDocumentFragment();
  const heading=el('div','v2-evo-reader-head');
  heading.append(
    el('strong','','11 módulos técnicos · apresentação priorizada'),
    el('span','muted','Ordem original dos módulos e textos integrais preservados')
  );
  const selectLabel=el('label','', 'Ir para módulo');selectLabel.htmlFor='v2-evo-jump-'+record.id;
  const select=el('select','v2-evo-select');select.id=selectLabel.htmlFor;
  const defaultOption=el('option','','Escolher seção');defaultOption.value='';select.append(defaultOption);
  const sections=[];
  const group=el('div','v2-evo-modules');
  for(const layer of ordered){
    const module=el('details','v2-evo-module');
    const summary=el('summary','v2-evo-summary');
    const number=el('b','v2-evo-number',String(layer.displayOrd).padStart(2,'0'));
    const title=el('span','v2-evo-title',cleanTitle(layer.title));
    const sourceOrd=el('small','v2-evo-source','Fonte '+String(layer.sourceOrd).padStart(2,'0'));
    summary.append(number,title,sourceOrd);
    const content=el('div','v2-evo-content');
    renderBody(content,layer.text);
    module.append(summary,content);
    group.append(module);sections.push(module);
    const option=el('option','',String(layer.displayOrd).padStart(2,'0')+' · '+cleanTitle(layer.title));
    option.value=String(layer.displayOrd-1);select.append(option);
  }
  select.addEventListener('change',()=>{
    if(select.value==='')return;
    const target=sections[Number(select.value)];if(!target)return;
    target.open=true;target.scrollIntoView({behavior:'auto',block:'nearest'});
  });
  heading.append(selectLabel,select);
  fragment.append(heading,group);
  host.replaceChildren(fragment);
  return {count:sections.length,originalOrder:DISPLAY_ORDER};
}
export function attachEvolutive(answer,id,meta){
  if(!answer||!id)return;
  const details=el('details','v2-evo-panel');
  details.dataset.cardId=id;
  const summary=el('summary','v2-evo-main-summary',
    isDeferred(id)?'Aprofundamentos reservados para homologação':
      'Abrir aprofundamento técnico · 11 módulos');
  const host=el('div','v2-evo-host');
  details.append(summary,host);
  answer.append(details);
  let loaded=false,loading=false,reader=null;
  async function load(){
    if(loaded||loading)return;
    if(isDeferred(id)){
      host.replaceChildren(el('p','v2-evo-help',
        'Este cartão está reservado na base V194. A pergunta e o verso original permanecem disponíveis; não serão criados módulos fictícios.'));
      loaded=true;return;
    }
    try{reader=readerFor(meta)}
    catch(error){
      host.replaceChildren(el('p','v2-evo-error','Não foi possível validar o manifesto: '+error.message));
      return;
    }
    loading=true;
    host.replaceChildren(el('p','v2-evo-help','Carregando o lote técnico original de '+id+'...'));
    try{
      const result=await reader.load(id);
      if(!details.isConnected)return;
      if(!result.record){
        host.replaceChildren(el('p','v2-evo-help',
          'Não há 11 módulos homologados para este ID no catálogo público. O verso original permanece preservado.'));
      }else{
        const view=renderRecord(host,result.record);
        if(view.count!==11)throw Error('A apresentação não contém 11 módulos');
      }
      loaded=true;
    }catch(error){
      if(!details.isConnected)return;
      const retry=el('button','v2-evo-retry','Tentar novamente');retry.type='button';
      retry.addEventListener('click',()=>{reader?.retry(id);void load()});
      host.replaceChildren(el('p','v2-evo-error','Falha ao carregar os aprofundamentos: '+error.message),retry);
    }finally{loading=false}
  }
  details.addEventListener('toggle',()=>{if(details.open)void load()});
}
