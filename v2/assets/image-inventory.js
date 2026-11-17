/* Atlas V2 — catálogo editorial + arquivos privados observados nesta sessão.
 * Um único inventário visual, deduplicado pelo fileId imutável do Drive.
 * Classificação de novos arquivos sem cartão comprovado: CONTEÚDO provisório
 * apenas para consulta; nunca grava no GitHub, Drive ou SRS.
 */
const TYPE=new Set(['cartao','conteudo']);
const DRIVE_ID=/^[A-Za-z0-9_-]{10,200}$/;
function driveId(record){
  const id=String(record?.driveFileId||record?.id||'');
  return DRIVE_ID.test(id)?id:'';
}
export function buildAtlasInventory(editorialRecords,recoveredByImageId,driveFiles=[]){
  if(!Array.isArray(editorialRecords)||!(recoveredByImageId instanceof Map))
    throw Error('Catálogo editorial ou vínculos recuperados indisponíveis');
  if(!Array.isArray(driveFiles))throw Error('Lista privada Drive inválida');
  const observed=new Map();
  for(const file of driveFiles){
    if(!file||!DRIVE_ID.test(String(file.id||'')))continue;
    if(!observed.has(file.id))observed.set(file.id,file);
  }
  const represented=new Set(),editorialIds=new Set();
  const published=editorialRecords.map(item=>{
    if(!item||!item.imageId||editorialIds.has(item.imageId)||!TYPE.has(item.type))
      throw Error('Referência pública de imagem inválida/duplicada');
    editorialIds.add(item.imageId);
    const recovered=recoveredByImageId.get(item.imageId);
    const id=recovered?driveId(recovered):'';
    if(id)represented.add(id);
    const file=id?observed.get(id)||null:null;
    return Object.freeze({
      kind:'editorial',key:item.imageId,imageId:item.imageId,
      title:String(item.title||item.imageId),
      type:item.type,provisional:false,
      subtype:String(item.subtype||''),basis:item.basis,
      cardIds:Array.isArray(item.cardIds)?item.cardIds:[],
      driveId:id,driveFile:file,
      sourceUrl:String(recovered?.source_url||''),
      searchExtra:[file?.name||'',file?.path||'',file?.id||'']
    });
  });
  const additional=[];
  for(const [id,file] of observed){
    if(represented.has(id))continue;
    additional.push(Object.freeze({
      kind:'drive',key:'DRIVE-IMG-'+id,imageId:'',
      title:String(file.name||'Arquivo Drive').slice(0,240),
      type:'conteudo',provisional:true,subtype:'',
      basis:'sem_associacao_comprovada',cardIds:[],
      driveId:id,driveFile:file,sourceUrl:String(file.webUrl||''),
      searchExtra:[id,file.path||'',file.mimeType||'']
    }));
  }
  // Priorizar os arquivos identificados na atualização atual, sem alterar a
  // sequência das 179 imagens editoriais nem seus vínculos já curados.
  return Object.freeze({
    records:Object.freeze([...additional,...published]),
    editorialCount:published.length,
    additionalCount:additional.length,
    observedCount:observed.size,
    matchedDriveCount:published.filter(x=>x.driveFile!==null).length
  });
}
export function filterAtlasInventory(records,{type='all',query=''}={}){
  if(!Array.isArray(records)||!['all','cartao','conteudo'].includes(type))
    throw Error('Filtro de imagens inválido');
  const q=String(query||'').trim().toLocaleLowerCase('pt-BR');
  return records.filter(item=>
    (type==='all'||item.type===type)&&
    (!q||[item.key,item.imageId,item.title,item.subtype,item.basis,
      ...(item.cardIds||[]),...(item.searchExtra||[])]
      .some(value=>String(value||'').toLocaleLowerCase('pt-BR').includes(q)))
  );
}
