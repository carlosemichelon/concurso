/* Quality gate for Banco Mestre public study increments.
 * Run from repository root: node tools/check_metodologia_v340.js
 * Does not access private images or SRS; requires an explicit quality_gate update each release. */
"use strict";
const fs=require("node:fs"),path=require("node:path");
const assert=require("node:assert/strict");
const read=(p)=>fs.readFileSync(path.resolve(process.cwd(),p),"utf8");
const json=(p)=>JSON.parse(read(p));
const manifest=json("assets/version.json"),gate=manifest.quality_gate;
const prefix="[Banco Mestre — qualidade]";
assert(gate?.schema==="BancoMestreStudyQualityGate1",prefix+" quality_gate inválido");
const active=json("assets/closure_gate_current.json");
assert(active.version===manifest.version,prefix+" versão atual não possui portão correspondente");
const legacyHome="v"+gate.version.replace(/\D/g,"")+".html";
assert(fs.existsSync(legacyHome),prefix+" snapshot histórico de qualidade ausente");
assert(read(legacyHome).includes('data-bm-portal-version="'+gate.version+'"'),prefix+" snapshot histórico incompatível");
assert(gate.source&&gate.require_cards?.length,prefix+" origem/IDs indisponíveis");
const delta=json(gate.source),profiles=delta.profiles||{};
const affected=[...(delta.new_cards||[]),...(delta.updates||[])];
assert(affected.length===gate.require_cards.length,prefix+" quantidade de cartões divergente");
assert.deepEqual(new Set(affected.map(c=>c.id)),new Set(gate.require_cards),prefix+" IDs divergentes");
assert(delta.srs_changed===false,prefix+" potencial alteração de SRS não autorizada");
const visualIds=new Set(),originalIds=new Set();
for(const id of gate.require_cards){
 const c=affected.find(c=>c.id===id),p=profiles[id];
 assert(c&&p,prefix+" cartão ou perfil ausente "+id);
 assert(c.front?.trim()&&c.back?.trim()&&p.paragraphs?.length>0,prefix+" questão/verso insuficientes "+id);
 assert(Array.isArray(p.layers)&&p.layers.length===11,prefix+" 11 critérios faltantes "+id);
 p.layers.forEach((m,i)=>assert(m.ord===i+1&&m.titulo?.trim()&&m.texto?.trim(),prefix+" módulo inválido "+id+"#"+(i+1)));
 assert(p.source&&p.related_question_ids?.length,prefix+" origem não rastreável "+id);
 assert(Array.isArray(p.visuals)&&p.visuals.length>0,prefix+" imagem derivada ausente "+id);
 for(const visual of p.visuals){
  assert(visual.id&&visual.src?.startsWith("assets/card_visuals_"),prefix+" diagrama sem ID/path "+id);
  assert(fs.existsSync(visual.src),prefix+" arquivo de diagrama inexistente "+visual.src);
  const svg=read(visual.src);
  assert(svg.includes("<svg")&&svg.includes("</svg>")&&visual.caption&&visual.alt,prefix+" imagem ilegível ou sem legenda "+id);
  visualIds.add(visual.id);
 }
 for(const original of p.originals||[]){
  assert(original.id&&original.drive_file_id&&original.url?.startsWith("https://drive.google.com/file/")&&
   /^[a-f0-9]{64}$/.test(original.sha256)&&Array.isArray(original.role),prefix+" original não persistente "+id);
  assert(original.inline_public===false,prefix+" imagem privada foi classificada como pública "+id);
  originalIds.add(original.id);
 }
}
for(const id of gate.require_original_media_ids||[])assert(originalIds.has(id),prefix+" imagem original não associada "+id);
for(const id of gate.require_derived_media_ids||[])assert(visualIds.has(id),prefix+" diagrama ausente "+id);
const q=delta.question_media;
assert(q?.original_image&&q?.derived_visual&&q.question_id,prefix+" questão sem par original/derivado");
const linked=gate.require_cards.filter(id=>profiles[id].originals?.some(x=>x.id===q.original_image.id));
assert(linked.length>0,prefix+" imagem do enunciado não vinculada a nenhum cartão");
assert(q.original_image.question_id===q.question_id,prefix+" origem de imagem inválida");
assert(fs.existsSync("v"+manifest.version.replace(/\D/g,"")+".html"),prefix+" snapshot ausente");
assert(read("index.html")===read(manifest.home),prefix+" index e snapshot divergentes");
assert(read(legacyHome).includes(gate.source),prefix+" HTML não carrega o pacote atual");
assert(read(legacyHome).includes("v340_granulometry_renderer.js"),prefix+" leitor visual não está no HTML");
assert(read("assets/v339_semantic_visual.css").includes("#FDE68A")&&read("assets/v339_semantic_visual.css").includes("#BAE6FD"),prefix+" esquema de cores não carregado");
assert(fs.existsSync(gate.audit),prefix+" auditoria de ID não encontrada");
const a=json(gate.audit);
assert(a.records?.length>=100&&a.summary?.distinct_ids===a.records.length,prefix+" auditoria histórica inválida");
console.log(prefix+" OK: "+gate.require_cards.length+" cartões, 11 critérios, "+visualIds.size+" desenhos, "+originalIds.size+" original(is), vínculos e histórico.");
console.log(prefix+" Escopo estrutural. Navegador autenticado, imagens privadas inline e SRS não testados.");

// A validação histórica continua obrigatória; a versão ativa usa seu contrato próprio.
require("node:child_process").execFileSync(process.execPath,["--test","tests/closure_gate.test.cjs"],{stdio:"inherit"});
