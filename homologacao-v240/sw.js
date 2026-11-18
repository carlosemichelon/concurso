/* V240: Service Worker exclusively for isolated test clients in /homologacao-v240/. */
'use strict';
const CACHE='bm-v240-isolated-test-2';
const root=new URL('../',self.location.href);
const PATHS=["homologacao-v240/compat-v242.html","homologacao-v240/index.html","v240.html","v062.html","controle-estudos-v240.html","assets/v240_controle_native.js","assets/v240_controle_app.js","assets/v240_reconcile.js","assets/v240_controle_drive_sync.js","assets/v240_backup_drive.js","assets/v240_global_drive.js","assets/v240_header_timer.js","assets/v240_dock_compat.js","assets/v240_dock_compat.css","assets/v240_offline.js","assets/v240_estudo_hierarquia.json","assets/v062_biblioteca_grifos.css","assets/v064_painel_grifos.css","assets/v065_cartao_rapido_header.css","assets/v066_backup_drive_grifos.css","assets/v067_diagnostico_local.css","assets/v068_grifador.css","assets/v070_cores_metodologia.css","assets/v094_precise_selector.css","assets/v096_icons.css","assets/v097_grifos_painel.css","assets/v098_tec_visual.css","assets/v098_pdf_image_icons_fix.css","assets/v099_legenda_grifos.css","assets/v100_pdf_tools.css","assets/v102_pdf_ui.css","assets/v103_mobile.css","assets/v103_sync.css","assets/v104_mobile.css","assets/v105_pdf_horizontal.css","assets/v106_compact_readability.css","assets/v107_mobile_study_icons.css","assets/v108_grifos_editor.css","assets/v109_mobile_library.css","assets/v110_calibrador.css","assets/v113_compact_bibliotecas.css","assets/v115_compact_sections.css","assets/v114_pdf_controls_position.css","assets/v118_ui_compact.css","assets/v119_public_cards_ui.css","assets/v120_grifos_paragrafos.css","assets/v122_visual_compact.css","assets/v124_assuntos_cartoes.css","assets/v130_redacao.css","assets/v145_ui.css","assets/v165_cards.css","assets/v198_evolutive_format.css","assets/v194_public_layers.css","assets/v195_discursive.css","assets/v195_evolutive_cards.css","assets/v141_calendario_srs.css","assets/v188_general_cards_grid.css","assets/v191_all_cards_grid.css","assets/v168_mobile_related.css","assets/v169_topic_media_fast.css","assets/v170_topic_speed.css","assets/v171_topic_media_on_demand.css","assets/v199_ui_audit.css","assets/v206_image_modals.css","assets/v205_drive_atlas.css","assets/v210_compact_sections.css","assets/v211_trt01_card.css","assets/v212_trt01_c002.css","assets/v215_trt01_c003.css","assets/trt01_c004.css","assets/trt01_c005.css","assets/trt01_c006.css","assets/trt01_c007.css","assets/trt01_c008.css","assets/trt01_c009.css","assets/v238_header_layout.css","assets/v239_global_drive.css","assets/v156_boot_topic.js","assets/v111_grifador.js","assets/v109_classificador_lei_seca.js","assets/v112_perfis_lei_seca.js","assets/v114_ia_lei_seca.js","assets/v114_cf_artigo1.js","assets/v121_relacoes_normativas.js","assets/v124_remissoes.js","assets/v181_vade_current.js","assets/v182_media_core.js","assets/v215_drive_direct.js","assets/v165_card_reader.js","assets/v198_evolutive_format.js","assets/v060_card_window.js","assets/v217_drive_pdf_sync.js","assets/v218_image_metadata.js","assets/v228_drive_gallery_feed.js","assets/v180_image_bridge.js","assets/v097_pdf_selection_core.js","assets/v104_precise_touch.js","assets/v096_icons.js","assets/v192_portal_text.js","assets/v106_assuntos_compactos.js","assets/v099_legenda_grifos.js","assets/v100_pdf_tools.js","assets/v106_ink_ui.js","assets/v103_mobile_pdf.js","assets/v104_mobile_gestures.js","assets/v105_pdf_horizontal.js","assets/v122_grifos_master_core.js","assets/v239_grifos_drive.js","assets/v109_mobile_library.js","assets/v121_calibrador_ui.js","assets/v113_compact_bibliotecas.js","assets/v118_ui_compact.js","assets/v201_public_cards_ui.js","assets/v122_flashcard_ink.js","assets/v122_visual_compact.js","assets/v123_cards_recovery.js","assets/v128_assuntos_gerais.js","assets/v130_redacao.js","assets/v146_redacao_redirect.js","assets/v237_legal_taxonomy.js","assets/v236_flash_filters.js","assets/v192_pdf_check.js","assets/v209_image_single_library.js","assets/v159_atlas_clean_ui.js","assets/v165_cards_navigation.js","assets/v194_public_layers.js","assets/v195_evolutive_cards.js","assets/v163_lei_seca_literal.js","assets/v163_card_polish.js","assets/v168_mobile_related.js","assets/v206_site_info.js","assets/v202_checkpoints_paths.js","assets/v191_all_cards_grid.js","assets/v196_srs_planejamento.js","assets/v206_discursive.js","assets/v196_abas_recolhidas.js","assets/v209_image_links_single.js","assets/v228_drive_image_editor.js","assets/v239_library_counter.js","assets/v218_single_image_viewer.js","assets/v210_compact_sections.js","assets/v211_trt01_card.js","assets/v212_trt01_c002.js","assets/v215_trt01_c003.js","assets/v217_media_policy.js","assets/trt01_c004_loader.js","assets/trt01_c005_loader.js","assets/trt01_c006_loader.js","assets/v236_trt_cards_grid.js","assets/v222_images_live.js","assets/v222_pdf_editor_route.js","assets/v232_site_version.js","assets/v232_grid_persist.js","assets/trt01_c007_loader.js","assets/trt01_c008_loader.js","assets/trt01_c009_loader.js","assets/trt02_c001_loader.js","assets/trt02_c002_loader_v237.js","assets/trt02_c004_loader.js","assets/trt02_c005_loader.js","assets/trt02_c006_loader.js","assets/v225_drive_reconnect.js","assets/v240_controle_native.js","assets/v240_controle_drive_sync.js","assets/v240_backup_drive.js","assets/v240_global_drive.js","assets/v240_offline.js","assets/editor_imagens_v030.css","assets/v037.css","assets/v031.css","assets/v032.css","assets/f17_rede_v033.css","assets/v034.css","assets/v035.css","assets/v036.css","assets/v040_contornos.css","assets/v041_vade.css","assets/v043_pdf_compact.css","assets/v044_ui.css","assets/v046_layout.css","assets/v047_pdf.css","assets/v048_ui.css","assets/v050_readability.css","assets/v051_tema_tec.css","assets/v052_refinamentos.css","assets/v054_topico_compacto.css","assets/v055_ui_compact.css","assets/v056_pdf_fullscreen.css","assets/v057_pdf_dock.css","assets/v058_pdf_reto.css","assets/v059_pdf_extrair.css","assets/v060_barras_edicao.css","assets/v061_selecao_texto.css","assets/visibilidade-v026.js","assets/editor_imagens_v053.js","assets/v054_assuntos_navegacao.js","assets/pdf_v061.js","assets/v034_boot.js","assets/f17_rede_v034.js","assets/v034_originais.js","assets/confirm_v035.js","assets/v055_pdfs_recolhidos.js","assets/v037_assuntos.js","assets/v038_discursivas.js","assets/v048_drive.js","assets/v041_vade.js","assets/v048_drive_save.js","assets/v043_pdf_compact.js","assets/v044_vade_drive.js","assets/v044_ui.js","assets/v060_atlas_edicao_completa.js","assets/v046_layout.js","assets/v048_card_preview.js","assets/v055_card_reader.js","assets/v056_pdf_controls.js","assets/v058_pdf_dock.js","assets/v061_pdf_extrair.js","assets/v060_pdf_lateral.js","assets/v060_imagem_sidebar.js","assets/v061_selecao_texto.js","assets/meta_public_v194.json","assets/cards_public_v194_000.json","assets/cards_public_v194_001.json","assets/cards_public_v194_002.json","assets/cards_public_v194_003.json","assets/cards_public_v194_004.json","assets/cards_public_v194_005.json","assets/cards_public_v194_006.json"];
async function preCache(){
 const cache=await caches.open(CACHE);
 for(let i=0;i<PATHS.length;i+=12){
  await Promise.all(PATHS.slice(i,i+12).map(async p=>{
   try{
    const u=new URL(p,root),response=await fetch(new Request(u.href,{cache:'reload',credentials:'same-origin'}));
    if(response.ok&&response.type==='basic'&&Number(response.headers.get('content-length')||0)<7000000)
     await cache.put(u.origin+u.pathname,response);
   }catch(_){/* no confirmation of missing files */}
  }));
 }
}
self.addEventListener('install',e=>e.waitUntil(preCache().then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(x=>x.startsWith('bm-v240-isolated-test-')&&x!==CACHE).map(x=>caches.delete(x)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 const request=e.request;
 if(request.method!=='GET'||request.headers.has('Authorization'))return;
 const u=new URL(request.url);
 if(u.origin!==root.origin||!u.pathname.startsWith(root.pathname))return;
 if(/\.(pdf|zip|xlsx|docx|mp4|webm)$/i.test(u.pathname)||/\/drive_auth_v038\.json$/i.test(u.pathname))return;
 if(!/\.(html|js|css|json|svg|png|webp|jpg|jpeg)$/i.test(u.pathname)&&request.mode!=='navigate')return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=u.origin+u.pathname;
  try{
   const response=await fetch(request);
   if(response.ok&&response.type==='basic'&&Number(response.headers.get('content-length')||0)<7000000)
    await cache.put(key,response.clone());
   return response;
  }catch(err){
   const saved=await cache.match(key);
   if(saved)return saved;
   if(request.mode==='navigate'){
    const fallback=await cache.match(new URL('homologacao-v240/compat-v242.html',root).href);
    if(fallback)return fallback;
   }
   throw err;
  }
 })());
});