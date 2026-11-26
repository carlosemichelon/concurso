// Original canvas editor. Storage uses authenticated immutable image snapshots, never localStorage.
export function privateImageEditor(source){
 let s=source;
 const replace=(x,y)=>{if(s.split(x).length!==2)throw Error('Contrato editor imagem divergente: '+x.slice(0,70));s=s.replace(x,y)};
 function block(x,y,v){const i=s.indexOf(x),j=s.indexOf(y,i+x.length);if(i<0||j<0)throw Error('Contrato editor imagem divergente: '+x);s=s.slice(0,i)+v+'\n'+s.slice(j)}
 block('const key=()=>','function checkpoint(){',`let row=null,busy=false,failed=false,opening=false,epoch=0;
 function note(msg){$('imgMessage').textContent=msg}
 function ready(){return !!row&&!busy&&!failed&&dialog.open}
 function save(){
  if(!ready()){if(row)strokes=clone(row.marks);draw();return}
  const snapshot=clone(strokes),ticket=epoch,input={event_id:crypto.randomUUID(),hash:row.hash,previous:row.revision,marks:snapshot};
  busy=true;note('Gravando marcações privadas…');
  void root.BMVS41PrivateImageInk.save(imageId,input).then(next=>{
   if(ticket!==epoch)return;
   if(next.revision!==input.event_id||next.hash!==input.hash)throw Error('Confirmação divergente');
   row=next;note('Marcações privadas gravadas e conferidas no Drive.');
  }).catch(e=>{if(ticket===epoch){failed=true;strokes=clone(row.marks);selected.clear();undo=[];redo=[];note('Gravação não confirmada: '+e.message+'. Reabra a imagem.')}})
  .finally(()=>{if(ticket===epoch){busy=false;draw()}});
 }
 `);
 replace("function applyHistory(direction){","function applyHistory(direction){\n if(!ready())return;");
 replace("function deleteSelected(){if(!selected.size)return;","function deleteSelected(){if(!ready()||!selected.size)return;");
 replace("if(!imageId||e.button>1)return;","if(!imageId||!ready()||e.button>1)return;");
 replace("strokes.splice(i,1);selected.clear();draw();save();","strokes.splice(i,1);selected.clear();draw();");
 replace("else if(working.type==='move'&&working.changed)save();","else if((working.type==='move'||working.type==='eraser')&&working.changed)save();");
 replace("strokes=load();","strokes=clone(row.marks);");
 replace(" root.BM419ImageFlags?.openEditor(null);\n"," /* Flags administrativos não são usados neste editor. */\n");
 // The original close function also invokes flags; remove its separate occurrence.
 replace("root.BM419ImageFlags?.openEditor(null);imageId=null;","imageId=null;");
 replace("$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;$('deleteSelected').disabled=!selected.size;","$('undo').disabled=busy||failed||!undo.length;$('redo').disabled=busy||failed||!redo.length;$('deleteSelected').disabled=busy||failed||!selected.size;");
 replace("function close(){resetPan();","function close(){epoch++;row=null;busy=false;failed=false;strokes=[];ctx.clearRect(0,0,sourceW,sourceH);baseCtx.clearRect(0,0,sourceW,sourceH);resetPan();");
 replace("$('imgClose').onclick=()=>dialog.close();","$('imgClose').onclick=()=>{if(busy){note('Aguarde a confirmação das marcações.');return}dialog.close()};");
 replace("dialog.addEventListener('close',close);","dialog.addEventListener('close',close);dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault()});");
 replace("root.BancoMestreEditorV030={open};",`root.BancoMestreEditorV030={open:async()=>{throw Error('Abra a imagem pela biblioteca autenticada')}};
 root.BMVS41PrivateImageEditor=Object.freeze({
  async open(file){
   if(opening||busy||dialog.open)throw Error('Editor ocupado');opening=true;
   try{
    if(!file||!Array.isArray(file.card_ids)||!file.card_ids.length)throw Error('Imagem sem vínculo');
    const blob=await root.BMVS41PrivateMedia.read(file.card_ids[0],file.id);
    if(!/^image\\/(png|jpeg|webp|gif)$/.test(blob.type))throw Error('Formato inválido');
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');
    const next=await root.BMVS41PrivateImageInk.get(file.id);
    if(next.hash!==hash||!root.BMVS41Session.available())throw Error('Versão ou sessão alterada');
    const src=URL.createObjectURL(blob);
    try{const image=new Image();image.src=src;await image.decode();row=next;failed=false;epoch++;await open({image,imageId:file.id,title:file.title,quality:'Original privado conferido',warning:'Marcações salvas na conta autenticada. Original preservado.'});note('Marcações privadas carregadas.');}
    finally{URL.revokeObjectURL(src)}
   }finally{opening=false}
  },
  get busy(){return busy},get confirmed(){return ready()},get marks(){return clone(strokes)}
 });
 `);
 return s;
}
