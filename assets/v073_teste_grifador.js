/* V073 — verificação local, somente leitura, da seleção e recuperação de grifos. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const tools=$('pdfLocalTools'),dlg=$('pdfDialog');
if(!tools||!dlg||$('bm073TestButton'))return;
const btn=document.createElement('button');
btn.id='bm073TestButton';btn.type='button';btn.textContent='✓ Verificar grifos';
btn.title='Diagnóstico sem alterações de dados, páginas ou PDF original';
const result=document.createElement('div');
result.id='bm073TestResults';result.hidden=true;result.setAttribute('role','status');result.setAttribute('aria-live','polite');
tools.append(btn,result);
const hasValidBox=b=>Array.isArray(b)&&b.length===4&&b.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&b[2]>b[0]&&b[3]>b[1];
function run(){
 const api=window.BancoMestrePDFV042;
 result.replaceChildren();result.hidden=false;
 const findings=[];
 const add=(state,title)=>findings.push({state,title});
 if(!api?.editing){add('pendente','Abra um PDF no modo de edição antes do teste.')}
 else{
  const page=api.currentPage,id=api.currentId,hash=api.sourceHash;
  const canvas=$('pdfLocalCanvas'),wrap=$('pdfPageWrap');
  const layer=wrap?.querySelector('.bm-v061-text-layer');
  const cvs=canvas?.getBoundingClientRect(),div=layer?.getBoundingClientRect();
  const sameSize=!!(div&&cvs&&Math.abs(cvs.width-div.width)<3&&Math.abs(cvs.height-div.height)<3);
  add(layer&&layer.isConnected&&sameSize?'ok':'atencao',
   'Camada selecionável '+(sameSize?'alinhada ao PDF':'não alinhada ou indisponível; tente reabrir a página'));
  const count=layer?.querySelectorAll('span').length||0;
  add(count?'ok':'pendente',count+' bloco(s) de texto selecionável nesta página');
  add(api.currentTool==='select'?'ok':'pendente',
   api.currentTool==='select'?'Grifador de palavras ativo':'Ative Grifar palavras para testar a seleção');
  let marks=[];let readable=false;
  try{
   const key='BM030_STROKES_PDF:'+id+':'+hash+':P'+page;
   const saved=JSON.parse(localStorage.getItem(key)||'[]');
   if(Array.isArray(saved)){marks=saved;readable=true}
  }catch{}
  add(readable?'ok':'atencao','Grifos da página: '+(readable?'armazenamento legível':'JSON local inválido; faça backup antes de qualquer correção'));
  const textMarks=marks.filter(m=>m?.type==='text_highlight');
  const invalid=textMarks.filter(m=>!m?.id||!Array.isArray(m.rects)||!m.rects.length||m.rects.some(b=>!hasValidBox(b)));
  const ids=textMarks.map(m=>m.id),duplicates=ids.length-new Set(ids).size;
  add(invalid.length||duplicates?'atencao':'ok',
   textMarks.length+' grifo(s) de texto; '+invalid.length+' âncora(s) inválida(s); '+duplicates+' ID(s) repetido(s)');
  const multiline=textMarks.filter(m=>new Set((m.rects||[]).filter(hasValidBox).map(b=>Math.round(b[1]*100))).size>1).length;
  add(multiline?'ok':'pendente',multiline+
    ' grifo(s) em mais de uma linha. Para testar, selecione uma frase que atravesse duas linhas, salve e execute novamente.');
  add('pendente','Teste zoom e reabertura: altere o zoom, feche/reabra este PDF e confira se os mesmos trechos continuam posicionados.');
  add(typeof api.goToPage==='function'?'ok':'atencao',
    'Navegação por página '+(typeof api.goToPage==='function'?'disponível':'indisponível'));
 }
 const summary=findings.reduce((a,x)=>(a[x.state]=(a[x.state]||0)+1,a),{});
 const intro=document.createElement('strong');intro.textContent='Verificação V073: '+(summary.ok||0)+' OK, '+(summary.atencao||0)+' atenção, '+(summary.pendente||0)+' pendente(s)';
 result.append(intro);
 for(const x of findings){
  const p=document.createElement('p');p.textContent=(x.state==='ok'?'✓ ':x.state==='atencao'?'! ':'• ')+x.title;
  p.className='bm073-'+x.state;result.append(p);
 }
 return {summary,findings};
}
btn.addEventListener('click',run);
window.BancoMestreTesteGrifadorV073={run};
})();