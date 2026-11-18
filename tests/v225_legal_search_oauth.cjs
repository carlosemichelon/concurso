const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const page=read('v225.html'),previous=read('v224.html');
const tax=read('assets/v225_legal_taxonomy.js');
const filters=read('assets/v225_flash_filters.js');
const grid=read('assets/v225_trt_cards_grid.js');
const oauth=read('assets/v225_drive_reconnect.js');
const paths=[
'trt01_c001_v211','trt01_c002_v212','trt01_c003_v215','trt01_c004_v217',
'trt01_c005_v220','trt01_c006_v221','trt01_c007_v222','trt01_c008_v224'
];
const items=Object.fromEntries(paths.map((name,i)=>{
 const c=JSON.parse(read('assets/'+name+'.json'));
 assert.equal(c.id,'TRT01-C'+String(i+1).padStart(3,'0'));
 assert.equal(c.layers.length,11);
 return [name,c];
}));
const handlers={};
const context={window:{},document:{readyState:'loading',addEventListener:(name,fn)=>handlers[name]=fn,
 dispatchEvent:()=>{}},CustomEvent:class CustomEvent{constructor(type,x){this.type=type;this.detail=x?.detail}},
 fetch:async url=>{const key=paths.find(n=>url.includes(n));return {ok:Boolean(key),status:key?200:404,json:async()=>items[key]};}};
vm.runInNewContext(tax,context,{filename:'v225_legal_taxonomy.js'});
const api=context.window.BM225LegalTaxonomy;
assert.ok(api,'taxonomia inicializada');
(async()=>{
 const result=await api.load();
 assert.equal(result.errors,0,'todos arquivos TRT carregados');
 assert.equal(result.count,8);
 assert.equal(api.all().length,8);
 assert.equal(api.general(api.byId('TRT01-C001')),'leg_constitucional');
 assert.equal(api.general(api.byId('TRT01-C008')),'leg_constitucional');
 const originals=[];
 for(let k=0;k<6;k++){
  const file=JSON.parse(read('assets/cards_public_v024_'+String(k).padStart(3,'0')+'.json'));
  originals.push(...file);
 }
 const law=originals.filter(c=>c.group==='LEGISLACAO');
 assert.equal(law.length,65,'base jurídica original com 65 registros: conteúdo não modificado');
 const categories=new Map();
 for(const c of law)categories.set(api.general(c),(categories.get(api.general(c))||0)+1);
 assert.equal([...categories.values()].reduce((a,b)=>a+b,0),65);
 assert.ok(categories.size>=5,'novos grupos realmente distinguem legislação existente');
 assert.equal(api.general(law.find(c=>c.subject==='Ética Confea')),'leg_etica');
 assert.equal(api.general(law.find(c=>c.subject==='Improbidade e transparência')),'leg_administrativo');
 assert.equal(api.general(law.find(c=>c.subject==='Estatuto da Cidade')),'leg_urbanistico');
 assert.ok(api.categories.some(x=>x.id==='leg_local'));
 assert.ok(api.categories.some(x=>x.id==='leg_ambiental'));
 assert.ok(filters.includes("window.BM225LegalTaxonomy?.all?.()"),'TRT contam nos filtros, sem entrar nos cartões canônicos');
 assert.ok(filters.includes("window.BM225LegalTaxonomy?.general(c)"),'áreas jurídicas nos filtros');
 assert.ok(grid.includes("window.BM152FlashFilters?.matches?.(meta)===false"),'TRT respeitam filtros avançados');
 assert.ok(grid.includes('counterStatus(visibleIds)'), 'contagem de TRT na busca');
 assert.ok(grid.includes("summary strong{display:none!important}"),'pergunta TRT não duplicada');
 assert.ok(grid.includes("p.hidden=Boolean(extra)"),'mensagem falsa de zero cartões escondida');
 assert.ok(grid.includes("'TRT01-C008'"),'TRT01-C008 preservado');
 assert.ok(page.includes("tag('v225_legal_taxonomy.js?v=225')+tag('v225_flash_filters.js?v=225')"));
 for(const x of ['v225_trt_cards_grid.js','v225_drive_reconnect.js','trt01_c008_loader.js',
 'v218_drive_gallery_feed.js','v222_images_live.js','v222_pdf_editor_route.js']){
  assert.ok(page.includes(x),'módulo necessário na V225: '+x);
 }
 assert.ok(previous.includes('trt01_c008_loader.js'),'V224 anterior preservada para rollback');
 assert.ok(!oauth.includes('localStorage.setItem'),'não armazenar token Google em localStorage');
 assert.ok(!oauth.includes('sessionStorage.setItem'),'não guardar credencial de acesso em sessão');
 assert.ok(oauth.includes("document.addEventListener('bm-media-drive-authorized',update)"),'atualizar status de conexão após OAuth');
 assert.ok(oauth.includes('d.authorize()'),'renovar com gesto do usuário');
 const manifest=JSON.parse(read('assets/version.json'));
 assert.match(manifest.version,/^V\d{3}$/);assert.ok(Number(manifest.version.slice(1))>=225);assert.ok(Number(manifest.previous_version.slice(1))<Number(manifest.version.slice(1)));
 assert.equal(manifest.release_v225.srs_canonical_unchanged,true);
 assert.equal(manifest.release_v225.token_security,'never stored in localStorage, cookies, GitHub or Drive');
 assert.ok(read('index.html').includes('data-bm-portal-version="'+manifest.version+'"'));
 assert.ok(read('index.html').includes('TRT01-C00[12345678]'));
 console.log('V225 aprovado: 65 leis categorizadas, 8 TRT, busca sem duplicação, OAuth renovável sem persistência insegura.');
})().catch(err=>{console.error(err);process.exitCode=1});
