/* Banco Mestre V187 — integração opt-in dos versos V157 na janela do cartão V165.
 * Adiciona apenas uma seção recolhível após revelação da resposta.
 * Conteúdo provém do leitor privado autenticado V159; nada vai ao GitHub.
 * NÃO altera cartões, SRS, avaliações, grifos, PDF, localStorage ou IndexedDB.
 */
(function(){
  'use strict';
  if(window.BM187EvolutivoModal) return;
  const RESERVED = new Set(['CARD-0138','CARD-0194','CARD-0248','CARD-0286','CARD-0350',
    'CARD-0424','CARD-0445','CARD-0502','CARD-0509','CARD-0510','CARD-0693']);
  let overlay,answer,title,observer,statusObserver,scheduled=false;
  const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const current=()=>window.BancoMestreVisualizarCardV050?.currentId||
    title?.textContent?.match(/CARD-\d{4,}/)?.[0]||'';
  const loaded=()=>!!window.BM184EvolutivoPrivado?.carregado;
  const active=id=>{
    try{
      const arr=typeof cards!=='undefined'&&Array.isArray(cards)?cards:[];
      const c=arr.find(z=>z.id===id);
      return !c || c.active!==false;
    }catch(_){return true;}
  };
  function status(text,error){
    const p=answer?.querySelector('.bm187-note');
    if(p){p.textContent=text;p.style.color=error?'#9a3830':'#375c5d';}
  }
  function render(id){
    const fold=answer?.querySelector('details.bm187-evolutivo');
    if(!fold||!fold.open||current()!==id||overlay.hidden||answer.hidden)return;
    const body=fold.querySelector('.bm187-body');
    if(!body)return;
    body.replaceChildren();
    if(!loaded()){
      status('Conecte o Google Drive para ler o verso evolutivo integral. O verso original acima continua preservado.');
      const btn=make('button','Conectar Drive e carregar as 11 camadas');
      btn.type='button';btn.className='bm187-connect';
      btn.style.cssText='margin:6px 0 10px;padding:9px 12px;border:1px solid #729e96;border-radius:7px;background:#f1f8f6;cursor:pointer';
      btn.addEventListener('click',()=>{
        const trigger=document.getElementById('bm184-connect');
        if(!trigger||trigger.disabled){status('O leitor privado ainda não está pronto para autenticar.',true);return;}
        status('Abrindo autorização de leitura do Google Drive...');
        trigger.click(); // A ação acontece no clique explícito do estudante.
      });
      body.append(btn);
      return;
    }
    const reader=window.BM184EvolutivoPrivado;
    if(reader.abrir(id)!==true){status('Aprofundamento não liberado para este cartão.',true);return;}
    const source=document.getElementById('bm184-view');
    const sections=source?Array.from(source.children).filter(n=>n.tagName==='SECTION'):[];
    if(sections.length!==11){status('O arquivo não apresentou as 11 camadas; exibição interrompida.',true);return;}
    const original=typeof cards!=='undefined'&&Array.isArray(cards)?cards.find(x=>x.id===id):null;
    const fromOriginal=source.children[3]?.textContent||'';
    const fromBack=source.children[5]?.textContent||'';
    if(original&&(original.front!==fromOriginal||original.back!==fromBack)){
      const warn=make('p','Aviso: frente ou resposta mínima do site difere da base V055; os dois registros não foram substituídos.');
      warn.style.cssText='color:#8c4b1e;padding:8px;border-left:3px solid #c08e42';
      body.append(warn);
    }
    const warning=make('p','Aprofundamento para estudo: dispositivos normativos ainda sujeitos à homologação. A resposta original acima permanece a referência histórica.');
    warning.style.cssText='font-size:13px;color:#7d4f24;border-left:3px solid #bb8f45;padding:8px';
    body.append(warning);
    for(const section of sections){
      const copy=section.cloneNode(true);
      copy.style.cssText+=';margin:10px 0;padding:12px;border:1px solid #d8e2df;border-radius:8px;background:#fff';
      body.append(copy);
    }
    status('11 camadas carregadas do Drive privado, sem registrar revisão.');
  }
  function sync(){
    if(!overlay||!answer||overlay.hidden||answer.hidden)return;
    const id=current();
    if(!/^CARD-\d{4}$/.test(id)||RESERVED.has(id)||!active(id))return;
    if(answer.querySelector('details.bm187-evolutivo'))return;
    const fold=make('details');fold.className='bm187-evolutivo';
    fold.style.cssText='margin:16px 0;border:1px solid #b2cec8;border-radius:9px;padding:10px;background:#f6faf9';
    const heading=make('summary','Aprofundamento integral (11 camadas) · Drive privado');
    heading.style.cssText='font-weight:700;cursor:pointer;color:#265c57';
    const body=make('div');body.className='bm187-body';
    const info=make('p','Abra esta seção depois de responder ao cartão. A leitura não altera sua classificação.');
    info.className='bm187-note';info.style.cssText='font-size:12px;color:#375c5d';
    fold.append(heading,info,body);
    fold.addEventListener('toggle',()=>{if(fold.open)render(id);});
    answer.append(fold);
  }
  const queue=()=>{
    if(scheduled)return;scheduled=true;
    Promise.resolve().then(()=>{scheduled=false;sync();});
  };
  function setup(){
    overlay=document.getElementById('bmCardPeekV050');
    answer=overlay?.querySelector('.bm-v050-peek-answer');
    title=document.getElementById('bmCardPeekTitleV050');
    if(!overlay||!answer||!title)return false;
    observer=new MutationObserver(queue);
    observer.observe(answer,{attributes:true,attributeFilter:['hidden'],childList:true,subtree:false});
    observer.observe(title,{characterData:true,childList:true,subtree:true});
    const privateStatus=document.getElementById('bm184-status');
    if(privateStatus){
      statusObserver=new MutationObserver(()=>{
        if(loaded()&&answer?.querySelector('details.bm187-evolutivo[open]'))render(current());
        else if(answer?.querySelector('details.bm187-evolutivo[open]')){
          const s=privateStatus.textContent||'';
          if(/cancelada|falha|indisponível|não concedida|erro/i.test(s))status('Não foi possível carregar: '+s,true);
        }
      });
      statusObserver.observe(privateStatus,{childList:true,characterData:true,subtree:true});
    }
    queue();return true;
  }
  function init(){
    if(setup())return;
    // A janela V165 pode ser criada durante a montagem dinâmica do HTML V185.
    const wait=new MutationObserver(()=>{if(setup())wait.disconnect();});
    wait.observe(document.body,{childList:true,subtree:true});
  }
  window.BM187EvolutivoModal=Object.freeze({
    get integrado(){return !!observer;},
    get adiados(){return [...RESERVED];},
    get autenticado(){return loaded();},
    atualizar:queue
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();