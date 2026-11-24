export const MAX_ATTEMPT=12000;
export function checkedAttempt(v){if(typeof v!=='string'||v.length>MAX_ATTEMPT)throw Error('Resposta digitada inválida ou extensa demais.');return v}
export function attemptDraft(cardId){return {cardId,text:''}}
export function updateAttempt(draft,cardId,text){if(!draft||draft.cardId!==cardId)throw Error('Resposta pertence a outro cartão.');return {cardId,text:checkedAttempt(text)}}
export function attemptForEvent(draft,cardId){if(!draft||draft.cardId!==cardId)throw Error('Resposta pertence a outro cartão.');const text=checkedAttempt(draft.text);return text.trim()?{attempt:text}:{}}
