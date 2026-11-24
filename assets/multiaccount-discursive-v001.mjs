/* Registro literal de tentativa discursiva, separado da avaliação formal SRS.
 * Os registros V195 históricos não são alterados. */
import {ACCOUNT_RATINGS} from './multiaccount-review-events-v001.mjs';
const copyDisc=x=>JSON.parse(JSON.stringify(x));
export const DISC_FORMAT='BancoMestreRespostaDiscursivaV195';
const validDiscId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x);
const limit=(x,n)=>typeof x==='string'&&x.length<=n;
export function checkedDiscursive(row,owner){
 if(!row||row.format!==DISC_FORMAT||row.schema!=='BM-PORTAL-DISCURSIVE/1'||row.owner!==owner||!/^BM195-[a-f0-9-]{36}$/i.test(row.id)||!validDiscId(row.card_id)||!limit(row.front,60000)||!row.front.trim()||!limit(row.answer,60000)||!limit(row.note,12000)||!Object.hasOwn(ACCOUNT_RATINGS,row.rating)||(!row.answer.trim()&&row.rating!=='Difícil')||!Number.isFinite(Date.parse(row.created_at))||row.srs_status!=='nao_integrado_ao_srs_canonico')throw Error('Registro discursivo individual inválido.');
 return copyDisc(row)
}
export function newDiscursive({owner,card,answer,note='',rating,now=new Date(),uuid}){
 return checkedDiscursive({format:DISC_FORMAT,schema:'BM-PORTAL-DISCURSIVE/1',owner,id:'BM195-'+uuid,card_id:card.id,front:card.front,discipline:card.discipline||'',subject:card.subject||'',sub:card.sub||'',answer,note,rating,created_at:now.toISOString(),timezone_offset_min:now.getTimezoneOffset(),site_version:'V348-adaptacao',base_version:'perfil individual',mode:'resposta_discursiva',audit_status:'pendente_de_confronto_com_base',srs_status:'nao_integrado_ao_srs_canonico'},owner)
}
export function historicalDiscursive(records){
 return records.filter(r=>r?.format===DISC_FORMAT&&validDiscId(r.id)&&validDiscId(r.card_id)&&typeof r.answer==='string'&&Number.isFinite(Date.parse(r.created_at))).map(r=>({...copyDisc(r),sync_status:'synced'}))
}
export function mergeDiscursive(historical,events,owner){
 const map=new Map();for(const row of historical){if(map.has(row.id))throw Error('Tentativa histórica duplicada');map.set(row.id,copyDisc(row))}
 for(const e of events){const row=checkedDiscursive(e,owner);if(map.has(row.id))throw Error('Tentativa discursiva duplicada');map.set(row.id,{...row,sync_status:'synced',drive_file_id:e.fileId||null})}
 return [...map.values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)||a.id.localeCompare(b.id))
}
