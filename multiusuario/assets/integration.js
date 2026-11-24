/* Cross-module protections; no routine hashing. */
export function replaceDatabase(target,incoming){const copy=JSON.parse(JSON.stringify(incoming));for(const k of Object.keys(target))delete target[k];Object.assign(target,copy);return target}
export function assertCurrentCard(data,original){const c=data.cards.find(x=>x.id===original.id);if(!c||JSON.stringify(c)!==JSON.stringify(original))throw Error('Cartão alterado desde a abertura. Reabra antes de evoluir.');return c}
export function assertCurrentRevision(expected,current){if(expected!==current)throw Error('Banco alterado durante a operação. Reabra e confira.')}
export function assertBackupOwner(payload,owner,project){if(!payload||payload.owner!==owner||payload.project!==project||payload.data?.legacyImport&&payload.data.legacyImport.owner!==owner)throw Error('Backup de outra conta ou projeto incompatível.');return payload.data}
