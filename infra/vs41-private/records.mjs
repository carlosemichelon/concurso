// Existing public catalog ID families, not a new allocation policy.
const fail=code=>{const e=Error('Catálogo privado indisponível ou não autorizado');e.code=code;throw e};
export const legacyCardId=id=>typeof id==='string'&&/^(?:PROP-IJUI-[0-9]{3}|TRT0[12]-C[0-9]{3})$/.test(id);
export const readableCardId=id=>typeof id==='string'&&(/^CARD-[0-9]{4,12}$/.test(id)||legacyCardId(id));
export const readableExplanation=c=>typeof c.expl==='string'||(legacyCardId(c.id)&&!Object.hasOwn(c,'expl'));
export function verifyRecords(records){
 if(!Array.isArray(records)||records.length>20000)fail('records-list');const seen=new Set();
 for(const c of records){if(!c||!readableCardId(c.id)||seen.has(c.id)||typeof c.front!=='string'||!c.front.trim()||typeof c.back!=='string'||!c.back.trim()||!readableExplanation(c)||typeof c.active!=='boolean'||typeof c.discipline!=='string'||typeof c.group!=='string'||typeof c.subject!=='string')fail('records-schema');seen.add(c.id)}
 for(const c of records)if(c.related_card_ids!==undefined&&(!Array.isArray(c.related_card_ids)||c.related_card_ids.some(id=>!seen.has(id))))fail('records-links');
 return structuredClone(records);
}
