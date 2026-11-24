#!/usr/bin/env node
'use strict';
// Reproduz a montagem pública histórica, exclusivamente com arquivos locais versionados.
// Não lê o Drive, não cria cartões, não modifica SRS. --check é somente leitura.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
function blobHash(bytes){return crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')}
function localAsset(url){
 const p=url.split('?')[0];
 if(!/^assets\/[A-Za-z0-9_.-]+\.json$/.test(p))throw Error('Fonte não pública/local: '+p);
 return json(p);
}
function sourceOf(html){
 const start=html.indexOf('function loadCardsLegacy()'),end=html.indexOf('function infoBlock',start);
 assert.ok(start>=0&&end>start,'Montagem histórica não localizada');
 const legacy=html.slice(start,end),i=legacy.indexOf('const m=await loadMeta()'),j=legacy.indexOf('cards=[...base,...ijui];loadedCards=true;');
 assert.ok(i>=0&&j>i,'Limites da montagem alterados; atualizar o gerador');
 return legacy.slice(i,j);
}
function validate(p,c){
 assert.equal(p.format,c.format);assert.equal(p.source_head,c.source_head);
 assert.deepEqual(p.counts,c.counts);
 assert.equal(p.base.length,c.counts.canonical);assert.equal(p.ijui.length,c.counts.ijui);
 assert.equal(p.base.filter(x=>x.active!==false).length,c.counts.active);
 assert.equal(new Set([...p.base,...p.ijui].map(x=>x.id)).size,p.base.length+p.ijui.length);
 for(const k of ['meta','globals','guideData','generalGuide','auditF17','answersF17'])assert.ok(p[k],k);
}
async function build(html,c){
 const meta=json('assets/meta_public_v194.json'),globals={},warnings=[];
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 const execute=new AsyncFunction('fetch','loadMeta','window','console','let guideData=null,generalGuide=null,auditF17=null,answersF17=null;'+sourceOf(html)+'\nreturn {base,ijui,guideData,generalGuide,auditF17,answersF17};');
 const r=await execute(async url=>({ok:true,json:async()=>localAsset(url)}),async()=>meta,globals,{warn:(...args)=>warnings.push(args.map(String).join(' '))});
 assert.deepEqual(warnings,[],'Fontes opcionais não podem desaparecer silenciosamente');
 const p={format:c.format,source_head:c.source_head,counts:{canonical:r.base.length,active:r.base.filter(x=>x.active!==false).length,ijui:r.ijui.length},...r,globals,meta};
 validate(p,c);return p;
}
function checkContract(html,m){
 const match=html.match(/const BM_CATALOG=Object\.freeze\(([^\n]+)\);/);
 assert.ok(match,'Contrato do carregador ausente');assert.deepEqual(JSON.parse(match[1]),m.catalog);
 assert.equal(m.counts.cards,m.catalog.counts.canonical);assert.equal(m.counts.active,m.catalog.counts.active);
 assert.equal(m.counts.card_operational_ijui,m.catalog.counts.ijui);
 assert.ok(html.includes('data-bm-portal-version="'+m.version+'"'));
 assert.equal(m.current_versions.portal.version,m.version,'Versão secundária desatualizada');
 assert.equal(m.current_versions.portal.home,m.home,'Home secundária desatualizada');
 assert.equal(m.current_versions.portal.previous,m.previous_version,'Rollback secundário desatualizado');
 assert.equal(m.counts.cards_public_current,m.catalog.counts.canonical);
 assert.equal(m.counts.catalog_canonical_cards,m.catalog.counts.canonical);
 assert.equal(m.counts.card_entries_combined,m.catalog.counts.canonical+m.catalog.counts.ijui);
 const css=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(x=>x[1]);
 const js=[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(css.length,m.portal_assets.css_count,'Total CSS divergente');assert.equal(js.length,m.portal_assets.js_count,'Total JS divergente');
 assert.equal(css.at(-1),m.portal_assets.last_css,'Última camada CSS divergente');
 for(const files of [css,js]){
  const paths=files.map(x=>x.split('?')[0]);assert.equal(new Set(paths).size,paths.length,'Asset duplicado');
  for(const p of paths){assert.match(p,/^assets\/[A-Za-z0-9_./-]+$/);assert.ok(!p.split('/').includes('..')&&fs.existsSync(path.join(root,p)),'Asset inválido/ausente: '+p);}
 }
}
async function check(){
 const m=json('assets/version.json'),html=read(m.home);assert.equal(read('index.html'),html);
 checkContract(html,m);const raw=fs.readFileSync(path.join(root,m.catalog.path));
 assert.equal(blobHash(raw),m.catalog.git_blob,'Bytes do catálogo divergentes');
 const saved=JSON.parse(raw);validate(saved,m.catalog);
 const rebuilt=await build(html,m.catalog);assert.deepEqual(rebuilt,saved,'Snapshot não corresponde à montagem dos incrementos');
 return {ok:true,portal:m.version,catalog:m.catalog.path,...m.catalog.counts,bytes:raw.length};
}

// Preflight do incremento PUBLICÁVEL. A aprovação, a reserva canônica e os recibos
// privados são responsabilidades do delta Drive; este comando não os presume nem os grava.
// Não recebe o delta privado. O pacote público deve ser projetado antes desta etapa.
const CARD_KEYS=new Set(['id','group','discipline','subject','sub','front','back','expl','mnemonic','reference','active','related_card_ids','related_question_ids']);
const PROFILE_KEYS=new Set(['id','title','front','back','source','mnemonic','layers','paragraphs','related_card_ids','related_question_ids','highlights','status','source_name']);
function onlyKeys(o,keys,label){
 assert.ok(o&&typeof o==='object'&&!Array.isArray(o),label+' inválido');
 for(const k of Object.keys(o))assert.ok(keys.has(k),label+' contém campo não permitido: '+k);
}
function nonempty(v){return typeof v==='string'&&v.trim().length>0}
function cardId(v){return typeof v==='string'&&/^CARD-\d{4,}$/.test(v)}
function digest(v){return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex')}
function publicPreflight(packet,snapshot,contract){
 onlyKeys(packet,new Set(['format','catalog_git_blob','portal_version','manifest_git_blob','new_cards','updated_cards','profiles','relations','expected_card_hashes','private_content_exported']), 'Pacote');
 assert.equal(packet.format,'BancoMestrePublicIncrement1');
 assert.equal(packet.private_content_exported,false,'Somente projeção pública autorizada');
 assert.equal(packet.catalog_git_blob,contract.git_blob,'Catálogo mudou: reconciliar antes de reaplicar');
 assert.equal(packet.portal_version,contract.portal_version,'Versão do portal mudou');
 assert.equal(packet.manifest_git_blob,contract.manifest_git_blob,'Manifesto mudou: reconciliar antes de reaplicar');
 assert.ok(Array.isArray(packet.new_cards)&&Array.isArray(packet.updated_cards),'Listas de cartões obrigatórias');
 const canonical=new Map(snapshot.base.map(c=>[c.id,c])), all=new Map([...snapshot.base,...snapshot.ijui].map(c=>[c.id,c]));
 const touched=new Map(), newIds=new Set(), expected=packet.expected_card_hashes;
 assert.ok(expected&&typeof expected==='object'&&!Array.isArray(expected),'Hashes de origem obrigatórios');
 for(const [kind,rows] of [['new',packet.new_cards],['update',packet.updated_cards]]){
  for(const c of rows){
   onlyKeys(c,CARD_KEYS,'Cartão');assert.ok(cardId(c.id),'ID inválido');assert.ok(!touched.has(c.id),'ID repetido: '+c.id);
   for(const k of ['discipline','subject','sub','front','back','expl','reference'])assert.ok(nonempty(c[k]),c.id+' campo vazio: '+k);
   assert.equal(c.active,true,c.id+' não ativo; inativos não podem ser reativados');
   if(kind==='new'){assert.ok(!all.has(c.id),'Colisão: '+c.id);newIds.add(c.id);}
   else{const old=canonical.get(c.id);assert.ok(old&&old.active!==false,'Origem ausente ou inativa: '+c.id);
    assert.equal(expected[c.id],digest(old),'Origem alterada: '+c.id);
    // O verso original permanece na fonte privada; publicação não o substitui.
   }
   touched.set(c.id,c);all.set(c.id,c);
  }
 }
 assert.deepEqual(Object.keys(expected).sort(),packet.updated_cards.map(c=>c.id).sort(),'Hashes excedentes ou ausentes');
 const profiles=packet.profiles;assert.ok(profiles&&typeof profiles==='object'&&!Array.isArray(profiles),'Perfis obrigatórios');
 assert.deepEqual(Object.keys(profiles).sort(),[...touched.keys()].sort(),'Perfil ausente ou excedente');
 const ids=(a,label)=>{assert.ok(Array.isArray(a),label+' deve ser lista');assert.equal(new Set(a).size,a.length,label+' duplicado');for(const id of a)assert.ok(cardId(id)&&all.has(id)&&all.get(id).active!==false,label+' inválido: '+id);return a};
 const rel=packet.relations;assert.ok(rel&&typeof rel==='object'&&!Array.isArray(rel),'Relações obrigatórias');
 for(const [id,p] of Object.entries(profiles)){
  onlyKeys(p,PROFILE_KEYS,'Perfil '+id);assert.equal(p.id,id);assert.equal(p.front,touched.get(id).front);assert.equal(p.back,touched.get(id).back);
  assert.ok(Array.isArray(p.layers)&&p.layers.length===11,id+' exige 11 módulos');
  const moduleTexts=new Set();
  p.layers.forEach((m,i)=>{onlyKeys(m,new Set(['ord','titulo','texto']),id+' módulo');assert.equal(m.ord,i+1);assert.ok(nonempty(m.titulo)&&nonempty(m.texto),id+' módulo vazio');moduleTexts.add(m.texto.trim())});
  assert.equal(moduleTexts.size,11,id+' módulos repetidos literalmente');
  assert.equal(p.status,'CANONICO_ATIVO',id+' perfil não ativo');
  assert.deepEqual([...ids(p.related_card_ids,id+' perfil')].sort(),[...ids(touched.get(id).related_card_ids,id+' cartão')].sort());
  assert.deepEqual([...ids(rel[id],id+' relações')].sort(),[...p.related_card_ids].sort());
 }
 // Cada relação incluída neste lote deve ser explícita nos dois sentidos.
 // Um vizinho existente pode receber apenas o complemento de vínculo, sem reescrever o cartão.
 for(const [id,neighbors] of Object.entries(rel)){
  assert.ok(all.has(id)&&all.get(id).active!==false,'Origem do vínculo inválida: '+id);
  for(const n of ids(neighbors,id+' relações')){assert.notEqual(id,n,'Autovínculo: '+id);assert.ok(Array.isArray(rel[n])&&rel[n].includes(id),'Vínculo sem retorno: '+id+' -> '+n);}
 }
 // Este é um portão estrutural, não atesta rigor técnico, autorização, privacidade de
 // texto livre, grifos, mídia, versões privadas, SRS nem publicação.
 return {status:'PREFLIGHT_ESTRUTURAL',catalog_git_blob:contract.git_blob,portal_version:contract.portal_version,manifest_git_blob:contract.manifest_git_blob,packet_sha256:digest(packet),new_cards:newIds.size,updated_cards:touched.size-newIds.size,private_sync:'not_verified',editorial_gate:'required',publication:'not_performed'};
}

// Aplicação em memória no catálogo existente, sem criar arquivos ou publicar.
// O resultado é material para a montagem já existente; perfis e originais devem
// ser incorporados ao renderizador histórico antes de gerar o snapshot oficial.
function stagePublicIncrement(packet,snapshot,contract){
 const proof=publicPreflight(packet,snapshot,contract);
 const copy=v=>JSON.parse(JSON.stringify(v));
 const rows=new Map(snapshot.base.map(c=>[c.id,copy(c)])),ijui=copy(snapshot.ijui);
 const originals={},profiles=copy(packet.profiles);
 for(const c of packet.updated_cards){
  const old=rows.get(c.id);originals[c.id]=copy(old);
  // Evolução não apaga campos já existentes.
  rows.set(c.id,{...old,...copy(c),related_card_ids:[...new Set([...(old.related_card_ids||[]),...c.related_card_ids])]});
 }
 for(const c of packet.new_cards)rows.set(c.id,copy(c));
 for(const [id,links] of Object.entries(packet.relations)){
  const c=rows.get(id)||ijui.find(x=>x.id===id);
  if(links.length)c.related_card_ids=[...new Set([...(c.related_card_ids||[]),...links])];
  if(profiles[id])profiles[id].related_card_ids=[...(c.related_card_ids||[])];
 }
 const base=[...rows.values()];
 return {base,ijui,profiles,originals,counts:{canonical:base.length,active:base.filter(c=>c.active!==false).length,ijui:ijui.length},preflight:proof};
}

function preflightFile(file){
 const m=json('assets/version.json'),raw=fs.readFileSync(path.join(root,m.catalog.path));
 assert.equal(blobHash(raw),m.catalog.git_blob,'Snapshot alterado');
 const snapshot=JSON.parse(raw);validate(snapshot,m.catalog);
 return publicPreflight(JSON.parse(fs.readFileSync(file,'utf8')),snapshot,{...m.catalog,portal_version:m.version,manifest_git_blob:blobHash(fs.readFileSync(path.join(root,'assets/version.json')))});
}
function preflightSelfTest(){
 const mk=(id,related=[])=>({id,discipline:'Engenharia',subject:'Tema',sub:'Núcleo',front:'Pergunta',back:'Resposta',expl:'Explicação',reference:'Fonte',active:true,related_card_ids:related});
 const a=mk('CARD-0001'),b=mk('CARD-0002',['CARD-0001']);
 const snapshot={base:[a],ijui:[]},contract={git_blob:'a'.repeat(40),portal_version:'VTEST',manifest_git_blob:'c'.repeat(40)};
 const profile={id:b.id,front:b.front,back:b.back,status:'CANONICO_ATIVO',related_card_ids:[a.id],layers:Array.from({length:11},(_,i)=>({ord:i+1,titulo:'Tema '+i,texto:'Explicação '+i}))};
 const packet={format:'BancoMestrePublicIncrement1',catalog_git_blob:contract.git_blob,portal_version:contract.portal_version,manifest_git_blob:contract.manifest_git_blob,new_cards:[b],updated_cards:[],profiles:{[b.id]:profile},relations:{[b.id]:[a.id],[a.id]:[b.id]},expected_card_hashes:{},private_content_exported:false};
 assert.equal(publicPreflight(packet,snapshot,contract).new_cards,1);
 const mutate=(fn)=>{const x=JSON.parse(JSON.stringify(packet));fn(x);assert.throws(()=>publicPreflight(x,snapshot,contract))};
 mutate(x=>x.catalog_git_blob='b'.repeat(40));mutate(x=>x.new_cards[0].id=a.id);
 mutate(x=>x.new_cards.push(x.new_cards[0]));mutate(x=>x.profiles[b.id].layers.pop());
 mutate(x=>x.relations[a.id]=[]);mutate(x=>x.new_cards[0].srs={});mutate(x=>x.private_content_exported=true);
 mutate(x=>x.new_cards[0].active=false);mutate(x=>x.profiles[b.id].layers[1].texto=x.profiles[b.id].layers[0].texto);
 mutate(x=>{x.new_cards=[];x.updated_cards=[b];x.expected_card_hashes[b.id]='bad'});
 mutate(x=>x.portal_version='VOTHER');mutate(x=>x.manifest_git_blob='d'.repeat(40));
 const updated=mk(a.id),up={...packet,new_cards:[],updated_cards:[updated],profiles:{[a.id]:{...profile,id:a.id,related_card_ids:[]}},relations:{[a.id]:[]},expected_card_hashes:{[a.id]:digest(a)}};
 assert.equal(publicPreflight(up,snapshot,contract).updated_cards,1);
 assert.throws(()=>publicPreflight({...up,expected_card_hashes:{[a.id]:'stale'}},snapshot,contract));
 console.log(JSON.stringify({ok:true,tests:15,scope:'synthetic_structural_only'}));
}

async function main(){
 if(process.argv[2]==='--preflight-self-test'){preflightSelfTest();return}
 if(process.argv[2]==='--preflight'&&process.argv[3]){console.log(JSON.stringify(preflightFile(process.argv[3]),null,2));return}
 if(process.argv[2]==='--check'){console.log(JSON.stringify(await check()));return}
 // Geração explícita: contrato candidato com novo caminho, versão, fonte e contagens.
 if(process.argv[2]!=='--write'||!process.argv[3])throw Error('Uso: --check | --write contrato-candidato.json | --preflight incremento-publico.json | --preflight-self-test');
 const c=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
 if(!/^assets\/catalog_snapshot_v\d+\.json$/.test(c.path)||!/^BancoMestreCatalogSnapshotV\d+$/.test(c.format)||!(/^[a-f0-9]{40}$/.test(c.source_head)))throw Error('Contrato candidato inválido');
 const m=json('assets/version.json'),p=await build(read(m.home),c),raw=Buffer.from(JSON.stringify(p),'utf8');
 fs.writeFileSync(path.join(root,c.path),raw,{flag:'wx'});console.log(JSON.stringify({...c,git_blob:blobHash(raw)},null,2));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={check,build,validate,sourceOf,blobHash,checkContract,publicPreflight,stagePublicIncrement};
