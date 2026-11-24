(()=>{'use strict';
const $=id=>document.getElementById(id),api=()=>window.BancoMestreVisualizarCardV050,calendar=()=>window.BM141Calendar,journal=()=>window.BM316SrsJournal;
const token=()=>window.BM239DriveGlobal?.writeToken?.()||'';
const day=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day};
const dateText=d=>d?d.split('-').reverse().join('/'):'sem data';
const rank=x=>({'Errei':0,'Difícil':1,'Bom':2,'Fácil':3,'Conhecimento preservado':4,'Conhecimento adquirido':5})[x]??6;
let list=[],index=0,active=false,busy=false,done=new Set(),origin=null,auth='',panel,progress,next,skip,finish;
const say=s=>{const n=$('bm382QueueStatus');if(n)n.textContent=s;};
function dueRows(rows,today){const seen=new Set();return rows.filter(x=>x?.card?.active!==false&&x?.rec?.due&&x.rec.due<=today&&!seen.has(x.id)&&seen.add(x.id)).sort((a,b)=>a.rec.due.localeCompare(b.rec.due)||rank(a.rec.rating)-rank(b.rec.rating)||a.id.localeCompare(b.id));}
function buttons(disabled){for(const id of ['bm382StartDue','bm382CalendarStart'])if($(id))$(id).disabled=disabled;}
function render(){if(!panel)return;const m=$('bmCardPeekV050'),cur=list[index];const visible=active&&!!cur&&!m.hidden&&api()?.currentId===cur.id;
 m.dataset.bm382Queue=String(visible);panel.hidden=!visible;if(!visible)return;
 const completed=done.has(cur.id);
 progress.textContent='Cartão '+(index+1)+' de '+list.length+' · '+cur.id+' · vencimento '+dateText(cur.rec.due)+' · '+(cur.rec.rating||'sem classificação')+(completed?' · avaliação confirmada':'');
 next.disabled=!completed;skip.disabled=completed;
}
function end(message){active=false;list=[];index=0;auth='';render();if(message)say(message);}
function openCurrent(){if(!active)return;if(auth!==token()){end('Conexão encerrada. Reconecte o Drive para continuar.');api()?.close();return;}
 if(index>=list.length){const n=done.size;end('Sessão concluída: '+n+' avaliações confirmadas. Atualize a fila para retomar cartões pulados.');api()?.close();return;}
 const id=list[index].id;api().setMode('study');if(!api().showId(id,origin)){end('Não foi possível abrir '+id+'. Nenhuma revisão foi alterada.');return;}render();}
async function start(e){if(busy)return;if(!token()){say('Conecte o Drive com autorização de gravação para consultar a agenda e registrar avaliações.');$('bm239-drive-action')?.focus();return;}
 busy=true;buttons(true);origin=e?.currentTarget||document.activeElement;auth=token();
 try{say('Consultando agenda privada e avaliações confirmadas…');
 await calendar().ensureLoaded();await window.loadCards();
 const [privateOK]=await Promise.all([calendar().refreshPrivate(),journal().refresh()]);
 if(auth!==token())throw Error('A sessão do Drive mudou.');
 if(!privateOK||!calendar().counts().privateInfo||!journal().loaded)throw Error('Agenda privada não confirmada; conecte o Drive e atualize.');
 list=dueRows(calendar().rows(),day());index=0;done=new Set();
 if(!list.length){end('Nenhum cartão com vencimento confirmado até hoje. Datas futuras não foram antecipadas.');return;}
 active=true;say(list.length.toLocaleString('pt-BR')+' cartões vencidos ou de hoje na agenda consultada.');openCurrent();
 }catch(err){end('Não foi possível iniciar a fila: '+err.message);const s=$('c141-status');if(s)s.textContent='Estudo não iniciado: '+err.message;}
 finally{busy=false;buttons(false);}}
function init(){const modal=$('bmCardPeekV050'),controls=modal?.querySelector('.bm163-preview-controls');if(!controls||!calendar()||!journal())return false;
 panel=document.createElement('div');panel.id='bm382QueuePanel';panel.hidden=true;
 progress=document.createElement('p');progress.setAttribute('role','status');
 next=document.createElement('button');next.type='button';next.className='primary';next.textContent='Próximo da fila';next.disabled=true;next.onclick=()=>{if(active&&done.has(list[index]?.id)){index++;openCurrent()}};
 skip=document.createElement('button');skip.type='button';skip.textContent='Pular sem avaliar';skip.onclick=()=>{if(active&&!done.has(list[index]?.id)){index++;openCurrent()}};
 finish=document.createElement('button');finish.type='button';finish.textContent='Encerrar sessão';finish.onclick=()=>{end('Sessão encerrada. Avaliações confirmadas preservadas.');api()?.close();};
 panel.append(progress,next,skip,finish);controls.before(panel);
 for(const id of ['bm382StartDue','bm382CalendarStart'])$(id)?.addEventListener('click',start);
 $('bm382OpenAgenda')?.addEventListener('click',()=>calendar().open());
 document.addEventListener('bm316-srs-journal-updated',e=>{const id=e.detail?.id;if(active&&id===list[index]?.id&&e.detail?.due){done.add(id);render();}});
 const obs=new MutationObserver(()=>{if(active&&(modal.hidden||api()?.currentId!==list[index]?.id)){end('Sessão interrompida; inicie novamente para retomar a fila atualizada.');}else render();});
 obs.observe(modal,{attributes:true,attributeFilter:['hidden']});
 const title=modal.querySelector('#bmCardPeekTitleV050');if(title)obs.observe(title,{childList:true,subtree:true});
 return true;}
 window.BM382Study=Object.freeze({dueRows,get active(){return active}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();