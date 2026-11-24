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
async function main(){
 if(process.argv[2]==='--check'){console.log(JSON.stringify(await check()));return}
 // Geração explícita: contrato candidato com novo caminho, versão, fonte e contagens.
 if(process.argv[2]!=='--write'||!process.argv[3])throw Error('Uso: --check | --write contrato-candidato.json');
 const c=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
 if(!/^assets\/catalog_snapshot_v\d+\.json$/.test(c.path)||!/^BancoMestreCatalogSnapshotV\d+$/.test(c.format)||!(/^[a-f0-9]{40}$/.test(c.source_head)))throw Error('Contrato candidato inválido');
 const m=json('assets/version.json'),p=await build(read(m.home),c),raw=Buffer.from(JSON.stringify(p),'utf8');
 fs.writeFileSync(path.join(root,c.path),raw,{flag:'wx'});console.log(JSON.stringify({...c,git_blob:blobHash(raw)},null,2));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={check,build,validate,sourceOf,blobHash,checkContract};
