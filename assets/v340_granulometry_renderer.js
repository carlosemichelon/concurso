/* V340 — escala de solos, peneiras 10+6 e imagem original do estudante.
 * Imagem original mantida em Drive privado; representação A4 derivada é pública.
 * Front sem antecipar gabarito; resposta-modelo, cores e figura no verso.
 * IDs, histórico, vínculos e SRS permanecem preservados. */
(function(){
"use strict";
if(window.BM340Granulometry)return;
const prior=window.BM198Format;
const baseLayers=window.BM276LayerData;
if(!prior?.render||!baseLayers?.get)throw Error("V340: leitor didático indisponível");
const ids=new Set(["CARD-1559","CARD-0751","CARD-0752","CARD-0753"]);
let delta=null,pending=null;
function load(){
 if(!pending)pending=fetch("assets/petro26_granulometry_delta_v340.json?v=340-1",{cache:"no-store"})
  .then(r=>{if(!r.ok)throw Error("V340: pacote de conteúdo não encontrado");return r.json();})
  .then(d=>{
   if(d.format!=="BancoMestrePetro26GranulometryV340"||d.counts?.new_cards!==1||
       d.counts?.updated!==3||Object.keys(d.profiles||{}).length!==4)
    throw Error("V340: contagem inconsistente");
   for(const [id,p] of Object.entries(d.profiles)){
    if(!ids.has(id)||p.layers?.length!==11||!p.front||!p.back||p.paragraphs?.length!==3||
       p.layers.some((l,i)=>l.ord!==i+1||!l.titulo||!l.texto)||
       p.visuals?.length!==1||!p.visuals[0].src?.startsWith("assets/card_visuals_v340/"))
     throw Error("V340: ficha incompleta "+id);
    for(const rel of p.related_card_ids||[])if(ids.has(rel)&&
       !d.profiles[rel]?.related_card_ids.includes(id))throw Error("V340: vínculo não recíproco "+id+"/"+rel);
    for(const f of p.originals||[])if(f.type!=="ORIGINAL_ENVIADO_PELO_USUARIO"||
       !f.drive_file_id||!f.sha256||!f.url?.startsWith("https://drive.google.com/file/"))
     throw Error("V340: original do usuário sem rastreabilidade "+id);
   }
   delta=d;return d;
  }).catch(e=>{pending=null;throw e;});
 return pending;
}
const prevGet=baseLayers.get.bind(baseLayers);
window.BM276LayerData=Object.freeze({...baseLayers,
 has(id){return ids.has(id)||baseLayers.has?.(id)===true},
 async get(id){
  if(!ids.has(id))return prevGet(id);
  const d=await load();
  const previous=(id==="CARD-1559")?null:await prevGet(id);
  return {id,layers:d.profiles[id].layers,prior_layers:previous?.layers||[],
   prior_technical_record:previous||null,updated:"2026-11-22"};
 }
});
const el=(name,cls,txt)=>{const e=document.createElement(name);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;};
const anchors={
 "CARD-1559":[["pedregulho","core"],["20 a 60 mm","condition"],["60 a 200 mm","condition"],["200 mm até 1 m","condition"],["pedregulho grosso (D)","core",true],["pedra-de-mão (E)","exception",true]],
 "CARD-0752":[["série normal","core"],["10 peneiras","condition"],["600, 300 e 150 µm","condition"],["módulo de finura","core"],["série intermediária","agent"]],
 "CARD-0753":[["série intermediária","core"],["seis peneiras","condition"],["63, 50, 31,5, 25, 12,5 e 6,3 mm","condition"],["módulo de finura","agent"]],
 "CARD-0751":[["normal, com 10 aberturas","condition"],["intermediária, com 6","condition"],["pedregulho grosso de 20 a 60 mm","core"],["inferior a 4,75 mm","condition"],["7 kg/m²","condition",true]]
};
function highlight(p,defs){
 let t=(p.textContent||"").replace(/\*\*/g,""),lo=t.toLocaleLowerCase("pt-BR"),loc=[];
 for(const [term,kind,strong] of defs){
  let i=lo.indexOf(term.toLocaleLowerCase("pt-BR"));if(i>=0)loc.push({start:i,end:i+term.length,kind,strong:!!strong});
 }
 loc.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
 let chosen=[];for(const l of loc)if(!chosen.some(c=>l.start<c.end&&l.end>c.start))chosen.push(l);
 if(!chosen.length){p.textContent=t;return 0}
 const frag=document.createDocumentFragment();let off=0;
 for(const m of chosen){
  if(m.start>off)frag.append(document.createTextNode(t.slice(off,m.start)));
  const mark=el("mark","bm339-highlight bm339-"+m.kind);
  mark.title={core:"Núcleo conceitual",agent:"Componente ou agente",condition:"Condição, número ou limite",exception:"Ressalva"}[m.kind];
  const snippet=t.slice(m.start,m.end);
  if(m.strong)mark.append(el("strong","bm339-error",snippet));else mark.textContent=snippet;
  frag.append(mark);off=m.end;
 }
 frag.append(document.createTextNode(t.slice(off)));p.replaceChildren(frag);
 return chosen.length;
}
function mainFor(id,p){
 const root=el("article","bm330-learning bm336-learning bm339-learning bm340-learning");
 root.dataset.bm340Id=id;
 root.append(el("div","bm330-caption","RESPOSTA-MODELO · "+id),el("h3","",p.title));
 const essay=el("div","bm330-essay");let count=0;
 for(const para of p.paragraphs){const n=el("p","bm330-para",para);count+=highlight(n,anchors[id]||[]);essay.append(n)}
 if(!count)throw Error("V340: grifos não aplicados em "+id);
 root.append(essay);
 const visual=p.visuals[0];
 const fig=el("figure","bm339-figure bm340-figure");
 fig.dataset.mediaId=visual.id;fig.dataset.mediaRole="IMAGEM_DO_CARTAO_VERSO";
 const a=el("a","bm339-figure-link");a.href=visual.src;a.target="_blank";a.rel="noopener noreferrer";
 const image=el("img","bm339-image");
 image.src=visual.src;image.alt=visual.alt||visual.caption;
 image.loading="lazy";image.decoding="async";a.append(image);fig.append(a);
 fig.append(el("figcaption","bm339-caption",visual.caption));
 root.append(fig);
 if(p.originals?.length){
  const section=el("div","bm340-original-image");
  section.append(el("h4","","Imagem original da questão e do cartão"));
  for(const m of p.originals){
   const link=el("a","bm340-drive-original","Ver imagem original preservada no Drive");
   link.href=m.url;link.target="_blank";link.rel="noopener noreferrer";
   section.append(link);
   section.append(el("p","bm339-caption",m.caption+" Arquivo privado: vinculado por ID, sem cópia pública nem alteração dos grifos originais."));
  }
  root.append(section);
 }
 if(id==="CARD-1559"){
  const tb=el("div","bm339-table-scroll"),t=el("table","bm339-table");
  const head=el("thead"),hr=el("tr");
  for(const name of ["Grupo","Faixa (mm)"]){const th=el("th","",name);th.scope="col";hr.append(th)}
  head.append(hr);t.append(head);
  const body=el("tbody");
  for(const [a,b] of [["Pedregulho fino","2–6"],["Pedregulho médio","6–20"],["Pedregulho grosso","20–60"],["Pedra-de-mão","60–200"],["Matacão","200–1.000"]]){
   const tr=el("tr"),th=el("th","",a);th.scope="row";tr.append(th,el("td","",b));body.append(tr);
  }
  t.append(body);tb.append(t);root.append(tb);
 }
 if(id==="CARD-0751"||id==="CARD-0752"){
  const area=el("section","bm339-technical bm340-technical");
  area.append(el("h4","",id==="CARD-0751"?"Controle da sobrecarga da peneira":"Módulo de finura do agregado"));
  const eq=el("div","bm339-math"),math=el("div","bm340-mathml");
  const raw=(id==="CARD-0751")
   ?'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><msub><mi>m</mi><mi>máx</mi></msub><mo>=</mo><mn>7</mn><mo>·</mo><mi>S</mi><mspace width="0.5em"/><mtext>kg, se abertura &lt; 4,75 mm</mtext></math>'
   :'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mi>MF</mi><mo>=</mo><mfrac><mrow><mo>∑</mo><mi>R</mi><msub><mi></mi><mi>acum,normal</mi></msub></mrow><mn>100</mn></mfrac></math>';
  math.innerHTML=raw;eq.append(math);area.append(eq);
  area.append(el("p","bm339-table-note",id==="CARD-0751"
   ?"m em quilogramas; S = área efetiva da tela em m². Apenas para aberturas inferiores a 4,75 mm."
   :"R representa os percentuais retidos acumulados nas peneiras da série normal; MF é adimensional."));
  root.append(area);
 }
 root.append(el("p","bm330-note","Fonte: "+p.source+" · Questões: "+p.related_question_ids.join(", ")));
 const legend=el("details","bm339-legend");
 legend.append(el("summary","","Legenda: cores dos grifos"));
 const panel=el("div","bm339-legend-content");
 for(const [kind,t] of [["core","Regra central"],["agent","Componente"],["condition","Número/condição"],["exception","Exceção"]])panel.append(el("mark","bm339-highlight bm339-"+kind,t));
 legend.append(panel);root.append(legend);
 return root;
}
function historyFor(id,p,record){
 const fold=el("details","bm330-evolution bm332-evolution bm340-evolution");
 const sum=el("summary","bm332-evolution-summary");
 sum.append(el("span","","Resposta evolutiva integral"),el("small","","Originais, módulos, fontes e histórico"));
 fold.append(sum);
 const content=el("div","bm332-evolution-inside");
 const old=window.BM340Originals?.[id];
 if(old){
  const details=el("details","bm332-inner-accordion");
  details.append(el("summary","","Frente, verso e explicação anteriores · V339"));
  details.append(el("p","","Frente: "+old.front),el("p","","Verso: "+old.back));
  if(old.expl)details.append(el("p","","Explicação: "+old.expl));
  content.append(details);
 }
 if(record?.prior_layers?.length){
  const details=el("details","bm332-inner-accordion");
  details.append(el("summary","","Módulos da versão anterior (preservados)"));
  for(const m of record.prior_layers){details.append(el("h4","",m.titulo),el("p","",m.texto))}
  content.append(details);
 }
 const now=el("details","bm332-inner-accordion");
 now.append(el("summary","","11 critérios didáticos atualizados"));
 for(const m of p.layers){now.append(el("h4","",m.titulo),el("p","",m.texto))}
 content.append(now);
 fold.append(content);return fold;
}
function render(host,record,id){
 if(!ids.has(id))return prior.render(host,record,id);
 if(!delta){
  host.replaceChildren(el("p","bm336-loading","Preparando cartão e imagens…"));
  load().then(()=>{if(host.isConnected&&(!host.closest("#bmCardPeekV050")||window.BancoMestreVisualizarCardV050?.currentId===id))render(host,record,id)})
   .catch(e=>{if(host.isConnected)host.replaceChildren(el("p","bm336-error",e.message))});
  return {loading:true,srsChanged:false};
 }
 const p=delta.profiles[id];if(!p)throw Error("V340: perfil não localizado "+id);
 const main=mainFor(id,p),hist=historyFor(id,p,record),pane=host.closest(".bm197-evolutive"),modal=host.closest("#bmCardPeekV050");
 if(modal&&pane&&window.BancoMestreVisualizarCardV050?.currentId===id){
  for(const n of [...pane.parentElement.children])if(n.matches?.(".bm340-learning")&&n!==pane)n.remove();
  pane.before(main);host.replaceChildren(hist);pane.classList.add("bm330-evolution-pane","bm340-evolution-pane");
 }else host.replaceChildren(main,hist);
 return {modules:11,presentation:"V340/V333",visual_assets:1,original_link:p.originals?.length||0,srsChanged:false};
}
window.BM198Format=Object.freeze({...prior,render,version:"V340-GRAN"});
window.BM340Granulometry=Object.freeze({ids:Object.freeze([...ids]),load,source:"assets/petro26_granulometry_delta_v340.json",srs_changed:false});
load().catch(e=>console.warn("V340: granulometria",e));
})();