/* Banco Mestre V2 · camada de dados pública e somente leitura.
   Todos os arquivos ficam na branch publicada gh-pages; nenhum token ou escrita privada. */
const assetRoot = new URL('../../assets/', import.meta.url);
const EXPECTED = Object.freeze({cards:1518,active:1501,images:179,contentImages:94,cardImages:85,pdfs:78});

function invariant(condition, message) {
  if (!condition) throw new Error('Integridade: ' + message);
}
async function readAsset(path, signal) {
  invariant(/^[a-zA-Z0-9_-]+\.json$/.test(path), 'caminho de catálogo inválido');
  const response = await fetch(new URL(path, assetRoot), {cache:'no-store', signal});
  if (!response.ok) throw new Error(path + ': resposta HTTP ' + response.status);
  return response.json();
}
export async function loadSnapshot(signal) {
  const [meta, editorial, pdf, storage, recovered] = await Promise.all([
    readAsset('meta_public_v194.json',signal),
    readAsset('v198_editorial_images_catalog.json',signal),
    readAsset('pdf_catalog_v149.json',signal),
    readAsset('v202_storage_contract.json',signal),
    readAsset('v180_native_image_additions.json',signal)
  ]);
  invariant(meta.version?.startsWith('V194') && Array.isArray(meta.card_files), 'índice de cartões V194 ausente');
  invariant(meta.counts?.cards === EXPECTED.cards && meta.counts?.active === EXPECTED.active, 'quantidade-base de cartões divergente');
  invariant(editorial.schema === 'BancoMestreImageEditorialCatalogV198' && Array.isArray(editorial.records), 'catálogo editorial V198 inválido');
  invariant(editorial.records.length === EXPECTED.images, 'quantidade de imagens divergente');
  const imgIds=editorial.records.map(x=>x.imageId);
  invariant(new Set(imgIds).size===imgIds.length && imgIds.every(Boolean), 'IDs de imagem duplicados/ausentes');
  invariant(editorial.records.filter(x=>x.type==='cartao').length===EXPECTED.cardImages, 'tipos de imagem de cartão divergentes');
  invariant(editorial.records.filter(x=>x.type==='conteudo').length===EXPECTED.contentImages, 'tipos de imagem de conteúdo divergentes');
  invariant(pdf.format==='BancoMestrePDFCatalogV140' && Array.isArray(pdf.documents) && pdf.documents.length===EXPECTED.pdfs,'biblioteca PDF V149 divergente');
  const pdfIds=pdf.documents.map(x=>x.id);
  invariant(new Set(pdfIds).size===pdfIds.length && pdfIds.every(Boolean), 'IDs de PDFs duplicados/ausentes');
  invariant(storage.schema==='BancoMestreStorageContractV202','contrato das pastas Drive não reconhecido');
  invariant(storage.canonical_write_destinations?.images?.folder_id === '1ksSVWrmRaRlDoG4iDtTGvfr2OnPnhnY6','destino de imagens divergente');
  invariant(storage.canonical_write_destinations?.checkpoints?.folder_id === '1348cILBcxFG9p2cfPJ3WubmHswPRbD24','destino de checkpoints divergente');
  invariant(recovered.schema === 'BancoMestreNativeImageAdditionsV180' && recovered.records?.length===93,'índice dos originais recuperados divergente');
  const recoveredByImageId = new Map(recovered.records.map(x=>[x.no,x]));
  return Object.freeze({meta,editorial,pdf,storage,recoveredByImageId,expected:EXPECTED,
    checkedAt:new Date(),cardCount:meta.counts.cards,imageCount:editorial.records.length,pdfCount:pdf.documents.length});
}
export async function loadPublicCards(meta, signal) {
  invariant(Array.isArray(meta?.card_files) && meta.card_files.length===7,'lista dos sete lotes públicos divergente');
  invariant(meta.card_files.every(name=>/^cards_public_v194_\d{3}\.json$/.test(name)),'arquivo de cartões não autorizado');
  const parts=await Promise.all(meta.card_files.map(name=>readAsset(name,signal)));
  invariant(parts.every(Array.isArray),'um lote de cartões não é uma lista');
  const cards=parts.flat();
  invariant(cards.length===EXPECTED.cards,'total de cartões diferente de 1.518');
  const ids=cards.map(x=>String(x.id||''));
  invariant(ids.every(x=>/^CARD-\d{4,}$/.test(x)) && new Set(ids).size===ids.length,'IDs de cartões inválidos/duplicados');
  invariant(cards.filter(x=>x.active!==false).length===EXPECTED.active,'total de cartões ativos diferente de 1.501');
  return cards;
}
/** A prévia não executa OAuth. Uma URL de arquivo do catálogo não atesta acesso. */
export function approvedDocumentUrl(value) {
  try {
    const url=new URL(value);
    if(url.protocol==='https:' && ['drive.google.com','docs.google.com'].includes(url.hostname)) return url.href;
  } catch {}
  return '';
}
