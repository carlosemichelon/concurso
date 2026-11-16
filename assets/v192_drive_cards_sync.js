/* Banco Mestre V192 — seletor de snapshots privados com validação estrutural do Drive.
 * Substitui o leitor de caminho V045 fixo na interface V184.
 * Somente leitura OAuth; não escreve no Drive/GitHub, não aplica SRS,
 * não aprova propostas, não registra revisões e não guarda tokens.
 */
(function(){
 'use strict';
 if(window.BM185CardsSync)return;
 const FOLDER='1cDkoy-QgXYdzhOzi8SMSr7g4eB4oskBD';
 const API='https://www.googleapis.com/drive/v3/files';
 const SCOPE='https://www.googleapis.com/auth/drive.readonly';
 const PATTERN=/^BANCO_MESTRE_PRIVADO_V([0-9]{3,})_SYNC_([0-9]{4}-[0-9]{2}-[0-9]{2})\.json$/i;
 const ID=/^[A-Za-z0-9_-]{15,}$/;
 const $=id=>document.getElementById(id);
 let oauth=null,access='',expires=0,busy=false,files=new Map(),selected='',loaded=null;
 function token(){return (access&&Date.now()<expires?access:'')||(window.BancoMestreMediaSyncV182?.token?.()||'');}
 function status(message,error=false){const el=$('bm185CardsStatus');if(el){el.textContent=message;el.style.color=error?'#953b32':'#436469';}}
 function getControl(){return $('bm185CardsConnect')}
 async function request(url){
  const auth=token();if(!auth)throw Error('Conecte o Google Drive.');
  const r=await fetch(url,{headers:{Authorization:'Bearer '+auth},cache:'no-store'});
  if(r.status===401)throw Error('Autorização Google expirada. Reconecte a conta.');
  if(r.status===403)throw Error('Esta conta não possui acesso ao arquivo ou pasta privada.');
  if(!r.ok)throw Error('Google Drive HTTP '+r.status);
  return r;
 }
 async function library(){
  let next='',loops=0,found=[];
  do{
   if(++loops>30)throw Error('Pasta com páginas demais; não é seguro selecionar automaticamente.');
   const q=new URLSearchParams({
    q:"'"+FOLDER+"' in parents and trashed = false",
    fields:'nextPageToken,files(id,name,mimeType,modifiedTime,size)',
    pageSize:'1000',supportsAllDrives:'true',includeItemsFromAllDrives:'true'
   });
   if(next)q.set('pageToken',next);
   const json=await (await request(API+'?'+q.toString())).json();
   found.push(...(Array.isArray(json.files)?json.files:[]));
   next=json.nextPageToken||'';
  }while(next);
  const candidates=found.filter(f=>ID.test(f.id)&&f.mimeType==='application/json'&&PATTERN.test(f.name));
  candidates.sort((a,b)=>String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||''))||a.name.localeCompare(b.name));
  return candidates;
 }
 async function discover(){
  if(busy)return false;
  if(!token()){status('Autorize o Drive para localizar os arquivos privados de sincronização.');return false}
  busy=true;const button=getControl();if(button)button.disabled=true;
  try{
   const candidates=await library();files=new Map(candidates.map(f=>[f.id,f]));
   const select=$('bm185CardsFile');if(!select)throw Error('Seletor de cartões indisponível.');
   const previous=selected;
   select.replaceChildren(new Option('Selecione um pacote privado — nenhum arquivo será carregado automaticamente',''));
   for(const f of candidates)select.add(new Option(f.name+' · '+String(f.modifiedTime||'').slice(0,10),f.id));
   selected=files.has(previous)?previous:'';
   select.value=selected;
   select.disabled=!candidates.length;
   const load=$('bm185CardsLoad');if(load)load.disabled=!selected;
   status(candidates.length+' pacote(s) privado(s) encontrado(s). Selecione e confira a origem antes de carregar. A validação é estrutural, não normativa; SRS não será aplicado.');
   return true;
  }catch(e){status('Não foi possível listar pacotes privados: '+e.message,true);return false}
  finally{busy=false;if(button)button.disabled=false}
 }
 function verify(data){
  if(!data||!/^BancoMestrePrivadoV[0-9]+$/.test(data.format||''))throw Error('Formato de base privada não reconhecido.');
  if('BancoMestrePrivado'+data.version!==data.format)throw Error('Versão e formato divergentes.');
  if(!Array.isArray(data.cards)||data.cards.length<1499||data.cards.length>50000)
   throw Error('Quantidade de cartões incompatível com snapshot completo.');
  const ids=new Set();
  for(const card of data.cards){
   if(!card||!/^CARD-[0-9]{4,}$/.test(card.id||'')||
    typeof card.front!=='string'||!card.front.trim()||
    typeof card.back!=='string'||!card.back.trim()||
    card.provisional===true)throw Error('Cartão incompleto ou ID inválido: '+(card?.id||'desconhecido'));
   if(ids.has(card.id))throw Error('ID duplicado: '+card.id);
   ids.add(card.id);
  }
  if(data.counts?.cards!==undefined&&Number(data.counts.cards)!==data.cards.length)throw Error('Contagem declarada de cartões divergente.');
  for(const [key,countsKey] of [['questions','questions'],['images','images'],['srs','srs_records']]){
   const value=data[key];
   if(value!==undefined&&!Array.isArray(value))throw Error('Campo não tabular: '+key);
   if(value&&data.counts?.[countsKey]!==undefined&&Number(data.counts[countsKey])!==value.length)
    throw Error('Contagem declarada divergente: '+key);
  }
  if(Array.isArray(data.srs)&&data.srs.some(event=>!ids.has(event.id)))throw Error('SRS com ID ausente da base; snapshot rejeitado.');
  return ids;
 }
 async function loadSelected(){
  if(busy)return;
  const meta=files.get(selected);
  if(!meta){status('Selecione primeiro um arquivo privado reconhecido.',true);return;}
  busy=true;const button=$('bm185CardsLoad');if(button)button.disabled=true;
  try{
   status('Lendo e verificando o snapshot '+meta.name+'…');
   if(typeof loadCards!=='function'||typeof cardRender!=='function'||!Array.isArray(cards))
    throw Error('Biblioteca pública de cartões indisponível.');
   await loadCards();
   const response=await request(API+'/'+encodeURIComponent(meta.id)+'?alt=media&supportsAllDrives=true');
   const len=Number(response.headers.get('content-length')||0);
   if(len>35000000)throw Error('Pacote maior que 35 MB; transferência bloqueada.');
   const raw=await response.text();
   if(raw.length>35000000)throw Error('Arquivo muito grande; pacote anterior preservado.');
   const data=JSON.parse(raw);verify(data);
   const operational=cards.filter(c=>c?.provisional);
   const previous=cards.filter(c=>!c?.provisional).length;
   if(data.cards.length<previous)throw Error('O pacote possui menos cartões que a base já carregada ('+previous+'); nada foi substituído.');
   const available=new Set(operational.map(c=>c.id));
   if(data.cards.some(c=>available.has(c.id)))throw Error('ID em conflito com cartões operacionais de Ijuí.');
   const newCards=[...operational,...data.cards];
   // Commit na interface somente após validar os dados por completo.
   cards=newCards;
   try{focusGroup='';}catch(_){}
   const legacy=$('cardFilter');
   if(legacy){
    const seen=new Set([...legacy.options].map(x=>x.value));
    for(const label of [...new Set(data.cards.map(c=>c.discipline).filter(Boolean))].sort()){
     if(!seen.has(label)){legacy.add(new Option(label,label));seen.add(label)}
    }
    legacy.value='all';
   }
   const topics=$('cardTopicFilter');if(topics)topics.value='all';
   const search=$('cardSearch');if(search)search.value='';
   if(typeof cardLimit!=='undefined')cardLimit=24;
   window.BM152FlashFilters?.reset?.();
   cardRender();
   const home=$('bm119PublicSource');
   if(home)home.textContent='Snapshot privado '+data.version+' do Drive · '+data.cards.length+' registros validados estruturalmente nesta sessão · sem alteração do SRS';
   (window.BM184Header||window.BM183Header)?.updateCards?.(data.cards.length,operational.length,newCards);
   loaded={id:meta.id,version:data.version,count:data.cards.length,questions:data.questions?.length||0,images:data.images?.length||0,sourceName:meta.name};
   document.dispatchEvent(new CustomEvent('bm-v185-cards-synced',{detail:{version:loaded.version,count:loaded.count}}));
   status('Carregado: '+data.version+' · '+loaded.count+' cartões + '+operational.length+' operacionais Ijuí · '+loaded.questions+' questões e '+loaded.images+' vínculos de imagem no arquivo. Os eventos SRS NÃO foram aplicados. Nenhum dado foi enviado ao GitHub.');
  }catch(error){status('Integração não aplicada: '+error.message+'. Base anterior preservada.',true)}
  finally{busy=false;if(button)button.disabled=!files.has(selected)}
 }
 function authorize(){
  if(token()){void discover();return;}
  if(!oauth){status('Autorização Google ainda inicializando.',true);return;}
  oauth.requestAccessToken({prompt:''});
 }
 async function prepare(){
  const parent=$('cartoes')?.querySelector('.panel');
  if(!parent||$('bm185CardsBox'))return;
  const wrap=document.createElement('section');wrap.id='bm185CardsBox';
  wrap.style.cssText='margin:12px 0;padding:12px;border:1px solid #c9ded9;border-radius:10px;background:#f7fbf9';
  const title=document.createElement('strong');title.textContent='Carregar pacote privado selecionado do Drive (somente leitura)';
  const help=document.createElement('p');
  help.textContent='A base pública permanece até a escolha explícita de um pacote privado. Os IDs e a estrutura são conferidos; isso não comprova auditoria normativa, não registra avaliações SRS nem publica dados no GitHub.';
  help.style.cssText='font-size:12px;margin:6px 0';
  const connect=document.createElement('button');connect.type='button';connect.id='bm185CardsConnect';connect.textContent='Conectar Drive / localizar pacotes';connect.onclick=authorize;
  const select=document.createElement('select');select.id='bm185CardsFile';select.disabled=true;select.style.cssText='max-width:min(100%,480px);margin:6px';
  select.add(new Option('Selecione um pacote aprovado',''));
  select.onchange=()=>{selected=select.value;const b=$('bm185CardsLoad');if(b)b.disabled=!files.has(selected)};
  const load=document.createElement('button');load.type='button';load.id='bm185CardsLoad';load.disabled=true;load.textContent='Carregar pacote selecionado';
  load.onclick=()=>{void loadSelected()};
  const msg=document.createElement('p');msg.id='bm185CardsStatus';msg.style.cssText='font-size:12px;margin:8px 0 0';msg.setAttribute('role','status');
  msg.textContent='Aguardando autorização. O catálogo público permanece disponível.';
  wrap.append(title,help,connect,select,load,msg);
  parent.insertBefore(wrap,parent.querySelector('.controls')||parent.firstChild);
  document.addEventListener('bm-media-drive-authorized',()=>{if(token()&&!busy)void discover()});
  try{
   const response=await fetch('assets/drive_auth_v038.json',{cache:'no-store'});
   const cfg=await response.json();
   if(!response.ok||!/\.apps\.googleusercontent\.com$/.test(cfg.client_id||''))throw Error('Configuração OAuth inválida');
   if(!window.google?.accounts?.oauth2?.initTokenClient){
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=resolve;s.onerror=()=>reject(Error('Google Identity Services indisponível'));document.head.append(s)});
   }
   oauth=google.accounts.oauth2.initTokenClient({client_id:cfg.client_id,scope:SCOPE,
    callback:r=>{
     if(r.error||!r.access_token){status('Drive não autorizado; base pública preservada.',true);return}
     access=r.access_token;expires=Date.now()+Math.max(60,Number(r.expires_in||3600)-90)*1000;
     window.BancoMestreMediaSyncV182?.publishToken(access,Number(r.expires_in||3600));
     void discover();
    },error_callback:()=>status('Falha na autorização. Base pública preservada.',true)});
   if(token())void discover();
  }catch(e){status('Sincronização privada indisponível: '+e.message,true);connect.disabled=true}
 }
 window.BM185CardsSync=Object.freeze({get lastResult(){return loaded},listCandidates:discover,refresh:discover,get connected(){return !!token()}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void prepare()},{once:true});else void prepare();
})();