// Export only the exact official editorial catalog for a private migration test.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {readOfficial} from '../infra/vs41-private/migration.mjs';
import {verifyRecords} from '../infra/vs41-private/records.mjs';
const {snapshot,contract}=readOfficial();
const cards=verifyRecords(snapshot.base);
if(contract.display_version!=='VC52'||cards.length!==1460||cards.some(c=>c.active!==true)||!contract.unified||!contract.active_only)throw Error('VC52 de referência não confirmada');
const redirects=snapshot.consolidation?.redirects;
const retired=snapshot.retired_ids;
if(!redirects||!Array.isArray(retired))throw Error('Histórico editorial ausente');
const ids=new Set(cards.map(c=>c.id));
for(const source of Object.keys(redirects)){let x=source;const seen=new Set();while(redirects[x]&&!seen.has(x)){seen.add(x);x=redirects[x]}if(seen.has(x)||ids.has(source)||!ids.has(x))throw Error('Remissão inválida');}
if(JSON.stringify(cards)!==JSON.stringify(snapshot.base))throw Error('Conteúdo editorial alterado');
const payload={format:'BM-DRIVE-EDITORIAL-SEED/1',version:contract.display_version,source:{path:contract.path,git_blob:contract.git_blob},counts:{cards:cards.length,active:cards.length,redirects:Object.keys(redirects).length,retired:retired.length},cards,redirects,retired_ids:retired,migration_status:'editorial-candidate-only'};
const bytes=Buffer.from(JSON.stringify(payload));
const out=process.argv[2];if(!out)throw Error('Informe o destino local do arquivo candidato');
fs.writeFileSync(out,bytes,{flag:'wx'});
const check=JSON.parse(fs.readFileSync(out,'utf8'));
if(JSON.stringify(check.cards)!==JSON.stringify(snapshot.base))throw Error('Conferência do arquivo gerado falhou');
console.log(JSON.stringify({version:payload.version,...payload.counts,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),migration_status:payload.migration_status}));
