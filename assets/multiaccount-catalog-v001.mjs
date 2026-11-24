/* Adapter for the authenticated profile, not activated in original UI. */
export const CATALOGS=Object.freeze({'civil-public-v348':Object.freeze({id:'civil-public-v348'}),'private-only':Object.freeze({id:'private-only'})});
export function createCatalogLoader(original,fetcher=fetch){
 if(!original||typeof original.loadCivil!=='function')throw Error('Carregador original indisponível');
 return async descriptor=>{if(descriptor===CATALOGS['civil-public-v348'])return original.loadCivil(fetcher);if(descriptor===CATALOGS['private-only'])return {cards:[],catalog:'private-only'};throw Error('Catálogo não autorizado')};
}
