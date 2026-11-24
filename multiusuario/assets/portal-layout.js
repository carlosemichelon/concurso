/* Presentation only: no account data, storage, or SRS mutation. */
export const NAV_GROUPS=Object.freeze([{id:'study',label:'Estudar',routes:['home','pdf','cards','media','review','questions']},{id:'organize',label:'Organizar',routes:['control','methodology','sync']}]);
export function groupOf(route){return NAV_GROUPS.find(g=>g.routes.includes(route))?.id||'study'}
export function visibleNavigation(route){return NAV_GROUPS.find(g=>g.id===groupOf(route)).routes.slice()}
export function readerLayout(revealed,preference,mobile){return {related:!!revealed&&(preference==='open'||preference==='auto'&&!mobile),toggle:!!revealed}}
export function readingActionLabel(revealed,formal){return revealed?'Resposta revelada':formal?'Revelar resposta':'Mostrar resposta'}
