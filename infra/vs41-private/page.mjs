// Derive the test page from the official HTML without modifying the snapshot or its CSS.
export function privatePage(source){
 if(!source.includes('data-bm-portal-version="V432"'))throw Error('Versão ainda não homologada');
 let html=source;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('Contrato VS41 divergente: '+a.slice(0,80));html=html.replace(a,b)};
 replace("  let p;\n  try{\n   const controller","  let p;\n  const privateSource=window.BMVS41PrivateCards;\n  try{\n   if(!privateSource)throw Error('Fonte privada ausente');\n   if(privateSource){p=await privateSource.read();}else{\n   const controller");
 replace("!p.guideData||!p.generalGuide||!p.auditF17||!p.answersF17)throw Error('Catálogo consolidado inválido');\n  }catch(e){","!p.guideData||!p.generalGuide||!p.auditF17||!p.answersF17)throw Error('Catálogo consolidado inválido');\n   }\n  }catch(e){");
 replace("const base=p.base,ijui=p.ijui;\n   cards=[...base,...ijui];loadedCards=true;bm366ApplyRelations(cards);","const base=p.base,ijui=p.ijui;\n   cards=[...base,...ijui];loadedCards=true;if(!privateSource)bm366ApplyRelations(cards);");
 replace("function loadCardsLegacy(){\n if(bm123CardsPromise)","function loadCardsLegacy(){\n return Promise.reject(Error('Fonte legada bloqueada no ambiente privado'));\n if(bm123CardsPromise)");
 replace('<head>','<head><script src="/infra/vs41-private/client.js"></script>');
 return html;
}
