/* V342 — teste de integridade de mídia dos cartões; sem dependências externas. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const registry=json('assets/card_media_integrity_v342.json');
const v339=json('assets/v339_visual_methodology.json');
const v340=json('assets/petro26_granulometry_delta_v340.json');
const v341=json('assets/petro26_closure_media_v341.json');
const err=[];
const check=(cond,msg)=>{if(!cond)err.push(msg)};
const validId=id=>/^CARD-\d{4}$/.test(id);
const registryPublic=new Map(registry.public_visuals.map(m=>[m.src,m]));
const registryPrivate=new Map(registry.private_originals.map(m=>[m.media_id,m]));
const srcMap=new Map(),privateMap=new Map();
function relate(map,key,card){if(!map.has(key))map.set(key,new Set());map.get(key).add(card);}
for(const [id,p] of Object.entries(v339.cards)){
 check(validId(id),'ID V339 inválido: '+id);
 check(p.visual?.role==='IMAGEM_DO_CARTAO_VERSO','V339: posição pedagógica: '+id);
 relate(srcMap,p.visual.src,id);
}
for(const [id,p] of Object.entries(v340.profiles)){
 check(validId(id),'ID V340 inválido: '+id);
 for(const v of p.visuals||[]){
   check(v.show_in_revision_front===false,'V340: imagem de resposta indevida na frente: '+id);
   relate(srcMap,v.src,id);
 }
 for(const o of p.originals||[]){
   check(o.drive_file_id&&o.sha256&&o.url,'V340: original sem procedência: '+id);
   relate(privateMap,o.id,id);
 }
}
for(const m of v341.originals||[]){
 check(m.type==='ORIGINAL_USUARIO'&&m.sha256&&m.url&&m.drive_id,
   'V341: original sem procedência: '+m.image_id);
 for(const card of m.card_ids||[])relate(privateMap,m.image_id,card);
}
for(const [card,ids] of Object.entries(v341.card_to_original||{})){
 for(const id of ids)check(privateMap.get(id)?.has(card),'V341: relação invertida: '+card+'/'+id);
}
check(registry.schema==='BancoMestreMediaIntegrityV342','Contrato incorreto');
check(registryPublic.size===registry.public_visuals.length,'SVG duplicado no catálogo');
check(registryPrivate.size===registry.private_originals.length,'Original duplicado no catálogo');
for(const [src,expected] of srcMap){
 const m=registryPublic.get(src);
 check(!!m,'SVG utilizado sem registro: '+src);
 if(!m)continue;
 check(m.kind==='SVG_DIDATICO_PUBLICO'&&m.role==='VERSO_APOS_RESPOSTA',
   'SVG sem tipo ou fase: '+src);
 check(/^assets\/card_visuals_v\d+\/[A-Za-z0-9_-]+\.svg$/.test(src),
   'Caminho SVG inseguro/não padronizado: '+src);
 const full=path.join(root,src);
 check(fs.existsSync(full),'SVG ausente: '+src);
 if(fs.existsSync(full)){
   const body=read(src);
   check(/<svg[\s>]/i.test(body)&&body.length>100,'SVG vazio/inválido: '+src);
 }
 check(new Set(m.card_ids).size===m.card_ids.length,'IDs de cartão duplicados: '+src);
 check([...expected].sort().join('|')===[...m.card_ids].sort().join('|'),
   'Associações do SVG divergentes: '+src);
}
for(const src of registryPublic.keys())check(srcMap.has(src),'SVG órfão: '+src);
for(const [mediaId,cards] of privateMap){
 const m=registryPrivate.get(mediaId);
 check(!!m,'Original privado não catalogado: '+mediaId);
 if(!m)continue;
 check(m.kind==='ORIGINAL_ENVIADO_PELO_USUARIO'&&
   m.status==='LINK_NO_DRIVE_NAO_EQUIVALE_A_IMAGEM_EXIBIDA'&&
   m.role==='LINK_PRIVADO_APOS_RESPOSTA',
   'Original privado rotulado como exibido: '+mediaId);
 check(!m.url&&!m.drive_id&&!m.src,
   'Contrato público não deve replicar arquivo/URL privado: '+mediaId);
 check([...cards].sort().join('|')===[...m.card_ids].sort().join('|'),
   'Vínculo privado divergente: '+mediaId);
}
for(const id of registryPrivate.keys())check(privateMap.has(id),'Original privado órfão: '+id);
for(const dir of fs.readdirSync(path.join(root,'assets')).filter(x=>/^card_visuals_v\d+$/.test(x))){
 for(const name of fs.readdirSync(path.join(root,'assets',dir)).filter(x=>/\.svg$/i.test(x))){
  const p='assets/'+dir+'/'+name;
  check(registryPublic.has(p),'Novo SVG não associado a cartão (registrar antes de publicar): '+p);
 }
}
const ver=json('assets/version.json'),html=read('index.html'),snap=read(ver.version==='V343'?'v343.html':'v342.html');
check(html===snap,'index.html diverge do snapshot de versão ativa');
check(['V342','V343'].includes(ver.version),'Versão/manifesto fora de V342/V343');
check(html.includes('assets/v342_media_integrity.js'),'Leitor não carrega auditoria de mídia V342');
check(html.includes('assets/v342_media_integrity.css'),'Leitor sem estilo de auditoria V342');
check(html.lastIndexOf('v342_media_integrity.js')>html.lastIndexOf('v341_petro26_original_media.js'),
 'V342 precisa ser carregado depois da V341');
const js=read('assets/v342_media_integrity.js');
check(js.includes('naturalWidth')&&js.includes('preview')&&js.includes('LINK_PRIVADO_APOS_RESPOSTA'),
 'Leitor não diferencia carregamento real de arquivo e link privado');
if(err.length){console.error('\nFALHOU: '+err.length+' inconformidades:\n- '+err.join('\n- '));process.exit(1)}
console.log('OK V342: '+registryPublic.size+' SVGs, '+[...srcMap.values()].reduce((s,a)=>s+a.size,0)+
 ' associações de imagem pública, '+registryPrivate.size+' originais privados, '+
 [...privateMap.values()].reduce((s,a)=>s+a.size,0)+' vínculos privados; nenhum SVG órfão.');
console.log('Nota: este teste valida estrutura e arquivo, não substitui teste visual real em navegador.');
