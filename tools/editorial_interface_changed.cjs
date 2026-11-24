/* VM3: browser somente se o leitor/interface ou seus testes realmente mudarem. */
const cp=require('node:child_process'),fs=require('node:fs');
const git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024});
const normalize=s=>s.replace(/data-bm-portal-version="V\d+"/g,'data-bm-portal-version="V"').replace(/(Cartões|Catálogo) VC\d+/g,'$1 VC').replace(/^const BM_CATALOG=Object\.freeze\([^\n]*\);[ \t]*$/gm,'const BM_CATALOG=CATALOG;');
function changed(base){
 if(!base||/^0+$/.test(base))return true;
 try{
  const old=git('show',base+':index.html'),now=fs.readFileSync('index.html','utf8');
  if(normalize(old)!==normalize(now))return true;
  const files=git('diff','--name-only',base,'HEAD').split('\n');
  return files.some(p=>/^assets\/.*\.(?:css|js|mjs)$/.test(p)||p==='tests/closure_browser.cjs'||p==='tools/editorial_interface_changed.cjs'||p==='.github/workflows/closure-gate.yml');
 }catch(e){console.warn('Comparação indisponível; executar verificação de interface:',e.message);return true}
}
if(require.main===module)console.log('interface_changed='+changed(process.argv[2]));
module.exports={normalize,changed};
