/* Identidade V122 dos grifos: reprodução literal do núcleo legado, sem side effects.
 * Serve à auditoria, ao desenho e a backups filtrados da V2.
 */
export function legacyMarkId(mark){
  const hexHash=input=>{
    let a=2166136261,b=2246822519;
    for(let i=0;i<input.length;i++){
      const c=input.charCodeAt(i);
      a=Math.imul(a^c,16777619)>>>0;
      b=Math.imul(b^(c+(i&255)),3266489917)>>>0;
    }
    return a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0');
  };
  if(mark&&typeof mark.id==='string'&&/^[A-Za-z0-9_-]{4,160}$/.test(mark.id))
    return 'id:'+mark.id;
  if(mark&&typeof mark.type==='string'&&
      (Array.isArray(mark.points)||Array.isArray(mark.box)||Array.isArray(mark.rects)))
    return 'g:'+hexHash(JSON.stringify([mark.type,mark.points||mark.box||mark.rects,mark.created_at||'']));
  return 'l:'+hexHash(JSON.stringify(mark));
}
