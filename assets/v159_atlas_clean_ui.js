/* Banco Mestre V159 — remove a barra de filtros duplicada do Atlas.
   Preserva os controles exclusivos dentro de opções recolhíveis e mantém
   os elementos legados necessários aos listeners do renderizador V156.
   Não altera catálogos, favoritos, exclusões, IDs ou SRS. */
(function(){
 'use strict';
 function install(){
  const root=document.getElementById('imagens');
  const old=root?.querySelector('.bm-v044-atlas-controls');
  const advanced=root?.querySelector('#bm155ImageFilters');
  if(!root||!old||!advanced||root.classList.contains('bm159-atlas-clean'))return;
  const ids=['imageFavoriteV055','imageSortV044','imageVisibilityV045'];
  if(!ids.every(id=>document.getElementById(id)))return;

  const details=document.createElement('details');
  details.id='bm159AtlasOptions';
  const summary=document.createElement('summary');
  summary.textContent='Mais opções: favoritas, ordenação e imagens ocultas';
  details.appendChild(summary);
  const fields=document.createElement('div');
  fields.className='bm159AtlasFields';
  details.appendChild(fields);

  function moveSelect(id,caption){
   const select=document.getElementById(id);
   const field=document.createElement('label');
   field.className='bm159AtlasField';
   const title=document.createElement('span');
   title.textContent=caption;
   field.append(title,select);
   fields.append(field);
  }
  moveSelect('imageFavoriteV055','Favoritos');
  moveSelect('imageSortV044','Ordenar imagens');
  moveSelect('imageVisibilityV045','Visibilidade local');

  const manage=document.createElement('div');
  manage.className='bm159AtlasManagement';
  const exportButton=document.getElementById('exportExcludedV046');
  const status=document.getElementById('exportExcludedStatusV046');
  if(exportButton)manage.appendChild(exportButton);
  if(status)manage.appendChild(status);
  const note=document.createElement('small');
  note.textContent='Imagens excluídas neste menu são ocultações locais. As 184 removidas do catálogo ativo não são restauradas.';
  manage.appendChild(note);
  details.appendChild(manage);
  advanced.after(details);

  const style=document.createElement('style');
  style.id='bm159AtlasStyle';
  style.textContent=[
   '#imagens.bm159-atlas-clean .bm-v044-atlas-controls{display:none!important}',
   '#imagens #bm159AtlasOptions{border:1px solid #dbe7e5;border-radius:10px;margin:10px 0 14px;background:#fff}',
   '#imagens #bm159AtlasOptions>summary{cursor:pointer;padding:11px 14px;color:#2b5258;font-size:13px;font-weight:650}',
   '#imagens #bm159AtlasOptions>summary:focus-visible{outline:2px solid #31848a;outline-offset:3px}',
   '#imagens .bm159AtlasFields{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:12px;padding:0 14px 12px}',
   '#imagens .bm159AtlasField{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:650;min-width:0}',
   '#imagens .bm159AtlasField select{width:100%;min-width:0;min-height:39px;border-radius:8px;border:1px solid #bfd2ce;padding:8px;background:#fff;color:#17353b;font:500 13px system-ui,Arial,sans-serif}',
   '#imagens .bm159AtlasManagement{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:9px 14px 13px;border-top:1px solid #e2ece9}',
   '#imagens .bm159AtlasManagement small{flex-basis:100%;color:#61777c;font-size:11px}',
   '#imagens #exportExcludedStatusV046{font-size:12px}',
   '@media(max-width:720px){#imagens .bm159AtlasFields{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(style);
  root.classList.add('bm159-atlas-clean');
  window.BancoMestreAtlasUIV159={ready:true,mode:'busca-unificada',preserved:ids};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
})();