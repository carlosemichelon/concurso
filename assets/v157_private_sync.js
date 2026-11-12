/* Banco Mestre V157 — leitura privada por OAuth de Drive.
   Não publica cartões, imagens ou SRS em GitHub.
   Não grava tokens, não sobrescreve histórico/localStorage.
   Fonte V045: só leitura após clique expresso do proprietário.
*/
(function(){
  'use strict';
  if(window.BM157PrivateSync)return;
  const FILE_ID='1Xl_SpP1N1VgaeMAfovlgtOvMQwB6xQR4';
  const EXPECTED_SHA='5c8c34344faad0d693f11d3f29d82266edf2a62275ca17723cc770d959fcb287';
  const SCOPE='https://www.googleapis.com/auth/drive.readonly';
  let oauth=null, access='', expiry=0, busy=false;
  const $=id=>document.getElementById(id);
  function status(text,failed){
    const n=$('bm157Status');
    if(n){n.textContent=text;n.style.color=failed?'#9b392d':'#286057';}
  }
  async function sha256(buffer){
    if(!crypto?.subtle)return null;
    const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',buffer));
    return Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
  }
  function panel(){
    const parent=$('cartoes')?.querySelector('.panel');
    if(!parent||$('bm157Box'))return false;
    const host=document.createElement('section');
    host.id='bm157Box';
    host.style.cssText='margin:14px 0;padding:14px;border:1px solid #afd1c7;border-radius:12px;background:#f1f9f6';
    const heading=document.createElement('h3');
    heading.textContent='Banco Mestre privado — sincronizar V045 do Google Drive';
    heading.style.margin='0 0 6px';
    const description=document.createElement('p');
    description.textContent='O catálogo público permanece disponível. Após autorizar o Drive, carregue 1.518 cartões, 19 questões, 11 vínculos de imagem e o SRS de referência, sem substituir revisões armazenadas neste navegador.';
    description.style.cssText='margin:0 0 9px;font-size:13px';
    const button=document.createElement('button');
    button.id='bm157Connect';button.type='button';button.disabled=true;
    button.textContent='Conectar Drive e carregar V045';
    button.style.cssText='padding:10px 14px';
    button.addEventListener('click',()=>{
      if(busy)return;
      if(!oauth){status('Autorização Google ainda não pronta.',true);return;}
      if(access&&Date.now()<expiry){void syncFeed();return;}
      status('Abrindo autorização de leitura do Google Drive...');
      oauth.requestAccessToken({prompt:'consent'});
    });
    const message=document.createElement('p');
    message.id='bm157Status';message.setAttribute('role','status');
    message.style.cssText='font-size:12px;margin:9px 0 0';
    message.textContent='Preparando conexão segura com Google Drive…';
    const link=document.createElement('a');
    link.href='https://drive.google.com/drive/folders/1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD';
    link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Abrir pasta privada de sincronização';
    link.style.cssText='display:inline-block;margin-top:8px;font-size:12px';
    host.append(heading,description,button,message,link);
    parent.insertBefore(host,parent.querySelector('.controls')||parent.firstChild);
    return true;
  }
  function refreshFilters(data){
    const sel=$('cardFilter');
    if(sel){
      const existing=new Set(Array.from(sel.options).map(x=>x.value));
      for(const v of [...new Set(data.cards.map(c=>c.discipline))].sort((a,b)=>a.localeCompare(b,'pt-BR'))){
        if(!existing.has(v)){sel.add(new Option(v,v));existing.add(v);}
      }
      sel.value='all';
    }
    const topics=$('cardTopicFilter');
    if(topics){
      const old=new Set(Array.from(topics.options).map(x=>x.value));
      for(const v of [...new Set(data.cards.map(c=>c.subject))].sort((a,b)=>a.localeCompare(b,'pt-BR'))){
        if(!old.has(v)){topics.add(new Option(v,v));old.add(v);}
      }
      topics.value='all';
    }
  }
  function validate(data){
    if(!data||data.format!=='BancoMestrePrivadoV045'||data.version!=='V045')
      throw Error('Formato privado inesperado. Nenhuma alteração realizada.');
    if(!Array.isArray(data.cards)||data.cards.length!==1518||
       !Array.isArray(data.questions)||data.questions.length!==19||
       !Array.isArray(data.images)||data.images.length!==11||
       !Array.isArray(data.srs)||data.srs.length!==1518)
      throw Error('Contagens da V045 não coincidem com o checkpoint auditado.');
    const ids=new Set(data.cards.map(c=>c.id));
    if(ids.size!==1518||ids.has('CARD-1499')||
       data.cards.some(c=>!/^CARD-\d{4}$/.test(c.id)||!c.front||!c.back)||
       data.srs.some(x=>!ids.has(x.id)))
      throw Error('IDs ou relações SRS inconsistentes; a base atual foi preservada.');
    const imageIds=new Set(data.images.map(im=>im.id));
    if(imageIds.size!==11)throw Error('IDs de imagens duplicados.');
  }
  async function syncFeed(){
    if(busy)return;
    busy=true;
    const button=$('bm157Connect');
    if(button)button.disabled=true;
    try{
      if(!access||Date.now()>=expiry)throw Error('Autorização expirada. Conecte o Drive novamente.');
      status('Lendo arquivo privado V045 e conferindo integridade…');
      const url='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(FILE_ID)+'?alt=media';
      const response=await fetch(url,{headers:{Authorization:'Bearer '+access},cache:'no-store'});
      if(response.status===401)throw Error('Autorização expirada.');
      if(response.status===403)throw Error('A conta autorizada não tem acesso à fonte privada.');
      if(!response.ok)throw Error('Google Drive HTTP '+response.status);
      const bytes=await response.arrayBuffer();
      const got=await sha256(bytes);
      if(got&&got!==EXPECTED_SHA)throw Error('SHA-256 da fonte diverge do checkpoint; importação cancelada.');
      const data=JSON.parse(new TextDecoder('utf-8').decode(bytes));
      validate(data);
      await loadCards(); // Preserva o leitor existente caso a conexão privada falhe.
      const operational=cards.filter(c=>c.provisional);
      const duplicate=new Set(operational.map(c=>c.id));
      if(data.cards.some(c=>duplicate.has(c.id)))throw Error('Conflito com cartões operacionais de Ijuí.');
      cards=[...operational,...data.cards];
      loadedCards=true;
      if(typeof focusGroup!=='undefined')focusGroup='';
      if(typeof cardLimit!=='undefined')cardLimit=24;
      refreshFilters(data);
      const publicLabel=$('bm119PublicSource');
      if(publicLabel)publicLabel.textContent='Fonte privada V045 autenticada · 1.518 cartões (1.501 ativos) + '+operational.length+' operacionais Ijuí · consulta local sem publicação';
      const homeLabel=$('bm119HomeSource');
      if(homeLabel)homeLabel.textContent='Banco Mestre V045 privado carregado do Drive · '+data.cards.length+' cartões';
      const counter=document.querySelector('.stats .stat:nth-child(2) b');
      if(counter)counter.textContent='1.501 ativos / 1.518 IDs + '+operational.length+' Ijuí';
      if(typeof cardRender==='function')cardRender();
      // Guardar somente o estado em memória, nunca token nem respostas no armazenamento.
      window.BM157PrivateSnapshot=Object.freeze({
        version:data.version,questions:data.questions,srs:data.srs,
        image_links:data.images,count:data.cards.length,source_hash:data.source_sha256
      });
      status('V045 carregada: 1.518 cartões, 19 questões, 11 imagens vinculadas e 1.518 registros SRS de referência. Revisões locais intactas. Consulte a aba Imagens para o acervo autorizado.');
      if(button)button.textContent='Atualizar V045 do Drive';
    }catch(e){
      console.warn('BM157: fonte privada não carregada:',e);
      status('Não foi possível sincronizar: '+e.message+' O catálogo e as revisões anteriores foram preservados.',true);
    }finally{busy=false;if(button)button.disabled=!oauth;}
  }
  function loadGIS(){
    if(window.google?.accounts?.oauth2)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const tag=document.createElement('script');
      tag.src='https://accounts.google.com/gsi/client';
      tag.async=true;tag.onload=resolve;tag.onerror=()=>reject(Error('Serviço de login Google indisponível.'));
      document.head.appendChild(tag);
    });
  }
  async function init(){
    if(!panel())return;
    try{
      const r=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
      if(!r.ok)throw Error('Configuração de acesso ao Google ausente.');
      const cfg=await r.json();
      if(!String(cfg.client_id||'').endsWith('.apps.googleusercontent.com'))
        throw Error('OAuth Google não configurado.');
      await loadGIS();
      oauth=google.accounts.oauth2.initTokenClient({
        client_id:cfg.client_id,scope:SCOPE,
        callback:result=>{
          if(result.error||!result.access_token){
            status('A autorização não foi concedida. Base pública preservada.',true);return;
          }
          access=result.access_token;
          expiry=Date.now()+Math.max(60,Number(result.expires_in||3600)-90)*1000;
          void syncFeed();
        },
        error_callback:()=>status('Não foi possível concluir o login. Tente novamente.',true)
      });
      $('bm157Connect').disabled=false;
      status('Pronto. Clique para autorizar a leitura da V045 privada. Nenhum token será salvo.');
    }catch(e){status('Conexão privada indisponível: '+e.message,true);}
  }
  window.BM157PrivateSync=Object.freeze({open:()=>{document.querySelector('[data-page="cartoes"]')?.click();},get ready(){return !!oauth},get connected(){return !!access&&Date.now()<expiry}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init();},{once:true});
  else void init();
})();