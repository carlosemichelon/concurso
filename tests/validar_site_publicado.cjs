/* Auditoria pública do Banco Mestre. Somente GET; não utiliza OAuth nem dados privados. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const base='https://carlosemichelon.github.io/concurso/';
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/version.json'),'utf8'));
const version=manifest.version;
if(!/^V\d{3}$/.test(version))throw Error('Versão local inválida');
const file='v'+version.slice(1)+'.html';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const suffix='?verificacao='+encodeURIComponent(version)+'-'+Date.now();
async function text(url){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),15000);
 try{
  const r=await fetch(url,{signal:controller.signal,redirect:'follow',headers:{'Cache-Control':'no-cache'}});
  if(!r.ok)throw Error('HTTP '+r.status+' '+url);
  return r.text();
 }finally{clearTimeout(timer)}
}
async function verify(){
 const [versionText,index,page]=await Promise.all([
  text(base+'assets/version.json'+suffix), text(base+suffix), text(base+file+suffix)
 ]);
 const online=JSON.parse(versionText);
 assert.equal(online.version,version,'CDN ainda não publica a versão esperada');
 assert.equal(online.home,file,'página inicial informada pelo manifesto é inconsistente');
 assert.equal(index.includes('var fallback=\''+version+'\''),true,'fallback do index não corresponde à versão');
 assert.equal(page.includes('Banco Mestre '+version),true,'HTML da versão não corresponde ao manifesto');
 if(version==='V241'){
  assert.ok(page.includes("tag('v241_timer_header.js"),'cronômetro V241 não publicado');
  assert.ok(page.includes("tag('v241_sync_truth.js"),'indicadores V241 não publicados');
  assert.ok(page.includes("tag('v241_controle_tab.js"),'Controle V241 não publicado');
  for(const asset of ['assets/v241_timer_header.js','assets/v241_sync_truth.js',
    'assets/v241_controle_tab.js','controle-estudos-v241.html']){
   const raw=await text(base+asset+suffix);
   assert.ok(raw.length>100,'arquivo publicado vazio: '+asset);
  }
 }
 return {version,html:file,cardCount:online.counts?.cards,
  pdfCount:online.counts?.pdfs,mediaCatalog:online.counts?.images_public_catalog};
}
(async()=>{
 let last;
 for(let attempt=1;attempt<=30;attempt++){
  try{const result=await verify();console.log(JSON.stringify({ok:true,attempt,...result}));return}
  catch(e){last=e;console.log('Tentativa '+attempt+'/30: '+e.message);if(attempt<30)await sleep(3000)}
 }
 console.error('Site público não confirmado:',last?.stack||last);
 process.exitCode=1;
})();
