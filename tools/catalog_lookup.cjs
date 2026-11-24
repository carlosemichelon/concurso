'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {validate,blobHash}=require('./catalog_snapshot.cjs');
const root=path.resolve(__dirname,'..');
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function project(snapshot,contract){
 validate(snapshot,contract);
 const cards={},index={};
 for(const c of [...snapshot.base,...snapshot.ijui]){
  if(c.active===false)continue;
  assert.match(c.id,/^[A-Za-z0-9_-]+$/);
  assert.ok(!Object.hasOwn(cards,c.id),'ID repetido');
  const hash=sha(c);
  cards[c.id]={hash,card:c};
  const terms=[c.id,c.group,c.discipline,c.subject,c.sub,c.front,c.back,c.reference,c.mnemonic,...(c.search_keywords||[]),c.consolidation?.profile?.title,c.expl,...(c.consolidation?.profile?.modules||[]).map(m=>m.texto)].filter(x=>typeof x==='string').join(' ');
  const key=String(c.discipline||'Outros').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'outros';
  (index[key]??=[]).push({id:c.id,subject:c.subject||'',sub:c.sub||'',front:c.front||'',terms:terms.slice(0,6000),hash});
 }
 return {cards,index};
}
function generate(rootDir=root){
 const m=JSON.parse(fs.readFileSync(path.join(rootDir,'assets/version.json'),'utf8'));
 const raw=fs.readFileSync(path.join(rootDir,m.catalog.path));
 assert.equal(blobHash(raw),m.catalog.git_blob,'Snapshot divergente');
 const snapshot=JSON.parse(raw),{cards,index}=project(snapshot,m.catalog);
 const base=path.join(rootDir,'assets/catalog_lookup'),tmp=base+'.tmp';
 fs.rmSync(tmp,{recursive:true,force:true});fs.mkdirSync(path.join(tmp,'cards'),{recursive:true});
 const write=(p,v)=>fs.writeFileSync(path.join(tmp,p),JSON.stringify(v)+'\n');
 const groups={};
 for(const [id,c] of Object.entries(cards)){
  write('cards/'+id+'.json',c);
  assert.equal(sha(JSON.parse(fs.readFileSync(path.join(tmp,'cards',id+'.json'))).card),c.hash);
 }
 for(const [key,rows] of Object.entries(index)){
  const files=[];let chunk=[],bytes=0;
  function flush(){if(!chunk.length)return;const name=key+'-'+String(files.length).padStart(3,'0')+'.json';write(name,chunk);files.push(name);chunk=[];bytes=0;}
  for(const row of rows){const n=Buffer.byteLength(JSON.stringify(row))+1;if(bytes+n>100000)flush();chunk.push(row);bytes+=n;}flush();groups[key]={count:rows.length,files};
 }
 write('occupied_public_ids.json',{scope:'PUBLIC_ONLY_NOT_PRIVATE_RESERVATION_REGISTRY',catalog_git_blob:m.catalog.git_blob,active:Object.keys(cards).sort(),inactive:[...snapshot.base,...snapshot.ijui].filter(c=>c.active===false).map(c=>c.id).sort(),retired:[...new Set(snapshot.retired_ids||[])].sort(),redirects:snapshot.consolidation?.redirects||{}});
 write('manifest.json',{format:'BancoMestreLookup1',catalog:m.catalog.path,catalog_git_blob:m.catalog.git_blob,version:m.catalog.display_version,count:Object.keys(cards).length,card_path:'cards/{id}.json',occupied_public_ids:'occupied_public_ids.json',groups});
 assert.equal(Object.values(groups).reduce((n,g)=>n+g.count,0),Object.keys(cards).length);
 fs.rmSync(base,{recursive:true,force:true});fs.renameSync(tmp,base);
 return {version:m.catalog.display_version,count:Object.keys(cards).length,groups:Object.keys(groups).length};
}
function check(rootDir=root){
 const m=JSON.parse(fs.readFileSync(path.join(rootDir,'assets/version.json'),'utf8')),raw=fs.readFileSync(path.join(rootDir,m.catalog.path));
 assert.equal(blobHash(raw),m.catalog.git_blob);
 const snapshot=JSON.parse(raw),{cards,index}=project(snapshot,m.catalog),base=path.join(rootDir,'assets/catalog_lookup');
 const read=p=>JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
 const manifest=read('manifest.json');assert.equal(manifest.version,m.catalog.display_version);assert.equal(manifest.catalog_git_blob,m.catalog.git_blob);assert.equal(manifest.catalog,m.catalog.path);assert.equal(manifest.count,Object.keys(cards).length);
 const seen=new Set();
 assert.deepEqual(Object.keys(manifest.groups).sort(),Object.keys(index).sort());
 for(const [group,g] of Object.entries(manifest.groups)){const rows=g.files.flatMap(read);assert.equal(rows.length,g.count);assert.deepEqual(rows,index[group]);for(const row of rows){assert.ok(!seen.has(row.id));seen.add(row.id);assert.deepEqual(read('cards/'+row.id+'.json'),cards[row.id]);}}
 assert.equal(seen.size,manifest.count);
 assert.deepEqual(fs.readdirSync(path.join(base,'cards')).sort(),Object.keys(cards).map(id=>id+'.json').sort());
 const occupied=read('occupied_public_ids.json');assert.equal(occupied.catalog_git_blob,m.catalog.git_blob);assert.deepEqual(occupied.active,Object.keys(cards).sort());assert.deepEqual(occupied.inactive,[...snapshot.base,...snapshot.ijui].filter(c=>c.active===false).map(c=>c.id).sort());assert.deepEqual(occupied.retired,[...new Set(snapshot.retired_ids||[])].sort());
 for(const id of ['CARD-8901','CARD-8902','CARD-8903','CARD-8904','CARD-8905'])if(cards[id])assert.ok(seen.has(id));
 return {version:manifest.version,count:seen.size,groups:Object.keys(index).length,hash:manifest.catalog_git_blob,public_reservations_only:true};
}
if(require.main===module){if(process.argv.includes('--check'))console.log(JSON.stringify(check()));else{generate();console.log(JSON.stringify(check()));}}
module.exports={project,generate,check,sha};
