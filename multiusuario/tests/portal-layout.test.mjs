import {strict as assert} from 'node:assert';
import {NAV_GROUPS,groupOf,visibleNavigation,readerLayout,readingActionLabel} from '../assets/portal-layout.js';
assert.equal(groupOf('home'),'study');assert.equal(groupOf('sync'),'organize');assert.equal(groupOf('unknown'),'study');assert.equal(visibleNavigation('cards').includes('review'),true);assert.equal(visibleNavigation('cards').includes('sync'),false);assert.deepEqual(visibleNavigation('control'),['control','methodology','sync']);assert.equal(new Set(NAV_GROUPS.flatMap(g=>g.routes)).size,9);
assert.deepEqual(readerLayout(false,'open',false),{related:false,toggle:false});
assert.deepEqual(readerLayout(true,'auto',false),{related:true,toggle:true});
assert.deepEqual(readerLayout(true,'auto',true),{related:false,toggle:true});
assert.equal(readerLayout(true,'open',true).related,true);assert.equal(readerLayout(true,'closed',false).related,false);
assert.equal(readingActionLabel(false,true),'Revelar resposta');assert.equal(readingActionLabel(false,false),'Mostrar resposta');
console.log('PASS navegação e visibilidade pedagógica da lateral');