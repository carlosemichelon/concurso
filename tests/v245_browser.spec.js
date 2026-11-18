/* Navegação real em Chromium sobre servidor local. Sem OAuth, sem dados privados. */
const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:8765/v245.html';
test.setTimeout(120000);
test('Controle de Estudos V245 - desktop: montagem, registro, exclusão e calendário',async({page})=>{
 const failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
 const tab=page.locator('#bm240-study-tab');
 await expect(tab).toBeAttached({timeout:90000});
 await tab.evaluate(b=>b.click());
 const host=page.locator('#bm240-native-host');
 await expect(host.locator('#sessionForm')).toBeAttached({timeout:45000});
 await host.locator('[data-tab="planejamento"]').click();
 await host.locator('#subjectName').fill('Engenharia Civil');
 await host.locator('#subjectForm button[type="submit"]').click();
 await host.locator('[data-tab="registro"]').click();
 await host.locator('#sessionDate').fill('2026-11-18');
 await host.locator('#sessionMinutes').fill('75');
 await host.locator('#sessionSubject').selectOption({label:'Engenharia Civil'});
 await host.locator('#sessionType').selectOption('Questões');
 await host.locator('#sessionGeneral').fill('Estruturas');
 await host.locator('#sessionSpecific').fill('Vigas');
 await host.locator('#sessionSubtopic').fill('Esforços solicitantes');
 await host.locator('#sessionQuestions').fill('20');
 await host.locator('#sessionCorrect').fill('15');
 await host.locator('#sessionForm button[type="submit"]').click();
 await expect(host.locator('#sessionStatus')).toContainText('salva');
 let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')));
 expect(state.sessions).toHaveLength(1);
 expect(state.sessions[0].minutes).toBe(75);
 expect(state.sessions[0].specific).toBe('Vigas');
 expect(await page.evaluate(()=>localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'))).toBeNull();
 await host.locator('[data-tab="historico"]').click();
 await expect(host.locator('#historyRows')).toContainText('1h 15m');
 page.once('dialog',dialog=>dialog.accept());
 await host.locator('[data-delete-session]').click();
 state=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')));
 expect(state.sessions[0].deletedAt).toBeTruthy();
 await host.locator('[data-tab="backup"]').click();
 await host.locator('[data-restore-session]').click();
 state=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')));
 expect(state.sessions[0].deletedAt).toBeUndefined();
 await host.locator('[data-tab="calendarioControle"]').click();
 await host.locator('#planDate').fill('2026-11-19');
 await host.locator('#planSubject').selectOption({label:'Engenharia Civil'});
 await host.locator('#planTopic').fill('Topografia');
 await host.locator('#planMinutes').fill('50');
 await host.locator('#planForm button[type="submit"]').click();
 state=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')));
 expect(state.plans).toHaveLength(1);
 expect(state.plans[0].minutes).toBe(50);
 await page.screenshot({path:'test-results/v245-desktop.png',fullPage:true});
});
test('Controle de Estudos V245 - layout em aparelho celular e offline isolado',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
 await expect(page.locator('#bm240-study-tab')).toBeAttached({timeout:90000});
 await page.locator('#bm240-study-tab').evaluate(b=>b.click());
 const host=page.locator('#bm240-native-host');
 await expect(host.locator('#tabs')).toBeAttached({timeout:45000});
 await page.screenshot({path:'test-results/v243-mobile-before-calendar.png'});
 await host.locator('[data-tab="calendarioControle"]').click({timeout:15000});
 await expect(host.locator('#calGrid')).toBeVisible();
 await page.screenshot({path:'test-results/v245-mobile.png',fullPage:true});
 await context.close();
});


test('Rodapé V242 controla exatamente uma sessão do módulo nativo, sem iframe',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
 await expect(page.locator('#bm240-study-tab')).toBeAttached({timeout:90000});
 const host=page.locator('#bm240-native-host');
 await expect(host.locator('#timerStart')).toBeAttached({timeout:45000});
 const bar=page.locator('#bm241-bar');
 await expect(bar).toBeVisible({timeout:30000});
 await expect(bar).toHaveClass(/bm242-bottom-dock/);
 expect(await page.locator('#bm241-bar').count()).toBe(1);
 expect(await page.locator('#bm238-study-frame').count()).toBe(0);
 expect(await page.locator('#bm240h-bar').count()).toBe(0);
 expect(await bar.evaluate(n=>n.parentElement===document.body)).toBe(true);
 const routeState=await page.evaluate(()=>({flag:window.BM240OpenStudyDefault,hash:location.hash,path:location.pathname,active:document.querySelector('main section.active')?.id||''}));
 console.log('V245 initial route:',JSON.stringify(routeState));
 await expect(page.locator('main section#controle-estudos')).toHaveClass(/active/);
 await host.locator('[data-tab="planejamento"]').click();
 await host.locator('#subjectName').fill('Engenharia Civil');
 await host.locator('#subjectForm button[type="submit"]').click();
 await expect(page.locator('#bm241-subject')).toContainText('Engenharia Civil',{timeout:10000});
 await page.locator('#bm241-subject').selectOption({label:'Engenharia Civil'});
 await page.locator('#bm241-topic').fill('Concreto');
 await page.locator('#bm241-start').click();
 await expect(page.locator('#bm241-pause')).toBeVisible({timeout:15000});
 let clock=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_TIMER')));
 expect(clock.running).toBe(true);
 await page.waitForTimeout(1500);
 await page.locator('#bm241-pause').click();
 await expect(page.locator('#bm241-resume')).toBeVisible({timeout:15000});
 clock=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_TIMER')));
 expect(clock.running).toBe(false);
 expect(clock.elapsed).toBeGreaterThan(1000);
 await page.locator('#bm241-save').click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')));
 expect(state.sessions).toHaveLength(1);
 expect(state.sessions[0].minutes).toBeGreaterThan(0);
 expect(state.sessions[0].topic).toBe('Concreto');
 expect(await page.evaluate(()=>localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'))).toBeNull();
 await expect(page.locator('#bm241-choose')).toBeVisible();
 expect(await page.locator('#bm241-bar').count()).toBe(1);
 await page.screenshot({path:'test-results/v245-timer-dock.png',fullPage:true});
});


test('Disciplinas já prontas e filtros encadeados até o subassunto no cronômetro único',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
 const host=page.locator('#bm240-native-host');
 await expect(host.locator('#timerSubject')).toBeAttached({timeout:45000});
 await page.waitForFunction(()=>window.BM240ControlApp?.taxonomyCount?.cards===1518,null,{timeout:30000});
 await expect(page.locator('#bm241-subject option')).toHaveCount(6,{timeout:15000});
 const names=await page.locator('#bm241-subject option').allTextContents();
 expect(names).toContain('Engenharia Civil');
 expect(names).toContain('Português');
 expect(names).toContain('Matemática, Lógica e Estatística');
 expect(names).toContain('Legislação');
 expect(names).toContain('Informática');
 expect(names.filter(n=>n==='Engenharia Civil')).toHaveLength(1);
 expect(await page.evaluate(()=>localStorage.getItem('BM_CONTROLE_ESTUDOS_V238'))).toBeNull();
 await page.locator('#bm241-subject').selectOption({label:'Engenharia Civil'});
 await expect(page.locator('#bm241-area')).toContainText('Geotecnia e Fundações');
 await page.locator('#bm241-area').selectOption({label:'Estruturas'});
 await expect(page.locator('#bm241-topic-list option[value="Ações estruturais"]')).toHaveCount(1);
 await page.locator('#bm241-topic').fill('Ações estruturais');
 await expect(page.locator('#bm241-subtopic-list option[value="Classificação geral"]')).toHaveCount(1);
 await page.locator('#bm241-subtopic').fill('Classificação geral');
 await page.locator('#bm241-start').click();
 let clock=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_TIMER')));
 expect(clock.general).toBe('Estruturas');
 expect(clock.specific).toBe('Ações estruturais');
 expect(clock.subtopic).toBe('Classificação geral');
 await page.waitForTimeout(1100);
 await page.locator('#bm241-pause').click();
 await page.locator('#bm241-save').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('BM245_CONTROLE_ESTUDOS')));
 expect(saved.sessions).toHaveLength(1);
 expect(saved.sessions[0].general).toBe('Estruturas');
 expect(saved.sessions[0].specific).toBe('Ações estruturais');
 expect(saved.sessions[0].subtopic).toBe('Classificação geral');
 await host.locator('[data-tab="registro"]').click();
 await host.locator('#sessionSubject').selectOption({label:'Engenharia Civil'});
 await expect(host.locator('#bm240GeneralOptions option[value="Estruturas"]')).toHaveCount(1);
 await host.locator('#sessionGeneral').fill('Estruturas');
 await expect(host.locator('#bm240SpecificOptions option[value="Ações estruturais"]')).toHaveCount(1);
 await host.locator('#sessionSpecific').fill('Ações estruturais');
 await expect(host.locator('#bm243SessionSubOptions option[value="Classificação geral"]')).toHaveCount(1);
});


