'use strict';
// Compact reporting only. The original release gate remains authoritative.
const fs=require('node:fs');
function summarize(report){
 if(!report||!Array.isArray(report.results)||!Number.isSafeInteger(report.total)||!Number.isSafeInteger(report.approved)||!Number.isSafeInteger(report.blocked)||report.total<0||report.approved<0||report.blocked<0||report.approved+report.blocked!==report.total||report.results.length!==report.total)throw Error('Relatório didático inválido ou incompleto.');
 const parts=new Map(),faults=new Map();
 for(const r of report.results){
  if(!r||typeof r.id!=='string'||typeof r.part!=='string'||!Array.isArray(r.faults)||r.faults.some(x=>typeof x!=='string'))throw Error('Registro de auditoria inválido.');
  if(!r.faults.length)continue;
  parts.set(r.part,(parts.get(r.part)||0)+1);
  for(const fault of new Set(r.faults))faults.set(fault,(faults.get(fault)||0)+1);
 }
 if([...parts.values()].reduce((a,b)=>a+b,0)!==report.blocked)throw Error('Contagem de bloqueios divergente.');
 const rank=m=>[...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 return {total:report.total,approved:report.approved,blocked:report.blocked,byPart:rank(parts),topFaults:rank(faults).slice(0,10),distinctFaults:faults.size};
}
if(require.main===module){
 try{const summary=summarize(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));console.log(JSON.stringify(summary,null,2));}
 catch(e){console.error('Resumo indisponível: '+e.message);process.exitCode=1;}
}
module.exports={summarize};
