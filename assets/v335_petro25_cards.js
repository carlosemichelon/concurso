/* Banco Mestre V335 — incremento público Petrobras 25.
 * 3 novos cartões (1539-1541), 11 evoluções relacionadas, 11 módulos em cada novo cartão.
 * Manuscritos e imagens originais permanecem no Drive privado, não são publicados aqui.
 * Nenhum histórico, original ou evento SRS é modificado por este script.
 */
(function(){
  'use strict';
  const priorLayers=window.BM276LayerData;
  const priorFormat=window.BM198Format;
  const ids=new Set(['CARD-1539','CARD-1540','CARD-1541']);
  const related=new Set(['CARD-0230','CARD-0404','CARD-0521','CARD-0857','CARD-0858','CARD-0479','CARD-1212','CARD-1385','CARD-1432','CARD-1434','CARD-1435']);
  const file='assets/petro25_conversation_delta_v335.json?v=335-1';
  let loadOnce=null;
  function load(){
    if(!loadOnce) loadOnce=fetch(file,{cache:'no-store'}).then(function(r){
      if(!r.ok)throw Error('V335: delta didático indisponível '+r.status);
      return r.json();
    }).then(function(d){
      const all=new Set(d.new_cards?.map(c=>c.id));
      if(d.format!=='BancoMestrePetro25ConversationDeltaV335'||d.new_cards?.length!==3||
        d.related_updates?.length!==11||d.new_layers?.length!==3||
        all.size!==3||[...ids].some(x=>!all.has(x))||
        d.new_layers.some(x=>!ids.has(x.id)||x.layers.length!==11||
          x.layers.some((l,i)=>l.ord!==i+1||!l.texto||!l.titulo)))
        throw Error('V335: incremento de cartões inválido');
      return d;
    });
    return loadOnce;
  }
  if(priorLayers?.get){
    window.BM276LayerData=Object.freeze({
      has:function(id){return ids.has(id)||priorLayers.has?.(id)||false;},
      get:async function(id){
        if(!ids.has(id)&&!related.has(id))return priorLayers.get(id);
        const d=await load();
        if(ids.has(id)){
          const item=d.new_layers.find(x=>x.id===id);
          return {id,layers:item.layers.map(x=>({...x}))};
        }
        const orig=await priorLayers.get(id);
        if(!orig?.layers||orig.layers.length!==11)return orig;
        const update=d.related_updates.find(x=>x.id===id);
        if(!update)return orig;
        return {...orig,layers:orig.layers.map(l=>{
          const addition=update.layers_add?.[String(l.ord)];
          return addition?{...l,texto:l.texto+'\n\n'+addition}:l;
        })};
      }
    });
  }
  if(priorFormat?.render){
    function el(tag,cls,txt){
      const n=document.createElement(tag);if(cls)n.className=cls;
      if(txt!==undefined)n.textContent=txt;
      return n;
    }
    const render=function(host,record,id){
      if(!ids.has(id))return priorFormat.render(host,record,id);
      if(record?.layers?.length!==11)throw Error('V335: 11 módulos obrigatórios '+id);
      const baseInfo=(window.BM335Petro25?.data?.new_cards||[]).find(c=>c.id===id);
      if(!baseInfo)return priorFormat.render(host,record,id);
      const main=el('article','bm330-learning');
      main.append(el('div','bm330-caption','RESPOSTA-MODELO · '+id));
      main.append(el('h3','',baseInfo.sub));
      const essay=el('div','bm330-essay');
      const p=el('p','bm330-para',baseInfo.back);
      essay.append(p);
      const expl=String(baseInfo.expl||'');
      const segs=expl.split(/\n\s*\n/).filter(Boolean);
      for(const segment of segs)essay.append(el('p','bm330-para',segment));
      main.append(essay);
      const mn=el('section','bm330-information');
      mn.append(el('h4','','Macete e distinção principal'));
      mn.append(el('p','',baseInfo.mnemonic));
      main.append(mn);
      const hist=el('div','bm330-legacy');
      priorFormat.render(hist,record,id);
      const full=el('details','bm330-evolution bm332-evolution');
      const summary=el('summary','bm332-evolution-summary');
      summary.append(el('span','','Resposta evolutiva integral'),el('small','','Frente, verso e 11 módulos preservados'));
      full.append(summary);
      const inside=el('div','bm332-evolution-inside');
      const modules=el('details','bm332-inner-accordion bm332-complete-modules');
      modules.append(el('summary','','11 módulos didáticos completos · histórico e fontes'),hist);
      inside.append(modules);full.append(inside);
      const pane=host.closest('.bm197-evolutive');
      const modal=host.closest('#bmCardPeekV050');
      if(pane&&modal&&window.BancoMestreVisualizarCardV050?.currentId===id){
        pane.before(main);host.replaceChildren(full);
        pane.classList.add('bm330-evolution-pane','bm332-evolution-pane');
      }else host.replaceChildren(main,full);
      return {modules:11,folded:true,presentation:'V335, padrão V333',srsChanged:false};
    };
    window.BM198Format=Object.freeze({...priorFormat,render,version:'V335-PETRO25'});
  }
  const obj={ids:Object.freeze([...ids]),related_ids:Object.freeze([...related]),load,
    srs_changed:false,private_media_exposed:false,data:null};
  window.BM335Petro25=obj;
  load().then(d=>{obj.data=d;}).catch(e=>console.warn('V335: delta não carregado',e));
})();