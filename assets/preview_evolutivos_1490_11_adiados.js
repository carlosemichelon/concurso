/* Banco Mestre — candidato V184 para exibição privada dos versos evolutivos V157.
   Somente leitura. NÃO modifica `cards`, avaliações, SRS, grifos, imagens ou armazenamento local.
   Uso: incluir como script depois de v157_private_sync.js numa NOVA versão de portal;
   não substituir a V183 e não incluir o JSON privado no GitHub público.
*/
(function(){
  'use strict';
  if(window.BM184EvolutivoPrivado) return;

  const ADIADOS = new Set(["CARD-0138", "CARD-0194", "CARD-0248", "CARD-0286", "CARD-0350", "CARD-0424", "CARD-0445", "CARD-0502", "CARD-0509", "CARD-0510", "CARD-0693"]);
  const FILE_ID = '1Aq0MwLyANr1ppQAV8XNRPYe586yCXu4u';
  const EXPECTED_SHA = 'ae5aeadaca414bdb423b79cbd0657966aac8c393bcb35be0ca372569ab3f5f84';
  const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
  const $ = id => document.getElementById(id);
  let access = '', expires = 0, oauth = null, locked = false, source = null, byId = null;

  const make = (tag, value, css) => {
    const el = document.createElement(tag);
    if(value !== undefined && value !== null) el.textContent = String(value);
    if(css) el.style.cssText = css;
    return el;
  };
  function state(message, error) {
    const s = $('bm184-status');
    if(s) {
      s.textContent = message;
      s.style.color = error ? '#93342e' : '#285d55';
    }
  }
  function UI() {
    const host = $('cartoes')?.querySelector('.panel');
    if(!host || $('bm184-evolutivos')) return false;
    const area = make('section', null, 'margin:14px 0;padding:14px;background:#fff;border:1px solid #bfd0cd;border-radius:12px;color:#17363a');
    area.id = 'bm184-evolutivos';
    area.append(make('h3', 'Versos evolutivos — 1.490 ativos disponíveis (11 adiados)', 'margin:0 0 7px;font-size:17px'));
    area.append(make('p', 'Leitura autenticada do Google Drive. Os 11 cartões com ressalva crítica ficam reservados para depois. Os demais 1.490 ativos podem ser consultados; nenhum dado de revisão é alterado.', 'font-size:13px;margin:0 0 9px'));
    const connect = make('button','Conectar Drive e ler V157','padding:10px 13px;border:1px solid #7eada1;border-radius:8px;cursor:pointer;background:#eff8f5');
    connect.id = 'bm184-connect'; connect.type = 'button'; connect.disabled = true;
    const search = make('input');
    search.id = 'bm184-busca'; search.type='search'; search.placeholder='CARD-0693, solos, concreto...';
    search.setAttribute('aria-label','Buscar cartão no material evolutivo');
    search.style.cssText='padding:10px;border:1px solid #a4b8b9;border-radius:8px;min-width:210px;max-width:100%';
    search.disabled=true;
    const historic=make('label',' Mostrar inativos','font-size:13px;margin-left:5px');
    const check=make('input');check.id='bm184-inativos';check.type='checkbox';check.disabled=true;
    historic.prepend(check);
    const controls=make('div',null,'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0');
    controls.append(connect,search,historic);area.append(controls);
    const status=make('p','Preparando conexão privada, sem acesso aos dados do navegador.','font-size:12px');
    status.id='bm184-status';status.setAttribute('role','status');area.append(status);
    const results=make('div',null,'display:flex;gap:5px;flex-wrap:wrap;max-height:130px;overflow:auto;margin:10px 0');
    results.id='bm184-results';area.append(results);
    const view=make('section',null,'max-height:65vh;overflow:auto;border-top:1px solid #e2e8e8;padding:12px 0');
    view.id='bm184-view';view.append(make('p','Carregue o arquivo privado para visualizar os aprofundamentos.'));
    area.append(view);
    host.insertBefore(area,host.firstChild);
    connect.addEventListener('click',()=>{
      if(locked) return;
      if(access && Date.now() < expires){void loadOverlay();return;}
      if(!oauth){state('Autenticação ainda indisponível.',true);return;}
      state('Abrindo autorização Google para leitura somente...');oauth.requestAccessToken({prompt:'consent'});
    });
    search.addEventListener('input',refresh);
    check.addEventListener('change',refresh);
    return true;
  }
  async function sha256(buffer) {
    if(!crypto?.subtle?.digest) throw Error('SHA-256 indisponível nesta sessão.');
    const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256',buffer));
    return Array.from(bytes,v=>v.toString(16).padStart(2,'0')).join('');
  }
  function validate(data) {
    if(!data || data.format!=='BancoMestreEvolutivoV157' || data.privacy!=='PRIVADO_NAO_PUBLICAR_NO_GITHUB')
      throw Error('Formato privado inesperado.');
    if(!Array.isArray(data.cards)||data.cards.length!==1518)throw Error('Total de cartões divergente.');
    const seen=new Set();let active=0,inactive=0;
    for(const c of data.cards){
      if(!/^CARD-\d{4}$/.test(c.id) || seen.has(c.id))throw Error('Identificador ausente ou duplicado.');
      seen.add(c.id);
      if(typeof c.frente_original!=='string'||!c.frente_original.trim()||
         typeof c.resposta_minima_original!=='string'||!c.resposta_minima_original.trim()||
         !Array.isArray(c.camadas)||!c.camadas.every(z=>typeof z.texto==='string'&&z.texto.trim()))
         throw Error('Frente, resposta ou camada inválida em '+c.id);
      if(c.ativo){active++;if(c.camadas.length!==11)throw Error('Cartão ativo com camadas incompletas: '+c.id);}
      else inactive++;
    }
    if(ADIADOS.size!==11 || [...ADIADOS].some(id=>!seen.has(id)) || active!==1501 || inactive!==17 || seen.has('CARD-1499'))throw Error('Estados/IDs divergentes.');
    for(let n=1;n<=1519;n++) {
      if(n===1499)continue;
      if(!seen.has('CARD-'+String(n).padStart(4,'0')))throw Error('Falta um cartão do índice.');
    }
    // Conferência informativa contra a base já carregada; NÃO modifica a base.
    let overlap=0,mismatch=0;
    if(typeof cards!=='undefined'&&Array.isArray(cards)){
      const present=new Map(cards.filter(x=>/^CARD-\d{4}$/.test(x.id||'')).map(c=>[c.id,c]));
      for(const c of data.cards) {
        const live=present.get(c.id);if(!live)continue;overlap++;
        if(String(live.front)!==c.frente_original || String(live.back)!==c.resposta_minima_original)mismatch++;
      }
    }
    return {overlap,mismatch};
  }
  function showCard(id) {
    const c=byId?.get(id), target=$('bm184-view');
    if(!c||!target)return false;
    if(ADIADOS.has(id)){
      target.replaceChildren(make('h4',id+' — ADIADO','font-size:17px'),
       make('p','Este cartão foi separado para revisão posterior. O conteúdo evolutivo não é exibido nesta integração. O histórico e a ficha original permanecem intactos.','font-size:14px'));
      return false;
    }
    target.replaceChildren();
    target.append(make('h4',c.id+' · '+c.assunto,'font-size:17px;margin:4px 0'),
      make('p',(c.ativo?'ATIVO':'INATIVO')+' · '+c.disciplina+' · '+c.camadas.length+' camadas','font-size:12px;color:#667274'),
      make('h5','Frente literal'),make('p',c.frente_original),
      make('h5','Resposta mínima literal'),make('p',c.resposta_minima_original));
    const warning=make('p','Conteúdo técnico pendente de homologação normativa/documental: use as material de estudo, não como citação oficial da norma.',
      'border-left:3px solid #9e793b;background:#fffaf1;padding:10px;font-size:13px');
    target.append(warning);
    if(c.alertas?.length)for(const a of c.alertas){
      target.append(make('p',a.tipo+': '+a.parecer,'font-size:12px;color:#914121'));
    }
    c.camadas.forEach(z=>{
      const block=make('section',null,'border:1px solid #e0e6e7;border-radius:8px;padding:10px;margin:10px 0');
      block.append(make('h5',String(z.ord).padStart(2,'0')+' — '+z.titulo,'margin:0 0 6px;font-size:14px'));
      const pre=make('pre',z.texto,'font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;margin:0');
      block.append(pre);target.append(block);
    });
    return true;
  }
  function refresh() {
    if(!source)return;
    const q=$('bm184-busca')?.value.trim().toLocaleLowerCase('pt-BR')||'';
    const allowInactive=!!$('bm184-inativos')?.checked;
    const found=source.cards.filter(c=>!ADIADOS.has(c.id) && (allowInactive||c.ativo) &&
      (!q || (c.id+' '+c.disciplina+' '+c.assunto+' '+c.subassunto).toLocaleLowerCase('pt-BR').includes(q)));
    const place=$('bm184-results');if(!place)return;place.replaceChildren();
    for(const c of found.slice(0,70)) {
      const button=make('button',c.id,'padding:4px 7px;background:#f7f9f9;border:1px solid #d4dddd;border-radius:5px;cursor:pointer');
      button.type='button';button.addEventListener('click',()=>showCard(c.id));place.append(button);
    }
    if(found.length>70)place.append(make('small','Busque um assunto ou ID para reduzir a lista.'));
    if(found.length)showCard(found[0].id);
    else $('bm184-view').replaceChildren(make('p','Nenhum cartão elegível para essa busca. Os 11 cartões adiados permanecem fora da nova leitura.'));
  }
  async function loadOverlay() {
    if(locked)return;locked=true;
    const button=$('bm184-connect');if(button)button.disabled=true;
    try {
      if(!access || Date.now()>=expires)throw Error('Autorização Google expirada.');
      state('Lendo fonte privada e verificando SHA-256...');
      const response=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(FILE_ID)+'?alt=media',{
        headers:{Authorization:'Bearer '+access},cache:'no-store'});
      if(!response.ok)throw Error('Falha Google Drive HTTP '+response.status);
      const raw=await response.arrayBuffer();
      const hash=await sha256(raw);
      if(hash!==EXPECTED_SHA)throw Error('SHA-256 diferente do checkpoint; nada foi aplicado.');
      const incoming=JSON.parse(new TextDecoder('utf-8').decode(raw));
      const stats=validate(incoming);
      source=incoming;byId=new Map(incoming.cards.map(c=>[c.id,c]));
      $('bm184-busca').disabled=false;$('bm184-inativos').disabled=false;
      state('V157 lida em memória: 1.518 registros, 1.490 ativos disponíveis, 11 adiados; 11 camadas por ativo. '+stats.overlap+
        ' IDs comparados com a interface; '+stats.mismatch+' diferenças de frente/verso original detectadas. '+
        'Nenhum cartão nem SRS foi alterado.',stats.mismatch>0);
      refresh();
      if(button)button.textContent='Recarregar arquivo privado';
    }catch(e){state('Importação cancelada: '+e.message,true);}
    finally {locked=false;if(button)button.disabled=!oauth;}
  }
  function loadGIS() {
    if(window.google?.accounts?.oauth2)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const tag=document.createElement('script');
      tag.src='https://accounts.google.com/gsi/client';tag.async=true;
      tag.onload=resolve;tag.onerror=()=>reject(Error('Google Identity Services indisponível'));
      document.head.appendChild(tag);
    });
  }
  async function init(){
    if(!UI())return;
    try {
      const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
      if(!response.ok)throw Error('Configuração OAuth ausente.');
      const cfg=await response.json();
      if(!String(cfg.client_id||'').endsWith('.apps.googleusercontent.com'))throw Error('OAuth inválido.');
      await loadGIS();
      oauth=google.accounts.oauth2.initTokenClient({
        client_id:cfg.client_id,scope:SCOPE,
        callback:result=>{
          if(result.error||!result.access_token){state('Autorização Google não concedida.',true);return;}
          access=result.access_token;
          expires=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
          void loadOverlay();
        },
        error_callback:()=>state('Não foi possível concluir autenticação Google.',true)
      });
      $('bm184-connect').disabled=false;
      state('Conexão pronta. Clique para ler o arquivo privado V157. Nenhum token será persistido.');
    }catch(e){state('Leitor privado indisponível: '+e.message,true);}
  }
  window.BM184EvolutivoPrivado=Object.freeze({
    get carregado(){return !!source},
    abrir(id){return ADIADOS.has(id)?false:showCard(id)},
    get contagem(){return source?.cards?.length||0},
    get adiados(){return Array.from(ADIADOS)},
    get elegiveis(){return source?1490:0}
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else void init();
})();