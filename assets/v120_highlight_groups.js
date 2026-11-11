/* V120: mesmo agrupador de parágrafos no PDF e na biblioteca; correção de normalização de espaços. */
/* V097 — agrupamento de apresentação de grifos multicoloridos.
   Não reescreve registros, IDs, notas nem o localStorage; agrupamento legado
   exige sequência completa, contígua, mesma página e carimbo de tempo próximo.
*/
(function(){
 'use strict';
 if(window.BancoMestreHighlightGroupsV097)return;
 const validId=x=>typeof x==='string'&&/^BM-GRP-[0-9A-Za-z-]{10,100}$/.test(x);
 const isText=e=>e?.mark?.type==='text_highlight';
 const sameDoc=(a,b)=>a?.docId===b?.docId&&a?.hash===b?.hash&&a?.page===b?.page;
 function legacySequence(rows,i){
  const first=rows[i],m=first?.mark;
  const n=m?.segment_total;
  if(!isText(first)||validId(m.selection_group_id)||
     !Number.isInteger(n)||n<2||n>40||m.segment_index!==1||
     !m.id||typeof m.created_at!=='string')return null;
  const stamp=Date.parse(m.created_at);
  if(!Number.isFinite(stamp)||i+n>rows.length)return null;
  const parts=rows.slice(i,i+n);
  const used=new Set();
  for(let j=0;j<n;j++){
   const p=parts[j],mark=p?.mark,at=Date.parse(mark?.created_at||'');
   if(!isText(p)||!sameDoc(p,first)||validId(mark.selection_group_id)||
      mark.segment_index!==j+1||mark.segment_total!==n||
      !mark.id||used.has(mark.id)||!Number.isFinite(at)||
      Math.abs(at-stamp)>1500)return null;
   used.add(mark.id);
  }
  return parts;
 }
 function autoGroupRows(rows){
  if(!Array.isArray(rows))return [];
  const out=[],byId=new Map();
  for(let i=0;i<rows.length;i++){
   const e=rows[i],id=e?.mark?.selection_group_id;
   if(isText(e)&&validId(id)){
    const key=[e.docId,e.hash,e.page,id].join('|');
    let group=byId.get(key);
    if(!group){
     group={parts:[],groupId:id,legacy:false};
     byId.set(key,group);out.push(group);
    }
    group.parts.push(e);continue;
   }
   const legacy=legacySequence(rows,i);
   if(legacy){
    out.push({parts:legacy,groupId:null,legacy:true});
    i+=legacy.length-1;continue;
   }
   out.push({parts:[e],groupId:null,legacy:false});
  }
  // Não impor ordem arbitrária: novos segmentos incluem segment_index no lote.
  for(const g of out)if(g.groupId&&g.parts.length>1)
   g.parts.sort((a,b)=>(a.mark.segment_index||999)-(b.mark.segment_index||999));
  return out;
 }

 // The user can join existing highlights in the SAME PDF and SAME page.
 // Manual groups are an independent presentation map, never a rewrite of marks.
 function groupRows(rows,customGroups=[]){
  const base=autoGroupRows(rows);
  if(!Array.isArray(customGroups)||!customGroups.length)return base;
  const byMark=new Map(),byGroup=new Map();
  for(const entry of customGroups){
   if(!entry||!/^BM-JOIN-[A-Za-z0-9-]{8,100}$/.test(String(entry.id||''))||
      !Number.isSafeInteger(entry.page)||entry.page<1||
      !Array.isArray(entry.markIds)||entry.markIds.length<2||entry.markIds.length>250)continue;
   const ids=[...new Set(entry.markIds.filter(x=>typeof x==='string'&&/^BM-TXT-[A-Za-z0-9-]{6,120}$/.test(x)))];
   if(ids.length!==entry.markIds.length)continue;
   byGroup.set(entry.id,{...entry,markIds:ids});
   for(const id of ids)if(!byMark.has(id))byMark.set(id,entry.id);
  }
  const out=[],manual=new Map();
  for(const g of base){
   const ids=g.parts.map(e=>isText(e)?e.mark.id:null);
   const distinct=ids.length&&ids.every(id=>id&&byMark.has(id))?
    new Set(ids.map(id=>byMark.get(id))):null;
   const target=distinct?.size===1?byGroup.get(byMark.get(ids[0])):null;
   const fits=target&&g.parts.every(e=>isText(e)&&e.page===target.page);
   if(!fits){out.push(g);continue}
   let item=manual.get(target.id);
   if(!item){
    item={parts:[],groupId:target.id,manualId:target.id,manual:true,manualTexts:[],legacy:false};
    manual.set(target.id,item);out.push(item);
   }
   item.parts.push(...g.parts);
   const phrase=paragraphText(g);
   if(phrase)item.manualTexts.push(phrase);
  }
  return out;
 }
 function paragraphText(group){
  if(!group?.parts?.length)return '';
  if(group.manual&&Array.isArray(group.manualTexts)&&group.manualTexts.length)
   return group.manualTexts.join(' … ').replace(/\s+/g,' ').trim();
  const preferred=group.parts.find(e=>typeof e.mark.selection_group_text==='string'&&e.mark.selection_group_text.trim());
  if(preferred)return preferred.mark.selection_group_text.trim();
  return group.parts.map(e=>String(e.mark?.text||'').trim()).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
 }
 window.BancoMestreHighlightGroupsV097=Object.freeze({groupRows,paragraphText});
})();