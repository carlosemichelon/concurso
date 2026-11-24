import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {originalPage,originalStyle} from '../infra/central-drive/original-page.mjs';
import {createCentralHandler} from '../infra/central-drive/server.mjs';
import {createServer} from 'node:http';
test('portal privado deriva do index V348, preserva estrutura e elimina scripts não homologados',async()=>{
 const {html,styles}=await originalPage();const source=await readFile(new URL('../index.html',import.meta.url),'utf8');
 for(const id of ['assuntos','pdfs','cartoes','imagens','cardRows','pdfDialog','imageDialog','imageStage','topicRows']){assert.ok(source.includes('id="'+id+'"'));assert.ok(html.includes('id="'+id+'"'))}
 assert.ok(html.includes('<body hidden>'));assert.deepEqual([...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]),['/original-session.js']);
 assert.equal(styles.size,19);assert.ok(await originalStyle('v315_styles_core.css'));assert.equal(await originalStyle('drive_auth_v038.json'),null);
 const core=await readFile(new URL('../infra/central-drive/original-core.js',import.meta.url),'utf8');
 assert.ok(core.includes('Perfil autenticado obrigatório'));assert.ok(!core.includes("fetch('assets/"));assert.ok(!core.includes('localStorage'));assert.ok(!core.includes('BMOriginalCatalog.reconcile'));
});
test('entrada privada bloqueia visitante sem cookie e não expõe assets arbitrários',async()=>{
 const server=createServer(createCentralHandler({auth:{read:()=>null},loadProfile:async()=>{throw Error('não acessar')},origin:'https://test.example'}));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const root='http://127.0.0.1:'+server.address().port;
 try{assert.equal((await fetch(root+'/portal',{redirect:'manual'})).status,303);assert.equal((await fetch(root+'/original-core.js')).status,401);assert.equal((await fetch(root+'/portal-style/v315_styles_core.css')).status,401);assert.equal((await fetch(root+'/assets/drive_auth_v038.json')).status,404)}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
});
