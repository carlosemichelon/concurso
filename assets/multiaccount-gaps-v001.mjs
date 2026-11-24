// Original V242 schema with bounded, individual storage.
export const GAPS_KIND='learning-gaps',GAPS_BACKUP_KIND='learning-gaps-backup';
export const emptyGaps=()=>({schema:1,records:[],log:[],updatedAt:null});
export const stages=['Identificada','Explicada','Em reforço','Dominada'];
const coverage=['Não auditada','Direta','Indireta','Parcial','Ausente'];
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const unique=(rows,check)=>{const seen=new Set();return rows.every(r=>{if(!plain(r)||typeof r.id!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(r.id)||seen.has(r.id)||!check(r))return false;seen.add(r.id);return true})};
export function checkedGapsData(d){
 if(!plain(d)||d.schema!==1||!Array.isArray(d.records)||!Array.isArray(d.log)||JSON.stringify(d).length>5000000||d.records.length>10000||d.log.length>50000)throw Error('Cadastro de lacunas inválido');
 if(!unique(d.records,r=>r.id.startsWith('LAC-')&&Array.isArray(r.cardIds)&&r.cardIds.length<=100&&r.cardIds.every(x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x))&&typeof r.relatoEstudante==='string'&&typeof r.diagnosticoAssistente==='string'&&coverage.includes(r.cobertura)&&stages.includes(r.etapa)&&Array.isArray(r.historico)&&r.historico.every(plain))||!unique(d.log,r=>typeof r.event==='string'&&typeof r.at==='string'))throw Error('ID, autoria, vínculo ou histórico inválido');
 return JSON.parse(JSON.stringify(d))
}
export function checkedGapsEnvelope(x,owner){
 if(!plain(x)||x.schema!=='BM-PORTAL-GAPS/1'||x.owner!==owner)throw Error('Lacunas de outro perfil ou esquema inválido');
 return {schema:x.schema,owner,data:checkedGapsData(x.data)}
}
