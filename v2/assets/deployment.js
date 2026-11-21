/* Portal V2 — auditoria passiva da entrada e do manifesto publicado.
 * Nunca confunde ramo GitHub com CDN: HTTP 200 confirma resposta daquele URL
 * no instante do teste, não integridade de todas as funções da página.
 */
const assetRoot=new URL('../../',import.meta.url);
const versionPattern=/^V[0-9]{3,}$/;
const filePattern=/^v[0-9]{3,}\.html$/;
export function inspectDeployment(manifest,indexHtml,{homeHttpStatus=null}={}){
  const issues=[];
  const version=String(manifest?.version||'');
  const home=String(manifest?.home||'');
  const previous=String(manifest?.previous_version||'');
  if(!versionPattern.test(version))issues.push({code:'manifest_version_invalid',severity:'error',message:'Manifesto sem versão VNNN válida'});
  if(!filePattern.test(home)||home!==('v'+version.slice(1)+'.html'))
    issues.push({code:'manifest_home_mismatch',severity:'error',message:'Campo home não corresponde à versão do manifesto'});
  const counts=manifest?.counts||{};
  const publicCounts={cards:Number(counts.cards),images:Number(counts.images),pdfs:Number(counts.pdfs)};
  if(publicCounts.cards!==1518||publicCounts.images!==179||publicCounts.pdfs!==78)
    issues.push({code:'public_count_changed',severity:'warning',message:'Contagens do manifesto diferem dos catálogos V194/V198/V149 atualmente suportados pela V2'});
  const redirectedByManifest=typeof indexHtml==='string'&&
    indexHtml.includes("fetch('./assets/version.json'")&&
    /location\.replace\(/.test(indexHtml);
  if(!redirectedByManifest)issues.push({code:'index_not_using_manifest',severity:'warning',message:'Entrada não comprovou redirecionamento pelo manifesto'});
  const fallbackMatch=typeof indexHtml==='string'?indexHtml.match(/var fallback\s*=\s*['"](V\d{3,})['"]/):null;
  const fallback=fallbackMatch?.[1]||'';
  if(!fallback)issues.push({code:'fallback_not_found',severity:'warning',message:'Fallback do index não identificável'});
  else if(fallback!==version)
    issues.push({code:'stale_fallback',severity:'warning',message:'Fallback estático do index difere da versão do manifesto'});
  if(homeHttpStatus!==null&&homeHttpStatus!==200)
    issues.push({code:'home_http_error',severity:'error',message:'Página indicada pelo manifesto respondeu HTTP '+homeHttpStatus});
  const status=issues.some(x=>x.severity==='error')?'error':issues.length?'warning':'ok';
  return Object.freeze({
    checkedAt:new Date().toISOString(),status,version,home,previousVersion:previous,
    indexUsesManifest:redirectedByManifest,fallbackVersion:fallback,
    homeHttpStatus,publicCounts,issues,
    note:'Verificação HTTP e de campos; não testa autenticação, JavaScript nem conteúdo privado.'
  });
}
export async function inspectLiveDeployment({signal}={}){
  const fetcher=(path,options={})=>fetch(new URL(path,assetRoot),{
    credentials:'omit',cache:'no-store',signal,...options
  });
  const [manifestResponse,indexResponse]=await Promise.all([
    fetcher('assets/version.json'),fetcher('index.html')
  ]);
  if(!manifestResponse.ok||!indexResponse.ok)
    throw Error('Manifesto/index inacessível: HTTP '+manifestResponse.status+'/'+indexResponse.status);
  const [manifest,indexHtml]=await Promise.all([manifestResponse.json(),indexResponse.text()]);
  const candidate=String(manifest.home||'');
  // Jamais seguir URL externa, ../ ou query fornecida pelo manifesto.
  let homeStatus=null;
  if(filePattern.test(candidate)){
    const home=await fetcher(candidate,{method:'HEAD'});
    homeStatus=home.status;
  }
  return inspectDeployment(manifest,indexHtml,{homeHttpStatus:homeStatus});
}
