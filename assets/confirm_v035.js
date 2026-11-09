
/* V035 — segurança de exclusões: nenhuma alteração destrutiva sem confirmação.
 * Alvos: ocultar imagem/PDF, apagar seleção, tecla Delete e botão excluir.
 * "Restaurar" não é destrutivo; não requer pergunta. */
(function(){
'use strict';
function tagOf(button){
 const a=button.closest('article.card');
 return a?.querySelector(':scope > .tag')?.textContent?.trim()||'';
}
function isDestructive(button){
 if(!button||button.disabled)return false;
 if(['deleteSelected','hideOpened'].includes(button.id))return true;
 const t=button.textContent?.trim().toLowerCase()||'';
 if(t==='excluir'||t==='excluir da visualização'||t==='apagar seleção'||t==='remover')return true;
 return false;
}
function message(button){
 const code=tagOf(button);
 if(button.id==='deleteSelected')return 'Apagar os traços selecionados desta imagem? Você poderá desfazer no histórico do editor.';
 if(button.id==='hideOpened')return 'Ocultar esta imagem da lista de estudo? O arquivo original será preservado e você poderá restaurar a imagem depois.';
 if(code.startsWith('IJUI-PDF-')||code.startsWith('PETRO10-')||code.startsWith('MANUSCRITO-')||code.startsWith('CAP-')||code.startsWith('GUIA-'))return 'Excluir o PDF '+code+' da visualização neste navegador? O arquivo do Drive não será apagado e poderá ser restaurado.';
 if(code.startsWith('IMG-'))return 'Excluir a imagem '+code+' da visualização neste navegador? O original e os grifos serão preservados e poderão ser restaurados.';
 return 'Confirma esta exclusão? Nenhum arquivo original do Google Drive será apagado por esta ação.';
}
document.addEventListener('click',e=>{
 const button=e.target?.closest?.('button');
 if(!isDestructive(button))return;
 if(!confirm(message(button))){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation()}
},true);
document.addEventListener('keydown',e=>{
 const image=document.getElementById('imageDialog');
 if(e.key!=='Delete'||!image?.open)return;
 if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
 const selected=document.getElementById('selectedCount');
 if(!selected||!selected.textContent?.trim())return;
 if(!confirm('Apagar as marcações selecionadas? Esta ação poderá ser desfeita no editor.')){
  e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 }
},true);
})();
