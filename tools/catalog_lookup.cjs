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
  const terms=[c.id,c.discipline,c.subject,c.sub,c.front,c.back,c.reference,...(c.search_keywords||[]),...(c.consolidation?.profile?.modules||[]).map(m=>m.texto)].filter(x=>typeof x==='string').join(' ');
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
 write('manifest.json',{format:'BancoMestreLookup1',catalog:m.catalog.path,catalog_git_blob:m.catalog.git_blob,version:m.catalog.display_version,count:Object.keys(cards).length,card_path:'cards/{id}.json',groups});
 assert.equal(Object.values(groups).reduce((n,g)=>n+g.count,0),Object.keys(cards).length);
 fs.rmSync(base,{recursive:true,force:true});fs.renameSync(tmp,base);
 return {version:m.catalog.display_version,count:Object.keys(cards).length,groups:Object.keys(groups).length};
}
if(require.main===module)console.log(JSON.stringify(generate()));
module.exports={project,generate,sha};