test('Filtros públicos distinguem Estatística e Segurança do Trabalho nos grupos legados',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>Boolean(window.BM128General?.classificationOf&&window.BM152FlashFilters?.area),null,{timeout:60000});
 const result=await page.evaluate(()=>{
  const stat={id:'CARD-TEST',group:'ENG_GERAL',discipline:'Estatística',subject:'Testes de hipóteses',sub:'Hipótese nula'};
  const nr={id:'CARD-TEST-NR',group:'ENG_GERAL',discipline:'Segurança do Trabalho',subject:'NR-17 Geral',sub:'Organização e pausas'};
  return {
   statDisc:window.BM152FlashFilters.area(stat),
   statGeneral:window.BM128General.classificationOf(stat),
   nrDisc:window.BM152FlashFilters.area(nr),
   nrGeneral:window.BM128General.classificationOf(nr)
  };
 });
 expect(result).toEqual({statDisc:'math',statGeneral:'matematica',nrDisc:'eng',nrGeneral:'seguranca'});
});

test('Relatórios filtráveis apresentam horas, acertos e evolução',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
 const host=page.locator('#bm240-native-host');
 await expect(host.locator('#sessionForm')).toBeAttached({timeout:45000});
 await host.locator('[data-tab="planejamento"]').click();
 await host.locator('#subjectName').fill('Inglês');
 await host.locator('#subjectForm button[type="submit"]').click();
 const id=await host.locator('#sessionSubject option', {hasText:'Inglês'}).getAttribute('value');
 await host.locator('[data-tab="registro"]').click();
 await host.locator('#sessionDate').fill('2026-11-18');
 await host.locator('#sessionMinutes').fill('90');
 await host.locator('#sessionSubject').selectOption(id);
 await host.locator('#sessionType').selectOption('Questões');
 await host.locator('#sessionQuestions').fill('20');
 await host.locator('#sessionCorrect').fill('16');
 await host.locator('#sessionForm button[type="submit"]').click();
 await host.locator('[data-tab="relatorios"]').click();
 await expect(host.locator('#reportMetrics')).toContainText('1h 30m');
 await expect(host.locator('#reportMetrics')).toContainText('16 / 20');
 await expect(host.locator('#reportMetrics')).toContainText('80%');
 await host.locator('#reportSubject').selectOption(id);
 await host.locator('#reportStart').fill('2026-11-19');
 await expect(host.locator('#reportMetrics')).toContainText('0h 00m');
 await host.locator('#reportClear').click();
 await expect(host.locator('#reportMetrics')).toContainText('1h 30m');
 await expect(host.locator('#reportByMonth')).toContainText('2026-11');
});


test('Diagnóstico comparativo da biblioteca de imagens V244 e V245',async({browser})=>{
 for(const version of ['v244','v245']){
  const page=await browser.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(e.stack||e.message));
  await page.goto('http://127.0.0.1:8765/'+version+'.html#imagens',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2200);
  const d=await page.evaluate(()=>({hash:location.hash,imageRows:document.getElementById('imageRows')?.children?.length||0,
    count:document.getElementById('imageCount')?.textContent||'',initialVersion:document.title}));
  console.log('V245_IMAGE_COMPARE',JSON.stringify({version,diagnostic:d,errors:errs.slice(0,5)}));
  await page.close();
 }
});
