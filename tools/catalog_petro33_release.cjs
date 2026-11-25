'use strict';
// Incremento público editorial após consolidações; sem escrita em Drive ou SRS.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {blobHash,validate}=require('./catalog_snapshot.cjs'),{applyNewCards}=require('./catalog_new_cards.cjs'),{applyEvolutionBatch,digest}=require('./catalog_evolution_batch.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),json=p=>JSON.parse(read(p)),write=(p,b)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),b)};
const req=json('assets/petro33_publish_request.json'),recipe=json(req.recipe),m=json('assets/version.json');
assert.equal(recipe.format,'BancoMestrePetro33PublicRecipe1');assert.equal(recipe.private_content_exported,false);
assert.equal(blobHash(read('assets/version.json')),recipe.source_manifest_blob,'Manifesto mudou');assert.equal(m.catalog.git_blob,recipe.source_catalog_blob);assert.equal(m.catalog.display_version,recipe.source_version);assert.equal(req.target_version,recipe.target_version);
const oldRaw=read(m.catalog.path);assert.equal(blobHash(oldRaw),m.catalog.git_blob);const old=JSON.parse(oldRaw);validate(old,m.catalog);
const occupied=json('assets/catalog_lookup/occupied_public_ids.json');assert.equal(occupied.catalog_git_blob,m.catalog.git_blob);
const reserved=new Set([...occupied.active,...occupied.inactive,...occupied.retired]);
for(const n of recipe.new_cards)assert.ok(!reserved.has(n.id),'Colisão '+n.id);
const uniq=a=>[...new Set(a.filter(Boolean))], cp=x=>JSON.parse(JSON.stringify(x));
const titles=['Recuperação ativa','Resposta-modelo','Fundamento e fontes','Mecanismo','Fórmulas e unidades','Comparação','Aplicação e transferência','Cobertura cruzada','Condições e exceções','Pegadinhas','Macete e histórico'];
const clean=s=>String(s||'').replace(/(?:Preservar comparação com BGTC e solo-cimento\.|Preservar a distinção entre ABNT e DNIT,)/g, x=>x.startsWith('Preservar a')?'Distinguir ABNT e DNIT,':'').replace(/Acrescentar base negra:/g,'Base negra:').replace(/(?:Q0[1-9]|Q10|Q11)(?=[: ,])/g,'Questão de revisão').replace(/(?:Não declarar mudança de gabarito da questão histórica\.)/g,'O gabarito da questão histórica não se altera.').trim();
const add=(a,b)=>{a=clean(a);b=clean(b);if(!b||a.includes(b))return a;if(!a||b.includes(a))return b;return a+'\n\n'+b;};
const names={"CARD-0223":"Mísula, consolo e laje de transição","CARD-0498":"Pega do cimento e efeito dos aditivos","CARD-0926":"Aceleradores de resistência e de pega","CARD-1317":"Pressão hidrostática e empuxo horizontal","CARD-1412":"Elementos estruturais das pontes","CARD-1414":"Socavamento e inspeção das fundações","CARD-1459":"Estaqueamento e distâncias de controle","CARD-1465":"Solo-cimento: execução, compactação e resistência","CARD-1471":"Superestrutura, mesoestrutura e infraestrutura"};
const legacy={
"CARD-0498":{3:"NBR 7212:2024, 5.6–5.7; NBR 14931:2023, condições de lançamento. O tempo de pega deve ser determinado em ensaio apropriado.",4:"A hidratação depende de composição, finura, sulfatos e temperatura; aditivos alteram a cinética ou a dispersão.",5:"Tempo de pega em minutos ou horas, temperatura em °C, relação água/cimento adimensional. Não existe equação universal de conversão da dosagem em tempo de pega.",6:"Pega significa perda da plasticidade por hidratação; abatimento mede consistência; resistência mede capacidade mecânica.",7:"Comparar os ensaios nas mesmas condições de temperatura e composição, consultar dados do fabricante e verificar compatibilidade.",9:"Retardadores, controladores de hidratação e plastificantes não são necessariamente equivalentes. Usar estudos e especificações aplicáveis.",10:"Não inferir que mais água sempre prolonga a pega, nem que maior abatimento prova ausência de pega.",11:"Pega: química; abatimento: consistência; resistência: desempenho."},
"CARD-0926":{3:"NBR 7212:2024, 5.6–5.7; especificação do aditivo e do concreto pré-moldado.",4:"Aceleradores modificam a hidratação e o ganho de resistência nas primeiras idades, possibilitando etapas industriais mais cedo.",5:"Resistência medida em MPa em idade definida. O critério de desforma depende da resistência comprovada e dos esforços de manuseio.",6:"Acelerador de resistência inicial não é necessariamente acelerador de pega; retardador atua sobre o desenvolvimento da pega.",7:"Desformar ou movimentar a peça somente após comprovar a resistência exigida pelo projeto, e não pela presença de aditivo.",9:"Verificar compatibilidade com cimento, armaduras, cura, durabilidade e especificação de fabricação.",10:"A presença de acelerador não autoriza reduzir automaticamente o prazo de desforma.",11:"Acelerar resistência facilita produção; ensaio libera desforma."},
"CARD-1317":{3:"Hidrostática: equilíbrio de fluido em repouso; NBR 7187:2003, 7.2.5 e NBR 7187:2021, 7.3.6.1 para pressão equivalente de escoamento.",4:"A pressão manométrica cresce linearmente com a profundidade. A resultante é a área do diagrama triangular.",5:"p=γz; F/b=γH²/2; centro de pressão H/3 da base. Para H=10 m e γ=10 kN/m³: 100 kPa e 500 kN/m.",6:"Água parada: pressão por profundidade. Água em movimento: a ação equivalente de escoamento depende da velocidade e geometria.",7:"Parede de largura 2 m: força total 1.000 kN; altura de aplicação 3,33 m da base, nas hipóteses do exemplo.",9:"A pressão atmosférica se cancela no diferencial quando os lados estão adequadamente expostos; considerar distribuição de pressão e níveis reais.",10:"Não confundir H/2, centro geométrico da parede, com H/3, centro da pressão triangular.",11:"Triângulo de pressão: base mais pressionada, resultante a um terço da base."},
"CARD-1459":{3:"Estaqueamento de projeto rodoviário; ABNT NBR 12264:1991 para as frequências de controle estudadas.",4:"O primeiro número indica os intervalos inteiros; o complemento indica distância em metros após a estaca.",5:"d=nL+s; para L=20 m, n=12 e s=15,50 m, d=255,50 m.",6:"Estaca de referência indica posição; frequência de ensaio indica intervalo de controle. A convenção L=20 m não é universal.",7:"Aplicar às notas de serviço, PC/PT, seções e posições dos ensaios na pista.",9:"Confirmar a origem e o intervalo de estacas estabelecido no projeto.",10:"Não ler 12+15,50 como 12,1550 km ou confundir metros com números de estacas.",11:"Estacas inteiras vezes intervalo, mais complemento."}
};
const mediaNormalize=e=>({...e,alt:e.alt||e.caption||'Diagrama técnico',source:e.source||'Esquema didático autoral.',origin:e.origin||'DERIVADA_AUTORAL'});
for(const [f,svg] of Object.entries(recipe.svg_files)){assert.match(f,/^assets\/petro33\/[a-z0-9-]+\.svg$/);assert.ok(svg.startsWith('<svg')&&svg.endsWith('</svg>'));assert.ok(!/<script\b|<foreignObject\b|onload\s*=|https?:\/\/(?!www\.w3\.org)/i.test(svg));write(f,svg+'\n');}
const resolve=id=>{let x=id,seen=new Set();while(old.consolidation?.redirects?.[x]){assert.ok(!seen.has(x));seen.add(x);x=old.consolidation.redirects[x];}return x;};
const incoming=recipe.new_cards.map(n=>{n=cp(n);n.related_card_ids=uniq(n.related_card_ids.map(resolve));n.editorial.media=n.editorial.media.map(mediaNormalize);n.editorial.highlights=n.editorial.highlights.map(h=>({...h,kind:h.kind||'core'}));if(n.editorial.table)n.editorial.table.rows=n.editorial.table.rows.map(r=>r.map(String));
if(n.id==='CARD-8911'){n.back='Edição de 2013: '+n.back;n.modules[1].texto=n.back;n.editorial.answer_paragraphs=n.back.split('\n\n');}
return n;});
const newPacket={format:'BancoMestreNewCards1',private_content_exported:false,new_cards:incoming};
const afterNew=applyNewCards(old,newPacket),map=new Map(afterNew.base.map(c=>[c.id,c]));
const groups=new Map();for(const p of recipe.patches){const id=resolve(p.id);assert.ok(map.has(id),'ID ausente '+id);(groups.get(id)||groups.set(id,[]).get(id)).push(p);}
const revisions=[];
for(const [id,ps] of groups){const c=map.get(id),prof=c.consolidation?.profile||{},ed=prof.editorial||{},legacyBase=legacy[id]||{};
let front=c.front,back=c.back,source=prof.source||c.reference||'',mnemonic=prof.mnemonic||c.mnemonic||'';
let mm={};for(const k of titles.keys()){const n=k+1;mm[n]=prof.modules?.find(x=>x.ord===n)?.texto||legacyBase[n]||'';}
let rel=uniq((c.related_card_ids||[]).map(resolve)),media=cp(ed.media||[]),highlights=cp(ed.highlights||[]),table=ed.table;
for(const p of ps){const mods=p.modules||{};if(p.front||mods['01'])front=clean(p.front||mods['01']);if(p.back||mods['02']){const b=clean(p.back||mods['02']);if(id==='CARD-1462'||id==='CARD-1465')back=add(back,b);else back=b;}
for(const [k,v] of Object.entries(mods)){const n=Number(k);if(n>=3&&n!==8){mm[n]=add(mm[n],v);}}
if(mods['03'])source=add(source,mods['03']);if(mods['11'])mnemonic=add(mnemonic,mods['11']);
rel=uniq([...rel,...(p.links||[]).map(resolve)]).filter(x=>x!==id);
for(const x of p.media||[])if(!media.some(y=>y.id===x.id&&y.role===x.role))media.push(mediaNormalize(x));highlights.push(...(p.highlights||[]));if(p.table)table=p.table;}
if(id==='CARD-1465'){back='Para base de solo-cimento pelo método empírico, a DNIT 143/2025-ES exige RCS aos sete dias ≥2,1 MPa; no método mecanicista, considerar módulo de resiliência e fadiga conforme projeto.\n\n'+ps[0].back.replace(/^.*?Base dimensionada pelo método empírico:/s,'NBR 12254:2013: usinagem até início da compactação ≤1 h. DNIT 143/2025-ES: adição de água até início do espalhamento ≤1 h (exceção por estudo e aprovação), fim da compactação ≤3 h. Base dimensionada pelo método empírico:')+'\n\n'+clean(ps.find(x=>x.modules?.['02']&&x.front?.startsWith('Como executar')).modules['02']);}
if(id==='CARD-1462')back=add(c.back,clean(ps.find(x=>x.modules?.['02']).modules['02']));
if(id==='CARD-1412'){back=ps.find(x=>x.back).back+'\n\nA laje de transição ou de aproximação suaviza os desníveis na ligação entre o aterro e a ponte. A cortina e a ala contêm o aterro; o dente de apoio pode sustentar a laje.';}
if(id==='CARD-1471')back=ps.find(x=>x.back).back;
if(id==='CARD-1414')back=clean(ps.find(x=>x.modules?.['02']).modules['02']);
if(id==='CARD-1460')back=clean(ps.find(x=>x.modules?.['02']).modules['02']);
if(id==='CARD-0223')back=clean(ps.find(x=>x.modules?.['02']).modules['02']);
mm[1]=front;mm[2]=back;mm[3]=source;mm[8]=rel.length?'Conhecimentos relacionados: '+rel.join(', ')+'.':'Relacionar os conceitos e condições de aplicação.';mm[11]=mnemonic;
assert.ok(rel.every(n=>map.has(n)&&n!==id),'Vínculo ausente '+id);
const modules=titles.map((t,i)=>({ord:i+1,titulo:t,texto:clean(mm[i+1])}));assert.ok(modules.every(x=>x.texto),'Módulo vazio '+id);assert.equal(new Set(modules.map(x=>x.texto)).size,11,'Módulos repetidos '+id);
front=modules[0].texto;back=modules[1].texto;
highlights=uniq(highlights.filter(x=>x.text&&back.includes(x.text)).map(x=>JSON.stringify({...x,kind:x.kind||'core'}))).map(JSON.parse);
if(!highlights.length)highlights=[{text:back.split(/[.;\n]/)[0].slice(0,85),color:'#FDE68A',kind:'core'}];
const editorial={...ed,status:'PUBLICACAO_AUTORIZADA_EVOLUCAO',answer_paragraphs:back.split('\n\n'),highlights,media,history_collapsed:true,reveal_after_attempt:true};
if(table)editorial.table={...table,rows:table.rows.map(r=>r.map(String))};
revisions.push({id,title:names[id]||prof.title||c.sub||c.subject,front,back,source:modules[2].texto,mnemonic:modules[10].texto,modules,editorial,related_card_ids:rel,expected_hash:digest(c)});
}
const evolutionPacket={format:'BancoMestreEvolution1',private_content_exported:false,revisions};
const result=applyEvolutionBatch(afterNew,evolutionPacket);
assert.equal(result.base.length,old.base.length+incoming.length);assert.deepEqual(result.retired_ids,old.retired_ids);assert.deepEqual(result.consolidation.redirects,old.consolidation.redirects);
const pNew='assets/petro33_new_cards.json',pEvo='assets/petro33_evolution.json';
for(const [p,obj] of [[pNew,newPacket],[pEvo,evolutionPacket]])write(p,JSON.stringify(obj,null,2)+'\n');
const raw=Buffer.from(JSON.stringify(result)),nextPath='assets/catalog_snapshot_'+req.target_version.toLowerCase()+'.json';
const c={...m.catalog,path:nextPath,git_blob:blobHash(raw),display_version:req.target_version,counts:result.counts,private_sync:'not_verified',post_consolidation_incremental_batches:[...(m.catalog.post_consolidation_incremental_batches||[]),{path:pNew,git_blob:blobHash(read(pNew)),kind:'new'},{path:pEvo,git_blob:blobHash(read(pEvo)),kind:'evolution'}]};
validate(result,c);const html=read(m.home).toString('utf8');assert.equal(read('index.html').toString(),html);const re=/const BM_CATALOG=Object\.freeze\(([^\n]+)\);/;assert.ok(re.test(html));assert.deepEqual(JSON.parse(html.match(re)[1]),m.catalog);
const nextHtml=html.replace(re,()=> 'const BM_CATALOG=Object.freeze('+JSON.stringify(c)+');').replace(new RegExp('(Cartões|Catálogo) '+recipe.source_version,'g'),'$1 '+req.target_version);
for(const k of ['cards','active','cards_public_current','catalog_canonical_cards','card_entries_combined','catalog_entries_unified','cards_public_active'])m.counts[k]=result.counts.active;
m.counts.card_operational_ijui=result.counts.ijui;m.catalog=c;m.component_versions.cards={...m.component_versions.cards,version:req.target_version,path:nextPath,counts:c.counts};
m['release_'+req.target_version.toLowerCase()]={scope:'Petrobras 33: evoluções, novos cartões e SVGs autorais; interface preservada',updated_ids:revisions.map(x=>x.id),new_ids:incoming.length,added_ids:incoming.map(x=>x.id),public_svg_count:Object.keys(recipe.svg_files).length,private_sync:'not_verified',srs_modified:false,private_content_exported:false,rollback:recipe.source_version};
m.notes=(m.notes||'')+'\n'+req.target_version+': Petrobras 33, conteúdo público incremental.';
write(nextPath,raw);write(m.home,nextHtml);write('index.html',nextHtml);write('assets/version.json',JSON.stringify(m,null,2)+'\n');
console.log(JSON.stringify({ok:true,version:req.target_version,counts:result.counts,updated:revisions.length,new:incoming.length,media:Object.keys(recipe.svg_files).length}));
